"use client"

import { useState } from "react"
import { useTRPC } from "@/trpc/client"
import { useQuery } from "@tanstack/react-query"
import { useSession } from "@/lib/auth-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RefreshCw, User, Calendar, ArrowRight } from "lucide-react"

type SwapStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED" | "COMPLETED"

const statusColors = {
    PENDING: "bg-yellow-600",
    ACCEPTED: "bg-green-600",
    REJECTED: "bg-red-600",
    CANCELLED: "bg-gray-600",
    COMPLETED: "bg-blue-600"
}

export function SwapMonitoring() {
    const [selectedStatus, setSelectedStatus] = useState<SwapStatus | "ALL">("ALL")
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 10

    const { data: session } = useSession()
    const trpc = useTRPC()

    const swapsQueryOptions = trpc.admin.getSwapRequests.queryOptions({
        page: currentPage,
        limit: pageSize,
        status: selectedStatus === "ALL" ? undefined : selectedStatus
    })

    const { data: swapsData, isLoading } = useQuery({
        ...swapsQueryOptions,
        enabled: !!session?.user
    })

    const handleStatusFilter = (status: string) => {
        setSelectedStatus(status as SwapStatus | "ALL")
        setCurrentPage(1)
    }

    if (isLoading) {
        return (
            <Card className="bg-gray-800/50 border-purple-500/30">
                <CardHeader>
                    <CardTitle className="text-white">Swap Monitoring</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="animate-pulse space-y-4">
                        <div className="h-10 bg-gray-700 rounded"></div>
                        <div className="space-y-3">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="h-20 bg-gray-700 rounded"></div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="bg-gray-800/50 border-purple-500/30">
            <CardHeader>
                <CardTitle className="text-white">Swap Monitoring</CardTitle>
                <CardDescription className="text-gray-400">
                    Monitor all swap requests across the platform
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Status Filter */}
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-300">Filter by status:</span>
                    <Select value={selectedStatus} onValueChange={handleStatusFilter}>
                        <SelectTrigger className="w-48 bg-gray-700/50 border-gray-600 text-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                            <SelectItem value="ALL" className="text-white">All Statuses</SelectItem>
                            <SelectItem value="PENDING" className="text-white">Pending</SelectItem>
                            <SelectItem value="ACCEPTED" className="text-white">Accepted</SelectItem>
                            <SelectItem value="REJECTED" className="text-white">Rejected</SelectItem>
                            <SelectItem value="CANCELLED" className="text-white">Cancelled</SelectItem>
                            <SelectItem value="COMPLETED" className="text-white">Completed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Swaps Table */}
                <div className="rounded-md border border-gray-600">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-gray-600">
                                <TableHead className="text-gray-300">Participants</TableHead>
                                <TableHead className="text-gray-300">Skills Exchange</TableHead>
                                <TableHead className="text-gray-300">Status</TableHead>
                                <TableHead className="text-gray-300">Created</TableHead>
                                <TableHead className="text-gray-300">Ratings</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {swapsData?.swaps.map((swap) => (
                                <TableRow key={swap.id} className="border-gray-600">
                                    <TableCell>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <User className="h-3 w-3 text-gray-400" />
                                                <span className="text-sm text-white">{swap.fromUser.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <ArrowRight className="h-3 w-3 text-purple-400" />
                                                <span className="text-sm text-white">{swap.toUser.name}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-2">
                                            <div className="text-sm">
                                                <span className="text-gray-400">Offering:</span>{" "}
                                                <span className="text-white">{swap.skillOffered.name}</span>
                                                <Badge variant="outline" className="ml-2 text-xs border-purple-500/50 text-purple-300">
                                                    {swap.skillOffered.category}
                                                </Badge>
                                            </div>
                                            <div className="text-sm">
                                                <span className="text-gray-400">Wanting:</span>{" "}
                                                <span className="text-white">{swap.skillWanted.name}</span>
                                                <Badge variant="outline" className="ml-2 text-xs border-purple-500/50 text-purple-300">
                                                    {swap.skillWanted.category}
                                                </Badge>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            className={`${statusColors[swap.status]} text-white`}
                                        >
                                            {swap.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1 text-sm text-gray-400">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(swap.createdAt).toLocaleDateString()}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm text-gray-300">
                                            {swap.ratings.length > 0 ? (
                                                `${swap.ratings.length} rating${swap.ratings.length > 1 ? 's' : ''}`
                                            ) : (
                                                "No ratings"
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-400">
                        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, swapsData?.total || 0)} of {swapsData?.total || 0} swaps
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            disabled={currentPage >= (swapsData?.pages || 1)}
                            className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
