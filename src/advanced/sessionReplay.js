let rrweb = null;

async function loadRrweb() {
  try {
    rrweb = await import('rrweb');
  } catch (error) {
    rrweb = null;
  }
}

class SessionReplay {
  constructor(config, eventBus, getContext) {
    this.config = config;
    this.eventBus = eventBus;
    this.getContext = getContext || (() => ({}));
    this.recorder = null;
    this.events = [];
    this.isRecording = false;
    this.lastErrorTime = 0;
    this.autoStopTimer = null;
    this._offError = null;
  }

  init() {
    if (!this.config.advanced.enableSessionReplay) return;
    if (Math.random() > this.config.advanced.sessionReplaySampleRate) return;
    if (!rrweb) loadRrweb();

    this._offError = this.eventBus.on('error:captured', () => {
      this.lastErrorTime = Date.now();
      if (!this.isRecording) this.startRecording();
      this.resetAutoStopTimer();
    });
  }

  startRecording() {
    if (this.isRecording || !this.config.serverUrl) return;
    if (!rrweb?.record) {
      loadRrweb().then(() => rrweb?.record && this._doStartRecording());
      return;
    }
    this._doStartRecording();
  }

  _doStartRecording() {
    if (this.isRecording) return;
    this.isRecording = true;
    this.events = [];
    this.recorder = rrweb.record({
      emit: (event) => {
        this.events.push(event);
        if (this.events.length > 1000) this.events.shift();
      },
      maskAllInputs: true
    });
  }

  stopRecording() {
    if (!this.isRecording || !this.recorder) return;
    this.recorder();
    this.recorder = null;
    this.isRecording = false;
    if (this.autoStopTimer) clearTimeout(this.autoStopTimer);
    this.autoStopTimer = null;
  }

  resetAutoStopTimer() {
    if (this.autoStopTimer) clearTimeout(this.autoStopTimer);
    this.autoStopTimer = setTimeout(() => {
      this.stopRecording();
      this.reportSessionReplay();
    }, 10000);
  }

  reportSessionReplay() {
    if (!this.events.length || !this.config.serverUrl) return;
    const payload = JSON.stringify({
      ...this.getContext(),
      data: {
        type: 'session-replay',
        timestamp: Date.now(),
        lastErrorTime: this.lastErrorTime,
        events: this.events
      }
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon(`${this.config.serverUrl}/session-replay`, payload);
    } else {
      fetch(`${this.config.serverUrl}/session-replay`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true
      }).catch(() => {});
    }
    this.events = [];
  }

  getEvents() { return [...this.events]; }
  isActive() { return this.isRecording; }

  destroy() {
    this.stopRecording();
    if (this._offError) this._offError();
  }
}

export default SessionReplay;
