import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  onReset?: () => void;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by FreshRoute ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    if (this.props.onReset) {
      this.props.onReset();
    }
    this.setState({ hasError: false, error: null });
  };

  private handleFullRefresh = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[380px] w-full flex items-center justify-center p-6 bg-[#f8faf7]">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xl space-y-5 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shadow-xs">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg sm:text-xl font-extrabold text-stone-900 tracking-tight">
                {this.props.fallbackTitle || 'Temporary View Interruption'}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                {this.props.fallbackMessage ||
                  'A minor interface error occurred while rendering this section. Your data is secure in local storage.'}
              </p>
            </div>

            {this.state.error && (
              <div className="text-left bg-stone-50 border border-stone-200 rounded-xl p-3 text-[11px] font-mono text-stone-600 max-h-24 overflow-y-auto break-all">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B3D2E] text-white text-xs font-bold hover:bg-[#062016] transition-all shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Component
              </button>

              <button
                type="button"
                onClick={this.handleFullRefresh}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-700 text-xs font-bold hover:bg-stone-50 transition-all shadow-xs"
              >
                Reload Portal
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
