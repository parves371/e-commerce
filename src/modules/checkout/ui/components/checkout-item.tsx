import { cn, formateCurrency } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface checkoutItemProps {
  isLast?: boolean;
  imageUrl?: string | null;
  name: string;
  productUrl: string;
  tenantUrl: string;
  tenantName: string;
  price: number;
  onRemove: () => void;
}

export const CheckoutItem = ({
  isLast,
  imageUrl,
  name,
  productUrl,
  tenantUrl,
  tenantName,
  price,
  onRemove,
}: checkoutItemProps) => {
  return (
    <div
      className={cn(
        "grid grid-cols-[8.5rem_1fr_auto] gap-4 pr-4 border-b",
        isLast && "border-b-0"
      )}
    >
      <div className="overflow-hidden border-r">
        <div className="relative aspect-square h-full">
          <Image
            src={imageUrl || "/placeholder.webp"}
            alt={name}
            fill
            className="object-cover"
          />
        </div>
      </div>
      <div className="py-4 flex flex-col justify-between">
        <div>
          <Link href={productUrl}>
            <h4 className="font-bold underline">{name}</h4>
          </Link>
        </div>
        <div>
          <Link href={tenantUrl} className="font-bold underline">
            <p className="font-medium underline">{tenantName}</p>
          </Link>
        </div>
      </div>
      <div className="py-4 flex flex-col justify-between">
        <p className="font-medium">{formateCurrency(price)}</p>
        <button
          type="button"
          className="underline font-medium cursor-pointer"
          onClick={onRemove}
        >
          Remove
        </button>
      </div>
    </div>
  );
};
