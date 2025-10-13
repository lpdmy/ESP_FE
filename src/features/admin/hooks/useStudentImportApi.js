import { useState } from 'react';
import { studentImportService } from '../services/student-import.service';
import { executeApiCall } from '@/common/utils/executeApiCall';
import { useToast } from '@/common/hooks/useToast';
import { STUDENT_IMPORT_MESSAGES } from '@/common/constants/messages';

export const useStudentImportApi = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importResult, setImportResult] = useState(null);
  const [validationResult, setValidationResult] = useState(null);

  const toast = useToast();

  const importStudents = async (importData) => {
    const token = localStorage.getItem('token');
    
    return executeApiCall(
      studentImportService.importStudentsWithProgress.bind(studentImportService),
      [importData, token, (progressValue, message) => {
        setProgress(progressValue);
      }],
      { 
        setLoading: setIsImporting
        // Không set setError để tránh double toast
      }
    );
  };

  const validateStudents = async (validationData) => {
    const token = localStorage.getItem('token');
    
    return executeApiCall(
      studentImportService.validateStudents.bind(studentImportService),
      [validationData, token],
      { 
        setLoading: setIsValidating,
        setError: (error) => {
          toast.showError(error?.message || STUDENT_IMPORT_MESSAGES.ERROR.VALIDATION_FAILED);
        }
      }
    );
  };

  const downloadTemplate = async () => {
    const token = localStorage.getItem('token');
    
    try {
      setIsDownloading(true);
      const blob = await studentImportService.downloadTemplate(token);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'student-import-template.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.showSuccess(STUDENT_IMPORT_MESSAGES.SUCCESS.TEMPLATE_DOWNLOADED);
    } catch (error) {
      toast.showError(error?.message || STUDENT_IMPORT_MESSAGES.ERROR.TEMPLATE_DOWNLOAD_FAILED);
    } finally {
      setIsDownloading(false);
    }
  };

  const resetProgress = () => {
    setProgress(0);
    setImportResult(null);
    setValidationResult(null);
  };

  return {
    // State
    isImporting,
    isValidating,
    isDownloading,
    progress,
    importResult,
    validationResult,
    
    // Actions
    importStudents,
    validateStudents,
    downloadTemplate,
    resetProgress,
    
    // Setters
    setImportResult,
    setValidationResult
  };
};
