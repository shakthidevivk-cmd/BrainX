import {
  AlertInput,
  CalculatedPriorityResult,
  FactorDetail,
  IncidentAlert,
  PriorityLevel,
} from '../types';

/**
 * Normalization helper for categorical factors (Severity, Asset Importance, Business Impact)
 * LOW = 25, MEDIUM = 50, HIGH = 75, CRITICAL = 100
 */
export function normalizeStandardCategorical(val: any): { normalized: number; label: string } {
  if (val === undefined || val === null) return { normalized: 25, label: 'LOW' };
  if (typeof val === 'number') {
    const clamped = Math.max(0, Math.min(100, Math.round(val)));
    return { normalized: clamped, label: String(clamped) };
  }
  const clean = String(val).trim().toUpperCase();
  switch (clean) {
    case 'CRITICAL':
    case 'VERY_HIGH':
    case 'VERY HIGH':
      return { normalized: 100, label: 'Critical' };
    case 'HIGH':
      return { normalized: 75, label: 'High' };
    case 'MEDIUM':
    case 'MED':
    case 'MODERATE':
      return { normalized: 50, label: 'Medium' };
    case 'LOW':
      return { normalized: 25, label: 'Low' };
    case 'NONE':
    case 'INFORMATIONAL':
    case 'INFO':
      return { normalized: 0, label: 'None' };
    default:
      // Try to parse as number if possible
      const num = Number(clean);
      if (!isNaN(num)) {
        const clamped = Math.max(0, Math.min(100, Math.round(num)));
        return { normalized: clamped, label: String(clamped) };
      }
      return { normalized: 50, label: clean };
  }
}

/**
 * Normalization for Data Sensitivity:
 * LOW = 25, MEDIUM = 50, HIGH = 100 (or CRITICAL = 100)
 */
export function normalizeDataSensitivity(val: any): { normalized: number; label: string } {
  if (val === undefined || val === null) return { normalized: 25, label: 'LOW' };
  if (typeof val === 'number') {
    const clamped = Math.max(0, Math.min(100, Math.round(val)));
    return { normalized: clamped, label: String(clamped) };
  }
  const clean = String(val).trim().toUpperCase();
  switch (clean) {
    case 'CRITICAL':
    case 'HIGH':
    case 'VERY_HIGH':
    case 'VERY HIGH':
      return { normalized: 100, label: 'High' };
    case 'MEDIUM':
    case 'MED':
    case 'MODERATE':
      return { normalized: 50, label: 'Medium' };
    case 'LOW':
      return { normalized: 25, label: 'Low' };
    case 'NONE':
    case 'PUBLIC':
      return { normalized: 0, label: 'None' };
    default:
      const num = Number(clean);
      if (!isNaN(num)) {
        return { normalized: Math.max(0, Math.min(100, Math.round(num))), label: String(num) };
      }
      return { normalized: 50, label: clean };
  }
}

/**
 * Normalization for Attack Confidence:
 * LOW = 25, MEDIUM = 50, HIGH = 75, VERY_HIGH = 100
 */
export function normalizeAttackConfidence(val: any): { normalized: number; label: string } {
  if (val === undefined || val === null) return { normalized: 25, label: 'LOW' };
  if (typeof val === 'number') {
    const clamped = Math.max(0, Math.min(100, Math.round(val)));
    return { normalized: clamped, label: String(clamped) };
  }
  const clean = String(val).trim().toUpperCase();
  switch (clean) {
    case 'VERY_HIGH':
    case 'VERY HIGH':
    case 'CRITICAL':
    case 'CONFIRMED':
      return { normalized: 100, label: 'Very High' };
    case 'HIGH':
      return { normalized: 75, label: 'High' };
    case 'MEDIUM':
    case 'MED':
    case 'MODERATE':
      return { normalized: 50, label: 'Medium' };
    case 'LOW':
      return { normalized: 25, label: 'Low' };
    case 'UNLIKELY':
    case 'NONE':
      return { normalized: 0, label: 'None' };
    default:
      const num = Number(clean);
      if (!isNaN(num)) {
        return { normalized: Math.max(0, Math.min(100, Math.round(num))), label: String(num) };
      }
      return { normalized: 50, label: clean };
  }
}

