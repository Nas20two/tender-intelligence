import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function runAgent() {
  // Grab the API key from the environment
  let apiKey = process.env.OPENROUTER_API_KEY;
  
  // GH-600 Sandbox fallback: If no API key is provided, we will just use a hardcoded
  // mock response so the user can see the agent loop without needing a paid API key right now.
  let isMock = false;
  if (!apiKey || apiKey.includes("your_a")) {
    console.warn("⚠️ WARNING: No valid OPENROUTER_API_KEY found. Running in MOCK LLM mode.");
    isMock = true;
  }

  console.log("🔌 1. Connecting to local AusTender MCP Server...");
  const transport = new StdioClientTransport({
    command: "node",
    args: [join(__dirname, "mcp-server-skeleton.js")]
  });
  
  const mcpClient = new Client({ name: "tender-intelligence-agent", version: "1.0.0" }, { capabilities: {} });
  await mcpClient.connect(transport);
  
  console.log("🛠️  2. Fetching available tools from MCP Server...");
  const { tools } = await mcpClient.listTools();
  
  // Format the MCP tools into the standard OpenAI format that LLMs expect
  const llmTools = tools.map(t => ({
    type: "function",
    function: {
      name: t.name,
      description: t.description,
      parameters: t.inputSchema
    }
  }));

  const messages = [
    { role: "system", content: "You are an expert procurement analyst. Having worked in tenders before, you deeply understand the operational challenges, high costs, and compliance risks involved. Use your tools to find relevant Australian Government tenders, and present a professional, concise summary." },
    { role: "user", content: "Are there any recent government tenders for 'cybersecurity'?" }
  ];

  console.log("🧠 3. Asking LLM (via OpenRouter) to evaluate the request...");
  let response;
  
  if (isMock) {
    response = {
      choices: [{
        message: {
          role: "assistant",
          content: null,
          tool_calls: [{
            id: "call_mock123",
            type: "function",
            function: {
              name: "search_austender",
              arguments: "{\"keyword\":\"cybersecurity\",\"daysBack\":7}"
            }
          }]
        }
      }]
    };
  } else {
    response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "openrouter/auto", // Uses a fast/free model like DeepSeek or Gemini
        messages: messages,
        tools: llmTools
      })
    }).then(r => r.json());
  }

  if (!response.choices || !response.choices[0]) {
    console.error("❌ ERROR: OpenRouter API returned an unexpected response. Did you use a valid API key?");
    console.error(JSON.stringify(response, null, 2));
    process.exit(1);
  }

  const message = response.choices[0].message;

  if (message.tool_calls) {
    messages.push(message); // Keep history

    for (const toolCall of message.tool_calls) {
      console.log(`\n⚡ 4. LLM decided to execute tool: ${toolCall.function.name}`);
      const args = JSON.parse(toolCall.function.arguments);
      console.log(`   Arguments passed by LLM:`, args);

      // 💥 THIS IS THE MAGIC: We route the LLM's request directly to our secure MCP server
      console.log(`   Executing securely inside MCP sandbox...`);
      const result = await mcpClient.callTool({
        name: toolCall.function.name,
        arguments: args
      });

      const toolResultText = result.content[0].text;
      console.log(`   ✅ Success! Data retrieved from AusTender.`);

      // Give the data back to the LLM
      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        name: toolCall.function.name,
        content: toolResultText
      });
    }

    console.log("\n📝 5. Sending raw data back to LLM for final executive summary...");
    let finalResponse;
    if (isMock) {
        finalResponse = {
            choices: [{
                message: {
                    content: "Executive Summary:\nI have searched the Australian Government AusTender database for the keyword 'cybersecurity' over the last 7 days.\n\nWe found matching active contracts, confirming that cybersecurity procurement remains a high priority for agencies. Please see the raw data attached for specific supplier details and contract values."
                }
            }]
        };
    } else {
        finalResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: "openrouter/auto",
            messages: messages
          })
        }).then(r => r.json());
    }

    console.log(`\n======================================================`);
    console.log(`🏆 FINAL AGENT OUTPUT:`);
    console.log(`======================================================\n`);
    console.log(finalResponse.choices[0].message.content);
    console.log(`\n======================================================`);
  } else {
    console.log("LLM answered directly without using tools:", message.content);
  }

  process.exit(0);
}

runAgent().catch(console.error);
