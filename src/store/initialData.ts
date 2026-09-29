import { Agent, Conversation, Integration, ScheduledJob, SlackMessage, TaskRun, ActivityEvent } from '../types';

export const INITIAL_AGENTS: Agent[] = [
  {
    id: 'agent_lead_qualifier',
    name: 'Lead Qualifier',
    role: 'Inbound SDR & CRM Automation',
    description: 'Scores inbound leads from webhooks, enriches company headcount and intent signals, and creates HubSpot contacts.',
    avatarColor: 'from-[#FF7A59] via-[#F0467E] to-[#FFB547]',
    initials: 'LQ',
    status: 'active',
    systemPrompt: `You are Lead Qualifier, an expert Inbound SDR automation agent for Acme Corp.
Your objectives:
1. Parse incoming prospect queries, email domains, and seat requests.
2. Evaluate Fit Score (1-100) based on enterprise criteria (>50 employees, B2B focus).
3. Draft clean CRM records and invoke HubSpot tools when qualification criteria are satisfied.
4. Keep tone professional, analytical, and structured.`,
    tools: ['hubspot', 'slack', 'gmail'],
    channels: ['web', 'slack'],
    guardrails: {
      maxSteps: 8,
      requireApproval: false,
    },
    lastRunAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
  },
  {
    id: 'agent_support_triage',
    name: 'Support Triage',
    role: 'Customer Success & Ticket Router',
    description: 'Classifies customer requests, detects bug patterns, queries GitHub issues, and notifies engineers on urgent incidents.',
    avatarColor: 'from-[#F0467E] via-[#FF7A59] to-[#FFB547]',
    initials: 'ST',
    status: 'active',
    systemPrompt: `You are Support Triage, a proactive Tier 2 support intelligence agent.
Your objectives:
1. Read customer tickets and isolate root cause symptoms.
2. Cross-reference existing GitHub repository issues and release notes.
3. Classify severity: Low, Medium, High, or Urgent P0.
4. Notify on-call engineering via Slack if severe or widespread.`,
    tools: ['slack', 'github', 'notion'],
    channels: ['web', 'slack'],
    guardrails: {
      maxSteps: 6,
      requireApproval: true,
    },
    lastRunAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString(),
  },
  {
    id: 'agent_revenue_reporter',
    name: 'Weekly Revenue Reporter',
    role: 'Finance & Metrics Synthesizer',
    description: 'Aggregates weekly MRR movements, Stripe subscription renewals, and flags potential churn risks into executive summaries.',
    avatarColor: 'from-[#FF7A59] to-[#FFB547]',
    initials: 'RR',
    status: 'active',
    systemPrompt: `You are Weekly Revenue Reporter, a strategic financial operations agent.
Your objectives:
1. Synthesize Stripe recurring billings, net additions, and churned accounts.
2. Group trends by customer tier (Startup, Growth, Enterprise).
3. Surface high-risk contractions and overdue invoices.
4. Present actionable takeaways with clean bullet points and currency formatting.`,
    tools: ['stripe', 'slack', 'google_calendar'],
    channels: ['web', 'slack'],
    guardrails: {
      maxSteps: 10,
      requireApproval: false,
    },
    lastRunAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
  },
  {
    id: 'agent_release_shepherd',
    name: 'GitHub Release Shepherd',
    role: 'DevOps & Deployment Coordinator',
    description: 'Audits merged pull requests, verifies CI test suites, compiles changelog notes, and gates production deployment rollouts.',
    avatarColor: 'from-[#78716C] to-[#1C1917]',
    initials: 'GS',
    status: 'paused',
    systemPrompt: `You are GitHub Release Shepherd, a continuous delivery coordinator.
Your objectives:
1. Inspect pull requests targeted for production staging.
2. Confirm unit test, lint, and security compliance passes.
3. Generate concise semantic version release notes.
4. Await human approval before triggering production deployment webhooks.`,
    tools: ['github', 'slack', 'webhooks'],
    channels: ['web', 'slack'],
    guardrails: {
      maxSteps: 5,
      requireApproval: true,
    },
    lastRunAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
  },
];

