      "use client"

      import React, { useState, useEffect } from 'react';
      import { useParams, useNavigate } from 'react-router-dom';
      import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/common/components/ui/card";
      import { Button } from "@/common/components/ui/button";
      import { Badge } from "@/common/components/ui/badge";
      import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/common/components/ui/table";
      import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/common/components/ui/dialog";
      import { Input } from "@/common/components/ui/input";
      import { Label } from "@/common/components/ui/label";
      import {
      ArrowLeft,
      Users,
      GraduationCap,
      MapPin,
      Calendar,
      Plus,
      Edit,
      Trash2,
      Eye,
      } from "lucide-react";
      import { useSelector } from "react-redux";
      import { toast } from "react-toastify";

      // Mock data for demonstration
      const mockClassData = {
      id: 1,
      name: "10A1",
      grade: 10,
      subject: "Toán",
      status: "Hoạt động",
      students: 35,
      teacher: "Nguyễn Thị Lan",
      classroom: "Phòng 201",
      schedule: "Thứ 2, 4, 6 - 7:00-8:30",
      description: "Lớp học chuyên về môn Toán, tập trung phát triển tư duy logic và kỹ năng giải quyết vấn đề.",
      academicYear: "2024-2025"
      };

      const mockStudents = [
      { id: 1, name: "Nguyễn Văn An", email: "an.nguyen@email.com", birthDate: "2008-05-15", status: "Hoạt động" },
      { id: 2, name: "Trần Thị Bình", email: "binh.tran@email.com", birthDate: "2008-03-22", status: "Hoạt động" },
      { id: 3, name: "Lê Minh Cường", email: "cuong.le@email.com", birthDate: "2008-07-10", status: "Tạm dừng" },
      { id: 4, name: "Phạm Thị Dung", email: "dung.pham@email.com", birthDate: "2008-01-08", status: "Hoạt động" },
      { id: 5, name: "Hoàng Văn Em", email: "em.hoang@email.com", birthDate: "2008-09-12", status: "Hoạt động" },
      ];

      const mockTeachers = [
      { id: 1, name: "Nguyễn Thị Lan", email: "lan.nguyen@email.com", subject: "Toán" },
      { id: 2, name: "Trần Văn Nam", email: "nam.tran@email.com", subject: "Lý" },
      { id: 3, name: "Lê Thị Hoa", email: "hoa.le@email.com", subject: "Hóa" },
      ];

