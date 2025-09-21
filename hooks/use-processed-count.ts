"use client";
import { useEffect } from "react";
import useSWR from "swr";

type ProcessedCountResponse = { totalProcessed: number };

const fetchProcessedCount = async (): Promise<ProcessedCountResponse> => {
  const response = await fetch("/api/stats/processed", { method: "GET" });

  if (!response.ok) {
    throw new Error("Failed to load processed count");
  }

  const data = (await response.json()) as ProcessedCountResponse;
  return { totalProcessed: Number.isFinite(data.totalProcessed) ? Number(data.totalProcessed) : 0 };
};

export const useProcessedCount = () => {
  const { data, mutate } = useSWR("processed-count", fetchProcessedCount, { refreshInterval: 20000 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = () => mutate();
    window.addEventListener("processed:updated", handler);
    return () => {
      window.removeEventListener("processed:updated", handler);
    };
  }, [mutate]);

  return { totalProcessed: data?.totalProcessed ?? 0, refresh: mutate };
};
