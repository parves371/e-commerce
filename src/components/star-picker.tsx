"use client";

import { cn } from "@/lib/utils";
import { StarIcon } from "lucide-react";
import { useState } from "react";

interface StarPickerProps {
  value?: number;
  onChange: (rating: number) => void;
  disabled?: boolean;
  className?: string;
}

export const StarPicker = ({
  value = 0,
  onChange,
  disabled = false,
  className,
}: StarPickerProps) => {
  const [hoverValue, setHoverValue] = useState(0);

  const handleChange = (rating: number) => {
    onChange(rating);
  };

  



  return (
    <div
      className={cn(
        "flex items-center",
        disabled ? "opacity-50 cursor-not-allowed" : "",
        className
      )}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          type="button"
          key={star}
          disabled={disabled}
          aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
          className={cn(
            "p-0.5 transition-transform",
            !disabled && "hover:scale-110 cursor-pointer"
          )}
          onClick={() => handleChange(star)}
          onMouseEnter={() => setHoverValue(star)}
          onMouseLeave={() => setHoverValue(0)}
        >
          <StarIcon
            className={cn(
              "w-4 h-4",
              star <= (hoverValue || value)
                ? "fill-black stroke-black"
                : "stroke-black"
            )}
          />
        </button>
      ))}
    </div>
  );
};
