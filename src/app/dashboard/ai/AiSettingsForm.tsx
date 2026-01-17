'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { updateAiSettings } from './actions'
import { Bot, Save, Loader2, Lock } from 'lucide-react'
import { User } from '@/lib/types'
import { useToast } from '@/components/ui/use-toast'

interface AiSettingsFormProps {
    user: User
}

export function AiSettingsForm({ user }: AiSettingsFormProps) {
    const [loading, setLoading] = useState(false)
    const isPro = user.plan === 'pro'
    // Calculate percentage, capped at 100
    const usagePercent = Math.min(((user.ai_usage_count || 0) / (user.ai_usage_limit || 100)) * 100, 100)

    // Simple toast fallback if hook doesn't exist
    const toast = (msg: string) => alert(msg)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)
        const formData = new FormData(event.currentTarget)

        // Checkbox doesn't send "false" if unchecked, it sends nothing.
        // We handle "on" check in server action.

        await updateAiSettings(formData)
        setLoading(false)
        toast('Settings saved successfully!')
    }

    if (!isPro) {
        return (
            <Card className="border-orange-200 bg-orange-50/50">
                <CardContent className="pt-6 flex flex-col items-center text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-4">
                        <Lock className="w-8 h-8 text-orange-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Unlock AI Sales Assistant</h2>
                    <p className="text-gray-600 max-w-md mb-8">
                        Your own 24/7 receptionist. Automatically answers customer questions about prices, location, and products on your page.
                    </p>
                    <Button className="bg-orange-600 hover:bg-orange-700 text-white font-bold h-12 px-8">
                        Upgrade to Pro (₦1,000/mo)
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="flex items-center gap-2">
                                <Bot className="w-5 h-5 text-orange-600" />
                                AI Assistant Settings
                            </CardTitle>
                            <CardDescription>
                                Configure how your AI responds to customers.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                            <span className="text-xs font-medium text-gray-500">Monthly Usage:</span>
                            <span className={`text-xs font-bold ${usagePercent >= 100 ? 'text-red-600' : 'text-gray-900'}`}>
                                {user.ai_usage_count || 0}/{user.ai_usage_limit || 100}
                            </span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">

                    <div className="flex items-center justify-between space-x-2 border p-4 rounded-lg bg-gray-50">
                        <Label htmlFor="ai_enabled" className="flex flex-col space-y-1 cursor-pointer">
                            <span className="font-medium text-base">Enable Assistant</span>
                            <span className="font-normal text-sm text-gray-500">
                                When enabled, a chat button will appear on your public page.
                            </span>
                        </Label>
                        <Switch
                            id="ai_enabled"
                            name="ai_enabled"
                            defaultChecked={user.ai_enabled}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="ai_welcome_msg">Welcome Message</Label>
                        <Input
                            id="ai_welcome_msg"
                            name="ai_welcome_msg"
                            defaultValue={user.ai_welcome_msg || "Hello! Check out our products below. Do you have any questions?"}
                            placeholder="Hello! How can I help you today?"
                        />
                        <p className="text-xs text-gray-500">The first message the customer sees when they open the chat.</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="ai_instructions">Business Knowledge Base</Label>
                        <Textarea
                            id="ai_instructions"
                            name="ai_instructions"
                            defaultValue={user.ai_instructions || ""}
                            placeholder="e.g. We are open Mon-Sat 9am-6pm. We sell authentic wigs from Vietnam. Delivery is ₦2000 within Lagos. No refunds after 2 days."
                            className="min-h-[150px]"
                        />
                        <p className="text-xs text-gray-500">
                            Teach the AI about your business. Include opening hours, delivery prices, and return policies. The AI already knows your products from your catalog.
                        </p>
                    </div>

                    <Button type="submit" disabled={loading} className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700">
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" /> Save Settings
                            </>
                        )}
                    </Button>

                </CardContent>
            </Card>
        </form>
    )
}
