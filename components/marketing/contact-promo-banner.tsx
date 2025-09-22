"use client";

import classNames from "classnames";
import { ArrowUpRight, Sparkles } from "lucide-react";

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

  return (
    <a
      href="mailto:digtialpulse@gmail.com"
      className={classNames(
        "group relative flex w-full flex-col gap-4 rounded-3xl border px-5 py-4 text-sm font-medium backdrop-blur transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:px-6 md:flex-row md:items-center md:justify-between",
        styles.container,
        className,
      )}
      aria-label="Contact Digital Pulse for bulk image editing"
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
          <span className="text-sm font-semibold">
            Any product visuals, ready in batches.
          </span>
        </span>
      </span>
      <span
        className={classNames(
          "inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.2em]",
          ctaToneClass,
          "self-stretch justify-center rounded-full px-4 py-2 transition md:self-auto md:justify-start md:px-0 md:py-0",
        )}
      >
        点击这里联系
        <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </span>
    </a>
  );
};
