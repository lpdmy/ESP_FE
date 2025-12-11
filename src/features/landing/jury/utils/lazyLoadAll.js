/**
 * Helper function để lazy load tất cả dữ liệu từ paginated API
 * Tự động load từng page cho đến khi hết dữ liệu
 * 
 * @param {Function} loadPageFunction - Function để load một page: (pageNumber, pageSize) => Promise
 * @param {number} pageSize - Kích thước mỗi page (mặc định 100)
 * @returns {Promise<Array>} - Mảng chứa tất cả dữ liệu đã load
 */
/**
 * Helper function để lazy load tất cả dữ liệu từ paginated API
 * Tự động load từng page cho đến khi hết dữ liệu
 * 
 * @param {Function} loadPageFunction - Function để load một page: (pageNumber, pageSize) => Promise
 * @param {number} pageSize - Kích thước mỗi page (mặc định 100, không hardcode số lớn)
 * @returns {Promise<Array>} - Mảng chứa tất cả dữ liệu đã load
 */
export const lazyLoadAllPages = async (loadPageFunction, pageSize = 100) => {
  const allData = [];
  let currentPage = 1;
  let hasMore = true;
  let totalCount = null; // Sẽ được set từ page đầu tiên

  while (hasMore) {
    try {
      const response = await loadPageFunction(currentPage, pageSize);
      
      // Xử lý response có thể có cấu trúc khác nhau
      const pageData = response?.data?.data || response?.data || [];
      
      // Lấy totalCount từ page đầu tiên
      if (totalCount === null && response?.data?.totalCount !== undefined) {
        totalCount = response?.data?.totalCount;
      }
      
      if (Array.isArray(pageData) && pageData.length > 0) {
        allData.push(...pageData);
        
        // Kiểm tra xem còn dữ liệu không
        // Nếu page trả về ít hơn pageSize, nghĩa là đã hết dữ liệu
        if (pageData.length < pageSize) {
          hasMore = false;
        } 
        // Nếu có totalCount, kiểm tra xem đã load đủ chưa
        else if (totalCount !== null) {
          hasMore = allData.length < totalCount;
        }
        // Nếu không có totalCount, tiếp tục load cho đến khi page trả về rỗng
        else {
          hasMore = true;
        }
        
        currentPage++;
      } else {
        // Không có dữ liệu, dừng lại
        hasMore = false;
      }
    } catch (error) {
      console.error(`❌ Lỗi khi load page ${currentPage}:`, error);
      // Nếu là page đầu tiên và có lỗi, throw error để caller xử lý
      if (currentPage === 1) {
        throw error;
      }
      // Nếu là page sau, dừng lại và trả về dữ liệu đã load
      hasMore = false;
    }
  }

  console.log(`✅ Lazy loaded ${allData.length} items từ ${currentPage - 1} page(s)`);
  return allData;
};

