"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ListFilterIcon, SearchIcon } from "lucide-react";
import { useState } from "react";
import CategoriesSidebar from "./categories-sidebar";
import { CoustomCategory } from "../types";

interface SearchInputProps {
  disabled?: boolean;
  data: CoustomCategory[];
}
export const SearchInput = ({ disabled, data }: SearchInputProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
    <div className="flex items-center gap-2 w-full">
      <CategoriesSidebar
        data={data}
        open={isSidebarOpen}
        onOpenChange={setIsSidebarOpen}
      />
      <div className="relative w-full">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-500" />
        <Input className="pl-8" placeholder="Search..." disabled={disabled} />
      </div>
      {/* TODO: ADD Category View ALl button */}
      <Button
        variant={"eleveted"}
        className="shrink-0 flex lg:hidden size-12"
        onClick={() => setIsSidebarOpen(true)}
      >
        <ListFilterIcon />
      </Button>
      {/* TOTO: ADD Libary Button */}
    </div>
  );
};
