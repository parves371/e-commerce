import { Category } from "@/payload-types";
import { Footer } from "./footer";
import { Navbar } from "./navbar";
import { SearchFilters } from "./search-filters";

import configPromise from "@payload-config";
import { getPayload } from "payload";
import { CoustomCategory } from "./types";

interface Props {
  children: React.ReactNode;
}
const layout = async ({ children }: Props) => {
  const payload = await getPayload({
    config: configPromise,
  });
  const data = await payload.find({
    collection: "categories",
    depth: 1, //populate labels
    pagination: false,
    where: {
      parent: {
        exists: false,
      },
    },
  });

  const formattedData:CoustomCategory[] = data.docs.map((doc) => ({
    ...doc,
    subcategories: (doc.subcategories?.docs ?? []).map((doc) => ({
      //because of depth 1, we are confident that the docs are categories
      ...(doc as Category),
      subcategories: undefined,
    })),
  }));

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <SearchFilters data={formattedData} />
      <div className="flex-1 bg-[#F4F4F0]">{children}</div>
      <Footer />
    </div>
  );
};

export default layout;
