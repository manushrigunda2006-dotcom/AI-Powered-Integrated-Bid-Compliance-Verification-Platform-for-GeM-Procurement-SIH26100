'use client';

import React from 'react';
import { AuditLog } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';
import { History, ShieldCheck, UserCheck, Cpu, X, Download, Loader2 } from 'lucide-react';

interface AuditTimelineProps {
  logs: AuditLog[];
  companyName: string;
  onClose: () => void;
  onExport?: () => void;
  isExporting?: boolean;
}

export function AuditTimeline({ logs, companyName, onClose, onExport, isExporting }: AuditTimelineProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <History className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold text-blue-300">
                  IMMUTABLE AUDIT TRAIL
                </span>
                <span className="bg-emerald-900 text-emerald-300 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  Tamper-Evident
                </span>
              </div>
              <h3 className="text-sm font-bold text-white truncate max-w-md">
                {companyName}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white rounded-lg p-1.5 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Timeline Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="relative border-l-2 border-slate-200 ml-4 space-y-6">
            {logs.map((log) => {
              const isOfficer = log.actor === 'OFFICER';
              return (
                <div key={log.id} className="relative pl-6">
                  {/* Node icon on line */}
                  <div
                    className={`absolute -left-3.5 top-0 w-7 h-7 rounded-full flex items-center justify-center border-2 bg-white ${
                      isOfficer
                        ? 'border-blue-600 text-blue-600'
                        : 'border-slate-400 text-slate-600'
                    }`}
                  >
                    {isOfficer ? (
                      <UserCheck className="w-3.5 h-3.5" />
                    ) : (
                      <Cpu className="w-3.5 h-3.5" />
                    )}
                  </div>

                  {/* Log Content Card */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isOfficer
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-200 text-slate-800'
                        }`}
                      >
                        {log.actor} • {log.action}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {formatDateTime(log.timestamp)}
                      </span>
                    </div>

                    {/* Metadata view */}
                    {Boolean(log.metadata.officer_name) && (
                      <div className="text-slate-700 font-semibold">
                        Adjudicator: {String(log.metadata.officer_name)}
                      </div>
                    )}

                    {Boolean(log.metadata.remarks) && (
                      <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-slate-800 font-serif italic text-xs">
                        &quot;{String(log.metadata.remarks)}&quot;
                      </div>
                    )}

                    {Boolean(log.metadata.flag) && (
                      <div className="text-amber-700 font-bold">
                        Warning: {String(log.metadata.flag)}
                      </div>
                    )}

                    {/* Raw metadata chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {Object.entries(log.metadata)
                        .filter(([k]) => !['remarks', 'officer_name'].includes(k))
                        .map(([k, v]) => (
                          <span
                            key={k}
                            className="bg-white border border-slate-200 text-slate-500 text-[10px] px-2 py-0.5 rounded-md font-mono"
                          >
                            {k}: {String(v)}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex justify-between items-center text-[11px] text-slate-500">
          <span>Compliant with CVC & CAG statutory audit guidelines</span>
          <div className="flex items-center gap-2">
            {onExport && (
              <button
                onClick={onExport}
                disabled={isExporting}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors font-medium text-xs flex items-center gap-1.5 shadow-xs"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    Export 65B Certificate
                  </>
                )}
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors font-medium text-xs"
            >
              Close Audit Log
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
