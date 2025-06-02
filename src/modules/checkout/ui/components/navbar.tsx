import { Button } from "@/components/ui/button";
import { generateTenantUrl } from "@/lib/utils";
import Link from "next/link";

interface NavbarProps {
  slug: string;
}

export const Navbar = ({ slug }: NavbarProps) => {
  return (
    <nav className="h-20 border-b font-medium bg-white">
      <div className="max-w-(--breakpoint-xl) mx-auto flex justify-between items-center h-full px-4 lg:px-12">
        <Link
          href={generateTenantUrl(slug)}
          className="flex items-center gap-2"
        >
          <p>Cekckout</p>
        </Link>
        <Button asChild variant={"eleveted"}>
          <Link href={generateTenantUrl(slug)}>Continue Shopping</Link>
        </Button>
      </div>  
    </nav>
  );
};
