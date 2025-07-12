"use client"
import { motion } from "framer-motion"
import { Check, X, MessageCircle, Clock, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
            <Card>
                <CardHeader>
                    <CardTitle>Swap Requests</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="pending" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="pending">Pending ({pendingReceived.length})</TabsTrigger>
                            <TabsTrigger value="accepted">Accepted ({acceptedRequests.length})</TabsTrigger>
                            <TabsTrigger value="completed">Completed ({completedRequests.length})</TabsTrigger>
                        </TabsList>

                        <TabsContent value="pending" className="space-y-4">
                            {pendingReceived.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">No pending requests</p>
                            ) : (
                                pendingReceived.map((request) => (
                                    <motion.div
                                        key={request.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="border rounded-lg p-4"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={request.fromUser?.image || ""} />
                                                    <AvatarFallback>{request.fromUser?.name?.charAt(0) || "U"}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{request.fromUser?.name || "Unknown User"}</p>
                                                    <div className="text-sm text-gray-600">
                                                        Offers: <span className="font-medium">{request.skillOffered?.name || "Unknown Skill"}</span>
                                                        {" → "}
                                                        Wants: <span className="font-medium">{request.skillWanted?.name || "Unknown Skill"}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleUpdateRequest(request.id || "", "ACCEPTED")}
                                                    disabled={updateSwapMutation.isPending}
                                                >
                                                    <Check className="w-4 h-4 mr-1" />
                                                    Accept
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleUpdateRequest(request.id || "", "REJECTED")}
                                                    disabled={updateSwapMutation.isPending}
                                                >
                                                    <X className="w-4 h-4 mr-1" />
                                                    Reject
                                                </Button>
                                                <Button size="sm" variant="ghost">
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
                                <p className="text-center text-gray-500 py-8">No accepted requests</p>
                            ) : (
                                acceptedRequests.map((request) => (
                                    <div key={request.id} className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={request.fromUser?.image || request.toUser?.image || ""} />
                                                    <AvatarFallback>
                                                        {(request.fromUser?.name || request.toUser?.name)?.charAt(0) || "U"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{request.fromUser?.name || request.toUser?.name || "Unknown User"}</p>
                                                    <div className="text-sm text-gray-600">
                                                        {request.skillOffered?.name || "Unknown"} ↔ {request.skillWanted?.name || "Unknown"}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {getStatusBadge(request.status || "UNKNOWN")}
                                                <Button size="sm" variant="outline">
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
                                <p className="text-center text-gray-500 py-8">No completed swaps yet</p>
                            ) : (
                                completedRequests.map((request) => (
                                    <div key={request.id} className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={request.fromUser?.image || request.toUser?.image || ""} />
                                                    <AvatarFallback>
                                                        {(request.fromUser?.name || request.toUser?.name)?.charAt(0) || "U"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{request.fromUser?.name || request.toUser?.name || "Unknown User"}</p>
                                                    <div className="text-sm text-gray-600">
                                                        {request.skillOffered?.name || "Unknown"} ↔ {request.skillWanted?.name || "Unknown"}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {getStatusBadge(request.status || "UNKNOWN")}
                                                <Button size="sm" variant="outline">
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