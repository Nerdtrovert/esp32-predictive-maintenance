import React, { useEffect, useState, useRef } from 'react';
import { Sidebar } from '../ui/Sidebar';
import { Navbar } from '../ui/Navbar';
import apiService from '../../services/apiService';
import { AlertTriangle, Zap, CheckCircle2, Info, X } from 'lucide-react';

interface Toast {
  id: number;
  message: string;
  type: 'error' | 'warning' | 'info' | 'success';
}

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const knownIdsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    let active = true;
    let initialLoaded = false;

    const checkAlerts = async () => {
      try {
        const alerts = await apiService.getAlerts();
        if (!active) return;

        const currentIds = alerts.map((a: any) => a.id);

        if (!initialLoaded) {
          knownIdsRef.current = new Set(currentIds);
          initialLoaded = true;
          return;
        }

        const newAlerts = alerts.filter((a: any) => !knownIdsRef.current.has(a.id));
        if (newAlerts.length > 0) {
          newAlerts.forEach((a: any) => {
            const newToast: Toast = { id: a.id, message: a.message, type: a.type };
            setToasts((prev) => [...prev, newToast]);
            setUnreadCount((prev) => prev + 1);

            // Auto-dismiss notification toast after 5 seconds
            setTimeout(() => {
              setToasts((prev) => prev.filter((t) => t.id !== a.id));
            }, 5000);
          });

          // Add newly discovered IDs to the ref to avoid duplicate popups
          currentIds.forEach((id: number) => knownIdsRef.current.add(id));
        }
      } catch (err) {
        console.error('Error checking alerts:', err);
      }
    };

    checkAlerts();
    const interval = setInterval(checkAlerts, 2000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-background text-foreground relative">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar unreadCount={unreadCount} onClearUnread={() => setUnreadCount(0)} />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
        <footer className="h-[60px] flex items-center justify-center text-sm text-muted-foreground border-t border-border">
          <span>Made by <a href="https://github.com/Nerdtrovert" className="underline hover:text-primary" target="_blank" rel="noopener noreferrer">Prajwal Navada G P</a></span>
        </footer>
      </div>

      {/* Slide-in toast notification stack */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="p-4 rounded-lg border border-border shadow-lg flex items-start space-x-3 bg-card text-card-foreground transition-all duration-300 animate-slide-in"
          >
            {toast.type === 'error' && <AlertTriangle className="h-5 w-5 text-industrial-danger flex-shrink-0 mt-0.5" />}
            {toast.type === 'warning' && <Zap className="h-5 w-5 text-industrial-warning flex-shrink-0 mt-0.5" />}
            {toast.type === 'success' && <CheckCircle2 className="h-5 w-5 text-industrial-success flex-shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info className="h-5 w-5 text-industrial-info flex-shrink-0 mt-0.5" />}

            <div className="flex-1">
              <h4 className="font-semibold text-sm capitalize">{toast.type} alert</h4>
              <p className="text-xs text-muted-foreground mt-1">{toast.message}</p>
            </div>

            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
