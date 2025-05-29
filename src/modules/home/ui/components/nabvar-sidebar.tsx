import { ScrollArea } from "@/components/ui/scroll-area";
import {
  SheetTitle,
  Sheet,
  SheetContent,
  SheetHeader,
} from "@/components/ui/sheet";
import Link from "next/link";
interface NavbarItem {
  href: string;
  children: React.ReactNode;
}
interface props {
  items: NavbarItem[];
  open: boolean;
  onOpnedChange: (open: boolean) => void;
}

export const NavbarSidebar = ({ items, onOpnedChange, open }: props) => {
  return (
    <Sheet open={open} onOpenChange={onOpnedChange}>
      <SheetContent side="left" className="p-0 transition-none">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>Menu </SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex flex-col overflow-y-auto h-full pb-2'">
          {items.map((item) => (
            <Link
              href={item.href}
              key={item.href}
              className="w-full text-left p-4 hover:bg-black hover:text-white flex items-center text-base font-medium"
              onClick={() => onOpnedChange(false)}
            >
              {item.children}
            </Link>
          ))}
          <div className="border-t">
            <Link
              onClick={() => onOpnedChange(false)}
              href={"/sign-in"}
              className="w-full text-left p-4 hover:bg-black hover:text-white flex items-center text-base font-medium"
            >
              Sign in
            </Link>
            <Link
              onClick={() => onOpnedChange(false)}
              href={"/sign-up"}
              className="w-full text-left p-4 hover:bg-black hover:text-white flex items-center text-base font-medium"
            >
              Selling
            </Link>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
