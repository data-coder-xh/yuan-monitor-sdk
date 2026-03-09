class ModuleManager {
  constructor() {
    this.modules = [];
  }

  register(module, priority = 100) {
    if (!module || typeof module.init !== 'function') return;
    this.modules.push({ module, priority });
  }

  getOrderedModules() {
    return [...this.modules]
      .sort((a, b) => a.priority - b.priority)
      .map((item) => item.module);
  }

  initAll() {
    this.getOrderedModules().forEach((module) => module.init());
  }

  updateAllConfig(nextConfig) {
    this.getOrderedModules().forEach((module) => {
      if (typeof module.updateConfig === 'function') {
        module.updateConfig(nextConfig);
      } else {
        module.config = nextConfig;
      }
    });
  }

  destroyAll() {
    [...this.getOrderedModules()].reverse().forEach((module) => {
      if (typeof module.destroy === 'function') {
        module.destroy();
      }
    });
  }
}

export default ModuleManager;
