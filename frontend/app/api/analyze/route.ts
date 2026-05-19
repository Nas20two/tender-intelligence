import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// OpenRouter API for LLM analysis
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Default model for analysis
const ANALYSIS_MODEL = 'deepseek/deepseek-v4-flash';

interface TenderData {
  CNID: string;
  Title: string;
  Agency: string;
  Category: string;
  PublishedDate: string;
  Value: string;
  description?: string;
}

interface AnalysisResult {
  executive_summary: string;
  key_insights: string[];
  competitive_analysis: {
    competition_level: 'Low' | 'Medium' | 'High';
    estimated_competitors: number;
    differentiation_opportunities: string[];
  };
  win_probability: {
    score: number; // 0-100
    factors: string[];
  };
  recommended_actions: string[];
  risks: {
    level: 'Low' | 'Medium' | 'High';
    items: string[];
  };
  compliance_requirements: string[];
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tender, query }: { tender: TenderData; query?: string } = body;

    if (!tender) {
      return NextResponse.json(
        { error: 'Tender data is required' },
        { status: 400 }
      );
    }

    // If no OpenRouter key, return mock analysis for demo
    if (!OPENROUTER_API_KEY) {
      console.log('[Analyze] No OpenRouter key, returning mock analysis');
      const mockAnalysis = generateMockAnalysis(tender);
      return NextResponse.json({ analysis: mockAnalysis, source: 'mock' });
    }

    // Build the analysis prompt
    const analysisPrompt = buildAnalysisPrompt(tender, query);

    console.log('[Analyze] Calling OpenRouter for analysis...');
    
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://tender-intelligence.vercel.app',
        'X-Title': 'Tender Intelligence'
      },
      body: JSON.stringify({
        model: ANALYSIS_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are an expert tender analyst and bid strategist with 15+ years of experience in Australian government procurement.

Analyze the provided tender data and return a structured JSON analysis with these exact fields:
- executive_summary: A 2-3 sentence overview
- key_insights: Array of 3-5 key observations
- competitive_analysis: Object with competition_level (Low/Medium/High), estimated_competitors (number), differentiation_opportunities (array)
- win_probability: Object with score (0-100) and factors (array)
- recommended_actions: Array of 3-5 specific next steps
- risks: Object with level (Low/Medium/High) and items (array)
- compliance_requirements: Array of likely compliance items

Respond ONLY with valid JSON, no markdown formatting.`
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[Analyze] OpenRouter error:', error);
      // Fallback to mock analysis
      const mockAnalysis = generateMockAnalysis(tender);
      return NextResponse.json({ 
        analysis: mockAnalysis, 
        source: 'mock-fallback',
        error: 'LLM service unavailable'
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in LLM response');
    }

    // Parse the JSON response
    let analysis: AnalysisResult;
    try {
      // Try to extract JSON if wrapped in markdown
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || 
                       content.match(/```\n?([\s\S]*?)\n?```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      analysis = JSON.parse(jsonStr);
    } catch (e) {
      console.error('[Analyze] Failed to parse LLM response:', content);
      // Fallback to mock
      analysis = generateMockAnalysis(tender);
    }

    return NextResponse.json({ 
      analysis, 
      source: 'llm',
      model: ANALYSIS_MODEL
    });

  } catch (error: any) {
    console.error('[Analyze] Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

function buildAnalysisPrompt(tender: TenderData, query?: string): string {
  return `Analyze this Australian government tender opportunity:

TENDER DETAILS:
- ID: ${tender.CNID}
- Title: ${tender.Title}
- Agency: ${tender.Agency}
- Category: ${tender.Category}
- Published: ${tender.PublishedDate}
- Estimated Value: ${tender.Value || 'Not specified'}
${tender.description ? `- Description: ${tender.description}` : ''}

${query ? `USER QUERY: ${query}` : ''}

Provide a strategic analysis including win probability, competitive landscape, key risks, and recommended actions. Return as structured JSON.`;
}

function generateMockAnalysis(tender: TenderData): AnalysisResult {
  const value = tender.Value || '';
  const isHighValue = value.includes('M') || parseInt(value.replace(/[^0-9]/g, '')) > 1000000;
  const isCyber = tender.Title.toLowerCase().includes('cyber') || 
                  tender.Title.toLowerCase().includes('security');
  
  return {
    executive_summary: `The ${tender.Title} tender represents a ${isHighValue ? 'significant' : 'moderate'} opportunity with ${tender.Agency}. ${isCyber ? 'Given the cybersecurity focus, strong technical credentials will be critical.' : 'Standard procurement process expected.'}`,
    
    key_insights: [
      `${tender.Agency} has ${isHighValue ? 'substantial' : 'moderate'} procurement budget`,
      isCyber ? 'Security clearance requirements likely' : 'Standard compliance framework applies',
      `Published on ${tender.PublishedDate} — check remaining timeline`,
      `${tender.Category} category suggests ${isHighValue ? 'complex evaluation' : 'streamlined process'}`,
      'Past performance evidence will be weighted heavily'
    ],
    
    competitive_analysis: {
      competition_level: isHighValue ? 'High' : 'Medium',
      estimated_competitors: isHighValue ? 8 : 4,
      differentiation_opportunities: [
        'Emphasize Australian-based delivery team',
        'Highlight relevant case studies in same agency',
        'Demonstrate innovation in approach',
        'Offer value-add services beyond scope'
      ]
    },
    
    win_probability: {
      score: isHighValue ? 35 : 55,
      factors: [
        isHighValue ? 'High competition reduces probability' : 'Moderate competition',
        'Strong capability alignment needed',
        'Price competitiveness critical',
        'Past government experience valued'
      ]
    },
    
    recommended_actions: [
      'Request tender clarification on evaluation criteria weighting',
      'Research agency\'s recent awarded contracts',
      'Identify potential subcontracting partners',
      'Prepare capability statement and case studies',
      'Schedule internal bid/no-bid decision meeting'
    ],
    
    risks: {
      level: isHighValue ? 'High' : 'Medium',
      items: [
        'Tight submission timeline',
        'Complex compliance requirements',
        'Unclear evaluation criteria weighting',
        'Potential incumbent advantage'
      ]
    },
    
    compliance_requirements: [
      'Australian Business Number (ABN)',
      'Tax compliance clearance',
      'Insurance certificates (PL/PI)',
      'Modern Slavery Act statement',
      isCyber ? 'Security clearance (minimum Baseline)' : 'Standard security checks'
    ]
  };
}