/**
 * Normalization for Number of Affected Users:
 * 0 users = 0
 * 1–10 users = 25
 * 11–100 users = 50
 * 101–500 users = 75
 * 501+ users = 100
 */
export function normalizeAffectedUsers(val: any): { normalized: number; rawCount: number; label: string } {
  let count = 0;
  if (typeof val === 'number') {
    count = Math.max(0, val);
  } else if (typeof val === 'string') {
    const parsed = parseInt(val.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(parsed)) {
      count = parsed;
    } else {
      const clean = val.trim().toUpperCase();
      if (clean === 'ALL' || clean === 'ORGANIZATION' || clean === 'HIGH' || clean === 'CRITICAL') count = 1000;
      else if (clean === 'MEDIUM' || clean === 'MANY') count = 250;
      else if (clean === 'LOW' || clean === 'FEW') count = 5;
      else count = 0;
    }
  }

  let normalized = 0;
  if (count === 0) {
    normalized = 0;
  } else if (count <= 10) {
    normalized = 25;
  } else if (count <= 100) {
    normalized = 50;
  } else if (count <= 500) {
    normalized = 75;
  } else {
    normalized = 100;
  }

  return {
    normalized,
    rawCount: count,
    label: `${count} user${count === 1 ? '' : 's'}`,
  };
}

/**
 * Authoritative Six-Factor Weighted Priority Scoring Engine
 *
 * Factors & Weights:
 * - Severity: 25% (0.25)
 * - Data Sensitivity: 20% (0.20)
 * - Asset Importance: 20% (0.20)
 * - Attack Confidence: 15% (0.15)
 * - Affected Users: 10% (0.10)
 * - Business Impact: 10% (0.10)
 * Total = 100%
 */
