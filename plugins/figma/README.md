# Figma Plugin: Variable Font & Dynamic Parameter Controller

A native Figma Plugin for controlling OpenType Variable Fonts, spline Bézier easing curves, and 2D design space fields directly inside Figma and FigJam.

---

## Installation in Figma

1. Open **Figma Desktop App** or Figma in your browser.
2. In the top Figma menu, go to:
   **Plugins > Development > Import manifest from manifest.json...**
3. Select `manifest.json` inside this `figma/` folder.
4. Run **Variable Font & Dynamic Parameter Controller** in Figma or FigJam.
5. Click the theme icon (🌓) in the header to switch to **Figma Dark** or **Figma Light** UI themes.

---

## Directory Structure

```
figma/
├── manifest.json       # Figma Plugin manifest
├── code.js             # Figma Plugin main sandbox thread
├── index.html          # Responsive Figma UI panel
├── css/
│   ├── figma-theme.css # Figma Design Tokens & UI System
│   ├── styles.css      # Core styles & themes
│   └── components.css  # Hakobian UI Components
└── js/
    ├── bridge.js       # Figma postMessage communication bridge
    ├── app.js          # Core app controller
    ├── themeManager.js # Figma theme manager
    ├── tourGuide.js    # Interactive guide
    └── modes/          # Sliders, Bézier Spline Studio, 2D Design Space
```
