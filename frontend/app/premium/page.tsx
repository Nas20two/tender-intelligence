"use client"

import { useState } from "react"
import { Shield, Check, Sparkles, ArrowRight, Mail } from "lucide-react"
import Link from "next/link"

export default function PremiumPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleUpgrade = async () => {
    if (!email || !email.includes('@')) return
    setLoading(true)
    setError('')

    // Capture lead (async, don't block checkout)
    fetch('/api/lead-capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }).catch(e => console.error('[TI Lead] Capture failed:', e))

    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Failed to create checkout')
      }
    } catch (e) {
      setError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  const features = [
    { title: 'Unlimited Tender Searches', desc: 'No daily query limits. Search as much as you need.' },
    { title: 'Weekly Email Alerts', desc: 'Get matching tenders delivered to your inbox every Monday.' },
    { title: 'Saved Searches & Watchlists', desc: 'Save your search criteria and track tenders over time.' },
    { title: 'AI-Powered Analysis', desc: 'Deep-dive analysis of tender documents and compliance requirements.' },
    { title: 'Priority Support', desc: 'Direct email support with 24-hour response time.' },
    { title: 'Export & Share', desc: 'Export tender data to CSV/PDF and share with your team.' },
  ]

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 dark:bg-slate-950/95 backdrop-blur">
        <div className="max-w-5xl mx-auto flex h-14 items-center px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-sm">
            <Shield className="w-5 h-5 text-blue-600" />
            Tender Intelligence
          </Link>
          <div className="ml-auto">
            <Link href="/ti" className="text-sm text-muted-foreground hover:text-foreground">
              ← Back to Tender Discovery
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 px-4 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4" />
          Premium Plan
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-3">
          Tender Intelligence Premium
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Unlock unlimited tender searches, AI-powered analysis, and weekly email alerts.
        </p>

        {/* Pricing Card */}
        <div className="bg-white dark:bg-slate-900 border rounded-2xl p-8 max-w-sm mx-auto shadow-lg">
          <div className="text-center mb-6">
            <span className="text-5xl font-bold">$19</span>
            <span className="text-lg text-muted-foreground">/month</span>
            <p className="text-sm text-muted-foreground mt-2">Cancel anytime. No lock-in.</p>
          </div>

          <div className="space-y-3 mb-8 text-left">
            {features.map((f, i) => (
              <div key={i} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-sm">{f.title}</span>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Email + Subscribe */}
          <div className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && handleUpgrade()}
            />
            <button
              onClick={handleUpgrade}
              disabled={!email || loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : (
                <>
                  Subscribe Now
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <p className="text-xs text-center text-muted-foreground mt-4">
            Secure payment via Stripe. Your subscription supports ongoing development.
          </p>
        </div>
      </section>

      {/* Free vs Premium Comparison */}
      <section className="max-w-3xl mx-auto px-4 pb-20">
        <h2 className="text-2xl font-bold text-center mb-8">Free vs Premium</h2>
        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="p-4 text-left font-medium">Feature</th>
                <th className="p-4 text-center font-medium">Free</th>
                <th className="p-4 text-center font-medium bg-blue-50 dark:bg-blue-950">Premium</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="p-4">Tender searches</td>
                <td className="p-4 text-center">5/day</td>
                <td className="p-4 text-center bg-blue-50 dark:bg-blue-950 font-semibold">Unlimited</td>
              </tr>
              <tr className="border-t">
                <td className="p-4">AI-powered analysis</td>
                <td className="p-4 text-center">Basic</td>
                <td className="p-4 text-center bg-blue-50 dark:bg-blue-950 font-semibold">Deep analysis</td>
              </tr>
              <tr className="border-t">
                <td className="p-4">Email alerts</td>
                <td className="p-4 text-center">—</td>
                <td className="p-4 text-center bg-blue-50 dark:bg-blue-950 font-semibold">Weekly digest</td>
              </tr>
              <tr className="border-t">
                <td className="p-4">Saved searches</td>
                <td className="p-4 text-center">—</td>
                <td className="p-4 text-center bg-blue-50 dark:bg-blue-950 font-semibold">Unlimited</td>
              </tr>
              <tr className="border-t">
                <td className="p-4">Data export</td>
                <td className="p-4 text-center">—</td>
                <td className="p-4 text-center bg-blue-50 dark:bg-blue-950 font-semibold">CSV/PDF</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
