import { Point } from "../models/GeometryPath";

export function distance(p1: Point, p2: Point): number {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

// Ramer-Douglas-Peucker simplification
export function simplifyPath(points: Point[], epsilon: number): Point[] {
    if (points.length <= 2) return points;

    let dmax = 0;
    let index = 0;
    const end = points.length - 1;

    for (let i = 1; i < end; i++) {
        const d = perpendicularDistance(points[i], points[0], points[end]);
        if (d > dmax) {
            index = i;
            dmax = d;
        }
    }

    if (dmax > epsilon) {
        const recResults1 = simplifyPath(points.slice(0, index + 1), epsilon);
        const recResults2 = simplifyPath(points.slice(index), epsilon);
        return recResults1.slice(0, -1).concat(recResults2);
    } else {
        return [points[0], points[end]];
    }
}

function perpendicularDistance(point: Point, lineStart: Point, lineEnd: Point): number {
    const area = Math.abs(
        0.5 * (lineStart.x * lineEnd.y + lineEnd.x * point.y + point.x * lineStart.y -
               lineEnd.x * lineStart.y - point.x * lineEnd.y - lineStart.x * point.y)
    );
    const bottom = distance(lineStart, lineEnd);
    if (bottom === 0) return distance(point, lineStart);
    return area / bottom * 2.0;
}
