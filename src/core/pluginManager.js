class PluginManager {
  constructor() {
    this.modules = [];
  }

  register(module) {
    if (!module || typeof module.init !== 'function') return;
    this.modules.push(module);
  }

  initAll() {
    this.modules.forEach((module) => module.init());
  }

  destroyAll() {
    [...this.modules].reverse().forEach((module) => {
      if (typeof module.destroy === 'function') {
        module.destroy();
      }
    });
  }
}

export default PluginManager;
