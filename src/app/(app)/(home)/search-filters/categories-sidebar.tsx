import { useState } from "react";
import { useRouter } from "next/navigation";

import { CoustomCategory } from "../types";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

interface props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: CoustomCategory[]; //TODO: removed latter
}

const CategoriesSidebar = ({ open, onOpenChange, data }: props) => {
  const router = useRouter();
  const [parentCategory, setParentCategory] = useState<
    CoustomCategory[] | null
  >(null);
  const [selectedCategory, setSelectedCategory] =
    useState<CoustomCategory | null>(null);

  // id we have parent category we will show it in the sidebar, otherwisw show root category
  const currentCategory = parentCategory ?? data ?? [];
  const handleOpneChange = (opne: boolean) => {
    setSelectedCategory(null);
    setParentCategory(null);
    onOpenChange(opne);
  };

  const handleCategoryClick = (category: CoustomCategory) => {
    if (category.subcategories && category.subcategories.length > 0) {
      setParentCategory(category.subcategories as CoustomCategory[]);
      setSelectedCategory(category);
    } else {
      // this is a leaf category (no subcategories)
      if (parentCategory && selectedCategory) {
        // this is a subbcategory -navigated to /category/subcategory
        router.push(`/${selectedCategory.slug}/${category.slug}`);
      } else {
        // this is a root category - navigated to /category
        if (category.slug === "photography") {
          router.push(`/`);
        } else {
          router.push(`/${category.slug}`);
        }
      }

      handleOpneChange(false);
    }
  };

  const handleBackClick = () => {
    if (parentCategory) {
      setParentCategory(null);
      setSelectedCategory(null);
    }
  };

  const backgroundColor = selectedCategory?.color || "white";

  return (
    <Sheet open={open} onOpenChange={handleOpneChange}>
      <SheetContent
        side="left"
        className="p-0 transition-none"
        style={{ backgroundColor }}
      >
        <SheetHeader className="p-4 border-b">
          <SheetTitle>Categories</SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex flex-col overflow-y-auto h-full pb-2">
          {parentCategory && (
            <button
              onClick={handleBackClick}
              className="w-full text-left p-4 hover:bg-black hover:text-white flex items-center text-base font-medium cursor-pointer"
            >
              <ChevronLeftIcon className="size-4 mr-2" />
              back
            </button>
          )}
          {currentCategory.map((category) => {
            return (
              <button
                key={category.slug}
                onClick={() => handleCategoryClick(category)}
                className="w-full text-left p-4 hover:bg-black hover:text-white flex items-center text-base font-medium justify-between cursor-pointer"
              >
                {category.name}
                {category.subcategories &&
                  category.subcategories.length > 0 && (
                    <ChevronRightIcon className="size-4" />
                  )}
              </button>
            );
          })}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default CategoriesSidebar;
