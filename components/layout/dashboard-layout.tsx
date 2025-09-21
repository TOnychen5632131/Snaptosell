"use client";

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(140%_140%_at_10%_0%,rgba(191,219,254,0.32),transparent_60%),radial-gradient(140%_140%_at_90%_-5%,rgba(221,214,254,0.28),transparent_65%),radial-gradient(160%_140%_at_20%_100%,rgba(125,211,252,0.25),transparent_70%),linear-gradient(165deg,rgba(248,250,252,0.95)_0%,rgba(255,255,255,0.9)_48%,rgba(238,242,255,0.92)_100%)]" />
        <div className="absolute inset-0 bg-white/30 mix-blend-soft-light" />
      </div>
      <div className="mx-auto w-full max-w-6xl pb-24 pt-safe-top">{children}</div>
    </div>
  );
};
