import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LiveFeed from "@/components/LiveFeed";
import LiveTicker from "@/components/LiveTicker";

export const metadata: Metadata = {
  title: "CaseHug – CS2 Case Opening",
  description: "Open CS2 cases and win rare skins on CaseHug. Provably fair, instant results.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Fixed top bar: header (64px) + ticker (44px) = 108px total */}
        <div className="fixed top-0 left-0 right-0 z-50 flex flex-col">
          <Header />
          {/* Ticker: hidden on mobile to keep it clean */}
          <div className="hidden md:block">
            <LiveTicker />
          </div>
        </div>

        {/* Live feed sidebar: hidden on mobile */}
        <div className="hidden lg:block">
          <LiveFeed />
        </div>

        {/* Main content: padding matches the CSS-variable topbar height */}
        <main style={{ paddingTop: 'var(--topbar-h)' }} className="lg:pr-64 min-h-screen">
          {children}
        </main>

        <div className="lg:pr-64">
          <Footer />
        </div>
      </body>
    </html>
  );
}
