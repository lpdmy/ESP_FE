import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/common/components/ui/card"
import { Button } from "@/common/components/ui/button"
import { Input } from "@/common/components/ui/input"
import { Badge } from "@/common/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/common/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, useDropdownMenu } from "@/common/components/ui/dropdown-menu"
import { SimpleSelect} from "@/common/components/ui/select"
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
  UserCheck,
  UserX,
} from "lucide-react"
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useUserApi } from "@/features/admin/hooks/useUserApi"
import { useAuthApi } from "@/features/auth/hooks/useAuthApi"
import { formatDateForAPI, formatDateForInput, isValidUrlOrEmpty, formatUrlForAPI } from "@/utils/dateUtils"

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

const subjects = [
  { value: "Toán", label: "Toán" },
  { value: "Lý", label: "Vật lý" },
  { value: "Hóa", label: "Hóa học" },
  { value: "Sinh", label: "Sinh học" },
  { value: "Văn", label: "Ngữ văn" },
  { value: "Sử", label: "Lịch sử" },
  { value: "Địa", label: "Địa lý" },
  { value: "Anh", label: "Tiếng Anh" },
  { value: "Tin", label: "Tin học" },
  { value: "GDCD", label: "Giáo dục công dân" },
]

// Generate enrollment years dynamically (current year and 2 previous years)
const currentYear = new Date().getFullYear();
const enrollmentYears = [
  { value: currentYear, label: currentYear.toString() },
  { value: currentYear - 1, label: (currentYear - 1).toString() },
  { value: currentYear - 2, label: (currentYear - 2).toString() },
]

const getClassesByGrade = (grade) => {
  const classMap = {
    10: [
      { value: 1, label: "10A1" },
      { value: 2, label: "10A2" },
      { value: 3, label: "10A3" },
    ],
    11: [
      { value: 4, label: "11A1" },
      { value: 5, label: "11A2" },
      { value: 6, label: "11A3" },
    ],
    12: [
      { value: 7, label: "12A1" },
      { value: 8, label: "12A2" },
      { value: 9, label: "12A3" },
    ],
  }
  return classMap[grade] || []
}

