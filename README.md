# FormulaDraw

**Turn images into geometry and mathematics.**

FormulaDraw is a browser-based React + TypeScript application that analyzes an uploaded image, extracts contours, classifies shapes, fits mathematical models, and presents the reconstruction as a sequence of formula steps.

## Features

- Upload supported images: PNG, JPG/JPEG, WebP, and SVG.
- Extract image contours using an image-processing pipeline based on grayscale conversion, Gaussian blur, Sobel gradients, edge thinning/suppression, and contour tracing.
- Classify detected paths into shape categories such as straight lines, circles, and Bézier curves.
- Fit mathematical models to detected paths and generate formula steps.
- View the reconstruction progressively, step by step.
- Control playback and navigate through formula steps.
- Select paths and inspect the reconstruction in the workspace.
- View saved sessions in the history interface.
- Export the visible reconstruction as SVG.

> **Note:** Results depend on image quality, contrast, and complexity. This is a geometry-reconstruction project, so detected contours and fitted models may not exactly match every input image. The current implementation performs processing in the browser and does not require a separate backend server.

## Tech stack

- React 19
- TypeScript
- Vite
- KaTeX and react-katex for mathematical notation
- Lucide React for icons
- HTML Canvas and SVG for image processing and rendering

## Requirements

Install the following before running the project:

- [Node.js](https://nodejs.org/) (use a current LTS version)
- npm (included with Node.js)
- [Git](https://git-scm.com/downloads) (for Git-based upload)

Check the installations:

```bash
node -v
npm -v
git --version
```

## Run locally

1. Download or clone this repository.
2. Open a terminal in the project folder—the folder containing `package.json`.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the local URL printed in the terminal (Vite commonly uses `http://localhost:5173`).

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

## Project structure

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
```

Some folders in the tree (such as `public/`) may not exist in every version of the project.

## Upload to GitHub

### Option A — GitHub website (no terminal)

1. Sign in to [GitHub](https://github.com/).
2. Click **+** → **New repository**.
3. Repository name: `formuladraw` (or another name you prefer).
4. Add a short description, for example: `A browser-based image-to-geometry and mathematical reconstruction tool built with React and TypeScript.`
5. Choose **Public** or **Private**.
6. For the simplest upload, leave **Add a README**, **.gitignore**, and **license** unchecked because this project already contains files for these.
7. Click **Create repository**.
8. On the new repository page, choose **Add file** → **Upload files**.
9. Extract the ZIP on your computer first. Open the extracted `formuladraw-dist` folder and upload the **project source files and folders** (such as `src`, `index.html`, `package.json`, `package-lock.json`, `vite.config.ts`, TypeScript config files, and `.gitignore`) into the repository root.
10. Include this `README.md` in the repository root, then commit the upload.

**Important:** Do not upload `node_modules/`. It contains installed dependencies and is recreated with `npm install`. You generally do not need to upload the generated `dist/` folder either; it can be recreated with `npm run build`. GitHub's browser uploader may also be inconvenient for large batches of files, so the terminal method below is recommended.

### Option B — Git command line (recommended)

#### 1. Create an empty GitHub repository

Create a repository at [https://github.com/new](https://github.com/new). Name it `formuladraw`. If you are pushing an existing local project, leave the options to initialize it with a README, `.gitignore`, or license unchecked to avoid an unnecessary first-commit conflict.

#### 2. Extract and prepare the project

- Extract the downloaded ZIP.
- Open the extracted `formuladraw-dist` folder in File Explorer.
- Confirm that `package.json`, `src/`, and `index.html` are inside that folder.
- Replace the starter README with this FormulaDraw README and save it as `README.md` in the same folder.
- Check that `.gitignore` includes `node_modules/` and `dist/` (the supplied project already ignores these).

#### 3. Open a terminal in the project folder

In File Explorer, open the `formuladraw-dist` folder, click the address bar, type `cmd`, and press Enter. Alternatively, open the folder in VS Code and choose **Terminal → New Terminal**.

Run:

```bash
npm install
npm run build
```

Fix any errors before publishing. If the build succeeds, continue.

#### 4. Initialize Git and push

Run these commands in the project folder. Replace `YOUR_GITHUB_USERNAME` with your GitHub username and ensure the repository exists first.

```bash
git init
git add .
git commit -m "Initial commit: FormulaDraw"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/formuladraw.git
git push -u origin main
```

If Git says `remote origin already exists`, use this instead of the `git remote add origin ...` line:

```bash
git remote set-url origin https://github.com/YOUR_GITHUB_USERNAME/formuladraw.git
```

If Git asks you to identify yourself, configure the name and email you want associated with commits:

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

Then repeat the commit command. When GitHub authentication is requested, follow the sign-in/browser prompt or use GitHub's supported authentication method. Your GitHub account password is not accepted as a Git HTTPS password.

#### 5. Verify the upload

Refresh the GitHub repository page. Confirm that `README.md`, `package.json`, and `src/` are visible. Open `README.md` to check its formatting.

## Optional: publish a live demo

You can deploy this Vite app to a static hosting service such as [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/). Import the GitHub repository and use:

- **Build command:** `npm run build`
- **Output directory:** `dist`

After deployment, test image upload, reconstruction, formula-step navigation, history, and SVG export on the live site.

## Troubleshooting

- **`npm` or `node` is not recognized:** Install Node.js, restart the terminal, and run `node -v` and `npm -v` again.
- **Dependencies or packages are missing:** Run `npm install` from the folder containing `package.json`.
- **Build fails:** Read the first TypeScript/Vite error in the terminal and fix it before pushing.
- **Git push is rejected because the remote has commits:** If you initialized the GitHub repository with files, integrate the remote history rather than force-pushing blindly. For a new repository, the easiest route is to create an empty repository and push again.
- **Large or unnecessary files are staged:** Check `git status` before committing. Do not commit `node_modules/`, secrets, local `.env` files, or generated build output unless you intentionally need them.

## Contributing

Suggestions and improvements are welcome. For a change, create a branch, make the change, test it with `npm run build`, and open a pull request.

## License

No license has been specified in the supplied project. Add a license file before allowing others to reuse, modify, or redistribute the code.
#   f o r m u l a d r a w  
 