class ErrorCollector {
  constructor(config, eventBus) {
    this.config = config;
    this.eventBus = eventBus;
    this.originalOnerror = null;
    this.originalOnunhandledrejection = null;
    this.resourceErrorHandler = null;
  }

  init() {
    if (!this.config.error.enable) return;
    this.setupGlobalErrorHandler();
    this.setupPromiseRejectionHandler();
    this.setupResourceErrorHandler();
    this.eventBus.emit('collector:error:initialized');
  }

  setupGlobalErrorHandler() {
    if (!this.config.error.captureGlobalErrors) return;
    this.originalOnerror = window.onerror;

    window.onerror = (message, source, lineno, colno, error) => {
      if (typeof message === 'string' && message.startsWith('Script error')) {
        return this.originalOnerror?.(message, source, lineno, colno, error);
      }

      this.handleError({
        type: 'js',
        message: message?.toString() || 'Unknown error',
        source,
        lineno,
        colno,
        stack: error?.stack,
        error
      });

      return this.originalOnerror?.(message, source, lineno, colno, error);
    };
  }

  setupPromiseRejectionHandler() {
    if (!this.config.error.capturePromiseRejections) return;
    this.originalOnunhandledrejection = window.onunhandledrejection;

    window.onunhandledrejection = (event) => {
      const reason = event.reason;
      this.handleError({
        type: 'promise',
        message: reason?.message || 'Unhandled promise rejection',
        stack: reason?.stack,
        reason,
        promise: event.promise
      });
      return this.originalOnunhandledrejection?.(event);
    };
  }

  setupResourceErrorHandler() {
    if (!this.config.error.captureResourceErrors) return;
    this.resourceErrorHandler = (event) => {
      const target = event.target;
      if (target && ['SCRIPT', 'LINK', 'IMG'].includes(target.tagName)) {
        this.handleError({
          type: 'resource',
          tagName: target.tagName,
          url: target.src || target.href,
          outerHTML: target.outerHTML
        });
      }
    };
    window.addEventListener('error', this.resourceErrorHandler, true);
  }

  handleError(errorData) {
    this.eventBus.emit('error:captured', {
      ...errorData,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      language: navigator.language
    });
  }

  destroy() {
    if (this.originalOnerror) window.onerror = this.originalOnerror;
    if (this.originalOnunhandledrejection) window.onunhandledrejection = this.originalOnunhandledrejection;
    if (this.resourceErrorHandler) window.removeEventListener('error', this.resourceErrorHandler, true);
    this.eventBus.emit('collector:error:destroyed');
  }
}

export default ErrorCollector;
