import { AuthGate } from "@/components/auth/auth-gate";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { HeaderCard } from "@/components/header/header-card";
import { ImagePanels } from "@/components/panels/image-panels";
import { StatusBanner } from "@/components/status/status-banner";
import { ActionGrid } from "@/components/actions/action-grid";
import { JobHistoryStrip } from "@/components/jobs/job-history-strip";
import { InviteCTA } from "@/components/invite/invite-cta";
import { SettingsDrawer } from "@/components/settings/settings-drawer";
import { FullScreenViewer } from "@/components/panels/fullscreen-viewer";
import { DebugConsole } from "@/components/debug/debug-console";
import { JobQueueSubscriber } from "@/hooks/use-job-queue";

export default function DashboardPage() {
  return (
    <AuthGate>
      <DashboardLayout>
        <JobQueueSubscriber />
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 pb-20 pt-8">
          <HeaderCard />
          <ImagePanels />
          <StatusBanner />
          <ActionGrid />
          <JobHistoryStrip />
          <InviteCTA />
        </div>
        <SettingsDrawer />
        <FullScreenViewer />
        <DebugConsole />
      </DashboardLayout>
    </AuthGate>
  );
}
