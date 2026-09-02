import React, { useState, useMemo, useEffect } from 'react';
import { Upload, RotateCcw, Search, X, LogOut, User, HelpCircle } from 'lucide-react';
import {
  AlertInput,
  IncidentAlert,
  PriorityLevel,
  SystemHealth,
} from './types';
import { processAndRankAlerts } from './utils/scoring';
import { SystemHealthBar } from './components/SystemHealthBar';
import { IncidentCard } from './components/IncidentCard';
import { IncidentDrawer } from './components/IncidentDrawer';
import { RecommendedInvestigation } from './components/RecommendedInvestigation';
import { UserProfileDrawer } from './components/UserProfileDrawer';
import { UploadModal } from './components/UploadModal';
import { LoginPage } from './components/LoginPage';
import { ScoringInfoModal } from './components/ScoringInfoModal';

const AUTH_STORAGE_KEY = 'brainx_auth_authenticated';
const SOLVED_STORAGE_KEY = 'brainx_solved_incidents';
const RAW_ALERTS_STORAGE_KEY = 'brainx_raw_alerts_data';
const LAST_UPDATED_STORAGE_KEY = 'brainx_last_updated_timestamp';

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(AUTH_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [rawAlerts, setRawAlerts] = useState<AlertInput[]>(() => {
    try {
      const stored = sessionStorage.getItem(RAW_ALERTS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [lastUpdatedTimestamp, setLastUpdatedTimestamp] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(LAST_UPDATED_STORAGE_KEY) || null;
    } catch {
      return null;
    }
  });

  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isScoringInfoOpen, setIsScoringInfoOpen] = useState<boolean>(false);
  const [priorityFilter, setPriorityFilter] = useState<'All' | PriorityLevel>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'active' | 'solved'>('active');

  const [solvedMap, setSolvedMap] = useState<Record<string, { solvedAt: string }>>(() => {
    try {
      const stored = sessionStorage.getItem(SOLVED_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const handleLoginSuccess = () => {
    try {
      sessionStorage.setItem(AUTH_STORAGE_KEY, 'true');
    } catch {
      // ignore
    }
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    try {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
  };

  const handleToggleSolved = (alertId: string) => {
    setSolvedMap((prev) => {
      const isCurrentlySolved = Boolean(prev[alertId]);
      let next: Record<string, { solvedAt: string }>;
      if (isCurrentlySolved) {
        next = { ...prev };
        delete next[alertId];
      } else {
        const now = new Date();
        const formattedDate = now.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
        const formattedTime = now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        next = {
          ...prev,
          [alertId]: {
            solvedAt: `${formattedDate}, ${formattedTime}`,
          },
        };
      }
      try {
        sessionStorage.setItem(SOLVED_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // System Health state
  const [health, setHealth] = useState<SystemHealth>({
    status: 'Operational',
    alertsProcessed: 0,
    lastUpdated: 'System Ready',
    scoringEngine: 'Active',
  });

  // Calculate prioritized alerts sorted from highest priority score to lowest
  // Uses exact calculate_priority() authoritative engine
  const allRankedAlerts = useMemo(() => {
    const processed = processAndRankAlerts(rawAlerts);
    return processed.map((alert) => {
      const solvedInfo = solvedMap[alert.alert_id];
      return {
        ...alert,
        isSolved: Boolean(solvedInfo),
        solvedAt: solvedInfo?.solvedAt,
      };
    });
  }, [rawAlerts, solvedMap]);

  const activeIncidents = useMemo(() => {
    return allRankedAlerts.filter((alert) => !alert.isSolved);
  }, [allRankedAlerts]);

  const solvedIncidents = useMemo(() => {
    return allRankedAlerts.filter((alert) => alert.isSolved);
  }, [allRankedAlerts]);

  // Compute Functional System Health:
  // Starts at 100 points.
  // For every ACTIVE incident:
  // CRITICAL -> -10
  // HIGH -> -5
  // MEDIUM -> -2
  // LOW -> -1
  // Solved incidents do NOT reduce health.
  // Clamp between 0 and 100.
  // If no raw alerts loaded (rawAlerts.length === 0), percentage is null (no fake data).
  const calculatedHealthPercentage = useMemo(() => {
    if (rawAlerts.length === 0) {
      return null;
    }

    let score = 100;
    for (const incident of activeIncidents) {
      switch (incident.priority) {
        case 'CRITICAL':
          score -= 10;
          break;
        case 'HIGH':
          score -= 5;
          break;
        case 'MEDIUM':
          score -= 2;
          break;
        case 'LOW':
          score -= 1;
          break;
      }
    }

    return Math.max(0, Math.min(100, score));
  }, [rawAlerts.length, activeIncidents]);

  const resolvedPercentage = useMemo(() => {
    if (rawAlerts.length === 0) return null;
    return Math.round((solvedIncidents.length / rawAlerts.length) * 100);
  }, [rawAlerts.length, solvedIncidents.length]);

  const activeHealth: SystemHealth = useMemo(() => {
    return {
      ...health,
      alertsProcessed: rawAlerts.length,
      resolvedPercentage,
      healthPercentage: calculatedHealthPercentage,
      lastUpdatedTimestamp: rawAlerts.length > 0 ? lastUpdatedTimestamp : null,
      lastUpdated: rawAlerts.length > 0 ? (lastUpdatedTimestamp || '—') : '—',
    };
  }, [health, rawAlerts.length, resolvedPercentage, calculatedHealthPercentage, lastUpdatedTimestamp]);

  const currentTabIncidents = useMemo(() => {
    return activeTab === 'active' ? activeIncidents : solvedIncidents;
  }, [activeTab, activeIncidents, solvedIncidents]);

  // Real-time filtered alerts based on active priority filter and search query within current tab
  const filteredAlerts = useMemo(() => {
    return currentTabIncidents.filter((alert) => {
      const matchesPriority =
        priorityFilter === 'All' || alert.priority === priorityFilter;

      const query = searchQuery.trim().toLowerCase();
      const displayName = (alert.title || alert.event_type || '').toLowerCase();
      const alertId = (alert.alert_id || '').toLowerCase();

      const matchesSearch =
        query === '' ||
        displayName.includes(query) ||
        alertId.includes(query);

      return matchesPriority && matchesSearch;
    });
  }, [currentTabIncidents, priorityFilter, searchQuery]);

  // Counts by priority tier for the active tab
  const priorityCounts = useMemo(() => {
    return {
      All: currentTabIncidents.length,
      CRITICAL: currentTabIncidents.filter((i) => i.priority === 'CRITICAL').length,
      HIGH: currentTabIncidents.filter((i) => i.priority === 'HIGH').length,
      MEDIUM: currentTabIncidents.filter((i) => i.priority === 'MEDIUM').length,
      LOW: currentTabIncidents.filter((i) => i.priority === 'LOW').length,
    };
  }, [currentTabIncidents]);

  // Selected incident object for detail drawer
  const selectedAlert = useMemo(() => {
    if (!selectedAlertId) return null;
    return allRankedAlerts.find((i) => i.alert_id === selectedAlertId) || null;
  }, [selectedAlertId, allRankedAlerts]);

  // Determine active queue rank for selected alert and #2 active incident for comparison
  const selectedActiveRank = useMemo(() => {
    if (!selectedAlert || selectedAlert.isSolved) return null;
    const idx = activeIncidents.findIndex((i) => i.alert_id === selectedAlert.alert_id);
    return idx !== -1 ? idx + 1 : null;
  }, [selectedAlert, activeIncidents]);

  const activeComparisonIncident = useMemo(() => {
    if (selectedActiveRank === 1 && activeIncidents.length > 1) {
      return activeIncidents[1];
    }
    return null;
  }, [selectedActiveRank, activeIncidents]);

  const topActiveIncident = useMemo(() => {
    return activeIncidents.length > 0 ? activeIncidents[0] : null;
  }, [activeIncidents]);

  const handleUploadBatch = (newAlerts: AlertInput[]) => {
    const updateTime = new Date().toISOString();
    setRawAlerts(newAlerts);
    setLastUpdatedTimestamp(updateTime);
    setSolvedMap({});
    try {
      sessionStorage.setItem(RAW_ALERTS_STORAGE_KEY, JSON.stringify(newAlerts));
      sessionStorage.setItem(LAST_UPDATED_STORAGE_KEY, updateTime);
      sessionStorage.removeItem(SOLVED_STORAGE_KEY);
    } catch {
      // ignore
    }
    setActiveTab('active');
    setPriorityFilter('All');
    setSearchQuery('');
    setHealth((prev) => ({
      ...prev,
      alertsProcessed: newAlerts.length,
      lastUpdated: updateTime,
    }));
    if (newAlerts.length > 0) {
      const top = processAndRankAlerts(newAlerts)[0];
      if (top) setSelectedAlertId(top.alert_id);
    }
  };

  const handleResetDemo = () => {
    setRawAlerts([]);
    setLastUpdatedTimestamp(null);
    setSolvedMap({});
    try {
      sessionStorage.removeItem(RAW_ALERTS_STORAGE_KEY);
      sessionStorage.removeItem(LAST_UPDATED_STORAGE_KEY);
      sessionStorage.removeItem(SOLVED_STORAGE_KEY);
    } catch {
      // ignore
    }
    setActiveTab('active');
    setPriorityFilter('All');
    setSearchQuery('');
    setHealth({
      status: 'Operational',
      alertsProcessed: 0,
      lastUpdated: '—',
      scoringEngine: 'Active',
    });
    setSelectedAlertId(null);
  };

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#FDFBF0] text-[#381D2A] flex flex-col antialiased">
      {/* 1. Main Navigation Bar with BrainX Logo */}
      <header className="w-full bg-[#FFFFFF] border-b border-[#AAA694]/30 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* BrainX Logo with abstract geometric mark */}
          <div className="flex items-center gap-3 select-none">
            <div
              id="brainx-logo-mark"
              className="w-8 h-8 rounded bg-[#381D2A] flex items-center justify-center p-1.5 shadow-xs shrink-0"
              title="BrainX Triage Architecture"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full text-[#D1D0A3]"
              >
                <path
                  d="M4 6H12M12 6L16 12M12 6V18M16 12L20 18M16 12H8M20 18H4M4 18L8 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="6" r="1.5" fill="#FDFBF0" />
                <circle cx="16" cy="12" r="1.5" fill="#FDFBF0" />
                <circle cx="8" cy="12" r="1.5" fill="#FDFBF0" />
                <circle cx="4" cy="18" r="1.5" fill="#FDFBF0" />
                <circle cx="20" cy="18" r="1.5" fill="#FDFBF0" />
              </svg>
            </div>

            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-bold text-lg tracking-tight text-[#381D2A]">
                  BrainX
                </span>
                <span className="text-[11px] font-mono font-medium text-[#857E61] uppercase tracking-wider">
                  Prioritization
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <button
              id="how-scoring-works-btn"
              onClick={() => setIsScoringInfoOpen(true)}
              title="How BrainX Scores Incidents"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#FDFBF0] hover:bg-[#FFFFFF] border border-[#AAA694]/40 hover:border-[#381D2A] text-xs font-mono text-[#381D2A] transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#857E61]" />
              <span>How scoring works</span>
            </button>

            <button
              id="user-profile-btn"
              onClick={() => setIsProfileOpen(true)}
              title="View User Profile"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#FDFBF0] hover:bg-[#FFFFFF] border border-[#AAA694]/40 hover:border-[#381D2A] text-xs font-mono text-[#381D2A] transition-colors cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-[#857E61]" />
              <span className="hidden sm:inline">demo@brainx.com</span>
            </button>

            <button
              id="reset-demo-btn"
              onClick={handleResetDemo}
              title="Reset to default sample alerts"
              className="text-xs font-mono text-[#7C6C77] hover:text-[#381D2A] transition-colors flex items-center gap-1 cursor-pointer px-2.5 py-1.5 rounded hover:bg-[#FDFBF0]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            <button
              id="upload-json-btn"
              onClick={() => setIsUploadOpen(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded bg-[#381D2A] text-[#FDFBF0] text-xs font-semibold hover:bg-[#381D2A]/90 transition-colors shadow-xs cursor-pointer border border-[#381D2A]"
            >
              <Upload className="w-3.5 h-3.5 text-[#D1D0A3]" />
              <span>Upload JSON</span>
            </button>

            <button
              id="logout-btn"
              onClick={handleLogout}
              title="Sign out of BrainX"
              className="text-xs font-mono text-[#7C6C77] hover:text-[#381D2A] transition-colors flex items-center gap-1.5 cursor-pointer px-2.5 py-1.5 rounded border border-[#AAA694]/30 hover:border-[#381D2A] hover:bg-[#FDFBF0]"
            >
              <LogOut className="w-3.5 h-3.5 text-[#7C6C77]" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. System Metrics/Status Bar directly below header */}
      <SystemHealthBar health={activeHealth} />

      {/* 3. Main Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
        {/* Title and Purpose Subtitle */}
        <div className="border-b border-[#AAA694]/30 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#381D2A] tracking-tight">
              Incident Prioritization
            </h1>
            <p className="text-sm text-[#7C6C77] mt-1 font-normal">
              Investigate the highest-risk incidents first.
            </p>
          </div>

          {/* Active / Solved Tabs */}
          <div id="incident-tabs-container" className="flex items-center gap-2 select-none shrink-0">
            <button
              id="tab-active-btn"
              onClick={() => setActiveTab('active')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-mono font-medium transition-colors flex items-center gap-2 cursor-pointer border ${
                activeTab === 'active'
                  ? 'bg-[#381D2A] text-[#FDFBF0] border-[#381D2A]'
                  : 'bg-[#FFFFFF] text-[#7C6C77] border-[#AAA694]/40 hover:border-[#7C6C77] hover:text-[#381D2A]'
              }`}
            >
              <span>Active</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                  activeTab === 'active'
                    ? 'bg-[#D1D0A3]/30 text-[#FDFBF0]'
                    : 'bg-[#AAA694]/20 text-[#7C6C77]'
                }`}
              >
                {activeIncidents.length}
              </span>
            </button>

            <button
              id="tab-solved-btn"
              onClick={() => setActiveTab('solved')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-mono font-medium transition-colors flex items-center gap-2 cursor-pointer border ${
                activeTab === 'solved'
                  ? 'bg-[#381D2A] text-[#FDFBF0] border-[#381D2A]'
                  : 'bg-[#FFFFFF] text-[#7C6C77] border-[#AAA694]/40 hover:border-[#7C6C77] hover:text-[#381D2A]'
              }`}
            >
              <span>Solved</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                  activeTab === 'solved'
                    ? 'bg-[#D1D0A3]/30 text-[#FDFBF0]'
                    : 'bg-[#AAA694]/20 text-[#7C6C77]'
                }`}
              >
                {solvedIncidents.length}
              </span>
            </button>
          </div>
        </div>

        {/* Recommended Next Investigation indicator */}
        <RecommendedInvestigation
          hasData={rawAlerts.length > 0}
          topIncident={topActiveIncident}
          onSelectIncident={(alertId) => setSelectedAlertId(alertId)}
        />

        {/* 4. Filtering and Search Bar */}
        <div
          id="incident-filters"
          className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#FFFFFF] p-3 rounded-md border border-[#AAA694]/30"
        >
          {/* Filter Pills: All / CRITICAL / HIGH / MEDIUM / LOW */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-mono text-[#7C6C77] mr-1 hidden md:inline">
              Filter:
            </span>
            {(['All', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((level) => {
              const isActive = priorityFilter === level;
              const count = priorityCounts[level];

              return (
                <button
                  key={level}
                  id={`filter-${level.toLowerCase()}-btn`}
                  onClick={() => setPriorityFilter(level)}
                  className={`px-3 py-1 rounded text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5 border ${
                    isActive
                      ? 'bg-[#381D2A] text-[#FDFBF0] border-[#381D2A] font-semibold'
                      : 'bg-[#FDFBF0] text-[#7C6C77] border-[#AAA694]/30 hover:border-[#7C6C77] hover:text-[#381D2A]'
                  }`}
                >
                  <span>{level}</span>
                  <span
                    className={`text-[10px] px-1 py-0.2 rounded ${
                      isActive
                        ? 'bg-[#D1D0A3]/30 text-[#FDFBF0]'
                        : 'bg-[#AAA694]/20 text-[#7C6C77]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search field: Incident Name and Incident ID */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 text-[#AAA694] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="search-incidents-input"
              type="text"
              placeholder="Search by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 bg-[#FDFBF0] border border-[#AAA694]/40 rounded text-xs text-[#381D2A] placeholder-[#AAA694] focus:outline-none focus:border-[#381D2A]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#AAA694] hover:text-[#381D2A] cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 5. Incident Queue Grid: Exactly 3 cards per row on desktop */}
        {rawAlerts.length === 0 ? (
          activeTab === 'active' ? (
            <div
              id="risk-queue-grid"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 items-stretch"
            >
              <div
                id="sample-placeholder-card"
                className="relative w-full h-full bg-[#FFFFFF] rounded-md border border-[#AAA694]/30 p-5 flex flex-col justify-between"
              >
                {/* Top row: Sample ID & Risk: — */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="font-mono text-xs text-[#7C6C77] font-medium tracking-wider">
                    Sample ID
                  </span>
                  <span className="text-[11px] font-mono font-medium px-2.5 py-0.5 rounded tracking-wide uppercase bg-[#D1D0A3]/50 text-[#381D2A] border border-[#AAA694]/60">
                    Risk: —
                  </span>
                </div>

                {/* Center: Sample Error */}
                <div className="my-auto py-2">
                  <h3 className="text-base font-semibold text-[#381D2A] leading-snug tracking-tight">
                    Sample Error
                  </h3>
                </div>

                {/* Bottom row: Score: — */}
                <div className="mt-4 pt-3 border-t border-[#AAA694]/20 flex items-baseline justify-between">
                  <span className="text-xs font-mono text-[#7C6C77] uppercase tracking-wider">
                    Score: —
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold font-mono text-[#7C6C77] tracking-tight">
                      —
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-[#FFFFFF] border border-[#AAA694]/30 rounded-md space-y-2">
              <h3 className="text-base font-semibold text-[#381D2A]">
                No Solved Incidents
              </h3>
              <p className="text-xs text-[#7C6C77] max-w-sm mx-auto">
                Mark incidents as solved from the detail drawer to track resolved issues.
              </p>
            </div>
          )
        ) : currentTabIncidents.length === 0 ? (
          <div className="p-12 text-center bg-[#FFFFFF] border border-[#AAA694]/30 rounded-md space-y-2">
            <h3 className="text-base font-semibold text-[#381D2A]">
              {activeTab === 'active' ? 'All Incidents Solved' : 'No Solved Incidents'}
            </h3>
            <p className="text-xs text-[#7C6C77] max-w-sm mx-auto">
              {activeTab === 'active'
                ? 'All security alerts in the queue have been marked as solved.'
                : 'Mark incidents as solved from the detail drawer to move them here.'}
            </p>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="p-12 text-center bg-[#FFFFFF] border border-[#AAA694]/30 rounded-md space-y-3">
            <h3 className="text-base font-semibold text-[#381D2A]">
              No Incidents Match Active Filters
            </h3>
            <p className="text-xs text-[#7C6C77] max-w-sm mx-auto">
              No security alerts in {activeTab === 'active' ? 'Active' : 'Solved'} matched the selected priority level or search criteria.
            </p>
            <button
              onClick={() => {
                setPriorityFilter('All');
                setSearchQuery('');
              }}
              className="px-3.5 py-1.5 rounded bg-[#381D2A] text-[#FDFBF0] text-xs font-semibold hover:bg-[#381D2A]/90 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div
            id="risk-queue-grid"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 items-stretch"
          >
            {filteredAlerts.map((alert) => (
              <IncidentCard
                key={alert.alert_id}
                incident={alert}
                isSelected={selectedAlertId === alert.alert_id}
                onSelect={(item) => setSelectedAlertId(item.alert_id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* 6. Right-side Detail Drawer */}
      <IncidentDrawer
        incident={selectedAlert}
        comparisonIncident={activeComparisonIncident}
        activeRank={selectedActiveRank}
        onClose={() => setSelectedAlertId(null)}
        onToggleSolved={handleToggleSolved}
      />

      {/* User Profile Drawer */}
      <UserProfileDrawer
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        userEmail="demo@brainx.com"
        onLogout={handleLogout}
      />

      {/* 7. Upload JSON Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadBatch}
      />

      {/* 8. How BrainX Scores Incidents Modal */}
      <ScoringInfoModal
        isOpen={isScoringInfoOpen}
        onClose={() => setIsScoringInfoOpen(false)}
      />
    </div>
  );
};

export default App;
