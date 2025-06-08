import { useRouter } from "next/navigation";
import { useState } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CategoriesGetManyOutput } from "@/modules/categories/types";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

interface props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: CategoriesGetManyOutput;
}

const CategoriesSidebar = ({ open, onOpenChange, data }: props) => {
  const router = useRouter();
  const [parentCategory, setParentCategory] =
    useState<CategoriesGetManyOutput | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<
    CategoriesGetManyOutput[1] | null
  >(null);

  // id we have parent category we will show it in the sidebar, otherwisw show root category
  const currentCategory = parentCategory ?? data ?? [];
  const handleOpneChange = (opne: boolean) => {
    setSelectedCategory(null);
    setParentCategory(null);
    onOpenChange(opne);
  };

  const handleCategoryClick = (category: CategoriesGetManyOutput[1]) => {
    if (category.subcategories && category.subcategories.length > 0) {
      setParentCategory(category.subcategories as CategoriesGetManyOutput);
      setSelectedCategory(category);
    } else {
      // this is a leaf category (no subcategories)
      if (parentCategory && selectedCategory) {
        // this is a subbcategory -navigated to /category/subcategory
        router.push(`/${selectedCategory.slug}/${category.slug}`);
      } else {
        // this is a root category - navigated to /category
        if (category.slug === "all") {
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
