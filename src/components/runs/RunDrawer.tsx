import React, { useEffect, useRef, useState } from 'react';
import { TaskRun } from '../../types';
import { Drawer } from '../ui/Drawer';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useAppStore } from '../../store/AppContext';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  RotateCw,
  Copy,
  Check,
  Terminal,
  Layers,
  AlertTriangle,
} from 'lucide-react';
import { formatRelativeTime } from '../../lib/cronUtils';

interface RunDrawerProps {
  run: TaskRun | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RunDrawer: React.FC<RunDrawerProps> = ({ run, isOpen, onClose }) => {
  const { dispatch } = useAppStore();
  const logContainerRef = useRef<HTMLDivElement>(null);
  const [copiedLogs, setCopiedLogs] = useState(false);

  // Auto-scroll logs to bottom during live run
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [run?.logs.length, run?.status]);

  if (!run) return null;

  const handleRetry = () => {
    dispatch({ type: 'RETRY_RUN', payload: run.id });
  };

  const handleCopyLogs = () => {
    const text = run.logs.map((l) => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedLogs(true);
    setTimeout(() => setCopiedLogs(false), 2000);
  };

  const statusVariant = run.status as 'running' | 'succeeded' | 'failed' | 'queued';

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={`Run #${run.id.replace('run_', '')}`}
      subtitle={`${run.agentName} • Triggered via ${run.trigger.toUpperCase()}`}
      width="2xl"
    >
      <div className="space-y-6">
        {/* Top Info Bar */}
        <div className="p-4 bg-[#FAF8F5] rounded-[12px] border border-[#ECE7E1] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Badge variant={statusVariant} size="md" pulse={run.status === 'running'}>
              {run.status.toUpperCase()}
            </Badge>
            <span className="text-xs text-[#78716C]">
              Started {formatRelativeTime(run.startedAt)}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-[#A8A29E]">Duration: </span>
              <span className="font-bold text-[#1C1917]">
                {run.durationMs ? `${(run.durationMs / 1000).toFixed(1)}s` : 'In progress...'}
              </span>
            </div>
            <div>
              <span className="text-[#A8A29E]">Agent: </span>
              <span className="font-bold text-[#1C1917]">{run.agentName}</span>
            </div>
          </div>
        </div>

        {/* Failure & Error Banner with Retry */}
        {run.status === 'failed' && (
          <div className="p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-[12px] animate-in fade-in">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-[#DC2626] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-[#991B1B]">Execution Halted</h4>
                  <p className="mt-1 text-xs text-[#B91C1C] leading-relaxed">
                    {run.errorMessage || 'An unhandled exception occurred during execution.'}
                  </p>
                </div>
              </div>
              <Button
                variant="danger"
                size="sm"
                leftIcon={<RotateCw className="w-3.5 h-3.5" />}
                onClick={handleRetry}
              >
                Retry Run
              </Button>
            </div>
          </div>
        )}

        {/* Summary */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#A8A29E] mb-2">
            Execution Brief
          </h3>
          <p className="text-xs text-[#1C1917] bg-white p-3 rounded-[10px] border border-[#ECE7E1] leading-relaxed">
            {run.summary}
          </p>
        </div>

        {/* Step Timeline */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#A8A29E] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Step Progression ({run.steps.filter((s) => s.status === 'completed').length}/{run.steps.length})
            </h3>
            {run.status === 'running' && (
              <span className="text-xs text-[#0FB5A6] font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#0FB5A6] animate-pulse" />
                Executing live
              </span>
            )}
          </div>

          <div className="space-y-2">
            {run.steps.map((step, idx) => {
              const isLast = idx === run.steps.length - 1;
              return (
                <div
                  key={step.id}
                  className={`p-3 rounded-[10px] border transition-all ${
                    step.status === 'running'
                      ? 'bg-[#EFF6FF] border-[#BFDBFE]'
                      : step.status === 'failed'
                      ? 'bg-[#FEF2F2] border-[#FECACA]'
                      : 'bg-white border-[#ECE7E1]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {step.status === 'completed' && (
                        <CheckCircle2 className="w-4 h-4 text-[#16A34A] flex-shrink-0" />
                      )}
                      {step.status === 'running' && (
                        <Loader2 className="w-4 h-4 text-[#2563EB] animate-spin flex-shrink-0" />
                      )}
                      {step.status === 'failed' && (
                        <XCircle className="w-4 h-4 text-[#DC2626] flex-shrink-0" />
                      )}
                      {step.status === 'pending' && (
                        <div className="w-4 h-4 rounded-full border-2 border-[#D8D2C9] flex-shrink-0" />
                      )}

                      <span
                        className={`text-xs font-semibold ${
                          step.status === 'pending' ? 'text-[#78716C]' : 'text-[#1C1917]'
                        }`}
                      >
                        {idx + 1}. {step.name}
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-[#78716C]">
                      {step.durationMs ? `${(step.durationMs / 1000).toFixed(1)}s` : step.status}
                    </div>
                  </div>

                  {step.outputPreview && (
                    <div className="mt-2 pl-6 text-[11px] font-mono text-[#57534E] bg-[#FAF8F5] p-2 rounded-[6px]">
                      {step.outputPreview}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Streaming Log Console */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#A8A29E] flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" />
              Runtime Log Stream
            </h3>
            <button
              onClick={handleCopyLogs}
              className="flex items-center gap-1 text-[11px] text-[#78716C] hover:text-[#1C1917] p-1 rounded transition-colors"
            >
              {copiedLogs ? <Check className="w-3.5 h-3.5 text-[#0FB5A6]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLogs ? 'Copied' : 'Copy logs'}</span>
            </button>
          </div>

          <div
            ref={logContainerRef}
            className="h-64 overflow-y-auto bg-[#1C1917] text-[#FAF8F5] p-3.5 rounded-[12px] font-mono text-xs leading-relaxed space-y-1 shadow-inner select-text"
          >
            {run.logs.map((log, i) => {
              const levelColors = {
                info: 'text-[#0FB5A6]',
                debug: 'text-[#A8A29E]',
                warn: 'text-[#F59E0B]',
                error: 'text-[#EF4444] font-bold',
              };

              return (
                <div key={log.id || i} className="flex items-start gap-2.5 hover:bg-white/5 py-0.5 px-1 rounded">
                  <span className="text-white/40 text-[10px] select-none w-14 flex-shrink-0">
                    {log.timestamp}
                  </span>
                  <span className={`text-[10px] uppercase font-bold w-12 flex-shrink-0 ${levelColors[log.level]}`}>
                    [{log.level}]
                  </span>
                  <span className="text-white/90 break-all flex-1">{log.message}</span>
                </div>
              );
            })}
            {run.status === 'running' && (
              <div className="flex items-center gap-2 text-white/50 text-[11px] pt-1 animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin text-[#FF7A59]" />
                <span>Listening for container stdout...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Drawer>
  );
};
