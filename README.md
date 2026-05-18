## Tender Intelligence Architecture
This repository contains the backend engine for the Tender Intelligence product.

### Core Components:
1. **mcp-server.js**: A Model Context Protocol (MCP) server that securely fetches real-time data from the Australian Government AusTender API (OCDS JSON format).
2. **llm-client.js**: The autonomous agent loop connecting OpenRouter/DeepSeek to the MCP server.
3. **.github/workflows/human-in-the-loop.yml**: Enterprise-grade CI/CD pipeline enforcing a mandatory human review (HITL) before the agent can execute final outputs.
