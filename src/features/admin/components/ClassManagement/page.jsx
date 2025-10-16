"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/common/components/ui/card"
import { Button } from "@/common/components/ui/button"
import { Input } from "@/common/components/ui/input"
import { Badge } from "@/common/components/ui/badge"
import { SimpleSelect } from "@/common/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/common/components/ui/dialog"
import { Label } from "@/common/components/ui/label"
import {
  Search,
  Eye,
  Edit,
  Trash2,
  Users,
  GraduationCap,
  ChevronDown,
  ChevronRight,
  Plus,
} from "lucide-react"
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { ClassGroupService } from "@/services/classgroup.service";

const academicYears = [
  { value: "2024-2025", label: "2024-2025" },
  { value: "2023-2024", label: "2023-2024" },
  { value: "2022-2023", label: "2022-2023" },
]

const grades = [
  { value: 10, label: "Khối 10" },
  { value: 11, label: "Khối 11" },
  { value: 12, label: "Khối 12" },
]

// Mock data matching the UI sample
const mockClasses = [
  { id: 1, name: "10A1", grade: 10, academicYear: "2024-2025", students: 35, teacher: "Nguyễn Thị Lan", teacherId: 1, status: 1 },
  { id: 2, name: "10A2", grade: 10, academicYear: "2024-2025", students: 33, teacher: "Trần Văn Nam", teacherId: 2, status: 1 },
  { id: 3, name: "10A3", grade: 10, academicYear: "2024-2025", students: 34, teacher: "Lê Thị Hoa", teacherId: 3, status: 1 },
  { id: 4, name: "11A1", grade: 11, academicYear: "2024-2025", students: 30, teacher: "Phạm Thị D", teacherId: 4, status: 1 },
  { id: 5, name: "11A2", grade: 11, academicYear: "2024-2025", students: 33, teacher: "Hoàng Văn E", teacherId: 5, status: 1 },
  { id: 6, name: "12A1", grade: 12, academicYear: "2024-2025", students: 28, teacher: "Vũ Thị F", teacherId: 6, status: 1 },
]