export const INITIAL_JOBS: ScheduledJob[] = [
  {
    id: 'job_lead_sync',
    name: 'Daily Inbound Lead Sync & Enrichment',
    agentId: 'agent_lead_qualifier',
    frequency: 'daily',
    humanSchedule: 'Every weekday at 9:00 AM',
    cronExpression: '0 9 * * 1-5',
    enabled: true,
    lastRunAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    lastStatus: 'succeeded',
    nextRunAt: new Date(Date.now() + 1000 * 60 * 60 * 20).toISOString(),
    inputPrompt: 'Scan inbound webhook submissions from the past 24 hours. Qualify contacts with high buyer intent and update HubSpot.',
  },
  {
    id: 'job_revenue_digest',
    name: 'Weekly Executive MRR Digest',
    agentId: 'agent_revenue_reporter',
    frequency: 'weekly',
    humanSchedule: 'Every Monday at 8:00 AM',
    cronExpression: '0 8 * * 1',
    enabled: true,
    lastRunAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    lastStatus: 'succeeded',
    nextRunAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
    inputPrompt: 'Calculate net-new ARR from Stripe webhooks, identify top expansion accounts, and post summary to #executive-briefing.',
  },
  {
    id: 'job_ticket_escalation',
    name: 'Hourly Stale Ticket Escalation',
    agentId: 'agent_support_triage',
    frequency: 'hourly',
    humanSchedule: 'Every hour at the top of the hour',
    cronExpression: '0 * * * *',
    enabled: true,
    lastRunAt: new Date(Date.now() - 1000 * 60 * 32).toISOString(),
    lastStatus: 'succeeded',
    nextRunAt: new Date(Date.now() + 1000 * 60 * 28).toISOString(),
    inputPrompt: 'Check support queue for tickets awaiting response over 90 minutes. Route urgent requests to on-duty tier.',
  },
];

