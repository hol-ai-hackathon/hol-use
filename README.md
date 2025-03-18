# HOL - Hands on Labs Chrome Extension

A Chrome extension that provides an interactive chat interface for Hands on Labs assistance. This extension helps users with their lab exercises and practical learning through a convenient chat window.

## Features

- Clean, modern chat interface
- Instant response to user queries
- Easy-to-use popup window
- Lab-specific assistance

## Installation

### For Development

1. Clone this repository:
```bash
git clone <your-repository-url>
cd hol-use
```

2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select this directory
5. The HOL extension icon should appear in your Chrome toolbar

### For Distribution

1. Create a ZIP file containing all necessary files:
```bash
zip -r hol-extension.zip manifest.json popup.html popup.js styles.css icons/
```

2. The extension can then be installed by:
   - Dragging the ZIP file into `chrome://extensions/`
   - Or submitting to the Chrome Web Store for distribution

## Usage

1. Click the HOL extension icon in your Chrome toolbar
2. A chat window will open
3. Type your lab-related questions or concerns
4. Receive instant assistance and guidance

## Development

### Project Structure

- `manifest.json` - Extension configuration and permissions
- `popup.html` - Main chat interface HTML
- `popup.js` - Chat functionality and message handling
- `styles.css` - UI styling
- `icons/` - Extension icons in various sizes (16px, 48px, 128px)

### Local Development

1. Make changes to the source files
2. Refresh the extension in `chrome://extensions/`
3. Click the extension icon to test changes

## License

[Add your license information here]

## Contributing

[Add contribution guidelines here]
