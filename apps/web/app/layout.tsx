import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "OpenGPU - The Open Source GPU Cloud Marketplace",
  description:
    "Rent GPUs on demand or earn money by sharing your idle GPU power. The open source GPU cloud for AI, ML, rendering, and compute workloads.",
  keywords: [
    "GPU cloud",
    "rent GPU",
    "GPU marketplace",
    "AI computing",
    "machine learning",
    "open source",
    "GPU sharing",
  ],
  openGraph: {
    title: "OpenGPU - The Open Source GPU Cloud Marketplace",
    description:
      "Rent GPUs on demand or earn money by sharing your idle GPU power.",
    type: "website",
    siteName: "OpenGPU",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.variable} style={{ fontFamily: "var(--font-inter)" }}>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
