import { ControlPanel } from './components/ControlPanel';
import { StatsPanel } from './components/StatsPanel';
import { ResultsList } from './components/ResultsList';
import { useRequestHandler } from './hooks/useRequestHandler';
import './App.css';

function App() {
  const {
    concurrency,
    setConcurrency,
    isRunning,
    responses,
    progress,
    stats,
    handleStart,
    handleStop,
  } = useRequestHandler();

  return (
    <div className="app">
      <div className="container">
        <h1>Rate-Limited Request Client</h1>
        
        <ControlPanel
          concurrency={concurrency}
          setConcurrency={setConcurrency}
          isRunning={isRunning}
          onStart={handleStart}
          onStop={handleStop}
        />

        {(progress.completed > 0 || isRunning) && (
          <StatsPanel 
            progress={progress} 
            stats={stats}
          />
        )}

        <ResultsList responses={responses} />
      </div>
    </div>
  );
}

export default App;