export function calculate_priority(alert: AlertInput): CalculatedPriorityResult {
  // 1. Severity (25%)
  const rawSev = alert.severity !== undefined ? alert.severity : alert.raw_severity || 'MEDIUM';
  const sevNorm = normalizeStandardCategorical(rawSev);
  const sevContribution = Number((sevNorm.normalized * 0.25).toFixed(2));

  // 2. Data Sensitivity (20%)
  const rawSens = alert.data_sensitivity !== undefined ? alert.data_sensitivity : 'MEDIUM';
  const sensNorm = normalizeDataSensitivity(rawSens);
  const sensContribution = Number((sensNorm.normalized * 0.20).toFixed(2));

  // 3. Asset Importance (20%)
  const rawAsset =
    alert.asset_importance !== undefined
      ? alert.asset_importance
      : alert.asset_type || 'MEDIUM';
  const assetNorm = normalizeStandardCategorical(rawAsset);
  const assetContribution = Number((assetNorm.normalized * 0.20).toFixed(2));

  // 4. Attack Confidence (15%)
  const rawConf =
    alert.attack_confidence !== undefined
      ? alert.attack_confidence
      : alert.confidence || 'HIGH';
  const confNorm = normalizeAttackConfidence(rawConf);
  const confContribution = Number((confNorm.normalized * 0.15).toFixed(2));

  // 5. Affected Users (10%)
  const rawUsers =
    alert.affected_users !== undefined
      ? alert.affected_users
      : alert.affected || 0;
  const usersNorm = normalizeAffectedUsers(rawUsers);
  const usersContribution = Number((usersNorm.normalized * 0.10).toFixed(2));

  // 6. Business Impact (10%)
  const rawImpact = alert.business_impact !== undefined ? alert.business_impact : 'MEDIUM';
  const impactNorm = normalizeStandardCategorical(rawImpact);
  const impactContribution = Number((impactNorm.normalized * 0.10).toFixed(2));

  // Final score calculation
  const rawFinal =
    sevContribution +
    sensContribution +
    assetContribution +
    confContribution +
    usersContribution +
    impactContribution;

  const score = Math.max(0, Math.min(100, Math.round(rawFinal)));

  // Risk Tier thresholds:
  // 80–100 → CRITICAL
  // 60–79  → HIGH
  // 40–59  → MEDIUM
  // 0–39   → LOW
  let priority: PriorityLevel;
  if (score >= 80) {
    priority = 'CRITICAL';
  } else if (score >= 60) {
    priority = 'HIGH';
  } else if (score >= 40) {
    priority = 'MEDIUM';
  } else {
    priority = 'LOW';
  }

  // Factor details mapping
  const factors: Record<string, FactorDetail> = {
    severity: {
      key: 'severity',
      label: 'Severity',
      rawValue: String(rawSev),
      normalizedValue: sevNorm.normalized,
      weight: 0.25,
      contribution: sevContribution,
    },
    data_sensitivity: {
      key: 'data_sensitivity',
      label: 'Data Sensitivity',
      rawValue: String(rawSens),
      normalizedValue: sensNorm.normalized,
      weight: 0.20,
      contribution: sensContribution,
    },
    asset_importance: {
      key: 'asset_importance',
      label: 'Asset Importance',
      rawValue: String(rawAsset),
      normalizedValue: assetNorm.normalized,
      weight: 0.20,
      contribution: assetContribution,
    },
    attack_confidence: {
      key: 'attack_confidence',
      label: 'Attack Confidence',
      rawValue: String(rawConf),
      normalizedValue: confNorm.normalized,
      weight: 0.15,
      contribution: confContribution,
    },
    affected_users: {
      key: 'affected_users',
      label: 'Affected Users',
      rawValue: usersNorm.rawCount,
      normalizedValue: usersNorm.normalized,
      weight: 0.10,
      contribution: usersContribution,
    },
    business_impact: {
      key: 'business_impact',
      label: 'Business Impact',
      rawValue: String(rawImpact),
      normalizedValue: impactNorm.normalized,
      weight: 0.10,
      contribution: impactContribution,
    },
  };

  // Generate authentic reasons based purely on the calculated factor contributions
  const reasons: string[] = [];

  // Sort factor contributions descending to highlight the strongest contributors
  const sortedFactors = Object.values(factors).sort((a, b) => b.contribution - a.contribution);

  for (const factor of sortedFactors) {
    if (factor.contribution > 0) {
      if (factor.key === 'affected_users') {
        reasons.push(
          `${factor.rawValue} affected user${factor.rawValue === 1 ? '' : 's'} contributed ${factor.contribution.toFixed(1)} points (10% weight).`
        );
      } else {
        reasons.push(
          `${factor.rawValue} ${factor.label.toLowerCase()} contributed ${factor.contribution.toFixed(1)} points (${Math.round(factor.weight * 100)}% weight).`
        );
      }
    }
  }

  if (reasons.length === 0) {
    reasons.push('Baseline minimum risk factors evaluated across all 6 dimensions.');
  }

  return {
    alert_id: alert.alert_id,
    score,
    priority,
    factors,
    reasons,
  };
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  alerts?: AlertInput[];
}

/**
 * Validates JSON structure:
 * - Accepts top-level "alerts" array: { "alerts": [ ... ] }
 * - Accepts top-level "error_logs" array: { "error_logs": [ ... ] } (filtering is_security_event)
 * - Accepts direct JSON array: [ ... ]
 *
 * Maps fields into the six-factor alert structure and preserves all other metadata.
 */
