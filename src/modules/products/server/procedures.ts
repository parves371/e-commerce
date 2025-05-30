import { Category } from "@/payload-types";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import type { Where } from "payload";
import { z } from "zod";

export const productsRouter = createTRPCRouter({
  getMany: baseProcedure
    .input(
      z.object({
        category: z.string().nullable().optional(),
        minPrice: z.number().nullable().optional(),
        maxPrice: z.number().nullable().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: Where = {};
        if (input.minPrice) {
          where.price = {
            greater_than_equal: input.minPrice,
          };
        }
        if (input.maxPrice) {
          where.price = {
            less_than_equal: input.maxPrice,
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

      const data = await ctx.db.find({
        collection: "products",
        where,
      });

      return data;
    }),
});
