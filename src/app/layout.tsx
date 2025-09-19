import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppHeader } from "@/components/AppHeader";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { ExcludedSegmentsProvider } from "@/context/ExcludedSegmentsContext";
import { CampaignsProvider } from "@/context/CampaignsContext";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Campaign Scheduler",
  description: "Manage and schedule your Klaviyo email campaigns",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ExcludedSegmentsProvider>
          <CampaignsProvider>
          <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          >
          <AppHeader />

          <main className="container mx-auto py-8">
            {children}
          </main>
          <Toaster />
          </ThemeProvider>
          </CampaignsProvider>
        </ExcludedSegmentsProvider>
      </body>
    </html>
  );
}
