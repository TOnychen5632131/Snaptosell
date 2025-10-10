"use client";

import { FormEvent, useState } from "react";

type EmailCaptureCopy = {
  heading: string;
  description: string;
  inputLabel: string;
  placeholder: string;
  submitLabel: string;
  loadingLabel: string;
  successMessage: string;
  errorMessage: string;
  invalidEmail: string;
};

type EmailCaptureFormProps = {
  copy: EmailCaptureCopy;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const CreatorEmailCaptureForm = ({ copy }: EmailCaptureFormProps) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!EMAIL_REGEX.test(email.trim())) {
      setStatus("error");
      setMessage(copy.invalidEmail);
      return;
    }

    setStatus("loading");
    setMessage("");
    try {
      const response = await fetch("/api/leads/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: email.trim().toLowerCase(), source: "creator-content-club" })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(
          payload && typeof payload.error === "string" && payload.error.length > 0 ? payload.error : copy.errorMessage
        );
      }

      setStatus("success");
      setMessage(copy.successMessage);
      setEmail("");
    } catch (error) {
      console.error("Failed to store email lead", error);
      setStatus("error");
      const fallback = error instanceof Error ? error.message : copy.errorMessage;
      setMessage(fallback);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="mt-6 rounded-3xl border border-white/40 bg-white/80 p-6 shadow-xl shadow-slate-900/10 backdrop-blur-sm md:mt-8"
    >
      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{copy.heading}</h2>
          <p className="mt-1 text-sm text-slate-600">{copy.description}</p>
        </div>
        <label className="sr-only" htmlFor="ccc-email-input">
          {copy.inputLabel}
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="ccc-email-input"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={copy.placeholder}
            className="h-11 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-800 shadow-inner focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
            autoComplete="email"
            disabled={status === "loading"}
            required
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="h-11 rounded-xl border border-black/70 bg-black px-6 font-semibold text-[#6fbd67] transition hover:translate-y-px hover:bg-black/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black disabled:cursor-not-allowed disabled:opacity-80"
          >
            {status === "loading" ? copy.loadingLabel : copy.submitLabel}
          </button>
        </div>
        {message && (
          <p
            className={`text-sm ${status === "success" ? "text-emerald-600" : "text-rose-600"}`}
            role={status === "success" ? "status" : "alert"}
          >
            {message}
          </p>
        )}
      </div>
    </form>
  );
};
