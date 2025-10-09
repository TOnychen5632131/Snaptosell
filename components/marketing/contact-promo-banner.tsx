"use client";

import { FormEvent, useState } from "react";
import classNames from "classnames";
import { ArrowUpRight, CheckCircle2, Sparkles } from "lucide-react";

const toneStyles = {
  dark: {
    container:
      "border-white/20 bg-white/10 text-white shadow-[0_18px_50px_-28px_rgba(15,23,42,0.95)] hover:border-white/35 hover:bg-white/20 focus-visible:ring-white/60 focus-visible:ring-offset-slate-950",
    icon: "bg-white/15 text-white/90",
  },
  light: {
    container:
      "border-slate-200/70 bg-white/90 text-slate-800 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.55)] hover:border-slate-300 hover:bg-white focus-visible:ring-slate-400 focus-visible:ring-offset-white",
    icon: "bg-slate-900 text-white",
  },
};

type ContactPromoBannerProps = {
  tone?: keyof typeof toneStyles;
  className?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const ContactPromoBanner = ({
  tone = "dark",
  className,
}: ContactPromoBannerProps) => {
  const styles = toneStyles[tone];
  const eyebrowTextClass = tone === "light" ? "text-slate-500" : "text-white/70";

  const ctaToneClass =
    tone === "light"
      ? "bg-slate-900 text-white hover:bg-slate-800 md:bg-transparent md:text-slate-600"
      : "bg-white/15 text-white hover:bg-white/25 md:bg-transparent md:text-sky-200";

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    setMessage(null);

    try {
      const response = await fetch("/api/leads/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, source: "contact-promo-banner" }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "Unable to save your email. Please try again.");
      }

      setStatus("success");
      setMessage("Thanks! We'll reach out shortly — your first video is just $0.10.");
      setEmail("");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to save your email. Please try again.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={classNames(
        "group relative flex w-full flex-col gap-4 rounded-3xl border px-5 py-4 text-sm font-medium backdrop-blur transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:px-6 md:flex-row md:items-center md:justify-between",
        styles.container,
        className,
      )}
      aria-label="Leave your email to request bulk edits"
    >
      <span className="flex items-start gap-3 md:items-center">
        <span
          className={classNames(
            "flex h-10 w-10 items-center justify-center rounded-full shadow-[0_12px_32px_-22px_rgba(15,23,42,0.8)] transition",
            styles.icon,
            tone === "light" ? "group-hover:bg-slate-800" : "group-hover:bg-white/20",
          )}
        >
          <Sparkles className="h-4 w-4" />
        </span>
        <span className="flex flex-col text-left leading-tight">
          <span className={classNames("text-xs uppercase tracking-[0.22em]", eyebrowTextClass)}>
            Need bulk edits?
          </span>
          <span className="text-sm font-semibold">Leave your email and we&apos;ll reach out.</span>
          <span className={classNames("text-xs", tone === "light" ? "text-slate-500" : "text-white/80")}>
            First video only $0.10 — we handle the rest.
          </span>
        </span>
      </span>

      <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center md:gap-3">
        <label className="sr-only" htmlFor="bulk-email-input">
          Email address
        </label>
        <input
          id="bulk-email-input"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className={classNames(
            "w-full rounded-full border px-4 py-2 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40 md:w-60",
            tone === "light"
              ? "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
              : "border-white/30 bg-white/10 text-white placeholder:text-white/60",
          )}
          disabled={status === "loading"}
        />
        <button
          type="submit"
          className={classNames(
            "inline-flex items-center gap-1 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
            ctaToneClass,
          )}
          disabled={status === "loading"}
        >
          {status === "loading" ? "Sending…" : "Notify me"}
          <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>
      </div>

      {message ? (
        <p
          className={classNames(
            "flex items-center gap-2 text-xs md:absolute md:-bottom-8 md:right-6",
            status === "success"
              ? tone === "light"
                ? "text-emerald-600"
                : "text-emerald-200"
              : tone === "light"
                ? "text-rose-500"
                : "text-rose-200",
          )}
          role="status"
        >
          {status === "success" ? <CheckCircle2 className="h-4 w-4" /> : null}
          {message}
        </p>
      ) : null}
    </form>
  );
};
