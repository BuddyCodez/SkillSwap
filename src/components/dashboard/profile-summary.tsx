"use client"

import { motion } from "framer-motion"
import { Edit, Star, Users, Trophy } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface ProfileSummaryProps {
    user: {
        name?: string | null
        email?: string | null
        image?: string | null
        bio?: string | null
        location?: string | null
    }
    stats: {
        skillsOffered: number
        skillsWanted: number
        successfulSwaps: number
        averageRating: number
    }
}

export function ProfileSummary({ user, stats }: ProfileSummaryProps) {
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <Avatar className="w-16 h-16">
                                <AvatarImage src={user.image || ""} />
                                <AvatarFallback className="text-lg">{user.name?.charAt(0) || "U"}</AvatarFallback>
                            </Avatar>

                            <div>
                                <h2 className="text-xl font-semibold">{user.name || "Unknown User"}</h2>
                                <p className="text-gray-600">{user.email || ""}</p>
                                {user.bio && <p className="text-sm text-gray-500 mt-1 max-w-md">{user.bio}</p>}
                                {user.location && (
                                    <Badge variant="secondary" className="mt-2">
                                        📍 {user.location}
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Profile
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
                        <div className="text-center">
                            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg mx-auto mb-2">
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="text-2xl font-bold text-blue-600">{stats.skillsOffered}</div>
                            <div className="text-sm text-gray-600">Skills Offered</div>
                        </div>

                        <div className="text-center">
                            <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg mx-auto mb-2">
                                <Users className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="text-2xl font-bold text-green-600">{stats.skillsWanted}</div>
                            <div className="text-sm text-gray-600">Skills Wanted</div>
                        </div>

                        <div className="text-center">
                            <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg mx-auto mb-2">
                                <Trophy className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="text-2xl font-bold text-purple-600">{stats.successfulSwaps}</div>
                            <div className="text-sm text-gray-600">Successful Swaps</div>
                        </div>

                        <div className="text-center">
                            <div className="flex items-center justify-center w-10 h-10 bg-yellow-100 rounded-lg mx-auto mb-2">
                                <Star className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div className="text-2xl font-bold text-yellow-600">{stats.averageRating.toFixed(1)}</div>
                            <div className="text-sm text-gray-600">Average Rating</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
