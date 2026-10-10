export interface StructuralGroup {
    id: string;
    pathIds: string[];
    boundingBox: { minX: number; minY: number; maxX: number; maxY: number };
    confidence: number;
    continuityScore: number;
    coherenceScore: number;
    importance: number;
}
