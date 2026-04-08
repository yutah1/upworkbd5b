import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let isPermissionError = false;
      try {
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error && parsed.error.includes('Missing or insufficient permissions')) {
            isPermissionError = true;
          }
        }
      } catch (e) {
        if (this.state.error?.message.includes('Missing or insufficient permissions')) {
          isPermissionError = true;
        }
      }

      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-red-100">
            <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {isPermissionError ? 'Permission Denied' : 'Something went wrong'}
            </h1>
            <p className="text-gray-600 mb-6">
              {isPermissionError 
                ? 'You do not have permission to access this data. Please ensure your Firebase Security Rules are correctly configured and deployed.'
                : 'An unexpected error occurred in the application.'}
            </p>
            <button
              className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition"
              onClick={() => window.location.href = '/'}
            >
              Return Home
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
