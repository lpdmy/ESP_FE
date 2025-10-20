import { ApiService } from "@/services/api.service";
import { API_CONFIG } from "@/config/api.config";
export class CommentService extends ApiService {
async createComment(payload, token) {
    return this.post(API_CONFIG.COMMENT.CREATE_COMMENT, payload, token);
  }
async getCommentByPost(token,id, pageNumber = 1, pageSize = 10, search = "") {
    let url = `${API_CONFIG.COMMENT.GET_BY_POST}/${id}?PageNumber=${pageNumber}&PageSize=${pageSize}`;
    if (search && search.trim() !== "") {
      url += `&search=${encodeURIComponent(search.trim())}`;
    }
    return this.get(url, token);
  }
  async getCommentByComment(token,id, pageNumber = 1, pageSize = 10, search = "") {
    let url = `${API_CONFIG.COMMENT.GET_BY_COMMENT}/${id}?PageNumber=${pageNumber}&PageSize=${pageSize}`;
    if (search && search.trim() !== "") {
      url += `&search=${encodeURIComponent(search.trim())}`;
    }
    return this.get(url, token);
  }
  async updateComment(payload, token) {
    return this.put(API_CONFIG.COMMENT.CREATE_COMMENT, payload, token);
  }
  async deleteComment(id, token) {
    const url = API_CONFIG.COMMENT.DELETE_COMMENT.replace("{id}", id);
    return this.delete(url, token);
  }
}