export const INITIAL_RUNS: TaskRun[] = [
  {
    id: 'run_9082',
    agentId: 'agent_lead_qualifier',
    agentName: 'Lead Qualifier',
    agentInitials: 'LQ',
    jobId: 'job_lead_sync',
    jobName: 'Daily Inbound Lead Sync & Enrichment',
    trigger: 'schedule',
    status: 'succeeded',
    startedAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 17).toISOString(),
    durationMs: 42100,
    summary: 'Processed 14 webhook leads, enriched 8 accounts, synchronized 6 qualified opportunities to HubSpot CRM.',
    steps: [
      { id: 's1', name: 'Fetch webhook payload queue', status: 'completed', durationMs: 1420, outputPreview: 'Fetched 14 new inbound payloads from /v1/webhooks' },
      { id: 's2', name: 'Enrich domain metadata', status: 'completed', durationMs: 8200, outputPreview: 'DNS lookup and Clearbit company data resolved for 14 domains' },
      { id: 's3', name: 'Evaluate ICP Fit Matrix', status: 'completed', durationMs: 12400, outputPreview: 'Scored leads: 6 Tier-1 (>80), 5 Tier-2 (50-79), 3 Disqualified' },
      { id: 's4', name: 'Create HubSpot contact records', status: 'completed', durationMs: 15300, outputPreview: 'Synchronized 6 contacts to pipeline "Enterprise Inbound"' },
      { id: 's5', name: 'Post Slack summary digest', status: 'completed', durationMs: 4780, outputPreview: 'Posted update to #lead-ops channel' },
    ],
    logs: [
      { id: 'l1', timestamp: '14:20:01', level: 'info', message: 'Worker container provisioned in region us-central1' },
      { id: 'l2', timestamp: '14:20:03', level: 'info', message: 'Connected to HubSpot API endpoint with OAuth Bearer token' },
      { id: 'l3', timestamp: '14:20:11', level: 'debug', message: 'Enrichment payload: 14 domain records matched' },
      { id: 'l4', timestamp: '14:20:25', level: 'info', message: 'Qualified lead HS-10291 (Apex Logistics, 350 seats) score: 94' },
      { id: 'l5', timestamp: '14:20:41', level: 'info', message: 'Dispatched completion notification to Slack #lead-ops' },
      { id: 'l6', timestamp: '14:20:43', level: 'info', message: 'Run finished with exit status 0 (Success)' },
    ],
  },
  {
    id: 'run_9081',
    agentId: 'agent_support_triage',
    agentName: 'Support Triage',
    agentInitials: 'ST',
    trigger: 'slack',
    status: 'succeeded',
    startedAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 41).toISOString(),
    durationMs: 31800,
    summary: 'Analyzed Slack mention by @alex regarding OAuth 403 token expiration; drafted diagnosis and verified GitHub PR.',
    steps: [
      { id: 's1', name: 'Parse Slack thread message context', status: 'completed', durationMs: 980, outputPreview: 'Extracted error stacktrace from thread' },
      { id: 's2', name: 'Search GitHub repository commits', status: 'completed', durationMs: 6400, outputPreview: 'Found commit e4a9b1c related to OAuth token rotation' },
      { id: 's3', name: 'Generate resolution steps', status: 'completed', durationMs: 14200, outputPreview: 'Drafted instructions for regenerating client credentials' },
      { id: 's4', name: 'Post threaded Slack reply', status: 'completed', durationMs: 10220, outputPreview: 'Delivered response to user @alex in #agent-ops' },
    ],
    logs: [
      { id: 'l1', timestamp: '13:56:10', level: 'info', message: 'Received trigger from Slack Events API (app_mention in #agent-ops)' },
      { id: 'l2', timestamp: '13:56:12', level: 'info', message: 'Invoking GitHub REST client for commit search' },
      { id: 'l3', timestamp: '13:56:22', level: 'debug', message: 'Found PR #412: fix(auth): refresh token expiry calculation' },
      { id: 'l4', timestamp: '13:56:40', level: 'info', message: 'Thread reply posted with run metadata card' },
    ],
  },
  {
    id: 'run_9080',
    agentId: 'agent_revenue_reporter',
    agentName: 'Weekly Revenue Reporter',
    agentInitials: 'RR',
    jobId: 'job_revenue_digest',
    jobName: 'Weekly Executive MRR Digest',
    trigger: 'manual',
    status: 'succeeded',
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 6 + 48000).toISOString(),
    durationMs: 48000,
    summary: 'Aggregated Stripe billings across 182 accounts. Net MRR grew by +$8,420 (4.1% MoM).',
    steps: [
      { id: 's1', name: 'Query Stripe Subscriptions API', status: 'completed', durationMs: 11200, outputPreview: 'Retrieved 182 active recurring customer subscriptions' },
      { id: 's2', name: 'Aggregate expansion vs contraction', status: 'completed', durationMs: 18400, outputPreview: 'Expansion: +$11,200 | Churn: -$2,780 | Net: +$8,420' },
      { id: 's3', name: 'Format executive briefing PDF/Markdown', status: 'completed', durationMs: 12000, outputPreview: 'Rendered financial digest table and KPI breakdown' },
      { id: 's4', name: 'Sync summary to Slack #finance', status: 'completed', durationMs: 6400, outputPreview: 'Dispatched message with MRR comparison chart' },
    ],
    logs: [
      { id: 'l1', timestamp: '08:00:00', level: 'info', message: 'Scheduled cron execution initiated' },
      { id: 'l2', timestamp: '08:00:15', level: 'info', message: 'Fetched Stripe invoices for previous 7-day period' },
      { id: 'l3', timestamp: '08:00:32', level: 'debug', message: 'Calculated Cohort MRR: 98.4% retention rate' },
      { id: 'l4', timestamp: '08:00:48', level: 'info', message: 'Digest broadcast complete' },
    ],
  },
  {
    id: 'run_9079',
    agentId: 'agent_support_triage',
    agentName: 'Support Triage',
    agentInitials: 'ST',
    trigger: 'schedule',
    status: 'failed',
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 12 + 18000).toISOString(),
    durationMs: 18000,
    summary: 'Execution halted during GitHub issue sync due to rate limit threshold (429 Too Many Requests).',
    errorMessage: 'GitHub API rate limit exceeded: 429 Too Many Requests. Reset window expected in 8 minutes.',
    steps: [
      { id: 's1', name: 'Fetch unassigned support tickets', status: 'completed', durationMs: 2400, outputPreview: 'Loaded 5 pending tickets from inbox' },
      { id: 's2', name: 'Query GitHub issue database', status: 'failed', durationMs: 15600, outputPreview: 'API error 429: rate limit exceeded' },
      { id: 's3', name: 'Post alert to engineering', status: 'pending', durationMs: 0 },
    ],
    logs: [
      { id: 'l1', timestamp: '02:00:01', level: 'info', message: 'Task initialized by scheduler daemon' },
      { id: 'l2', timestamp: '02:00:04', level: 'info', message: 'Contacting https://api.github.com/repos/acme/core/issues' },
      { id: 'l3', timestamp: '02:00:18', level: 'error', message: 'HTTP 429: x-ratelimit-remaining is 0. Operation aborted to protect token.' },
      { id: 'l4', timestamp: '02:00:18', level: 'warn', message: 'Task marked as FAILED with retry eligible' },
    ],
  },
];

