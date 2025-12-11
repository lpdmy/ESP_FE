import { ApiService } from '@/services/api.service';
import { API_CONFIG } from '@/config/api.config';

export class SearchService extends ApiService {
   // Global search across all entities
   async globalSearch(params) {
      const { query, category = 'all', pageNumber = 1, pageSize = 10 } = params;

      // Get token from localStorage
      const token = localStorage.getItem('accessToken');

      try {
         // Use GET request since backend only supports GET method
         const getResponse = await this.get(`${API_CONFIG.SEARCH.GLOBAL}?query=${encodeURIComponent(query)}&category=${category}&pageNumber=${pageNumber}&pageSize=${pageSize}`, token);

         // Check if response has data - backend returns response directly
         if (getResponse && getResponse.data && getResponse.data.results) {
            const totalResults = Object.values(getResponse.data.results).reduce((sum, arr) => sum + arr.length, 0);

            if (totalResults > 0) {
               return getResponse;
            } else {
               return this.mockGlobalSearch(params);
            }
         } else {
            return this.mockGlobalSearch(params);
         }

      } catch (error) {
         // If API fails, fallback to mock data
         return this.mockGlobalSearch(params);
      }
   }

   // Helper function to convert category string to number
   getCategoryNumber(category) {
      const categoryMap = {
         'all': 0,
         'users': 1,
         'posts': 2,
         'activities': 3,
         'clubs': 4,
         'hashtags': 5
      };
      return categoryMap[category] || 0;
   }

   // Search specific entity types
   async searchUsers(query, pageNumber = 1, pageSize = 10) {
      const token = localStorage.getItem('accessToken');
      return this.get(`${API_CONFIG.SEARCH.USERS}?query=${encodeURIComponent(query)}&pageNumber=${pageNumber}&pageSize=${pageSize}`, token);
   }

   async searchUserByEmail(email) {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      return this.get(`${API_CONFIG.SEARCH.USER_BY_EMAIL}?email=${encodeURIComponent(email)}`, token);
   }

   async searchPosts(query, pageNumber = 1, pageSize = 10) {
      const token = localStorage.getItem('accessToken');
      return this.get(`${API_CONFIG.SEARCH.POSTS}?query=${encodeURIComponent(query)}&pageNumber=${pageNumber}&pageSize=${pageSize}`, token);
   }

   async searchActivities(query, pageNumber = 1, pageSize = 10) {
      const token = localStorage.getItem('accessToken');
      return this.get(`${API_CONFIG.SEARCH.ACTIVITIES}?query=${encodeURIComponent(query)}&pageNumber=${pageNumber}&pageSize=${pageSize}`, token);
   }

   async searchClubs(query, pageNumber = 1, pageSize = 10) {
      const token = localStorage.getItem('accessToken');
      return this.get(`${API_CONFIG.SEARCH.CLUBS}?query=${encodeURIComponent(query)}&pageNumber=${pageNumber}&pageSize=${pageSize}`, token);
   }

   async searchHashtags(query, pageNumber = 1, pageSize = 10) {
      const token = localStorage.getItem('accessToken');
      return this.get(`${API_CONFIG.SEARCH.HASHTAGS}?query=${encodeURIComponent(query)}&pageNumber=${pageNumber}&pageSize=${pageSize}`, token);
   }

   // Advanced search with filters
   async advancedSearch(params) {
      const {
         query,
         category,
         filters = {},
         sortBy = 'relevance',
         sortDirection = 'desc',
         pageNumber = 1,
         pageSize = 10
      } = params;

      const queryParams = new URLSearchParams({
         query,
         category,
         sortBy,
         sortDirection,
         pageNumber: pageNumber.toString(),
         pageSize: pageSize.toString(),
         ...filters
      });

      return this.get(`/api/search/advanced?${queryParams}`);
   }

   // Get search suggestions
   async getSearchSuggestions(query) {
      return this.get(`/api/search/suggestions?query=${encodeURIComponent(query)}`);
   }

   // Get trending searches
   async getTrendingSearches() {
      return this.get('/api/search/trending');
   }

   // Search history (if user is logged in)
   async getSearchHistory(token) {
      return this.get('/api/search/history', token);
   }

   async saveSearchHistory(query, token) {
      return this.post('/api/search/history', { query }, token);
   }

