class Lifecycle {
  constructor() {
    this.isInitialized = false;
    this.isDestroyed = false;
  }

  canInit() {
    return !this.isInitialized && !this.isDestroyed;
  }

  markInitialized() {
    this.isInitialized = true;
  }

  canDestroy() {
    return this.isInitialized && !this.isDestroyed;
  }

  markDestroyed() {
    this.isDestroyed = true;
    this.isInitialized = false;
  }
}

export default Lifecycle;
