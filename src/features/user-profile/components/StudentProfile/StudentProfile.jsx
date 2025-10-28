import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/common/components/ui/avatar";
import { Button } from "@/common/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { Badge } from "@/common/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/common/components/ui/tabs";
import {
  Loading,
  LoadingOverlay,
  LoadingCard,
} from "@/common/components/ui/loading";
import { useToast } from "@/common/hooks/useToast";
import { useProfileApi } from "@/features/user-profile/hooks/useProfileApi";
import CreatePostInput from "@/features/landing/post/CreatePostInput";
import CreatePostModal from "@/features/landing/post/CreatePostModal";
import UpdatePostModal from "@/features/landing/post/UpdatePostModal";
import DeletePostModal from "@/features/landing/post/DeletePostModal";
import {
  Edit,
  Star,
  Trophy,
  Calendar,
  Award,
  User,
  Activity,
  Heart,
  Code,
  Book,
  FileText,
  ChevronDown,
  Image,
  Video,
  Smile,
  Plus,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/common/constants/routes";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  useDropdownMenu,
} from "@/common/components/ui/dropdown-menu";
import PostCard from "@/features/landing/components/PostCard";
import { Textarea } from "@/common/components/ui/textarea";
import { usePostApi } from "@/features/landing/post/hooks/usePostApi";
import { useSelector } from "react-redux";
import { getUserId } from "@/common/utils/userUtils";

