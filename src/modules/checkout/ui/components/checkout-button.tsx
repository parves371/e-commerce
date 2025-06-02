import { Button } from "@/components/ui/button";
import { useCart } from "../../hooks/use-cart";
import { cn, generateTenantUrl } from "@/lib/utils";
import Link from "next/link";
import { ShoppingCartIcon } from "lucide-react";

interface CheckOutProps {
  clasName?: string;
  hideIfEmty?: boolean;
  tenantSlug: string;
}
export const CheckoutButton = ({
  tenantSlug,
  clasName,
  hideIfEmty,
}: CheckOutProps) => {
  const { totalItems } = useCart(tenantSlug);

  if (hideIfEmty && totalItems === 0) {
    return null;
  }

  return (
    <Button variant={"eleveted"} asChild className={(cn("bg-white"), clasName)}>
      <Link href={`${generateTenantUrl(tenantSlug)}/checkout`}>
        <ShoppingCartIcon />

        {totalItems > 0 ? totalItems : ""}
      </Link>
    </Button>
  );
};
