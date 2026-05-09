'use client';

import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <span className="text-4xl mb-3">⚠️</span>
            <h2 className="text-lg font-bold text-gray-800 mb-1">Something went wrong</h2>
            <p className="text-sm text-gray-500 text-center mb-4">
              We encountered an unexpected error. Please try again.
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold"
            >
              Try Again
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
