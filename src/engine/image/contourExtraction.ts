import { Point } from "../../models/GeometryPath";
import { simplifyPath } from "../../utils/mathUtils";

export interface ExtractedContour {
    points: Point[];
    svgPath: string;
}

/**
 * Full Canny pipeline: works on photographs AND line art.
 * Steps: Grayscale -> Gaussian blur -> Sobel -> NMS -> Hysteresis -> Skeletonize -> Trace
 */
export async function extractContoursFromImage(
    imageUrl: string,
    width: number,
    height: number
): Promise<ExtractedContour[]> {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            // Process at 2x resolution for subpixel accuracy
            const W = width  * 2;
            const H = height * 2;
            const outputScale = 0.5;

            const canvas = document.createElement("canvas");
            canvas.width  = W;
            canvas.height = H;
            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            if (!ctx) return resolve([]);

            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, W, H);

            const imgScale = Math.min(W / img.width, H / img.height);
            const offX = Math.round((W - img.width  * imgScale) / 2);
            const offY = Math.round((H - img.height * imgScale) / 2);
            ctx.drawImage(img, offX, offY, img.width * imgScale, img.height * imgScale);

            const { data } = ctx.getImageData(0, 0, W, H);

            // 1. Grayscale
            const grayF = new Float32Array(W * H);
            for (let i = 0; i < W * H; i++) {
                grayF[i] = 0.299 * data[i*4] + 0.587 * data[i*4+1] + 0.114 * data[i*4+2];
            }

            // 2. 5x5 Gaussian blur (sigma ~1.4)
            const gKernel = [
                2/159, 4/159, 5/159, 4/159, 2/159,
                4/159, 9/159,12/159, 9/159, 4/159,
                5/159,12/159,15/159,12/159, 5/159,
                4/159, 9/159,12/159, 9/159, 4/159,
                2/159, 4/159, 5/159, 4/159, 2/159
            ];
            const blurred = new Float32Array(W * H);
            for (let py = 2; py < H - 2; py++) {
                for (let px = 2; px < W - 2; px++) {
                    let s = 0;
                    for (let ky = -2; ky <= 2; ky++) {
                        for (let kx = -2; kx <= 2; kx++) {
                            s += grayF[(py+ky)*W+(px+kx)] * gKernel[(ky+2)*5+(kx+2)];
                        }
                    }
                    blurred[py*W+px] = s;
                }
            }

            // 3. Sobel gradient magnitude + direction
            const magMap   = new Float32Array(W * H);
            const angleMap = new Float32Array(W * H);
            const sobelX = [-1,0,1,-2,0,2,-1,0,1];
            const sobelY = [-1,-2,-1,0,0,0,1,2,1];
            let maxMag = 0;
            for (let py = 1; py < H - 1; py++) {
                for (let px = 1; px < W - 1; px++) {
                    let gx = 0, gy = 0;
                    for (let ky = -1; ky <= 1; ky++) {
                        for (let kx = -1; kx <= 1; kx++) {
                            const v  = blurred[(py+ky)*W+(px+kx)];
                            const ki = (ky+1)*3+(kx+1);
                            gx += v * sobelX[ki];
                            gy += v * sobelY[ki];
                        }
                    }
                    const m = Math.sqrt(gx*gx + gy*gy);
                    magMap[py*W+px]   = m;
                    angleMap[py*W+px] = Math.atan2(gy, gx);
                    if (m > maxMag) maxMag = m;
                }
            }

            // 4. Non-Maximum Suppression: thin edges to 1 pixel wide
            const nmsMap = new Float32Array(W * H);
            for (let py = 1; py < H - 1; py++) {
                for (let px = 1; px < W - 1; px++) {
                    const idx = py*W+px;
                    const m   = magMap[idx];
                    if (m === 0) continue;
                    // Quantise gradient angle to 4 sectors
                    const deg = ((angleMap[idx] * 180 / Math.PI) % 180 + 180) % 180;
                    let m1: number, m2: number;
                    if (deg < 22.5 || deg >= 157.5) {
                        m1 = magMap[idx+1];             m2 = magMap[idx-1];
                    } else if (deg < 67.5) {
                        m1 = magMap[(py-1)*W+(px+1)];   m2 = magMap[(py+1)*W+(px-1)];
                    } else if (deg < 112.5) {
                        m1 = magMap[(py-1)*W+px];       m2 = magMap[(py+1)*W+px];
                    } else {
                        m1 = magMap[(py-1)*W+(px-1)];   m2 = magMap[(py+1)*W+(px+1)];
                    }
                    if (m >= m1 && m >= m2) nmsMap[idx] = m;
                }
            }

            // 5. Hysteresis thresholding + BFS to connect weak edges to strong
            // Lower thresholds capture more fine detail in photographs
            const highT = maxMag * 0.08;
            const lowT  = maxMag * 0.03;
            const STRONG = 2, WEAK = 1;
            const edgeMap = new Uint8Array(W * H);
            for (let i = 0; i < nmsMap.length; i++) {
                if      (nmsMap[i] >= highT) edgeMap[i] = STRONG;
                else if (nmsMap[i] >= lowT)  edgeMap[i] = WEAK;
            }

            const bfsQueue: number[] = [];
            for (let i = 0; i < edgeMap.length; i++) if (edgeMap[i] === STRONG) bfsQueue.push(i);
            const dn8 = [-W-1, -W, -W+1, -1, 1, W-1, W, W+1];
            let qi = 0;
            while (qi < bfsQueue.length) {
                const idx = bfsQueue[qi++];
                for (const dn of dn8) {
                    const ni = idx + dn;
                    if (ni >= 0 && ni < edgeMap.length && edgeMap[ni] === WEAK) {
                        edgeMap[ni] = STRONG;
                        bfsQueue.push(ni);
                    }
                }
            }

            // Canny NMS already produces 1-pixel-wide edges â€” use directly as skeleton
            // (Zhang-Suen skeletonization was over-thinning and disconnecting valid edge pixels)
            const skel = new Uint8Array(W * H);
            for (let i = 0; i < edgeMap.length; i++) skel[i] = edgeMap[i] === STRONG ? 1 : 0;

            // 7. Path tracing â€” greedy, starts from endpoints to get longest paths
            //    An "endpoint" is a skeleton pixel with exactly 1 neighbour.
            //    Starting from endpoints avoids cutting strokes in the middle.
            const DIRS = [
                {dx:1,dy:0},{dx:1,dy:1},{dx:0,dy:1},{dx:-1,dy:1},
                {dx:-1,dy:0},{dx:-1,dy:-1},{dx:0,dy:-1},{dx:1,dy:-1},
            ];
            const visited  = new Uint8Array(W * H);
            const rawPaths: Point[][] = [];

            // Count neighbours for each skel pixel
            const countNbrs = (px: number, py: number): number => {
                let c = 0;
                for (const d of DIRS) {
                    const tx = px + d.dx, ty = py + d.dy;
                    if (tx >= 0 && tx < W && ty >= 0 && ty < H && skel[ty*W+tx]) c++;
                }
                return c;
            };

            // Greedy tracer: at each step pick any unvisited neighbour
            // (no direction preference so it follows curves naturally)
            const traceFrom = (sx: number, sy: number): Point[] => {
                const path: Point[] = [];
                let cx = sx, cy = sy;
                while (true) {
                    const idx = cy*W+cx;
                    if (visited[idx]) break;
                    visited[idx] = 1;
                    path.push({x: cx, y: cy});
                    let nx = -1, ny = -1;
                    for (const d of DIRS) {
                        const tx = cx + d.dx, ty = cy + d.dy;
                        if (tx >= 0 && tx < W && ty >= 0 && ty < H &&
                            skel[ty*W+tx] && !visited[ty*W+tx]) {
                            nx = tx; ny = ty; break;
                        }
                    }
                    if (nx === -1) break;
                    cx = nx; cy = ny;
                }
                return path;
            };

            // Phase 1: trace from all endpoint pixels first (gives longest paths)
            for (let py = 1; py < H-1; py++) {
                for (let px = 1; px < W-1; px++) {
                    const idx = py*W+px;
                    if (!skel[idx] || visited[idx]) continue;
                    if (countNbrs(px, py) === 1) {
                        const path = traceFrom(px, py);
                        if (path.length >= 2) rawPaths.push(path);
                    }
                }
            }

            // Phase 2: sweep up any remaining unvisited pixels (closed loops / junction remnants)
            for (let py = 1; py < H-1; py++) {
                for (let px = 1; px < W-1; px++) {
                    const idx = py*W+px;
                    if (!skel[idx] || visited[idx]) continue;
                    const path = traceFrom(px, py);
                    if (path.length >= 2) rawPaths.push(path);
                }
            }

            // 8. Build pixel-perfect SVG output
            const result: ExtractedContour[] = [];
            const MG = 6;

            for (const fp of rawPaths) {
                if (fp.every(p => p.x <= offX + MG)) continue;
                if (fp.every(p => p.x >= offX + img.width  * imgScale - MG)) continue;
                if (fp.every(p => p.y <= offY + MG)) continue;
                if (fp.every(p => p.y >= offY + img.height * imgScale - MG)) continue;

                // Scale 2x internal coords -> output SVG coords
                const scaled: Point[] = fp.map(p => ({
                    x: p.x * outputScale,
                    y: p.y * outputScale
                }));

                // RDP epsilon=0.4 for near-pixel-perfect SVG paths
                const rPts = simplifyPath(scaled, 0.4);
                if (rPts.length < 2) continue;
                let svgPath = `M ${rPts[0].x.toFixed(1)},${rPts[0].y.toFixed(1)}`;
                for (let ri = 1; ri < rPts.length; ri++) {
                    svgPath += ` L ${rPts[ri].x.toFixed(1)},${rPts[ri].y.toFixed(1)}`;
                }

                result.push({
                    points: simplifyPath(scaled, 1.0),
                    svgPath
                });
            }

            resolve(result);
        };
        img.src = imageUrl;
    });
}