   // Mock data for development - remove when backend is ready
   async mockGlobalSearch(params) {
      const { query, category } = params;

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      const allMockData = {
         users: [
            {
               id: 1,
               firstName: 'Nguyễn',
               lastName: 'Văn A',
               email: 'nguyenvana@student.com',
               role: 4,
               studentNumber: 'HS001',
               avatarUrl: null,
               className: '12A1'
            },
            {
               id: 2,
               firstName: 'Nguyễn',
               lastName: 'Thị B',
               email: 'nguyenthib@student.com',
               role: 4,
               studentNumber: 'HS002',
               avatarUrl: null,
               className: '11B2'
            },
            {
               id: 2,
               firstName: 'Trần',
               lastName: 'Thị B',
               email: 'tranthib@teacher.com',
               role: 2,
               teacherCode: 'GV001',
               avatarUrl: null,
               department: 'Toán học'
            },
            {
               id: 3,
               firstName: 'Lê',
               lastName: 'Minh C',
               email: 'leminhc@student.com',
               role: 4,
               studentNumber: 'HS002',
               avatarUrl: null,
               className: '11B2'
            }
         ],
         posts: [
            {
               id: 1,
               title: 'Chia sẻ kinh nghiệm học tập hiệu quả',
               body: 'Hôm nay mình muốn chia sẻ với các bạn một số kinh nghiệm học tập hiệu quả mà mình đã áp dụng...',
               authorName: 'Nguyễn Văn A',
               authorId: 1,
               createdAt: new Date().toISOString(),
               likesCount: 15,
               commentsCount: 8,
               hashtags: ['học_tập', 'kinh_nghiệm']
            },
            {
               id: 2,
               title: 'Cuối tuần vui vẻ cùng bạn bè',
               body: 'Hôm nay được đi chơi với bạn bè, chụp được nhiều ảnh đẹp...',
               authorName: 'Trần Thị B',
               authorId: 2,
               createdAt: new Date(Date.now() - 86400000).toISOString(),
               likesCount: 23,
               commentsCount: 12,
               hashtags: ['vui_vẻ', 'bạn_bè']
            }
         ],
         activities: [
            {
               id: 1,
               title: 'Cuộc thi lập trình FPT School 2024',
               description: 'Cuộc thi lập trình dành cho học sinh THPT FPT School toàn quốc. Giải thưởng hấp dẫn!',
               startDate: '2024-12-15',
               endDate: '2024-12-17',
               location: 'Hội trường A - FPT School',
               organizerName: 'CLB Lập trình',
               participantsCount: 45,
               maxParticipants: 100,
               thumbnailUrl: null,
               category: 'competition'
            },
            {
               id: 2,
               title: 'Workshop AI và Machine Learning',
               description: 'Buổi workshop giới thiệu về AI và Machine Learning cho học sinh',
               startDate: '2024-11-20',
               endDate: '2024-11-20',
               location: 'Phòng Lab 1',
               organizerName: 'Thầy Nguyễn Văn X',
               participantsCount: 25,
               maxParticipants: 30,
               thumbnailUrl: null,
               category: 'workshop'
            }
         ],
         clubs: [
            {
               id: 1,
               name: 'CLB Lập trình FPT',
               description: 'Câu lạc bộ dành cho những ai yêu thích lập trình và công nghệ',
               membersCount: 120,
               avatarUrl: null,
               category: 'technology',
               isActive: true
            },
            {
               id: 2,
               name: 'CLB Nhiếp ảnh',
               description: 'Câu lạc bộ nhiếp ảnh - nơi chia sẻ đam mê chụp ảnh',
               membersCount: 85,
               avatarUrl: null,
               category: 'arts',
               isActive: true
            }
         ],
         hashtags: [
            {
               id: 1,
               name: 'lập_trình',
               postsCount: 25,
               trending: true,
               description: 'Thảo luận về lập trình'
            },
            {
               id: 2,
               name: 'học_tập',
               postsCount: 150,
               trending: false,
               description: 'Chia sẻ kinh nghiệm học tập'
            },
            {
               id: 3,
               name: 'thể_thao',
               postsCount: 80,
               trending: true,
               description: 'Hoạt động thể thao'
            }
         ]
      };

      // Filter results based on search query and category
      const filteredResults = {};

      Object.keys(allMockData).forEach(key => {
         if (category === 'all' || category === key) {
            filteredResults[key] = allMockData[key].filter(item => {
               const searchText = JSON.stringify(item).toLowerCase();
               return searchText.includes(query.toLowerCase());
            });
         }
      });

      return {
         success: true,
         data: {
            results: filteredResults,
            metadata: {
               query,
               category,
               totalResults: Object.values(filteredResults).reduce((sum, arr) => sum + arr.length, 0),
               searchTime: '0.3s'
            }
         }
      };
   }
}

export const searchService = new SearchService();
