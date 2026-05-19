"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  Code2,
  UserCheck,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Copy,
  Download,
  ExternalLink,
  Clock,
  FileText,
  Hash,
  Building2,
  DollarSign,
  MapPin,
  Calendar,
  Lock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export interface TenderData {
  ocid: string
  tender: {
    id: string
    title: string
    description: string
    status: string
    value: {
      amount: number
      currency: string
    }
    procuringEntity: {
      name: string
      id: string
    }
    tenderPeriod: {
      startDate: string
      endDate: string
    }
    mainProcurementCategory: string
    additionalProcurementCategories: string[]
    awardCriteria: string
    submissionMethod: string[]
  }
  buyer: {
    name: string
    id: string
    address: {
      region: string
      countryName: string
    }
  }
}

export interface ApprovalItem {
  id: string
  type: "email" | "report" | "submission"
  title: string
  description: string
  content: string
  riskLevel: "low" | "medium" | "high"
  createdAt: Date
  relatedTender?: string
}

interface ContextPanelProps {
  tenderData: TenderData | null
  allTenders?: any[]
  approvalItem: ApprovalItem | null
  onApprove: (id: string) => void
  onReject: (id: string) => void
}

function JsonHighlight({ data }: { data: object }) {
  const json = JSON.stringify(data, null, 2)
  
  return (
    <pre className="text-xs font-mono p-4 bg-muted/30 rounded-lg overflow-x-auto">
      <code className="text-foreground">
        {json.split('\n').map((line, i) => (
          <div key={i} className="leading-relaxed">
            {line.split(/(".*?")/g).map((part, j) => {
              if (part.match(/^".*"$/)) {
                if (part.includes(':')) {
                  return <span key={j} className="text-primary">{part}</span>
                }
                return <span key={j} className="text-success">{part}</span>
              }
              if (part.match(/\d+/)) {
                return <span key={j} className="text-warning">{part}</span>
              }
              return <span key={j}>{part}</span>
            })}
          </div>
        ))}
      </code>
    </pre>
  )
}

function DataCard({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-blue-50/50 dark:bg-slate-900/50 rounded-xl border border-blue-100 dark:border-slate-800 shadow-sm backdrop-blur-sm hover:border-blue-200 dark:hover:border-blue-900/50 transition-colors">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 shadow-sm shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">{label}</p>
        <p className="text-sm font-bold text-slate-900 dark:text-slate-100 break-words leading-tight">{value}</p>
      </div>
    </div>
  )
}

