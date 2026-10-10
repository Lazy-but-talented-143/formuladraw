export interface HistorySession {
    id: string;
    timestamp: string;
    title: string;
    originalImage: string;
    formulaSteps: any[];
}

export interface AppState {
    originalImage: string | null;
    analysisStatus: 'idle' | 'processing' | 'completed';
    progress: number;
    formulaSteps: any[];
    currentStep: number;
    viewMode: 'reconstruction' | 'original' | 'overlay';
    playbackStatus: 'playing' | 'paused';
    playbackSpeed: number;
    selectedFormulaId: string | null;
    history: HistorySession[];
    isHistoryOpen: boolean;
}

export type AppAction =
    | { type: 'LOAD_IMAGE'; payload: string }
    | { type: 'SET_STATUS'; payload: 'idle' | 'processing' | 'completed' }
    | { type: 'SET_PROGRESS'; payload: number }
    | { type: 'ADD_FORMULA_STEP'; payload: any }
    | { type: 'SET_FORMULA_STEPS'; payload: any[] }
    | { type: 'SET_CURRENT_STEP'; payload: number }
    | { type: 'SET_VIEW_MODE'; payload: 'reconstruction' | 'original' | 'overlay' }
    | { type: 'SET_PLAYBACK_STATUS'; payload: 'playing' | 'paused' }
    | { type: 'SET_PLAYBACK_SPEED'; payload: number }
    | { type: 'SELECT_FORMULA'; payload: string | null }
    | { type: 'UPDATE_FORMULA_PARAMETER'; payload: { id: string; param: string; value: number } }
    | { type: 'TOGGLE_HISTORY_MODAL'; payload?: boolean }
    | { type: 'SAVE_SESSION_TO_HISTORY'; payload: { originalImage: string; formulaSteps: any[] } }
    | { type: 'LOAD_HISTORY_SESSION'; payload: HistorySession }
    | { type: 'DELETE_HISTORY_SESSION'; payload: string }
    | { type: 'CLEAR_ALL_HISTORY' }
    | { type: 'RESET_WORKSPACE' };

const loadHistoryFromStorage = (): HistorySession[] => {
    try {
        const saved = localStorage.getItem('formuladraw_history');
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.error('Failed to load history from localStorage', e);
    }
    return [];
};

const saveHistoryToStorage = (history: HistorySession[]) => {
    try {
        localStorage.setItem('formuladraw_history', JSON.stringify(history));
    } catch (e) {
        console.error('Failed to save history to localStorage', e);
    }
};

export const initialState: AppState = {
    originalImage: null,
    analysisStatus: 'idle',
    progress: 0,
    formulaSteps: [],
    currentStep: 0,
    viewMode: 'reconstruction',
    playbackStatus: 'paused',
    playbackSpeed: 1,
    selectedFormulaId: null,
    history: loadHistoryFromStorage(),
    isHistoryOpen: false,
};

export function appReducer(state: AppState, action: AppAction): AppState {
    switch (action.type) {
        case 'LOAD_IMAGE':
            return { ...initialState, history: state.history, originalImage: action.payload };
        case 'SET_STATUS':
            return { ...state, analysisStatus: action.payload };
        case 'SET_PROGRESS':
            return { ...state, progress: action.payload };
        case 'ADD_FORMULA_STEP':
            return { ...state, formulaSteps: [...state.formulaSteps, action.payload] };
        case 'SET_FORMULA_STEPS':
            return { ...state, formulaSteps: action.payload };
        case 'SET_CURRENT_STEP':
            return { ...state, currentStep: action.payload };
        case 'SET_VIEW_MODE':
            return { ...state, viewMode: action.payload };
        case 'SET_PLAYBACK_STATUS':
            return { ...state, playbackStatus: action.payload };
        case 'SET_PLAYBACK_SPEED':
            return { ...state, playbackSpeed: action.payload };
        case 'SELECT_FORMULA':
            return { ...state, selectedFormulaId: action.payload };
        case 'TOGGLE_HISTORY_MODAL':
            return { ...state, isHistoryOpen: action.payload !== undefined ? action.payload : !state.isHistoryOpen };
        case 'SAVE_SESSION_TO_HISTORY': {
            if (!action.payload.originalImage || !action.payload.formulaSteps.length) return state;
            
            const existingIdx = state.history.findIndex(h => h.originalImage === action.payload.originalImage);
            let updatedHistory: HistorySession[];

            if (existingIdx >= 0) {
                const copy = [...state.history];
                copy[existingIdx] = {
                    ...copy[existingIdx],
                    timestamp: new Date().toLocaleString(),
                    title: `Reconstruction (${action.payload.formulaSteps.length} formulas)`,
                    formulaSteps: action.payload.formulaSteps,
                };
                updatedHistory = copy;
            } else {
                const newSession: HistorySession = {
                    id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                    timestamp: new Date().toLocaleString(),
                    title: `Reconstruction (${action.payload.formulaSteps.length} formulas)`,
                    originalImage: action.payload.originalImage,
                    formulaSteps: action.payload.formulaSteps,
                };
                updatedHistory = [newSession, ...state.history].slice(0, 30);
            }

            saveHistoryToStorage(updatedHistory);
            return { ...state, history: updatedHistory };
        }
        case 'LOAD_HISTORY_SESSION': {
            return {
                ...state,
                originalImage: action.payload.originalImage,
                formulaSteps: action.payload.formulaSteps,
                currentStep: action.payload.formulaSteps.length,
                analysisStatus: 'completed',
                progress: 100,
                playbackStatus: 'paused',
                isHistoryOpen: false,
            };
        }
        case 'DELETE_HISTORY_SESSION': {
            const updatedHistory = state.history.filter(h => h.id !== action.payload);
            saveHistoryToStorage(updatedHistory);
            return { ...state, history: updatedHistory };
        }
        case 'CLEAR_ALL_HISTORY': {
            saveHistoryToStorage([]);
            return { ...state, history: [] };
        }
        case 'RESET_WORKSPACE': {
            return {
                ...state,
                originalImage: null,
                analysisStatus: 'idle',
                progress: 0,
                formulaSteps: [],
                currentStep: 0,
                playbackStatus: 'paused',
                selectedFormulaId: null,
            };
        }
        case 'UPDATE_FORMULA_PARAMETER':
            return {
                ...state,
                formulaSteps: state.formulaSteps.map(f => {
                    if (f.id === action.payload.id) {
                        return {
                            ...f,
                            parameters: {
                                ...f.parameters,
                                [action.payload.param]: action.payload.value
                            }
                        };
                    }
                    return f;
                })
            };
        default:
            return state;
    }
}

