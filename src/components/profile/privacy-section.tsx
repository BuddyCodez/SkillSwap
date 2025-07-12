"use client"

import { motion } from "framer-motion"
import { Shield, Eye, EyeOff, Globe, Lock } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useTRPC } from "@/trpc/client"

interface User {
    profilePublic: boolean
}

interface PrivacySectionProps {
    user: User
}

export function PrivacySection({ user }: PrivacySectionProps) {
    const trpc = useTRPC()
    const queryClient = useQueryClient()

    // Create mutation options for updating profile
    const updateProfileMutationOptions = trpc.user.updateProfile.mutationOptions()

    const updateProfileMutation = useMutation({
        ...updateProfileMutationOptions,
        onSuccess: () => {
            const dashboardQueryKey = trpc.user.getDashboardData.queryKey()
            queryClient.invalidateQueries({ queryKey: dashboardQueryKey })
            toast.success("Privacy settings updated!")
        },
        onError: () => {
            toast.error("Failed to update privacy settings")
        },
    })

    const handleToggleVisibility = async (profilePublic: boolean) => {
        await updateProfileMutation.mutateAsync({ profilePublic })
    }

    return (
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl">
            <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Privacy Settings
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    {/* Profile Visibility */}
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-center gap-3">
                            {user.profilePublic ? (
                                <div className="p-2 bg-green-500/20 rounded-lg">
                                    <Globe className="w-5 h-5 text-green-400" />
                                </div>
                            ) : (
                                <div className="p-2 bg-gray-500/20 rounded-lg">
                                    <Lock className="w-5 h-5 text-gray-400" />
                                </div>
                            )}

                            <div>
                                <Label className="text-white font-medium">Profile Visibility</Label>
                                <p className="text-white/60 text-sm">
                                    {user.profilePublic ? "Your profile is visible to everyone" : "Your profile is only visible to you"}
                                </p>
                            </div>
                        </div>

                        <Switch
                            checked={user.profilePublic}
                            onCheckedChange={handleToggleVisibility}
                            disabled={updateProfileMutation.isPending}
                            className="data-[state=checked]:bg-purple-600"
                        />
                    </div>

                    {/* Privacy Information */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-3"
                    >
                        <h4 className="text-white font-medium flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            What others can see:
                        </h4>

                        <div className="space-y-2 text-sm">
                            {user.profilePublic ? (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-green-300">
                                        <div className="w-2 h-2 bg-green-400 rounded-full" />
                                        <span>Your name and profile picture</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-green-300">
                                        <div className="w-2 h-2 bg-green-400 rounded-full" />
                                        <span>Your bio and location</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-green-300">
                                        <div className="w-2 h-2 bg-green-400 rounded-full" />
                                        <span>Skills you offer and want to learn</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-green-300">
                                        <div className="w-2 h-2 bg-green-400 rounded-full" />
                                        <span>Your availability for skill swaps</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-green-300">
                                        <div className="w-2 h-2 bg-green-400 rounded-full" />
                                        <span>Your ratings and reviews</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <EyeOff className="w-4 h-4" />
                                        <span>Your profile is completely private</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <div className="w-2 h-2 bg-gray-500 rounded-full" />
                                        <span>Others cannot find or view your profile</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <div className="w-2 h-2 bg-gray-500 rounded-full" />
                                        <span>You won't appear in skill recommendations</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Privacy Note */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg"
                    >
                        <div className="flex items-start gap-3">
                            <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
                            <div>
                                <h5 className="text-blue-300 font-medium mb-1">Privacy Note</h5>
                                <p className="text-blue-200/80 text-sm leading-relaxed">
                                    Even with a public profile, your email address and personal contact information remain private. Only
                                    you can decide who to share additional contact details with during skill swaps.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </CardContent>
        </Card>
    )
}
