import { useState, useEffect, useRef } from 'react';
import { Search, User, FileText, Users, Hash, Calendar, Eye, X, History, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSearchApi } from '@/common/hooks/useSearchApi';
import { SearchHistory } from './SearchHistory';
import { SearchTrending } from './SearchTrending';

export const GlobalSearch = ({ 
  placeholder = "Tìm kiếm bạn bè, bài viết, hoạt động...",
  variant = "default", // "default" | "compact" | "expanded"
  onResultClick = () => {},
  className = ""
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState({});
  const searchRef = useRef();
  const navigate = useNavigate();
  const { globalSearch, loading } = useSearchApi();


  // Debounced search with adaptive delay
  useEffect(() => {
    if (query.length < 1) {
      setResults({});
      setIsOpen(false);
      return;
    }

    // Adaptive delay based on query length
    const delay = query.length === 1 ? 800 : query.length === 2 ? 500 : 300;

    const timeoutId = setTimeout(async () => {
      try {
        const searchResults = await globalSearch({
          query,
          category: 'all', // Always search all categories
          pageSize: 5 // Limit for dropdown
        });
        setResults(searchResults.data?.results || {});
        setIsOpen(true);
      } catch (error) {
        console.error('Search error:', error);
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Handle result click
  const handleResultClick = (result, type) => {
    setQuery('');
    setIsOpen(false);
    onResultClick(result, type);
    
    // Navigate based on result type
    switch(type) {
      case 'users':
        navigate(`/profile/${result.id}`);
        break;
      case 'posts':
        navigate(`/posts/${result.id}`);
        break;
      case 'activities':
        navigate(`/activities/${result.id}`);
        break;
      case 'clubs':
        navigate(`/clubs/${result.id}`);
        break;
      default:
        break;
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setIsOpen(true);
  };

  // Handle trending click
  const handleTrendingClick = (trending) => {
    setQuery(trending);
    setIsOpen(true);
  };


  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const clearSearch = () => {
    setQuery('');
    setResults({});
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={searchRef}>
        {/* Main Search Input */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 group-focus-within:text-orange-500 transition-colors" />
          <input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`w-full pl-12 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none
              ${variant === 'compact' ? 'py-2 text-sm pr-4' : 'py-3 text-base pr-12'}
              ${variant === 'expanded' ? 'py-4 text-lg pr-12' : ''}
              shadow-sm hover:shadow-md transition-all duration-200
            `}
            onFocus={() => {
              if (query.length >= 1) setIsOpen(true);
            }}
          />
          
          {/* Loading spinner */}
          {loading && (
            <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin h-4 w-4 border-2 border-orange-500 border-t-transparent rounded-full"></div>
            </div>
          )}
          
          {/* Clear button */}
          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>


      {/* Search Results */}
      {isOpen && (
        <div>
          {/* Content based on query length */}
          {query.length < 1 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SearchHistory 
                onSearchClick={handleSuggestionClick}
                onClearHistory={() => {}}
              />
              <SearchTrending 
                onTrendingClick={handleTrendingClick}
              />
            </div>
          ) : (
            <SearchResultsDropdown 
              results={results} 
              query={query}
              loading={loading}
              onResultClick={handleResultClick}
              onClose={() => setIsOpen(false)}
            />
          )}
        </div>
      )}
    </div>
  );
};

// Search Results Dropdown Component
const SearchResultsDropdown = ({ results, query, loading, onResultClick, onClose }) => {
  const navigate = useNavigate();
  const resultTypes = [
    { key: 'users', icon: User, label: 'Người dùng', color: 'green' },
    { key: 'posts', icon: FileText, label: 'Bài viết', color: 'purple' },
    { key: 'activities', icon: Calendar, label: 'Hoạt động', color: 'orange' },
    { key: 'clubs', icon: Users, label: 'Câu lạc bộ', color: 'teal' },
    { key: 'hashtags', icon: Hash, label: 'Hashtags', color: 'pink' }
  ];

  const hasResults = Object.values(results).some(arr => arr?.length > 0);

  if (loading) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg z-50 p-4">
        <div className="text-center text-gray-500">
          <div className="animate-spin h-6 w-6 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p>Đang tìm kiếm...</p>
        </div>
      </div>
    );
  }

  if (!hasResults) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg z-50 p-4">
        <div className="text-center text-gray-500">
          <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p>Không tìm thấy kết quả cho "{query}"</p>
          <p className="text-sm mt-1">Thử từ khóa khác hoặc kiểm tra chính tả</p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
      {resultTypes.map(({ key, icon: Icon, label, color }) => {
        const items = results[key] || [];
        if (items.length === 0) return null;

        return (
          <div key={key} className="last:border-b-0">
            <div className={`px-4 py-2 bg-${color}-50`}>
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 text-${color}-600`} />
                <span className={`text-sm font-medium text-${color}-700`}>
                  {label} ({items.length})
                </span>
              </div>
            </div>
            
            {items.map((item) => (
              <SearchResultCard
                key={`${key}-${item.id}`}
                result={item}
                type={key}
                color={color}
                query={query}
                onClick={() => onResultClick(item, key)}
              />
            ))}
          </div>
        );
      })}
      
      {/* View All Results */}
      <div className="px-4 py-3 bg-gray-50">
        <button 
          onClick={() => navigate(`/search?q=${encodeURIComponent(query)}`)}
          className="w-full text-center text-blue-600 hover:text-blue-800 font-medium"
        >
          <Eye className="h-4 w-4 inline mr-2" />
          Xem tất cả kết quả
        </button>
      </div>
    </div>
  );
};

// Individual Search Result Card
const SearchResultCard = ({ result, type, color, query, onClick }) => {
  const getResultContent = () => {
    switch(type) {
      case 'users':
        return {
          title: `${result.firstName} ${result.lastName}`,
          subtitle: `${getRoleText(result.role)} • ${result.email}`,
          avatar: result.avatarUrl,
          extra: result.role === 4 ? result.studentNumber : result.teacherCode
        };
      
      case 'posts':
        return {
          title: result.title,
          subtitle: `${result.authorName} • ${formatDate(result.createdAt)}`,
          content: result.body?.substring(0, 100) + '...',
          extra: `${result.likesCount || 0} likes • ${result.commentsCount || 0} comments`
        };
      
      case 'activities':
        return {
          title: result.title,
          subtitle: `${formatDate(result.startDate)} • ${result.location}`,
          content: result.description?.substring(0, 100) + '...',
          extra: `${result.participantsCount}/${result.maxParticipants} tham gia`
        };
        
      case 'clubs':
        return {
          title: result.name,
          subtitle: `${result.membersCount} thành viên`,
          content: result.description?.substring(0, 100) + '...',
          avatar: result.avatarUrl
        };
        
      case 'hashtags':
        return {
          title: `#${result.name}`,
          subtitle: `${result.postsCount} bài viết`,
          trending: result.trending
        };
        
      default:
        return { title: result.title || result.name };
    }
  };

  const content = getResultContent();

  return (
    <div 
      onClick={onClick}
      className="px-4 py-3 hover:bg-gray-50 cursor-pointer last:border-b-0"
    >
      <div className="flex items-start gap-3">
        {/* Avatar/Icon */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-lg bg-${color}-100 flex items-center justify-center`}>
          {content.avatar ? (
            <img src={content.avatar} alt="" className="w-8 h-8 rounded-lg object-cover" />
          ) : (
            <div className={`w-6 h-6 text-${color}-600`}>
              {type === 'users' && <User className="w-full h-full" />}
              {type === 'posts' && <FileText className="w-full h-full" />}
              {type === 'activities' && <Calendar className="w-full h-full" />}
              {type === 'clubs' && <Users className="w-full h-full" />}
              {type === 'hashtags' && <Hash className="w-full h-full" />}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900 truncate">
              <HighlightText text={content.title} highlight={query} />
            </h3>
            {content.trending && (
              <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                Trending
              </span>
            )}
          </div>
          
          <p className="text-sm text-gray-600 mt-1">{content.subtitle}</p>
          
          {content.content && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              <HighlightText text={content.content} highlight={query} />
            </p>
          )}
          
          {content.extra && (
            <p className="text-xs text-gray-400 mt-2">{content.extra}</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Utility component để highlight search terms
const HighlightText = ({ text, highlight }) => {
  if (!highlight.trim()) return text;
  
  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, i) => 
    regex.test(part) ? (
      <mark key={i} className="bg-yellow-200 text-yellow-800 px-1 rounded">
        {part}
      </mark>
    ) : part
  );
};

// Utility functions
const getRoleText = (role) => {
  const roles = { 0: 'Admin', 2: 'Giáo viên', 4: 'Học sinh' };
  return roles[role] || 'User';
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export default GlobalSearch;
