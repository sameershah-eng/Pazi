import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  MessageSquare,
  Clock,
  CheckCircle2,
  TrendingUp,
  ArrowUpRight,
  Plus,
  Play,
  Hash,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAppStore } from '../store/AppContext';
import { formatRelativeTime } from '../lib/cronUtils';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

interface DashboardPageProps {
  onOpenNewAgent: () => void;
  onOpenNewJob: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onOpenNewAgent,
  onOpenNewJob,
}) => {
  const { state, dispatch } = useAppStore();
  const navigate = useNavigate();

  // Metrics
  const activeAgentsCount = state.agents.filter((a) => a.status === 'active').length;
  const scheduledJobsCount = state.jobs.filter((j) => j.enabled).length;
  const totalRuns = state.runs.length;
  const succeededRuns = state.runs.filter((r) => r.status === 'succeeded').length;
  const successRate = totalRuns > 0 ? Math.round((succeededRuns / totalRuns) * 100) : 99;

  // Conversations today
  const conversationsToday = state.conversations.length;

  // Chart data: 14 days task runs (success vs failed)
  const chartData = useMemo(() => {
    const days = 14;
    const result = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400 * 1000);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      // Generate realistic numbers with high success rate
      const baseSuccess = 8 + Math.floor(Math.sin(i * 0.8) * 4) + (i % 3);
      const baseFailed = i === 4 ? 2 : i % 5 === 0 ? 1 : 0;

      result.push({
        date: label,
        succeeded: Math.max(2, baseSuccess),
        failed: baseFailed,
      });
    }
    return result;
  }, []);

  return (
    <div className="space-y-7 relative">
      {/* Faint subtle gradient mesh behind header */}
      <div className="absolute -top-12 -left-10 w-96 h-64 bg-gradient-to-br from-[#FF7A59]/8 via-[#F0467E]/6 to-[#FFB547]/8 blur-3xl pointer-events-none rounded-full" />

      {/* Header and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#1C1917] tracking-tight">
              Platform Overview
            </h1>
            <span className="w-2 h-2 rounded-full bg-[#0FB5A6] animate-pulse" title="System Live" />
          </div>
          <p className="text-xs text-[#78716C] mt-1">
            Monitor autonomous agent operations, scheduled workflows, and Slack dispatchers.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Hash className="w-3.5 h-3.5 text-[#FF7A59]" />}
            onClick={() => navigate('/slack')}
          >
            Open Slack View
          </Button>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Clock className="w-3.5 h-3.5" />}
            onClick={onOpenNewJob}
          >
            New Job
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={onOpenNewAgent}
          >
            New Agent
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <Card
          hoverLift
          className="p-5 cursor-pointer"
          onClick={() => navigate('/agents')}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#78716C]">
              Active Agents
            </span>
            <div className="w-8 h-8 rounded-[9px] bg-[#FAF8F5] border border-[#ECE7E1] flex items-center justify-center text-[#FF7A59]">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#1C1917] tracking-tight">
              {activeAgentsCount}
            </span>
            <span className="text-xs text-[#78716C]">
              / {state.agents.length} configured
            </span>
          </div>
          <div className="mt-2 text-[11px] text-[#059669] flex items-center gap-1 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            100% worker capacity
          </div>
        </Card>

        {/* KPI 2 */}
        <Card
          hoverLift
          className="p-5 cursor-pointer"
          onClick={() => navigate('/conversations')}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#78716C]">
              Conversations Today
            </span>
            <div className="w-8 h-8 rounded-[9px] bg-[#FAF8F5] border border-[#ECE7E1] flex items-center justify-center text-[#F0467E]">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#1C1917] tracking-tight">
              {conversationsToday}
            </span>
            <span className="text-xs text-[#78716C]">threads active</span>
          </div>
          <div className="mt-2 text-[11px] text-[#78716C] flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-[#0FB5A6]" />
            <span>+18% from last week</span>
          </div>
        </Card>

        {/* KPI 3 */}
        <Card
          hoverLift
          className="p-5 cursor-pointer"
          onClick={() => navigate('/jobs')}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#78716C]">
              Scheduled Jobs
            </span>
            <div className="w-8 h-8 rounded-[9px] bg-[#FAF8F5] border border-[#ECE7E1] flex items-center justify-center text-[#FFB547]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#1C1917] tracking-tight">
              {scheduledJobsCount}
            </span>
            <span className="text-xs text-[#78716C]">recurring</span>
          </div>
          <div className="mt-2 text-[11px] text-[#78716C]">
            Next run in <span className="font-mono font-semibold text-[#1C1917]">28m</span>
          </div>
        </Card>

        {/* KPI 4: Hero Accent */}
        <Card
          hoverLift
          className="p-5 cursor-pointer relative overflow-hidden"
          onClick={() => navigate('/runs')}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#78716C]">
              Task Success Rate
            </span>
            <div className="w-8 h-8 rounded-[9px] bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#059669]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold bg-gradient-to-r from-[#FF7A59] via-[#F0467E] to-[#FFB547] bg-clip-text text-transparent tracking-tight">
              {successRate}%
            </span>
            <span className="text-xs text-[#78716C]">last 14 days</span>
          </div>
          <div className="mt-2 text-[11px] text-[#059669] font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
            Zero critical regressions
          </div>
        </Card>
      </div>

      {/* Main Grid: 14-day Chart & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart of Task Runs (2 columns) */}
        <Card className="lg:col-span-2 p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#1C1917] tracking-tight">
                Execution Volume & Success Trajectory
              </h2>
              <p className="text-xs text-[#78716C] mt-0.5">
                Task runs over the last 14 days (Succeeded vs Failed)
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-[#1C1917]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF7A59]" />
                Succeeded
              </span>
              <span className="flex items-center gap-1.5 text-[#DC2626]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                Failed
              </span>
            </div>
          </div>

          <div className="h-68 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ECE7E1" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#78716C' }}
                  tickLine={false}
                  axisLine={{ stroke: '#ECE7E1' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#78716C' }}
                  tickLine={false}
                  axisLine={{ stroke: '#ECE7E1' }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '10px',
                    border: '1px solid #ECE7E1',
                    fontSize: '12px',
                    boxShadow: '0 4px 16px rgba(28,25,23,0.08)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="succeeded"
                  stroke="#FF7A59"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#FF7A59', strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="failed"
                  stroke="#EF4444"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={{ r: 2, fill: '#EF4444' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent Activity Feed */}
        <Card className="p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#FF7A59]" />
              <h2 className="text-sm font-bold text-[#1C1917] tracking-tight">Recent Activity</h2>
            </div>
            <span className="text-[11px] font-mono text-[#78716C]">Live feed</span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto max-h-[300px] pr-1">
            {state.activities.map((act) => (
              <div
                key={act.id}
                className="p-3 rounded-[10px] bg-[#FAF8F5] border border-[#ECE7E1] text-xs hover:border-[#D8D2C9] transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-[#1C1917] leading-snug">{act.title}</h4>
                  <span className="text-[10px] text-[#A8A29E] font-mono flex-shrink-0">
                    {formatRelativeTime(act.timestamp)}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-[#78716C] leading-relaxed">
                  {act.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-[#ECE7E1]">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-between"
              onClick={() => navigate('/runs')}
              rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
            >
              View Full Execution Log
            </Button>
          </div>
        </Card>
      </div>

      {/* Agents Quick View Section */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-sm font-bold text-[#1C1917] tracking-tight">Active Agent Fleet</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/agents')}
            rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
          >
            Manage Agents ({state.agents.length})
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.agents.slice(0, 3).map((agent) => (
            <Card
              key={agent.id}
              hoverLift
              className="p-4 cursor-pointer"
              onClick={() => {
                dispatch({ type: 'CREATE_CONVERSATION', payload: { agentId: agent.id } });
                navigate('/conversations');
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-[10px] bg-gradient-to-tr ${agent.avatarColor} text-white flex items-center justify-center font-extrabold text-xs shadow-2xs`}
                >
                  {agent.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-[#1C1917] truncate">{agent.name}</h4>
                  <p className="text-[11px] text-[#78716C] truncate">{agent.role}</p>
                </div>
                <Badge variant={agent.status === 'active' ? 'active' : 'paused'} size="sm">
                  {agent.status}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