export default function ClassDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user.user);

  // Add CSS for radio inputs
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .radio-inputs {
        position: relative;
        display: flex;
        flex-wrap: wrap;
        border-radius: 0.5rem;
        background-color: #EEE;
        box-sizing: border-box;
        box-shadow: 0 0 0px 1px rgba(0, 0, 0, 0.06);
        padding: 0.25rem;
        width: 100%;
        font-size: 14px;
      }

      .radio-inputs .radio {
        flex: 1 1 auto;
        text-align: center;
      }

      .radio-inputs .radio input {
        display: none;
      }

      .radio-inputs .radio .name {
        display: flex;
        cursor: pointer;
        align-items: center;
        justify-content: center;
        border-radius: 0.5rem;
        border: none;
        padding: .5rem 0;
        color: rgba(51, 65, 85, 1);
        transition: all .15s ease-in-out;
      }

      .radio-inputs .radio input:checked + .name {
        background-color: #fff;
        font-weight: 600;
      }

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
      
      const [classData, setClassData] = useState(mockClassData);
      const [students, setStudents] = useState(mockStudents);
      const [teachers, setTeachers] = useState(mockTeachers);
      const [loading, setLoading] = useState(false);
      const [activeTab, setActiveTab] = useState('students');
      const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
      const [isEditStudentModalOpen, setIsEditStudentModalOpen] = useState(false);
      const [selectedStudent, setSelectedStudent] = useState(null);
      const [editingStudent, setEditingStudent] = useState({
        id: '',
        name: '',
        email: '',
        birthDate: '',
        status: 'active'
      });
      
      const [newStudent, setNewStudent] = useState({
         name: "",
         email: "",
         birthDate: "",
         status: "Hoạt động"
      });

      // Fetch class data
      useEffect(() => {
         const fetchClassData = async () => {
            try {
            setLoading(true);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setClassData(mockClassData);
            setStudents(mockStudents);
            setTeachers(mockTeachers);
            } catch (error) {
            console.error("Error fetching class data:", error);
            toast.error("Không thể tải thông tin lớp học");
            } finally {
            setLoading(false);
            }
         };

         fetchClassData();
      }, [id]);

      const handleBack = () => {
         navigate('/admin/classes');
      };

      const handleAddStudent = async () => {
         if (!newStudent.name.trim() || !newStudent.email.trim()) {
            toast.error("Vui lòng điền đầy đủ thông tin");
            return;
         }

         try {
            const studentData = {
            id: Math.max(...students.map(s => s.id)) + 1,
            ...newStudent
            };
            
            setStudents([...students, studentData]);
            setNewStudent({ name: "", email: "", birthDate: "", status: "Hoạt động" });
            setIsAddStudentModalOpen(false);
            toast.success("Thêm học sinh thành công!");
         } catch (error) {
            console.error("Error adding student:", error);
            toast.error("Không thể thêm học sinh");
         }
      };

      const handleEditStudent = (student) => {
         setEditingStudent({
            id: student.id,
            name: student.name,
            email: student.email,
            birthDate: student.birthDate,
            status: student.status
         });
         setIsEditStudentModalOpen(true);
      };

      const handleUpdateStudent = async () => {
         if (!editingStudent.name.trim() || !editingStudent.email.trim()) {
            toast.error("Vui lòng điền đầy đủ thông tin");
            return;
         }

         try {
            setStudents(students.map(student => 
               student.id === editingStudent.id 
                  ? { ...student, ...editingStudent }
                  : student
            ));
            setIsEditStudentModalOpen(false);
            toast.success("Cập nhật thông tin học sinh thành công!");
         } catch (error) {
            console.error("Error updating student:", error);
            toast.error("Không thể cập nhật thông tin học sinh");
         }
      };


      const handleDeleteStudent = async (studentId) => {
         try {
            setStudents(students.filter(s => s.id !== studentId));
            toast.success("Xóa học sinh thành công!");
         } catch (error) {
            console.error("Error deleting student:", error);
            toast.error("Không thể xóa học sinh");
         }
      };

      const getStatusBadge = (status) => {
         return status === "Hoạt động" ? (
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Hoạt động</Badge>
         ) : (
            <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Tạm dừng</Badge>
         );
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
                  {classData.status}
               </Badge>
            </div>
            <p className="text-gray-600">
               Khối {classData.grade} - {classData.subject}
            </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-white border-gray-200 shadow-sm rounded-xl">
               <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-xl">
                     <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                     <div className="text-lg font-bold text-gray-900">{classData.students}</div>
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
                  <div>
                     <div className="text-sm font-medium text-gray-900">{classData.teacher}</div>
                     <div className="text-xs text-gray-600">Giáo viên</div>
                  </div>
                  </div>
               </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 shadow-sm rounded-xl">
               <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-xl">
                     <MapPin className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                     <div className="text-sm font-medium text-gray-900">{classData.classroom}</div>
                     <div className="text-xs text-gray-600">Phòng học</div>
                  </div>
                  </div>
               </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 shadow-sm rounded-xl">
               <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-xl">
                     <Calendar className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                     <div className="text-sm font-medium text-gray-900">{classData.schedule}</div>
                     <div className="text-xs text-gray-600">Lịch học</div>
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

      {/* Student/Teacher Tabs */}
      <div className="radio-inputs mb-6">
        <label className="radio">
          <input 
            type="radio" 
            name="tab" 
            checked={activeTab === 'students'}
            onChange={() => setActiveTab('students')}
          />
          <span className="name flex items-center gap-2">
            <Users className="h-4 w-4" />
            Học sinh ({students.length})
          </span>
        </label>
        
        <label className="radio">
          <input 
            type="radio" 
            name="tab" 
            checked={activeTab === 'teachers'}
            onChange={() => setActiveTab('teachers')}
          />
          <span className="name flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Giáo viên ({teachers.length})
          </span>
        </label>
      </div>

      {/* Student/Teacher List Table */}
      <Card className="!bg-white !border-gray-200 !shadow-sm !rounded-xl">
        <CardHeader className="!pb-4">
          <div className="flex items-center justify-between">
            <h3 className="!text-lg !font-semibold !text-gray-900">
              {activeTab === 'students' ? 'Danh sách học sinh' : 'Danh sách giáo viên'}
            </h3>
            <Button 
              onClick={() => setIsAddStudentModalOpen(true)}
              className="!bg-gray-900 hover:!bg-gray-800 !text-white !rounded-lg !px-4 !py-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm học sinh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="!p-0">
          {activeTab === 'students' ? (
            <div className="!overflow-hidden !rounded-xl">
              <Table>
                <TableHeader>
                  <TableRow className="!border-b !border-gray-200 !bg-gray-50">
                    <TableHead className="!text-gray-700 !font-medium !py-3 !px-4">STT</TableHead>
                    <TableHead className="!text-gray-700 !font-medium !py-3 !px-4">Họ tên</TableHead>
                    <TableHead className="!text-gray-700 !font-medium !py-3 !px-4">Email</TableHead>
                    <TableHead className="!text-gray-700 !font-medium !py-3 !px-4">Ngày sinh</TableHead>
                    <TableHead className="!text-gray-700 !font-medium !py-3 !px-4">Trạng thái</TableHead>
                    <TableHead className="!text-gray-700 !font-medium !py-3 !px-4">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student, index) => (
                    <TableRow key={student.id} className="!border-b !border-gray-200 hover:!bg-gray-50">
                      <TableCell className="!text-gray-600 !py-3 !px-4">{index + 1}</TableCell>
                      <TableCell className="!font-medium !text-gray-900 !py-3 !px-4">{student.name}</TableCell>
                      <TableCell className="!text-gray-600 !py-3 !px-4">{student.email}</TableCell>
                      <TableCell className="!text-gray-600 !py-3 !px-4">{student.birthDate}</TableCell>
                      <TableCell className="!py-3 !px-4">{getStatusBadge(student.status)}</TableCell>
                      <TableCell className="!py-3 !px-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditStudent(student)}
                            className="!text-gray-600 hover:!text-gray-800 hover:!bg-gray-100 !px-2 !py-1 !rounded-md"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Sửa
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteStudent(student.id)}
                            className="!text-gray-600 hover:!text-gray-800 hover:!bg-gray-100 !px-2 !py-1 !rounded-md"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Xóa
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="!overflow-hidden !rounded-xl">
              <Table>
                <TableHeader>
                  <TableRow className="!border-b !border-gray-200 !bg-gray-50">
                    <TableHead className="!text-gray-700 !font-medium !py-3 !px-4">STT</TableHead>
                    <TableHead className="!text-gray-700 !font-medium !py-3 !px-4">Họ tên</TableHead>
                    <TableHead className="!text-gray-700 !font-medium !py-3 !px-4">Email</TableHead>
                    <TableHead className="!text-gray-700 !font-medium !py-3 !px-4">Môn học</TableHead>
                    <TableHead className="!text-gray-700 !font-medium !py-3 !px-4">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teachers.map((teacher, index) => (
                    <TableRow key={teacher.id} className="!border-b !border-gray-200 hover:!bg-gray-50">
                      <TableCell className="!text-gray-600 !py-3 !px-4">{index + 1}</TableCell>
                      <TableCell className="!font-medium !text-gray-900 !py-3 !px-4">{teacher.name}</TableCell>
                      <TableCell className="!text-gray-600 !py-3 !px-4">{teacher.email}</TableCell>
                      <TableCell className="!text-gray-600 !py-3 !px-4">{teacher.subject}</TableCell>
                      <TableCell className="!py-3 !px-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="!text-gray-600 hover:!text-gray-800 hover:!bg-gray-100 !px-2 !py-1 !rounded-md"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Xem
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
            </CardContent>
            </Card>

            {/* Add Student Modal */}
            <Dialog open={isAddStudentModalOpen} onOpenChange={setIsAddStudentModalOpen}>
              <DialogContent className="sm:max-w-[500px] !bg-white !border-0 !shadow-xl !rounded-xl">
                <DialogHeader className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-xl">
                      <Plus className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <DialogTitle className="text-xl font-semibold text-gray-900">Thêm học sinh mới</DialogTitle>
                      <DialogDescription className="text-sm text-gray-600">
                        Thêm học sinh vào lớp {classData.name}. Điền thông tin bắt buộc bên dưới.
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
                
                <div className="space-y-6 py-6">
                  {/* Full Name Field */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      Họ tên <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={newStudent.name}
                      onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                      placeholder="Nhập họ tên học sinh"
                      className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={newStudent.email}
                      onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                      placeholder="Nhập email học sinh"
                      className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  {/* Birth Date Field */}
                  <div className="space-y-2">
                    <Label htmlFor="birthDate" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Ngày sinh
                    </Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={newStudent.birthDate}
                      onChange={(e) => setNewStudent({ ...newStudent, birthDate: e.target.value })}
                      className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
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

            {/* Edit Student Modal */}
            <Dialog open={isEditStudentModalOpen} onOpenChange={setIsEditStudentModalOpen}>
              <DialogContent className="sm:max-w-[500px] !bg-white !border-0 !shadow-xl !rounded-xl">
                <DialogHeader className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-xl">
                      <Edit className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <DialogTitle className="text-xl font-semibold text-gray-900">Sửa thông tin học sinh</DialogTitle>
                      <DialogDescription className="text-sm text-gray-600">
                        Cập nhật thông tin học sinh trong lớp {classData.name}.
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
                
                <div className="space-y-6 py-6">
                  {/* Full Name Field */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-name" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      Họ tên <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="edit-name"
                      value={editingStudent.name}
                      onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                      placeholder="Nhập họ tên học sinh"
                      className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-email" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={editingStudent.email}
                      onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                      placeholder="Nhập email học sinh"
                      className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  {/* Birth Date Field */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-birthDate" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Ngày sinh
                    </Label>
                    <Input
                      id="edit-birthDate"
                      type="date"
                      value={editingStudent.birthDate}
                      onChange={(e) => setEditingStudent({ ...editingStudent, birthDate: e.target.value })}
                      className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  {/* Status Field */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-status" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Trạng thái
                    </Label>
                    <select
                      id="edit-status"
                      value={editingStudent.status}
                      onChange={(e) => setEditingStudent({ ...editingStudent, status: e.target.value })}
                      className="h-11 w-full px-3 py-2 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="active">Hoạt động</option>
                      <option value="inactive">Tạm dừng</option>
                    </select>
                  </div>
                </div>
                
                <DialogFooter className="gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditStudentModalOpen(false)}
                    className="h-11 px-6 border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    Hủy
                  </Button>
                  <Button 
                    onClick={handleUpdateStudent}
                    className="h-11 px-6 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Cập nhật
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
         </div>
      );
      }
