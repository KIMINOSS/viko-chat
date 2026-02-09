import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4">
          <p className="text-sm text-gray-500">Something went wrong</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-xl bg-indigo-500 px-6 py-2.5 text-sm font-medium text-white"
          >
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
