# FormulaDraw

**Turn images into geometry and mathematics.**

FormulaDraw is a browser-based React and TypeScript application that analyzes an uploaded image, extracts contours, classifies shapes, fits mathematical models, and presents the reconstruction as a sequence of formula steps.

## 🚀 Live Demo

**[Open FormulaDraw](https://formuladraw.netlify.app/)**

## ✨ Features

- Upload PNG, JPG/JPEG, WebP, and SVG images.
- Extract image contours using grayscale conversion, Gaussian blur, Sobel gradients, edge thinning/suppression, and contour tracing.
- Classify detected paths into shape categories such as straight lines, circles, and Bézier curves.
- Fit mathematical models to detected paths and generate formula steps.
- View the reconstruction progressively, step by step.
- Control playback and navigate through formula steps.
- Select paths and inspect the reconstruction in the workspace.
- View saved sessions in the history interface.
- Export the visible reconstruction as SVG.

> **Note:** Results depend on image quality, contrast, and complexity. Detected contours and fitted models may not exactly match every input image. Image processing runs in the browser; a separate backend server is not required by the current implementation.

## 🛠️ Tech Stack

- React 19
- TypeScript
- Vite
- KaTeX and react-katex for mathematical notation
- Lucide React for icons
- HTML Canvas and SVG for image processing and rendering

## 📋 Requirements

Install the following before running the project:

- [Node.js](https://nodejs.org/) (current LTS version recommended)
- npm (included with Node.js)
- [Git](https://git-scm.com/downloads) (for Git-based workflows)

Check your installations:

```bash
node -v
npm -v
git --version
```

## 💻 Run Locally

1. Clone or download this repository.
2. Open a terminal in the project folder—the folder containing `package.json`.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the local URL printed in the terminal. Vite commonly uses `http://localhost:5173`.

### Production build

```bash
npm run build
```

### Preview the production build

```bash
npm run preview
```

### Run lint checks

```bash
npm run lint
```

## 📁 Project Structure

```text
formuladraw-dist/
├── public/                  # Static public assets
├── src/
│   ├── assets/              # Images and bundled assets
│   ├── components/          # Landing page, workspace, canvas, history and UI
│   ├── engine/
│   │   ├── geometry/        # Shape classification
│   │   ├── image/           # Image contour extraction
│   │   └── mathematics/     # Formula generation and model fitting
│   ├── models/              # Geometry and formula data types
│   ├── state/               # React context and reducer-based state
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
```

## 🌐 Deployment

FormulaDraw is deployed on Netlify:

**Live site:** https://formuladraw.netlify.app/

For a Vite deployment, the typical build settings are:

- **Build command:** `npm run build`
- **Publish directory:** `dist`

## 🤝 Contributing

Suggestions and improvements are welcome. Before submitting changes, run `npm run build` and verify that the application works as expected.

## 📄 License

No license has been specified for this project yet. Add a license before allowing others to reuse, modify, or redistribute the code.
