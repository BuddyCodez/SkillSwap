import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "../init"


export const messagesRouter = createTRPCRouter({
    findConversationByParticipants: protectedProcedure
        .input(z.object({
            participantId: z.string()
        }))
        .query(async ({ ctx, input }) => {
            const userId = ctx.user.id

            const conversation = await ctx.prisma.conversation.findFirst({
                where: {
                    AND: [
                        {
                            participants: {
                                some: { id: userId },
                            },
                        },
                        {
                            participants: {
                                some: { id: input.participantId },
                            },
                        },
                    ],
                },
                include: {
                    participants: true,
                },
            })

            return conversation
        }),

    getConversations: protectedProcedure.query(async ({ ctx }) => {
        const userId = ctx.user.id

        // Get all conversations where user is a participant
        const conversations = await ctx.prisma.conversation.findMany({
            where: {
                participants: {
                    some: { id: userId },
                },
            },
            include: {
                participants: true,
                messages: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                },
                _count: {
                    select: {
                        messages: {
                            where: {
                                senderId: { not: userId },
                                read: false,
                            },
                        },
                    },
                },
            },
            orderBy: { updatedAt: "desc" },
        })

        return conversations.map((conv) => ({
            id: conv.id,
            participants: conv.participants,
            lastMessage: conv.messages[0] || null,
            unreadCount: conv._count.messages,
            updatedAt: conv.updatedAt.toISOString(),
        }))
    }),

    getConversation: protectedProcedure.input(z.object({ conversationId: z.string() })).query(async ({ ctx, input }) => {
        const userId = ctx.user.id

        const conversation = await ctx.prisma.conversation.findFirst({
            where: {
                id: input.conversationId,
                participants: {
                    some: { id: userId },
                },
            },
            include: {
                participants: true,
            },
        })

        return conversation
    }),

    getMessages: protectedProcedure.input(z.object({ conversationId: z.string() })).query(async ({ ctx, input }) => {
        const userId = ctx.user.id

        // Verify user is part of conversation
        const conversation = await ctx.prisma.conversation.findFirst({
            where: {
                id: input.conversationId,
                participants: {
                    some: { id: userId },
                },
            },
        })

        if (!conversation) {
            throw new Error("Conversation not found or access denied")
        }

        const messages = await ctx.prisma.message.findMany({
            where: { conversationId: input.conversationId },
            orderBy: { createdAt: "asc" },
            take: 100, // Limit to last 100 messages
        })

        return messages.map((msg) => ({
            id: msg.id,
            content: msg.content,
            createdAt: msg.createdAt.toISOString(),
            senderId: msg.senderId,
            type: msg.type,
            status: msg.senderId === userId ? "read" : undefined,
        }))
    }),

    sendMessage: protectedProcedure
        .input(
            z.object({
                conversationId: z.string(),
                content: z.string(),
                type: z.enum(["TEXT", "IMAGE"]),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.user.id

            // Verify user is part of conversation
            const conversation = await ctx.prisma.conversation.findFirst({
                where: {
                    id: input.conversationId,
                    participants: {
                        some: { id: userId },
                    },
                },
            })

            if (!conversation) {
                throw new Error("Conversation not found or access denied")
            }

            // Create message
            const message = await ctx.prisma.message.create({
                data: {
                    content: input.content,
                    type: input.type,
                    senderId: userId,
                    conversationId: input.conversationId,
                },
            })

            // Update conversation timestamp
            await ctx.prisma.conversation.update({
                where: { id: input.conversationId },
                data: { updatedAt: new Date() },
            })

            return message
        }),

    markAsRead: protectedProcedure.input(z.object({ conversationId: z.string() })).mutation(async ({ ctx, input }) => {
        const userId = ctx.user.id

        // Mark all messages in conversation as read for this user
        await ctx.prisma.message.updateMany({
            where: {
                conversationId: input.conversationId,
                senderId: { not: userId },
                read: false,
            },
            data: { read: true },
        })

        return { success: true }
    }),

    createConversation: protectedProcedure
        .input(
            z.object({
                participantId: z.string(),
                swapRequestId: z.string().optional(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.user.id

            // Check if conversation already exists
            const existingConversation = await ctx.prisma.conversation.findFirst({
                where: {
                    AND: [
                        {
                            participants: {
                                some: { id: userId },
                            },
                        },
                        {
                            participants: {
                                some: { id: input.participantId },
                            },
                        },
                    ],
                },
            })

            if (existingConversation) {
                return existingConversation
            }

            // Create new conversation
            const conversation = await ctx.prisma.conversation.create({
                data: {
                    participants: {
                        connect: [{ id: userId }, { id: input.participantId }],
                    },
                    swapRequestId: input.swapRequestId,
                },
                include: {
                    participants: true,
                },
            })

            return conversation
        }),
})
