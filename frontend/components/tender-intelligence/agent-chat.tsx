"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Send, Bot, User, Loader2, CheckCircle2, Circle, AlertCircle, Database, FileText, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

export interface AgentStep {
  id: string
  status: "pending" | "running" | "complete" | "error"
  label: string
  detail?: string
}

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  steps?: AgentStep[]
  isStreaming?: boolean
}

interface AgentChatProps {
  messages: Message[]
  isLoading: boolean
  onSendMessage: (message: string) => void
}

function StepIndicator({ step }: { step: AgentStep }) {
  return (
    <div className="flex items-start gap-2 py-1.5">
      {step.status === "pending" && <Circle className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />}
      {step.status === "running" && <Loader2 className="w-3.5 h-3.5 text-primary animate-spin mt-0.5 shrink-0" />}
      {step.status === "complete" && <CheckCircle2 className="w-3.5 h-3.5 text-success mt-0.5 shrink-0" />}
      {step.status === "error" && <AlertCircle className="w-3.5 h-3.5 text-destructive mt-0.5 shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-xs font-medium",
          step.status === "complete" ? "text-muted-foreground" : "text-foreground"
        )}>
          {step.label}
        </p>
        {step.detail && (
          <p className="text-[10px] text-muted-foreground truncate">{step.detail}</p>
        )}
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user"
  
  return (
    <div className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      <div className={cn(
        "flex items-center justify-center w-8 h-8 rounded-lg shrink-0",
        isUser ? "bg-primary/10" : "bg-accent"
      )}>
        {isUser ? (
          <User className="w-4 h-4 text-primary" />
        ) : (
          <Bot className="w-4 h-4 text-primary" />
        )}
      </div>
      <div className={cn(
        "flex flex-col max-w-[85%]",
        isUser ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "px-4 py-3 rounded-xl",
          isUser 
            ? "bg-primary text-primary-foreground rounded-br-sm" 
            : "bg-card border border-border rounded-bl-sm"
        )}>
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
        
        {/* Agent Steps */}
        {message.steps && message.steps.length > 0 && (
          <div className="mt-2 p-3 bg-muted/30 rounded-lg border border-border/50 w-full">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                Agent Activity
              </span>
            </div>
            <div className="space-y-0.5">
              {message.steps.map((step) => (
                <StepIndicator key={step.id} step={step} />
              ))}
            </div>
          </div>
        )}
        
        <span className="text-[10px] text-muted-foreground mt-1.5 px-1">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  )
}

export function AgentChat({ messages, isLoading, onSendMessage }: AgentChatProps) {
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return
    onSendMessage(input.trim())
    setInput("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const suggestions = [
    "Find all tenders",
    "Show cybersecurity tenders",
    "Find consulting opportunities"
  ]

  return (
    <div className="flex flex-col h-full bg-background">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600 shadow-sm">
              <Bot className="w-5 h-5 text-white" />
            </div>
          <div>
            <h2 className="text-sm font-semibold">Tender Intelligence Agent</h2>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                Online
              </span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                <Database className="w-2.5 h-2.5 mr-1" />
                AusTender MCP
              </Badge>
            </div>
          </div>
        </div>
        <Badge variant="outline" className="text-[10px]">
          <FileText className="w-3 h-3 mr-1" />
          OCDS v1.1
        </Badge>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center mb-4 shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Welcome to Tender Intelligence</h3>
            <p className="text-sm text-muted-foreground max-w-md mb-6">
              Your AI-powered assistant for discovering and analyzing government procurement opportunities across Australia.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {suggestions.map((suggestion, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  className="text-xs border-slate-200 hover:border-blue-500 hover:text-blue-700 dark:border-slate-800 dark:hover:border-blue-400 dark:hover:text-blue-300 transition-colors"
                  onClick={() => {
                    setInput(suggestion)
                    textareaRef.current?.focus()
                  }}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="flex items-center gap-2 px-4 py-3 bg-card border border-border rounded-xl rounded-bl-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Processing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about government tenders, procurement data, or compliance requirements..."
              className="min-h-[52px] max-h-32 resize-none pr-12 bg-input border-border"
              rows={1}
            />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
            className="h-[52px] px-5 bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 text-center">
          Data sourced from official government procurement portals. All AI outputs require HITL verification.
        </p>
      </div>
    </div>
  )
}
