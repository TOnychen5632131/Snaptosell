import Stripe from "stripe";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

const stripeKey = process.env.STRIPE_SECRET_KEY ?? "";
const stripe = stripeKey ? new Stripe(stripeKey) : null;

export async function POST() {
  if (!stripe) {
    return NextResponse.json({ error: "未配置 Stripe" }, { status: 500 });
  }

  const supabase = supabaseServer();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: user.email ?? undefined,
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID,
        quantity: 1
      }
    ],
    metadata: { user_id: user.id },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?purchase=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?purchase=cancel`
  });

  return NextResponse.json({ url: session.url });
}
