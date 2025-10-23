import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { systemAnnouncementService } from '../../services/systemAnnouncementService';

// Async Thunks
export const fetchAllAnnouncements = createAsyncThunk(
   'systemAnnouncements/fetchAll',
   async (paginationParams, { rejectWithValue }) => {
      try {
         const response = await systemAnnouncementService.getAllAnnouncements(paginationParams);
         return response.data;
      } catch (error) {
         return rejectWithValue(error.message);
      }
   }
);

export const fetchAnnouncementById = createAsyncThunk(
   'systemAnnouncements/fetchById',
   async (id, { rejectWithValue }) => {
      try {
         const response = await systemAnnouncementService.getAnnouncementById(id);
         return response.data;
      } catch (error) {
         return rejectWithValue(error.message);
      }
   }
);

export const createAnnouncement = createAsyncThunk(
   'systemAnnouncements/create',
   async (formData, { rejectWithValue }) => {
      try {
         const response = await systemAnnouncementService.createAnnouncement(formData);
         return response.data;
      } catch (error) {
         return rejectWithValue(error.message);
      }
   }
);

export const updateAnnouncement = createAsyncThunk(
   'systemAnnouncements/update',
   async ({ id, formData }, { rejectWithValue }) => {
      try {
         const response = await systemAnnouncementService.updateAnnouncement(formData);
         return response.data;
      } catch (error) {
         return rejectWithValue(error.message);
      }
   }
);

export const deleteAnnouncement = createAsyncThunk(
   'systemAnnouncements/delete',
   async (id, { rejectWithValue }) => {
      try {
         await systemAnnouncementService.deleteAnnouncement(id);
         return id;
      } catch (error) {
         return rejectWithValue(error.message);
      }
   }
);

export const toggleAnnouncementVisibility = createAsyncThunk(
   'systemAnnouncements/toggleVisibility',
   async (id, { rejectWithValue }) => {
      try {
         const response = await systemAnnouncementService.toggleVisibility(id);
         return { id, isVisible: response.data };
      } catch (error) {
         return rejectWithValue(error.message);
      }
   }
);

export const fetchPublicAnnouncements = createAsyncThunk(
   'systemAnnouncements/fetchPublic',
   async (_, { rejectWithValue }) => {
      try {
         const response = await systemAnnouncementService.getPublicAnnouncements();
         return response.data;
      } catch (error) {
         return rejectWithValue(error.message);
      }
   }
);

export const markAnnouncementAsViewed = createAsyncThunk(
   'systemAnnouncements/markAsViewed',
   async (id, { rejectWithValue }) => {
      try {
         await systemAnnouncementService.markAsViewed(id);
         return id;
      } catch (error) {
         return rejectWithValue(error.message);
      }
   }
);

// Initial State
const initialState = {
   announcements: [],
   currentAnnouncement: null,
   publicAnnouncements: [],
   pagination: {
      pageNumber: 1,
      pageSize: 10,
      totalCount: 0,
      totalPages: 0
   },
   loading: false,
   error: null,
   viewedAnnouncements: JSON.parse(localStorage.getItem('viewedAnnouncements') || '[]')
};

