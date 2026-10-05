/**
 * Xiaomi HyperOS & Android OS Ultra-Smooth Launcher Engine
 * Pure Vanilla JavaScript with zero external runtime dependencies.
 * Optimized for low-end webviews and high-refresh Android devices.
 */

// Sound Synthesizer via Web Audio API (Zero external audio files needed)
class SoundSystem {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTap() {
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch (_) {}
  }

  playShutter() {
    this.init();
    if (!this.ctx) return;
    try {
      // Noise burst for mechanical shutter
      const bufferSize = this.ctx.sampleRate * 0.09;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, this.ctx.currentTime);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.09);
      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      whiteNoise.start();
    } catch (_) {}
  }

  playTone(freq, duration = 0.12) {
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (_) {}
  }
}

const sounds = new SoundSystem();

// System State
const OS = {
  state: {
    activeApp: null,
    isShadeOpen: false,
    isDrawerOpen: false,
    isRecentsOpen: false,
    activePage: 0,
    theme: localStorage.getItem('hyperos_theme') || 'dark',
    accent: localStorage.getItem('hyperos_accent') || '#007aff',
    wallpaper: localStorage.getItem('hyperos_wallpaper') || 'mars',
    brightness: parseInt(localStorage.getItem('hyperos_brightness') || '85', 10),
    volume: parseInt(localStorage.getItem('hyperos_volume') || '75', 10),
    navMode: localStorage.getItem('hyperos_nav_mode') || 'gesture',
    toggles: {
      wifi: true,
      bluetooth: true,
      torch: false,
      darkmode: true,
      autorotate: true,
      dnd: false,
      airplane: false,
      hotspot: false
    },
    runningApps: ['camera', 'settings', 'calculator'],
    capturedPhotos: JSON.parse(localStorage.getItem('hyperos_gallery') || '[]'),
    notes: JSON.parse(localStorage.getItem('hyperos_notes') || JSON.stringify([
      { id: 1, title: 'Welcome to HyperOS', content: 'Ultra-smooth Android OS experience with responsive control center, quick settings, and built-in apps.', date: 'Today' },
      { id: 2, title: 'Tips & Tricks', content: 'Swipe down from the top to open Quick Settings. Swipe up to access App Drawer. Tap the bottom bar for Home.', date: 'Yesterday' }
    ])),
    messages: [
      { id: '1', name: 'Alex Johnson', avatar: 'AJ', lastMsg: 'The new HyperOS launcher looks incredible! 🚀', time: '10:42 AM', unread: 1 },
      { id: '2', name: 'Elena Rostova', avatar: 'ER', lastMsg: 'Are we still meeting at 3 PM?', time: '9:15 AM', unread: 0 },
      { id: '3', name: 'Xiaomi System', avatar: 'MI', lastMsg: 'Security patch and performance update installed.', time: 'Yesterday', unread: 0 }
    ],
    chatHistory: {
      '1': [
        { sender: 'them', text: 'Hey there! How is the new Android OS build?' },
        { sender: 'me', text: 'It is super smooth, high refresh rate and instant gestures!' },
        { sender: 'them', text: 'The new HyperOS launcher looks incredible! 🚀' }
      ]
    },
    notifications: [
      { id: 'n1', app: 'Messages', title: 'Alex Johnson', desc: 'The new HyperOS launcher looks incredible! 🚀', time: '2m ago', appId: 'messages' },
      { id: 'n2', app: 'System Update', title: 'HyperOS 2.0.4 Ready', desc: 'New fluid animations and kernel optimizations available.', time: '15m ago', appId: 'settings' },
      { id: 'n3', app: 'Battery Manager', title: 'HyperCharge Active', desc: 'Turbo charging at 120W • 88% battery reached.', time: '1h ago', appId: 'settings' }
    ]
  },

  // Wallpapers list (CSS Gradients and SVG Patterns)
  wallpapers: {
    mars: 'radial-gradient(circle at 75% 25%, #ff5e3a 0%, #a61c1c 40%, #150a14 85%)',
    space: 'radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%)',
    geometry: 'linear-gradient(135deg, #1f1c2c 0%, #928dab 100%)',
    emerald: 'radial-gradient(circle at top left, #059669 0%, #064e3b 50%, #022c22 100%)',
    sunset: 'linear-gradient(180deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)'
  },

  // App Metadata
  apps: [
    { id: 'camera', name: 'Camera', icon: 'camera', color: 'linear-gradient(135deg, #374151, #111827)', category: 'Media' },
    { id: 'gallery', name: 'Gallery', icon: 'gallery', color: 'linear-gradient(135deg, #ec4899, #be185d)', category: 'Media' },
    { id: 'settings', name: 'Settings', icon: 'settings', color: 'linear-gradient(135deg, #64748b, #475569)', category: 'System' },
    { id: 'phone', name: 'Phone', icon: 'phone', color: 'linear-gradient(135deg, #10b981, #059669)', category: 'System' },
    { id: 'messages', name: 'Messages', icon: 'messages', color: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', category: 'System' },
    { id: 'calculator', name: 'Calculator', icon: 'calc', color: 'linear-gradient(135deg, #f59e0b, #d97706)', category: 'Tools' },
    { id: 'clock', name: 'Clock', icon: 'clock', color: 'linear-gradient(135deg, #6366f1, #4f46e5)', category: 'Tools' },
    { id: 'notes', name: 'Notes', icon: 'notes', color: 'linear-gradient(135deg, #f97316, #ea580c)', category: 'Tools' },
    { id: 'weather', name: 'Weather', icon: 'weather', color: 'linear-gradient(135deg, #0ea5e9, #0284c7)', category: 'Tools' },
    { id: 'browser', name: 'Browser', icon: 'browser', color: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', category: 'System' },
    { id: 'security', name: 'Security', icon: 'security', color: 'linear-gradient(135deg, #10b981, #047857)', category: 'System' },
    { id: 'files', name: 'File Manager', icon: 'files', color: 'linear-gradient(135deg, #eab308, #ca8a04)', category: 'Tools' }
  ],

  init() {
    this.applyTheme();
    this.applyAccent(this.state.accent);
    this.applyWallpaper(this.state.wallpaper);
    this.applyBrightness(this.state.brightness);
    this.updateClock();
    setInterval(() => this.updateClock(), 1000);
    this.renderHomePages();
    this.renderDock();
    this.renderAppDrawer();
    this.renderNotifications();
    this.bindEvents();
    this.syncNativeBattery();
  },

  vibrate(ms = 15) {
    if (window.AndroidBridge && window.AndroidBridge.vibrate) {
      window.AndroidBridge.vibrate(ms);
    } else if (navigator.vibrate) {
      navigator.vibrate(ms);
    }
  },

  toast(msg) {
    if (window.AndroidBridge && window.AndroidBridge.showToast) {
      window.AndroidBridge.showToast(msg);
    } else {
      let toastEl = document.getElementById('system-toast');
      if (!toastEl) {
        toastEl = document.createElement('div');
        toastEl.id = 'system-toast';
        toastEl.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:rgba(30,41,59,0.92);color:#fff;padding:8px 18px;border-radius:20px;font-size:13px;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,0.3);pointer-events:none;transition:opacity 0.2s;';
        document.body.appendChild(toastEl);
      }
      toastEl.innerText = msg;
      toastEl.style.opacity = '1';
      clearTimeout(this._toastTimeout);
      this._toastTimeout = setTimeout(() => {
        toastEl.style.opacity = '0';
      }, 2000);
    }
  },

  syncNativeBattery() {
    if (window.AndroidBridge && window.AndroidBridge.getBatteryInfo) {
      try {
        const info = JSON.parse(window.AndroidBridge.getBatteryInfo());
        const batEl = document.getElementById('status-battery-pct');
        const fillEl = document.getElementById('battery-level-fill');
        if (batEl) batEl.innerText = `${info.level}%`;
        if (fillEl) fillEl.style.width = `${info.level}%`;
      } catch (_) {}
    }
  },

  updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dateStr = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;

    const statusClock = document.getElementById('status-clock');
    if (statusClock) statusClock.innerText = timeStr;

    const widgetTime = document.getElementById('widget-time');
    if (widgetTime) widgetTime.innerText = timeStr;

    const widgetDate = document.getElementById('widget-date');
    if (widgetDate) widgetDate.innerText = dateStr;

    const qsTime = document.getElementById('qs-time');
    if (qsTime) qsTime.innerText = timeStr;

    const qsDate = document.getElementById('qs-date');
    if (qsDate) qsDate.innerText = dateStr;
  },

  applyTheme() {
    document.documentElement.setAttribute('data-theme', this.state.theme);
    localStorage.setItem('hyperos_theme', this.state.theme);
  },

  applyAccent(color) {
    this.state.accent = color;
    document.documentElement.style.setProperty('--accent-color', color);
    // Parse RGB
    let c = color.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const num = parseInt(c, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    document.documentElement.style.setProperty('--accent-rgb', `${r}, ${g}, ${b}`);
    document.documentElement.style.setProperty('--accent-gradient', `linear-gradient(135deg, ${color}, rgb(${Math.min(r + 30, 255)}, ${Math.min(g + 30, 255)}, ${Math.min(b + 50, 255)}))`);
    localStorage.setItem('hyperos_accent', color);
  },

  applyWallpaper(key) {
    this.state.wallpaper = key;
    const root = document.getElementById('os-root');
    if (root) {
      if (this.wallpapers[key]) {
        root.style.background = this.wallpapers[key];
        root.style.backgroundSize = 'cover';
      } else if (key.startsWith('data:') || key.startsWith('http')) {
        root.style.backgroundImage = `url('${key}')`;
        root.style.backgroundSize = 'cover';
      }
    }
    localStorage.setItem('hyperos_wallpaper', key);
  },

  applyBrightness(val) {
    this.state.brightness = val;
    const mask = document.getElementById('brightness-mask');
    if (mask) {
      const opacity = ((100 - val) / 100) * 0.85;
      mask.style.opacity = opacity.toFixed(2);
    }
    const valText = document.getElementById('qs-brightness-val');
    if (valText) valText.innerText = `${val}%`;
    const fill = document.getElementById('brightness-slider-fill');
    if (fill) fill.style.width = `${val}%`;
    localStorage.setItem('hyperos_brightness', val);
  },

  applyVolume(val) {
    this.state.volume = val;
    const valText = document.getElementById('qs-volume-val');
    if (valText) valText.innerText = `${val}%`;
    const fill = document.getElementById('volume-slider-fill');
    if (fill) fill.style.width = `${val}%`;
    localStorage.setItem('hyperos_volume', val);
  },

  getIconSvg(type) {
    const svgs = {
      camera: '<svg viewBox="0 0 24 24"><path d="M12 15.2a3.2 3.2 0 100-6.4 3.2 3.2 0 000 6.4z"/><path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/></svg>',
      gallery: '<svg viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>',
      settings: '<svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>',
      phone: '<svg viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>',
      messages: '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>',
      calc: '<svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-6 2h5v3h-5V5zm-6 0h5v3H7V5zm0 5h5v3H7v-3zm0 5h5v3H7v-3zm6 3v-3h5v3h-5zm0-5v-3h5v3h-5z"/></svg>',
      clock: '<svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>',
      notes: '<svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>',
      weather: '<svg viewBox="0 0 24 24"><path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6 0 2.97 2.16 5.44 5 5.92V22h2v-4.58c2.84-.48 5-2.95 5-5.92 0-3.31-2.69-6-6-6z"/></svg>',
      browser: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>',
      security: '<svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>',
      files: '<svg viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>'
    };
    return svgs[type] || svgs.settings;
  },

  renderHomePages() {
    const page1 = document.getElementById('home-page-1');
    const page2 = document.getElementById('home-page-2');
    if (!page1 || !page2) return;

    // Page 1 apps
    const page1Apps = this.apps.slice(0, 8);
    let p1Html = `
      <div class="widget-row">
        <div class="hyper-clock-widget" onclick="OS.openApp('clock')">
          <div>
            <div class="widget-time" id="widget-time">10:42</div>
            <div class="widget-date" id="widget-date">Sun, Oct 5</div>
          </div>
          <div class="widget-weather" onclick="event.stopPropagation(); OS.openApp('weather')">
            <div class="widget-temp">24° <span style="font-size:18px">☀️</span></div>
            <div class="widget-city">Sunny • San Francisco</div>
          </div>
        </div>
      </div>

      <div class="widget-row">
        <div class="hyper-stats-widget" onclick="OS.openApp('settings')">
          <div class="stat-item">
            <div class="stat-header">RAM</div>
            <div class="stat-value">6.8 / 12G</div>
            <div class="stat-progress"><div class="stat-bar" style="width: 56%"></div></div>
          </div>
          <div class="stat-item">
            <div class="stat-header">Storage</div>
            <div class="stat-value">114 / 256G</div>
            <div class="stat-progress"><div class="stat-bar" style="width: 44%"></div></div>
          </div>
          <div class="stat-item">
            <div class="stat-header">Health</div>
            <div class="stat-value" style="color:#10b981">Optimal</div>
            <div class="stat-progress"><div class="stat-bar" style="width: 98%; background:#10b981"></div></div>
          </div>
        </div>
      </div>

      <div class="app-grid">
        ${page1Apps.map(app => `
          <div class="app-item" onclick="OS.openApp('${app.id}')">
            <div class="app-icon" style="background: ${app.color}">
              ${this.getIconSvg(app.icon)}
            </div>
            <span class="app-label">${app.name}</span>
          </div>
        `).join('')}
      </div>
    `;
    page1.innerHTML = p1Html;

    // Page 2 apps
    const page2Apps = this.apps.slice(4);
    let p2Html = `
      <div class="search-widget" onclick="OS.openApp('browser')">
        <svg style="width:18px;height:18px;fill:currentColor" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
        <input type="text" placeholder="Search apps, web, & contacts..." readonly />
      </div>

      <div class="app-grid">
        ${page2Apps.map(app => `
          <div class="app-item" onclick="OS.openApp('${app.id}')">
            <div class="app-icon" style="background: ${app.color}">
              ${this.getIconSvg(app.icon)}
            </div>
            <span class="app-label">${app.name}</span>
          </div>
        `).join('')}
      </div>
    `;
    page2.innerHTML = p2Html;
  },

  renderDock() {
    const dock = document.getElementById('dock-apps');
    if (!dock) return;
    const dockAppIds = ['phone', 'messages', 'browser', 'camera'];
    const dockApps = dockAppIds.map(id => this.apps.find(a => a.id === id)).filter(Boolean);

    dock.innerHTML = dockApps.map(app => `
      <div class="app-item" onclick="OS.openApp('${app.id}')">
        <div class="app-icon" style="background: ${app.color}">
          ${this.getIconSvg(app.icon)}
        </div>
      </div>
    `).join('');
  },

  renderAppDrawer(query = '', category = 'All') {
    const list = document.getElementById('drawer-apps-list');
    if (!list) return;
    let filtered = this.apps;
    if (category && category !== 'All' && category !== 'All Apps') {
      filtered = filtered.filter(a => a.category.toLowerCase() === category.toLowerCase());
    }
    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      filtered = filtered.filter(a => a.name.toLowerCase().includes(q));
    }
    if (filtered.length === 0) {
      list.innerHTML = `<div style="text-align:center;padding:36px 16px;color:var(--text-muted)">No matching apps found</div>`;
      return;
    }
    list.innerHTML = `
      <div class="app-grid">
        ${filtered.map(app => `
          <div class="app-item" onclick="OS.openApp('${app.id}')">
            <div class="app-icon" style="background: ${app.color}">
              ${this.getIconSvg(app.icon)}
            </div>
            <span class="app-label">${app.name}</span>
          </div>
        `).join('')}
      </div>
    `;
  },

  filterDrawer(query) {
    this._currentDrawerQuery = query;
    this.renderAppDrawer(query, this._currentDrawerCategory || 'All');
  },

  setDrawerCategory(category, el) {
    this.vibrate(12);
    this._currentDrawerCategory = category;
    document.querySelectorAll('.drawer-category-chip').forEach(c => c.classList.remove('active'));
    if (el) el.classList.add('active');
    this.renderAppDrawer(this._currentDrawerQuery || '', category);
  },

  renderNotifications() {
    const list = document.getElementById('notifications-list');
    if (!list) return;
    if (this.state.notifications.length === 0) {
      list.innerHTML = `<div style="text-align:center;padding:24px;color:var(--text-muted)">No notifications</div>`;
      return;
    }
    list.innerHTML = this.state.notifications.map(n => `
      <div class="notif-card" id="notif-${n.id}" onclick="OS.handleNotificationClick('${n.id}', '${n.appId}')">
        <div class="notif-icon" style="background: var(--accent-gradient)">
          ${this.getIconSvg(n.appId || 'messages')}
        </div>
        <div class="notif-body">
          <div class="notif-top">
            <span class="notif-app-name">${n.app}</span>
            <span class="notif-time">${n.time}</span>
          </div>
          <div class="notif-content-title">${n.title}</div>
          <div class="notif-content-desc">${n.desc}</div>
        </div>
      </div>
    `).join('');
  },

  handleNotificationClick(notifId, appId) {
    this.vibrate(15);
    this.closeShade();
    if (appId) {
      this.openApp(appId);
    }
    // Remove notification
    this.state.notifications = this.state.notifications.filter(n => n.id !== notifId);
    this.renderNotifications();
  },

  clearAllNotifications() {
    this.vibrate(20);
    this.state.notifications = [];
    this.renderNotifications();
    this.toast('Notifications cleared');
  },

  // Switch Pager Page
  switchPage(index) {
    this.state.activePage = index;
    const pager = document.getElementById('home-pager');
    if (pager) {
      pager.style.transform = `translateX(-${index * 50}%)`;
    }
    document.querySelectorAll('.pager-dot').forEach((dot, idx) => {
      dot.classList.toggle('active', idx === index);
    });
    this.vibrate(10);
  },

  // Notification Shade Controls
  toggleShade() {
    if (this.state.isShadeOpen) {
      this.closeShade();
    } else {
      this.openShade();
    }
  },

  openShade() {
    this.state.isShadeOpen = true;
    const shade = document.getElementById('notification-shade');
    if (shade) shade.classList.add('open');
    this.vibrate(18);
  },

  closeShade() {
    this.state.isShadeOpen = false;
    const shade = document.getElementById('notification-shade');
    if (shade) shade.classList.remove('open');
    this.vibrate(12);
  },

  // App Drawer Controls
  openDrawer() {
    this.state.isDrawerOpen = true;
    const drawer = document.getElementById('app-drawer');
    const home = document.getElementById('home-screen');
    if (drawer) drawer.classList.add('open');
    if (home) home.classList.add('drawer-open');
    this.vibrate(15);
  },

  closeDrawer() {
    this.state.isDrawerOpen = false;
    const drawer = document.getElementById('app-drawer');
    const home = document.getElementById('home-screen');
    if (drawer) drawer.classList.remove('open');
    if (home) home.classList.remove('drawer-open');
    this.vibrate(10);
  },

  // Recents / Multitasking Overview
  openRecents() {
    this.state.isRecentsOpen = true;
    const recents = document.getElementById('recents-overview');
    const home = document.getElementById('home-screen');
    if (recents) recents.classList.add('open');
    if (home) home.classList.add('recents-open');
    this.renderRecentsCards();
    this.vibrate(20);
  },

  closeRecents() {
    this.state.isRecentsOpen = false;
    const recents = document.getElementById('recents-overview');
    const home = document.getElementById('home-screen');
    if (recents) recents.classList.remove('open');
    if (home) home.classList.remove('recents-open');
    this.vibrate(10);
  },

  renderRecentsCards() {
    const carousel = document.getElementById('recents-carousel');
    if (!carousel) return;
    if (this.state.runningApps.length === 0) {
      carousel.innerHTML = `<div style="color:var(--text-muted);margin:auto;font-size:15px">No running applications</div>`;
      return;
    }

    carousel.innerHTML = this.state.runningApps.map(appId => {
      const app = this.apps.find(a => a.id === appId) || { name: appId, icon: 'settings', color: '#333' };
      return `
        <div class="recent-app-card" onclick="OS.openApp('${appId}')">
          <div class="recent-app-top">
            <div class="recent-app-meta">
              <div class="app-icon" style="background:${app.color}">
                ${this.getIconSvg(app.icon)}
              </div>
              <span>${app.name}</span>
            </div>
            <button class="nav-btn" onclick="event.stopPropagation(); OS.killApp('${appId}')" style="padding:4px">✕</button>
          </div>
          <div class="recent-preview">
            <div style="font-size:32px;margin-bottom:10px">${app.name === 'Camera' ? '📷' : app.name === 'Settings' ? '⚙️' : '📱'}</div>
            <div>${app.name} preview snapshot</div>
            <div style="font-size:11px;opacity:0.6;margin-top:6px">Active in memory</div>
          </div>
        </div>
      `;
    }).join('');
  },

  killApp(appId) {
    this.vibrate(15);
    this.state.runningApps = this.state.runningApps.filter(id => id !== appId);
    this.renderRecentsCards();
    this.toast(`Closed ${appId}`);
  },

  clearAllRecents() {
    this.vibrate(25);
    this.state.runningApps = [];
    this.renderRecentsCards();
    this.toast('Freed 1.4 GB RAM • Device is running cool');
    setTimeout(() => this.closeRecents(), 500);
  },

  // Open & Close System Apps
  openApp(appId) {
    sounds.playTap();
    this.vibrate(15);
    this.closeDrawer();
    this.closeShade();
    this.closeRecents();

    if (!this.state.runningApps.includes(appId)) {
      this.state.runningApps.unshift(appId);
    }

    this.state.activeApp = appId;
    const viewport = document.getElementById('app-viewport');
    const headerTitle = document.getElementById('app-header-title');
    const content = document.getElementById('app-content-body');
    const appMeta = this.apps.find(a => a.id === appId) || { name: appId };

    if (headerTitle) headerTitle.innerText = appMeta.name;
    if (content) {
      content.innerHTML = this.getAppHtml(appId);
      this.initAppLogic(appId);
    }
    if (viewport) viewport.classList.add('active');
  },

  closeApp() {
    this.vibrate(10);
    this.state.activeApp = null;
    const viewport = document.getElementById('app-viewport');
    if (viewport) viewport.classList.remove('active');
    // Stop camera stream if active
    if (this._cameraInterval) {
      clearInterval(this._cameraInterval);
      this._cameraInterval = null;
    }
  },

  // Toggle Quick Settings Tiles
  toggleQS(key) {
    sounds.playTap();
    this.vibrate(18);
    this.state.toggles[key] = !this.state.toggles[key];
    const tile = document.getElementById(`qs-${key}`);
    if (tile) {
      tile.classList.toggle('active', this.state.toggles[key]);
    }

    if (key === 'torch') {
      const isTorch = this.state.toggles.torch;
      const torchOverlay = document.getElementById('flashlight-torch');
      if (torchOverlay) torchOverlay.classList.toggle('active', isTorch);
      if (window.AndroidBridge && window.AndroidBridge.toggleFlashlight) {
        window.AndroidBridge.toggleFlashlight(isTorch);
      }
      this.toast(isTorch ? 'Flashlight ON' : 'Flashlight OFF');
    } else if (key === 'darkmode') {
      this.state.theme = this.state.toggles.darkmode ? 'dark' : 'light';
      this.applyTheme();
      this.toast(`Theme: ${this.state.theme.toUpperCase()}`);
    } else if (key === 'wifi') {
      this.toast(this.state.toggles.wifi ? 'Wi-Fi Connected (Hyper_5G)' : 'Wi-Fi Disabled');
    } else if (key === 'bluetooth') {
      this.toast(this.state.toggles.bluetooth ? 'Bluetooth ON' : 'Bluetooth OFF');
    } else if (key === 'dnd') {
      this.toast(this.state.toggles.dnd ? 'Do Not Disturb Enabled' : 'Do Not Disturb Disabled');
    } else if (key === 'airplane') {
      this.toast(this.state.toggles.airplane ? 'Airplane Mode ON' : 'Airplane Mode OFF');
    }
  },

  // System App HTML Templates
  getAppHtml(appId) {
    switch (appId) {
      case 'camera':
        return `
          <div class="camera-viewfinder">
            <canvas id="camera-canvas" class="camera-preview-canvas"></canvas>
            <div class="camera-grid-lines">
              <div></div><div></div><div></div>
              <div></div><div></div><div></div>
              <div></div><div></div><div></div>
            </div>
            <div id="camera-flash" class="camera-shutter-flash"></div>
            
            <div class="camera-top-bar">
              <button class="nav-btn" onclick="OS.toast('Flash Auto')">⚡</button>
              <button class="nav-btn" onclick="OS.toast('HDR Active')">HDR</button>
              <button class="nav-btn" onclick="OS.toast('Leica Vibrant')">LEICA</button>
            </div>

            <div class="camera-bottom-bar">
              <div class="camera-gallery-thumb" id="camera-thumb-preview" onclick="OS.openApp('gallery')"></div>
              <button class="camera-shutter-btn" onclick="OS.takeSnapshot()"></button>
              <button class="camera-flip-btn" onclick="OS.flipCamera()">🔄</button>
            </div>
          </div>
        `;

      case 'gallery':
        const photos = this.state.capturedPhotos;
        return `
          <div style="padding:14px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
              <div style="font-size:18px;font-weight:600">All Photos (${photos.length})</div>
              <button class="nav-btn" onclick="OS.openApp('camera')" style="font-size:13px;color:var(--accent-color)">Take Photo</button>
            </div>
            <div class="gallery-grid" id="gallery-grid">
              ${photos.length === 0 ? `
                <div style="grid-column:span 3;text-align:center;padding:50px 20px;color:var(--text-muted)">
                  No snapshots yet.<br>Open the Camera app to capture photos!
                </div>
              ` : photos.map((p, idx) => `
                <div class="gallery-photo-thumb" style="background-image:url('${p.data}')" onclick="OS.viewPhoto(${idx})"></div>
              `).join('')}
            </div>
          </div>

          <div id="photo-viewer-modal" class="photo-viewer-modal">
            <div class="system-app-header" style="background:rgba(0,0,0,0.7)">
              <div class="app-header-left">
                <button class="back-btn" onclick="OS.closePhotoViewer()">✕</button>
                <div id="viewer-photo-title" class="app-header-title">Photo</div>
              </div>
            </div>
            <div id="viewer-photo-img" class="photo-viewer-img"></div>
            <div class="photo-viewer-toolbar">
              <button class="nav-btn" onclick="OS.setPhotoAsWallpaper()">🖼️ Set Wallpaper</button>
              <button class="nav-btn" onclick="OS.toggleFavoritePhoto()">❤️ Favorite</button>
              <button class="nav-btn" style="color:#ef4444" onclick="OS.deleteCurrentPhoto()">🗑️ Delete</button>
            </div>
          </div>
        `;

      case 'settings':
        return `
          <div class="settings-list">
            <!-- About Phone Banner -->
            <div class="settings-card" style="padding:20px;background:var(--accent-gradient);color:#fff">
              <div style="display:flex;align-items:center;gap:14px">
                <div style="width:48px;height:48px;border-radius:14px;background:rgba(255,255,255,0.25);display:flex;align-items:center;justify-content:center;font-size:24px">⚡</div>
                <div>
                  <div style="font-size:20px;font-weight:700">Xiaomi HyperOS</div>
                  <div style="font-size:12px;opacity:0.85">Version 2.0.4 • Android 15</div>
                </div>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px;background:rgba(0,0,0,0.18);padding:10px 14px;border-radius:12px;font-size:12px">
                <div>Model: HyperPhone 15 Pro</div>
                <div>RAM: 12 GB + 4 GB</div>
                <div>Storage: 256 GB</div>
                <div>CPU: 8-Core 3.4GHz</div>
              </div>
            </div>

            <!-- Appearance & Themes -->
            <div class="settings-card">
              <div class="settings-item" onclick="OS.setTheme('dark')">
                <div class="settings-item-left">
                  <div class="settings-item-icon" style="background:#1e293b">🌙</div>
                  <span>Dark Mode</span>
                </div>
                <span>${this.state.theme === 'dark' ? '✓' : ''}</span>
              </div>
              <div class="settings-item" onclick="OS.setTheme('light')">
                <div class="settings-item-left">
                  <div class="settings-item-icon" style="background:#f8fafc;color:#000">☀️</div>
                  <span>Light Mode</span>
                </div>
                <span>${this.state.theme === 'light' ? '✓' : ''}</span>
              </div>
              <div class="settings-item" onclick="OS.setTheme('oled')">
                <div class="settings-item-left">
                  <div class="settings-item-icon" style="background:#000000;border:1px solid #333">⚫</div>
                  <span>OLED Pure Black</span>
                </div>
                <span>${this.state.theme === 'oled' ? '✓' : ''}</span>
              </div>
            </div>

            <!-- Accent Color Picker -->
            <div class="settings-card">
              <div style="padding:14px 18px 6px;font-weight:600;font-size:13px;color:var(--text-secondary)">System Accent Color</div>
              <div class="color-palette-picker">
                ${['#007aff', '#00c6ff', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'].map(c => `
                  <div class="color-bubble ${this.state.accent === c ? 'active' : ''}" style="background:${c}" onclick="OS.applyAccent('${c}')"></div>
                `).join('')}
              </div>
            </div>

            <!-- Wallpaper Picker -->
            <div class="settings-card">
              <div style="padding:14px 18px 6px;font-weight:600;font-size:13px;color:var(--text-secondary)">Super Wallpapers</div>
              <div class="wallpaper-picker-grid">
                ${Object.keys(this.wallpapers).map(key => `
                  <div class="wallpaper-thumb ${this.state.wallpaper === key ? 'active' : ''}" style="background:${this.wallpapers[key]}" onclick="OS.applyWallpaper('${key}'); OS.toast('Wallpaper Applied')"></div>
                `).join('')}
              </div>
            </div>

            <!-- Navigation Mode -->
            <div class="settings-card">
              <div class="settings-item" onclick="OS.setNavMode('gesture')">
                <div class="settings-item-left">
                  <div class="settings-item-icon" style="background:var(--accent-color)">━</div>
                  <span>Full Screen Gestures</span>
                </div>
                <span>${this.state.navMode === 'gesture' ? '✓' : ''}</span>
              </div>
              <div class="settings-item" onclick="OS.setNavMode('button')">
                <div class="settings-item-left">
                  <div class="settings-item-icon" style="background:var(--accent-color)">◀ ● ■</div>
                  <span>3-Button Navigation</span>
                </div>
                <span>${this.state.navMode === 'button' ? '✓' : ''}</span>
              </div>
            </div>
          </div>
        `;

      case 'phone':
        return `
          <div class="dialer-screen">
            <div class="dialer-display">
              <div class="dialer-number" id="dialer-number-display"></div>
            </div>
            
            <div class="dialpad-grid">
              ${[
                ['1', ''], ['2', 'ABC'], ['3', 'DEF'],
                ['4', 'GHI'], ['5', 'JKL'], ['6', 'MNO'],
                ['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ'],
                ['*', ''], ['0', '+'], ['#', '']
              ].map(([num, letters]) => `
                <div class="dialpad-key" onclick="OS.pressDialKey('${num}')">
                  <div class="dialpad-num">${num}</div>
                  <div class="dialpad-letters">${letters}</div>
                </div>
              `).join('')}
            </div>

            <div class="dialer-action-row">
              <button class="nav-btn" style="font-size:20px" onclick="OS.clearDialKey()">⌫</button>
              <button class="call-btn" onclick="OS.makeCall()">
                <svg style="width:30px;height:30px;fill:currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
              </button>
              <button class="nav-btn" style="font-size:20px" onclick="OS.toast('Voice Mail')">🎙️</button>
            </div>
          </div>
        `;

      case 'messages':
        return `
          <div class="messages-list">
            ${this.state.messages.map(m => `
              <div class="message-thread" onclick="OS.openChat('${m.id}')">
                <div class="thread-avatar">${m.avatar}</div>
                <div style="flex:1">
                  <div style="display:flex;justify-content:space-between;margin-bottom:3px">
                    <span style="font-weight:600;font-size:14px">${m.name}</span>
                    <span style="font-size:11px;color:var(--text-muted)">${m.time}</span>
                  </div>
                  <div style="font-size:12.5px;color:var(--text-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:230px">${m.lastMsg}</div>
                </div>
              </div>
            `).join('')}
          </div>
        `;

      case 'calculator':
        return `
          <div class="calculator-screen">
            <div class="calc-display">
              <div class="calc-history" id="calc-history"></div>
              <div class="calc-result" id="calc-result">0</div>
            </div>
            <div class="calc-pad">
              <button class="calc-btn action" onclick="OS.calcOp('C')">AC</button>
              <button class="calc-btn action" onclick="OS.calcOp('+/-')">±</button>
              <button class="calc-btn action" onclick="OS.calcOp('%')">%</button>
              <button class="calc-btn op" onclick="OS.calcOp('/')">÷</button>

              <button class="calc-btn" onclick="OS.calcNum('7')">7</button>
              <button class="calc-btn" onclick="OS.calcNum('8')">8</button>
              <button class="calc-btn" onclick="OS.calcNum('9')">9</button>
              <button class="calc-btn op" onclick="OS.calcOp('*')">×</button>

              <button class="calc-btn" onclick="OS.calcNum('4')">4</button>
              <button class="calc-btn" onclick="OS.calcNum('5')">5</button>
              <button class="calc-btn" onclick="OS.calcNum('6')">6</button>
              <button class="calc-btn op" onclick="OS.calcOp('-')">−</button>

              <button class="calc-btn" onclick="OS.calcNum('1')">1</button>
              <button class="calc-btn" onclick="OS.calcNum('2')">2</button>
              <button class="calc-btn" onclick="OS.calcNum('3')">3</button>
              <button class="calc-btn op" onclick="OS.calcOp('+')">+</button>

              <button class="calc-btn" style="grid-column:span 2" onclick="OS.calcNum('0')">0</button>
              <button class="calc-btn" onclick="OS.calcNum('.')">.</button>
              <button class="calc-btn op" onclick="OS.calcOp('=')">=</button>
            </div>
          </div>
        `;

      case 'clock':
        return `
          <div style="padding:20px;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center">
            <div style="font-size:64px;font-weight:200;letter-spacing:-2px" id="stopwatch-display">00:00.0</div>
            <div style="display:flex;gap:20px;margin-top:30px">
              <button class="call-btn" id="stopwatch-toggle-btn" style="background:var(--accent-color)" onclick="OS.toggleStopwatch()">Start</button>
              <button class="call-btn" style="background:#475569" onclick="OS.resetStopwatch()">Reset</button>
            </div>
            <div id="stopwatch-laps" style="margin-top:24px;width:100%;max-height:220px;overflow-y:auto"></div>
          </div>
        `;

      case 'notes':
        return `
          <div class="notes-container">
            <button class="qs-big-tile active" style="justify-content:center;font-weight:600" onclick="OS.addNewNote()">+ New Note</button>
            <div id="notes-cards-list">
              ${this.state.notes.map(note => `
                <div class="note-card" onclick="OS.editNote(${note.id})">
                  <div style="display:flex;justify-content:space-between">
                    <div class="note-title">${note.title}</div>
                    <button class="nav-btn" style="padding:0" onclick="event.stopPropagation(); OS.deleteNote(${note.id})">🗑️</button>
                  </div>
                  <div style="font-size:13px;color:var(--text-secondary)">${note.content}</div>
                  <div class="note-date">${note.date}</div>
                </div>
              `).join('')}
            </div>
          </div>
        `;

      case 'weather':
        return `
          <div style="padding:20px;display:flex;flex-direction:column;gap:16px">
            <div class="settings-card" style="padding:24px;text-align:center;background:linear-gradient(180deg, #0284c7, #0369a1);color:#fff">
              <div style="font-size:24px;font-weight:600">San Francisco</div>
              <div style="font-size:68px;font-weight:200;margin:10px 0">24°</div>
              <div style="font-size:16px;font-weight:500">Sunny • High 27° / Low 16°</div>
            </div>

            <div class="settings-card" style="padding:16px">
              <div style="font-size:13px;font-weight:600;margin-bottom:12px;color:var(--text-secondary)">HOURLY FORECAST</div>
              <div style="display:flex;gap:16px;overflow-x:auto;padding-bottom:6px">
                ${['Now:24°:☀️', '11 AM:25°:☀️', '12 PM:26°:🌤️', '1 PM:27°:🌤️', '2 PM:26°:⛅', '3 PM:24°:⛅', '4 PM:22°:☁️'].map(h => {
                  const [time, temp, icon] = h.split(':');
                  return `
                    <div style="text-align:center;flex-shrink:0">
                      <div style="font-size:11px;color:var(--text-muted)">${time}</div>
                      <div style="font-size:20px;margin:4px 0">${icon}</div>
                      <div style="font-weight:600">${temp}</div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <div class="settings-card" style="padding:16px;display:grid;grid-template-columns:1fr 1fr;gap:12px">
              <div>
                <div style="font-size:11px;color:var(--text-muted)">HUMIDITY</div>
                <div style="font-size:18px;font-weight:700">48%</div>
              </div>
              <div>
                <div style="font-size:11px;color:var(--text-muted)">WIND</div>
                <div style="font-size:18px;font-weight:700">14 km/h NW</div>
              </div>
              <div>
                <div style="font-size:11px;color:var(--text-muted)">UV INDEX</div>
                <div style="font-size:18px;font-weight:700">5 (Moderate)</div>
              </div>
              <div>
                <div style="font-size:11px;color:var(--text-muted)">AIR QUALITY</div>
                <div style="font-size:18px;font-weight:700;color:#10b981">32 (Good)</div>
              </div>
            </div>
          </div>
        `;

      case 'browser':
        return `
          <div style="height:100%;display:flex;flex-direction:column">
            <div style="padding:10px 14px;background:var(--surface-card);display:flex;align-items:center;gap:10px">
              <input type="text" value="https://google.com" style="flex:1;background:rgba(255,255,255,0.1);border:none;padding:8px 14px;border-radius:18px;color:#fff;outline:none;font-size:13px" />
              <button class="nav-btn" onclick="OS.toast('Page Refreshed')">🔄</button>
            </div>
            <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:30px;text-align:center">
              <div style="font-size:42px;margin-bottom:12px">🌐</div>
              <div style="font-size:18px;font-weight:600">HyperBrowser 15</div>
              <div style="font-size:13px;color:var(--text-muted);margin-top:6px">Powered by Blink & Chromium Engine with ultra-fast rendering.</div>
            </div>
          </div>
        `;

      default:
        return `<div style="padding:30px;text-align:center">App content for ${appId}</div>`;
    }
  },

  // App Initialization Logic
  initAppLogic(appId) {
    if (appId === 'camera') {
      this.initCameraSimulation();
    } else if (appId === 'calculator') {
      this.calcState = { current: '0', prev: null, op: null };
    }
  },

  // ---------------- CAMERA LOGIC ----------------
  initCameraSimulation() {
    const canvas = document.getElementById('camera-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = 400;
    canvas.height = 600;

    let time = 0;
    this._cameraInterval = setInterval(() => {
      time += 0.05;
      // Draw simulated camera viewfinder scene
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, '#1e293b');
      grad.addColorStop(0.5, '#334155');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw landscape hills / objects
      ctx.fillStyle = '#064e3b';
      ctx.beginPath();
      ctx.arc(200 + Math.sin(time) * 20, 480, 160, 0, Math.PI * 2);
      ctx.fill();

      // Target reticle
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 1.5;
      const rx = canvas.width / 2 + Math.sin(time * 0.8) * 10;
      const ry = canvas.height / 2 + Math.cos(time * 0.8) * 10;
      ctx.strokeRect(rx - 25, ry - 25, 50, 50);

      // Watermark
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '12px sans-serif';
      ctx.fillText('LEICA 50mm f/1.4 ASPH', 20, canvas.height - 20);
    }, 50);

    // Update gallery thumbnail
    const thumb = document.getElementById('camera-thumb-preview');
    if (thumb && this.state.capturedPhotos.length > 0) {
      thumb.style.backgroundImage = `url('${this.state.capturedPhotos[0].data}')`;
    }
  },

  takeSnapshot() {
    sounds.playShutter();
    this.vibrate(40);
    const flash = document.getElementById('camera-flash');
    if (flash) {
      flash.style.opacity = '1';
      setTimeout(() => flash.style.opacity = '0', 120);
    }

    const canvas = document.getElementById('camera-canvas');
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      const newPhoto = {
        id: Date.now(),
        data: dataUrl,
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      this.state.capturedPhotos.unshift(newPhoto);
      localStorage.setItem('hyperos_gallery', JSON.stringify(this.state.capturedPhotos));

      const thumb = document.getElementById('camera-thumb-preview');
      if (thumb) {
        thumb.style.backgroundImage = `url('${dataUrl}')`;
      }
      this.toast('Snapshot saved to Gallery');
    }
  },

  flipCamera() {
    sounds.playTap();
    this.vibrate(20);
    this.toast('Switched to Front Camera');
  },

  // ---------------- GALLERY LOGIC ----------------
  viewPhoto(index) {
    sounds.playTap();
    this.activePhotoIndex = index;
    const photo = this.state.capturedPhotos[index];
    if (!photo) return;
    const modal = document.getElementById('photo-viewer-modal');
    const img = document.getElementById('viewer-photo-img');
    const title = document.getElementById('viewer-photo-title');
    if (modal) modal.classList.add('open');
    if (img) img.style.backgroundImage = `url('${photo.data}')`;
    if (title) title.innerText = `Photo • ${photo.date}`;
  },

  closePhotoViewer() {
    const modal = document.getElementById('photo-viewer-modal');
    if (modal) modal.classList.remove('open');
  },

  setPhotoAsWallpaper() {
    sounds.playTap();
    this.vibrate(20);
    const photo = this.state.capturedPhotos[this.activePhotoIndex];
    if (photo) {
      this.applyWallpaper(photo.data);
      this.toast('Applied as Home Screen Wallpaper');
      this.closePhotoViewer();
    }
  },

  toggleFavoritePhoto() {
    sounds.playTap();
    this.toast('Added to Favorites');
  },

  deleteCurrentPhoto() {
    sounds.playTap();
    this.vibrate(25);
    if (this.activePhotoIndex !== undefined) {
      this.state.capturedPhotos.splice(this.activePhotoIndex, 1);
      localStorage.setItem('hyperos_gallery', JSON.stringify(this.state.capturedPhotos));
      this.closePhotoViewer();
      this.openApp('gallery');
      this.toast('Photo deleted');
    }
  },

  // ---------------- SETTINGS LOGIC ----------------
  setTheme(theme) {
    sounds.playTap();
    this.vibrate(15);
    this.state.theme = theme;
    this.applyTheme();
    this.openApp('settings');
  },

  setNavMode(mode) {
    sounds.playTap();
    this.vibrate(15);
    this.state.navMode = mode;
    localStorage.setItem('hyperos_nav_mode', mode);
    document.body.classList.toggle('nav-button-mode', mode === 'button');
    this.openApp('settings');
  },

  // ---------------- DIALER LOGIC ----------------
  pressDialKey(num) {
    sounds.playTone(300 + num.charCodeAt(0) * 15, 0.1);
    this.vibrate(15);
    const display = document.getElementById('dialer-number-display');
    if (display) {
      display.innerText += num;
    }
  },

  clearDialKey() {
    sounds.playTap();
    const display = document.getElementById('dialer-number-display');
    if (display && display.innerText.length > 0) {
      display.innerText = display.innerText.slice(0, -1);
    }
  },

  makeCall() {
    const display = document.getElementById('dialer-number-display');
    const num = display ? display.innerText : '';
    if (!num) {
      this.toast('Please enter a phone number');
      return;
    }
    sounds.playTone(440, 0.4);
    this.vibrate(30);
    this.toast(`Calling ${num}...`);
  },

  // ---------------- MESSAGES LOGIC ----------------
  openChat(threadId) {
    sounds.playTap();
    const thread = this.state.messages.find(m => m.id === threadId);
    if (!thread) return;
    const history = this.state.chatHistory[threadId] || [];

    const content = document.getElementById('app-content-body');
    if (!content) return;
    content.innerHTML = `
      <div style="height:100%;display:flex;flex-direction:column">
        <div style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px" id="chat-messages-container">
          ${history.map(msg => `
            <div style="align-self:${msg.sender === 'me' ? 'flex-end' : 'flex-start'};max-width:75%;background:${msg.sender === 'me' ? 'var(--accent-color)' : 'var(--surface-card)'};color:#fff;padding:10px 14px;border-radius:18px;font-size:13.5px">
              ${msg.text}
            </div>
          `).join('')}
        </div>
        <div style="padding:10px 14px;background:var(--surface-card);display:flex;gap:10px;align-items:center">
          <input type="text" id="chat-input" placeholder="Type a message..." style="flex:1;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);padding:10px 16px;border-radius:22px;color:#fff;outline:none" onkeydown="if(event.key==='Enter') OS.sendChatMessage('${threadId}')" />
          <button class="call-btn" style="width:40px;height:40px" onclick="OS.sendChatMessage('${threadId}')">➤</button>
        </div>
      </div>
    `;
  },

  sendChatMessage(threadId) {
    const input = document.getElementById('chat-input');
    if (!input || !input.value.trim()) return;
    const text = input.value.trim();
    input.value = '';

    sounds.playTone(600, 0.08);
    this.vibrate(15);

    if (!this.state.chatHistory[threadId]) this.state.chatHistory[threadId] = [];
    this.state.chatHistory[threadId].push({ sender: 'me', text });
    this.openChat(threadId);

    // Automated smart reply simulation
    setTimeout(() => {
      sounds.playTone(800, 0.1);
      this.vibrate(20);
      this.state.chatHistory[threadId].push({ sender: 'them', text: 'Got your message! HyperOS is super fast.' });
      this.openChat(threadId);
    }, 1000);
  },

  // ---------------- CALCULATOR LOGIC ----------------
  calcNum(digit) {
    sounds.playTap();
    this.vibrate(10);
    if (!this.calcState) this.calcState = { current: '0', prev: null, op: null };
    if (this.calcState.current === '0' && digit !== '.') {
      this.calcState.current = digit;
    } else {
      this.calcState.current += digit;
    }
    const res = document.getElementById('calc-result');
    if (res) res.innerText = this.calcState.current;
  },

  calcOp(op) {
    sounds.playTap();
    this.vibrate(12);
    if (!this.calcState) this.calcState = { current: '0', prev: null, op: null };
    if (op === 'C') {
      this.calcState = { current: '0', prev: null, op: null };
    } else if (op === '=') {
      if (this.calcState.op && this.calcState.prev !== null) {
        const a = parseFloat(this.calcState.prev);
        const b = parseFloat(this.calcState.current);
        let ans = 0;
        if (this.calcState.op === '+') ans = a + b;
        if (this.calcState.op === '-') ans = a - b;
        if (this.calcState.op === '*') ans = a * b;
        if (this.calcState.op === '/') ans = b !== 0 ? a / b : 'Error';
        this.calcState.current = String(ans);
        this.calcState.op = null;
        this.calcState.prev = null;
      }
    } else {
      this.calcState.prev = this.calcState.current;
      this.calcState.op = op;
      this.calcState.current = '0';
    }
    const res = document.getElementById('calc-result');
    if (res) res.innerText = this.calcState.current;
  },

  // ---------------- STOPWATCH LOGIC ----------------
  toggleStopwatch() {
    sounds.playTap();
    this.vibrate(15);
    const btn = document.getElementById('stopwatch-toggle-btn');
    if (this._swInterval) {
      clearInterval(this._swInterval);
      this._swInterval = null;
      if (btn) btn.innerText = 'Resume';
    } else {
      if (btn) btn.innerText = 'Pause';
      const start = Date.now() - (this._swElapsed || 0);
      this._swInterval = setInterval(() => {
        this._swElapsed = Date.now() - start;
        const totalSec = Math.floor(this._swElapsed / 1000);
        const mins = String(Math.floor(totalSec / 60)).padStart(2, '0');
        const secs = String(totalSec % 60).padStart(2, '0');
        const tenths = Math.floor((this._swElapsed % 1000) / 100);
        const disp = document.getElementById('stopwatch-display');
        if (disp) disp.innerText = `${mins}:${secs}.${tenths}`;
      }, 50);
    }
  },

  resetStopwatch() {
    sounds.playTap();
    this.vibrate(15);
    if (this._swInterval) {
      clearInterval(this._swInterval);
      this._swInterval = null;
    }
    this._swElapsed = 0;
    const disp = document.getElementById('stopwatch-display');
    const btn = document.getElementById('stopwatch-toggle-btn');
    if (disp) disp.innerText = '00:00.0';
    if (btn) btn.innerText = 'Start';
  },

  // ---------------- NOTES LOGIC ----------------
  addNewNote() {
    sounds.playTap();
    const title = prompt('Enter note title:');
    if (!title) return;
    const content = prompt('Enter note description:') || '';
    const newNote = {
      id: Date.now(),
      title,
      content,
      date: 'Just now'
    };
    this.state.notes.unshift(newNote);
    localStorage.setItem('hyperos_notes', JSON.stringify(this.state.notes));
    this.openApp('notes');
    this.toast('Note Created');
  },

  deleteNote(id) {
    sounds.playTap();
    this.vibrate(15);
    this.state.notes = this.state.notes.filter(n => n.id !== id);
    localStorage.setItem('hyperos_notes', JSON.stringify(this.state.notes));
    this.openApp('notes');
    this.toast('Note Deleted');
  },

  editNote(id) {
    const note = this.state.notes.find(n => n.id === id);
    if (!note) return;
    const newBody = prompt(`Edit note "${note.title}":`, note.content);
    if (newBody !== null) {
      note.content = newBody;
      localStorage.setItem('hyperos_notes', JSON.stringify(this.state.notes));
      this.openApp('notes');
      this.toast('Note Updated');
    }
  },

  // Event Handlers for Gestures and Navigation
  bindEvents() {
    // Top Status bar pull-down gesture
    const statusBar = document.getElementById('status-bar');
    if (statusBar) {
      statusBar.addEventListener('click', () => this.toggleShade());
    }

    // Touch dragging on Home Screen for Shade and Drawer
    let startY = 0;
    let startX = 0;

    document.addEventListener('touchstart', (e) => {
      startY = e.touches[0].clientY;
      startX = e.touches[0].clientX;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      const endY = e.changedTouches[0].clientY;
      const endX = e.changedTouches[0].clientX;
      const diffY = endY - startY;
      const diffX = endX - startX;

      // Vertical swipe
      if (Math.abs(diffY) > 65 && Math.abs(diffY) > Math.abs(diffX)) {
        if (diffY > 0 && startY < 120 && !this.state.activeApp) {
          // Swipe down from top -> Open Quick Settings
          this.openShade();
        } else if (diffY < 0 && startY > window.innerHeight - 150 && !this.state.activeApp) {
          // Swipe up from bottom -> Open App Drawer
          this.openDrawer();
        } else if (diffY > 0 && this.state.isDrawerOpen) {
          this.closeDrawer();
        }
      }

      // Horizontal swipe on home screen -> switch pager page
      if (Math.abs(diffX) > 60 && Math.abs(diffX) > Math.abs(diffY) && !this.state.activeApp && !this.state.isShadeOpen && !this.state.isDrawerOpen) {
        if (diffX < 0 && this.state.activePage === 0) {
          this.switchPage(1);
        } else if (diffX > 0 && this.state.activePage === 1) {
          this.switchPage(0);
        }
      }
    }, { passive: true });

    // Gesture Bar Swipe and Tap
    const pill = document.querySelector('.gesture-pill');
    if (pill) {
      pill.addEventListener('click', () => {
        sounds.playTap();
        this.vibrate(10);
        if (this.state.activeApp) {
          this.closeApp();
        } else if (this.state.isDrawerOpen) {
          this.closeDrawer();
        } else if (this.state.isShadeOpen) {
          this.closeShade();
        } else if (this.state.isRecentsOpen) {
          this.closeRecents();
        }
      });

      // Long press / swipe up for Recents
      let pillTouchTimer;
      pill.addEventListener('touchstart', () => {
        pillTouchTimer = setTimeout(() => {
          this.openRecents();
        }, 350);
      }, { passive: true });
      pill.addEventListener('touchend', () => clearTimeout(pillTouchTimer), { passive: true });
    }
  }
};

// Global Back Handler called from Android Native onBackPressed
window.handleSystemBack = function() {
  if (OS.state.isShadeOpen) {
    OS.closeShade();
    return true;
  }
  if (OS.state.isDrawerOpen) {
    OS.closeDrawer();
    return true;
  }
  if (OS.state.isRecentsOpen) {
    OS.closeRecents();
    return true;
  }
  if (OS.state.activeApp) {
    OS.closeApp();
    return true;
  }
  return false;
};

// Initialize OS when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  OS.init();
});
