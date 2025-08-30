import { useState, useCallback } from 'react';
import { courseService } from '../services/course.service';

export const useCourseApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const executeApiCall = useCallback(async (apiCall, ...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiCall(...args);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAllCourses = useCallback(async (token) => {
    return executeApiCall(courseService.getAllCourses.bind(courseService), token);
  }, [executeApiCall]);

  const getCourseById = useCallback(async (id, token) => {
    return executeApiCall(courseService.getCourseById.bind(courseService), id, token);
  }, [executeApiCall]);

  const createCourse = useCallback(async (courseData, token) => {
    return executeApiCall(courseService.createCourse.bind(courseService), courseData, token);
  }, [executeApiCall]);

  const updateCourse = useCallback(async (id, courseData, token) => {
    return executeApiCall(courseService.updateCourse.bind(courseService), id, courseData, token);
  }, [executeApiCall]);

  const deleteCourse = useCallback(async (id, token) => {
    return executeApiCall(courseService.deleteCourse.bind(courseService), id, token);
  }, [executeApiCall]);

  return {
    loading,
    error,
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    clearError: () => setError(null)
  };
};