import { useState } from 'react';
import { PortfolioProvider, usePortfolio } from './contexts/PortfolioContext';
import { EditorHeader } from './components/editor/EditorHeader';
import { PageList } from './components/editor/PageList';
import { ModuleToolbox } from './components/editor/ModuleToolbox';
import { EditorCanvas } from './components/editor/EditorCanvas';
import { PageStatusBar } from './components/editor/PageStatusBar';
import { PreviewPane } from './components/preview/PreviewPane';
import { WelcomeScreen } from './components/editor/WelcomeScreen';
import { LoginScreen, isAuthenticated } from './components/auth/LoginScreen';

function EditorLayout() {
  const { data } = usePortfolio();
  const [isPreviewing, setIsPreviewing] = useState(false);

  if (!data) {
    return (
      <div className="flex flex-col h-screen bg-white">
        <EditorHeader onPreviewToggle={() => setIsPreviewing(v => !v)} isPreviewing={isPreviewing} />
        <WelcomeScreen />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      <EditorHeader onPreviewToggle={() => setIsPreviewing(v => !v)} isPreviewing={isPreviewing} />

      <div className="flex flex-1 overflow-hidden">
        {!isPreviewing && (
          <aside className="w-56 border-r border-gray-100 flex flex-col overflow-hidden shrink-0">
            <div className="flex-1 overflow-hidden flex flex-col" style={{ maxHeight: '50%' }}>
              <PageList />
            </div>
            <div className="border-t border-gray-100 flex flex-col overflow-hidden" style={{ maxHeight: '50%' }}>
              <ModuleToolbox />
            </div>
          </aside>
        )}

        {isPreviewing ? (
          <PreviewPane />
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            <PageStatusBar />
            <EditorCanvas />
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [authed, setAuthed] = useState(() => isAuthenticated());

  if (!authed) {
    return <LoginScreen onAuth={() => setAuthed(true)} />;
  }

  return (
    <PortfolioProvider>
      <EditorLayout />
    </PortfolioProvider>
  );
}
