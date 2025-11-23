import { useState, useEffect, useCallback } from 'react';
import ConversationCanvas from './components/canvas/ConversationCanvas';
import InferenceWindow from './components/inference/InferenceWindow';
import ImageGenerationWindow from './components/inference/ImageGenerationWindow';
import { VisionAnalysisWindow } from './components/image';
import SummaryView from './components/summary/SummaryView';
import SessionManager from './components/session/SessionManager';
import { SettingsPanel } from './components/settings/SettingsPanel';
import { ExportPanel } from './components/export/ExportPanel';
import { SearchPanel } from './components/search/SearchPanel';
import { BreadcrumbNav } from './components/navigation/BreadcrumbNav';
import { BookmarkPanel } from './components/navigation/BookmarkPanel';
import { useConfigStore } from './store/configStore';
import { useConversationStore } from './store/conversationStore';

function App() {
  const [parentNodeId, setParentNodeId] = useState<string | null>(null);
  const [selectedSectionIndex, setSelectedSectionIndex] = useState<number | undefined>(undefined);
  const [key, setKey] = useState(0); // Force re-render when parent changes
  const [showSummary, setShowSummary] = useState(false);
  const [showSessionManager, setShowSessionManager] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showImageGeneration, setShowImageGeneration] = useState(false);
  const [showVisionAnalysis, setShowVisionAnalysis] = useState(false);
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);
  const { theme, setTheme, loadFromStorage } = useConfigStore();
  const { clearAll, loadFromStorage: loadConversations, applyAutoLayout } = useConversationStore();

  useEffect(() => {
    // Load config from storage on mount
    loadFromStorage();
    // Load conversations from storage
    loadConversations();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Apply theme when it changes
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const handleSpawnChild = useCallback((nodeId: string, selectedSectionIndex?: number) => {
    setParentNodeId(nodeId);
    setSelectedSectionIndex(selectedSectionIndex);
    setKey((k) => k + 1); // Force inference window to reset
  }, []);

  const handleNewQuestion = () => {
    setParentNodeId(null);
    setSelectedSectionIndex(undefined);
    setKey((k) => k + 1);
  };

  const handleComplete = () => {
    // Reset to allow new questions
    setParentNodeId(null);
    setSelectedSectionIndex(undefined);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleClearCanvas = () => {
    if (window.confirm('Are you sure you want to clear all conversations? This cannot be undone.')) {
      clearAll();
      setParentNodeId(null);
      setSelectedSectionIndex(undefined);
      setKey((k) => k + 1);
    }
  };

  const handleAutoLayout = () => {
    applyAutoLayout();
    // Force re-render to update canvas with new positions
    setKey((k) => k + 1);
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-20">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          InferFlow
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowSettings(true)}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
          >
            ⚙️ Settings
          </button>
          <button
            onClick={() => setShowSessionManager(true)}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors text-sm font-medium"
          >
            💾 Sessions
          </button>
          <button
            onClick={() => setShowBookmarks(true)}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors text-sm font-medium"
          >
            ⭐ Bookmarks
          </button>
          <button
            onClick={() => setShowSearch(true)}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors text-sm font-medium"
          >
            🔍 Search
          </button>
          <button
            onClick={() => setShowExport(true)}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm font-medium"
          >
            📥 Export
          </button>
          <button
            onClick={handleAutoLayout}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors text-sm font-medium"
            title="Automatically organize nodes in a tree layout"
          >
            📐 Auto Layout
          </button>
          <button
            onClick={() => setShowSummary(true)}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors text-sm font-medium"
          >
            📊 Summary
          </button>
          <button
            onClick={handleNewQuestion}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm font-medium"
          >
            New Question
          </button>
          <button
            onClick={() => setShowImageGeneration(true)}
            className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors text-sm font-medium"
          >
            🎨 Generate Image
          </button>
          <button
            onClick={() => setShowVisionAnalysis(true)}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors text-sm font-medium"
          >
            👁️ Analyze Image
          </button>
          <button
            onClick={handleClearCanvas}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium"
          >
            Clear Canvas
          </button>
          <button
            onClick={toggleTheme}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg transition-colors text-sm font-medium"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Breadcrumb Navigation */}
      <BreadcrumbNav
        currentNodeId={highlightedNodeId}
        onNavigate={(nodeId) => setHighlightedNodeId(nodeId)}
      />

      {/* Canvas */}
      <div className="flex-1 relative" style={{ paddingBottom: '200px' }}>
        <ConversationCanvas
          onSpawnChild={handleSpawnChild}
          highlightedPath={highlightedNodeId}
        />
      </div>

      {/* Inference Window */}
      <InferenceWindow key={key} parentNodeId={parentNodeId} selectedSectionIndex={selectedSectionIndex} onComplete={handleComplete} />

          {/* Settings Modal */}
          {showSettings && (
            <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
          )}

          {/* Export Modal */}
          {showExport && (
            <ExportPanel onClose={() => setShowExport(false)} />
          )}

          {/* Search Modal */}
          {showSearch && (
            <SearchPanel onClose={() => setShowSearch(false)} />
          )}

          {/* Bookmark Modal */}
          {showBookmarks && (
            <BookmarkPanel
              onClose={() => setShowBookmarks(false)}
              onNavigateToNode={(nodeId) => {
                setHighlightedNodeId(nodeId);
                setShowBookmarks(false);
              }}
            />
          )}

          {/* Summary Modal */}
          {showSummary && (
            <SummaryView onClose={() => setShowSummary(false)} />
          )}

          {/* Session Manager Modal */}
          {showSessionManager && (
            <SessionManager onClose={() => setShowSessionManager(false)} />
          )}

          {/* Image Generation Modal */}
          {showImageGeneration && (
            <ImageGenerationWindow
              parentNodeId={parentNodeId}
              onComplete={() => setShowImageGeneration(false)}
            />
          )}

          {/* Vision Analysis Modal */}
          {showVisionAnalysis && (
            <VisionAnalysisWindow
              parentNodeId={parentNodeId}
              onComplete={() => setShowVisionAnalysis(false)}
            />
          )}
        </div>
      );
    }

    export default App;

