"use client"

import { motion } from "framer-motion"
import { Edit, Star, Users, Trophy } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface ProfileSummaryProps {
  user: {
    name: string
    email: string
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
      <Card className="bg-black/20 backdrop-blur-xl border-purple-500/30">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 border-2 border-purple-500/50">
                <AvatarImage src={user.image || ""} />
                <AvatarFallback className="text-lg bg-purple-600 text-white">
                  {user.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>

              <div>
                <h2 className="text-xl font-semibold text-white">{user.name}</h2>
                <p className="text-purple-200">{user.email}</p>
                {user.bio && <p className="text-sm text-purple-300 mt-1 max-w-md">{user.bio}</p>}
                {user.location && (
                  <Badge variant="secondary" className="mt-2 bg-purple-500/20 text-purple-300 border-purple-500/30">
                    📍 {user.location}
                  </Badge>
                )}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="border-purple-500/30 text-white hover:bg-purple-600/20 bg-transparent"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-purple-500/30">
            <div className="text-center">
              <div className="flex items-center justify-center w-10 h-10 bg-purple-500/20 rounded-lg mx-auto mb-2">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-purple-300">{stats.skillsOffered}</div>
              <div className="text-sm text-purple-200">Skills Offered</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-500/20 rounded-lg mx-auto mb-2">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-blue-300">{stats.skillsWanted}</div>
              <div className="text-sm text-blue-200">Skills Wanted</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-10 h-10 bg-indigo-500/20 rounded-lg mx-auto mb-2">
                <Trophy className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="text-2xl font-bold text-indigo-300">{stats.successfulSwaps}</div>
              <div className="text-sm text-indigo-200">Successful Swaps</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-10 h-10 bg-yellow-500/20 rounded-lg mx-auto mb-2">
                <Star className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="text-2xl font-bold text-yellow-300">{stats.averageRating.toFixed(1)}</div>
              <div className="text-sm text-yellow-200">Average Rating</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
