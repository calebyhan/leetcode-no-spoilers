# Icon Files

To complete the extension setup, you'll need to create icon files in PNG format with the following sizes:

- `icon16.png` (16x16 pixels)
- `icon32.png` (32x32 pixels) 
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

## Quick Icon Creation

You can use any image editor or online tool to create these icons. Here's a simple approach:

### Option 1: Use an online icon generator
1. Go to a site like favicon.io or iconifier.net
2. Upload a base image or create a simple design
3. Generate all required sizes
4. Download and place them in this icons/ folder

### Option 2: Use a simple design
Create a simple shield icon with the following elements:
- Background: Dark blue (#1e3a8a) or black
- Symbol: A shield or eye-slash icon in white
- Text: Optional "NS" for "No-Spoilers"

### Option 3: Use the provided SVG as reference
Create PNG versions based on this simple design concept:
- 🛡️ Shield symbol
- Blue/black color scheme
- Clean, simple design that's recognizable at small sizes

### Example SVG (for reference):
```svg
<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <rect width="128" height="128" rx="20" fill="#1e3a8a"/>
  <path d="M64 20 L100 35 L100 65 Q100 85 64 108 Q28 85 28 65 L28 35 Z" fill="#ffffff"/>
  <path d="M45 55 L55 65 L83 37" stroke="#1e3a8a" stroke-width="4" fill="none"/>
</svg>
```

The extension will work without icons, but having them makes it look more professional in the Chrome extensions manager.
