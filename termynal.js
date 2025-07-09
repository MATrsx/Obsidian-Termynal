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
 * @license     MIT
 */

// Default configuration object with all available options
const DEFAULT_CONFIG = {
    title: 'Terminal',                  // Terminal window title
    theme: 'macos',                     // Visual theme (macos, windows, ubuntu, light)
    startDelay: 600,                    // Delay before animation starts (ms)
    typeDelay: 90,                      // Delay between each character typing (ms)
    lineDelay: 1500,                    // Delay between lines (ms)
    cursor: '▋',                       // Cursor character
    autoStart: true,                    // Start animation automatically
    loop: false,                        // Loop animation when finished
    showControls: true,                 // Show control buttons
    highlightSyntax: false,             // Enable syntax highlighting
    copyable: false,                    // Enable copy functionality
    resizable: false,                   // Allow terminal resizing
    fullscreen: false,                  // Enable fullscreen mode
    defaultPrompt: '$',                 // Default prompt character
    defaultPromptColor: '#a2a2a2',      // Default prompt color
    height: 'auto',                     // Terminal height
    width: '100%',                      // Terminal width
    lazyLoading: false,                 // Toggle lazy loading
    intersectionThreshold: 0.1,         // Threshold for Intersection Observer
    rootMargin: '50px',                 // Margin for Intersection Observer
    lines: []                           // Array of line objects to animate
};

// Instance registry using WeakMap for better performance and memory management
const instanceRegistry = new WeakMap();

/**
 * Global Style Manager - ensures styles are only initialized once per page
 * Manages CSS injection for better performance across multiple terminal instances
 */
class TermynalStyleManager {
    static initialized = false;
    
