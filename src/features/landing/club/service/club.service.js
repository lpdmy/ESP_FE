import { ApiService } from "@/services/api.service";
import { API_CONFIG } from "@/config/api.config";
export class ClubService extends ApiService {
  async createClubCreation(token, payload) {
    return this.post(API_CONFIG.CLUB.CREATE_CLUB, payload, token);
  }
  async updateClub(token, payload) {
    return this.put(API_CONFIG.CLUB.UPDATE_CLUB, payload, token);
  }
  async getListClub(token, pageNumber = 1, pageSize = 10, search = "") {
    let url = `${API_CONFIG.CLUB.LIST_CLUB}?PageNumber=${pageNumber}&PageSize=${pageSize}`;
    if (search && search.trim() !== "") {
      url += `&search=${encodeURIComponent(search.trim())}`;
    }
    return this.get(url, token);
  }
  async getClubCategory(token) {
    let url = `${API_CONFIG.CLUB.CLUB_CATEGORY}`;
    return this.get(url, token);
  }
  async getClubDetail(token, id) {
    const url = API_CONFIG.CLUB.CLUB_DETAIL.replace("{id}", id);
    return this.get(url, token);
  }
  async getClubJoinRequest(token,id, pageNumber = 1, pageSize = 10, search = "") {
    let url = `${API_CONFIG.CLUB.CLUB_JOIN_REQUEST}/${id}?PageNumber=${pageNumber}&PageSize=${pageSize}`;
    if (search && search.trim() !== "") {
      url += `&search=${encodeURIComponent(search.trim())}`;
    }
    return this.get(url, token);
  }
  async createClubJoinRequest(token, payload) {
    return this.post(API_CONFIG.CLUB.CLUB_CREATE_JOIN_REQUES, payload, token);
  }
  async approveJoinRequest(token, id) {
    const url = API_CONFIG.CLUB.CLUB_APPROVE_JOIN_REQUEST.replace("{id}", id);
    return this.put(url, token);
  }
  async cancelJoinRequest(token, id) {
    const url = API_CONFIG.CLUB.CLUB_CANCEL_JOIN_REQUES.replace("{id}", id);
    return this.delete(url, token);
  }  
  async rejectJoinRequest(token, id) {
    const url = API_CONFIG.CLUB.CLUB_REJECT_JOIN_REQUEST.replace("{id}", id);
    return this.put(url, token);
  } 
  async getClubByUser(token) {
    const url = API_CONFIG.CLUB.USER_CLUB;
    return this.get(url, token);
  } 
  async getPostPending(token,id, pageNumber = 1, pageSize = 10, search = "") {
    let url = `${API_CONFIG.POST.CLUB_PENDING_POST}/${id}?PageNumber=${pageNumber}&PageSize=${pageSize}`;
    if (search && search.trim() !== "") {
      url += `&search=${encodeURIComponent(search.trim())}`;
    }
    return this.get(url, token);
  }
  async approvePost(token, id) {
    const url = API_CONFIG.POST.APPROVE_POST.replace("{id}", id);
    return this.put(url, token);
  }  
  async getClubPost(token, id) {
    const url = `${API_CONFIG.POST.CLUB_POST}/${id}`;
    return this.get(url, token);
  } 
  async leaveClub(token, id) {
   const url = API_CONFIG.CLUB.LEAVE_CLUB.replace("{id}", id);
    return this.delete(url, token);
  } 
}
