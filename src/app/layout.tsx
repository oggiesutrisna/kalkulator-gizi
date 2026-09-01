import type { Metadata } from "next";
import Link from "next/link";
import { Apple, FolderOpen, Calculator } from "lucide-react";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: "Kalkulator Gizi TKPI 2020",
  description:
    "Aplikasi kalkulator dan estimasi nilai gizi menu makanan Indonesia berdasarkan data TKPI 2020.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDemo =
    process.env.NEXT_PUBLIC_DEMO_MODE === "true" ||
    process.env.NEXT_PUBLIC_APP_ENV === "demo";
  return (
    <html lang="id" className={cn("font-sans", inter.variable)}>
      <body className="min-h-screen bg-background text-foreground flex flex-col font-sans antialiased">
        <TooltipProvider>
          {/* Navigation Bar */}
          <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-2">
              <Link href="/calculator" className="flex items-center gap-2.5 font-bold text-foreground hover:opacity-90 transition-opacity shrink-0">
                <div className="p-1.5 rounded-lg bg-primary text-primary-foreground shadow-2xs">
                  <Apple className="h-4 w-4" />
                </div>
                <span className="text-sm sm:text-base font-extrabold tracking-tight">
                  Kalkulator Gizi <span className="text-primary font-black">TKPI</span>
                </span>
              </Link>

              {isDemo && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <Badge
                    variant="outline"
                    className="text-[10px] font-semibold tracking-widest uppercase px-2 py-0 border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300"
                  >
                    Demo
                  </Badge>
                  <span className="hidden lg:inline text-[11px] text-muted-foreground whitespace-nowrap">
                    Data TKPI 2020 • Formula MVP v1
                  </span>
                </div>
              )}

              <nav className="flex items-center gap-1 sm:gap-2">
                <Link
                  href="/calculator"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  <Calculator className="h-3.5 w-3.5 text-primary" />
                  <span>Kalkulator</span>
                </Link>

                <Link
                  href="/plans"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  <FolderOpen className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Rencana Tersimpan</span>
                </Link>
              </nav>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1">{children}</main>
        </TooltipProvider>
      </body>
    </html>
  );
}
