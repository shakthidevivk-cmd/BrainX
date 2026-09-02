import React, { useState } from 'react';
import {
  X,
  UploadCloud,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  Copy,
  Check,
  FileJson,
} from 'lucide-react';
import { AlertInput } from '../types';
import { validateAlertsJSON } from '../utils/scoring';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (alerts: AlertInput[]) => void;
}

interface AttachedFileInfo {
  name: string;
  size: number;
  content: string;
  alerts: AlertInput[] | null;
  error: string | null;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  // Attached file state (independent from raw JSON text area)
  const [attachedFile, setAttachedFile] = useState<AttachedFileInfo | null>(null);

  // Raw JSON state (independent from file upload)
  const [rawText, setRawText] = useState('');
  const [rawError, setRawError] = useState<string | null>(null);
  const [rawValidAlerts, setRawValidAlerts] = useState<AlertInput[] | null>(null);

  // View File Modal state
  const [isViewingFile, setIsViewingFile] = useState(false);
  const [hasCopiedFile, setHasCopiedFile] = useState(false);

  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  const sampleJSON = JSON.stringify(
    {
      alerts: [
        {
          alert_id: "SEC-001",
          event_type: "Data Exfiltration",
          severity: "CRITICAL",
          data_sensitivity: "HIGH",
          asset_importance: "CRITICAL",
          attack_confidence: "VERY_HIGH",
          affected_users: 850,
          business_impact: "CRITICAL"
        },
        {
          alert_id: "SEC-002",
          event_type: "Malware Detection",
          severity: "HIGH",
          data_sensitivity: "HIGH",
          asset_importance: "HIGH",
          attack_confidence: "HIGH",
          affected_users: 120,
          business_impact: "HIGH"
        },
        {
          alert_id: "SEC-003",
          event_type: "Brute Force Authentication",
          severity: "MEDIUM",
          data_sensitivity: "HIGH",
          asset_importance: "HIGH",
          attack_confidence: "HIGH",
          affected_users: 45,
          business_impact: "MEDIUM"
        },
        {
          alert_id: "SEC-004",
          event_type: "Ingress Port Scan",
          severity: "LOW",
          data_sensitivity: "LOW",
          asset_importance: "MEDIUM",
          attack_confidence: "MEDIUM",
          affected_users: 0,
          business_impact: "LOW"
        }
      ]
    },
    null,
    2
  );

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Helper to parse text into validation
  const parseJsonData = (text: string): { alerts: AlertInput[] | null; error: string | null } => {
    try {
      if (!text.trim()) {
        return { alerts: null, error: 'Empty JSON content.' };
      }
      let parsed: any;
      try {
        parsed = JSON.parse(text);
      } catch (e: any) {
        return {
          alerts: null,
          error: `Invalid JSON syntax: ${e.message}. The file must contain valid JSON.`,
        };
      }
      const validation = validateAlertsJSON(parsed);
      if (!validation.isValid) {
        return { alerts: null, error: validation.error || 'Invalid alert format.' };
      }
      return { alerts: validation.alerts || [], error: null };
    } catch (e: any) {
      return { alerts: null, error: `Validation error: ${e.message}` };
    }
  };

