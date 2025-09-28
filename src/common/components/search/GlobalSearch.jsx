import { useState, useEffect, useRef } from 'react';
import { Search, User, FileText, Users, Hash, Calendar, Eye, X, Filter, History, TrendingUp, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSearchApi } from '@/common/hooks/useSearchApi';
import { SearchFilters } from './SearchFilters';
import { SearchHistory } from './SearchHistory';
import { SearchTrending } from './SearchTrending';
import { SearchAdvanced } from './SearchAdvanced';

export const GlobalSearch = ({ 
  placeholder = "Tìm kiếm bạn bè, bài viết, hoạt động...",
  variant = "default", // "default" | "compact" | "expanded"
  onResultClick = () => {},
  className = ""
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState({});
  const [activeFilters, setActiveFilters] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const searchRef = useRef();
  const navigate = useNavigate();
  const { globalSearch, loading } = useSearchApi();


  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults({});
      setIsOpen(false);
      return;
    }

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
    }, 300);

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

  // Handle advanced search
  const handleAdvancedSearch = (filters) => {
    console.log('Advanced search filters:', filters);
    // Implement advanced search logic here
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
    <>
      {/* Global CSS to override any conflicting styles */}
      <style>
        {`
          .global-search-input {
            border: none !important;
            border-width: 0 !important;
            border-style: none !important;
            border-color: transparent !important;
            outline: none !important;
            outline-width: 0 !important;
            outline-style: none !important;
            outline-color: transparent !important;
            box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05) !important;
            background-color: white !important;
            color: #111827 !important;
            appearance: none !important;
            -webkit-appearance: none !important;
            -moz-appearance: none !important;
          }
          .global-search-input:focus {
            border: none !important;
            border-width: 0 !important;
            border-style: none !important;
            border-color: transparent !important;
            outline: none !important;
            outline-width: 0 !important;
            outline-style: none !important;
            outline-color: transparent !important;
            box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.2) !important;
          }
          .global-search-dropdown {
            border: none !important;
            border-width: 0 !important;
            border-style: none !important;
            border-color: transparent !important;
            outline: none !important;
            outline-width: 0 !important;
            outline-style: none !important;
            outline-color: transparent !important;
          }
          .global-search-dropdown * {
            border: none !important;
            border-width: 0 !important;
            border-style: none !important;
            border-color: transparent !important;
            outline: none !important;
            outline-width: 0 !important;
            outline-style: none !important;
            outline-color: transparent !important;
          }
          .global-search-dropdown .border-b {
            border-bottom: none !important;
            border-bottom-width: 0 !important;
            border-bottom-style: none !important;
            border-bottom-color: transparent !important;
          }
          .global-search-dropdown .border-t {
            border-top: none !important;
            border-top-width: 0 !important;
            border-top-style: none !important;
            border-top-color: transparent !important;
          }
          .global-search-dropdown .border-l-4 {
            border-left: none !important;
            border-left-width: 0 !important;
            border-left-style: none !important;
            border-left-color: transparent !important;
          }
        `}
      </style>
      <div className={`relative ${className}`} ref={searchRef} style={{ position: 'relative !important' }}>
        {/* Main Search Input */}
        <div className="relative group" style={{ position: 'relative !important' }}>
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 group-focus-within:text-orange-500 transition-colors" 
                style={{ position: 'absolute !important', left: '1rem !important', top: '50% !important', transform: 'translateY(-50%) !important' }} />
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={`global-search-input w-full pl-12 rounded-xl focus:ring-2 focus:ring-orange-500 
            ${variant === 'compact' ? 'py-2 text-sm pr-4' : 'py-3 text-base pr-12'}
            ${variant === 'expanded' ? 'py-4 text-lg pr-12' : ''}
            shadow-sm hover:shadow-md transition-all duration-200
          `}
          style={{ 
            width: '100% !important', 
            paddingLeft: '3rem !important',
            border: 'none !important',
            borderWidth: '0 !important',
            borderStyle: 'none !important',
            borderColor: 'transparent !important',
            borderRadius: '0.75rem !important',
            outline: 'none !important',
            outlineWidth: '0 !important',
            outlineStyle: 'none !important',
            outlineColor: 'transparent !important',
            boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05) !important',
            backgroundColor: 'white !important',
            color: '#111827 !important',
            fontSize: '16px !important',
            fontFamily: 'inherit !important',
            appearance: 'none !important',
            WebkitAppearance: 'none !important',
            MozAppearance: 'none !important'
          }}
          onFocus={(e) => {
            e.target.style.border = 'none !important';
            e.target.style.borderWidth = '0 !important';
            e.target.style.borderStyle = 'none !important';
            e.target.style.borderColor = 'transparent !important';
            e.target.style.boxShadow = '0 0 0 2px rgba(249, 115, 22, 0.2) !important';
            e.target.style.outline = 'none !important';
            if (query.length >= 2) setIsOpen(true);
          }}
          onBlur={(e) => {
            e.target.style.border = 'none !important';
            e.target.style.borderWidth = '0 !important';
            e.target.style.borderStyle = 'none !important';
            e.target.style.borderColor = 'transparent !important';
            e.target.style.boxShadow = '0 1px 2px 0 rgb(0 0 0 / 0.05) !important';
            e.target.style.outline = 'none !important';
          }}
        />
        
        {/* Loading spinner */}
        {loading && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2" 
               style={{ position: 'absolute !important', right: '2.5rem !important', top: '50% !important', transform: 'translateY(-50%) !important' }}>
            <div className="animate-spin h-4 w-4 border-2 border-orange-500 border-t-transparent rounded-full"></div>
          </div>
        )}
        
        {/* Clear button */}
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
            style={{ position: 'absolute !important', right: '0.75rem !important', top: '50% !important', transform: 'translateY(-50%) !important' }}
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        )}
      </div>


      {/* Search Controls */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg z-50 p-4">
          <div className="flex items-center space-x-3 mb-4">
            <SearchFilters 
              activeFilters={activeFilters}
              onFiltersChange={setActiveFilters}
            />
            <SearchAdvanced 
              onSearch={handleAdvancedSearch}
            />
          </div>
          
          {/* Content based on query length */}
          {query.length < 2 ? (
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
    </>
  );
};

// Search Results Dropdown Component
const SearchResultsDropdown = ({ results, query, loading, onResultClick, onClose }) => {
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
      <div className="global-search-dropdown absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg z-50 p-4"
           style={{ 
             position: 'absolute !important', 
             top: '100% !important', 
             left: '0 !important', 
             right: '0 !important', 
             marginTop: '0.5rem !important',
             backgroundColor: 'white !important',
             border: 'none !important',
             borderWidth: '0 !important',
             borderStyle: 'none !important',
             borderColor: 'transparent !important',
             borderRadius: '0.5rem !important',
             boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05) !important',
             zIndex: '50 !important',
             padding: '1rem !important',
             outline: 'none !important',
             outlineWidth: '0 !important',
             outlineStyle: 'none !important'
           }}>
        <div className="text-center text-gray-500">
          <div className="animate-spin h-6 w-6 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p>Đang tìm kiếm...</p>
        </div>
      </div>
    );
  }

  if (!hasResults) {
    return (
      <div className="global-search-dropdown absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg z-50 p-4"
           style={{ 
             position: 'absolute !important', 
             top: '100% !important', 
             left: '0 !important', 
             right: '0 !important', 
             marginTop: '0.5rem !important',
             backgroundColor: 'white !important',
             border: 'none !important',
             borderWidth: '0 !important',
             borderStyle: 'none !important',
             borderColor: 'transparent !important',
             borderRadius: '0.5rem !important',
             boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05) !important',
             zIndex: '50 !important',
             padding: '1rem !important',
             outline: 'none !important',
             outlineWidth: '0 !important',
             outlineStyle: 'none !important'
           }}>
        <div className="text-center text-gray-500">
          <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p>Không tìm thấy kết quả cho "{query}"</p>
          <p className="text-sm mt-1">Thử từ khóa khác hoặc kiểm tra chính tả</p>
        </div>
      </div>
    );
  }

  return (
    <div className="global-search-dropdown absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
         style={{ 
           position: 'absolute !important', 
           top: '100% !important', 
           left: '0 !important', 
           right: '0 !important', 
           marginTop: '0.5rem !important',
           backgroundColor: 'white !important',
           border: 'none !important',
           borderWidth: '0 !important',
           borderStyle: 'none !important',
           borderColor: 'transparent !important',
           borderRadius: '0.5rem !important',
           boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05) !important',
           zIndex: '50 !important',
           maxHeight: '24rem !important',
           overflowY: 'auto !important',
           outline: 'none !important',
           outlineWidth: '0 !important',
           outlineStyle: 'none !important'
         }}>
      {resultTypes.map(({ key, icon: Icon, label, color }) => {
        const items = results[key] || [];
        if (items.length === 0) return null;

        return (
          <div key={key} className="last:border-b-0" style={{ borderBottom: 'none !important' }}>
            <div className={`px-4 py-2 bg-${color}-50`} style={{ borderLeft: 'none !important' }}>
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
      <div className="px-4 py-3 bg-gray-50" 
           style={{ 
             padding: '0.75rem 1rem !important', 
             borderTop: 'none !important',
             borderTopWidth: '0 !important',
             borderTopStyle: 'none !important',
             borderTopColor: 'transparent !important',
             backgroundColor: '#f9fafb !important' 
           }}>
        <button 
          onClick={() => window.location.href = `/search?q=${encodeURIComponent(query)}`}
          className="w-full text-center text-blue-600 hover:text-blue-800 font-medium"
          style={{ 
            width: '100% !important', 
            textAlign: 'center !important', 
            color: '#2563eb !important', 
            fontWeight: '500 !important',
            backgroundColor: 'transparent !important',
            border: 'none !important',
            cursor: 'pointer !important'
          }}
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
      style={{ 
        padding: '0.75rem 1rem !important',
        cursor: 'pointer !important',
        borderBottom: 'none !important',
        borderBottomWidth: '0 !important',
        borderBottomStyle: 'none !important',
        borderBottomColor: 'transparent !important'
      }}
    >
      <div className="flex items-start gap-3" style={{ display: 'flex !important', alignItems: 'flex-start !important', gap: '0.75rem !important' }}>
        {/* Avatar/Icon */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-lg bg-${color}-100 flex items-center justify-center`}
             style={{ 
               flexShrink: '0 !important', 
               width: '2.5rem !important', 
               height: '2.5rem !important', 
               borderRadius: '0.5rem !important',
               display: 'flex !important',
               alignItems: 'center !important',
               justifyContent: 'center !important'
             }}>
          {content.avatar ? (
            <img src={content.avatar} alt="" className="w-8 h-8 rounded-lg object-cover" 
                 style={{ width: '2rem !important', height: '2rem !important', borderRadius: '0.5rem !important', objectFit: 'cover !important' }} />
          ) : (
            <div className={`w-6 h-6 text-${color}-600`} style={{ width: '1.5rem !important', height: '1.5rem !important' }}>
              {type === 'users' && <User className="w-full h-full" />}
              {type === 'posts' && <FileText className="w-full h-full" />}
              {type === 'activities' && <Calendar className="w-full h-full" />}
              {type === 'clubs' && <Users className="w-full h-full" />}
              {type === 'hashtags' && <Hash className="w-full h-full" />}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0" style={{ flex: '1 !important', minWidth: '0 !important' }}>
          <div className="flex items-center gap-2" style={{ display: 'flex !important', alignItems: 'center !important', gap: '0.5rem !important' }}>
            <h3 className="font-medium text-gray-900 truncate" style={{ fontWeight: '500 !important', color: '#111827 !important', overflow: 'hidden !important', textOverflow: 'ellipsis !important', whiteSpace: 'nowrap !important' }}>
              <HighlightText text={content.title} highlight={query} />
            </h3>
            {content.trending && (
              <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full"
                    style={{ 
                      fontSize: '0.75rem !important', 
                      backgroundColor: '#fee2e2 !important', 
                      color: '#dc2626 !important', 
                      padding: '0.25rem 0.5rem !important', 
                      borderRadius: '9999px !important' 
                    }}>
                Trending
              </span>
            )}
          </div>
          
          <p className="text-sm text-gray-600 mt-1" style={{ fontSize: '0.875rem !important', color: '#4b5563 !important', marginTop: '0.25rem !important' }}>{content.subtitle}</p>
          
          {content.content && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2" style={{ fontSize: '0.875rem !important', color: '#6b7280 !important', marginTop: '0.25rem !important' }}>
              <HighlightText text={content.content} highlight={query} />
            </p>
          )}
          
          {content.extra && (
            <p className="text-xs text-gray-400 mt-2" style={{ fontSize: '0.75rem !important', color: '#9ca3af !important', marginTop: '0.5rem !important' }}>{content.extra}</p>
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
      <mark key={i} className="bg-yellow-200 text-yellow-800 px-1 rounded"
            style={{ 
              backgroundColor: '#fef3c7 !important', 
              color: '#92400e !important', 
              padding: '0.25rem !important', 
              borderRadius: '0.25rem !important' 
            }}>
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
