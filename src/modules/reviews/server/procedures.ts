import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const reviewsRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const product = await ctx.db.findByID({
        collection: "products",
        id: input.productId,
      });
      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      const reviewsData = await ctx.db.find({
        collection: "reviews",
        limit: 1,
        where: {
          and: [
            {
              product: {
                equals: product.id,
              },
            },
            {
              user: {
                equals: ctx.session.user.id,
              },
            },
          ],
        },
      });

      const reviews = reviewsData.docs[0];
      if (!reviews) {
        return null;
      }

      return reviews;
    }),

  create: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
        rating: z
          .number()
          .min(1, "Rating must be at least 1")
          .max(5, "Rating must be at most 5"),

        description: z
          .string()
          .min(3, "Description must be at least 3 characters"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const product = await ctx.db.findByID({
        collection: "products",
        id: input.productId,
      });
      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      const existingReviewsData = await ctx.db.find({
        collection: "reviews",
        limit: 1,
        where: {
          and: [
            {
              product: {
                equals: product.id,
              },
            },
            {
              user: {
                equals: ctx.session.user.id,
              },
            },
          ],
        },
      });
      if (existingReviewsData.totalDocs > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You have already reviewed this product",
        });
      }

      const review = await ctx.db.create({
        collection: "reviews",
        data: {
          user: ctx.session.user.id,
          product: product.id,
          rating: input.rating,
          description: input.description,
        },
      });
      return review;
    }),
  update: protectedProcedure
    .input(
      z.object({
        reviewId: z.string(),
        rating: z
          .number()
          .min(1, "Rating must be at least 1")
          .max(5, "Rating must be at most 5"),

        description: z
          .string()
          .min(3, "Description must be at least 3 characters"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existingReview = await ctx.db.findByID({
        depth: 0, //existingReview.user will be the user id,
        collection: "reviews",
        id: input.reviewId,
      });
      if (!existingReview) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Review not found",
        });
      }

      if (existingReview.user !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not allowed to update this review",
        });
      }

      const updatedReview = await ctx.db.update({
        collection: "reviews",
        id: input.reviewId,
        data: {
          rating: input.rating,
          description: input.description,
        },
      });
      return updatedReview;
    }),
});
