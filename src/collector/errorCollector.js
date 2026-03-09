class ErrorCollector {
  constructor(config, eventBus) {
    this.config = config;
    this.eventBus = eventBus;
    this.originalOnerror = null;
    this.originalOnunhandledrejection = null;
    this.resourceErrorHandler = null;
    this.dedupeMap = new Map();
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
        message: reason?.message || String(reason) || 'Unhandled promise rejection',
        stack: reason?.stack,
        source: reason?.fileName,
        lineno: reason?.lineNumber,
        colno: reason?.columnNumber,
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
      if (target && ['SCRIPT', 'LINK', 'IMG', 'VIDEO', 'AUDIO'].includes(target.tagName)) {
        this.handleError({
          type: 'resource',
          tagName: target.tagName,
          message: `${target.tagName} resource failed to load`,
          source: target.src || target.href,
          url: target.src || target.href,
          outerHTML: target.outerHTML
        });
      }
    };
    window.addEventListener('error', this.resourceErrorHandler, true);
  }

  _dedupeKey(errorData) {
    const stackLine = String(errorData.stack || '').split('\n')[0];
    return [
      errorData.type,
      errorData.message,
      errorData.source,
      errorData.lineno,
      errorData.colno,
      stackLine
    ].join('|');
  }

  _isDuplicate(errorData) {
    const dedupeWindow = this.config.error.dedupeWindow || 5000;
    if (dedupeWindow <= 0) return false;
    const key = this._dedupeKey(errorData);
    const now = Date.now();
    const last = this.dedupeMap.get(key);
    this.dedupeMap.set(key, now);

    if (this.dedupeMap.size > 200) {
      const threshold = now - dedupeWindow;
      this.dedupeMap.forEach((timestamp, dedupeKey) => {
        if (timestamp < threshold) this.dedupeMap.delete(dedupeKey);
      });
    }

    return typeof last === 'number' && now - last < dedupeWindow;
  }

  async _resolveSourceMap(errorPayload) {
    const resolver = this.config.error.sourceMapResolver;
    if (typeof resolver !== 'function') return errorPayload;

    try {
      const mapped = await resolver({ ...errorPayload });
      if (mapped && typeof mapped === 'object') {
        return {
          ...errorPayload,
          mappedStack: mapped.mappedStack || mapped.stack,
          mappedSource: mapped.source,
          mappedLineno: mapped.lineno,
          mappedColno: mapped.colno
        };
      }
      return errorPayload;
    } catch (_) {
      return errorPayload;
    }
  }

  handleError(errorData) {
    const payload = {
      ...errorData,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      language: navigator.language
    };

    if (this._isDuplicate(payload)) {
      this.eventBus.emit('error:deduplicated', payload);
      return;
    }

    Promise.resolve(this._resolveSourceMap(payload)).then((resolvedPayload) => {
      this.eventBus.emit('error:captured', resolvedPayload);
    });
  }

  updateConfig(nextConfig) {
    this.config = nextConfig;
  }

  destroy() {
    if (this.originalOnerror) window.onerror = this.originalOnerror;
    if (this.originalOnunhandledrejection) window.onunhandledrejection = this.originalOnunhandledrejection;
    if (this.resourceErrorHandler) window.removeEventListener('error', this.resourceErrorHandler, true);
    this.dedupeMap.clear();
    this.eventBus.emit('collector:error:destroyed');
  }
}

export default ErrorCollector;
