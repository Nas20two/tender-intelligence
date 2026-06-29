import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";

// ──────────────────────────────────────────────────────────────
// Tender Evaluator (TE) MCP Server
// Purpose: AI-powered tender submission assessment
// Deploy: In-house via MCP — client environment only
// 
// Tools:
//   extract_criteria     — Parse RFT → criteria, weightings, gates
//   check_compliance     — Match submission against mandatory gates
//   detect_deviations    — Find conditional offers, exceptions
//   score_bids           — Score against weighted criteria
//   generate_report      — Compliance matrix + deviation register
// ──────────────────────────────────────────────────────────────

const server = new Server({
  name: "tender-evaluator-server",
  version: "0.1.0"
}, {
  capabilities: { tools: {} }
});

// ==============================================================
// TOOL REGISTRATION
// Each tool registered with name, description, and JSON Schema
// Pattern matches GH-600 MCP domain — exactly how Q1 is solved
// ==============================================================

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "extract_criteria",
        description: "Parses an uploaded RFT/RFQ document and extracts evaluation criteria, weightings, and compliance gates. Returns structured criteria matrix.",
        inputSchema: {
          type: "object",
          properties: {
            documentUrl: {
              type: "string",
              description: "URL or file path to the RFT/RFQ document (PDF, DOCX)."
            },
            agencyName: {
              type: "string",
              description: "Name of the issuing agency (helps identify procurement framework rules)."
            }
          },
          required: ["documentUrl"]
        }
      },
      {
        name: "check_compliance",
        description: "Checks a bidder's submission against all mandatory compliance gates extracted from the RFT. Returns compliant/non-compliant/conditional per gate.",
        inputSchema: {
          type: "object",
          properties: {
            submissionUrl: {
              type: "string",
              description: "URL or file path to the bidder's submission document."
            },
            criteriaId: {
              type: "string",
              description: "Reference ID from extract_criteria output — which criteria set to check against."
            },
            bidderName: {
              type: "string",
              description: "Name of the bidding company."
            }
          },
          required: ["submissionUrl", "criteriaId"]
        }
      },
      {
        name: "detect_deviations",
        description: "Identifies conditional offers, alternative proposals, and exceptions taken in a submission. Returns a deviation register with severity classification.",
        inputSchema: {
          type: "object",
          properties: {
            submissionUrl: {
              type: "string",
              description: "URL or file path to the bidder's submission document."
            },
            criteriaId: {
              type: "string",
              description: "Reference ID from extract_criteria output."
            },
            bidderName: {
              type: "string",
              description: "Name of the bidding company."
            }
          },
          required: ["submissionUrl", "criteriaId"]
        }
      },
      {
        name: "score_bids",
        description: "Scores all bidders against weighted evaluation criteria. AI suggests scores, human approves/adjusts. Returns comparative scorecard across all bidders.",
        inputSchema: {
          type: "object",
          properties: {
            evaluationId: {
              type: "string",
              description: "Evaluation session ID — groups all bidders for one RFT."
            },
            criteriaId: {
              type: "string",
              description: "Reference ID from extract_criteria output."
            }
          },
          required: ["evaluationId", "criteriaId"]
        }
      },
      {
        name: "generate_report",
        description: "Generates a complete evaluation report: compliance matrix, deviation register, comparative scorecard, and audit trail. Exports as structured JSON or PDF-ready markdown.",
        inputSchema: {
          type: "object",
          properties: {
            evaluationId: {
              type: "string",
              description: "Evaluation session ID."
            },
            format: {
              type: "string",
              description: "Output format: 'json' for programmatic use, 'markdown' for human-readable report.",
              enum: ["json", "markdown"]
            }
          },
          required: ["evaluationId"]
        }
      }
    ]
  };
});