    /**
     * Initialize styles once globally
     */
    static initializeStyles() {
        if (this.initialized) return;
        
        const styleId = 'obsidian-termynal-styles-enhanced';
        if (document.getElementById(styleId)) {
            this.initialized = true;
            return;
        }
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            /* CSS Custom Properties (Design Tokens) */
            :root {
                --terminal-font-family: 'Roboto Mono', 'Fira Mono', Consolas, Menlo, Monaco, 'Courier New', Courier, monospace;
                --terminal-border-radius: 8px;
                --terminal-padding: 20px;
                --terminal-line-height: 1.8;
                --terminal-font-size: 14px;
                --terminal-min-height: 200px;
                --terminal-box-shadow: 0 4px 20px rgba(0,0,0,0.2);
                --terminal-transition: all 0.2s ease;
                --terminal-button-padding: 4px 8px;
                --terminal-button-radius: 4px;
            }

            /* Main Terminal Container */
            .obsidian-termynal {
                /* Color Scheme - Default (Dark Theme) */
                --color-bg: #252a33;
                --color-text: #eee;
                --color-text-subtle: #a2a2a2;
                --color-accent: #61dafb;
                --color-error: #ff6b6b;
                --color-warning: #f4c025;
                --color-success: #51cf66;
                --color-comment: #4a968f;
                
                /* Layout */
                max-width: 100%;
                overflow-x: auto;
                background: var(--color-bg);
                color: var(--color-text);
                font-size: var(--terminal-font-size);
                font-family: var(--terminal-font-family);
                border-radius: var(--terminal-border-radius);
                padding: 75px var(--terminal-padding) var(--terminal-padding);
                position: relative;
                box-sizing: border-box;
                margin: 1em 0;
                min-height: var(--terminal-min-height);
                box-shadow: var(--terminal-box-shadow);
            }

            /* Theme Variations */
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

            /* Window Decorations - Base Styles */
            .obsidian-termynal::before {
                position: absolute;
                top: 15px;
                left: 15px;
                display: inline-block;
            }

            /* macOS Style Window Controls */
            .obsidian-termynal[data-ty-macos]::before {
                content: '';
                width: 15px;
                height: 15px;
                border-radius: 50%;
                background: #d9515d;
                box-shadow: 25px 0 0 #f4c025, 50px 0 0 #3ec930;
            }

            /* Windows Style Window Controls */
            .obsidian-termynal[data-ty-windows]::before {
                content: '➖ ⬜ ❌';
                top: 8px;
                right: 12px;
                left: auto;
                width: auto;
                height: 32px;
                background: linear-gradient(to right, #666 0%, #666 66%, #dc3545 66%, #dc3545 100%);
                -webkit-background-clip: text;
                background-clip: text;
                color: transparent;
                font-size: 12px;
                line-height: 32px;
                letter-spacing: 8px;
            }

            /* Ubuntu Style Window Controls */
            .obsidian-termynal[data-ty-ubuntu]::before {
                content: '●';
                top: 5px;
                color: var(--color-accent);
                font-size: 20px;
            }

            /* Terminal Title Bar */
            .obsidian-termynal::after {
                content: attr(data-ty-title);
                position: absolute;
                color: var(--color-text-subtle);
                top: 12px;
                left: 0;
                width: 100%;
                text-align: center;
            }

            /* Control Buttons Container */
            .termynal-controls {
                position: absolute;
                top: 35px;
                right: 10px;
                display: flex;
                gap: 10px;
            }

            .obsidian-termynal[data-ty-windows] .termynal-controls,
            .obsidian-termynal[data-ty-macos] .termynal-controls,
            .obsidian-termynal[data-ty-ubuntu] .termynal-controls {
                top: 45px;
            }

            /* Button Styling - Common Styles */
            button[data-terminal-control],
            .termynal-start-button {
                color: #aebbff;
                background: none !important;
                border: none;
                padding: var(--terminal-button-padding) !important;
                cursor: pointer;
                box-shadow: none !important;
                border-radius: var(--terminal-button-radius);
                font-size: 11px;
                transition: var(--terminal-transition);
            }

            /* Control Button Hover Effects */
            button[data-terminal-control]:hover {
                color: #fff;
                background: rgba(255,255,255,0.1) !important;
            }

            /* Start Button Specific Styles */

            .termynal-start-button {
                display: block;
                margin: 20px auto;
                font-family: inherit;
                font-size: 14px;
                border-radius: 6px;
            }

            .termynal-start-button:hover {
                transform: translateY(-2px);
            }

            /* Progress Information Display */
            .termynal-progress-info {
                position: absolute;
                bottom: 10px;
                right: 15px;
                font-size: 11px;
                color: var(--color-text-subtle);
                display: flex;
                gap: 15px;
            }

            /* Terminal Lines - Base Styles */
            .termynal-line {
                display: block;
                line-height: var(--terminal-line-height);
                white-space: pre-wrap;
                word-wrap: break-word;
                flex: 1;
            }

            .termynal-line::before {
                content: '';
                display: inline-block;
                vertical-align: middle;
            }

            .termynal-line[data-ty="input"]::before,
            .termynal-line[data-ty-prompt]::before {
                margin-right: 0.75em;
                color: var(--color-text-subtle);
            }

            .termynal-line[data-ty-prompt-color]::before {
                color: var(--prompt-color) !important;
            }

            .termynal-line[data-ty="input"]::before {
                content: '$';
            }

            .termynal-line[data-ty-prompt]::before {
                content: attr(data-ty-prompt);
            }

            /* Zeilen-Typen */
            .termynal-line[data-ty="output"] { color: var(--color-text); }
            .termynal-line[data-ty="comment"] { color: var(--color-comment); font-style: italic; }
            .termynal-line[data-ty="error"] { color: var(--color-error); }
            .termynal-line[data-ty="warning"] { color: var(--color-warning); }
            .termynal-line[data-ty="success"] { color: var(--color-success); }

            /* Syntax Highlighting Colors */
            .keyword { color: #ff79c6; font-weight: bold; }
            .string { color: #f1fa8c; }
            .comment { color: #6272a4; font-style: italic; }
            .number { color: #bd93f9; }

            /* Animated Cursor */
            .termynal-cursor::after {
                content: '▋';
                font-family: monospace;
                margin-left: 0.2em;
                animation: termynal-blink 1s infinite;
                color: var(--color-accent);
            }

            /* Cursor Blink Animation */
            @keyframes termynal-blink {
                50% { opacity: 0; }
            }

            /* Notification Messages */
            .termynal-notification {
                position: absolute;
                bottom: 50px;
                right: 15px;
                background: var(--color-success);
                color: var(--color-bg);
                padding: 8px 12px;
                border-radius: var(--terminal-button-radius);
                font-size: 12px;
                animation: slideInOut 3s ease-in-out;
            }

            /* Notification Slide Animation */
            @keyframes slideInOut {
                0%, 100% { opacity: 0; transform: translateX(100%); }
                10%, 90% { opacity: 1; transform: translateX(0); }
            }

            /* Fullscreen Mode */
            .obsidian-termynal:fullscreen {
                padding: 100px 40px 40px;
                font-size: 16px;
            }

            /* Lazy Loading Components */
            .termynal-lazy-placeholder {
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: var(--terminal-min-height);
                background: var(--color-bg);
                border-radius: var(--terminal-border-radius);
                border: 2px dashed var(--color-text-subtle);
                opacity: 0.8;
                transition: all 0.3s ease;
            }

            .termynal-lazy-placeholder:hover {
                opacity: 1;
                border-color: var(--color-accent);
            }

            /* Lazy Loading Content */
            .termynal-lazy-content {
                text-align: center;
                color: var(--color-text-subtle);
            }

            /* Lazy Loading Icon */
            .termynal-lazy-icon {
                font-size: 48px;
                margin-bottom: 16px;
                opacity: 0.6;
                animation: termynal-lazy-pulse 2s infinite;
            }

            /* Lazy Loading Text */
            .termynal-lazy-text {
                font-size: 16px;
                font-weight: 500;
                margin-bottom: 8px;
                color: var(--color-text);
            }

            /* Lazy Loading Info Text */
            .termynal-lazy-info {
                font-size: 12px;
                opacity: 0.7;
            }

            /* Lazy Loading Indicator */

            .termynal-lazy-loading {
                position: absolute;
                top: 10px;
                right: 10px;
                background: var(--color-accent);
                color: var(--color-bg);
                padding: var(--terminal-button-padding);
                border-radius: var(--terminal-button-radius);
                font-size: 10px;
                animation: termynal-lazy-fade 2s ease-in-out;
            }

            /* Keyframe Animations */
            @keyframes termynal-lazy-pulse {
                0%, 100% { transform: scale(1); opacity: 0.6; }
                50% { transform: scale(1.05); opacity: 0.8; }
            }

            @keyframes termynal-lazy-fade {
                0% { opacity: 0; transform: translateY(-10px); }
                50% { opacity: 1; transform: translateY(0); }
                100% { opacity: 0; transform: translateY(-10px); }
            }

            /* Responsive Design - Mobile Styles */
            @media (max-width: 768px) {
                .termynal-lazy-icon {
                    font-size: 32px;
                    margin-bottom: 12px;
                }
                
                .termynal-lazy-text {
                    font-size: 14px;
                }
                
                .termynal-lazy-info {
                    font-size: 11px;
                }
                
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

/**
 * Event Manager - handles all event-related functionality
 * Provides both internal event system and external API for event handling
 */
class TermynalEventManager {
    constructor(termynal) {
        this.termynal = termynal;
        this.listeners = new Map();         // Internal event listeners
        this.eventListeners = new Map();    // External API event listeners
    }

    /**
     * Emit an event to all registered listeners
     * @param {string} event - Event name
     * @param {Object} data - Event data
     */
    emit(event, data = {}) {
        // Emit for internal event listeners
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

        // Emit for external event listeners (on/off API)
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
    
    /**
     * Register an external event listener
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, new Set());
        }
        this.eventListeners.get(event).add(callback);
    }

    /**
     * Remove an external event listener
     * @param {string} event - Event name
     * @param {Function} callback - Callback function to remove
     */
    off(event, callback) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).delete(callback);
            if (this.eventListeners.get(event).size === 0) {
                this.eventListeners.delete(event);
            }
        }
    }

    /**
     * Remove all external event listeners
     */
    removeAllListeners() {
        this.eventListeners.clear();
    }
    
    /**
     * Handle control button clicks
     * @param {string} controlType - Type of control (speed, pause, restart, etc.)
     */
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
    
    /**
     * Clean up all event listeners and references
     */
    destroy() {
        this.listeners.forEach((handler, event) => {
            this.termynal.container.removeEventListener(event, handler);
        });
        this.listeners.clear();
        this.eventListeners.clear();
    }
}

/**
 * Timer Manager - robust timer management with cleanup capabilities
 * Prevents memory leaks and provides centralized timer control
 */
class TimerManager {
    constructor() {
        this.timeouts = new Set();      // Active setTimeout references
        this.intervals = new Map();     // Active setInterval references
    }
    
    /**
     * Create a timeout with automatic cleanup tracking
     * @param {Function} fn - Function to execute
     * @param {number} delay - Delay in milliseconds
     * @returns {Promise} Promise that resolves when timeout completes
     */
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
    
    /**
     * Create a timer (alias for setInterval with ID tracking)
     * @param {Function} fn - Function to execute
     * @param {number} delay - Interval delay
     * @param {string} id - Timer identifier
     * @returns {number} Interval ID
     */
    setTimer(fn, delay, id) {
        if (this.intervals.has(id)) {
            clearInterval(this.intervals.get(id));
        }
        const interval = setInterval(fn, delay);
        this.intervals.set(id, interval);
        return interval;
    }
    
    /**
     * Create an interval with ID tracking
     * @param {Function} fn - Function to execute
     * @param {number} delay - Interval delay
     * @param {string} id - Timer identifier
     * @returns {number} Interval ID
     */
    setInterval(fn, delay, id) {
        if (this.intervals.has(id)) {
            clearInterval(this.intervals.get(id));
        }
        const interval = setInterval(fn, delay);
        this.intervals.set(id, interval);
        return interval;
    }
    
    /**
     * Clear all active timers and intervals
     */
    clearAll() {
        // Clear all timeouts
        this.timeouts.forEach(id => {
            try {
                clearTimeout(id);
            } catch (e) {
                console.warn('Failed to clear timeout:', e);
            }
        });
        this.timeouts.clear();
        
        // Clear all intervals
        this.intervals.forEach((interval, key) => {
            try {
                clearInterval(interval);
            } catch (e) {
                console.warn(`Failed to clear interval ${key}:`, e);
            }
        });
        this.intervals.clear();
    }

    /**
     * Get count of active timers for performance monitoring
     * @returns {number} Number of active timers
     */
    getActiveCount() {
        return this.timeouts.size + this.intervals.size;
    }
}

/**
 * DOM Cache - optimized DOM element caching for better performance
 * Reduces repeated DOM queries by caching frequently accessed elements
 */
class DOMCache {
    constructor(container) {
        this.container = container;
        this.cache = new Map();
    }
    
    /**
     * Get a single element with caching
     * @param {string} selector - CSS selector
     * @returns {Element|null} Cached or newly found element
     */
    get(selector) {
        if (!this.cache.has(selector)) {
            this.cache.set(selector, this.container.querySelector(selector));
        }
        return this.cache.get(selector);
    }
    
    /**
     * Get all elements matching selector with caching
     * @param {string} selector - CSS selector
     * @returns {NodeList} Cached or newly found elements
     */
    getAll(selector) {
        const cacheKey = `all:${selector}`;
        if (!this.cache.has(cacheKey)) {
            this.cache.set(cacheKey, this.container.querySelectorAll(selector));
        }
        return this.cache.get(cacheKey);
    }
    
    /**
     * Manually cache an element
     * @param {string} key - Cache key
     * @param {Element} element - Element to cache
     */
    set(key, element) {
        this.cache.set(key, element);
    }
    
    /**
     * Invalidate cache entries
     * @param {string|null} selector - Specific selector to invalidate, or null for all
     */
    invalidate(selector = null) {
        if (selector) {
            this.cache.delete(selector);
            this.cache.delete(`all:${selector}`);
        } else {
            this.cache.clear();
        }
    }

    /**
     * Get cache size for performance monitoring
     * @returns {number} Number of cached entries
     */
    getCacheSize() {
        return this.cache.size;
    }
}

/**
 * Modular Renderer - handles all DOM rendering and UI updates
 * Separates rendering logic from animation logic for better maintainability
 */
class TermynalRenderer {
    constructor(termynal) {
        this.termynal = termynal;
        this.domCache = termynal.domCache;
        this.events = termynal.events;
    }

    /**
     * Render the start button for manual animation triggering
     */
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

    /**
     * Render control buttons (speed, pause, restart, etc.)
     */
    renderControls() {
        if (!this.termynal.config.showControls) return;
        
        const controls = this.termynal.$('div', { className: 'termynal-controls' });
        const buttons = new Map();
        
        // Define button configurations
        const btnConfigs = [
            ['speed', 'fast →'],
            ['pause', 'pause ⏸'],
            ['restart', 'restart ↻'],
            ...(this.termynal.config.copyable ? [['copy', 'copy ⎘']] : []),
            ...(this.termynal.config.fullscreen ? [['fullscreen', 'fullscreen ⛶']] : [])
        ];
        
        // Create and append buttons
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

    /**
     * Render progress information display
     */
    renderProgressInfo() {
        const info = this.termynal.$('div', {
            className: 'termynal-progress-info',
            innerHTML: `<span class="current-line">Line: 1/${this.termynal.config.lines.length}</span><span class="elapsed-time">Time: 00:00</span>`
        });
        
        this.termynal.container.appendChild(info);
        this.termynal.elements.set('progressInfo', info);
        this.domCache.set('progressInfo', info);
        
        // Start progress timer
        this.termynal.timers.setTimer(() => {
            if (this.termynal.state.isRunning && !this.termynal.state.isPaused) {
                const timeSpan = info.querySelector('.elapsed-time');
                if (timeSpan) timeSpan.textContent = `Time: ${this.termynal.formatTime(this.termynal.getElapsed())}`;
            }
        }, 1000, 'progress');
    }

    /**
     * Create a line element with proper attributes
     * @param {Object} lineData - Line configuration object
     * @returns {HTMLElement} Created line element
     */
    createLine(lineData) {
        const line = this.termynal.$('div', { 
            className: 'termynal-line', 
            'data-ty': lineData.type 
        });
        
        // Set prompt attributes for input lines
        if (lineData.type === 'input' || lineData.defaultPrompt) {
            const prompt = lineData.prompt || this.termynal.config.defaultPrompt;
            const color = lineData.promptColor || this.termynal.config.defaultPromptColor;
            if (prompt) line.setAttribute('data-ty-prompt', prompt);
            if (color) {
                line.setAttribute('data-ty-prompt-color', color);
                line.style.setProperty('--prompt-color', color);
            }
        }
        
        // Add custom CSS class if specified
        if (lineData.class) line.classList.add(lineData.class);
        return line;
    }

    /**
     * Update the progress information display
     */
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

    /**
     * Update a control button's text
     * @param {string} buttonId - Button identifier
     * @param {string} newText - New button text
     */
    updateButton(buttonId, newText) {
        const buttons = this.termynal.elements.get('buttons');
        if (buttons && buttons.has(buttonId)) {
            buttons.get(buttonId).innerHTML = newText;
        }
    }

    /**
     * Reset all control buttons to their default text
     */
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

    /**
     * Show a temporary notification message
     * @param {string} message - Notification message
     */
    showNotification(message) {
        const notification = this.termynal.$('div', {
            className: 'termynal-notification',
            textContent: message
        });
        
        this.termynal.container.appendChild(notification);
        
        // Remove notification after 3 seconds
        this.termynal.timers.setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }

    /**
     * Ensure UI elements are rendered once (idempotent)
     */
    renderOnce() {
        if (!this.termynal.container.querySelector('.termynal-controls')) {
            this.renderControls();
        }
        
        if (!this.termynal.container.querySelector('.termynal-progress-info')) {
            this.renderProgressInfo();
        }
    }
}

/**
 * Modular Animator - handles all animation logic
 * Separates animation concerns from rendering and state management
 */
class TermynalAnimator {
    constructor(termynal) {
        this.termynal = termynal;
        this.outputTypes = new Set(['output', 'comment', 'warning', 'success', 'error']);
    }

    /**
     * Animate typing text character by character
     * @param {HTMLElement} line - Line element to type into
     * @param {string} text - Text to type
     * @param {number} customDelay - Custom typing delay override
     */
    async typeText(line, text, customDelay) {
        line.classList.add('termynal-cursor');
        this.termynal.container.appendChild(line);
        
        // Optimized string creation with array buffer
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

    /**
     * Reveal text instantly with fade-in effect
     * @param {HTMLElement} line - Line element to reveal text in
     * @param {string} text - Text to reveal
     */
    async revealText(line, text) {
        this.termynal.container.appendChild(line);
        
        // Apply syntax highlighting if enabled and text contains code blocks
        if (this.termynal.config.highlightSyntax && text.includes('```')) {
            line.innerHTML = this.highlightSyntax(text);
        } else {
            line.textContent = text;
        }
        
        // CSS classes instead of inline styles for better performance
        line.classList.add('termynal-fade-in');
        await this.termynal.wait(50);
        line.classList.add('termynal-fade-in-complete');
    }

    /**
     * Animate progress indicators (spinner, dots, progress bar)
     * @param {HTMLElement} line - Line element for progress animation
     * @param {Object} lineData - Line configuration with animation settings
     */
    async animateProgress(line, lineData) {
        line.textContent = '';
        this.termynal.container.appendChild(line);
        
        const animations = {
            // Spinning progress indicator
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
            
            // Animated dots (Loading..., Loading...., etc.)
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
            
            // Progress bar animation
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
        
        // Execute the specified animation style or default to progress bar
        await (animations[lineData.style] || animations.bar)();
    }

    /**
     * Basic syntax highlighting for code blocks
     * @param {string} text - Text to highlight
     * @returns {string} HTML with syntax highlighting
     */
    highlightSyntax(text) {
        const patterns = [
            [/\b(function|const|let|var|if|else|for|while|return)\b/g, 'keyword'],
            [/(['"])((?:\\.|(?!\1)[^\\])*?)\1/g, 'string'],
            [/\/\/.*$/gm, 'comment'],
            [/\b\d+\b/g, 'number']
        ];
        return patterns.reduce((acc, [regex, cls]) => acc.replace(regex, `<span class="${cls}">$&</span>`), text);
    }

    /**
     * Optimized batch collection with O(n) complexity
     * Collects consecutive output lines for batch processing
     * @param {number} startIndex - Starting index in line queue
     * @param {Array} lineQueue - Queue of lines to process
     * @returns {Array} Batch of lines to process together
     */
    collectOutputBatch(startIndex, lineQueue) {
        const batch = [];
        
        for (let i = startIndex; i < lineQueue.length; i++) {
            const lineData = lineQueue[i];
            const lineId = `${this.termynal.instanceId}_line_${lineData.originalIndex}`;
            
            // Early exit for already processed lines
            if (this.termynal.state.processedLines.has(lineId)) {
                if (batch.length === 0) continue;
                break;
            }
            
            // O(1) lookup using Set
            if (!this.outputTypes.has(lineData.type)) break;
            
            batch.push({ lineData, index: i });
            if (lineData.lineDelay !== undefined) break;
        }
        
        return batch;
    }
}


/**
 * Lazy Loading Manager - manages the lazy loading of the terminal
 * Handles visibility checks and initialization
 */
class LazyLoadingManager {
    /**
     * Constructor for the LazyLoadingManager class
     * @param {ObsidianTermynal} termynal - The ObsidianTermynal instance this manager belongs to
     */
    constructor(termynal) {
        this.termynal = termynal;
        this.observer = null;
        this.isVisible = false;
        this.hasInitialized = false;
        this.pendingStart = false;
    }

    /**
     * Initialize the lazy loading manager
     * This method will create an IntersectionObserver and set up the placeholder element
     */
    init() {
        if (!this.termynal.config.lazyLoading) return;

        this.observer = new IntersectionObserver(
            this.handleIntersection.bind(this),
            {
                threshold: this.termynal.config.intersectionThreshold,
                rootMargin: this.termynal.config.rootMargin
            }
        );

        this.observer.observe(this.termynal.container);
        this.setupPlaceholder();
    }

    /**
     * Setup the placeholder element for the lazy loaded terminal
     * This element will be shown until the terminal is initialized
     */
    setupPlaceholder() {
        const placeholder = this.termynal.$('div', {
            className: 'termynal-lazy-placeholder',
            innerHTML: `
                <div class="termynal-lazy-content">
                    <div class="termynal-lazy-icon">📺</div>
                    <div class="termynal-lazy-text">Terminal is loading...</div>
                    <div class="termynal-lazy-info">${this.termynal.config.lines.length} lines loaded</div>
                </div>
            `
        });

        this.termynal.container.appendChild(placeholder);
        this.termynal.domCache.set('placeholder', placeholder);
    }

    /**
     * Handle intersection event
     * This method will initialize the terminal if it is visible and not already initialized
     * @param {IntersectionObserverEntry[]} entries - IntersectionObserver entries
     */
    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !this.hasInitialized) {
                this.isVisible = true;
                this.initializeTerminal();
            }
        });
    }

    /**
     * Initialize the terminal
     * This method will remove the placeholder element and initialize the terminal
     * @returns {Promise<void>}
     */
    async initializeTerminal() {
        if (this.hasInitialized) return;

        this.hasInitialized = true;

        console.log("Terminal initialisiert");
        
        const placeholder = this.termynal.domCache.get('placeholder');
        if (placeholder) {
            placeholder.remove();
        }

        this.termynal.setupContainer();
        
        this.termynal.emit('lazyLoaded', {
            linesCount: this.termynal.config.lines.length,
            timestamp: Date.now()
        });

        if (this.termynal.config.autoStart) {
            if (this.pendingStart) {
                await this.termynal.start();
                this.pendingStart = false;
            } else {
                this.termynal.start();
            }
        } else {
            this.termynal.renderer.renderStartButton();
        }
    }

    /**
     * Schedule the start of the terminal
     * This method will start the terminal if it is initialized or schedule the start
     * if it is not initialized yet
     * @returns {Promise<void>}
     */
    scheduleStart() {
        if (this.hasInitialized) {
            return this.termynal.start();
        } else {
            this.pendingStart = true;
            return Promise.resolve();
        }
    }

    /**
     * Check if the terminal is ready
     * @returns {boolean}
     */
    isReady() {
        return this.hasInitialized;
    }

    /**
     * Destroy the lazy loading manager
     */
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
    }
}

/**
 * Main Obsidian Termynal Class - orchestrates all components
 * Provides the primary API and coordinates between all subsystems
 */
class ObsidianTermynal {
    constructor(options) {
        this.container = dv.container;
        this.config = { ...DEFAULT_CONFIG, ...options };
        this.instanceId = this.generateInstanceId();
        
        // Prevent duplicate initialization
        if (this.isAlreadyInitialized()) return;
        
        // Initialize elements Map BEFORE other classes that depend on it
        this.elements = new Map();
        
        // Initialize all subsystem components
        this.timers = new TimerManager();
        this.domCache = new DOMCache(this.container);
        this.events = new TermynalEventManager(this);
        this.renderer = new TermynalRenderer(this);
        this.animator = new TermynalAnimator(this);
        this.lazyManager = new LazyLoadingManager(this);
        
        // Initialize animation state
        this.state = { 
            isRunning: false,              // Is animation currently running
            isPaused: false,               // Is animation paused
            currentLine: 0,                // Current line being processed
            startTime: 0,                  // Animation start timestamp
            pausedTime: 0,                 // Total time spent paused
            pauseStart: 0,                 // When current pause started
            restarting: false,             // Is animation restarting
            processedLines: new Set(),     // Set of already processed line IDs
            lineQueue: this.generateLineQueue(),  // Queue of lines to process
            isLazyLoaded: false            // Is the terminal lazy loaded
        };
        
        // Initialize timing configuration with original values backup
        this.timing = { 
            ...this.config, 
            original: { 
                startDelay: this.config.startDelay, 
                typeDelay: this.config.typeDelay, 
                lineDelay: this.config.lineDelay 
            } 
        };
        
        // Memoization cache for line queue generation
        this._lineQueueCache = null;
        this._lineQueueHash = null;
        
        this.markAsInitialized();
        this.init();
    }

    /**
     * Initialize the terminal instance by setting up styles and container.
     * If lazy loading is enabled, initialize the lazy loading manager;
     * otherwise, proceed with standard setup and start the animation if autoStart is enabled.
     */
    init() {
        TermynalStyleManager.initializeStyles();
        
        if (this.config.lazyLoading) {
            this.lazyManager.init();
        } else {
            this.setupContainer();
            this.config.autoStart ? this.start() : this.renderer.renderStartButton();
        }
    }

    /**
     * Generate a unique instance ID based on configuration
     * @returns {string} Unique instance identifier
     */
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

    /**
     * Check if instance is already initialized using WeakMap
     * @returns {boolean} True if already initialized
     */
    isAlreadyInitialized() {
        return instanceRegistry.has(this.container);
    }

    /**
     * Mark this instance as initialized in the registry
     */
    markAsInitialized() {
        instanceRegistry.set(this.container, {
            id: this.instanceId,
            timestamp: Date.now()
        });
    }

    /**
     * Set up the container element with proper attributes and styling
     */
    setupContainer() {
        if (this.container.hasAttribute('data-termynal-setup')) return;
        
        this.container.innerHTML = '';
        this.container.className = 'obsidian-termynal';
        
        // Set terminal attributes
        const attrs = {
            'data-termynal': '', 
            'data-ty-title': this.config.title, 
            'data-theme': this.config.theme,
            [`data-ty-${this.config.theme}`]: '', 
            'data-termynal-setup': 'true'
        };

        // Add lazy loading attribute
        if (this.config.lazyLoading) {
            attrs['data-lazy-loading'] = 'true';
        }

        Object.entries(attrs).forEach(([k, v]) => this.container.setAttribute(k, v));
        
        // Apply custom styling
        const styles = {};
        if (this.config.height !== 'auto') styles.height = this.config.height;
        if (this.config.width !== '100%') styles.width = this.config.width;
        if (this.config.resizable) { 
            styles.resize = 'both'; 
            styles.overflow = 'auto'; 
        }
        Object.assign(this.container.style, styles);
    }

    /**
     * Generate memoized line queue for better performance
     * @returns {Array} Array of line objects with original indices
     */
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

    /**
     * Generates a hash for the current configuration to detect changes
     * Used for memoization of line queue generation
     * @returns {string} Hash string representing the current line configuration
     */
    getConfigHash() {
        return JSON.stringify(this.config.lines.map(line => ({ 
            type: line.type, 
            text: line.text, 
            originalIndex: line.originalIndex 
        })));
    }

    /**
     * Creates a DOM element with specified attributes
     * Utility method for efficient DOM element creation
     * @param {string} tag - HTML tag name
     * @param {Object} attrs - Object containing attributes and properties
     * @returns {HTMLElement} Created DOM element
     */
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
                // Handle event listeners
                el.addEventListener(key.slice(2).toLowerCase(), value);
            } else if (key.startsWith('data-')) {
                // Handle data attributes
                el.setAttribute(key, value);
            } else {
                // Handle other attributes
                el.setAttribute(key, value);
            }
        });
        
        return el;
    }

    /**
     * Creates a promise that resolves after specified milliseconds
     * Uses the timer manager for proper cleanup
     * @param {number} ms - Milliseconds to wait
     * @returns {Promise} Promise that resolves after the delay
     */
    wait(ms) {
        return new Promise(resolve => {
            this.timers.setTimeout(resolve, ms);
        });
    }

    /**
     * Waits while the animation is paused
     * Continuously checks pause state and waits in small intervals
     * @returns {Promise} Promise that resolves when animation is no longer paused
     */
    async waitPause() {
        while (this.state.isPaused && this.state.isRunning) {
            await this.wait(100);
        }
    }

    /**
     * Calculates elapsed time since animation start, excluding paused time
     * @returns {number} Elapsed time in seconds
     */
    getElapsed() {
        if (!this.state.startTime) return 0;
        const now = Date.now();
        const pausedTime = this.state.isPaused ? 
            this.state.pausedTime + (now - this.state.pauseStart) : 
            this.state.pausedTime;
        return Math.floor((now - this.state.startTime - pausedTime) / 1000);
    }

    /**
     * Formats seconds into MM:SS format
     * @param {number} s - Seconds to format
     * @returns {string} Formatted time string (MM:SS)
     */
    formatTime(s) {
        return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
    }

    /**
     * Starts the terminal animation
     * Initializes state, removes start button, and begins processing lines
     * @returns {Promise} Promise that resolves when animation completes
     */
    async start() {
        // Lazy loading check
        if (this.config.lazyLoading && !this.lazyManager.isReady()) {
            return this.lazyManager.scheduleStart();
        }

        // Prevent multiple simultaneous starts
        if (this.state.isRunning && !this.state.restarting) return;

        // Clean up start button if present
        const startBtn = this.domCache.get('.termynal-start-button');
        if (startBtn) startBtn.remove();
        
        // Emit start event for external listeners
        this.emit('start', { config: this.config });
        
        // Initialize animation state
        Object.assign(this.state, { 
            isRunning: true, 
            isPaused: false, 
            currentLine: 0, 
            startTime: Date.now(), 
            pausedTime: 0, 
            restarting: false,
            isLazyLoaded: this.config.lazyLoading
        });
        
        try {
            // Wait for initial delay before starting
            await this.wait(this.timing.startDelay);
            await this.processLines();
            
            // Animation completed successfully
            this.state.isRunning = false;
            this.emit('complete', { 
                totalLines: this.config.lines.length, 
                duration: this.getElapsed()
            });
            
            // Handle looping if enabled
            if (this.config.loop && !this.state.restarting) {
                await this.wait(2000);
                this.restart();
            }
        } catch (error) {
            // Handle animation errors gracefully
            console.error('Animation error:', error);
            this.emit('error', { error, currentLine: this.state.currentLine });
            this.state.isRunning = false;
        }
    }

    /**
     * Processes all lines in the animation queue
     * Handles batching of output lines for better performance
     * @returns {Promise} Promise that resolves when all lines are processed
     */
    async processLines() {
        // Sort lines by original index to maintain order
        this.state.lineQueue.sort((a, b) => a.originalIndex - b.originalIndex);
        
        let i = 0;
        while (i < this.state.lineQueue.length && this.state.isRunning) {
            // Ensure renderer is ready (render controls once)
            if (this.renderer && typeof this.renderer.renderOnce === 'function') {
                this.renderer.renderOnce();
            }
            
            const lineData = this.state.lineQueue[i];
            const lineId = `${this.instanceId}_line_${lineData.originalIndex}`;
            
            // Skip already processed lines
            if (this.state.processedLines.has(lineId) || 
                this.domCache.get(`[data-line-id="${lineId}"]`)) {
                this.state.processedLines.add(lineId);
                i++;
                continue;
            }
            
            // Wait if animation is paused
            await this.waitPause();
            
            // Use batch processing for output-type lines for better performance
            const outputTypes = new Set(['output', 'comment', 'warning', 'success', 'error']);
            if (outputTypes.has(lineData.type)) {
                const batch = this.collectOutputBatch(i);
                await this.processBatch(batch);
                i += batch.length;
            } else {
                // Process individual line (input, progress, etc.)
                this.state.currentLine = lineData.originalIndex;
                
                // Update progress display safely
                if (this.renderer && typeof this.renderer.updateProgressInfo === 'function') {
                    this.renderer.updateProgressInfo();
                }
                
                const line = this.renderer.createLine(lineData);
                line.setAttribute('data-line-id', lineId);
                
                await this.processLine(line, lineData);
                this.state.processedLines.add(lineId);
                
                // Apply line delay
                const delay = this.getLineDelay(lineData, i);
                if (delay > 0) await this.wait(delay);
                i++;
            }
        }
    }

    /**
     * Collects consecutive output lines for batch processing
     * Optimized with O(n) complexity using Set for type checking
     * @param {number} startIndex - Starting index in the line queue
     * @returns {Array} Array of line objects to process as a batch
     */
    collectOutputBatch(startIndex) {
        const outputTypes = new Set(['output', 'comment', 'warning', 'success', 'error']);
        const batch = [];
        
        for (let i = startIndex; i < this.state.lineQueue.length; i++) {
            const lineData = this.state.lineQueue[i];
            const lineId = `${this.instanceId}_line_${lineData.originalIndex}`;
            
            // Skip already processed lines, but continue if batch is empty
            if (this.state.processedLines.has(lineId)) {
                if (batch.length === 0) continue;
                break;
            }
            
            // Stop batching if line type is not output-type
            if (!outputTypes.has(lineData.type)) break;
            
            batch.push({ lineData, index: i });
            
            // Stop batching if line has custom delay
            if (lineData.lineDelay !== undefined) break;
        }
        
        return batch;
    }

    /**
     * Processes a batch of output lines simultaneously
     * Improves performance by parallel processing of similar line types
     * @param {Array} batch - Array of line objects to process
     * @returns {Promise} Promise that resolves when batch is processed
     */
    async processBatch(batch) {
        if (batch.length === 0) return;
        
        // Update current line to first line in batch
        this.state.currentLine = batch[0].lineData.originalIndex;
        
        // Update progress display safely
        if (this.renderer && typeof this.renderer.updateProgressInfo === 'function') {
            this.renderer.updateProgressInfo();
        }
        
        // Create DOM elements for all lines in batch
        const lineElements = batch.map(({ lineData }) => {
            const lineId = `${this.instanceId}_line_${lineData.originalIndex}`;
            const line = this.renderer.createLine(lineData);
            line.setAttribute('data-line-id', lineId);
            return { line, lineData, lineId };
        });
        
        // Process all batch elements in parallel
        await Promise.all(lineElements.map(({ line, lineData }) => 
            this.processLine(line, lineData)
        ));
        
        // Mark all lines as processed
        lineElements.forEach(({ lineId }) => this.state.processedLines.add(lineId));
        
        // Update current line to last line in batch
        this.state.currentLine = batch[batch.length - 1].lineData.originalIndex;
        
        // Update progress display safely
        if (this.renderer && typeof this.renderer.updateProgressInfo === 'function') {
            this.renderer.updateProgressInfo();
        }
        
        // Apply delay after batch processing
        const lastLineData = batch[batch.length - 1].lineData;
        const lastIndex = batch[batch.length - 1].index;
        const delay = lastLineData.lineDelay !== undefined ? 
            lastLineData.lineDelay : 
            this.getLineDelay(lastLineData, lastIndex);
        
        if (delay > 0) await this.wait(delay);
    }

    /**
     * Calculates the delay to apply after a line
     * Uses custom line delay if specified, otherwise uses default logic
     * @param {Object} lineData - Line data object
     * @param {number} i - Current line index
     * @returns {number} Delay in milliseconds
     */
    getLineDelay(lineData, i) {
        // Use custom delay if specified
        if (lineData.lineDelay !== undefined) return lineData.lineDelay;
        
        // No delay between consecutive output lines
        if (i < this.config.lines.length - 1) {
            const next = this.config.lines[i + 1];
            if (lineData.type === 'output' && next.type === 'output') return 0;
        }
        
        // Use default line delay
        return this.timing.lineDelay;
    }

    /**
     * Processes a single line with error handling
     * Delegates to appropriate animator method based on line type
     * @param {HTMLElement} line - DOM element for the line
     * @param {Object} lineData - Line configuration data
     * @returns {Promise} Promise that resolves when line processing completes
     */
    async processLine(line, lineData) {
        try {
            // Emit line start event
            this.emit('lineStart', { line: lineData, index: this.state.currentLine });
            
            // Define processors for different line types
            const processors = {
                input: () => this.animator.typeText(line, lineData.text, lineData.typeDelay),
                progress: () => this.animator.animateProgress(line, lineData),
                output: () => this.animator.revealText(line, lineData.text)
            };
            
            // Use appropriate processor or default to output
            const processor = processors[lineData.type] || processors.output;
            await processor();
            
            // Emit line completion event
            this.emit('lineComplete', { line: lineData, index: this.state.currentLine });
        } catch (error) {
            // Handle processing errors gracefully
            console.error(`Error processing line ${this.state.currentLine}:`, error);
            this.emit('lineError', { line: lineData, index: this.state.currentLine, error });
            
            // Fallback: Display text immediately
            line.textContent = lineData.text || '[Error rendering line]';
            this.container.appendChild(line);
        }
    }

    /**
     * Toggles between fast and normal animation speed
     * Fast mode sets delays to minimal values for instant display
     */
    toggleSpeed() {
        const isFast = this.timing.typeDelay === 0;
        Object.assign(this.timing, isFast ? 
            this.timing.original : 
            { typeDelay: 0, lineDelay: 100, startDelay: 0 }
        );
        this.renderer.updateButton('speed', isFast ? 'fast →' : 'normal →');
    }

    /**
     * Toggles pause state of the animation
     * Tracks pause time for accurate elapsed time calculation
     */
    togglePause() {
        if (this.state.isPaused) {
            // Resume: Add paused duration to total paused time
            this.state.pausedTime += Date.now() - this.state.pauseStart;
            this.state.isPaused = false;
            this.emit('resume', { currentLine: this.state.currentLine });
        } else {
            // Pause: Record pause start time
            this.state.pauseStart = Date.now();
            this.state.isPaused = true;
            this.emit('pause', { currentLine: this.state.currentLine });
        }
        this.renderer.updateButton('pause', this.state.isPaused ? 'play ▶' : 'pause ⏸');
    }

    /**
     * Copies terminal content to clipboard
     * Formats content with appropriate prefixes for input lines
     * @returns {Promise} Promise that resolves when copy operation completes
     */
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

    /**
     * Toggles fullscreen mode for the terminal
     * Uses native fullscreen API with error handling
     */
    toggleFullscreen() {
        const el = document.fullscreenElement ? document : this.container;
        const action = document.fullscreenElement ? 'exitFullscreen' : 'requestFullscreen';
        el[action]().catch(err => console.error('Fullscreen error:', err));
    }

    /**
     * Restarts the animation from the beginning
     * Clears all state and resets to initial configuration
     */
    restart() {
        // Prevent multiple simultaneous restarts
        if (this.state.restarting) return;
        
        // Set restart state and stop current animation
        this.state.restarting = true;
        this.state.isRunning = false;
        this.state.isPaused = false;
        
        // Clear all active timers
        this.timers.clearAll();
        
        // Reset timing to original values
        Object.assign(this.timing, this.timing.original);
        
        // Use timer manager for delayed restart to ensure clean state
        this.timers.setTimeout(() => {
            this.clear();
            this.renderer.resetButtons();
            this.state.processedLines.clear();
            this.state.lineQueue = this.generateLineQueue();
            this.state.restarting = false;
            this.start();
        }, 200);
    }

    /**
     * Clears all rendered lines and resets display state
     * Removes DOM elements and updates progress information
     */
    clear() {
        this.domCache.getAll('.termynal-line').forEach(line => line.remove());
        this.state.currentLine = 0;
        this.state.processedLines.clear();
        this.renderer.updateProgressInfo();
        this.domCache.invalidate();
    }

    // ==================== PUBLIC API METHODS ====================

    /**
     * Pauses the animation if currently running
     */
    pause() { 
        if (!this.state.isPaused && this.state.isRunning) { 
            this.togglePause(); 
        }
    }
    
    /**
     * Resumes the animation if currently paused
     */
    resume() { 
        if (this.state.isPaused && this.state.isRunning) { 
            this.togglePause(); 
        }
    }
    
    /**
     * Stops the animation and clears all timers
     * Emits stop event for external listeners
     */
    stop() {
        this.state.isRunning = false;
        this.state.isPaused = false;
        this.timers.clearAll();
        this.renderer.resetButtons();
        this.emit('stop', { currentLine: this.state.currentLine });
    }

    /**
     * Emits an event to all registered listeners
     * @param {string} event - Event name
     * @param {Object} data - Event data to pass to listeners
     */
    emit(event, data = {}) {
        this.events.emit(event, data);
    }

    /**
     * Comprehensive cleanup method for instance destruction
     * Clears timers, removes DOM elements, and cleans up references
     * @returns {boolean} True if destruction was successful
     */
    destroy() {
        // Clear all active timers
        this.timers.clearAll();
        this.state.isRunning = false;

        // Destroy lazy loading manager
        if (this.lazyManager) {
            this.lazyManager.destroy();
        }
        
        // Remove DOM observer if present
        if (this.domCache && this.domCache.observer) {
            this.domCache.observer.disconnect();
        }
        
        // Remove global reference
        if (window.termynalInstances) {
            window.termynalInstances.delete(this.instanceId);
        }
        
        // Remove event listeners
        if (this.events) {
            this.events.removeAllListeners();
        }
        
        // Remove from instance registry
        instanceRegistry.delete(this.container);
        
        // Clean up DOM elements and attributes
        if (this.container) {
            this.container.innerHTML = '';
            this.container.removeAttribute('data-termynal-instance');
            this.container.removeAttribute('data-termynal-global-id');
            this.container.removeAttribute('data-lazy-loading');
        }
        
        return true;
    }

    /**
     * Returns a comprehensive public API for external interaction
     * Provides methods for control, configuration, and monitoring
     * @returns {Object} Public API object with all available methods
     */
    getAPI() {
        return {
            // ==================== CONTROL METHODS ====================
            
            /** Start the animation */
            start: () => this.start(),
            
            /** Pause the animation */
            pause: () => this.pause(),
            
            /** Resume the animation */
            resume: () => this.resume(),
            
            /** Restart the animation from beginning */
            restart: () => this.restart(),
            
            /** Stop the animation */
            stop: () => this.stop(),
            
            /** Clear all displayed lines */
            clear: () => this.clear(),
            
            // ==================== SPEED CONTROL ====================
            
            /** Toggle between fast and normal speed */
            toggleSpeed: () => this.toggleSpeed(),
            
            /**
             * Set animation speed
             * @param {boolean} fast - True for fast mode, false for normal
             */
            setSpeed: (fast) => {
                const isFast = this.timing.typeDelay === 0;
                if (fast && !isFast) this.toggleSpeed();
                else if (!fast && isFast) this.toggleSpeed();
            },
            
            // ==================== STATUS METHODS ====================
            
            /** Check if animation is currently running */
            isRunning: () => this.state.isRunning,
            
            /** Check if animation is currently paused */
            isPaused: () => this.state.isPaused,
            
            /** Get current line index */
            getCurrentLine: () => this.state.currentLine,
            
            /** Get total number of lines */
            getTotalLines: () => this.config.lines.length,
            
            /**
             * Get detailed progress information
             * @returns {Object} Progress object with current, total, and percentage
             */
            getProgress: () => ({
                current: this.state.currentLine + 1,
                total: this.config.lines.length,
                percentage: Math.round((this.state.currentLine + 1) / this.config.lines.length * 100)
            }),
            
            // ==================== CONFIGURATION ====================
            
            /** Get current configuration */
            getConfig: () => ({ ...this.config }),
            
            /**
             * Update a configuration value
             * @param {string} key - Configuration key to update
             * @param {*} value - New value for the configuration key
             * @returns {Object} Updated API object for chaining
             */
            updateConfig: (key, value) => {
                if (this.config[key] !== undefined) this.config[key] = value;
                if (this.timing[key] !== undefined) this.timing[key] = value;
                return this.getAPI();
            },

            // ==================== LAZY LOADING ====================

            /** Check if lazy loading is enabled */
            isLazyLoaded: () => this.config.lazyLoading,

            /** Check if lazy loading is ready */
            isLazyReady: () => this.lazyManager ? this.lazyManager.isReady() : true,

            /** Force lazy loading and initialize the terminal */
            forceLazyLoad: () => {
                if (this.lazyManager && !this.lazyManager.isReady()) {
                    return this.lazyManager.initializeTerminal();
                }
                return Promise.resolve();
            },

            /** Get lazy loading information */
            getLazyLoadingInfo: () => ({
                enabled: this.config.lazyLoading,
                ready: this.lazyManager ? this.lazyManager.isReady() : true,
                threshold: this.config.intersectionThreshold,
                rootMargin: this.config.rootMargin,
                linesCount: this.config.lines.length
            }),
            
            // ==================== LINE MANAGEMENT ====================
            
            /**
             * Add a single line to the animation
             * @param {Object} line - Line object to add
             * @param {number} index - Position to insert (-1 for end)
             * @returns {Object} API object for chaining
             */
            addLine: (line, index = -1) => {
                if (index === -1) {
                    this.config.lines.push(line);
                } else {
                    this.config.lines.splice(index, 0, line);
                }
                this._lineQueueCache = null; // Invalidate cache
                this.state.lineQueue = this.generateLineQueue();
                return this.getAPI();
            },
            
            /**
             * Add multiple lines to the animation
             * @param {Array} lines - Array of line objects to add
             * @param {number} index - Position to insert (-1 for end)
             * @returns {Object} API object for chaining
             */
            addLines: (lines, index = -1) => {
                if (index === -1) {
                    this.config.lines.push(...lines);
                } else {
                    this.config.lines.splice(index, 0, ...lines);
                }
                this._lineQueueCache = null; // Invalidate cache
                this.state.lineQueue = this.generateLineQueue();
                return this.getAPI();
            },
            
            /**
             * Remove a line by index
             * @param {number} index - Index of line to remove
             * @returns {Object} API object for chaining
             */
            removeLine: (index) => {
                if (index >= 0 && index < this.config.lines.length) {
                    this.config.lines.splice(index, 1);
                    this._lineQueueCache = null; // Invalidate cache
                    this.state.lineQueue = this.generateLineQueue();
                }
                return this.getAPI();
            },
            
            /**
             * Update an existing line
             * @param {number} index - Index of line to update
             * @param {Object} newLine - New line data (merged with existing)
             * @returns {Object} API object for chaining
             */
            updateLine: (index, newLine) => {
                if (index >= 0 && index < this.config.lines.length) {
                    this.config.lines[index] = { ...this.config.lines[index], ...newLine };
                    this._lineQueueCache = null; // Invalidate cache
                    this.state.lineQueue = this.generateLineQueue();
                }
                return this.getAPI();
            },
            
            /** Get copy of all lines */
            getLines: () => [...this.config.lines],
            
            // ==================== EVENT SYSTEM ====================
            
            /**
             * Add event listener
             * @param {string} event - Event name
             * @param {Function} callback - Event handler function
             */
            on: (event, callback) => this.events.on(event, callback),
            
            /**
             * Remove event listener
             * @param {string} event - Event name
             * @param {Function} callback - Event handler function to remove
             */
            off: (event, callback) => this.events.off(event, callback),
            
            // ==================== UTILITY METHODS ====================
            
            /** Destroy the instance and clean up resources */
            destroy: () => this.destroy(),
            
            /** Get the container DOM element */
            getElement: () => this.container,
            
            // ==================== ADVANCED CONTROL ====================
            
            /**
             * Skip to a specific line index
             * @param {number} lineIndex - Line index to skip to
             * @returns {Object} API object for chaining
             */
            skipToLine: (lineIndex) => {
                if (lineIndex >= 0 && lineIndex < this.config.lines.length) {
                    this.state.currentLine = lineIndex;
                    this.renderer.updateProgressInfo();
                }
                return this.getAPI();
            },
            
            // ==================== TIMING CONTROL ====================
            
            /**
             * Set timing configuration
             * @param {Object} timing - Timing configuration object
             * @returns {Object} API object for chaining
             */
            setTiming: (timing) => {
                Object.assign(this.timing, timing);
                if (timing.typeDelay !== undefined) this.timing.original.typeDelay = timing.typeDelay;
                if (timing.lineDelay !== undefined) this.timing.original.lineDelay = timing.lineDelay;
                if (timing.startDelay !== undefined) this.timing.original.startDelay = timing.startDelay;
                return this.getAPI();
            },
            
            /** Get current timing configuration */
            getTiming: () => ({ ...this.timing }),
            
            // ==================== PERFORMANCE MONITORING ====================
            
            /**
             * Get performance and debug information
             * @returns {Object} Performance metrics object
             */
            getPerformanceInfo: () => ({
                activeTimers: this.timers.getActiveCount(),
                cacheSize: this.domCache.getCacheSize(),
                processedLines: this.state.processedLines.size,
                instanceId: this.instanceId,
                lazyLoading: this.config.lazyLoading,
                lazyReady: this.lazyManager ? this.lazyManager.isReady() : true
            })
        };
    }
}

// ==================== GLOBAL API MANAGEMENT ====================

// Initialize global instances map if not exists
if (!window.termynalInstances) {
    window.termynalInstances = new Map();
}

// Create the optimized terminal instance
const terminalInstance = new ObsidianTermynal(input);
const api = terminalInstance.getAPI();

// Store API globally for external access
const globalId = terminalInstance.instanceId;
window.termynalInstances.set(globalId, api);
terminalInstance.container.setAttribute('data-termynal-global-id', globalId);

/**
 * Global helper function for easier API access
 * @param {string} containerId - Container ID to find specific instance
 * @returns {Object|undefined} Termynal API object or undefined if not found
 */
window.getTermynalAPI = function(containerId) {
    if (containerId) {
        // Find container by global ID
        const container = document.querySelector(`[data-termynal-global-id="${containerId}"]`);
        if (container) {
            const globalId = container.getAttribute('data-termynal-global-id');
            return window.termynalInstances.get(globalId);
        }
    }
    
    // Fallback: Return the most recent instance
    const instances = Array.from(window.termynalInstances.values());
    return instances[instances.length - 1];
};