export const INITIAL_INTEGRATIONS: Integration[] = [
  {
    id: 'slack',
    name: 'Slack',
    category: 'Communication',
    description: 'Post messages, listen for @mentions, and run collaborative agent threads directly in team channels.',
    connected: true,
    accountName: 'Acme Corp Team (#agent-ops, #general)',
    connectedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    lastSyncAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    scopes: ['channels:read', 'chat:write', 'app_mentions:read', 'files:write'],
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    category: 'CRM & Sales',
    description: 'Create and update contacts, deals, company objects, and track lifecycle stage transitions automatically.',
    connected: true,
    accountName: 'Acme Enterprise CRM',
    connectedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    lastSyncAt: new Date(Date.now() - 1000 * 60 * 34).toISOString(),
    scopes: ['crm.objects.contacts.read', 'crm.objects.contacts.write', 'crm.objects.deals.write'],
  },
  {
    id: 'google_calendar',
    name: 'Google Calendar',
    category: 'Productivity',
    description: 'Check team availability, schedule meetings, and create calendar events from agent recommendations.',
    connected: true,
    accountName: 'ops-team@acme.inc',
    connectedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    lastSyncAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    scopes: ['calendar.events.readonly', 'calendar.events.freebusy', 'calendar.events'],
  },
  {
    id: 'github',
    name: 'GitHub',
    category: 'Developer Tools',
    description: 'Inspect repositories, pull request statuses, commits, releases, and automate developer triage workflows.',
    connected: true,
    accountName: 'acme-corp/monorepo',
    connectedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    lastSyncAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    scopes: ['repo:status', 'repo:read', 'issues:write'],
  },
  {
    id: 'stripe',
    name: 'Stripe',
    category: 'Billing & Finance',
    description: 'Query MRR metrics, customer subscriptions, invoice statuses, and monitor charge failure anomalies.',
    connected: true,
    accountName: 'Acme Payments US (Live)',
    connectedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    lastSyncAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    scopes: ['read_only:subscriptions', 'read_only:invoices', 'read_only:customers'],
  },
  {
    id: 'gmail',
    name: 'Gmail',
    category: 'Email & Outreach',
    description: 'Read incoming customer inquiries and send formatted follow-up emails on behalf of SDR agents.',
    connected: false,
    scopes: ['gmail.send', 'gmail.readonly'],
  },
  {
    id: 'notion',
    name: 'Notion',
    category: 'Knowledge Base',
    description: 'Search internal wiki documentation, runbooks, and append meeting logs to team databases.',
    connected: false,
    scopes: ['read_content', 'update_content'],
  },
  {
    id: 'webhooks',
    name: 'Custom Webhooks',
    category: 'Custom API',
    description: 'Receive real-time JSON webhooks from any internal service or send HTTP POST payloads on agent events.',
    connected: true,
    accountName: 'Endpoint: api.acme.inc/v1/pazi-events',
    connectedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
    lastSyncAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    webhookUrl: 'https://api.acme.inc/v1/pazi-events',
    scopes: ['http:post', 'signature_hmac_sha256'],
    webhookEvents: [
      { id: 'wh_1', timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(), event: 'agent.run.completed', status: 200, payloadSummary: 'Delivered run_9082 success payload (421ms)' },
      { id: 'wh_2', timestamp: new Date(Date.now() - 1000 * 60 * 42).toISOString(), event: 'lead.qualified', status: 200, payloadSummary: 'Delivered lead_10291 ICP score 94 (310ms)' },
      { id: 'wh_3', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), event: 'ping.healthcheck', status: 200, payloadSummary: 'Ping response 200 OK (89ms)' },
    ],
  },
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv_lead_1',
    agentId: 'agent_lead_qualifier',
    title: 'Qualify inbound enterprise prospect: Apex Logistics',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    usedTools: ['HubSpot CRM', 'Slack Dispatcher'],
    messages: [
      {
        id: 'm1',
        role: 'user',
        content: 'Hi! Can you evaluate this inbound inquiry: "We are Apex Logistics, 350 employees across 4 distribution hubs. Looking to automate dispatch notifications and sync leads to our CRM. Need 50 seats to start."',
        timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      },
      {
        id: 'm2',
        role: 'agent',
        content: `I've analyzed the prospect **Apex Logistics** against our Ideal Customer Profile (ICP) parameters:

- **Company Size:** 350 employees *(Threshold: >50 seats)* -> **Match (Tier 1)**
- **Initial Deployment:** 50 seats ($36,000 estimated ARR)
- **Use Case:** Operations dispatch & CRM integration
- **ICP Score:** **94 / 100**

I have synchronized the qualified contact into HubSpot CRM, initialized a deal in stage "Sales Qualified", and notified the enterprise sales pod.`,
        timestamp: new Date(Date.now() - 1000 * 60 * 24).toISOString(),
        toolCall: {
          id: 'tc_demo_1',
          toolName: 'HubSpot CRM',
          action: 'create_contact_and_deal',
          inputs: { company: 'Apex Logistics', initialSeats: 50, stage: 'Sales Qualified', icpScore: 94 },
          status: 'success',
          result: 'Created Deal #HS-10291 ($36k ARR) in pipeline "Enterprise Inbound" assigned to Sarah Lin.',
        },
      },
      {
        id: 'm3',
        role: 'user',
        content: 'Awesome. Can you send a quick alert to our #lead-ops Slack channel?',
        timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      },
      {
        id: 'm4',
        role: 'agent',
        content: `Done! I dispatched the high-intent lead summary card directly to **#lead-ops**. Sarah Lin has been tagged as the primary account executive, along with the HubSpot deep link.`,
        timestamp: new Date(Date.now() - 1000 * 60 * 19).toISOString(),
        toolCall: {
          id: 'tc_demo_2',
          toolName: 'Slack Dispatcher',
          action: 'post_channel_notification',
          inputs: { channel: '#lead-ops', priority: 'High', mention: '@sarah' },
          status: 'success',
          result: 'Broadcast delivered to #lead-ops with deal preview card.',
        },
      },
    ],
  },
  {
    id: 'conv_support_1',
    agentId: 'agent_support_triage',
    title: 'Customer reporting 403 token expiration on sync',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    usedTools: ['GitHub Enterprise'],
    messages: [
      {
        id: 'ms1',
        role: 'user',
        content: 'Customer Meridian Health is getting HTTP 403 when trying to sync records via OAuth. Any idea what is causing this?',
        timestamp: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
      },
      {
        id: 'ms2',
        role: 'agent',
        content: `I reviewed recent GitHub commits and deployment logs.

This is linked to the recent auth rotation patch in **PR #412** (*fix(auth): refresh token expiry calculation*). Tokens issued prior to yesterday's 14:00 UTC deployment have a legacy claims structure that our new auth gateway rejects.

**Recommended resolution:**
1. Instruct Meridian Health admin to click **"Reconnect"** in Settings > Integrations.
2. If the issue persists, trigger a manual token invalidation through our admin CLI.`,
        timestamp: new Date(Date.now() - 1000 * 60 * 48).toISOString(),
        toolCall: {
          id: 'tc_demo_3',
          toolName: 'GitHub Enterprise',
          action: 'query_commit_history',
          inputs: { repo: 'acme/core-api', query: 'auth token 403' },
          status: 'success',
          result: 'Identified PR #412 merged 18 hours ago by @dev-lead.',
        },
      },
    ],
  },
];

