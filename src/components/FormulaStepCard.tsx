import React from 'react';
import { useAppContext } from '../state/AppContext';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';
import { CheckCircle2, Circle } from 'lucide-react';

interface Props {
    step: any;
    index: number;
    currentStep: number;
}

const FormulaStepCard: React.FC<Props> = React.memo(({ step, index, currentStep }) => {
    const { dispatch } = useAppContext();
    
    // Status logic
    const isDone = index < currentStep;
    const isSelected = index === currentStep - 1;

    return (
        <div 
            className={`formula-card ${isSelected ? 'selected' : ''}`}
            onClick={() => {
                dispatch({ type: 'SELECT_FORMULA', payload: step.id });
                dispatch({ type: 'SET_CURRENT_STEP', payload: step.stepNumber });
            }}
        >
            <div className="formula-badge">
                {index + 1}
            </div>
            
            <div className="formula-content">
                <div className="formula-title">
                    {step.title || 'Base Line'}
                </div>
                <div className="formula-math">
                    <InlineMath math={step.latexEquation} />
                </div>
            </div>

            <div className={`formula-status ${isDone ? 'done' : ''} ${isSelected ? 'active' : ''}`}>
                {isDone ? (
                    <CheckCircle2 size={20} />
                ) : (
                    <Circle size={20} />
                )}
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    return (
        prevProps.step.id === nextProps.step.id &&
        prevProps.index === nextProps.index &&
        (prevProps.index < prevProps.currentStep) === (nextProps.index < nextProps.currentStep) &&
        (prevProps.index === prevProps.currentStep - 1) === (nextProps.index === nextProps.currentStep - 1)
    );
});

export default FormulaStepCard;
