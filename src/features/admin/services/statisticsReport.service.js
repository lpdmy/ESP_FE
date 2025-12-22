import { API_CONFIG, getAuthHeaders, handleApiResponse } from "@/config/api.config";

const BASE_URL = API_CONFIG.BASE_URL;

export const statisticsReportService = {
  async getAcademicYearReport(token, request) {
    const response = await fetch(
      `${BASE_URL}/statistics/report/academic-year-report`,
      {
        method: "POST",
        headers: getAuthHeaders(token),
        body: JSON.stringify(request),
      }
    );
    return handleApiResponse(response);
  },

  async exportAcademicYearReport(token, request, format = "pdf") {
    const response = await fetch(
      `${BASE_URL}/statistics/report/academic-year-report/export?format=${format}`,
      {
        method: "POST",
        headers: getAuthHeaders(token),
        body: JSON.stringify(request),
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw errorData;
    }
    
    const blob = await response.blob();
    
    // Get filename from Content-Disposition header or use default
    const contentDisposition = response.headers.get("Content-Disposition");
    let filename = `bao-cao-thong-ke-${request.academicYear}`;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    } else {
      // Fallback: use correct extension based on format
      const extension = format.toLowerCase() === "excel" ? "xlsx" : "pdf";
      filename = `${filename}.${extension}`;
    }
    
    return { blob, filename };
  },
};

