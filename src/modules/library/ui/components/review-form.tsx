import { StarPicker } from "@/components/star-picker";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { ReviewsGetOneOutput } from "@/modules/reviews/types";
import { useTRPC } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface ReviewFormProps {
  initialdata?: ReviewsGetOneOutput;
  productId: string;
}

const formSchema = z.object({
  rating: z.number().min(1, "rating is required").max(5),
  description: z.string().min(1),
});

export const ReviewForm = ({ initialdata, productId }: ReviewFormProps) => {
  const [isPreview, setIsPreview] = useState(!!initialdata);

  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const createReview = useMutation(
    trpc.reviews.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.reviews.getOne.queryOptions({ productId })
        );
        setIsPreview(true);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const updateReview = useMutation(
    trpc.reviews.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.reviews.getOne.queryOptions({ productId })
        );
        setIsPreview(true);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rating: initialdata?.rating ?? 0,
      description: initialdata?.description ?? "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (initialdata) {
      updateReview.mutate({
        reviewId: initialdata.id,
        rating: values.rating,
        description: values.description,
      });
    } else {
      createReview.mutate({
        productId,
        rating: values.rating,
        description: values.description,
      });
    }
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-y-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <p className="font-medium">
          {isPreview ? "your rating" : "liked it? Give it a rating"}
        </p>

        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <StarPicker
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isPreview}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="write a review"
                  disabled={isPreview}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!isPreview && (
          <Button
            variant={"eleveted"}
            disabled={createReview.isPending || updateReview.isPending}
            type="submit"
            size={"lg"}
            className="bg-black text-white hover:bg-pink-400 hover:text-primary w-fit"
          >
            {initialdata ? "Update" : "Post review"}
          </Button>
        )}
      </form>
      {isPreview && (
        <Button
          variant={"eleveted"}
          className="w-fit mt-4"
          onClick={() => setIsPreview(false)}
          type="button"
        >
          Edit review
        </Button>
      )}
    </Form>
  );
};
