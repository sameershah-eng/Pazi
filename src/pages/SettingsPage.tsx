import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAppStore } from '../store/AppContext';
import {
  Settings,
  RefreshCw,
  Cpu,
  Database,
  Shield,
  Layers,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { state, dispatch } = useAppStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleReset = () => {
    dispatch({ type: 'RESET_DEMO_DATA' });
    setShowResetConfirm(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#1C1917] tracking-tight">Settings</h1>
        <p className="text-xs text-[#78716C] mt-1">
          Manage workspace settings, model routing preferences, and demo environment state.
        </p>
      </div>

      {/* Model & AI Settings Card */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <Cpu className="w-5 h-5 text-[#FF7A59]" />
          <div>
            <h3 className="text-sm font-bold text-[#1C1917]">Model Execution Engine</h3>
            <p className="text-xs text-[#78716C]">
              Configured Gemini runtime for agent reasoning, tool call classification, and streaming replies.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-3 bg-[#FAF8F5] rounded-[10px] border border-[#ECE7E1]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#78716C]">
              Target Model
            </span>
            <div className="font-mono text-xs font-bold text-[#1C1917] mt-1">
              gemini-2.5-flash
            </div>
            <p className="text-[11px] text-[#78716C] mt-0.5">
              Cost-optimized low-latency agent reasoning with full structured tool calling.
            </p>
          </div>

          <div className="p-3 bg-[#FAF8F5] rounded-[10px] border border-[#ECE7E1]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#78716C]">
              Fallback Mode
            </span>
            <div className="text-xs font-bold text-[#059669] flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              Resilient Simulation Active
            </div>
            <p className="text-[11px] text-[#78716C] mt-0.5">
              If an API key is not attached, requests fall back smoothly to simulated domain responses.
            </p>
          </div>
        </div>
      </Card>

      {/* Persistence & Data Store */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <Database className="w-5 h-5 text-[#F0467E]" />
          <div>
            <h3 className="text-sm font-bold text-[#1C1917]">Typed State Persistence</h3>
            <p className="text-xs text-[#78716C]">
              All agents, schedules, conversations, integrations, and task runs are persisted in localStorage.
            </p>
          </div>
        </div>

        <div className="p-4 bg-[#FAF8F5] rounded-[10px] border border-[#ECE7E1] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-bold text-[#1C1917]">Reset Demo Environment</h4>
            <p className="text-[11px] text-[#78716C] mt-0.5">
              Restore initial seed agents, scheduled jobs, realistic task runs, and sample Slack channels.
            </p>
          </div>
          <Button
            variant="danger"
            size="sm"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={() => setShowResetConfirm(true)}
          >
            Reset Demo Data
          </Button>
        </div>
      </Card>

      {/* Workspace Metadata */}
      <Card className="p-5 space-y-3">
        <div className="flex items-center gap-2.5">
          <Layers className="w-5 h-5 text-[#FFB547]" />
          <div>
            <h3 className="text-sm font-bold text-[#1C1917]">Workspace Details</h3>
            <p className="text-xs text-[#78716C]">Active organization profile.</p>
          </div>
        </div>

        <div className="space-y-2 text-xs pt-1">
          <div className="flex justify-between py-1.5 border-b border-[#ECE7E1]">
            <span className="text-[#78716C]">Workspace:</span>
            <span className="font-semibold text-[#1C1917]">{state.currentWorkspace}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-[#ECE7E1]">
            <span className="text-[#78716C]">Scheduler Frequency:</span>
            <span className="font-mono text-[#1C1917]">Every 30 seconds (In-app daemon)</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-[#78716C]">Telemetry:</span>
            <span className="text-[#0FB5A6] font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              aistudio-build telemetry header enabled
            </span>
          </div>
        </div>
      </Card>

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#1C1917]/40 backdrop-blur-xs"
            onClick={() => setShowResetConfirm(false)}
          />
          <div className="relative w-full max-w-sm bg-white rounded-[14px] border border-[#ECE7E1] shadow-xl p-5 z-10 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 text-[#DC2626] font-bold text-sm">
              <AlertTriangle className="w-4 h-4" />
              Reset Demo Data?
            </div>
            <p className="mt-2 text-xs text-[#78716C] leading-relaxed">
              This will reset all agents, jobs, chat threads, and logs back to their original demo state. Any custom agents created in this session will be replaced.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowResetConfirm(false)}
              >
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleReset}>
                Reset Everything
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
