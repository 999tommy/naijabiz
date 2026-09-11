'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { MessageSquare, Loader2, Send } from 'lucide-react'

interface BroadcastDialogProps {
    customers: any[]
}

export function BroadcastDialog({ customers }: BroadcastDialogProps) {
    const [open, setOpen] = useState(false)
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState<string | null>(null)

    const handleSend = async () => {
        if (!message.trim()) return
        setLoading(true)
        setStatus(null)

        try {
            const res = await fetch('/api/whatsapp/broadcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message,
                    phones: customers.map(c => c.phone) 
                })
            })

            if (!res.ok) throw new Error('Failed to send broadcast')
            
            setStatus('Broadcast sent successfully!')
            setMessage('')
            setTimeout(() => {
                setOpen(false)
                setStatus(null)
            }, 2000)
        } catch (error) {
            setStatus('Failed to send broadcast. Make sure your WhatsApp is connected.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Broadcast Message
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Send Broadcast</DialogTitle>
                    <DialogDescription>
                        Send a message to all your {customers.length} past customers via WhatsApp. Note: To send messages outside a 24hr window, Meta requires pre-approved template messages.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Textarea 
                        placeholder="Hello! We have a new offer..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="min-h-[120px]"
                    />
                    {status && (
                        <p className={`text-sm mt-2 ${status.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                            {status}
                        </p>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSend} disabled={!message.trim() || loading || customers.length === 0} className="bg-orange-600 hover:bg-orange-700">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                        Send to {customers.length}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
