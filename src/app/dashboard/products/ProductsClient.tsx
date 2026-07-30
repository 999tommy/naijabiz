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
    Package,
    Check,
    Ban,
    Briefcase,
    ShoppingBag
} from 'lucide-react'
import { compressImage } from '@/lib/image-compression'

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
    const [inStock, setInStock] = useState<boolean>(true)
    const [itemType, setItemType] = useState<'product' | 'service'>('product')

    const router = useRouter()
    const supabase = createClient()

    const isPro = user.plan === 'pro'
    const maxProducts = isPro ? Infinity : 5
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
        setInStock(true)
        setItemType('product')
        setImageFile(null)
        setImagePreview(null)
        setEditingProduct(null)
        setShowForm(false)
        setError('')
    }

    const [compressing, setCompressing] = useState(false)

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setError('')
        setCompressing(true)

        try {
            const compressedFile = await compressImage(file)
            setImageFile(compressedFile)
            setImagePreview(URL.createObjectURL(compressedFile))
        } catch (err) {
            console.error('Compression error:', err)
            setError('Failed to process image. Please try another one.')
        } finally {
            setCompressing(false)
        }
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
                in_stock: inStock,
                item_type: itemType,
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
            const errorMessage = err instanceof Error ? err.message : 'Failed to save product/service'
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
        setInStock(product.in_stock !== false)
        setItemType(product.item_type || 'product')
        setImagePreview(product.image_url)
        setShowForm(true)
    }

    const handleToggleStock = async (product: Product) => {
        const newStockState = !product.in_stock
        setProducts(prev => prev.map(p => p.id === product.id ? { ...p, in_stock: newStockState } : p))

        const { error } = await supabase
            .from('products')
            .update({ in_stock: newStockState })
            .eq('id', product.id)

        if (error) {
            console.error('Failed to toggle stock:', error)
            await fetchProducts()
        }
    }

    const handleDelete = async (productId: string) => {
        if (!confirm('Are you sure you want to delete this product/service?')) return

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
                    <h1 className="text-2xl font-bold text-gray-900">Products & Services Catalog</h1>
                    <p className="text-gray-500">
                        {products.length} / {isPro ? '∞' : '5'} items listed
                    </p>
                </div>

                {canAddMore ? (
                    <Button onClick={() => setShowForm(true)} className="bg-orange-600 hover:bg-orange-700 font-bold">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Item / Service
                    </Button>
                ) : (
                    <Button variant="outline" onClick={() => router.push('/dashboard/settings#upgrade')}>
                        Upgrade to add more
                    </Button>
                )}
            </div>

            {/* Product limit warning */}
            {!isPro && products.length >= 2 && (
                <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium text-orange-800">
                            {products.length >= 5 ? 'Catalog limit reached!' : 'Almost at limit!'}
                        </p>
                        <p className="text-sm text-orange-700 mt-1">
                            Free accounts can add up to 5 items. Upgrade to Pro for unlimited products, services & AI Sales Assistant.
                        </p>
                    </div>
                </div>
            )}

            {/* Add/Edit Form */}
            {showForm && (
                <Card className="mb-6 border-orange-200 shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 bg-gray-50">
                        <CardTitle>{editingProduct ? 'Edit Catalog Item' : 'Add New Item / Service'}</CardTitle>
                        <Button variant="ghost" size="icon" onClick={resetForm}>
                            <X className="w-4 h-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Type Selector */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Listing Type</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 px-4 py-2 border rounded-xl cursor-pointer hover:border-orange-500 bg-white">
                                        <input
                                            type="radio"
                                            name="item_type"
                                            value="product"
                                            checked={itemType === 'product'}
                                            onChange={() => setItemType('product')}
                                            className="text-orange-600 focus:ring-orange-500"
                                        />
                                        <ShoppingBag className="w-4 h-4 text-orange-600" />
                                        <span className="text-sm font-semibold">Physical Product</span>
                                    </label>
                                    <label className="flex items-center gap-2 px-4 py-2 border rounded-xl cursor-pointer hover:border-orange-500 bg-white">
                                        <input
                                            type="radio"
                                            name="item_type"
                                            value="service"
                                            checked={itemType === 'service'}
                                            onChange={() => setItemType('service')}
                                            className="text-orange-600 focus:ring-orange-500"
                                        />
                                        <Briefcase className="w-4 h-4 text-orange-600" />
                                        <span className="text-sm font-semibold">Service / Booking</span>
                                    </label>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-sm font-medium text-gray-700">
                                        {itemType === 'service' ? 'Service Name *' : 'Product Name *'}
                                    </label>
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder={itemType === 'service' ? "e.g. Full Glam Makeup Session" : "e.g. Brazilian Hair 20 inches"}
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
                                    placeholder={itemType === 'service' ? "Describe booking process, duration, requirements..." : "Describe product features, quality, sizing..."}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    className="flex w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>

                            {/* In Stock / Available Toggle */}
                            <div className="flex items-center gap-3 p-3 bg-gray-50 border rounded-xl">
                                <input
                                    type="checkbox"
                                    id="in_stock"
                                    checked={inStock}
                                    onChange={(e) => setInStock(e.target.checked)}
                                    className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                                />
                                <label htmlFor="in_stock" className="text-sm font-medium text-gray-800 cursor-pointer">
                                    {itemType === 'service' ? 'Currently accepting bookings' : 'Currently in stock & available for purchase'}
                                </label>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Photo / Banner
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
                                            {compressing ? (
                                                <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                                            ) : (
                                                <>
                                                    <ImagePlus className="w-6 h-6 text-gray-400" />
                                                    <span className="text-xs text-gray-400 mt-1">Upload</span>
                                                </>
                                            )}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                                disabled={compressing}
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>

                            {error && (
                                <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                                    {error}
                                </p>
                            )}

                            <div className="flex gap-2 pt-2">
                                <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-700">
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        editingProduct ? 'Update Item' : 'Add Item'
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

            {/* Catalog Grid */}
            {products.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                    <Package className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <h3 className="font-medium text-gray-900 mb-2">No items listed yet</h3>
                    <p className="text-gray-500 text-sm mb-4">
                        Add your first product or service so your AI Assistant can start closing sales
                    </p>
                    <Button onClick={() => setShowForm(true)} className="bg-orange-600 hover:bg-orange-700 font-bold">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Item
                    </Button>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product) => {
                        const isInStock = product.in_stock !== false
                        const isService = product.item_type === 'service'

                        return (
                            <Card key={product.id} className="overflow-hidden flex flex-col justify-between border-gray-200 hover:border-orange-200 transition-colors">
                                <div>
                                    <div className="aspect-square relative bg-gray-100">
                                        {product.image_url ? (
                                            <Image
                                                src={product.image_url}
                                                alt={product.name}
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <Package className="w-12 h-12" />
                                            </div>
                                        )}

                                        {/* Badges */}
                                        <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm ${isInStock ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                                                {isInStock ? 'IN STOCK' : 'OUT OF STOCK'}
                                            </span>
                                            {isService && (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white shadow-sm">
                                                    SERVICE
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <CardContent className="pt-4">
                                        <h3 className="font-bold text-gray-900 truncate">{product.name}</h3>
                                        <p className="text-lg font-extrabold text-orange-600 mt-1">
                                            {formatPrice(product.price)}
                                        </p>
                                        {product.description && (
                                            <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                                                {product.description}
                                            </p>
                                        )}
                                    </CardContent>
                                </div>

                                <CardContent className="pt-0 pb-4 space-y-2">
                                    {/* Quick Stock Toggle */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={`w-full font-bold text-xs ${isInStock ? 'border-emerald-200 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100' : 'border-red-200 text-red-700 bg-red-50/50 hover:bg-red-100'}`}
                                        onClick={() => handleToggleStock(product)}
                                    >
                                        {isInStock ? (
                                            <><Check className="w-3.5 h-3.5 mr-1" /> Available (Click to mark Out of Stock)</>
                                        ) : (
                                            <><Ban className="w-3.5 h-3.5 mr-1" /> Out of Stock (Click to mark Available)</>
                                        )}
                                    </Button>


                                    <div className="flex gap-2">
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
                        )
                    })}
                </div>
            )}
        </div>
    )
}
