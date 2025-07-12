"use client"

import { motion } from "framer-motion"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { ProfileSummary } from "@/components/dashboard/profile-summary"
import { useSession } from "@/lib/auth-client"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useTRPC } from "@/trpc/client"
import { SwapRequests } from "@/components/dashboard/swap-request"
import { SkillRecommendations } from "@/components/dashboard/skill-recommendation"

export default function DashboardPage() {
    const trpc = useTRPC()
    const queryClient = useQueryClient()
    const { data: session, isPending: sessionLoading } = useSession()

    // Create query options for dashboard data
    const dashboardQueryOptions = trpc.user.getDashboardData.queryOptions()
    const recommendationsQueryOptions = trpc.user.getSkillRecommendations.queryOptions()

    // Use TanStack Query hooks with tRPC query options
    const dashboardQuery = useQuery({
        ...dashboardQueryOptions,
        enabled: !!session?.user,
    })

    const recommendationsQuery = useQuery({
        ...recommendationsQueryOptions,
        enabled: !!session?.user,
    })

    // Helper function to invalidate dashboard data
    const invalidateDashboardData = () => {
        const dashboardQueryKey = trpc.user.getDashboardData.queryKey()
        queryClient.invalidateQueries({ queryKey: dashboardQueryKey })
    }

    if (sessionLoading || dashboardQuery.isLoading) {
        return (
            <div className="space-y-6">
                <Card className="bg-gray-800/50 border-purple-500/30">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <Skeleton className="w-16 h-16 rounded-full bg-gray-700" />
                            <div className="space-y-2">
                                <Skeleton className="h-6 w-48 bg-gray-700" />
                                <Skeleton className="h-4 w-64 bg-gray-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-gray-800/50 border-purple-500/30">
                        <CardContent className="p-6">
                            <Skeleton className="h-8 w-32 mb-4 bg-gray-700" />
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-16 w-full bg-gray-700" />
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gray-800/50 border-purple-500/30">
                        <CardContent className="p-6">
                            <Skeleton className="h-8 w-32 mb-4 bg-gray-700" />
                            <div className="space-y-4">
                                {[1, 2].map((i) => (
                                    <Skeleton key={i} className="h-20 w-full bg-gray-700" />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    if (!session?.user || !dashboardQuery.data) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-300">Please sign in to view your dashboard.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <h1 className="text-3xl font-bold text-white mb-2">
                    Welcome back, {dashboardQuery.data.user.name || "User"}! 👋
                </h1>
                <p className="text-gray-300">
                    Here's what's happening with your skill swaps today.
                </p>
            </motion.div>

            <ProfileSummary
                user={dashboardQuery.data.user as any}
                stats={dashboardQuery.data.stats}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SwapRequests
                    sentRequests={dashboardQuery.data.user.sentSwapRequests}
                    receivedRequests={dashboardQuery.data.user.receivedSwapRequests}
                    onUpdate={invalidateDashboardData}
                />

                <SkillRecommendations recommendations={recommendationsQuery.data || []} />
            </div>

            {/* Recent Activity - Real data from swaps */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
            >
                <Card className="bg-gray-800/50 border-purple-500/30">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4 text-white">
                            Recent Activity
                        </h3>
                        <div className="space-y-3">
                            {dashboardQuery.data.user.sentSwapRequests.length === 0 &&
                                dashboardQuery.data.user.receivedSwapRequests.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-400">No recent activity yet.</p>
                                    <p className="text-sm text-gray-500 mt-1">Start by browsing skills or creating swap requests!</p>
                                </div>
                            ) : (
                                <>
                                    {dashboardQuery.data.user.receivedSwapRequests.slice(0, 3).map((request) => (
                                        <div key={request.id} className="flex items-center gap-3 p-3 bg-purple-900/20 rounded-lg border border-purple-500/20">
                                            <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></div>
                                            <p className="text-sm text-gray-300">
                                                <span className="font-medium text-purple-300">{request.fromUser.name}</span> wants to swap for
                                                <span className="font-medium text-white"> {request.skillWanted.name}</span>
                                            </p>
                                            <span className="text-xs text-gray-500 ml-auto">
                                                {new Date(request.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    ))}
                                    {dashboardQuery.data.user.sentSwapRequests.slice(0, 2).map((request) => (
                                        <div key={request.id} className="flex items-center gap-3 p-3 bg-blue-900/20 rounded-lg border border-blue-500/20">
                                            <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                                            <p className="text-sm text-gray-300">
                                                You requested <span className="font-medium text-white">{request.skillWanted.name}</span> from
                                                <span className="font-medium text-blue-300"> {request.toUser.name}</span>
                                            </p>
                                            <span className="text-xs text-gray-500 ml-auto">
                                                {new Date(request.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}