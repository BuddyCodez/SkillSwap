"use client"

import { motion } from "framer-motion"
import { MapPin, Star, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        Skills Near You
                        <Badge variant="secondary">{recommendations.length} matches</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {recommendations.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">
                            No skill matches found. Try adding more skills to your profile!
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {recommendations.map((user, index) => (
                                <motion.div
                                    key={user.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={user.image || ""} />
                                                <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                                            </Avatar>

                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-medium">{user.name || "Unknown User"}</h4>
                                                    {(user.averageRating || 0) > 0 && (
                                                        <div className="flex items-center gap-1">
                                                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                            <span className="text-sm text-gray-600">{(user.averageRating || 0).toFixed(1)}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {user.location && (
                                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                                        <MapPin className="w-3 h-3" />
                                                        {user.location}
                                                    </div>
                                                )}

                                                <div className="mt-2 space-y-1">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <span className="text-gray-600">Offers:</span>
                                                        <div className="flex gap-1 flex-wrap">
                                                            {(user.skillsOffered || []).slice(0, 3).map((skill, index) => (
                                                                <Badge key={skill.id || index} variant="secondary" className="text-xs">
                                                                    {skill.name}
                                                                </Badge>
                                                            ))}
                                                            {(user.skillsOffered || []).length > 3 && (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    +{(user.skillsOffered || []).length - 3} more
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-sm">
                                                        <span className="text-gray-600">Wants:</span>
                                                        <div className="flex gap-1 flex-wrap">
                                                            {(user.skillsWanted || []).slice(0, 3).map((skill, index) => (
                                                                <Badge key={skill.id || index} variant="outline" className="text-xs">
                                                                    {skill.name}
                                                                </Badge>
                                                            ))}
                                                            {(user.skillsWanted || []).length > 3 && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    +{(user.skillsWanted || []).length - 3} more
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <Button size="sm">
                                            Request Swap
                                            <ArrowRight className="w-4 h-4 ml-1" />
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
