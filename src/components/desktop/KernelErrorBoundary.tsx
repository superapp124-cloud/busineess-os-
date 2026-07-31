import React, { Component, ErrorInfo, ReactNode } from 'react';
import { kernelAPI } from '@/core/runtime/KernelAPI';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class KernelErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[KernelErrorBoundary] Caught error:', error, errorInfo);
    
    const message = error.message || '';
    const isChunkLoadError = 
      message.includes('Failed to fetch dynamically imported module') ||
      message.includes('Importing a module script failed') ||
      message.includes('Loading chunk');

    if (isChunkLoadError) {
      const pageKey = 'chatr_chunk_reload_timestamp';
      const lastReload = sessionStorage.getItem(pageKey);
      const now = Date.now();

      // Auto-reload once to fetch fresh Vercel deployment assets
      if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
        sessionStorage.setItem(pageKey, now.toString());
        console.warn('[KernelErrorBoundary] Stale chunk detected after deployment. Auto-reloading page...');
        window.location.reload();
        return;
      }
    }

    // Pipe the UI crash directly into the Kernel's event stream
    try {
      kernelAPI.events.publish('UI_CRASH_DETECTED', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      }, { priority: 'critical' });
    } catch (e) {
      console.error('[KernelErrorBoundary] Failed to log crash event:', e);
    }
  }

  private handleRecover = () => {
    // Hard reload to refresh Vercel deployment bundles
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      const isChunkError = this.state.error?.message?.includes('Failed to fetch dynamically imported module');

      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-slate-200 p-6">
          <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-8 h-8 text-rose-500" />
          </div>
          <h1 className="text-xl font-bold mb-2">
            {isChunkError ? 'New Deployment Available' : 'UI Render Exception'}
          </h1>
          <p className="text-slate-400 mb-6 max-w-md text-center text-sm">
            {isChunkError 
              ? 'A new version of CHATR was deployed. Reloading the interface will update your app with the latest features.'
              : 'A critical error occurred in the view layer. The Kernel is still running and has isolated the crash.'}
          </p>
          <div className="bg-slate-800 p-4 rounded-lg w-full max-w-2xl mb-8 overflow-auto border border-slate-700 font-mono text-xs text-rose-300">
            {this.state.error?.message}
          </div>
          <button 
            onClick={this.handleRecover}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 transition-colors rounded-full font-bold text-sm shadow-lg shadow-indigo-900/20"
          >
            <RefreshCw className="w-4 h-4" />
            Reload Interface
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
