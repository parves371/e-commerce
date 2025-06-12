import { Category, Media, Tenant } from "@/payload-types";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import type { Sort, Where } from "payload";
import { z } from "zod";
import { sortValues } from "../search-params";
import { DEFAULT_LIMIT } from "@/constants";
import { headers as getHedders } from "next/headers";
import { TRPCError } from "@trpc/server";

export const productsRouter = createTRPCRouter({
  getOne: baseProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const headers = await getHedders();
      const session = await ctx.db.auth({ headers });

      const product = await ctx.db.findByID({
        collection: "products",
        id: input.id,
        depth: 2, //populate "product" ,"image" and "tenant" & tenant.image
        select: {
          content: false,
        },
      });

      if (product.isArchived) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      let isPurchased = false;
      if (session.user) {
        const ordersData = await ctx.db.find({
          collection: "orders",
          pagination: false,
          limit: 1,
          where: {
            and: [
              {
                product: {
                  equals: input.id,
                },
              },
              {
                user: {
                  equals: session.user.id,
                },
              },
            ],
          },
        });

        isPurchased = !!ordersData.docs[0];
      }

      const reviews = await ctx.db.find({
        collection: "reviews",
        pagination: false,
        where: {
          product: {
            equals: input.id,
          },
        },
      });

      const reviewsRating =
        reviews.docs.length > 0
          ? reviews.docs.reduce((acc, review) => acc + review.rating, 0) /
            reviews.totalDocs
          : 0;

      const ratingsDistribution: Record<number, number> = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      };

      if (reviews.docs.length > 0) {
        reviews.docs.forEach((review) => {
          const ratings = review.rating;

          if (ratings >= 1 && ratings <= 5) {
            ratingsDistribution[ratings] =
              (ratingsDistribution[ratings] || 0) + 1;
          }
        });

        Object.keys(ratingsDistribution).forEach((key) => {
          const rating = Number(key);
          const count = ratingsDistribution[rating] || 0;
          ratingsDistribution[rating] = Math.round(
            (count / reviews.totalDocs) * 100
          );
        });
      }

      return {
        ...product,
        isPurchased,
        image: product?.image as Media | null,
        tenant: product?.tenant as Tenant & { image: Media | null },
        reviewsRating,
        ratingsDistribution,
        reviewCount: reviews.totalDocs,
      };
    }),

  getMany: baseProcedure
    .input(
      z.object({
        search: z.string().nullable().optional(),
        cursor: z.number().default(1),
        limit: z.number().default(DEFAULT_LIMIT),
        category: z.string().nullable().optional(),
        minPrice: z.string().nullable().optional(),
        maxPrice: z.string().nullable().optional(),
        tags: z.array(z.string()).nullable().optional(),
        sort: z.enum(sortValues).nullable().optional(),
        tenantSlug: z.string().nullable().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: Where = {
        isArchived: {
          not_equals: true,
        },
      };
      let sort: Sort = "-createdAt";

      if (input.sort == "trending") {
        sort = "name";
      }
      if (input.sort == "curated") {
        sort = "-createdAt";
      }
      if (input.sort == "hot") {
        sort = "+createdAt";
      }

      if (input.minPrice && input.maxPrice) {
        where.price = {
          greater_than_equal: input.minPrice,
          less_than_equal: input.maxPrice,
        };
      } else if (input.minPrice) {
        where.price = {
          greater_than_equal: input.minPrice,
        };
      } else if (input.maxPrice) {
        where.price = {
          less_than_equal: input.maxPrice,
        };
      }

      if (input.tenantSlug) {
        where["tenant.slug"] = {
          equals: input.tenantSlug,
        };
      } else {
        // if we are loading products for public storefront (no tenantSlug)
        // make sure to not load products set to "isPrivate: true (ussing reverse not_equals logic)"
        // this  products are exclusively private to the tenant store
        where["isPrivate"] = {
          not_equals: true,
        };
      }

      if (input.category) {
        const cataegoriesData = await ctx.db.find({
          collection: "categories",
          limit: 1,
          depth: 1, //populate labels
          pagination: true,
          where: {
            slug: {
              equals: input.category,
            },
          },
        });

        const formattedData = cataegoriesData.docs.map((doc) => ({
          ...doc,
          subcategories: (doc.subcategories?.docs ?? []).map((doc) => ({
            //because of depth 1, we are confident that the docs are categories
            ...(doc as Category),
            subcategories: undefined,
          })),
        }));

        const subcategoriesSlugs = [];
        const parentCategory = formattedData[0];

        if (parentCategory) {
          subcategoriesSlugs.push(
            ...parentCategory.subcategories.map(
              (subcategory) => subcategory.slug
            )
          );

          where["category.slug"] = {
            in: [parentCategory.slug, ...subcategoriesSlugs],
          };
        }
      }

      if (input.tags && input.tags.length > 0) {
        where["tags.name"] = {
          in: input.tags,
        };
      }

      if (input.search) {
        where["name"] = {
          like: input.search,
        };
      }

      const data = await ctx.db.find({
        collection: "products",
        depth: 2, //populate "category" ,"image " and "tenant" & tenant.image
        where,
        sort,
        page: input.cursor,
        limit: input.limit,
        select: {
          content: false,
        },
      });

      const dataWithSummarizedReview = await Promise.all(
        data.docs.map(async (doc) => {
          const reviewsData = await ctx.db.find({
            collection: "reviews",
            pagination: false,
            where: {
              product: {
                equals: doc.id,
              },
            },
          });

          return {
            ...doc,
            reviewsCount: reviewsData.totalDocs,
            reviewRatig:
              reviewsData.docs.length === 0
                ? 0
                : reviewsData.docs.reduce(
                    (acc, review) => acc + review.rating,
                    0
                  ) / reviewsData.totalDocs,
          };
        })
      );

      return {
        ...data,
        docs: dataWithSummarizedReview.map((doc) => ({
          ...doc,
          image: doc.image as Media | null,
          tenant: doc.tenant as Tenant & { image: Media | null },
        })),
      };
    }),
});
