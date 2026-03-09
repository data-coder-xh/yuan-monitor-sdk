let webVitals = null;

async function loadWebVitals() {
  try {
    webVitals = await import('web-vitals');
  } catch (error) {
    webVitals = null;
  }
}

class PerformanceCollector {
  constructor(config, eventBus) {
    this.config = config;
    this.eventBus = eventBus;
    this.resourceObserver = null;
    this.memoryInterval = null;
  }

  init() {
    if (!this.config.performance.enable) return;
    if (this.config.performance.captureWebVitals) this.setupWebVitalsCollector();
    if (this.config.performance.captureResourceTiming) this.setupResourceTimingCollector();
    if (this.config.performance.captureMemory) this.setupMemoryCollector();
    this.eventBus.emit('collector:performance:initialized');
  }

  setupWebVitalsCollector() {
    const register = () => {
      if (!webVitals) return;
      const handle = (metric) => this.eventBus.emit('performance:metric', {
        type: 'web-vital',
        name: metric.name,
        value: metric.value,
        timestamp: Date.now()
      });
      ['onCLS', 'onFCP', 'onFID', 'onLCP', 'onTTFB'].forEach((fn) => webVitals[fn]?.(handle));
    };

    if (webVitals) register();
    else loadWebVitals().then(register);
  }

  setupResourceTimingCollector() {
    if (!window.PerformanceObserver) return;
    this.resourceObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (['fetch', 'xmlhttprequest', 'beacon'].includes(entry.initiatorType)) return;
        this.eventBus.emit('performance:metric', {
          type: 'resource',
          name: entry.name,
          duration: entry.duration,
          startTime: entry.startTime,
          timestamp: Date.now()
        });
      });
    });
    this.resourceObserver.observe({ entryTypes: ['resource'] });
  }

  setupMemoryCollector() {
    if (!performance.memory) return;
    this.memoryInterval = setInterval(() => {
      this.eventBus.emit('performance:metric', {
        type: 'memory',
        value: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        timestamp: Date.now()
      });
    }, 15000);
  }


  updateConfig(nextConfig) {
    this.config = nextConfig;
  }

  destroy() {
    if (this.resourceObserver) this.resourceObserver.disconnect();
    if (this.memoryInterval) clearInterval(this.memoryInterval);
    this.eventBus.emit('collector:performance:destroyed');
  }
}

export default PerformanceCollector;
