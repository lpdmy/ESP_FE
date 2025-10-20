import { useState } from 'react';
import { searchService } from '@/common/services/search.service';

export const useSearchApi = () => {
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);
   const [searchHistory, setSearchHistory] = useState([]);

   const globalSearch = async (params) => {
      setLoading(true);
      setError(null);

      try {
         const response = await searchService.globalSearch(params);

         // Add to search history if successful
         if (response.success && params.query) {
            addToSearchHistory(params.query);
         }

         return response;
      } catch (err) {
         setError(err);
         console.error('Search error:', err);

         // If 401 unauthorized, user might not be logged in
         if (err.status === 401) {
            console.warn('User not authenticated - redirecting to login or using mock data');
            // Could redirect to login or show mock data
         }

         throw err;
      } finally {
         setLoading(false);
      }
   };

   const searchUsers = async (query, pageNumber = 1, pageSize = 10) => {
      setLoading(true);
      setError(null);

      try {
         const response = await searchService.searchUsers(query, pageNumber, pageSize);
         return response;
      } catch (err) {
         setError(err);
         toast.error('Không thể tìm kiếm người dùng');
         throw err;
      } finally {
         setLoading(false);
      }
   };

   const searchPosts = async (query, pageNumber = 1, pageSize = 10) => {
      setLoading(true);
      setError(null);

      try {
         const response = await searchService.searchPosts(query, pageNumber, pageSize);
         return response;
      } catch (err) {
         setError(err);
         toast.error('Không thể tìm kiếm bài viết');
         throw err;
      } finally {
         setLoading(false);
      }
   };

   const advancedSearch = async (params) => {
      setLoading(true);
      setError(null);

      try {
         const response = await searchService.advancedSearch(params);
         return response;
      } catch (err) {
         setError(err);
         toast.error('Không thể thực hiện tìm kiếm nâng cao');
         throw err;
      } finally {
         setLoading(false);
      }
   };

   const getSearchSuggestions = async (query) => {
      try {
         const response = await searchService.getSearchSuggestions(query);
         return response;
      } catch (err) {
         console.error('Error getting search suggestions:', err);
         return { data: [] };
      }
   };

   const getTrendingSearches = async () => {
      try {
         const response = await searchService.getTrendingSearches();
         return response;
      } catch (err) {
         console.error('Error getting trending searches:', err);
         return { data: [] };
      }
   };

   // Search history management (local storage)
   const addToSearchHistory = (query) => {
      const history = getSearchHistoryFromStorage();
      const newHistory = [
         { query, timestamp: new Date().toISOString() },
         ...history.filter(item => item.query !== query).slice(0, 9) // Keep last 10, remove duplicates
      ];

      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      setSearchHistory(newHistory);
   };

   const getSearchHistoryFromStorage = () => {
      try {
         const stored = localStorage.getItem('searchHistory');
         return stored ? JSON.parse(stored) : [];
      } catch {
         return [];
      }
   };

   const clearSearchHistory = () => {
      localStorage.removeItem('searchHistory');
      setSearchHistory([]);
   };

   const removeFromSearchHistory = (query) => {
      const history = getSearchHistoryFromStorage();
      const newHistory = history.filter(item => item.query !== query);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      setSearchHistory(newHistory);
   };

   // Initialize search history from storage
   useState(() => {
      setSearchHistory(getSearchHistoryFromStorage());
   }, []);

   return {
      // Main search functions
      globalSearch,
      searchUsers,
      searchPosts,
      advancedSearch,

      // Suggestions and trending
      getSearchSuggestions,
      getTrendingSearches,

      // Search history
      searchHistory,
      addToSearchHistory,
      clearSearchHistory,
      removeFromSearchHistory,

      // State
      loading,
      error
   };
};

export default useSearchApi;
