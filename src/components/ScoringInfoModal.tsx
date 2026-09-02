import React from 'react';
import { X, HelpCircle } from 'lucide-react';

interface ScoringInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScoringInfoModal: React.FC<ScoringInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      id="scoring-info-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#381D2A]/30 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-[#FFFFFF] border border-[#AAA694]/40 rounded-md shadow-xl flex flex-col z-10 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 z-20 bg-[#FFFFFF] border-b border-[#AAA694]/30 px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[#857E61]" />
            <h2 className="font-bold text-base text-[#381D2A] tracking-tight">
              How BrainX Scores Incidents
            </h2>
          </div>
          <button
            id="close-scoring-info-btn"
            onClick={onClose}
            className="p-1 rounded text-[#7C6C77] hover:text-[#381D2A] hover:bg-[#FDFBF0] transition-colors border border-transparent hover:border-[#AAA694]/40 cursor-pointer"
            title="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 text-xs text-[#381D2A]">
          {/* Description */}
          <p className="text-xs text-[#7C6C77] leading-relaxed">
            BrainX prioritizes incidents using six weighted risk factors. Each factor is normalized before being combined into the final priority score.
          </p>

          {/* Risk Factors & Weights */}
          <div className="border border-[#AAA694]/30 rounded-md bg-[#FDFBF0] p-4 space-y-2 font-mono">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#7C6C77] pb-1 border-b border-[#AAA694]/20">
              Risk Factors & Weights
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-1 text-xs">
              <div className="flex justify-between border-b border-[#AAA694]/15 pb-1">
                <span>Severity</span>
                <span className="font-semibold text-[#857E61]">25%</span>
              </div>
              <div className="flex justify-between border-b border-[#AAA694]/15 pb-1">
                <span>Data Sensitivity</span>
                <span className="font-semibold text-[#857E61]">20%</span>
              </div>
              <div className="flex justify-between border-b border-[#AAA694]/15 pb-1">
                <span>Asset Importance</span>
                <span className="font-semibold text-[#857E61]">20%</span>
              </div>
              <div className="flex justify-between border-b border-[#AAA694]/15 pb-1">
                <span>Attack Confidence</span>
                <span className="font-semibold text-[#857E61]">15%</span>
              </div>
              <div className="flex justify-between border-b border-[#AAA694]/15 pb-1">
                <span>Affected Users</span>
                <span className="font-semibold text-[#857E61]">10%</span>
              </div>
              <div className="flex justify-between border-b border-[#AAA694]/15 pb-1">
                <span>Business Impact</span>
                <span className="font-semibold text-[#857E61]">10%</span>
              </div>
            </div>

            <div className="pt-2 text-center text-[11px] font-semibold text-[#381D2A]">
              Final Score = weighted combination of all six factors
            </div>
          </div>

          {/* Priority Tiers */}
          <div className="border border-[#AAA694]/30 rounded-md bg-[#FFFFFF] p-4 space-y-2 font-mono">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#7C6C77] pb-1 border-b border-[#AAA694]/20">
              Priority Tiers
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div className="p-2 rounded bg-[#381D2A] text-[#FDFBF0] text-center space-y-0.5">
                <div className="font-bold text-[10px] uppercase">CRITICAL</div>
                <div className="text-xs">80–100</div>
              </div>
              <div className="p-2 rounded bg-[#7C6C77] text-[#FDFBF0] text-center space-y-0.5">
                <div className="font-bold text-[10px] uppercase">HIGH</div>
                <div className="text-xs">60–79</div>
              </div>
              <div className="p-2 rounded bg-[#857E61] text-[#FDFBF0] text-center space-y-0.5">
                <div className="font-bold text-[10px] uppercase">MEDIUM</div>
                <div className="text-xs">40–59</div>
              </div>
              <div className="p-2 rounded bg-[#D1D0A3]/50 text-[#381D2A] border border-[#AAA694]/60 text-center space-y-0.5">
                <div className="font-bold text-[10px] uppercase">LOW</div>
                <div className="text-xs">0–39</div>
              </div>
            </div>
          </div>

          {/* Explainability */}
          <div className="border border-[#AAA694]/30 rounded-md bg-[#FDFBF0] p-4 space-y-1.5">
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#7C6C77]">
              Explainability
            </div>
            <p className="text-xs text-[#381D2A] font-medium">
              Every score is traceable to the input factors shown in the incident details.
            </p>
            <p className="text-xs text-[#7C6C77]">
              BrainX does not rely on an unexplained risk number. Each priority can be broken down into the factors that produced it.
            </p>
          </div>

          {/* Tie-breaking */}
          <div className="border border-[#AAA694]/30 rounded-md bg-[#FFFFFF] p-4 space-y-1.5">
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#7C6C77]">
              Tie-breaking
            </div>
            <p className="text-xs text-[#7C6C77] leading-relaxed">
              When two incidents have the same final score, BrainX compares severity, business impact, attack confidence, asset importance, and affected users. If all remain equal, the incident received first is ranked first.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoringInfoModal;
