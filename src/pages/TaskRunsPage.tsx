import React, { useState } from 'react';
import { TaskRun, RunStatus, RunTrigger } from '../types';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { RunDrawer } from '../components/runs/RunDrawer';
import { EmptyState } from '../components/ui/EmptyState';
import { useAppStore } from '../store/AppContext';
import { formatRelativeTime } from '../lib/cronUtils';
import {
  PlayCircle,
  Search,
  Filter,
  RotateCw,
  ExternalLink,
  ChevronRight,
  Clock,
  Sparkles,
} from 'lucide-react';

export const TaskRunsPage: React.FC = () => {
  const { state } = useAppStore();
  const [selectedRun, setSelectedRun] = useState<TaskRun | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | RunStatus>('all');
  const [triggerFilter, setTriggerFilter] = useState<'all' | RunTrigger>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRuns = state.runs.filter((run) => {
    const matchesStatus = statusFilter === 'all' ? true : run.status === statusFilter;
    const matchesTrigger = triggerFilter === 'all' ? true : run.trigger === triggerFilter;
    const matchesSearch =
      run.agentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      run.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      run.id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesTrigger && matchesSearch;
  });

  const handleOpenRun = (run: TaskRun) => {
    setSelectedRun(run);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#1C1917] tracking-tight">
              Task Execution Runs
            </h1>
            <span className="w-2 h-2 rounded-full bg-[#0FB5A6] animate-pulse" />
          </div>
          <p className="text-xs text-[#78716C] mt-1">
            Real-time telemetry, step timelines, and streaming logs for autonomous agent tasks.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#78716C]">
          <span>Total runs recorded: {state.runs.length}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-3 rounded-[12px] border border-[#ECE7E1]">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by agent, summary, or #run ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#ECE7E1] rounded-[8px] focus:outline-none focus:border-[#FF7A59]"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {(['all', 'running', 'succeeded', 'failed', 'queued'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-[8px] capitalize transition-colors whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-[#1C1917] text-white'
                  : 'bg-[#FAF8F5] text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Runs Table */}
      {filteredRuns.length > 0 ? (
        <div className="bg-white rounded-[14px] border border-[#ECE7E1] shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] border-b border-[#ECE7E1] text-[11px] font-bold text-[#78716C] uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Run ID</th>
                  <th className="px-5 py-3">Agent</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Duration</th>
                  <th className="px-5 py-3">Trigger</th>
                  <th className="px-5 py-3">Started</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECE7E1]">
                {filteredRuns.map((run) => (
                  <tr
                    key={run.id}
                    onClick={() => handleOpenRun(run)}
                    className="hover:bg-[#FAF8F5] transition-colors cursor-pointer group"
                  >
                    {/* Run ID */}
                    <td className="px-5 py-3.5 font-mono font-bold text-[#1C1917]">
                      #{run.id.replace('run_', '')}
                    </td>

                    {/* Agent */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-[6px] bg-gradient-to-tr from-[#FF7A59] to-[#FFB547] text-white flex items-center justify-center font-bold text-[10px]">
                          {run.agentInitials}
                        </div>
                        <span className="font-semibold text-[#1C1917] group-hover:text-[#FF7A59] transition-colors">
                          {run.agentName}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <Badge variant={run.status} size="sm" pulse={run.status === 'running'}>
                        {run.status.toUpperCase()}
                      </Badge>
                    </td>

                    {/* Duration */}
                    <td className="px-5 py-3.5 font-mono text-[#57534E]">
                      {run.durationMs ? `${(run.durationMs / 1000).toFixed(1)}s` : 'In progress...'}
                    </td>

                    {/* Trigger */}
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-[6px] bg-[#FAF8F5] border border-[#ECE7E1] font-mono text-[11px] text-[#78716C] uppercase">
                        {run.trigger}
                      </span>
                    </td>

                    {/* Started */}
                    <td className="px-5 py-3.5 text-[#78716C]">
                      {formatRelativeTime(run.startedAt)}
                    </td>

                    {/* Action */}
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenRun(run);
                        }}
                        className="p-1.5 text-[#78716C] hover:text-[#1C1917] hover:bg-white rounded-[6px] transition-colors inline-flex items-center gap-1 font-medium text-xs"
                      >
                        Inspect
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={<PlayCircle className="w-6 h-6" />}
          title="No execution runs found"
          description="Runs will appear here when scheduled jobs trigger or when you manually run agents."
        />
      )}

      {/* Run Detail Drawer with timeline & logs */}
      <RunDrawer
        run={selectedRun}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
};
