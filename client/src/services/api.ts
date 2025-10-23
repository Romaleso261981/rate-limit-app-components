import { ResponseItem } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const sendRequest = async (
  index: number,
  signal: AbortSignal
): Promise<ResponseItem> => {
  try {
    const response = await fetch(`${API_URL}/api`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ index }),
      signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        index,
        activeRequests: errorData.activeRequests || 0,
        success: false,
        error: errorData.message || `HTTP ${response.status}`,
        timestamp: Date.now(),
      };
    }

    const data = await response.json();
    return {
      index: data.index,
      activeRequests: data.activeCount,
      success: true,
      timestamp: Date.now(),
    };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw error;
    }
    return {
      index,
      activeRequests: 0,
      success: false,
      error: error.message || 'Network error',
      timestamp: Date.now(),
    };
  }
};

