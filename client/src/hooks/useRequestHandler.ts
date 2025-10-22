import { useState, useRef } from 'react';
import { ResponseItem, Stats, Progress } from '../types';
import { ConcurrencyLimiter } from '../utils/limiters';
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
  const [requestsPerSecond, setRequestsPerSecond] = useState<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestsCountRef = useRef<number>(0);
  const lastSecondRef = useRef<number>(Date.now());

  const updateRequestsPerSecond = () => {
    const now = Date.now();
    const timeDiff = now - lastSecondRef.current;
    
    if (timeDiff >= 1000) {
      setRequestsPerSecond(requestsCountRef.current);
      requestsCountRef.current = 0;
      lastSecondRef.current = now;
    }
  };

  const handleStart = async () => {
    if (concurrency < 1 || concurrency > 100) {
      alert('Concurrency must be between 1 and 100');
      return;
    }

    setIsRunning(true);
    setResponses([]);
    setProgress({ completed: 0, total: TOTAL_REQUESTS });
    setStats({ success: 0, errors: 0 });
    setRequestsPerSecond(0);
    requestsCountRef.current = 0;
    lastSecondRef.current = Date.now();

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const concurrencyLimiter = new ConcurrencyLimiter(concurrency);
    const requests = Array.from({ length: TOTAL_REQUESTS }, (_, i) => i + 1);
    
    try {
      for (let i = 0; i < requests.length; i += concurrency) {
        const batch = requests.slice(i, i + concurrency);
        const batchPromises = batch.map(index =>
          concurrencyLimiter.execute(async () => {
            const result = await sendRequest(index, signal);
            
            requestsCountRef.current++;
            updateRequestsPerSecond();
            
            setResponses(prev => [...prev, result]);
            setProgress(prev => ({ ...prev, completed: prev.completed + 1 }));
            setStats(prev => ({
              success: prev.success + (result.success ? 1 : 0),
              errors: prev.errors + (result.success ? 0 : 1),
            }));
            return result;
          })
        );
        
        await Promise.all(batchPromises);
        
        if (i + concurrency < requests.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
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
    requestsPerSecond,
    handleStart,
    handleStop,
  };
};

