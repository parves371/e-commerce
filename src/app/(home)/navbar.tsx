"use client";
import { Poppins } from "next/font/google";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { NavbarSidebar } from "./nabvar-sidebar";
import { useState } from "react";
import { MenuIcon } from "lucide-react";
const poppins = Poppins({
  weight: ["700"],
  subsets: ["latin"],
});

interface NavbarItemProps {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
}
const NavbarItem = ({ href, children, isActive }: NavbarItemProps) => {
  return (
    <Button
      asChild
      variant={"outline"}
      className={cn(
        "bg-transparent hover:bg-transparent rounded-full hover:border-primary border-transparent px-3.5 text-lg",
        isActive && "bg-black text-white hover:bg-black hover:text-white"
      )}
    >
      <Link href={href}>{children}</Link>
    </Button>
  );
};

const navbarItems = [
  {
    href: "/",
    children: "Home",
  },
  {
    href: "/about",
    children: "About",
  },
  {
    href: "/features",
    children: "Features",
  },
  {
    href: "/pricing",
    children: "Pricing",
  },
  {
    href: "/contact",
    children: "Contact",
  },
];

export const Navbar = () => {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="h-20 flex border-b justify-between font-medium bg-white">
      <Link href={"/"} className="pl-6 flex items-center">
        <span className={cn("text-5xl font-semibold", poppins.className)}>
          parves
        </span>
      </Link>

      <NavbarSidebar
        items={navbarItems}
        open={isSidebarOpen}
        onOpnedChange={setIsSidebarOpen}
      />

      <div className="items-center gap-4 hidden lg:flex">
        {navbarItems.map((item) => (
          <NavbarItem
            key={item.href}
            href={item.href}
            isActive={pathname === item.href}
          >
            {item.children}
          </NavbarItem>
        ))}
      </div>
      <div className="hidden lg:flex ">
        <Button
          asChild
          variant={"secondary"}
          className="border-t-0 border-l border-b-0 border-r-0 h-full px-12 rounded-none bg-white hover:bg-pink-400 transition-colors text-lg"
        >
          <Link href={"/sign-in"}>Log in</Link>
        </Button>
        <Button
          asChild
          variant={"secondary"}
          className="border-t-0 border-l border-b-0 border-r-0 h-full px-12 rounded-none bg-black text-white hover:bg-pink-400 hover:text-white transition-colors text-lg"
        >
          <Link href={"/sign-up"}>Selling</Link>
        </Button>
      </div>

      <div className="flex lg:hidden items-center justify-center">
        <Button
          onClick={() => setIsSidebarOpen(true)}
          variant={"ghost"}
          className="size-12 border-transparent bg-white"
        >
          <MenuIcon />
        </Button>
      </div>
    </div>
  );
};
