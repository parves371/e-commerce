"use client";

import { cn } from "@/lib/utils";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import { useState } from "react";
import { PriceFilters } from "./price-filters";
import { useProductsFilters } from "../../hooks/use-products-filters";

interface ProductsFilterProps {
  title: string;
  className?: string;
  children: React.ReactNode;
}
const ProductsFilter = ({
  title,
  className,
  children,
}: ProductsFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = isOpen ? ChevronDownIcon : ChevronRightIcon;
  return (
    <div className={cn("p-4 border-b flex flex-col gap-2", className)}>
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center justify-between cursor-pointer"
      >
        <p className="font-medium">{title}</p>
        <Icon className="size-5" />
      </div>
      {isOpen && children}
    </div>
  );
};

export const ProductsFilters = () => {
  const [filters, setFilters] = useProductsFilters();

  const onChange = (key: keyof typeof filters, value: unknown) => {
    setFilters({ ...filters, [key]: value });
  };

  return (
    <div className="border rounded-md bg-white">
      <div className="p-4 border-b flex items-center justify-between">
        <p className="font-medium">Filters</p>
        <button className="underline" onClick={() => {}}>
          Clear
        </button>
      </div>
      <ProductsFilter title="Price">
        <PriceFilters
          maxPrice={filters.maxPrice}
          minPrice={filters.minPrice}
          onMinPriceChange={(value) => onChange("minPrice", value)}
          onMaxPriceChange={(value) => onChange("maxPrice", value)}
        />
      </ProductsFilter>
    </div>
  );
};
