"use client";

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-surface-muted">
      <div className="mx-auto w-full max-w-6xl pb-24 pt-safe-top">{children}</div>
    </div>
  );
};
