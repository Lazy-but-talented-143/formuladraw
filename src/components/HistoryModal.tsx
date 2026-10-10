import React from 'react';
import { useAppContext } from '../state/AppContext';
import { evaluateFormulaToSVG } from '../engine/mathematics/formulaEvaluator';
import { X, Trash2, Clock, Eye } from 'lucide-react';

const HistoryModal: React.FC = () => {
    const { state, dispatch } = useAppContext();

    if (!state.isHistoryOpen) return null;

    const handleClose = () => {
        dispatch({ type: 'TOGGLE_HISTORY_MODAL', payload: false });
    };

    const handleLoad = (session: any) => {
        dispatch({ type: 'LOAD_HISTORY_SESSION', payload: session });
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch({ type: 'DELETE_HISTORY_SESSION', payload: id });
    };

    const handleClearAll = () => {
        if (window.confirm('Are you sure you want to clear all saved history?')) {
            dispatch({ type: 'CLEAR_ALL_HISTORY' });
        }
    };

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-title-group">
                        <h2>Reconstruction History</h2>
                        <span className="history-badge">{state.history.length} Sessions</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {state.history.length > 0 && (
                            <button className="btn-secondary-danger" onClick={handleClearAll}>
                                <Trash2 size={16} /> Clear All
                            </button>
                        )}
                        <button className="btn-icon" onClick={handleClose}>
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="modal-body">
                    {state.history.length === 0 ? (
                        <div className="empty-history">
                            <Clock size={48} style={{ color: '#94a3b8', marginBottom: '12px' }} />
                            <h3>No Saved History Yet</h3>
                            <p>Upload an image and run reconstruction to automatically save formulas and drawing history here.</p>
                        </div>
                    ) : (
                        <div className="history-grid">
                            {state.history.map((session) => (
                                <div key={session.id} className="history-card" onClick={() => handleLoad(session)}>
                                    <div className="history-preview-box">
                                        {/* Original Image */}
                                        <div className="preview-layer original">
                                            <img src={session.originalImage} alt="Original" />
                                            <span className="layer-tag">Input</span>
                                        </div>
                                        {/* Reconstructed Drawing Preview */}
                                        <div className="preview-layer drawing">
                                            <svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet">
                                                {session.formulaSteps.map((step: any) => (
                                                    <path
                                                        key={step.id}
                                                        d={step.svgPathData || evaluateFormulaToSVG(step)}
                                                        fill="none"
                                                        stroke="#0f172a"
                                                        strokeWidth="2"
                                                    />
                                                ))}
                                            </svg>
                                            <span className="layer-tag">Reconstruction</span>
                                        </div>
                                    </div>

                                    <div className="history-card-info">
                                        <div className="history-card-title">
                                            <span>{session.title}</span>
                                            <span className="formula-count-chip">{session.formulaSteps.length} Formulas</span>
                                        </div>
                                        <div className="history-card-meta">
                                            <Clock size={14} />
                                            <span>{session.timestamp}</span>
                                        </div>

                                        <div className="history-card-actions">
                                            <button className="btn-load">
                                                <Eye size={16} /> Load & Inspect
                                            </button>
                                            <button className="btn-delete" onClick={(e) => handleDelete(session.id, e)} title="Delete session">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HistoryModal;
