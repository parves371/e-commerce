"use client";

import { generateTenantUrl } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { InboxIcon, Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { useCart } from "../../hooks/use-cart";
import { useCheckoutStates } from "../../hooks/use-checkout-stats";
import { CheckoutItem } from "../components/checkout-item";
import { CheckoutSidebar } from "../components/checkout-sidebar";

export const CheckoutView = ({ tenantSlug }: { tenantSlug: string }) => {
  const { productIds, removeProduct, clearCart } = useCart(tenantSlug);
  const [states, setStates] = useCheckoutStates();
  const router = useRouter();

  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data, error, isLoading } = useQuery(
    trpc.checkout.getProduct.queryOptions({
      ids: productIds,
    })
  );

  const purchase = useMutation(
    trpc.checkout.purchase.mutationOptions({
      onMutate: () => {
        setStates({
          cancel: false,
          success: false,
        });
      },
      onSuccess: (data) => {
        window.location.href = data.url;
      },
      onError: (error) => {
        if (error.data?.code === "UNAUTHORIZED") {
          // modify this when subdomain enabled
          router.push("/sign-in");
        }
        toast.error(error.message);
      },
    })
  );
  useEffect(() => {
    if (states.success) {
      clearCart();
      setStates({
        cancel: false,
        success: false,
      });
      queryClient.invalidateQueries(trpc.library.getMany.infiniteQueryFilter());
      router.push("/library");
    }
  }, [
    states.success,
    setStates,
    clearCart,
    router,
    queryClient,
    trpc.library.getMany,
  ]);

  useEffect(() => {
    if (error?.data?.code === "NOT_FOUND") {
      clearCart();
      toast.warning("Some products not found");
    }
  }, [error, clearCart]);

  if (isLoading) {
    return (
      <div className="lg:pt-16 pt-4 lg:px-16 px-4">
        <div className="border border-black border-dashed flex items-center justify-center p-8 flex-col gap-y-4 bg-white w-full rounded-lg">
          <Loader2Icon className="animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (data?.totalDocs === 0) {
    return (
      <div className="lg:pt-16 pt-4 lg:px-16 px-4">
        <div className="border border-black border-dashed flex items-center justify-center p-8 flex-col gap-y-4 bg-white w-full rounded-lg">
          <InboxIcon />
          <p>No Product found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:pt-16 pt-4 lg:px-16 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 lg:gap-16">
        <div className="lg:col-span-4">
          <div className="border rounded-md overflow-hidden bg-white">
            {data?.docs.map((product, index) => (
              <CheckoutItem
                key={product.id}
                isLast={index === data.docs.length - 1}
                imageUrl={product.image?.url}
                name={product.name}
                productUrl={`${generateTenantUrl(product.tenant.slug)}/products/${product.id}`}
                tenantUrl={generateTenantUrl(product.tenant.slug)}
                tenantName={product.tenant.name}
                price={product.price}
                onRemove={() => removeProduct(product.id)}
              />
            ))}
          </div>
        </div>

        <div className="lg:col-span-3">
          <CheckoutSidebar
            total={data?.totalPrice || NaN}
            onPuschase={() =>
              purchase.mutate({
                tenantSlug,
                productIds: productIds,
              })
            }
            isCancelded={states.cancel}
            disabled={purchase.isPending}
          />
        </div>
      </div>
    </div>
  );
};
