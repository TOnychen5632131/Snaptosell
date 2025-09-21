"use client";

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_0%_0%,rgba(56,189,248,0.18),transparent_55%),radial-gradient(120%_120%_at_100%_0%,rgba(165,180,252,0.18),transparent_60%),linear-gradient(160deg,rgba(15,23,42,0.92)_0%,rgba(15,23,42,0.6)_45%,rgba(30,41,59,0.82)_100%)]" />
        <div className="absolute inset-0 bg-white/6 mix-blend-soft-light" />
      </div>
      <div className="mx-auto w-full max-w-6xl pb-24 pt-safe-top">{children}</div>
    </div>
  );
};
