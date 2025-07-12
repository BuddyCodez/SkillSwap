"use client"

import { motion } from "framer-motion"
import { Star } from "lucide-react"
import { ReviewCard } from "./review-card"

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

interface ReviewListProps {
    reviews: Review[]
    type: "given" | "received"
    currentUserId: string
    onEditReview: (review: Review) => void
}

export function ReviewList({ reviews, type, currentUserId, onEditReview }: ReviewListProps) {
    const EmptyState = () => (
        <div className="text-center py-8 text-purple-300">
            <Star className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{type === "given" ? "You haven't given any reviews yet." : "You haven't received any reviews yet."}</p>
            <p className="text-purple-400 text-sm mt-1">
                {type === "given" ? "Complete a swap to leave feedback!" : "Complete a swap to receive feedback!"}
            </p>
        </div>
    )

    return (
        <div className="space-y-4">
            {reviews.length === 0 ? (
                <EmptyState />
            ) : (
                reviews.map((review, index) => (
                    <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <ReviewCard review={review} type={type} currentUserId={currentUserId} onEdit={onEditReview} />
                    </motion.div>
                ))
            )}
        </div>
    )
}
