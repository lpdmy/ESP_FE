import { ApiService } from "@/services/api.service";
import { API_CONFIG } from "@/config/api.config";
export class ClubService extends ApiService {
async createClubCreation(token,payload){
    return this.post(API_CONFIG.CLUB.CREATE_CLUB, payload, token);
  }
}