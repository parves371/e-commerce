import { RefObject } from "react";

export const useDropdownPosition = (
  ref: RefObject<HTMLDivElement | null> | RefObject<HTMLDivElement>
) => {
  const getDropdownPosition = () => {
    if (!ref.current) return { top: 0, left: 0 };

    const rect = ref.current.getBoundingClientRect();
    const dropdownWidth = 240; //width of the dropdown (w-60=15rem =240px)

    // calculate the position of the dropdown
    let left = rect.left + window.scrollX;
    const top = rect.bottom + window.scrollY;

    // chect if dropDown would go off the right edge of the viewport
    if (left + dropdownWidth > window.innerWidth) {
      // align to right edge of the button
      left = rect.right + window.scrollX - dropdownWidth;

      // if still off screel , aling to the edge of the viewport with some padding
      if (left < 0) {
        left = window.scrollX - dropdownWidth - 16;
      }
    }

    // ensure dropdown doesnt go off left edge
    if (left < 0) {
      left = 16;
    }

    return { top, left };
  };

  return {
    getDropdownPosition,
  };
};
