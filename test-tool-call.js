import { spawn } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const server = spawn("node", [join(__dirname, "mcp-server-skeleton.js")]);

server.stderr.on("data", (data) => {
  console.error(`[Server Log]: ${data}`);
});

server.stdout.on("data", (data) => {
  console.log(`\n[Response from Server]:\n${data}`);
  process.exit(0);
});

// Craft a JSON-RPC 2.0 request to execute the tool
const request = {
  jsonrpc: "2.0",
  id: 2,
  method: "tools/call",
  params: {
    name: "search_austender",
    arguments: {
      keyword: "software",
      daysBack: 7
    }
  }
};

console.log("Sending tools/call request to the MCP server...");
server.stdin.write(JSON.stringify(request) + "\n");