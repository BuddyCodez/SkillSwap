"use client"
import { motion } from "framer-motion"
import { Check, X, MessageCircle, Clock, CheckCircle, ArrowLeftRight, Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserAvatar } from "@/components/ui/user-avatar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTRPC } from "@/trpc/client"
import { useMutation, useQueryClient } from "@tanstack/react-query"

interface SwapRequest {
    id?: string
    status?: string
    createdAt?: string
    fromUser?: {
        id?: string
        name?: string | null
        image?: string | null
    }
    toUser?: {
        id?: string
        name?: string | null
        image?: string | null
    }
    skillOffered?: {
        id?: string
        name?: string
        category?: string
    }
    skillWanted?: {
        id?: string
        name?: string
        category?: string
    }
}

interface SwapRequestsProps {
    sentRequests: SwapRequest[]
    receivedRequests: SwapRequest[]
    onUpdate?: () => void
}

export function SwapRequests({ sentRequests, receivedRequests }: SwapRequestsProps) {
    const trpc = useTRPC()
    const queryClient = useQueryClient()

    // Create mutation options
    const updateSwapOptions = trpc.user.updateSwapRequest.mutationOptions({
        onSuccess: () => {
            // Invalidate using the query key
            const dashboardQueryKey = trpc.user.getDashboardData.queryKey()
            queryClient.invalidateQueries({ queryKey: dashboardQueryKey })
        },
    })

    // Use the mutation
    const updateSwapMutation = useMutation(updateSwapOptions)

    const handleUpdateRequest = async (requestId: string, status: "ACCEPTED" | "REJECTED") => {
        if (!requestId) return
        await updateSwapMutation.mutateAsync({ requestId, status })
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PENDING":
                return (
                    <Badge variant="secondary">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                    </Badge>
                )
            case "ACCEPTED":
                return (
                    <Badge variant="default">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Accepted
                    </Badge>
                )
            case "REJECTED":
                return <Badge variant="destructive">Rejected</Badge>
            case "COMPLETED":
                return (
                    <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Completed
                    </Badge>
                )
            default:
                return <Badge variant="secondary">{status}</Badge>
        }
    }

    const pendingReceived = receivedRequests.filter((r) => r.status === "PENDING")
    const acceptedRequests = [...sentRequests, ...receivedRequests].filter((r) => r.status === "ACCEPTED")
    const completedRequests = [...sentRequests, ...receivedRequests].filter((r) => r.status === "COMPLETED")

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
        >
            <Card className="bg-gray-900/40 backdrop-blur-xl border-white/10 shadow-xl">
                <CardHeader className="border-b border-white/5 pb-4">
                    <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                        <ArrowLeftRight className="w-5 h-5 text-purple-400" />
                        Swap Requests
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <Tabs defaultValue="pending" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 bg-white/5 p-1 rounded-xl mb-6">
                            <TabsTrigger value="pending" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg transition-all">Pending ({pendingReceived.length})</TabsTrigger>
                            <TabsTrigger value="accepted" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg transition-all">Accepted ({acceptedRequests.length})</TabsTrigger>
                            <TabsTrigger value="completed" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg transition-all">Completed ({completedRequests.length})</TabsTrigger>
                        </TabsList>

                        <TabsContent value="pending" className="space-y-4">
                            {pendingReceived.length === 0 ? (
                                <div className="text-center py-12 bg-white/5 rounded-xl border border-white/5 border-dashed">
                                    <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3 opacity-50" />
                                    <p className="text-gray-400 font-medium">No pending requests</p>
                                    <p className="text-sm text-gray-500 mt-1">Requests you receive will appear here</p>
                                </div>
                            ) : (
                                pendingReceived.map((request) => (
                                    <motion.div
                                        key={request.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="border border-white/10 rounded-xl p-4 bg-white/5 hover:bg-white/10 transition-colors"
                                    >
                                        <div className="flex items-center justify-between flex-wrap gap-4">
                                            <div className="flex items-center gap-4">
                                                <UserAvatar
                                                    user={request.fromUser || {}}
                                                    className="w-12 h-12 border-2 border-purple-500/30"
                                                    fallbackClassName="bg-purple-600"
                                                />
                                                <div>
                                                    <p className="font-bold text-white text-lg">{request.fromUser?.name || "Unknown User"}</p>
                                                    <div className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                                                        <Badge variant="secondary" className="bg-purple-500/10 text-purple-300 border-purple-500/20 hover:bg-purple-500/20">
                                                            Offers: {request.skillOffered?.name || "Unknown"}
                                                        </Badge>
                                                        <ArrowLeftRight className="w-3 h-3 text-gray-500" />
                                                        <Badge variant="outline" className="text-gray-300 border-white/20">
                                                            Wants: {request.skillWanted?.name || "Unknown"}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 ml-auto">
                                                <Button
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700 text-white border-0"
                                                    onClick={() => handleUpdateRequest(request.id || "", "ACCEPTED")}
                                                    disabled={updateSwapMutation.isPending}
                                                >
                                                    <Check className="w-4 h-4 mr-1" />
                                                    Accept
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                                    onClick={() => handleUpdateRequest(request.id || "", "REJECTED")}
                                                    disabled={updateSwapMutation.isPending}
                                                >
                                                    <X className="w-4 h-4 mr-1" />
                                                    Reject
                                                </Button>
                                                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/10">
                                                    <MessageCircle className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </TabsContent>

                        <TabsContent value="accepted" className="space-y-4">
                            {acceptedRequests.length === 0 ? (
                                <div className="text-center py-12 bg-white/5 rounded-xl border border-white/5 border-dashed">
                                    <CheckCircle className="w-12 h-12 text-gray-600 mx-auto mb-3 opacity-50" />
                                    <p className="text-gray-400 font-medium">No accepted requests</p>
                                </div>
                            ) : (
                                acceptedRequests.map((request) => (
                                    <div key={request.id} className="border border-white/10 rounded-xl p-4 bg-white/5 hover:bg-white/10 transition-colors">
                                        <div className="flex items-center justify-between flex-wrap gap-4">
                                            <div className="flex items-center gap-4">
                                                <UserAvatar
                                                    user={request.fromUser || request.toUser || {}}
                                                    className="w-12 h-12 border-2 border-purple-500/30"
                                                    fallbackClassName="bg-purple-600"
                                                />
                                                <div>
                                                    <p className="font-bold text-white text-lg">{request.fromUser?.name || request.toUser?.name || "Unknown User"}</p>
                                                    <div className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                                                        <span className="text-purple-300">{request.skillOffered?.name || "Unknown"}</span>
                                                        <ArrowLeftRight className="w-3 h-3 text-gray-500" />
                                                        <span className="text-blue-300">{request.skillWanted?.name || "Unknown"}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 ml-auto">
                                                {getStatusBadge(request.status || "UNKNOWN")}
                                                <Button size="sm" variant="outline" className="border-white/20 text-gray-300 hover:text-white hover:bg-white/10">
                                                    <MessageCircle className="w-4 h-4 mr-1" />
                                                    Message
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </TabsContent>

                        <TabsContent value="completed" className="space-y-4">
                            {completedRequests.length === 0 ? (
                                <div className="text-center py-12 bg-white/5 rounded-xl border border-white/5 border-dashed">
                                    <CheckCircle className="w-12 h-12 text-green-600/50 mx-auto mb-3" />
                                    <p className="text-gray-400 font-medium">No completed swaps yet</p>
                                </div>
                            ) : (
                                completedRequests.map((request) => (
                                    <div key={request.id} className="border border-white/10 rounded-xl p-4 bg-white/5 hover:bg-white/10 transition-colors">
                                        <div className="flex items-center justify-between flex-wrap gap-4">
                                            <div className="flex items-center gap-4">
                                                <UserAvatar
                                                    user={request.fromUser || request.toUser || {}}
                                                    className="w-12 h-12 border-2 border-green-500/30"
                                                    fallbackClassName="bg-green-600"
                                                />
                                                <div>
                                                    <p className="font-bold text-white text-lg">{request.fromUser?.name || request.toUser?.name || "Unknown User"}</p>
                                                    <div className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                                                        <span className="text-purple-300">{request.skillOffered?.name || "Unknown"}</span>
                                                        <ArrowLeftRight className="w-3 h-3 text-gray-500" />
                                                        <span className="text-blue-300">{request.skillWanted?.name || "Unknown"}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 ml-auto">
                                                {getStatusBadge(request.status || "UNKNOWN")}
                                                <Button size="sm" variant="outline" className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 hover:text-yellow-300">
                                                    <Star className="w-4 h-4 mr-1" />
                                                    Rate Experience
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </motion.div>
    )
}