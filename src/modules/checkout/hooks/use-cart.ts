import { useCartStore } from "../store/use-card-store";

export const useCart = (tenantSlug: string) => {
  const productIds = useCartStore(
    (state) => state.getCartByTenant(tenantSlug)
  );

  const {
    addProduct,
    clearAllCarts,
    clearCart,
    removeProduct,
  } = useCartStore();

  const toggleProduct = (productId: string) => {
    if (productIds.includes(productId)) {
      removeProduct(tenantSlug, productId);
    } else {
      addProduct(tenantSlug, productId);
    }
  };

  const isProductInCart = (productId: string) => {
    return productIds.includes(productId);
  };

  const clearTenantCart = () => {
    clearCart(tenantSlug);
  };

  return {
    productIds,
    addProduct: (productId: string) => addProduct(tenantSlug, productId),
    removeProduct: (productId: string) => removeProduct(tenantSlug, productId),
    clearCart: clearTenantCart,
    clearAllCarts,
    toggleProduct,
    isProductInCart,
    totalItems: productIds.length,
  };
};
