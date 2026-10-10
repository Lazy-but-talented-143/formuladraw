FormulaDraw
Turn images into geometry and mathematics.
FormulaDraw is a browser-based React + TypeScript application that analyzes an uploaded image, extracts contours, classifies shapes, fits mathematical models, and presents the reconstruction as a sequence of formula steps.
Features
Upload supported images: PNG, JPG/JPEG, WebP, and SVG.
Extract image contours using an image-processing pipeline based on grayscale conversion, Gaussian blur, Sobel gradients, edge thinning/suppression, and contour tracing.
Classify detected paths into shape categories such as straight lines, circles, and Bézier curves.
Fit mathematical models to detected paths and generate formula steps.
View the reconstruction progressively, step by step.
Control playback and navigate through formula steps.
Select paths and inspect the reconstruction in the workspace.
View saved sessions in the history interface.
Export the visible reconstruction as SVG.
> **Note:** Results depend on image quality, contrast, and complexity. This is a geometry-reconstruction project, so detected contours and fitted models may not exactly match every input image. The current implementation performs processing in the browser and does not require a separate backend server.
Tech stack
React 19
TypeScript
Vite
KaTeX and react-katex for mathematical notation
Lucide React for icons
HTML Canvas and SVG for image processing and rendering
Requirements
Install the following before running the project:
Node.js (use a current LTS version)
npm (included with Node.js)
Git (for Git-based upload)
Check the installations:
```bash
node -v
npm -v
git --version
```
Run locally
Download or clone this repository.
Open a terminal in the project folder—the folder containing `package.json`.
Install dependencies:
```bash
   npm install
   ```
Start the development server:
```bash
   npm run dev
   ```
Open the local URL printed in the terminal (Vite commonly uses `http://localhost:5173`).
To create a production build:
```bash
npm run build
```
To preview the production build locally:
```bash
npm run preview
```
To run lint checks:
```bash
npm run lint
```
Project structure
```text
formuladraw-dist/
├── public/                  # Static public assets, if present
├── src/
│   ├── assets/              # Images and bundled assets
│   ├── components/          # Landing page, workspace, canvas, history and UI components
│   ├── engine/
│   │   ├── geometry/        # Shape classification
│   │   ├── image/           # Image contour extraction
│   │   └── mathematics/     # Formula generation, evaluation and model fitting
│   ├── models/              # Geometry and formula data types
│   ├── state/               # React context and reducer-based application state
│   ├── utils/               # Geometry and math utilities
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
├── index.html
├── package.json
├── package-lock.json
├── tsconfig*.json
└── vite.config.ts





## 🚀 Live Demo

**Try FormulaDraw:** [Open FormulaDraw](https://formuladraw.netlify.app/)

FormulaDraw converts uploaded images into geometric paths and mathematical representations directly in the browser.

## 🛠️ Built With

- React
- TypeScript
- Vite
- SVG and HTML Canvas
- KaTeX

## ✨ Key Features

- Image contour extraction
- Geometric shape classification
- Mathematical model fitting
- Step-by-step reconstruction
- SVG export
