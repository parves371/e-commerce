interface Props {
  params: Promise<{
    subcategory: string;
    category: string;
  }>;
}

const page = async ({ params }: Props) => {
  const { subcategory, category } = await params;
  return (
    <div>
      category :{category}
      subcategoryL:{subcategory}
    </div>
  );
};

export default page;
