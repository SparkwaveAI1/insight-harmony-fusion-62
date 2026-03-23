import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error?.message, info?.componentStack?.split('\n').slice(0, 5).join('\n'));
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            An unexpected error occurred. Try refreshing the page or go back.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Refresh page
            </Button>
            <Button onClick={this.handleReset}>
              Try again
            </Button>
          </div>
          {this.state.error && (
            <pre className="mt-6 text-left text-xs text-red-600 bg-red-50 border border-red-200 p-4 rounded max-w-xl overflow-auto whitespace-pre-wrap">
              {this.state.error.message}
              {"\n\n"}
              {this.state.error.stack?.split('\n').slice(0, 8).join('\n')}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
