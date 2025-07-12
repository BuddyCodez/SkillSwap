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
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <Skeleton className="w-16 h-16 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-6 w-48" />
                                <Skeleton className="h-4 w-64" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardContent className="p-6">
                            <Skeleton className="h-8 w-32 mb-4" />
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-16 w-full" />
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <Skeleton className="h-8 w-32 mb-4" />
                            <div className="space-y-4">
                                {[1, 2].map((i) => (
                                    <Skeleton key={i} className="h-20 w-full" />
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
                <p className="text-gray-500">Please sign in to view your dashboard.</p>
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Welcome back, {dashboardQuery.data.user.name || "User"}! 👋
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Here's what's happening with your skill swaps today.
                </p>
            </motion.div>

            <ProfileSummary
                user={dashboardQuery.data.user}
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

            {/* Activity Feed */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
            >
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                            Recent Activity
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    <span className="font-medium">Maria</span> accepted your swap request for
                                    <span className="font-medium"> Photoshop help</span>
                                </p>
                                <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">2h ago</span>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    New match: <span className="font-medium">John</span> needs
                                    <span className="font-medium"> React help</span> (you offer this)
                                </p>
                                <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">4h ago</span>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    Your swap with <span className="font-medium">Lee</span> is
                                    <span className="font-medium"> tomorrow at 4PM</span>
                                </p>
                                <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">1d ago</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}