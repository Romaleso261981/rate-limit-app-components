import { useState, useRef } from 'react';
import { ResponseItem, Stats, Progress } from '../types';
import { sendRequest } from '../services/api';

const TOTAL_REQUESTS = 1000;

export const useRequestHandler = () => {
  const [concurrency, setConcurrency] = useState<number>(10);
  const [isRunning, setIsRunning] = useState(false);
  const [responses, setResponses] = useState<ResponseItem[]>([]);
  const [progress, setProgress] = useState<Progress>({ 
    completed: 0, 
    total: TOTAL_REQUESTS 
  });
  const [stats, setStats] = useState<Stats>({ success: 0, errors: 0 });
  const abortControllerRef = useRef<AbortController | null>(null);


  const handleStart = async () => {
    if (concurrency < 1 || concurrency > 100) {
      alert('Concurrency must be between 1 and 100');
      return;
    }

    setIsRunning(true);
    setResponses([]);
    setProgress({ completed: 0, total: TOTAL_REQUESTS });
    setStats({ success: 0, errors: 0 });

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const requests = Array.from({ length: TOTAL_REQUESTS }, (_, i) => i + 1);
    
    try {
      // Process requests in chunks maintaining exact concurrency
      for (let i = 0; i < requests.length; i += concurrency) {
        const chunk = requests.slice(i, i + concurrency);
        
        const chunkPromises = chunk.map(async (index) => {
          try {
            const result = await sendRequest(index, signal);
            
            setResponses(prev => [...prev, result]);
            setProgress(prev => ({ ...prev, completed: prev.completed + 1 }));
            setStats(prev => ({
              success: prev.success + (result.success ? 1 : 0),
              errors: prev.errors + (result.success ? 0 : 1),
            }));
          } catch (error: any) {
            if (error.name !== 'AbortError') {
              console.error('Request error:', error);
            }
          }
        });
        
        // Wait for all requests in this chunk to complete
        await Promise.allSettled(chunkPromises);
        
        // Check if we should stop
        if (signal.aborted) {
          break;
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Error during execution:', error);
      }
    } finally {
      setIsRunning(false);
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsRunning(false);
    }
  };

  return {
    concurrency,
    setConcurrency,
    isRunning,
    responses,
    progress,
    stats,
    handleStart,
    handleStop,
  };
};

