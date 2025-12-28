"use client"

import { motion } from "framer-motion"
import { Edit, Star, Users, Trophy } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserAvatar } from "@/components/ui/user-avatar"
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
      <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border-purple-500/20 shadow-xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5" />
        <CardContent className="p-6 relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-5">
              <UserAvatar
                user={user}
                className="w-20 h-20 border-2 border-purple-500/50 shadow-lg shadow-purple-500/20"
                fallbackClassName="text-2xl bg-gradient-to-br from-purple-600 to-blue-600"
              />

              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">{user.name}</h2>
                <p className="text-purple-200/80 font-medium">{user.email}</p>
                {user.bio && <p className="text-sm text-gray-300 mt-2 max-w-md leading-relaxed">{user.bio}</p>}
                {user.location && (
                  <Badge variant="secondary" className="mt-3 bg-purple-500/10 text-purple-300 border-purple-500/20 hover:bg-purple-500/20 transition-colors">
                    <span className="mr-1">📍</span> {user.location}
                  </Badge>
                )}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="border-purple-500/30 text-purple-100 hover:text-white hover:bg-purple-500/20 bg-purple-500/5 backdrop-blur-sm transition-all duration-300"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-6 border-t border-white/5">
            <div className="text-center group hover:bg-white/5 p-3 rounded-xl transition-colors duration-300">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-500/10 rounded-xl mx-auto mb-3 group-hover:scale-110 transition-transform duration-300 border border-purple-500/20">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stats.skillsOffered}</div>
              <div className="text-xs font-medium text-purple-200/70 uppercase tracking-wider">Skills Offered</div>
            </div>

            <div className="text-center group hover:bg-white/5 p-3 rounded-xl transition-colors duration-300">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-500/10 rounded-xl mx-auto mb-3 group-hover:scale-110 transition-transform duration-300 border border-blue-500/20">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stats.skillsWanted}</div>
              <div className="text-xs font-medium text-blue-200/70 uppercase tracking-wider">Skills Wanted</div>
            </div>

            <div className="text-center group hover:bg-white/5 p-3 rounded-xl transition-colors duration-300">
              <div className="flex items-center justify-center w-12 h-12 bg-indigo-500/10 rounded-xl mx-auto mb-3 group-hover:scale-110 transition-transform duration-300 border border-indigo-500/20">
                <Trophy className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stats.successfulSwaps}</div>
              <div className="text-xs font-medium text-indigo-200/70 uppercase tracking-wider">Successful Swaps</div>
            </div>

            <div className="text-center group hover:bg-white/5 p-3 rounded-xl transition-colors duration-300">
              <div className="flex items-center justify-center w-12 h-12 bg-yellow-500/10 rounded-xl mx-auto mb-3 group-hover:scale-110 transition-transform duration-300 border border-yellow-500/20">
                <Star className="w-6 h-6 text-yellow-400 fill-yellow-400/20" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stats.averageRating.toFixed(1)}</div>
              <div className="text-xs font-medium text-yellow-200/70 uppercase tracking-wider">Average Rating</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
