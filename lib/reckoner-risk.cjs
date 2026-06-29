/**
 * Reckoner Risk Layer — TE Integration
 * Cross-references bidders and entities against Reckoner's government waste/fraud findings
 * 
 * Data source: data/reckoner-risk-layer.json
 * Source site: https://thereckoner.info/dashboard
 */

const fs = require('fs');
const path = require('path');

const RECKONER_DATA_PATH = path.join(__dirname, '..', 'data', 'reckoner-risk-layer.json');

/** Load and cache Reckoner data */
let _reckonerData = null;
function loadReckonerData() {
  if (_reckonerData) return _reckonerData;
  try {
    _reckonerData = JSON.parse(fs.readFileSync(RECKONER_DATA_PATH, 'utf-8'));
    return _reckonerData;
  } catch (e) {
    console.error('[reckoner] Failed to load risk layer:', e.message);
    return null;
  }
}

/**
 * Check an entity against the Reckoner risk layer
 * @param {string} entityName - Name of the entity/company/bidder
 * @param {object} [options]
 * @param {string} [options.abn] - ABN for exact match
 * @param {string} [options.jurisdiction] - Federal/NSW/VIC/QLD
 * @param {string} [options.sector] - Sector filter
 * @returns {object} Risk assessment result
 */
function assessEntity(entityName, options = {}) {
  const data = loadReckonerData();
  if (!data) return { available: false, error: 'Risk layer not loaded' };

  const query = entityName.toLowerCase().trim();
  const results = [];

  // Search contractors
  for (const entity of (data.flagged_entities?.contractors || [])) {
    const name = entity.name.toLowerCase();
    if (name.includes(query) || query.includes(name) ||
        (options.abn && entity.abn === options.abn)) {
      results.push({
        type: 'contractor',
        name: entity.name,
        category: entity.category,
        risk_level: entity.risk_level,
        total_contract_value: entity.total_contract_value,
        flags: entity.flags,
        description: entity.description,
        source_url: entity.source_url
      });
    }
  }

  // Search departments/agencies
  for (const entity of (data.flagged_entities?.departments_agencies || [])) {
    const name = entity.name.toLowerCase();
    if (name.includes(query) || query.includes(name)) {
      results.push({
        type: 'department',
        name: entity.name,
        category: entity.category,
        risk_level: entity.risk_level,
        portfolio_value: entity.portfolio_value,
        flags: entity.flags,
        description: entity.description
      });
    }
  }

  // Search infrastructure projects (matched by jurisdiction/sector)
  if (options.jurisdiction) {
    for (const project of (data.flagged_entities?.infrastructure_projects || [])) {
      if (project.jurisdiction === options.jurisdiction) {
        results.push({
          type: 'infrastructure_project',
          name: project.name,
          category: project.category,
          risk_level: project.risk_level,
          blowout: project.blowout,
          description: project.description
        });
      }
    }
  }

  const order = { critical: 4, high: 3, medium: 2, low: 1 };
  const highestRisk = results.reduce((max, r) => {
    return order[r.risk_level] > order[max?.risk_level] ? r : max;
  }, results[0]);

  return {
    entity: entityName,
    available: results.length > 0,
    match_count: results.length,
    highest_risk: highestRisk?.risk_level || 'none',
    findings: results,
    risk_summary: results.length > 0
      ? `Found ${results.length} Reckoner finding(s). Highest risk: ${highestRisk?.risk_level || 'unknown'}. ${highestRisk?.description || ''}`
      : 'No Reckoner findings for this entity.',
    action_required: highestRisk?.risk_level === 'critical'
      ? 'RECOMMEND EXCLUSION — entity flagged for critical governance/fraud risk'
      : highestRisk?.risk_level === 'high'
      ? 'FLAG FOR REVIEW — entity has significant Reckoner findings'
      : 'INFORMATIONAL — no elevated risk indicators'
  };
}

/**
 * Generate a Reckoner risk report for the TE pipeline
 * Called after deviation detection, before weighted scoring
 */
function generateRiskReport(bidders, jurisdiction) {
  const report = {
    source: 'Reckoner Government Waste Tracker',
    source_url: 'https://thereckoner.info/dashboard',
    generated_at: new Date().toISOString(),
    bidders_checked: 0,
    bidders_flagged: 0,
    total_findings: 0,
    highest_risk_overall: 'none',
    bidder_risk_summaries: [],
    jurisdiction_risk_flags: [],
    summary: ''
  };

  for (const bidder of bidders) {
    const assessment = assessEntity(bidder.name, {
      abn: bidder.abn,
      jurisdiction: jurisdiction
    });
    report.bidders_checked++;
    report.total_findings += assessment.findings.length;

    if (assessment.match_count > 0) {
      report.bidders_flagged++;
    }

    report.bidder_risk_summaries.push({
      bidder: bidder.name,
      risk_level: assessment.highest_risk,
      action: assessment.action_required,
      findings: assessment.findings.map(f => ({
        type: f.type,
        name: f.name,
        category: f.category,
        risk_level: f.risk_level,
        description: f.description?.substring(0, 150)
      }))
    });

    if (assessment.highest_risk === 'critical') report.highest_risk_overall = 'critical';
    else if (assessment.highest_risk === 'high' && report.highest_risk_overall !== 'critical') {
      report.highest_risk_overall = 'high';
    }
  }

  // Jurisdiction flags
  const data = loadReckonerData();
  if (data && jurisdiction) {
    for (const proj of (data.flagged_entities?.infrastructure_projects || [])) {
      if (proj.jurisdiction === jurisdiction) {
        report.jurisdiction_risk_flags.push({
          project: proj.name,
          risk: proj.risk_level,
          blowout: proj.blowout,
          description: proj.description
        });
      }
    }
  }

  report.summary = report.bidders_flagged > 0
    ? `${report.bidders_flagged} of ${report.bidders_checked} bidders have Reckoner findings (${report.total_findings} total). Highest risk: ${report.highest_risk_overall}. ${report.jurisdiction_risk_flags.length} jurisdiction-specific infrastructure risks identified.`
    : `No Reckoner findings for any of ${report.bidders_checked} bidders. Clean.`;

  return report;
}

/**
 * Quick lookup — returns a simple risk flag string
 * Useful for UI badges and inline checks
 */
function quickFlag(entityName, options = {}) {
  const result = assessEntity(entityName, options);
  if (!result.available) return { flag: 'clean', label: 'No Reckoner flags', color: 'green' };

  const levels = {
    critical: { flag: 'critical', label: 'Critical risk — Reckoner flagged', color: 'red' },
    high: { flag: 'high', label: 'High risk — Reckoner flagged', color: 'orange' },
    medium: { flag: 'medium', label: 'Medium risk — Reckoner finding', color: 'yellow' },
    low: { flag: 'low', label: 'Low risk — minor Reckoner finding', color: 'blue' }
  };

  return levels[result.highest_risk] || { flag: 'clean', label: 'No Reckoner flags', color: 'green' };
}

module.exports = { assessEntity, generateRiskReport, quickFlag, loadReckonerData };