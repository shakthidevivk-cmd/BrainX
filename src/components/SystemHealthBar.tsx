import React, { useState, useEffect, useMemo } from 'react';
import { SystemHealth } from '../types';

interface SystemHealthBarProps {
  health: SystemHealth;
}

export const SystemHealthBar: React.FC<SystemHealthBarProps> = ({ health }) => {
  const hasData = typeof health.healthPercentage === 'number';
  const percentage = hasData ? Math.max(0, Math.min(100, Math.round(health.healthPercentage!))) : null;

  // 10 segments for battery display
  const totalSegments = 10;
  const filledSegments = percentage !== null ? Math.round((percentage / 100) * totalSegments) : 0;

  // Timestamp logic for Last Updated
  const timestamp = health.lastUpdatedTimestamp;
  const [currentNow, setCurrentNow] = useState<number>(() => Date.now());

  useEffect(() => {
    if (!timestamp) return;

    const calculateNextDelay = () => {
      const time = new Date(timestamp).getTime();
      if (isNaN(time)) return 60000;
      const diffSeconds = Math.max(0, Math.floor((Date.now() - time) / 1000));

      if (diffSeconds < 60) {
        // First minute: tick frequently (every 5 seconds or exact boundary)
        return Math.min(5000, Math.max(1000, (60 - diffSeconds) * 1000));
      } else if (diffSeconds < 3600) {
        // 1 to 59 minutes: tick every minute aligning with the next minute boundary
        const secIntoMin = diffSeconds % 60;
        return Math.max(5000, (60 - secIntoMin) * 1000);
      } else {
        // 1 hour or more: tick aligning with the next hour boundary (or at most every 5 minutes)
        const secIntoHour = diffSeconds % 3600;
        return Math.max(60000, Math.min(300000, (3600 - secIntoHour) * 1000));
      }
    };

    let timerId: ReturnType<typeof setTimeout>;
    const tick = () => {
      setCurrentNow(Date.now());
      timerId = setTimeout(tick, calculateNextDelay());
    };

    timerId = setTimeout(tick, calculateNextDelay());

    return () => {
      clearTimeout(timerId);
    };
  }, [timestamp]);

  // Format relative time according to specifications
  const relativeTimeText = useMemo(() => {
    if (!timestamp) return '—';
    const time = new Date(timestamp).getTime();
    if (isNaN(time)) return '—';

    const diffSeconds = Math.max(0, Math.floor((currentNow - time) / 1000));

    if (diffSeconds < 60) {
      return 'Just now';
    }

    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) {
      return diffMinutes === 1 ? '1 minute ago' : `${diffMinutes} minutes ago`;
    }

    const diffHours = Math.floor(diffMinutes / 60);
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  }, [timestamp, currentNow]);

  // Format exact timestamp on hover: "Updated September 1, 2026 at 7:42:18 PM"
  const exactTooltipText = useMemo(() => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '';

    const datePart = date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    const timePart = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    return `Updated ${datePart} at ${timePart}`;
  }, [timestamp]);

  return (
    <div
      id="system-health-bar"
      className="w-full bg-[#381D2A] text-[#FDFBF0] px-4 sm:px-8 py-2 text-xs font-mono select-none border-b border-[#7C6C77]/30"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-y-1 gap-x-6">
        {/* Battery Health Indicator */}
        <div className="flex items-center gap-2">
          <span className="text-[#D1D0A3] font-semibold">System Health:</span>
          {hasData && percentage !== null ? (
            <div className="flex items-center gap-2" id="system-health-indicator">
              {/* Battery Block Graphic [████████░░] */}
              <div
                className="flex items-center border border-[#AAA694]/70 rounded-xs px-1 py-0.5 bg-[#381D2A] text-[11px] font-mono leading-none tracking-tight"
                title={`System Health: ${percentage}%`}
                aria-label={`System Health: ${percentage}%`}
              >
                <span className="text-[#AAA694]/50 select-none mr-0.5">[</span>
                <span className="flex items-center gap-0.5">
                  {Array.from({ length: totalSegments }).map((_, i) => {
                    const isFilled = i < filledSegments;
                    return (
                      <span
                        key={i}
                        className={`inline-block w-1.5 h-2.5 rounded-2xs ${
                          isFilled ? 'bg-[#D1D0A3]' : 'bg-[#7C6C77]/40'
                        }`}
                      />
                    );
                  })}
                </span>
                <span className="text-[#AAA694]/50 select-none ml-0.5">]</span>
              </div>
              <span className="font-bold text-[#FDFBF0]">{percentage}%</span>
            </div>
          ) : (
            <div className="flex items-center gap-2" id="system-health-indicator">
              {/* No data state: [──────────] — */}
              <div
                className="flex items-center border border-[#AAA694]/40 rounded-xs px-1 py-0.5 bg-[#381D2A] text-[11px] font-mono leading-none tracking-tight text-[#AAA694]/60"
                title="System Health: No data"
              >
                <span className="text-[#AAA694]/40 select-none mr-0.5">[</span>
                <span className="tracking-widest">──────────</span>
                <span className="text-[#AAA694]/40 select-none ml-0.5">]</span>
              </div>
              <span className="text-[#7C6C77] font-bold">—</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[#D1D0A3] font-semibold">Incidents Resolved:</span>
          <span>{typeof health.resolvedPercentage === 'number' ? `${health.resolvedPercentage}%` : '—'}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[#D1D0A3] font-semibold">Scoring Engine:</span>
          <span>{health.scoringEngine}</span>
        </div>

        {/* Last Updated with live relative time and hover tooltip */}
        <div
          id="last-updated-container"
          className="relative group flex items-center gap-1.5 cursor-default py-0.5"
          title={exactTooltipText || undefined}
        >
          <span className="text-[#D1D0A3] font-semibold">Last Updated:</span>
          <span className={timestamp ? 'text-[#FDFBF0] underline decoration-[#AAA694]/40 decoration-dotted underline-offset-2' : 'text-[#7C6C77]'}>
            {relativeTimeText}
          </span>

          {exactTooltipText && (
            <div
              role="tooltip"
              className="absolute top-full right-0 mt-2 hidden group-hover:flex flex-col items-end pointer-events-none z-50 whitespace-nowrap"
            >
              <div className="w-1.5 h-1.5 bg-[#FFFFFF] border-l border-t border-[#AAA694]/50 rotate-45 mr-3 -mb-1 z-10" />
              <div className="bg-[#FFFFFF] text-[#381D2A] text-[11px] font-mono font-medium py-1 px-2.5 rounded shadow-lg border border-[#AAA694]/50 select-text">
                {exactTooltipText}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
