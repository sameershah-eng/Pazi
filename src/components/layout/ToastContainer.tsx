import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useAppStore } from '../../store/AppContext';

export const ToastContainer: React.FC = () => {
  const { state, dispatch } = useAppStore();

  useEffect(() => {
    if (state.toasts.length > 0) {
      const latest = state.toasts[state.toasts.length - 1];
      const timer = setTimeout(() => {
        dispatch({ type: 'REMOVE_TOAST', payload: latest.id });
      }, 4200);
      return () => clearTimeout(timer);
    }
  }, [state.toasts, dispatch]);

  if (state.toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {state.toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-4 h-4 text-[#0FB5A6] flex-shrink-0" />,
          error: <AlertCircle className="w-4 h-4 text-[#DC2626] flex-shrink-0" />,
          info: <Info className="w-4 h-4 text-[#FF7A59] flex-shrink-0" />,
        };

        return (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto flex items-start gap-3 p-3.5 bg-white rounded-[12px] border border-[#ECE7E1] shadow-[0_8px_24px_rgba(28,25,23,0.12)] animate-in slide-in-from-bottom-2 fade-in"
          >
            {icons[toast.type]}
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-[#1C1917] tracking-tight">{toast.title}</h4>
              {toast.message && (
                <p className="mt-0.5 text-[11px] text-[#78716C] leading-snug break-words">
                  {toast.message}
                </p>
              )}
            </div>
            <button
              onClick={() => dispatch({ type: 'REMOVE_TOAST', payload: toast.id })}
              className="p-1 text-[#A8A29E] hover:text-[#1C1917] rounded transition-colors"
              aria-label="Dismiss toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
