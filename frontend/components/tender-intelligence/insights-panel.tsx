"use client"

import { useState, useEffect } from "react"
import { 
  Lightbulb, 
  Target, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp,
  Shield,
  Loader2,
  Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface TenderData {
  CNID: string
  Title: string
  Agency: string
  Category: string
  PublishedDate: string
  Value: string
  description?: string
}

interface AnalysisResult {
  executive_summary: string
  key_insights: string[]
  competitive_analysis: {
    competition_level: 'Low' | 'Medium' | 'High'
    estimated_competitors: number
    differentiation_opportunities: string[]
  }
  win_probability: {
    score: number
    factors: string[]
  }
  recommended_actions: string[]
  risks: {
    level: 'Low' | 'Medium' | 'High'
    items: string[]
  }
  compliance_requirements: string[]
}

interface InsightsPanelProps {
  tender: TenderData | null
  className?: string
}

export function InsightsPanel({ tender, className }: InsightsPanelProps) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [source, setSource] = useState<'llm' | 'mock' | null>(null)

  useEffect(() => {
    if (tender) {
      generateAnalysis(tender)
    }
  }, [tender])

  const generateAnalysis = async (tenderData: TenderData) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tender: tenderData })
      })

      if (!response.ok) {
        throw new Error('Failed to generate analysis')
      }

      const data = await response.json()
      setAnalysis(data.analysis)
      setSource(data.source)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!tender) {
    return (
      <Card className={cn("bg-slate-50/50 dark:bg-slate-900/50 border-dashed", className)}>
        <CardContent className="pt-6 text-center text-muted-foreground">
          <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Select a tender to see AI insights</p>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card className={cn("bg-blue-50/50 dark:bg-blue-950/20", className)}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-2 text-blue-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">Analyzing tender with AI...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={cn("bg-red-50/50 dark:bg-red-950/20 border-red-200", className)}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-3"
            onClick={() => generateAnalysis(tender)}
          >
            Retry Analysis
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!analysis) return null

  const getWinProbabilityColor = (score: number) => {
    if (score >= 70) return "text-green-600 bg-green-100 dark:bg-green-900/30"
    if (score >= 40) return "text-amber-600 bg-amber-100 dark:bg-amber-900/30"
    return "text-red-600 bg-red-100 dark:bg-red-900/30"
  }

  const getRiskBadgeVariant = (level: string) => {
    switch (level) {
      case 'Low': return 'default'
      case 'Medium': return 'secondary'
      case 'High': return 'destructive'
      default: return 'outline'
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with AI badge */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-500" />
          AI Insights
        </h3>
        {source && (
          <Badge variant={source === 'llm' ? 'default' : 'secondary'} className="text-xs">
            {source === 'llm' ? '🤖 AI Powered' : '💡 Demo Mode'}
          </Badge>
        )}
      </div>

      {/* Win Probability */}
      <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-500" />
            Win Probability
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-4">
            <div className={cn(
              "text-3xl font-bold px-4 py-2 rounded-lg",
              getWinProbabilityColor(analysis.win_probability.score)
            )}>
              {analysis.win_probability.score}%
            </div>
            <div className="flex-1">
              <Progress 
                value={analysis.win_probability.score} 
                className="h-2"
              />
              <div className="mt-2 space-y-1">
                {analysis.win_probability.factors.slice(0, 2).map((factor, i) => (
                  <p key={i} className="text-xs text-muted-foreground">
                    • {factor}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Executive Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Executive Summary</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {analysis.executive_summary}
          </p>
        </CardContent>
      </Card>

      {/* Competition Analysis */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Competitive Landscape
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <div className="flex items-center gap-3">
            <Badge variant={getRiskBadgeVariant(analysis.competitive_analysis.competition_level)}>
              {analysis.competitive_analysis.competition_level} Competition
            </Badge>
            <span className="text-sm text-muted-foreground">
              ~{analysis.competitive_analysis.estimated_competitors} expected bidders
            </span>
          </div>
          <div>
            <p className="text-xs font-medium mb-2">Differentiation Opportunities:</p>
            <ul className="space-y-1">
              {analysis.competitive_analysis.differentiation_opportunities.slice(0, 3).map((opp, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                  <CheckCircle2 className="w-3 h-3 mt-0.5 text-green-500 shrink-0" />
                  {opp}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ul className="space-y-2">
            {analysis.key_insights.map((insight, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-blue-500 font-medium">{i + 1}.</span>
                {insight}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Risks */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Badge variant={getRiskBadgeVariant(analysis.risks.level)} className="mb-3">
            {analysis.risks.level} Risk
          </Badge>
          <ul className="space-y-1">
            {analysis.risks.items.map((risk, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                <AlertTriangle className="w-3 h-3 mt-0.5 text-amber-500 shrink-0" />
                {risk}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Compliance */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-500" />
            Compliance Requirements
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ul className="space-y-1">
            {analysis.compliance_requirements.map((req, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                <CheckCircle2 className="w-3 h-3 mt-0.5 text-green-500 shrink-0" />
                {req}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Recommended Actions */}
      <Card className="bg-blue-50/30 dark:bg-blue-950/10 border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-500" />
            Recommended Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ul className="space-y-2">
            {analysis.recommended_actions.map((action, i) => (
              <li key={i} className="text-sm flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 text-xs flex items-center justify-center font-medium">
                  {i + 1}
                </span>
                <span className="text-muted-foreground">{action}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
