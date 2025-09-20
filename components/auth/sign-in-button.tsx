"use client";
import { FormEvent, useState } from "react";
import { LogIn, Mail } from "lucide-react";
import { useSupabase } from "@/providers/supabase-provider";

const redirectTo = process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback` : undefined;

export const SignInButton = () => {
  const supabase = useSupabase();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "email" | "google">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email) {
      setError("Please enter email address");
      return;
    }
    setStatus("email");
    setMessage(null);
    setError(null);
    try {
      const { error: requestError } = await supabase.auth.signInWithOtp({
        email,
        options: redirectTo ? { emailRedirectTo: redirectTo } : undefined
      });
      if (requestError) throw requestError;
      setMessage("Verification email sent, please check your email to complete login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send email, please try again later");
    } finally {
      setStatus("idle");
    }
  };

  const handleGoogle = async () => {
    setStatus("google");
    setMessage(null);
    setError(null);
    try {
      const { data, error: requestError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: redirectTo ? { redirectTo } : undefined
      });
      if (requestError) throw requestError;
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      setStatus("idle");
      setError("No redirect URL received, please try again later");
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Redirect failed, please try again later");
    }
  };

  return (
    <div className="w-full max-w-sm space-y-6 text-left">
      <form onSubmit={handleEmail} className="space-y-3">
        <label className="block text-sm font-medium text-slate-700">Email Login</label>
        <div className="flex items-center gap-3">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="flex-1 rounded-full border border-slate-200 px-4 py-3 text-sm shadow-inner focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
            placeholder="you@example.com"
            required
          />
          <button
            type="submit"
            className="flex items-center gap-2 rounded-full bg-brand-primary px-4 py-2 text-sm font-medium text-white shadow-card transition hover:bg-brand-accent disabled:bg-slate-400"
            disabled={status !== "idle"}
          >
            <Mail className="h-4 w-4" />
            {status === "email" ? "Sending…" : "Send Magic Link"}
          </button>
        </div>
      </form>

      <div className="relative">
        <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-xs uppercase tracking-wide text-slate-400">
          OR
        </span>
        <div className="border-t border-dashed border-slate-200" />
      </div>

      <button
        onClick={handleGoogle}
        className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-card transition hover:bg-slate-50 disabled:bg-slate-100"
        disabled={status !== "idle"}
      >
        <LogIn className="h-4 w-4 text-brand-primary" />
        {status === "google" ? "Redirecting…" : "Login with Google"}
      </button>

      {(message || error) && (
        <p className={`text-sm ${error ? "text-rose-500" : "text-emerald-600"}`}>{error ?? message}</p>
      )}
    </div>
  );
};
