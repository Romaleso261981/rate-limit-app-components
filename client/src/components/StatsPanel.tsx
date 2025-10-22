import React from 'react';
import { Progress, Stats } from '../types';

interface StatsPanelProps {
  progress: Progress;
  stats: Stats;
  requestsPerSecond: number;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ progress, stats, requestsPerSecond }) => {
  return (
    <div className="stats-panel">
      <div className="stat-card">
        <span className="stat-label">Progress</span>
        <span className="stat-value">
          {progress.completed} / {progress.total}
        </span>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${(progress.completed / progress.total) * 100}%` }}
          />
        </div>
      </div>

      <div className="stat-card success">
        <span className="stat-label">Successful</span>
        <span className="stat-value">{stats.success}</span>
      </div>

      <div className="stat-card error">
        <span className="stat-label">Errors</span>
        <span className="stat-value">{stats.errors}</span>
      </div>

      <div className="stat-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <span className="stat-label">Requests/sec</span>
        <span className="stat-value">{requestsPerSecond}</span>
      </div>
    </div>
  );
};

