"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Star, Send, Edit3 } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTRPC } from "@/trpc/client"

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

interface EditReviewModalProps {
    review: Review
    onClose: () => void
    onSubmit: () => void
}

export function EditReviewModal({ review, onClose, onSubmit }: EditReviewModalProps) {
    const [rating, setRating] = useState(review.rating)
    const [hoveredRating, setHoveredRating] = useState(0)
    const [feedback, setFeedback] = useState(review.feedback || "")

    const trpc = useTRPC()
    const queryClient = useQueryClient()

    const updateRatingMutationOptions = trpc.user.updateRating.mutationOptions()

    const updateRatingMutation = useMutation({
        ...updateRatingMutationOptions,
        onSuccess: () => {
            toast.success("Review updated successfully!")
            onSubmit()
        },
        onError: () => {
            toast.error("Failed to update review")
        },
    })

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error("Please select a rating")
            return
        }

        await updateRatingMutation.mutateAsync({
            ratingId: review.id,
            rating,
            feedback: feedback.trim() || undefined,
        })
    }

    const targetUser = review.toUser

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="bg-gray-800 border-purple-500/30 max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-white flex items-center gap-2">
                        <Edit3 className="w-5 h-5 text-purple-400" />
                        Edit Review for {targetUser.name}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Swap Info */}
                    <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg border border-purple-500/20">
                        <Avatar className="w-10 h-10 border-2 border-purple-500/30">
                            <AvatarImage src={targetUser.image || ""} />
                            <AvatarFallback className="bg-purple-600 text-white text-sm">
                                {targetUser.name?.charAt(0) || "U"}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm text-white">
                                Swap: <span className="font-medium text-green-300">{review.swap?.skillOffered?.name || "Unknown"}</span>
                                {" ↔ "}
                                <span className="font-medium text-blue-300">{review.swap?.skillWanted?.name || "Unknown"}</span>
                            </p>
                            <p className="text-xs text-purple-400">Reviewed on {new Date(review.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>

                    {/* Star Rating */}
                    <div className="space-y-3">
                        <Label className="text-white">Your rating:</Label>
                        <div className="flex justify-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <motion.button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-1"
                                >
                                    <Star
                                        className={`w-8 h-8 transition-colors ${star <= (hoveredRating || rating)
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-gray-400 hover:text-yellow-300"
                                            }`}
                                    />
                                </motion.button>
                            ))}
                        </div>
                        {rating > 0 && (
                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-purple-300">
                                {rating === 1 && "Poor experience"}
                                {rating === 2 && "Below average"}
                                {rating === 3 && "Average experience"}
                                {rating === 4 && "Good experience"}
                                {rating === 5 && "Excellent experience!"}
                            </motion.p>
                        )}
                    </div>

                    {/* Feedback */}
                    <div className="space-y-3">
                        <Label className="text-white">Feedback (optional)</Label>
                        <Textarea
                            placeholder="Share your thoughts about the skill swap..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            className="bg-gray-800/50 border-purple-500/30 text-white placeholder:text-purple-300 min-h-[100px]"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="border-purple-500/30 text-white hover:bg-purple-600/20 bg-transparent"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={rating === 0 || updateRatingMutation.isPending}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            {updateRatingMutation.isPending ? (
                                "Saving..."
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
