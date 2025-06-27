# Obsidian Termynal

<p align="center">
  <a href="https://github.com/MATrsx/obsidian-termynal">
    <picture>
      <source srcset="assets/img/logo-inline-white.png" media="(prefers-color-scheme: dark)">
      <source srcset="assets/img/logo-inline-black.png" media="(prefers-color-scheme: light)">
      <img src="assets/img/logo-inline-black.png" width="360" alt="Obsidian Termynal">
    </picture>
  </a>
</p>

<p align="center">
  <strong>
    Terminal animation custom view for Obsidian DataviewJS,<br> based on the excellent 
    <a href="https://github.com/ines/termynal">Termynal.js</a> by Ines Montani.
  </strong>
</p>

<p align="center">
  <a href="https://github.com/MATrsx/obsidian-termynal"><img
    src="https://img.shields.io/github/v/tag/MATrsx/obsidian-termynal"
    alt="Version"
  /></a>
  <a href="https://github.com/MATrsx/obsidian-termynal/blob/main/LICENSE"><img
    src="https://img.shields.io/badge/license-MIT-green"
    alt="License"
  /></a>
  <a href="https://obsidian.md"><img
    src="https://img.shields.io/badge/Obsidian-DataviewJS-purple"
    alt="Obsidian"
  /></a>
</p>

<p align="center">
    <img src="docs/assets/img/showcase.gif" style="border-radius: 8px">
</p>

