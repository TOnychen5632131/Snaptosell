"use client";

import { useState } from "react";
import { startCheckout } from "@/lib/start-checkout";

type JoinButtonProps = {
  successPath: string;
  cancelPath: string;
  label: string;
  loadingLabel: string;
};

export const CreatorJoinButton = ({ successPath, cancelPath, label, loadingLabel }: JoinButtonProps) => {
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    setLoading(true);
    try {
      const url = await startCheckout({ successPath, cancelPath });
      window.location.href = url;
    } catch (error) {
      console.error("Creator Content Club checkout failed", error);
      const message = error instanceof Error ? error.message : "Unable to start checkout right now.";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleJoin}
      disabled={loading}
      className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-black/70 bg-black font-semibold text-[#6fbd67] transition duration-150 ease-out hover:translate-y-px hover:bg-black/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black disabled:cursor-not-allowed disabled:opacity-80"
    >
      {loading ? loadingLabel : label}
    </button>
  );
};
