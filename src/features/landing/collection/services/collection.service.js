import { ApiService } from "@/services/api.service";
import { API_CONFIG } from "@/config/api.config";

export class CollectionService extends ApiService {
  async getCollectionByUser(token, pageNumber = 1, pageSize = 10) {
    const url = `${API_CONFIG.COLLECTION.USER_COLLECTION}?PageNumber=${pageNumber}&PageSize=${pageSize}`;
    return this.get(url, token);
  }
  async createCollection(token,payload){
    return this.post(API_CONFIG.COLLECTION.CREATE_COLLECTION, payload, token);
  }
  async deleteCollection(token,id){
    const url = `${API_CONFIG.COLLECTION.DELETE_COLLECTION}?id=${id}`;
    return this.delete(url, token);
  }
  async updateCollection(token,payload){
    return this.put(API_CONFIG.COLLECTION.UPDATE_COLLECTION, payload, token);
  }

}
