import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CreatorJoinButton } from "@/components/creator-content-club/join-button";
import { CreatorEmailCaptureForm } from "@/components/creator-content-club/email-capture-form";

type PageProps = {
  params: { locale: string };
  searchParams?: Record<string, string | string[] | undefined>;
};

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "CreatorContentClub" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription")
  };
}

const getSingleQueryValue = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) return value[0];
  return value;
};

export default async function CreatorContentClubPage({ params: { locale }, searchParams = {} }: PageProps) {
  const t = await getTranslations({ locale, namespace: "CreatorContentClub" });
  const purchaseState = getSingleQueryValue(searchParams.purchase);

  const rawHighlights = t.raw("highlights");
  const highlights = Array.isArray(rawHighlights) ? (rawHighlights as string[]) : [];

  const successPath = `/${locale}/creator-content-club?purchase=success`;
  const cancelPath = `/${locale}/creator-content-club?purchase=cancel`;

  const emailCopy = {
    heading: t("emailHeading"),
    description: t("emailDescription"),
    inputLabel: t("emailInputLabel"),
    placeholder: t("emailPlaceholder"),
    submitLabel: t("emailSubmit"),
    loadingLabel: t("emailSubmitting"),
    successMessage: t("emailSuccess"),
    errorMessage: t("emailError"),
    invalidEmail: t("emailInvalid")
  };

  return (
    <main className="min-h-screen bg-[#979fa1] py-10 md:py-16">
      <div className="mx-auto w-full max-w-2xl px-4">
        <div className="rounded-3xl border border-white/50 bg-white/75 shadow-[0_25px_60px_-35px_rgba(15,23,42,0.8)] backdrop-blur-md">
          <div className="flex items-center gap-2 border-b border-slate-200/60 px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400/80" />
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400/60" />
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400/40" />
            <span className="ml-2">{t("windowLabel")}</span>
          </div>

          <div className="px-6 pb-8 pt-7 sm:px-8">
            <h1 className="text-center text-lg font-semibold text-slate-800">{t("heading")}</h1>

            <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200/70 shadow-inner">
              <div className="bg-[#f0f3ff]">
                <svg viewBox="0 0 1200 220" preserveAspectRatio="xMidYMid slice" className="h-auto w-full">
                  <defs>
                    <linearGradient id="ccc-gradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor="#e6e9ff" />
                      <stop offset="1" stopColor="#f7eaff" />
                    </linearGradient>
                  </defs>
                  <rect width="1200" height="220" fill="url(#ccc-gradient)" />
                  <g transform="translate(600,110) scale(1.2)">
                    <circle r="34" fill="#a48bff" />
                    <g fill="#8a6bff">
                      <circle r="28" transform="translate(-52,-4)" />
                      <circle r="28" transform="translate(52,-4)" />
                      <circle r="28" transform="translate(-4,-52)" />
                      <circle r="28" transform="translate(-4,52)" />
                      <circle r="28" transform="translate(0,0)" />
                    </g>
                    <circle r="22" fill="#c7bcff" />
                  </g>
                </svg>
              </div>
              <div className="space-y-3 bg-white px-6 pb-7 pt-6">
                <p className="text-sm font-bold uppercase tracking-wide text-slate-500">{t("tierLabel")}</p>
                <h2 className="text-2xl font-extrabold text-slate-900">{t("tierName")}</h2>
                <p className="text-base text-slate-600">{t("price")}</p>
                <CreatorJoinButton
                  successPath={successPath}
                  cancelPath={cancelPath}
                  label={t("joinCta")}
                  loadingLabel={t("joinLoading")}
                />
              </div>
            </section>

            <div className="mt-5 rounded-2xl border border-slate-200/70 bg-slate-50 px-6 py-5 text-sm text-slate-700">
              {highlights.map((item, index) => (
                <p key={index} className={index < highlights.length - 1 ? "mb-3" : undefined}>
                  {item}
                </p>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white px-5 py-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="h-6 w-6 rounded-lg bg-slate-100" aria-hidden="true" />
                <span className="font-medium text-slate-700">{t("giftLabel")}</span>
              </div>
              <a
                href={t("giftHref")}
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 font-semibold text-teal-700 transition hover:border-teal-600 hover:text-teal-600"
              >
                {t("giftCta")}
              </a>
            </div>
          </div>
        </div>

        {purchaseState === "cancel" && (
          <div className="mt-6 rounded-3xl border border-white/40 bg-white/70 p-6 text-sm text-rose-700 shadow-lg backdrop-blur">
            <h2 className="text-base font-semibold text-rose-800">{t("cancelHeading")}</h2>
            <p className="mt-1 text-sm text-rose-700">{t("cancelBody")}</p>
          </div>
        )}

        {purchaseState === "success" && (
          <CreatorEmailCaptureForm copy={emailCopy} />
        )}

        <p className="mt-6 text-center text-xs font-medium uppercase tracking-wide text-white/80">
          {t("siteCopyright")}
        </p>
      </div>
    </main>
  );
}
