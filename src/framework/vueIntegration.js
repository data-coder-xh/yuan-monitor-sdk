import eventBus from '../core/eventBus';

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
  constructor(config) {
    this.config = config;
    this.originalErrorHandler = null;
    this._target = null;
  }

  /**
   * @param {import('vue').VueConstructor | import('vue').App} VueOrApp - Vue 2 传 Vue，Vue 3 传 createApp() 的返回值
   */
  install(VueOrApp) {
    const target = VueOrApp;
    if (!target?.config || typeof target.mixin !== 'function') return;

    this._target = target;
    this.originalErrorHandler = target.config.errorHandler;

    target.config.errorHandler = (err, vm, info) => {
      const errorData = {
        type: 'vue',
        message: err?.message || 'Unknown Vue error',
        componentName: getComponentName(vm),
        info,
        stack: err?.stack,
        error: err,
        vm: {
          propsData: getPropsData(vm),
          route: getRoute(vm)
        }
      };

      eventBus.emit('error:captured', errorData);

      if (this.originalErrorHandler) {
        this.originalErrorHandler(err, vm, info);
      }
    };

    target.mixin({
      beforeCreate() {
        const options = this.$options ?? this.type ?? {};
        const methods = options.methods;
        if (!methods || typeof methods !== 'object') return;

        Object.keys(methods).forEach((methodName) => {
          const originalMethod = methods[methodName];
          if (typeof originalMethod !== 'function') return;

          const self = this;
          methods[methodName] = function (...args) {
            try {
              return originalMethod.apply(self, args);
            } catch (err) {
              const errorData = {
                type: 'vue-method',
                message: err?.message || 'Unknown Vue method error',
                componentName: options.name ?? options.__name ?? 'Unknown component',
                methodName,
                stack: err?.stack,
                error: err
              };
              eventBus.emit('error:captured', errorData);
              throw err;
            }
          };
        });
      }
    });

    eventBus.emit('framework:vue:integrated');
  }

  uninstall() {
    const target = this._target;
    if (!target?.config) return;

    if (this.originalErrorHandler) {
      target.config.errorHandler = this.originalErrorHandler;
      this.originalErrorHandler = null;
    }
    this._target = null;
    eventBus.emit('framework:vue:unintegrated');
  }
}

export default VueIntegration;
