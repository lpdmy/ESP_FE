export async function executeApiCall(apiCall, args = [], options = {}) {
  const { setLoading, setError } = options;
  if (setLoading) setLoading(true);
  if (setError) setError(null);

  try {
    let token = localStorage.getItem("token") ? localStorage.getItem("token") : null;
    const result = token
      ? await apiCall(...args, token)
      : await apiCall(...args);    
    return result;
  } catch (err) {
    if (setError) setError(err.message);
    throw err;
  } finally {
    if (setLoading) setLoading(false);
  }
}