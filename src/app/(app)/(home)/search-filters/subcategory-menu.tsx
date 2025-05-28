import { Category } from "@/payload-types";
import Link from "next/link";

interface Props {
  category: Category;
  isOpen: boolean;
  position: {
    top: number;
    left: number;
  };
}

export const SubCatroryMenu = ({ category, isOpen, position }: Props) => {
  if (!isOpen || !category.subcategories || category.subcategories.length == 0)
    return null;
  const backGroundColor = category.color || "#F5F5F5";
  return (
    <div
      className="fixed z-100"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      {/* Invisalbe bridge to maintain hover state */}
      <div className="h-3 w-60" />
      <div
        style={{
          backgroundColor: backGroundColor,
        }}
        className="w-60 text-black rounded-md overflow-hidden border shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] -translate-x-[2px] -translate-y-[2px]"
      >
        <div>
          {category.subcategories?.map((subCategory: Category) => {
            return (
              <Link
                key={subCategory.slug}
                href="/"
                className="w-full text-left p-4 hover:bg-black hover:text-white flex justify-between items-center underline font-medium"
              >
                {subCategory.name}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
