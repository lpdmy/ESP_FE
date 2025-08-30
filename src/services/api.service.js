import { API_CONFIG, getAuthHeaders, handleApiResponse } from '../config/api.config';

export class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  async get(endpoint, token = null) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: getAuthHeaders(token)
    });
    return handleApiResponse(response);
  }

  async post(endpoint, data, token = null) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data)
    });
    return handleApiResponse(response);
  }

  async put(endpoint, data, token = null) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data)
    });
    return handleApiResponse(response);
  }

  async delete(endpoint, token = null) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token)
    });
    return handleApiResponse(response);
  }

  async uploadFile(endpoint, file, token = null) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: formData
    });
    return handleApiResponse(response);
  }
}
