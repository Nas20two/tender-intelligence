"use client"

import { Suspense, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { CheckCircle, Loader2, AlertCircle, Shield, ArrowRight } from "lucide-react"
import Link from "next/link"

function PremiumSuccessContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    if (!sessionId) {
      setStatus('error')
      setMessage('No session ID found.')
      return
    }

    fetch('/api/premium/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setStatus('success')
        setMessage('Your Tender Intelligence Premium subscription is active!')
      } else {
        setStatus('error')
        setMessage(data.error || 'Failed to activate subscription.')
      }
    })
    .catch(() => {
      setStatus('error')
      setMessage('Something went wrong. Please contact support.')
    })
  }, [sessionId])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Activating Your Subscription...</h2>
          <p className="text-muted-foreground">Setting up your premium features.</p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Something Went Wrong</h2>
          <p className="text-muted-foreground mb-6">{message}</p>
          <Link
            href="/premium"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700"
          >
            Try Again
          </Link>
        </div>
      </div>
    )
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      <h1 className="text-3xl font-bold mb-3">Your 7-Day Free Trial is Active! 🎉</h1>
      <p className="text-lg text-muted-foreground mb-8">Start using all premium features right now. No charge for 7 days.</p>

      <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6 text-sm text-left">
        <p className="font-medium mb-1">📅 Trial ends in 7 days</p>
        <p className="text-muted-foreground">We'll remind you before it ends. Cancel anytime — no questions asked.</p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-8 text-left">
        <h3 className="font-semibold mb-3">Your Premium benefits are now active:</h3>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
            Unlimited tender searches
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
            AI-powered deep analysis
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
            Weekly email alerts (coming soon)
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
            Priority support
          </li>
        </ul>
      </div>

      <Link
        href="/ti"
        className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-blue-700 transition"
      >
        Start Searching Tenders
        <ArrowRight className="w-4 h-4" />
      </Link>
    </main>
  )
}

export default function PremiumSuccessPage() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 dark:bg-slate-950/95 backdrop-blur">
        <div className="max-w-4xl mx-auto flex h-14 items-center px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-sm">
            <Shield className="w-5 h-5 text-blue-600" />
            Tender Intelligence
          </Link>
        </div>
      </header>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }>
        <PremiumSuccessContent />
      </Suspense>
    </div>
  )
}