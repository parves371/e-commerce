import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { headers as GetHeaders } from "next/headers";
import { loginSchema, registerSchema } from "../schemas";
import { generateAuthCookie } from "../utils";
import { stripe } from "@/lib/stripe";
export const authRouter = createTRPCRouter({
  session: baseProcedure.query(async ({ ctx }) => {
    const headers = await GetHeaders();

    const session = await ctx.db.auth({ headers });
    return session;
  }),
  register: baseProcedure
    .input(registerSchema)
    .mutation(async ({ ctx, input }) => {
      const existingData = await ctx.db.find({
        collection: "users",
        limit: 1,
        where: {
          username: { equals: input.username },
        },
      });

      const existingUser = existingData?.docs?.[0];
      if (existingUser) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "username already exists",
        });
      }

      const account = await stripe.accounts.create({});
      if (!account.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "failed to create stripe account",
        });
      }

      const tenant = await ctx.db.create({
        collection: "tenants",
        data: {
          name: input.username,
          slug: input.username,
          stripeAccountId: account.id,
        },
      });

      await ctx.db.create({
        collection: "users",
        data: {
          email: input.email,
          username: input.username,
          password: input.password, // this will be hashed by payload
          tenants: [{ tenant: tenant.id }],
        },
      });

      const data = await ctx.db.login({
        collection: "users",
        data: {
          email: input.email,
          password: input.password,
        },
      });

      if (!data.token) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "failed to login",
        });
      }

      await generateAuthCookie({
        prefix: ctx.db.config.cookiePrefix,
        value: data.token,
      });
    }),

  login: baseProcedure.input(loginSchema).mutation(async ({ ctx, input }) => {
    const data = await ctx.db.login({
      collection: "users",
      data: {
        email: input.email,
        password: input.password,
      },
    });

    if (!data.token) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "failed to login",
      });
    }

    await generateAuthCookie({
      prefix: ctx.db.config.cookiePrefix,
      value: data.token,
    });

    return data;
  }),
});
