import type { Metadata } from "next";
import "./globals.css";
import { SupabaseProvider } from "@/providers/supabase-provider";
import {NextIntlClientProvider} from 'next-intl';
import {getMessages, getTranslator} from 'next-intl/server';

export async function generateMetadata({params: {locale}}: {params: {locale: string}}): Promise<Metadata> {
  const t = await getTranslations({locale, namespace: 'Metadata'});
 
  return {
    title: t('title'),
    description: t('description')
  };
}

export default async function RootLayout({ children, params: { locale } }: { children: React.ReactNode, params: { locale: string } }) {
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SupabaseProvider>{children}</SupabaseProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
