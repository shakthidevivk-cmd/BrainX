import React from 'react';
import { X, User, ShieldCheck, Mail, Building2, Key, LogOut } from 'lucide-react';

interface UserProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  onLogout: () => void;
}

export const UserProfileDrawer: React.FC<UserProfileDrawerProps> = ({
  isOpen,
  onClose,
  userEmail = 'demo@brainx.com',
  onLogout,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="user-profile-drawer"
      className="fixed inset-0 z-50 overflow-hidden flex justify-end"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#381D2A]/30 backdrop-blur-xs transition-opacity"
      />

      {/* Slide-over panel */}
      <div className="relative w-full max-w-md bg-[#FFFFFF] border-l border-[#AAA694]/40 h-full shadow-2xl flex flex-col z-10 overflow-y-auto">
        {/* Drawer Header */}
        <div className="sticky top-0 z-20 bg-[#FFFFFF] border-b border-[#AAA694]/30 px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-base text-[#381D2A]">
              User Profile
            </span>
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded tracking-wide uppercase bg-[#D1D0A3]/50 text-[#381D2A] border border-[#AAA694]/60">
              Active
            </span>
          </div>

          <button
            id="close-profile-drawer-btn"
            onClick={onClose}
            className="p-1.5 rounded text-[#7C6C77] hover:text-[#381D2A] hover:bg-[#FDFBF0] transition-colors border border-transparent hover:border-[#AAA694]/40 cursor-pointer"
            title="Close Profile"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="p-6 space-y-5">
          {/* Identity Header Card */}
          <div className="p-4 rounded-md bg-[#FDFBF0] border border-[#AAA694]/30 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#381D2A] text-[#FDFBF0] flex items-center justify-center font-bold text-lg shrink-0 border border-[#857E61]">
              <User className="w-6 h-6 text-[#D1D0A3]" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-base text-[#381D2A] truncate">
                SOC Analyst
              </h3>
              <p className="text-xs font-mono text-[#7C6C77] truncate">
                {userEmail}
              </p>
            </div>
          </div>

          {/* User Details */}
          <div className="border border-[#AAA694]/30 rounded-md bg-[#FFFFFF] divide-y divide-[#AAA694]/20">
            <div className="p-3 bg-[#FDFBF0]">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#381D2A]">
                Account Details
              </span>
            </div>

            <div className="p-3 flex items-center justify-between gap-4 text-xs font-mono">
              <span className="text-[#7C6C77] flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#857E61]" />
                <span>Email</span>
              </span>
              <span className="text-[#381D2A] font-semibold">{userEmail}</span>
            </div>

            <div className="p-3 flex items-center justify-between gap-4 text-xs font-mono">
              <span className="text-[#7C6C77] flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#857E61]" />
                <span>Role</span>
              </span>
              <span className="text-[#381D2A] font-semibold">Security Analyst (Tier 2)</span>
            </div>

            <div className="p-3 flex items-center justify-between gap-4 text-xs font-mono">
              <span className="text-[#7C6C77] flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-[#857E61]" />
                <span>Organization</span>
              </span>
              <span className="text-[#381D2A] font-semibold">BrainX Defense</span>
            </div>

            <div className="p-3 flex items-center justify-between gap-4 text-xs font-mono">
              <span className="text-[#7C6C77] flex items-center gap-2">
                <Key className="w-3.5 h-3.5 text-[#857E61]" />
                <span>Access Level</span>
              </span>
              <span className="text-[#381D2A] font-semibold">Triage & Prioritization</span>
            </div>
          </div>

          {/* Action */}
          <div className="pt-2">
            <button
              id="profile-drawer-logout-btn"
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="w-full px-4 py-2.5 rounded bg-[#FDFBF0] hover:bg-[#381D2A] text-[#381D2A] hover:text-[#FDFBF0] border border-[#AAA694]/50 hover:border-[#381D2A] text-xs font-mono font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <LogOut className="w-4 h-4 text-[#7C6C77]" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
