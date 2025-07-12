"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Edit3, Save, X, UserIcon, MapPin, FileText } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

import { toast } from "sonner"
import { useTRPC } from "@/trpc/client"

interface BasicInfoSectionProps {
    user: {
        id: string
        name: string
        bio?: string | null
        location?: string | null
    }
}

export function BasicInfoSection({ user }: BasicInfoSectionProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({
        name: user.name,
        bio: user.bio || "",
        location: user.location || "",
    })

    const trpc = useTRPC()
    const queryClient = useQueryClient()

    // Create mutation options for updating profile
    const updateProfileMutationOptions = trpc.user.updateProfile.mutationOptions()

    const updateProfileMutation = useMutation({
        ...updateProfileMutationOptions,
        onSuccess: () => {
            const dashboardQueryKey = trpc.user.getDashboardData.queryKey()
            queryClient.invalidateQueries({ queryKey: dashboardQueryKey })
            setIsEditing(false)
            toast.success("Profile updated successfully!")
        },
        onError: () => {
            toast.error("Failed to update profile")
        },
    })

    const handleSave = async () => {
        await updateProfileMutation.mutateAsync(formData)
    }

    const handleCancel = () => {
        setFormData({
            name: user.name,
            bio: user.bio || "",
            location: user.location || "",
        })
        setIsEditing(false)
    }

    return (
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                    <UserIcon className="w-5 h-5" />
                    Basic Information
                </CardTitle>
                {!isEditing && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className="text-white/70 hover:text-white hover:bg-white/10"
                    >
                        <Edit3 className="w-4 h-4" />
                    </Button>
                )}
            </CardHeader>

            <CardContent className="space-y-6">
                {isEditing ? (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-white/80">
                                Full Name
                            </Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-purple-400"
                                placeholder="Enter your full name"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location" className="text-white/80">
                                Location
                            </Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 w-4 h-4 text-white/50" />
                                <Input
                                    id="location"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-purple-400 pl-10"
                                    placeholder="City, Country"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bio" className="text-white/80">
                                Bio
                            </Label>
                            <Textarea
                                id="bio"
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-purple-400 min-h-[100px]"
                                placeholder="Tell us about yourself..."
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button
                                onClick={handleSave}
                                disabled={updateProfileMutation.isPending}
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {updateProfileMutation.isPending ? "Saving..." : "Save"}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleCancel}
                                className="border-white/30 text-white hover:bg-white/10 bg-transparent"
                            >
                                <X className="w-4 h-4 mr-2" />
                                Cancel
                            </Button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-white/60 text-sm">Full Name</Label>
                            <p className="text-white text-lg font-medium">{user.name}</p>
                        </div>

                        {user.location && (
                            <div className="space-y-2">
                                <Label className="text-white/60 text-sm">Location</Label>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-purple-400" />
                                    <p className="text-white">{user.location}</p>
                                </div>
                            </div>
                        )}

                        {user.bio && (
                            <div className="space-y-2">
                                <Label className="text-white/60 text-sm">Bio</Label>
                                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                                    <p className="text-white/80 leading-relaxed">{user.bio}</p>
                                </div>
                            </div>
                        )}

                        {!user.bio && !user.location && (
                            <div className="text-center py-8">
                                <FileText className="w-12 h-12 text-white/30 mx-auto mb-3" />
                                <p className="text-white/50">No additional information yet</p>
                                <p className="text-white/30 text-sm">Click edit to add your bio and location</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </CardContent>
        </Card>
    )
}
