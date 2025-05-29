import { Category } from "@/payload-types";

export type CoustomCategory = Category & {
  subcategories?: CoustomCategory[];
};