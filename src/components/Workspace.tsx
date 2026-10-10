import React, { useCallback, useEffect, useState } from 'react';
import { useAppContext } from '../state/AppContext';
import VirtualizedFormulaList from './VirtualizedFormulaList';
import DrawingCanvas from './DrawingCanvas';
import HistoryModal from './HistoryModal';
import {
    Play, Pause, FastForward, Rewind, RotateCcw, UploadCloud, History,
    PlusCircle, Search, SkipBack, SkipForward, Download, ChevronLeft,
    Layers, Image as ImageIcon, GitMerge
} from 'lucide-react';
import { fitCircle } from '../engine/mathematics/fitters/circleFitter';
import { fitLinear } from '../engine/mathematics/fitters/linearFitter';
import { fitBezier } from '../engine/mathematics/fitters/bezierFitter';
import { generateFormula } from '../engine/mathematics/formulaGeneration';
import { extractContoursFromImage } from '../engine/image/contourExtraction';
import { classifyShape } from '../engine/geometry/shapeClassification';

interface WorkspaceProps {
    onExit?: () => void;
}

const Workspace: React.FC<WorkspaceProps> = ({ onExit }) => {
    const { state, dispatch } = useAppContext();
    const [isDragging, setIsDragging] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const processFile = (file: File) => {
        const supportedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
        if (!file || !supportedTypes.includes(file.type)) {
            alert(`Unsupported file type: ${file.type}. Please use PNG, JPG, WebP, or SVG.`);
            return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
            const result = event.target?.result as string;
            dispatch({ type: 'LOAD_IMAGE', payload: result });
            runActualAnalysis(result);
        };
        reader.readAsDataURL(file);
    };

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) processFile(file);
    };

    const runActualAnalysis = useCallback(async (imageUrl: string) => {
        dispatch({ type: 'SET_STATUS', payload: 'processing' });
        dispatch({ type: 'SET_PROGRESS', payload: 0 });

        const extracted = await extractContoursFromImage(imageUrl, 800, 600);

        if (extracted.length === 0) {
            dispatch({ type: 'SET_STATUS', payload: 'completed' });
            return;
        }

        const allModels: Array<{ model: any; svgPath: string }> = [];
        for (const { points, svgPath } of extracted) {
            if (points.length < 2) continue;
            const pathType = classifyShape({
                id: 'p',
                points,
                simplifiedPoints: points,
                closed: false,
                boundingBox: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
                confidence: 1, importance: 1, order: 1
            });

            let representativeModel: any = null;
            if (pathType === 'CIRCLE') {
                representativeModel = fitCircle(points) || null;
            } else if (pathType === 'BEZIER') {
                const bezierModels = fitBezier(points);
                const modelList = Array.isArray(bezierModels) ? bezierModels : bezierModels ? [bezierModels] : [];
                representativeModel = modelList[0] || null;
            } else {
                representativeModel = fitLinear(points) || null;
            }

            if (representativeModel) {
                allModels.push({ model: representativeModel, svgPath });
            }
        }

        const titleMap: Record<string, string> = {
            'LINEAR': 'Straight Line',
            'CIRCLE': 'Circle',
            'BEZIER': 'Bézier Curve',
            'NUMERICAL': 'Complex Path'
        };

        const total = allModels.length;
        const accumulatedSteps: any[] = [];
        const chunkSize = 200;
        let index = 0;

        const processChunk = () => {
            const end = Math.min(index + chunkSize, total);
            for (let i = index; i < end; i++) {
                const { model, svgPath } = allModels[i];
                const formulaStep = generateFormula(model, i + 1);
                (formulaStep as any).title = titleMap[formulaStep.type] || 'Path';
                if (svgPath) {
                    formulaStep.svgPathData = svgPath;
                }
                accumulatedSteps.push(formulaStep);
            }

            index = end;
            dispatch({ type: 'SET_FORMULA_STEPS', payload: [...accumulatedSteps] });
            dispatch({ type: 'SET_CURRENT_STEP', payload: accumulatedSteps.length });
            dispatch({ type: 'SET_PROGRESS', payload: (accumulatedSteps.length / total) * 100 });

            if (index < total) {
                setTimeout(processChunk, 16);
            } else {
                dispatch({ type: 'SET_STATUS', payload: 'completed' });
                dispatch({
                    type: 'SAVE_SESSION_TO_HISTORY',
                    payload: { originalImage: imageUrl, formulaSteps: accumulatedSteps }
                });
            }
        };

        processChunk();
    }, [dispatch]);

    // Continuous playback
    useEffect(() => {
        let timer: ReturnType<typeof setInterval>;
        if (state.playbackStatus === 'playing') {
            timer = setInterval(() => {
                dispatch({ type: 'SET_CURRENT_STEP', payload: Math.min(state.currentStep + 1, state.formulaSteps.length) });
                if (state.currentStep >= state.formulaSteps.length) {
                    dispatch({ type: 'SET_PLAYBACK_STATUS', payload: 'paused' });
                }
            }, 1000 / state.playbackSpeed);
        }
        return () => clearInterval(timer);
    }, [state.playbackStatus, state.currentStep, state.formulaSteps.length, state.playbackSpeed, dispatch]);

    const handleNextFormula = () => {
        if (state.currentStep < state.formulaSteps.length) {
            dispatch({ type: 'SET_CURRENT_STEP', payload: state.currentStep + 1 });
        }
    };

    const handleStepJump = (delta: number) => {
        const next = Math.max(1, Math.min(state.formulaSteps.length, state.currentStep + delta));
        dispatch({ type: 'SET_CURRENT_STEP', payload: next });
    };

    const handleExportSVG = () => {
        const svgEl = document.querySelector('.canvas-layer');
        if (!svgEl) return;
        const svgStr = new XMLSerializer().serializeToString(svgEl);
        const blob = new Blob([svgStr], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'formuladraw-reconstruction.svg';
        a.click();
        URL.revokeObjectURL(url);
    };

    const statusLabel = {
        idle: '',
        processing: 'ANALYZING…',
        completed: `${state.formulaSteps.length} FORMULAS`
    }[state.analysisStatus];

    return (
        <div className="app-container">
            {/* Header */}
            <div className="header">
                <div className="header-left">
                    {onExit && (
                        <button
                            className="nav-btn"
                            onClick={onExit}
                            title="Back to Landing"
                            style={{ marginRight: '4px' }}
                        >
                            <ChevronLeft size={16} />
                        </button>
                    )}
                    <div className="logo-box">FORMULADRAW</div>
                    <div className="header-title-group">
                        <div className="header-title">
                            {state.analysisStatus === 'processing'
                                ? 'Analyzing Image…'
                                : state.originalImage
                                ? 'Reconstruction Workspace'
                                : 'Image → Formula → Drawing'}
                        </div>
                        <div className="header-subtitle">
                            {statusLabel || 'Upload an image to begin reconstruction'}
                        </div>
                    </div>
                </div>

                {/* View Mode Toggle */}
                <div className="header-nav">
                    <button
                        className={`nav-btn ${state.viewMode === 'original' ? 'active' : ''}`}
                        onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: 'original' })}
                        title="Show original image"
                    >
                        <ImageIcon size={14} /> ORIGINAL
                    </button>
                    <button
                        className={`nav-btn ${state.viewMode === 'reconstruction' ? 'active' : ''}`}
                        onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: 'reconstruction' })}
                        title="Show mathematical reconstruction only"
                    >
                        <Layers size={14} /> RECONSTRUCTION
                    </button>
                    <button
                        className={`nav-btn ${state.viewMode === 'overlay' ? 'active' : ''}`}
                        onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: 'overlay' })}
                        title="Overlay reconstruction on original"
                    >
                        <GitMerge size={14} /> OVERLAY
                    </button>
                </div>

                <div className="header-nav">
                    {state.formulaSteps.length > 0 && (
                        <button className="nav-btn" onClick={handleExportSVG} title="Export SVG">
                            <Download size={16} /> EXPORT SVG
                        </button>
                    )}
                    {state.originalImage && (
                        <button className="nav-btn" onClick={() => dispatch({ type: 'RESET_WORKSPACE' })}>
                            <PlusCircle size={16} /> NEW
                        </button>
                    )}
                    <button className="nav-btn active" onClick={() => dispatch({ type: 'TOGGLE_HISTORY_MODAL', payload: true })}>
                        <History size={16} /> HISTORY ({state.history.length})
                    </button>
                </div>
            </div>

            <div className="workspace">
                {/* Left Panel */}
                <div className="left-panel">
                    <div className="panel-header">
                        <div className="panel-title">FORMULAS</div>
                        <div className="panel-subtitle">
                            {state.formulaSteps.length > 0
                                ? `${state.formulaSteps.length} mathematical models extracted`
                                : 'Mathematical models appear here after analysis'}
                        </div>

                        {state.formulaSteps.length > 0 && (
                            <div className="search-box-wrapper" style={{ marginTop: '12px' }}>
                                <Search size={14} className="search-icon" />
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder="Search formulas or step #…"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    {/* Processing Status */}
                    {state.analysisStatus === 'processing' && (
                        <div style={{
                            padding: '12px 20px',
                            borderBottom: '1px solid var(--border-color)',
                            background: 'var(--accent-light)',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: 'var(--accent-color)',
                            letterSpacing: '0.06em',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <div style={{
                                width: '8px', height: '8px', borderRadius: '50%',
                                background: 'var(--accent-color)',
                                animation: 'pulse 1s infinite'
                            }} />
                            EXTRACTING CONTOURS &amp; FITTING MODELS…
                        </div>
                    )}

                    <VirtualizedFormulaList
                        formulaSteps={state.formulaSteps}
                        currentStep={state.currentStep}
                        searchQuery={searchQuery}
                    />

                    <div className="panel-footer">
                        <button
                            className="btn-primary"
                            onClick={handleNextFormula}
                            disabled={state.currentStep >= state.formulaSteps.length || state.formulaSteps.length === 0}
                        >
                            ▶ NEXT FORMULA
                        </button>

                        {state.formulaSteps.length > 0 && (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '12px 0 6px' }}>
                                    <input
                                        type="range"
                                        min={1}
                                        max={state.formulaSteps.length || 1}
                                        value={state.currentStep || 1}
                                        onChange={(e) => dispatch({ type: 'SET_CURRENT_STEP', payload: Number(e.target.value) })}
                                        style={{ width: '100%', cursor: 'pointer', accentColor: '#2563eb' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', margin: '8px 0', color: '#64748b' }}>
                                    <button title="Reset" className="ctrl-btn" onClick={() => dispatch({ type: 'SET_CURRENT_STEP', payload: 1 })}><Rewind size={16} /></button>
                                    <button title="−50 steps" className="ctrl-btn" onClick={() => handleStepJump(-50)}><SkipBack size={16} /></button>
                                    <button
                                        title={state.playbackStatus === 'playing' ? 'Pause' : 'Play'}
                                        className="ctrl-btn play-btn"
                                        onClick={() => dispatch({ type: 'SET_PLAYBACK_STATUS', payload: state.playbackStatus === 'playing' ? 'paused' : 'playing' })}
                                    >
                                        {state.playbackStatus === 'playing' ? <Pause size={20} /> : <Play size={20} />}
                                    </button>
                                    <button title="+50 steps" className="ctrl-btn" onClick={() => handleStepJump(50)}><SkipForward size={16} /></button>
                                    <button
                                        title={`Speed: ${state.playbackSpeed}x`}
                                        className="ctrl-btn"
                                        style={{ color: state.playbackSpeed > 1 ? '#3b82f6' : 'inherit', fontSize: '0.7rem', fontWeight: 700 }}
                                        onClick={() => dispatch({ type: 'SET_PLAYBACK_SPEED', payload: state.playbackSpeed === 1 ? 2 : state.playbackSpeed === 2 ? 5 : 1 })}
                                    >
                                        <FastForward size={16} /> {state.playbackSpeed}×
                                    </button>
                                    <button title="Jump to End" className="ctrl-btn" onClick={() => dispatch({ type: 'SET_CURRENT_STEP', payload: state.formulaSteps.length })}><RotateCcw size={16} /></button>
                                </div>

                                <div className="progress-info">
                                    <span>STEP {state.currentStep} / {state.formulaSteps.length}</span>
                                    <span style={{ color: 'var(--accent-color)', fontWeight: 700 }}>
                                        {Math.round((state.currentStep / (state.formulaSteps.length || 1)) * 100)}%
                                    </span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${state.formulaSteps.length ? (state.currentStep / state.formulaSteps.length) * 100 : 0}%` }} />
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Right Panel — Canvas */}
                <div className="main-area">
                    <div className="main-header">
                        <div className="main-header-text">
                            <div className="main-title">
                                {state.viewMode === 'original' ? 'ORIGINAL IMAGE' : state.viewMode === 'overlay' ? 'OVERLAY' : 'RECONSTRUCTION'}
                            </div>
                            <div className="main-subtitle">
                                {state.viewMode === 'reconstruction'
                                    ? 'Mathematical geometry drawn from formulas only'
                                    : state.viewMode === 'overlay'
                                    ? 'Original image + mathematical reconstruction'
                                    : 'Source image'}
                            </div>
                        </div>
                        {state.originalImage && (
                            <div className="input-thumbnail">
                                <img src={state.originalImage} alt="Input" />
                                <span>Input</span>
                            </div>
                        )}
                    </div>

                    <div className="canvas-container">
                        <DrawingCanvas />
                        {!state.originalImage && (
                            <div
                                className={`upload-overlay ${isDragging ? 'dragging' : ''}`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <label className={`upload-box ${isDragging ? 'dragging' : ''}`}>
                                    <UploadCloud
                                        size={48}
                                        style={{ color: isDragging ? '#2563eb' : '#94a3b8', transition: 'color 0.2s', marginBottom: '12px' }}
                                    />
                                    <h2>DROP AN IMAGE HERE</h2>
                                    <p style={{ marginTop: '8px', color: '#64748b', fontSize: '0.9rem' }}>
                                        or click to choose a file
                                    </p>
                                    <p style={{ marginTop: '4px', color: '#94a3b8', fontSize: '0.75rem' }}>
                                        SVG · PNG · JPG · WebP
                                    </p>
                                    <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml" style={{ display: 'none' }} onChange={handleUpload} />
                                </label>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <HistoryModal />
        </div>
    );
};

export default Workspace;