export function validateAlertsJSON(parsed: any): ValidationResult {
  if (!parsed || typeof parsed !== 'object') {
    return {
      isValid: false,
      error: 'Invalid JSON: Expected a JSON object or array.',
    };
  }

  let rawList: any[] = [];
  if (Array.isArray(parsed)) {
    rawList = parsed;
  } else if (Array.isArray(parsed.alerts)) {
    rawList = parsed.alerts;
  } else if (Array.isArray(parsed.error_logs)) {
    rawList = parsed.error_logs;
  } else if (Array.isArray(parsed.incidents)) {
    rawList = parsed.incidents;
  } else {
    return {
      isValid: false,
      error: 'Invalid structure: JSON must contain an "alerts" or "error_logs" array.',
    };
  }

  if (rawList.length === 0) {
    return {
      isValid: false,
      error: 'No security incidents found in this file.',
    };
  }

  // Filter security events if is_security_event flag is present
  const validEntries = rawList.filter((item: any) => {
    if (!item || typeof item !== 'object') return false;
    if (item.is_security_event === false) return false;
    return true;
  });

  if (validEntries.length === 0) {
    return {
      isValid: false,
      error: 'No security incidents found in this file.',
    };
  }

  const mappedAlerts: AlertInput[] = [];

  for (let i = 0; i < validEntries.length; i++) {
    const item = validEntries[i];
    const sec = item.security_scoring || {};

    const alertId = String(
      item.alert_id || item.error_id || item.id || `SEC-${String(i + 1).padStart(3, '0')}`
    ).trim();

    const eventType = String(
      item.event_type || item.title || item.error_message || sec.event_type || 'Security Alert'
    ).trim();

    const severity =
      item.severity !== undefined
        ? item.severity
        : sec.severity !== undefined
        ? sec.severity
        : item.raw_severity;

    const dataSensitivity =
      item.data_sensitivity !== undefined
        ? item.data_sensitivity
        : sec.data_sensitivity;

    const assetImportance =
      item.asset_importance !== undefined
        ? item.asset_importance
        : sec.asset_importance !== undefined
        ? sec.asset_importance
        : item.asset_type || sec.asset_type;

    const attackConfidence =
      item.attack_confidence !== undefined
        ? item.attack_confidence
        : sec.attack_confidence !== undefined
        ? sec.attack_confidence
        : item.confidence;

    const affectedUsers =
      item.affected_users !== undefined
        ? item.affected_users
        : sec.affected_users !== undefined
        ? sec.affected_users
        : item.affected_target !== undefined
        ? item.affected_target
        : item.affected;

    const businessImpact =
      item.business_impact !== undefined
        ? item.business_impact
        : sec.business_impact;

    const { score: _ignoredScore, risk_tier: _ignoredTier, ...rest } = item;

    mappedAlerts.push({
      ...rest,
      alert_id: alertId,
      event_type: eventType,
      severity,
      data_sensitivity: dataSensitivity,
      asset_importance: assetImportance,
      attack_confidence: attackConfidence,
      affected_users: affectedUsers,
      business_impact: businessImpact,
      title: item.title || item.error_message || eventType,
    });
  }

  return {
    isValid: true,
    alerts: mappedAlerts,
  };
}

/**
 * Processes, scores, and ranks an array of raw alert inputs using the authoritative 6-factor calculate_priority()
 */
export function processAndRankAlerts(alerts: AlertInput[]): IncidentAlert[] {
  const scoredAlerts: IncidentAlert[] = alerts.map((alert, index) => {
    const result = calculate_priority(alert);
    return {
      ...alert,
      score: result.score,
      priority: result.priority,
      factors: result.factors,
      reasons: result.reasons,
      rank: 0,
      originalIndex: index,
    };
  });

  // Sort descending by score. If scores are equal, preserve original JSON order (tie-breaker)
  scoredAlerts.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.originalIndex - b.originalIndex;
  });

  // Assign rank and calculate comparative ranking explanation with adjacent incident
  scoredAlerts.forEach((item, idx) => {
    item.rank = idx + 1;
    const nextItem = scoredAlerts[idx + 1];
    if (nextItem) {
      const diff = item.score - nextItem.score;
      if (diff === 0) {
        item.comparisonWithNext = `Equal score with #${nextItem.rank} (${nextItem.alert_id}). Preserved input order.`;
      } else {
        // Find top contributing differences
        const factorDiffs: { label: string; diff: number }[] = [];
        for (const key of ['severity', 'data_sensitivity', 'asset_importance', 'attack_confidence', 'affected_users', 'business_impact']) {
          const c1 = item.factors[key]?.contribution || 0;
          const c2 = nextItem.factors[key]?.contribution || 0;
          const d = c1 - c2;
          if (d > 0) {
            factorDiffs.push({ label: item.factors[key]?.label || key, diff: d });
          }
        }
        factorDiffs.sort((a, b) => b.diff - a.diff);
        const topDiffs = factorDiffs.slice(0, 2).map((fd) => `higher ${fd.label} (+${fd.diff.toFixed(1)} pts)`).join(' and ');
        item.comparisonWithNext = topDiffs
          ? `Outranks #${nextItem.rank} (${nextItem.alert_id}) by +${diff} pts primarily due to ${topDiffs}.`
          : `Outranks #${nextItem.rank} (${nextItem.alert_id}) by +${diff} pts across cumulative weighted factors.`;
      }
    } else {
      item.comparisonWithNext = 'Lowest ranked incident in the current queue.';
    }
  });

  return scoredAlerts;
}
