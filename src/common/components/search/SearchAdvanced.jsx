import { useState } from 'react';
import { Settings, Calendar, MapPin, User, Hash, Users2, FileText, X } from 'lucide-react';

export const SearchAdvanced = ({ 
  onSearch = () => {},
  className = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    dateRange: '',
    location: '',
    author: '',
    hashtags: '',
    minLikes: '',
    maxResults: 20
  });

  const categoryOptions = [
    { value: 'all', label: 'Tất cả', icon: Settings },
    { value: 'users', label: 'Người dùng', icon: User },
    { value: 'posts', label: 'Bài viết', icon: FileText },
    { value: 'activities', label: 'Hoạt động', icon: Calendar },
    { value: 'hashtags', label: 'Hashtag', icon: Hash },
    { value: 'clubs', label: 'Câu lạc bộ', icon: Users2 }
  ];

  const dateRangeOptions = [
    { value: '', label: 'Tất cả thời gian' },
    { value: 'today', label: 'Hôm nay' },
    { value: 'week', label: 'Tuần này' },
    { value: 'month', label: 'Tháng này' },
    { value: 'year', label: 'Năm nay' }
  ];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    onSearch(filters);
    setIsOpen(false);
  };

  const resetFilters = () => {
    setFilters({
      category: 'all',
      dateRange: '',
      location: '',
      author: '',
      hashtags: '',
      minLikes: '',
      maxResults: 20
    });
  };

  return (
    <div className={`relative ${className}`}>
      {/* Advanced Search Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Settings className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">Tìm kiếm nâng cao</span>
      </button>

      {/* Advanced Search Panel */}
      {isOpen && (
        <div className="absolute top-full left-96 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-[60]">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Tìm kiếm nâng cao</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Filters */}
            <div className="space-y-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại nội dung
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categoryOptions.map(option => {
                    const Icon = option.icon;
                    return (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thời gian
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {dateRangeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Địa điểm
                </label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  placeholder="Nhập địa điểm..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Author */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="h-4 w-4 inline mr-1" />
                  Tác giả
                </label>
                <input
                  type="text"
                  value={filters.author}
                  onChange={(e) => handleFilterChange('author', e.target.value)}
                  placeholder="Tên tác giả..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Hashtags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Hash className="h-4 w-4 inline mr-1" />
                  Hashtags
                </label>
                <input
                  type="text"
                  value={filters.hashtags}
                  onChange={(e) => handleFilterChange('hashtags', e.target.value)}
                  placeholder="#hashtag1 #hashtag2..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Min Likes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số lượt thích tối thiểu
                </label>
                <input
                  type="number"
                  value={filters.minLikes}
                  onChange={(e) => handleFilterChange('minLikes', e.target.value)}
                  placeholder="0"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Max Results */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số kết quả tối đa
                </label>
                <select
                  value={filters.maxResults}
                  onChange={(e) => handleFilterChange('maxResults', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={10}>10 kết quả</option>
                  <option value={20}>20 kết quả</option>
                  <option value={50}>50 kết quả</option>
                  <option value={100}>100 kết quả</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={resetFilters}
                className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Đặt lại
              </button>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Tìm kiếm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};
