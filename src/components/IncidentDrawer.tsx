import React from 'react';
import { X, ShieldAlert, ArrowDownUp, CheckCircle2, RotateCcw } from 'lucide-react';
import { IncidentAlert, PriorityLevel } from '../types';

interface IncidentDrawerProps {
  incident: IncidentAlert | null;
  comparisonIncident?: IncidentAlert | null;
  activeRank?: number | null;
  onClose: () => void;
  onToggleSolved?: (alertId: string) => void;
}

export const IncidentDrawer: React.FC<IncidentDrawerProps> = ({
  incident,
  comparisonIncident,
  activeRank,
  onClose,
  onToggleSolved,
}) => {
  if (!incident) return null;

  const getPriorityBadgeClasses = (priority: PriorityLevel) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-[#381D2A] text-[#FDFBF0] border border-[#381D2A]';
      case 'HIGH':
        return 'bg-[#7C6C77] text-[#FDFBF0] border border-[#7C6C77]';
      case 'MEDIUM':
        return 'bg-[#857E61] text-[#FDFBF0] border border-[#857E61]';
      case 'LOW':
        return 'bg-[#D1D0A3]/50 text-[#381D2A] border border-[#AAA694]/60';
    }
  };

  const factorOrder = [
    'severity',
    'data_sensitivity',
    'asset_importance',
    'attack_confidence',
    'affected_users',
    'business_impact',
  ];

  // Preserved original log attributes from raw JSON
  const standardKeys = new Set([
    'alert_id',
    'event_type',
    'severity',
    'data_sensitivity',
    'asset_importance',
    'attack_confidence',
    'affected_users',
    'business_impact',
    'score',
    'priority',
    'factors',
    'reasons',
    'rank',
    'originalIndex',
    'comparisonWithNext',
    'title',
    'is_security_event',
    'security_scoring',
    'isSolved',
    'solvedAt',
  ]);

  const extraMetadata = Object.entries(incident)
    .filter(([key, val]) => !standardKeys.has(key) && val !== undefined && val !== null && typeof val !== 'object')
    .map(([key, val]) => ({
      label: key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      value: String(val),
    }));

  return (
    <div
      id="incident-detail-drawer"
      className="fixed inset-0 z-50 overflow-hidden flex justify-end"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#381D2A]/30 backdrop-blur-xs transition-opacity"
      />

      {/* Slide-over panel */}
      <div className="relative w-full max-w-lg bg-[#FFFFFF] border-l border-[#AAA694]/40 h-full shadow-2xl flex flex-col z-10 overflow-y-auto">
        {/* Drawer Header */}
        <div className="sticky top-0 z-20 bg-[#FFFFFF] border-b border-[#AAA694]/30 px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-base text-[#381D2A]">
              Incident Details
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#FDFBF0] border border-[#AAA694]/30 text-[#7C6C77]">
              Rank #{incident.rank}
            </span>
            <span
              className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded tracking-wide uppercase ${getPriorityBadgeClasses(
                incident.priority
              )}`}
            >
              {incident.priority}
            </span>
          </div>

          <button
            id="close-drawer-btn"
            onClick={onClose}
            className="p-1.5 rounded text-[#7C6C77] hover:text-[#381D2A] hover:bg-[#FDFBF0] transition-colors border border-transparent hover:border-[#AAA694]/40 cursor-pointer"
            title="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="p-6 space-y-5">
          {/* Header Summary */}
          <div className="p-4 rounded-md bg-[#FDFBF0] border border-[#AAA694]/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#7C6C77] font-medium">
                {incident.alert_id}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-mono text-[#7C6C77] uppercase">Final Score:</span>
                <span className="text-2xl font-bold font-mono text-[#381D2A]">
                  {incident.score}
                </span>
                <span className="text-xs font-mono text-[#7C6C77]">/100</span>
              </div>
            </div>
            <h3 className="text-base font-semibold text-[#381D2A] leading-snug">
              {incident.title || incident.event_type}
            </h3>
          </div>

          {/* Action: Mark as Solved / Move to Active */}
          <div className="p-3.5 rounded-md bg-[#FFFFFF] border border-[#AAA694]/35 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[#7C6C77]">Status:</span>
                <span
                  className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded tracking-wide uppercase ${
                    incident.isSolved
                      ? 'bg-[#857E61] text-[#FDFBF0]'
                      : 'bg-[#381D2A] text-[#FDFBF0]'
                  }`}
                >
                  {incident.isSolved ? 'Solved' : 'Active'}
                </span>
              </div>
              {incident.isSolved && incident.solvedAt && (
                <p className="text-xs font-mono text-[#7C6C77]">
                  Solved at: {incident.solvedAt}
                </p>
              )}
            </div>

            {incident.isSolved ? (
              <button
                id="move-to-active-btn"
                onClick={() => onToggleSolved && onToggleSolved(incident.alert_id)}
                className="px-3.5 py-1.5 rounded bg-[#FDFBF0] border border-[#AAA694]/50 hover:border-[#381D2A] hover:bg-[#FFFFFF] text-xs font-mono font-medium text-[#381D2A] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#7C6C77]" />
                <span>Move to Active</span>
              </button>
            ) : (
              <button
                id="mark-as-solved-btn"
                onClick={() => onToggleSolved && onToggleSolved(incident.alert_id)}
                className="px-4 py-1.5 rounded bg-[#381D2A] text-[#FDFBF0] text-xs font-mono font-semibold hover:bg-[#381D2A]/90 transition-colors cursor-pointer border border-[#381D2A] flex items-center justify-center gap-1.5 shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D1D0A3]" />
                <span>Mark as Solved</span>
              </button>
            )}
          </div>

          {/* Score Breakdown Section */}
          <div className="border border-[#AAA694]/30 rounded-md bg-[#FFFFFF] overflow-hidden">
            <div className="p-3 bg-[#FDFBF0] border-b border-[#AAA694]/20 flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#381D2A] flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-[#857E61]" />
                Score Breakdown
              </span>
              <span className="text-[11px] font-mono text-[#7C6C77]">100% Weight Total</span>
            </div>

            <div className="p-4 space-y-4 font-mono text-xs">
              {factorOrder.map((key) => {
                const factor = incident.factors?.[key];
                if (!factor) return null;

                // Format raw value representation cleanly
                let rawDisplay = String(factor.rawValue);
                if (key === 'affected_users') {
                  const count = typeof factor.rawValue === 'number' ? factor.rawValue : parseInt(String(factor.rawValue), 10);
                  if (!isNaN(count)) {
                    rawDisplay = `${count} user${count === 1 ? '' : 's'}`;
                  }
                }

                // Format contribution number
                const contributionValue = Number.isInteger(factor.contribution)
                  ? factor.contribution
                  : factor.contribution.toFixed(1);

                return (
                  <div key={key} className="space-y-1">
                    <div className="font-bold text-[#381D2A] text-xs">
                      {factor.label}
                    </div>
                    <div className="text-[11px] text-[#7C6C77]">
                      {rawDisplay} · {factor.normalizedValue}/100 · {Math.round(factor.weight * 100)}%
                    </div>
                    <div className="text-xs text-[#381D2A] font-semibold">
                      Contribution: <span className="text-[#857E61]">+{contributionValue}</span>
                    </div>
                  </div>
                );
              })}

              {/* Divider and Final Score */}
              <div className="pt-3 border-t border-[#AAA694]/30 flex items-center justify-between">
                <span className="font-bold text-[#381D2A] text-xs">
                  Final Score
                </span>
                <span className="font-bold text-sm text-[#381D2A]">
                  {incident.score} / 100
                </span>
              </div>
            </div>
          </div>

          {/* Explanations & Reasons */}
          <div className="border border-[#AAA694]/30 rounded-md bg-[#FDFBF0] p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#381D2A]">
                Scoring Explanation
              </span>
              <span className="text-[11px] font-mono text-[#7C6C77]">
                Calculated Factors
              </span>
            </div>

            <ul className="space-y-1.5 pt-1">
              {incident.reasons.map((reason, idx) => (
                <li
                  key={idx}
                  className="text-xs font-mono text-[#381D2A] flex items-start gap-2 bg-[#FFFFFF] p-2 rounded border border-[#AAA694]/20"
                >
                  <span className="text-[#857E61] font-bold select-none">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* "Why is this #1?" Section - Only shown for #1 active incident when #2 exists */}
          {activeRank === 1 && comparisonIncident && (() => {
            const isTie = incident.score === comparisonIncident.score;

            // Factor definitions for difference analysis
            const factorsToCompare = [
              { key: 'business_impact', label: 'Business Impact' },
              { key: 'data_sensitivity', label: 'Data Sensitivity' },
              { key: 'severity', label: 'Severity' },
              { key: 'asset_importance', label: 'Asset Importance' },
              { key: 'attack_confidence', label: 'Attack Confidence' },
              { key: 'affected_users', label: 'Affected Users' },
            ];

            const differences = factorsToCompare.map((f) => {
              const f1 = incident.factors?.[f.key];
              const f2 = comparisonIncident.factors?.[f.key];
              if (!f1 || !f2) return null;

              const c1 = f1.contribution || 0;
              const c2 = f2.contribution || 0;
              const diffContribution = c1 - c2;

              let val1 = String(f1.rawValue);
              let val2 = String(f2.rawValue);
              if (f.key === 'affected_users') {
                val1 = `${f1.rawValue}`;
                val2 = `${f2.rawValue}`;
              }

              return {
                key: f.key,
                label: f.label,
                val1,
                val2,
                diffContribution,
                isDifferent: val1 !== val2 || diffContribution !== 0,
              };
            }).filter((item): item is NonNullable<typeof item> => item !== null && item.isDifferent);

            // Tie breaker reasoning if exact score tie
            let tieBreakerReason = 'Preserved original log ingestion order.';
            if (isTie) {
              const tieFactor = factorsToCompare.find((f) => {
                const f1 = incident.factors?.[f.key]?.normalizedValue || 0;
                const f2 = comparisonIncident.factors?.[f.key]?.normalizedValue || 0;
                return f1 !== f2;
              });
              if (tieFactor) {
                tieBreakerReason = `Tie-breaker: higher ${tieFactor.label.toLowerCase()}.`;
              } else {
                tieBreakerReason = 'Tie-breaker: original log ingestion sequence.';
              }
            }

            return (
              <div
                id="why-is-number-1-section"
                className="border border-[#AAA694]/30 rounded-md bg-[#FFFFFF] p-4 space-y-3 font-mono text-xs"
              >
                <div className="flex items-center gap-1.5 pb-2 border-b border-[#AAA694]/20">
                  <ArrowDownUp className="w-3.5 h-3.5 text-[#857E61]" />
                  <span className="font-bold uppercase tracking-wider text-[#381D2A]">
                    Why is this #1?
                  </span>
                </div>

                {!isTie ? (
                  <p className="text-[#381D2A] leading-relaxed">
                    BrainX ranked this incident #1 because it has a higher overall priority score than the next incident.
                  </p>
                ) : (
                  <p className="text-[#381D2A] leading-relaxed">
                    These incidents have the same overall score. BrainX ranked this incident first using the configured tie-breaking rules.
                  </p>
                )}

                {/* Compared Header */}
                <div className="bg-[#FDFBF0] p-2.5 rounded border border-[#AAA694]/20 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#381D2A]">{incident.alert_id}</span>
                    <span className="text-[#7C6C77]">Score: {incident.score} · {incident.priority}</span>
                  </div>
                  <div className="text-[11px] text-[#7C6C77] text-center italic">vs.</div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#381D2A]">{comparisonIncident.alert_id}</span>
                    <span className="text-[#7C6C77]">Score: {comparisonIncident.score} · {comparisonIncident.priority}</span>
                  </div>
                </div>

                {!isTie ? (
                  differences.length > 0 ? (
                    <div className="space-y-2.5 pt-1">
                      <div className="text-[#7C6C77] font-semibold text-[11px] uppercase tracking-wide">
                        Key differences:
                      </div>
                      <div className="space-y-2">
                        {differences.map((diff) => (
                          <div key={diff.key} className="space-y-0.5 border-l-2 border-[#857E61] pl-2">
                            <div className="font-bold text-[#381D2A]">{diff.label}</div>
                            <div className="text-[11px] text-[#7C6C77]">
                              {incident.alert_id}: <span className="text-[#381D2A] font-semibold">{diff.val1}</span>
                            </div>
                            <div className="text-[11px] text-[#7C6C77]">
                              {comparisonIncident.alert_id}: <span className="text-[#381D2A] font-semibold">{diff.val2}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-[11px] text-[#7C6C77] pt-1">
                        These differences contributed to {incident.alert_id} receiving the higher final score.
                      </p>
                    </div>
                  ) : (
                    <p className="text-[11px] text-[#7C6C77]">
                      Cumulative weighted score differences across factors gave {incident.alert_id} the higher priority.
                    </p>
                  )
                ) : (
                  <div className="pt-1 text-[11px] text-[#381D2A] bg-[#FDFBF0] p-2 rounded border border-[#AAA694]/20">
                    <span className="font-semibold">{tieBreakerReason}</span>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Original Log Context if present */}
          {extraMetadata.length > 0 && (
            <div className="border border-[#AAA694]/30 rounded-md bg-[#FFFFFF] divide-y divide-[#AAA694]/20">
              <div className="p-3 bg-[#FDFBF0]">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#381D2A]">
                  Original Log Context
                </span>
              </div>
              {extraMetadata.map((field) => (
                <div
                  key={field.label}
                  className="p-3 flex items-start justify-between gap-4 text-xs"
                >
                  <span className="text-[#7C6C77] font-medium shrink-0">
                    {field.label}
                  </span>
                  <span className="text-right font-mono text-[#381D2A] break-all">
                    {field.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
