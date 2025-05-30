"use client";
import { Button } from "@/components/ui/button";
import { useProductsFilters } from "../../hooks/use-products-filters";
import { cn } from "@/lib/utils";

export const ProductSort = () => {
  const [filters, setFilters] = useProductsFilters();

  return (
    <div className="flex items-center gap-2">
      <Button
        size={"sm"}
        className={cn(
          "rounded-full bg-white hover:bg-white",
          filters.sort !== "curated" &&
            "bg-transparent border-transparent hover:bg-transparent hover:border-border"
        )}
        variant={"secondary"}
        onClick={() => setFilters({ sort: "curated" })}
      >
        curated
      </Button>
      <Button
        size={"sm"}
        className={cn(
          "rounded-full bg-white hover:bg-white",
          filters.sort !== "trending" &&
            "bg-transparent border-transparent hover:bg-transparent hover:border-border"
        )}
        variant={"secondary"}
        onClick={() => setFilters({ sort: "trending" })}
      >
        Trending
      </Button>
      <Button
        size={"sm"}
        className={cn(
          "rounded-full bg-white hover:bg-white",
          filters.sort !== "hot" &&
            "bg-transparent border-transparent hover:bg-transparent hover:border-border"
        )}
        variant={"secondary"}
        onClick={() => setFilters({ sort: "hot" })}
      >
        Hot
      </Button>
    </div>
  );
};
