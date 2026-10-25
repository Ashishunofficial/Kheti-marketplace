import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught Error in Component Tree:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="my-6 p-6 bg-amber-50 border border-amber-200 rounded-2xl max-w-2xl mx-auto shadow-xs text-stone-900">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-2 flex-1">
              <h3 className="text-base font-bold text-stone-900">
                कुछ क्षणिक समस्या आई (Unexpected UI Error)
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                घबराएं नहीं, आपकी जानकारी सुरक्षित है। कृपया नीचे दिए गए बटन से पुनः प्रयास करें।
              </p>
              {this.state.error && (
                <div className="p-2 bg-stone-100/80 rounded border border-stone-200 text-[11px] font-mono text-stone-700 overflow-x-auto max-h-24">
                  {this.state.error.message}
                </div>
              )}
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={this.handleReset}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>पुनः लोड करें (Try Again)</span>
                </button>
                <button
                  onClick={() => {
                    this.handleReset();
                    window.location.href = '/';
                  }}
                  className="px-4 py-2 bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>मुख्य पृष्ठ (Home)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
