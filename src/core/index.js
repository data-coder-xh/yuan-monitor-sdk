import { createConfig } from './config';
import MonitorContext from './context';
import Lifecycle from './lifecycle';
import { createEventBus } from './eventBus';

class MonitorCore {
  constructor(options = {}) {
    this.config = createConfig(options);
    this.eventBus = createEventBus();
    this.lifecycle = new Lifecycle();
    this.context = new MonitorContext(this.config);
  }

  init() {
    if (!this.lifecycle.canInit()) return false;

    if (Math.random() > this.config.sampleRate) {
      this.config.enable = false;
      return false;
    }

    this.lifecycle.markInitialized();
    this.eventBus.emit('core:initialized', this.config);

    if (this.config.debug) {
      console.log('Monitor SDK initialized with config:', this.config);
    }

    return true;
  }

  setConfig(options) {
    this.config = createConfig({ ...this.config, ...options });
    this.context.config = this.config;
    this.eventBus.emit('core:configUpdated', this.config);
  }

  setUserId(userId) {
    this.context.setUserId(userId);
    this.eventBus.emit('core:userIdSet', this.context.userId);
  }

  setUserData(data) {
    this.context.setUserData(data);
    this.eventBus.emit('core:userDataSet', this.context.userData);
  }

  getSessionId() {
    return this.context.sessionId;
  }

  getConfig() {
    return this.config;
  }

  getContextSnapshot() {
    return this.context.getSnapshot();
  }

  get isInitialized() {
    return this.lifecycle.isInitialized;
  }

  destroy() {
    if (!this.lifecycle.canDestroy()) return;
    this.lifecycle.markDestroyed();
    this.eventBus.clear();
    if (this.config.debug) {
      console.log('Monitor SDK destroyed');
    }
  }
}

export default MonitorCore;
