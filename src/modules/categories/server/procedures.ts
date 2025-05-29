import { Category } from "@/payload-types";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";

export const categoriesRouter = createTRPCRouter({
  getMany: baseProcedure.query(async ({ ctx }) => {
    const data = await ctx.db.find({
      collection: "categories",
      depth: 1, //populate labels
      pagination: false,
      where: {
        parent: {
          exists: false,
        },
      },
    });

    const formattedData = data.docs.map((doc) => ({
      ...doc,
      subcategories: (doc.subcategories?.docs ?? []).map((doc) => ({
        //because of depth 1, we are confident that the docs are categories
        ...(doc as Category),
        subcategories: undefined,
      })),
    }));

    return formattedData;
  }),
});
