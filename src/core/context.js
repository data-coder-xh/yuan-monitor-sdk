class MonitorContext {
  constructor(config = {}) {
    this.config = config;
    this.sessionId = this._createSessionId();
    this.userId = null;
    this.userData = {};
  }

  _createSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }

  setUserId(userId) {
    this.userId = userId == null ? null : String(userId);
    this.userData = {
      ...this.userData,
      id: this.userId
    };
  }

  setUserData(data = {}) {
    this.userData = {
      ...this.userData,
      ...data
    };
  }

  getSnapshot() {
    return {
      appKey: this.config.appKey,
      sessionId: this.sessionId,
      userId: this.userId || '',
      userData: { ...this.userData },
      environment: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        url: window.location.href,
        referrer: document.referrer,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    };
  }
}

export default MonitorContext;
