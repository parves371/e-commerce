import Stripe from "stripe";

export type ProductMetadata = {
  stripeAccountId: string;
  id: string;
  name: string;
  price: number;
};

export type CheckoutMetadata = {
  userId: string;
};

export type ExpandedSessionItem = Stripe.LineItem & {
  price: Stripe.Price & {
    product: Stripe.Product & {
      metadata: ProductMetadata;
    };
  };
};
