import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";

// 1. Initialize the MCP Server
const server = new Server({
  name: "austender-mcp-server",
  version: "1.0.0"
}, {
  capabilities: { tools: {} }
});

// 2. Define the Tool schema
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [{
      name: "search_austender",
      description: "Searches recent Australian Government Tenders (Contract Notices) and filters by an optional keyword.",
      inputSchema: {
        type: "object",
        properties: {
          keyword: { type: "string", description: "Optional keyword to filter titles, descriptions, or agencies (e.g., 'cybersecurity', 'cloud')." },
          daysBack: { type: "number", description: "Number of days back to search. Defaults to 7." }
        }
      }
    }]
  };
});

// 3. Execute the tool by fetching real data
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "search_austender") {
    const keyword = request.params.arguments?.keyword?.toLowerCase();
    const daysBack = request.params.arguments?.daysBack || 7;

    // Calculate dates in ISO 8601 format (YYYY-MM-DDThh:mm:ssZ) required by AusTender
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - daysBack);
    
    const startStr = startDate.toISOString().split('.')[0] + 'Z';
    const endStr = endDate.toISOString().split('.')[0] + 'Z';

    const url = `https://api.tenders.gov.au/ocds/findByDates/contractPublished/${startStr}/${endStr}`;
    console.error(`[Server Log]: Fetching ${url}`);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }
      const data = await response.json();
      
      let results = [];
      
      // Parse the massive OCDS JSON into a clean, flat list
      if (data && data.releases) {
        for (const release of data.releases) {
          const agency = release.parties?.find(p => p.roles?.includes("procuringEntity"))?.name || "Unknown Agency";
          const supplier = release.awards?.[0]?.suppliers?.[0]?.name || "Unknown Supplier";
          const contract = release.contracts?.[0];
          
          if (!contract) continue;
          
          const title = contract.title || "";
          const description = contract.description || "";
          const value = contract.value?.amount || "0";
          const date = contract.dateSigned || "";

          // Filter by keyword if provided
          const matchText = `${title} ${description} ${agency} ${supplier}`.toLowerCase();
          if (keyword && !matchText.includes(keyword)) {
            continue;
          }

          results.push({
            CNID: contract.id || "UNKNOWN",
            Title: title,
            Agency: agency,
            Category: "General",
            PublishedDate: date,
            Value: parseFloat(value).toLocaleString('en-US')
          });
        }
      }

      // Limit to top 10 so we don't overwhelm the LLM's context window
      const summary = results.slice(0, 10);

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            search_dates: `${startStr} to ${endStr}`,
            total_matches: results.length,
            showing: summary.length,
            tenders: summary
          }, null, 2)
        }]
      };
    } catch (error) {
      console.error(`[Server Log]: Fetch error:`, error);
      return {
        content: [{ type: "text", text: `Error fetching data: ${error.message}` }]
      };
    }
  }
  throw new Error("Tool not found");
});

const transport = new StdioServerTransport();
server.connect(transport);
console.error("AusTender MCP Server running...");