export const INITIAL_SLACK_MESSAGES: SlackMessage[] = [
  {
    id: 'slk_1',
    user: {
      name: 'Sarah Lin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
    },
    channel: '#agent-ops',
    text: 'Hey team, @Lead Qualifier can you check if we had any new inbound enterprise inquiries today from Europe?',
    timestamp: '10:14 AM',
    threadReplyCount: 1,
    taskRunId: 'run_9082',
    taskRunStatus: 'succeeded',
    replies: [
      {
        id: 'slk_reply_1',
        user: {
          name: 'Lead Qualifier (AI Agent)',
          avatar: '',
          isBot: true,
        },
        channel: '#agent-ops',
        text: `Checked inbound queue: We received 1 qualified European inquiry from **FinNordic AB** (Stockholm, 180 seats, fintech payments). 

I've scored the lead at **89/100**, drafted the HubSpot contact, and mapped their regional currency to EUR. Would you like me to ping their regional lead on LinkedIn?`,
        timestamp: '10:15 AM',
        taskRunId: 'run_9082',
        taskRunStatus: 'succeeded',
      },
    ],
  },
  {
    id: 'slk_2',
    user: {
      name: 'Marcus Vance',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
    },
    channel: '#agent-ops',
    text: '@Support Triage We just saw an uptick in support tickets about export latency. Is there an active incident?',
    timestamp: '11:30 AM',
    threadReplyCount: 1,
    taskRunId: 'run_9081',
    taskRunStatus: 'succeeded',
    replies: [
      {
        id: 'slk_reply_2',
        user: {
          name: 'Support Triage (AI Agent)',
          avatar: '',
          isBot: true,
        },
        channel: '#agent-ops',
        text: `Investigated queue latency: Database worker IOPS spiked to 88% around 11:15 AM due to a batch report job. 

Average ticket wait time is temporarily elevated (+6 mins), but no dropped connections detected. I've automatically alerted #infra-oncall.`,
        timestamp: '11:31 AM',
        taskRunId: 'run_9081',
        taskRunStatus: 'succeeded',
      },
    ],
  },
];

export const INITIAL_ACTIVITIES: ActivityEvent[] = [
  {
    id: 'act_1',
    type: 'agent_reply',
    title: 'Lead Qualifier scored 14 inbound leads',
    description: 'Enriched domain metadata and synchronized 6 qualified leads to HubSpot CRM.',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    agentId: 'agent_lead_qualifier',
  },
  {
    id: 'act_2',
    type: 'job_executed',
    title: 'Scheduled Job "Daily Inbound Lead Sync" succeeded',
    description: 'Ran on schedule in 42.1s with 0 errors.',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
  },
  {
    id: 'act_3',
    type: 'agent_reply',
    title: 'Support Triage answered incident query in Slack #agent-ops',
    description: 'Identified commit PR #412 as source of token invalidation.',
    timestamp: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    agentId: 'agent_support_triage',
  },
  {
    id: 'act_4',
    type: 'run_succeeded',
    title: 'Weekly Executive MRR Digest generated',
    description: 'Calculated +$8,420 Net MRR increase from Stripe webhooks.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    agentId: 'agent_revenue_reporter',
  },
  {
    id: 'act_5',
    type: 'integration_connected',
    title: 'Slack integration refreshed credentials',
    description: 'Workspace "Acme Corp Team" permissions verified.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
  },
];
