import MonitorCore from './core';
import ErrorCollector from './collector/errorCollector';
import PerformanceCollector from './collector/performanceCollector';
import BehaviorCollector from './collector/behaviorCollector';
import DataReporter from './reporter/dataReporter';
import VueIntegration from './framework/vueIntegration';
import SessionReplay from './advanced/sessionReplay';
import eventBus from './core/eventBus';

// 非 React 时占位，避免 Vue 等项目打包时解析 react（仅当 framework.react 为 true 时动态加载）
const noopReactIntegration = {
  _config: null,
  get config() { return this._config; },
  set config(c) { this._config = c; },
  init() {},
  getErrorBoundary() { return null; },
  wrapApp(AppComponent) { return AppComponent; }
};

class YuanMonitor {
  constructor(options = {}) {
    this.core = new MonitorCore(options);
    this.config = this.core.config;

    this.errorCollector = new ErrorCollector(this.config);
    this.performanceCollector = new PerformanceCollector(this.config);
    this.behaviorCollector = new BehaviorCollector(this.config);
    this.dataReporter = new DataReporter(this.config);
    this.vueIntegration = new VueIntegration(this.config);
    this.reactIntegration = noopReactIntegration;
    this.sessionReplay = new SessionReplay(this.config);

    this.setupEventListeners();
  }

  setupEventListeners() {
    eventBus.on('core:initialized', () => {
      this.errorCollector.init();
      this.performanceCollector.init();
      this.behaviorCollector.init();
      this.dataReporter.init();

      if (this.config.framework?.react) {
        // 仅 React 项目按需动态加载，Vue 项目不会走到这里，不会解析 react
        import('./framework/reactIntegration').then((m) => {
          const ReactIntegration = m.default;
          this.reactIntegration = new ReactIntegration(this.config);
          this.reactIntegration.init();
          this.ErrorBoundary = this.reactIntegration.getErrorBoundary();
          if (this._reactResolve) this._reactResolve(this);
        }).catch((err) => {
          if (this.config.debug) console.warn('[YuanMonitor] React integration load failed:', err);
          if (this._reactResolve) this._reactResolve(this);
        });
      } else {
        this.reactIntegration.init();
        this.ErrorBoundary = this.reactIntegration.getErrorBoundary();
      }

      this.sessionReplay.init();
    });
    
    // 提供获取面包屑的接口
    eventBus.on('behavior:getBreadcrumbs', () => {
      return this.behaviorCollector.getBreadcrumbs();
    });
    
    // 提供获取会话ID的接口
    eventBus.on('core:getSessionId', (callback) => {
      if (typeof callback === 'function') {
        callback(this.core.getSessionId());
      }
      return this.core.getSessionId();
    });
    
    // 响应会话ID请求
    eventBus.on('core:requestSessionId', () => {
      eventBus.emit('core:getSessionId', this.core.getSessionId());
    });
    
    // 提供获取用户ID的接口
    eventBus.on('core:getUserId', (callback) => {
      if (typeof callback === 'function') {
        callback(this.core.userId);
      }
      return this.core.userId;
    });
    
    // 响应用户ID请求
    eventBus.on('core:requestUserId', () => {
      eventBus.emit('core:getUserId', this.core.userId);
    });
    
    // 提供获取用户数据的接口
    eventBus.on('core:getUserData', (callback) => {
      if (typeof callback === 'function') {
        callback(this.core.userData);
      }
      return this.core.userData;
    });
  }
  
  // 初始化SDK。当 framework.react 为 true 时返回 Promise<this>，在 React 集成加载完成后 resolve
  init() {
    this.core.init();
    if (this.config.framework?.react) {
      this._reactReadyPromise = new Promise((resolve) => {
        this._reactResolve = resolve;
        if (!this.core.isInitialized) resolve(this);
      });
      return this._reactReadyPromise;
    }
    return this;
  }
  
  // 设置配置
  setConfig(options) {
    this.core.setConfig(options);
    this.config = this.core.config;
    
    // 更新各个模块的配置
    this.errorCollector.config = this.config;
    this.performanceCollector.config = this.config;
    this.behaviorCollector.config = this.config;
    this.dataReporter.config = this.config;
    this.vueIntegration.config = this.config;
    this.reactIntegration.config = this.config;
    this.sessionReplay.config = this.config;
    
    return this;
  }
  
  // 设置用户ID
  setUserId(userId) {
    this.core.setUserId(userId);
    return this;
  }
  
  // 设置用户数据
  setUserData(data) {
    this.core.setUserData(data);
    return this;
  }
  
  // 获取配置
  getConfig() {
    return this.core.getConfig();
  }
  
  // 获取会话ID
  getSessionId() {
    return this.core.getSessionId();
  }
  
  // 获取用户行为面包屑
  getBreadcrumbs() {
    return this.behaviorCollector.getBreadcrumbs();
  }
  
  // 手动上报错误
  reportError(error, context = {}) {
    const errorData = {
      type: 'manual',
      message: error?.message || String(error),
      stack: error?.stack,
      error,
      context
    };
    
    eventBus.emit('error:captured', errorData);
    return this;
  }
  
  // 手动上报性能数据
  reportPerformance(data) {
    eventBus.emit('performance:custom', data);
    return this;
  }
  
  // 手动添加用户行为面包屑
  addBreadcrumb(type, data) {
    this.behaviorCollector.addBreadcrumb(type, data);
    return this;
  }
  
  // 清空用户行为面包屑
  clearBreadcrumbs() {
    this.behaviorCollector.clearBreadcrumbs();
    return this;
  }
  
  // 立即上报队列中的数据
  flush() {
    this.dataReporter.flush();
    return this;
  }
  
  // 销毁SDK
  destroy() {
    this.errorCollector.destroy();
    this.performanceCollector.destroy();
    this.behaviorCollector.destroy();
    this.dataReporter.destroy();
    this.sessionReplay.destroy();
    this.core.destroy();
    
    eventBus.clear();
    return this;
  }
  
  // Vue插件安装方法
  useVue(Vue) {
    this.vueIntegration.install(Vue);
    return this;
  }
  
  // React包装应用组件
  wrapReactApp(AppComponent) {
    return this.reactIntegration.wrapApp(AppComponent);
  }
}

// 导出单例
let instance = null;

const init = (options = {}) => {
  if (!instance) {
    instance = new YuanMonitor(options);
    const result = instance.init();
    return (result && typeof result.then === 'function') ? result : instance;
  }
  if (Object.keys(options).length > 0) {
    instance.setConfig(options);
  }
  return instance;
};

// 导出SDK
export {
  YuanMonitor,
  init,
  // React ErrorBoundary组件将通过init函数返回的实例获取
};

export default {
  YuanMonitor,
  init
};