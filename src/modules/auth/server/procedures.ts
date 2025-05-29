import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { headers as GetHeaders, cookies as getCookies } from "next/headers";
import { AUTH_COOKIE } from "../constants";
import { loginSchema, registerSchema } from "../schemas";
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

      await ctx.db.create({
        collection: "users",
        data: {
          email: input.email,
          username: input.username,
          password: input.password, // this will be hashed by Payload
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
      const cookies = await getCookies();
      cookies.set("token", data.token, {
        name: AUTH_COOKIE,
        value: data.token,
        httpOnly: true,
        path: "/",
        // sameSite: "none",
        // domain: process.env.NEXT_PUBLIC_APP_URL
        // TODO: ensure cross-domain cookie sharing
      });
    }),

  logout: baseProcedure.mutation(async ({}) => {
    const cookies = await getCookies();
    cookies.delete(AUTH_COOKIE);
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
    const cookies = await getCookies();
    cookies.set("token", data.token, {
      name: AUTH_COOKIE,
      value: data.token,
      httpOnly: true,
      path: "/",
      // sameSite: "none",
      // domain: process.env.NEXT_PUBLIC_APP_URL
      // TODO: ensure cross-domain cookie sharing
    });

    return data;
  }),
});
