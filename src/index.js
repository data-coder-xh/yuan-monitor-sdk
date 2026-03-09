import MonitorCore from './core';
import ErrorCollector from './collector/errorCollector';
import PerformanceCollector from './collector/performanceCollector';
import BehaviorCollector from './collector/behaviorCollector';
import DataReporter from './reporter/dataReporter';
import VueIntegration from './framework/vueIntegration';
import SessionReplay from './plugins/sessionReplay';
import ModuleManager from './core/pluginManager';

const noopReactIntegration = {
  config: null,
  init() {},
  getErrorBoundary() { return null; },
  wrapApp(AppComponent) { return AppComponent; },
  updateConfig(nextConfig) { this.config = nextConfig; },
  destroy() {}
};

class YuanMonitor {
  constructor(options = {}) {
    this.core = new MonitorCore(options);
    this.config = this.core.config;
    this.eventBus = this.core.eventBus;
    this.moduleManager = new ModuleManager();
    this._readyPromise = Promise.resolve(this);

    this.errorCollector = new ErrorCollector(this.config, this.eventBus);
    this.performanceCollector = new PerformanceCollector(this.config, this.eventBus);
    this.behaviorCollector = new BehaviorCollector(this.config, this.eventBus);
    this.dataReporter = new DataReporter(this.config, this.eventBus, {
      getContext: () => this.core.getContextSnapshot(),
      getBreadcrumbs: () => this.behaviorCollector.getBreadcrumbs()
    });
    this.vueIntegration = new VueIntegration(this.config, this.eventBus);
    this.reactIntegration = noopReactIntegration;
    this.sessionReplay = new SessionReplay(this.config, this.eventBus, () => this.core.getContextSnapshot());

    this._registerCoreModules();
  }

  _registerCoreModules() {
    this.moduleManager.register(this.behaviorCollector, 10);
    this.moduleManager.register(this.errorCollector, 20);
    this.moduleManager.register(this.performanceCollector, 20);
    this.moduleManager.register(this.dataReporter, 30);
    this.moduleManager.register(this.sessionReplay, 40);
  }

  async _loadReactIntegrationIfNeeded() {
    if (!this.config.framework?.react) return this;
    const m = await import('./framework/reactIntegration');
    const ReactIntegration = m.default;
    this.reactIntegration = new ReactIntegration(this.config, this.eventBus);
    this.reactIntegration.init();
    this.ErrorBoundary = this.reactIntegration.getErrorBoundary();
    return this;
  }

  init() {
    const initialized = this.core.init();
    if (!initialized) return this;

    this.moduleManager.initAll();
    this._readyPromise = this._loadReactIntegrationIfNeeded().catch((err) => {
      if (this.config.debug) console.warn('[YuanMonitor] React integration load failed:', err);
      return this;
    });
    return this;
  }

  ready() {
    return this._readyPromise || Promise.resolve(this);
  }

  setConfig(options) {
    this.core.setConfig(options);
    this.config = this.core.config;
    this.moduleManager.updateAllConfig(this.config);

    [this.vueIntegration, this.reactIntegration].forEach((module) => {
      if (!module) return;
      if (typeof module.updateConfig === 'function') {
        module.updateConfig(this.config);
      } else {
        module.config = this.config;
      }
    });

    return this;
  }

  setUserId(userId) { this.core.setUserId(userId); return this; }
  setUserData(data) { this.core.setUserData(data); return this; }
  getConfig() { return this.core.getConfig(); }
  getSessionId() { return this.core.getSessionId(); }
  getBreadcrumbs() { return this.behaviorCollector.getBreadcrumbs(); }

  reportError(error, context = {}) {
    this.eventBus.emit('error:captured', {
      type: 'manual',
      message: error?.message || String(error),
      stack: error?.stack,
      error,
      context
    });
    return this;
  }

  reportPerformance(data) { this.eventBus.emit('performance:metric', data); return this; }
  addBreadcrumb(type, data) { this.behaviorCollector.addBreadcrumb(type, data); return this; }
  clearBreadcrumbs() { this.behaviorCollector.clearBreadcrumbs(); return this; }
  flush() { this.dataReporter.flush(); return this; }

  destroy() {
    this.moduleManager.destroyAll();
    if (typeof this.reactIntegration.destroy === 'function') this.reactIntegration.destroy();
    this.core.destroy();
    if (instance === this) instance = null;
    return this;
  }

  useVue(VueOrApp) { this.vueIntegration.install(VueOrApp); return this; }
  wrapReactApp(AppComponent) { return this.reactIntegration.wrapApp(AppComponent); }
}

let instance = null;

const init = (options = {}) => {
  if (!instance) {
    instance = new YuanMonitor(options);
    instance.init();
    return instance;
  }
  if (Object.keys(options).length > 0) instance.setConfig(options);
  return instance;
};

export { YuanMonitor, init };

export default { YuanMonitor, init };
