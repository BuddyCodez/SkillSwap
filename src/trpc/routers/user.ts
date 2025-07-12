import { z } from "zod"
import { createTRPCRouter, protectedProcedure, } from "../init"


export const userRouter = createTRPCRouter({
    getDashboardData: protectedProcedure.query(async ({ ctx }) => {
        const userId = ctx.user.id

        const user = await ctx.prisma.user.findUnique({
            where: { id: userId },
            include: {
                skillsOffered: {
                    include: {
                        offeredInSwaps: {
                            include: {
                                fromUser: true,
                                toUser: true,
                                skillWanted: true,
                            },
                        },
                    },
                },
                skillsWanted: true,
                availability: true,
                sentSwapRequests: {
                    include: {
                        toUser: true,
                        skillOffered: true,
                        skillWanted: true,
                    },
                    orderBy: { createdAt: "desc" },
                    take: 10,
                },
                receivedSwapRequests: {
                    include: {
                        fromUser: true,
                        skillOffered: true,
                        skillWanted: true,
                    },
                    orderBy: { createdAt: "desc" },
                    take: 10,
                },
                receivedRatings: {
                    select: {
                        rating: true,
                    },
                },
            },
        })

        if (!user) {
            throw new Error("User not found")
        }

        // Calculate average rating
        const avgRating =
            user.receivedRatings.length > 0
                ? user.receivedRatings.reduce((sum, r) => sum + r.rating, 0) / user.receivedRatings.length
                : 0

        // Count successful swaps
        const successfulSwaps = await ctx.prisma.swapRequest.count({
            where: {
                OR: [{ fromUserId: userId }, { toUserId: userId }],
                status: "COMPLETED",
            },
        })

        return {
            user,
            stats: {
                skillsOffered: user.skillsOffered.length,
                skillsWanted: user.skillsWanted.length,
                successfulSwaps,
                averageRating: avgRating,
            },
        }
    }),

    getSkillRecommendations: protectedProcedure.query(async ({ ctx }) => {
        const userId = ctx.user.id

        // Get user's offered skills
        const userSkills = await ctx.prisma.skill.findMany({
            where: { userId },
            select: { name: true, category: true },
        })

        const userSkillNames = userSkills.map((s) => s.name)

        // Find users who want skills that this user offers
        const recommendations = await ctx.prisma.user.findMany({
            where: {
                AND: [
                    { id: { not: userId } },
                    {
                        skillsWanted: {
                            some: {
                                name: { in: userSkillNames },
                            },
                        },
                    },
                ],
            },
            include: {
                skillsOffered: true,
                skillsWanted: true,
                receivedRatings: {
                    select: { rating: true },
                },
            },
            take: 5,
        })

        return recommendations.map((user) => ({
            ...user,
            averageRating:
                user.receivedRatings.length > 0
                    ? user.receivedRatings.reduce((sum, r) => sum + r.rating, 0) / user.receivedRatings.length
                    : 0,
        }))
    }),

    updateSwapRequest: protectedProcedure
        .input(
            z.object({
                requestId: z.string(),
                status: z.enum(["ACCEPTED", "REJECTED"]),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            return await ctx.prisma.swapRequest.update({
                where: { id: input.requestId },
                data: { status: input.status },
            })
        }),

    createSwapRequest: protectedProcedure
        .input(
            z.object({
                toUserId: z.string(),
                skillOfferedId: z.string(),
                skillWantedId: z.string(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            return await ctx.prisma.swapRequest.create({
                data: {
                    fromUserId: ctx.user.id,
                    toUserId: input.toUserId,
                    skillOfferedId: input.skillOfferedId,
                    skillWantedId: input.skillWantedId,
                },
            })
        }),
})
