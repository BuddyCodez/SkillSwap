"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Camera, Edit3, MapPin, Mail, Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface User {
    id: string
    name: string
    email: string
    image?: string | null
    bio?: string | null
    location?: string | null
    profilePublic: boolean
    createdAt: string
}

interface ProfileHeaderProps {
    user: User
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
    const [isHovered, setIsHovered] = useState(false)

    return (
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-start gap-6">
                    {/* Avatar Section */}
                    <motion.div
                        className="relative"
                        onHoverStart={() => setIsHovered(true)}
                        onHoverEnd={() => setIsHovered(false)}
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <Avatar className="w-32 h-32 border-4 border-white/30 shadow-xl">
                            <AvatarImage src={user.image || ""} className="object-cover" />
                            <AvatarFallback className="text-2xl bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                                {user.name?.charAt(0) || "U"}
                            </AvatarFallback>
                        </Avatar>

                        <motion.div
                            className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center cursor-pointer"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: isHovered ? 1 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Camera className="w-8 h-8 text-white" />
                        </motion.div>

                        {/* Online indicator */}
                        <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-lg">
                            <motion.div
                                className="w-full h-full bg-green-400 rounded-full"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                            />
                        </div>
                    </motion.div>

                    {/* User Info */}
                    <div className="flex-1 space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <motion.h1
                                    className="text-3xl font-bold text-white mb-2"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    {user.name}
                                </motion.h1>

                                <div className="flex items-center gap-4 text-white/70 mb-3">
                                    <div className="flex items-center gap-1">
                                        <Mail className="w-4 h-4" />
                                        <span className="text-sm">{user.email}</span>
                                    </div>

                                    {user.location && (
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            <span className="text-sm">{user.location}</span>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-sm">Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant={user.profilePublic ? "default" : "secondary"}
                                        className={
                                            user.profilePublic
                                                ? "bg-green-500/20 text-green-300 border-green-500/30"
                                                : "bg-gray-500/20 text-gray-300 border-gray-500/30"
                                        }
                                    >
                                        {user.profilePublic ? "Public Profile" : "Private Profile"}
                                    </Badge>
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
                            >
                                <Edit3 className="w-4 h-4 mr-2" />
                                Edit Profile
                            </Button>
                        </div>

                        {user.bio && (
                            <motion.div
                                className="bg-white/5 rounded-lg p-4 border border-white/10"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <p className="text-white/80 leading-relaxed">{user.bio}</p>
                            </motion.div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
