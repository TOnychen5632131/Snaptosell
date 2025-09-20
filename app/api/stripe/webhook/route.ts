import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { ensureUserProfile, setCurrentBalance } from "@/lib/supabase-admin";
import type { Database } from "@/types/supabase";

export const runtime = "nodejs";

const stripeSecret = process.env.STRIPE_SECRET_KEY ?? "";
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

export async function POST(request: Request) {
  if (!stripeSecret || !webhookSecret) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const stripe = new Stripe(stripeSecret);
  const body = await request.arrayBuffer();
  const signature = headers().get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(Buffer.from(body), signature, webhookSecret);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.user_id;
    if (userId) {
      const supabase = createClient<Database>(process.env.SUPABASE_SERVICE_URL!, process.env.SUPABASE_SERVICE_ROLE!);

      const ensureError = await ensureUserProfile(supabase, {
        id: userId,
        email: session.customer_details?.email ?? null
      });

      if (ensureError) {
        console.error("ensureUserProfile error", ensureError);
        return NextResponse.json({ error: "Account information error" }, { status: 500 });
      }

      await (supabase.from("payments") as any)
        .upsert({
          session_id: session.id,
          user_id: userId,
          status: "paid",
          amount_cents: session.amount_total ?? 0,
          credits_awarded: Number(process.env.CREDITS_PER_PURCHASE ?? "10000")
        });
      const { data: currentRow, error: currentError } = await (supabase.from("current_balance") as any)
        .select("balance")
        .eq("user_id", userId)
        .maybeSingle();

      if (currentError && currentError.code !== "PGRST116") {
        console.error("current_balance error", currentError);
        return NextResponse.json({ error: "Account information error" }, { status: 500 });
      }

      const currentBalance = Number(currentRow?.balance ?? 0) || 0;

      await (supabase as any).rpc("award_credits", {
        p_user: userId,
        p_delta: Number(process.env.CREDITS_PER_PURCHASE ?? "10000"),
        p_reason: "stripe_purchase",
        p_session: session.id
      });

      const newBalance = currentBalance + Number(process.env.CREDITS_PER_PURCHASE ?? "10000");
      const balanceUpdateError = await setCurrentBalance(supabase, userId, newBalance);

      if (balanceUpdateError) {
        console.error("setCurrentBalance error", balanceUpdateError);
      }
    }
  }

  return NextResponse.json({ received: true });
}
