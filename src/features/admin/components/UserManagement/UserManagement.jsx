import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/common/components/ui/card"
import { Button } from "@/common/components/ui/button"
import { Input } from "@/common/components/ui/input"
import { Badge } from "@/common/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/common/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, useDropdownMenu } from "@/common/components/ui/dropdown-menu"
import { SimpleSelect, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/common/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/common/components/ui/dialog"
import { Label } from "@/common/components/ui/label"
import {
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Upload,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
} from "lucide-react"
import { useAuthApi } from "@/features/auth/hooks/useAuthApi"
import { toast } from "react-toastify";

// Mock user data
const mockUsers = [
  {
    id: 1,
    name: "Nguyễn Văn An",
    email: "an.nguyen@fpt.edu.vn",
    role: "Student",
    status: "Active",
    class: "10A1",
  },
  {
    id: 2,
    name: "Trần Thị Bình",
    email: "binh.tran@fpt.edu.vn",
    role: "Student",
    status: "Active",
    class: "10A2",
  },
  {
    id: 3,
    name: "Lê Minh Cường",
    email: "cuong.le@fpt.edu.vn",
    role: "Admin",
    status: "Active",
    class: "Admin",
  },
  {
    id: 4,
    name: "Phạm Thu Dung",
    email: "dung.pham@fpt.edu.vn",
    role: "Student",
    status: "Inactive",
    class: "11B1",
  },
  {
    id: 5,
    name: "Hoàng Văn Em",
    email: "em.hoang@fpt.edu.vn",
    role: "Teacher",
    status: "Active",
    class: "Giáo viên",
  },
]

const academicYears = [
  { value: "2024-2025", label: "2024-2025" },
  { value: "2023-2024", label: "2023-2024" },
  { value: "2022-2023", label: "2022-2023" },
]

// Mock data for dropdowns
const subjects = [
  { value: "Toán", label: "Toán" },
  { value: "Ngữ văn", label: "Ngữ văn" },
  { value: "Tiếng Anh", label: "Tiếng Anh" },
  { value: "Vật lý", label: "Vật lý" },
  { value: "Hóa học", label: "Hóa học" },
  { value: "Sinh học", label: "Sinh học" },
  { value: "Lịch sử", label: "Lịch sử" },
  { value: "Địa lý", label: "Địa lý" },
  { value: "GDCD", label: "GDCD" },
  { value: "Tin học", label: "Tin học" },
  { value: "Thể dục", label: "Thể dục" },
]

const grades = [
  { value: 10, label: "Khối 10" },
  { value: 11, label: "Khối 11" },
  { value: 12, label: "Khối 12" },
]

const getClassesByGrade = (grade) => {
  const classMap = {
    10: [
      { value: 1, label: "Lớp 10A1" },
      { value: 2, label: "Lớp 10A2" },
      { value: 3, label: "Lớp 10A3" },
      { value: 4, label: "Lớp 10B1" },
      { value: 5, label: "Lớp 10B2" },
    ],
    11: [
      { value: 6, label: "Lớp 11A1" },
      { value: 7, label: "Lớp 11A2" },
      { value: 8, label: "Lớp 11A3" },
      { value: 9, label: "Lớp 11B1" },
      { value: 10, label: "Lớp 11B2" },
    ],
    12: [
      { value: 11, label: "Lớp 12A1" },
      { value: 12, label: "Lớp 12A2" },
      { value: 13, label: "Lớp 12A3" },
      { value: 14, label: "Lớp 12B1" },
      { value: 15, label: "Lớp 12B2" },
    ],
  }
  return classMap[grade] || []
}

const enrollmentYears = [
  { value: 2024, label: "2024" },
  { value: 2023, label: "2023" },
  { value: 2022, label: "2022" },
  { value: 2021, label: "2021" },
]

// Component riêng cho Dropdown Actions
const UserActionsDropdown = ({ userId, onDelete }) => {
  const { isOpen, openMenu, closeMenu, toggleMenu } = useDropdownMenu();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" onClick={toggleMenu}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        isOpen={isOpen} 
        onClose={closeMenu}
      >
        <DropdownMenuItem onClick={closeMenu}>
          <Eye className="mr-2 h-4 w-4" />
          Xem chi tiết
        </DropdownMenuItem>
        <DropdownMenuItem onClick={closeMenu}>
          <Edit className="mr-2 h-4 w-4" />
          Chỉnh sửa
        </DropdownMenuItem>
        <DropdownMenuItem 
          variant="destructive" 
          onClick={() => {
            onDelete();
            closeMenu();
          }}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Xóa người dùng
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default function UserManagement() {
  const [users, setUsers] = useState(mockUsers)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [roleFilter, setRoleFilter] = useState("all")
  const [selectedYear, setSelectedYear] = useState("2024-2025")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [sortField, setSortField] = useState("id")
  const [sortDirection, setSortDirection] = useState("asc")
  const [newUser, setNewUser] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    role: 0, // Default to Admin
    // Student fields
    studentNumber: "", // Sẽ đổi thành mã học sinh
    enrollmentYear: 2024,
    birthDate: "",
    grade: "", // Khối
    classGroupId: "",
    // Teacher fields
    teacherCode: "",
    subject: "", // Môn học thay vì khoa
  })
  
  const [formErrors, setFormErrors] = useState({})
  const { createUser } = useAuthApi();

  // Reset form when role changes
  const handleRoleChange = (newRole) => {
    const baseUser = {
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      phoneNumber: newUser.phoneNumber,
      role: parseInt(newRole), // Convert string back to number
      // Clear role-specific fields
      studentNumber: "",
      enrollmentYear: 2024,
      birthDate: "",
      grade: "",
      classGroupId: "",
      teacherCode: "",
      subject: "",
    }
    setNewUser(baseUser)
    setFormErrors({})
  }

  // Validation function
  const validateForm = () => {
    const errors = {}
    
    // Common fields validation
    if (!newUser.email.trim()) errors.email = "Email là bắt buộc"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) errors.email = "Email không hợp lệ"
    if (!newUser.firstName.trim()) errors.firstName = "Tên là bắt buộc"
    if (!newUser.lastName.trim()) errors.lastName = "Họ là bắt buộc"
    
    // Role-specific validation
    if (newUser.role === 0) { // Admin
      // Không cần password cho admin
    }
    
    if (newUser.role === 1) { // Student
      if (!newUser.phoneNumber.trim()) errors.phoneNumber = "Số điện thoại là bắt buộc"
      if (!/^(\+84|0)[3|5|7|8|9][0-9]{8}$/.test(newUser.phoneNumber)) errors.phoneNumber = "Số điện thoại không hợp lệ"
      if (!newUser.studentNumber.trim()) errors.studentNumber = "Mã học sinh là bắt buộc"
      if (!newUser.birthDate) errors.birthDate = "Ngày sinh là bắt buộc"
      if (!newUser.grade) errors.grade = "Khối là bắt buộc"
      if (!newUser.classGroupId) errors.classGroupId = "Lớp học là bắt buộc"
    }
    
    if (newUser.role === 2) { // Teacher
      // Không cần password cho teacher
      if (!newUser.teacherCode.trim()) errors.teacherCode = "Mã giáo viên là bắt buộc"
      if (!newUser.subject.trim()) errors.subject = "Môn học là bắt buộc"
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Filter and sort users
  const filteredAndSortedUsers = users
    .filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || user.status.toLowerCase() === statusFilter
    const matchesRole = roleFilter === "all" || user.role.toLowerCase() === roleFilter

    return matchesSearch && matchesStatus && matchesRole
  })
    .sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]

      if (typeof aValue === "string" && typeof bValue === "string") {
        const comparison = aValue.localeCompare(bValue)
        return sortDirection === "asc" ? comparison : -comparison
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue
      }

      return 0
    })

  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedUsers = filteredAndSortedUsers.slice(startIndex, endIndex)

  const handleSearchChange = (value) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value)
    setCurrentPage(1)
  }

  const handleRoleFilterChange = (value) => {
    setRoleFilter(value)
    setCurrentPage(1)
  }

  const handleDeleteUser = (userId) => {
    setUsers(users.filter((user) => user.id !== userId))
  }

  const handleExcelImport = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      toast.info(`Đã chọn tệp: ${file.name}. Chức năng nhập từ Excel sẽ được triển khai tại đây.`)
      event.target.value = ""
    }
  }

  const handleCreateUser = () => {
    if (!validateForm()) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc và sửa lỗi")
      return
    }

    // Create user based on role
    const userData = {
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: newUser.role,
    }

    // Add role-specific fields
    if (newUser.role === 0) { // Admin
      // Không cần thêm gì cho admin
    } else if (newUser.role === 1) { // Student
      userData.phoneNumber = newUser.phoneNumber
      userData.studentNumber = newUser.studentNumber
      userData.enrollmentYear = newUser.enrollmentYear
      userData.birthDate = newUser.birthDate
      userData.grade = newUser.grade
      userData.classGroupId = newUser.classGroupId
    } else if (newUser.role === 2) { // Teacher
      userData.teacherCode = newUser.teacherCode
      userData.subject = newUser.subject
    }

    console.log("Creating user:", userData)
    
    // Mock user for display (adapt to your current table structure)
    const displayUser = {
      id: users.length + 1,
      name: `${newUser.firstName} ${newUser.lastName}`,
      email: newUser.email,
      role: newUser.role === 0 ? "Admin" : newUser.role === 1 ? "Student" : "Teacher",
      status: "Active",
      class: newUser.role === 1 ? getClassesByGrade(newUser.grade).find(c => c.value === newUser.classGroupId)?.label || "Chưa phân lớp" : 
             newUser.role === 2 ? newUser.subject : "Admin",
    }

    setUsers([...users, displayUser])
    
    // Reset form
    setNewUser({
      email: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      role: 0, // Default to Admin
      studentNumber: "",
      enrollmentYear: 2024,
      birthDate: "",
      grade: "",
      classGroupId: "",
      teacherCode: "",
      subject: "",
    })
    setFormErrors({})
    setIsModalOpen(false)
    toast.success("Tạo người dùng thành công!")
  }

  const getStatusBadge = (status) => {
    return status === "Active" ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Hoạt động</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Không hoạt động</Badge>
    )
  }

  const getRoleBadge = (role) => {
    const roleColors = {
      Admin: "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden border-transparent [a&]:hover:bg-primary/90 bg-purple-100 text-purple-800 hover:bg-purple-100",
      Teacher: "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden border-transparent [a&]:hover:bg-primary/90 bg-blue-100 text-blue-800 hover:bg-blue-100",
      Student: "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden border-transparent [a&]:hover:bg-primary/90 bg-gray-100 text-gray-800 hover:bg-gray-100",
    }
    const roleNames = {
      Admin: "Quản trị viên",
      Teacher: "Giáo viên",
      Student: "Học sinh",
    }
    return (
      <span className={roleColors[role] || roleColors.Student}>
        {roleNames[role] || role}
      </span>
    )
  }

  const SortHeader = ({ field, children }) => (
    <TableHead className="cursor-pointer hover:bg-gray-50 select-none" onClick={() => handleSort(field)}>
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className="h-3 w-3 text-gray-400" />
      </div>
    </TableHead>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Người dùng</h1>
          <p className="text-gray-600 mt-1">Quản lý và giám sát tất cả người dùng trên nền tảng</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleExcelImport}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              id="excel-import"
            />
            <Button variant="outline" className="!border-green-600 !text-green-600 hover:!bg-green-50 !bg-transparent">
              <Upload className="h-4 w-4 mr-2" />
              Nhập từ Excel
            </Button>
          </div>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="!bg-blue-600 hover:!bg-blue-700 !text-white"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Thêm người dùng mới
          </Button>
        </div>
      </div>

      {/* Dialog Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <div style={{ display: 'none' }}></div>
        </DialogTrigger>
        <DialogContent 
          className="!sm:max-w-[425px] !bg-white !p-6 !rounded-lg !shadow-lg !border-0 !outline-none !ring-0" 
          showCloseButton={true}
          onClose={() => setIsModalOpen(false)}
        >
          <DialogHeader className="!flex !flex-col !gap-2 !text-center sm:!text-left !mb-4">
            <DialogTitle className="!text-lg !font-semibold !text-gray-900">Thêm người dùng mới</DialogTitle>
            <DialogDescription className="!text-sm !text-gray-500">Tạo tài khoản người dùng mới. Điền thông tin bắt buộc bên dưới.</DialogDescription>
          </DialogHeader>
          <div className="!grid !gap-4 !py-4">
            {/* Role Selection - Always First */}
            <div className="!grid !grid-cols-4 !items-center !gap-4">
              <Label htmlFor="role" className="!text-right !text-sm !font-medium !text-gray-700">
                Vai trò *
              </Label>
              <div className="!col-span-3">
                <SimpleSelect 
                  value={newUser.role.toString()} 
                  onValueChange={handleRoleChange}
                  placeholder="Chọn vai trò"
                  options={[
                    { value: "0", label: "Quản trị viên" },
                    { value: "1", label: "Học sinh" },
                    { value: "2", label: "Giáo viên" }
                  ]}
                  className="!w-full"
                />
                {formErrors.role && <span className="!text-red-500 !text-xs !mt-1">{formErrors.role}</span>}
              </div>
            </div>

            {/* Common Fields */}
            <div className="!grid !grid-cols-4 !items-center !gap-4">
              <Label htmlFor="firstName" className="!text-right !text-sm !font-medium !text-gray-700">
                Tên *
              </Label>
              <div className="!col-span-3">
                <Input
                  id="firstName"
                  value={newUser.firstName}
                  onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                  className="!h-10 !w-full !rounded-md !border !border-gray-300 !bg-white !px-3 !py-2 !text-sm"
                  placeholder="Nhập tên"
                />
                {formErrors.firstName && <span className="!text-red-500 !text-xs !mt-1">{formErrors.firstName}</span>}
              </div>
            </div>

            <div className="!grid !grid-cols-4 !items-center !gap-4">
              <Label htmlFor="lastName" className="!text-right !text-sm !font-medium !text-gray-700">
                Họ *
              </Label>
              <div className="!col-span-3">
                <Input
                  id="lastName"
                  value={newUser.lastName}
                  onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                  className="!h-10 !w-full !rounded-md !border !border-gray-300 !bg-white !px-3 !py-2 !text-sm"
                  placeholder="Nhập họ"
                />
                {formErrors.lastName && <span className="!text-red-500 !text-xs !mt-1">{formErrors.lastName}</span>}
              </div>
            </div>

            <div className="!grid !grid-cols-4 !items-center !gap-4">
              <Label htmlFor="email" className="!text-right !text-sm !font-medium !text-gray-700">
                Email *
              </Label>
              <div className="!col-span-3">
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="!h-10 !w-full !rounded-md !border !border-gray-300 !bg-white !px-3 !py-2 !text-sm"
                  placeholder="Nhập địa chỉ email"
                />
                {formErrors.email && <span className="!text-red-500 !text-xs !mt-1">{formErrors.email}</span>}
              </div>
            </div>

            {/* Admin Fields */}
            {newUser.role === 0 && (
              <div className="!text-sm !text-gray-500 !text-center !py-4">
                Quản trị viên chỉ cần thông tin cơ bản
              </div>
            )}
             
            {/* Student Fields */}
            {newUser.role === 1 && (
              <>
                <div className="!grid !grid-cols-4 !items-center !gap-4">
                  <Label htmlFor="phoneNumber" className="!text-right !text-sm !font-medium !text-gray-700">
                    Số điện thoại *
                  </Label>
                  <div className="!col-span-3">
                    <Input
                      id="phoneNumber"
                      value={newUser.phoneNumber}
                      onChange={(e) => setNewUser({ ...newUser, phoneNumber: e.target.value })}
                      className="!h-10 !w-full !rounded-md !border !border-gray-300 !bg-white !px-3 !py-2 !text-sm"
                      placeholder="+84901234567"
                    />
                    {formErrors.phoneNumber && <span className="!text-red-500 !text-xs !mt-1">{formErrors.phoneNumber}</span>}
                  </div>
                </div>

                <div className="!grid !grid-cols-4 !items-center !gap-4">
                  <Label htmlFor="studentNumber" className="!text-right !text-sm !font-medium !text-gray-700">
                    Mã học sinh *
                  </Label>
                  <div className="!col-span-3">
                    <Input
                      id="studentNumber"
                      value={newUser.studentNumber}
                      onChange={(e) => setNewUser({ ...newUser, studentNumber: e.target.value })}
                      className="!h-10 !w-full !rounded-md !border !border-gray-300 !bg-white !px-3 !py-2 !text-sm"
                      placeholder="HS2024001"
                    />
                    {formErrors.studentNumber && <span className="!text-red-500 !text-xs !mt-1">{formErrors.studentNumber}</span>}
                  </div>
                </div>

                <div className="!grid !grid-cols-4 !items-center !gap-4">
                  <Label htmlFor="enrollmentYear" className="!text-right !text-sm !font-medium !text-gray-700">
                    Năm nhập học *
                  </Label>
                  <div className="!col-span-3">
                    <SimpleSelect 
                      value={newUser.enrollmentYear.toString()} 
                      onValueChange={(value) => setNewUser({ ...newUser, enrollmentYear: parseInt(value) })}
                      placeholder="Chọn năm nhập học"
                      options={enrollmentYears.map(y => ({ value: y.value.toString(), label: y.label }))}
                      className="!w-full"
                    />
                    {formErrors.enrollmentYear && <span className="!text-red-500 !text-xs !mt-1">{formErrors.enrollmentYear}</span>}
                  </div>
                </div>

                <div className="!grid !grid-cols-4 !items-center !gap-4">
                  <Label htmlFor="birthDate" className="!text-right !text-sm !font-medium !text-gray-700">
                    Ngày sinh *
                  </Label>
                  <div className="!col-span-3">
                    <Input
                      id="birthDate"
                      type="date"
                      value={newUser.birthDate}
                      onChange={(e) => setNewUser({ ...newUser, birthDate: e.target.value })}
                      className="!h-10 !w-full !rounded-md !border !border-gray-300 !bg-white !px-3 !py-2 !text-sm"
                    />
                    {formErrors.birthDate && <span className="!text-red-500 !text-xs !mt-1">{formErrors.birthDate}</span>}
                  </div>
                </div>

                <div className="!grid !grid-cols-4 !items-center !gap-4">
                  <Label htmlFor="grade" className="!text-right !text-sm !font-medium !text-gray-700">
                    Khối *
                  </Label>
                  <div className="!col-span-3">
                    <SimpleSelect 
                      value={newUser.grade.toString()} 
                      onValueChange={(value) => setNewUser({ ...newUser, grade: parseInt(value), classGroupId: "" })}
                      placeholder="Chọn khối"
                      options={grades.map(g => ({ value: g.value.toString(), label: g.label }))}
                      className="!w-full"
                    />
                    {formErrors.grade && <span className="!text-red-500 !text-xs !mt-1">{formErrors.grade}</span>}
                  </div>
                </div>

                <div className="!grid !grid-cols-4 !items-center !gap-4">
                  <Label htmlFor="classGroupId" className="!text-right !text-sm !font-medium !text-gray-700">
                    Lớp học *
                  </Label>
                  <div className="!col-span-3">
                    <SimpleSelect 
                      value={newUser.classGroupId.toString()} 
                      onValueChange={(value) => setNewUser({ ...newUser, classGroupId: parseInt(value) })}
                      placeholder={newUser.grade ? "Chọn lớp học" : "Vui lòng chọn khối trước"}
                      options={newUser.grade ? getClassesByGrade(newUser.grade).map(c => ({ value: c.value.toString(), label: c.label })) : []}
                      className="!w-full"
                      disabled={!newUser.grade}
                    />
                    {formErrors.classGroupId && <span className="!text-red-500 !text-xs !mt-1">{formErrors.classGroupId}</span>}
                  </div>
                </div>
              </>
            )}

            {/* Teacher Fields */}
            {newUser.role === 2 && (
              <>
                <div className="!grid !grid-cols-4 !items-center !gap-4">
                  <Label htmlFor="teacherCode" className="!text-right !text-sm !font-medium !text-gray-700">
                    Mã giáo viên *
                  </Label>
                  <div className="!col-span-3">
                    <Input
                      id="teacherCode"
                      value={newUser.teacherCode}
                      onChange={(e) => setNewUser({ ...newUser, teacherCode: e.target.value })}
                      className="!h-10 !w-full !rounded-md !border !border-gray-300 !bg-white !px-3 !py-2 !text-sm"
                      placeholder="GV001"
                    />
                    {formErrors.teacherCode && <span className="!text-red-500 !text-xs !mt-1">{formErrors.teacherCode}</span>}
                  </div>
                </div>

                <div className="!grid !grid-cols-4 !items-center !gap-4">
                  <Label htmlFor="subject" className="!text-right !text-sm !font-medium !text-gray-700">
                    Môn học *
                  </Label>
                  <div className="!col-span-3">
                    <SimpleSelect 
                      value={newUser.subject} 
                      onValueChange={(value) => setNewUser({ ...newUser, subject: value })}
                      placeholder="Chọn môn học"
                      options={subjects}
                      className="!w-full"
                    />
                    {formErrors.subject && <span className="!text-red-500 !text-xs !mt-1">{formErrors.subject}</span>}
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter className="!flex !flex-col-reverse !gap-2 sm:!flex-row sm:!justify-end !mt-6">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="!border !border-gray-300 !bg-white !text-gray-700 hover:!bg-gray-50 !px-4 !py-2 !rounded-md">
              Hủy
            </Button>
            <Button onClick={handleCreateUser} className="!bg-blue-600 hover:!bg-blue-700 !text-white !px-4 !py-2 !rounded-md">
              Tạo người dùng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900">{users.length}</div>
            <p className="text-sm text-gray-600">Tổng người dùng</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{users.filter((u) => u.status === "Active").length}</div>
            <p className="text-sm text-gray-600">Người dùng hoạt động</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{users.filter((u) => u.role === "Student").length}</div>
            <p className="text-sm text-gray-600">Học sinh</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {users.filter((u) => u.role === "Admin" || u.role === "Teacher").length}
            </div>
            <p className="text-sm text-gray-600">Giáo viên</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Người dùng</CardTitle>
          <CardDescription>Tìm kiếm và lọc người dùng theo nhiều tiêu chí khác nhau</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Niên khóa:</span>
              <SimpleSelect 
                value={selectedYear} 
                onValueChange={setSelectedYear}
                placeholder="Chọn niên khóa"
                options={academicYears}
                className="w-40"
              />
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm theo tên hoặc email..."
                  value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            <SimpleSelect 
              value={statusFilter} 
              onValueChange={handleStatusFilterChange}
              placeholder="Lọc theo trạng thái"
              options={[
                { value: "all", label: "Tất cả trạng thái" },
                { value: "active", label: "Hoạt động" },
                { value: "inactive", label: "Không hoạt động" }
              ]}
              className="w-full sm:w-[180px]"
            />
            <SimpleSelect 
              value={roleFilter} 
              onValueChange={handleRoleFilterChange}
              placeholder="Lọc theo vai trò"
              options={[
                { value: "all", label: "Tất cả vai trò" },
                { value: "student", label: "Học sinh" },
                { value: "teacher", label: "Giáo viên" },
                { value: "admin", label: "Quản trị viên" }
              ]}
              className="w-full sm:w-[180px]"
            />
            </div>

          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Hiển thị</span>
              <SimpleSelect
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value))
                  setCurrentPage(1)
                }}
                options={[
                  { value: "5", label: "5" },
                  { value: "10", label: "10" },
                  { value: "20", label: "20" },
                  { value: "50", label: "50" }
                ]}
                className="w-20"
              />
              <span className="text-sm text-gray-600">mục</span>
            </div>
            <div className="text-sm text-gray-600">
              Hiển thị {startIndex + 1} đến {Math.min(endIndex, filteredAndSortedUsers.length)} trong tổng số{" "}
              {filteredAndSortedUsers.length} mục
            </div>
          </div>

          <div className="rounded-md border" style={{ borderColor: '#e5e7eb' }}>
            <Table>
              <TableHeader>
                <TableRow style={{ borderBottomColor: '#e5e7eb' }}>
                  <SortHeader field="id">ID</SortHeader>
                  <SortHeader field="name">Họ tên</SortHeader>
                  <SortHeader field="email">Email</SortHeader>
                  <SortHeader field="role">Vai trò</SortHeader>
                  <SortHeader field="class">Lớp</SortHeader>
                  <SortHeader field="status">Trạng thái</SortHeader>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map((user) => (
                  <TableRow key={user.id} style={{ borderBottomColor: '#e5e7eb' }}>
                    <TableCell className="font-medium">{user.id}</TableCell>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-gray-600">{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell className="text-gray-600">{user.class}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell className="text-right">
                      <UserActionsDropdown userId={user.id} onDelete={() => handleDeleteUser(user.id)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Trang {currentPage} / {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Trước
                </Button>

                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Tiếp theo
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {filteredAndSortedUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Không tìm thấy người dùng nào phù hợp với tiêu chí của bạn.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
