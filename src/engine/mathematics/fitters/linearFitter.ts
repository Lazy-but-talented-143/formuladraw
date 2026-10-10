import { Point } from "../../../models/GeometryPath";

export function fitLinear(points: Point[]): any {
    if (points.length < 2) return null;
    const p1 = points[0];
    const p2 = points[points.length - 1];
    
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
    const n = points.length;

    for (const p of points) {
        sumX += p.x;
        sumY += p.y;
        sumXY += p.x * p.y;
        sumX2 += p.x * p.x;
        sumY2 += p.y * p.y;
    }

    const denominatorX = n * sumX2 - sumX * sumX;
    const denominatorY = n * sumY2 - sumY * sumY;

    if (denominatorX < 1e-4 || denominatorY > denominatorX) {
        const m = (n * sumXY - sumX * sumY) / (denominatorY || 1e-4);
        const b = (sumX - m * sumY) / n;
        
        return {
            type: 'LINEAR_VERTICAL',
            m, b,
            x1: p1.x, y1: p1.y,
            x2: p2.x, y2: p2.y,
            minY: Math.min(p1.y, p2.y),
            maxY: Math.max(p1.y, p2.y)
        };
    } else {
        const m = (n * sumXY - sumX * sumY) / denominatorX;
        const b = (sumY - m * sumX) / n;
        
        return { 
            type: 'LINEAR', 
            m, b, 
            x1: p1.x, y1: p1.y,
            x2: p2.x, y2: p2.y,
            minX: Math.min(p1.x, p2.x),
            maxX: Math.max(p1.x, p2.x) 
        };
    }
}
