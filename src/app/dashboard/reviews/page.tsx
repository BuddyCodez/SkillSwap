"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useQuery } from "@tanstack/react-query"

import { useSession } from "@/lib/auth-client"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReviewList } from "@/components/reviews/review-list"
import { useTRPC } from "@/trpc/client"
import { EditReviewModal } from "@/components/reviews/edit-review"


export default function ReviewsPage() {
    const [editingReview, setEditingReview] = useState<any | null>(null) // Store the review being edited

    const trpc = useTRPC()
    const { data: session, isPending: sessionLoading } = useSession()

    // Query options for given and received reviews
    const givenReviewsQueryOptions = trpc.user.getGivenReviews.queryOptions()
    const receivedReviewsQueryOptions = trpc.user.getReceivedReviews.queryOptions()

    // Use queries
    const givenReviewsQuery = useQuery({
        ...givenReviewsQueryOptions,
        enabled: !!session?.user,
    })

    const receivedReviewsQuery = useQuery({
        ...receivedReviewsQueryOptions,
        enabled: !!session?.user,
    })

    if (sessionLoading || givenReviewsQuery.isLoading || receivedReviewsQuery.isLoading) {
        return (
            <div className="space-y-6">
                <Card className="bg-gray-800/50 border-purple-500/30">
                    <CardContent className="p-6">
                        <Skeleton className="h-8 w-48 mb-4 bg-purple-500/20" />
                        <Skeleton className="h-10 w-full bg-purple-500/20" />
                    </CardContent>
                </Card>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="bg-gray-800/50 border-purple-500/30">
                            <CardContent className="p-6">
                                <Skeleton className="h-6 w-32 mb-4 bg-purple-500/20" />
                                <div className="space-y-3">
                                    {[1, 2, 3].map((j) => (
                                        <Skeleton key={j} className="h-16 w-full bg-purple-500/20" />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    if (!session?.user) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="bg-gray-800/50 border-purple-500/30">
                    <CardContent className="p-8 text-center">
                        <p className="text-white">Please sign in to view your reviews.</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const givenReviews = givenReviewsQuery.data || []
    const receivedReviews = receivedReviewsQuery.data || []

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                <h1 className="text-3xl font-bold text-white mb-2">Reviews & Ratings ⭐</h1>
                <p className="text-purple-200">Manage your feedback and see what others think of your skills.</p>
            </motion.div>

            <Card className="bg-gray-800/50 border-purple-500/30">
                <CardContent className="p-6">
                    <Tabs defaultValue="received" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 bg-gray-800/50 border border-purple-500/30">
                            <TabsTrigger
                                value="received"
                                className="data-[state=active]:bg-purple-600/30 data-[state=active]:text-white text-purple-200"
                            >
                                Received Reviews ({receivedReviews.length})
                            </TabsTrigger>
                            <TabsTrigger
                                value="given"
                                className="data-[state=active]:bg-purple-600/30 data-[state=active]:text-white text-purple-200"
                            >
                                Given Reviews ({givenReviews.length})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="received" className="space-y-4 mt-6">
                            <ReviewList
                                reviews={receivedReviews.filter(review => review.swap) as any}
                                type="received"
                                currentUserId={session.user.id}
                                onEditReview={setEditingReview}
                            />
                        </TabsContent>

                        <TabsContent value="given" className="space-y-4 mt-6">
                            <ReviewList
                                reviews={givenReviews.filter(review => review.swap) as any}
                                type="given"
                                currentUserId={session.user.id}
                                onEditReview={setEditingReview}
                            />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {editingReview && (
                <EditReviewModal
                    review={editingReview}
                    onClose={() => setEditingReview(null)}
                    onSubmit={() => {
                        setEditingReview(null)
                        givenReviewsQuery.refetch() // Refetch given reviews after edit
                    }}
                />
            )}
        </div>
    )
}