export default function ClassManagementPage() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedYear, setSelectedYear] = useState("2024-2025")
  const [expandedGrades, setExpandedGrades] = useState([10]) // Grade 10 expanded by default
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState(null)
  const [classToDelete, setClassToDelete] = useState(null)
  const currentUser = useSelector((state) => state.user.user);
  
  const [newClass, setNewClass] = useState({
    name: "",
    grade: "",
    academicYear: "2024-2025",
    description: "",
  })
  
  const [formErrors, setFormErrors] = useState({})

  // Toggle grade expansion
  const toggleGrade = (grade) => {
    setExpandedGrades((prev) => 
      prev.includes(grade) 
        ? prev.filter((g) => g !== grade) 
        : [...prev, grade]
    )
  }

  // Filter classes based on search and year
  // Fetch-based filtering: call backend when searchTerm or selectedYear changes
  useEffect(() => {
    const doSearch = async () => {
      try {
        const token = currentUser?.token;
        const res = await ClassGroupService.search({ nameOrCombined: searchTerm, academicYear: selectedYear }, token);
        const data = (res?.data || res) || [];
        const mapped = data.map(c => ({
          id: c.id,
          name: c.name,
          grade: c.grade,
          academicYear: toAcademicYear(c.startYear),
          students: c.currentStudentCount ?? 0,
          teacher: "",
          teacherId: null,
          status: c.isDeleted ? 0 : 1,
        }));
        setClasses(mapped);
      } catch (e) {
        console.error('Search failed', e);
      }
    };
    // Debounce simple: delay 300ms
    const h = setTimeout(doSearch, 300);
    return () => clearTimeout(h);
  }, [searchTerm, selectedYear, currentUser]);

  // Local view of classes for grouping by grade
  const filteredClasses = classes;

  // Group classes by grade
  const classesByGrade = filteredClasses.reduce((acc, cls) => {
    if (!acc[cls.grade]) {
      acc[cls.grade] = []
    }
    acc[cls.grade].push(cls)
    return acc
  }, {})

  // Calculate stats
  const stats = {
    totalClasses: filteredClasses.length,
    totalStudents: filteredClasses.reduce((sum, cls) => sum + cls.students, 0),
    totalTeachers: new Set(filteredClasses.map(cls => cls.teacher).filter(Boolean)).size
  }

  const handleViewClass = (classItem) => {
    navigate(`/admin/classes/${classItem.id}`);
  };

  const handleEditClass = (classItem) => {
    setSelectedClass(classItem);
    setNewClass({
      name: classItem.name || "",
      grade: classItem.grade || "",
      academicYear: classItem.academicYear || "2024-2025",
      description: classItem.description || "",
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteClass = (classItem) => {
    setClassToDelete(classItem);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!classToDelete) return;
    try {
      const token = currentUser?.token;
      await ClassGroupService.remove(classToDelete.id, token);
      setClasses(prev => prev.filter(c => c.id !== classToDelete.id));
      toast.success("Xóa lớp học thành công!");
      setIsConfirmModalOpen(false);
      setClassToDelete(null);
    } catch (error) {
      console.error("Error deleting class:", error);
      toast.error("Xóa lớp học thất bại");
    }
  };

  const handleCreateClass = async () => {
    if (!newClass.name.trim() || !newClass.grade) {
      toast.error("Vui lòng điền tên lớp và khối")
      return
    }
    try {
      const token = currentUser?.token;
      const startYear = parseInt(String(newClass.academicYear).slice(0, 4), 10);
      const payload = {
        name: newClass.name,
        description: newClass.description || undefined,
        grade: Number(newClass.grade),
        startYear: Number.isFinite(startYear) ? startYear : undefined,
      };
      const res = await ClassGroupService.create(payload, token);
      const created = res?.data || res;
      const uiItem = {
        id: created.id,
        name: created.name,
        grade: created.grade,
        academicYear: toAcademicYear(created.startYear),
        students: created.currentStudentCount ?? 0,
        teacher: "",
        teacherId: null,
        status: created.isDeleted ? 0 : 1,
      };
      setClasses(prev => [...prev, uiItem]);
      setNewClass({ name: "", grade: "", academicYear: "2024-2025", description: "" })
      setFormErrors({})
      setIsModalOpen(false)
      toast.success("Tạo lớp học thành công!")
    } catch (error) {
      console.error("Error creating class:", error);
      toast.error(error?.message || "Không thể tạo lớp học");
    }
  }

  const handleUpdateClass = async () => {
    if (!selectedClass) return;
    try {
      const token = currentUser?.token;
      const startYear = parseInt(String(newClass.academicYear).slice(0, 4), 10);
      const payload = {
        id: selectedClass.id,
        name: newClass.name || undefined,
        description: newClass.description || undefined,
        grade: Number(newClass.grade),
        startYear: Number.isFinite(startYear) ? startYear : undefined,
      };
      const res = await ClassGroupService.update(selectedClass.id, payload, token);
      const updated = res?.data || res;
      setClasses(prev => prev.map(c => c.id === selectedClass.id ? {
        ...c,
        name: updated.name,
        grade: updated.grade,
        academicYear: toAcademicYear(updated.startYear),
        students: updated.currentStudentCount ?? c.students,
        status: updated.isDeleted ? 0 : 1,
      } : c));
      setIsEditModalOpen(false);
      toast.success("Cập nhật lớp học thành công!");
    } catch (error) {
      console.error("Error updating class:", error);
      toast.error(error?.message || "Không thể cập nhật lớp học");
    }
  };

  const getGradeName = (grade) => {
    const gradeNames = {
      10: "Khối 10",
      11: "Khối 11", 
      12: "Khối 12",
    }
    return gradeNames[grade] || `Khối ${grade}`
  }

  // Helper to map start year to academic year label
  const toAcademicYear = (startYear) => {
    if (!startYear) return "";
    const endYear = Number(startYear) + 1;
    return `${startYear}-${endYear}`;
  }

  useEffect(() => {
    const load = async () => {
      try {
        const token = currentUser?.token;
        const res = await ClassGroupService.dashboard(token);
        const payload = res?.data || res;
        const flattened = (payload?.classesByGrade || []).flatMap(g => {
          return (g.classes || []).map(c => ({
            id: c.id,
            name: c.name,
            grade: c.grade,
            academicYear: toAcademicYear(c.startYear),
            students: c.currentStudentCount ?? 0,
            teacher: "",
            teacherId: null,
            status: c.isDeleted ? 0 : 1,
          }));
        });
        setClasses(flattened);
      } catch (e) {
        console.error("Failed to load classes", e);
        toast.error("Không thể tải danh sách lớp học");
      }
    };
    load();
  }, [currentUser])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Lớp học</h1>
        <p className="text-sm text-gray-600">Quản lý danh sách lớp học theo năm học và khối</p>
        </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Tìm kiếm lớp học hoặc giáo viên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-2xl border-gray-200"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Năm học:</span>
          <SimpleSelect 
            value={selectedYear} 
            onValueChange={setSelectedYear}
            placeholder="Chọn năm học"
            options={academicYears}
            className="w-40 border-gray-200 rounded-2xl"
          />
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white shadow-sm rounded-2xl px-4"
        >
          <Plus className="h-4 w-4 mr-2" />
          Thêm lớp mới
        </Button>
              </div>

      {/* Stats Container - Hộp bọc như hình */}
      <Card className="bg-blue-50 border-blue-200 shadow-sm rounded-2xl mb-6">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
              <GraduationCap className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900">Thống kê năm học {selectedYear}</h3>
              <p className="text-sm text-blue-700">Tổng quan về các lớp học trong năm học được chọn</p>
            </div>
              </div>

          {/* Stats Cards - 3 thẻ nhỏ nằm ngang */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white border-gray-200 shadow-sm rounded-xl">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-xl">
                    <GraduationCap className="h-5 w-5 text-blue-600" />
                </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">{stats.totalClasses}</div>
                    <div className="text-xs text-gray-600">Tổng số lớp</div>
              </div>
            </div>
          </CardContent>
        </Card>

            <Card className="bg-white border-gray-200 shadow-sm rounded-xl">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-xl">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">{stats.totalStudents}</div>
                    <div className="text-xs text-gray-600">Tổng học sinh</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-gray-200 shadow-sm rounded-xl">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-xl">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">{stats.totalTeachers}</div>
                    <div className="text-xs text-gray-600">Giáo viên chủ nhiệm</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Classes by Grade */}
      <div className="space-y-6">
        {Object.entries(classesByGrade).map(([grade, gradeClasses]) => {
          const gradeNum = parseInt(grade);
          const isExpanded = expandedGrades.includes(gradeNum);
          const totalStudents = gradeClasses.reduce((sum, cls) => sum + cls.students, 0);
          
          return (
            <div key={grade}>
              {/* Grade Header */}
              <div 
                className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl cursor-pointer hover:bg-blue-100 transition-colors mb-4"
                onClick={() => toggleGrade(gradeNum)}
              >
                  <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-blue-600" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-blue-600" />
                  )}
                  <h2 className="text-lg font-semibold text-blue-900">{getGradeName(gradeNum)}</h2>
                  <Badge className="bg-blue-100 text-blue-800 text-xs">
                    {gradeClasses.length} lớp
                    </Badge>
                  </div>
                <div className="text-sm text-blue-700 font-medium">
                  {totalStudents} học sinh
                  </div>
                </div>

              {/* Class Cards Grid */}
              {isExpanded && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {gradeClasses.map((cls) => (
                    <Card key={cls.id} className="bg-white border-gray-200 shadow-sm rounded-2xl hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                        {/* Header with class name and actions */}
                          <div className="flex justify-between items-start mb-3">
                          <h3 className="font-bold text-lg text-gray-900">{cls.name}</h3>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                              onClick={() => handleEditClass(cls)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
                              onClick={() => handleDeleteClass(cls)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Class Info */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{cls.students} học sinh</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{cls.teacher}</span>
                          </div>
                        </div>

                        {/* Main Action Button */}
                        <Button 
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
                          onClick={() => handleViewClass(cls)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Xem chi tiết
                        </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
              )}
            </div>
          );
        })}
        </div>

        {/* Empty State */}
      {Object.keys(classesByGrade).length === 0 && (
        <Card className="text-center py-12 bg-white border-gray-200 shadow-sm rounded-2xl">
            <CardContent>
            <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy lớp học</h3>
              <p className="text-gray-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </CardContent>
          </Card>
        )}

      {/* Create Class Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle>Thêm lớp học mới</DialogTitle>
            <DialogDescription>Tạo lớp học mới. Điền thông tin bắt buộc bên dưới.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="grade" className="text-right">Khối *</Label>
              <div className="col-span-3">
                <SimpleSelect 
                  value={(newClass.grade ?? '').toString()} 
                  onValueChange={(value) => setNewClass({ ...newClass, grade: parseInt(value) })}
                  placeholder="Chọn khối"
                  options={grades.map(g => ({ value: g.value.toString(), label: g.label }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Tên lớp *</Label>
              <div className="col-span-3">
                <Input
                  id="name"
                  value={newClass.name}
                  onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                  placeholder="Nhập tên lớp (VD: A1)"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="academicYear" className="text-right">Năm học *</Label>
              <div className="col-span-3">
                <SimpleSelect 
                  value={newClass.academicYear} 
                  onValueChange={(value) => setNewClass({ ...newClass, academicYear: value })}
                  placeholder="Chọn năm học"
                  options={academicYears}
                />
              </div>
            </div>
            {/* GVCN field removed: backend DTO không hỗ trợ teacherId trong Create/Update */}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleCreateClass}>
              Tạo lớp học
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Class Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa lớp học</DialogTitle>
            <DialogDescription>Cập nhật thông tin lớp học. Điền thông tin bắt buộc bên dưới.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-grade" className="text-right">Khối *</Label>
              <div className="col-span-3">
                <SimpleSelect 
                  value={(newClass.grade ?? '').toString()} 
                  onValueChange={(value) => setNewClass({ ...newClass, grade: parseInt(value) })}
                  placeholder="Chọn khối"
                  options={grades.map(g => ({ value: g.value.toString(), label: g.label }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">Tên lớp *</Label>
              <div className="col-span-3">
                <Input
                  id="edit-name"
                  value={newClass.name}
                  onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                  placeholder="Nhập tên lớp (VD: A1)"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-academicYear" className="text-right">Năm học *</Label>
              <div className="col-span-3">
                <SimpleSelect 
                  value={newClass.academicYear} 
                  onValueChange={(value) => setNewClass({ ...newClass, academicYear: value })}
                  placeholder="Chọn năm học"
                  options={academicYears}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">Mô tả</Label>
              <div className="col-span-3">
                <Input
                  id="edit-description"
                  value={newClass.description}
                  onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
                  placeholder="Nhập mô tả lớp học"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Hủy
            </Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleUpdateClass}>
              Cập nhật lớp học
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal for Delete */}
      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle>Xóa lớp học</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa lớp học này? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          
          {classToDelete && (
            <div className="py-4">
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Tên lớp:</span>
                    <p className="text-gray-900 mt-1">{classToDelete.name}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Khối:</span>
                    <p className="text-gray-900 mt-1">{getGradeName(classToDelete.grade)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Năm học:</span>
                    <p className="text-gray-900 mt-1">{classToDelete.academicYear}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Giáo viên:</span>
                    <p className="text-gray-900 mt-1">{classToDelete.teacher}</p>
                  </div>
                </div>
      </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsConfirmModalOpen(false);
                setClassToDelete(null);
              }}
            >
              Hủy
            </Button>
            <Button 
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Xóa lớp học
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
