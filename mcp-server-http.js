#!/usr/bin/env node
/**
 * Tender Intelligence MCP Server (HTTP/SSE Transport)
 * 
 * This version uses HTTP/SSE transport for deployment compatibility.
 * Run this as a separate service, then the frontend can call it via HTTP.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const app = express();
const PORT = process.env.MCP_PORT || 3001;

// Enable CORS for frontend access
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// Store active transports
const transports = new Map();

// SSE endpoint for MCP connection
app.get("/sse", async (req, res) => {
  const transport = new SSEServerTransport("/messages", res);
  transports.set(transport.sessionId, transport);
  
  res.on("close", () => {
    transports.delete(transport.sessionId);
  });
  
  await server.connect(transport);
});

// Message endpoint for MCP
app.post("/messages", async (req, res) => {
  const sessionId = req.query.sessionId;
  const transport = transports.get(sessionId);
  
  if (transport) {
    await transport.handlePostMessage(req, res, req.body);
  } else {
    res.status(404).json({ error: "Session not found" });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "tender-intelligence-mcp" });
});

// Direct API endpoint for tender search (simpler HTTP API)
app.post("/api/search", async (req, res) => {
  try {
    const { keyword = "", daysBack = 30 } = req.body;
    const tenders = await searchAusTender(keyword, daysBack);
    res.json({ success: true, tenders });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create MCP Server
const server = new Server(
  {
    name: "tender-intelligence-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "search_austender",
        description: "Search AusTender for government contract opportunities using OCDS API",
        inputSchema: {
          type: "object",
          properties: {
            keyword: {
              type: "string",
              description: "Search keyword (e.g., 'cybersecurity', 'cloud', 'consulting')",
            },
            daysBack: {
              type: "number",
              description: "Number of days back to search (default: 30)",
              default: 30,
            },
          },
          required: [],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "search_austender") {
    try {
      const keyword = args.keyword || "";
      const daysBack = args.daysBack || 30;
      
      const tenders = await searchAusTender(keyword, daysBack);
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ tenders, count: tenders.length }),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ error: error.message }),
          },
        ],
        isError: true,
      };
    }
  }

  throw new Error(`Unknown tool: ${name}`);
});

// AusTender Search Function
async function searchAusTender(keyword, daysBack = 30) {
  const today = new Date();
  const pastDate = new Date(today);
  pastDate.setDate(today.getDate() - daysBack);
  
  const formatDate = (date) => date.toISOString().split('T')[0];
  const startDate = formatDate(pastDate);
  const endDate = formatDate(today);
  
  const url = `https://api.tenders.gov.au/ocds/findByDates/contractPublished/${startDate}/${endDate}`;
  
  console.error(`[AusTender] Fetching: ${url}`);
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`AusTender API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Extract releases from OCDS format
  const releases = data.releases || [];
  
  // Filter by keyword if provided
  let tenders = releases.map(release => {
    const tender = release.tender || {};
    const contracts = release.contracts || [];
    const contract = contracts[0] || {};
    
    return {
      CNID: release.ocid || tender.id || "UNKNOWN",
      Title: tender.title || "Untitled Tender",
      Agency: release.buyer?.name || "Unknown Agency",
      Category: tender.mainProcurementCategory || "Uncategorized",
      PublishedDate: tender.tenderPeriod?.startDate || release.date,
      Value: contract.value?.amount ? `$${contract.value.amount.toLocaleString()} ${contract.value.currency}` : 
             tender.value?.amount ? `$${tender.value.amount.toLocaleString()} ${tender.value.currency}` : "Not specified",
      description: tender.description || "",
      status: tender.status || "unknown",
      ocid: release.ocid,
    };
  });
  
  if (keyword && keyword.trim()) {
    const searchTerm = keyword.toLowerCase();
    tenders = tenders.filter(t => 
      t.Title.toLowerCase().includes(searchTerm) ||
      t.Agency.toLowerCase().includes(searchTerm) ||
      t.Category.toLowerCase().includes(searchTerm) ||
      (t.description && t.description.toLowerCase().includes(searchTerm))
    );
  }
  
  console.error(`[AusTender] Found ${tenders.length} tenders`);
  return tenders.slice(0, 10); // Limit to top 10
}

// Start HTTP server
app.listen(PORT, () => {
  console.error(`[MCP Server] Tender Intelligence MCP running on port ${PORT}`);
  console.error(`[MCP Server] SSE endpoint: http://localhost:${PORT}/sse`);
  console.error(`[MCP Server] Health check: http://localhost:${PORT}/health`);
  console.error(`[MCP Server] Direct API: http://localhost:${PORT}/api/search`);
});
