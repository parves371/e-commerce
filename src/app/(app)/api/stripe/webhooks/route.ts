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

  const permittedEvents: string[] = [
    "checkout.session.completed",
    "account.updated",
  ];

  const payload = await getPayload({ config });

  if (permittedEvents.includes(event.type)) {
    let data;

    try {
      switch (event.type) {
        case "checkout.session.completed":
          data = event.data.object as Stripe.Checkout.Session;

          if (!data.metadata?.userId) {
            throw new Error("User ID is requried");
          }

          const user = await payload.findByID({
            collection: "users",
            id: data.metadata.userId,
          });

          if (!user) {
            throw new Error("User  not found");
          }

          const expandedSession = await stripe.checkout.sessions.retrieve(
            data.id,
            {
              expand: ["line_items.data.price.product"],
            },
            {
              stripeAccount: event.account,
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
            console.log("item", item);

            await payload.create({
              collection: "orders",
              data: {
                stripeCheckoutSessionId: data.id,
                stripeAccountId: event.account,
                user: user.id,
                product: item.price.product.metadata.id,
                name: item.price.product.name,
              },
            });
          }
          break;
        case "account.updated":
          data = event.data.object as Stripe.Account;

          await payload.update({
            collection: "tenants",
            where: {
              stripeAccountId: {
                equals: data.id,
              },
            },
            data: {
              stripeDetailsSubmitted: data.details_submitted,
            },
          });
          break;

        default:
          throw new Error(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.log(error);

      return NextResponse.json(
        {
          message: "webhook handler Faild",
        },
        {
          status: 500,
        }
      );
    }
  }

  return NextResponse.json({ message: "Recived" }, { status: 200 });
}
