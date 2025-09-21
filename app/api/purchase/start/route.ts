import Stripe from "stripe";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseServer } from "@/lib/supabase-server";

const stripeKey = process.env.STRIPE_SECRET_KEY ?? "";
const priceId = process.env.STRIPE_PRICE_ID ?? "";
const stripe = stripeKey ? new Stripe(stripeKey) : null;

export async function POST() {
  if (!stripe || !priceId) {
    return NextResponse.json({ error: "Payment feature not configured, please try again later" }, { status: 400 });
  }

  const supabase = supabaseServer();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  try {
    const locale = cookies().get("NEXT_LOCALE")?.value ?? "en";
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user.email ?? undefined,
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      metadata: { user_id: user.id },
      success_url: `${baseUrl}/${locale}/dashboard?purchase=success`,
      cancel_url: `${baseUrl}/${locale}/dashboard?purchase=cancel`
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: `Failed to create payment: ${message}` }, { status: 500 });
  }
}
