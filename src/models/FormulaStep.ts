import { ShapeType } from "./GeometryPath";

export interface FormulaParameter {
    name: string;
    value: number;
    min?: number;
    max?: number;
    step?: number;
}

export interface FormulaStep {
    id: string;
    stepNumber: number;
    pathId: string;
    groupId?: string;
    type: ShapeType;
    equation: string;
    latexEquation: string;
    parameters: Record<string, number>;
    parameterDefs?: FormulaParameter[];
    domain: [number, number];
    confidence: number;
    fitError: number;
    complexityScore: number;
    status: 'pending' | 'evaluating' | 'completed';
    renderStatus: 'hidden' | 'drawing' | 'visible';
    svgPathData?: string;
}
