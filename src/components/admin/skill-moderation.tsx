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
import { Search, Trash2, User, Calendar } from "lucide-react"
import { toast } from "sonner"

export function SkillModeration() {
    const [searchTerm, setSearchTerm] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 10

    const { data: session } = useSession()
    const trpc = useTRPC()
    const queryClient = useQueryClient()

    const skillsQueryOptions = trpc.admin.getSkills.queryOptions({
        page: currentPage,
        limit: pageSize,
        search: searchTerm || undefined
    })

    const { data: skillsData, isLoading } = useQuery({
        ...skillsQueryOptions,
        enabled: !!session?.user
    })

    const deleteSkillMutationOptions = trpc.admin.deleteSkill.mutationOptions()
    const deleteSkillMutation = useMutation({
        ...deleteSkillMutationOptions,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "getSkills"] })
            toast.success("Skill deleted successfully")
        },
        onError: (error) => {
            toast.error("Failed to delete skill")
            console.error(error)
        }
    })

    const handleSearch = () => {
        setCurrentPage(1)
        queryClient.invalidateQueries({ queryKey: ["admin", "getSkills"] })
    }

    const handleDeleteSkill = (skillId: string) => {
        deleteSkillMutation.mutate({ skillId })
    }

    if (isLoading) {
        return (
            <Card className="bg-gray-800/50 border-purple-500/30">
                <CardHeader>
                    <CardTitle className="text-white">Skill Moderation</CardTitle>
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
                <CardTitle className="text-white">Skill Moderation</CardTitle>
                <CardDescription className="text-gray-400">
                    Review and moderate user-submitted skills, remove inappropriate content
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Search */}
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Search skills by name or description..."
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

                {/* Skills Table */}
                <div className="rounded-md border border-gray-600">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-gray-600">
                                <TableHead className="text-gray-300">Skill</TableHead>
                                <TableHead className="text-gray-300">Category</TableHead>
                                <TableHead className="text-gray-300">Owner</TableHead>
                                <TableHead className="text-gray-300">Created</TableHead>
                                <TableHead className="text-gray-300">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {skillsData?.skills.map((skill) => (
                                <TableRow key={skill.id} className="border-gray-600">
                                    <TableCell>
                                        <div className="space-y-1">
                                            <p className="font-medium text-white">{skill.name}</p>
                                            <p className="text-sm text-gray-400 max-w-md truncate">
                                                {skill.description || "No description"}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="border-purple-500/50 text-purple-300">
                                            {skill.category}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <User className="h-3 w-3" />
                                            <span className="text-sm">User ID: {skill.userId}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1 text-sm text-gray-400">
                                            <Calendar className="h-3 w-3" />
                                            Recently added
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    className="bg-red-600 hover:bg-red-700"
                                                    disabled={deleteSkillMutation.isPending}
                                                >
                                                    <Trash2 className="h-3 w-3 mr-1" />
                                                    Delete
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="bg-gray-800 border-gray-600">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle className="text-white">
                                                        Delete Skill
                                                    </AlertDialogTitle>
                                                    <AlertDialogDescription className="text-gray-400">
                                                        Are you sure you want to delete "{skill.name}"? This action cannot be undone and will remove the skill from the user's profile.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel className="bg-gray-700 text-white border-gray-600">
                                                        Cancel
                                                    </AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleDeleteSkill(skill.id)}
                                                        className="bg-red-600 hover:bg-red-700"
                                                    >
                                                        Delete Skill
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-400">
                        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, skillsData?.total || 0)} of {skillsData?.total || 0} skills
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
                            disabled={currentPage >= (skillsData?.pages || 1)}
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
