"use client"

import { motion } from "framer-motion"
import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Participant {
    id: string
    name: string
    image?: string | null
}

interface Message {
    id: string
    content: string
    createdAt: string
    senderId: string
    type: "text" | "image"
}

interface Conversation {
    id: string
    participants: Participant[]
    lastMessage?: Message
    unreadCount: number
    updatedAt: string
}

interface ConversationListProps {
    conversations: Conversation[]
    selectedId: string | null
    onSelect: (id: string) => void
    currentUserId: string
}

export function ConversationList({ conversations, selectedId, onSelect, currentUserId }: ConversationListProps) {
    return (
        <div className="space-y-1 p-2">
            {conversations.map((conversation, index) => {
                const otherParticipant = conversation.participants.find((p) => p.id !== currentUserId)
                const isSelected = selectedId === conversation.id

                return (
                    <motion.div
                        key={conversation.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => onSelect(conversation.id)}
                        className={cn(
                            "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                            isSelected
                                ? "bg-purple-600/30 border border-purple-500/50"
                                : "hover:bg-purple-600/10 border border-transparent",
                        )}
                    >
                        <div className="relative">
                            <Avatar className="border-2 border-purple-500/30">
                                <AvatarImage src={otherParticipant?.image || ""} />
                                <AvatarFallback className="bg-purple-600 text-white">
                                    {otherParticipant?.name?.charAt(0) || "U"}
                                </AvatarFallback>
                            </Avatar>
                            {conversation.unreadCount > 0 && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                                    <span className="text-xs text-white font-medium">
                                        {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="font-medium text-white truncate">{otherParticipant?.name}</h3>
                                {conversation.lastMessage && (
                                    <span className="text-xs text-purple-400">
                                        {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), { addSuffix: true })}
                                    </span>
                                )}
                            </div>

                            {conversation.lastMessage && (
                                <div className="flex items-center gap-2">
                                    <p
                                        className={cn(
                                            "text-sm truncate flex-1",
                                            conversation.unreadCount > 0 ? "text-white font-medium" : "text-purple-300",
                                        )}
                                    >
                                        {conversation.lastMessage.type === "image" ? "📷 Image" : conversation.lastMessage.content}
                                    </p>
                                    {conversation.unreadCount > 0 && (
                                        <Badge className="bg-red-500 text-white text-xs">{conversation.unreadCount}</Badge>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )
            })}
        </div>
    )
}
