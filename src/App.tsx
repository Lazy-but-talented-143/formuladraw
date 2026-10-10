import { useState } from 'react';
import Landing from './components/landing/Landing';
import Workspace from './components/Workspace';
import 'katex/dist/katex.min.css';

function App() {
  const [view, setView] = useState<'landing' | 'workspace'>('landing');

  if (view === 'workspace') {
    return <Workspace />;
  }

  return <Landing onEnterWorkspace={() => setView('workspace')} />;
}

export default App;
