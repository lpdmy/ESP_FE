import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Filter, Calendar, MapPin, User, Hash, Users2, FileText, Eye, MessageCircle, Heart, Share2, Bell, Menu, Trophy, Star, LogOut, Settings } from 'lucide-react';
import { useSearchApi } from '@/common/hooks/useSearchApi';
import { useToast } from '@/common/hooks/useToast';
import { LoadingCard } from '@/common/components/ui/loading';
import { Button } from '@/common/components/ui/button';
import { Badge } from '@/common/components/ui/badge';
import { ROUTES } from '@/common/constants/routes';
import { ROLE } from '@/common/constants/roles';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, useDropdownMenu } from '@/common/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/common/components/ui/avatar';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { clearUser } from '@/store/user/userSlice';
import PostCard from '@/features/landing/components/PostCard';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const { isOpen, openMenu, closeMenu, toggleMenu } = useDropdownMenu(false);
  
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [activeFilter, setActiveFilter] = useState('all');
  const [filters, setFilters] = useState({
    datePosted: '',
    postsFrom: '',
    taggedLocation: '',
    recentPosts: false,
    postsSeen: false
  });
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  
  const { globalSearch } = useSearchApi();

  const handleLogout = () => {
    dispatch(clearUser());
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    navigate(ROUTES.LOGIN);
  };

  const getProfileRoute = () => {
    if (user?.role === ROLE.TEACHER) {
      return ROUTES.USER_PROFILE.TEACHER_PROFILE;
    }
    return ROUTES.USER_PROFILE.PROFILE;
  };

  const filterOptions = [
    { id: 'all', label: 'Tất cả', icon: Search, color: 'text-gray-700' },
    { id: 'users', label: 'Người dùng', icon: User, color: 'text-blue-600' },
    { id: 'posts', label: 'Bài viết', icon: FileText, color: 'text-green-600' },
    { id: 'activities', label: 'Hoạt động', icon: Calendar, color: 'text-purple-600' },
    { id: 'clubs', label: 'Câu lạc bộ', icon: Users2, color: 'text-orange-600' },
    { id: 'classes', label: 'Lớp học', icon: Hash, color: 'text-pink-600' },
    { id: 'events', label: 'Sự kiện', icon: Calendar, color: 'text-indigo-600' }
  ];

  const datePostedOptions = [
    { value: '', label: 'Tất cả thời gian' },
    { value: 'today', label: 'Hôm nay' },
    { value: 'week', label: 'Tuần này' },
    { value: 'month', label: 'Tháng này' },
    { value: 'year', label: 'Năm nay' }
  ];

  const postsFromOptions = [
    { value: '', label: 'Tất cả' },
    { value: 'friends', label: 'Bạn bè' },
    { value: 'groups', label: 'Nhóm' },
    { value: 'pages', label: 'Trang' },
    { value: 'public', label: 'Công khai' }
  ];

  // Search function
  const performSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      // Always search all categories to get complete results
      const searchResults = await globalSearch({
        query,
        category: 'all', // Always search all categories
        pageSize: 20,
        ...filters
      });
      
      setResults(searchResults.data?.results || {});
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Có lỗi xảy ra khi tìm kiếm');
    } finally {
      setLoading(false);
    }
  };

  // Update URL when query changes
  useEffect(() => {
    if (query) {
      setSearchParams({ q: query });
    }
  }, [query, setSearchParams]);

  // Perform search when query or filters change
  useEffect(() => {
    if (query.trim()) {
      performSearch();
    }
  }, [query, activeFilter, filters]);

  const handleSearch = (e) => {
    e.preventDefault();
    performSearch();
  };

  const handleFilterChange = (filterId) => {
    setActiveFilter(filterId);
  };

  const handleFilterUpdate = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getResultCount = () => {
    return Object.values(results).reduce((total, arr) => total + (arr?.length || 0), 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50 px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="lg:hidden hover:bg-orange-50">
              <Menu className="h-5 w-5 text-gray-600" />
            </Button>
            <Link to={ROUTES.LANDING.HOME} className="flex items-center space-x-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <span className="text-white font-bold text-xl">E</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                EduSphere
              </span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm kiếm bạn bè, bài viết, sự kiện, cuộc thi..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </form>
          </div>

          {/* Navigation Actions */}
          <div className="flex items-center space-x-3">
            {/* Quick Actions */}
            <div className="hidden lg:flex items-center space-x-2">
              <Button variant="ghost" className="flex items-center space-x-2 hover:bg-orange-50 hover:text-orange-600 transition-colors rounded-xl px-4 py-2">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Sự kiện</span>
              </Button>
              <Button variant="ghost" className="flex items-center space-x-2 hover:bg-orange-50 hover:text-orange-600 transition-colors rounded-xl px-4 py-2">
                <Trophy className="h-4 w-4" />
                <span className="font-medium">Cuộc thi</span>
              </Button>
              <Button variant="ghost" className="flex items-center space-x-2 hover:bg-orange-50 hover:text-orange-600 transition-colors rounded-xl px-4 py-2">
                <Star className="h-4 w-4" />
                <span className="font-medium">Xếp hạng</span>
              </Button>
            </div>

            {/* Notifications */}
            <Button variant="ghost" className="relative p-3 hover:bg-orange-50 hover:text-orange-600 transition-colors rounded-xl">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold shadow-lg">
                3
              </span>
            </Button>

            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-3 hover:bg-gray-50 rounded-xl px-3 py-2 transition-all duration-200"
                  onClick={toggleMenu}
                  data-dropdown-trigger
                >
                  <Avatar className="h-9 w-9 ring-2 ring-orange-200 hover:ring-orange-300 transition-all">
                    <AvatarImage src={user?.avatarUrl || null} alt="Avatar" />
                    <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-500 text-white font-semibold">
                      {user?.firstName && user?.lastName
                        ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
                        : user?.username ? user.username[0].toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-semibold text-gray-800">
                      {user?.firstName && user?.lastName 
                        ? `${user.firstName} ${user.lastName}` 
                        : user?.username || "Guest"}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {user?.role === ROLE.TEACHER ? "Giáo viên" : "Học sinh"}
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-64 p-2 bg-white/95 backdrop-blur-md border-gray-200/50 shadow-xl rounded-xl"
                isOpen={isOpen}
                onClose={closeMenu}
              >
                <div className="px-3 py-2 border-b border-gray-100">
                  <div className="text-sm font-semibold text-gray-800">
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : user?.username || "Guest"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {user?.email || "Chưa cập nhật email"}
                  </div>
                </div>
                <DropdownMenuItem 
                  className="rounded-lg hover:bg-orange-50 hover:text-orange-600 transition-colors"
                  onClick={closeMenu}
                >
                  <Link
                    to={getProfileRoute()}
                    className="inline-flex items-center w-full px-3 py-2"
                  >
                    <User className="mr-3 h-4 w-4" />
                    <span className="font-medium">Trang cá nhân</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="rounded-lg hover:bg-orange-50 hover:text-orange-600 transition-colors"
                  onClick={closeMenu}
                >
                  <Link
                    to={ROUTES.AUTH.CHANGEPASSWORD}
                    className="inline-flex items-center w-full px-3 py-2"
                  >
                    <Settings className="mr-3 h-4 w-4" />
                    <span className="font-medium">Cài đặt</span>
                  </Link>
                </DropdownMenuItem>
                <div className="border-t border-gray-100 my-1"></div>
                <DropdownMenuItem 
                  className="rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
                  onClick={() => {
                    closeMenu();
                    handleLogout();
                  }}
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  <span className="font-medium">Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-orange-100 p-4 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bộ lọc tìm kiếm</h3>
              
              {/* Filter Categories */}
              <div className="space-y-2 mb-6">
                {filterOptions.map((option) => {
                  const Icon = option.icon;
                  const isActive = activeFilter === option.id;
                  
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleFilterChange(option.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        isActive 
                          ? 'bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-700 border border-orange-200' 
                          : 'hover:bg-orange-50 text-gray-700'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{option.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Advanced Filters */}
              <div className="space-y-4">
                {/* Recent Posts Toggle */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Bài viết gần đây</label>
                  <input
                    type="checkbox"
                    checked={filters.recentPosts}
                    onChange={(e) => handleFilterUpdate('recentPosts', e.target.checked)}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                </div>

                {/* Posts You've Seen Toggle */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Bài viết đã xem</label>
                  <input
                    type="checkbox"
                    checked={filters.postsSeen}
                    onChange={(e) => handleFilterUpdate('postsSeen', e.target.checked)}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                </div>

                {/* Date Posted */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày đăng
                  </label>
                  <select
                    value={filters.datePosted}
                    onChange={(e) => handleFilterUpdate('datePosted', e.target.value)}
                    className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm bg-white/50"
                  >
                    {datePostedOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Posts From */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bài viết từ
                  </label>
                  <select
                    value={filters.postsFrom}
                    onChange={(e) => handleFilterUpdate('postsFrom', e.target.value)}
                    className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm bg-white/50"
                  >
                    {postsFromOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tagged Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Địa điểm được gắn thẻ
                  </label>
                  <input
                    type="text"
                    value={filters.taggedLocation}
                    onChange={(e) => handleFilterUpdate('taggedLocation', e.target.value)}
                    placeholder="Nhập địa điểm..."
                    className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm bg-white/50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {loading ? (
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <LoadingCard key={i} />
                ))}
              </div>
            ) : query ? (
              <SearchResults results={results} activeFilter={activeFilter} query={query} onFilterChange={setActiveFilter} />
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Search className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold gradient-text mb-2">Bắt đầu tìm kiếm</h3>
                <p className="text-gray-600 text-lg">Nhập từ khóa để tìm kiếm người dùng, bài viết, hoạt động...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Search Results Component
const SearchResults = ({ results, activeFilter, query, onFilterChange }) => {
  const navigate = useNavigate();

  const resultTypes = [
    { key: 'users', label: 'Người dùng', icon: User, color: 'blue' },
    { key: 'posts', label: 'Bài viết', icon: FileText, color: 'green' },
    { key: 'activities', label: 'Hoạt động', icon: Calendar, color: 'purple' },
    { key: 'clubs', label: 'Câu lạc bộ', icon: Users2, color: 'orange' },
    { key: 'classes', label: 'Lớp học', icon: Hash, color: 'pink' },
    { key: 'events', label: 'Sự kiện', icon: Calendar, color: 'indigo' }
  ];

  const hasResults = Object.values(results).some(arr => arr?.length > 0);

  if (!hasResults) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Search className="h-10 w-10 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-700 mb-2">Không tìm thấy kết quả</h3>
        <p className="text-gray-600 text-lg">Không có kết quả nào cho "{query}"</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {resultTypes.map(({ key, label, icon: Icon, color }) => {
        const items = results[key] || [];
        
        // Filter results based on activeFilter
        if (activeFilter !== 'all' && activeFilter !== key) {
          return null;
        }
        
        if (items.length === 0) return null;

        return (
          <div key={key} className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-orange-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Icon className={`h-5 w-5 text-${color}-600`} />
              <h2 className="text-lg font-semibold text-gray-900">{label}</h2>
              <span className="text-sm text-gray-500">({items.length})</span>
            </div>
            
            <div className="space-y-3">
              {items.slice(0, (key === 'users' && activeFilter === 'all') ? 5 : items.length).map((item) => (
                <SearchResultListItem
                  key={`${key}-${item.id}`}
                  result={item}
                  type={key}
                  color={color}
                  query={query}
                  onClick={() => {
                    switch(key) {
                      case 'users':
                        navigate(`/profile/${item.id}`);
                        break;
                      case 'posts':
                        navigate(`/posts/${item.id}`);
                        break;
                      case 'activities':
                        navigate(`/activities/${item.id}`);
                        break;
                      case 'clubs':
                        navigate(`/clubs/${item.id}`);
                        break;
                      default:
                        break;
                    }
                  }}
                />
              ))}
              
              {/* See All Button for Users - only show when in "all" filter */}
              {key === 'users' && activeFilter === 'all' && items.length > 5 && (
                <div className="pt-3 border-t border-gray-100">
                  <button
                    onClick={() => onFilterChange('users')}
                    className="w-full text-center text-blue-600 hover:text-blue-800 font-medium py-2 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    Xem tất cả ({items.length} người dùng)
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Individual Search Result List Item (Facebook-style)
const SearchResultListItem = ({ result, type, color, query, onClick }) => {
  const getResultContent = () => {
    switch(type) {
      case 'users':
        return {
          title: `${result.firstName} ${result.lastName}`,
          subtitle: `${getRoleText(result.role)} • ${result.email}`,
          avatar: result.avatarUrl,
          extra: result.role === 4 ? result.studentNumber : result.teacherCode,
          action: 'Message'
        };
      
      case 'posts':
        return {
          title: result.title,
          subtitle: `${result.authorName} • ${formatDate(result.createdAt)}`,
          content: result.body?.substring(0, 100) + '...',
          extra: `${result.likesCount || 0} likes • ${result.commentsCount || 0} comments`,
          action: 'View'
        };
      
      case 'activities':
        return {
          title: result.title,
          subtitle: `${formatDate(result.startDate)} • ${result.location}`,
          content: result.description?.substring(0, 100) + '...',
          extra: `${result.participantsCount}/${result.maxParticipants} tham gia`,
          action: 'Join'
        };
        
      case 'clubs':
        return {
          title: result.name,
          subtitle: `${result.membersCount} thành viên`,
          content: result.description?.substring(0, 100) + '...',
          avatar: result.avatarUrl,
          action: 'Join'
        };
        
      default:
        return { title: result.title || result.name, action: 'View' };
    }
  };

  const content = getResultContent();

  // For posts, render PostCard component
  if (type === 'posts') {
    return (
      <div onClick={onClick} className="cursor-pointer">
        <PostCard
          author={result.authorName || 'Ẩn danh'}
          class={result.authorClass || 'Không xác định'}
          time={formatDate(result.createdAt)}
          content={result.body || result.title}
          image={result.imageUrl}
          likes={result.likesCount || 0}
          comments={result.commentsCount || 0}
          shares={result.sharesCount || 0}
          isVerified={result.isVerified || false}
          contestEntry={result.contestEntry || false}
        />
      </div>
    );
  }

  // For other types, render list item
  return (
    <div 
      onClick={onClick}
      className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 last:border-b-0"
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Avatar/Icon */}
        <div className="flex-shrink-0">
          {content.avatar ? (
            <img src={content.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div className={`w-12 h-12 rounded-full bg-${color}-100 flex items-center justify-center`}>
              <div className={`w-8 h-8 text-${color}-600`}>
                {type === 'users' && <User className="w-full h-full" />}
                {type === 'activities' && <Calendar className="w-full h-full" />}
                {type === 'clubs' && <Users2 className="w-full h-full" />}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-base">
            <HighlightText text={content.title} highlight={query} />
          </h3>
          
          <p className="text-sm text-gray-600 mt-1">{content.subtitle}</p>
          
          {content.content && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              <HighlightText text={content.content} highlight={query} />
            </p>
          )}
          
          {content.extra && (
            <p className="text-xs text-gray-400 mt-1">{content.extra}</p>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div className="flex-shrink-0 ml-4">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors`}
        >
          {content.action}
        </button>
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
      <mark key={i} className="bg-gradient-to-r from-yellow-200 to-orange-200 text-orange-800 px-1 rounded shadow-sm">
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
