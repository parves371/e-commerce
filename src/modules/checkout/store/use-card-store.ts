import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface TenentCard {
  productIds: string[];
}

interface CartState {
  tenantsCarts: Record<string, TenentCard>;
  addProduct: (tenantSlug: string, productId: string) => void;
  removeProduct: (tenantSlug: string, productId: string) => void;
  clearCart: (tenantSlug: string) => void;
  clearAllCarts: () => void;
  getCartByTenant: (tenantSlug: string) => string[];
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      tenantsCarts: {},
      addProduct: (tenantSlug, productId) =>
        set((state) => ({
          tenantsCarts: {
            ...state.tenantsCarts,
            [tenantSlug]: {
              productIds: [
                ...(state.tenantsCarts[tenantSlug]?.productIds || []),
                productId,
              ],
            },
          },
        })),
      removeProduct: (tenantSlug, productId) =>
        set((state) => ({
          tenantsCarts: {
            ...state.tenantsCarts,
            [tenantSlug]: {
              productIds:
                state.tenantsCarts[tenantSlug]?.productIds.filter(
                  (id) => id !== productId
                ) || [],
            },
          },
        })),
      clearCart: (tenantSlug) =>
        set((state) => {
          const existingCard = state.tenantsCarts[tenantSlug];
          if (!existingCard) return state; // nothing to clear
          return {
            tenantsCarts: {
              ...state.tenantsCarts,
              [tenantSlug]: {
                ...existingCard,
                productIds: [],
              },
            },
          };
        }),

      clearAllCarts: () =>
        set(() => ({
          tenantsCarts: {},
        })),
      getCartByTenant: (tenantSlug) =>
        get().tenantsCarts[tenantSlug]?.productIds || [],
    }),
    {
      name: "parves-cart",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
