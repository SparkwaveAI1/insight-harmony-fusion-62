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

  static isChunkLoadError(error: Error): boolean {
    const msg = error?.message || "";
    return (
      msg.includes("Failed to fetch dynamically imported module") ||
      msg.includes("Importing a module script failed") ||
      msg.includes("error loading dynamically imported module") ||
      msg.includes("Unable to preload CSS") ||
      (error?.name === "ChunkLoadError")
    );
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error?.message, info?.componentStack?.split('\n').slice(0, 5).join('\n'));

    // Auto-reload on chunk load errors — caused by stale HTML after a deploy
    if (ErrorBoundary.isChunkLoadError(error)) {
      console.warn("[ErrorBoundary] Chunk load error detected — reloading to pick up new assets");
      // Small delay so the reload doesn't feel like an instant flash
      setTimeout(() => window.location.reload(), 300);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      const isChunkError = this.state.error ? ErrorBoundary.isChunkLoadError(this.state.error) : false;

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            {isChunkError ? "Updating app…" : "Something went wrong"}
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            {isChunkError
              ? "A new version was just deployed. Reloading automatically…"
              : "An unexpected error occurred. Try refreshing the page or go back."}
          </p>
          {!isChunkError && (
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => window.location.reload()}>
                Refresh page
              </Button>
              <Button onClick={this.handleReset}>
                Try again
              </Button>
            </div>
          )}
          {this.state.error && !isChunkError && (
            <pre className="mt-6 text-left text-xs text-muted-foreground bg-muted p-4 rounded max-w-xl overflow-auto">
              {this.state.error.message}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
