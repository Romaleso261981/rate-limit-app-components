import React from 'react';
import { ResponseItem } from '../types';

interface ResultsListProps {
  responses: ResponseItem[];
}

export const ResultsList: React.FC<ResultsListProps> = ({ responses }) => {
  if (responses.length === 0) {
    return null;
  }

  return (
    <div className="results-panel">
      <h2>Response Indexes (Latest First)</h2>
      <div className="results-list">
        {[...responses].reverse().map((response, idx) => (
          <div
            key={`${response.index}-${response.timestamp}-${idx}`}
            className={`result-item ${response.success ? 'success' : 'error'}`}
          >
            <span className="result-index">#{response.index}</span>
            {!response.success && (
              <span className="result-error">{response.error}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

