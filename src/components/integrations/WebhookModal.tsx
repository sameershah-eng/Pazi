import React, { useState } from 'react';
import { Integration } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useAppStore } from '../../store/AppContext';
import { Send, CheckCircle2, Copy, Check, Terminal, ExternalLink } from 'lucide-react';
import { formatRelativeTime } from '../../lib/cronUtils';

interface WebhookModalProps {
  integration: Integration | null;
  isOpen: boolean;
  onClose: () => void;
}

export const WebhookModal: React.FC<WebhookModalProps> = ({
  integration,
  isOpen,
  onClose,
}) => {
  const { state, dispatch } = useAppStore();
  const [url, setUrl] = useState(integration?.webhookUrl || 'https://api.acme.inc/v1/pazi-events');
  const [isSending, setIsSending] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  if (!integration) return null;

  const handleSaveUrl = () => {
    dispatch({ type: 'UPDATE_WEBHOOK_URL', payload: url.trim() });
  };

  const handleSendTest = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      dispatch({
        type: 'ADD_WEBHOOK_TEST_EVENT',
        payload: {
          event: 'agent.task.test_ping',
          status: 200,
          payloadSummary: `Delivered test ping to ${url.replace('https://', '')} (Response 200 OK, latency 82ms)`,
        },
      });
    }, 850);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Custom Webhooks & Delivery Logs"
      description="Stream outbound task completions and agent events to your internal HTTP endpoints."
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Endpoint URL form */}
        <div>
          <label className="block text-xs font-bold text-[#1C1917] mb-1">
            Destination Endpoint URL
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.yourcompany.com/webhooks"
              className="flex-1 px-3.5 py-2 text-xs font-mono bg-white border border-[#ECE7E1] rounded-[10px] focus:outline-none focus:border-[#FF7A59]"
            />
            <Button variant="secondary" size="sm" onClick={handleSaveUrl}>
              Save URL
            </Button>
          </div>
        </div>

        {/* Secret HMAC Key */}
        <div className="p-3 bg-[#FAF8F5] rounded-[10px] border border-[#ECE7E1] flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-[#1C1917]">Signing Secret (HMAC-SHA256)</span>
            <p className="text-[11px] font-mono text-[#78716C] mt-0.5">
              whsec_908f23ba8e9942a1bc34e6a88dfb2019
            </p>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText('whsec_908f23ba8e9942a1bc34e6a88dfb2019');
              setCopiedSecret(true);
              setTimeout(() => setCopiedSecret(false), 2000);
            }}
            className="p-1.5 text-[#78716C] hover:text-[#1C1917] rounded"
          >
            {copiedSecret ? <Check className="w-4 h-4 text-[#0FB5A6]" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* Send Test Webhook */}
        <div className="flex items-center justify-between p-3.5 bg-white rounded-[10px] border border-[#ECE7E1]">
          <div>
            <h4 className="text-xs font-bold text-[#1C1917]">Verify Endpoint Connectivity</h4>
            <p className="text-[11px] text-[#78716C] mt-0.5">
              Dispatches a sample ping payload signed with your HMAC secret.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            isLoading={isSending}
            leftIcon={<Send className="w-3.5 h-3.5" />}
            onClick={handleSendTest}
          >
            Send Test Ping
          </Button>
        </div>

        {/* Test Delivery Log */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#A8A29E] mb-2 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5" />
            Recent Webhook Deliveries
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {integration.webhookEvents && integration.webhookEvents.length > 0 ? (
              integration.webhookEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="p-2.5 rounded-[8px] border border-[#ECE7E1] bg-[#FAF8F5] text-xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="px-2 py-0.5 rounded-full bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0] font-mono text-[10px] font-bold">
                      {ev.status} OK
                    </span>
                    <span className="font-mono text-[11px] text-[#1C1917] font-semibold truncate">
                      {ev.event}
                    </span>
                    <span className="text-[11px] text-[#78716C] hidden sm:inline truncate">
                      {ev.payloadSummary}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#A8A29E] flex-shrink-0">
                    {formatRelativeTime(ev.timestamp)}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-[#78716C] border border-dashed border-[#D8D2C9] rounded-[8px]">
                No delivery attempts recorded yet. Click "Send Test Ping" above.
              </div>
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-[#ECE7E1] flex justify-end">
          <Button variant="secondary" size="md" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
