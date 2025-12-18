'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatPrice } from '@/lib/utils'
import type { Product, User } from '@/lib/types'
import {
    Plus,
    Pencil,
    Trash2,
    X,
    Loader2,
    ImagePlus,
    AlertCircle,
    Package
} from 'lucide-react'

interface ProductsClientProps {
    user: User
    initialProducts: Product[]
}

export default function ProductsClient({ user, initialProducts }: ProductsClientProps) {
    const [products, setProducts] = useState<Product[]>(initialProducts)
    const [showForm, setShowForm] = useState(false)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    // Form fields
    const [name, setName] = useState('')
    const [price, setPrice] = useState('')
    const [description, setDescription] = useState('')

    const router = useRouter()
    const supabase = createClient()

    const isPro = user.plan === 'pro'
    const maxProducts = isPro ? Infinity : 3
    const canAddMore = products.length < maxProducts

    const fetchProducts = useCallback(async () => {
        const { data } = await supabase
            .from('products')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (data) setProducts(data)
    }, [supabase, user.id])

    useEffect(() => {
        fetchProducts()
    }, [fetchProducts])

    const resetForm = () => {
        setName('')
        setPrice('')
        setDescription('')
        setImageFile(null)
        setImagePreview(null)
        setEditingProduct(null)
        setShowForm(false)
        setError('')
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Check file size (200KB limit)
        if (file.size > 200 * 1024) {
            setError('Image must be under 200KB. Use TinyPNG or Squoosh to compress.')
            return
        }

        setImageFile(file)
        setImagePreview(URL.createObjectURL(file))
        setError('')
    }

    const uploadImage = async (file: File): Promise<string | null> => {
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
            .from('business-images')
            .upload(fileName, file)

        if (uploadError) {
            console.error('Upload error:', uploadError)
            return null
        }

        const { data: { publicUrl } } = supabase.storage
            .from('business-images')
            .getPublicUrl(fileName)

        return publicUrl
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            let imageUrl = editingProduct?.image_url || null

            if (imageFile) {
                const uploadedUrl = await uploadImage(imageFile)
                if (uploadedUrl) {
                    imageUrl = uploadedUrl
                } else {
                    throw new Error('Failed to upload image')
                }
            }

            const productData = {
                name,
                price: parseFloat(price),
                description: description || null,
                image_url: imageUrl,
                user_id: user.id,
            }

            if (editingProduct) {
                const { error: updateError } = await supabase
                    .from('products')
                    .update(productData)
                    .eq('id', editingProduct.id)

                if (updateError) throw updateError
            } else {
                const { error: insertError } = await supabase
                    .from('products')
                    .insert(productData)

                if (insertError) throw insertError
            }

            await fetchProducts()
            resetForm()
            router.refresh()
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to save product'
            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (product: Product) => {
        setEditingProduct(product)
        setName(product.name)
        setPrice(product.price.toString())
        setDescription(product.description || '')
        setImagePreview(product.image_url)
        setShowForm(true)
    }

    const handleDelete = async (productId: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return

        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', productId)

            if (error) throw error

            await fetchProducts()
            router.refresh()
        } catch (err) {
            console.error('Delete error:', err)
        }
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                    <p className="text-gray-500">
                        {products.length} / {isPro ? '∞' : '3'} products
                    </p>
                </div>

                {canAddMore ? (
                    <Button onClick={() => setShowForm(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Product
                    </Button>
                ) : (
                    <Button variant="outline" onClick={() => router.push('/dashboard/settings#upgrade')}>
                        Upgrade to add more
                    </Button>
                )}
            </div>

            {/* Product limit warning */}
            {!isPro && products.length >= 2 && (
                <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium text-orange-800">
                            {products.length === 3 ? 'Product limit reached!' : 'Almost at limit!'}
                        </p>
                        <p className="text-sm text-orange-700 mt-1">
                            Free accounts can add up to 3 products. Upgrade to Pro for unlimited products.
                        </p>
                    </div>
                </div>
            )}

            {/* Add/Edit Form */}
            {showForm && (
                <Card className="mb-6">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</CardTitle>
                        <Button variant="ghost" size="icon" onClick={resetForm}>
                            <X className="w-4 h-4" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-sm font-medium text-gray-700">
                                        Product Name *
                                    </label>
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="e.g. Brazilian Hair 20 inches"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="price" className="text-sm font-medium text-gray-700">
                                        Price (₦) *
                                    </label>
                                    <Input
                                        id="price"
                                        type="number"
                                        placeholder="e.g. 15000"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        min="0"
                                        step="100"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="description" className="text-sm font-medium text-gray-700">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    placeholder="Describe your product..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    className="flex w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Product Image
                                </label>
                                <div className="flex items-start gap-4">
                                    {imagePreview ? (
                                        <div className="relative">
                                            <Image
                                                src={imagePreview}
                                                alt="Preview"
                                                width={100}
                                                height={100}
                                                className="rounded-lg object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setImageFile(null)
                                                    setImagePreview(null)
                                                }}
                                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 transition-colors">
                                            <ImagePlus className="w-6 h-6 text-gray-400" />
                                            <span className="text-xs text-gray-400 mt-1">Upload</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                    <div className="text-xs text-gray-500">
                                        <p>Max file size: 200KB</p>
                                        <p className="mt-1">
                                            Compress at{' '}
                                            <a href="https://tinypng.com" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">
                                                TinyPNG
                                            </a>
                                            {' '}or{' '}
                                            <a href="https://squoosh.app" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">
                                                Squoosh
                                            </a>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                                    {error}
                                </p>
                            )}

                            <div className="flex gap-2">
                                <Button type="submit" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        editingProduct ? 'Update Product' : 'Add Product'
                                    )}
                                </Button>
                                <Button type="button" variant="outline" onClick={resetForm}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Products grid */}
            {products.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                    <Package className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <h3 className="font-medium text-gray-900 mb-2">No products yet</h3>
                    <p className="text-gray-500 text-sm mb-4">
                        Add your first product to start receiving orders
                    </p>
                    <Button onClick={() => setShowForm(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Product
                    </Button>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product) => (
                        <Card key={product.id} className="overflow-hidden">
                            <div className="aspect-square relative bg-gray-100">
                                {product.image_url ? (
                                    <Image
                                        src={product.image_url}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <Package className="w-12 h-12" />
                                    </div>
                                )}
                            </div>
                            <CardContent className="pt-4">
                                <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                                <p className="text-lg font-bold text-orange-600 mt-1">
                                    {formatPrice(product.price)}
                                </p>
                                {product.description && (
                                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                                        {product.description}
                                    </p>
                                )}
                                <div className="flex gap-2 mt-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => handleEdit(product)}
                                    >
                                        <Pencil className="w-4 h-4 mr-1" />
                                        Edit
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-red-600 hover:bg-red-50"
                                        onClick={() => handleDelete(product.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
