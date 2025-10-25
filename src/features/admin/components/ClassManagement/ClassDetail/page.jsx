      "use client"

      import React, { useState, useEffect } from 'react';
      import { useParams, useNavigate } from 'react-router-dom';
      import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/common/components/ui/card";
      import { Button } from "@/common/components/ui/button";
      import { Badge } from "@/common/components/ui/badge";
      import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/common/components/ui/table";
      import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/common/components/ui/dialog";
      import { Input } from "@/common/components/ui/input";
      import { Label } from "@/common/components/ui/label";
      import {
      ArrowLeft,
      Users,
      GraduationCap,
      Plus,
      Trash2,
      Eye,
      ArrowUpDown,
      ArrowUp,
      ArrowDown,
      } from "lucide-react";
      import { toast } from "react-toastify";
      import { ClassGroupService } from "@/services/classgroup.service";

export default function ClassDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Add CSS for modal styling
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      /* Modal styling overrides */
      [data-radix-dialog-content] {
        background-color: white !important;
        border: none !important;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
        border-radius: 0.75rem !important;
      }

      [data-radix-dialog-overlay] {
        background-color: rgba(0, 0, 0, 0.5) !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
      
      const [classData, setClassData] = useState(null);
      const [students, setStudents] = useState([]);
      const [loading, setLoading] = useState(false);
      const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
      const [newStudent, setNewStudent] = useState({
         email: ""
      });
      const [emailError, setEmailError] = useState("");
      
      // Homeroom Teacher states
      const [isAssignTeacherModalOpen, setIsAssignTeacherModalOpen] = useState(false);
      const [newTeacher, setNewTeacher] = useState({
         email: ""
      });
      const [teacherEmailError, setTeacherEmailError] = useState("");
      const [homeroomTeacher, setHomeroomTeacher] = useState(null);
      const [isTeacherDetailModalOpen, setIsTeacherDetailModalOpen] = useState(false);
      
      // Confirm modal states
      const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
      const [confirmAction, setConfirmAction] = useState(null);
      const [confirmData, setConfirmData] = useState(null);
      
      // Sort states
      const [sortBy, setSortBy] = useState('name'); // 'name', 'email', or null
      const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'

             // Fetch students when sort changes
       useEffect(() => {
          const fetchStudents = async () => {
             if (!id) return;
             try {
                const token = localStorage.getItem('token');
                const studentsResponse = await ClassGroupService.getStudents(id, token, sortBy, sortOrder);
                if (studentsResponse && studentsResponse.data) {
                   setStudents(studentsResponse.data);
                }
             } catch (error) {
                console.error("Error fetching students:", error);
             }
          };
          fetchStudents();
       }, [id, sortBy, sortOrder]);

       // Fetch class data
       useEffect(() => {
          const fetchClassData = async () => {
             try {
             setLoading(true);
             const token = localStorage.getItem('token');
             
             console.log('Fetching class data for ID:', id);
             console.log('Token:', token ? 'Present' : 'Missing');
             
             // Check if we should open assign teacher modal
             const urlParams = new URLSearchParams(window.location.search);
             if (urlParams.get('assignTeacher') === 'true') {
                setIsAssignTeacherModalOpen(true);
                // Clean up URL
                window.history.replaceState({}, '', window.location.pathname);
             }
             
             // Fetch class detail
             const classResponse = await ClassGroupService.getDetail(id, token);
             console.log('Class response:', classResponse);
             
             if (classResponse && classResponse.data) {
                setClassData(classResponse.data);
             } else {
                console.log('No class data found, trying basic getById...');
                // Fallback to basic getById if detail endpoint fails
                const basicResponse = await ClassGroupService.getById(id, token);
                console.log('Basic response:', basicResponse);
                if (basicResponse && basicResponse.data) {
                   setClassData(basicResponse.data);
                }
             }
             
             // Fetch homeroom teacher
             try {
                const teacherResponse = await ClassGroupService.getHomeroomTeacher(id, token);
                console.log('Homeroom teacher response:', teacherResponse);
                
                if (teacherResponse && teacherResponse.data) {
                   setHomeroomTeacher(teacherResponse.data);
                }
             } catch (teacherError) {
                console.log('No homeroom teacher found or error:', teacherError);
                setHomeroomTeacher(null);
             }
             } catch (error) {
             console.error("Error fetching class data:", error);
             toast.error("Không thể tải thông tin lớp học: " + error.message);
             } finally {
             setLoading(false);
             }
          };

          if (id) {
             fetchClassData();
          }
       }, [id]);

      const handleBack = () => {
         // Preserve academic year filter when going back
         const urlParams = new URLSearchParams(window.location.search);
         const academicYear = urlParams.get('academicYear');
         const backUrl = academicYear ? `/admin/classes?academicYear=${academicYear}` : '/admin/classes';
         navigate(backUrl);
      };

      const handleAddStudent = async () => {
         // Clear previous error
         setEmailError("");
         
         if (!newStudent.email.trim()) {
            setEmailError("Vui lòng nhập email học sinh");
            return;
         }

         // Basic email validation
         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
         if (!emailRegex.test(newStudent.email)) {
            setEmailError("Email không đúng định dạng");
            return;
         }

         try {
            const token = localStorage.getItem('token');
            const response = await ClassGroupService.addStudent(id, newStudent.email, token);
            
            console.log('Add student response:', response);
            
                         if (response && response.data && response.data.success) {
                // Refresh students list with current sort
                const studentsResponse = await ClassGroupService.getStudents(id, token, sortBy, sortOrder);
                if (studentsResponse && studentsResponse.data) {
                   setStudents(studentsResponse.data);
                }
                
                setNewStudent({ email: "" });
                setEmailError("");
                setIsAddStudentModalOpen(false);
                toast.success(response.data.message || "Thêm học sinh thành công!");
            } else {
               // Backend handles all validation logic, just display the error message
               const errorMessage = response?.data?.message || response?.message || "Không thể thêm học sinh";
               setEmailError(errorMessage);
            }
         } catch (error) {
            console.error("Error adding student:", error);
            // Backend handles all validation logic, just display the error message
            const errorMessage = error?.response?.data?.message || error?.message || "Không thể thêm học sinh";
            setEmailError(errorMessage);
         }
      };

      const handleDeleteStudent = async (studentId) => {
         try {
            const token = localStorage.getItem('token');
            const response = await ClassGroupService.removeStudent(id, studentId, token);
            
                         if (response && response.data !== undefined) {
                // Refresh students list with current sort
                const studentsResponse = await ClassGroupService.getStudents(id, token, sortBy, sortOrder);
                if (studentsResponse && studentsResponse.data) {
                   setStudents(studentsResponse.data);
                }
                
                toast.success("Xóa học sinh thành công!");
            } else {
               toast.error(response?.message || "Không thể xóa học sinh");
            }
         } catch (error) {
            console.error("Error deleting student:", error);
            toast.error("Không thể xóa học sinh");
         }
      };

      const handleConfirmDeleteStudent = (student) => {
         setConfirmAction('deleteStudent');
         setConfirmData(student);
         setIsConfirmModalOpen(true);
      };

      const handleConfirmRemoveTeacher = () => {
         setConfirmAction('removeTeacher');
         setConfirmData(homeroomTeacher);
         setIsConfirmModalOpen(true);
      };

      const handleConfirmAction = async () => {
         if (confirmAction === 'deleteStudent') {
            await handleDeleteStudent(confirmData.id);
         } else if (confirmAction === 'removeTeacher') {
            await handleRemoveTeacher();
         }
         setIsConfirmModalOpen(false);
         setConfirmAction(null);
         setConfirmData(null);
      };

      const handleAssignTeacher = async () => {
         // Clear previous error
         setTeacherEmailError("");
         
         if (!newTeacher.email.trim()) {
            setTeacherEmailError("Vui lòng nhập email giáo viên");
            return;
         }

         // Basic email validation
         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
         if (!emailRegex.test(newTeacher.email)) {
            setTeacherEmailError("Email không đúng định dạng");
            return;
         }

         try {
            const token = localStorage.getItem('token');
            const response = await ClassGroupService.assignHomeroomTeacher(id, newTeacher.email, token);
            
            console.log('Assign teacher response:', response);
            
            if (response && response.data && response.data.success) {
               // Refresh homeroom teacher info
               try {
                  const teacherResponse = await ClassGroupService.getHomeroomTeacher(id, token);
                  if (teacherResponse && teacherResponse.data) {
                     setHomeroomTeacher(teacherResponse.data);
                  }
               } catch (teacherError) {
                  console.log('Error refreshing teacher info:', teacherError);
               }
               
               setNewTeacher({ email: "" });
               setTeacherEmailError("");
               setIsAssignTeacherModalOpen(false);
               toast.success(response.data.message || "Thêm giáo viên chủ nhiệm thành công!");
            } else {
               // Backend handles all validation logic, just display the error message
               const errorMessage = response?.data?.message || response?.message || "Không thể thêm giáo viên chủ nhiệm";
               setTeacherEmailError(errorMessage);
            }
         } catch (error) {
            console.error("Error assigning teacher:", error);
            // Backend handles all validation logic, just display the error message
            const errorMessage = error?.response?.data?.message || error?.message || "Không thể thêm giáo viên chủ nhiệm";
            setTeacherEmailError(errorMessage);
         }
      };

      const handleRemoveTeacher = async () => {
         try {
            const token = localStorage.getItem('token');
            const response = await ClassGroupService.removeHomeroomTeacher(id, token);
            
            if (response && response.data !== undefined) {
               // Clear homeroom teacher info
               setHomeroomTeacher(null);
               
               toast.success("Bỏ gán giáo viên chủ nhiệm thành công!");
            } else {
               toast.error(response?.message || "Không thể bỏ gán giáo viên chủ nhiệm");
            }
         } catch (error) {
            console.error("Error removing teacher:", error);
            toast.error("Không thể bỏ gán giáo viên chủ nhiệm");
         }
      };

      // Sort handler
      const handleSort = (field) => {
         if (sortBy === field) {
            // Toggle sort order if clicking on the same field
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
         } else {
            setSortBy(field);
            setSortOrder('asc');
         }
      };

      

      if (loading) {
         return (
            <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
               <p className="text-gray-600">Đang tải thông tin lớp học...</p>
            </div>
            </div>
         );
      }

      if (!classData) {
         return (
            <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
               <p className="text-gray-600">Không tìm thấy thông tin lớp học</p>
               <Button onClick={handleBack} className="mt-4">Quay lại</Button>
            </div>
            </div>
         );
      }

      return (
         <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
            <Button 
               variant="ghost" 
               onClick={handleBack}
               className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
               <ArrowLeft className="h-4 w-4" />
               Quay lại
            </Button>
            </div>

            {/* Class Header */}
            <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
               <h1 className="text-3xl font-bold text-gray-900">Lớp {classData.name}</h1>
               <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                  Khối {classData.grade}
               </Badge>
               {classData.academicYearName && (
                 <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                    {classData.academicYearName}
                 </Badge>
               )}
            </div>
            <p className="text-gray-600">
               {classData.description}
            </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card className="bg-white border-gray-200 shadow-sm rounded-xl">
               <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-xl">
                     <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                     <div className="text-lg font-bold text-gray-900">{students.length}</div>
                     <div className="text-xs text-gray-600">Số học sinh</div>
                  </div>
                  </div>
               </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 shadow-sm rounded-xl">
               <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-xl">
                     <GraduationCap className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                     <div className="text-sm font-medium text-gray-900">
                        {homeroomTeacher ? `${homeroomTeacher.firstName} ${homeroomTeacher.lastName}`.trim() : "Chưa có"}
                     </div>
                     <div className="text-xs text-gray-600">Giáo viên chủ nhiệm</div>
                  </div>
                  <div className="flex gap-2">
                     {homeroomTeacher ? (
                        <>
                           <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setIsTeacherDetailModalOpen(true)}
                              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                              title="Xem chi tiết giáo viên"
                           >
                              <Eye className="h-4 w-4" />
                           </Button>
                           <Button
                              size="sm"
                              variant="outline"
                              onClick={handleConfirmRemoveTeacher}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                              title="Xóa giáo viên khỏi lớp"
                           >
                              <Trash2 className="h-4 w-4" />
                           </Button>
                        </>
                     ) : (
                        <Button
                           size="sm"
                           onClick={() => setIsAssignTeacherModalOpen(true)}
                           className="h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700 text-white"
                           title="Thêm giáo viên chủ nhiệm"
                        >
                           <Plus className="h-4 w-4" />
                        </Button>
                     )}
                  </div>
                  </div>
               </CardContent>
            </Card>
            </div>

            {/* Class Information */}
            <Card className="bg-white border-gray-200 shadow-sm rounded-xl">
            <CardHeader>
               <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                  Thông tin lớp học
               </CardTitle>
            </CardHeader>
            <CardContent>
               <p className="text-gray-700 leading-relaxed">
                  {classData.description}
               </p>
            </CardContent>
            </Card>

      {/* Students List Table */}
      <Card className="!bg-white !border-gray-200 !shadow-sm !rounded-xl">
        <CardHeader className="!pb-4">
          <div className="flex items-center justify-between">
            <h3 className="!text-lg !font-semibold !text-gray-900">
              Danh sách học sinh ({students.length})
            </h3>
            <Button 
              onClick={() => setIsAddStudentModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-4 py-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm học sinh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="!p-0">
          <div className="!overflow-hidden !rounded-xl">
            <Table>
                            <TableHeader>
                 <TableRow className="!border-b !border-gray-200 !bg-gray-50">
                   <TableHead className="!text-gray-700 !font-medium !py-3 !px-4">
                     <button
                       onClick={() => handleSort('studentcode')}
                       className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                     >
                       Mã số học sinh
                       {sortBy === 'studentcode' ? (
                         sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                       ) : (
                         <ArrowUpDown className="h-4 w-4 text-gray-400" />
                       )}
                     </button>
                   </TableHead>
                   <TableHead className="!text-gray-700 !font-medium !py-3 !px-4">
                     <button
                       onClick={() => handleSort('name')}
                       className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                     >
                       Họ tên
                       {sortBy === 'name' ? (
                         sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                       ) : (
                         <ArrowUpDown className="h-4 w-4 text-gray-400" />
                       )}
                     </button>
                   </TableHead>
                  <TableHead className="!text-gray-700 !font-medium !py-3 !px-4">
                    <button
                      onClick={() => handleSort('email')}
                      className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                    >
                      Email
                      {sortBy === 'email' ? (
                        sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                      ) : (
                        <ArrowUpDown className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </TableHead>
                  <TableHead className="!text-gray-700 !font-medium !py-3 !px-4">Ngày sinh</TableHead>
                  <TableHead className="!text-gray-700 !font-medium !py-3 !px-4">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
                             <TableBody>
                 {students.map((student, index) => (
                  <TableRow key={student.id} className="!border-b !border-gray-200 hover:!bg-gray-50">
                    <TableCell className="!text-gray-600 !py-3 !px-4">{student.studentCode || '-'}</TableCell>
                    <TableCell className="!font-medium !text-gray-900 !py-3 !px-4">{student.fullName}</TableCell>
                    <TableCell className="!text-gray-600 !py-3 !px-4">{student.email}</TableCell>
                    <TableCell className="!text-gray-600 !py-3 !px-4">
                      {student.birthdate ? new Date(student.birthdate).toLocaleDateString('vi-VN') : '-'}
                    </TableCell>
                    <TableCell className="!py-3 !px-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleConfirmDeleteStudent(student)}
                          className="!text-red-600 hover:!text-red-800 hover:!bg-red-50 !px-2 !py-1 !rounded-md"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Xóa khỏi lớp
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
            </CardContent>
            </Card>

            {/* Add Student Modal */}
            <Dialog open={isAddStudentModalOpen} onOpenChange={(open) => {
              setIsAddStudentModalOpen(open);
              if (!open) {
                setEmailError(""); // Clear error when closing modal
              }
            }}>
              <DialogContent className="sm:max-w-[500px] !bg-white !border-0 !shadow-xl !rounded-xl">
                <DialogHeader className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-xl">
                      <Plus className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <DialogTitle className="text-xl font-semibold text-gray-900">Thêm học sinh vào lớp</DialogTitle>
                      <DialogDescription className="text-sm text-gray-600">
                        Thêm học sinh vào lớp {classData.name}. Nhập email học sinh để thêm vào lớp.
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
                
                <div className="space-y-6 py-6">
                  {/* Student Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                      Email học sinh <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={newStudent.email}
                      onChange={(e) => {
                        setNewStudent({ ...newStudent, email: e.target.value });
                        setEmailError(""); // Clear error when user types
                      }}
                      placeholder="Nhập email học sinh (ví dụ: student@email.com)"
                      className={`h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${emailError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    />
                    {emailError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
                        <div className="flex items-start gap-2">
                          <svg className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-sm text-red-700 font-medium">
                            {emailError}
                          </p>
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      Học sinh phải đã được đăng ký trong hệ thống với email này. 
                      <br />
                      <span className="text-orange-600 font-medium">Lưu ý:</span> Học sinh không thể có trong nhiều lớp cùng niên khóa.
                    </p>
                  </div>
                </div>
                
                <DialogFooter className="gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAddStudentModalOpen(false)}
                    className="h-11 px-6 border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    Hủy
                  </Button>
                  <Button 
                    onClick={handleAddStudent}
                    className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm học sinh
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Assign Homeroom Teacher Modal */}
            <Dialog open={isAssignTeacherModalOpen} onOpenChange={(open) => {
              setIsAssignTeacherModalOpen(open);
              if (!open) {
                setTeacherEmailError(""); // Clear error when closing modal
              }
            }}>
              <DialogContent className="sm:max-w-[500px] !bg-white !border-0 !shadow-xl !rounded-xl">
                <DialogHeader className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-xl">
                      <GraduationCap className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <DialogTitle className="text-xl font-semibold text-gray-900">Thêm giáo viên chủ nhiệm</DialogTitle>
                      <DialogDescription className="text-sm text-gray-600">
                        Thêm giáo viên làm chủ nhiệm lớp {classData.name}. Nhập email giáo viên để gán làm chủ nhiệm.
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
                
                <div className="space-y-6 py-6">
                  {/* Teacher Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="teacherEmail" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                      Email giáo viên <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="teacherEmail"
                      type="email"
                      value={newTeacher.email}
                      onChange={(e) => {
                        setNewTeacher({ ...newTeacher, email: e.target.value });
                        setTeacherEmailError(""); // Clear error when user types
                      }}
                      placeholder="Nhập email giáo viên (ví dụ: teacher@email.com)"
                      className={`h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${teacherEmailError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    />
                    {teacherEmailError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
                        <div className="flex items-start gap-2">
                          <svg className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-sm text-red-700 font-medium">
                            {teacherEmailError}
                          </p>
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      Giáo viên phải đã được đăng ký trong hệ thống với email này. 
                      <br />
                      <span className="text-orange-600 font-medium">Lưu ý:</span> Giáo viên không thể chủ nhiệm nhiều lớp cùng niên khóa.
                    </p>
                  </div>
                </div>
                
                <DialogFooter className="gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAssignTeacherModalOpen(false)}
                    className="h-11 px-6 border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    Hủy
                  </Button>
                  <Button 
                    onClick={handleAssignTeacher}
                    className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Gán giáo viên
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Teacher Detail Modal */}
            <Dialog open={isTeacherDetailModalOpen} onOpenChange={setIsTeacherDetailModalOpen}>
              <DialogContent className="sm:max-w-[500px] bg-white">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-blue-600" />
                    Thông tin giáo viên chủ nhiệm
                  </DialogTitle>
                  <DialogDescription>
                    Chi tiết thông tin giáo viên chủ nhiệm lớp {classData?.name}
                  </DialogDescription>
                </DialogHeader>
                
                {homeroomTeacher && (
                  <div className="py-4">
                    <div className="space-y-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Họ và tên:</span>
                        <p className="text-gray-900 mt-1">
                          {`${homeroomTeacher.firstName} ${homeroomTeacher.lastName}`.trim()}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Email:</span>
                        <p className="text-gray-900 mt-1">{homeroomTeacher.email}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Số điện thoại:</span>
                        <p className="text-gray-900 mt-1">{homeroomTeacher.phoneNumber || "Chưa cập nhật"}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsTeacherDetailModalOpen(false)}
                    className="h-11 px-6 border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    Đóng
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Confirm Modal */}
            <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
              <DialogContent className="sm:max-w-[400px] bg-white">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-lg">
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </div>
                    Xác nhận xóa
                  </DialogTitle>
                  <DialogDescription>
                    {confirmAction === 'deleteStudent' 
                      ? `Bạn có chắc chắn muốn xóa học sinh "${confirmData?.fullName}" khỏi lớp ${classData?.name}?`
                      : `Bạn có chắc chắn muốn bỏ gán giáo viên "${confirmData?.firstName} ${confirmData?.lastName}" khỏi lớp ${classData?.name}?`
                    }
                  </DialogDescription>
                </DialogHeader>
                
                <div className="py-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <svg className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <div>
                        <p className="text-sm text-yellow-800 font-medium">
                          Hành động này không thể hoàn tác
                        </p>
                        <p className="text-xs text-yellow-700 mt-1">
                          {confirmAction === 'deleteStudent' 
                            ? 'Học sinh sẽ bị xóa khỏi lớp và cần được thêm lại nếu muốn quay lại.'
                            : 'Giáo viên sẽ không còn là chủ nhiệm lớp này nữa.'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <DialogFooter className="gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsConfirmModalOpen(false)}
                    className="h-11 px-6 border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    Hủy
                  </Button>
                  <Button 
                    onClick={handleConfirmAction}
                    className="h-11 px-6 bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {confirmAction === 'deleteStudent' ? 'Xóa học sinh' : 'Bỏ gán giáo viên'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
         </div>
      );
      }
