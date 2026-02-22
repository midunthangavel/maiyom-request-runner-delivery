import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    private handleGoHome = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = "/";
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-6">
                        <AlertTriangle className="w-8 h-8" />
                    </div>

                    <h1 className="text-2xl font-display font-bold text-foreground mb-2">
                        Something went wrong
                    </h1>

                    <p className="text-muted-foreground mb-8 max-w-md">
                        We apologize for the inconvenience. An unexpected error has occurred.
                        Our team has been notified.
                    </p>

                    <div className="p-4 bg-muted/50 rounded-lg text-left w-full max-w-md mb-8 overflow-auto border border-border">
                        <p className="text-xs font-mono text-muted-foreground break-all">
                            {this.state.error?.message || "Unknown error"}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                        <button
                            onClick={this.handleReset}
                            className="flex-1 py-3 px-4 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Try Again
                        </button>

                        <button
                            onClick={this.handleGoHome}
                            className="flex-1 py-3 px-4 rounded-xl bg-card border border-border text-foreground font-semibold flex items-center justify-center gap-2 hover:bg-muted transition-colors"
                        >
                            <Home className="w-4 h-4" />
                            Go Home
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
