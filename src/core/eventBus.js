export class EventBus {
  constructor() {
    this.events = {};
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (!this.events[event]) return;

    if (!callback) {
      delete this.events[event];
      return;
    }

    this.events[event] = this.events[event].filter((cb) => cb !== callback);
  }

  emit(event, ...args) {
    if (!this.events[event]) return;
    this.events[event].forEach((callback) => {
      try {
        callback(...args);
      } catch (error) {
      }
    });
  }

  clear() {
    this.events = {};
  }
}

export const createEventBus = () => new EventBus();

export default createEventBus();
