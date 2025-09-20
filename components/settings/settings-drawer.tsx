"use client";
import { useTranslations } from "next-intl";
import { Dialog } from "@headlessui/react";
import { settingsStore } from "@/lib/ui-state";
import { useProfile } from "@/hooks/use-profile";
import { useCredits } from "@/hooks/use-credits";
import { LogOut } from "lucide-react";
import { useSupabase } from "@/providers/supabase-provider";
import { useSessionContext } from "@supabase/auth-helpers-react";

export const SettingsDrawer = () => {
  const t = useTranslations('SettingsDrawer');
  const { isOpen, close } = settingsStore();
  const { profile } = useProfile();
  const { balance, freeUses } = useCredits();
  const supabase = useSupabase();
  const { session } = useSessionContext();

  const email = profile?.email ?? session?.user.email ?? t('unknown');

  return (
    <Dialog open={isOpen} onClose={close} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex justify-end">
        <Dialog.Panel className="w-full max-w-md bg-white p-8 shadow-soft">
          <header className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-800">{t('title')}</h2>
            <button onClick={close} className="text-sm text-slate-400">
              {t('close')}
            </button>
          </header>
          <div className="space-y-6 text-sm text-slate-600">
            <section>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">{t('accountInfo')}</h3>
              <p>{t('loggedInAs', { email })}</p>
            </section>
            <section>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">{t('creditsAndUses')}</h3>
              <ul className="space-y-2">
                <li>{t('creditBalance', { balance })}</li>
                <li>{t('freeUsesRemaining', { freeUses })}</li>
              </ul>
            </section>
            <section>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">{t('support')}</h3>
              <div className="space-y-2">
                <a href="mailto:support@easypicapp.com" className="text-brand-primary hover:text-brand-accent">
                  {t('contactSupport')}
                </a>
                <div className="flex gap-3 text-xs text-slate-400">
                  <a href="https://www.easypicapp.com/privacy" target="_blank" rel="noreferrer">
                    {t('privacyPolicy')}
                  </a>
                  <a href="https://www.easypicapp.com/terms" target="_blank" rel="noreferrer">
                    {t('termsOfService')}
                  </a>
                </div>
              </div>
            </section>
          </div>
          <footer className="mt-10 space-y-3">
            <button
              onClick={() => supabase.auth.signOut()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <LogOut className="h-4 w-4" />
              {t('logout')}
            </button>
            <p className="text-center text-[11px] text-slate-400">{t('version')}</p>
          </footer>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
