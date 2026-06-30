# Tender Intelligence

**Live URL:** https://tenders.nasyhub.com

AI-powered government tender discovery, compliance analysis, and bid evaluation platform. Built with secure AI agent architecture featuring Model Context Protocol (MCP), Human-in-the-Loop (HITL) workflows, and a full Stripe premium tier.

---

## Products

### 1. Tender Discovery (`/ti`)
Real-time tender search connected to the AusTender OCDS API with AI-powered analysis.

- Free: Daily search limits
- Premium: Unlimited searches, saved watchlists, weekly email alerts ($19/mo)

### 2. Tender Evaluator (`/te`)
Compliance scoring and bid evaluation engine. Upload RFT documents for:

- Criteria extraction and compliance matching
- Deviation detection with weighted scoring
- MCP-based with pluggable rulesets (CPRs, state-specific)

### 3. Browse Tenders (`/tenders`)
Public tender board with category filtering and search. No login required.

---

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Next.js UI    │────▶│  MCP Server(s)  │────▶│  AusTender API  │
│  (Vercel)       │     │  (Node.js)      │     │  (OCDS JSON)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌──────────────────┐
│  AI Analysis    │    │  AI Analysis     │
│  (via Chat)     │    │  (Tender Eval.)  │
└─────────────────┘    └──────────────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────────┐
│  Lead Capture   │────▶│  Resend Email    │
│  (API Route)    │     │  → Nas' Inbox    │
└─────────────────┘     └──────────────────┘
```

## Core Components

| Component | Description |
|-----------|-------------|
| `mcp-server.js` | Main MCP server for AusTender data fetching |
| `mcp-server-http.js` | HTTP transport version for cloud deployment |
| `mcp-server-te.js` | Tender Evaluator MCP server for compliance scoring |
| `frontend/` | Next.js 16 app (TypeScript, Tailwind, shadcn/ui) |
| `data/` | Sample tender data for testing |
| `llm-client.js` | LLM integration for AI analysis |

## Frontend Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing | Product showcase |
| `/tenders` | Browse | Free tender board with search & filters |
| `/tenders/[category]` | Category | Per-category tender listings |
| `/ti` | AI Search | Chat-based AI tender analysis |
| `/te` | Evaluator | Tender compliance scoring tool |
| `/te/about` | TE About | Tender Evaluator documentation |
| `/premium` | Pricing | Premium subscription ($19/mo) |
| `/premium/success` | Success | Post-checkout confirmation |
| `/about` | About | Architecture & deployment info |

## Lead Capture Flow

All premium signups trigger a lead notification:

```
User enters email on premium page
    → POST /api/lead-capture
    → Resend email notification
    → nasir418ece@gmail.com (Consulting Leads label)
    → THEN redirect to Stripe checkout
```

Set in Vercel env: `RESEND_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_TI_PRICE_ID`

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Model Context Protocol (MCP SDK)
- **API**: AusTender OCDS (Open Contracting Data Standard v1.1)
- **Payments**: Stripe (Checkout Sessions, Webhooks)
- **Notifications**: Resend (lead alerts to central inbox)
- **Deploy**: Vercel (frontend), Local/Cloud (MCP server)
- **Cost**: ~$0/month (free tiers)

## Local Development

```bash
# Start MCP server
node mcp-server-http.js

# Start frontend (separate terminal)
cd frontend
npm install
npm run dev
```

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `OPENROUTER_API_KEY` | For AI | LLM-powered analysis features |
| `RESEND_API_KEY` | For leads | Lead notification emails |
| `STRIPE_SECRET_KEY` | For payments | Stripe subscription processing |
| `STRIPE_TI_PRICE_ID` | For payments | Premium tier price ID |
| `MCP_SERVER_URL` | Optional | Custom MCP server URL |

## HITL Workflow

GitHub Actions enforces human approval for external actions:
- `analyze`: Read-only (no approval needed)
- `draft_response`: PR for tender response (requires approval)
- `draft_email`: Email draft (requires approval)

GitHub Environments: `tender-response-approval`, `email-approval-required`

## Deployment

Deployed as a Vercel project (`frontend` directory). Lead capture, Stripe integration, and premium features are production-ready.

```bash
cd frontend
npx vercel --prod
```

## License

MIT — Open source, free to use.

---

Built with secure AI agent architecture principles.