import { Point, BoundingBox } from "../models/GeometryPath";

export function getBoundingBox(points: Point[]): BoundingBox {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const p of points) {
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
    }

    return { minX, minY, maxX, maxY };
}

export function isClosed(points: Point[], threshold: number = 5): boolean {
    if (points.length < 3) return false;
    const first = points[0];
    const last = points[points.length - 1];
    const dist = Math.sqrt(Math.pow(first.x - last.x, 2) + Math.pow(first.y - last.y, 2));
    return dist <= threshold;
}
