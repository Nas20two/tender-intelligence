# Tender Intelligence — Product Roadmap

**Last updated:** 27 May 2026

---

## ✅ Phase 0 — Live (Deployed)
| Component | Status |
|-----------|--------|
| TI — Tender Discovery (AusTender search) | ✅ tenders.nasyhub.com/ti |
| TE — Tender Evaluator prototype (4-step) | ✅ tenders.nasyhub.com/te |
| /about — Architecture + security positioning | ✅ tenders.nasyhub.com/about |
| MCP servers (STDIO + HTTP/SSE) | ✅ Both working |
| BadHost positioning (Node.js ≠ Python) | ✅ On /about |

---

## 🔜 Phase 1 — Next Build (Near-term)
| Item | Why |
|------|-----|
| Wire PDF parsing for compliance rules | TE reads actual RFT documents |
| NSW/VIC/QLD rulesets | State-specific CPR compliance logic |
| `generate_report` tool | Full compliance matrix PDF |
| Client delivery docs + runbook | Needed for IAG conversations |

---

## 🗓 Phase 2 — Supervisor Agent (Medium-term)
A **Tender Supervisor** — one agent that orchestrates TI + TE together. You give it a natural-language brief:

> *"Find last minute NSW health tenders and check if our submission would comply."*

It dispatches:
1. TI searches AusTender → finds tenders
2. TE evaluates compliance against rulesets
3. Synthesises results into one answer

**This is the mediator/supervisor pattern from the exam.** Not a new build — it's a thin orchestration layer on top of existing tools. No new infra, just routing + aggregation logic.

---

## 🧠 Phase 3 — MCP Connectors (Future)
- SharePoint connector → IAG document retrieval (if Phase 2 goes well)
- Email connector → tender alerts delivered to inbox
- Slack connector → team can query tenders from chat

---

## When
| Phase | Timing | Trigger |
|-------|--------|---------|
| Phase 1 | Next 1-2 weeks | Start when IAG call happens |
| Phase 2 | After Phase 1 ships | When TI+TE both stable |
| Phase 3 | Client-dependent | Only if someone asks for it |

**Supervisor agent is cool but don't build it yet.** Ship Phase 1 first — the IAG call proves we can deliver. The supervisor is the upsell after they've seen the individual tools work.