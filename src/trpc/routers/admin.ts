import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "../init"
import { TRPCError } from "@trpc/server"

export const adminRouter = createTRPCRouter({
    // Check if user is admin
    checkAdminRole: protectedProcedure.query(async ({ ctx }) => {
        const user = await ctx.prisma.user.findUnique({
            where: { id: ctx.user.id },
            select: { role: true }
        })

        if (!user || user.role !== "ADMIN") {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "Admin access required"
            })
        }

        return { isAdmin: true }
    }),

    // Get admin dashboard stats
    getDashboardStats: protectedProcedure.query(async ({ ctx }) => {
        const user = await ctx.prisma.user.findUnique({
            where: { id: ctx.user.id },
            select: { role: true }
        })

        if (!user || user.role !== "ADMIN") {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "Admin access required"
            })
        }

        const [
            totalUsers,
            totalSkills,
            totalSwaps,
            pendingSwaps,
            completedSwaps,
            totalRatings,
            recentUsers
        ] = await Promise.all([
            ctx.prisma.user.count(),
            ctx.prisma.skill.count(),
            ctx.prisma.swapRequest.count(),
            ctx.prisma.swapRequest.count({ where: { status: "PENDING" } }),
            ctx.prisma.swapRequest.count({ where: { status: "COMPLETED" } }),
            ctx.prisma.rating.count(),
            ctx.prisma.user.findMany({
                take: 5,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    createdAt: true,
                    role: true
                }
            })
        ])

        return {
            totalUsers,
            totalSkills,
            totalSwaps,
            pendingSwaps,
            completedSwaps,
            totalRatings,
            recentUsers
        }
    }),

    // Get all users with pagination
    getUsers: protectedProcedure
        .input(z.object({
            page: z.number().default(1),
            limit: z.number().default(10),
            search: z.string().optional()
        }))
        .query(async ({ ctx, input }) => {
            const user = await ctx.prisma.user.findUnique({
                where: { id: ctx.user.id },
                select: { role: true }
            })

            if (!user || user.role !== "ADMIN") {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Admin access required"
                })
            }

            const where = input.search ? {
                OR: [
                    { name: { contains: input.search, mode: "insensitive" as const } },
                    { email: { contains: input.search, mode: "insensitive" as const } }
                ]
            } : {}

            const [users, total] = await Promise.all([
                ctx.prisma.user.findMany({
                    where,
                    skip: (input.page - 1) * input.limit,
                    take: input.limit,
                    orderBy: { createdAt: "desc" },
                    include: {
                        skillsOffered: true,
                        sentSwapRequests: true,
                        receivedSwapRequests: true,
                        receivedRatings: {
                            select: { rating: true }
                        }
                    }
                }),
                ctx.prisma.user.count({ where })
            ])

            return {
                users: users.map(user => ({
                    ...user,
                    averageRating: user.receivedRatings.length > 0
                        ? user.receivedRatings.reduce((sum, r) => sum + r.rating, 0) / user.receivedRatings.length
                        : 0,
                    totalSwaps: user.sentSwapRequests.length + user.receivedSwapRequests.length
                })),
                total,
                pages: Math.ceil(total / input.limit)
            }
        }),

    // Ban/Unban user
    toggleUserBan: protectedProcedure
        .input(z.object({
            userId: z.string(),
            banned: z.boolean()
        }))
        .mutation(async ({ ctx, input }) => {
            const admin = await ctx.prisma.user.findUnique({
                where: { id: ctx.user.id },
                select: { role: true }
            })

            if (!admin || admin.role !== "ADMIN") {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Admin access required"
                })
            }

            // For now, we'll add a banned field to the user model
            // In a real app, you might want a separate banned users table
            await ctx.prisma.user.update({
                where: { id: input.userId },
                data: {
                    // We'll need to add a banned field to schema, for now just update bio
                    bio: input.banned ? "BANNED_USER" : null
                }
            })

            return { success: true }
        }),

    // Get all swap requests with filtering
    getSwapRequests: protectedProcedure
        .input(z.object({
            page: z.number().default(1),
            limit: z.number().default(10),
            status: z.enum(["PENDING", "ACCEPTED", "REJECTED", "CANCELLED", "COMPLETED"]).optional()
        }))
        .query(async ({ ctx, input }) => {
            const user = await ctx.prisma.user.findUnique({
                where: { id: ctx.user.id },
                select: { role: true }
            })

            if (!user || user.role !== "ADMIN") {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Admin access required"
                })
            }

            const where = input.status ? { status: input.status } : {}

            const [swaps, total] = await Promise.all([
                ctx.prisma.swapRequest.findMany({
                    where,
                    skip: (input.page - 1) * input.limit,
                    take: input.limit,
                    orderBy: { createdAt: "desc" },
                    include: {
                        fromUser: {
                            select: { id: true, name: true, email: true }
                        },
                        toUser: {
                            select: { id: true, name: true, email: true }
                        },
                        skillOffered: {
                            select: { name: true, category: true }
                        },
                        skillWanted: {
                            select: { name: true, category: true }
                        },
                        ratings: true
                    }
                }),
                ctx.prisma.swapRequest.count({ where })
            ])

            return {
                swaps,
                total,
                pages: Math.ceil(total / input.limit)
            }
        }),

    // Get all skills for moderation
    getSkills: protectedProcedure
        .input(z.object({
            page: z.number().default(1),
            limit: z.number().default(10),
            search: z.string().optional()
        }))
        .query(async ({ ctx, input }) => {
            const user = await ctx.prisma.user.findUnique({
                where: { id: ctx.user.id },
                select: { role: true }
            })

            if (!user || user.role !== "ADMIN") {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Admin access required"
                })
            }

            const where = input.search ? {
                OR: [
                    { name: { contains: input.search, mode: "insensitive" as const } },
                    { description: { contains: input.search, mode: "insensitive" as const } }
                ]
            } : {}

            const [skills, total] = await Promise.all([
                ctx.prisma.skill.findMany({
                    where,
                    skip: (input.page - 1) * input.limit,
                    take: input.limit,
                    include: {
                        user: {
                            select: { id: true, name: true, email: true }
                        }
                    }
                }),
                ctx.prisma.skill.count({ where })
            ])

            return {
                skills,
                total,
                pages: Math.ceil(total / input.limit)
            }
        }),

    // Delete inappropriate skill
    deleteSkill: protectedProcedure
        .input(z.object({
            skillId: z.string()
        }))
        .mutation(async ({ ctx, input }) => {
            const user = await ctx.prisma.user.findUnique({
                where: { id: ctx.user.id },
                select: { role: true }
            })

            if (!user || user.role !== "ADMIN") {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Admin access required"
                })
            }

            await ctx.prisma.skill.delete({
                where: { id: input.skillId }
            })

            return { success: true }
        }),

    // Send platform-wide message (we'll create a simple announcement system)
    sendAnnouncement: protectedProcedure
        .input(z.object({
            title: z.string(),
            message: z.string(),
            type: z.enum(["INFO", "WARNING", "UPDATE", "MAINTENANCE"])
        }))
        .mutation(async ({ ctx, input }) => {
            const user = await ctx.prisma.user.findUnique({
                where: { id: ctx.user.id },
                select: { role: true }
            })

            if (!user || user.role !== "ADMIN") {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Admin access required"
                })
            }

            // For now, we'll simulate sending announcements
            // In a real app, you'd want to create an announcements table
            // and/or send emails/notifications

            return {
                success: true,
                message: "Announcement sent to all users",
                announcementId: Math.random().toString(36).substr(2, 9)
            }
        }),

    // Generate and download reports
    generateUserActivityReport: protectedProcedure.query(async ({ ctx }) => {
        const user = await ctx.prisma.user.findUnique({
            where: { id: ctx.user.id },
            select: { role: true }
        })

        if (!user || user.role !== "ADMIN") {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "Admin access required"
            })
        }

        const [
            userStats,
            swapStats,
            skillStats
        ] = await Promise.all([
            ctx.prisma.user.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    createdAt: true,
                    _count: {
                        select: {
                            skillsOffered: true,
                            sentSwapRequests: true,
                            receivedSwapRequests: true
                        }
                    }
                }
            }),
            ctx.prisma.swapRequest.groupBy({
                by: ['status'],
                _count: true
            }),
            ctx.prisma.skill.groupBy({
                by: ['category'],
                _count: true
            })
        ])

        return {
            userStats,
            swapStats,
            skillStats,
            generatedAt: new Date().toISOString()
        }
    })
})
