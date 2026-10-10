import React, { useState, useRef, useEffect, useMemo } from 'react';
import FormulaStepCard from './FormulaStepCard';

interface Props {
    formulaSteps: any[];
    currentStep: number;
    searchQuery?: string;
}

const ITEM_HEIGHT = 82; // average height of card + margin in px
const OVERSCAN = 5;

const VirtualizedFormulaList: React.FC<Props> = ({ formulaSteps, currentStep, searchQuery = '' }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scrollTop, setScrollTop] = useState(0);
    const [containerHeight, setContainerHeight] = useState(600);

    const filteredSteps = useMemo(() => {
        if (!searchQuery.trim()) return formulaSteps;
        const q = searchQuery.toLowerCase();
        return formulaSteps.filter((s, idx) => 
            (s.title && s.title.toLowerCase().includes(q)) ||
            (s.latexEquation && s.latexEquation.toLowerCase().includes(q)) ||
            (idx + 1).toString().includes(q)
        );
    }, [formulaSteps, searchQuery]);

    // Measure container dimensions
    useEffect(() => {
        const updateHeight = () => {
            if (containerRef.current) {
                setContainerHeight(containerRef.current.clientHeight || 600);
            }
        };
        updateHeight();
        window.addEventListener('resize', updateHeight);
        return () => window.removeEventListener('resize', updateHeight);
    }, []);

    // Handle scroll
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        setScrollTop(e.currentTarget.scrollTop);
    };

    // Auto-scroll to active formula when currentStep changes
    useEffect(() => {
        if (currentStep > 0 && containerRef.current) {
            const activeIndex = currentStep - 1;
            const itemTop = activeIndex * ITEM_HEIGHT;
            const itemBottom = itemTop + ITEM_HEIGHT;
            const currentScrollTop = containerRef.current.scrollTop;
            const currentScrollBottom = currentScrollTop + containerHeight;

            if (itemTop < currentScrollTop || itemBottom > currentScrollBottom) {
                containerRef.current.scrollTo({
                    top: Math.max(0, itemTop - containerHeight / 2 + ITEM_HEIGHT / 2),
                    behavior: 'smooth'
                });
            }
        }
    }, [currentStep, containerHeight]);

    const totalHeight = filteredSteps.length * ITEM_HEIGHT;
    const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);
    const endIndex = Math.min(
        filteredSteps.length,
        Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT) + OVERSCAN
    );

    const visibleItems = useMemo(() => {
        return filteredSteps.slice(startIndex, endIndex).map((step, relativeIdx) => {
            const actualIdx = formulaSteps.findIndex(s => s.id === step.id);
            const indexInArray = actualIdx !== -1 ? actualIdx : startIndex + relativeIdx;
            const topOffset = (startIndex + relativeIdx) * ITEM_HEIGHT;

            return (
                <div
                    key={step.id || indexInArray}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: ITEM_HEIGHT,
                        transform: `translateY(${topOffset}px)`,
                    }}
                >
                    <FormulaStepCard
                        step={step}
                        index={indexInArray}
                        currentStep={currentStep}
                    />
                </div>
            );
        });
    }, [filteredSteps, startIndex, endIndex, formulaSteps, currentStep]);

    return (
        <div
            ref={containerRef}
            className="formula-list virtualized-formula-list"
            onScroll={handleScroll}
            style={{
                position: 'relative',
                overflowY: 'auto',
                height: '100%',
                flex: 1,
            }}
        >
            <div style={{ height: totalHeight, width: '100%', position: 'relative' }}>
                {visibleItems}
            </div>
        </div>
    );
};

export default React.memo(VirtualizedFormulaList);
