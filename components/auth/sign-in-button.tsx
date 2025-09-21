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
    <div className="w-full max-w-sm space-y-6 text-left text-slate-800">
      <form onSubmit={handleEmail} className="space-y-3">
        <label className="block text-sm font-medium tracking-wide text-slate-600">Email Login</label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full flex-1 rounded-full border border-white/60 bg-white/70 px-5 py-3 text-sm text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-xl placeholder:text-slate-500 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-200/60"
            placeholder="填写你的邮箱"
            required
          />
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-full border border-sky-300/60 bg-gradient-to-r from-sky-500 to-cyan-400 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_38px_-26px_rgba(14,165,233,0.85)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_44px_-24px_rgba(14,165,233,0.9)] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
            disabled={status !== "idle"}
          >
            <Mail className="h-4 w-4" />
            {status === "email" ? "Sending…" : "Send Magic Link"}
          </button>
        </div>
      </form>

      <div className="relative">
        <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-xs uppercase tracking-[0.35em] text-slate-500">
          OR
        </span>
        <div className="border-t border-dashed border-white/40" />
      </div>

      <button
        onClick={handleGoogle}
        className="flex w-full items-center justify-center gap-2 rounded-full border border-white/60 bg-white/60 px-5 py-3 text-sm font-semibold text-slate-700 shadow-[0_20px_42px_-28px_rgba(15,23,42,0.6)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/70 disabled:cursor-not-allowed disabled:opacity-70"
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