const UserActionsDropdown = ({ user, onView, onEdit, onDelete }) => {
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
        <DropdownMenuItem onClick={() => {
          onView(user);
          closeMenu();
        }}>
          <Eye className="mr-2 h-4 w-4" />
          Xem chi tiết
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => {
          onEdit(user);
          closeMenu();
        }}>
          <Edit className="mr-2 h-4 w-4" />
          Chỉnh sửa
        </DropdownMenuItem>
        <DropdownMenuItem 
          variant={user.status === 1 ? "destructive" : "default"}
          onClick={() => {
            onDelete(user);
            closeMenu();
          }}
        >
          {user.status === 1 ? (
            <UserX className="mr-2 h-4 w-4" />
          ) : (
            <UserCheck className="mr-2 h-4 w-4" />
          )}
          {user.status === 1 ? 'Vô hiệu hóa' : 'Kích hoạt'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [actualSearchTerm, setActualSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [roleFilter, setRoleFilter] = useState("all")
  const [selectedYear, setSelectedYear] = useState("2024-2025")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [userToToggle, setUserToToggle] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [sortField, setSortField] = useState("id")
  const [sortDirection, setSortDirection] = useState("asc")
  const { getAllUsers, deleteUser, updateUser, getUserStatistics, loading } = useUserApi();
  const currentUser = useSelector((state) => state.user.user);
  const [newUser, setNewUser] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    role: 0, // Default to Admin
    avatarUrl: "",
    status: 1, // Default to Active
    // Student fields
    studentNumber: "", // Sẽ đổi thành mã học sinh
    enrollmentYear: currentYear,
    birthDate: "",
    grade: "", // Khối
    classGroupId: "",
    // Teacher fields
    teacherCode: "",
    position: "", // Vị trí thay vì môn học
  })
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  
  // Stats for total counts
  const [totalStats, setTotalStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    students: 0,
    teachers: 0,
    admins: 0
  });
  
  
  // Fetch total stats (without pagination)
  const fetchTotalStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await getUserStatistics(token);
      if (response?.data) {
        setTotalStats({
          totalUsers: response.data.totalUsers,
          activeUsers: response.data.activeUsers,
          students: response.data.students,
          teachers: response.data.teachers,
          admins: response.data.admins
        });
      }
    } catch (error) {
      console.error("Error fetching total stats:", error);
    }
  };
  
  const fetchUsers = async () => {
    try {
      console.log("Fetching users with params:", { pageNumber, pageSize, searchTerm: actualSearchTerm, statusFilter, roleFilter });
      
      // Check current user info from Redux
      console.log("Current user from Redux:", currentUser);
      console.log("Current user role:", currentUser?.role);
      
      // Check if user has Admin role
      if (currentUser?.role !== 0) {
        console.error("User does not have Admin role. Current role:", currentUser?.role);
        toast.error("Bạn không có quyền truy cập chức năng này");
        return;
      }
      
      // Prepare filter parameters
      const statusParam = statusFilter === "all" ? null : parseInt(statusFilter);
      const roleParam = roleFilter === "all" ? null : roleFilter;
      
      // Send all parameters to backend for filtering and sorting
      const response = await getAllUsers(pageNumber, pageSize, actualSearchTerm, statusParam, roleParam, sortField, sortDirection);
      console.log("API Response:", response);
      
      if (response?.data) {
        // Backend returns PaginationResponseDto<UserDto>
        const userData = response.data.data || [];
        const totalCount = response.data.totalCount || 0;
        
        console.log("User data:", userData);
        console.log("Total count:", totalCount);
        
        const userArray = Array.isArray(userData) ? userData : [];
        
        // Backend now handles all filtering and sorting
        setUsers(userArray);
        setFilteredUsers(userArray);
        setTotalCount(totalCount);
        setTotalPages(Math.ceil(totalCount / pageSize));
        
        // Fetch total stats when no search term (for accurate statistics)
        if (!actualSearchTerm) {
          await fetchTotalStats();
        }
      } else {
        console.warn("No data in response:", response);
        setUsers([]);
        setFilteredUsers([]);
        setTotalCount(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Không thể tải danh sách người dùng");
      setUsers([]);
      setFilteredUsers([]);
      setTotalCount(0);
      setTotalPages(0);
    }
  };

  // Handle search
  const handleSearch = () => {
    setActualSearchTerm(searchTerm);
    setPageNumber(1); // Reset to first page when searching
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm("");
    setActualSearchTerm("");
    setPageNumber(1);
  };


  const [formErrors, setFormErrors] = useState({})
  const { createUser: createUserAuth } = useAuthApi();

  // Reset form when role changes
  const handleRoleChange = (newRole) => {
    const baseUser = {
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      phoneNumber: newUser.phoneNumber,
      role: parseInt(newRole), // Convert string back to number
      avatarUrl: newUser.avatarUrl,
      status: newUser.status, // Keep status
      // Clear role-specific fields
      studentNumber: "",
      enrollmentYear: currentYear,
      birthDate: "",
      grade: "",
      classGroupId: "",
      teacherCode: "",
      position: "",
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
    if (!newUser.firstName.trim()) errors.firstName = "Họ là bắt buộc"
    if (!newUser.lastName.trim()) errors.lastName = "Tên là bắt buộc"
    
    // Avatar URL validation
    if (newUser.avatarUrl && !isValidUrlOrEmpty(newUser.avatarUrl)) {
      errors.avatarUrl = "URL avatar phải là một URL hợp lệ"
    }
    
    // Role-specific validation
    if (newUser.role === 0) { // Admin
      // Không cần password cho admin
    }
    
    if (newUser.role === 4) { // Student
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
      if (!newUser.position.trim()) errors.position = "Vị trí là bắt buộc"
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSort = (field) => {
    let newDirection = "asc";
    if (sortField === field) {
      newDirection = sortDirection === "asc" ? "desc" : "asc";
    }
    
    setSortField(field);
    setSortDirection(newDirection);
    
    // Re-fetch users with new sorting
    fetchUsers();
  }

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setNewUser({
      email: user.email || "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phoneNumber: user.phoneNumber || "",
      role: user.role || 0,
      avatarUrl: user.avatarUrl || "",
      status: user.status !== undefined ? user.status : 1,
      studentNumber: user.studentNumber || "",
      enrollmentYear: user.enrollmentYear || 2024,
      birthDate: formatDateForInput(user.birthdate),
      grade: user.grade || "",
      classGroupId: user.classGroupId || "",
      teacherCode: user.teacherCode || "",
      position: user.position || "",
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!validateForm()) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc và sửa lỗi")
      return
    }

    try {
      const userData = {
        id: selectedUser.id,
        username: newUser.role === 4 ? newUser.studentNumber : newUser.role === 2 ? newUser.teacherCode : newUser.email,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        phoneNumber: newUser.phoneNumber,
        birthDate: formatDateForAPI(newUser.birthDate),
        avatarUrl: formatUrlForAPI(newUser.avatarUrl),
        status: newUser.status
      }

      // Add role-specific fields
      if (newUser.role === 4) { // Student
        userData.studentNumber = newUser.studentNumber
        userData.enrollmentYear = newUser.enrollmentYear
        userData.classGroupId = newUser.classGroupId
      } else if (newUser.role === 2) { // Teacher
        userData.teacherCode = newUser.teacherCode
        userData.position = newUser.position
      }

      console.log("Updating user:", userData)
      
      const token = localStorage.getItem('token');
      await updateUser(userData, token);
      
      // Refresh users list
      await fetchUsers();
      
      // Reset form and close modal
      setNewUser({
        email: "",
        firstName: "",
        lastName: "",
        phoneNumber: "",
        role: 0,
        avatarUrl: "",
        studentNumber: "",
        enrollmentYear: currentYear,
        birthDate: "",
        grade: "",
        classGroupId: "",
        teacherCode: "",
        position: "",
      })
      setFormErrors({})
      setIsEditModalOpen(false)
      toast.success("Cập nhật người dùng thành công!")
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Không thể cập nhật người dùng");
    }
  };

  const handleDeleteUser = (user) => {
    setUserToToggle(user);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!userToToggle) return;
    
    const action = userToToggle.status === 1 ? 'vô hiệu hóa' : 'kích hoạt';
    const newStatus = userToToggle.status === 1 ? 0 : 1;
    
    try {
      const userData = {
        id: userToToggle.id,
        username: userToToggle.role === 4 ? userToToggle.studentNumber : userToToggle.role === 2 ? userToToggle.teacherCode : userToToggle.email,
        email: userToToggle.email,
        firstName: userToToggle.firstName,
        lastName: userToToggle.lastName,
        role: userToToggle.role,
        phoneNumber: userToToggle.phoneNumber,
        birthDate: userToToggle.birthDate,
        avatarUrl: userToToggle.avatarUrl,
        status: newStatus
      }

      // Add role-specific fields
      if (userToToggle.role === 4) { // Student
        userData.studentNumber = userToToggle.studentNumber
        userData.enrollmentYear = userToToggle.enrollmentYear
        userData.classGroupId = userToToggle.classGroupId
      } else if (userToToggle.role === 2) { // Teacher
        userData.teacherCode = userToToggle.teacherCode
        userData.position = userToToggle.position
      }

      console.log("Updating user status:", userData)
      
      const token = localStorage.getItem('token');
      await updateUser(userData, token);
      
      // Refresh users list
      await fetchUsers();
      
      toast.success(`Đã ${action} người dùng thành công!`);
      
      // Close modal and reset state
      setIsConfirmModalOpen(false);
      setUserToToggle(null);
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error(`${action.charAt(0).toUpperCase() + action.slice(1)} người dùng thất bại`);
    }
  };

  const handleExcelImport = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      toast.info(`Đã chọn tệp: ${file.name}. Chức năng nhập từ Excel sẽ được triển khai tại đây.`)
      event.target.value = ""
    }
  }

  const handleCreateUser = async () => {
    if (!validateForm()) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc và sửa lỗi")
      return
    }

    try {
      // Create user based on role
      const userData = {
        username: newUser.role === 4 ? newUser.studentNumber : newUser.role === 2 ? newUser.teacherCode : newUser.email,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        phoneNumber: newUser.phoneNumber,
        birthDate: formatDateForAPI(newUser.birthDate),
        avatarUrl: formatUrlForAPI(newUser.avatarUrl),
        status: newUser.status
      }

      // Add role-specific fields
      if (newUser.role === 4) { // Student
        userData.studentNumber = newUser.studentNumber
        userData.enrollmentYear = newUser.enrollmentYear
        userData.classGroupId = newUser.classGroupId
      } else if (newUser.role === 2) { // Teacher
        userData.teacherCode = newUser.teacherCode
        userData.position = newUser.position
      }

      console.log("Creating user:", userData)
      
      const token = localStorage.getItem('token');
      const res = await createUserAuth(userData, token);
      
      // Refresh users list
      await fetchUsers();
      
      // Reset form
      setNewUser({
        email: "",
        firstName: "",
        lastName: "",
        phoneNumber: "",
        role: 0, // Default to Admin
        avatarUrl: "",
        studentNumber: "",
        enrollmentYear: currentYear,
        birthDate: "",
        grade: "",
        classGroupId: "",
        teacherCode: "",
        position: "",
      })
      setFormErrors({})
      setIsModalOpen(false)
      toast.success("Tạo người dùng thành công!")
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Không thể tạo người dùng");
    }
  }

  const getStatusBadge = (status) => {
    // Handle both number and string status
    const statusValue = typeof status === 'number' ? status : (status === 'Active' ? 1 : 0);
    
    return statusValue === 1 ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Hoạt động</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Không hoạt động</Badge>
    )
  }

  const getRoleBadge = (role) => {
    // Convert number role to string
    let roleKey = role;
    if (typeof role === 'number') {
      const roleMap = { 0: 'Admin', 4: 'Student', 2: 'Teacher' };
      roleKey = roleMap[role] || 'Admin';
    }
    
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
      <span className={roleColors[roleKey] || roleColors.Student}>
        {roleNames[roleKey] || roleKey}
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

  // Fetch users when dependencies change
  useEffect(() => {
    fetchUsers();
  }, [pageNumber, pageSize, actualSearchTerm, statusFilter, roleFilter, sortField, sortDirection]);

  // Fetch total stats only on component mount and when search is cleared
  useEffect(() => {
    if (!actualSearchTerm) {
      fetchTotalStats();
    }
  }, [actualSearchTerm]);

  // Note: All filtering and sorting is now handled by backend for better performance

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
            onClick={() => {
              // Reset form khi mở modal create
              setNewUser({
                email: "",
                firstName: "",
                lastName: "",
                phoneNumber: "",
                role: 0, // Default to Admin
                avatarUrl: "",
                status: 1, // Default to Active
                // Student fields
                studentNumber: "",
                enrollmentYear: currentYear,
                birthDate: "",
                grade: "", // Reset khối
                classGroupId: "", // Reset lớp
                // Teacher fields
                teacherCode: "",
                position: "",
              });
              setFormErrors({});
              setIsModalOpen(true);
            }}
            className="!bg-blue-600 hover:!bg-blue-700 !text-white"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Thêm người dùng mới
          </Button>
        </div>
      </div>

      {/* Dialog Modal */}
      <Dialog open={isModalOpen} onOpenChange={(open) => {
        setIsModalOpen(open);
        if (!open) {
          // Reset form and errors when closing modal
          setNewUser({
            email: "",
            firstName: "",
            lastName: "",
            phoneNumber: "",
            role: 0,
            avatarUrl: "",
            status: 1,
            studentNumber: "",
            enrollmentYear: new Date().getFullYear(),
            birthDate: "",
            grade: "",
            classGroupId: "",
            teacherCode: "",
            position: "",
          });
          setFormErrors({});
        }
      }}>
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
                    { value: "4", label: "Học sinh" },
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
                Họ *
              </Label>
              <div className="!col-span-3">
                <Input
                  id="firstName"
                  value={newUser.firstName}
                  onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                  className="!h-10 !w-full !rounded-md !border !border-gray-300 !bg-white !px-3 !py-2 !text-sm"
                  placeholder="Nhập họ"
                />
                {formErrors.firstName && <span className="!text-red-500 !text-xs !mt-1">{formErrors.firstName}</span>}
              </div>
            </div>

            <div className="!grid !grid-cols-4 !items-center !gap-4">
              <Label htmlFor="lastName" className="!text-right !text-sm !font-medium !text-gray-700">
                Tên *
              </Label>
              <div className="!col-span-3">
                <Input
                  id="lastName"
                  value={newUser.lastName}
                  onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                  className="!h-10 !w-full !rounded-md !border !border-gray-300 !bg-white !px-3 !py-2 !text-sm"
                  placeholder="Nhập tên"
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
            {newUser.role === 4 && (
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
                  <Label htmlFor="position" className="!text-right !text-sm !font-medium !text-gray-700">
                    Vị trí *
                  </Label>
                  <div className="!col-span-3">
                    <Input
                      id="position"
                      value={newUser.position}
                      onChange={(e) => setNewUser({ ...newUser, position: e.target.value })}
                      className="!h-10 !w-full !rounded-md !border !border-gray-300 !bg-white !px-3 !py-2 !text-sm"
                      placeholder="Nhập vị trí công việc"
                    />
                    {formErrors.position && <span className="!text-red-500 !text-xs !mt-1">{formErrors.position}</span>}
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter className="!flex !flex-col-reverse !gap-2 sm:!flex-row sm:!justify-end !mt-6">
            <Button variant="outline" onClick={() => {
              setIsModalOpen(false);
              // Reset form and errors when canceling
              setNewUser({
                email: "",
                firstName: "",
                lastName: "",
                phoneNumber: "",
                role: 0,
                avatarUrl: "",
                status: 1,
                studentNumber: "",
                enrollmentYear: new Date().getFullYear(),
                birthDate: "",
                grade: "",
                classGroupId: "",
                teacherCode: "",
                position: "",
              });
              setFormErrors({});
            }} className="!border !border-gray-300 !bg-white !text-gray-700 hover:!bg-gray-50 !px-4 !py-2 !rounded-md">
              Hủy
            </Button>
            <Button onClick={handleCreateUser} className="!bg-blue-600 hover:!bg-blue-700 !text-white !px-4 !py-2 !rounded-md">
              Tạo người dùng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View User Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="!sm:max-w-[600px] !bg-white !p-6 !rounded-lg !shadow-lg !border-0 !outline-none !ring-0">
          <DialogHeader className="!flex !flex-col !gap-2 !text-center sm:!text-left !mb-4">
            <DialogTitle className="!text-lg !font-semibold !text-gray-900">Chi tiết người dùng</DialogTitle>
            <DialogDescription className="!text-sm !text-gray-500">Thông tin chi tiết về người dùng được chọn</DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="!grid !gap-4 !py-4">
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="!text-sm !font-medium !text-gray-700">Họ tên</Label>
                    <p className="!text-sm !text-gray-900 !mt-1">
                      {selectedUser.name || `${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`.trim() || 'N/A'}
                    </p>
                  </div>
                <div>
                  <Label className="!text-sm !font-medium !text-gray-700">Email</Label>
                  <p className="!text-sm !text-gray-900 !mt-1">{selectedUser.email || 'N/A'}</p>
                </div>
                <div>
                  <Label className="!text-sm !font-medium !text-gray-700">Vai trò</Label>
                  <div className="!mt-1">{getRoleBadge(selectedUser.role)}</div>
                </div>
                <div>
                  <Label className="!text-sm !font-medium !text-gray-700">Trạng thái</Label>
                  <div className="!mt-1">{getStatusBadge(selectedUser.status || 'Active')}</div>
                </div>
                {selectedUser.role === 4 && (
                  <>
                    <div>
                      <Label className="!text-sm !font-medium !text-gray-700">Mã học sinh</Label>
                      <p className="!text-sm !text-gray-900 !mt-1">{selectedUser.studentNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="!text-sm !font-medium !text-gray-700">Năm nhập học</Label>
                      <p className="!text-sm !text-gray-900 !mt-1">{selectedUser.enrollmentYear || 'N/A'}</p>
                    </div>
                      <div>
                        <Label className="!text-sm !font-medium !text-gray-700">Ngày sinh</Label>
                        <p className="!text-sm !text-gray-900 !mt-1">
                          {selectedUser.birthdate ? new Date(selectedUser.birthdate).toLocaleDateString('vi-VN') : 'N/A'}
                        </p>
                    </div>
                    <div>
                      <Label className="!text-sm !font-medium !text-gray-700">Khối</Label>
                      <p className="!text-sm !text-gray-900 !mt-1">{selectedUser.grade || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="!text-sm !font-medium !text-gray-700">Lớp</Label>
                      <p className="!text-sm !text-gray-900 !mt-1">{selectedUser.className || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="!text-sm !font-medium !text-gray-700">Số điện thoại</Label>
                      <p className="!text-sm !text-gray-900 !mt-1">{selectedUser.phoneNumber || 'N/A'}</p>
                    </div>
                  </>
                )}
                {selectedUser.role === 2 && (
                  <>
                    <div>
                      <Label className="!text-sm !font-medium !text-gray-700">Mã giáo viên</Label>
                      <p className="!text-sm !text-gray-600 !mt-1">{selectedUser.teacherCode || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="!text-sm !font-medium !text-gray-700">Vị trí</Label>
                      <p className="!text-sm !text-gray-600 !mt-1">{selectedUser.position || 'N/A'}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter className="!flex !flex-col-reverse !gap-2 sm:!flex-row sm:!justify-end !mt-6">
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)} className="!border !border-gray-300 !bg-white !text-gray-700 hover:!bg-gray-50 !px-4 !py-2 !rounded-md">
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={(open) => {
        setIsEditModalOpen(open);
        if (!open) {
          // Reset form and errors when closing edit modal
          setFormErrors({});
        }
      }}>
        <DialogContent className="!sm:max-w-[425px] !bg-white !p-6 !rounded-lg !shadow-lg !border-0 !outline-none !ring-0">
          <DialogHeader className="!flex !flex-col !gap-2 !text-center sm:!text-left !mb-4">
            <DialogTitle className="!text-lg !font-semibold !text-gray-900">Chỉnh sửa người dùng</DialogTitle>
            <DialogDescription className="!text-sm !text-gray-500">Cập nhật thông tin người dùng. Điền thông tin bắt buộc bên dưới.</DialogDescription>
          </DialogHeader>
          <div className="!grid !gap-4 !py-4">
            {/* Role Selection - Hidden in Update Form */}
            {/* <div className="!grid !grid-cols-4 !items-center !gap-4">
              <Label htmlFor="edit-role" className="!text-right !text-sm !font-medium !text-gray-700">
                Vai trò *
              </Label>
              <div className="!col-span-3">
                <SimpleSelect 
                  value={newUser.role.toString()} 
                  onValueChange={handleRoleChange}
                  placeholder="Chọn vai trò"
                  options={[
                    { value: "0", label: "Quản trị viên" },
                    { value: "4", label: "Học sinh" },
                    { value: "2", label: "Giáo viên" }
                  ]}
                  className="!w-full"
                />
                {formErrors.role && <span className="!text-red-500 !text-xs !mt-1">{formErrors.role}</span>}
              </div>
            </div> */}

            {/* Common Fields */}
            <div className="!grid !grid-cols-4 !items-center !gap-4">
              <Label htmlFor="edit-firstName" className="!text-right !text-sm !font-medium !text-gray-700">
                Họ *
              </Label>
              <div className="!col-span-3">
                <Input
                  id="edit-firstName"
                  value={newUser.firstName}
                  onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                  className="!h-10 !w-full !rounded-md !border !border-gray-300 !bg-white !px-3 !py-2 !text-sm"
                  placeholder="Nhập họ"
                />
                {formErrors.firstName && <span className="!text-red-500 !text-xs !mt-1">{formErrors.firstName}</span>}
              </div>
            </div>

            <div className="!grid !grid-cols-4 !items-center !gap-4">
              <Label htmlFor="edit-lastName" className="!text-right !text-sm !font-medium !text-gray-700">
                Tên *
              </Label>
              <div className="!col-span-3">
                <Input
                  id="edit-lastName"
                  value={newUser.lastName}
                  onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                  className="!h-10 !w-full !rounded-md !border !border-gray-300 !bg-white !px-3 !py-2 !text-sm"
                  placeholder="Nhập tên"
                />
                {formErrors.lastName && <span className="!text-red-500 !text-xs !mt-1">{formErrors.lastName}</span>}
              </div>
            </div>

            <div className="!grid !grid-cols-4 !items-center !gap-4">
              <Label htmlFor="edit-email" className="!text-right !text-sm !font-medium !text-gray-700">
                Email *
              </Label>
              <div className="!col-span-3">
                <Input
                  id="edit-email"
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
            {newUser.role === 4 && (
              <>
                <div className="!grid !grid-cols-4 !items-center !gap-4">
                  <Label htmlFor="edit-phoneNumber" className="!text-right !text-sm !font-medium !text-gray-700">
                    Số điện thoại *
                  </Label>
                  <div className="!col-span-3">
                    <Input
                      id="edit-phoneNumber"
                      value={newUser.phoneNumber}
                      onChange={(e) => setNewUser({ ...newUser, phoneNumber: e.target.value })}
                      className="!h-10 !w-full !rounded-md !border !border-gray-300 !bg-white !px-3 !py-2 !text-sm"
                      placeholder="+84901234567"
                    />
                    {formErrors.phoneNumber && <span className="!text-red-500 !text-xs !mt-1">{formErrors.phoneNumber}</span>}
                  </div>
                </div>

                <div className="!grid !grid-cols-4 !items-center !gap-4">
                  <Label htmlFor="edit-studentNumber" className="!text-right !text-sm !font-medium !text-gray-700">
                    Mã học sinh *
                  </Label>
                  <div className="!col-span-3">
                    <Input
                      id="edit-studentNumber"
                      value={newUser.studentNumber}
                      onChange={(e) => setNewUser({ ...newUser, studentNumber: e.target.value })}
                      className="!h-10 !w-full !rounded-md !border !border-gray-300 !bg-white !px-3 !py-2 !text-sm"
                      placeholder="HS2024001"
                    />
                    {formErrors.studentNumber && <span className="!text-red-500 !text-xs !mt-1">{formErrors.studentNumber}</span>}
                  </div>
                </div>

                <div className="!grid !grid-cols-4 !items-center !gap-4">
                  <Label htmlFor="edit-enrollmentYear" className="!text-right !text-sm !font-medium !text-gray-700">
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
                  <Label htmlFor="edit-birthDate" className="!text-right !text-sm !font-medium !text-gray-700">
                    Ngày sinh *
                  </Label>
                  <div className="!col-span-3">
                    <Input
                      id="edit-birthDate"
                      type="date"
                      value={newUser.birthDate}
                      onChange={(e) => setNewUser({ ...newUser, birthDate: e.target.value })}
                      className="!h-10 !w-full !rounded-md !border !border-gray-300 !bg-white !px-3 !py-2 !text-sm"
                    />
                    {formErrors.birthDate && <span className="!text-red-500 !text-xs !mt-1">{formErrors.birthDate}</span>}
                  </div>
                </div>

                <div className="!grid !grid-cols-4 !items-center !gap-4">
                  <Label htmlFor="edit-grade" className="!text-right !text-sm !font-medium !text-gray-700">
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
                  <Label htmlFor="edit-classGroupId" className="!text-right !text-sm !font-medium !text-gray-700">
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
                  <Label htmlFor="edit-teacherCode" className="!text-right !text-sm !font-medium !text-gray-700">
                    Mã giáo viên *
                  </Label>
                  <div className="!col-span-3">
                    <Input
                      id="edit-teacherCode"
                      value={newUser.teacherCode}
                      onChange={(e) => setNewUser({ ...newUser, teacherCode: e.target.value })}
                      className="!h-10 !w-full !rounded-md !border !border-gray-300 !bg-white !px-3 !py-2 !text-sm"
                      placeholder="GV001"
                    />
                    {formErrors.teacherCode && <span className="!text-red-500 !text-xs !mt-1">{formErrors.teacherCode}</span>}
                  </div>
                </div>

                <div className="!grid !grid-cols-4 !items-center !gap-4">
                  <Label htmlFor="edit-position" className="!text-right !text-sm !font-medium !text-gray-700">
                    Vị trí *
                  </Label>
                  <div className="!col-span-3">
                    <Input
                      id="edit-position"
                      value={newUser.position}
                      onChange={(e) => setNewUser({ ...newUser, position: e.target.value })}
                      className="!h-10 !w-full !rounded-md !border !border-gray-300 !bg-white !px-3 !py-2 !text-sm"
                      placeholder="Nhập vị trí công việc"
                    />
                    {formErrors.position && <span className="!text-red-500 !text-xs !mt-1">{formErrors.position}</span>}
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter className="!flex !flex-col-reverse !gap-2 sm:!flex-row sm:!justify-end !mt-6">
            <Button variant="outline" onClick={() => {
              setIsEditModalOpen(false);
              setFormErrors({});
            }} className="!border !border-gray-300 !bg-white !text-gray-700 hover:!bg-gray-50 !px-4 !py-2 !rounded-md">
              Hủy
            </Button>
            <Button onClick={handleUpdateUser} className="!bg-blue-600 hover:!bg-blue-700 !text-white !px-4 !py-2 !rounded-md">
              Cập nhật người dùng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900">{totalStats.totalUsers}</div>
            <p className="text-sm text-gray-600">Tổng người dùng</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{totalStats.activeUsers}</div>
            <p className="text-sm text-gray-600">Người dùng hoạt động</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{totalStats.students}</div>
            <p className="text-sm text-gray-600">Học sinh</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {totalStats.teachers + totalStats.admins}
            </div>
            <p className="text-sm text-gray-600">Giáo viên & Admin</p>
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
            <div className="relative flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm theo tên, email, mã học sinh, mã giáo viên..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10"
                />
              </div>
              <Button 
                onClick={handleSearch}
                className="!bg-blue-600 hover:!bg-blue-700 !text-white !px-4"
              >
                <Search className="h-4 w-4 mr-2" />
                Tìm kiếm
              </Button>
              {actualSearchTerm && (
                <Button 
                  onClick={handleClearSearch}
                  variant="outline"
                  className="!border-gray-300 !text-gray-700 hover:!bg-gray-50 !px-4"
                >
                  Xóa
                </Button>
              )}
            </div>
            <SimpleSelect 
              value={statusFilter} 
              onValueChange={setStatusFilter}
              placeholder="Lọc theo trạng thái"
              options={[
                { value: "all", label: "Tất cả trạng thái" },
                { value: "1", label: "Hoạt động" },
                { value: "0", label: "Không hoạt động" }
              ]}
              className="w-full sm:w-[180px]"
            />
            <SimpleSelect 
              value={roleFilter} 
              onValueChange={setRoleFilter}
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
                value={pageSize.toString()}
                onValueChange={(value) => {
                  setPageSize(Number(value))
                  setPageNumber(1)
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
          </div>

          <div className="rounded-md border" style={{ borderColor: '#e5e7eb' }}>
            {loading && filteredUsers.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-gray-500">Đang tải dữ liệu...</div>
              </div>
            ) : (
              <Table>
              <TableHeader>
                <TableRow style={{ borderBottomColor: '#e5e7eb' }}>
                  <SortHeader field="id">Mã số</SortHeader>
                  <SortHeader field="name">Họ tên</SortHeader>
                  <SortHeader field="email">Email</SortHeader>
                  <SortHeader field="role">Vai trò</SortHeader>
                  <SortHeader field="class">Lớp</SortHeader>
                  <SortHeader field="status">Trạng thái</SortHeader>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} style={{ borderBottomColor: '#e5e7eb' }}>
                      <TableCell className="font-medium">
                        {(() => {
                          if (user.role === 4) return user.studentNumber || 'N/A'; // Student
                          if (user.role === 2) return user.teacherCode || 'N/A'; // Teacher
                          return 'AD'; // Admin
                        })()}
                      </TableCell>
                      <TableCell className="font-medium">
                        {user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A'}
                      </TableCell>
                      <TableCell className="text-gray-600">{user.email || 'N/A'}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell className="text-gray-600">
                        {user.className|| ''}
                      </TableCell>
                      <TableCell>{getStatusBadge(user.status !== undefined ? user.status : 1)}</TableCell>
                      <TableCell className="text-right">
                        <UserActionsDropdown 
                          user={user} 
                          onView={handleViewUser}
                          onEdit={handleEditUser}
                          onDelete={handleDeleteUser} 
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      Không có dữ liệu người dùng
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Trang {pageNumber} / {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPageNumber(pageNumber - 1)}
                  disabled={pageNumber === 1}
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
                        variant={pageNumber === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPageNumber(pageNum)}
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
                  onClick={() => setPageNumber(pageNumber + 1)}
                  disabled={pageNumber === totalPages}
                >
                  Tiếp theo
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

        </CardContent>
      </Card>

      {/* Confirmation Modal for Status Change */}
      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent className="!sm:max-w-[425px] !bg-white !p-6 !rounded-lg !shadow-lg !border-0 !outline-none !ring-0">
          <DialogHeader className="!flex !flex-col !gap-2 !text-center sm:!text-left !mb-4">
            <DialogTitle className="!text-lg !font-semibold !text-gray-900">
              {userToToggle?.status === 1 ? 'Vô hiệu hóa người dùng' : 'Kích hoạt người dùng'}
            </DialogTitle>
            <DialogDescription className="!text-sm !text-gray-500">
              {userToToggle?.status === 1 
                ? 'Bạn có chắc chắn muốn vô hiệu hóa người dùng này? Người dùng sẽ không thể đăng nhập vào hệ thống.'
                : 'Bạn có chắc chắn muốn kích hoạt người dùng này? Người dùng sẽ có thể đăng nhập vào hệ thống.'
              }
            </DialogDescription>
          </DialogHeader>
          
          {userToToggle && (
            <div className="!py-4">
              <div className="!bg-gray-50 !p-4 !rounded-lg !mb-4">
                <div className="!grid !grid-cols-2 !gap-4 !text-sm">
                  <div>
                    <span className="!font-medium !text-gray-700">Họ tên:</span>
                    <p className="!text-gray-900 !mt-1">
                      {userToToggle.name || `${userToToggle.firstName || ''} ${userToToggle.lastName || ''}`.trim() || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="!font-medium !text-gray-700">Email:</span>
                    <p className="!text-gray-900 !mt-1">{userToToggle.email || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="!font-medium !text-gray-700">Vai trò:</span>
                    <div className="!mt-1">{getRoleBadge(userToToggle.role)}</div>
                  </div>
                  <div>
                    <span className="!font-medium !text-gray-700">Trạng thái hiện tại:</span>
                    <div className="!mt-1">{getStatusBadge(userToToggle.status)}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="!flex !flex-col-reverse !gap-2 sm:!flex-row sm:!justify-end !mt-6">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsConfirmModalOpen(false);
                setUserToToggle(null);
              }} 
              className="!border !border-gray-300 !bg-white !text-gray-700 hover:!bg-gray-50 !px-4 !py-2 !rounded-md"
            >
              Hủy
            </Button>
            <Button 
              onClick={handleConfirmStatusChange}
              className={`!px-4 !py-2 !rounded-md !text-white ${
                userToToggle?.status === 1 
                  ? '!bg-red-600 hover:!bg-red-700' 
                  : '!bg-green-600 hover:!bg-green-700'
              }`}
            >
              {userToToggle?.status === 1 ? 'Vô hiệu hóa' : 'Kích hoạt'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
