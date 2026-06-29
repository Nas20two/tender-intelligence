import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Shield } from "lucide-react"
import Link from 'next/link'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Tender Intelligence | AI-Powered Procurement',
  description: 'Enterprise-grade AI tools for government tender discovery, compliance analysis, and procurement intelligence',
  generator: 'v0.app',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground">
        {/* Top Navigation */}
        <header className="sticky top-0 z-50 w-full border-b bg-white/95 dark:bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="max-w-7xl mx-auto flex h-14 items-center gap-4 px-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-sm hover:text-blue-600 transition-colors">
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="hidden sm:inline">Tender Intelligence</span>
              <span className="sm:hidden">TI</span>
            </Link>

            <nav className="flex items-center gap-6 ml-8 text-sm">
              <Link href="/tenders" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                Browse Tenders
              </Link>
              <Link href="/ti" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                AI Search
              </Link>
              <Link href="/te" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                Tender Evaluator
              </Link>
              <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                About
              </Link>
              <Link href="/premium" className="text-blue-600 hover:text-blue-700 transition-colors font-medium flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                Premium
              </Link>
            </nav>

            <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Node.js + MCP
              </span>
            </div>
          </div>
        </header>

        <main>
          {children}
        </main>

        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}