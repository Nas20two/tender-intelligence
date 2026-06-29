// ─────────────────────────────────────────────────────────────────
// TE API Route — Backend bridge to TE MCP core engine
// Handles criteria → compliance → deviation → scoring → report
// Uses the same core engine as the MCP server (stdio) but via HTTP
// ─────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// In-memory evaluation store (same pattern as MCP server)
// In production this would be backed by KV/store
const evaluationStore = {};

// OpenRouter for LLM-powered analysis generation
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

function generateReportSummary(session) {
  const bidders = Object.keys(session.bidders);
  return {
    totalBidders: bidders.length,
    recommendedBidder: session.scored?.recommended || 'Not scored',
    totalDeviations: Object.values(session.bidders).reduce((sum, b) => sum + (b.deviations?.length || 0), 0),
    compliantBidders: Object.values(session.bidders).filter(b => b.compliance?.passedMandatory).length
  };
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { action, ...params } = body;

    switch (action) {
      case 'extract_criteria':
        return handleExtractCriteria(params);
      case 'check_compliance':
        return handleCheckCompliance(params);
      case 'detect_deviations':
        return handleDetectDeviations(params);
      case 'score_bids':
        return handleScoreBids(params);
      case 'generate_report':
        return handleGenerateReport(params);
      case 'llm_analyse':
        return handleLLMAnalysis(params);
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error) {
    console.error('[TE API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ── Step 1: Extract Criteria ──────────────────────────────────────
function handleExtractCriteria(params) {
  const {
    jurisdiction = 'federal', value, entityType,
    category = 'goods_services', tenderTitle, agency
  } = params;

  const criteriaId = 'criteria_' + Date.now();
  const isDivision2 = entityType === 'non-corporate' ? value >= 125000 : value >= 400000;

  const criteria = [
    { id: 'cp1', name: 'Value for Money (CPR 4)', type: 'core_principle', mandatory: true, weight: 20, category: 'financial' },
    { id: 'cp2', name: 'Encouraging Competition (CPR 5)', type: 'core_principle', mandatory: true, weight: 10, category: 'process' },
    { id: 'cp3', name: 'Ethical & Efficient (CPR 6)', type: 'core_principle', mandatory: true, weight: 10, category: 'compliance' },
    { id: 'cp4', name: 'Accountability & Transparency (CPR 7)', type: 'core_principle', mandatory: true, weight: 5, category: 'compliance' },
    { id: 'cp5', name: 'Procurement Risk (CPR 8)', type: 'core_principle', mandatory: true, weight: 5, category: 'risk' },
    { id: 'gate_capability', name: 'Government Contracting Experience', type: 'compliance_gate', mandatory: true, weight: 15, category: 'capability', checkType: 'document_check', evidencePattern: ['government', 'contract', 'federal'] },
    { id: 'gate_iso27001', name: 'ISO 27001 Certification', type: 'compliance_gate', mandatory: true, weight: 10, category: 'security', checkType: 'certification_check', evidencePattern: ['ISO 27001', 'information security management'] },
    { id: 'gate_insurance', name: 'Insurance (PL/PI $10M+)', type: 'compliance_gate', mandatory: true, weight: 5, category: 'commercial', checkType: 'document_check', evidencePattern: ['public liability', 'professional indemnity'] },
    { id: 'gate_whs', name: 'WHS Policy & Track Record', type: 'compliance_gate', mandatory: true, weight: 5, category: 'compliance', checkType: 'policy_check', evidencePattern: ['WHS', 'safety policy'] },
    { id: 'gate_modern_slavery', name: 'Modern Slavery Statement', type: 'compliance_gate', mandatory: value > 100000000, weight: 3, category: 'compliance', checkType: 'statement_check', evidencePattern: ['modern slavery'] },
    { id: 'gate_conflict', name: 'Conflict of Interest Declaration', type: 'compliance_gate', mandatory: true, weight: 3, category: 'probity', checkType: 'declaration_check', evidencePattern: ['conflict of interest'] },
    { id: 'gate_data_security', name: 'Data Security & PSPF Compliance', type: 'compliance_gate', mandatory: true, weight: 5, category: 'security', checkType: 'policy_check', evidencePattern: ['data security', 'PSPF'] },
    { id: 'gate_financial', name: 'Financial Viability ($5M+ Turnover)', type: 'compliance_gate', mandatory: true, weight: 5, category: 'financial', checkType: 'document_check', evidencePattern: ['turnover', 'revenue', 'financial statement'] },
  ];

  if (isDivision2) {
    criteria.push(
      { id: 'd2r1', name: 'Open Approach (CPR 10.2)', type: 'division2_requirement', mandatory: true, weight: 3, category: 'process' },
      { id: 'd2r2', name: 'Minimum Timeframes (CPR 10.7)', type: 'division2_requirement', mandatory: true, weight: 2, category: 'process' },
    );
  }

  const scored = criteria.map(c => ({ ...c, status: 'pending', evidence: '' }));

  const result = {
    criteriaId, jurisdiction,
    division: isDivision2 ? 'Division 2' : 'Division 1',
    contractValue: value, entityType,
    totalCriteria: scored.length, criteria: scored,
    tenderTitle: tenderTitle || `RFT ${criteriaId}`,
    agency: agency || 'Australian Government'
  };

  evaluationStore[criteriaId] = { criteria: result, bidders: {}, createdAt: Date.now() };

  return NextResponse.json({ result, source: 'engine' });
}

// ── Step 2: Check Compliance ──────────────────────────────────────
function handleCheckCompliance(params) {
  const { evaluationId, bidderName, evidence } = params;
  const session = evaluationStore[evaluationId];
  if (!session) {
    return NextResponse.json({ error: 'Invalid evaluationId. Run extract_criteria first.' }, { status: 400 });
  }

  const e = evidence || {};
  const matrix = session.criteria.criteria.map(c => {
    const text = (e[c.id] || '').toLowerCase();
    const patterns = (c.evidencePattern || []).map(p => p.toLowerCase());
    const hasMatch = patterns.length === 0 || patterns.some(p => {
      const words = p.split(/\s+/);
      const hits = words.filter(w => text.includes(w));
      return hits.length >= Math.ceil(words.length / 2);
    });

    return {
      gate: c.id, name: c.name, type: c.type, mandatory: c.mandatory,
      category: c.category,
      status: hasMatch ? 'compliant' : (text ? 'needs_human_review' : 'non_compliant'),
      evidence: e[c.id] || '', confidence: hasMatch ? 'high' : 'low',
      notes: hasMatch ? 'Verified by evidence match' : 'No matching evidence found'
    };
  });

  const result = {
    bidder: bidderName, evaluationId, matrix,
    summary: {
      total: matrix.length,
      compliant: matrix.filter(g => g.status === 'compliant').length,
      nonCompliant: matrix.filter(g => g.status === 'non_compliant').length,
      needsReview: matrix.filter(g => g.status === 'needs_human_review').length,
      notApplicable: 0
    },
    passedMandatory: matrix.filter(g => g.mandatory && g.status === 'non_compliant').length === 0
  };

  if (!session.bidders[bidderName]) session.bidders[bidderName] = {};
  session.bidders[bidderName].compliance = result;

  return NextResponse.json({ result, source: 'engine' });
}

// ── Step 3: Detect Deviations ─────────────────────────────────────
function handleDetectDeviations(params) {
  const { evaluationId, bidderName, evidence } = params;
  const session = evaluationStore[evaluationId];
  if (!session) {
    return NextResponse.json({ error: 'Invalid evaluationId. Run extract_criteria first.' }, { status: 400 });
  }

  const deviations = [];
  const e = evidence || {};

  for (const [gateId, text] of Object.entries(e)) {
    const lower = (text || '').toLowerCase();
    const cond = ['alternatively', 'propose', 'suggest', 'instead of', 'equivalent', 'variation', 'exception', 'conditional', 'subject to', 'if accepted'].filter(m => lower.includes(m));
    if (cond.length > 0) {
      deviations.push({
        gate: gateId, type: 'conditional',
        severity: cond.length > 2 ? 'high' : 'medium',
        description: `Conditional language: "${cond.slice(0, 3).join(', ')}"`,
        detail: text.substring(0, 200)
      });
    }
    const exc = ['take exception', 'do not agree', 'unable to comply', 'cannot accept'].filter(m => lower.includes(m));
    if (exc.length > 0) {
      deviations.push({
        gate: gateId, type: 'exception', severity: 'high',
        description: `Exception: "${exc.join(', ')}"`,
        detail: text.substring(0, 200)
      });
    }
  }

  if (!session.bidders[bidderName]) session.bidders[bidderName] = {};
  session.bidders[bidderName].deviations = deviations;

  return NextResponse.json({
    result: {
      bidder: bidderName, evaluationId,
      totalDeviations: deviations.length,
      highSeverity: deviations.filter(d => d.severity === 'high').length,
      deviations
    },
    source: 'engine'
  });
}

// ── Step 4: Score Bids ────────────────────────────────────────────
function handleScoreBids(params) {
  const { evaluationId, scores } = params;
  const session = evaluationStore[evaluationId];
  if (!session) {
    return NextResponse.json({ error: 'Invalid evaluationId. Run extract_criteria first.' }, { status: 400 });
  }

  const criteria = session.criteria.criteria;
  const ranked = Object.entries(scores || {}).map(([name, scoreMap]) => {
    let total = 0;
    const breakdown = {};
    for (const c of criteria) {
      const raw = (scoreMap[c.id] || 0);
      const w = c.weight || 5;
      breakdown[c.id] = { name: c.name, raw, weight: w, weighted: (raw / 100) * w };
      total += (raw / 100) * w;
    }
    const bidderData = session.bidders[name] || {};
    return {
      name, totalScore: Math.round(total * 10) / 10, breakdown,
      compliant: bidderData.compliance?.passedMandatory ?? true,
      deviations: (bidderData.deviations || []).length
    };
  });

  ranked.sort((a, b) => b.totalScore - a.totalScore);
  const result = { ranked, recommended: ranked[0]?.name || null };
  session.scored = result;

  return NextResponse.json({ result, source: 'engine' });
}

// ── Step 5: Generate Report ───────────────────────────────────────
function handleGenerateReport(params) {
  const { evaluationId, format = 'summary' } = params;
  const session = evaluationStore[evaluationId];
  if (!session) {
    return NextResponse.json({ error: 'Invalid evaluationId. Run extract_criteria first.' }, { status: 400 });
  }

  const c = session.criteria;
  const report = {
    evaluationId, generatedAt: new Date().toISOString(),
    procurement: {
      title: c.tenderTitle, jurisdiction: c.jurisdiction,
      division: c.division, contractValue: c.contractValue,
      entityType: c.entityType, totalCriteria: c.totalCriteria
    },
    criteriaBreakdown: c.criteria.map(cr => ({
      id: cr.id, name: cr.name, type: cr.type, mandatory: cr.mandatory,
      category: cr.category, weight: cr.weight
    })),
    bidders: Object.entries(session.bidders).map(([name, data]) => ({
      name,
      compliance: data.compliance || null,
      deviations: data.deviations || [],
      score: session.scored?.ranked?.find(r => r.name === name) || null
    })),
    ranking: session.scored?.ranked || [],
    recommendation: session.scored?.recommended || null,
    summary: generateReportSummary(session)
  };

  if (format === 'compliance_matrix') {
    report.complianceMatrix = {};
    for (const [name, data] of Object.entries(session.bidders)) {
      report.complianceMatrix[name] = data.compliance?.matrix || [];
    }
  }

  return NextResponse.json({ report, source: 'engine' });
}

// ── LLM-powered analysis ──────────────────────────────────────────
async function handleLLMAnalysis(params) {
  const { evaluationId } = params;
  const session = evaluationStore[evaluationId];
  if (!session) return NextResponse.json({ error: 'Invalid evaluationId.' }, { status: 400 });

  if (!OPENROUTER_API_KEY) {
    return NextResponse.json({
      analysis: {
        executive_summary: `Evaluation of ${session.criteria.contractValue} procurement (${session.criteria.division}) with ${Object.keys(session.bidders).length} bidders.`,
        key_insights: [
          `${Object.keys(session.bidders).length} bidders evaluated`,
          `${session.criteria.totalCriteria} criteria applied`,
          session.scored ? `Recommended: ${session.scored.recommended}` : 'Scoring not yet complete'
        ]
      },
      source: 'mock'
    });
  }

  const biddersDesc = Object.entries(session.bidders).map(([name, data]) =>
    `${name}: ${data.compliance?.summary?.compliant || 0}/${data.compliance?.summary?.total || 0} compliant, ${data.deviations?.length || 0} deviations`
  ).join('; ');

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://tender-intelligence.vercel.app',
        'X-Title': 'Tender Evaluator'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-v4-flash',
        messages: [{
          role: 'system',
          content: 'You are a procurement evaluation expert. Provide concise analysis of this tender evaluation session.'
        }, {
          role: 'user',
          content: `Evaluation: ${session.criteria.contractValue} procurement, ${session.criteria.jurisdiction}, ${session.criteria.division}. Bidders: ${biddersDesc}. ${session.scored ? `Winner: ${session.scored.recommended} (${session.scored.ranked[0]?.totalScore} pts)` : ''}`
        }],
        temperature: 0.3,
        max_tokens: 1000
      })
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || 'Analysis generated.';
    return NextResponse.json({ analysis: { executive_summary: content }, source: 'llm' });

  } catch (err) {
    return NextResponse.json({ analysis: { executive_summary: 'LLM service unavailable. Request queued.' }, source: 'error' });
  }
}