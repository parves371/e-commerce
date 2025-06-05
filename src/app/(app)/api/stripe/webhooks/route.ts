import { NextResponse } from "next/server";
import type { Stripe } from "stripe";

import { stripe } from "@/lib/stripe";
import { ExpandedSessionItem } from "@/modules/checkout/types";
import config from "@payload-config";
import { getPayload } from "payload";

export async function POST(req: Request) {
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      await (await req.blob()).text(),
      req.headers.get("stripe-signature") as string,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    if (error! instanceof Error) {
      console.log(`Stripe webhook error: ${error}`);
    }

    console.log(`Stripe webhook error: ${errorMessage}`);

    return NextResponse.json(
      { message: `whebhook Error: ${errorMessage}` },
      { status: 400 }
    );
  }

  console.log(`Successfully parsed webhook event: ${event.id}`);

  const permittedEvents: string[] = ["checkout.session.completed"];

  const payload = await getPayload({ config });

  if (permittedEvents.includes(event.type)) {
    let data;

    try {
      switch (event.type) {
        case "checkout.session.completed":
          data = event.data.object as Stripe.Checkout.Session;

          if (!data.metadata?.userId) {
            throw new Error("User ID is required");
          }

          const user = await payload.findByID({
            collection: "users",
            id: data.metadata.userId,
          });

          if (!user) {
            throw new Error("User not found");
          }

          const expandedSession = await stripe.checkout.sessions.retrieve(
            data.id,
            {
              expand: ["line_items.data.price.product"],
            }
          );

          if (
            !expandedSession.line_items?.data ||
            !expandedSession.line_items.data.length
          ) {
            throw new Error("Line items not found");
          }

          const lineItems = expandedSession.line_items
            .data as ExpandedSessionItem[];

          for (const item of lineItems) {
            console.log("Processing item:", item);

            // Get the product ID from metadata
            const productId = item.price.product.metadata?.id;
            
            if (!productId) {
              console.error("Product ID not found in metadata for item:", item.id);
              continue; // Skip this item if no product ID
            }

            // Verify the product exists in your database
            try {
              const product = await payload.findByID({
                collection: "products",
                id: productId,
              });

              if (!product) {
                console.error(`Product with ID ${productId} not found in database`);
                continue; // Skip this item if product doesn't exist
              }

              // Create the order with the correct product relationship
              await payload.create({
                collection: "orders",
                data: {
                  stripeCheckoutSessionId: data.id,
                  user: user.id,
                  products: productId, // This should now work as a relationship
                  name: item.price.product.name,
                },
              });

              console.log(`Order created successfully for product: ${productId}`);
            } catch (productError) {
              console.error(`Error processing product ${productId}:`, productError);
              // Continue with other items even if one fails
              continue;
            }
          }
          break;
        default:
          throw new Error(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error("Webhook handler error:", error);

      return NextResponse.json(
        {
          message: "Webhook handler failed",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        {
          status: 500,
        }
      );
    }
  }

  return NextResponse.json({ message: "Received" }, { status: 200 });
}