// Slice
const systemAnnouncementsSlice = createSlice({
   name: 'systemAnnouncements',
   initialState,
   reducers: {
      clearError: (state) => {
         state.error = null;
      },
      clearCurrentAnnouncement: (state) => {
         state.currentAnnouncement = null;
      },
      setPagination: (state, action) => {
         state.pagination = { ...state.pagination, ...action.payload };
      },
      markAsViewedLocally: (state, action) => {
         const announcementId = action.payload;
         if (!state.viewedAnnouncements.includes(announcementId)) {
            state.viewedAnnouncements.push(announcementId);
            localStorage.setItem('viewedAnnouncements', JSON.stringify(state.viewedAnnouncements));
         }
      }
   },
   extraReducers: (builder) => {
      builder
         // Fetch All Announcements
         .addCase(fetchAllAnnouncements.pending, (state) => {
            state.loading = true;
            state.error = null;
         })
         .addCase(fetchAllAnnouncements.fulfilled, (state, action) => {
            state.loading = false;
            state.announcements = action.payload.data;
            state.pagination = {
               pageNumber: action.payload.pageNumber,
               pageSize: action.payload.pageSize,
               totalCount: action.payload.totalCount,
               totalPages: Math.ceil(action.payload.totalCount / action.payload.pageSize)
            };
         })
         .addCase(fetchAllAnnouncements.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
         })

         // Fetch Announcement by ID
         .addCase(fetchAnnouncementById.pending, (state) => {
            state.loading = true;
            state.error = null;
         })
         .addCase(fetchAnnouncementById.fulfilled, (state, action) => {
            state.loading = false;
            state.currentAnnouncement = action.payload;
         })
         .addCase(fetchAnnouncementById.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
         })

         // Create Announcement
         .addCase(createAnnouncement.pending, (state) => {
            state.loading = true;
            state.error = null;
         })
         .addCase(createAnnouncement.fulfilled, (state, action) => {
            state.loading = false;
            state.announcements.unshift(action.payload);
         })
         .addCase(createAnnouncement.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
         })

         // Update Announcement
         .addCase(updateAnnouncement.pending, (state) => {
            state.loading = true;
            state.error = null;
         })
         .addCase(updateAnnouncement.fulfilled, (state, action) => {
            state.loading = false;
            const index = state.announcements.findIndex(a => a.id === action.payload.id);
            if (index !== -1) {
               state.announcements[index] = action.payload;
            }
            if (state.currentAnnouncement?.id === action.payload.id) {
               state.currentAnnouncement = action.payload;
            }
         })
         .addCase(updateAnnouncement.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
         })

         // Delete Announcement
         .addCase(deleteAnnouncement.pending, (state) => {
            state.loading = true;
            state.error = null;
         })
         .addCase(deleteAnnouncement.fulfilled, (state, action) => {
            state.loading = false;
            state.announcements = state.announcements.filter(a => a.id !== action.payload);
            if (state.currentAnnouncement?.id === action.payload) {
               state.currentAnnouncement = null;
            }
         })
         .addCase(deleteAnnouncement.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
         })

         // Toggle Visibility
         .addCase(toggleAnnouncementVisibility.pending, (state) => {
            state.loading = true;
            state.error = null;
         })
         .addCase(toggleAnnouncementVisibility.fulfilled, (state, action) => {
            state.loading = false;
            const index = state.announcements.findIndex(a => a.id === action.payload.id);
            if (index !== -1) {
               state.announcements[index].isVisible = action.payload.isVisible;
            }
            if (state.currentAnnouncement?.id === action.payload.id) {
               state.currentAnnouncement.isVisible = action.payload.isVisible;
            }
         })
         .addCase(toggleAnnouncementVisibility.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
         })

         // Fetch Public Announcements
         .addCase(fetchPublicAnnouncements.pending, (state) => {
            state.loading = true;
            state.error = null;
         })
         .addCase(fetchPublicAnnouncements.fulfilled, (state, action) => {
            state.loading = false;
            state.publicAnnouncements = action.payload;
         })
         .addCase(fetchPublicAnnouncements.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
         })

         // Mark as Viewed
         .addCase(markAnnouncementAsViewed.pending, (state) => {
            state.loading = true;
            state.error = null;
         })
         .addCase(markAnnouncementAsViewed.fulfilled, (state, action) => {
            state.loading = false;
            if (!state.viewedAnnouncements.includes(action.payload)) {
               state.viewedAnnouncements.push(action.payload);
               localStorage.setItem('viewedAnnouncements', JSON.stringify(state.viewedAnnouncements));
            }
         })
         .addCase(markAnnouncementAsViewed.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
         });
   }
});

export const {
   clearError,
   clearCurrentAnnouncement,
   setPagination,
   markAsViewedLocally
} = systemAnnouncementsSlice.actions;

export default systemAnnouncementsSlice.reducer;
