"use client"

import { useState, useCallback, useRef, type ReactNode } from "react"
import Link from "next/link"
import {
  FileText,
  CheckSquare,
  AlertTriangle,
  TrendingUp,
  FileSpreadsheet,
  ChevronRight,
  CheckCircle,
  XCircle,
  Info,
  Loader2,
  Upload,
} from "lucide-react"

type Step = "criteria" | "compliance" | "deviation" | "scoring" | "report"

interface Criterion {
  id: string
  name: string
  type: string
  mandatory: boolean
  weight: number
  category: string
  status?: string
  evidence?: string
}

interface ProcurementResult {
  criteriaId: string
  division: string
  contractValue: number
  entityType: string
  totalCriteria: number
  criteria: Criterion[]
  tenderTitle: string
  agency: string
}

interface MatrixRow {
  gate: string
  name: string
  type: string
  mandatory: boolean
  category: string
  status: "compliant" | "non_compliant" | "needs_human_review"
  evidence: string
  confidence: string
  notes: string
}

interface ComplianceResult {
  bidder: string
  evaluationId: string
  matrix: MatrixRow[]
  summary: { total: number; compliant: number; nonCompliant: number; needsReview: number }
  passedMandatory: boolean
}

interface Deviation {
  gate: string
  type: string
  severity: "high" | "medium" | "low"
  description: string
  detail: string
}

interface DeviationResult {
  bidder: string
  evaluationId: string
  totalDeviations: number
  highSeverity: number
  deviations: Deviation[]
}

interface ScoredBidder {
  name: string
  totalScore: number
  compliant: boolean
  deviations: number
}

interface ScoringResult {
  ranked: ScoredBidder[]
  recommended: string | null
}

interface ReportResult {
  evaluationId: string
  generatedAt: string
  procurement: {
    title: string
    jurisdiction: string
    division: string
    contractValue: number
    entityType: string
    totalCriteria: number
  }
  criteriaBreakdown: Criterion[]
  bidders: Array<{
    name: string
    compliance: ComplianceResult | null
    deviations: Deviation[]
    score: ScoredBidder | null
  }>
  ranking: ScoredBidder[]
  recommendation: string | null
  summary: {
    totalBidders: number
    recommendedBidder: string
    totalDeviations: number
    compliantBidders: number
  }
}

function parseEvidence(text: string): Record<string, string> {
  const map: Record<string, string> = {}
  for (const line of text.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed) continue
    const colon = trimmed.indexOf(":")
    if (colon > 0) {
      map[trimmed.slice(0, colon).trim()] = trimmed.slice(colon + 1).trim()
    }
  }
  return map
}

const STEPS: {
  key: Step
  label: string
  icon: React.ComponentType<{ className?: string }>
}[] = [
  { key: "criteria", label: "Extract Criteria", icon: FileText },
  { key: "compliance", label: "Check Compliance", icon: CheckSquare },
  { key: "deviation", label: "Detect Deviations", icon: AlertTriangle },
  { key: "scoring", label: "Score Bids", icon: TrendingUp },
  { key: "report", label: "Generate Report", icon: FileSpreadsheet },
]

