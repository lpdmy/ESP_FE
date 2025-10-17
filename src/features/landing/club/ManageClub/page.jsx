import React, { act, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
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
  UserPlus,Mail
} from "lucide-react";

import { useToast } from "@/common/hooks/useToast";
import { useClubApi } from "../hooks/useClubApi";
import { LoadingCollection } from "@/common/components/ui/loading";
import ClubBasicInfoForm from "@/features/landing/club/ClubBasicInfoForm/page.jsx";
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
    approvePost
  } = useClubApi();
  const [isLoading, SetIsloading] = useState(true);
  const [clubInfo, SetClubInfor] = useState({});
  const [joinRequests, SetJoinRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [pendingPosts,setPendingPosts] = useState([])
  const [pageSize,setPageSize] = useState(10)
const handleChangeRole = (vaitro) => {
    const mapping = {
      President: "Chủ nhiệm",
      Member: "Thành viên",
      Mentor: "Cố vấn",
    };
    return mapping[vaitro] || "Không rõ vai trò";
  };
  const handleGetClubJoinRequest = async () => {
    try {
      const response = await getClubJoinRequest(id,pageSize);
      const data = response.data.data;
      SetJoinRequests(data);
    } catch (error) {
      console.error("Lỗi khi lấy yêu cầu vào câu lạc bộ:", error);
    } finally {
      SetIsloading(false);
    }
  };
  const handlePostPending = async () =>{
    try{
     const response = await getPostPending(id)
     const data = response.data.data
     console.log(data)
     setPendingPosts(data)
    }catch{

    }
  }
  const handleApprovePost = async (id) =>{
    try {
      await approvePost(id)
      toast.approvePostSuccess()
      handlePostPending()
    } catch (error) {
      toast.approveJoinRequestFail()
    }
  }
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
  const handleApproveRejectRequest = async (id) => {
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
    if(activeTab=="posts"){
      handlePostPending();
    }
  }, [activeTab]);
  useEffect(() => {
    handleGetClubDetail();
  }, []);
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
           <ClubBasicInfoForm clubInfo={clubInfo}/>
          </TabsContent>
          {/* Members Tab */}
          <TabsContent value="members">
            <Card className="glass !bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">
                    Danh sách thành viên ({clubInfo?.members?.length || 0})
                  </CardTitle>
                  <Input
                    placeholder="Tìm kiếm thành viên..."
                    className="max-w-xs border-gray-300 focus:ring-orange-400"
                  />
                </div>
              </CardHeader>

              <CardContent>
                {/* Grid container */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {clubInfo.members?.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between border border-gray-200 rounded-xl p-4 bg-gradient-to-br from-white to-orange-50 hover:shadow-md transition-all"
                    >
                      {/* Left: Avatar + info */}
                      <div className="flex items-center gap-3">
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

                      {/* <div className="flex items-center gap-2">
                        <Select defaultValue={member.role}>
                          <SelectTrigger className="w-32 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Quản trị viên</SelectItem>
                            <SelectItem value="moderator">
                              Điều hành viên
                            </SelectItem>
                            <SelectItem value="member">Thành viên</SelectItem>
                          </SelectContent>
                        </Select>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-transparent hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </DialogTrigger>

                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Xác nhận gỡ thành viên</DialogTitle>
                              <DialogDescription>
                                Bạn có chắc chắn muốn gỡ {member.name} khỏi CLB?
                                Hành động này không thể hoàn tác.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                className="bg-transparent"
                              >
                                Hủy
                              </Button>
                              <Button variant="destructive">Xác nhận gỡ</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div> */}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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
                                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
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
                                className="flex-1 bg-red-500 hover:bg-red-700 text-white"
                                onClick={() =>
                                  handleApproveRejectRequest(request.id)
                                }
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
            <Card className="glass !bg-white">
              <CardHeader>
                <CardTitle>
                  Bài đăng đang chờ duyệt ({pendingPosts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingPosts.map((post) => (
                    <Card key={post.id} className="bg-white/50">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3 mb-4">
                          <Avatar>
                            <AvatarImage
                              src={
                                post.avatarUrl ||
                                "/placeholder.svg?height=40&width=40&query=avatar"
                              }
                            />
                            <AvatarFallback>
                              {post.userFullName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <span className="font-semibold">
                                  {post.userFullName}
                                </span>
                                <span className="text-sm text-gray-500 ml-2">
                                  {new Date(post.createdAt).toLocaleString(
                                    "vi-VN"
                                  )}
                                </span>
                              </div>
                              <Badge
                                variant="outline"
                                className="bg-yellow-100 text-yellow-700"
                              >
                                Chờ duyệt
                              </Badge>
                            </div>
                            <div className="text-xl font-bold">{post.title}</div>
                            <div>{post.body}</div>
                            <p className="text-gray-700 mb-3">{post.content}</p>
                            {post.attachmentUrls?.length > 0 && (
                              <div className="mb-3">
                                <img
                                  src={
                                    post.attachmentUrls[0] ||
                                    "/placeholder.svg?height=200&width=400&query=post image"
                                  }
                                  alt="Post image"
                                  className="rounded-lg max-w-full h-40"
                                />
                              </div>
                            )}
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="bg-green-500 hover:bg-green-600 text-white"
                                onClick={()=>{handleApprovePost(post.id)}}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Duyệt bài
                              </Button>
                              <Button size="sm" variant="destructive"
                              className="bg-red-500 hover:bg-red-700 text-white"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Từ chối
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
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
    </div>
  );
}
