"use client"

import { motion } from "framer-motion"
import { Clock } from "lucide-react"
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
        <div className="space-y-8 pb-8">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col md:flex-row md:items-end justify-between gap-4"
            >
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
                        Welcome back, {dashboardQuery.data.user.name || "User"}! 👋
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Here's what's happening with your skill swaps today.
                    </p>
                </div>
                <div className="text-right hidden md:block">
                    <p className="text-sm text-gray-500 font-mono">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </motion.div>

            <ProfileSummary
                user={dashboardQuery.data.user as any}
                stats={dashboardQuery.data.stats}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                <Card className="bg-gray-900/40 backdrop-blur-xl border-white/10 shadow-xl">
                    <CardContent className="p-6">
                        <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                            <Clock className="w-5 h-5 text-purple-400" />
                            Recent Activity
                        </h3>
                        <div className="space-y-4">
                            {dashboardQuery.data.user.sentSwapRequests.length === 0 &&
                                dashboardQuery.data.user.receivedSwapRequests.length === 0 ? (
                                <div className="text-center py-12 bg-white/5 rounded-xl border border-white/5 border-dashed">
                                    <p className="text-gray-400 font-medium">No recent activity yet.</p>
                                    <p className="text-sm text-gray-500 mt-1">Start by browsing skills or creating swap requests!</p>
                                </div>
                            ) : (
                                <>
                                    {dashboardQuery.data.user.receivedSwapRequests.slice(0, 3).map((request) => (
                                        <div key={request.id} className="flex items-center gap-4 p-4 bg-purple-500/10 rounded-xl border border-purple-500/20 hover:bg-purple-500/20 transition-colors">
                                            <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
                                            <p className="text-sm text-gray-300 flex-1">
                                                <span className="font-bold text-purple-300">{request.fromUser.name}</span> wants to swap for
                                                <span className="font-bold text-white"> {request.skillWanted.name}</span>
                                            </p>
                                            <span className="text-xs text-gray-500 font-mono ml-auto bg-black/20 px-2 py-1 rounded-md">
                                                {new Date(request.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    ))}
                                    {dashboardQuery.data.user.sentSwapRequests.slice(0, 2).map((request) => (
                                        <div key={request.id} className="flex items-center gap-4 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 hover:bg-blue-500/20 transition-colors">
                                            <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                                            <p className="text-sm text-gray-300 flex-1">
                                                You requested <span className="font-bold text-white">{request.skillWanted.name}</span> from
                                                <span className="font-bold text-blue-300"> {request.toUser.name}</span>
                                            </p>
                                            <span className="text-xs text-gray-500 font-mono ml-auto bg-black/20 px-2 py-1 rounded-md">
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