import type { Metadata } from "next";
import "./globals.css";
import { SupabaseProvider } from "@/providers/supabase-provider";

export const metadata: Metadata = {
  title: "EasyPic Web",
  description: "电商商品图在线增强"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <SupabaseProvider>{children}</SupabaseProvider>
      </body>
    </html>
  );
}
