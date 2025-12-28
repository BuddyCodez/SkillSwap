"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Send, Smile, MoreVertical, MessageCircle } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

import { toast } from "sonner"
import { MessageBubble } from "./msg-bubble"
import { useTRPC } from "@/trpc/client"

// Emoji data - organized by categories with unique emojis
const EMOJI_CATEGORIES = {
    "Smileys": ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩", "🥳"],
    "Gestures": ["👍", "👎", "👌", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "👋", "🤚", "🖐️", "✋", "🖖", "👏", "🙌", "🤲", "🤝", "🙏"],
    "Hearts": ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟"],
    "Objects": ["💬", "💭", "💯", "💢", "💫", "💦", "💨", "🕳️", "💣", "💤", "👁️", "🗨️", "🗯️", "🔥", "⭐", "🌟", "✨", "⚡", "☄️", "💥"]
}

interface ChatWindowProps {
    conversationId: string
    currentUserId: string
}

export function ChatWindow({ conversationId, currentUserId }: ChatWindowProps) {
    const [message, setMessage] = useState("")
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const trpc = useTRPC()
    const queryClient = useQueryClient()

    // Query options
    const conversationQueryOptions = trpc.messages.getConversation.queryOptions({ conversationId })
    const messagesQueryOptions = trpc.messages.getMessages.queryOptions({ conversationId })

    // Use queries
    const conversationQuery = useQuery({
        ...conversationQueryOptions,
        enabled: !!conversationId,
    })

    const messagesQuery = useQuery({
        ...messagesQueryOptions,
        enabled: !!conversationId,
        refetchInterval: 2000, // Refetch every 2 seconds for real-time feel
    })

    // Mutations
    const sendMessageMutationOptions = trpc.messages.sendMessage.mutationOptions()
    const markAsReadMutationOptions = trpc.messages.markAsRead.mutationOptions()

    const sendMessageMutation = useMutation({
        ...sendMessageMutationOptions,
        onMutate: async (newMessage) => {
            // Cancel outgoing refetches
            const messagesQueryKey = trpc.messages.getMessages.queryKey({ conversationId })
            const conversationsQueryKey = trpc.messages.getConversations.queryKey()

            await queryClient.cancelQueries({ queryKey: messagesQueryKey })
            await queryClient.cancelQueries({ queryKey: conversationsQueryKey })

            // Snapshot previous values
            const previousMessages = queryClient.getQueryData(messagesQueryKey)
            const previousConversations = queryClient.getQueryData(conversationsQueryKey)

            // Optimistically add new message
            if (newMessage) {
                const optimisticMessage = {
                    id: `optimistic-${Date.now()}`,
                    content: newMessage.content,
                    senderId: currentUserId,
                    createdAt: new Date().toISOString(),
                    read: false,
                    conversationId,
                    type: newMessage.type || "TEXT",
                }

                queryClient.setQueryData(messagesQueryKey, (old: any[]) => {
                    return [...(old || []), optimisticMessage]
                })

                // Optimistically update conversation list (last message)
                queryClient.setQueryData(conversationsQueryKey, (old: any[]) => {
                    if (!old) return old
                    return old.map((conv) => {
                        if (conv.id === conversationId) {
                            return {
                                ...conv,
                                lastMessage: optimisticMessage,
                                updatedAt: new Date().toISOString(),
                            }
                        }
                        return conv
                    })
                })
            }

            setMessage("") // Clear input immediately

            return { previousMessages, previousConversations, messagesQueryKey, conversationsQueryKey }
        },
        onError: (err, newMessage, context: any) => {
            if (context?.previousMessages) {
                queryClient.setQueryData(context.messagesQueryKey, context.previousMessages)
            }
            if (context?.previousConversations) {
                queryClient.setQueryData(context.conversationsQueryKey, context.previousConversations)
            }
            toast.error("Failed to send message")
        },
        onSettled: (data, error, variables, context: any) => {
            if (context?.messagesQueryKey) {
                queryClient.invalidateQueries({ queryKey: context.messagesQueryKey })
            }
            if (context?.conversationsQueryKey) {
                queryClient.invalidateQueries({ queryKey: context.conversationsQueryKey })
            }
        },
    })

    const markAsReadMutation = useMutation({
        ...markAsReadMutationOptions,
        onSuccess: () => {
            const conversationsQueryKey = trpc.messages.getConversations.queryKey()
            queryClient.invalidateQueries({ queryKey: conversationsQueryKey })
        },
    })

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messagesQuery.data])

    // Mark messages as read when conversation is opened
    useEffect(() => {
        if (conversationId) {
            markAsReadMutation.mutate({ conversationId })
        }
    }, [conversationId])

    const handleSendMessage = async () => {
        if (!message.trim()) return

        await sendMessageMutation.mutateAsync({
            conversationId,
            content: message.trim(),
            type: "TEXT" as const,
        })
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    const handleEmojiSelect = (emoji: string) => {
        setMessage(prev => prev + emoji)
        setShowEmojiPicker(false)
        inputRef.current?.focus()
    }

    const EmojiPicker = () => (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-80 h-96 bg-gray-800/95 backdrop-blur-lg border border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden"
        >
            <div className="p-4 border-b border-purple-500/20">
                <h3 className="text-white font-semibold text-sm">Choose an emoji</h3>
            </div>
            <ScrollArea className="h-80">
                <div className="p-4 space-y-4">
                    {Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => (
                        <div key={category}>
                            <h4 className="text-purple-300 text-xs font-medium mb-2 uppercase tracking-wider">{category}</h4>
                            <div className="grid grid-cols-8 gap-2">
                                {emojis.map((emoji, index) => (
                                    <motion.button
                                        key={`${category}-${index}-${emoji}`}
                                        whileHover={{ scale: 1.2 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleEmojiSelect(emoji)}
                                        className="w-8 h-8 rounded-lg hover:bg-purple-600/20 flex items-center justify-center text-lg transition-colors"
                                    >
                                        {emoji}
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </motion.div>
    )

    if (conversationQuery.isLoading || messagesQuery.isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <div className="relative mb-6">
                        <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto" />
                        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-purple-400/40 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                    </div>
                    <p className="text-purple-300 text-lg font-medium">Loading conversation...</p>
                    <p className="text-purple-400/60 text-sm mt-2">Setting up your chat experience</p>
                </motion.div>
            </div>
        )
    }

    const conversation = conversationQuery.data as any
    const messages = (messagesQuery.data || []) as any[]
    const otherParticipant = conversation?.participants?.find((p: any) => p.id !== currentUserId)

    if (!conversation || !otherParticipant) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center p-8"
                >
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-600/20 to-purple-700/20 rounded-full flex items-center justify-center mb-6 mx-auto">
                        <MessageCircle className="w-10 h-10 text-purple-400" />
                    </div>
                    <p className="text-purple-300 text-xl font-semibold mb-2">Conversation not found</p>
                    <p className="text-purple-400/60">This conversation may have been deleted or you don't have access to it.</p>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-gradient-to-br from-gray-900/30 via-gray-800/30 to-gray-900/30 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 opacity-3">
                <div className="absolute top-10 left-10 w-32 h-32 bg-purple-500 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-pink-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            {/* Chat Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 flex items-center justify-between p-4 border-b border-purple-500/20 bg-gray-800/60 backdrop-blur-xl flex-shrink-0"
            >
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Avatar className="border-2 border-purple-500/50 shadow-lg w-10 h-10">
                            <AvatarImage src={otherParticipant.image || ""} />
                            <AvatarFallback className="bg-gradient-to-br from-purple-600 to-purple-800 text-white font-bold">
                                {otherParticipant.name?.charAt(0) || "U"}
                            </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-800 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="font-bold text-white text-lg bg-gradient-to-r from-white to-purple-200 bg-clip-text">
                            {otherParticipant.name}
                        </h2>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            <p className="text-xs text-green-400 font-medium">Active now</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-purple-300 hover:text-white hover:bg-purple-600/30 transition-all duration-200 rounded-xl"
                            >
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-gray-800/95 border-purple-500/30 backdrop-blur-sm rounded-xl">
                            <DropdownMenuItem className="text-white hover:bg-purple-600/20 cursor-pointer rounded-lg">
                                View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-white hover:bg-purple-600/20 cursor-pointer rounded-lg">
                                Clear Chat
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-400 hover:bg-red-600/20 cursor-pointer rounded-lg">
                                Block User
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </motion.div>

            {/* Messages */}
            <div className="flex-1 relative z-10 overflow-hidden">
                <ScrollArea className="h-full">
                    <div className="p-4 space-y-4">
                        <AnimatePresence>
                            {messages.map((msg, index) => (
                                <MessageBubble
                                    key={msg.id}
                                    message={msg}
                                    isOwn={msg.senderId === currentUserId}
                                    showAvatar={
                                        index === 0 ||
                                        messages[index - 1]?.senderId !== msg.senderId ||
                                        new Date(msg.createdAt).getTime() - new Date(messages[index - 1]?.createdAt).getTime() > 300000
                                    }
                                    participant={msg.senderId === currentUserId ? null : otherParticipant}
                                />
                            ))}
                        </AnimatePresence>
                        <div ref={messagesEndRef} />
                    </div>
                </ScrollArea>
            </div>

            {/* Message Input */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 p-4 border-t border-purple-500/20 bg-gray-800/60 backdrop-blur-xl flex-shrink-0"
            >
                <div className="flex items-end gap-3">
                    <div className="flex-1 relative">
                        <Input
                            ref={inputRef}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your message..."
                            className="bg-gray-800/60 border-purple-500/30 text-white placeholder:text-purple-300/70 pr-12 py-3 rounded-2xl shadow-lg focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition-all duration-200 backdrop-blur-sm"
                            disabled={sendMessageMutation.isPending}
                        />
                        <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-purple-300 hover:text-white hover:bg-purple-600/30 transition-all duration-200 rounded-xl"
                                >
                                    <Smile className="w-4 h-4" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                side="top"
                                align="end"
                                className="p-0 border-0 bg-transparent shadow-none"
                                sideOffset={10}
                            >
                                <EmojiPicker />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Button
                            onClick={handleSendMessage}
                            disabled={!message.trim() || sendMessageMutation.isPending}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-2xl transition-all duration-200 px-6 py-3 rounded-2xl font-semibold"
                        >
                            {sendMessageMutation.isPending ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                        </Button>
                    </motion.div>
                </div>
            </motion.div>

            {/* Image Upload Modal */}
            <AnimatePresence>
            </AnimatePresence>
        </div>
    )
}
