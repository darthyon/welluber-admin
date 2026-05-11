import type { Metadata } from "next"
import localFont from "next/font/local"

import "./globals.css"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
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
        <ThemeProvider>
          <TooltipProvider>
            {children}
            <Toaster position="top-right" expand={false} richColors />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
