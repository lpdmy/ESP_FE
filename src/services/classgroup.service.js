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

  async dashboard(token, academicYearId = null) {
    const qs = academicYearId ? `?academicYearId=${academicYearId}` : '';
    return api.get(`${API_CONFIG.CLASS_GROUP.DASHBOARD}${qs}`, token);
  },

  async filter(filterDto, token) {
    return api.post(API_CONFIG.CLASS_GROUP.FILTER, filterDto, token);
  },
  
  async search({ nameOrCombined, academicYearId }, token) {
    // parse combined like "10A1": grade=10, name="A1"
    const normalized = (nameOrCombined || '').trim();
    let name = normalized;
    let grade = undefined;
    const m = normalized.match(/^\d{1,2}/);
    if (m) {
      grade = parseInt(m[0], 10);
      name = normalized.slice(m[0].length).trim();
    }
    const payload = {
      name: name || undefined,
      grade: grade || undefined,
      academicYearId: academicYearId || undefined,
      isDeleted: false,
    };
    return api.post(API_CONFIG.CLASS_GROUP.FILTER, payload, token);
  },

  async getById(id, token) {
    return api.get(fillPath(API_CONFIG.CLASS_GROUP.GET_BY_ID, { id }), token);
  },

  async create(payload, token) {
    // payload should match CreateClassGroupDto: { name?, description?, grade?, academicYearId? }
    return api.post(API_CONFIG.CLASS_GROUP.CREATE, payload, token);
  },

  async update(id, payload, token) {
    // payload should match UpdateClassGroupDto: { id, name?, description?, grade?, academicYearId? }
    return api.put(fillPath(API_CONFIG.CLASS_GROUP.UPDATE, { id }), payload, token);
  },

  async remove(id, token) {
    return api.delete(fillPath(API_CONFIG.CLASS_GROUP.DELETE, { id }), token);
  },

  async checkNameExists(name, excludeId, token) {
    const qs = new URLSearchParams({ name, ...(excludeId ? { excludeId } : {}) }).toString();
    return api.get(`${API_CONFIG.CLASS_GROUP.CHECK_NAME_EXISTS}?${qs}`, token);
  },

  // New methods for class detail and student management
  async getDetail(id, token) {
    return api.get(fillPath(API_CONFIG.CLASS_GROUP.GET_DETAIL, { id }), token);
  },

  async getStudents(id, token) {
    return api.get(fillPath(API_CONFIG.CLASS_GROUP.GET_STUDENTS, { id }), token);
  },

  async addStudent(id, email, token) {
    return api.post(fillPath(API_CONFIG.CLASS_GROUP.ADD_STUDENT, { id }), { email }, token);
  },

  async removeStudent(id, studentId, token) {
    return api.delete(fillPath(API_CONFIG.CLASS_GROUP.REMOVE_STUDENT, { id, studentId }), token);
  },

  async getAcademicYears(token) {
    return api.get(API_CONFIG.CLASS_GROUP.GET_ACADEMIC_YEARS, token);
  },

  // Homeroom Teacher management methods
  async assignHomeroomTeacher(id, email, token) {
    return api.put(fillPath(API_CONFIG.CLASS_GROUP.ASSIGN_HOMEROOM_TEACHER, { id }), { email }, token);
  },

  async removeHomeroomTeacher(id, token) {
    return api.delete(fillPath(API_CONFIG.CLASS_GROUP.REMOVE_HOMEROOM_TEACHER, { id }), token);
  },

  async getHomeroomTeacher(id, token) {
    return api.get(fillPath(API_CONFIG.CLASS_GROUP.GET_HOMEROOM_TEACHER, { id }), token);
  },
};


