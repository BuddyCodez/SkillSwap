"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MessageCircle, X } from "lucide-react"
import { ChatWindow } from "./chat-window"

interface ChatModalProps {
    conversationId: string | null
    currentUserId: string
    onClose: () => void
}

export function ChatModal({ conversationId, currentUserId, onClose }: ChatModalProps) {
    if (!conversationId) return null

    return (
        <Dialog open={!!conversationId} onOpenChange={onClose}>
            <DialogContent className="bg-gray-800 border-purple-500/30 max-w-4xl w-full h-[80vh] p-0">
                <DialogHeader className="p-4 border-b border-purple-500/30">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-white flex items-center gap-2">
                            <MessageCircle className="w-5 h-5 text-purple-400" />
                            Chat
                        </DialogTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="text-purple-300 hover:text-white hover:bg-purple-600/20"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="flex-1 h-full">
                    <ChatWindow
                        conversationId={conversationId}
                        currentUserId={currentUserId}
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}
