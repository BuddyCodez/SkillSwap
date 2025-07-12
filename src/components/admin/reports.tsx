"use client"

import { useState } from "react"
import { useTRPC } from "@/trpc/client"
import { useQuery } from "@tanstack/react-query"
import { useSession } from "@/lib/auth-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Download, Users, BookOpen, RefreshCw, Calendar, BarChart3 } from "lucide-react"
import { toast } from "sonner"

export function Reports() {
    const { data: session } = useSession()
    const trpc = useTRPC()

    const reportQueryOptions = trpc.admin.generateUserActivityReport.queryOptions()
    const { data: reportData, isLoading, refetch } = useQuery({
        ...reportQueryOptions,
        enabled: !!session?.user
    })

    const downloadReport = () => {
        if (!reportData) return

        const report = {
            generatedAt: reportData.generatedAt,
            summary: {
                totalUsers: reportData.userStats.length,
                totalSwaps: reportData.swapStats.reduce((sum, stat) => sum + stat._count, 0),
                skillCategories: reportData.skillStats.length
            },
            userStats: reportData.userStats,
            swapStatusBreakdown: reportData.swapStats,
            skillCategoryBreakdown: reportData.skillStats
        }

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `skillswap-report-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        toast.success("Report downloaded successfully!")
    }

    const downloadCSV = () => {
        if (!reportData) return

        const csvData = reportData.userStats.map(user => ({
            name: user.name,
            email: user.email,
            joinDate: new Date(user.createdAt).toLocaleDateString(),
            skillsOffered: user._count.skillsOffered,
            sentSwaps: user._count.sentSwapRequests,
            receivedSwaps: user._count.receivedSwapRequests,
            totalActivity: user._count.sentSwapRequests + user._count.receivedSwapRequests
        }))

        const headers = ['Name', 'Email', 'Join Date', 'Skills Offered', 'Sent Swaps', 'Received Swaps', 'Total Activity']
        const csvContent = [
            headers.join(','),
            ...csvData.map(row => [
                `"${row.name}"`,
                `"${row.email}"`,
                row.joinDate,
                row.skillsOffered,
                row.sentSwaps,
                row.receivedSwaps,
                row.totalActivity
            ].join(','))
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `skillswap-users-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        toast.success("CSV report downloaded successfully!")
    }

    if (isLoading) {
        return (
            <Card className="bg-gray-800/50 border-purple-500/30">
                <CardHeader>
                    <CardTitle className="text-white">Reports & Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="animate-pulse space-y-4">
                        <div className="h-20 bg-gray-700 rounded"></div>
                        <div className="h-40 bg-gray-700 rounded"></div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* Report Generation */}
            <Card className="bg-gray-800/50 border-purple-500/30">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                        <FileText className="h-5 w-5" />
                        Reports & Analytics
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                        Generate and download platform activity reports
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                            <Users className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-white">{reportData?.userStats.length || 0}</p>
                            <p className="text-sm text-gray-400">Total Users</p>
                        </div>
                        <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                            <RefreshCw className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-white">
                                {reportData?.swapStats.reduce((sum, stat) => sum + stat._count, 0) || 0}
                            </p>
                            <p className="text-sm text-gray-400">Total Swaps</p>
                        </div>
                        <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                            <BookOpen className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-white">{reportData?.skillStats.length || 0}</p>
                            <p className="text-sm text-gray-400">Skill Categories</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-400">
                            {reportData && (
                                <>Last generated: {new Date(reportData.generatedAt).toLocaleString()}</>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => refetch()}
                                className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                            >
                                <BarChart3 className="h-4 w-4 mr-2" />
                                Refresh Data
                            </Button>
                            <Button
                                onClick={downloadCSV}
                                disabled={!reportData}
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Download CSV
                            </Button>
                            <Button
                                onClick={downloadReport}
                                disabled={!reportData}
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Download JSON
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Swap Status Breakdown */}
            <Card className="bg-gray-800/50 border-purple-500/30">
                <CardHeader>
                    <CardTitle className="text-white">Swap Status Breakdown</CardTitle>
                    <CardDescription className="text-gray-400">
                        Distribution of swap requests by status
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {reportData?.swapStats.map((stat) => (
                            <div key={stat.status} className="text-center p-3 bg-gray-700/30 rounded-lg">
                                <p className="text-xl font-bold text-white">{stat._count}</p>
                                <Badge variant="outline" className="mt-1 text-xs border-purple-500/50 text-purple-300">
                                    {stat.status}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Skill Categories */}
            <Card className="bg-gray-800/50 border-purple-500/30">
                <CardHeader>
                    <CardTitle className="text-white">Popular Skill Categories</CardTitle>
                    <CardDescription className="text-gray-400">
                        Most common skill categories on the platform
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {reportData?.skillStats
                            .sort((a, b) => b._count - a._count)
                            .slice(0, 6)
                            .map((stat) => (
                                <div key={stat.category} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                                    <span className="text-white">{stat.category}</span>
                                    <Badge variant="outline" className="border-purple-500/50 text-purple-300">
                                        {stat._count}
                                    </Badge>
                                </div>
                            ))}
                    </div>
                </CardContent>
            </Card>

            {/* User Activity Summary */}
            <Card className="bg-gray-800/50 border-purple-500/30">
                <CardHeader>
                    <CardTitle className="text-white">Most Active Users</CardTitle>
                    <CardDescription className="text-gray-400">
                        Users with the highest swap activity
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-gray-600">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-gray-600">
                                    <TableHead className="text-gray-300">User</TableHead>
                                    <TableHead className="text-gray-300">Skills</TableHead>
                                    <TableHead className="text-gray-300">Sent Swaps</TableHead>
                                    <TableHead className="text-gray-300">Received Swaps</TableHead>
                                    <TableHead className="text-gray-300">Join Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reportData?.userStats
                                    .sort((a, b) =>
                                        (b._count.sentSwapRequests + b._count.receivedSwapRequests) -
                                        (a._count.sentSwapRequests + a._count.receivedSwapRequests)
                                    )
                                    .slice(0, 10)
                                    .map((user) => (
                                        <TableRow key={user.id} className="border-gray-600">
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium text-white">{user.name}</p>
                                                    <p className="text-sm text-gray-400">{user.email}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-gray-300">
                                                {user._count.skillsOffered}
                                            </TableCell>
                                            <TableCell className="text-gray-300">
                                                {user._count.sentSwapRequests}
                                            </TableCell>
                                            <TableCell className="text-gray-300">
                                                {user._count.receivedSwapRequests}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm text-gray-400">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
