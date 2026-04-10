import type { Metadata } from "next"
import localFont from "next/font/local"

import "./globals.css"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const geist = localFont({
  src: "../docs/Geist-VariableFont_wght.ttf",
  variable: "--font-geist",
  display: "swap",
})

const geistMono = localFont({
  src: "../docs/GeistMono-VariableFont_wght.ttf",
  variable: "--font-mono",
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
        <ThemeProvider>
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
