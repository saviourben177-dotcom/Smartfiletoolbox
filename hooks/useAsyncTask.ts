import { useCallback, useRef, useState } from 'react';
import type { AsyncTaskState, ToolStatus } from '@/types/tools';

/**
 * Generic async task runner shared by every tool screen: tracks
 * idle/processing/done/error status plus an optional progress value so a
 * screen can show live status while work is still processing.
 */
export function useAsyncTask<T>() {
  const [state, setState] = useState<AsyncTaskState<T>>({
    status: 'idle',
    progress: 0,
    result: null,
    error: null,
  });
  const runId = useRef(0);

  const setProgress = useCallback((progress: number) => {
    setState((prev) => ({ ...prev, progress }));
  }, []);

  const run = useCallback(async (task: (setProgress: (value: number) => void) => Promise<T>) => {
    const id = ++runId.current;
    setState({ status: 'processing', progress: 0, result: null, error: null });
    try {
      const result = await task((value) => {
        if (runId.current === id) setProgress(value);
      });
      if (runId.current === id) {
        setState({ status: 'done', progress: 1, result, error: null });
      }
      return result;
    } catch (error) {
      if (runId.current === id) {
        setState({
          status: 'error',
          progress: 0,
          result: null,
          error: error instanceof Error ? error.message : 'Something went wrong',
        });
      }
      return null;
    }
  }, [setProgress]);

  const reset = useCallback(() => {
    runId.current += 1;
    setState({ status: 'idle', progress: 0, result: null, error: null });
  }, []);

  return { ...state, run, reset, isProcessing: state.status === 'processing' as ToolStatus };
}
