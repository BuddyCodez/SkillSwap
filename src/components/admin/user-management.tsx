"use client"

import { useState } from "react"
import { useTRPC } from "@/trpc/client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSession } from "@/lib/auth-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Search, UserX, UserCheck, Mail, Calendar, Star } from "lucide-react"
import { toast } from "sonner"

export function UserManagement() {
    const [searchTerm, setSearchTerm] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 10

    const { data: session } = useSession()
    const trpc = useTRPC()
    const queryClient = useQueryClient()

    const usersQueryOptions = trpc.admin.getUsers.queryOptions({
        page: currentPage,
        limit: pageSize,
        search: searchTerm || undefined
    })

    const { data: usersData, isLoading } = useQuery({
        ...usersQueryOptions,
        enabled: !!session?.user
    })

    const toggleUserBanMutationOptions = trpc.admin.toggleUserBan.mutationOptions()
    const toggleUserBanMutation = useMutation({
        ...toggleUserBanMutationOptions,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["admin", "getUsers"] })
            if (variables && 'banned' in variables) {
                toast.success(variables.banned ? "User banned successfully" : "User unbanned successfully")
            } else {
                toast.success("User status updated successfully")
            }
        },
        onError: (error) => {
            toast.error("Failed to update user status")
            console.error(error)
        }
    })

    const handleSearch = () => {
        setCurrentPage(1)
        queryClient.invalidateQueries({ queryKey: ["admin", "getUsers"] })
    }

    const handleBanUser = (userId: string, currentlyBanned: boolean) => {
        toggleUserBanMutation.mutate({ userId, banned: !currentlyBanned })
    }

    if (isLoading) {
        return (
            <Card className="bg-gray-800/50 border-purple-500/30">
                <CardHeader>
                    <CardTitle className="text-white">User Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="animate-pulse space-y-4">
                        <div className="h-10 bg-gray-700 rounded"></div>
                        <div className="space-y-3">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="h-16 bg-gray-700 rounded"></div>
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
                <CardTitle className="text-white">User Management</CardTitle>
                <CardDescription className="text-gray-400">
                    Manage users, ban inappropriate accounts, and monitor user activity
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Search */}
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Search users by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-gray-700/50 border-gray-600 text-white"
                            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                        />
                    </div>
                    <Button onClick={handleSearch} className="bg-purple-600 hover:bg-purple-700 text-white">
                        Search
                    </Button>
                </div>

                {/* Users Table */}
                <div className="rounded-md border border-gray-600">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-gray-600">
                                <TableHead className="text-gray-300">User</TableHead>
                                <TableHead className="text-gray-300">Role</TableHead>
                                <TableHead className="text-gray-300">Skills</TableHead>
                                <TableHead className="text-gray-300">Swaps</TableHead>
                                <TableHead className="text-gray-300">Rating</TableHead>
                                <TableHead className="text-gray-300">Joined</TableHead>
                                <TableHead className="text-gray-300">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {usersData?.users.map((user) => {
                                const isBanned = user.bio === "BANNED_USER"

                                return (
                                    <TableRow key={user.id} className="border-gray-600">
                                        <TableCell>
                                            <div className="space-y-1">
                                                <p className="font-medium text-white">{user.name}</p>
                                                <div className="flex items-center gap-1 text-sm text-gray-400">
                                                    <Mail className="h-3 w-3" />
                                                    {user.email}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-gray-300">
                                            {user.skillsOffered.length} skills
                                        </TableCell>
                                        <TableCell className="text-gray-300">
                                            {user.totalSwaps} swaps
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 text-gray-300">
                                                <Star className="h-3 w-3 text-yellow-400" />
                                                {user.averageRating > 0 ? user.averageRating.toFixed(1) : "N/A"}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 text-sm text-gray-400">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {user.role !== "ADMIN" && (
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant={isBanned ? "outline" : "destructive"}
                                                            size="sm"
                                                            className={isBanned ?
                                                                "border-green-600 text-green-400 hover:bg-green-600/10" :
                                                                "bg-red-600 hover:bg-red-700"
                                                            }
                                                            disabled={toggleUserBanMutation.isPending}
                                                        >
                                                            {isBanned ? (
                                                                <>
                                                                    <UserCheck className="h-3 w-3 mr-1" />
                                                                    Unban
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <UserX className="h-3 w-3 mr-1" />
                                                                    Ban
                                                                </>
                                                            )}
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent className="bg-gray-800 border-gray-600">
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle className="text-white">
                                                                {isBanned ? "Unban User" : "Ban User"}
                                                            </AlertDialogTitle>
                                                            <AlertDialogDescription className="text-gray-400">
                                                                {isBanned
                                                                    ? `Are you sure you want to unban ${user.name}? They will regain access to the platform.`
                                                                    : `Are you sure you want to ban ${user.name}? This will restrict their access to the platform.`
                                                                }
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel className="bg-gray-700 text-white border-gray-600">
                                                                Cancel
                                                            </AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleBanUser(user.id, isBanned)}
                                                                className={isBanned ?
                                                                    "bg-green-600 hover:bg-green-700" :
                                                                    "bg-red-600 hover:bg-red-700"
                                                                }
                                                            >
                                                                {isBanned ? "Unban User" : "Ban User"}
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-400">
                        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, usersData?.total || 0)} of {usersData?.total || 0} users
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
                            disabled={currentPage >= (usersData?.pages || 1)}
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
