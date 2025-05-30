import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChangeEvent } from "react";

interface Props {
  minPrice?: string | null;
  maxPrice?: string | null;
  onMinPriceChange: (minPrice: string | null) => void;
  onMaxPriceChange: (maxPrice: string | null) => void;
}

export const formateAsCurrency = (value: string) => {
  const numericValue = value.replace(/[^0-9.]/g, "");

  const parts = numericValue.split(".");
  const formattedValue =
    parts[0] + (parts.length > 1 ? "." + parts[1]?.slice(0, 2) : "");

  if (!formattedValue) return "";

  const numberValue = parseFloat(formattedValue);
  if (isNaN(numberValue)) return "";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numberValue);
};

export const PriceFilters = ({
  onMaxPriceChange,
  onMinPriceChange,
  maxPrice,
  minPrice,
}: Props) => {
  const handleMinPricechange = (e: ChangeEvent<HTMLInputElement>) => {
    // get the  raw inpute value and extract only numeric values
    const numericValue = e.target.value.replace(/[^0-9.]/g, "");
    onMinPriceChange(numericValue);
  };

  const handleMaxPriceChange = (e: ChangeEvent<HTMLInputElement>) => {
    // get the  raw inpute value and extract only numeric values
    const numericValue = e.target.value.replace(/[^0-9.]/g, "");
    onMaxPriceChange(numericValue);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2">
        <Label className="font-medium text-base">Minmum price</Label>
        <Input
          type="text"
          placeholder="$0"
          value={minPrice ? formateAsCurrency(minPrice) : ""}
          onChange={handleMinPricechange}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label className="font-medium text-base">Maximum price</Label>
        <Input
          type="text"
          placeholder="∞" //Infinity sign
          value={maxPrice ? formateAsCurrency(maxPrice) : ""}
          onChange={handleMaxPriceChange}
        />
      </div>
    </div>
  );
};
