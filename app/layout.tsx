import type { Metadata } from "next"
import localFont from "next/font/local"

import "./globals.css"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { NetworkStatusBanner } from "@/components/shared/network-status-banner"
import { Toaster } from "sonner"

const geist = localFont({
  src: "../public/fonts/Geist-VariableFont_wght.ttf",
  variable: "--font-geist",
  weight: "100 900",
  display: "swap",
})

const geistMono = localFont({
  src: "../public/fonts/GeistMono-VariableFont_wght.ttf",
  variable: "--font-mono",
  weight: "100 900",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "WellUber Console",
    template: "%s | WellUber Console",
  },
  description: "Flexi-benefit management platform for corporate organizations",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", geist.variable, geistMono.variable)}
    >
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-xs focus:font-semibold focus:text-primary-foreground focus:shadow-lg focus:outline-none"
        >
          Skip to main content
        </a>
        <ThemeProvider>
          <TooltipProvider>
            {children}
            <NetworkStatusBanner />
            <Toaster position="top-right" expand={false} richColors />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
