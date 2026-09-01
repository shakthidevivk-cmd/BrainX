import React from 'react';
import { IncidentAlert } from '../types';
import { Compass, ArrowUpRight } from 'lucide-react';

interface RecommendedInvestigationProps {
  hasData: boolean;
  topIncident: IncidentAlert | null;
  onSelectIncident: (alertId: string) => void;
}

export const RecommendedInvestigation: React.FC<RecommendedInvestigationProps> = ({
  hasData,
  topIncident,
  onSelectIncident,
}) => {
  return (
    <div
      id="recommended-next-investigation-section"
      className="bg-[#FFFFFF] rounded-md border border-[#AAA694]/30 p-3.5 sm:p-4"
    >
      <div className="flex items-center gap-1.5 mb-2.5">
        <Compass className="w-3.5 h-3.5 text-[#857E61]" />
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#381D2A]">
          Recommended Next Investigation
        </h2>
      </div>

      {!hasData ? (
        <p className="text-xs font-mono text-[#7C6C77]">
          Upload incident data to generate a recommendation.
        </p>
      ) : !topIncident ? (
        <p className="text-xs font-mono text-[#7C6C77]">
          No active incidents require investigation.
        </p>
      ) : (
        <div
          id="recommended-incident-card"
          onClick={() => onSelectIncident(topIncident.alert_id)}
          className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded bg-[#FDFBF0] hover:bg-[#FFFFFF] border border-[#AAA694]/30 hover:border-[#381D2A] transition-all cursor-pointer"
          title={`Click to view details for ${topIncident.alert_id}`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm text-[#381D2A]">
                {topIncident.alert_id}
              </span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded tracking-wide uppercase bg-[#D1D0A3]/50 text-[#381D2A] border border-[#AAA694]/60">
                {topIncident.score} · {topIncident.priority}
              </span>
            </div>

            <div className="text-xs font-medium text-[#381D2A] truncate">
              {topIncident.alert_type}
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 text-xs font-mono text-[#7C6C77] shrink-0">
            <span className="text-[11px] text-[#857E61] italic">
              "Highest priority active incident"
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#7C6C77] group-hover:text-[#381D2A] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>
      )}
    </div>
  );
};