export default function TenderEvaluatorPage() {
  const [step, setStep] = useState<Step>("criteria")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [jurisdiction, setJurisdiction] = useState("federal")
  const [contractValue, setContractValue] = useState("2450000")
  const [entityType, setEntityType] = useState("non-corporate")
  const [evaluationId, setEvaluationId] = useState<string | null>(null)
  const [criteria, setCriteria] = useState<Criterion[]>([])
  const [procurementInfo, setProcurementInfo] = useState<ProcurementResult | null>(null)

  const [bidderName, setBidderName] = useState("")
  const [evidenceText, setEvidenceText] = useState("")

  const [uploading, setUploading] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const [needsClientRender, setNeedsClientRender] = useState(false)
  const pdfRenderRef = useRef<HTMLCanvasElement>(null)

  const [complianceResult, setComplianceResult] = useState<ComplianceResult | null>(null)
  const [deviations, setDeviations] = useState<Deviation[]>([])
  const [scoredBidders, setScoredBidders] = useState<ScoredBidder[]>([])
  const [recommended, setRecommended] = useState<string | null>(null)
  const [report, setReport] = useState<ReportResult | null>(null)

  const renderPDFPageToImage = useCallback(async (pdfData: ArrayBuffer, pageNum: number): Promise<string | null> => {
    try {
      const pdfjsLib = await import("pdfjs-dist")
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs"
      const loadingTask = pdfjsLib.getDocument({ data: pdfData })
      const pdf = await loadingTask.promise
      if (pageNum > pdf.numPages) return null
      const page = await pdf.getPage(pageNum)
      const viewport = page.getViewport({ scale: 1.5 })
      const canvas = document.createElement("canvas")
      canvas.width = viewport.width
      canvas.height = viewport.height
      const ctx = canvas.getContext("2d")!
      await page.render({ canvasContext: ctx, viewport }).promise
      return canvas.toDataURL("image/jpeg", 0.85)
    } catch (e) {
      console.error("pdf render error page", pageNum, e)
      return null
    }
  }, [])

  const handlePDFUpload = useCallback(async (file: File, mode: "extract" | "evidence" = "evidence") => {
    setUploading(true)
    setError(null)
    setUploadedFileName(null)
    setNeedsClientRender(false)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("mode", mode)

      // First try with just the PDF
      let res = await fetch("/api/te/upload", {
        method: "POST",
        body: formData,
      })
      let data = await res.json()

      // If server can't extract text, try with client-rendered page images
      if (data.needsClientRender) {
        setNeedsClientRender(true)
        // Render first 10 pages as images
        const pdfBytes = await file.arrayBuffer()
        const images: string[] = []
        for (let i = 1; i <= 10; i++) {
          const img = await renderPDFPageToImage(pdfBytes, i)
          if (img) images.push(img)
        }

        if (images.length > 0) {
          const formData2 = new FormData()
          formData2.append("file", file)
          formData2.append("mode", mode)
          formData2.append("images", JSON.stringify(images))

          res = await fetch("/api/te/upload", {
            method: "POST",
            body: formData2,
          })
          data = await res.json()
        }
      }

      if (data.error) throw new Error(data.error)

      setUploadedFileName(file.name)
      if (mode === "evidence" && data.evidence) {
        const lines = Object.entries(data.evidence as Record<string, string>)
          .map(([k, v]) => `${k}: ${v.substring(0, 500)}`)
          .join("\n")
        setEvidenceText(lines)
      }
      if (mode === "extract" && data.text) {
        const text = data.text
        const valueMatch = text.match(/\$[\d,]+(?: million|m|M|\s*[kK])?/)
        if (valueMatch) {
          const raw = valueMatch[0].replace(/[$,]/g, "")
          if (raw.toLowerCase().includes("m")) {
            setContractValue(String(parseFloat(raw) * 1000000))
          } else if (raw.toLowerCase().includes("k")) {
            setContractValue(String(parseFloat(raw) * 1000))
          } else {
            setContractValue(raw)
          }
        }
      }
      return data
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Upload failed"
      setError(msg)
      return null
    } finally {
      setUploading(false)
    }
  }, [renderPDFPageToImage])

  const apiCall = useCallback(
    async (action: string, body: Record<string, unknown>) => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/te", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, ...body }),
        })
        const data = await res.json()
        if (data.error) throw new Error(data.error)
        return data
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Unknown error"
        setError(msg)
        return null
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  const handleExtract = useCallback(async () => {
    const data = await apiCall("extract_criteria", {
      jurisdiction,
      value: parseFloat(contractValue) || 0,
      entityType,
    })
    if (data?.result) {
      const r = data.result as ProcurementResult
      setCriteria(r.criteria)
      setEvaluationId(r.criteriaId)
      setProcurementInfo(r)
    }
  }, [jurisdiction, contractValue, entityType, apiCall])

  const handleCompliance = useCallback(async () => {
    if (!evaluationId || !bidderName) return
    const data = await apiCall("check_compliance", {
      evaluationId,
      bidderName,
      evidence: parseEvidence(evidenceText),
    })
    if (data?.result) {
      setComplianceResult(data.result as ComplianceResult)
      setDeviations([])
      setScoredBidders([])
      setRecommended(null)
    }
  }, [evaluationId, bidderName, evidenceText, apiCall])

  const handleDeviation = useCallback(async () => {
    if (!evaluationId || !bidderName) return
    const data = await apiCall("detect_deviations", {
      evaluationId,
      bidderName,
      evidence: parseEvidence(evidenceText),
    })
    if (data?.result) {
      setDeviations((data.result as DeviationResult).deviations)
    }
  }, [evaluationId, bidderName, evidenceText, apiCall])

  const handleScoring = useCallback(async () => {
    if (!evaluationId) return
    const scores: Record<string, Record<string, number>> = {}
    if (bidderName) {
      scores[bidderName] = {}
      for (const c of criteria) {
        const gate = complianceResult?.matrix?.find((m) => m.gate === c.id)
        scores[bidderName][c.id] =
          gate?.status === "compliant"
            ? 85
            : gate?.status === "needs_human_review"
              ? 55
              : 65
      }
    }
    const data = await apiCall("score_bids", { evaluationId, scores })
    if (data?.result) {
      const sr = data.result as ScoringResult
      setScoredBidders(sr.ranked)
      setRecommended(sr.recommended)
    }
  }, [evaluationId, criteria, complianceResult, bidderName, apiCall])

  const handleReport = useCallback(async () => {
    if (!evaluationId) return
    const data = await apiCall("generate_report", {
      evaluationId,
      format: "detailed",
    })
    if (data?.report) {
      setReport(data.report as ReportResult)
    }
  }, [evaluationId, apiCall])

  const statusIcon = (s: string): ReactNode => {
    switch (s) {
      case "compliant":
        return <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
      case "non_compliant":
        return <XCircle className="w-4 h-4 text-red-600 shrink-0" />
      default:
        return <Info className="w-4 h-4 text-amber-600 shrink-0" />
    }
  }

  const statusLabel = (s: string): ReactNode => {
    switch (s) {
      case "compliant":
        return <span className="text-xs font-medium text-green-600">PASS</span>
      case "non_compliant":
        return <span className="text-xs font-medium text-red-600">FAIL</span>
      default:
        return <span className="text-xs font-medium text-amber-600">REVIEW</span>
    }
  }

  const statusBg = (s: string): string => {
    switch (s) {
      case "compliant":
        return "bg-green-50/50 border-green-200"
      case "non_compliant":
        return "bg-red-50/50 border-red-200"
      default:
        return "bg-amber-50/50 border-amber-200"
    }
  }

  function severityBadge(sev: string): ReactNode {
    const isHigh = sev === "high"
    return (
      <span
        className={`text-xs px-2 py-0.5 rounded-full ${
          isHigh
            ? "bg-red-100 text-red-700"
            : "bg-amber-100 text-amber-700"
        }`}
      >
        {sev.toUpperCase()}
      </span>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen space-y-6">
      {/* ── Header ──────────────────────── */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-600 shadow-lg flex items-center justify-center">
            <CheckSquare className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Tender Evaluator</h1>
        </div>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Criteria to Report. Real engine, no mock data.
        </p>
        <Link href="/te/about" className="inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 font-medium">
          <Info className="w-3 h-3" /> How it works
        </Link>
      </div>

      {/* ── Quick Test Guide ──────────── */}
      <details className="rounded-xl border border-purple-200 bg-purple-50/30 p-4">
        <summary className="text-sm font-semibold text-purple-700 cursor-pointer flex items-center gap-2">
          <Info className="w-4 h-4" />
          Quick Test — try the pipeline in 30 seconds
        </summary>
        <div className="mt-3 text-xs text-muted-foreground space-y-2">
          <p><strong>Step 1:</strong> Pick "Federal", enter <code className="bg-purple-100 px-1 rounded">2450000</code>, hit <strong>Extract</strong></p>
          <p><strong>Step 2:</strong> Type a bidder name, paste this evidence, hit <strong>Check</strong>:</p>
          <pre className="bg-muted p-2 rounded text-xs leading-relaxed overflow-x-auto">
{`gate_capability: 10 years serving federal government contracts
gate_iso27001: ISO 27001 certified since 2020
gate_insurance: $20M public liability insurance
gate_whs: Comprehensive WHS policy in place
gate_modern_slavery: Modern slavery statement filed
gate_conflict: No conflicts declared
gate_data_security: PSPF compliant data handling
gate_financial: $15M annual turnover`}
          </pre>
          <p><strong>Step 3-5:</strong> Deviations → Score Bids → Generate Report — all one click each.</p>
        </div>
      </details>

      {/* ── Step tabs ───────────────────── */}
      <div className="flex items-center justify-center gap-0 flex-wrap">
        {STEPS.map((s, i) => (
          <button
            key={s.key}
            onClick={() => setStep(s.key)}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
              step === s.key
                ? "bg-purple-600 text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            } ${i === 0 ? "rounded-l-lg" : ""} ${
              i === STEPS.length - 1 ? "rounded-r-lg" : ""
            }`}
          >
            <s.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{s.label}</span>
          </button>
        ))}
      </div>

      {/* ── Loading / Error ─────────────── */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
          <span className="ml-2 text-sm text-muted-foreground">Processing...</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50/50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ════════════════════════════════════
          STEP 1 — EXTRACT CRITERIA
          ════════════════════════════════════ */}
      {step === "criteria" && (
        <div className="rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-500" />
            1. Extract Criteria
          </h2>
          <div className="grid sm:grid-cols-3 gap-3">
            <select
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
              className="p-2 border rounded-lg text-sm bg-background"
            >
              <option value="federal">Federal</option>
              <option value="nsw">NSW</option>
              <option value="vic">VIC</option>
              <option value="qld">QLD</option>
            </select>
            <input
              type="number"
              value={contractValue}
              onChange={(e) => setContractValue(e.target.value)}
              className="p-2 border rounded-lg text-sm bg-background"
              placeholder="Contract value ($)"
            />
            <select
              value={entityType}
              onChange={(e) => setEntityType(e.target.value)}
              className="p-2 border rounded-lg text-sm bg-background"
            >
              <option value="non-corporate">Non-corporate</option>
              <option value="corporate">Corporate</option>
            </select>
          </div>
          <div className="border border-dashed border-muted-foreground/30 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground mb-2">Upload RFT PDF to auto-fill value (optional)</p>
            <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg text-xs hover:bg-muted/80 transition-colors">
              <Upload className="w-3.5 h-3.5" />
              {uploading ? "Uploading..." : "Upload RFT PDF"}
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                disabled={uploading}
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (file) await handlePDFUpload(file, "extract")
                  e.target.value = ""
                }}
              />
            </label>
            {uploadedFileName && (
              <p className="text-xs text-green-600 mt-1">{uploadedFileName} processed</p>
            )}
          </div>
          <button
            onClick={handleExtract}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Extract
          </button>
          {criteria.length > 0 && (
            <>
              <div className="p-3 bg-purple-50/50 rounded-lg border text-sm text-purple-800">
                {evaluationId} &middot; {procurementInfo?.division} &middot;{" "}
                {procurementInfo?.agency} &middot; {criteria.length} criteria
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {criteria.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 bg-muted/30 rounded-lg border text-sm"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-medium">{c.name}</span>
                      <span className="text-xs text-muted-foreground shrink-0 ml-2">
                        {c.weight}%
                      </span>
                    </div>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                        {c.type}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {c.category}
                      </span>
                      {c.mandatory && (
                        <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-700">
                          M
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setStep("compliance")}
                className="text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                Next: Compliance <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      )}
      {/* ════════════════════════════════════
          STEP 2 — CHECK COMPLIANCE
          ════════════════════════════════════ */}
      {step === "compliance" && (
        <div className="rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-purple-500" />
            2. Check Compliance
          </h2>
          <input
            type="text"
            value={bidderName}
            onChange={(e) => setBidderName(e.target.value)}
            placeholder="Bidder name"
            className="w-full p-2 border rounded-lg text-sm bg-background"
          />
          <div className="border border-dashed border-muted-foreground/30 rounded-lg p-4 text-center">
            <p className="text-xs text-muted-foreground mb-2">Or upload a bidder PDF to auto-extract evidence</p>
            <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 bg-muted rounded-lg text-sm hover:bg-muted/80 transition-colors">
              <Upload className="w-4 h-4" />
              {uploading ? "Uploading..." : "Upload Bid PDF"}
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                disabled={uploading || !evaluationId}
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const name = file.name.replace(/\.pdf$/i, "")
                    setBidderName(name)
                    await handlePDFUpload(file, "evidence")
                  }
                  e.target.value = ""
                }}
              />
            </label>
            {uploadedFileName && (
              <p className="text-xs text-green-600 mt-1">{uploadedFileName} processed</p>
            )}
          </div>
          <textarea
            value={evidenceText}
            onChange={(e) => setEvidenceText(e.target.value)}
            rows={4}
            placeholder="gate_id: evidence text (one per line)"
            className="w-full p-2 border rounded-lg text-sm bg-background font-mono"
          />
          <button
            onClick={handleCompliance}
            disabled={loading || !bidderName}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Check
          </button>
          {complianceResult && (
            <>
              <div className="p-3 rounded-lg text-sm border bg-green-50/50 border-green-200">
                {complianceResult.summary.compliant}/{complianceResult.summary.total} compliant &middot;{" "}
                Mandatory:{" "}
                {complianceResult.passedMandatory ? (
                  <span className="text-green-600 font-medium">Passed</span>
                ) : (
                  <span className="text-red-600 font-medium">Failed</span>
                )}{" "}
                &middot; {complianceResult.summary.needsReview} need review
              </div>
              {complianceResult.matrix.map((g) => (
                <div
                  key={g.gate}
                  className={`p-3 rounded-lg border text-sm flex justify-between items-center gap-4 ${statusBg(g.status)}`}
                >
                  <span className="flex items-center gap-2">
                    {statusIcon(g.status)} {g.name || g.gate}
                  </span>
                  {statusLabel(g.status)}
                </div>
              ))}
              <button
                onClick={() => {
                  setStep("deviation")
                  handleDeviation()
                }}
                className="text-sm font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1"
              >
                Detect deviations <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      )}

      {/* ════════════════════════════════════
          STEP 3 — DETECT DEVIATIONS
          ════════════════════════════════════ */}
      {step === "deviation" && (
        <div className="rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-purple-500" />
            3. Detect Deviations
          </h2>
          <div className="text-sm text-muted-foreground">
            Evaluated against: {bidderName}
          </div>
          <button
            onClick={handleDeviation}
            disabled={loading || !bidderName}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Detect
          </button>
          {deviations.length === 0 && !loading && (
            <div className="p-4 bg-green-50/50 border border-green-200 rounded-lg text-sm text-green-700">
              No deviations detected.
            </div>
          )}
          {deviations.map((d, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg border text-sm ${
                d.severity === "high"
                  ? "bg-red-50/50 border-red-200"
                  : "bg-amber-50/50 border-amber-200"
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="font-medium">
                  Gate {d.gate} &middot; {d.type}
                </span>
                {severityBadge(d.severity)}
              </div>
              <p className="text-xs mt-1">{d.description}</p>
              {d.detail && (
                <p className="text-xs mt-1 text-muted-foreground italic truncate">
                  {d.detail}
                </p>
              )}
            </div>
          ))}
          <button
            onClick={() => {
              setStep("scoring")
              handleScoring()
            }}
            className="text-sm font-medium text-green-600 hover:text-green-700 flex items-center gap-1"
          >
            Next: Score <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ════════════════════════════════════
          STEP 4 — SCORE BIDS
          ════════════════════════════════════ */}
      {step === "scoring" && (
        <div className="rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            4. Score Bids
          </h2>
          <button
            onClick={handleScoring}
            disabled={loading || !bidderName}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Score {bidderName}
          </button>
          {scoredBidders.length > 0 && (
            <>
              <div className="grid sm:grid-cols-3 gap-4">
                {scoredBidders.map((r) => (
                  <div
                    key={r.name}
                    className={`p-4 rounded-lg border ${
                      r.name === recommended
                        ? "bg-purple-50/50 border-purple-200"
                        : "bg-muted/30"
                    }`}
                  >
                    <p className="text-sm font-medium">{r.name}</p>
                    <p
                      className={`text-3xl font-bold ${
                        r.name === recommended ? "text-purple-600" : ""
                      }`}
                    >
                      {r.totalScore}
                      <span className="text-lg text-muted-foreground">/100</span>
                    </p>
                    <p className="text-xs mt-1">
                      {r.compliant ? (
                        <span className="text-green-600">Compliant</span>
                      ) : (
                        <span className="text-red-600">Non-compliant</span>
                      )}
                      {r.deviations > 0 && (
                        <span className="text-amber-600 ml-2">
                          {r.deviations} deviation{r.deviations !== 1 ? "s" : ""}
                        </span>
                      )}
                    </p>
                  </div>
                ))}
              </div>
              {recommended && (
                <div className="p-4 bg-purple-50/50 border border-purple-200 rounded-lg">
                  <p className="text-sm">
                    <strong>Recommended:</strong> {recommended}
                  </p>
                </div>
              )}
              <button
                onClick={() => { setStep("report"); handleReport() }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 flex items-center gap-2"
              >
                Generate Report <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      )}

      {/* ════════════════════════════════════
          STEP 5 — GENERATE REPORT
          ════════════════════════════════════ */}
      {step === "report" && (
        <div className="rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-purple-500" />
            5. Generate Report
          </h2>
          <button
            onClick={handleReport}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Generate
          </button>
          {report && (
            <>
              {/* Summary cards */}
              <div className="grid sm:grid-cols-4 gap-3">
                <div className="p-3 bg-muted/30 rounded-lg border text-center">
                  <p className="text-2xl font-bold">{report.summary.totalBidders}</p>
                  <p className="text-xs text-muted-foreground">Bidders</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg border text-center">
                  <p className="text-2xl font-bold">{report.procurement.totalCriteria}</p>
                  <p className="text-xs text-muted-foreground">Criteria</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg border text-center">
                  <p className="text-2xl font-bold">{report.summary.totalDeviations}</p>
                  <p className="text-xs text-muted-foreground">Deviations</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg border text-center">
                  <p className="text-2xl font-bold">{report.summary.compliantBidders}</p>
                  <p className="text-xs text-muted-foreground">Compliant</p>
                </div>
              </div>

              {/* Procurement info */}
              <div className="p-3 bg-purple-50/50 rounded-lg border text-sm space-y-1">
                <p><strong>Procurement:</strong> {report.procurement.title}</p>
                <p><strong>Division:</strong> {report.procurement.division}</p>
                <p><strong>Jurisdiction:</strong> {report.procurement.jurisdiction}</p>
                <p><strong>Contract Value:</strong> ${report.procurement.contractValue.toLocaleString()}</p>
                <p><strong>Entity Type:</strong> {report.procurement.entityType}</p>
                <p><strong>Generated:</strong> {new Date(report.generatedAt).toLocaleString()}</p>
              </div>

              {/* Ranking */}
              {report.ranking.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Rankings</h3>
                  <div className="space-y-1">
                    {report.ranking.map((r, i) => (
                      <div
                        key={r.name}
                        className={`p-2 rounded-lg border text-sm flex justify-between items-center ${
                          r.name === report.recommendation
                            ? "bg-purple-50/50 border-purple-200"
                            : "bg-muted/30"
                        }`}
                      >
                        <span>
                          <span className="text-xs text-muted-foreground mr-2">#{i + 1}</span>
                          {r.name}
                          {r.name === report.recommendation && (
                            <span className="text-xs ml-2 text-purple-600 font-medium">RECOMMENDED</span>
                          )}
                        </span>
                        <span className="font-semibold">{r.totalScore}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Per-bidder detail */}
              {report.bidders.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Bidder Details</h3>
                  {report.bidders.map((b) => (
                    <div key={b.name} className="p-3 bg-muted/30 rounded-lg border text-sm mb-2">
                      <p className="font-medium">{b.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Compliance: {b.compliance?.summary?.compliant ?? "-"}/{b.compliance?.summary?.total ?? "-"} &middot;{" "}
                        Deviations: {b.deviations.length} &middot;{" "}
                        Score: {b.score?.totalScore != null ? `${b.score.totalScore}/100` : "Not scored"}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Recommendation */}
              {report.recommendation && (
                <div className="p-4 bg-purple-50/50 border border-purple-200 rounded-lg">
                  <p className="text-sm">
                    <strong>Recommendation:</strong> {report.recommendation}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
