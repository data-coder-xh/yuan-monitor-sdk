/**
 * 兼容 Vue 2 与 Vue 3：
 * - Vue 2：传入 Vue 构造函数，使用 Vue.config / Vue.mixin
 * - Vue 3：传入 createApp() 返回的 app 实例，使用 app.config / app.mixin
 */

function getComponentName(vm) {
  if (!vm) return 'Unknown component';
  return vm.$options?.name ?? vm.type?.name ?? vm.type?.__name ?? vm.constructor?.name ?? 'Unknown component';
}

function getPropsData(vm) {
  if (!vm) return undefined;
  return vm.$options?.propsData ?? vm.props ?? undefined;
}

function getRoute(vm) {
  if (!vm?.$route) return undefined;
  const r = vm.$route;
  return { path: r.path, name: r.name, params: r.params, query: r.query };
}

class VueIntegration {
  constructor(config, eventBus) {
    this.config = config;
    this.eventBus = eventBus;
    this.originalErrorHandler = null;
    this._target = null;
  }

  install(VueOrApp) {
    const target = VueOrApp;
    if (!target?.config || typeof target.mixin !== 'function') return;

    this._target = target;
    this.originalErrorHandler = target.config.errorHandler;

    target.config.errorHandler = (err, vm, info) => {
      this.eventBus.emit('error:captured', {
        type: 'vue',
        message: err?.message || 'Unknown Vue error',
        componentName: getComponentName(vm),
        info,
        stack: err?.stack,
        error: err,
        vm: { propsData: getPropsData(vm), route: getRoute(vm) }
      });

      if (this.originalErrorHandler) this.originalErrorHandler(err, vm, info);
    };

    this.eventBus.emit('framework:vue:integrated');
  }

  uninstall() {
    const target = this._target;
    if (!target?.config) return;
    if (this.originalErrorHandler) {
      target.config.errorHandler = this.originalErrorHandler;
      this.originalErrorHandler = null;
    }
    this._target = null;
    this.eventBus.emit('framework:vue:unintegrated');
  }
}

export default VueIntegration;
