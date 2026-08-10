import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LargeTextProvider } from "@/app/providers";
import Header from "@/app/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "화성맞춤 | 화성시 개인별 정책 지원",
  description: "내 정보를 입력하면 화성시 맞춤 복지·지원 정책을 찾아드립니다.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LargeTextProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-gray-100 bg-white py-5 mt-10">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
              <span className="font-semibold text-primary-600">화성맞춤</span>
              <span>화성시 개인별 맞춤형 정책 지원 서비스 · © 2026</span>
              <span>실제 수급 자격은 담당 부서에 문의하세요.</span>
            </div>
          </footer>
        </LargeTextProvider>
      </body>
    </html>
  );
}
