import { useState, useEffect } from 'react';
import { Button } from '@/common/components/ui/button';
import { Card } from '@/common/components/ui/card';
import { Input } from '@/common/components/ui/input';
import { X, Search, Loader2 } from 'lucide-react';
import { API_KEYS, FALLBACK_GIPHY_API_KEY } from '@/config/api.keys';

// Giphy API configuration
const GIPHY_API_KEY = API_KEYS.GIPHY_API_KEY || FALLBACK_GIPHY_API_KEY;
const GIPHY_BASE_URL = API_KEYS.GIPHY_BASE_URL + '/gifs';

const GifSearchModal = ({ isOpen, onClose, onGifSelect, inline = false }) => {
  // 1. State declarations
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [trendingGifs, setTrendingGifs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showTrending, setShowTrending] = useState(true);
  const [error, setError] = useState(null);

  // 4. Event handlers
  const searchGifs = async (query) => {
    setIsLoading(true);
    setShowTrending(false);
    setError(null);

    try {
      const response = await fetch(
        `${GIPHY_BASE_URL}/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=20&rating=g&lang=en`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch GIFs');
      }
      
      const data = await response.json();
      const gifs = data.data.map(gif => ({
        id: gif.id,
        url: gif.images.original.url,
        title: gif.title || gif.slug,
        preview: gif.images.preview_gif.url || gif.images.fixed_height_small.url
      }));
      
      setSearchResults(gifs);
    } catch (err) {
      setError('Không thể tải GIF. Vui lòng thử lại.');
      console.error('Error fetching GIFs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTrendingGifs = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${GIPHY_BASE_URL}/trending?api_key=${GIPHY_API_KEY}&limit=12&rating=g`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch trending GIFs');
      }
      
      const data = await response.json();
      const gifs = data.data.map(gif => ({
        id: gif.id,
        url: gif.images.original.url,
        title: gif.title || gif.slug,
        preview: gif.images.preview_gif.url || gif.images.fixed_height_small.url
      }));
      
      setTrendingGifs(gifs);
    } catch (err) {
      setError('Không thể tải GIF thịnh hành. Vui lòng thử lại.');
      console.error('Error fetching trending GIFs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGifSelect = (gif) => {
    onGifSelect(gif.url);
    if (!inline) {
      onClose();
    }
  };

  // 5. Effects
  useEffect(() => {
    if (isOpen && trendingGifs.length === 0) {
      fetchTrendingGifs();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const debounceTimer = setTimeout(() => {
        searchGifs(searchQuery);
      }, 500);

      return () => clearTimeout(debounceTimer);
    } else {
      setSearchResults([]);
      setShowTrending(true);
    }
  }, [searchQuery]);

  if (!isOpen) return null;

  if (inline) {
    return (
      <div className="space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm GIF..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-orange-200 focus:border-orange-300 focus:ring-orange-200 text-sm"
          />
        </div>

        {/* Content */}
        <div className="max-h-[400px] overflow-y-auto">
          {error ? (
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-sm text-red-500 mb-2">{error}</p>
              <Button 
                onClick={fetchTrendingGifs} 
                variant="outline" 
                size="sm"
                className="text-xs"
              >
                Thử lại
              </Button>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
              <span className="ml-2 text-sm text-gray-600">Đang tìm kiếm...</span>
            </div>
          ) : (
            <>
              {showTrending && (
                <div>
                  <h4 className="text-xs font-medium text-gray-700 mb-2">GIF thịnh hành</h4>
                  <div className="grid grid-cols-3 gap-2 overflow-x-hidden">
                    {trendingGifs.slice(0, 6).map((gif) => (
                      <button
                        key={gif.id}
                        onClick={() => handleGifSelect(gif)}
                        className="relative group overflow-hidden rounded border border-gray-200 hover:border-orange-300 transition-all duration-200 hover:scale-105"
                      >
                        <img
                          src={gif.preview || "/placeholder.svg"}
                          alt={gif.title}
                          className="w-full h-40 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {searchResults.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-gray-700 mb-2">Kết quả cho "{searchQuery}"</h4>
                  <div className="grid grid-cols-3 gap-2 overflow-x-hidden">
                    {searchResults.slice(0, 6).map((gif) => (
                      <button
                        key={gif.id}
                        onClick={() => handleGifSelect(gif)}
                        className="relative group overflow-hidden rounded border border-gray-200 hover:border-orange-300 transition-all duration-200 hover:scale-105"
                      >
                        <img
                          src={gif.preview || "/placeholder.svg"}
                          alt={gif.title}
                          className="w-full h-40 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!showTrending && searchResults.length === 0 && !isLoading && (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-500">Không tìm thấy GIF nào</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // 6. Render
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl max-h-[80vh] bg-white shadow-2xl rounded-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-yellow-50">
            <h3 className="text-lg font-semibold text-gray-900">Chọn GIF</h3>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Search Bar */}
          <div className="p-4  border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm GIF..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-200 focus:border-orange-300 focus:ring-orange-200"
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-4 overflow-y-auto max-h-96">
            {error ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-red-500 mb-4">{error}</p>
                <Button 
                  onClick={fetchTrendingGifs} 
                  variant="outline" 
                  size="sm"
                >
                  Thử lại
                </Button>
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                <span className="ml-2 text-gray-600">Đang tìm kiếm...</span>
              </div>
            ) : (
              <>
                {showTrending && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">GIF thịnh hành</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 overflow-x-hidden">
                      {trendingGifs.map((gif) => (
                        <button
                          key={gif.id}
                          onClick={() => handleGifSelect(gif)}
                          className="relative group overflow-hidden rounded-lg border border-gray-200 hover:border-orange-300 transition-all duration-200 hover:scale-105"
                        >
                          <img
                            src={gif.preview || "/placeholder.svg"}
                            alt={gif.title}
                            className="w-full h-40 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200" />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <p className="text-white text-xs font-medium truncate">{gif.title}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Kết quả tìm kiếm cho "{searchQuery}"</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 overflow-x-hidden">
                      {searchResults.map((gif) => (
                        <button
                          key={gif.id}
                          onClick={() => handleGifSelect(gif)}
                          className="relative group overflow-hidden rounded-lg border border-gray-200 hover:border-orange-300 transition-all duration-200 hover:scale-105"
                        >
                          <img
                            src={gif.preview || "/placeholder.svg"}
                            alt={gif.title}
                            className="w-full h-40 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200" />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <p className="text-white text-xs font-medium truncate">{gif.title}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {!showTrending && searchResults.length === 0 && !isLoading && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Không tìm thấy GIF nào cho "{searchQuery}"</p>
                    <p className="text-sm text-gray-400 mt-1">Thử từ khóa khác</p>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>
      </div>
    </>
  );
};

export default GifSearchModal;
