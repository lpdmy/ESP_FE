import { ApiService } from '@/services/api.service';
import { API_CONFIG } from '@/config/api.config';

const api = new ApiService();

function fillPath(template, params) {
  let path = template;
  Object.entries(params || {}).forEach(([key, value]) => {
    path = path.replace(`{${key}}`, encodeURIComponent(value));
  });
  return path;
}

export const ClassGroupService = {
  async list({ pageNumber = 1, pageSize = 50 } = {}, token) {
    const qs = new URLSearchParams({ pageNumber, pageSize }).toString();
    return api.get(`${API_CONFIG.CLASS_GROUP.LIST}?${qs}`, token);
  },

  async dashboard(token) {
    return api.get(API_CONFIG.CLASS_GROUP.DASHBOARD, token);
  },

  async filter(filterDto, token) {
    return api.post(API_CONFIG.CLASS_GROUP.FILTER, filterDto, token);
  },
  
  async search({ nameOrCombined, academicYear }, token) {
    // parse combined like "10A1": grade=10, name="A1"
    const normalized = (nameOrCombined || '').trim();
    let name = normalized;
    let grade = undefined;
    const m = normalized.match(/^\d{1,2}/);
    if (m) {
      grade = parseInt(m[0], 10);
      name = normalized.slice(m[0].length).trim();
    }
    const startYear = academicYear ? parseInt(String(academicYear).slice(0,4), 10) : undefined;
    const payload = {
      name: name || undefined,
      grade: grade || undefined,
      startYear: startYear || undefined,
      isDeleted: false,
    };
    return api.post(API_CONFIG.CLASS_GROUP.FILTER, payload, token);
  },

  async getById(id, token) {
    return api.get(fillPath(API_CONFIG.CLASS_GROUP.GET_BY_ID, { id }), token);
  },

  async create(payload, token) {
    // payload should match CreateClassGroupDto: { name?, description?, grade?, startYear? }
    return api.post(API_CONFIG.CLASS_GROUP.CREATE, payload, token);
  },

  async update(id, payload, token) {
    // payload should match UpdateClassGroupDto: { id, name?, description?, grade?, startYear? }
    return api.put(fillPath(API_CONFIG.CLASS_GROUP.UPDATE, { id }), payload, token);
  },

  async remove(id, token) {
    return api.delete(fillPath(API_CONFIG.CLASS_GROUP.DELETE, { id }), token);
  },

  async checkNameExists(name, excludeId, token) {
    const qs = new URLSearchParams({ name, ...(excludeId ? { excludeId } : {}) }).toString();
    return api.get(`${API_CONFIG.CLASS_GROUP.CHECK_NAME_EXISTS}?${qs}`, token);
  },
};


