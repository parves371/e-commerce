"use client";
import { useParams } from "next/navigation";
import { Categories } from "./categories";
import { SearchInput } from "./search-input";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { BreadcrumbNavigation } from "./breadcrumbs-navigatin";
import { DEFAULT_BG_COLOR } from "@/modules/home/constants";

export const SearchFilters = () => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.categories.getMany.queryOptions());

  const params = useParams();
  const categoryParam = params.category as string | undefined;
  const activeCategory = categoryParam || "photography";

  const activeCategoryData = data.find((cat) => cat.slug === activeCategory);

  const activeCategoryColor = activeCategoryData?.color || DEFAULT_BG_COLOR;
  const activeCatgoryName = activeCategoryData?.name || "Photography";

  const activeSubCategory = params.subcategory as string | undefined;
  const activeSubCategoryName =
    activeCategoryData?.subcategories.find(
      (cat) => cat.slug === activeSubCategory
    )?.name || null;

  return (
    <div
      className="px-4 lg:px-12 py-8 border-b flex flex-col gap-4 w-full"
      style={{ backgroundColor: activeCategoryColor }}
    >
      <SearchInput data={data} />
      <div className="hidden lg:block">
        <Categories data={data} />
      </div>
      <BreadcrumbNavigation
        activeCategoryName={activeCatgoryName}
        activeCategory={activeCategory}
        activeSubCategoryName={activeSubCategoryName}
      />
    </div>
  );
};

export const SearchFiltersSkeleton = () => {
  return (
    <div
      className="px-4 lg:px-12 py-8 border-b flex flex-col gap-4 w-full"
      style={{ backgroundColor: "#F5F5F5" }}
    >
      <SearchInput disabled data={[]} />
      <div className="hidden lg:block">
        <div className="h-11"></div>
      </div>
    </div>
  );
};
