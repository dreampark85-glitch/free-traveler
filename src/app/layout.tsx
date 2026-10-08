import type { Metadata } from "next";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import ToastViewport from "@/components/ui/Toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "Free Traveler",
  description:
    "자유여행을 준비하는 사람들을 위한 여행지, 국가별 안전정보, 동행 찾기 서비스",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <ToastViewport />
      </body>
    </html>
  );
}
