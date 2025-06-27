/**
 * ╭─────────────────────────────────────────────────────────────────────────╮
 * │                            Obsidian Termynal                            │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ Animated terminal for Obsidian DataviewJS                               │
 * │ Based on Termynal.js by Ines Montani (https://github.com/ines/termynal) │
 * ╰─────────────────────────────────────────────────────────────────────────╯
 * 
 * @version     0.0.1
 * @author      MATrsx
 * @requires    Obsidian DataviewJS
 * @repo        https://github.com/MATrsx/obsidian-termynal
 * @license     MIT
 */

const DEFAULT_CONFIG = {
    title: 'Terminal', 
    theme: 'macos', 
    startDelay: 600, 
    typeDelay: 90, 
    lineDelay: 1500,
    cursor: '▋', 
    autoStart: true,
    loop: false, 
    showControls: true, 
    highlightSyntax: false, 
    copyable: false,
    resizable: false, 
    fullscreen: false, 
    defaultPrompt: '$', 
    defaultPromptColor: '#a2a2a2',
    height: 'auto', 
    width: '100%',
    lines: []
};

// Instanz-Registry mit WeakMap für bessere Performance
const instanceRegistry = new WeakMap();

// Globaler Style-Manager für einmalige Initialisierung
class TermynalStyleManager {
    static initialized = false;
    
