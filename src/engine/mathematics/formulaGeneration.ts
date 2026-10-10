import { FormulaStep } from "../../models/FormulaStep";

export function generateFormula(fittedModel: any, stepNumber: number): FormulaStep {
    if (!fittedModel) {
        return {
            id: `step-${stepNumber}`,
            stepNumber,
            pathId: `path-${stepNumber}`,
            type: 'NUMERICAL',
            equation: 'y = f(x)',
            latexEquation: 'y = f(x)',
            parameters: {},
            domain: [0, 100],
            confidence: 0, fitError: 0, complexityScore: 0,
            status: 'completed', renderStatus: 'visible'
        };
    }
    
    if (fittedModel.type === 'CIRCLE') {
        return {
            id: `step-${stepNumber}`,
            stepNumber,
            pathId: `path-${stepNumber}`,
            type: 'CIRCLE',
            equation: `(x - ${fittedModel.cx.toFixed(1)})^2 + (y - ${fittedModel.cy.toFixed(1)})^2 = ${fittedModel.r.toFixed(1)}^2`,
            latexEquation: `(x - ${fittedModel.cx.toFixed(1)})^2 + (y - ${fittedModel.cy.toFixed(1)})^2 = ${fittedModel.r.toFixed(1)}^2`,
            parameters: { cx: fittedModel.cx, cy: fittedModel.cy, r: fittedModel.r },
            domain: [0, 2*Math.PI],
            confidence: 0.9, fitError: 1.2, complexityScore: 5,
            status: 'completed', renderStatus: 'visible'
        };
    }
    
    if (fittedModel.type === 'LINEAR_VERTICAL') {
        const m = fittedModel.m.toFixed(2);
        const b = fittedModel.b.toFixed(2);
        const eq = fittedModel.m === 0 ? `x = ${b}` : `x = ${m}y + ${b}`;
        return {
            id: `step-${stepNumber}`,
            stepNumber,
            pathId: `path-${stepNumber}`,
            type: 'LINEAR',
            equation: eq,
            latexEquation: eq,
            parameters: { 
                m: fittedModel.m, b: fittedModel.b, vertical: 1, 
                x1: fittedModel.x1, y1: fittedModel.y1, 
                x2: fittedModel.x2, y2: fittedModel.y2,
                minY: fittedModel.minY, maxY: fittedModel.maxY 
            },
            domain: [fittedModel.minY, fittedModel.maxY],
            confidence: 0.95, fitError: 0.5, complexityScore: 2,
            status: 'completed', renderStatus: 'visible'
        };
    }
    
    if (fittedModel.type === 'LINEAR') {
        const m = fittedModel.m.toFixed(2);
        const b = fittedModel.b.toFixed(2);
        return {
            id: `step-${stepNumber}`,
            stepNumber,
            pathId: `path-${stepNumber}`,
            type: 'LINEAR',
            equation: `y = ${m}x + ${b}`,
            latexEquation: `y = ${m}x + ${b}`,
            parameters: { 
                m: fittedModel.m, b: fittedModel.b, 
                x1: fittedModel.x1, y1: fittedModel.y1, 
                x2: fittedModel.x2, y2: fittedModel.y2,
                minX: fittedModel.minX, maxX: fittedModel.maxX 
            },
            domain: [fittedModel.minX, fittedModel.maxX],
            confidence: 0.95, fitError: 0.5, complexityScore: 2,
            status: 'completed', renderStatus: 'visible'
        };
    }
    
    if (fittedModel.type === 'BEZIER') {
        const p0 = `(${fittedModel.startX.toFixed(0)},${fittedModel.startY.toFixed(0)})`;
        const p3 = `(${fittedModel.endX.toFixed(0)},${fittedModel.endY.toFixed(0)})`;
        return {
            id: `step-${stepNumber}`,
            stepNumber,
            pathId: `path-${stepNumber}`,
            type: 'BEZIER',
            equation: `B(t) curve ${p0} -> ${p3}`,
            latexEquation: `\\mathbf{B}(t): ${p0} \\rightarrow ${p3}`,
            parameters: { 
                startX: fittedModel.startX, startY: fittedModel.startY, 
                cp1X: fittedModel.cp1X, cp1Y: fittedModel.cp1Y, 
                cp2X: fittedModel.cp2X, cp2Y: fittedModel.cp2Y, 
                endX: fittedModel.endX, endY: fittedModel.endY 
            },
            domain: [0, 1],
            confidence: 0.8, fitError: 2.0, complexityScore: 10,
            status: 'completed', renderStatus: 'visible'
        };
    }
    
    return {
        id: `step-${stepNumber}`,
        stepNumber,
        pathId: `path-${stepNumber}`,
        type: 'NUMERICAL',
        equation: `y = f(x)`,
        latexEquation: `y = f(x)`,
        parameters: {},
        domain: [0, 1],
        confidence: 0.5, fitError: 0, complexityScore: 100,
        status: 'completed', renderStatus: 'visible'
    };
}
