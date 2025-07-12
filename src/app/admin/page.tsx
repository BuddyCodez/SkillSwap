"use client"

import { useTRPC } from "@/trpc/client"
import { useQuery } from "@tanstack/react-query"
import { useSession } from "@/lib/auth-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, BookOpen, RefreshCw, Star, UserX, AlertTriangle, MessageSquare, FileText } from "lucide-react"
import { UserManagement } from "@/components/admin/user-management"

import { Reports } from "@/components/admin/reports"
import { SkillModeration } from "@/components/admin/skill-moderation"
import { SwapMonitoring } from "@/components/admin/swap-monitoring"
import { PlatformMessaging } from "@/components/admin/platform-messaging"

export default function AdminDashboard() {
    const { data: session } = useSession()
    const trpc = useTRPC()

    const dashboardStatsQueryOptions = trpc.admin.getDashboardStats.queryOptions()
    const { data: stats, isLoading } = useQuery({
        ...dashboardStatsQueryOptions,
        enabled: !!session?.user,
        refetchInterval: 30000 // Refresh every 30 seconds
    })

    if (isLoading) {
        return (
            <div className="min-h-screen p-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-700 rounded w-64"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-32 bg-gray-700 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                        <p className="text-gray-300 mt-2">Manage your SkillSwap platform</p>
                    </div>
                    <Badge variant="outline" className="text-purple-400 border-purple-400">
                        Administrator
                    </Badge>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="bg-gray-800/50 border-purple-500/30">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-300">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-purple-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gray-800/50 border-purple-500/30">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-300">Total Skills</CardTitle>
                            <BookOpen className="h-4 w-4 text-purple-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{stats?.totalSkills || 0}</div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gray-800/50 border-purple-500/30">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-300">Total Swaps</CardTitle>
                            <RefreshCw className="h-4 w-4 text-purple-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{stats?.totalSwaps || 0}</div>
                            <p className="text-xs text-gray-400 mt-1">
                                {stats?.pendingSwaps || 0} pending • {stats?.completedSwaps || 0} completed
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gray-800/50 border-purple-500/30">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-300">Total Ratings</CardTitle>
                            <Star className="h-4 w-4 text-purple-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{stats?.totalRatings || 0}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Users */}
                <Card className="bg-gray-800/50 border-purple-500/30">
                    <CardHeader>
                        <CardTitle className="text-white">Recent Users</CardTitle>
                        <CardDescription className="text-gray-400">Latest user registrations</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats?.recentUsers?.map((user) => (
                                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-white">{user.name}</p>
                                        <p className="text-sm text-gray-400">{user.email}</p>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                                            {user.role}
                                        </Badge>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Admin Tabs */}
                <Tabs defaultValue="users" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-5 bg-gray-800/50">
                        <TabsTrigger value="users" className="flex items-center gap-2">
                            <UserX className="h-4 w-4" />
                            User Management
                        </TabsTrigger>
                        <TabsTrigger value="skills" className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            Skill Moderation
                        </TabsTrigger>
                        <TabsTrigger value="swaps" className="flex items-center gap-2">
                            <RefreshCw className="h-4 w-4" />
                            Swap Monitoring
                        </TabsTrigger>
                        <TabsTrigger value="messaging" className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Platform Messaging
                        </TabsTrigger>
                        <TabsTrigger value="reports" className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Reports
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="users">
                        <UserManagement />
                    </TabsContent>

                    <TabsContent value="skills">
                        <SkillModeration />
                    </TabsContent>

                    <TabsContent value="swaps">
                        <SwapMonitoring />
                    </TabsContent>

                    <TabsContent value="messaging">
                        <PlatformMessaging />
                    </TabsContent>

                    <TabsContent value="reports">
                        <Reports />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
