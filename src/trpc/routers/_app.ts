import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';
import { userRouter } from './user';
import { messagesRouter } from './messages';
import { adminRouter } from './admin';

export const appRouter = createTRPCRouter({
    user: userRouter,
    messages: messagesRouter,
    admin: adminRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;