import React from 'react';

const createErrorBoundary = (eventBus) => {
  if (!React || !React.Component) {
    throw new Error('React is required for ErrorBoundary');
  }

  const { Component } = React;

  class ErrorBoundary extends Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
      this.setState({ errorInfo });
      eventBus.emit('error:captured', {
        type: 'react',
        message: error?.message || 'Unknown React error',
        componentStack: errorInfo?.componentStack,
        stack: error?.stack,
        error
      });

      if (this.props.onError) this.props.onError(error, errorInfo);
    }

    render() {
      if (!this.state.hasError) return this.props.children;
      if (this.props.fallback) {
        return typeof this.props.fallback === 'function'
          ? this.props.fallback(this.state.error, this.state.errorInfo)
          : this.props.fallback;
      }
      return React.createElement('div', null, 'Something went wrong.');
    }
  }

  return ErrorBoundary;
};

class ReactIntegration {
  constructor(config, eventBus) {
    this.config = config;
    this.ErrorBoundary = null;
    this.eventBus = eventBus;
  }

  init() {
    try {
      this.ErrorBoundary = createErrorBoundary(this.eventBus);
    } catch (error) {
      console.warn('Failed to create ErrorBoundary:', error);
    }

    this.eventBus.emit('framework:react:integrated');
    return { ErrorBoundary: this.ErrorBoundary };
  }


  updateConfig(nextConfig) {
    this.config = nextConfig;
  }

  getErrorBoundary() {
    if (!this.ErrorBoundary) this.ErrorBoundary = createErrorBoundary(this.eventBus);
    return this.ErrorBoundary;
  }

  wrapApp(AppComponent) {
    if (!AppComponent) return AppComponent;
    const ErrorBoundary = this.getErrorBoundary();
    if (!ErrorBoundary) return AppComponent;
    const { Component, createElement } = React;

    return class WrappedApp extends Component {
      render() {
        return createElement(ErrorBoundary, null, createElement(AppComponent, this.props));
      }
    };
  }
}

export default ReactIntegration;