  // Handle file selection without modifying raw JSON textarea
  const handleFileProcess = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = (event.target?.result as string) || '';
      const { alerts, error } = parseJsonData(content);
      setAttachedFile({
        name: file.name,
        size: file.size,
        content,
        alerts,
        error,
      });
    };
    reader.readAsText(file);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
      e.target.value = '';
    }
  };

  const handleRemoveFile = () => {
    setAttachedFile(null);
  };

  // Handle raw JSON textarea changes independently
  const handleRawTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setRawText(val);
    if (val.trim()) {
      const { alerts, error } = parseJsonData(val);
      setRawValidAlerts(alerts);
      setRawError(error);
    } else {
      setRawValidAlerts(null);
      setRawError(null);
    }
  };

  const handleLoadSample = () => {
    setRawText(sampleJSON);
    const { alerts, error } = parseJsonData(sampleJSON);
    setRawValidAlerts(alerts);
    setRawError(error);
  };

  // Determine active ready alerts (File takes priority if attached and valid, or raw JSON)
  const canProcessFile = Boolean(attachedFile?.alerts && attachedFile.alerts.length > 0 && !attachedFile.error);
  const canProcessRaw = Boolean(rawValidAlerts && rawValidAlerts.length > 0 && !rawError);

  const handleApply = () => {
    if (canProcessFile && attachedFile?.alerts) {
      onUploadSuccess(attachedFile.alerts);
      onClose();
    } else if (canProcessRaw && rawValidAlerts) {
      onUploadSuccess(rawValidAlerts);
      onClose();
    }
  };

  const handleCopyFileContent = () => {
    if (!attachedFile?.content) return;
    navigator.clipboard.writeText(attachedFile.content);
    setHasCopiedFile(true);
    setTimeout(() => setHasCopiedFile(false), 2000);
  };

  return (
    <>
      <div
        id="upload-json-modal"
        className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4"
      >
        <div
          className="fixed inset-0 bg-[#381D2A]/40 backdrop-blur-[2px] transition-opacity"
          onClick={onClose}
        />

        <div className="relative bg-[#FFFFFF] border border-[#AAA694]/40 rounded-lg max-w-2xl w-full p-6 shadow-2xl z-10 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#AAA694]/30 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded bg-[#381D2A] text-[#D1D0A3]">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#381D2A] tracking-tight">
                  Upload Security Alerts
                </h2>
                <p className="text-xs text-[#7C6C77]">
                  Ingest JSON file or paste alerts for six-factor weighted scoring
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded text-[#7C6C77] hover:text-[#381D2A] hover:bg-[#FDFBF0] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* SECTION A: File Upload Area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-semibold text-[#381D2A]">
                Input Method A: Upload JSON File
              </label>
            </div>

            {attachedFile ? (
              <div className="border border-[#AAA694]/40 bg-[#FDFBF0] rounded-md p-4 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded bg-[#FFFFFF] border border-[#AAA694]/30 text-[#381D2A] shrink-0">
                      <FileJson className="w-5 h-5 text-[#857E61]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-mono font-bold text-[#381D2A] truncate">
                        {attachedFile.name}
                      </p>
                      <p className="text-[11px] font-mono text-[#7C6C77]">
                        {formatFileSize(attachedFile.size)} •{' '}
                        {attachedFile.alerts
                          ? `${attachedFile.alerts.length} alert(s) ready`
                          : 'Validating...'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      id="view-file-btn"
                      type="button"
                      onClick={() => setIsViewingFile(true)}
                      className="px-2.5 py-1 rounded text-xs font-mono font-medium text-[#381D2A] bg-[#FFFFFF] border border-[#AAA694]/40 hover:bg-[#FDFBF0] hover:border-[#381D2A] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      title="View file contents in viewer"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#857E61]" />
                      <span>View file</span>
                    </button>

                    <button
                      id="remove-file-btn"
                      type="button"
                      onClick={handleRemoveFile}
                      className="p-1 rounded text-[#7C6C77] hover:text-[#381D2A] hover:bg-[#FFFFFF] border border-transparent hover:border-[#AAA694]/30 transition-colors cursor-pointer"
                      title="Remove attached file"
                    >
                      <Trash2 className="w-4 h-4 text-[#7C6C77]" />
                    </button>
                  </div>
                </div>

                {attachedFile.error && (
                  <div className="flex items-center gap-2 p-2 rounded bg-[#FFFFFF] border border-[#7C6C77] text-xs text-[#381D2A] font-mono">
                    <AlertCircle className="w-4 h-4 text-[#7C6C77] shrink-0" />
                    <span>{attachedFile.error}</span>
                  </div>
                )}
                {attachedFile.alerts && !attachedFile.error && (
                  <div className="flex items-center gap-2 p-2 rounded bg-[#FFFFFF] border border-[#857E61]/40 text-xs text-[#381D2A] font-mono">
                    <CheckCircle2 className="w-4 h-4 text-[#857E61] shrink-0" />
                    <span>File validated: {attachedFile.alerts.length} security alert(s) ready to score.</span>
                  </div>
                )}
              </div>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleFileDrop}
                className={`border-2 border-dashed rounded-md p-4 text-center transition-colors ${
                  isDragging
                    ? 'border-[#381D2A] bg-[#D1D0A3]/20'
                    : 'border-[#AAA694]/50 bg-[#FDFBF0]/60 hover:bg-[#FDFBF0]'
                }`}
              >
                <FileCode className="w-6 h-6 text-[#857E61] mx-auto mb-1.5" />
                <p className="text-xs text-[#381D2A] font-medium">
                  Drag & drop a <span className="font-mono font-bold">.json</span> file here, or{' '}
                  <label className="text-[#857E61] hover:underline font-bold cursor-pointer">
                    browse files
                    <input
                      type="file"
                      accept=".json,application/json"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                  </label>
                </p>
                <p className="text-[11px] text-[#AAA694] mt-0.5 font-mono">
                  Accepts standard <span className="font-bold">alerts</span> or <span className="font-bold">error_logs</span> schema
                </p>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-[#AAA694]/20" />
            <span className="flex-shrink mx-3 text-[11px] font-mono text-[#AAA694] uppercase tracking-wider">
              Or
            </span>
            <div className="flex-grow border-t border-[#AAA694]/20" />
          </div>

          {/* SECTION B: Raw JSON Input Area (Independent) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono font-semibold text-[#381D2A]">
                Input Method B: Paste Raw JSON Alerts
              </label>
              <button
                type="button"
                onClick={handleLoadSample}
                className="text-[11px] font-mono text-[#857E61] hover:underline font-semibold cursor-pointer"
              >
                Insert Sample Alerts
              </button>
            </div>
            <textarea
              value={rawText}
              onChange={handleRawTextChange}
              placeholder={`{\n  "alerts": [\n    {\n      "alert_id": "SEC-001",\n      "event_type": "Data Exfiltration",\n      "severity": "CRITICAL",\n      "data_sensitivity": "HIGH",\n      "asset_importance": "CRITICAL",\n      "attack_confidence": "VERY_HIGH",\n      "affected_users": 850,\n      "business_impact": "CRITICAL"\n    }\n  ]\n}`}
              className="w-full h-32 p-3 bg-[#FDFBF0] border border-[#AAA694]/40 rounded-md font-mono text-xs text-[#381D2A] focus:outline-none focus:border-[#381D2A] leading-relaxed resize-none"
            />

            {rawError && (
              <div className="flex items-center gap-2 mt-2 p-2 rounded bg-[#FDFBF0] border border-[#7C6C77] text-xs text-[#381D2A] font-mono">
                <AlertCircle className="w-4 h-4 text-[#7C6C77] shrink-0" />
                <span>{rawError}</span>
              </div>
            )}

            {rawValidAlerts && rawValidAlerts.length > 0 && !rawError && (
              <div className="flex items-center gap-2 mt-2 p-2 rounded bg-[#FDFBF0] border border-[#857E61] text-xs text-[#381D2A] font-mono">
                <CheckCircle2 className="w-4 h-4 text-[#857E61] shrink-0" />
                <span>Validated {rawValidAlerts.length} raw alert record(s). Ready to calculate.</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-[#AAA694]/20">
            <div className="text-[11px] font-mono text-[#7C6C77]">
              {canProcessFile
                ? `Using uploaded file: ${attachedFile?.name}`
                : canProcessRaw
                ? `Using pasted raw JSON (${rawValidAlerts?.length} alerts)`
                : 'Upload a file or paste JSON above'}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded border border-[#AAA694]/40 text-xs text-[#7C6C77] hover:text-[#381D2A] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                disabled={!canProcessFile && !canProcessRaw}
                className={`px-4 py-2 rounded text-xs font-semibold transition-colors cursor-pointer ${
                  canProcessFile || canProcessRaw
                    ? 'bg-[#381D2A] text-[#FDFBF0] hover:bg-[#381D2A]/90 shadow-xs'
                    : 'bg-[#AAA694]/40 text-[#7C6C77] cursor-not-allowed'
                }`}
              >
                Calculate & Rank Queue
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Nested "View File" Modal / Overlay */}
      {isViewingFile && attachedFile && (
        <div
          id="view-uploaded-file-modal"
          className="fixed inset-0 z-60 overflow-y-auto flex items-center justify-center p-4"
        >
          <div
            className="fixed inset-0 bg-[#381D2A]/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsViewingFile(false)}
          />

          <div className="relative bg-[#FFFFFF] border border-[#AAA694]/50 rounded-lg max-w-3xl w-full p-6 shadow-2xl z-10 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#AAA694]/30 pb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileJson className="w-5 h-5 text-[#857E61] shrink-0" />
                <div className="min-w-0">
                  <h3 className="text-sm font-bold font-mono text-[#381D2A] truncate">
                    {attachedFile.name}
                  </h3>
                  <p className="text-[11px] font-mono text-[#7C6C77]">
                    {formatFileSize(attachedFile.size)} • Unaltered file contents
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyFileContent}
                  className="px-2.5 py-1 rounded text-xs font-mono text-[#381D2A] bg-[#FDFBF0] border border-[#AAA694]/40 hover:bg-[#FFFFFF] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {hasCopiedFile ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#857E61]" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#7C6C77]" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsViewingFile(false)}
                  className="p-1 rounded text-[#7C6C77] hover:text-[#381D2A] hover:bg-[#FDFBF0] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Formatted Content viewer */}
            <div className="bg-[#FDFBF0] border border-[#AAA694]/40 rounded-md p-4 max-h-[60vh] overflow-y-auto font-mono text-xs text-[#381D2A] leading-relaxed select-text">
              <pre className="whitespace-pre-wrap break-all font-mono">
                {(() => {
                  try {
                    return JSON.stringify(JSON.parse(attachedFile.content), null, 2);
                  } catch {
                    return attachedFile.content;
                  }
                })()}
              </pre>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-[#AAA694]/20">
              <span className="text-[11px] font-mono text-[#7C6C77]">
                Viewing uploaded file directly from buffer. Raw JSON editor remains unchanged.
              </span>
              <button
                type="button"
                onClick={() => setIsViewingFile(false)}
                className="px-3.5 py-1.5 rounded bg-[#381D2A] text-[#FDFBF0] text-xs font-semibold hover:bg-[#381D2A]/90 transition-colors cursor-pointer"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
