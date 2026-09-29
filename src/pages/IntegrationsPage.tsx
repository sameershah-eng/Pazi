import React, { useState } from 'react';
import { Integration } from '../types';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ConnectModal } from '../components/integrations/ConnectModal';
import { WebhookModal } from '../components/integrations/WebhookModal';
import { useAppStore } from '../store/AppContext';
import { formatRelativeTime } from '../lib/cronUtils';
import {
  Puzzle,
  Hash,
  Mail,
  Calendar,
  Layers,
  FileText,
  Github,
  CreditCard,
  Webhook,
  CheckCircle2,
  ExternalLink,
  Settings,
} from 'lucide-react';

export const IntegrationsPage: React.FC = () => {
  const { state } = useAppStore();
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);

  const getIntegrationIcon = (id: string) => {
    switch (id) {
      case 'slack':
        return <Hash className="w-5 h-5 text-[#E01E5A]" />;
      case 'gmail':
        return <Mail className="w-5 h-5 text-[#EA4335]" />;
      case 'google_calendar':
        return <Calendar className="w-5 h-5 text-[#4285F4]" />;
      case 'hubspot':
        return <Layers className="w-5 h-5 text-[#FF7A59]" />;
      case 'notion':
        return <FileText className="w-5 h-5 text-[#1C1917]" />;
      case 'github':
        return <Github className="w-5 h-5 text-[#1C1917]" />;
      case 'stripe':
        return <CreditCard className="w-5 h-5 text-[#635BFF]" />;
      case 'webhooks':
        return <Webhook className="w-5 h-5 text-[#0FB5A6]" />;
      default:
        return <Puzzle className="w-5 h-5 text-[#FF7A59]" />;
    }
  };

  const handleAction = (integration: Integration) => {
    setSelectedIntegration(integration);
    if (integration.id === 'webhooks') {
      setIsWebhookModalOpen(true);
    } else {
      setIsConnectModalOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold text-[#1C1917] tracking-tight">Integrations</h1>
          <span className="w-2 h-2 rounded-full bg-[#0FB5A6] animate-pulse" />
        </div>
        <p className="text-xs text-[#78716C] mt-1">
          Connect your SaaS stack to authorize agents to query records, trigger automations, and collaborate with your team.
        </p>
      </div>

      {/* Grid of Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {state.integrations.map((integration) => (
          <Card
            key={integration.id}
            hoverLift
            className="p-5 flex flex-col justify-between"
          >
            <div>
              {/* Header: Icon, Name, Badge */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[10px] bg-[#FAF8F5] border border-[#ECE7E1] flex items-center justify-center flex-shrink-0">
                    {getIntegrationIcon(integration.id)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1C1917]">{integration.name}</h3>
                    <span className="text-[11px] text-[#78716C] font-medium">
                      {integration.category}
                    </span>
                  </div>
                </div>

                <Badge
                  variant={integration.connected ? 'connected' : 'disconnected'}
                  size="sm"
                >
                  {integration.connected ? 'Connected' : 'Not Connected'}
                </Badge>
              </div>

              {/* Description */}
              <p className="mt-3 text-xs text-[#78716C] leading-relaxed">
                {integration.description}
              </p>
            </div>

            {/* Connection Details or Scopes */}
            <div className="mt-4 pt-3 border-t border-[#ECE7E1] space-y-2">
              {integration.connected ? (
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between text-[#1C1917] font-semibold truncate">
                    <span className="text-[#78716C] font-normal">Account:</span>
                    <span className="truncate max-w-[170px]" title={integration.accountName}>
                      {integration.accountName || 'Active Workspace'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#78716C]">
                    <span>Last Sync:</span>
                    <span className="font-mono">
                      {integration.lastSyncAt ? formatRelativeTime(integration.lastSyncAt) : 'Just now'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-[11px] text-[#A8A29E]">
                  Requires {integration.scopes.length} OAuth scopes
                </div>
              )}

              {/* Action button */}
              <div className="pt-2">
                <Button
                  variant={integration.connected ? 'secondary' : 'primary'}
                  size="sm"
                  className="w-full"
                  onClick={() => handleAction(integration)}
                >
                  {integration.id === 'webhooks'
                    ? 'Configure Webhooks'
                    : integration.connected
                    ? 'Manage Connection'
                    : 'Connect Account'}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Connect Modal */}
      <ConnectModal
        integration={selectedIntegration}
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
      />

      {/* Webhook Modal */}
      <WebhookModal
        integration={selectedIntegration}
        isOpen={isWebhookModalOpen}
        onClose={() => setIsWebhookModalOpen(false)}
      />
    </div>
  );
};
