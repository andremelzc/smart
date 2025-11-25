"use client";

import React from "react";

type State = { hasError: boolean; error?: Error | null; info?: React.ErrorInfo | null };

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary captured error:", error, info);
    this.setState({ error, info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center">
          <h3 className="mb-2 text-lg font-semibold text-red-600">Hubo un error al renderizar este componente</h3>
          <p className="mb-4 text-sm text-gray-600">Revisa la consola del navegador o el terminal para más detalles.</p>
          <details className="mx-auto max-w-xl text-left whitespace-pre-wrap text-xs text-gray-700">
            {String(this.state.error && this.state.error.stack)}
          </details>
        </div>
      );
    }

    return this.props.children as React.ReactElement;
  }
}

export default ErrorBoundary;
