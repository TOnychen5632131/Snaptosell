"use client";

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(130%_130%_at_50%_-15%,rgba(255,255,255,0.95)_0%,rgba(255,255,255,0.75)_45%,rgba(226,232,240,0.25)_80%,transparent_100%),radial-gradient(140%_140%_at_100%_10%,rgba(221,214,254,0.45),transparent_75%),radial-gradient(140%_140%_at_0%_100%,rgba(191,219,254,0.42),transparent_78%)]" />
        <div className="absolute inset-0 bg-white/60 mix-blend-screen" />
      </div>
      <div className="mx-auto w-full max-w-6xl pb-24 pt-safe-top">{children}</div>
    </div>
  );
};
