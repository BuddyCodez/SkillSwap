"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Search, Filter, Users, Clock, CheckCircle } from "lucide-react"

import { useSession } from "@/lib/auth-client"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { RatingModal } from "@/components/swaps/rating-modal"
import { useTRPC } from "@/trpc/client"
import { AdvancedFilters } from "@/components/swaps/filtering"
import { UserBrowser } from "@/components/swaps/user-browse"
import { SwapRequestManager } from "@/components/swaps/swap-request-manager"

export default function SwapsPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [showFilters, setShowFilters] = useState(false)
    const [filters, setFilters] = useState({
        skills: [] as string[],
        location: "",
        rating: 0,
        availability: "",
        category: "",
    })
    const [selectedRatingSwap, setSelectedRatingSwap] = useState<string | null>(null)

    const trpc = useTRPC()
    const queryClient = useQueryClient()
    const { data: session, isPending: sessionLoading } = useSession()

    // Query options
    const dashboardQueryOptions = trpc.user.getDashboardData.queryOptions()
    const usersQueryOptions = trpc.user.searchUsers.queryOptions({
        query: searchQuery,
        filters,
    })

    // Use queries
    const dashboardQuery = useQuery({
        ...dashboardQueryOptions,
        enabled: !!session?.user,
    })

    const usersQuery = useQuery({
        ...usersQueryOptions,
        enabled: !!session?.user,
    })

    const handleFilterChange = (newFilters: typeof filters) => {
        setFilters(newFilters)
    }

    const handleRatingSubmit = () => {
        setSelectedRatingSwap(null)
        // Invalidate queries to refresh data
        const dashboardQueryKey = trpc.user.getDashboardData.queryKey()
        queryClient.invalidateQueries({ queryKey: dashboardQueryKey })
    }

    if (sessionLoading || dashboardQuery.isLoading) {
        return (
            <div className="space-y-6">
                <Card className="bg-gray-800/50 border-purple-500/30">
                    <CardContent className="p-6">
                        <Skeleton className="h-8 w-48 mb-4 bg-purple-500/20" />
                        <Skeleton className="h-10 w-full bg-purple-500/20" />
                    </CardContent>
                </Card>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="bg-gray-800/50 border-purple-500/30">
                            <CardContent className="p-6">
                                <Skeleton className="h-6 w-32 mb-4 bg-purple-500/20" />
                                <div className="space-y-3">
                                    {[1, 2, 3].map((j) => (
                                        <Skeleton key={j} className="h-16 w-full bg-purple-500/20" />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    if (!session?.user || !dashboardQuery.data) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="bg-gray-800/50 border-purple-500/30">
                    <CardContent className="p-8 text-center">
                        <p className="text-white">Please sign in to view swaps.</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const userData = dashboardQuery.data.user

    // Ensure user data has required fields
    if (!userData?.sentSwapRequests || !userData?.receivedSwapRequests) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="bg-gray-800/50 border-purple-500/30">
                    <CardContent className="p-8 text-center">
                        <p className="text-white">Swap data is incomplete. Please refresh the page.</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const { sentSwapRequests, receivedSwapRequests } = userData
    const pendingRequests = receivedSwapRequests.filter((r) => r.status === "PENDING")
    const activeSwaps = [...sentSwapRequests, ...receivedSwapRequests].filter((r) => r.status === "ACCEPTED")
    const completedSwaps = [...sentSwapRequests, ...receivedSwapRequests].filter((r) => r.status === "COMPLETED")

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                <h1 className="text-3xl font-bold text-white mb-2">Skill Swaps 🔄</h1>
                <p className="text-purple-200">
                    Find people to exchange skills with, manage your requests, and rate your experiences.
                </p>
            </motion.div>

            {/* Search and Filter Bar */}
            <Card className="bg-gray-800/50 border-purple-500/30">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-4 h-4" />
                            <Input
                                placeholder="Search by skill (e.g., Photoshop, Excel, React)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-gray-800/50 border-purple-500/30 text-white placeholder:text-purple-300"
                            />
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                            className="border-purple-500/30 text-white hover:bg-purple-600/20 bg-transparent"
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            Advanced Filters
                        </Button>
                    </div>

                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="mt-4"
                        >
                            <AdvancedFilters filters={filters} onFiltersChange={handleFilterChange} />
                        </motion.div>
                    )}
                </CardContent>
            </Card>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gray-800/50 border-purple-500/30">
                    <CardContent className="p-4 text-center">
                        <div className="flex items-center justify-center w-10 h-10 bg-orange-500/20 rounded-lg mx-auto mb-2">
                            <Clock className="w-5 h-5 text-orange-400" />
                        </div>
                        <div className="text-2xl font-bold text-orange-300">{pendingRequests.length}</div>
                        <div className="text-sm text-orange-200">Pending</div>
                    </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-purple-500/30">
                    <CardContent className="p-4 text-center">
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-500/20 rounded-lg mx-auto mb-2">
                            <Users className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="text-2xl font-bold text-blue-300">{activeSwaps.length}</div>
                        <div className="text-sm text-blue-200">Active</div>
                    </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-purple-500/30">
                    <CardContent className="p-4 text-center">
                        <div className="flex items-center justify-center w-10 h-10 bg-green-500/20 rounded-lg mx-auto mb-2">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                        </div>
                        <div className="text-2xl font-bold text-green-300">{completedSwaps.length}</div>
                        <div className="text-sm text-green-200">Completed</div>
                    </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-purple-500/30">
                    <CardContent className="p-4 text-center">
                        <div className="flex items-center justify-center w-10 h-10 bg-purple-500/20 rounded-lg mx-auto mb-2">
                            <Users className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="text-2xl font-bold text-purple-300">{usersQuery.data?.length || 0}</div>
                        <div className="text-sm text-purple-200">Available</div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="browse" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 bg-gray-800/50 border border-purple-500/30">
                    <TabsTrigger
                        value="browse"
                        className="data-[state=active]:bg-purple-600/30 data-[state=active]:text-white text-purple-200"
                    >
                        Browse Users
                    </TabsTrigger>
                    <TabsTrigger
                        value="requests"
                        className="data-[state=active]:bg-purple-600/30 data-[state=active]:text-white text-purple-200"
                    >
                        My Requests
                        {pendingRequests.length > 0 && (
                            <Badge className="ml-2 bg-orange-500 text-white">{pendingRequests.length}</Badge>
                        )}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="browse" className="space-y-6">
                    <UserBrowser
                        users={(usersQuery.data || []) as any}
                        currentUserSkills={(userData.skillsOffered || []) as any}
                        isLoading={usersQuery.isLoading}
                        searchQuery={searchQuery}
                        filters={filters}
                    />
                </TabsContent>

                <TabsContent value="requests" className="space-y-6">
                    <SwapRequestManager
                        sentRequests={sentSwapRequests as any}
                        receivedRequests={receivedSwapRequests as any}
                        currentUserId={session?.user?.id || ""}
                        onRateSwap={(swapId) => setSelectedRatingSwap(swapId)}
                    />
                </TabsContent>
            </Tabs>

            {/* Rating Modal */}
            {selectedRatingSwap && (
                <RatingModal
                    swapId={selectedRatingSwap}
                    onClose={() => setSelectedRatingSwap(null)}
                    onSubmit={handleRatingSubmit}
                />
            )}
        </div>
    )
}
