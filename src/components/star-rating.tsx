import { cn } from "@/lib/utils";
import { StarIcon } from "lucide-react";

const MAX_RATING = 5;
const MIN_RATING = 0;

interface StarRatingProps {
  rating: number;
  className?: string;
  iconClassName?: string;
  text?: string;
}

export const StartRating = ({
  rating,
  className,
  iconClassName,
  text,
}: StarRatingProps) => {
  const safeRaing = Math.max(MIN_RATING, Math.min(MAX_RATING, rating));

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: MAX_RATING }).map((_, index) => (
        <StarIcon
          key={index}
          className={cn(
            "w-4 h-4",
            index < safeRaing ? "fill-black" : "",
            iconClassName
          )}
        />
      ))}
      {text && <p className="text-sm">{text}</p>}
    </div>
  );
};
