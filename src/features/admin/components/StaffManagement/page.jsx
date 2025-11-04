import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { Button } from "@/common/components/ui/button";
import { Badge } from "@/common/components/ui/badge";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/common/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/common/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";
import { LoadingAdmin } from "@/common/components/ui/loading";
import { Checkbox } from "@/common/components/ui/checkbox";
import StaffDetailModal from "./StaffDetailModal/page";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/common/components/ui/avatar";
import {
  UserCog,
  Shield,
  Users,
  Edit,
  Search,
  UserPlus,
  UserMinus,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import CreateEmployeeModal from "./CreateStaffModal/page"; // Mock data
import { useStaffApi } from "../../hooks/useStaffApi";
const availablePermissions = [
  { label: "MANAGE_CLASS", name: "Quản lý lớp học", id: 1 },
  { label: "MANAGE_USER", name: "Quản lý người dùng", id: 2 },
  { label: "MANAGE_POST", name: "Quản lý bài đăng", id: 3 },
  { label: "VIEW_REPORT", name: "Xem báo cáo", id: 4 },
  { label: "MANAGE_COMMENTS", name: "Quản lý bình luận" },
  { label: "MANAGE_EVENTS", name: "Quản lý sự kiện", id: 6 },
  { label: "MANAGE_CLUBS", name: "Quản lý câu lạc bộ", id: 7 },
  { label: "MANAGE_ANNOUNCEMENTS", name: "Quản lý thông báo", id: 8 },
  { label: "MANAGE_REWARDS", name: "Quản lý phần thưởng", id: 10 },
];
import { useToast } from "@/common/hooks/useToast";
const roleTemplates = [
  {
    name: "Moderator",
    permissions: ["manage_posts", "manage_comments", "view_reports"],
    description: "Kiểm duyệt nội dung và xử lý báo cáo",
  },
  {
    name: "Content Manager",
    permissions: ["manage_posts", "manage_events", "manage_announcements"],
    description: "Quản lý nội dung và sự kiện",
  },
  {
    name: "Event Coordinator",
    permissions: ["manage_events", "manage_clubs", "view_analytics"],
    description: "Điều phối sự kiện và hoạt động",
  },
  {
    name: "Community Manager",
    permissions: [
      "manage_users",
      "manage_clubs",
      "manage_announcements",
      "view_analytics",
    ],
    description: "Quản lý cộng đồng và người dùng",
  },
];

export default function StaffManagement() {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDiagOpen, setCreateDiagOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isGrantDialogOpen, setIsGrantDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { getAllStaff, deleteStaff, recoveryStaff } = useStaffApi();
  const [staff, setStaff] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const handleGetAllStaff = async () => {
    setIsLoading(true);
    try {
      const response = await getAllStaff(pageNumber, pageSize, searchTerm);
      const data = response.data.data || [];
      setStaff(data);
      const total = response.data.totalCount || data.length;
      setTotalCount(total);
      setTotalPages(Math.ceil(total / pageSize));
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleDeleteStaff = async (id) => {
    try {
      await deleteStaff(id);
      toast.deleteStaffSuccess();
      handleGetAllStaff();
    } catch (error) {
      if (error.statusCode == 400) {
        toast.showError(error.message);
      } else {
        toast.deleteStaffFail();
      }
    }
  };
  const handleRecoveryStaff = async (id) => {
    try {
      await recoveryStaff(id);
      toast.recoveryStaffSuccess();
      handleGetAllStaff();
    } catch (error) {
      if (error.statusCode == 400) {
        toast.showError(error.message);
      } else {
        toast.recoveryStaffFail;
      }
    }
  };
  const handleRoleSelect = (roleName) => {
    const role = roleTemplates.find((r) => r.name === roleName);
    if (role) {
      setSelectedPermissions(role.permissions);
      setSelectedRole(roleName);
    }
  };

  const handlePermissionChange = (permissionId, checked) => {
    if (checked) {
      setSelectedPermissions([...selectedPermissions, permissionId]);
    } else {
      setSelectedPermissions(
        selectedPermissions.filter((p) => p !== permissionId)
      );
    }
  };
  useEffect(() => {
    handleGetAllStaff();
  }, [pageNumber, searchTerm]);
  return (
    <div className="space-y-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quản lý nhân sự
          </h1>
          <p className="text-gray-600">Cấp quyền và quản lý nhân sự hệ thống</p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white p-5"
          onClick={() => setCreateDiagOpen(true)}
        >
          Tạo nhân viên
        </Button>
        <CreateEmployeeModal
          permissions={availablePermissions}
          open={createDiagOpen}
          onClose={() => {
            setCreateDiagOpen(false);
            handleGetAllStaff();
          }}
        />
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng nhân sự</CardTitle>
            <Users className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
            <p className="text-xs text-blue-100 mt-1">Đang hoạt động</p>
          </CardContent>
        </Card>

        {/* <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Nhân sự hoạt động
            </CardTitle>
            <UserCog className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {staffMembers.filter((s) => s.status === "active").length}
            </div>
            <p className="text-xs text-green-100 mt-1">Trong 7 ngày qua</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vai trò</CardTitle>
            <Shield className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleTemplates.length}</div>
            <p className="text-xs text-purple-100 mt-1">Mẫu vai trò có sẵn</p>
          </CardContent>
        </Card> */}

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quyền hạn</CardTitle>
            <Settings className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {availablePermissions.length}
            </div>
            <p className="text-xs text-orange-100 mt-1">Quyền có thể cấp</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="staff" className="space-y-6">
        <TabsContent value="staff" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <UserCog className="h-5 w-5 text-blue-600" />
                    Danh sách nhân sự
                  </CardTitle>
                  <CardDescription>
                    Quản lý quyền hạn của nhân sự hệ thống
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Tìm kiếm nhân sự..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border border-gray-200 rounded-md overflow-hidden">
                <Table className="relative">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Quyền hạn</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>

                  {/* ⚙️ TableBody có relative để chứa overlay */}
                  <TableBody className="relative">
                    {/* 🔵 Overlay chỉ nằm trong body */}
                    {isLoading && (
                      <tr>
                        <td colSpan={5} className="relative p-0">
                          <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm z-10">
                            <div className="flex flex-col items-center py-6">
                              <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                              <p className="text-sm text-blue-600 mt-2 font-medium animate-pulse">
                                Đang tải danh sách nhân sự...
                              </p>
                            </div>
                          </div>
                          {/* 👇 giữ chỗ để không co bảng */}
                          <div className="h-[120px]" />
                        </td>
                      </tr>
                    )}

                    {!isLoading && staff.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-6 text-gray-500"
                        >
                          Không có dữ liệu nhân sự
                        </TableCell>
                      </TableRow>
                    )}

                    {!isLoading &&
                      staff.map((staff) => (
                        <TableRow key={staff.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={staff.avatar || "/placeholder.svg"}
                                />
                                <AvatarFallback>
                                  {staff?.firstName?.charAt(0)?.toUpperCase() ||
                                    "A"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="font-medium">
                                {staff.fullName}
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="text-sm text-gray-500">
                              {staff.email}
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {staff.permissions.length === 0 ? (
                                <Badge className="text-xs !bg-blue-400 !text-white">
                                  Chưa cấp quyền
                                </Badge>
                              ) : (
                                staff.permissions.slice(0, 2).map((p) => {
                                  const perm = availablePermissions.find(
                                    (x) => x.label === p
                                  );
                                  return (
                                    <Badge
                                      key={p}
                                      className="text-xs !bg-blue-400 !text-white"
                                    >
                                      {perm?.name || p}
                                    </Badge>
                                  );
                                })
                              )}
                            </div>
                          </TableCell>

                          <TableCell>
                            <Badge
                              className={
                                staff.isDeleted
                                  ? "bg-gray-100 text-gray-700"
                                  : "bg-green-100 text-green-700"
                              }
                            >
                              {staff.isDeleted
                                ? "Không hoạt động"
                                : "Hoạt động"}
                            </Badge>
                          </TableCell>

                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-blue-600 border-blue-200 hover:bg-blue-50 bg-transparent"
                                onClick={() => {
                                  setEditDialogOpen(true);
                                  setSelectedStaff(staff);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className={`border ${
                                  staff.isDeleted
                                    ? "text-green-600 border-green-300 hover:bg-green-50"
                                    : "text-red-600 border-red-200 hover:bg-red-50"
                                } bg-transparent`}
                                onClick={() => {
                                  if (staff.isDeleted) {
                                    handleRecoveryStaff(staff.id);
                                  } else {
                                    handleDeleteStaff(staff.id); 
                                  }
                                }}
                              >
                                {staff.isDeleted ? (
                                  <>
                                    <UserPlus className="h-4 w-4" />{" "}
                                  </>
                                ) : (
                                  <>
                                    <UserMinus className="h-4 w-4" />{" "}
                                  </>
                                )}
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
        </TabsContent>
        {totalPages > 0 && staff.length > 0 && (
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
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pageNumber <= 3) {
                    pageNum = i + 1;
                  } else if (pageNumber >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = pageNumber - 2 + i;
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
                  );
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
      </Tabs>
      <StaffDetailModal
        employee={selectedStaff}
        permissionsList={availablePermissions}
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          handleGetAllStaff();
        }}
        onCreated={handleGetAllStaff}
      />
    </div>
  );
}
