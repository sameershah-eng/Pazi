import React, { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import {
  Agent,
  AgentStatus,
  Conversation,
  Integration,
  IntegrationId,
  ScheduledJob,
  SlackMessage,
  TaskRun,
  ActivityEvent,
  Toast,
  ChatMessage,
  ToolCall,
} from '../types';
import {
  INITIAL_ACTIVITIES,
  INITIAL_AGENTS,
  INITIAL_CONVERSATIONS,
  INITIAL_INTEGRATIONS,
  INITIAL_JOBS,
  INITIAL_RUNS,
  INITIAL_SLACK_MESSAGES,
} from './initialData';
import { getNextRunTimes } from '../lib/cronUtils';

interface AppState {
  agents: Agent[];
  conversations: Conversation[];
  selectedConversationId: string | null;
  jobs: ScheduledJob[];
  runs: TaskRun[];
  integrations: Integration[];
  slackMessages: SlackMessage[];
  activities: ActivityEvent[];
  toasts: Toast[];
  currentWorkspace: string;
}

type Action =
  | { type: 'ADD_AGENT'; payload: Omit<Agent, 'id' | 'createdAt' | 'lastRunAt' | 'initials' | 'avatarColor'> }
  | { type: 'UPDATE_AGENT'; payload: Agent }
  | { type: 'DELETE_AGENT'; payload: string }
  | { type: 'DUPLICATE_AGENT'; payload: string }
  | { type: 'TOGGLE_AGENT_STATUS'; payload: string }
  | { type: 'CREATE_CONVERSATION'; payload: { agentId: string; title?: string } }
  | { type: 'SELECT_CONVERSATION'; payload: string }
  | { type: 'DELETE_CONVERSATION'; payload: string }
  | { type: 'ADD_USER_MESSAGE'; payload: { conversationId: string; content: string } }
  | { type: 'APPEND_STREAM_CHUNK'; payload: { conversationId: string; chunk: string } }
  | { type: 'ATTACH_TOOL_CALL'; payload: { conversationId: string; toolCall: ToolCall } }
  | { type: 'FINALIZE_STREAM'; payload: { conversationId: string; fullContent: string } }
  | { type: 'ADD_JOB'; payload: Omit<ScheduledJob, 'id' | 'nextRunAt'> }
  | { type: 'UPDATE_JOB'; payload: ScheduledJob }
  | { type: 'DELETE_JOB'; payload: string }
  | { type: 'TRIGGER_JOB_RUN'; payload: string }
  | { type: 'TRIGGER_AGENT_RUN'; payload: { agentId: string; trigger?: 'manual' | 'slack'; inputPrompt?: string } }
  | { type: 'UPDATE_RUN'; payload: TaskRun }
  | { type: 'RETRY_RUN'; payload: string }
  | { type: 'CONNECT_INTEGRATION'; payload: { id: IntegrationId; accountName: string } }
  | { type: 'DISCONNECT_INTEGRATION'; payload: IntegrationId }
  | { type: 'UPDATE_WEBHOOK_URL'; payload: string }
  | { type: 'ADD_WEBHOOK_TEST_EVENT'; payload: { event: string; status: number; payloadSummary: string } }
  | { type: 'POST_SLACK_MESSAGE'; payload: { text: string; channel: string; authorName: string } }
  | { type: 'POST_SLACK_REPLY'; payload: { parentId: string; text: string; taskRunId?: string } }
  | { type: 'ADD_TOAST'; payload: Omit<Toast, 'id'> }
  | { type: 'REMOVE_TOAST'; payload: string }
  | { type: 'SET_WORKSPACE'; payload: string }
  | { type: 'RESET_DEMO_DATA' };

const STORAGE_KEY = 'pazi_app_state_v1';

function getInitialState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...parsed,
        toasts: [], // Don't persist toasts across reloads
      };
    }
  } catch (err) {
    console.error('Failed to parse state from localStorage:', err);
  }

  return {
    agents: INITIAL_AGENTS,
    conversations: INITIAL_CONVERSATIONS,
    selectedConversationId: INITIAL_CONVERSATIONS[0]?.id || null,
    jobs: INITIAL_JOBS,
    runs: INITIAL_RUNS,
    integrations: INITIAL_INTEGRATIONS,
    slackMessages: INITIAL_SLACK_MESSAGES,
    activities: INITIAL_ACTIVITIES,
    toasts: [],
    currentWorkspace: 'Acme Corp (Production)',
  };
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_AGENT': {
      const initials = getInitials(action.payload.name);
      const newAgent: Agent = {
        ...action.payload,
        id: `agent_${Date.now()}`,
        initials,
        avatarColor: 'from-[#FF7A59] via-[#F0467E] to-[#FFB547]',
        lastRunAt: 'Never',
        createdAt: new Date().toISOString(),
      };
      const newActivity: ActivityEvent = {
        id: `act_${Date.now()}`,
        type: 'agent_reply',
        title: `Created agent "${newAgent.name}"`,
        description: `Configured with ${newAgent.tools.length} integrations and ${newAgent.guardrails.maxSteps} max steps.`,
        timestamp: new Date().toISOString(),
        agentId: newAgent.id,
      };

      return {
        ...state,
        agents: [newAgent, ...state.agents],
        activities: [newActivity, ...state.activities.slice(0, 29)],
        toasts: [
          ...state.toasts,
          {
            id: `toast_${Date.now()}`,
            type: 'success',
            title: 'Agent Created',
            message: `"${newAgent.name}" is now ready to run.`,
          },
        ],
      };
    }

    case 'UPDATE_AGENT': {
      const updatedAgents = state.agents.map((ag) =>
        ag.id === action.payload.id ? action.payload : ag
      );
      return {
        ...state,
        agents: updatedAgents,
        toasts: [
          ...state.toasts,
          {
            id: `toast_${Date.now()}`,
            type: 'success',
            title: 'Agent Updated',
            message: `Changes saved for "${action.payload.name}".`,
          },
        ],
      };
    }

    case 'DELETE_AGENT': {
      const agent = state.agents.find((a) => a.id === action.payload);
      return {
        ...state,
        agents: state.agents.filter((a) => a.id !== action.payload),
        toasts: [
          ...state.toasts,
          {
            id: `toast_${Date.now()}`,
            type: 'info',
            title: 'Agent Deleted',
            message: agent ? `"${agent.name}" has been removed.` : 'Agent deleted.',
          },
        ],
      };
    }

    case 'DUPLICATE_AGENT': {
      const original = state.agents.find((a) => a.id === action.payload);
      if (!original) return state;

      const duplicated: Agent = {
        ...original,
        id: `agent_${Date.now()}`,
        name: `${original.name} (Copy)`,
        initials: getInitials(`${original.name} Copy`),
        createdAt: new Date().toISOString(),
        lastRunAt: 'Never',
      };

      return {
        ...state,
        agents: [duplicated, ...state.agents],
        toasts: [
          ...state.toasts,
          {
            id: `toast_${Date.now()}`,
            type: 'success',
            title: 'Agent Duplicated',
            message: `Created copy "${duplicated.name}".`,
          },
        ],
      };
    }

    case 'TOGGLE_AGENT_STATUS': {
      const updatedAgents = state.agents.map((ag) => {
        if (ag.id === action.payload) {
          const nextStatus: AgentStatus = ag.status === 'active' ? 'paused' : 'active';
          return { ...ag, status: nextStatus };
        }
        return ag;
      });
      const toggled = updatedAgents.find((a) => a.id === action.payload);
      return {
        ...state,
        agents: updatedAgents,
        toasts: [
          ...state.toasts,
          {
            id: `toast_${Date.now()}`,
            type: 'info',
            title: toggled?.status === 'active' ? 'Agent Resumed' : 'Agent Paused',
            message: `"${toggled?.name}" is now ${toggled?.status}.`,
          },
        ],
      };
    }

    case 'CREATE_CONVERSATION': {
      const agent = state.agents.find((a) => a.id === action.payload.agentId) || state.agents[0];
      const newConv: Conversation = {
        id: `conv_${Date.now()}`,
        agentId: agent.id,
        title: action.payload.title || `Chat with ${agent.name}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [
          {
            id: `msg_welcome_${Date.now()}`,
            role: 'agent',
            content: `Hello! I'm **${agent.name}** (${agent.role}). How can I assist you with your tasks today?`,
            timestamp: new Date().toISOString(),
          },
        ],
        usedTools: [],
      };

      return {
        ...state,
        conversations: [newConv, ...state.conversations],
        selectedConversationId: newConv.id,
      };
    }

    case 'SELECT_CONVERSATION': {
      return {
        ...state,
        selectedConversationId: action.payload,
      };
    }

    case 'DELETE_CONVERSATION': {
      const remaining = state.conversations.filter((c) => c.id !== action.payload);
      return {
        ...state,
        conversations: remaining,
        selectedConversationId: remaining[0]?.id || null,
        toasts: [
          ...state.toasts,
          {
            id: `toast_${Date.now()}`,
            type: 'info',
            title: 'Conversation Deleted',
          },
        ],
      };
    }

    case 'ADD_USER_MESSAGE': {
      const userMsg: ChatMessage = {
        id: `msg_user_${Date.now()}`,
        role: 'user',
        content: action.payload.content,
        timestamp: new Date().toISOString(),
      };

      const agentPlaceholderMsg: ChatMessage = {
        id: `msg_agent_stream_${Date.now() + 1}`,
        role: 'agent',
        content: '',
        timestamp: new Date().toISOString(),
        isStreaming: true,
      };

      const updatedConversations = state.conversations.map((c) => {
        if (c.id === action.payload.conversationId) {
          return {
            ...c,
            updatedAt: new Date().toISOString(),
            messages: [...c.messages, userMsg, agentPlaceholderMsg],
          };
        }
        return c;
      });

      return {
        ...state,
        conversations: updatedConversations,
      };
    }

    case 'APPEND_STREAM_CHUNK': {
      const updatedConversations = state.conversations.map((c) => {
        if (c.id === action.payload.conversationId) {
          const msgs = [...c.messages];
          const lastMsg = msgs[msgs.length - 1];
          if (lastMsg && lastMsg.role === 'agent' && lastMsg.isStreaming) {
            msgs[msgs.length - 1] = {
              ...lastMsg,
              content: lastMsg.content + action.payload.chunk,
            };
          }
          return { ...c, messages: msgs };
        }
        return c;
      });

      return {
        ...state,
        conversations: updatedConversations,
      };
    }

    case 'ATTACH_TOOL_CALL': {
      const updatedConversations = state.conversations.map((c) => {
        if (c.id === action.payload.conversationId) {
          const msgs = [...c.messages];
          const lastMsg = msgs[msgs.length - 1];
          if (lastMsg && lastMsg.role === 'agent') {
            msgs[msgs.length - 1] = {
              ...lastMsg,
              toolCall: action.payload.toolCall,
            };
          }
          const usedTools = Array.from(new Set([...c.usedTools, action.payload.toolCall.toolName]));
          return { ...c, messages: msgs, usedTools };
        }
        return c;
      });

      return {
        ...state,
        conversations: updatedConversations,
      };
    }

    case 'FINALIZE_STREAM': {
      const updatedConversations = state.conversations.map((c) => {
        if (c.id === action.payload.conversationId) {
          const msgs = [...c.messages];
          const lastMsg = msgs[msgs.length - 1];
          if (lastMsg && lastMsg.role === 'agent') {
            msgs[msgs.length - 1] = {
              ...lastMsg,
              content: action.payload.fullContent || lastMsg.content,
              isStreaming: false,
            };
          }
          return { ...c, messages: msgs, updatedAt: new Date().toISOString() };
        }
        return c;
      });

      return {
        ...state,
        conversations: updatedConversations,
      };
    }

    case 'ADD_JOB': {
      const nextRuns = getNextRunTimes(action.payload.cronExpression, 1);
      const newJob: ScheduledJob = {
        ...action.payload,
        id: `job_${Date.now()}`,
        nextRunAt: nextRuns[0]?.toISOString() || new Date(Date.now() + 3600000).toISOString(),
      };

      return {
        ...state,
        jobs: [newJob, ...state.jobs],
        toasts: [
          ...state.toasts,
          {
            id: `toast_${Date.now()}`,
            type: 'success',
            title: 'Scheduled Job Created',
            message: `"${newJob.name}" registered to scheduler.`,
          },
        ],
      };
    }

    case 'UPDATE_JOB': {
      return {
        ...state,
        jobs: state.jobs.map((j) => (j.id === action.payload.id ? action.payload : j)),
        toasts: [
          ...state.toasts,
          {
            id: `toast_${Date.now()}`,
            type: 'success',
            title: 'Job Updated',
            message: `Updated schedule for "${action.payload.name}".`,
          },
        ],
      };
    }

    case 'DELETE_JOB': {
      const job = state.jobs.find((j) => j.id === action.payload);
      return {
        ...state,
        jobs: state.jobs.filter((j) => j.id !== action.payload),
        toasts: [
          ...state.toasts,
          {
            id: `toast_${Date.now()}`,
            type: 'info',
            title: 'Job Removed',
            message: job ? `"${job.name}" has been deleted.` : 'Job deleted.',
          },
        ],
      };
    }

    case 'TRIGGER_JOB_RUN': {
      const job = state.jobs.find((j) => j.id === action.payload);
      if (!job) return state;

      const agent = state.agents.find((a) => a.id === job.agentId) || state.agents[0];
      const newRunId = `run_${Date.now()}`;

      const newRun: TaskRun = {
        id: newRunId,
        agentId: agent.id,
        agentName: agent.name,
        agentInitials: agent.initials,
        jobId: job.id,
        jobName: job.name,
        trigger: 'schedule',
        status: 'running',
        startedAt: new Date().toISOString(),
        summary: `Executing scheduled job: ${job.name}`,
        steps: [
          { id: 's1', name: 'Initialize worker sandbox', status: 'running', startedAt: new Date().toISOString() },
          { id: 's2', name: 'Load system prompt & credentials', status: 'pending' },
          { id: 's3', name: 'Execute workflow steps', status: 'pending' },
          { id: 's4', name: 'Persist state & notify channels', status: 'pending' },
        ],
        logs: [
          { id: 'l1', timestamp: new Date().toLocaleTimeString(), level: 'info', message: `Scheduler launched job "${job.name}"` },
          { id: 'l2', timestamp: new Date().toLocaleTimeString(), level: 'info', message: `Agent: ${agent.name} (${agent.id})` },
        ],
      };

      const nextRuns = getNextRunTimes(job.cronExpression, 1);
      const updatedJobs = state.jobs.map((j) =>
        j.id === job.id
          ? {
              ...j,
              lastRunAt: new Date().toISOString(),
              lastStatus: 'running' as const,
              nextRunAt: nextRuns[0]?.toISOString() || new Date(Date.now() + 3600000).toISOString(),
            }
          : j
      );

      return {
        ...state,
        jobs: updatedJobs,
        runs: [newRun, ...state.runs],
        toasts: [
          ...state.toasts,
          {
            id: `toast_${Date.now()}`,
            type: 'info',
            title: 'Task Run Started',
            message: `Job "${job.name}" is now executing.`,
          },
        ],
      };
    }

    case 'TRIGGER_AGENT_RUN': {
      const agent = state.agents.find((a) => a.id === action.payload.agentId) || state.agents[0];
      const newRunId = `run_${Date.now()}`;
      const trigger = action.payload.trigger || 'manual';

      const newRun: TaskRun = {
        id: newRunId,
        agentId: agent.id,
        agentName: agent.name,
        agentInitials: agent.initials,
        trigger,
        status: 'running',
        startedAt: new Date().toISOString(),
        summary: action.payload.inputPrompt || `Manual execution run for ${agent.name}`,
        steps: [
          { id: 's1', name: 'Provision execution context', status: 'running', startedAt: new Date().toISOString() },
          { id: 's2', name: 'Verify integration tokens', status: 'pending' },
          { id: 's3', name: 'Run reasoning & tool actions', status: 'pending' },
          { id: 's4', name: 'Format output summary', status: 'pending' },
        ],
        logs: [
          { id: 'l1', timestamp: new Date().toLocaleTimeString(), level: 'info', message: `Run triggered by ${trigger.toUpperCase()}` },
          { id: 'l2', timestamp: new Date().toLocaleTimeString(), level: 'info', message: `Attached integrations: ${agent.tools.join(', ') || 'None'}` },
        ],
      };

      const updatedAgents = state.agents.map((a) =>
        a.id === agent.id ? { ...a, lastRunAt: new Date().toISOString() } : a
      );

      return {
        ...state,
        agents: updatedAgents,
        runs: [newRun, ...state.runs],
        toasts: [
          ...state.toasts,
          {
            id: `toast_${Date.now()}`,
            type: 'info',
            title: 'Run Dispatched',
            message: `Dispatched task execution for "${agent.name}".`,
          },
        ],
      };
    }

    case 'UPDATE_RUN': {
      const updatedRuns = state.runs.map((r) => (r.id === action.payload.id ? action.payload : r));
      return {
        ...state,
        runs: updatedRuns,
      };
    }

    case 'RETRY_RUN': {
      const originalRun = state.runs.find((r) => r.id === action.payload);
      if (!originalRun) return state;

      const resetRun: TaskRun = {
        ...originalRun,
        status: 'running',
        errorMessage: undefined,
        startedAt: new Date().toISOString(),
        completedAt: undefined,
        steps: originalRun.steps.map((st, i) => ({
          ...st,
          status: i === 0 ? 'running' : 'pending',
          startedAt: i === 0 ? new Date().toISOString() : undefined,
          finishedAt: undefined,
          durationMs: undefined,
        })),
        logs: [
          ...originalRun.logs,
          {
            id: `l_retry_${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            level: 'info',
            message: 'Manual retry initiated by user. Clearing error state...',
          },
        ],
      };

      return {
        ...state,
        runs: state.runs.map((r) => (r.id === originalRun.id ? resetRun : r)),
        toasts: [
          ...state.toasts,
          {
            id: `toast_${Date.now()}`,
            type: 'info',
            title: 'Retrying Task Run',
            message: `Restarted run #${resetRun.id.replace('run_', '')}.`,
          },
        ],
      };
    }

    case 'CONNECT_INTEGRATION': {
      const updatedIntegrations = state.integrations.map((item) =>
        item.id === action.payload.id
          ? {
              ...item,
              connected: true,
              accountName: action.payload.accountName,
              connectedAt: new Date().toISOString(),
              lastSyncAt: new Date().toISOString(),
            }
          : item
      );

      const target = updatedIntegrations.find((i) => i.id === action.payload.id);

      return {
        ...state,
        integrations: updatedIntegrations,
        toasts: [
          ...state.toasts,
          {
            id: `toast_${Date.now()}`,
            type: 'success',
            title: 'Integration Connected',
            message: `${target?.name || 'Service'} connected successfully.`,
          },
        ],
      };
    }

    case 'DISCONNECT_INTEGRATION': {
      const updatedIntegrations = state.integrations.map((item) =>
        item.id === action.payload
          ? {
              ...item,
              connected: false,
              accountName: undefined,
              connectedAt: undefined,
            }
          : item
      );

      const target = state.integrations.find((i) => i.id === action.payload);

      return {
        ...state,
        integrations: updatedIntegrations,
        toasts: [
          ...state.toasts,
          {
            id: `toast_${Date.now()}`,
            type: 'info',
            title: 'Integration Disconnected',
            message: `${target?.name || 'Service'} has been disconnected.`,
          },
        ],
      };
    }

    case 'UPDATE_WEBHOOK_URL': {
      const updatedIntegrations = state.integrations.map((item) =>
        item.id === 'webhooks'
          ? {
              ...item,
              webhookUrl: action.payload,
              accountName: `Endpoint: ${action.payload}`,
            }
          : item
      );

      return {
        ...state,
        integrations: updatedIntegrations,
        toasts: [
          ...state.toasts,
          {
            id: `toast_${Date.now()}`,
            type: 'success',
            title: 'Webhook Updated',
            message: 'Target delivery URL saved.',
          },
        ],
      };
    }

    case 'ADD_WEBHOOK_TEST_EVENT': {
      const updatedIntegrations = state.integrations.map((item) => {
        if (item.id === 'webhooks') {
          const events = item.webhookEvents || [];
          return {
            ...item,
            webhookEvents: [
              {
                id: `wh_${Date.now()}`,
                timestamp: new Date().toISOString(),
                ...action.payload,
              },
              ...events.slice(0, 19),
            ],
          };
        }
        return item;
      });

      return {
        ...state,
        integrations: updatedIntegrations,
        toasts: [
          ...state.toasts,
          {
            id: `toast_${Date.now()}`,
            type: action.payload.status === 200 ? 'success' : 'error',
            title: `Webhook Test (${action.payload.status})`,
            message: action.payload.payloadSummary,
          },
        ],
      };
    }

    case 'POST_SLACK_MESSAGE': {
      const newMsg: SlackMessage = {
        id: `slk_${Date.now()}`,
        user: {
          name: action.payload.authorName || 'Current User',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
        },
        channel: action.payload.channel,
        text: action.payload.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        threadReplyCount: 0,
        replies: [],
      };

      return {
        ...state,
        slackMessages: [...state.slackMessages, newMsg],
      };
    }

    case 'POST_SLACK_REPLY': {
      const updatedSlackMessages = state.slackMessages.map((msg) => {
        if (msg.id === action.payload.parentId) {
          const replyMsg: SlackMessage = {
            id: `slk_reply_${Date.now()}`,
            user: {
              name: 'Pazi Agent',
              avatar: '',
              isBot: true,
            },
            channel: msg.channel,
            text: action.payload.text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            taskRunId: action.payload.taskRunId,
            taskRunStatus: 'succeeded' as const,
          };
          const replies = msg.replies || [];
          return {
            ...msg,
            threadReplyCount: (msg.threadReplyCount || 0) + 1,
            replies: [...replies, replyMsg],
            taskRunId: action.payload.taskRunId || msg.taskRunId,
            taskRunStatus: 'succeeded' as const,
          };
        }
        return msg;
      });

      return {
        ...state,
        slackMessages: updatedSlackMessages,
      };
    }

    case 'ADD_TOAST': {
      const newToast: Toast = {
        id: `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        ...action.payload,
      };
      return {
        ...state,
        toasts: [...state.toasts, newToast],
      };
    }

    case 'REMOVE_TOAST': {
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.payload),
      };
    }

    case 'SET_WORKSPACE': {
      return {
        ...state,
        currentWorkspace: action.payload,
        toasts: [
          ...state.toasts,
          {
            id: `toast_${Date.now()}`,
            type: 'info',
            title: 'Workspace Switched',
            message: `Active context set to ${action.payload}`,
          },
        ],
      };
    }

    case 'RESET_DEMO_DATA': {
      localStorage.removeItem(STORAGE_KEY);
      return {
        agents: INITIAL_AGENTS,
        conversations: INITIAL_CONVERSATIONS,
        selectedConversationId: INITIAL_CONVERSATIONS[0]?.id || null,
        jobs: INITIAL_JOBS,
        runs: INITIAL_RUNS,
        integrations: INITIAL_INTEGRATIONS,
        slackMessages: INITIAL_SLACK_MESSAGES,
        activities: INITIAL_ACTIVITIES,
        toasts: [
          {
            id: `toast_${Date.now()}`,
            type: 'success',
            title: 'Demo Data Restored',
            message: 'All agents, jobs, integrations, and runs reset to initial state.',
          },
        ],
        currentWorkspace: 'Acme Corp (Production)',
      };
    }

    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, undefined, getInitialState);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save state to localStorage:', e);
    }
  }, [state]);

  // Live Task Run step-by-step progress simulation
  useEffect(() => {
    const runningRun = state.runs.find((r) => r.status === 'running');
    if (!runningRun) return;

    const timer = setTimeout(() => {
      // Find the first pending or currently running step
      const currentStepIndex = runningRun.steps.findIndex((s) => s.status === 'running');
      if (currentStepIndex !== -1) {
        // Complete current step and start next
        const newSteps = [...runningRun.steps];
        newSteps[currentStepIndex] = {
          ...newSteps[currentStepIndex],
          status: 'completed',
          finishedAt: new Date().toISOString(),
          durationMs: Math.floor(1000 + Math.random() * 2500),
          outputPreview: `Step "${newSteps[currentStepIndex].name}" completed successfully.`,
        };

        const nextStepIndex = currentStepIndex + 1;
        const isFinished = nextStepIndex >= newSteps.length;

        if (!isFinished) {
          newSteps[nextStepIndex] = {
            ...newSteps[nextStepIndex],
            status: 'running',
            startedAt: new Date().toISOString(),
          };
        }

        const newLogs = [
          ...runningRun.logs,
          {
            id: `l_${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            level: 'info' as const,
            message: `Completed step: ${newSteps[currentStepIndex].name}`,
          },
        ];

        const updatedRun: TaskRun = {
          ...runningRun,
          steps: newSteps,
          logs: newLogs,
          status: isFinished ? 'succeeded' : 'running',
          completedAt: isFinished ? new Date().toISOString() : undefined,
          durationMs: isFinished ? Math.floor(12000 + Math.random() * 8000) : undefined,
        };

        dispatch({ type: 'UPDATE_RUN', payload: updatedRun });

        if (isFinished) {
          dispatch({
            type: 'ADD_TOAST',
            payload: {
              type: 'success',
              title: 'Task Run Succeeded',
              message: `Run #${updatedRun.id.replace('run_', '')} finished in ${((updatedRun.durationMs || 15000) / 1000).toFixed(1)}s.`,
            },
          });
        }
      } else {
        // Start first step if all pending
        const newSteps = [...runningRun.steps];
        if (newSteps[0]) {
          newSteps[0] = {
            ...newSteps[0],
            status: 'running',
            startedAt: new Date().toISOString(),
          };
          dispatch({
            type: 'UPDATE_RUN',
            payload: {
              ...runningRun,
              steps: newSteps,
            },
          });
        }
      }
    }, 1400);

    return () => clearTimeout(timer);
  }, [state.runs]);

  // In-app scheduler: checks active scheduled jobs every 30 seconds
  useEffect(() => {
    const schedulerInterval = setInterval(() => {
      const now = new Date();
      state.jobs.forEach((job) => {
        if (!job.enabled) return;
        const nextRun = new Date(job.nextRunAt);
        // If scheduled time is reached or past
        if (now >= nextRun) {
          dispatch({ type: 'TRIGGER_JOB_RUN', payload: job.id });
        }
      });
    }, 30000);

    return () => clearInterval(schedulerInterval);
  }, [state.jobs]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
};

export function useAppStore() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
}