export function ContextPanel({ tenderData, allTenders = [], approvalItem, onApprove, onReject }: ContextPanelProps) {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("raw-data")

  const handleCopy = () => {
    if (tenderData) {
      navigator.clipboard.writeText(JSON.stringify(tenderData, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-AU', { 
      style: 'currency', 
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="flex flex-col h-full bg-card border-l border-border">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
        <div className="px-4 pt-4 pb-0 border-b border-border">
          <TabsList className="w-full grid grid-cols-2 h-10">
            <TabsTrigger value="raw-data" className="text-xs gap-1.5">
              <Code2 className="w-3.5 h-3.5" />
              Raw Data
            </TabsTrigger>
            <TabsTrigger value="approvals" className="text-xs gap-1.5">
              <UserCheck className="w-3.5 h-3.5" />
              Pending Approvals
              {approvalItem && (
                <span className="ml-1 w-4 h-4 rounded-full bg-destructive text-[10px] font-bold flex items-center justify-center text-destructive-foreground">
                  1
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="raw-data" className="flex-1 mt-0 overflow-hidden">
          <ScrollArea className="h-full">
            {tenderData ? (
              <div className="p-4 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-mono">
                      <Hash className="w-2.5 h-2.5 mr-1" />
                      {tenderData.ocid}
                    </Badge>
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "text-[10px]",
                        tenderData.tender.status === "active" && "bg-success/10 text-success"
                      )}
                    >
                      {tenderData.tender.status}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7" 
                      onClick={handleCopy}
                    >
                      {copied ? (
                        <CheckCircle className="w-3.5 h-3.5 text-success" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Download className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <h3 className="text-sm font-semibold leading-tight">{tenderData.tender.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {tenderData.tender.description}
                  </p>
                </div>

                {/* Key Data Grid */}
                <div className="grid grid-cols-1 gap-3">
                  <DataCard 
                    label="Value" 
                    value={formatCurrency(tenderData.tender.value.amount, tenderData.tender.value.currency)}
                    icon={DollarSign}
                  />
                  <DataCard 
                    label="Region" 
                    value={tenderData.buyer.address.region}
                    icon={MapPin}
                  />
                  <DataCard 
                    label="Closes" 
                    value={formatDate(tenderData.tender.tenderPeriod.endDate)}
                    icon={Calendar}
                  />
                  <DataCard 
                    label="Category" 
                    value={tenderData.tender.mainProcurementCategory}
                    icon={FileText}
                  />
                </div>

                {/* Buyer Info */}
                <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                      Procuring Entity
                    </span>
                  </div>
                  <p className="text-sm font-medium">{tenderData.tender.procuringEntity.name}</p>
                  <p className="text-xs text-muted-foreground">{tenderData.buyer.name}</p>
                </div>

                {/* Source Verification */}
                <div className="flex items-center gap-2 p-2 bg-primary/5 rounded-lg border border-primary/10">
                  <Shield className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[10px] text-muted-foreground">
                    Data sourced directly from AusTender API • OCDS v1.1 compliant
                  </span>
                </div>

                {/* All Tenders List */}
                {allTenders.length > 1 && (
                  <>
                    <Separator />
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold">All Matching Tenders ({allTenders.length})</span>
                      </div>
                      <div className="space-y-2">
                        {allTenders.map((tender, index) => (
                          <div 
                            key={tender.CNID || index} 
                            className="p-2 bg-muted/30 rounded-lg border border-border/50 text-xs"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-medium text-primary">{index + 1}.</span>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold truncate">{tender.Title}</p>
                                <p className="text-muted-foreground truncate">{tender.Agency}</p>
                                <p className="text-muted-foreground/70">{tender.Value}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                {/* Raw JSON */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold">Raw OCDS Response</span>
                    <Badge variant="secondary" className="text-[10px]">JSON</Badge>
                  </div>
                  <JsonHighlight data={tenderData} />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <Code2 className="w-10 h-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Query data will appear here
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Run a search to see raw API responses
                </p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="approvals" className="flex-1 mt-0 overflow-hidden">
          <ScrollArea className="h-full">
            {approvalItem ? (
              <div className="p-4 space-y-4">
                {/* Security Header */}
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-900/50">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                    <span className="text-xs font-semibold text-amber-800 dark:text-amber-500">Human-in-the-Loop Required</span>
                  </div>
                  <p className="text-[10px] text-amber-700/80 dark:text-amber-500/80 mt-1">
                    This action requires explicit human approval before execution. All actions are logged for audit compliance.
                  </p>
                </div>

                {/* Approval Card */}
                <Card className="border-2 border-border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[10px]",
                          approvalItem.riskLevel === "low" && "border-success/30 text-success",
                          approvalItem.riskLevel === "medium" && "border-warning/30 text-warning",
                          approvalItem.riskLevel === "high" && "border-destructive/30 text-destructive"
                        )}
                      >
                        <AlertTriangle className="w-2.5 h-2.5 mr-1" />
                        {approvalItem.riskLevel.toUpperCase()} RISK
                      </Badge>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {approvalItem.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <CardTitle className="text-sm mt-2">{approvalItem.title}</CardTitle>
                    <CardDescription className="text-xs">
                      {approvalItem.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Content Preview */}
                    <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                          Draft Content
                        </span>
                      </div>
                      <div className="text-xs leading-relaxed whitespace-pre-wrap text-muted-foreground">
                        {approvalItem.content}
                      </div>
                    </div>

                    {approvalItem.relatedTender && (
                      <div className="flex items-center gap-2 text-xs">
                        <Hash className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Related:</span>
                        <span className="font-mono text-primary">{approvalItem.relatedTender}</span>
                      </div>
                    )}

                    {/* Audit Info */}
                    <div className="p-2 bg-muted/20 rounded border border-border/30">
                      <p className="text-[10px] text-muted-foreground">
                        <strong>Audit ID:</strong> HITL-{approvalItem.id.slice(0, 8).toUpperCase()} • 
                        <strong className="ml-2">Session:</strong> {Date.now().toString(36).toUpperCase()}
                      </p>
                    </div>

                    <Separator />

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button
                        onClick={() => onReject(approvalItem.id)}
                        variant="outline"
                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30 transition-colors"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                      <Button
                        onClick={() => onApprove(approvalItem.id)}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve & Execute
                      </Button>
                    </div>

                    <p className="text-[10px] text-center text-muted-foreground">
                      By approving, you confirm this action complies with your organization&apos;s procurement policies.
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <CheckCircle className="w-10 h-10 text-success/30 mb-3" />
                <p className="text-sm text-muted-foreground">
                  No pending approvals
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  All HITL actions have been processed
                </p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
