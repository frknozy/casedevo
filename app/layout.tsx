import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LiveFeed from "@/components/LiveFeed";

export const metadata: Metadata = {
  title: "CaseHug - CS2 Case Opening",
  description: "Open CS2 cases and win rare skins on CaseHug",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <LiveFeed />
        <main className="pt-16 pr-64 min-h-screen">
          {children}
        </main>
        <div className="pr-64">
          <Footer />
        </div>
      </body>
    </html>
  );
}
