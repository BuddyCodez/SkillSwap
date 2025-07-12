"use client"

import { Star, Edit3 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Review {
    id: string
    rating: number
    feedback?: string | null
    createdAt: string
    fromUser: {
        id: string
        name: string
        image?: string | null
    }
    toUser: {
        id: string
        name: string
        image?: string | null
    }
    swap?: {
        id: string
        skillOffered: { name: string }
        skillWanted: { name: string }
    } | null
}

interface ReviewCardProps {
    review: Review
    type: "given" | "received"
    currentUserId: string
    onEdit: (review: Review) => void
}

export function ReviewCard({ review, type, currentUserId, onEdit }: ReviewCardProps) {
    const isGivenReview = type === "given"
    const targetUser = isGivenReview ? review.toUser : review.fromUser

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    return (
        <Card className="bg-gray-800/30 border-purple-500/30">
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Avatar className="border-2 border-purple-500/30">
                            <AvatarImage src={targetUser?.image || ""} />
                            <AvatarFallback className="bg-purple-600 text-white">{targetUser?.name?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-medium text-white">
                                {isGivenReview ? "Reviewed" : "Review from"} {targetUser?.name}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                        key={i}
                                        className={cn("w-4 h-4", i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-500")}
                                    />
                                ))}
                                <span className="text-sm text-yellow-300 ml-1">{review.rating.toFixed(1)}</span>
                            </div>
                            <p className="text-xs text-purple-400 mt-1">
                                {formatDate(review.createdAt)} for swap:{" "}
                                <Badge variant="outline" className="border-purple-500/30 text-purple-200">
                                    {review.swap?.skillOffered?.name || "Unknown"} ↔ {review.swap?.skillWanted?.name || "Unknown"}
                                </Badge>
                            </p>
                        </div>
                    </div>

                    {isGivenReview && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(review)}
                            className="text-purple-300 hover:text-white hover:bg-purple-600/20"
                        >
                            <Edit3 className="w-4 h-4 mr-1" />
                            Edit
                        </Button>
                    )}
                </div>

                {review.feedback && (
                    <div className="mt-4 p-3 bg-gray-700/50 rounded-lg border border-purple-500/20">
                        <p className="text-sm text-white/80 leading-relaxed">"{review.feedback}"</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
