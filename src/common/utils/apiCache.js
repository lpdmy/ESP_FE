/**
 * Utility để quản lý caching và concurrency cho API calls
 * Tránh gọi API hàng loạt đồng thời gây quá tải server
 */

// Cache storage với TTL (Time To Live)
const cache = new Map();

// Đang pending requests để tránh duplicate calls
const pendingRequests = new Map();

/**
 * Cache entry structure:
 * {
 *   data: any,
 *   timestamp: number,
 *   ttl: number (milliseconds)
 * }
 */

/**
 * Làm sạch cache cũ
 */
function cleanExpiredCache() {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (entry.timestamp + entry.ttl < now) {
      cache.delete(key);
    }
  }
}

/**
 * Lấy data từ cache nếu còn valid
 * @param {string} key - Cache key
 * @returns {any|null} - Cached data hoặc null nếu không có/đã hết hạn
 */
export function getCachedData(key) {
  cleanExpiredCache();
  const entry = cache.get(key);
  if (!entry) return null;
  
  const now = Date.now();
  if (entry.timestamp + entry.ttl < now) {
    cache.delete(key);
    return null;
  }
  
  return entry.data;
}

/**
 * Lưu data vào cache
 * @param {string} key - Cache key
 * @param {any} data - Data cần cache
 * @param {number} ttl - Time to live (milliseconds), default 30000 (30s)
 */
export function setCachedData(key, data, ttl = 30000) {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl
  });
}

/**
 * Xóa cache entry
 * @param {string} key - Cache key
 */
export function clearCache(key) {
  cache.delete(key);
}

/**
 * Xóa tất cả cache
 */
export function clearAllCache() {
  cache.clear();
  pendingRequests.clear();
}

/**
 * Execute API call với caching và concurrency control
 * - Nếu đã có request đang pending, sẽ chờ request đó thay vì gọi mới
 * - Nếu có cache valid, sẽ trả về cache ngay lập tức
 * - Chỉ gọi API nếu không có cache và không có request đang pending
 * 
 * @param {string} cacheKey - Unique key cho cache
 * @param {Function} apiCall - Function gọi API
 * @param {Array} args - Arguments cho API call
 * @param {Object} options - Options
 * @param {number} options.ttl - Cache TTL (milliseconds), default 30000 (30s)
 * @param {boolean} options.useCache - Có sử dụng cache không, default true
 * @param {Function} options.setLoading - Callback để set loading state
 * @param {Function} options.setError - Callback để set error state
 * @returns {Promise<any>} - API response
 */
export async function executeCachedApiCall(
  cacheKey,
  apiCall,
  args = [],
  options = {}
) {
  const {
    ttl = 30000, // 30 seconds default
    useCache = true,
    setLoading,
    setError
  } = options;

  // Kiểm tra cache trước
  if (useCache) {
    const cached = getCachedData(cacheKey);
    if (cached !== null) {
      return cached;
    }
  }

  // Kiểm tra xem có request đang pending không
  if (pendingRequests.has(cacheKey)) {
    // Chờ request đang pending thay vì gọi mới
    return pendingRequests.get(cacheKey);
  }

  // Tạo promise mới cho request này
  const requestPromise = (async () => {
    if (setLoading) setLoading(true);
    if (setError) setError(null);

    try {
      const result = await apiCall(...args);
      
      // Validate response
      if (result && result.data !== undefined) {
        // Cache kết quả
        if (useCache) {
          setCachedData(cacheKey, result, ttl);
        }
        return result;
      } else {
        // Response không hợp lệ, trả về empty array hoặc null
        console.warn(`Invalid response for ${cacheKey}:`, result);
        const fallbackResult = { data: { data: [] } };
        if (useCache) {
          setCachedData(cacheKey, fallbackResult, ttl);
        }
        return fallbackResult;
      }
    } catch (err) {
      if (setError) setError(err.message || err);
      throw err;
    } finally {
      if (setLoading) setLoading(false);
      // Xóa khỏi pending requests sau khi hoàn thành
      pendingRequests.delete(cacheKey);
    }
  })();

  // Lưu promise vào pending requests
  pendingRequests.set(cacheKey, requestPromise);

  return requestPromise;
}

/**
 * Invalidate cache cho một key cụ thể
 * @param {string} cacheKey - Cache key cần invalidate
 */
export function invalidateCache(cacheKey) {
  clearCache(cacheKey);
  // Nếu có request đang pending, không cancel nó nhưng cache mới sẽ được set sau khi request hoàn thành
}

