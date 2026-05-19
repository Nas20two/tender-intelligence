"use client"

import { 
  FileText, 
  Shield, 
  Bot, 
  UserCheck, 
  Database, 
  Lock,
  CheckCircle,
  ArrowRight,
  Server,
  Code2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export function AboutPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 overflow-y-auto h-full">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 shadow-lg">
            <FileText className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Tender Intelligence</h1>
        </div>
        <p className="text-muted-foreground">
          AI-powered government tender discovery and analysis platform
        </p>
        <div className="flex items-center justify-center gap-2">
          <Badge variant="secondary" className="text-xs">MCP Architecture</Badge>
          <Badge variant="secondary" className="text-xs">HITL Workflow</Badge>
          <Badge variant="secondary" className="text-xs">OCDS Compliant</Badge>
        </div>
      </div>

      {/* What is Tender Intelligence */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-500" />
            What is Tender Intelligence?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Tender Intelligence is an enterprise AI tool that helps businesses discover and analyze 
            Australian government tender opportunities. It combines real-time data from the AusTender 
            OCDS API with AI-powered insights to give you a competitive edge in government procurement.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-100 dark:border-blue-900">
              <Database className="w-5 h-5 text-blue-500 mb-2" />
              <h4 className="font-semibold text-sm">Real-time Data</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Live connection to AusTender OCDS API for current opportunities
              </p>
            </div>
            <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-100 dark:border-blue-900">
              <Bot className="w-5 h-5 text-blue-500 mb-2" />
              <h4 className="font-semibold text-sm">AI Analysis</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Win probability, competitive analysis, and recommended actions
              </p>
            </div>
            <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-100 dark:border-blue-900">
              <Shield className="w-5 h-5 text-blue-500 mb-2" />
              <h4 className="font-semibold text-sm">Secure & Compliant</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Human-in-the-loop approval for all external actions
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Architecture */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-500" />
            MCP Architecture
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            This application demonstrates the Model Context Protocol (MCP) architecture — a secure, 
            standardized way for AI agents to interact with external data sources and tools.
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-bold text-sm shrink-0">
                1
              </div>
              <div>
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  Frontend (Next.js)
                  <Badge variant="outline" className="text-[10px]">Vercel</Badge>
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  React-based UI that handles user queries and displays results. 
                  Calls the MCP server via HTTP to fetch tender data.
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <ArrowRight className="w-4 h-4 text-muted-foreground rotate-90" />
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-bold text-sm shrink-0">
                2
              </div>
              <div>
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  MCP Server (Node.js)
                  <Badge variant="outline" className="text-[10px]">Local/Cloud</Badge>
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Implements the Model Context Protocol. Exposes tools like 
                  &quot;search_austender&quot; that the AI can call. Runs on port 3001.
                </p>
                <code className="text-[10px] bg-muted px-2 py-1 rounded mt-2 block">
                  mcp-server-http.js
                </code>
              </div>
            </div>

            <div className="flex justify-center">
              <ArrowRight className="w-4 h-4 text-muted-foreground rotate-90" />
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-bold text-sm shrink-0">
                3
              </div>
              <div>
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  AusTender OCDS API
                  <Badge variant="outline" className="text-[10px]">Government</Badge>
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Official Australian Government tender database. 
                  Free, public API using Open Contracting Data Standard (OCDS).
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* HITL Workflow */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-500" />
            Human-in-the-Loop (HITL)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Security is paramount in enterprise AI. Tender Intelligence implements 
            Human-in-the-Loop (HITL) workflows to ensure AI agents cannot take 
            unilateral external actions.
          </p>

          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg border border-amber-100 dark:border-amber-900">
              <Lock className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0" />
              <div>
                <h4 className="font-semibold text-sm">Environment Protection</h4>
                <p className="text-xs text-muted-foreground">
                  GitHub Actions workflows pause for human approval before sending emails or submissions
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg border border-amber-100 dark:border-amber-900">
              <CheckCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0" />
              <div>
                <h4 className="font-semibold text-sm">Audit Logging</h4>
                <p className="text-xs text-muted-foreground">
                  Every action is logged with timestamps, actors, and approval IDs for compliance
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg border border-amber-100 dark:border-amber-900">
              <Shield className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0" />
              <div>
                <h4 className="font-semibold text-sm">Least Privilege</h4>
                <p className="text-xs text-muted-foreground">
                  AI agents have minimal permissions — can draft but cannot send without approval
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How to Use */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Code2 className="w-5 h-5 text-blue-500" />
            How to Use
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-xs font-bold shrink-0">
                1
              </span>
              <span className="text-muted-foreground">
                <strong className="text-foreground">Search:</strong> Type a query like 
                &quot;find cybersecurity tenders&quot; or &quot;show me consulting opportunities&quot;
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-xs font-bold shrink-0">
                2
              </span>
              <span className="text-muted-foreground">
                <strong className="text-foreground">Review:</strong> Check the Context Panel 
                for tender details and the AI Insights tab for analysis
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-xs font-bold shrink-0">
                3
              </span>
              <span className="text-muted-foreground">
                <strong className="text-foreground">Approve:</strong> Any draft emails or 
                responses require your approval in the HITL Approvals tab
              </span>
            </li>
          </ol>
        </CardContent>
      </Card>

      <Separator />

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground pb-4">
        <p>Built with Secure AI Agent Architecture</p>
        <p className="mt-1">Data sourced from AusTender OCDS API • Open Source • Free to use</p>
      </div>
    </div>
  )
}
