import { useState, useCallback } from 'react';

// Old executeApiCall function (for backward compatibility)
export async function executeApiCall(apiCall, args = [], options = {}) {
  const { setLoading, setError } = options;
  if (setLoading) setLoading(true);
  if (setError) setError(null);

  try {
    // Just call the API with the provided args (token should already be included)
    const result = await apiCall(...args);
    return result;
  } catch (err) {
    if (setError) setError(err.message);
    throw err;
  } finally {
    if (setLoading) setLoading(false);
  }
}

// New hook for simple loading management
export function useApiLoading() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const executeApiCall = useCallback(async (apiCall, ...args) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiCall(...args);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    executeApiCall,
    clearError
  };
}