const INTERNAL_HEADER = 'X-SDK-Internal';

class DataReporter {
  constructor(config, eventBus, options = {}) {
    this.config = config;
    this.eventBus = eventBus;
    this.queue = [];
    this.timer = null;
    this.retryCount = {};
    this.unsubscribers = [];
    this.getContext = options.getContext || (() => ({}));
    this.getBreadcrumbs = options.getBreadcrumbs || (() => []);
  }

  init() {
    this.unsubscribers = [
      this.eventBus.on('error:captured', (data) => this.reportError(data)),
      this.eventBus.on('performance:metric', (data) => this.reportPerformance(data)),
      this.eventBus.on('behavior:breadcrumb', (data) => this.reportBehavior(data))
    ];
    this.eventBus.emit('reporter:initialized');
  }

  get endpoint() {
    return `${this.config.serverUrl}${this.config.reporter.endpoint || '/api/report'}`;
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
    return this.dispatchPayload(payload);
  }

  dispatchPayload(payload) {
    const method = this.config.reporter.reportMethod;
    if (method === 'beacon') return this.reportBeacon(payload);
    if (method === 'image') return this.reportImage(payload);
    return this.reportFetch(payload);
  }

  reportFetch(data) {
    if (!window.fetch) return this.reportBeacon(data);
    fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', [INTERNAL_HEADER]: 'true' },
      body: data,
      credentials: 'include',
      keepalive: true
    }).catch((error) => this.handleReportError(data, error));
  }

  reportBeacon(data) {
    if (!window.navigator.sendBeacon) return this.reportImage(data);
    const success = window.navigator.sendBeacon(this.endpoint, new Blob([data], { type: 'application/json' }));
    if (!success) this.reportImage(data);
  }

  reportImage(data) {
    try {
      const img = new Image();
      img.src = `${this.endpoint}?data=${encodeURIComponent(data)}`;
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
      setTimeout(() => this.dispatchPayload(data), this.config.reporter.retryDelay * Math.pow(2, count));
      return;
    }

    delete this.retryCount[key];
    const fallbackChain = ['fetch', 'beacon', 'image'];
    const currentMethodIndex = fallbackChain.indexOf(this.config.reporter.reportMethod);
    const nextMethod = fallbackChain[currentMethodIndex + 1];

    if (nextMethod) {
      this.config.reporter.reportMethod = nextMethod;
      this.retryCount[key] = 0;
      this.dispatchPayload(data);
      this.eventBus.emit('reporter:method:downgraded', { from: fallbackChain[currentMethodIndex], to: nextMethod, error });
      return;
    }

    this.eventBus.emit('reporter:report:failed', { data, error });
  }

  flush() { this.flushQueue(); }

  updateConfig(nextConfig) {
    this.config = nextConfig;
  }

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
