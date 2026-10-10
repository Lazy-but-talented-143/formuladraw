export type ShapeType = 'LINEAR' | 'CIRCLE' | 'ELLIPSE' | 'BEZIER' | 'MULTI_BEZIER' | 'SPLINE' | 'NUMERICAL';

export interface Point {
    x: number;
    y: number;
}

export interface BoundingBox {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
}

export interface GeometryPath {
    id: string;
    points: Point[];
    simplifiedPoints: Point[];
    type?: ShapeType;
    closed: boolean;
    boundingBox: BoundingBox;
    confidence: number;
    importance: number;
    order: number;
    structuralGroupId?: string;
    mathematicalRepresentation?: any;
}
