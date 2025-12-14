import { ApiService } from '@/services/api.service';
import { API_CONFIG } from '@/config/api.config';

export class StaffService extends ApiService{
    async getAllStaff(token,PageNumber,PageSize,search){
    let url = `${API_CONFIG.STAFF.LINK}?PageNumber=${PageNumber}&PageSize=${PageSize}`;
    if (search && search.trim() !== "") {
      url += `&search=${encodeURIComponent(search.trim())}`;
    }
    return this.get(url, token);
    }
    async getStaffById(token,id){
        let url = `${API_CONFIG.STAFF.LINK}/${id}`
        return this.get(url,token)
    }
    async createStaff(token,payload){
        return this.post(API_CONFIG.STAFF.CREATE,payload,token)
    }
    async updateStaff(token,payload){
        return this.put(API_CONFIG.STAFF.LINK,payload,token)
    }
    async deleteStaff(token,id){
        let url = `${API_CONFIG.STAFF.LINK}/${id}`
        return this.delete(url,token)
    }
    async recoveryStaff(token,id){
        let url = `${API_CONFIG.STAFF.LINK}/${id}`
        return this.put(url, null, token)
    }
}