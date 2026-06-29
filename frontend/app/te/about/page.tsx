"use client"

import { FileText, CheckSquare, AlertTriangle, TrendingUp, FileSpreadsheet, Shield, ArrowRight } from "lucide-react"
import Link from "next/link"

const STEPS = [
  {
    icon: FileText,
    label: "1. Extract Criteria",
    color: "purple",
    summary: "Generate the compliance checklist for a procurement.",
    detail: "Select jurisdiction (Federal, NSW, VIC, QLD), enter the estimated contract value, and pick the entity type (corporate/non-corporate). The engine applies the relevant Commonwealth Procurement Rules (CPRs) or state-level equivalent to generate a tailored set of evaluation criteria — from core principles like Value for Money down to compliance gates like ISO 27001, WHS, and financial viability.",
  },
  {
    icon: CheckSquare,
    label: "2. Check Compliance",
    color: "emerald",
    summary: "See how a bidder stacks up against each criterion.",
    detail: "Enter a bidder name and paste evidence for each compliance gate in `gate_id: evidence text` format. The engine cross-references each gate's evidence pattern against your input — flagging compliant, non-compliant, or needs-human-review. Mandatory gates that fail block the bidder from proceeding.",
  },
  {
    icon: AlertTriangle,
    label: "3. Detect Deviations",
    color: "amber",
    summary: "Spot conditional language, exceptions, and risks.",
    detail: "Analyses the same evidence for red flags — conditional wording (`alternatively`, `subject to`), direct exceptions (`take exception to`), and proposal variations. Each deviation gets a severity rating (high/medium/low) so evaluators know where to focus.",
  },
  {
    icon: TrendingUp,
    label: "4. Score Bids",
    color: "blue",
    summary: "Weighted scoring across all criteria.",
    detail: "Each criterion carries a weight (e.g. Value for Money = 20%, ISO 27001 = 10%). The engine calculates weighted scores per bidder based on compliance status — compliant gates score higher, non-compliant gates score lower. Results are ranked to show the strongest submission.",
  },
  {
    icon: FileSpreadsheet,
    label: "5. Generate Report",
    color: "indigo",
    summary: "A complete evaluation report with recommendation.",
    detail: "Collates everything into a structured report: procurement overview, criteria breakdown, per-bidder compliance matrices, deviation summaries, scoring rankings, and a final recommendation. Export-ready for audit trails and procurement panels.",
  },
]

const COLORS = {
  purple: { bg: "bg-purple-50/50 border-purple-200", icon: "bg-purple-600", text: "text-purple-700", badge: "bg-purple-100 text-purple-700" },
  emerald: { bg: "bg-emerald-50/50 border-emerald-200", icon: "bg-emerald-600", text: "text-emerald-700", badge: "bg-emerald-100 text-emerald-700" },
  amber: { bg: "bg-amber-50/50 border-amber-200", icon: "bg-amber-600", text: "text-amber-700", badge: "bg-amber-100 text-amber-700" },
  blue: { bg: "bg-blue-50/50 border-blue-200", icon: "bg-blue-600", text: "text-blue-700", badge: "bg-blue-100 text-blue-700" },
  indigo: { bg: "bg-indigo-50/50 border-indigo-200", icon: "bg-indigo-600", text: "text-indigo-700", badge: "bg-indigo-100 text-indigo-700" },
}

export default function TEAboutPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 min-h-screen">

      {/* Header */}
      <div className="text-center space-y-3 pt-8">
        <div className="flex items-center justify-center gap-3">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-600 shadow-lg">
            <CheckSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold">How the Evaluator Works</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          5 steps from RFT to recommendation. No mock data, all real engine.
        </p>
      </div>

      {/* Pipeline Overview */}
      <div className="flex items-center justify-center gap-0 flex-wrap">
        {STEPS.map((s, i) => {
          const c = COLORS[s.color as keyof typeof COLORS]
          return (
            <div key={s.label} className={`flex items-center gap-1 px-3 py-2 text-xs font-medium ${i > 0 ? "border-l" : "rounded-l-lg"} ${i === STEPS.length - 1 ? "rounded-r-lg" : ""} bg-muted text-muted-foreground`}>
              <s.icon className="w-3.5 h-3.5" />
              <span>{s.label.replace(/^\d+\.\s/, "")}</span>
              {i < STEPS.length - 1 && <ArrowRight className="w-3 h-3 text-muted-foreground/50" />}
            </div>
          )
        })}
      </div>

      {/* Architecture */}
      <div className="rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20 p-6 space-y-3">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-600" />
          Architecture
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The Evaluator runs on a <strong>Node.js MCP server</strong> with jurisdiction-specific rulesets 
          (Federal, NSW, VIC, QLD). Each tool in the pipeline chains via an in-memory evaluation session:
        </p>
        <div className="text-xs text-muted-foreground font-mono bg-muted p-3 rounded-lg overflow-x-auto">
          extract_criteria → check_compliance → detect_deviations → score_bids → generate_report
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          A <strong>Human-in-the-Loop</strong> checkpoint sits between compliance checks and scoring — 
          flagged items go to a procurement officer for review before final scores are applied.
        </p>
      </div>

      {/* Step Details */}
      {STEPS.map((s, i) => {
        const c = COLORS[s.color as keyof typeof COLORS]
        const Icon = s.icon
        return (
          <div key={s.label} className={`rounded-xl border ${c.bg} p-6 space-y-3`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${c.icon} shadow flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold">{s.label}</h2>
                <p className="text-sm text-muted-foreground">{s.summary}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {s.detail}
            </p>
          </div>
        )
      })}

      {/* CTA */}
      <div className="text-center py-6 space-y-3">
        <p className="text-sm text-muted-foreground">
          Try it with our quick-test guide on the Evaluator page.
        </p>
        <Link
          href="/te"
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
        >
          Go to Evaluator <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <footer className="text-center text-xs text-muted-foreground pb-8">
        <p>MCP-based • Node.js • Pluggable Rulesets • HITL</p>
      </footer>
    </div>
  )
}