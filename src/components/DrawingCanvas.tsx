import React, { useRef } from 'react';
import { useAppContext } from '../state/AppContext';
import { evaluateFormulaToSVG } from '../engine/mathematics/formulaEvaluator';

const DrawingCanvas: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const svgRef = useRef<SVGSVGElement>(null);

    const visibleSteps = state.formulaSteps.filter(s => s.stepNumber <= state.currentStep);

    return (
        <>
            {state.viewMode !== 'reconstruction' && state.originalImage && (
                <img 
                    src={state.originalImage} 
                    className="drawing-canvas" 
                    style={{ opacity: state.viewMode === 'overlay' ? 0.3 : 1 }}
                    alt="original"
                />
            )}
            
            {state.viewMode !== 'original' && (
                <svg ref={svgRef} className="canvas-layer" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet">
                    {visibleSteps.map((step) => {
                        const pathData = step.svgPathData || evaluateFormulaToSVG(step);
                        const isSelected = state.selectedFormulaId === step.id;
                        return (
                            <path
                                key={step.id}
                                d={pathData}
                                className={`math-path ${isSelected ? 'selected' : ''}`}
                                onClick={() => dispatch({ type: 'SELECT_FORMULA', payload: step.id })}
                            />
                        );
                    })}
                </svg>
            )}
        </>
    );
};

export default DrawingCanvas;
