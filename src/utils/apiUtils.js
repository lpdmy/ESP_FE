export async function executeApiCall(apiCall, args = [], options = {}) {
  const { setLoading, setError, getToken } = options;
  if (setLoading) setLoading(true);
  if (setError) setError(null);

  try {
    let token = getToken ? getToken() : null;
    if (token) {
      args.push(token);
    }
    const result = await apiCall(...args);
    return result;
  } catch (err) {
    if (setError) setError(err.message);
    throw err;
  } finally {
    if (setLoading) setLoading(false);
  }
}