    static initializeOnce() {
        if (this.initialized) return;
        
        const styleId = 'obsidian-termynal-styles-enhanced';
        if (document.getElementById(styleId)) {
            this.initialized = true;
            return;
        }
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .obsidian-termynal {
                --color-bg: #252a33;
                --color-text: #eee;
                --color-text-subtle: #a2a2a2;
                --color-accent: #61dafb;
                --color-error: #ff6b6b;
                --color-warning: #f4c025;
                --color-success: #51cf66;
                --color-comment: #4a968f;
                
                max-width: 100%;
                overflow-x: auto;
                background: var(--color-bg);
                color: var(--color-text);
                font-size: 14px;
                font-family: 'Roboto Mono', 'Fira Mono', Consolas, Menlo, Monaco, 'Courier New', Courier, monospace;
                border-radius: 8px;
                padding: 75px 20px 20px;
                position: relative;
                box-sizing: border-box;
                margin: 1em 0;
                min-height: 200px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            }
            /* Theme variations */
            .obsidian-termynal[data-theme="light"] {
                --color-bg: #ffffff;
                --color-text: #333333;
                --color-text-subtle: #666666;
                border: 1px solid #e0e0e0;
            }
            .obsidian-termynal[data-theme="ubuntu"] {
                --color-bg: #300a24;
                --color-text: #ffffff;
                --color-accent: #e95420;
            }
            /* Window decorations */
            .obsidian-termynal[data-ty-macos]:before {
                content: '';
                position: absolute;
                top: 15px;
                left: 15px;
                display: inline-block;
                width: 15px;
                height: 15px;
                border-radius: 50%;
                background: #d9515d;
                box-shadow: 25px 0 0 #f4c025, 50px 0 0 #3ec930;
            }

            .obsidian-termynal[data-ty-windows]:before {
                content: '';
                position: absolute;
                top: 15px;
                right: 15px;
                display: inline-block;
                width: 15px;
                height: 15px;
                background: #d9515d;
                box-shadow: -25px 0 0 #e6e6e6, -50px 0 0 #e6e6e6;
            }
            .obsidian-termynal[data-ty-ubuntu]:before {
                content: '●';
                position: absolute;
                top: 5px;
                left: 15px;
                color: var(--color-accent);
                font-size: 20px;
            }

            .obsidian-termynal:after {
                content: attr(data-ty-title);
                position: absolute;
                color: var(--color-text-subtle);
                top: 12px;
                left: 0;
                width: 100%;
                text-align: center;
            }
            /* Controls */
            .termynal-controls {
                position: absolute;
                top: 35px;
                right: 10px;
                display: flex;
                gap: 10px;
            }
            .obsidian-termynal[data-ty-windows] .termynal-controls {
                top: 45px;
            }
            .obsidian-termynal[data-ty-macos] .termynal-controls {
                top: 45px;
            }
            .obsidian-termynal[data-ty-ubuntu] .termynal-controls {
                top: 45px;
            }

            button[data-terminal-control] {
                color: #aebbff;
                background: none !important;
                border: none;
                padding: 4px 8px !important;
                cursor: pointer;
                box-shadow: none !important;
                border-radius: 4px;
                font-size: 11px;
                transition: all 0.2s ease;
            }

            button[data-terminal-control]:hover {
                color: #fff;
                background: rgba(255,255,255,0.1) !important;
                box-shadow: none !important;
            }
            .termynal-start-button {
                display: block;
                margin: 20px auto;
                color: #aebbff !important;
                background: none !important;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-family: inherit;
                font-size: 14px;
                transition: all 0.2s ease;
                box-shadow: none !important;
            }
            .termynal-start-button:hover {
                transform: translateY(-2px);
                background: none !important;
            }
            /* Progress info */
            .termynal-progress-info {
                position: absolute;
                bottom: 10px;
                right: 15px;
                font-size: 11px;
                color: var(--color-text-subtle);
                display: flex;
                gap: 15px;
            }
            /* Line styling */            
            .termynal-line {
                display: block;
                line-height: 1.8;
                white-space: pre-wrap;
                word-wrap: break-word;
                flex: 1;
            }

            .termynal-line:before {
                content: '';
                display: inline-block;
                vertical-align: middle;
            }

            .termynal-line[data-ty="input"]:before,
            .termynal-line[data-ty-prompt]:before {
                margin-right: 0.75em;
                color: var(--color-text-subtle);
            }

            /* Prompt-Farben über CSS Custom Properties */
            .termynal-line[data-ty-prompt-color]:before {
                color: var(--prompt-color) !important;
            }

            .termynal-line[data-ty="input"]:before {
                content: '$';
            }

            .termynal-line[data-ty-prompt]:before {
                content: attr(data-ty-prompt);
            }

            .termynal-line[data-ty="output"] {
                color: var(--color-text);
            }

            .termynal-line[data-ty="comment"] {
                color: var(--color-comment);
                font-style: italic;
            }

            .termynal-line[data-ty="error"] {
                color: var(--color-error);
            }
            .termynal-line[data-ty="warning"] {
                color: var(--color-warning);
            }

            .termynal-line[data-ty="success"] {
                color: var(--color-success);
            }
            /* Syntax highlighting */
            .keyword { color: #ff79c6; font-weight: bold; }
            .string { color: #f1fa8c; }
            .comment { color: #6272a4; font-style: italic; }
            .number { color: #bd93f9; }

            .termynal-cursor:after {
                content: '▋';
                font-family: monospace;
                margin-left: 0.2em;
                animation: termynal-blink 1s infinite;
                color: var(--color-accent);
            }

            @keyframes termynal-blink {
                50% { opacity: 0; }
            }
            /* Notifications */
            .termynal-notification {
                position: absolute;
                bottom: 50px;
                right: 15px;
                background: var(--color-success);
                color: var(--color-bg);
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 12px;
                animation: slideInOut 3s ease-in-out;
            }
            @keyframes slideInOut {
                0%, 100% { opacity: 0; transform: translateX(100%); }
                10%, 90% { opacity: 1; transform: translateX(0); }
            }
            /* Fullscreen mode */
            .obsidian-termynal:fullscreen {
                padding: 100px 40px 40px;
                font-size: 16px;
            }
            /* Responsive design */
            @media (max-width: 768px) {
                .obsidian-termynal {
                    font-size: 12px;
                    padding: 60px 15px 15px;
                }
                
                .termynal-controls {
                    flex-direction: column;
                    gap: 5px;
                }
                
                .termynal-progress-info {
                    flex-direction: column;
                    gap: 5px;
                }
            }
        `;
        
        document.head.appendChild(style);
        this.initialized = true;
    }
}

// Event-Manager für bessere Event-Behandlung
class TermynalEventManager {
    constructor(termynal) {
        this.termynal = termynal;
        this.listeners = new Map();
        this.eventListeners = new Map();
    }

    emit(event, data = {}) {
        // Emit für interne Event-Listener
        if (this.listeners && this.listeners.has(event)) {
            const eventListeners = this.listeners.get(event);
            if (Array.isArray(eventListeners)) {
                eventListeners.forEach(callback => {
                    try {
                        callback(data);
                    } catch (err) {
                        console.error(`Error in event listener for ${event}:`, err);
                    }
                });
            }
        }

        // Emit für externe Event-Listener (on/off API)
        if (this.eventListeners && this.eventListeners.has(event)) {
            const callbacks = this.eventListeners.get(event);
            callbacks.forEach(callback => {
                try {
                    callback(data);
                } catch (err) {
                    console.error(`Error in external event listener for ${event}:`, err);
                }
            });
        }
    }
    
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, new Set());
        }
        this.eventListeners.get(event).add(callback);
    }

    off(event, callback) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).delete(callback);
            if (this.eventListeners.get(event).size === 0) {
                this.eventListeners.delete(event);
            }
        }
    }

    removeAllListeners() {
        this.eventListeners.clear();
    }
    
    handleControlClick(controlType) {
        const handlers = {
            'speed': () => this.termynal.toggleSpeed(),
            'pause': () => this.termynal.togglePause(),
            'restart': () => this.termynal.restart(),
            'copy': () => this.termynal.copyContent(),
            'fullscreen': () => this.termynal.toggleFullscreen()
        };
        
        handlers[controlType]?.();
    }
    
    destroy() {
        this.listeners.forEach((handler, event) => {
            this.termynal.container.removeEventListener(event, handler);
        });
        this.listeners.clear();
        this.eventListeners.clear();
    }
}

// Timer-Manager für robuste Timer-Verwaltung
class TimerManager {
    constructor() {
        this.timeouts = new Set();
        this.intervals = new Map();
    }
    
    setTimeout(fn, delay) {
        return new Promise(resolve => {
            const timeout = setTimeout(() => {
                this.timeouts.delete(timeout);
                fn();
                resolve();
            }, delay);
            this.timeouts.add(timeout);
        });
    }
    
    setTimer(fn, delay, id) {
        if (this.intervals.has(id)) {
            clearInterval(this.intervals.get(id));
        }
        const interval = setInterval(fn, delay);
        this.intervals.set(id, interval);
        return interval;
    }
    
    setInterval(fn, delay, id) {
        if (this.intervals.has(id)) {
            clearInterval(this.intervals.get(id));
        }
        const interval = setInterval(fn, delay);
        this.intervals.set(id, interval);
        return interval;
    }
    
    clearAll() {
        this.timeouts.forEach(id => {
            try {
                clearTimeout(id);
            } catch (e) {
                console.warn('Failed to clear timeout:', e);
            }
        });
        this.timeouts.clear();
        
        this.intervals.forEach((interval, key) => {
            try {
                clearInterval(interval);
            } catch (e) {
                console.warn(`Failed to clear interval ${key}:`, e);
            }
        });
        this.intervals.clear();
    }

    getActiveCount() {
        return this.timeouts.size + this.intervals.size;
    }
}

// DOM-Cache für bessere Performance
class DOMCache {
    constructor(container) {
        this.container = container;
        this.cache = new Map();
    }
    
    get(selector) {
        if (!this.cache.has(selector)) {
            this.cache.set(selector, this.container.querySelector(selector));
        }
        return this.cache.get(selector);
    }
    
    getAll(selector) {
        const cacheKey = `all:${selector}`;
        if (!this.cache.has(cacheKey)) {
            this.cache.set(cacheKey, this.container.querySelectorAll(selector));
        }
        return this.cache.get(cacheKey);
    }
    
    set(key, element) {
        this.cache.set(key, element);
    }
    
    invalidate(selector = null) {
        if (selector) {
            this.cache.delete(selector);
            this.cache.delete(`all:${selector}`);
        } else {
            this.cache.clear();
        }
    }

    getCacheSize() {
        return this.cache.size;
    }
}

// Modulare Renderer-Klasse für bessere Trennung der Verantwortlichkeiten
class TermynalRenderer {
    constructor(termynal) {
        this.termynal = termynal;
        this.domCache = termynal.domCache;
        this.events = termynal.events;
    }

    renderStartButton() {
        const btn = this.termynal.$('button', {
            className: 'termynal-start-button',
            innerHTML: '▶ Start Terminal Animation',
            onclick: e => { 
                e.preventDefault(); 
                btn.remove(); 
                this.termynal.start(); 
            }
        });
        this.termynal.container.appendChild(btn);
        this.domCache.set('startButton', btn);
    }

    renderControls() {
        if (!this.termynal.config.showControls) return;
        
        const controls = this.termynal.$('div', { className: 'termynal-controls' });
        const buttons = new Map();
        
        const btnConfigs = [
            ['speed', 'fast →'],
            ['pause', 'pause ⏸'],
            ['restart', 'restart ↻'],
            ...(this.termynal.config.copyable ? [['copy', 'copy ⎘']] : []),
            ...(this.termynal.config.fullscreen ? [['fullscreen', 'fullscreen ⛶']] : [])
        ];
        
        btnConfigs.forEach(([id, text]) => {
            const btn = this.termynal.$('button', {
                innerHTML: text, 
                'data-terminal-control': id,
                onclick: e => { e.preventDefault(); this.events.handleControlClick.bind(this, id)(); }
            });
            controls.appendChild(btn);
            buttons.set(id, btn);
        });
        
        this.termynal.container.appendChild(controls);
        this.termynal.elements.set('controls', controls);
        this.termynal.elements.set('buttons', buttons);
        this.domCache.set('controls', controls);
    }

    renderProgressInfo() {
        const info = this.termynal.$('div', {
            className: 'termynal-progress-info',
            innerHTML: `<span class="current-line">Line: 1/${this.termynal.config.lines.length}</span><span class="elapsed-time">Time: 00:00</span>`
        });
        
        this.termynal.container.appendChild(info);
        this.termynal.elements.set('progressInfo', info);
        this.domCache.set('progressInfo', info);
        
        this.termynal.timers.setTimer(() => {
            if (this.termynal.state.isRunning && !this.termynal.state.isPaused) {
                const timeSpan = info.querySelector('.elapsed-time');
                if (timeSpan) timeSpan.textContent = `Time: ${this.termynal.formatTime(this.termynal.getElapsed())}`;
            }
        }, 1000, 'progress');
    }

    createLine(lineData) {
        const line = this.termynal.$('div', { 
            className: 'termynal-line', 
            'data-ty': lineData.type 
        });
        
        if (lineData.type === 'input' || lineData.defaultPrompt) {
            const prompt = lineData.prompt || this.termynal.config.defaultPrompt;
            const color = lineData.promptColor || this.termynal.config.defaultPromptColor;
            if (prompt) line.setAttribute('data-ty-prompt', prompt);
            if (color) {
                line.setAttribute('data-ty-prompt-color', color);
                line.style.setProperty('--prompt-color', color);
            }
        }
        
        if (lineData.class) line.classList.add(lineData.class);
        return line;
    }

    updateProgressInfo() {
        const info = this.domCache.get('.termynal-progress-info');
        if (!info) return;
        
        const currentLineSpan = info.querySelector('.current-line');
        const timeSpan = info.querySelector('.elapsed-time');
        
        if (currentLineSpan) {
            currentLineSpan.textContent = `Line: ${this.termynal.state.currentLine + 1}/${this.termynal.config.lines.length}`;
        }
        
        if (timeSpan && this.termynal.state.isRunning) {
            timeSpan.textContent = `Time: ${this.termynal.formatTime(this.termynal.getElapsed())}`;
        }
    }

    updateButton(buttonId, newText) {
        const buttons = this.termynal.elements.get('buttons');
        if (buttons && buttons.has(buttonId)) {
            buttons.get(buttonId).innerHTML = newText;
        }
    }

    resetButtons() {
        const buttons = this.termynal.elements.get('buttons');
        if (!buttons) return;
        
        const defaultTexts = {
            'speed': 'fast →',
            'pause': 'pause ⏸',
            'restart': 'restart ↻',
            'copy': 'copy 📋',
            'fullscreen': 'fullscreen ⛶'
        };
        
        buttons.forEach((btn, id) => {
            if (defaultTexts[id]) {
                btn.innerHTML = defaultTexts[id];
            }
        });
    }

    showNotification(message) {
        const notification = this.termynal.$('div', {
            className: 'termynal-notification',
            textContent: message
        });
        
        this.termynal.container.appendChild(notification);
        
        // Entferne Benachrichtigung nach 3 Sekunden
        this.termynal.timers.setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }

    renderOnce() {
        if (!this.termynal.container.querySelector('.termynal-controls')) {
            this.renderControls();
        }
        
        if (!this.termynal.container.querySelector('.termynal-progress-info')) {
            this.renderProgressInfo();
        }
    }
}

// Modulare Animator-Klasse für Animation-Logik
class TermynalAnimator {
    constructor(termynal) {
        this.termynal = termynal;
        this.outputTypes = new Set(['output', 'comment', 'warning', 'success', 'error']);
    }

    async typeText(line, text, customDelay) {
        line.classList.add('termynal-cursor');
        this.termynal.container.appendChild(line);
        
        // Optimierte String-Erstellung mit Array-Buffer
        const chars = [...text];
        const buffer = [];
        
        for (let i = 0; i < chars.length; i++) {
            const delay = this.termynal.timing.typeDelay === 0 ? 0 : customDelay ?? this.termynal.timing.typeDelay;
            if (!this.termynal.state.isRunning) break;
            await this.termynal.waitPause();
            await this.termynal.wait(delay);
            
            buffer.push(chars[i]);
            line.textContent = buffer.join('');
        }
        
        line.classList.remove('termynal-cursor');
    }

    async revealText(line, text) {
        this.termynal.container.appendChild(line);
        
        if (this.termynal.config.highlightSyntax && text.includes('```')) {
            line.innerHTML = this.highlightSyntax(text);
        } else {
            line.textContent = text;
        }
        
        // CSS-Klassen statt Inline-Styles für bessere Performance
        line.classList.add('termynal-fade-in');
        await this.termynal.wait(50);
        line.classList.add('termynal-fade-in-complete');
    }

    async animateProgress(line, lineData) {
        line.textContent = '';
        this.termynal.container.appendChild(line);
        
        const animations = {
            spinner: async () => {
                const chars = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
                const duration = lineData.duration || 3000;
                const start = Date.now();
                let i = 0;
                
                while (Date.now() - start < duration && this.termynal.state.isRunning) {
                    await this.termynal.waitPause();
                    line.textContent = `${chars[i % chars.length]} ${lineData.text || 'Loading...'}`;
                    i++;
                    await this.termynal.wait(this.termynal.timing.typeDelay);
                }
                line.textContent = `✓ ${lineData.text || 'Loading...'} completed!`;
            },
            
            dots: async () => {
                const maxDots = lineData.maxDots || 3;
                const cycles = lineData.cycles || 3;
                
                for (let cycle = 0; cycle < cycles; cycle++) {
                    for (let dots = 0; dots <= maxDots; dots++) {
                        if (!this.termynal.state.isRunning) break;
                        await this.termynal.waitPause();
                        line.textContent = `${lineData.text || 'Loading'}${'.'.repeat(dots)}`;
                        await this.termynal.wait(Math.max(100, this.termynal.timing.typeDelay * 5));
                    }
                }
            },
            
            bar: async () => {
                const length = lineData.length || 40;
                const completeChar = lineData.completeChar || '█';
                const incompleteChar = lineData.incompleteChar || '░';
                const maxPercent = lineData.percent || 100;
                
                for (let i = 1; i <= length; i++) {
                    if (!this.termynal.state.isRunning) break;
                    await this.termynal.waitPause();
                    await this.termynal.wait(this.termynal.timing.typeDelay);
                    
                    const percent = Math.round(i / length * 100);
                    const progress = completeChar.repeat(i);
                    const remaining = incompleteChar.repeat(length - i);
                    line.textContent = `[${progress}${remaining}] ${percent}%`;
                    
                    if (percent >= maxPercent) break;
                }
            }
        };
        
        await (animations[lineData.style] || animations.bar)();
    }

    highlightSyntax(text) {
        const patterns = [
            [/\b(function|const|let|var|if|else|for|while|return)\b/g, 'keyword'],
            [/(['"])((?:\\.|(?!\1)[^\\])*?)\1/g, 'string'],
            [/\/\/.*$/gm, 'comment'],
            [/\b\d+\b/g, 'number']
        ];
        return patterns.reduce((acc, [regex, cls]) => acc.replace(regex, `<span class="${cls}">$&</span>`), text);
    }

    // Optimierte Batch-Verarbeitung mit O(n) Komplexität
    collectOutputBatch(startIndex, lineQueue) {
        const batch = [];
        
        for (let i = startIndex; i < lineQueue.length; i++) {
            const lineData = lineQueue[i];
            const lineId = `${this.termynal.instanceId}_line_${lineData.originalIndex}`;
            
            // Früher Ausstieg bei bereits verarbeiteten Zeilen
            if (this.termynal.state.processedLines.has(lineId)) {
                if (batch.length === 0) continue;
                break;
            }
            
            // Verwendung von Set für O(1) Lookup
            if (!this.outputTypes.has(lineData.type)) break;
            
            batch.push({ lineData, index: i });
            if (lineData.lineDelay !== undefined) break;
        }
        
        return batch;
    }
}

class ObsidianTermynal {
    constructor(options) {
        this.container = dv.container;
        this.config = { ...DEFAULT_CONFIG, ...options };
        this.instanceId = this.generateInstanceId();
        
        if (this.isAlreadyInitialized()) return;
        
        // Initialisiere elements Map BEFORE andere Klassen
        this.elements = new Map();
        
        // Verwende die bereits existierenden Klassen
        this.timers = new TimerManager();
        this.domCache = new DOMCache(this.container);
        this.events = new TermynalEventManager(this);
        this.renderer = new TermynalRenderer(this);
        this.animator = new TermynalAnimator(this);
        
        this.state = { 
            isRunning: false,
            isPaused: false,
            currentLine: 0,
            startTime: 0,
            pausedTime: 0,
            pauseStart: 0,
            restarting: false,
            processedLines: new Set(),
            lineQueue: this.generateLineQueue()
        };
        
        this.timing = { 
            ...this.config, 
            original: { 
                startDelay: this.config.startDelay, 
                typeDelay: this.config.typeDelay, 
                lineDelay: this.config.lineDelay 
            } 
        };
        
        // Memoization für Line Queue
        this._lineQueueCache = null;
        this._lineQueueHash = null;
        
        this.markAsInitialized();
        this.init();
    }

    // Optimierte Initialisierung
    init() {
        TermynalStyleManager.initializeOnce();
        this.setupContainer();
        this.config.autoStart ? this.start() : this.renderer.renderStartButton();
    }

    generateInstanceId() {
        const configStr = JSON.stringify({ 
            lines: this.config.lines, 
            title: this.config.title, 
            theme: this.config.theme 
        });
        let hash = 0;
        for (let i = 0; i < configStr.length; i++) {
            hash = ((hash << 5) - hash) + configStr.charCodeAt(i);
            hash = hash & hash;
        }
        return `termynal_${Math.abs(hash).toString(36).slice(0, 8)}`;
    }

    // Vereinfachte Instanz-Erkennung mit WeakMap
    isAlreadyInitialized() {
        return instanceRegistry.has(this.container);
    }

    markAsInitialized() {
        instanceRegistry.set(this.container, {
            id: this.instanceId,
            timestamp: Date.now()
        });
    }

    setupContainer() {
        if (this.container.hasAttribute('data-termynal-setup')) return;
        
        this.container.innerHTML = '';
        this.container.className = 'obsidian-termynal';
        
        const attrs = {
            'data-termynal': '', 
            'data-ty-title': this.config.title, 
            'data-theme': this.config.theme,
            [`data-ty-${this.config.theme}`]: '', 
            'data-termynal-setup': 'true'
        };
        Object.entries(attrs).forEach(([k, v]) => this.container.setAttribute(k, v));
        
        const styles = {};
        if (this.config.height !== 'auto') styles.height = this.config.height;
        if (this.config.width !== '100%') styles.width = this.config.width;
        if (this.config.resizable) { 
            styles.resize = 'both'; 
            styles.overflow = 'auto'; 
        }
        Object.assign(this.container.style, styles);
    }

    // Memoized line queue generation für bessere Performance
    generateLineQueue() {
        const configHash = this.getConfigHash();
        if (!this._lineQueueCache || this._lineQueueHash !== configHash) {
            this._lineQueueCache = this.config.lines.map((line, index) => ({ 
                ...line, 
                originalIndex: index 
            }));
            this._lineQueueHash = configHash;
        }
        return [...this._lineQueueCache];
    }

    getConfigHash() {
        return JSON.stringify(this.config.lines.map(line => ({ 
            type: line.type, 
            text: line.text, 
            originalIndex: line.originalIndex 
        })));
    }

    // Utility methods mit optimierter Promise-Behandlung
    $(tag, attrs = {}) {
        const el = document.createElement(tag);
        
        Object.entries(attrs).forEach(([key, value]) => {
            if (key === 'className') {
                el.className = value;
            } else if (key === 'innerHTML') {
                el.innerHTML = value;
            } else if (key === 'textContent') {
                el.textContent = value;
            } else if (key.startsWith('on') && typeof value === 'function') {
                el.addEventListener(key.slice(2).toLowerCase(), value);
            } else if (key.startsWith('data-')) {
                el.setAttribute(key, value);
            } else {
                el.setAttribute(key, value);
            }
        });
        
        return el;
    }

    wait(ms) {
        return new Promise(resolve => {
            this.timers.setTimeout(resolve, ms);
        });
    }

    async waitPause() {
        while (this.state.isPaused && this.state.isRunning) {
            await this.wait(100);
        }
    }

    getElapsed() {
        if (!this.state.startTime) return 0;
        const now = Date.now();
        const pausedTime = this.state.isPaused ? 
            this.state.pausedTime + (now - this.state.pauseStart) : 
            this.state.pausedTime;
        return Math.floor((now - this.state.startTime - pausedTime) / 1000);
    }

    formatTime(s) {
        return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
    }

    // Optimierte Animation methods mit robuster Fehlerbehandlung
    async start() {
        if (this.state.isRunning && !this.state.restarting) return;

        // Bereinige Start-Button falls vorhanden
        const startBtn = this.domCache.get('.termynal-start-button');
        if (startBtn) startBtn.remove();
        
        this.emit('start', { config: this.config });
        
        Object.assign(this.state, { 
            isRunning: true, 
            isPaused: false, 
            currentLine: 0, 
            startTime: Date.now(), 
            pausedTime: 0, 
            restarting: false 
        });
        
        try {
            await this.wait(this.timing.startDelay);
            await this.processLines();
            
            this.state.isRunning = false;
            this.emit('complete', { 
                totalLines: this.config.lines.length, 
                duration: this.getElapsed() 
            });
            
            if (this.config.loop && !this.state.restarting) {
                await this.wait(2000);
                this.restart();
            }
        } catch (error) {
            console.error('Animation error:', error);
            this.emit('error', { error, currentLine: this.state.currentLine });
            this.state.isRunning = false;
        }
    }

    async processLines() {
        this.state.lineQueue.sort((a, b) => a.originalIndex - b.originalIndex);
        
        let i = 0;
        while (i < this.state.lineQueue.length && this.state.isRunning) {
            // Stelle sicher, dass renderer.renderOnce existiert
            if (this.renderer && typeof this.renderer.renderOnce === 'function') {
                this.renderer.renderOnce();
            }
            
            const lineData = this.state.lineQueue[i];
            const lineId = `${this.instanceId}_line_${lineData.originalIndex}`;
            
            // Früher Ausstieg bei bereits verarbeiteten Zeilen
            if (this.state.processedLines.has(lineId) || 
                this.domCache.get(`[data-line-id="${lineId}"]`)) {
                this.state.processedLines.add(lineId);
                i++;
                continue;
            }
            
            await this.waitPause();
            
            // Optimierte Batch-Verarbeitung für Output-Typen
            const outputTypes = new Set(['output', 'comment', 'warning', 'success', 'error']);
            if (outputTypes.has(lineData.type)) {
                const batch = this.collectOutputBatch(i);
                await this.processBatch(batch);
                i += batch.length;
            } else {
                this.state.currentLine = lineData.originalIndex;
                
                // Sichere Aktualisierung der Progress Info
                if (this.renderer && typeof this.renderer.updateProgressInfo === 'function') {
                    this.renderer.updateProgressInfo();
                }
                
                const line = this.renderer.createLine(lineData);
                line.setAttribute('data-line-id', lineId);
                
                await this.processLine(line, lineData);
                this.state.processedLines.add(lineId);
                
                const delay = this.getLineDelay(lineData, i);
                if (delay > 0) await this.wait(delay);
                i++;
            }
        }
    }

    // Optimierte Batch-Verarbeitung mit O(n) Komplexität
    collectOutputBatch(startIndex) {
        const outputTypes = new Set(['output', 'comment', 'warning', 'success', 'error']);
        const batch = [];
        
        for (let i = startIndex; i < this.state.lineQueue.length; i++) {
            const lineData = this.state.lineQueue[i];
            const lineId = `${this.instanceId}_line_${lineData.originalIndex}`;
            
            // Früher Ausstieg bei bereits verarbeiteten Zeilen
            if (this.state.processedLines.has(lineId)) {
                if (batch.length === 0) continue;
                break;
            }
            
            if (!outputTypes.has(lineData.type)) break;
            
            batch.push({ lineData, index: i });
            if (lineData.lineDelay !== undefined) break;
        }
        
        return batch;
    }

    async processBatch(batch) {
        if (batch.length === 0) return;
        
        this.state.currentLine = batch[0].lineData.originalIndex;
        
        // Sichere Aktualisierung der Progress Info
        if (this.renderer && typeof this.renderer.updateProgressInfo === 'function') {
            this.renderer.updateProgressInfo();
        }
        
        const lineElements = batch.map(({ lineData }) => {
            const lineId = `${this.instanceId}_line_${lineData.originalIndex}`;
            const line = this.renderer.createLine(lineData);
            line.setAttribute('data-line-id', lineId);
            return { line, lineData, lineId };
        });
        
        // Parallele Verarbeitung der Batch-Elemente
        await Promise.all(lineElements.map(({ line, lineData }) => 
            this.processLine(line, lineData)
        ));
        
        lineElements.forEach(({ lineId }) => this.state.processedLines.add(lineId));
        
        this.state.currentLine = batch[batch.length - 1].lineData.originalIndex;
        
        // Sichere Aktualisierung der Progress Info
        if (this.renderer && typeof this.renderer.updateProgressInfo === 'function') {
            this.renderer.updateProgressInfo();
        }
        
        const lastLineData = batch[batch.length - 1].lineData;
        const lastIndex = batch[batch.length - 1].index;
        const delay = lastLineData.lineDelay !== undefined ? 
            lastLineData.lineDelay : 
            this.getLineDelay(lastLineData, lastIndex);
        
        if (delay > 0) await this.wait(delay);
    }

    getLineDelay(lineData, i) {
        if (lineData.lineDelay !== undefined) return lineData.lineDelay;
        if (i < this.config.lines.length - 1) {
            const next = this.config.lines[i + 1];
            if (lineData.type === 'output' && next.type === 'output') return 0;
        }
        return this.timing.lineDelay;
    }

    // Robuste Zeilen-Verarbeitung mit Fehlerbehandlung
    async processLine(line, lineData) {
        try {
            this.emit('lineStart', { line: lineData, index: this.state.currentLine });
            
            const processors = {
                input: () => this.animator.typeText(line, lineData.text, lineData.typeDelay),
                progress: () => this.animator.animateProgress(line, lineData),
                output: () => this.animator.revealText(line, lineData.text)
            };
            
            const processor = processors[lineData.type] || processors.output;
            await processor();
            
            this.emit('lineComplete', { line: lineData, index: this.state.currentLine });
        } catch (error) {
            console.error(`Error processing line ${this.state.currentLine}:`, error);
            this.emit('lineError', { line: lineData, index: this.state.currentLine, error });
            
            // Fallback: Zeige Text sofort an
            line.textContent = lineData.text || '[Error rendering line]';
            this.container.appendChild(line);
        }
    }

    // Control methods
    toggleSpeed() {
        const isFast = this.timing.typeDelay === 0;
        Object.assign(this.timing, isFast ? 
            this.timing.original : 
            { typeDelay: 0, lineDelay: 100, startDelay: 0 }
        );
        this.renderer.updateButton('speed', isFast ? 'fast →' : 'normal →');
    }

    togglePause() {
        if (this.state.isPaused) {
            this.state.pausedTime += Date.now() - this.state.pauseStart;
            this.state.isPaused = false;
            this.emit('resume', { currentLine: this.state.currentLine });
        } else {
            this.state.pauseStart = Date.now();
            this.state.isPaused = true;
            this.emit('pause', { currentLine: this.state.currentLine });
        }
        this.renderer.updateButton('pause', this.state.isPaused ? 'play ▶' : 'pause ⏸');
    }

    async copyContent() {
        const lines = [...this.domCache.getAll('.termynal-line')];
        const content = lines.map(line => {
            const type = line.getAttribute('data-ty');
            const text = line.textContent;
            return type === 'input' ? `$ ${text}` : text;
        }).join('\n');
        
        try {
            await navigator.clipboard.writeText(content);
            this.renderer.showNotification('Content copied to clipboard!');
        } catch (err) {
            console.error('Copy failed:', err);
        }
    }

    toggleFullscreen() {
        const el = document.fullscreenElement ? document : this.container;
        const action = document.fullscreenElement ? 'exitFullscreen' : 'requestFullscreen';
        el[action]().catch(err => console.error('Fullscreen error:', err));
    }

    restart() {
        if (this.state.restarting) return;
        
        this.state.restarting = true;
        this.state.isRunning = false;
        this.state.isPaused = false;
        
        this.timers.clearAll();
        Object.assign(this.timing, this.timing.original);
        
        // Verwende Timer-Manager für verzögerten Neustart
        this.timers.setTimeout(() => {
            this.clear();
            this.renderer.resetButtons();
            this.state.processedLines.clear();
            this.state.lineQueue = this.generateLineQueue();
            this.state.restarting = false;
            this.start();
        }, 200);
    }

    clear() {
        this.domCache.getAll('.termynal-line').forEach(line => line.remove());
        this.state.currentLine = 0;
        this.state.processedLines.clear();
        this.renderer.updateProgressInfo();
        this.domCache.invalidate();
    }

    // Public API
    pause() { 
        if (!this.state.isPaused && this.state.isRunning) { 
            this.togglePause(); 
        }
    }
    
    resume() { 
        if (this.state.isPaused && this.state.isRunning) { 
            this.togglePause(); 
        }
    }
    
    stop() {
        this.state.isRunning = false;
        this.state.isPaused = false;
        this.timers.clearAll();
        this.renderer.resetButtons();
        this.emit('stop', { currentLine: this.state.currentLine });
    }

    // Event-System
    emit(event, data = {}) {
        this.events.emit(event, data);
    }

    // Erweiterte Destroy-Methode
    destroy() {
        this.timers.clearAll();
        this.state.isRunning = false;
        
        // Entferne DOM-Observer
        if (this.domCache && this.domCache.observer) {
            this.domCache.observer.disconnect();
        }
        
        // Entferne globale Referenz
        if (window.termynalInstances) {
            window.termynalInstances.delete(this.instanceId);
        }
        
        // Entferne Event-Listener
        if (this.events) {
            this.events.removeAllListeners();
        }
        
        // Entferne aus Instance Registry
        instanceRegistry.delete(this.container);
        
        // Entferne DOM-Elemente
        if (this.container) {
            this.container.innerHTML = '';
            this.container.removeAttribute('data-termynal-instance');
            this.container.removeAttribute('data-termynal-global-id');
        }
        
        return true;
    }

    // Public API für externe Verwendung
    getAPI() {
        return {
            // Steuerung
            start: () => this.start(),
            pause: () => this.pause(),
            resume: () => this.resume(),
            restart: () => this.restart(),
            stop: () => this.stop(),
            clear: () => this.clear(),
            
            // Geschwindigkeit
            toggleSpeed: () => this.toggleSpeed(),
            setSpeed: (fast) => {
                const isFast = this.timing.typeDelay === 0;
                if (fast && !isFast) this.toggleSpeed();
                else if (!fast && isFast) this.toggleSpeed();
            },
            
            // Status
            isRunning: () => this.state.isRunning,
            isPaused: () => this.state.isPaused,
            getCurrentLine: () => this.state.currentLine,
            getTotalLines: () => this.config.lines.length,
            getProgress: () => ({
                current: this.state.currentLine + 1,
                total: this.config.lines.length,
                percentage: Math.round((this.state.currentLine + 1) / this.config.lines.length * 100)
            }),
            
            // Konfiguration
            getConfig: () => ({ ...this.config }),
            updateConfig: (key, value) => {
                if (this.config[key] !== undefined) this.config[key] = value;
                if (this.timing[key] !== undefined) this.timing[key] = value;
                return this.getAPI();
            },
            
            // Zeilen-Management mit optimierter Cache-Invalidierung
            addLine: (line, index = -1) => {
                if (index === -1) {
                    this.config.lines.push(line);
                } else {
                    this.config.lines.splice(index, 0, line);
                }
                this._lineQueueCache = null; // Cache invalidieren
                this.state.lineQueue = this.generateLineQueue();
                return this.getAPI();
            },
            
            addLines: (lines, index = -1) => {
                if (index === -1) {
                    this.config.lines.push(...lines);
                } else {
                    this.config.lines.splice(index, 0, ...lines);
                }
                this._lineQueueCache = null; // Cache invalidieren
                this.state.lineQueue = this.generateLineQueue();
                return this.getAPI();
            },
            
            removeLine: (index) => {
                if (index >= 0 && index < this.config.lines.length) {
                    this.config.lines.splice(index, 1);
                    this._lineQueueCache = null; // Cache invalidieren
                    this.state.lineQueue = this.generateLineQueue();
                }
                return this.getAPI();
            },
            
            updateLine: (index, newLine) => {
                if (index >= 0 && index < this.config.lines.length) {
                    this.config.lines[index] = { ...this.config.lines[index], ...newLine };
                    this._lineQueueCache = null; // Cache invalidieren
                    this.state.lineQueue = this.generateLineQueue();
                }
                return this.getAPI();
            },
            
            getLines: () => [...this.config.lines],
            
            // Events
            on: (event, callback) => this.events.on(event, callback),
            off: (event, callback) => this.events.off(event, callback),
            
            // Hilfsmethoden
            destroy: () => this.destroy(),
            getElement: () => this.container,
            
            // Erweiterte Steuerung
            skipToLine: (lineIndex) => {
                if (lineIndex >= 0 && lineIndex < this.config.lines.length) {
                    this.state.currentLine = lineIndex;
                    this.renderer.updateProgressInfo();
                }
                return this.getAPI();
            },
            
            // Timing-Anpassungen
            setTiming: (timing) => {
                Object.assign(this.timing, timing);
                if (timing.typeDelay !== undefined) this.timing.original.typeDelay = timing.typeDelay;
                if (timing.lineDelay !== undefined) this.timing.original.lineDelay = timing.lineDelay;
                if (timing.startDelay !== undefined) this.timing.original.startDelay = timing.startDelay;
                return this.getAPI();
            },
            
            getTiming: () => ({ ...this.timing }),
            
            // Performance-Monitoring
            getPerformanceInfo: () => ({
                activeTimers: this.timers.getActiveCount(),
                cacheSize: this.domCache.getCacheSize(),
                processedLines: this.state.processedLines.size,
                instanceId: this.instanceId
            })
        };
    }
}

// Globale API-Verwaltung
if (!window.termynalInstances) {
    window.termynalInstances = new Map();
}

// Erstelle die optimierte Instanz
const terminalInstance = new ObsidianTermynal(input);
const api = terminalInstance.getAPI();

// Speichere die API global
const globalId = terminalInstance.instanceId;
window.termynalInstances.set(globalId, api);
terminalInstance.container.setAttribute('data-termynal-global-id', globalId);

// Globale Hilfsfunktion für einfacheren Zugriff
window.getTermynalAPI = function(containerId) {
    if (containerId) {
        const container = document.querySelector(`[data-termynal-global-id="${containerId}"]`);
        if (container) {
            const globalId = container.getAttribute('data-termynal-global-id');
            return window.termynalInstances.get(globalId);
        }
    }
    
    // Fallback: Gebe die neueste Instanz zurück
    const instances = Array.from(window.termynalInstances.values());
    return instances[instances.length - 1];
};