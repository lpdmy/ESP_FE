import { ApiService } from "@/services/api.service";
import { API_CONFIG } from "@/config/api.config";

class ActivityMatchService extends ApiService {
  async getBracket(activityId, sportId, grade = null, token) {
    const params = new URLSearchParams();
    params.append("activityId", activityId);
    params.append("sportId", sportId);
    if (grade !== null && grade !== undefined) {
      params.append("grade", grade);
    }

    const endpoint = `${API_CONFIG.ACTIVITY_MATCH.GET_BRACKET}?${params.toString()}`;
    return this.get(endpoint, token);
  }

  async updateMatchResult(matchId, payload, token) {
    const endpoint = API_CONFIG.ACTIVITY_MATCH.UPDATE_MATCH_RESULT.replace("{id}", matchId);
    return this.put(endpoint, payload, token);
  }
}

export const activityMatchService = new ActivityMatchService();

