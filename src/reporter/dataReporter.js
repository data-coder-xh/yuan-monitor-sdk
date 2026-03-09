class DataReporter {
  constructor(config, eventBus, options = {}) {
    this.config = config;
    this.eventBus = eventBus;
    this.getContext = options.getContext || (() => ({}));
    this.getBreadcrumbs = options.getBreadcrumbs || (() => []);
    this.queue = [];
    this.timer = null;
    this.retryCount = {};
    this.unsubscribers = [];

    this.onError = this.reportError.bind(this);
    this.onPerformance = this.reportPerformance.bind(this);
    this.onBehavior = this.reportBehavior.bind(this);
  }

  init() {
    this.unsubscribers.push(this.eventBus.on('error:captured', this.onError));
    this.unsubscribers.push(this.eventBus.on('performance:metric', this.onPerformance));
    this.unsubscribers.push(this.eventBus.on('behavior:breadcrumb', this.onBehavior));
    this.eventBus.emit('reporter:initialized');
  }

  addToQueue(data) {
    if (!data || !this.config.serverUrl) return;
    this.queue.push(data);
    if (this.queue.length >= this.config.reporter.maxQueueSize || this.queue.length >= this.config.reporter.batchSize) {
      this.flushQueue();
      return;
    }
    if (!this.timer) this.timer = setTimeout(() => this.flushQueue(), this.config.reporter.batchInterval);
  }

  flushQueue() {
    if (!this.queue.length) return;
    const batchData = [...this.queue];
    this.queue = [];
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.report(batchData);
  }

  reportError(errorData) {
    this.addToQueue({ type: 'error', subType: errorData.type, timestamp: Date.now(), ...errorData, breadcrumbs: this.getBreadcrumbs() });
  }

  reportPerformance(performanceData) {
    this.addToQueue({ type: 'performance', subType: performanceData.type, timestamp: Date.now(), ...performanceData });
  }

  reportBehavior(behaviorData) {
    if (!this.config.behavior.enable) return;
    this.addToQueue({ type: 'behavior', subType: behaviorData.type, timestamp: Date.now(), ...behaviorData });
  }

  report(data) {
    const ctx = this.getContext();
    const payload = JSON.stringify({
      ...ctx,
      data,
      timestamp: Date.now()
    });

    if (this.config.reporter.reportMethod === 'beacon') return this.reportBeacon(payload);
    if (this.config.reporter.reportMethod === 'image') return this.reportImage(payload);
    return this.reportFetch(payload);
  }

  reportFetch(data) {
    if (!window.fetch) return this.reportImage(data);
    fetch(`${this.config.serverUrl}/api/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-SDK-Internal': 'true' },
      body: data,
      credentials: 'include'
    }).catch((error) => this.handleReportError(data, error));
  }

  reportBeacon(data) {
    if (!window.navigator.sendBeacon) return this.reportFetch(data);
    const success = window.navigator.sendBeacon(`${this.config.serverUrl}/api/report`, new Blob([data], { type: 'application/json' }));
    if (!success) this.reportFetch(data);
  }

  reportImage(data) {
    try {
      const img = new Image();
      img.src = `${this.config.serverUrl}/api/report?data=${encodeURIComponent(data)}`;
      img.onerror = () => this.handleReportError(data, new Error('Image beacon failed'));
    } catch (error) {
      this.handleReportError(data, error);
    }
  }

  handleReportError(data, error) {
    const key = String(data);
    const count = this.retryCount[key] || 0;
    if (count < this.config.reporter.retryCount) {
      this.retryCount[key] = count + 1;
      setTimeout(() => this.report(data), this.config.reporter.retryDelay * Math.pow(2, count));
    } else {
      delete this.retryCount[key];
      this.eventBus.emit('reporter:report:failed', { data, error });
    }
  }

  flush() { this.flushQueue(); }

  destroy() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.flushQueue();
    this.unsubscribers.forEach((off) => off());
    this.unsubscribers = [];
    this.eventBus.emit('reporter:destroyed');
  }
}

export default DataReporter;
