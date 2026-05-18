import { spawn } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Spawn the MCP server as a child process
const server = spawn("node", [join(__dirname, "mcp-server-skeleton.js")]);

server.stderr.on("data", (data) => {
  console.error(`[Server Log]: ${data}`);
});

server.stdout.on("data", (data) => {
  console.log(`[Response from Server]: ${data}`);
  // Exit after receiving the response to not hang the test
  process.exit(0);
});

// Craft a JSON-RPC 2.0 request asking for available tools
const request = {
  jsonrpc: "2.0",
  id: 1,
  method: "tools/list",
  params: {}
};

// Send the request over stdio
console.log("Sending list_tools request to the MCP server...");
server.stdin.write(JSON.stringify(request) + "\n");
