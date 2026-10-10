import { Point } from "../../../models/GeometryPath";

export interface BezierModel {
    type: 'BEZIER';
    startX: number;
    startY: number;
    cp1X: number;
    cp1Y: number;
    cp2X: number;
    cp2Y: number;
    endX: number;
    endY: number;
}

function fitSingleBezier(points: Point[]): { model: BezierModel; maxError: number; maxErrorIdx: number } {
    const first = points[0];
    const last = points[points.length - 1];

    if (points.length <= 2) {
        const cp1X = first.x + (last.x - first.x) / 3;
        const cp1Y = first.y + (last.y - first.y) / 3;
        const cp2X = last.x - (last.x - first.x) / 3;
        const cp2Y = last.y - (last.y - first.y) / 3;
        return {
            model: { type: 'BEZIER', startX: first.x, startY: first.y, cp1X, cp1Y, cp2X, cp2Y, endX: last.x, endY: last.y },
            maxError: 0,
            maxErrorIdx: 0
        };
    }

    // Compute chord lengths for parameterization
    const t = [0];
    let totalLength = 0;
    for (let i = 1; i < points.length; i++) {
        const dx = points[i].x - points[i - 1].x;
        const dy = points[i].y - points[i - 1].y;
        totalLength += Math.sqrt(dx * dx + dy * dy);
        t.push(totalLength);
    }
    
    if (totalLength === 0) {
        return {
            model: { type: 'BEZIER', startX: first.x, startY: first.y, cp1X: first.x, cp1Y: first.y, cp2X: first.x, cp2Y: first.y, endX: first.x, endY: first.y },
            maxError: 0,
            maxErrorIdx: 0
        };
    }
    
    for (let i = 0; i < t.length; i++) {
        t[i] /= totalLength;
    }

    // Least Squares algebraic fit for P1 and P2
    let a11 = 0, a12 = 0, a21 = 0, a22 = 0;
    let b1X = 0, b1Y = 0, b2X = 0, b2Y = 0;

    for (let i = 0; i < points.length; i++) {
        const ti = t[i];
        const mt = 1 - ti;
        const b1 = 3 * mt * mt * ti;
        const b2 = 3 * mt * ti * ti;
        const b0 = mt * mt * mt;
        const b3 = ti * ti * ti;
        
        const targetX = points[i].x - (b0 * first.x + b3 * last.x);
        const targetY = points[i].y - (b0 * first.y + b3 * last.y);
        
        a11 += b1 * b1;
        a12 += b1 * b2;
        a21 += b1 * b2;
        a22 += b2 * b2;
        
        b1X += b1 * targetX;
        b1Y += b1 * targetY;
        b2X += b2 * targetX;
        b2Y += b2 * targetY;
    }

    const det = a11 * a22 - a12 * a21;
    let cp1X: number, cp1Y: number, cp2X: number, cp2Y: number;
    
    if (Math.abs(det) < 1e-10) {
        cp1X = first.x + (last.x - first.x) / 3;
        cp1Y = first.y + (last.y - first.y) / 3;
        cp2X = last.x - (last.x - first.x) / 3;
        cp2Y = last.y - (last.y - first.y) / 3;
    } else {
        cp1X = (a22 * b1X - a12 * b2X) / det;
        cp1Y = (a22 * b1Y - a12 * b2Y) / det;
        cp2X = (a11 * b2X - a21 * b1X) / det;
        cp2Y = (a11 * b2Y - a21 * b1Y) / det;
    }

    // Evaluate error at each point
    let maxError = 0;
    let maxErrorIdx = Math.floor(points.length / 2);

    for (let i = 0; i < points.length; i++) {
        const ti = t[i];
        const mt = 1 - ti;
        const bx = mt * mt * mt * first.x + 3 * mt * mt * ti * cp1X + 3 * mt * ti * ti * cp2X + ti * ti * ti * last.x;
        const by = mt * mt * mt * first.y + 3 * mt * mt * ti * cp1Y + 3 * mt * ti * ti * cp2Y + ti * ti * ti * last.y;
        
        const err = Math.sqrt((points[i].x - bx) ** 2 + (points[i].y - by) ** 2);
        if (err > maxError) {
            maxError = err;
            maxErrorIdx = i;
        }
    }

    // Check control point sanity to avoid wild overshoots / loops
    const chordLen = totalLength;
    const d1 = Math.sqrt((cp1X - first.x) ** 2 + (cp1Y - first.y) ** 2);
    const d2 = Math.sqrt((cp2X - last.x) ** 2 + (cp2Y - last.y) ** 2);
    
    // Clamp control points to avoid self-intersecting loops
    const maxOffset = Math.max(10, chordLen * 1.2);
    if (d1 > maxOffset && d1 > 0) {
        cp1X = first.x + ((cp1X - first.x) / d1) * maxOffset;
        cp1Y = first.y + ((cp1Y - first.y) / d1) * maxOffset;
    }
    if (d2 > maxOffset && d2 > 0) {
        cp2X = last.x + ((cp2X - last.x) / d2) * maxOffset;
        cp2Y = last.y + ((cp2Y - last.y) / d2) * maxOffset;
    }

    if (d1 > chordLen * 1.5 || d2 > chordLen * 1.5) {
        maxError = Math.max(maxError, 999); // Force subdivision
    }

    return {
        model: {
            type: 'BEZIER',
            startX: first.x, startY: first.y,
            cp1X, cp1Y, cp2X, cp2Y,
            endX: last.x, endY: last.y
        },
        maxError,
        maxErrorIdx
    };
}

export function fitBezier(points: Point[], maxAllowedError = 2.5, depth = 0): BezierModel[] {
    if (points.length < 2) return [];

    const fit = fitSingleBezier(points);

    // If fit is accurate enough or points array is small or max depth reached, return single Bezier
    if (fit.maxError <= maxAllowedError || points.length <= 4 || depth >= 5) {
        return [fit.model];
    }

    // Otherwise subdivide at max error index
    let splitIdx = fit.maxErrorIdx;
    if (splitIdx <= 0 || splitIdx >= points.length - 1) {
        splitIdx = Math.floor(points.length / 2);
    }

    const leftPoints = points.slice(0, splitIdx + 1);
    const rightPoints = points.slice(splitIdx);

    const leftFits = fitBezier(leftPoints, maxAllowedError, depth + 1);
    const rightFits = fitBezier(rightPoints, maxAllowedError, depth + 1);

    return [...leftFits, ...rightFits];
}

