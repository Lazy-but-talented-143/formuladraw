import { FormulaStep } from "../../models/FormulaStep";

export function evaluateFormulaToSVG(step: FormulaStep): string {
    const p = step.parameters || {};
    
    if (step.type === 'CIRCLE') {
        const cx = p.cx || 0;
        const cy = p.cy || 0;
        const r = p.r || 10;
        return `M ${(cx - r).toFixed(1)}, ${cy.toFixed(1)} a ${r.toFixed(1)},${r.toFixed(1)} 0 1,0 ${(r * 2).toFixed(1)},0 a ${r.toFixed(1)},${r.toFixed(1)} 0 1,0 -${(r * 2).toFixed(1)},0`;
    }
    
    if (step.type === 'LINEAR') {
        if (p.x1 !== undefined && p.y1 !== undefined && p.x2 !== undefined && p.y2 !== undefined) {
            return `M ${p.x1.toFixed(1)},${p.y1.toFixed(1)} L ${p.x2.toFixed(1)},${p.y2.toFixed(1)}`;
        }
        const m = p.m || 0;
        const b = p.b || 0;
        if (p.vertical) {
            const minY = p.minY || 0;
            const maxY = p.maxY || 100;
            const x1 = m * minY + b;
            const x2 = m * maxY + b;
            return `M ${x1.toFixed(1)}, ${minY.toFixed(1)} L ${x2.toFixed(1)}, ${maxY.toFixed(1)}`;
        }
        const minX = p.minX || 0;
        const maxX = p.maxX || 100;
        const y1 = m * minX + b;
        const y2 = m * maxX + b;
        return `M ${minX.toFixed(1)}, ${y1.toFixed(1)} L ${maxX.toFixed(1)}, ${y2.toFixed(1)}`;
    }
    
    if (step.type === 'BEZIER') {
        const sX = (p.startX ?? 0).toFixed(1);
        const sY = (p.startY ?? 0).toFixed(1);
        const c1X = (p.cp1X ?? 0).toFixed(1);
        const c1Y = (p.cp1Y ?? 0).toFixed(1);
        const c2X = (p.cp2X ?? 0).toFixed(1);
        const c2Y = (p.cp2Y ?? 0).toFixed(1);
        const eX = (p.endX ?? 0).toFixed(1);
        const eY = (p.endY ?? 0).toFixed(1);
        return `M ${sX},${sY} C ${c1X},${c1Y} ${c2X},${c2Y} ${eX},${eY}`;
    }

    return `M 0,0 L 100,100`;
}
