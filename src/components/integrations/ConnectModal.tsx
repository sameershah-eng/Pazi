import React, { useState } from 'react';
import { Integration } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useAppStore } from '../../store/AppContext';
import { Check, ShieldCheck, Lock, ExternalLink, Loader2 } from 'lucide-react';

interface ConnectModalProps {
  integration: Integration | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ConnectModal: React.FC<ConnectModalProps> = ({
  integration,
  isOpen,
  onClose,
}) => {
  const { dispatch } = useAppStore();
  const [accountName, setAccountName] = useState('');
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  if (!integration) return null;

  const handleAuthorize = () => {
    setIsAuthorizing(true);
    setTimeout(() => {
      setIsAuthorizing(false);
      dispatch({
        type: 'CONNECT_INTEGRATION',
        payload: {
          id: integration.id,
          accountName: accountName.trim() || `${integration.name} Workspace (${integration.category})`,
        },
      });
      onClose();
    }, 1200);
  };

  const handleDisconnect = () => {
    dispatch({ type: 'DISCONNECT_INTEGRATION', payload: integration.id });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={integration.connected ? `Manage ${integration.name}` : `Connect ${integration.name}`}
      description={
        integration.connected
          ? 'Review authorized OAuth permissions and connection status.'
          : 'Authorize Pazi agents to access and invoke actions on your behalf.'
      }
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Integration Header Card */}
        <div className="p-3.5 bg-[#FAF8F5] rounded-[12px] border border-[#ECE7E1] flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-[#1C1917]">{integration.name}</h4>
            <p className="text-xs text-[#78716C] mt-0.5">{integration.description}</p>
          </div>
          <span
            className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
              integration.connected
                ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]'
                : 'bg-white text-[#78716C] border-[#ECE7E1]'
            }`}
          >
            {integration.connected ? 'Connected' : 'Not Connected'}
          </span>
        </div>

        {/* Account name input */}
        {!integration.connected && (
          <div>
            <label className="block text-xs font-bold text-[#1C1917] mb-1">
              Account / Organization Label (Optional)
            </label>
            <input
              type="text"
              placeholder={`e.g. Acme Corp ${integration.name}`}
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-[#ECE7E1] rounded-[10px] focus:outline-none focus:border-[#FF7A59]"
            />
          </div>
        )}

        {/* Scopes & Permissions List */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#A8A29E] mb-2 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#FF7A59]" />
            Requested OAuth Permissions
          </h4>
          <div className="space-y-1.5 bg-white border border-[#ECE7E1] rounded-[10px] p-2.5">
            {integration.scopes.map((scope) => (
              <div key={scope} className="flex items-center gap-2 text-xs text-[#57534E]">
                <Check className="w-3.5 h-3.5 text-[#0FB5A6] flex-shrink-0" />
                <span className="font-mono text-[11px]">{scope}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 bg-[#FAF8F5] rounded-[10px] border border-[#ECE7E1] flex items-center gap-2.5 text-xs text-[#78716C]">
          <ShieldCheck className="w-4 h-4 text-[#0FB5A6] flex-shrink-0" />
          <span>Tokens are encrypted with AES-256 and never shared externally.</span>
        </div>

        {/* Footer buttons */}
        <div className="pt-3 border-t border-[#ECE7E1] flex items-center justify-between">
          {integration.connected ? (
            <>
              <Button variant="danger" size="sm" onClick={handleDisconnect}>
                Disconnect
              </Button>
              <Button variant="secondary" size="sm" onClick={onClose}>
                Close
              </Button>
            </>
          ) : (
            <div className="flex items-center justify-end gap-2 w-full">
              <Button variant="secondary" size="md" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                isLoading={isAuthorizing}
                onClick={handleAuthorize}
              >
                Authorize & Connect
              </Button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
