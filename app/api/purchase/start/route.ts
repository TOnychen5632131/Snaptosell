import Stripe from "stripe";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

const stripeKey = process.env.STRIPE_SECRET_KEY ?? "";
const priceId = process.env.STRIPE_PRICE_ID ?? "";
const stripe = stripeKey ? new Stripe(stripeKey) : null;

export async function POST() {
  if (!stripe || !priceId) {
    return NextResponse.json({ error: "支付功能未配置，请稍后再试" }, { status: 400 });
  }

  const supabase = supabaseServer();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  try {
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
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?purchase=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?purchase=cancel`
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error", error);
    const message = error instanceof Error ? error.message : "未知错误";
    return NextResponse.json({ error: `创建支付失败：${message}` }, { status: 500 });
  }
}
