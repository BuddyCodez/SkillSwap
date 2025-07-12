"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MapPin, Star, ArrowRight, Users, Target } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { toast } from "sonner"
import { SwapRequestModal } from "./swap-request-modal"
import { useTRPC } from "@/trpc/client"

interface User {
    id: string
    name: string
    image?: string | null
    location?: string | null
    bio?: string | null
    skillsOffered: Array<{
        id: string
        name: string
        category: string
    }>
    skillsWanted: Array<{
        id: string
        name: string
        category: string
    }>
    averageRating: number
    availability: Array<{
        day: string
        time: string
    }>
}

interface UserBrowserProps {
    users: User[]
    currentUserSkills: Array<{
        id: string
        name: string
        category: string
    }>
    isLoading: boolean
    searchQuery: string
    filters: {
        skills: string[]
        location: string
        rating: number
        availability: string
        category: string
    }
}

export function UserBrowser({ users, currentUserSkills, isLoading, searchQuery, filters }: UserBrowserProps) {
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [showRequestModal, setShowRequestModal] = useState(false)

    const trpc = useTRPC()
    const queryClient = useQueryClient()

    const createSwapMutationOptions = trpc.user.createSwapRequest.mutationOptions()

    const createSwapMutation = useMutation({
        ...createSwapMutationOptions,
        onSuccess: () => {
            const dashboardQueryKey = trpc.user.getDashboardData.queryKey()
            queryClient.invalidateQueries({ queryKey: dashboardQueryKey })
            setShowRequestModal(false)
            setSelectedUser(null)
            toast.success("Swap request sent successfully!")
        },
        onError: (error) => {
            toast.error("Failed to send swap request")
            console.error("Swap request error:", error)
        },
    })

    const handleRequestSwap = (user: User) => {
        setSelectedUser(user)
        setShowRequestModal(true)
    }

    const handleSubmitRequest = async (data: {
        toUserId: string
        skillOfferedId: string
        skillWantedId: string
        message?: string
    }) => {
        await createSwapMutation.mutateAsync(data)
    }

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="bg-gray-800/50 border-purple-500/30">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-purple-500/20 rounded-full" />
                                <div className="space-y-2">
                                    <div className="h-4 w-24 bg-purple-500/20 rounded" />
                                    <div className="h-3 w-32 bg-purple-500/20 rounded" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-3 w-full bg-purple-500/20 rounded" />
                                <div className="h-3 w-3/4 bg-purple-500/20 rounded" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    if (users.length === 0) {
        return (
            <Card className="bg-gray-800/50 border-purple-500/30">
                <CardContent className="p-12 text-center">
                    <Users className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold text-white mb-2">No users found</h3>
                    <p className="text-purple-300">
                        {searchQuery || Object.values(filters).some((f) => f && (Array.isArray(f) ? f.length > 0 : true))
                            ? "Try adjusting your search or filters"
                            : "No users available for skill swapping at the moment"}
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {users.map((user, index) => (
                        <motion.div
                            key={user.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.1, duration: 0.3 }}
                        >
                            <Card className="bg-gray-800/50 border-purple-500/30 hover:border-purple-400/50 transition-colors group">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-3 mb-4">
                                        <Avatar className="border-2 border-purple-500/30">
                                            <AvatarImage src={user.image || ""} />
                                            <AvatarFallback className="bg-purple-600 text-white">
                                                {user.name?.charAt(0) || "U"}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-white truncate">{user.name}</h3>
                                                {user.averageRating > 0 && (
                                                    <div className="flex items-center gap-1">
                                                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                        <span className="text-xs text-yellow-300">{user.averageRating.toFixed(1)}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {user.location && (
                                                <div className="flex items-center gap-1 text-xs text-purple-300 mb-2">
                                                    <MapPin className="w-3 h-3" />
                                                    {user.location}
                                                </div>
                                            )}

                                            {user.bio && <p className="text-sm text-purple-200 line-clamp-2 mb-3">{user.bio}</p>}
                                        </div>
                                    </div>

                                    {/* Skills Offered */}
                                    <div className="mb-3">
                                        <div className="flex items-center gap-1 mb-2">
                                            <Target className="w-3 h-3 text-green-400" />
                                            <span className="text-xs font-medium text-green-300">Offers:</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {user.skillsOffered.slice(0, 3).map((skill) => (
                                                <Badge
                                                    key={skill.id}
                                                    variant="secondary"
                                                    className="text-xs bg-green-500/20 text-green-200 border-green-500/30"
                                                >
                                                    {skill.name}
                                                </Badge>
                                            ))}
                                            {user.skillsOffered.length > 3 && (
                                                <Badge
                                                    variant="secondary"
                                                    className="text-xs bg-green-500/20 text-green-200 border-green-500/30"
                                                >
                                                    +{user.skillsOffered.length - 3}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {/* Skills Wanted */}
                                    <div className="mb-4">
                                        <div className="flex items-center gap-1 mb-2">
                                            <Users className="w-3 h-3 text-blue-400" />
                                            <span className="text-xs font-medium text-blue-300">Wants:</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {user.skillsWanted.slice(0, 3).map((skill) => (
                                                <Badge key={skill.id} variant="outline" className="text-xs border-blue-500/30 text-blue-200">
                                                    {skill.name}
                                                </Badge>
                                            ))}
                                            {user.skillsWanted.length > 3 && (
                                                <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-200">
                                                    +{user.skillsWanted.length - 3}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {/* Availability */}
                                    {user.availability.length > 0 && (
                                        <div className="mb-4">
                                            <span className="text-xs font-medium text-purple-300">Available:</span>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {user.availability.slice(0, 2).map((avail, idx) => (
                                                    <Badge key={idx} variant="outline" className="text-xs border-purple-500/30 text-purple-200">
                                                        {avail.day}
                                                    </Badge>
                                                ))}
                                                {user.availability.length > 2 && (
                                                    <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-200">
                                                        +{user.availability.length - 2}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <Button
                                        onClick={() => handleRequestSwap(user)}
                                        disabled={createSwapMutation.isPending}
                                        className="w-full bg-purple-600 hover:bg-purple-700 text-white group-hover:bg-purple-500 transition-colors"
                                    >
                                        Request Swap
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Swap Request Modal */}
            {showRequestModal && selectedUser && (
                <SwapRequestModal
                    user={selectedUser}
                    currentUserSkills={currentUserSkills}
                    onClose={() => {
                        setShowRequestModal(false)
                        setSelectedUser(null)
                    }}
                    onSubmit={handleSubmitRequest}
                    isLoading={createSwapMutation.isPending}
                />
            )}
        </>
    )
}
