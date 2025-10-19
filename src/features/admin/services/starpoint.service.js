import { ApiService } from '@/services/api.service';
import { API_CONFIG } from '@/config/api.config';

export class StarPointService extends ApiService {
  // ================= RULES =================
  async getAllRules(token) {
    return this.get(API_CONFIG.STAR_POINT.GET_RULES, token);
  }

  async updatePoints(actionType, points, token) {
    return this.put(
      API_CONFIG.STAR_POINT.UPDATE_REWARD_RULE.replace('{actionType}', String(actionType)),
      { points },
      token
    );
  }

  // ================= REWARDS =================
  async getAllRewards(token) {
    return this.get(API_CONFIG.STAR_POINT.GET_ALL_REWARDS, token);
  }

  async getRewardById(id, token) {
    return this.get(
      API_CONFIG.STAR_POINT.GET_REWARD_BY_ID.replace('{id}', id),
      token
    );
  }

  async createReward(reward, token) {
    return this.post(API_CONFIG.STAR_POINT.CREATE_REWARD, reward, token);
  }

  async updateReward(id, reward, token) {
    return this.put(
      API_CONFIG.STAR_POINT.UPDATE_REWARD.replace('{id}', id),
      reward,
      token
    );
  }

  async deleteReward(id, token) {
    return this.delete(
      API_CONFIG.STAR_POINT.DELETE_REWARD.replace('{id}', id),
      token
    );
  }

  async redeemReward(rewardId, token) {
    return this.post(API_CONFIG.STAR_POINT.REDEEM_REWARD, { rewardId }, token);
  }

  async getPointHistory(token) {
    return this.get(API_CONFIG.STAR_POINT.GET_POINT_HISTORY, token);
  }

  async getUserPoints(id, token) {
    return this.get(API_CONFIG.STAR_POINT.GET_USER_POINTS + `?userId=${id}`, token);
  }

  async getAllRedemptionsAdmin(queryParams, token) {
    const queryString = Object.entries(queryParams)
      .filter(([key, value]) => value !== undefined && value !== null) 
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
    return this.get(`${API_CONFIG.STAR_POINT.GET_ALL_REDEMPTIONS_ADMIN}?${queryString}`, token, { params: queryParams });
  }

  async getMyRedemptions(queryParams, token) {
    const queryString = Object.entries(queryParams)
      .filter(([key, value]) => value !== undefined && value !== null) 
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
    return this.get(`${API_CONFIG.STAR_POINT.GET_MY_REDEMPTIONS}?${queryString}`, token);
  }

  async pickupRedemption(id, token) {
    return this.post(API_CONFIG.STAR_POINT.PICKUP_REDEMPTION.replace('{id}', id), null, token);
  }
}

export const starPointService = new StarPointService();
