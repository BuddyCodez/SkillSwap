"use client"

import { motion } from "framer-motion"
import { MapPin, Star, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserAvatar } from "@/components/ui/user-avatar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface User {
    id?: string
    name?: string | null
    image?: string | null
    location?: string | null
    skillsOffered?: Array<{
        id?: string
        name?: string
        category?: string
    }>
    skillsWanted?: Array<{
        id?: string
        name?: string
        category?: string
    }>
    averageRating?: number
}

interface SkillRecommendationsProps {
    recommendations: User[]
}

export function SkillRecommendations({ recommendations }: SkillRecommendationsProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <Card className="bg-gray-900/40 backdrop-blur-xl border-white/10 shadow-xl h-full">
                <CardHeader className="border-b border-white/5 pb-4">
                    <CardTitle className="flex items-center justify-between text-xl font-bold text-white">
                        <div className="flex items-center gap-2">
                            <Star className="w-5 h-5 text-yellow-400" />
                            Skills Near You
                        </div>
                        <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                            {recommendations.length} matches
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    {recommendations.length === 0 ? (
                        <div className="text-center py-12 bg-white/5 rounded-xl border border-white/5 border-dashed">
                            <MapPin className="w-12 h-12 text-gray-600 mx-auto mb-3 opacity-50" />
                            <p className="text-gray-400 font-medium">No skill matches found</p>
                            <p className="text-sm text-gray-500 mt-1">Try adding more skills to your profile!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recommendations.map((user, index) => (
                                <motion.div
                                    key={user.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="border border-white/10 rounded-xl p-4 bg-white/5 hover:bg-white/10 transition-all hover:scale-[1.02] hover:shadow-lg cursor-pointer group"
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4 flex-1">
                                            <UserAvatar
                                                user={user}
                                                className="w-14 h-14 border-2 border-purple-500/30 group-hover:border-purple-500/60 transition-colors"
                                                fallbackClassName="bg-gradient-to-br from-blue-600 to-purple-600"
                                            />

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-bold text-white text-lg truncate">{user.name || "Unknown User"}</h4>
                                                    {(user.averageRating || 0) > 0 && (
                                                        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-yellow-500/10 rounded-full border border-yellow-500/20">
                                                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                            <span className="text-xs font-bold text-yellow-500">{(user.averageRating || 0).toFixed(1)}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {user.location && (
                                                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
                                                        <MapPin className="w-3 h-3" />
                                                        {user.location}
                                                    </div>
                                                )}

                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <span className="text-gray-500 text-xs uppercase font-semibold w-12">Offers</span>
                                                        <div className="flex gap-1 flex-wrap">
                                                            {(user.skillsOffered || []).slice(0, 3).map((skill, index) => (
                                                                <Badge key={skill.id || index} variant="secondary" className="text-xs bg-purple-500/10 text-purple-300 border-purple-500/20">
                                                                    {skill.name}
                                                                </Badge>
                                                            ))}
                                                            {(user.skillsOffered || []).length > 3 && (
                                                                <Badge variant="secondary" className="text-xs bg-gray-800 text-gray-400">
                                                                    +{(user.skillsOffered || []).length - 3}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-sm">
                                                        <span className="text-gray-500 text-xs uppercase font-semibold w-12">Wants</span>
                                                        <div className="flex gap-1 flex-wrap">
                                                            {(user.skillsWanted || []).slice(0, 3).map((skill, index) => (
                                                                <Badge key={skill.id || index} variant="outline" className="text-xs border-white/20 text-gray-300">
                                                                    {skill.name}
                                                                </Badge>
                                                            ))}
                                                            {(user.skillsWanted || []).length > 3 && (
                                                                <Badge variant="outline" className="text-xs border-white/10 text-gray-500">
                                                                    +{(user.skillsWanted || []).length - 3}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <Button size="icon" className="h-10 w-10 rounded-full bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-600/20 shrink-0">
                                            <ArrowRight className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}
