import { ApiService } from '@/services/api.service';
import { API_CONFIG } from '@/config/api.config';

class ActivityMatchService extends ApiService {
   async getBracket({ activityId, sportId, grade } = {}, token) {
      if (!activityId || !sportId) {
         throw new Error('activityId và sportId là bắt buộc để lấy bracket');
      }

      const params = new URLSearchParams({
         activityId,
         sportId,
      });

      if (grade !== undefined && grade !== null) {
         params.append('grade', grade);
      }

      const endpoint = `${API_CONFIG.ACTIVITY_MATCH.BRACKET}?${params.toString()}`;
      return this.get(endpoint, token);
   }

   async getMatchById(matchId, token) {
      if (!matchId) {
         throw new Error('matchId là bắt buộc');
      }
      return this.get(API_CONFIG.ACTIVITY_MATCH.MATCH_DETAIL.replace('{id}', matchId), token);
   }

   async getMatchesByRound({ activityId, sportId, round, grade } = {}, token) {
      if (!activityId || !sportId || !round) {
         throw new Error('activityId, sportId và round là bắt buộc');
      }

      const params = new URLSearchParams({
         activityId,
         sportId,
      });

      if (grade !== undefined && grade !== null) {
         params.append('grade', grade);
      }

      const endpoint = `${API_CONFIG.ACTIVITY_MATCH.BY_ROUND.replace('{round}', round)}?${params.toString()}`;
      return this.get(endpoint, token);
   }

   async updateMatchResult(matchId, data, token) {
      if (!matchId) {
         throw new Error('matchId là bắt buộc');
      }
      const endpoint = API_CONFIG.ACTIVITY_MATCH.UPDATE_RESULT.replace('{id}', matchId);
      return this.put(endpoint, data, token);
   }

   async updateMatch(matchId, data, token) {
      if (!matchId) {
         throw new Error('matchId là bắt buộc');
      }
      const endpoint = API_CONFIG.ACTIVITY_MATCH.UPDATE_MATCH.replace('{id}', matchId);
      return this.put(endpoint, data, token);
   }

   async createMatch(payload, token) {
      if (!payload?.activityId || !payload?.sportId) {
         throw new Error('activityId và sportId là bắt buộc');
      }
      return this.post(API_CONFIG.ACTIVITY_MATCH.CREATE, payload, token);
   }

   async deleteBracket({ activityId, sportId, grade } = {}, token) {
      if (!activityId || !sportId) {
         throw new Error('activityId và sportId là bắt buộc');
      }

      const params = new URLSearchParams({
         activityId,
         sportId,
      });

      if (grade !== undefined && grade !== null) {
         params.append('grade', grade);
      }

      const endpoint = `${API_CONFIG.ACTIVITY_MATCH.DELETE_BRACKET}?${params.toString()}`;
      return this.delete(endpoint, token);
   }
}

export const activityMatchService = new ActivityMatchService();

