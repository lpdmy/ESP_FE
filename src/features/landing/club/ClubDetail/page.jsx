import React, { act, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  useDropdownMenu,
} from "@/common/components/ui/dropdown-menu";
import { Button } from "@/common/components/ui/button";
import { Badge } from "@/common/components/ui/badge";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { Textarea } from "@/common/components/ui/textarea";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/common/components/ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/common/components/ui/tabs";
import PostCard from "../../components/PostCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
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
  ArrowLeft,
  Users,
  UserCheck,
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Edit,
  Plus,
  Clock,
  MapPin,
  Trophy,
  BookOpen,
  Settings,
  Upload,
  UserPlus,
  Mail,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import { ROUTES } from "@/common/constants/routes";
import { useToast } from "@/common/hooks/useToast";
import { useClubApi } from "../hooks/useClubApi";
import { LoadingCollection } from "@/common/components/ui/loading";
import ClubBasicInfoForm from "@/features/landing/club/ClubBasicInfoForm/page.jsx";
import FindMentorModal from "../Modal/FindMentorModal/page";
import { useNavigate } from "react-router-dom";
const activities = [
  {
    id: 1,
    title: "Workshop React Advanced",
    type: "workshop",
    date: "2024-01-20",
    time: "14:00 - 17:00",
    location: "Phòng Lab 301",
    participants: 25,
    maxParticipants: 30,
    status: "upcoming",
  },
  {
    id: 2,
    title: "Cuộc thi Code Challenge",
    type: "competition",
    date: "2024-01-25",
    time: "09:00 - 18:00",
    location: "Phòng Lab 302",
    participants: 15,
    maxParticipants: 20,
    status: "upcoming",
  },
];
export default function ClubManage() {
  const { id } = useParams();
  const toast = useToast();
  const {
    getClubDetail,
    getClubJoinRequest,
    approveJoinRequest,
    rejectJoinRequest,
    getPostPending,
    approvePost,
    rejectPost,
    kickClub,
    inviteMentor,
    changeRole,
    getClubMentorInvitation,
    cancelInviteMentor,
  } = useClubApi();
  const navigate = useNavigate();
  const [isFindMentorOpen, setIsFindMentorOpen] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isLoading, SetIsloading] = useState(true);
  const [clubInfo, SetClubInfor] = useState({});
  const [joinRequests, SetJoinRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [pendingPosts, setPendingPosts] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [searchMemberTerm, setSearchMemberTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [pageSizeMember, setPageSizeMember] = useState(9);
  const [currentPage, setCurrentPage] = useState(1);
  const [invitationMentor, setInvitationMentor] = useState({});
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [selectedMemberForDelete, setSelectedMemberForDelete] = useState(null);
  const filteredMembers =
    clubInfo?.members?.filter(
      (member) =>
        member.role !== "Mentor" &&
        member.fullName.toLowerCase().includes(searchMemberTerm.toLowerCase())
    ) || [];
  const totalPages = Math.ceil(filteredMembers.length / pageSizeMember);
  const pagedMembers = filteredMembers.slice(
    (currentPage - 1) * pageSizeMember,
    currentPage * pageSizeMember
  );
  const handleChangeRole = (vaitro) => {
    const mapping = {
      President: "Chủ nhiệm",
      Member: "Thành viên",
      Mentor: "Cố vấn",
    };
    return mapping[vaitro] || "Không rõ vai trò";
  };
  const toggleMenu = (memberId) => {
    setOpenMenuId((prev) => (prev === memberId ? null : memberId));
  };
  const openKickModal = (user) => {
    setIsRemoveModalOpen(true);
    setSelectedMemberForDelete(user);
    console.log(user);
  };
  const handleGetClubJoinRequest = async () => {
    try {
      const response = await getClubJoinRequest(id, pageSize);
      const data = response.data.data;
      SetJoinRequests(data);
    } catch (error) {
      console.error("Lỗi khi lấy yêu cầu vào câu lạc bộ:", error);
    } finally {
      SetIsloading(false);
    }
  };
  const handleCancelInvitaion = async () => {
    if (!invitationMentor?.id) return;
    try {
      await cancelInviteMentor(invitationMentor.id);
      handleFetchInvitationMentor();
      toast.showSuccess("Hủy lời mời thành công");
      setIsCancelModalOpen(false);
    } catch (error) {
      toast.showError("Hủy lời mời thất bại");
      console.log(error);
    }
  };
  const getProfileRoute = (user) => {
    console.log("User object:", user);
    const role = Number(user?.userRole);
    switch (role) {
      case 2:
        return `${ROUTES.USER_PROFILE.TEACHER_PROFILE}/${user.userId}`;
      default:
        return `${ROUTES.USER_PROFILE.PROFILE}/${user.userId}`;
    }
  };
  const handlePostPending = async () => {
    try {
      const response = await getPostPending(id);
      const data = response.data.data;
      console.log(data);
      setPendingPosts(data);
    } catch (err) {
      toast.loadPostFail();
    }
  };
  const handleFetchInvitationMentor = async () => {
    try {
      const response = await getClubMentorInvitation(id);
      setInvitationMentor(response.data);
      console.log(response.data);
    } catch (error) {
      console.log(error);
    }
  };
  const openModal = (member) => {
    setSelectedMember(member);
    console.log(member);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMember(null);
  };

  const confirmTransfer = () => {
    handlePromoteToPresident(selectedMember.userId);
    closeModal();
  };
  const handlePromoteToPresident = async (userid) => {
    try {
      await changeRole(userid, id);
      toast.changeRoleSuccess();
      navigate(`/club/${id}`);
    } catch (err) {
      if (err.statusCode == 400) {
        toast.showError(err.message);
      } else {
        toast.changeRoleFail();
      }
      console.log(err);
    }
  };
  const handleInviteMentor = async (mentorid) => {
    try {
      const payload = { clubId: id, mentorId: mentorid };
      await inviteMentor(payload);
      toast.inviteMentorSuccess();
    } catch (error) {
      if (error.statusCode == 400) {
        toast.showError(error.message);
      } else {
        toast.inviteMentorFail();
      }
    }
  };

  const handleKick = async (userid) => {
    try {
      const payload = { userId: userid, clubId: id };
      const response = await kickClub(payload);
      toast.kickClubSuccess();
      handleGetClubDetail();
    } catch (error) {
      toast.kickClubFail();
    }
  };
  const handleApprovePost = async (id) => {
    try {
      await approvePost(id);
      toast.approvePostSuccess();
      handlePostPending();
    } catch (error) {
      toast.approveJoinRequestFail();
    }
  };
  const handleRejectPost = async (id) => {
    try {
      await rejectPost(id);
      handlePostPending();
      toast.rejectPostSuccess();
    } catch (error) {
      toast.rejectPostFail();
    }
  };
  const handleGetClubDetail = async () => {
    try {
      const response = await getClubDetail(id);
      const data = response.data;
      SetClubInfor(data);
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết câu lạc bộ:", error);
    }
  };
  const handleApproveJoinRequest = async (id) => {
    try {
      const response = await approveJoinRequest(id);
      handleGetClubJoinRequest();
      toast.approveJoinRequestSuccess();
    } catch (error) {
      console.log("lỗi khi chấp nhận tham gia ", error);
      toast.approveJoinRequestFail();
    }
  };
  const handleRejectRequest = async (id) => {
    try {
      const response = await rejectJoinRequest(id);
      handleGetClubJoinRequest();
      toast.rejectJoinRequestSuccess();
    } catch (error) {
      console.log("lỗi khi từ chối tham gia ", error);
      toast.rejectJoinRequestFail();
    }
  };
  useEffect(() => {
    if (activeTab == "requests") {
      handleGetClubJoinRequest();
    }
    if (activeTab == "posts") {
      handlePostPending();
    }
    if (activeTab == "members") {
      handleFetchInvitationMentor();
    }
  }, [activeTab]);
  useEffect(() => {
    handleGetClubDetail();
  }, []);
  useEffect(() => {
    setCurrentPage(1);
  }, [searchMemberTerm]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Back Button */}
        <div className="mb-6">
          <Link to={`/club/${id}`}>
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-transparent"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại trang CLB
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <img
              src={clubInfo.avatarUrl || "/placeholder.svg"}
              alt={clubInfo.name}
              className="w-20 h-20 rounded-full object-cover"
            />
            <div>
              <h1 className="text-3xl font-bold gradient-text mb-1">
                Quản lý {clubInfo.name}
              </h1>
              <p className="text-gray-600">
                Quản lý thành viên, bài đăng và hoạt động của CLB
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="glass">
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <p className="text-sm text-gray-600">Thành viên</p>
                <p className="text-2xl font-bold gradient-text">
                  {clubInfo?.members?.length}
                </p>
              </CardContent>
            </Card>
            <Card className="glass">
              <CardContent className="p-4 text-center">
                <UserCheck className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                <p className="text-sm text-gray-600">Yêu cầu chờ duyệt</p>
                <p className="text-2xl font-bold gradient-text">
                  {joinRequests?.length || 0}
                </p>
              </CardContent>
            </Card>
            <Card className="glass">
              <CardContent className="p-4 text-center">
                <FileText className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p className="text-sm text-gray-600">Bài đăng chờ duyệt</p>
                <p className="text-2xl font-bold gradient-text">
                  {pendingPosts.length}
                </p>
              </CardContent>
            </Card>
            <Card className="glass">
              <CardContent className="p-4 text-center">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                <p className="text-sm text-gray-600">Hoạt động sắp tới</p>
                <p className="text-2xl font-bold gradient-text">
                  {activities.length}
                </p>
              </CardContent>
            </Card>
          </div> */}
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6 bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Bài đăng
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Thành viên
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              Yêu cầu tham gia
            </TabsTrigger>
            <TabsTrigger value="activities" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Hoạt động
            </TabsTrigger>
            <TabsTrigger value="info" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Thông tin CLB
            </TabsTrigger>
          </TabsList>
          <TabsContent value="info">
            <ClubBasicInfoForm clubInfo={clubInfo} />
          </TabsContent>
          {/* Members Tab */}
          <TabsContent value="members">
            <Card className="glass !bg-white ">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">
                    Danh sách thành viên ({clubInfo?.members?.length || 0})
                  </CardTitle>
                  <Input
                    placeholder="Tìm kiếm thành viên..."
                    className="max-w-xs border-gray-300 focus:ring-orange-400"
                    value={searchMemberTerm}
                    onChange={(e) => setSearchMemberTerm(e.target.value)}
                  />
                </div>
              </CardHeader>

              <CardContent className="max-h-[calc(100vh-450px)] overflow-y-auto">
                {/* Grid container */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pagedMembers.map((member) => (
                    <div
                      key={member.userId}
                      className="flex items-center justify-between border border-gray-200 rounded-xl p-4 bg-gradient-to-br from-white to-orange-50 hover:shadow-md transition-all"
                      onClick={() => setSelectedMember(member)}
                    >
                      {/* Left: Avatar + info */}
                      <div
                        className="flex items-center gap-3"
                        onClick={() => navigate(getProfileRoute(member))}
                      >
                        <Avatar>
                          <AvatarImage
                            src={
                              member.avatarUrl ||
                              "/placeholder.svg?height=40&width=40&query=avatar"
                            }
                          />
                          <AvatarFallback className="bg-orange-500 text-white">
                            {member.fullName?.[0] || "?"}
                          </AvatarFallback>
                        </Avatar>

                        <div>
                          <div className="font-semibold text-gray-800">
                            {member.fullName}
                          </div>
                          <div className="text-sm text-gray-500">
                            Tham gia:{" "}
                            {new Date(member.createdAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            Chức vụ: {handleChangeRole(member.role)}
                          </div>
                        </div>
                      </div>
                      {member.role === "Member" && (
                        <div className="relative">
                          {/* Nút mở menu */}
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() =>
                              setOpenMenuId(
                                openMenuId === member.userId
                                  ? null
                                  : member.userId
                              )
                            }
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>

                          {/* Dropdown menu hiển thị */}
                          {openMenuId === member.userId && (
                            <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] overflow-hidden animate-in fade-in zoom-in-95">
                              <button
                                onClick={() => {
                                  openKickModal(member);
                                  setOpenMenuId(null);
                                }}
                                className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Xóa thành viên
                              </button>

                              <button
                                onClick={() => openModal(member)}
                                className="flex items-center w-full px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 transition"
                              >
                                <Settings className="w-4 h-4 mr-2" />
                                Chuyển chức vụ
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-center items-center gap-2 mt-6">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-orange-400 rounded-lg hover:bg-orange-600 disabled:opacity-50"
                  >
                    Trước
                  </button>
                  <span>
                    Trang {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-orange-400 rounded-lg hover:bg-orange-600 disabled:opacity-50"
                  >
                    Sau
                  </button>
                </div>
              </CardContent>
            </Card>
            <CardContent className="p-0">
              <Card className="glass !bg-white mt-6">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Users className="w-5 h-5 text-orange-500" />
                    Cố vấn (
                    {clubInfo?.members?.filter((m) => m.role === "Mentor")
                      .length || 0}
                    )
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  {clubInfo?.members?.some((m) => m.role === "Mentor") ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {clubInfo.members
                        .filter((member) => member.role === "Mentor")
                        .map((mentor) => (
                          <div
                            key={mentor.userId}
                            className="flex items-center justify-between border border-gray-200 rounded-xl p-4 bg-gradient-to-br from-white to-yellow-50 hover:shadow-md transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage
                                  src={
                                    mentor.avatarUrl ||
                                    "/placeholder.svg?height=40&width=40&query=avatar"
                                  }
                                />
                                <AvatarFallback className="bg-yellow-500 text-white">
                                  {mentor.fullName?.[0] || "?"}
                                </AvatarFallback>
                              </Avatar>

                              <div>
                                <div className="font-semibold text-gray-800">
                                  {mentor.fullName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Tham gia:{" "}
                                  {new Date(
                                    mentor.createdAt
                                  ).toLocaleDateString("vi-VN")}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Chức vụ: {handleChangeRole(mentor.role)}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : Object.keys(invitationMentor).length > 0 ? (
                    <div className="p-6 bg-yellow-50 rounded-lg border border-yellow-200 flex items-center gap-4">
                      <div className="p-6 bg-yellow-50 rounded-lg border border-yellow-200 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarImage
                              src={
                                invitationMentor.avatarUrl ||
                                "/placeholder.svg?height=40&width=40&query=avatar"
                              }
                            />
                            <AvatarFallback className="bg-orange-500 text-white">
                              {invitationMentor.userFullName?.[0] || "?"}
                            </AvatarFallback>
                          </Avatar>

                          <div>
                            <div className="font-semibold text-gray-800">
                              {invitationMentor.userFullName}
                            </div>
                            <div className="text-sm text-gray-600">
                              Đang chờ xác nhận lời mời cố vấn...
                            </div>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          className="text-sm"
                          onClick={() => setIsCancelModalOpen(true)}
                        >
                          Hủy lời mời
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // ✅ Không có mentor và không có lời mời
                    <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow-sm">
                      <p className="mb-4">
                        Hiện tại chưa có cố vấn nào trong câu lạc bộ.
                      </p>
                      <Button
                        onClick={() => setIsFindMentorOpen(true)}
                        className="btn-primary flex items-center gap-2 mx-auto"
                      >
                        <UserPlus className="w-4 h-4" />
                        Tìm cố vấn
                      </Button>
                      <FindMentorModal
                        isOpen={isFindMentorOpen}
                        onClose={() => setIsFindMentorOpen(false)}
                        onSelect={(mentor) => handleInviteMentor(mentor.id)}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </CardContent>
          </TabsContent>

          {/* Join Requests Tab */}
          <TabsContent value="requests">
            <Card className="glass !bg-white">
              <CardHeader>
                <CardTitle>
                  Yêu cầu tham gia đang chờ duyệt ({joinRequests?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <LoadingCollection isLoading={isLoading} />
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {joinRequests.length > 0 ? (
                      joinRequests.map((request) => (
                        <Card
                          key={request.id}
                          className="bg-white/50 h-[350px] w-[420px]"
                        >
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage
                                    src={
                                      request.avatar ||
                                      "/placeholder.svg?height=40&width=40&query=avatar"
                                    }
                                  />
                                  <AvatarFallback>
                                    {request.userFullName?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-semibold">
                                    {request.userFullName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    MSSV: {request.studentCode}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    Gửi yêu cầu:{" "}
                                    {new Date(request.createdAt).toLocaleString(
                                      "vi-VN"
                                    )}
                                  </div>
                                </div>
                              </div>
                              <Badge
                                variant="outline"
                                className="bg-yellow-100 text-yellow-700"
                              >
                                Chờ duyệt
                              </Badge>
                            </div>

                            <div className="space-y-3 mb-4">
                              <div>
                                <Label className="text-sm font-semibold">
                                  Lý do tham gia:
                                </Label>
                                <p className="text-sm text-gray-700 mt-1">
                                  {request.reasonToJoin}
                                </p>
                              </div>
                              <div>
                                <Label className="text-sm font-semibold">
                                  Kinh nghiệm:
                                </Label>
                                <p className="text-sm text-gray-700 mt-1">
                                  {request.experience}
                                </p>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 bg-transparent"
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    Xem chi tiết
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>
                                      Chi tiết yêu cầu tham gia
                                    </DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                      <Avatar className="w-16 h-16">
                                        <AvatarImage
                                          src={
                                            request.avatar || "/placeholder.svg"
                                          }
                                        />
                                        <AvatarFallback>
                                          {request.userFullName?.[0]}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <h3 className="font-bold text-lg">
                                          {request.userFullName}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                          MSSV: {request.studentCode}
                                        </p>
                                      </div>
                                    </div>
                                    <div>
                                      <Label className="font-semibold">
                                        Lý do tham gia:
                                      </Label>
                                      <p className="text-gray-700 mt-2">
                                        {request.reasonToJoin}
                                      </p>
                                    </div>
                                    <div>
                                      <Label className="font-semibold">
                                        Kinh nghiệm:
                                      </Label>
                                      <p className="text-gray-700 mt-2">
                                        {request.experience}
                                      </p>
                                    </div>
                                    <div>
                                      <Label className="font-semibold">
                                        Ngày gửi yêu cầu:
                                      </Label>
                                      <p className="text-gray-700 mt-2">
                                        {new Date(
                                          request.createdAt
                                        ).toLocaleString("vi-VN")}
                                      </p>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button
                                size="sm"
                                className="flex-1 bg-orange-400 hover:bg-orange-500 text-white"
                                onClick={() =>
                                  handleApproveJoinRequest(request.id)
                                }
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Chấp nhận
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="flex-1 bg-gray-400 hover:bg-gray-600 text-white"
                                onClick={() => {
                                  handleRejectRequest(request.id);
                                }}
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Từ chối
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-2 flex flex-col items-center justify-center py-10 text-gray-500">
                        <img
                          src="/empty-state.svg"
                          alt="No requests"
                          className="w-32 h-32 opacity-70 mb-4"
                        />
                        <p className="text-sm font-medium">
                          Hiện tại chưa có yêu cầu nào
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          {/* Pending Posts Tab */}
          <TabsContent value="posts">
            <Card className="glass !bg-white gap-10">
              <CardHeader>
                <CardTitle>
                  Bài đăng đang chờ duyệt ({pendingPosts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingPosts.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    Không có bài đăng nào đang chờ duyệt.
                  </div>
                ) : (
                  pendingPosts.map((post, index) => {
                    const {
                      id,
                      userFullName,
                      avatarUrl,
                      classGroupName,
                      title,
                      body,
                      hashtags = [],
                      attachmentUrls = [],
                      createdAt,
                    } = post;

                    const isVideo = (url) => /\.(mp4|mov|webm|avi)$/i.test(url);
                    const isGif = (url) => /\.gif$/i.test(url);

                    const prevMedia = () => {
                      setCurrentMediaIndex((prev) => ({
                        ...prev,
                        [id]:
                          prev[id] && prev[id] > 0
                            ? prev[id] - 1
                            : attachmentUrls.length - 1,
                      }));
                    };

                    const nextMedia = () => {
                      setCurrentMediaIndex((prev) => ({
                        ...prev,
                        [id]:
                          prev[id] !== undefined &&
                          prev[id] < attachmentUrls.length - 1
                            ? prev[id] + 1
                            : 0,
                      }));
                    };
                    const currentIndex = currentMediaIndex[id] || 0;
                    return (
                      <Card
                        key={id}
                        className="p-4 mb-4 bg-white/90 backdrop-blur-sm border border-orange-100 rounded-xl hover:shadow-md transition-shadow mx-auto"
                        style={{ width: "600px" }}
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-orange-400 to-yellow-400 flex items-center justify-center">
                              {avatarUrl ? (
                                <img
                                  src={avatarUrl}
                                  alt={userFullName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-white font-semibold text-lg">
                                  {userFullName?.charAt(0) || "A"}
                                </span>
                              )}
                            </div>

                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {userFullName || "Ẩn danh"}
                              </h4>
                              <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <span>{classGroupName || "Sinh viên"}</span>
                                <span>•</span>
                                <span>
                                  {new Date(createdAt).toLocaleString("vi-VN")}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className="bg-yellow-100 text-yellow-700"
                          >
                            Chờ duyệt
                          </Badge>
                        </div>

                        {/* Content */}
                        <div className="mb-3">
                          {title && (
                            <p className="text-gray-900 font-bold text-lg mb-2">
                              {title}
                            </p>
                          )}
                          <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                            {body}
                          </p>

                          {hashtags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {hashtags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="text-blue-600 hover:text-blue-800 cursor-pointer text-sm font-medium"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Media */}
                        {attachmentUrls.length > 0 && (
                          <div className="relative group mb-4 rounded-lg overflow-hidden border border-gray-200">
                            {isVideo(attachmentUrls[currentIndex]) ? (
                              <video
                                src={attachmentUrls[currentIndex]}
                                controls
                                className="object-contain rounded-lg shadow-md w-3/4 mx-auto"
                                style={{ maxHeight: "300px" }}
                              />
                            ) : (
                              <img
                                src={attachmentUrls[currentIndex]}
                                alt="Post content"
                                className="object-contain  w-3/4 mx-auto"
                                style={{ maxHeight: "300px" }}
                              />
                            )}

                            {/* Type badges */}
                            {isGif(attachmentUrls[currentIndex]) && (
                              <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span>GIF</span>
                              </div>
                            )}
                            {isVideo(attachmentUrls[currentIndex]) && (
                              <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                                <span>VIDEO</span>
                              </div>
                            )}

                            {/* Navigation */}
                            {attachmentUrls.length > 1 && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={prevMedia}
                                >
                                  <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={nextMedia}
                                >
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex justify-end gap-2 mt-4">
                          <Button
                            size="sm"
                            className="bg-orange-400 hover:bg-orange-500 text-white"
                            onClick={() => handleApprovePost(id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Duyệt bài
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="bg-gray-400 hover:bg-gray-700 text-white"
                            onClick={() => handleRejectPost(id)}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Từ chối
                          </Button>
                        </div>
                      </Card>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </TabsContent>
          {/* Activities Tab */}
          <TabsContent value="activities">
            <div className="space-y-6">
              <Card className="glass !bg-white">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>
                      Hoạt động sắp tới ({activities.length})
                    </CardTitle>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="btn-primary">
                          <Plus className="w-4 h-4 mr-2" />
                          Tạo hoạt động mới
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Tạo hoạt động mới</DialogTitle>
                          <DialogDescription>
                            Tạo sự kiện hoặc cuộc thi mới cho CLB
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="activityType">
                              Loại hoạt động *
                            </Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn loại hoạt động" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="workshop">
                                  Workshop
                                </SelectItem>
                                <SelectItem value="competition">
                                  Cuộc thi
                                </SelectItem>
                                <SelectItem value="event">Sự kiện</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="activityTitle">
                              Tên hoạt động *
                            </Label>
                            <Input
                              id="activityTitle"
                              placeholder="Ví dụ: Workshop React Advanced"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="activityDescription">Mô tả *</Label>
                            <Textarea
                              id="activityDescription"
                              placeholder="Mô tả chi tiết về hoạt động..."
                              className="min-h-[100px]"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="activityDate">
                                Ngày tổ chức *
                              </Label>
                              <Input id="activityDate" type="date" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="activityTime">Thời gian *</Label>
                              <Input
                                id="activityTime"
                                placeholder="14:00 - 17:00"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="activityLocation">Địa điểm *</Label>
                            <Input
                              id="activityLocation"
                              placeholder="Phòng Lab 301"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="maxParticipants">
                              Số lượng tham gia tối đa
                            </Label>
                            <Input
                              id="maxParticipants"
                              type="number"
                              placeholder="30"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" className="bg-transparent">
                            Hủy
                          </Button>
                          <Button className="btn-primary">Tạo hoạt động</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <Card key={activity.id} className="bg-white/50">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <div
                                className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                  activity.type === "workshop"
                                    ? "bg-blue-100"
                                    : "bg-yellow-100"
                                }`}
                              >
                                {activity.type === "workshop" ? (
                                  <BookOpen
                                    className={`w-6 h-6 ${
                                      activity.type === "workshop"
                                        ? "text-blue-500"
                                        : "text-yellow-500"
                                    }`}
                                  />
                                ) : (
                                  <Trophy className="w-6 h-6 text-yellow-500" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-bold text-lg">
                                    {activity.title}
                                  </h3>
                                  <Badge
                                    className={
                                      activity.type === "workshop"
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-yellow-100 text-yellow-700"
                                    }
                                  >
                                    {activity.type === "workshop"
                                      ? "Workshop"
                                      : "Cuộc thi"}
                                  </Badge>
                                </div>
                                <div className="space-y-1 text-sm text-gray-600">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(activity.date).toLocaleDateString(
                                      "vi-VN"
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    {activity.time}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    {activity.location}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    {activity.participants}/
                                    {activity.maxParticipants} người tham gia
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-transparent"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-transparent"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>
                                      Xác nhận xóa hoạt động
                                    </DialogTitle>
                                    <DialogDescription>
                                      Bạn có chắc chắn muốn xóa hoạt động "
                                      {activity.title}"? Hành động này không thể
                                      hoàn tác.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <DialogFooter>
                                    <Button
                                      variant="outline"
                                      className="bg-transparent"
                                    >
                                      Hủy
                                    </Button>
                                    <Button variant="destructive">
                                      Xác nhận xóa
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 z-[9999] flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-md animate-scaleIn">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Xác nhận chuyển quyền
            </h3>
            <p className="text-gray-700">
              Bạn có chắc muốn chuyển quyền
              <b> Chủ nhiệm</b> cho <strong>{selectedMember?.fullName}</strong>{" "}
              không?
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-2 py-2 rounded rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
              >
                Hủy
              </button>
              <button
                onClick={confirmTransfer()}
                className="px-2 py-2 rounded rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
      {isCancelModalOpen && (
        <div className="fixed inset-0 bg-black/30 z-[9999] flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-md animate-scaleIn">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Xác nhận hủy lời mời
            </h3>
            <p className="text-gray-700">
              Bạn có chắc muốn hủy lời mời cố vấn đã gửi tới{" "}
              <strong>{invitationMentor?.userFullName}</strong> không?
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="px-2 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
              >
                Hủy
              </button>
              <button
                onClick={() => handleCancelInvitaion}
                className="px-2 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
      {isRemoveModalOpen && (
        <div className="fixed inset-0 bg-black/30 z-[9999] flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-md animate-scaleIn">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Xác nhận xóa thành viên
            </h3>
            <p className="text-gray-700">
              Bạn có chắc muốn xóa <strong>{selectedMember?.fullName}</strong>{" "}
              khỏi câu lạc bộ không?
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setIsRemoveModalOpen(false)}
                className="px-2 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  handleKick(selectedMemberForDelete.userId);
                  setIsRemoveModalOpen(false);
                }}
                className="px-2 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
