"use client"

import { FileText, Server, UserCheck, Shield, Lock, CheckCircle, ArrowRight, Code2, Database, Bot } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 min-h-screen">

      {/* Header */}
      <div className="text-center space-y-3 pt-8">
        <div className="flex items-center justify-center gap-3">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 shadow-lg">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold">About Tender Intelligence</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Enterprise-grade AI procurement tools — built on MCP architecture, deployed in-house, 
          secured by design.
        </p>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Badge variant="secondary">MCP Architecture</Badge>
          <Badge variant="secondary">HITL Workflow</Badge>
          <Badge variant="secondary">Air-Gapped Deploy</Badge>
          <Badge variant="secondary">OCDS Compliant</Badge>
        </div>
      </div>

      {/* Why Node.js + MCP — BadHost Context */}
      <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 p-6 space-y-3">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          Security by Architecture
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          In May 2026, <strong>BadHost (CVE-2026-48710)</strong> was disclosed — a critical authentication 
          bypass in Starlette/FastAPI, the foundation of most Python-based AI tools. 325 million 
          weekly downloads. One character in the HTTP Host header bypasses path-based authorization. 
          MCP servers were explicitly called out as high-value targets.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Tender Intelligence is built on <strong>Node.js + raw MCP</strong> — not Python, not FastAPI. 
          This was a deliberate architectural decision. We don't inherit the dependency chain risk 
          of shared frameworks. When a CVE like BadHost drops, we assess and patch our own stack — 
          not someone else's timeline.
        </p>
        <div className="flex items-center gap-2 text-xs text-blue-600">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 rounded-full">Node.js MCP</span>
          <span>→</span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-muted-foreground rounded-full line-through">Python/FastAPI</span>
        </div>
      </div>

      {/* Architecture */}
      <div className="rounded-xl border p-6 space-y-4">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <Server className="w-5 h-5 text-blue-600" />
          Architecture
        </h2>
        <p className="text-sm text-muted-foreground">
          All products share the same core architecture: a thin Next.js frontend calling Node.js MCP servers 
          that connect to government data sources. No SaaS tenancy. No shared infrastructure.
        </p>

        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 font-bold text-sm flex items-center justify-center shrink-0">1</div>
            <div>
              <h4 className="font-semibold text-sm flex items-center gap-2">Frontend <Badge variant="outline" className="text-[10px]">Next.js / Vercel</Badge></h4>
              <p className="text-xs text-muted-foreground mt-1">React-based UI deployed on Vercel. Handles queries, displays results, routes to MCP servers.</p>
            </div>
          </div>
          <div className="flex justify-center"><ArrowRight className="w-4 h-4 text-muted-foreground rotate-90" /></div>
          <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 font-bold text-sm flex items-center justify-center shrink-0">2</div>
            <div>
              <h4 className="font-semibold text-sm flex items-center gap-2">MCP Server <Badge variant="outline" className="text-[10px]">Node.js</Badge></h4>
              <p className="text-xs text-muted-foreground mt-1">Implements Model Context Protocol. Registers tools (search_austender, extract_criteria, etc.) as callable functions.</p>
            </div>
          </div>
          <div className="flex justify-center"><ArrowRight className="w-4 h-4 text-muted-foreground rotate-90" /></div>
          <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 font-bold text-sm flex items-center justify-center shrink-0">3</div>
            <div>
              <h4 className="font-semibold text-sm flex items-center gap-2">Data Sources <Badge variant="outline" className="text-[10px]">Government API</Badge></h4>
              <p className="text-xs text-muted-foreground mt-1">AusTender OCDS API, Commonwealth Procurement Rules, state government portals (as added).</p>
            </div>
          </div>
        </div>
      </div>

      {/* HITL */}
      <div className="rounded-xl border p-6 space-y-4">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-blue-600" />
          Human-in-the-Loop
        </h2>
        <p className="text-sm text-muted-foreground">
          AI agents cannot take unilateral external actions. All emails, compliance approvals, and procurement 
          decisions require human approval before execution.
        </p>
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900 text-sm">
            <Lock className="w-4 h-4 text-amber-600 mb-1" />
            <p className="font-medium text-xs">Environment Protection</p>
            <p className="text-xs text-muted-foreground mt-1">CI/CD pauses for human approval before sends</p>
          </div>
          <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900 text-sm">
            <CheckCircle className="w-4 h-4 text-amber-600 mb-1" />
            <p className="font-medium text-xs">Audit Trail</p>
            <p className="text-xs text-muted-foreground mt-1">Every action logged with timestamps & approval IDs</p>
          </div>
          <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900 text-sm">
            <Shield className="w-4 h-4 text-amber-600 mb-1" />
            <p className="font-medium text-xs">Least Privilege</p>
            <p className="text-xs text-muted-foreground mt-1">Agents can draft but never send unilaterally</p>
          </div>
        </div>
      </div>

      {/* Deployment Model */}
      <div className="rounded-xl border p-6 space-y-3">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-600" />
          In-House Deployment
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          We don't run a SaaS platform. Every product deploys inside client infrastructure via MCP. 
          Your data stays on your network. Your security posture applies. Your patch cadence.
        </p>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" /> <span className="text-muted-foreground">No shared tenancy — each deployment is isolated</span></li>
          <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" /> <span className="text-muted-foreground">No inherited vulnerabilities from shared framework chains</span></li>
          <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" /> <span className="text-muted-foreground">No ISO certification bottleneck — runs in your certified environment</span></li>
          <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" /> <span className="text-muted-foreground">Build + deploy fee + optional retainer. No SaaS overhead.</span></li>
        </ul>
      </div>

      {/* How to Use */}
      <div className="rounded-xl border p-6 space-y-3">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <Code2 className="w-5 h-5 text-blue-600" />
          Products
        </h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">TI</span>
            <div>
              <p className="font-medium">Tender Discovery</p>
              <p className="text-xs text-muted-foreground">Search AusTender, analyze opportunities, draft responses — with HITL approval built in.</p>
              <Link href="/ti" className="text-blue-600 hover:underline text-xs font-medium inline-flex items-center gap-1 mt-1">
                Try live demo <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
            <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0">TE</span>
            <div>
              <p className="font-medium">Tender Evaluator</p>
              <p className="text-xs text-muted-foreground">Extract criteria, check compliance, detect deviations, score bids. MCP-based with pluggable rulesets.</p>
              <Link href="/te" className="text-purple-600 hover:underline text-xs font-medium inline-flex items-center gap-1 mt-1">
                View prototype <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <footer className="text-center text-xs text-muted-foreground pb-8">
        <p>Data sourced from AusTender OCDS API • Open Contracting Data Standard v1.1</p>
        <p className="mt-1">All AI outputs require HITL verification</p>
      </footer>
    </div>
  )
}