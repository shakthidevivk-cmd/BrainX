export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface FactorDetail {
  key: string;
  label: string;
  rawValue: string | number;
  normalizedValue: number;
  weight: number; // e.g. 0.25
  contribution: number; // e.g. 25.0
}

export interface AlertInput {
  alert_id: string;
  event_type: string;
  severity?: string | number;
  data_sensitivity?: string | number;
  asset_importance?: string | number;
  attack_confidence?: string | number;
  affected_users?: number | string;
  business_impact?: string | number;
  title?: string;
  [key: string]: any;
}

export interface CalculatedPriorityResult {
  alert_id: string;
  score: number;
  priority: PriorityLevel;
  factors: Record<string, FactorDetail>;
  reasons: string[];
}

export interface IncidentAlert extends AlertInput {
  score: number;
  priority: PriorityLevel;
  factors: Record<string, FactorDetail>;
  reasons: string[];
  rank: number;
  originalIndex: number;
  comparisonWithNext?: string;
  isSolved?: boolean;
  solvedAt?: string;
}

export interface SystemHealth {
  status: 'Operational' | 'Degraded' | 'Maintenance';
  alertsProcessed?: number;
  resolvedPercentage?: number | null;
  lastUpdated: string;
  scoringEngine: 'Active' | 'Calibrating' | 'Paused';
  healthPercentage?: number | null;
  lastUpdatedTimestamp?: string | null;
}

