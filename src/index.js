import MonitorCore from './core';
import ErrorCollector from './collector/errorCollector';
import PerformanceCollector from './collector/performanceCollector';
import BehaviorCollector from './collector/behaviorCollector';
import DataReporter from './reporter/dataReporter';
import VueIntegration from './framework/vueIntegration';
import SessionReplay from './advanced/sessionReplay';
import PluginManager from './core/pluginManager';

const noopReactIntegration = {
  config: null,
  init() {},
  getErrorBoundary() { return null; },
  wrapApp(AppComponent) { return AppComponent; },
  destroy() {}
};

class YuanMonitor {
  constructor(options = {}) {
    this.core = new MonitorCore(options);
    this.config = this.core.config;
    this.eventBus = this.core.eventBus;
    this.moduleManager = new PluginManager();

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
    [
      this.errorCollector,
      this.performanceCollector,
      this.behaviorCollector,
      this.dataReporter,
      this.sessionReplay
    ].forEach((module) => this.moduleManager.register(module));
  }

  async _loadReactIntegrationIfNeeded() {
    if (!this.config.framework?.react) return;
    const m = await import('./framework/reactIntegration');
    const ReactIntegration = m.default;
    this.reactIntegration = new ReactIntegration(this.config, this.eventBus);
    this.reactIntegration.init();
    this.ErrorBoundary = this.reactIntegration.getErrorBoundary();
  }

  init() {
    const initialized = this.core.init();
    if (!initialized) return this;
    this.moduleManager.initAll();
    this._loadReactIntegrationIfNeeded().catch((err) => {
      if (this.config.debug) console.warn('[YuanMonitor] React integration load failed:', err);
    });
    return this;
  }

  setConfig(options) {
    this.core.setConfig(options);
    this.config = this.core.config;
    [
      this.errorCollector,
      this.performanceCollector,
      this.behaviorCollector,
      this.dataReporter,
      this.vueIntegration,
      this.reactIntegration,
      this.sessionReplay
    ].forEach((module) => {
      if (module) module.config = this.config;
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
