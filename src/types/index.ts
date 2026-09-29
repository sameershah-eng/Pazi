export type AgentStatus = 'active' | 'paused';

export type IntegrationId =
  | 'slack'
  | 'gmail'
  | 'google_calendar'
  | 'hubspot'
  | 'notion'
  | 'github'
  | 'stripe'
  | 'webhooks';

export interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  avatarColor: string;
  initials: string;
  status: AgentStatus;
  systemPrompt: string;
  tools: IntegrationId[];
  channels: ('web' | 'slack')[];
  guardrails: {
    maxSteps: number;
    requireApproval: boolean;
  };
  lastRunAt: string;
  createdAt: string;
}

export interface ToolCall {
  id: string;
  toolName: string;
  action: string;
  inputs: Record<string, unknown>;
  status: 'pending' | 'success' | 'failed';
  result?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'agent' | 'system';
  content: string;
  timestamp: string;
  toolCall?: ToolCall;
  isStreaming?: boolean;
}

export interface Conversation {
  id: string;
  agentId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  usedTools: string[];
}

export type JobFrequency = 'hourly' | 'daily' | 'weekly' | 'custom';

export interface ScheduledJob {
  id: string;
  name: string;
  agentId: string;
  frequency: JobFrequency;
  humanSchedule: string;
  cronExpression: string;
  enabled: boolean;
  lastRunAt?: string;
  lastStatus?: 'succeeded' | 'failed' | 'running';
  nextRunAt: string;
  inputPrompt: string;
}

export type RunStatus = 'queued' | 'running' | 'succeeded' | 'failed';
export type RunTrigger = 'manual' | 'schedule' | 'slack' | 'webhook';

export interface RunStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt?: string;
  finishedAt?: string;
  durationMs?: number;
  outputPreview?: string;
}

export interface RunLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
}

export interface TaskRun {
  id: string;
  agentId: string;
  agentName: string;
  agentInitials: string;
  jobId?: string;
  jobName?: string;
  trigger: RunTrigger;
  status: RunStatus;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  summary: string;
  steps: RunStep[];
  logs: RunLog[];
  errorMessage?: string;
}

export interface Integration {
  id: IntegrationId;
  name: string;
  category: string;
  description: string;
  connected: boolean;
  accountName?: string;
  connectedAt?: string;
  lastSyncAt?: string;
  scopes: string[];
  webhookUrl?: string;
  webhookEvents?: { id: string; timestamp: string; event: string; status: number; payloadSummary: string }[];
}

export interface SlackMessage {
  id: string;
  user: {
    name: string;
    avatar: string;
    isBot?: boolean;
  };
  channel: string;
  text: string;
  timestamp: string;
  threadReplyCount?: number;
  taskRunId?: string;
  taskRunStatus?: RunStatus;
  replies?: SlackMessage[];
}

export interface ActivityEvent {
  id: string;
  type: 'agent_reply' | 'job_executed' | 'integration_connected' | 'run_failed' | 'run_succeeded';
  title: string;
  description: string;
  timestamp: string;
  agentId?: string;
  meta?: Record<string, string>;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}
