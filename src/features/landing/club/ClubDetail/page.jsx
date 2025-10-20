import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { Button } from "@/common/components/ui/button";
import { Badge } from "@/common/components/ui/badge";
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
  Users,
  Calendar,
  MapPin,
  Clock,
  UserPlus,
  CheckCircle2,
  Share2,
  MoreHorizontal,
  Settings,
  LogOut,
  X,
  Info,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  useDropdownMenu,
} from "@/common/components/ui/dropdown-menu";
import PostCard from "@/features/landing/components/PostCard";
import { useClubApi } from "../hooks/useClubApi";
import { useParams, useNavigate } from "react-router-dom";
import { LoadingOverlay } from "@/common/components/ui/loading";
import { useDialog } from "@/common/components/ui/dialog";
import JoinClubModal from "../Modal/JoinClubModal/page";
import { useToast } from "@/common/hooks/useToast";

import { LeaveClubDialogConfirm } from "../Modal/LeaveClubModal/page";
const clubActivities = []; // 👈 Giả sử chưa có hoạt động
import CreatePostInput from "../../post/CreatePostInput";
import CreatePostModal from "../../post/CreatePostModal";
import DeletePostModal from "../../post/DeletePostModal";
import { useSelector } from "react-redux";
export default function ClubDetail() {
  const { isOpen: isDialogOpen, openDialog, closeDialog } = useDialog();
  const {
    isOpen: isLeaveDialogOpen,
    openDialog: openLeaveDialog,
    closeDialog: closeLeaveDialog,
  } = useDialog();
  const navigate = useNavigate();
  const toast = useToast();
  const params = useParams();
  const clubid = params.id;
  const [isLoading, setIsLoading] = useState(true);
  const [clubDetail, setClubDetail] = useState({});
  const {
    getClubDetail,
    createClubJoinRequest,
    getClubPost,
    cancelJoinRequest,
    leaveClub
  } = useClubApi(clubid);
  const [registeredActivities, setRegisteredActivities] = useState([]);
  const { isOpen, toggleMenu, closeMenu } = useDropdownMenu();
  const [isJoined, SetIsJoined] = useState(false);
  const [isPresident, SetIsPresident] = useState(false);
  const [isRequestToJoin, setIsRequestToJoin] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const payload = { clubId: clubid, classId: null };
  const [post, setPost] = useState([]);
  const getTruncatedText = (text, maxLength = 120) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };
  const user = useSelector((state) => state.user.user);
  const currentUserId = user?.userId || user?.id || 1;
  const handleClubDetail = async () => {
    try {
      const response = await getClubDetail(clubid);
      setClubDetail(response.data);
      SetIsJoined(response.data.isMember);
      setIsRequestToJoin(response.data.isRequestToJoin);
      SetIsPresident(response.data.isPresident);
    } catch (error) {
      toast.loadClubFail()
      console.log(error);
    }
  };
  const handleDeletePost = (post) => {
    setSelectedPost(post);
    setIsDeleteModalOpen(true);
  };
  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedPost(null);
  };
  const handleConfirmDelete = (postId) => {
  setPost(prev => prev.filter(p => p.id !== postId));
  setIsDeleteModalOpen(false);
  setSelectedPost(null);
};
  const handleClubPost = async () => {
    try {
      const response = await getClubPost(clubid);
      const data = response.data;
      setPosts(data);
      console.log("bài đăng",data);
    } catch (error) {
      console.log(error);
    }
  };
  const handleCancelRequest = async () => {
    try {
      await cancelJoinRequest(clubid);
      handleClubDetail();
    } catch (err) {
      console.log(err);
    }
  };
  const handleChangeRole = (vaitro) => {
    const mapping = {
      President: "Chủ nhiệm",
      Member: "Thành viên",
      Mentor: "Cố vấn",
    };
    return mapping[vaitro] || "Không rõ vai trò";
  };

  const handleOpenCreatePostModal = () => {
    setIsCreatePostModalOpen(true);
  };
  const handleCloseCreatePostModal = () => {
    setIsCreatePostModalOpen(false);
  };
  const handleCreatePost = async (newPost) => {
    try {
    } catch (error) {
      console.error("❌ Lỗi khi reload bài đăng:", error);
    }
  };
  const handleSubmit = async ({ reasonToJoin, experience }) => {
    try {
      const payload = { clubid, reasonToJoin, experience };
      const response = await createClubJoinRequest(payload);
      toast.createClubJoinRequestSuccess();
      handleClubDetail();
    } catch (error) {
      toast.createClubJoinRequestFail();
    }
  };
  const handleLeaveClub = async () => {
    try {
      await leaveClub(clubid)
      handleClubDetail()
      toast.leaveClubSuccess()
    } catch (error) {}
  };
  const handleRegister = (activityId) => {
    setRegisteredActivities([...registeredActivities, activityId]);
  };

  useEffect(() => {
    handleClubDetail();
    handleClubPost();
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // 3000 ms = 3 giây

    return () => clearTimeout(timer);
  }, []);
  if (isLoading) {
    return <LoadingOverlay isLoading={isLoading} />;
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Cover Image */}
        <div className="relative mb-8 rounded-xl overflow-hidden">
          <img
            src={clubDetail.coverUrl}
            alt="Cover"
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="absolute bottom-6 left-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <Badge className={"bg-orange-500"}>Câu Lạc Bộ</Badge>
              <Badge
                variant="outline"
                className="bg-white/20 text-white border-white/30"
              >
                {clubDetail.categoryName}
              </Badge>
            </div>
            <h1 className="text-4xl font-bold mb-2">{clubDetail.name}</h1>
          </div>
          <div className="absolute top-6 right-6 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/20 text-white border-white/30 hover:bg-white/30"
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                asChild
                onClick={toggleMenu}
                data-dropdown-trigger
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-48"
                isOpen={isOpen}
                onClose={closeMenu}
              >
                {isPresident && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault(); // optional
                      console.log("clubid:", clubid);
                      navigate(`/club/manage/${clubid}`);
                    }}
                    className="flex items-center cursor-pointer"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Quản lý câu lạc bộ
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem>Báo cáo</DropdownMenuItem>
                <DropdownMenuItem>Chia sẻ</DropdownMenuItem>
                {isJoined && (
                  <DropdownMenuItem
                    className="text-red-600 hover:bg-red-500 hover:text-white"
                    onClick={() => {
                      closeMenu();
                      openLeaveDialog();
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Rời câu lạc bộ
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <LeaveClubDialogConfirm
              open={isLeaveDialogOpen}
              onOpenChange={closeLeaveDialog}
              onConfirm={() => {
                handleLeaveClub();
              }}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Club Overview */}
          <div className="lg:col-span-3">
            <div className="top-6 space-y-6">
              <Card className="glass !bg-white">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Info className="w-5 h-5 text-orange-500" />
                    <CardTitle>Thông tin câu lạc bộ</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 ">
                  <div className="flex justify-center">
                    <img
                      src={clubDetail.avatarUrl || "/placeholder.svg"}
                      alt={clubDetail.name}
                      className="w-24 h-24 rounded-full object-cover border-4 border-orange-200"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">
                      Mô tả
                    </h4>
                    <div className="text-sm text-gray-600 leading-relaxed">
                      {showFullDescription
                        ? clubDetail.description
                        : getTruncatedText(clubDetail.description, 160)}
                      {clubDetail.description?.length > 160 && (
                        <button
                          onClick={() =>
                            setShowFullDescription(!showFullDescription)
                          }
                          className="font-medium ml-1 hover:underline"
                        >
                          {showFullDescription ? "Thu gọn" : "Xem thêm"}
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">
                      Danh mục
                    </h4>
                    <Badge className="bg-orange-100 text-orange-800">
                      {clubDetail.categoryName}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              {/* Join/Cancel buttons */}
              {!isJoined && (
                <Card className="glass sticky bottom-6 !bg-white">
                  <CardContent>
                    <div className="flex flex-col gap-2 ">
                      {isRequestToJoin ? (
                        <Button
                          className="w-full bg-red-500 hover:bg-red-600 text-white flex items-center gap-2"
                          onClick={handleCancelRequest}
                        >
                          <X className="w-4 h-4" />
                          Hủy yêu cầu
                        </Button>
                      ) : (
                        <Button
                          className="w-full btn-primary flex items-center gap-2"
                          onClick={openDialog}
                        >
                          <UserPlus className="w-4 h-4" />
                          Tham gia câu lạc bộ
                        </Button>
                      )}
                      <JoinClubModal
                        open={isDialogOpen}
                        onClose={closeDialog}
                        onSubmit={handleSubmit}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Center Content - Tabs */}
          <div className="lg:col-span-6 ">
            <Tabs defaultValue="posts" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-2">
                <TabsTrigger value="posts">Bài đăng</TabsTrigger>
                <TabsTrigger value="activities">Hoạt động</TabsTrigger>
              </TabsList>

              {/* Tổng quan */}
              <TabsContent value="overview" className="space-y-4 !bg-white-500">
                <Card className="glass hover-lift ">
                  <CardHeader>
                    <CardTitle>Giới thiệu</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">
                      {clubDetail.description}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Hoạt động */}
              <TabsContent value="activities" className="space-y-4">
                {clubActivities.length === 0 ? (
                  <div className="text-center py-10 text-gray-500 bg-white rounded-lg shadow-sm">
                    <Calendar className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                    <p>
                      Hiện tại chưa có sự kiện hoặc hoạt động nào được tổ chức.
                    </p>
                  </div>
                ) : (
                  clubActivities.map((activity) => {
                    const IconComponent = activity.icon;
                    const isRegistered = registeredActivities.includes(
                      activity.id
                    );
                    const isFull =
                      activity.currentParticipants >= activity.maxParticipants;
                    return (
                      <Card key={activity.id} className="glass hover-lift">
                        <CardContent className="p-6">
                          <div className="flex gap-4">
                            <div
                              className={`w-12 h-12 rounded-full ${activity.bgColor} flex items-center justify-center flex-shrink-0`}
                            >
                              <IconComponent
                                className={`w-6 h-6 ${activity.color}`}
                              />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {activity.title}
                              </h3>
                              <p className="text-gray-600 text-sm mb-2">
                                {activity.description}
                              </p>
                              <div className="text-sm text-gray-500 mb-3">
                                {new Date(activity.date).toLocaleString(
                                  "vi-VN"
                                )}{" "}
                                - {activity.location}
                              </div>
                              {isRegistered ? (
                                <Badge className="bg-green-100 text-green-800 border-0">
                                  <CheckCircle2 className="w-4 h-4 mr-1" />
                                  Đã đăng ký
                                </Badge>
                              ) : (
                                <Button
                                  className="btn-primary"
                                  disabled={isFull}
                                  onClick={() => handleRegister(activity.id)}
                                >
                                  <UserPlus className="w-4 h-4 mr-2" />
                                  {isFull ? "Đã đủ người" : "Đăng ký tham gia"}
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </TabsContent>

              {/* Bài đăng */}
              <TabsContent value="posts" className="space-y-4">
                <CreatePostInput onOpenModal={handleOpenCreatePostModal} />
                {posts.length === 0 ? (
                  <div className="text-center py-10 text-gray-500 bg-white rounded-lg shadow-sm">
                    <Users className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                    <p>Hiện tại chưa có bài đăng nào trong câu lạc bộ.</p>
                  </div>
                ) : (
                  posts.map((p) => (
                    <PostCard
                      key={p.id}
                      author={p.userFullName || "Ẩn danh"}
                      avatarUrl={p.avatarUrl}
                      postId={p.id}
                      isLiked={p.isLikedByCurrentUser}
                      class={p.classGroupId || "Học sinh"}
                      time={p.createdAt}
                      content={p.body}
                      image={
                        p.attachmentUrls && p.attachmentUrls.length > 0
                          ? p.attachmentUrls[0]
                          : null
                      }
                      images={p.attachmentUrls || []}
                      likes={p.likeCount}
                      comments={p.comments?.length || 0}
                      hashtags={p.hashtags || []}
                      shares={0} // nếu backend chưa trả về shareCount
                      isVerified={true}
                      createdBy={p.userId || currentUserId} // ID của người tạo bài đăng
                      currentUserId={currentUserId} // ID của người dùng hiện tại
                      onEdit={() => handleEditPost(p)}
                      onDelete={() => handleDeletePost(p)}
                      title={p.title}
                      privacy={p.privacyLevel}
                    />
                  ))
                )}
              </TabsContent>

              {/* Thành viên */}
              {/* <TabsContent value="members" className="space-y-4 ">
                {clubDetail.members?.length === 0 ? (
                  <div className="text-center text-gray-500 py-6">
                    Hiện tại chưa có thành viên nào.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {clubDetail.members?.map((member) => (
                      <Card key={member.userId} className="glass hover-lift">
                        <CardContent className="pt-6 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage
                                src={member.avatarUrl || "/default-avatar.png"}
                              />
                              <AvatarFallback>
                                {member.fullName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold">
                                {member.fullName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {member.email}
                              </div>
                            </div>
                          </div>
                          <div
                            className={`whitespace-nowrap font-medium px-2 py-1 rounded-md ${
                              ["President", "Mentor"].includes(member.role)
                                ? "bg-orange-100 text-orange-700"
                                : "text-gray-600"
                            }`}
                          >
                            {handleChangeRole(member.role)}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent> */}
            </Tabs>
          </div>

          {/* Right Sidebar - Members Quick View */}
          <div className="lg:col-span-3 ">
            <div className="top-6 !bg-white">
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-orange-500" />
                    Thành viên ({clubDetail.members?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent className="max-h-[calc(100vh-200px)] overflow-y-auto">
                  <div className="space-y-3">
                    {clubDetail.members?.slice(0, 8).map((m) => (
                      <div
                        key={m.userId}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 transition-colors"
                      >
                        <Avatar className="w-10 h-10">
                          <AvatarImage
                            src={m.avatarUrl || "/placeholder.svg"}
                          />
                          <AvatarFallback>{m.fullName[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm truncate">
                            {m.fullName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {handleChangeRole(m.role)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <CreatePostModal
        isOpen={isCreatePostModalOpen}
        onClose={handleCloseCreatePostModal}
        onCreate={handleCreatePost}
        payload={payload}
        isPresident={isPresident}
      />
      <DeletePostModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        post={selectedPost}
        onDelete={handleConfirmDelete}
      />
    </div>
  );
}
