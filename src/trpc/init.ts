import { initTRPC, TRPCError } from '@trpc/server';
import { cache } from 'react';
import superjson from 'superjson';
import { auth } from "@/lib/auth"
import { PrismaClient } from "@/generated/prisma"
import { headers } from "next/headers"

const prisma = new PrismaClient()
export const createTRPCContext = async (opts: { headers: Headers }) => {

    const session = await auth.api.getSession({
        headers: opts.headers,
    })

    return {
        session,
        prisma,
    }
}

const t = initTRPC.context<typeof createTRPCContext>().create({
    transformer: superjson
})

const isAuthed = t.middleware(({ next, ctx }) => {
    if (!ctx.session?.user) {
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You must be logged in to access this resource",
        })
    }
    return next({
        ctx: {
            ...ctx,
            user: ctx.session.user,
        },
    })
})
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);