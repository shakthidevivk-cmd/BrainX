import React from 'react';
import { IncidentAlert, PriorityLevel } from '../types';

interface IncidentCardProps {
  incident: IncidentAlert;
  isSelected: boolean;
  onSelect: (incident: IncidentAlert) => void;
}

export const IncidentCard: React.FC<IncidentCardProps> = ({
  incident,
  isSelected,
  onSelect,
}) => {
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

  const displayName = incident.title || incident.event_type;

  return (
    <div
      id={`incident-card-${incident.alert_id}`}
      onClick={() => onSelect(incident)}
      className={`group relative w-full h-full bg-[#FFFFFF] rounded-md transition-all duration-150 cursor-pointer border p-5 flex flex-col justify-between ${
        isSelected
          ? 'border-[#381D2A] ring-1 ring-[#381D2A] shadow-xs'
          : 'border-[#AAA694]/30 hover:border-[#7C6C77] hover:shadow-xs'
      }`}
    >
      {/* Top row: Subtle Incident ID and understated Priority Level */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="font-mono text-xs text-[#7C6C77] font-medium tracking-wider">
          {incident.alert_id}
        </span>
        <span
          className={`text-[11px] font-mono font-medium px-2.5 py-0.5 rounded tracking-wide uppercase ${getPriorityBadgeClasses(
            incident.priority
          )}`}
        >
          {incident.priority}
        </span>
      </div>

      {/* Center: Incident/Event Name as the main text */}
      <div className="my-auto py-2">
        <h3 className="text-base font-semibold text-[#381D2A] leading-snug tracking-tight">
          {displayName}
        </h3>
      </div>

      {/* Bottom row: Visually prominent Priority Score /100 */}
      <div className="mt-4 pt-3 border-t border-[#AAA694]/20 flex items-baseline justify-between">
        <span className="text-xs font-mono text-[#7C6C77] uppercase tracking-wider">
          Priority Score
        </span>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold font-mono text-[#381D2A] tracking-tight">
            {incident.score}
          </span>
          <span className="text-xs font-mono text-[#7C6C77]">/100</span>
        </div>
      </div>
    </div>
  );
};
