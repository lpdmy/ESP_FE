import { useState, useEffect } from 'react';
import { Clock, Trash2, Search, X } from 'lucide-react';

export const SearchHistory = ({ 
  onSearchClick = () => {},
  onClearHistory = () => {},
  className = "" 
}) => {
  const [searchHistory, setSearchHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load search history from localStorage
  useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = () => {
    try {
      const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      setSearchHistory(history);
    } catch (error) {
      console.error('Error loading search history:', error);
      setSearchHistory([]);
    }
  };

  const clearHistory = () => {
    localStorage.removeItem('searchHistory');
    setSearchHistory([]);
    onClearHistory();
  };

  const removeFromHistory = (index) => {
    const newHistory = searchHistory.filter((_, i) => i !== index);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Vừa xong';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} giờ trước`;
    } else {
      return `${Math.floor(diffInHours / 24)} ngày trước`;
    }
  };

  if (searchHistory.length === 0) {
    return (
      <div className={`p-4 text-center text-gray-500 ${className}`}>
        <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">Chưa có lịch sử tìm kiếm</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-900">Lịch sử tìm kiếm</h3>
        </div>
        <button
          onClick={clearHistory}
          className="text-xs text-gray-500 hover:text-red-600 flex items-center space-x-1 transition-colors"
        >
          <Trash2 className="h-3 w-3" />
          <span>Xóa tất cả</span>
        </button>
      </div>

      {/* History List */}
      <div className="max-h-64 overflow-y-auto">
        {searchHistory.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <button
                  onClick={() => onSearchClick(item.query)}
                  className="text-sm text-gray-900 hover:text-blue-600 transition-colors text-left truncate"
                >
                  {item.query}
                </button>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-gray-500">
                    {formatTime(item.timestamp)}
                  </span>
                  {item.resultCount && (
                    <span className="text-xs text-gray-400">
                      • {item.resultCount} kết quả
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <button
              onClick={() => removeFromHistory(index)}
              className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-all"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
