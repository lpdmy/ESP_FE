import { useState } from 'react';
import { Filter, X, Users, FileText, Calendar, Hash, Users2 } from 'lucide-react';

export const SearchFilters = ({ 
  activeFilters = [], 
  onFiltersChange = () => {},
  className = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const filterOptions = [
    { id: 'users', label: 'Người dùng', icon: Users, color: 'bg-blue-100 text-blue-700' },
    { id: 'posts', label: 'Bài viết', icon: FileText, color: 'bg-green-100 text-green-700' },
    { id: 'activities', label: 'Hoạt động', icon: Calendar, color: 'bg-purple-100 text-purple-700' },
    { id: 'hashtags', label: 'Hashtag', icon: Hash, color: 'bg-orange-100 text-orange-700' },
    { id: 'clubs', label: 'Câu lạc bộ', icon: Users2, color: 'bg-pink-100 text-pink-700' }
  ];

  const toggleFilter = (filterId) => {
    const newFilters = activeFilters.includes(filterId)
      ? activeFilters.filter(f => f !== filterId)
      : [...activeFilters, filterId];
    
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange([]);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Filter className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">
          Bộ lọc {activeFilters.length > 0 && `(${activeFilters.length})`}
        </span>
      </button>

      {/* Filter Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-36 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Bộ lọc tìm kiếm</h3>
              {activeFilters.length > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-gray-500 hover:text-gray-700 flex items-center space-x-1"
                >
                  <X className="h-3 w-3" />
                  <span>Xóa tất cả</span>
                </button>
              )}
            </div>

            {/* Filter Options */}
            <div className="space-y-2">
              {filterOptions.map((option) => {
                const Icon = option.icon;
                const isActive = activeFilters.includes(option.id);
                
                return (
                  <button
                    key={option.id}
                    onClick={() => toggleFilter(option.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      isActive 
                        ? option.color 
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{option.label}</span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 bg-current rounded-full"></div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Active Filters Summary */}
            {activeFilters.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {activeFilters.map((filterId) => {
                    const option = filterOptions.find(opt => opt.id === filterId);
                    return (
                      <span
                        key={filterId}
                        className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${option.color}`}
                      >
                        <span>{option.label}</span>
                        <button
                          onClick={() => toggleFilter(filterId)}
                          className="hover:bg-black hover:bg-opacity-10 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
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
