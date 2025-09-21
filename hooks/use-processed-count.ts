"use client";
import { useEffect } from "react";
import useSWR from "swr";

type ProcessedCountResponse = { totalProcessed: number; error?: string };

const fetchProcessedCount = async (): Promise<ProcessedCountResponse> => {
  const response = await fetch("/api/stats/processed", { method: "GET" });
  let payload: ProcessedCountResponse | undefined;

  try {
    payload = (await response.json()) as ProcessedCountResponse;
  } catch (error) {
    console.error("Processed count response parsing failed", error);
    throw new Error("无法解析已处理图片数量的返回结果");
  }

  if (!response.ok) {
    const message = payload?.error ?? "Failed to load processed count";
    throw new Error(message);
  }

  const totalProcessed = Number.isFinite(payload?.totalProcessed) ? Number(payload?.totalProcessed) : 0;
  return { totalProcessed };
};

export const useProcessedCount = () => {
  const { data, mutate, error, isLoading } = useSWR("processed-count", fetchProcessedCount, {
    refreshInterval: 20000,
    shouldRetryOnError: true,
    onErrorRetry: (_error, _key, _config, revalidate, revalidateOpts) => {
      if ((revalidateOpts.retryCount ?? 0) >= 5) return;
      setTimeout(() => {
        revalidate({ retryCount: (revalidateOpts.retryCount ?? 0) + 1 });
      }, Math.min(30000, 2000 * ((revalidateOpts.retryCount ?? 0) + 1)));
    },
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = () => mutate();
    window.addEventListener("processed:updated", handler);
    return () => {
      window.removeEventListener("processed:updated", handler);
    };
  }, [mutate]);

  return {
    totalProcessed: data?.totalProcessed ?? 0,
    refresh: mutate,
    error,
    isLoading,
  };
};
