"use client"

import { useState, useEffect, Suspense } from "react"
import { motion } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import { MessageCircle, Search } from "lucide-react"
import { useSession } from "@/lib/auth-client"
import { useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

import { ChatWindow } from "@/components/messages/chat-window"
import { EmptyState } from "@/components/messages/empty-state"
import { useTRPC } from "@/trpc/client"
import { ConversationList } from "@/components/messages/convo-list"

function MessagesPageContent() {
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")

    const searchParams = useSearchParams()
    const conversationParam = searchParams.get('conversation')

    const trpc = useTRPC()
    const { data: session, isPending: sessionLoading } = useSession()

    // Auto-select conversation from URL parameter
    useEffect(() => {
        if (conversationParam && conversationParam !== selectedConversationId) {
            setSelectedConversationId(conversationParam)
        }
    }, [conversationParam, selectedConversationId])

    // Query options
    const conversationsQueryOptions = trpc.messages.getConversations.queryOptions()

    // Use queries
    const conversationsQuery = useQuery({
        ...conversationsQueryOptions,
        enabled: !!session?.user,
        refetchInterval: 5000, // Refetch every 5 seconds for real-time feel
    })

    if (sessionLoading || conversationsQuery.isLoading) {
        return (
            <div className="h-[calc(100vh-8rem)] flex">
                <div className="w-1/3 border-r border-purple-500/30 p-4 space-y-4">
                    <Skeleton className="h-10 w-full bg-purple-500/20" />
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center gap-3 p-3">
                            <Skeleton className="w-12 h-12 rounded-full bg-purple-500/20" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-3/4 bg-purple-500/20" />
                                <Skeleton className="h-3 w-1/2 bg-purple-500/20" />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <Skeleton className="h-32 w-64 bg-purple-500/20" />
                </div>
            </div>
        )
    }

    if (!session?.user) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="bg-gray-800/50 border-purple-500/30">
                    <CardContent className="p-8 text-center">
                        <p className="text-white">Please sign in to view messages.</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const conversations = conversationsQuery.data || []
    const filteredConversations = conversations.filter((conv) =>
        conv.participants.some((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase())),
    )

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                <h1 className="text-3xl font-bold text-white mb-2">Messages 💬</h1>
                <p className="text-purple-200">Chat with your skill swap partners in real-time.</p>
            </motion.div>

            <Card className="bg-gray-800/50 border-purple-500/30 h-[calc(100vh-12rem)]">
                <CardContent className="p-0 h-full">
                    <div className="flex h-full">
                        {/* Conversation List */}
                        <div className="w-1/3 border-r border-purple-500/30 flex flex-col">
                            {/* Search Header */}
                            <div className="p-4 border-b border-purple-500/30">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-4 h-4" />
                                    <Input
                                        placeholder="Search conversations..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 bg-gray-800/50 border-purple-500/30 text-white placeholder:text-purple-300"
                                    />
                                </div>
                            </div>

                            {/* Conversations */}
                            <div className="flex-1 overflow-y-auto">
                                {filteredConversations.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <MessageCircle className="w-12 h-12 text-purple-400 mx-auto mb-3 opacity-50" />
                                        <p className="text-purple-300">{searchQuery ? "No conversations found" : "No conversations yet"}</p>
                                        <p className="text-purple-400 text-sm mt-1">
                                            {searchQuery ? "Try a different search term" : "Start a conversation from your swaps"}
                                        </p>
                                    </div>
                                ) : (
                                    <ConversationList
                                        conversations={filteredConversations as any}
                                        selectedId={selectedConversationId}
                                        onSelect={setSelectedConversationId}
                                        currentUserId={session.user.id}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Chat Window */}
                        <div className="flex-1 flex flex-col">
                            {selectedConversationId ? (
                                <ChatWindow conversationId={selectedConversationId} currentUserId={session.user.id} />
                            ) : (
                                <EmptyState />
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default function MessagesPage() {
    return (
        <Suspense fallback={<div className="h-[calc(100vh-8rem)] flex items-center justify-center"><p className="text-purple-300">Loading messages...</p></div>}>
            <MessagesPageContent />
        </Suspense>
    )
}
