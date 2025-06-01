import { cn } from "@/lib/utils";
import { Poppins } from "next/font/google";
import Link from "next/link";

const logoFont = Poppins({
  weight: ["700"],
  subsets: ["latin"],
});

export const Footer = () => {
  return (
    <footer className="border-t font-medium bg-white">
      <div className="max-w-(--breakpoint-xl) mx-auto flex  items-center h-full px-4 py-6 lg:px-12 gap-2">
        <p className="text-xl">Powered by </p>
        <Link href={"/"}>
          <span className={cn("text-2xl font-semibold", logoFont.className)}>
            VendSpace
          </span>
        </Link>
      </div>
    </footer>
  );
};
