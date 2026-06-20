import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LiveFeed from "@/components/LiveFeed";

export const metadata: Metadata = {
  title: "CaseHug – CS2 Case Opening",
  description: "Open CS2 cases and win rare skins on CaseHug. Provably fair, instant results.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        {/* LiveFeed: hidden on mobile, visible on lg+ */}
        <div className="hidden lg:block">
          <LiveFeed />
        </div>
        <main className="pt-16 lg:pr-64 min-h-screen">
          {children}
        </main>
        <div className="lg:pr-64">
          <Footer />
        </div>
      </body>
    </html>
  );
}
