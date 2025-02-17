import React, { ErrorInfo } from 'react';

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallbackError: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallbackError: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('BarChart error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-2 text-center">
          <p className="mx-auto max-w-sm text-xs text-zinc-500">{this.props.fallbackError}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
