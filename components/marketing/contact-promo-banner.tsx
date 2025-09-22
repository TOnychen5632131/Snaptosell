"use client";

import classNames from "classnames";
import { ArrowUpRight, Sparkles } from "lucide-react";

const toneStyles = {
  dark: {
    container:
      "border-white/20 bg-white/10 text-white shadow-[0_18px_50px_-28px_rgba(15,23,42,0.95)] hover:border-white/35 hover:bg-white/20 focus-visible:ring-white/60 focus-visible:ring-offset-slate-950",
    icon: "bg-white/15 text-white/90",
    accent: "text-sky-200",
  },
  light: {
    container:
      "border-slate-200/70 bg-white/90 text-slate-800 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.55)] hover:border-slate-300 hover:bg-white focus-visible:ring-slate-400 focus-visible:ring-offset-white",
    icon: "bg-slate-900 text-white",
    accent: "text-slate-500",
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

  return (
    <a
      href="mailto:digtialpulse@gmail.com"
      className={classNames(
        "group relative flex items-center justify-between gap-4 rounded-full border px-5 py-3 text-sm font-medium backdrop-blur transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        styles.container,
        className,
      )}
      aria-label="Contact Digital Pulse for bulk image editing"
    >
      <span className="flex items-center gap-3">
        <span
          className={classNames(
            "flex h-9 w-9 items-center justify-center rounded-full shadow-[0_12px_32px_-22px_rgba(15,23,42,0.8)] transition",
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
      <span className={classNames("flex items-center gap-1 text-xs font-semibold", styles.accent)}>
        digtialpulse@gmail.com
        <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </span>
    </a>
  );
};
