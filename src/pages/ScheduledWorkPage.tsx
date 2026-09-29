import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScheduledJob } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { JobModal } from '../components/jobs/JobModal';
import { EmptyState } from '../components/ui/EmptyState';
import { useAppStore } from '../store/AppContext';
import { formatRelativeTime } from '../lib/cronUtils';
import {
  Clock,
  Plus,
  Play,
  Edit2,
  Trash2,
  Calendar,
  AlertCircle,
  Activity,
  Bot,
} from 'lucide-react';

interface ScheduledWorkPageProps {
  onOpenNewJob: () => void;
}

export const ScheduledWorkPage: React.FC<ScheduledWorkPageProps> = ({ onOpenNewJob }) => {
  const { state, dispatch } = useAppStore();
  const navigate = useNavigate();
  const [jobToEdit, setJobToEdit] = useState<ScheduledJob | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEdit = (job: ScheduledJob) => {
    setJobToEdit(job);
    setIsModalOpen(true);
  };

  const handleRunNow = (jobId: string) => {
    dispatch({ type: 'TRIGGER_JOB_RUN', payload: jobId });
    navigate('/runs');
  };

  const handleDelete = (jobId: string) => {
    dispatch({ type: 'DELETE_JOB', payload: jobId });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#1C1917] tracking-tight">
              Scheduled Work
            </h1>
            <span className="w-2 h-2 rounded-full bg-[#0FB5A6] animate-pulse" />
          </div>
          <p className="text-xs text-[#78716C] mt-1">
            Automate routine agent actions on deterministic cron schedules with guaranteed delivery.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={onOpenNewJob}
        >
          New Scheduled Job
        </Button>
      </div>

      {/* Scheduler Daemon Banner */}
      <div className="p-3.5 bg-white rounded-[12px] border border-[#ECE7E1] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-[8px] bg-[#ECFDF5] text-[#059669] flex items-center justify-center font-bold">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-[#1C1917]">Scheduler Daemon Active</span>
            <p className="text-[11px] text-[#78716C] mt-0.5">
              In-app clock checks recurring schedules every 30 seconds. Next evaluation in seconds.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-[#78716C] self-end sm:self-center">
          <span>Active jobs: {state.jobs.filter((j) => j.enabled).length}</span>
        </div>
      </div>

      {/* Jobs List / Table */}
      {state.jobs.length > 0 ? (
        <div className="space-y-3">
          {state.jobs.map((job) => {
            const agent = state.agents.find((a) => a.id === job.agentId);
            return (
              <Card key={job.id} hoverLift className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-[10px] bg-[#FAF8F5] border border-[#ECE7E1] flex items-center justify-center text-[#FF7A59] flex-shrink-0 mt-0.5">
                    <Clock className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#1C1917] tracking-tight truncate">
                        {job.name}
                      </h3>
                      {job.lastStatus && (
                        <Badge
                          variant={
                            job.lastStatus === 'succeeded'
                              ? 'succeeded'
                              : job.lastStatus === 'running'
                              ? 'running'
                              : 'failed'
                          }
                          size="sm"
                        >
                          {job.lastStatus}
                        </Badge>
                      )}
                    </div>

                    {/* Agent chip */}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-[#78716C]">Assigned Agent:</span>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[6px] bg-[#FAF8F5] border border-[#ECE7E1] text-[11px] font-semibold text-[#1C1917]">
                        <span
                          className={`w-2 h-2 rounded-full bg-gradient-to-tr ${
                            agent?.avatarColor || 'from-[#FF7A59] to-[#FFB547]'
                          }`}
                        />
                        {agent?.name || 'Unassigned'}
                      </span>
                    </div>

                    {/* Plain English schedule & Cron expression */}
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-semibold text-[#1C1917]">{job.humanSchedule}</span>
                      <span className="text-[#A8A29E]">•</span>
                      <span className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-[#FAF8F5] border border-[#ECE7E1] text-[#78716C]">
                        {job.cronExpression}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right metadata and actions */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 md:border-l md:border-[#ECE7E1] md:pl-5 flex-shrink-0">
                  <div className="text-left sm:text-right">
                    <div className="text-[11px] text-[#A8A29E] font-medium uppercase tracking-wider">
                      Next Scheduled Run
                    </div>
                    <div className="text-xs font-bold text-[#1C1917] mt-0.5">
                      {new Date(job.nextRunAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      <span className="text-[11px] font-normal text-[#78716C] ml-1">
                        ({new Date(job.nextRunAt).toLocaleDateString([], { month: 'short', day: 'numeric' })})
                      </span>
                    </div>
                    <div className="text-[10px] text-[#78716C] mt-0.5">
                      Last ran: {job.lastRunAt ? formatRelativeTime(job.lastRunAt) : 'Never'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<Play className="w-3.5 h-3.5" />}
                      onClick={() => handleRunNow(job.id)}
                    >
                      Run Now
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEdit(job)}
                      aria-label="Edit job"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(job.id)}
                      className="text-[#DC2626] hover:bg-[#FEF2F2]"
                      aria-label="Delete job"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<Clock className="w-6 h-6" />}
          title="No scheduled work configured"
          description="Create recurring cron jobs to trigger automated lead syncs, summaries, and notifications."
          actionLabel="Create Scheduled Job"
          onAction={onOpenNewJob}
        />
      )}

      {/* Edit Job Modal */}
      <JobModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        jobToEdit={jobToEdit}
      />
    </div>
  );
};