export default function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const [extraData, setExtraData] = useState({});
  const [sortBy, setSortBy] =useState("newest");
  const [post, setPost] = useState([]);
  const [postContent, setPostContent] = useState("");
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const {
    isOpen: isSortDropdownOpen,
    openMenu: openSortDropdown,
    closeMenu: closeSortDropdown,
    toggleMenu: toggleSortDropdown,
  } = useDropdownMenu(false);

  const toast = useToast();
  const user = useSelector((state) => state.user.user);
  const currentUserId = getUserId(user) || 1;

  // Profile API hook
  const { profileLoading, getMyProfile } = useProfileApi();
  const { userPost, saveLoading, error } = usePostApi();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await getMyProfile();
        const profileData = response.data;
        setProfile(profileData);

        // Parse ExtraJson if it exists
        if (profileData.extraJson) {
          try {
            const parsed = JSON.parse(profileData.extraJson);
            setExtraData(parsed);
          } catch (e) {
            console.warn("Failed to parse ExtraJson:", e);
            setExtraData({});
          }
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        toast.profileLoadFailed();
      }
    };

    loadProfile();
  }, []); // Empty dependency array to run only once
  useEffect(() => {
  const loadPost = async () => {
    try {
      const response = await userPost(sortBy);
      setPost(response?.data || []);
    } catch (error) {
      console.error("❌ Lỗi khi load post:", error);
    }
  };
  loadPost();
}, [sortBy]); 

  // CreatePostModal handlers
  const handleOpenCreatePostModal = () => {
    setIsCreatePostModalOpen(true);
  };
  const handleCreatePost = async (newPost) => {
  try {
    const response = await userPost(sortBy); // gọi lại API
    setPost(response?.data || []);
  } catch (error) {
    console.error("❌ Lỗi khi reload bài đăng:", error);
  }
};


  const handleCloseCreatePostModal = () => {
    setIsCreatePostModalOpen(false);
  };

  const handleEditPost = (post) => {
    setSelectedPost(post);
    setIsUpdateModalOpen(true);
  };

  const handleDeletePost = (post) => {
    setSelectedPost(post);
    setIsDeleteModalOpen(true);
  };

  const handleUpdatePost = (updatedPost) => {
    // TODO: Implement update post logic
    console.log('Update post:', updatedPost);
    setIsUpdateModalOpen(false);
    setSelectedPost(null);
  };

  const handleConfirmDelete = (postId) => {
  setPost(prev => prev.filter(p => p.id !== postId));
  setIsDeleteModalOpen(false);
  setSelectedPost(null);
};

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedPost(null);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedPost(null);
  };

  return (
    <>
      <LoadingOverlay
        isLoading={profileLoading}
        text={toast.PROFILE_MESSAGES.LOADING.PROFILE}
        variant="primary"
      />
      {!profile ? (
        <div className="max-w-4xl mx-auto px-4 py-6">
          <LoadingCard
            text={toast.PROFILE_MESSAGES.LOADING.PROFILE}
            className="h-64"
            variant="primary"
          />
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Card className="mt-6 mb-6 hover-lift card-shine bg-white/80 backdrop-blur-sm border-orange-200">
            <CardContent className="p-6 pt-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="flex items-center gap-4">
                  <Avatar className="w-24 h-24 border-4 border-orange-200">
                    <AvatarImage src={profile.avatarUrl || ""} alt="Profile" />
                    <AvatarFallback className="bg-gradient-to-br from-orange-400 to-yellow-400 text-white text-2xl font-bold">
                      {profile.firstName && profile.lastName
                        ? `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase()
                        : profile.username
                        ? profile.username[0].toUpperCase()
                        : "U"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-gray-800">
                      {profile.firstName && profile.lastName
                        ? `${profile.firstName} ${profile.lastName}`
                        : profile.username || "Chưa có tên"}
                    </h1>
                    <div className="flex flex-wrap gap-2">
                      {profile.classGroupName && (
                        <Badge
                          variant="secondary"
                          className="bg-orange-100 text-orange-800"
                        >
                          {profile.classGroupName}
                        </Badge>
                      )}
                      {profile.studentNumber && (
                        <Badge
                          variant="secondary"
                          className="bg-blue-100 text-blue-800"
                        >
                          {profile.studentNumber}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500 fill-current" />
                      <span className="font-semibold text-orange-600">
                        Hồ sơ học sinh
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats + Edit */}
                <div className="flex-1 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="space-y-1">
                      <div className="flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-orange-500 mr-1" />
                        <span className="text-2xl font-bold text-gray-800">
                          15
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {toast.PROFILE_MESSAGES.LABELS.EVENTS}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-center">
                        <Trophy className="w-4 h-4 text-yellow-500 mr-1" />
                        <span className="text-2xl font-bold text-gray-800">
                          8
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {toast.PROFILE_MESSAGES.LABELS.AWARDS}
                      </p>
                    </div>
                  </div>

                  <Link to={ROUTES.USER_PROFILE.EDIT}>
                    <Button className="btn-primary flex items-center gap-2">
                      <Edit className="w-4 h-4" />
                      {toast.PROFILE_MESSAGES.BUTTON.EDIT}
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Tabs */}
          <Tabs defaultValue="introduction" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6 bg-white/80 backdrop-blur-sm">
              <TabsTrigger
                value="introduction"
                className="flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4" />
                {toast.PROFILE_MESSAGES.LABELS.INTRODUCTION}
              </TabsTrigger>
              <TabsTrigger
                value="posts"
                className="flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Bài đăng
              </TabsTrigger>
              <TabsTrigger
                value="activities"
                className="flex items-center justify-center gap-2"
              >
                <Activity className="w-4 h-4" />
                {toast.PROFILE_MESSAGES.LABELS.ACTIVITIES}
              </TabsTrigger>
              <TabsTrigger
                value="achievements"
                className="flex items-center justify-center gap-2"
              >
                <Trophy className="w-4 h-4" />
                {toast.PROFILE_MESSAGES.LABELS.ACHIEVEMENTS}
              </TabsTrigger>
            </TabsList>

            {/* Giới thiệu */}
            <TabsContent value="introduction">
              <div className="grid gap-6">
                <Card className="hover-lift bg-white/80 backdrop-blur-sm border-orange-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-700">
                      <User className="w-5 h-5" />
                      {toast.PROFILE_MESSAGES.LABELS.PERSONAL_INFO}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-gray-700 leading-relaxed">
                        {profile.bio ||
                          "Chưa có thông tin giới thiệu bản thân."}
                      </p>

                      {/* Thông tin chi tiết */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">
                            Thông tin liên hệ
                          </h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p>
                              <span className="font-medium">Email:</span>{" "}
                              {profile.email || "Chưa cập nhật"}
                            </p>
                            <p>
                              <span className="font-medium">
                                Số điện thoại:
                              </span>{" "}
                              {profile.phoneNumber || "Chưa cập nhật"}
                            </p>
                            <p>
                              <span className="font-medium">Ngày sinh:</span>{" "}
                              {profile.birthDate
                                ? new Date(
                                    profile.birthDate
                                  ).toLocaleDateString("vi-VN")
                                : "Chưa cập nhật"}
                            </p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">
                            Thông tin học tập
                          </h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p>
                              <span className="font-medium">
                                Mã số học sinh:
                              </span>{" "}
                              {profile.studentNumber || "Chưa cập nhật"}
                            </p>
                            <p>
                              <span className="font-medium">Năm nhập học:</span>{" "}
                              {profile.enrollmentYear || "Chưa cập nhật"}
                            </p>
                            <p>
                              <span className="font-medium">Lớp:</span>{" "}
                              {profile.classGroupName || "Chưa cập nhật"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover-lift bg-white/80 backdrop-blur-sm border-orange-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-700">
                      <Heart className="w-5 h-5" />
                      {toast.PROFILE_MESSAGES.LABELS.INTERESTS_CONCERNS}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {extraData.interests && extraData.interests.length > 0 ? (
                        extraData.interests.map((interest, index) => (
                          <Badge
                            key={index}
                            className="bg-gradient-orange text-white flex items-center gap-1"
                          >
                            <Code className="w-3 h-3" />
                            {interest}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-gray-500 italic">
                          Chưa có sở thích nào được cập nhật.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Hoạt động */}
            <TabsContent value="activities">
              <div className="space-y-4">
                <Card className="hover-lift bg-white/80 backdrop-blur-sm border-orange-200">
                  <CardContent className="pt-4 !p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">
                          Tham gia cuộc thi Lập trình FPT Code Challenge
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Đạt giải Nhì với dự án website quản lý thư viện
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            15/03/2024
                          </span>
                          <Badge variant="outline" className="text-xs">
                            Cuộc thi
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover-lift bg-white/80 backdrop-blur-sm border-orange-200">
                  <CardContent className="!p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">
                          Chia sẻ bài viết: "Hướng dẫn React cho người mới bắt
                          đầu"
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Bài viết nhận được 45 lượt thích và 12 bình luận
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            10/03/2024
                          </span>
                          <Badge variant="outline" className="text-xs">
                            Bài đăng
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover-lift bg-white/80 backdrop-blur-sm border-orange-200">
                  <CardContent className="!p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">
                          Tham gia sự kiện "Workshop AI & Machine Learning"
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Học về các ứng dụng AI trong giáo dục
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            05/03/2024
                          </span>
                          <Badge variant="outline" className="text-xs">
                            Sự kiện
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Thành tích */}
            <TabsContent value="achievements">
              <div className="grid gap-6">
                <Card className="hover-lift bg-white/80 backdrop-blur-sm border-orange-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-700">
                      <Award className="w-5 h-5" />
                      {toast.PROFILE_MESSAGES.LABELS.BADGES_EARNED}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 rounded-lg bg-gradient-orange text-white achievement-glow">
                        <Trophy className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm font-semibold">Code Master</p>
                        <p className="text-xs opacity-90">Giải Nhì Lập trình</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-gradient-blue text-white">
                        <Star className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm font-semibold">Rising Star</p>
                        <p className="text-xs opacity-90">1000+ Star Points</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-gradient-purple text-white">
                        <Heart className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm font-semibold">Helper</p>
                        <p className="text-xs opacity-90">Giúp đỡ bạn bè</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-yellow-500 text-white">
                        <Book className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm font-semibold">Scholar</p>
                        <p className="text-xs opacity-90">Điểm cao</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover-lift bg-white/80 backdrop-blur-sm border-orange-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-700">
                      <Star className="w-5 h-5" />
                      {toast.PROFILE_MESSAGES.LABELS.POINTS_HISTORY}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <div>
                          <p className="font-semibold text-green-800">
                            +200 Star Points
                          </p>
                          <p className="text-sm text-green-600">
                            Giải Nhì cuộc thi lập trình
                          </p>
                        </div>
                        <span className="text-sm text-gray-500">
                          15/03/2024
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <div>
                          <p className="font-semibold text-blue-800">
                            +50 Star Points
                          </p>
                          <p className="text-sm text-blue-600">
                            Bài viết được nhiều lượt thích
                          </p>
                        </div>
                        <span className="text-sm text-gray-500">
                          10/03/2024
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                        <div>
                          <p className="font-semibold text-orange-800">
                            +30 Star Points
                          </p>
                          <p className="text-sm text-orange-600">
                            Tham gia Workshop AI
                          </p>
                        </div>
                        <span className="text-sm text-gray-500">
                          05/03/2024
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Bài đăng của tôi */}
            <TabsContent value="posts">
              <div className="space-y-6">
                {/* Create Post Input */}
                <CreatePostInput onOpenModal={handleOpenCreatePostModal} />

                {/* Sort Controls */}
                <Card className="p-4 bg-white border-orange-200 relative z-40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-orange-600" />
                      <h3 className="text-lg font-semibold text-gray-800">
                        Bài đăng
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 hidden sm:block">
                        Sắp xếp:
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 text-xs"
                            onClick={toggleSortDropdown}
                            data-dropdown-trigger
                          >
                            {sortBy === "newest" && "Mới nhất"}
                            {sortBy === "oldest" && "Cũ nhất"}
                            {sortBy === "mostliked" && "Nhiều lượt thích"}
                            {sortBy === "mostcommented" && "Nhiều bình luận"}
                            <ChevronDown className="w-3 h-3 ml-1" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                          align="end"
                          className="z-50 bg-white shadow-lg border border-gray-200"
                          isOpen={isSortDropdownOpen}
                          onClose={closeSortDropdown}
                        >
                          <DropdownMenuItem
                            onClick={() => {
                              setSortBy("newest");
                              closeSortDropdown();
                            }}
                            className={`cursor-pointer ${
                              sortBy === "newest"
                                ? "bg-orange-50 text-orange-600"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            Mới nhất
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => {
                              setSortBy("oldest");
                              closeSortDropdown();
                            }}
                            className={`cursor-pointer ${
                              sortBy === "oldest"
                                ? "bg-orange-50 text-orange-600"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            Cũ nhất
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => {
                              setSortBy("mostliked");
                              closeSortDropdown();
                            }}
                            className={`cursor-pointer ${
                              sortBy === "mostliked"
                                ? "bg-orange-50 text-orange-600"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            Nhiều lượt thích
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => {
                              setSortBy("mostcommented");
                              closeSortDropdown();
                            }}
                            className={`cursor-pointer ${
                              sortBy === "mostcommented"
                                ? "bg-orange-50 text-orange-600"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            Nhiều bình luận
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </Card>

                {/* My Posts */}
                {post && post.length > 0 ? (
                  post.map((p) => (
                    <PostCard
                      key={p.id}
                      author={p.userFullName || "Ẩn danh"}
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
                     />
                  ))
                ) : (
                  <>
                    {/* Demo posts khi chưa có data từ API */}
                    <PostCard
                      author={profile?.firstName && profile?.lastName 
                        ? `${profile.firstName} ${profile.lastName}` 
                        : profile?.username || "Tôi"}
                      class={profile?.classGroupName || "Học sinh"}
                      time="2 giờ trước"
                      content="Hôm nay học lập trình React rất vui! Tạo được component đầu tiên rồi 🚀 #React #LậpTrình #HọcTập"
                      images={["/Picturemockdata/DSC03778.jpg", "/Picturemockdata/DSC04766.jpg", "/Picturemockdata/IMG_1492.jpg"]}
                      hashtags={["React", "LậpTrình", "HọcTập", "FPT"]}
                      album="Dự án React"
                      privacy="public"
                      likes={15}
                      comments={8}
                      shares={3}
                      isVerified={true}
                      createdBy={currentUserId}
                      currentUserId={currentUserId}
                      onEdit={() => handleEditPost({
                        id: 1,
                        content: "Hôm nay học lập trình React rất vui! Tạo được component đầu tiên rồi 🚀 #React #LậpTrình #HọcTập",
                        images: ["/Picturemockdata/DSC03778.jpg", "/Picturemockdata/DSC04766.jpg", "/Picturemockdata/IMG_1492.jpg"]
                      })}
                      onDelete={() => handleDeletePost({
                        id: 1,
                        content: "Hôm nay học lập trình React rất vui! Tạo được component đầu tiên rồi 🚀 #React #LậpTrình #HọcTập"
                      })}
                    />

                    <PostCard
                      author={profile?.firstName && profile?.lastName 
                        ? `${profile.firstName} ${profile.lastName}` 
                        : profile?.username || "Tôi"}
                      class={profile?.classGroupName || "Học sinh"}
                      time="1 ngày trước"
                      content="Tham gia cuộc thi hackathon với team! Cảm ơn mọi người đã hỗ trợ 💻✨"
                      images={["/Picturemockdata/IMG_1492.jpg", "/Picturemockdata/DSC03778.jpg"]}
                      gif="https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif"
                      hashtags={["Hackathon", "Teamwork", "LậpTrình", "FPT"]}
                      album="Cuộc thi hackathon"
                      privacy="public"
                      likes={28}
                      comments={12}
                      shares={5}
                      isVerified={true}
                      createdBy={currentUserId}
                      currentUserId={currentUserId}
                      onEdit={() => handleEditPost({
                        id: 2,
                        content: "Tham gia cuộc thi hackathon với team! Cảm ơn mọi người đã hỗ trợ 💻✨",
                        images: ["/Picturemockdata/IMG_1492.jpg", "/Picturemockdata/DSC03778.jpg"],
                        gif: "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif"
                      })}
                      onDelete={() => handleDeletePost({
                        id: 2,
                        content: "Tham gia cuộc thi hackathon với team! Cảm ơn mọi người đã hỗ trợ 💻✨"
                      })}
                    />

                    <p className="text-gray-500 italic mt-4">Demo posts - Sẽ hiển thị bài đăng thực từ API khi có data</p>
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreatePostModalOpen}
        onClose={handleCloseCreatePostModal}
        onCreate={handleCreatePost}
      />

      {/* Update Post Modal */}
      <UpdatePostModal
        isOpen={isUpdateModalOpen}
        onClose={handleCloseUpdateModal}
        post={selectedPost}
        onUpdate={handleUpdatePost}
      />

      {/* Delete Post Modal */}
      <DeletePostModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        post={selectedPost}
        onDelete={handleConfirmDelete}
      />
    </>
  );
}
