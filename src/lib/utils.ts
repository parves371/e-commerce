import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateTenantUrl(tenantSlug: string) {
  const isDevolepment = process.env.NODE_ENV === "development";
  const isSubdomainRoutingEnabled = Boolean(
    process.env.NEXT_PUBLIC_EANBLE_SUBDOMAIN_ROUTING!
  );

  // in development use normal routing or if subdomain routing is disabled, use normal routing
  if (isDevolepment || !isSubdomainRoutingEnabled) {
    return `${process.env.NEXT_PUBLIC_APP_URL}/tenants/${tenantSlug}`;
  }

  const protocol = "https";
  const domain = process.env.NEXT_PUBLIC_ROOT_DOMAIN!;

  // in production use subdomain routing
  // https://parves.vendspace.com
  return `${protocol}://${tenantSlug}.${domain}`;
}

export function formateCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}
