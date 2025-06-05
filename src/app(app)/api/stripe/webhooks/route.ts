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

    console.log(`Stripe webhook error: ${errorMessage}`);

    return NextResponse.json(
      { message: `webhook Error: ${errorMessage}` },
      { status: 400 }
    );
  }

  console.log(`Successfully parsed webhook event: ${event.id}`);

  const permittedEvents: string[] = ["checkout.session.completed"];

  if (!permittedEvents.includes(event.type)) {
    return NextResponse.json({ message: "Event not handled" }, { status: 200 });
  }

  const payload = await getPayload({ config });

  try {
    const data = event.data.object as Stripe.Checkout.Session;

    if (!data.metadata?.userId) {
      throw new Error("User ID is required in metadata");
    }

    const user = await payload.findByID({
      collection: "users",
      id: data.metadata.userId,
    });

    if (!user) {
      throw new Error(`User with ID ${data.metadata.userId} not found`);
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
      throw new Error("No line items found in session");
    }

    const lineItems = expandedSession.line_items.data as ExpandedSessionItem[];

    for (const item of lineItems) {
      console.log("Processing item:", {
        price_id: item.price?.id,
        product_metadata: item.price?.product?.metadata,
        product_name: item.price?.product?.name,
      });

      // Get the product ID from Stripe product metadata
      const productMetadataId = item.price?.product?.metadata?.id;
      
      if (!productMetadataId) {
        console.error("No product ID found in Stripe product metadata");
        continue;
      }

      console.log(`Looking for product with ID: ${productMetadataId}`);

      // Verify the product exists in your PayloadCMS database
      try {
        const product = await payload.findByID({
          collection: "products",
          id: productMetadataId,
        });

        if (!product) {
          console.error(`Product with ID ${productMetadataId} not found in database`);
          continue;
        }

        console.log(`Found product: ${product.id}`);

        // Create the order
        const orderData = {
          stripeCheckoutSessionId: data.id,
          user: user.id,
          products: productMetadataId,
          name: item.price?.product?.name || product.name || `Order ${data.id}`,
          status: "completed" as const,
        };

        console.log("Creating order with data:", orderData);

        const createdOrder = await payload.create({
          collection: "orders",
          data: orderData,
        });

        console.log(`✅ Order created successfully: ${createdOrder.id}`);

      } catch (error) {
        console.error(`Error processing product ${productMetadataId}:`, error);
        
        // Log more details about the error
        if (error && typeof error === 'object' && 'message' in error) {
          console.error("Error details:", error.message);
        }
        
        continue;
      }
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

  return NextResponse.json({ message: "Webhook processed successfully" }, { status: 200 });
}