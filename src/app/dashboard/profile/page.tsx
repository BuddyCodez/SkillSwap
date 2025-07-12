"use client"

import { motion } from "framer-motion"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useSession } from "@/lib/auth-client"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ProfileHeader } from "@/components/profile/profile-header"

import { PrivacySection } from "@/components/profile/privacy-section"
import { useTRPC } from "@/trpc/client"
import { BasicInfoSection } from "@/components/profile/basicinfo-section"
import { SkillsSection } from "@/components/profile/skill-section"
import { AvailabilitySection } from "@/components/profile/avalibilty-section"

export default function ProfilePage() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { data: session, isPending: sessionLoading } = useSession()

  // Create query options for dashboard data (includes profile info)
  const dashboardQueryOptions = trpc.user.getDashboardData.queryOptions()

  // Use TanStack Query with tRPC query options
  const dashboardQuery = useQuery({
    ...dashboardQueryOptions,
    enabled: !!session?.user,
  })

  if (sessionLoading || dashboardQuery.isLoading) {
    return (
      <div className="space-y-6">
        <Card className="bg-black/20 backdrop-blur-xl border-purple-500/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Skeleton className="w-24 h-24 rounded-full bg-purple-500/20" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48 bg-purple-500/20" />
                <Skeleton className="h-4 w-64 bg-purple-500/20" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-black/20 backdrop-blur-xl border-purple-500/30">
              <CardContent className="p-6">
                <Skeleton className="h-6 w-32 mb-4 bg-purple-500/20" />
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full bg-purple-500/20" />
                  <Skeleton className="h-4 w-3/4 bg-purple-500/20" />
                  <Skeleton className="h-4 w-1/2 bg-purple-500/20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!session?.user || !dashboardQuery.data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="bg-black/20 backdrop-blur-xl border-purple-500/30">
          <CardContent className="p-8 text-center">
            <p className="text-white">Please sign in to view your profile.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const user = dashboardQuery.data.user

  // Ensure user has required fields
  if (!user?.id || !user?.name || user.profilePublic === undefined || !user.availability || !user.skillsOffered || !user.skillsWanted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="bg-black/20 backdrop-blur-xl border-purple-500/30">
          <CardContent className="p-8 text-center">
            <p className="text-white">Profile data is incomplete. Please refresh the page.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <ProfileHeader user={user as any} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <BasicInfoSection user={user as any} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <PrivacySection user={user as any} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <SkillsSection user={user as any} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <AvailabilitySection user={user as any} />
        </motion.div>
      </div>
    </div>
  )
}
