import React from 'react';

interface ControlPanelProps {
  concurrency: number;
  setConcurrency: (value: number) => void;
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  concurrency,
  setConcurrency,
  isRunning,
  onStart,
  onStop,
}) => {
  return (
    <div className="control-panel">
      <div className="input-group">
        <label htmlFor="concurrency">
          Concurrency Limit (1-100):
        </label>
        <input
          id="concurrency"
          type="number"
          min="0"
          max="100"
          value={concurrency}
          onChange={(e) => setConcurrency(Number(e.target.value))}
          disabled={isRunning}
          required
        />
        <small>Controls both max concurrent requests and requests per second</small>
      </div>

      <div className="button-group">
        <button
          onClick={onStart}
          disabled={isRunning || concurrency < 1 || concurrency > 100}
          className="btn btn-primary"
        >
          {isRunning ? 'Running...' : 'Start'}
        </button>
        
        {isRunning && (
          <button onClick={onStop} className="btn btn-secondary">
            Stop
          </button>
        )}
      </div>
    </div>
  );
};

