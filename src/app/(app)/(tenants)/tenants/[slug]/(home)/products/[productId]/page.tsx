import {
  ProductView,
  ProductViewSkeleton,
} from "@/modules/products/ui/view/product-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{
    productId: string;
    slug: string;
  }>;
}
const page = async ({ params }: Props) => {
  const { productId, slug } = await params;

  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(
    trpc.products.getOne.queryOptions({
      id: productId,
    })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<ProductViewSkeleton />}>
        <ProductView productId={productId} tenantSlug={slug} />
      </Suspense>
    </HydrationBoundary>
  );
};

export default page;
