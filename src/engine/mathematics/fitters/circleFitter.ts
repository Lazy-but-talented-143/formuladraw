import { Point } from "../../../models/GeometryPath";

export function fitCircle(points: Point[]): any {
    if (points.length < 3) return null;
    
    let cx = 0, cy = 0;
    for (const p of points) {
        cx += p.x;
        cy += p.y;
    }
    cx /= points.length;
    cy /= points.length;

    let rSum = 0;
    for (const p of points) {
        rSum += Math.sqrt(Math.pow(p.x - cx, 2) + Math.pow(p.y - cy, 2));
    }
    const r = rSum / points.length;

    return { type: 'CIRCLE', cx, cy, r };
}