> Performance-optimized terminal animations for Obsidian DataviewJS  
> Based on [termynal.js](https://github.com/ines/termynal) by Ines Montani

A highly optimized terminal animation library designed specifically for Obsidian's DataviewJS plugin. Create beautiful, interactive terminal demonstrations directly in your notes with smooth animations and extensive customization options.

## 🚀 Features

### Core Features
- **Smooth Terminal Animations** - Type text character by character with realistic delays
- **Multiple Line Types** - Input, output, comments, errors, warnings, and success messages
- **Progress Animations** - Spinners, loading bars, and dot animations
- **Interactive Controls** - Play/pause, speed toggle, restart, copy content
- **Theme Support** - macOS, Windows, Ubuntu, and light themes
- **Performance Optimized** - Efficient rendering with DOM caching and batch processing

### Advanced Features
- **Syntax Highlighting** - Basic code syntax highlighting support
- **Event System** - Hook into animation events for custom behavior
- **Fullscreen Mode** - Expand terminal to fullscreen view
- **Responsive Design** - Mobile-friendly responsive layout
- **Loop Support** - Automatically restart animation when complete
- **Instance Management** - Multiple terminals per note with individual control

## 📋 Requirements

- **Obsidian** with Dataview plugin installed and enabled
- JavaScript execution enabled in Dataview settings

## 🛠️ Installation

1. **Install DataviewJS Plugin**:
   - Open Obsidian Settings
   - Go to Community Plugins
   - Search for "Dataview" and install
   - Enable the plugin and turn on "Enable JavaScript Queries"

2. **Add the Script**:
   - Download the `termynal.js` file from the [obsidian-termynal](https://github.com/MATrsx/Obsidian-Termynal) GitHub repository
   - Add the script to your vault (e.g. your `assets` directory)
   - Add a DataviewJS code block in your note (see usage examples below)

## 📖 Usage

### Basic Example

````markdown
```dataviewjs
await dv.view('termynal', {
    title: 'My Terminal Demo',
    theme: 'macos',
    autoStart: true,
    lines: [
        { type: 'input', text: 'echo "Hello, World!"' },
        { type: 'output', text: 'Hello, World!' },
        { type: 'input', text: 'ls -la' },
        { type: 'output', text: 'total 8\ndrwxr-xr-x  3 user  staff   96 Jan  1 12:00 .\ndrwxr-xr-x  4 user  staff  128 Jan  1 12:00 ..' }
    ]
});
```
````

### Advanced Configuration

````markdown
```dataviewjs
await dv.view('termynal', {
    title: 'Advanced Terminal Demo',
    theme: 'ubuntu',
    startDelay: 1000,
    typeDelay: 50,
    lineDelay: 1000,
    autoStart: false,
    loop: true,
    showControls: true,
    highlightSyntax: true,
    copyable: true,
    fullscreen: true,
    height: '400px',
    lines: [
        { 
            type: 'input', 
            text: 'npm install',
            prompt: 'user@ubuntu:~$',
            promptColor: '#00ff00'
        },
        { 
            type: 'progress', 
            text: 'Installing packages', 
            style: 'spinner',
            duration: 3000
        },
        { type: 'success', text: '✓ Installation completed!' },
        { type: 'input', text: 'npm start' },
        { type: 'comment', text: '# Starting development server...' },
        { type: 'output', text: 'Server running on http://localhost:3000' }
    ]
});
```
````

## ⚙️ Configuration Options

### Basic Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `title` | string | `'Terminal'` | Terminal window title |
| `theme` | string | `'macos'` | Theme: `'macos'`, `'windows'`, `'ubuntu'`, `'light'` |
| `autoStart` | boolean | `true` | Start animation automatically |
| `loop` | boolean | `false` | Restart animation when complete |
| `height` | string | `'auto'` | Terminal height (CSS value) |
| `width` | string | `'100%'` | Terminal width (CSS value) |

### Timing Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `startDelay` | number | `600` | Delay before animation starts (ms) |
| `typeDelay` | number | `90` | Delay between characters (ms) |
| `lineDelay` | number | `1500` | Delay between lines (ms) |

### Feature Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `showControls` | boolean | `true` | Show control buttons |
| `highlightSyntax` | boolean | `false` | Enable basic syntax highlighting |
| `copyable` | boolean | `false` | Show copy button |
| `resizable` | boolean | `false` | Allow terminal resizing |
| `fullscreen` | boolean | `false` | Show fullscreen button |

### Prompt Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `defaultPrompt` | string | `'$'` | Default prompt symbol |
| `defaultPromptColor` | string | `'#a2a2a2'` | Default prompt color |
| `cursor` | string | `'▋'` | Cursor character |

## 📝 Line Types and Options

### Input Lines
```javascript
{ 
    type: 'input', 
    text: 'command to type',
    prompt: 'custom-prompt',         // Optional custom prompt
    promptColor: '#00ff00',          // Optional prompt color
    typeDelay: 100,                  // Optional custom typing speed
    lineDelay: 2000                  // Optional custom line delay
}
```

### Output Lines
```javascript
{ 
    type: 'output', 
    text: 'command output',
    class: 'custom-class'            // Optional CSS class
}
```

### Special Line Types
```javascript
// Comment line
{ type: 'comment', text: '# This is a comment' }

// Error message
{ type: 'error', text: 'Error: Command not found' }

// Warning message
{ type: 'warning', text: 'Warning: Deprecated command' }

// Success message
{ type: 'success', text: '✓ Operation completed successfully' }
```

### Progress Animations

#### Spinner Animation
```javascript
{ 
    type: 'progress', 
    text: 'Loading...',
    style: 'spinner',
    duration: 3000                   // Duration in milliseconds
}
```

#### Loading Bar
```javascript
{ 
    type: 'progress', 
    text: 'Processing',
    style: 'bar',
    length: 30,                      // Bar length in characters
    percent: 100,                    // Target percentage
    completeChar: '█',               // Completed character
    incompleteChar: '░'              // Incomplete character
}
```

#### Dots Animation
```javascript
{ 
    type: 'progress', 
    text: 'Connecting',
    style: 'dots',
    maxDots: 3,                      // Maximum number of dots
    cycles: 3                        // Number of cycles
}
```

## 🎛️ Interactive Controls

The terminal includes several interactive controls:

- **Speed Toggle** - Switch between normal and fast animation
- **Pause/Resume** - Pause and resume the current animation
- **Restart** - Restart the animation from the beginning
- **Copy** - Copy all terminal content to clipboard (if enabled)
- **Fullscreen** - Toggle fullscreen mode (if enabled)

## 🔧 API Reference

### Getting the API
```javascript
// Get API for the most recent terminal
const api = window.getTermynalAPI();

// Get API for specific terminal by container ID
const api = window.getTermynalAPI('termynal_abc123');

// Get API for the termynal in the current dataviewjs codeblock
const containerId = dv.container.getAttribute('data-termynal-global-id');
const api = window.getTermynalAPI(containerId);
```

### Control Methods
```javascript
api.start()          // Start animation
api.pause()          // Pause animation
api.resume()         // Resume animation
api.restart()        // Restart animation
api.stop()           // Stop animation
api.clear()          // Clear terminal content
```

### Speed Control
```javascript
api.toggleSpeed()    // Toggle between normal/fast speed
api.setSpeed(true)   // Set fast speed
api.setSpeed(false)  // Set normal speed
```

### Status Methods
```javascript
api.isRunning()      // Returns boolean
api.isPaused()       // Returns boolean
api.getCurrentLine() // Returns current line index
api.getTotalLines()  // Returns total number of lines
api.getProgress()    // Returns progress object
```

### Configuration
```javascript
api.getConfig()                    // Get current configuration
api.updateConfig('typeDelay', 50)  // Update configuration value
api.setTiming({ 
    typeDelay: 50, 
    lineDelay: 1000 
})
```

### Line Management
```javascript
// Add single line
api.addLine({ type: 'output', text: 'New output' })

// Add multiple lines
api.addLines([
    { type: 'input', text: 'command' },
    { type: 'output', text: 'result' }
])

// Remove line by index
api.removeLine(2)

// Update existing line
api.updateLine(1, { text: 'Updated text' })

// Get all lines
const lines = api.getLines()
```

### Event System
```javascript
// Listen to events
api.on('start', (data) => console.log('Animation started'))
api.on('complete', (data) => console.log('Animation completed'))
api.on('lineStart', (data) => console.log('Line started:', data))
api.on('lineComplete', (data) => console.log('Line completed:', data))

// Remove event listener
api.off('start', callback)
```

### Available Events

| Event  | Description  |
|:---:|:---:|
| `start` | Animation started |
| `complete` | Animation completed |
| `pause` | Animation paused |
| `resume` | Animation resumed |
| `stop` | Animation stopped |
| `lineStart` | Line animation started |
| `lineComplete` | Line animation completed |
| `lineError` | Error in line processing |
| `error` | General error occurred |

## 🎨 Themes

### Built-in Themes

#### macOS Theme
```javascript
{ theme: 'macos' }
```
- Dark background with macOS-style window controls
- Red, yellow, green traffic light buttons

#### Windows Theme
```javascript
{ theme: 'windows' }
```
- Windows-style window decorations
- Minimize, maximize, close buttons

#### Ubuntu Theme
```javascript
{ theme: 'ubuntu' }
```
- Ubuntu purple background
- Orange accent color

#### Light Theme
```javascript
{ theme: 'light' }
```
- Light background for light mode compatibility
- Dark text with subtle borders

### Custom Styling

You can customize the appearance using CSS variables:

```css
.obsidian-termynal {
    --color-bg: #1a1a1a;
    --color-text: #ffffff;
    --color-text-subtle: #888888;
    --color-accent: #00ff00;
    --color-error: #ff6b6b;
    --color-warning: #ffa500;
    --color-success: #00ff00;
    --color-comment: #6a9955;
}
```

## 🔍 Performance Features

### Optimization Techniques
- **DOM Caching** - Cached DOM queries for better performance
- **Batch Processing** - Process multiple output lines simultaneously
- **Instance Registry** - Prevent duplicate initializations
- **Timer Management** - Robust timer cleanup and management
- **Memory Management** - Efficient cleanup on destroy

### Performance Monitoring
```javascript
const perfInfo = api.getPerformanceInfo()
console.log('Active timers:', perfInfo.activeTimers)
console.log('Cache size:', perfInfo.cacheSize)
console.log('Processed lines:', perfInfo.processedLines)
```

## 🐛 Troubleshooting

### Common Issues

#### Animation Not Starting
- Check if DataviewJS is enabled
- Verify JavaScript execution is allowed
- Check browser console for errors

#### Animation resets after short time
- Set the Dataview `Refresh interval` setting to a higher number (in ms)
- Alternatively, add a shortcut to `Dataview: Rebuild current view` (e.g. to the <kbd>F5</kbd> key) to manually rebuild the view. This will start the animation from the start without being interrupted by Dataview.

#### Slow Performance
- Reduce `typeDelay` and `lineDelay` values
- Limit number of lines in complex animations
- Use batch processing for multiple output lines

#### Styling Issues
- Ensure CSS is not being overridden by other plugins
- Check theme compatibility
- Use browser developer tools to inspect styles

#### Memory Issues
- Call `api.destroy()` when terminal is no longer needed
- Avoid creating too many instances simultaneously
- Monitor performance using `api.getPerformanceInfo()`


## 📱 Mobile Support

The terminal is fully responsive and supports mobile devices:

- Touch-friendly controls
- Responsive font sizing
- Optimized layout for small screens
- Swipe gestures for fullscreen mode

## 🔒 Security Notes

- The script runs in the browser context with DataviewJS permissions
- No external dependencies or network requests
- All processing happens locally
- Safe for offline use

## 📄 License

MIT License - See the original [Termynal.js license](https://github.com/ines/termynal/blob/master/LICENSE) for details.

## 🙏 Acknowledgments

- **[Ines Montani](https://github.com/ines)** - Original Termynal.js library
- **[blacksmithgu](https://github.com/blacksmithgu/obsidian-dataview)** - Dataview plugin

## 📚 Examples

### Git Workflow Demo
````markdown
```dataviewjs
await dv.view('termynal', {
    title: 'Git Workflow',
    theme: 'ubuntu',
    lines: [
        { type: 'input', text: 'git status' },
        { type: 'output', text: 'On branch main\nNothing to commit, working tree clean' },
        { type: 'input', text: 'git checkout -b feature/new-component' },
        { type: 'output', text: 'Switched to a new branch \'feature/new-component\'' },
        { type: 'input', text: 'git add .' },
        { type: 'input', text: 'git commit -m "Add new component"' },
        { type: 'output', text: '[feature/new-component abc1234] Add new component\n 1 file changed, 25 insertions(+)' },
        { type: 'success', text: '✓ Changes committed successfully!' }
    ]
});
```
````

### Package Installation Demo
````markdown
```dataviewjs
await dv.view('termynal', {
    title: 'Package Manager',
    theme: 'macos',
    showControls: true,
    copyable: true,
    lines: [
        { type: 'input', text: 'npm init -y' },
        { type: 'output', text: 'Wrote to package.json' },
        { type: 'input', text: 'npm install express' },
        { 
            type: 'progress', 
            text: 'Installing express',
            style: 'bar',
            duration: 2000
        },
        { type: 'success', text: '+ express@4.18.2\nadded 57 packages in 3.2s' },
        { type: 'input', text: 'npm start' },
        { type: 'comment', text: '# Server starting...' },
        { type: 'output', text: 'Server running on port 3000' }
    ]
});
```
````

---

**Version**: 0.0.1  
**Author**: MATrsx  
**Based on**: [Termynal.js](https://github.com/ines/termynal) by Ines Montani