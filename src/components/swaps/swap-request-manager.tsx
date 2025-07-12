"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check, X, MessageCircle, Clock, CheckCircle, Trash2, Star, Users } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { useTRPC } from "@/trpc/client"

interface SwapRequest {
    id: string
    status: string
    createdAt: string
    message?: string
    fromUser?: {
        id: string
        name: string
        image?: string | null
    }
    toUser?: {
        id: string
        name: string
        image?: string | null
    }
    skillOffered: {
        id: string
        name: string
        category: string
    }
    skillWanted: {
        id: string
        name: string
        category: string
    }
    ratings: Array<{
        id: string
        fromUserId: string
        rating: number
        comment?: string
    }>
}

interface SwapRequestManagerProps {
    sentRequests: SwapRequest[]
    receivedRequests: SwapRequest[]
    currentUserId: string
    onRateSwap: (swapId: string) => void
}

export function SwapRequestManager({ sentRequests, receivedRequests, currentUserId, onRateSwap }: SwapRequestManagerProps) {
    const router = useRouter()
    const trpc = useTRPC()
    const queryClient = useQueryClient()

    // Mutation options
    const updateSwapMutationOptions = trpc.user.updateSwapRequest.mutationOptions()
    const deleteSwapMutationOptions = trpc.user.deleteSwapRequest.mutationOptions()
    const createConversationMutationOptions = trpc.messages.createConversation.mutationOptions()
    const findConversationMutationOptions = trpc.messages.findConversationByParticipants.queryOptions()

    const updateSwapMutation = useMutation({
        ...updateSwapMutationOptions,
        onSuccess: () => {
            const dashboardQueryKey = trpc.user.getDashboardData.queryKey()
            queryClient.invalidateQueries({ queryKey: dashboardQueryKey })
            toast.success("Request updated successfully!")
        },
        onError: () => {
            toast.error("Failed to update request")
        },
    })

    const deleteSwapMutation = useMutation({
        ...deleteSwapMutationOptions,
        onSuccess: () => {
            const dashboardQueryKey = trpc.user.getDashboardData.queryKey()
            queryClient.invalidateQueries({ queryKey: dashboardQueryKey })
            toast.success("Request deleted successfully!")
        },
        onError: () => {
            toast.error("Failed to delete request")
        },
    })

    const createConversationMutation = useMutation({
        ...createConversationMutationOptions,
        onSuccess: (conversation) => {
            toast.success("Chat started!")
            router.push(`/dashboard/messages?conversation=${conversation.id}`)
        },
        onError: () => {
            toast.error("Failed to start conversation")
        },
    })

    const handleUpdateRequest = async (requestId: string, status: "ACCEPTED" | "REJECTED" | "COMPLETED") => {
        await updateSwapMutation.mutateAsync({ requestId, status })
    }

    const handleDeleteRequest = async (requestId: string) => {
        await deleteSwapMutation.mutateAsync({ requestId })
    }

    const handleStartConversation = async (participantId: string, swapRequestId: string) => {
        try {
            // Try to create conversation - it will either create new or return existing
            await createConversationMutation.mutateAsync({
                participantId,
                swapRequestId,
            })
        } catch (error: any) {
            // If error is about existing conversation, navigate to messages anyway
            if (error?.message?.includes('already exists') || error?.message?.includes('UNIQUE constraint')) {
                toast.success("Opening existing chat!")
                router.push(`/dashboard/messages`)
            } else {
                toast.error("Failed to start conversation")
            }
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PENDING":
                return (
                    <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                    </Badge>
                )
            case "ACCEPTED":
                return (
                    <Badge variant="default" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Accepted
                    </Badge>
                )
            case "REJECTED":
                return (
                    <Badge variant="destructive" className="bg-red-500/20 text-red-300 border-red-500/30">
                        Rejected
                    </Badge>
                )
            case "COMPLETED":
                return (
                    <Badge variant="default" className="bg-green-500/20 text-green-300 border-green-500/30">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Completed
                    </Badge>
                )
            default:
                return <Badge variant="secondary">{status}</Badge>
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const hasUserRated = (request: SwapRequest) => {
        return request.ratings.some((rating) => rating.fromUserId === currentUserId)
    }

    const pendingReceived = receivedRequests.filter((r) => r.status === "PENDING")
    const pendingSent = sentRequests.filter((r) => r.status === "PENDING")
    const activeRequests = [...sentRequests, ...receivedRequests].filter((r) => r.status === "ACCEPTED")
    const completedRequests = [...sentRequests, ...receivedRequests].filter((r) => r.status === "COMPLETED")

    return (
        <>
            <Card className="bg-gray-800/50 border-purple-500/30">
                <CardHeader>
                    <CardTitle className="text-white">Swap Request Manager</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="received" className="w-full">
                        <TabsList className="grid w-full grid-cols-4 bg-gray-800/50 border border-purple-500/30">
                            <TabsTrigger
                                value="received"
                                className="data-[state=active]:bg-purple-600/30 data-[state=active]:text-white text-purple-200"
                            >
                                Received ({pendingReceived.length})
                            </TabsTrigger>
                            <TabsTrigger
                                value="sent"
                                className="data-[state=active]:bg-purple-600/30 data-[state=active]:text-white text-purple-200"
                            >
                                Sent ({pendingSent.length})
                            </TabsTrigger>
                            <TabsTrigger
                                value="active"
                                className="data-[state=active]:bg-purple-600/30 data-[state=active]:text-white text-purple-200"
                            >
                                Active ({activeRequests.length})
                            </TabsTrigger>
                            <TabsTrigger
                                value="completed"
                                className="data-[state=active]:bg-purple-600/30 data-[state=active]:text-white text-purple-200"
                            >
                                Completed ({completedRequests.length})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="received" className="space-y-4 mt-6">
                            {pendingReceived.length === 0 ? (
                                <div className="text-center py-8 text-purple-300">
                                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>No pending requests received</p>
                                </div>
                            ) : (
                                pendingReceived.map((request) => (
                                    <motion.div
                                        key={request.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="border border-purple-500/30 rounded-lg p-4 bg-gray-800/30"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={request.fromUser?.image || ""} />
                                                    <AvatarFallback className="bg-purple-600 text-white">
                                                        {request.fromUser?.name?.charAt(0) || "U"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-white">{request.fromUser?.name}</p>
                                                    <div className="text-sm text-purple-300">
                                                        Offers: <span className="font-medium text-green-300">{request.skillOffered.name}</span>
                                                        {" → "}
                                                        Wants: <span className="font-medium text-blue-300">{request.skillWanted.name}</span>
                                                    </div>
                                                    <div className="text-xs text-purple-400 mt-1">{formatDate(request.createdAt)}</div>
                                                    {request.message && (
                                                        <div className="text-sm text-purple-200 mt-2 p-2 bg-gray-700/50 rounded">
                                                            "{request.message}"
                                                        </div>
                                                    )}
                                                </div>
                                            </div>                                        <div className="flex items-center gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleStartConversation(request.fromUser?.id || "", request.id)}
                                                    disabled={createConversationMutation.isPending}
                                                    className="border-purple-500/30 bg-purple-600 text-white hover:bg-purple-600/80 hover:text-white transition-all"
                                                >
                                                    <MessageCircle className="w-4 h-4 mr-1" />
                                                    Message
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleUpdateRequest(request.id, "ACCEPTED")}
                                                    disabled={updateSwapMutation.isPending}
                                                    className="bg-emerald-600 hover:bg-emerald-600/80 hover:text-white text-white border-0 shadow-lg transition-all"
                                                >
                                                    <Check className="w-4 h-4 mr-1" />
                                                    Accept
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleUpdateRequest(request.id, "REJECTED")}
                                                    disabled={updateSwapMutation.isPending}
                                                    className="border-red-500/50 text-white bg-red-600 hover:border-red-600/80 hover:text-white transition-all"
                                                >
                                                    <X className="w-4 h-4 mr-1" />
                                                    Reject
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </TabsContent>

                        <TabsContent value="sent" className="space-y-4 mt-6">
                            {pendingSent.length === 0 ? (
                                <div className="text-center py-8 text-purple-300">
                                    <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>No pending requests sent</p>
                                </div>
                            ) : (
                                pendingSent.map((request) => (
                                    <motion.div
                                        key={request.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="border border-purple-500/30 rounded-lg p-4 bg-gray-800/30"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={request.toUser?.image || ""} />
                                                    <AvatarFallback className="bg-purple-600 text-white">
                                                        {request.toUser?.name?.charAt(0) || "U"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-white">{request.toUser?.name}</p>
                                                    <div className="text-sm text-purple-300">
                                                        You offer: <span className="font-medium text-green-300">{request.skillOffered.name}</span>
                                                        {" → "}
                                                        You want: <span className="font-medium text-blue-300">{request.skillWanted.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        {getStatusBadge(request.status)}
                                                        <span className="text-xs text-purple-400">{formatDate(request.createdAt)}</span>
                                                    </div>
                                                    {request.message && (
                                                        <div className="text-sm text-purple-200 mt-2 p-2 bg-gray-700/50 rounded">
                                                            Your message: "{request.message}"
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleStartConversation(request.toUser?.id || "", request.id)}
                                                disabled={createConversationMutation.isPending}
                                                className="border-purple-500/30 bg-purple-600 text-white hover:bg-purple-600/80 hover:text-white transition-all"
                                            >
                                                <MessageCircle className="w-4 h-4 mr-1" />
                                                Message
                                            </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="border-red-500/30 text-white hover:bg-red-600/80 hover:text-white bg-red-600"
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-1" />
                                                            Delete
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent className="bg-gray-800 border-purple-500/30">
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle className="text-white">Delete Swap Request</AlertDialogTitle>
                                                            <AlertDialogDescription className="text-purple-200">
                                                                Are you sure you want to delete this swap request? This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel className="border-purple-500/30 bg-purple-600 text-white hover:bg-purple-600/80 hover:text-white">
                                                                Cancel
                                                            </AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDeleteRequest(request.id)}
                                                                className="bg-red-600 hover:bg-red-700 text-white"
                                                            >
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </TabsContent>

                        <TabsContent value="active" className="space-y-4 mt-6">
                            {activeRequests.length === 0 ? (
                                <div className="text-center py-8 text-purple-300">
                                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>No active swaps</p>
                                </div>
                            ) : (
                                activeRequests.map((request) => (
                                    <div key={request.id} className="border border-purple-500/30 rounded-lg p-4 bg-gray-800/30">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={request.fromUser?.image || request.toUser?.image || ""} />
                                                    <AvatarFallback className="bg-purple-600 text-white">
                                                        {(request.fromUser?.name || request.toUser?.name)?.charAt(0) || "U"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-white">{request.fromUser?.name || request.toUser?.name}</p>
                                                    <div className="text-sm text-purple-300">
                                                        {request.skillOffered.name} ↔ {request.skillWanted.name}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        {getStatusBadge(request.status)}
                                                        <span className="text-xs text-purple-400">{formatDate(request.createdAt)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        const otherUserId = request.fromUser?.id === currentUserId
                                                            ? request.toUser?.id
                                                            : request.fromUser?.id
                                                        if (otherUserId) {
                                                            handleStartConversation(otherUserId, request.id)
                                                        }
                                                    }}
                                                    disabled={createConversationMutation.isPending}
                                                    className="border-purple-500/30 bg-purple-600 text-white hover:bg-purple-600/80 hover:text-white transition-all"
                                                >
                                                    <MessageCircle className="w-4 h-4 mr-1" />
                                                    Message
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700 text-white"
                                                    onClick={() => handleUpdateRequest(request.id, "COMPLETED")}
                                                >
                                                    Mark Complete
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </TabsContent>

                        <TabsContent value="completed" className="space-y-4 mt-6">
                            {completedRequests.length === 0 ? (
                                <div className="text-center py-8 text-purple-300">
                                    <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>No completed swaps yet</p>
                                </div>
                            ) : (
                                completedRequests.map((request) => (
                                    <div key={request.id} className="border border-purple-500/30 rounded-lg p-4 bg-gray-800/30">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={request.fromUser?.image || request.toUser?.image || ""} />
                                                    <AvatarFallback className="bg-purple-600 text-white">
                                                        {(request.fromUser?.name || request.toUser?.name)?.charAt(0) || "U"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-white">{request.fromUser?.name || request.toUser?.name}</p>
                                                    <div className="text-sm text-purple-300">
                                                        {request.skillOffered.name} ↔ {request.skillWanted.name}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        {getStatusBadge(request.status)}
                                                        <span className="text-xs text-purple-400">{formatDate(request.createdAt)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {hasUserRated(request) ? (
                                                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                                                        <Star className="w-3 h-3 mr-1" />
                                                        Rated
                                                    </Badge>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => onRateSwap(request.id)}
                                                        className="bg-yellow-600 hover:bg-yellow-700 text-white"
                                                    >
                                                        <Star className="w-4 h-4 mr-1" />
                                                        Rate Experience
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </TabsContent>                </Tabs>
                </CardContent>
            </Card>
        </>
    )
}
