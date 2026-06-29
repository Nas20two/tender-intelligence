"use client"

import Link from "next/link"
import { ArrowRight, FileText, CheckSquare, Shield, Server, UserCheck, ExternalLink } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-20 px-4 text-center max-w-3xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 shadow-lg">
            <FileText className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Tender Intelligence
        </h1>
        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
          AI-powered procurement tools built for government and enterprise.<br />
          Discover tenders. Evaluate compliance. Deploy in-house via MCP.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-sm">
            <Server className="w-3.5 h-3.5" /> Node.js + MCP
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-full text-sm">
            <UserCheck className="w-3.5 h-3.5" /> HITL Security
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-full text-sm">
            <Shield className="w-3.5 h-3.5" /> Air-Gapped Deploy
          </span>
        </div>
      </section>

      {/* Product Cards */}
      <section className="max-w-5xl mx-auto px-4 pb-20 space-y-6">
        <h2 className="text-2xl font-bold text-center mb-8">Products</h2>

        <div className="grid md:grid-cols-2 gap-6">

          {/* TI Card */}
          <div className="rounded-xl border bg-card p-6 hover:shadow-lg transition-shadow space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Tender Discovery</h3>
                <p className="text-sm text-muted-foreground">AI-powered tender search & analysis</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <ArrowRight className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                Real-time AusTender OCDS API integration
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                AI-powered tender analysis & win probability
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                HITL-approved email drafting & compliance checks
              </li>
            </ul>
            <Link
              href="/ti"
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Try live demo <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* TE Card */}
          <div className="rounded-xl border bg-card p-6 hover:shadow-lg transition-shadow space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50">
                <CheckSquare className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Tender Evaluator</h3>
                <p className="text-sm text-muted-foreground">Compliance scoring & bid evaluation</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <ArrowRight className="w-3.5 h-3.5 text-purple-500 mt-0.5 shrink-0" />
                RFT criteria extraction & compliance matching
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-3.5 h-3.5 text-purple-500 mt-0.5 shrink-0" />
                Deviation detection & weighted scoring
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-3.5 h-3.5 text-purple-500 mt-0.5 shrink-0" />
                MCP-based with pluggable rulesets (CPRs, state)
              </li>
            </ul>
            <Link
              href="/te"
              className="inline-flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700"
            >
              View prototype <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </section>

      {/* Architecture Summary */}
      <section className="py-16 px-4 bg-muted/30 border-t">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h2 className="text-xl font-bold">In-House MCP Deployment</h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            All products deploy inside your infrastructure via the Model Context Protocol. 
            No SaaS tenancy. No shared dependencies. Your security posture, your patch cadence, 
            your data. Built on Node.js — not Python/FastAPI — avoiding the dependency chain 
            risks of shared frameworks.
          </p>
          <Link
            href="/about"
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Read about the architecture <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center text-xs text-muted-foreground border-t">
        <p>Data sourced from AusTender OCDS API • Open Contracting Data Standard v1.1</p>
        <p className="mt-1">All AI outputs require HITL verification</p>
      </footer>
    </div>
  )
}