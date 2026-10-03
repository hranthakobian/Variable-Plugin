# Adobe CC Variable Font & Dynamic Parameter Controller Suite
## (Adobe Illustrator, Adobe InDesign & Adobe Photoshop)

A professional, multi-host Adobe CEP extension panel engineered to manipulate OpenType Variable Fonts and dynamic vector/layer parameters across three specialized control paradigms in **Adobe Illustrator**, **Adobe InDesign**, and **Adobe Photoshop**.

---

## Folder Architecture & Organization

The codebase is organized both as a unified multi-host extension package and into modular standalone application subdirectories:

```
Variables Plugin/
├── CSXS/
│   └── manifest.xml             # Multi-Host CEP manifest (ILST, IDSN, PHXS, PHSP)
├── host/
│   ├── index.jsx                # Multi-Host auto-dispatcher engine
│   ├── illustrator/
│   │   └── index.jsx            # Illustrator ExtendScript DOM engine
│   ├── indesign/
│   │   └── index.jsx            # InDesign ExtendScript DOM engine
│   └── photoshop/
│       └── index.jsx            # Photoshop ExtendScript DOM engine
├── plugins/                     # Dedicated Application Folders
│   ├── Illustrator/             # Standalone Adobe Illustrator plugin package
│   ├── InDesign/                # Standalone Adobe InDesign plugin package
│   └── Photoshop/               # Standalone Adobe Photoshop plugin package
├── css/
│   ├── components.css           # UI components & spectrum controls
│   └── styles.css               # Dark theme responsive layouts
├── js/
│   ├── lib/
│   │   └── CSInterface.js       # Standard CEP interface layer
│   ├── bridge.js                # Multi-host promisified bridge & browser mock simulation
│   ├── modes/
│   │   ├── sliderMode.js        # 1D Slider Mode logic & bidirectional sync
│   │   ├── graphMode.js         # Bézier canvas math & distribution engine
│   │   └── designSpaceMode.js   # 2D Cartesian grid canvas & projection math
│   └── app.js                   # Main application coordinator
├── index.html                   # Semantic HTML5 panel structure
├── install.ps1                  # One-Click PowerShell Multi-App Installer
├── install.bat                  # Windows batch installer wrapper
├── uninstall.ps1                # Multi-App Uninstaller script
└── HELP.md                      # Detailed Armenian & English User Manual
```

---

## Control Modes

### 1. Slider Mode (1D Control)
- **Granular Axis Control:** Dynamic range sliders paired with high-precision numerical stepper inputs.
- **Bidirectional Synchronization:** Real-time scrubbing immediately updates numeric readouts, and typing numeric values immediately repositions the slider.
- **Dynamic Axis Discovery:** Automatically populates axes based on active selection (`wght`, `wdth`, `slnt`, `opsz`, or shape stroke/opacity).
- **Weight Presets:** Thin (100), Light (300), Regular (400), Bold (700), and Black (900).

### 2. Graph / Easing Mode (Curve Mapping)
- **Interactive Bézier Curve Canvas:** Dual-handle cubic Bézier curve editor with tangent control stems ($P_1$ and $P_2$), grid guidelines, and responsive Retina/HiDPI rendering.
- **Newton-Raphson Curve Solver:** Inverts parametric cubic Bézier polynomials in real time to calculate $Y(X)$ for any point along the distribution.
- **Presets:** Linear, Ease-In, Ease-Out, S-Curve, and Bell Curve.
- **Distribution Scope:** Character-by-Character glyph mapping or Item-by-Item artwork mapping.

### 3. 2D Design Space Field Mode (2D Cartesian Grid)
- **Dual-Axis Cartesian Mapping:** Control two primary axes simultaneously (e.g. $X$ = Weight `wght`, $Y$ = Slant `slnt`).
- **Interactive Draggable Node:** Central crosshair handle with live coordinate projection lines.
- **4 Master Corner Anchors & Center Snap:** Instantly snap to design space extremes or median.

---

## Installation & Deployment

### Automatic One-Click Installation (Windows)
1. Right-click `install.bat` and select **Run as Administrator** (or execute `./install.ps1` in PowerShell).
2. The installer will automatically enable `PlayerDebugMode` for Adobe CSXS 7 through 16 across Illustrator, InDesign, and Photoshop, and deploy the extension packages to `%APPDATA%\Adobe\CEP\extensions\`.

### Automatic Installation (macOS)
1. Open Terminal and navigate to the project directory:
   ```bash
   cd "/path/to/Variables Plugin"
   chmod +x install.sh uninstall.sh
   ./install.sh
   ```
2. The script will configure `defaults write com.adobe.CSXS.<version> PlayerDebugMode 1` for CSXS 7..16 and deploy the plugin packages to `~/Library/Application Support/Adobe/CEP/extensions/`.

### Launching in Adobe Applications
- **Adobe Illustrator:** Go to `Window > Extensions > Variable Controller`
- **Adobe InDesign:** Go to `Window > Extensions > Variable Controller`
- **Adobe Photoshop:** Go to `Window > Extensions > Variable Controller`

### Launching as a Native Figma Plugin
1. Open **Figma Desktop App** or Figma in browser.
2. In Figma top menu, navigate to **Plugins > Development > Import manifest from manifest.json...**
3. Select `manifest.json` located in this plugin root directory (`Variables Plugin/manifest.json`).
4. Run **Variable Font & Dynamic Parameter Controller** directly inside Figma or FigJam.
5. Toggle the theme button in the panel header to switch between Adobe Spectrum and **Figma Design Language (Figma Dark / Figma Light)**.

---

## Standalone Browser Preview & Testing

Open `index.html` in any modern web browser (Chrome, Edge, Firefox) to preview and test the UI, Bézier distribution math, 2D design space controls, and Figma Design Language themes (`figma-dark`, `figma-light`) without needing Adobe apps or Figma running.
