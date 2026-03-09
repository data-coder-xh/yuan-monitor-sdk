const INTERNAL_HEADER = 'X-SDK-Internal';

function hasInternalHeader(headers) {
  if (!headers) return false;
  if (headers instanceof Headers) return headers.get(INTERNAL_HEADER) === 'true';
  if (Array.isArray(headers)) {
    return headers.some(([key, value]) => String(key).toLowerCase() === INTERNAL_HEADER.toLowerCase() && String(value) === 'true');
  }
  return Object.keys(headers).some((key) => key.toLowerCase() === INTERNAL_HEADER.toLowerCase() && String(headers[key]) === 'true');
}

class BehaviorCollector {
  constructor(config, eventBus) {
    this.config = config;
    this.eventBus = eventBus;
    this.breadcrumbs = [];
    this.lastHref = document.location.href;
    this.originalFetch = null;
    this.originalXHROpen = null;
    this.originalXHRSend = null;
    this.originalXHRSetRequestHeader = null;
    this.originalConsole = {};
  }

  init() {
    if (!this.config.behavior.enable) return;
    if (this.config.behavior.captureClicks) this.setupClickHandler();
    if (this.config.behavior.captureRouteChanges) this.setupRouteChangeHandler();
    if (this.config.behavior.captureNetworkRequests) this.setupNetworkRequestHandler();
    if (this.config.behavior.captureConsole) this.setupConsoleHandler();
    this.eventBus.emit('collector:behavior:initialized');
  }

  addBreadcrumb(type, data) {
    const breadcrumb = { type, timestamp: Date.now(), ...data };
    this.breadcrumbs.push(breadcrumb);
    if (this.breadcrumbs.length > this.config.behavior.maxBreadcrumbs) this.breadcrumbs.shift();
    this.eventBus.emit('behavior:breadcrumb', breadcrumb);
    return breadcrumb;
  }

  getBreadcrumbs() { return [...this.breadcrumbs]; }
  clearBreadcrumbs() { this.breadcrumbs = []; this.eventBus.emit('behavior:breadcrumbs:cleared'); }

  setupClickHandler() {
    this._clickHandler = (event) => {
      const target = event.target;
      if (!target || target.tagName === 'BODY') return;
      this.addBreadcrumb('click', {
        tagName: target.tagName?.toLowerCase(),
        id: target.id,
        className: target.className,
        text: target.textContent?.trim().slice(0, 100),
        x: event.clientX,
        y: event.clientY
      });
    };
    document.addEventListener('click', this._clickHandler, true);
  }

  setupRouteChangeHandler() {
    this.originalPushState = history.pushState;
    this.originalReplaceState = history.replaceState;
    const handleRouteChange = (method, args) => {
      const url = args[2];
      if (!url) return;
      const from = this.lastHref;
      const to = String(url);
      this.lastHref = to;
      this.addBreadcrumb('route', { method, from, to });
    };
    history.pushState = (...args) => { handleRouteChange('pushState', args); return this.originalPushState.apply(history, args); };
    history.replaceState = (...args) => { handleRouteChange('replaceState', args); return this.originalReplaceState.apply(history, args); };
    this._popStateHandler = () => {
      const from = this.lastHref;
      const to = location.href;
      this.lastHref = to;
      this.addBreadcrumb('route', { method: 'popstate', from, to });
    };
    window.addEventListener('popstate', this._popStateHandler);
  }

  setupNetworkRequestHandler() {
    this.setupXHRHandler();
    this.setupFetchHandler();
  }

  setupXHRHandler() {
    if (!window.XMLHttpRequest) return;
    this.originalXHROpen = XMLHttpRequest.prototype.open;
    this.originalXHRSend = XMLHttpRequest.prototype.send;
    this.originalXHRSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
    const collector = this;
    XMLHttpRequest.prototype.open = function(method, url, ...args) {
      this._monitor = { method: method.toUpperCase(), url: String(url), startTime: Date.now(), internal: false };
      return collector.originalXHROpen.apply(this, [method, url, ...args]);
    };
    XMLHttpRequest.prototype.setRequestHeader = new Proxy(this.originalXHRSetRequestHeader, {
      apply(target, thisArg, argArray) {
        const [name, value] = argArray;
        if (String(name).toLowerCase() === INTERNAL_HEADER.toLowerCase() && String(value) === 'true' && thisArg._monitor) {
          thisArg._monitor.internal = true;
        }
        return Reflect.apply(target, thisArg, argArray);
      }
    });

    XMLHttpRequest.prototype.send = function(body, ...args) {
      if (this._monitor?.internal || this._monitor?.url?.includes('/api/report')) {
        return collector.originalXHRSend.apply(this, [body, ...args]);
      }
      if (this._monitor) {
        const done = () => collector.addBreadcrumb('xhr', {
          ...this._monitor,
          endTime: Date.now(),
          elapsedTime: Date.now() - this._monitor.startTime,
          status: this.status
        });
        this.addEventListener('load', done);
        this.addEventListener('error', done);
        this.addEventListener('abort', done);
      }
      return collector.originalXHRSend.apply(this, [body, ...args]);
    };
  }

  setupFetchHandler() {
    if (!window.fetch) return;
    this.originalFetch = window.fetch;
    window.fetch = async (url, config = {}) => {
      if (hasInternalHeader(config?.headers) || String(url).includes('/api/report')) return this.originalFetch(url, config);
      const startTime = Date.now();
      try {
        const response = await this.originalFetch(url, config);
        this.addBreadcrumb('fetch', { method: (config.method || 'GET').toUpperCase(), url: String(url), status: response.status, elapsedTime: Date.now() - startTime });
        return response;
      } catch (error) {
        this.addBreadcrumb('fetch', { method: (config.method || 'GET').toUpperCase(), url: String(url), elapsedTime: Date.now() - startTime, error: true });
        throw error;
      }
    };
  }

  setupConsoleHandler() {
    ['log', 'info', 'warn', 'error', 'debug'].forEach((method) => {
      if (typeof console[method] !== 'function') return;
      this.originalConsole[method] = console[method];
      console[method] = (...args) => {
        this.addBreadcrumb('console', { method, args: args.map((a) => String(a)) });
        return this.originalConsole[method].apply(console, args);
      };
    });
  }

  updateConfig(nextConfig) {
    this.config = nextConfig;
  }

  destroy() {
    if (this._clickHandler) document.removeEventListener('click', this._clickHandler, true);
    if (this._popStateHandler) window.removeEventListener('popstate', this._popStateHandler);
    if (this.originalXHROpen) XMLHttpRequest.prototype.open = this.originalXHROpen;
    if (this.originalXHRSend) XMLHttpRequest.prototype.send = this.originalXHRSend;
    if (this.originalXHRSetRequestHeader) XMLHttpRequest.prototype.setRequestHeader = this.originalXHRSetRequestHeader;
    if (this.originalFetch) window.fetch = this.originalFetch;
    if (this.originalPushState) history.pushState = this.originalPushState;
    if (this.originalReplaceState) history.replaceState = this.originalReplaceState;
    Object.keys(this.originalConsole).forEach((method) => { console[method] = this.originalConsole[method]; });
    this.eventBus.emit('collector:behavior:destroyed');
  }
}

export default BehaviorCollector;
