import { useState, useCallback } from 'react';
import { authService } from '../services/auth.service';
import { userService } from '../services/user.service';
import { courseService } from '../services/course.service';

export const useApi = () => {
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

   // Auth methods
   const login = useCallback(async (credentials) => {
      return executeApiCall(authService.login.bind(authService), credentials);
   }, [executeApiCall]);

   const getMe = useCallback(async (token) => {
      return executeApiCall(authService.getMe.bind(authService), token);
   }, [executeApiCall]);

   const importFile = useCallback(async (file, token) => {
      return executeApiCall(authService.importFile.bind(authService), file, token);
   }, [executeApiCall]);

   const test = useCallback(async (token) => {
      return executeApiCall(authService.test.bind(authService), token);
   }, [executeApiCall]);

   // User methods
   const getAllUsers = useCallback(async (token) => {
      return executeApiCall(userService.getAllUsers.bind(userService), token);
   }, [executeApiCall]);

   const getUserById = useCallback(async (id, token) => {
      return executeApiCall(userService.getUserById.bind(userService), id, token);
   }, [executeApiCall]);

   const createUser = useCallback(async (userData, token) => {
      return executeApiCall(userService.createUser.bind(userService), userData, token);
   }, [executeApiCall]);

   const updateUser = useCallback(async (id, userData, token) => {
      return executeApiCall(userService.updateUser.bind(userService), id, userData, token);
   }, [executeApiCall]);

   const deleteUser = useCallback(async (id, token) => {
      return executeApiCall(userService.deleteUser.bind(userService), id, token);
   }, [executeApiCall]);

   // Course methods
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
      // State
      loading,
      error,

      // Auth methods
      login,
      getMe,
      importFile,
      test,

      // User methods
      getAllUsers,
      getUserById,
      createUser,
      updateUser,
      deleteUser,

      // Course methods
      getAllCourses,
      getCourseById,
      createCourse,
      updateCourse,
      deleteCourse,

      // Utility methods
      clearError: () => setError(null)
   };
};
