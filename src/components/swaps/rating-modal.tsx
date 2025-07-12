"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Star, Send } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

import { toast } from "sonner"
import { useTRPC } from "@/trpc/client"

interface RatingModalProps {
    swapId: string
    onClose: () => void
    onSubmit: () => void
}

export function RatingModal({ swapId, onClose, onSubmit }: RatingModalProps) {
    const [rating, setRating] = useState(0)
    const [hoveredRating, setHoveredRating] = useState(0)
    const [feedback, setFeedback] = useState("")

    const trpc = useTRPC()
    const queryClient = useQueryClient()

    const rateSwapMutationOptions = trpc.user.rateSwap.mutationOptions()

    const rateSwapMutation = useMutation({
        ...rateSwapMutationOptions,
        onSuccess: () => {
            toast.success("Rating submitted successfully!")
            onSubmit()
        },
        onError: () => {
            toast.error("Failed to submit rating")
        },
    })

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error("Please select a rating")
            return
        }

        await rateSwapMutation.mutateAsync({
            swapId,
            rating,
            feedback: feedback.trim() || undefined,
        })
    }

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="bg-gray-800 border-purple-500/30 max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-white">Rate Your Experience</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Star Rating */}
                    <div className="space-y-3">
                        <Label className="text-white">How was your skill swap experience?</Label>
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
                            disabled={rating === 0 || rateSwapMutation.isPending}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            {rateSwapMutation.isPending ? (
                                "Submitting..."
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Submit Rating
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
