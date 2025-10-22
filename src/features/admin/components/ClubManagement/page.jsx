import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";

import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { Textarea } from "@/common/components/ui/textarea";
import { Badge } from "@/common/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/common/components/ui/tabs";
import { SimpleSelect } from "@/common/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  useDialog,
} from "@/common/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/common/components/ui/dropdown-menu";
import {
  Users2,
  GraduationCap,
  MoreHorizontal,
  Edit,
  Trash2,
  Plus,
  Search,
  BookOpen,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import ClubDetailModal from "@/features/landing/club/Modal/ClubDetailModal/page";
import { useClubApi } from "@/features/landing/club/hooks/useClubApi";
import { useToast } from "@/common/hooks/useToast";
import ClubApprovalPage from "./ClubCreationPending/page";
export default function ClubClassManagement() {
  const toast = useToast();
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [clubsClasses, setClubsClasses] = useState([]);
  const [clubCategory, setClubCategory] = useState([]);
  const [filteredClubs, setFilteredClubs] = useState([]);
  const [clubCategoryOptions, setClubCategoryOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    type: "Câu lạc bộ",
    status: "Hoạt động",
    members: 0,
    leader: "",
    teacher: "",
    description: "",
    category: "",
    meetingTime: "",
  });
  const { getListClub, getClubCategory,deleteClub } = useClubApi();
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };
  
  useEffect(() => {
    let result = clubsClasses;

    if (selectedCategory !== "Tất cả") {
      result = result.filter((club) => club.categoryName === selectedCategory);
    }

    if (searchTerm.trim() !== "") {
      const keyword = searchTerm.toLowerCase();
      result = result.filter(
        (club) =>
          club.name.toLowerCase().includes(keyword) ||
          club.description?.toLowerCase().includes(keyword)
      );
    }
    setFilteredClubs(result);
  }, [searchTerm, selectedCategory, clubsClasses]);
  const handleListClub = async () => {
    try {
      const response = await getListClub(pageNumber, pageSize);
      const data = response.data.data;
      setClubsClasses(data);
      console.log(data);
      const total = response.data.totalCount || data.length; // 🔹 dùng totalCount nếu có
      setClubsClasses(data);
      setTotalCount(total);
      setTotalPages(Math.ceil(total / pageSize));
    } catch (err) {
      console.log(err);
      toast.loadClubFail();
    }
  };
  useEffect(() => {
    handleListClub();
  }, [pageNumber]);
  const getStatusBadge = (isDeleted) => {
    const style = {
      padding: "4px 8px",
      borderRadius: "4px",
      fontWeight: "bold",
      color: "#fff",
      backgroundColor: isDeleted ? "#888" : "#4caf50",
      display: "inline-block",
      fontSize: "12px",
    };

    return (
      <span style={style}>{isDeleted ? "Đã kết thúc" : "Đang hoạt động"}</span>
    );
  };
  const handleListCategory = async () => {
    try {
      const response = await getClubCategory();
      const data = response.data;
      setClubCategory(data);
      console.log(data);
      const formattedOptions = data.map((category) => ({
        label: category.name,
        value: category.name,
      }));

      setClubCategoryOptions([
        { label: "Tất cả", value: "Tất cả" },
        ...formattedOptions,
      ]);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    handleListCategory();
    handleListClub();
  }, []);

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   if (editingItem) {
  //     setClubsClasses(
  //       clubsClasses.map((item) =>
  //         item.id === editingItem.id
  //           ? { ...formData, id: editingItem.id }
  //           : item
  //       )
  //     );
  //   } else {
  //     const newItem = { ...formData, id: Date.now() };
  //     setClubsClasses([...clubsClasses, newItem]);
  //   }
  //   resetForm();
  // };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "Câu lạc bộ",
      status: "Hoạt động",
      members: 0,
      leader: "",
      teacher: "",
      description: "",
      category: "",
      meetingTime: "",
    });
    setEditingItem(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData(item);
    setIsDialogOpen(true);
  };

  const handleDelete = async(id) => {
    try{
      console.log(id)
      await deleteClub(id)
      toast.deleteClubSuccess()
      handleListClub()
    }catch(err){
     console.log(err)
      toast.deleteClubFail()
    }
  };

  const SortHeader = ({ field, children }) => (
    <TableHead
      className="cursor-pointer hover:bg-gray-50 select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className="h-3 w-3 text-gray-400" />
      </div>
    </TableHead>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Câu lạc bộ</h1>
          <p className="text-gray-600 mt-1">Quản lý các câu lạc bộ học sinh</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => resetForm()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Tạo mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Chỉnh sửa Câu lạc bộ" : "Tạo Câu lạc bộ mới"}
              </DialogTitle>
              <DialogDescription>
                Điền thông tin chi tiết cho câu lạc bộ.
              </DialogDescription>
            </DialogHeader>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Tên</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="status">Trạng thái</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hoạt động">Hoạt động</SelectItem>
                      <SelectItem value="Tạm ngưng">Tạm ngưng</SelectItem>
                      <SelectItem value="Đã hoàn thành">
                        Đã hoàn thành
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Danh mục</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="leader">Chủ nhiệm</Label>
                  <Input
                    id="leader"
                    value={formData.leader}
                    onChange={(e) =>
                      setFormData({ ...formData, leader: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="teacher">Giáo viên phụ trách</Label>
                  <Input
                    id="teacher"
                    value={formData.teacher}
                    onChange={(e) =>
                      setFormData({ ...formData, teacher: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="meetingTime">Thời gian họp</Label>
                  <Input
                    id="meetingTime"
                    value={formData.meetingTime}
                    onChange={(e) =>
                      setFormData({ ...formData, meetingTime: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  required
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Hủy
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingItem ? "Cập nhật" : "Tạo"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{clubsClasses.length}</div>
            <p className="text-sm text-gray-600">Tổng CLB</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {clubsClasses.filter((i) => i.isDeleted === false).length}
            </div>
            <p className="text-sm text-gray-600">CLB hoạt động</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {clubsClasses.filter((i) => i.isDeleted === true).length}
            </div>
            <p className="text-sm text-gray-600">CLB tạm ngưng</p>
          </CardContent>
        </Card>
      </div> */}

      {/* Table */}
      <Card>
        <Tabs defaultValue="list-clubs" className="w-full">
          <CardHeader>
            <TabsList className="grid w-200 grid-cols-2 !p-0">
              <TabsTrigger value="list-clubs">
                <CardTitle className="text-xl font-semibold">
                  Danh sách Câu Lạc Bộ
                </CardTitle>
              </TabsTrigger>
              <TabsTrigger value="creation-clubs">
                <CardTitle className="text-xl font-semibold">
                  Duyêt bài tạo Câu Lạc Bộ
                </CardTitle>
              </TabsTrigger>
            </TabsList>
          </CardHeader>
          <TabsContent value="list-clubs">
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Tìm kiếm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <SimpleSelect
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                  options={clubCategoryOptions}
                  className="h-12 text-base px-4"
                />
              </div>

              <div className="rounded-md border border-gray-200 bg-gray-50 p-2">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-white hover:bg-gray-100 border border-gray-200 rounded-md">
                      <SortHeader field="name">Tên</SortHeader>
                      <SortHeader field="status">Trạng thái</SortHeader>
                      <SortHeader field="category">Danh mục</SortHeader>
                      <SortHeader field="leader">Chủ nhiệm</SortHeader>
                      <SortHeader field="teacher">
                        Giáo viên phụ trách
                      </SortHeader>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClubs.length > 0 ? (
                      filteredClubs.map((item) => (
                        <TableRow
                          key={item.id}
                          className="bg-white hover:bg-gray-100 border border-gray-200 rounded-md"
                        >
                          <TableCell className="font-medium">
                            {item.name}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(item.isDeleted)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-gray-600">
                              <BookOpen className="h-3 w-3 mr-1" />
                              {item.categoryName}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.presidentName}</TableCell>
                          <TableCell>{item.mentorName || "Không có"}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="h-8 w-8 p-0"
                                  data-dropdown-trigger
                                  onClick={() =>
                                    setOpenMenuId(
                                      openMenuId === item.id ? null : item.id
                                    )
                                  }
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>

                              {openMenuId === item.id && (
                                <DropdownMenuContent
                                  align="end"
                                  isOpen={openMenuId === item.id}
                                  onClose={() => setOpenMenuId(null)}
                                  className="absolute right-0 mt-2 min-w-[200px] rounded-md border border-gray-200 bg-white shadow-lg z-[9999] animate-in fade-in-0 zoom-in-95"
                                >
                                  {/* Xem chi tiết */}
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedClub(item);
                                      setIsDetailOpen(true);
                                    }}
                                    className="hover:bg-gray-100 text-gray-700 flex items-center"
                                  >
                                    <Eye className="mr-2 h-4 w-4 text-gray-600" />
                                    Xem chi tiết
                                  </DropdownMenuItem>
                                  <ClubDetailModal
                                    isOpen={isDetailOpen}
                                    onClose={() => setIsDetailOpen(false)}
                                    club={selectedClub}
                                  />
                                  {/* Xóa câu lạc bộ */}
                                  <DropdownMenuItem
                                    onClick={() => {
                                      handleDelete(item.id);
                                      setOpenMenuId(null);
                                    }}
                                    className="text-red-600 hover:bg-red-50 focus:bg-red-50 flex items-center"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                                    Tạm ngừng câu lạc bộ
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              )}
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center text-gray-500 py-6"
                        >
                          Không có câu lạc bộ nào phù hợp
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                {totalPages > 0 && clubsClasses.length > 0 && (
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
                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
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
                                variant={
                                  pageNumber === pageNum ? "default" : "outline"
                                }
                                size="sm"
                                onClick={() => setPageNumber(pageNum)}
                                className="w-8 h-8 p-0"
                              >
                                {pageNum}
                              </Button>
                            );
                          }
                        )}
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
              </div>
            </CardContent>
          </TabsContent>
          <TabsContent value="creation-clubs">
            <ClubApprovalPage />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
