import { GeometryPath, ShapeType } from "../../models/GeometryPath";
import { isClosed } from "../../utils/geometryUtils";

export function classifyShape(path: GeometryPath): ShapeType {
    const points = path.points;
    if (!points || points.length < 2) return 'LINEAR';
    if (points.length <= 3) return 'LINEAR';

    const start = points[0];
    const end = points[points.length - 1];
    const chordLen = Math.hypot(end.x - start.x, end.y - start.y);

    if (chordLen < 15) return 'LINEAR';

    const closed = isClosed(points);
    if (closed && points.length > 8) {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (const p of points) {
            if (p.x < minX) minX = p.x;
            if (p.y < minY) minY = p.y;
            if (p.x > maxX) maxX = p.x;
            if (p.y > maxY) maxY = p.y;
        }
        const w = maxX - minX;
        const h = maxY - minY;
        const aspect = w / (h || 1);
        if (aspect > 0.8 && aspect < 1.25 && w > 10) {
            return 'CIRCLE';
        }
    }

    // Check max perpendicular distance from chord
    let maxLineDist = 0;
    if (chordLen > 0) {
        for (let i = 1; i < points.length - 1; i++) {
            const p = points[i];
            const dist = Math.abs((end.y - start.y) * p.x - (end.x - start.x) * p.y + end.x * start.y - end.y * start.x) / chordLen;
            if (dist > maxLineDist) maxLineDist = dist;
        }
    }
    
    if (maxLineDist <= 2.2) {
        return 'LINEAR';
    }

    return 'BEZIER';
}
