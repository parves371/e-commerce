import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCart } from "@/modules/checkout/hooks/use-cart";
import Link from "next/link";

interface Props {
  tenantSlug: string;
  productId: string;
  isPurChased?: boolean;
}

export const CartButton = ({ tenantSlug, productId, isPurChased }: Props) => {
  const cart = useCart(tenantSlug);

  if (isPurChased)
    return (
      <Button
        variant={"eleveted"}
        asChild
        className="flex-1 font-medium bg-white"
      >
        <Link prefetch href={`/library/${productId}`}>
          View in Libary
        </Link>
      </Button>
    );

  return (
    <Button
      onClick={() => cart.toggleProduct(productId)}
      variant={"eleveted"}
      className={cn(
        "flex-1 bg-pink-400",
        cart.isProductInCart(productId) && "bg-white"
      )}
    >
      {cart.isProductInCart(productId) ? "Remove from cart" : "Add to cart"}
    </Button>
  );
};
