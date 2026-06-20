import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LiveTicker from "@/components/LiveTicker";

export const metadata: Metadata = {
  title: "CaseHug – CS2 Case Opening",
  description: "Open CS2 cases and win rare skins on CaseHug. Provably fair, instant results.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Fixed top bar: header (64px) + ticker (44px on md+) */}
        <div className="fixed top-0 left-0 right-0 z-50 flex flex-col">
          <Header />
          <div className="hidden md:block">
            <LiveTicker />
          </div>
        </div>

        {/* Main content */}
        <main style={{ paddingTop: 'var(--topbar-h)' }} className="min-h-screen">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
