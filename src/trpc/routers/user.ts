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
                        ratings: true,
                    },
                    orderBy: { createdAt: "desc" },
                    take: 10,
                },
                receivedSwapRequests: {
                    include: {
                        fromUser: true,
                        skillOffered: true,
                        skillWanted: true,
                        ratings: true,
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

    searchUsers: protectedProcedure
        .input(
            z.object({
                query: z.string().optional(),
                filters: z
                    .object({
                        skills: z.array(z.string()).optional(),
                        location: z.string().optional(),
                        rating: z.number().optional(),
                        availability: z.string().optional(),
                        category: z.string().optional(),
                    })
                    .optional(),
            }),
        )
        .query(async ({ ctx, input }) => {
            const userId = ctx.user.id
            const { query, filters } = input

            // Build where conditions
            const whereConditions: any = {
                AND: [
                    { id: { not: userId } }, // Exclude current user
                    { profilePublic: true }, // Only public profiles
                ],
            }

            // Search by skill name
            if (query) {
                whereConditions.AND.push({
                    OR: [
                        {
                            skillsOffered: {
                                some: {
                                    name: { contains: query, mode: "insensitive" },
                                },
                            },
                        },
                        {
                            skillsWanted: {
                                some: {
                                    name: { contains: query, mode: "insensitive" },
                                },
                            },
                        },
                        {
                            name: { contains: query, mode: "insensitive" },
                        },
                    ],
                })
            }

            // Apply filters
            if (filters?.skills && filters.skills.length > 0) {
                whereConditions.AND.push({
                    skillsOffered: {
                        some: {
                            name: { in: filters.skills },
                        },
                    },
                })
            }

            if (filters?.location) {
                whereConditions.AND.push({
                    location: { contains: filters.location, mode: "insensitive" },
                })
            }

            if (filters?.category) {
                whereConditions.AND.push({
                    skillsOffered: {
                        some: {
                            category: filters.category,
                        },
                    },
                })
            }

            if (filters?.availability) {
                whereConditions.AND.push({
                    availability: {
                        some: {
                            OR: [
                                { day: { contains: filters.availability, mode: "insensitive" } },
                                { time: { contains: filters.availability, mode: "insensitive" } },
                            ],
                        },
                    },
                })
            }

            const users = await ctx.prisma.user.findMany({
                where: whereConditions,
                include: {
                    skillsOffered: true,
                    skillsWanted: true,
                    availability: true,
                    receivedRatings: {
                        select: { rating: true },
                    },
                },
                take: 50, // Limit results
            })

            // Calculate average ratings and filter by minimum rating
            const usersWithRatings = users.map((user) => ({
                ...user,
                averageRating:
                    user.receivedRatings.length > 0
                        ? user.receivedRatings.reduce((sum, r) => sum + r.rating, 0) / user.receivedRatings.length
                        : 0,
            }))

            // Filter by minimum rating if specified
            const filteredUsers = filters?.rating
                ? usersWithRatings.filter((user) => user.averageRating >= filters.rating!)
                : usersWithRatings

            return filteredUsers
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
                    { profilePublic: true },
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
                status: z.enum(["ACCEPTED", "REJECTED", "COMPLETED"]),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            return await ctx.prisma.swapRequest.update({
                where: { id: input.requestId },
                data: { status: input.status },
            })
        }),

    deleteSwapRequest: protectedProcedure
        .input(
            z.object({
                requestId: z.string(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            // Verify the user owns this request
            const request = await ctx.prisma.swapRequest.findUnique({
                where: { id: input.requestId },
            })

            if (!request || request.fromUserId !== ctx.user.id) {
                throw new Error("Unauthorized to delete this request")
            }

            return await ctx.prisma.swapRequest.delete({
                where: { id: input.requestId },
            })
        }),

    createSwapRequest: protectedProcedure
        .input(
            z.object({
                toUserId: z.string(),
                skillOfferedId: z.string(),
                skillWantedId: z.string(),
                message: z.string().optional(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            // Validate that the offered skill belongs to the current user
            const offeredSkill = await ctx.prisma.skill.findFirst({
                where: {
                    id: input.skillOfferedId,
                    userId: ctx.user.id,
                },
            })

            if (!offeredSkill) {
                throw new Error("The offered skill does not exist or does not belong to you")
            }

            // Validate that the wanted skill belongs to the target user
            const wantedSkill = await ctx.prisma.skill.findFirst({
                where: {
                    id: input.skillWantedId,
                    userId: input.toUserId,
                },
            })

            if (!wantedSkill) {
                throw new Error("The wanted skill does not exist or does not belong to the target user")
            }

            // Check if a similar request already exists
            const existingRequest = await ctx.prisma.swapRequest.findFirst({
                where: {
                    fromUserId: ctx.user.id,
                    toUserId: input.toUserId,
                    skillOfferedId: input.skillOfferedId,
                    skillWantedId: input.skillWantedId,
                    status: { in: ["PENDING", "ACCEPTED"] },
                },
            })

            if (existingRequest) {
                throw new Error("A similar swap request already exists")
            }

            return await ctx.prisma.swapRequest.create({
                data: {
                    fromUserId: ctx.user.id,
                    toUserId: input.toUserId,
                    skillOfferedId: input.skillOfferedId,
                    skillWantedId: input.skillWantedId,
                    message: input.message,
                },
                include: {
                    fromUser: true,
                    toUser: true,
                    skillOffered: true,
                    skillWanted: true,
                },
            })
        }),

    rateSwap: protectedProcedure
        .input(
            z.object({
                swapId: z.string(),
                rating: z.number().min(1).max(5),
                feedback: z.string().optional(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            // Get the swap request to determine who to rate
            const swapRequest = await ctx.prisma.swapRequest.findUnique({
                where: { id: input.swapId },
                include: {
                    ratings: true,
                },
            })

            if (!swapRequest) {
                throw new Error("Swap request not found")
            }

            // Check if user has already rated this swap
            const existingRating = swapRequest.ratings.find((rating) => rating.fromUserId === ctx.user.id)
            if (existingRating) {
                throw new Error("You have already rated this swap")
            }

            // Ensure the swap is completed before allowing rating
            if (swapRequest.status !== "COMPLETED") {
                throw new Error("You can only rate completed swaps")
            }

            // Ensure the user is part of this swap
            if (swapRequest.fromUserId !== ctx.user.id && swapRequest.toUserId !== ctx.user.id) {
                throw new Error("You can only rate swaps you participated in")
            }

            // Determine who to rate (the other person in the swap)
            const ratedUserId = swapRequest.fromUserId === ctx.user.id ? swapRequest.toUserId : swapRequest.fromUserId

            return await ctx.prisma.rating.create({
                data: {
                    rating: input.rating,
                    comment: input.feedback,
                    fromUserId: ctx.user.id,
                    toUserId: ratedUserId,
                    swapId: input.swapId,
                },
            })
        }),

    updateProfile: protectedProcedure
        .input(
            z.object({
                name: z.string().min(1).optional(),
                bio: z.string().optional(),
                location: z.string().optional(),
                profilePublic: z.boolean().optional(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            return await ctx.prisma.user.update({
                where: { id: ctx.user.id },
                data: input,
            })
        }),

    addSkill: protectedProcedure
        .input(
            z.object({
                name: z.string().min(1),
                description: z.string().optional(),
                category: z.string(),
                type: z.enum(["offered", "wanted"]),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const skill = await ctx.prisma.skill.create({
                data: {
                    name: input.name,
                    description: input.description,
                    category: input.category,
                    userId: ctx.user.id,
                },
            })

            if (input.type === "wanted") {
                await ctx.prisma.user.update({
                    where: { id: ctx.user.id },
                    data: {
                        skillsWanted: {
                            connect: { id: skill.id },
                        },
                    },
                })
            }

            return skill
        }),

    removeSkill: protectedProcedure
        .input(
            z.object({
                skillId: z.string(),
                type: z.enum(["offered", "wanted"]),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            if (input.type === "wanted") {
                await ctx.prisma.user.update({
                    where: { id: ctx.user.id },
                    data: {
                        skillsWanted: {
                            disconnect: { id: input.skillId },
                        },
                    },
                })
            }

            return await ctx.prisma.skill.delete({
                where: { id: input.skillId },
            })
        }),

    updateAvailability: protectedProcedure
        .input(
            z.object({
                availability: z.array(
                    z.object({
                        day: z.string(),
                        time: z.string(),
                    }),
                ),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            // Delete existing availability
            await ctx.prisma.availability.deleteMany({
                where: { userId: ctx.user.id },
            })

            // Create new availability
            await ctx.prisma.availability.createMany({
                data: input.availability.map((avail) => ({
                    ...avail,
                    userId: ctx.user.id,
                })),
            })

            return { success: true }
        }),
    updateRating: protectedProcedure
        .input(
            z.object({
                ratingId: z.string(),
                rating: z.number().min(1).max(5),
                feedback: z.string().optional(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            // Verify the user is the one who gave this rating
            const existingRating = await ctx.prisma.rating.findUnique({
                where: { id: input.ratingId },
            })

            if (!existingRating || existingRating.fromUserId !== ctx.user.id) {
                throw new Error("Unauthorized to update this rating")
            }

            return await ctx.prisma.rating.update({
                where: { id: input.ratingId },
                data: {
                    rating: input.rating,
                    comment: input.feedback,
                },
            })
        }),

    getGivenReviews: protectedProcedure.query(async ({ ctx }) => {
        return await ctx.prisma.rating.findMany({
            where: { fromUserId: ctx.user.id },
            include: {
                toUser: {
                    select: { id: true, name: true, image: true },
                },
                swap: {
                    select: {
                        id: true,
                        skillOffered: { select: { name: true } },
                        skillWanted: { select: { name: true } },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        })
    }),

    getReceivedReviews: protectedProcedure.query(async ({ ctx }) => {
        return await ctx.prisma.rating.findMany({
            where: { toUserId: ctx.user.id },
            include: {
                fromUser: {
                    select: { id: true, name: true, image: true },
                },
                swap: {
                    select: {
                        id: true,
                        skillOffered: { select: { name: true } },
                        skillWanted: { select: { name: true } },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        })
    }),
})