// ==============================================================
// TOOL EXECUTION
// Each handler follows the same pattern:
//   1. Validate inputs
//   2. Call internal logic (stubbed — implement per tool)
//   3. Return structured result
// ==============================================================

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const args = request.params.arguments || {};

  switch (request.params.name) {

    // ── Tool 1: Extract Criteria ──────────────────────────────
    case "extract_criteria": {
      const { documentUrl, agencyName } = args;
      
      console.error(`[TE] Extracting criteria from: ${documentUrl}`);
      
      // TODO: Implement PDF/DOCX parsing pipeline
      // 1. Download/document from URL or read from filesystem
      // 2. Run through document parser (PyMuPDF/Tesseract)
      // 3. LLM extracts criteria, weightings, mandatory gates
      // 4. Human reviews and edits extracted criteria
      // 5. Return structured criteria matrix
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            status: "ready_for_review",
            criteriaId: `criteria_${Date.now()}`,
            agency: agencyName || "Unknown Agency",
            criteriaExtracted: [
              {
                id: "c1",
                name: "Technical Capability",
                weight: 40,
                type: "weighted",
                gates: [
                  { id: "g1", description: "Must have ISO 27001 certification", mandatory: true },
                  { id: "g2", description: "Must demonstrate 3+ similar projects", mandatory: true },
                  { id: "g3", description: "Proposed solution architecture", mandatory: false }
                ]
              },
              {
                id: "c2",
                name: "Price",
                weight: 30,
                type: "weighted",
                gates: [
                  { id: "g4", description: "Must price all mandatory line items", mandatory: true },
                  { id: "g5", description: "Pricing model must cover 5-year term", mandatory: false }
                ]
              },
              {
                id: "c3",
                name: "Security & Compliance",
                weight: 30,
                type: "weighted",
                gates: [
                  { id: "g6", description: "IRAP assessment at Protected level", mandatory: true },
                  { id: "g7", description: "Essential Eight maturity must align with agency baseline", mandatory: true }
                ]
              }
            ]
          }, null, 2)
        }]
      };
    }

    // ── Tool 2: Check Compliance ──────────────────────────────
    case "check_compliance": {
      const { submissionUrl, criteriaId, bidderName } = args;

      console.error(`[TE] Checking compliance for: ${bidderName} against ${criteriaId}`);

      // TODO: Implement compliance checking
      // 1. Parse submission document
      // 2. For each mandatory gate, search submission for evidence
      // 3. Classify: compliant / non-compliant / conditional
      // 4. Flag issues for human review
      // 5. Generate compliance matrix

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            status: "need_human_review",
            criteriaId,
            bidder: bidderName || "Unknown Bidder",
            complianceMatrix: [
              { gate: "g1", status: "compliant", evidence: "ISO certificate attached (scope covers all services)", confidence: "high" },
              { gate: "g2", status: "compliant", evidence: "3 case studies provided (Dept X, Agency Y, Council Z)", confidence: "high" },
              { gate: "g3", status: "needs_human_review", evidence: "Architecture diagram included but LLM coverage unclear", confidence: "medium" },
              { gate: "g4", status: "non_compliant", evidence: "2 mandatory line items missing from pricing schedule", confidence: "high" },
              { gate: "g5", status: "compliant", evidence: "5-year pricing model provided in Section 4", confidence: "high" },
              { gate: "g6", status: "needs_human_review", evidence: "IRAP assessment referenced but level not specified", confidence: "medium" },
              { gate: "g7", status: "needs_human_review", evidence: "Essential Eight maturity self-assessed but no independent audit", confidence: "low" }
            ],
            summary: {
              compliant: 3,
              non_compliant: 1,
              needs_review: 3,
              total_gates: 7
            }
          }, null, 2)
        }]
      };
    }

    // ── Tool 3: Detect Deviations ─────────────────────────────
    case "detect_deviations": {
      const { criteriaId, bidderName: devBidder } = args;

      console.error(`[TE] Detecting deviations for: ${devBidder}`);

      // TODO: Implement deviation detection
      // 1. Compare submission against RFT requirements
      // 2. Identify: conditional offers, alternative proposals, exceptions
      // 3. Classify severity: acceptable / conditional / non-compliant
      // 4. Populate deviation register

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            status: "deviation_register_ready",
            bidder: devBidder || "Unknown Bidder",
            deviations: [
              {
                type: "conditional_offer",
                description: "Bidder offers alternative cloud architecture (AWS instead of Azure as specified)",
                severity: "high",
                recommendation: "Requires clarification — does alternative meet agency standards?"
              },
              {
                type: "exception",
                description: "Bidder takes exception to 90-day payment terms, requests 30-day terms",
                severity: "medium",
                recommendation: "Negotiable — check if evaluation criteria allows commercial variations"
              },
              {
                type: "partial_response",
                description: "Bidder did not address mandatory training requirement (Section 5.3)",
                severity: "high",
                recommendation: "Non-compliant unless addressed — flag for formal clarification"
              }
            ]
          }, null, 2)
        }]
      };
    }

    // ── Tool 4: Score Bids ────────────────────────────────────
    case "score_bids": {
      const { evaluationId, criteriaId: scoreCriteriaId } = args;

      console.error(`[TE] Scoring bids for evaluation: ${evaluationId}`);

      // TODO: Implement scoring logic
      // 1. Gather all compliance results for this evaluation
      // 2. Apply weighted scoring formula
      // 3. AI suggests scores
      // 4. Human adjusts with justification
      // 5. Generate comparative scorecard

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            status: "scores_ready_for_review",
            evaluationId,
            scoringMethod: "weighted_average",
            bidders: [
              {
                name: "Bidder A",
                scores: {
                  "Technical Capability": { raw: 32, weight: 40, weighted: 32 },
                  "Price": { raw: 25, weight: 30, weighted: 25 },
                  "Security & Compliance": { raw: 22, weight: 30, weighted: 22 }
                },
                totalWeightedScore: 79,
                complianceStatus: "2 non-compliant gates — requires clarification"
              },
              {
                name: "Bidder B",
                scores: {
                  "Technical Capability": { raw: 36, weight: 40, weighted: 36 },
                  "Price": { raw: 28, weight: 30, weighted: 28 },
                  "Security & Compliance": { raw: 28, weight: 30, weighted: 28 }
                },
                totalWeightedScore: 92,
                complianceStatus: "All gates compliant"
              },
              {
                name: "Bidder C",
                scores: {
                  "Technical Capability": { raw: 30, weight: 40, weighted: 30 },
                  "Price": { raw: 20, weight: 30, weighted: 20 },
                  "Security & Compliance": { raw: 18, weight: 30, weighted: 18 }
                },
                totalWeightedScore: 68,
                complianceStatus: "1 non-compliant gate (pricing incomplete)"
              }
            ],
            recommendedAward: "Bidder B — highest score + full compliance"
          }, null, 2)
        }]
      };
    }

    // ── Tool 5: Generate Report ───────────────────────────────
    case "generate_report": {
      const { evaluationId, format } = args;

      console.error(`[TE] Generating report for evaluation: ${evaluationId} (format: ${format})`);

      // TODO: Implement report generation
      // 1. Aggregate all evaluation data
      // 2. Format as compliance matrix + deviation register + scorecard
      // 3. Include full audit trail
      // 4. Export in requested format

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            status: "report_generated",
            evaluationId,
            format: format || "json",
            generatedAt: new Date().toISOString(),
            report: {
              evaluationSummary: {
                tenderId: "RFT-2026-001",
                agency: "Sample Agency",
                criteriaCount: 3,
                bidderCount: 3,
                totalGates: 7,
                awardRecommendation: "Bidder B"
              },
              auditTrail: [
                { action: "criteria_extracted", timestamp: new Date().toISOString(), by: "ai" },
                { action: "compliance_checked", timestamp: new Date().toISOString(), by: "ai" },
                { action: "deviations_detected", timestamp: new Date().toISOString(), by: "ai" },
                { action: "scores_calculated", timestamp: new Date().toISOString(), by: "ai" },
                { action: "report_generated", timestamp: new Date().toISOString(), by: "ai" }
              ],
              note: "All AI outputs require human approval before becoming official"
            }
          }, null, 2)
        }]
      };
    }

    default:
      throw new Error(`Unknown tool: ${request.params.name}`);
  }
});

// ==============================================================
// START THE SERVER
// Connects via stdio transport for MCP compatibility
// Start with: node mcp-server-te.js
// ==============================================================

const transport = new StdioServerTransport();
server.connect(transport);
console.error("Tender Evaluator MCP Server running...");
console.error("Available tools: extract_criteria, check_compliance, detect_deviations, score_bids, generate_report");