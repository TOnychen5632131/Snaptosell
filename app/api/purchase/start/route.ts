import Stripe from "stripe";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseServer } from "@/lib/supabase-server";

const stripeKey = process.env.STRIPE_SECRET_KEY ?? "";
const priceId = process.env.STRIPE_PRICE_ID ?? "";
const stripe = stripeKey ? new Stripe(stripeKey) : null;

const sanitizeRelativePath = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed.startsWith("/")) return null;
  if (trimmed.includes("://")) return null;
  if (trimmed.length > 512) return null;
  return trimmed;
};

export async function POST(request: Request) {
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
    let successPath: string | null = null;
    let cancelPath: string | null = null;

    if (request.headers.get("content-type")?.includes("application/json")) {
      const body = await request.json().catch(() => null);
      if (body && typeof body === "object") {
        successPath = sanitizeRelativePath((body as Record<string, unknown>).successPath);
        cancelPath = sanitizeRelativePath((body as Record<string, unknown>).cancelPath);
      }
    }

    const locale = cookies().get("NEXT_LOCALE")?.value ?? "en";
    const requestOrigin = new URL(request.url).origin;
    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? requestOrigin).replace(/\/$/, "");
    const defaultSuccess = `/${locale}/dashboard?purchase=success`;
    const defaultCancel = `/${locale}/dashboard?purchase=cancel`;

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
      success_url: `${baseUrl}${successPath ?? defaultSuccess}`,
      cancel_url: `${baseUrl}${cancelPath ?? defaultCancel}`
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: `Failed to create payment: ${message}` }, { status: 500 });
  }
}
