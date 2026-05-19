# Tender Intelligence

**Live URL:** https://tenders.nasyhub.com

AI-powered government tender discovery and analysis platform. Built with secure AI agent architecture featuring Model Context Protocol (MCP) and Human-in-the-Loop (HITL) workflows.

## Features

- **Real-time Tender Search**: Live connection to AusTender OCDS API
- **AI-Powered Insights**: Win probability, competitive analysis, risk assessment
- **MCP Architecture**: Model Context Protocol for secure AI-tool integration
- **HITL Workflows**: Human approval required for all external actions
- **Audit Logging**: Complete traceability for compliance

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Next.js UI    │────▶│  MCP Server     │────▶│  AusTender API  │
│  (Vercel)       │     │  (Node.js)      │     │  (OCDS JSON)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │
         ▼
┌─────────────────┐
│  AI Analysis    │
│  (Mock/LLM)     │
└─────────────────┘
```

## Core Components

1. **`mcp-server.js`**: MCP server that securely fetches data from AusTender API
2. **`mcp-server-http.js`**: HTTP transport version for deployment
3. **`frontend/`**: Next.js React application with TypeScript
4. **`.github/workflows/human-in-the-loop.yml`**: CI/CD with mandatory human approval

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Model Context Protocol (MCP)
- **API**: AusTender OCDS (Open Contracting Data Standard)
- **Deploy**: Vercel (frontend), Local/Cloud (MCP server)
- **Cost**: $0/month (free tiers)

## Local Development

```bash
# Start MCP server
node mcp-server-http.js

# Start frontend (in another terminal)
cd frontend
npm install
npm run dev
```

## Environment Variables

Optional for local development:
- `MCP_SERVER_URL`: URL to MCP server (defaults to localhost:3001)
- `OPENROUTER_API_KEY`: For AI analysis features (optional, mock mode available)

## HITL Workflow

The GitHub Actions workflow enforces human approval:
- `analyze`: Read-only analysis (no approval needed)
- `draft_response`: Creates PR for tender response (requires approval)
- `draft_email`: Creates email draft (requires approval)

Set up GitHub Environments:
- `tender-response-approval`
- `email-approval-required`

## License

MIT - Open source, free to use.

---

Built with secure AI agent architecture principles.
