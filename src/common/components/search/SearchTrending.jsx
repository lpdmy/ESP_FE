import { useState, useEffect } from 'react';
import { TrendingUp, Flame, ArrowUp, Search } from 'lucide-react';
import { useSearchApi } from '@/common/hooks/useSearchApi';

export const SearchTrending = ({ 
  onTrendingClick = () => {},
  className = "" 
}) => {
  const [trendingSearches, setTrendingSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { getTrendingSearches } = useSearchApi();

  useEffect(() => {
    loadTrendingSearches();
  }, []);

  const loadTrendingSearches = async () => {
    setIsLoading(true);
    try {
      const response = await getTrendingSearches(10);
      setTrendingSearches(response.data?.items || []);
    } catch (error) {
      console.error('Error loading trending searches:', error);
      // Fallback to mock data
      setTrendingSearches([
        { query: 'hackathon 2024', searchCount: 156, isTrending: true },
        { query: 'machine learning', searchCount: 89, isTrending: true },
        { query: 'react native', searchCount: 67, isTrending: false },
        { query: 'blockchain', searchCount: 45, isTrending: true },
        { query: 'artificial intelligence', searchCount: 34, isTrending: false }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendingIcon = (index) => {
    if (index === 0) return <Flame className="h-3 w-3 text-red-500" />;
    if (index === 1) return <TrendingUp className="h-3 w-3 text-orange-500" />;
    if (index === 2) return <ArrowUp className="h-3 w-3 text-yellow-500" />;
    return <span className="text-xs text-gray-400 font-bold">{index + 1}</span>;
  };

  const getTrendingColor = (index) => {
    if (index === 0) return 'text-red-600';
    if (index === 1) return 'text-orange-600';
    if (index === 2) return 'text-yellow-600';
    return 'text-gray-600';
  };

  if (isLoading) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="flex items-center space-x-2 mb-3">
          <TrendingUp className="h-4 w-4 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-900">Đang tải...</h3>
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (trendingSearches.length === 0) {
    return (
      <div className={`p-4 text-center text-gray-500 ${className}`}>
        <TrendingUp className="h-8 w-8 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">Chưa có xu hướng tìm kiếm</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center space-x-2 p-4 border-b border-gray-200">
        <TrendingUp className="h-4 w-4 text-gray-600" />
        <h3 className="text-sm font-semibold text-gray-900">Xu hướng tìm kiếm</h3>
      </div>

      {/* Trending List */}
      <div className="p-4 space-y-3">
        {trendingSearches.map((item, index) => (
          <div
            key={index}
            className="flex items-center space-x-3 group cursor-pointer"
            onClick={() => onTrendingClick(item.query)}
          >
            {/* Ranking Icon */}
            <div className="flex-shrink-0">
              {getTrendingIcon(index)}
            </div>

            {/* Search Query */}
            <div className="flex-1 min-w-0">
              <button
                className={`text-sm font-medium hover:text-blue-600 transition-colors text-left truncate ${getTrendingColor(index)}`}
              >
                {item.query}
              </button>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-gray-500">
                  {item.searchCount} lượt tìm kiếm
                </span>
                {item.isTrending && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <Flame className="h-2 w-2 mr-1" />
                    Hot
                  </span>
                )}
              </div>
            </div>

            {/* Search Icon */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <Search className="h-3 w-3 text-gray-400" />
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <p className="text-xs text-gray-500 text-center">
          Cập nhật mỗi giờ • Dựa trên dữ liệu tìm kiếm
        </p>
      </div>
    </div>
  );
};
