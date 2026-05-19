import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// AusTender OCDS API - Public, free, no auth required
const AUSTENDER_API = 'https://api.tenders.gov.au/ocds';

// MCP Server URL - optional, for when running locally
const MCP_SERVER_URL = process.env.MCP_SERVER_URL;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message } = body;

    console.log("[API] Received query:", message);
    
    // Extract keyword from user message
    const userMessage = message.toLowerCase().trim();
    let searchKeyword = "";
    
    // Check if it's a contract ID search (starts with CN followed by numbers)
    const isContractId = userMessage.startsWith('cn') && /^cn\d+$/.test(userMessage);
    
    if (isContractId) {
      // Pass the contract ID directly for exact matching
      searchKeyword = userMessage;
    } else if (userMessage.includes("cyber")) searchKeyword = "cybersecurity";
    else if (userMessage.includes("cloud")) searchKeyword = "cloud";
    else if (userMessage.includes("health")) searchKeyword = "health";
    else if (userMessage.includes("infrastructure")) searchKeyword = "infrastructure";
    else if (userMessage.includes("consult")) searchKeyword = "consulting";
    else if (userMessage.includes("software")) searchKeyword = "software";
    else if (userMessage.includes("it ")) searchKeyword = "IT";
    else if (userMessage === "find all tenders" || userMessage === "show all" || userMessage === "all tenders") {
      searchKeyword = ""; // Empty keyword returns all
    }

    // Try MCP server first (if configured), fallback to direct API
    let tenders: any[] = [];
    let usedMcp = false;

    if (MCP_SERVER_URL) {
      try {
        console.log("[API] Trying MCP server at:", MCP_SERVER_URL);
        const mcpResponse = await fetch(`${MCP_SERVER_URL}/api/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keyword: searchKeyword, daysBack: 30 })
        });

        if (mcpResponse.ok) {
          const mcpData = await mcpResponse.json();
          if (mcpData.success) {
            tenders = mcpData.tenders || [];
            usedMcp = true;
            console.log("[API] Used MCP server, found", tenders.length, "tenders");
          }
        }
      } catch (mcpError) {
        console.log("[API] MCP server unavailable, using direct API");
      }
    }

    // Fallback: Call AusTender API directly
    if (tenders.length === 0) {
      console.log("[API] Calling AusTender API directly");
      tenders = await searchAusTenderDirect(searchKeyword, 30);
      console.log("[API] Direct API found", tenders.length, "tenders");
    }

    // Build response
    let agentResponse = "";
    let rawData = null;

    if (tenders.length > 0) {
      const topTender = tenders[0];
      rawData = topTender;
      
      agentResponse = `I found ${tenders.length} matching tender${tenders.length > 1 ? 's' : ''} via AusTender!

**${topTender.Title}**
- **Agency:** ${topTender.Agency}
- **Category:** ${topTender.Category}
- **Published:** ${topTender.PublishedDate ? new Date(topTender.PublishedDate).toLocaleDateString() : 'N/A'}
- **Value:** ${topTender.Value || 'Not specified'}

${tenders.length > 1 ? `*Plus ${tenders.length - 1} more matching tenders.*\n\n` : ''}I've populated the details in the **Context Panel** for your review.`;
    } else {
      agentResponse = `I connected to AusTender but couldn't find any recent tenders matching "${searchKeyword || 'any'}" in the last 30 days.

Try a different keyword like "cybersecurity", "cloud", "consulting", or "software".`;
    }

    return NextResponse.json({
      role: 'assistant',
      content: agentResponse,
      rawData: rawData,
      allTenders: tenders,
      steps: [
        { id: "1", status: "complete", label: "Parsed query parameters" },
        { id: "2", status: "complete", label: usedMcp ? "Connected to MCP server" : "Connected to AusTender API" },
        { id: "3", status: "complete", label: `Fetched ${tenders.length} OCDS records` },
        { id: "4", status: "complete", label: "Drafted summary" }
      ]
    });

  } catch (error: any) {
    console.error("[API] Error:", error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}

// Direct AusTender API call (no MCP needed)
async function searchAusTenderDirect(keyword: string, daysBack: number): Promise<any[]> {
  // Use a fixed recent date range (API doesn't like future dates)
  const endDate = new Date('2025-05-19T00:00:00Z');
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - daysBack);
  
  const formatDate = (date: Date) => date.toISOString().split('.')[0] + 'Z'; // Remove milliseconds
  const startDateStr = formatDate(startDate);
  const endDateStr = formatDate(endDate);
  
  const url = `${AUSTENDER_API}/findByDates/contractPublished/${startDateStr}/${endDateStr}`;
  
  console.log("[AusTender] Fetching:", url);
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`AusTender API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  const releases = data.releases || [];
  
  let tenders = releases.map((release: any) => {
    const tender = release.tender || {};
    const contracts = release.contracts || [];
    const contract = contracts[0] || {};
    const awards = release.awards || [];
    const award = awards[0] || {};
    
    // Get supplier name from parties
    const parties = release.parties || [];
    const supplier = parties.find((p: any) => p.roles?.includes('supplier'));
    const procuringEntity = parties.find((p: any) => p.roles?.includes('procuringEntity'));
    
    return {
      CNID: contract.id || release.ocid || "UNKNOWN",
      Title: contract.title || contract.description || tender.title || "Government Contract",
      Agency: procuringEntity?.name || release.buyer?.name || "Australian Government",
      Category: tender.mainProcurementCategory || "Services",
      PublishedDate: contract.dateSigned || release.date,
      Value: contract.value?.amount ? `$${parseFloat(contract.value.amount).toLocaleString()} ${contract.value.currency}` : "Not specified",
      description: contract.description || tender.description || "",
      status: contract.status || tender.status || "active",
      ocid: release.ocid,
      supplier: supplier?.name || "",
    };
  });
  
  if (keyword && keyword.trim()) {
    const searchTerm = keyword.toLowerCase().trim();
    // Check if it looks like a contract ID (starts with CN followed by numbers)
    const isContractId = searchTerm.startsWith('cn') && /^cn\d+$/.test(searchTerm);
    console.log(`[Search] Term: "${searchTerm}", IsContractId: ${isContractId}`);
    
    tenders = tenders.filter((t: any) => {
      const cnidLower = t.CNID.toLowerCase();
      // Exact match for contract IDs, partial match for everything else
      if (isContractId) {
        const match = cnidLower === searchTerm;
        if (match) console.log(`[Search] Exact match: ${t.CNID}`);
        return match;
      }
      return cnidLower.includes(searchTerm) ||
        t.Title.toLowerCase().includes(searchTerm) ||
        t.Agency.toLowerCase().includes(searchTerm) ||
        t.Category.toLowerCase().includes(searchTerm) ||
        (t.description && t.description.toLowerCase().includes(searchTerm));
    });
    
    console.log(`[Search] Found ${tenders.length} matches for "${searchTerm}"`);
  }
  
  return tenders.slice(0, 10);
}
