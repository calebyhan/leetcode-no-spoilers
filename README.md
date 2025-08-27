# LeetCode No-Spoilers

A Chrome extension (Manifest V3) that prevents code spoilers on LeetCode by automatically hiding substantial code content while keeping problem descriptions and small inline code visible.

## Features

- **Automatic Code Hiding**: Automatically hides substantial code content (editors, solution blocks) while keeping small inline code and problem descriptions visible
- **Smart Content Detection**: Uses intelligent heuristics to identify substantial code content vs. problem descriptions and small code snippets
- **Smart Link Interception**: Shows confirmation dialogs when clicking on code/solution/editorial links
**Integrated Control Buttons**: Two buttons positioned to the left of the bookmark button:
   - **Show Code**: Temporarily reveal all hidden code content
   - **Hide Code**: Hide code content again after revealing it
- **Dynamic Layout Support**: Full compatibility with LeetCode's new dynamic layout
- **SPA Support**: Handles LeetCode's single-page application route changes
- **Cross-Domain**: Works on both `leetcode.com` and `leetcode.cn`
- **Minimal Permissions**: Only requires storage permission (no background scripts)

## Installation

### Loading the Unpacked Extension in Chrome

1. **Download the Extension Files**
   - Download or clone this repository to your local machine
   - Ensure you have the following files in a folder:
     - `manifest.json`
     - `content.js`
     - `content.css`

2. **Open Chrome Extensions Page**
   - Open Google Chrome
   - Navigate to `chrome://extensions/` in your address bar
   - Alternatively: Menu (⋮) → Extensions → Manage Extensions

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner of the extensions page

4. **Load the Extension**
   - Click the "Load unpacked" button that appears after enabling developer mode
   - Browse to and select the folder containing the extension files
   - Click "Select Folder"

5. **Verify Installation**
   - The extension should now appear in your extensions list
   - You should see "LeetCode No-Spoilers" with a toggle switch
   - Make sure the toggle is enabled (blue/on)

## Usage

### Control Buttons

Once installed, you'll see two buttons positioned to the left of the bookmark button (or in the top-right corner as fallback):

#### 👁️ Show Code
- **Purpose**: Temporarily reveal all hidden code content
- **Behavior**:
  - Removes blur effect from all hidden code elements
  - Marks elements as temporarily shown
  - Does not permanently change the page
- **Use Case**: When you need to peek at code briefly

#### 🙈 Hide Code
- **Purpose**: Hide code content again after it was revealed
- **Behavior**:
  - Re-applies blur effect to all previously hidden code
  - Resets temporary show state
- **Use Case**: After peeking at code, hide it again

### Automatic Features

#### Substantial Code Content Hiding
- Automatically detects substantial code content on all LeetCode pages
- Focuses on large code containers (editors, solution blocks) while preserving small inline code snippets
- Applies a blur effect to code editors, solution blocks, submissions, and editorial code
- Minimum size requirements ensure problem descriptions and small examples remain visible
- Pages covered: solution pages, editorial pages, submission pages, discussion pages with substantial code

#### Link Protection
- Intercepts clicks on links leading to code/solutions/editorials
- Shows a confirmation dialog: "⚠️ Warning: You're about to view code/solution content. Are you sure you want to proceed?"
- Blocks navigation if you choose "Cancel"
- Shows a toast notification when navigation is blocked

#### Dynamic Content Handling
- Uses `MutationObserver` to detect dynamically loaded content
- Automatically hides new code content as it appears
- Handles LeetCode's single-page application navigation
- Monitors URL changes via multiple strategies (polling, popstate, history API)

## Technical Details

### Code Content Detection
The extension uses multiple strategies to identify code content:

```javascript
// Enhanced code detection including:
// - Code editors and code blocks
// - Solution-specific containers
// - Submission containers
// - Language-specific containers
'pre', 'code',
'.monaco-editor',
'[class*="editor"]', '[class*="code"]',
'[data-track-load*="solution"]',
'[class*="solution"]', '[class*="submission"]',
// Plus intelligent content analysis
```

### Smart Code Analysis
The extension analyzes content to distinguish code from problem descriptions:
- **Programming Patterns**: Detects code syntax, keywords, and constructs
- **Code Block Detection**: Identifies `<code>` and `<pre>` elements and Monaco editors
- **Context Awareness**: Considers surrounding DOM structure and class names
- **Content Filtering**: Focuses on elements that actually contain code

### Button Positioning
- **Primary**: Attempts to integrate with existing LeetCode UI elements
- **Fallback**: Uses fixed positioning in top-right corner
- **Adaptive Styling**: Changes appearance based on integration context

### URL Pattern Matching
```javascript
// Regex used to detect code-containing pages
/(\/editorial|\/solution|\/solutions|\/submissions|\/community\/solutions|\/discuss\/.*\/solution)/i
// Plus query parameters: tab=code|tab=solutions|tab=submissions
```

### Permissions
- `storage`: For potential future settings storage
- `host_permissions`: Limited to `https://leetcode.com/*` and `https://leetcode.cn/*`

## Troubleshooting

### Extension Not Working
1. **Check if enabled**: Go to `chrome://extensions/` and ensure the toggle is on
2. **Reload the page**: Refresh the LeetCode page after installing
3. **Check console**: Open Developer Tools (F12) and look for any JavaScript errors

### Buttons Not Appearing
1. **Page load timing**: Wait a few seconds for the page to fully load
2. **Content blocking**: Check if other extensions might be interfering
3. **Zoom level**: Try resetting your browser zoom to 100%

### Blurring Not Working
1. **URL check**: Ensure you're on a page with solution/editorial in the URL
2. **Dynamic content**: Some content loads asynchronously; wait a moment
3. **Clear cache**: Try clearing your browser cache and reloading

### Link Interception Issues
1. **Event conflicts**: Other extensions might interfere with click events
2. **Page navigation**: Some LeetCode navigation might bypass standard link clicks

## Development

### Debugging
To enable debug logging, edit `content.js` and change:
```javascript
const DEBUG = false; // Change to true
```

This will show detailed console logs about the extension's behavior.

### File Structure
```
leetcode-no-spoilers/
├── manifest.json      # Extension configuration
├── content.js         # Main functionality
├── content.css        # Styling for blur effects and controls
└── README.md          # This file
```

## Privacy & Security

- **No data collection**: The extension doesn't collect or transmit any personal data
- **Local operation**: All functionality runs locally in your browser
- **Minimal permissions**: Only requests necessary permissions for basic functionality
- **No background scripts**: Runs only when you're on LeetCode pages

## License

This extension is for personal use. Please respect LeetCode's terms of service and use this tool responsibly for learning purposes.
