import { Checkbox } from "@/components/ui/checkbox";
import { DEFAULT_LIMIT } from "@/constants";
import { useTRPC } from "@/trpc/client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";

interface Props {
  value?: string[] | null;
  onChange: (value: string[]) => void;
}
export const TagsFilters = ({ onChange, value }: Props) => {
  const trpc = useTRPC();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery(
      trpc.tags.getMany.infiniteQueryOptions(
        {
          limit: DEFAULT_LIMIT,
        },
        {
          getNextPageParam: (lastpage) => {
            return lastpage.docs.length > 0 ? lastpage.nextPage : undefined;
          },
        }
      )
    );

  const onClick = (tag: string) => {
    if (value?.includes(tag)) {
      console.log({ value, tag });
      onChange(value.filter((t) => t !== tag) || []);
    } else {
      onChange([...(value || []), tag]);
    }
  };

  return (
    <div className="flex flex-col gap-y-2">
      {isLoading ? (
        <div className="flex items-center justify-center p-4">
          <Loader2Icon className="animate-spin size-4" />
        </div>
      ) : (
        data?.pages.map((page) =>
          page.docs.map((tag) => (
            <div
              //   onClick={() => onClick(tag.name)}
              key={tag.id}
              className="flex items-center justify-between cursor-pointer"
            >
              <p className="font-medium">{tag.name}</p>
              <Checkbox
                checked={value?.includes(tag.name)}
                onCheckedChange={() => onClick(tag.name)}
              />
            </div>
          ))
        )
      )}
      {hasNextPage && (
        <button
          disabled={isFetchingNextPage}
          onClick={() => fetchNextPage()}
          className="underline font-medium justify-start disabled:opacity-50 cursor-pointer"
        >
          Load more
        </button>
      )}
    </div>
  );
};
