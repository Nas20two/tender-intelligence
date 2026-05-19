#!/bin/bash
# Tender Intelligence MCP Server Launcher
# Run this to start the MCP server on port 3001

cd "$(dirname "$0")"
echo "[Tender Intelligence] Starting MCP server on port 3001..."
echo "[Tender Intelligence] Press Ctrl+C to stop"
node mcp-server-http.js
