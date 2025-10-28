import { Avatar, AvatarFallback, AvatarImage } from "@/common/components/ui/avatar"
import { Button } from "@/common/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card"
import { Badge } from "@/common/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/common/components/ui/tabs"
import { Loading, LoadingOverlay, LoadingCard } from "@/common/components/ui/loading"
import { useToast } from "@/common/hooks/useToast"
import { useProfileApi } from "@/features/user-profile/hooks/useProfileApi"
import { getUserId } from "@/common/utils/userUtils"
import CreatePostInput from "@/features/landing/post/CreatePostInput"
import CreatePostModal from "@/features/landing/post/CreatePostModal"
import UpdatePostModal from "@/features/landing/post/UpdatePostModal"
import DeletePostModal from "@/features/landing/post/DeletePostModal"
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
    GraduationCap,
    Users,
    BookOpen,
    FileText,
    ChevronDown,
    Image,
    Video,
    Smile,
    Plus,
} from "lucide-react"
import { Link } from "react-router-dom"
import { ROUTES } from "@/common/constants/routes"
import { useState, useEffect } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, useDropdownMenu } from "@/common/components/ui/dropdown-menu"
import PostCard from "@/features/landing/components/PostCard"
import { Textarea } from "@/common/components/ui/textarea"
import { useSelector } from "react-redux"

export default function TeacherProfile() {
    const [profile, setProfile] = useState(null);
    const [extraData, setExtraData] = useState({});
    const [sortBy, setSortBy] = useState("newest");
    const [postContent, setPostContent] = useState("");
    const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const { isOpen: isSortDropdownOpen, openMenu: openSortDropdown, closeMenu: closeSortDropdown, toggleMenu: toggleSortDropdown } = useDropdownMenu(false);
    const toast = useToast();
    const user = useSelector((state) => state.user.user);
    const currentUserId = getUserId(user) || 1;

    // Profile API hook
    const { profileLoading, getMyTeacherProfile } = useProfileApi();

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const response = await getMyTeacherProfile();
                const profileData = response.data;
                setProfile(profileData);

                // Parse ExtraJson if it exists
                
                if (profileData.extraJson && profileData.extraJson !== null && profileData.extraJson !== 'null') {
                    try {
                        // Handle both string and already parsed JSON
                        const parsed = typeof profileData.extraJson === 'string' 
                            ? JSON.parse(profileData.extraJson) 
                            : profileData.extraJson;
                        setExtraData(parsed);
                    } catch (e) {
                        console.warn('Failed to parse ExtraJson:', e);
                        setExtraData({});
                    }
                } else {
                    // Set default empty data structure for display
                    setExtraData({
                        specializations: [],
                        researchAreas: [],
                        teachingSubjects: [],
                        certifications: []
                    });
                }
            } catch (error) {
                console.error('Error loading teacher profile:', error);
                toast.profileLoadFailed();
            }
        };

        loadProfile();
    }, []);

    // CreatePostModal handlers
    const handleOpenCreatePostModal = () => {
        setIsCreatePostModalOpen(true);
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
        // TODO: Implement delete post logic
        console.log('Delete post:', postId);
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
                text="Đang tải thông tin giảng viên..."
                variant="primary"
            />
            {!profile ? (
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <LoadingCard text="Đang tải thông tin giảng viên..." className="h-64" variant="primary" />
                </div>
            ) : (
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <Card className="mt-6 mb-6 hover-lift card-shine bg-white/80 backdrop-blur-sm border-blue-200">
                        <CardContent className="p-6 pt-6">
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                                <div className="flex items-center gap-4">
                                     <Avatar className="w-24 h-24 border-4 border-blue-200">
                                         <AvatarImage src={profile.avatarUrl || null} alt="Profile" />
                                         <AvatarFallback className="bg-gradient-to-br from-blue-400 to-indigo-400 text-white text-2xl font-bold">
                                             {profile.firstName && profile.lastName
                                                 ? `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase()
                                                 : profile.username ? profile.username[0].toUpperCase() : 'T'}
                                         </AvatarFallback>
                                     </Avatar>

                                    <div className="space-y-2">
                                        <h1 className="text-2xl font-bold text-gray-800">
                                            {profile.firstName && profile.lastName
                                                ? `${profile.firstName} ${profile.lastName}`
                                                : profile.username || 'Chưa có tên'}
                                        </h1>
                                        <div className="flex flex-wrap gap-2">
                                            {profile.teacherCode && (
                                                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                                    {profile.teacherCode}
                                                </Badge>
                                            )}
                                            {profile.department && (
                                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                                    {profile.department}
                                                </Badge>
                                            )}
                                            {profile.position && (
                                                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                                                    {profile.position}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <GraduationCap className="w-5 h-5 text-blue-500 fill-current" />
                                            <span className="font-semibold text-blue-600">Hồ sơ giáo viên</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats + Edit */}
                                <div className="flex-1 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-center">
                                                <Users className="w-4 h-4 text-blue-500 mr-1" />
                                                <span className="text-2xl font-bold text-gray-800">35</span>
                                            </div>
                                            <p className="text-sm text-gray-600">Học sinh</p>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-center">
                                                <BookOpen className="w-4 h-4 text-green-500 mr-1" />
                                                <span className="text-2xl font-bold text-gray-800">3</span>
                                            </div>
                                            <p className="text-sm text-gray-600">Lớp học</p>
                                        </div>
                                    </div>

                                    <Link to={ROUTES.USER_PROFILE.EDIT_TEACHER}>
                                        <Button className="btn-primary flex items-center gap-2 !px-6 !py-3">
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Profile Tabs */}
                    <Tabs defaultValue="introduction" className="w-full">
                        <TabsList className="grid w-full grid-cols-4 mb-6 bg-white/80 backdrop-blur-sm">
                            <TabsTrigger value="introduction" className="flex items-center justify-center gap-2">
                                <User className="w-4 h-4" />
                                Giới thiệu
                            </TabsTrigger>
                            <TabsTrigger value="posts" className="flex items-center justify-center gap-2">
                                <FileText className="w-4 h-4" />
                                Bài đăng
                            </TabsTrigger>
                            <TabsTrigger value="teaching" className="flex items-center justify-center gap-2">
                                <BookOpen className="w-4 h-4" />
                                Giảng dạy
                            </TabsTrigger>
                            <TabsTrigger value="achievements" className="flex items-center justify-center gap-2">
                                <Trophy className="w-4 h-4" />
                                Thành tích
                            </TabsTrigger>
                        </TabsList>

                        {/* Giới thiệu */}
                        <TabsContent value="introduction">
                            <div className="grid gap-6">
                                <Card className="hover-lift bg-white/80 backdrop-blur-sm border-blue-200">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-blue-700">
                                            <User className="w-5 h-5" />
                                            Thông tin cá nhân
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <p className="text-gray-700 leading-relaxed">
                                                {profile.bio || 'Chưa có thông tin giới thiệu bản thân.'}
                                            </p>

                                            {/* Thông tin chi tiết */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                                                <div>
                                                    <h4 className="font-semibold text-gray-800 mb-2">Thông tin liên hệ</h4>
                                                     <div className="space-y-1 text-sm text-gray-600">
                                                         <p><span className="font-medium">Email:</span> {profile.email || 'Chưa cập nhật'}</p>
                                                         <p><span className="font-medium">Số điện thoại:</span> {profile.phoneNumber || null || 'Chưa cập nhật'}</p>
                                                         <p><span className="font-medium">Ngày sinh:</span> {profile.birthDate ? new Date(profile.birthDate).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</p>
                                                     </div>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-800 mb-2">Thông tin nghề nghiệp</h4>
                                                    <div className="space-y-1 text-sm text-gray-600">
                                                        <p><span className="font-medium">Mã giảng viên:</span> {profile.teacherCode || 'Chưa cập nhật'}</p>
                                                        <p><span className="font-medium">Khoa:</span> {profile.department || 'Chưa cập nhật'}</p>
                                                        <p><span className="font-medium">Chức vụ:</span> {profile.position || 'Chưa cập nhật'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="hover-lift bg-white/80 backdrop-blur-sm border-blue-200">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-blue-700">
                                            <Heart className="w-5 h-5" />
                                            Chuyên môn & Sở thích
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {/* Specializations */}
                                            <div>
                                                <h4 className="font-semibold text-gray-800 mb-2">Chuyên môn</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {extraData.specializations && extraData.specializations.length > 0 ? (
                                                        extraData.specializations.map((specialization, index) => (
                                                            <Badge key={index} className="bg-gradient-blue text-white flex items-center gap-1">
                                                                <Code className="w-3 h-3" />
                                                                {specialization}
                                                            </Badge>
                                                        ))
                                                    ) : (
                                                        <p className="text-gray-500 italic">Chưa có chuyên môn nào được cập nhật.</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Teaching Subjects */}
                                            <div>
                                                <h4 className="font-semibold text-gray-800 mb-2">Môn học giảng dạy</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {extraData.teachingSubjects && extraData.teachingSubjects.length > 0 ? (
                                                        extraData.teachingSubjects.map((subject, index) => (
                                                            <Badge key={index} className="bg-gradient-green text-white flex items-center gap-1">
                                                                <BookOpen className="w-3 h-3" />
                                                                {subject}
                                                            </Badge>
                                                        ))
                                                    ) : (
                                                        <p className="text-gray-500 italic">Chưa có môn học nào được cập nhật.</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Research Areas */}
                                            <div>
                                                <h4 className="font-semibold text-gray-800 mb-2">Lĩnh vực nghiên cứu</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {extraData.researchAreas && extraData.researchAreas.length > 0 ? (
                                                        extraData.researchAreas.map((area, index) => (
                                                            <Badge key={index} className="bg-gradient-purple text-white flex items-center gap-1">
                                                                <Star className="w-3 h-3" />
                                                                {area}
                                                            </Badge>
                                                        ))
                                                    ) : (
                                                        <p className="text-gray-500 italic">Chưa có lĩnh vực nghiên cứu nào được cập nhật.</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Giảng dạy */}
                        <TabsContent value="teaching">
                            <div className="space-y-4">
                                <Card className="hover-lift bg-white/80 backdrop-blur-sm border-blue-200">
                                    <CardContent className="pt-4 p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-800">
                                                    Giảng dạy môn "Tin học"
                                                </h3>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Lớp 10A1 - 35 học sinh
                                                </p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-500">Học kỳ 1 - 2024</span>
                                                    <Badge variant="outline" className="text-xs">
                                                        Đang giảng dạy
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="hover-lift bg-white/80 backdrop-blur-sm border-blue-200">
                                    <CardContent className="!p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-800">
                                                    Chủ nhiệm lớp 10A1
                                                </h3>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    35 học sinh - Hướng dẫn hoạt động ngoại khóa
                                                </p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-500">2024</span>
                                                    <Badge variant="outline" className="text-xs">
                                                        Chủ nhiệm
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="hover-lift bg-white/80 backdrop-blur-sm border-blue-200">
                                    <CardContent className="!p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-800">
                                                    Tổ chức hoạt động "Tin học vui"
                                                </h3>
                                                <p className="text-sm text-gray-600 mt-1">Tham gia: 120 học sinh</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-500">15/03/2024</span>
                                                    <Badge variant="outline" className="text-xs">
                                                        Ngoại khóa
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
                                <Card className="hover-lift bg-white/80 backdrop-blur-sm border-blue-200">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-blue-700">
                                            <Award className="w-5 h-5" />
                                            Chứng chỉ & Bằng cấp
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="text-center p-4 rounded-lg bg-gradient-blue text-white achievement-glow">
                                                <GraduationCap className="w-8 h-8 mx-auto mb-2" />
                                                <p className="text-sm font-semibold">Cử nhân</p>
                                                <p className="text-xs opacity-90">Sư phạm Tin học</p>
                                            </div>
                                            <div className="text-center p-4 rounded-lg bg-gradient-green text-white">
                                                <Star className="w-8 h-8 mx-auto mb-2" />
                                                <p className="text-sm font-semibold">Giáo viên dạy giỏi</p>
                                                <p className="text-xs opacity-90">Cấp tỉnh 2023</p>
                                            </div>
                                            <div className="text-center p-4 rounded-lg bg-gradient-purple text-white">
                                                <Trophy className="w-8 h-8 mx-auto mb-2" />
                                                <p className="text-sm font-semibold">Giáo viên chủ nhiệm giỏi</p>
                                                <p className="text-xs opacity-90">2023</p>
                                            </div>
                                            <div className="text-center p-4 rounded-lg bg-yellow-500 text-white">
                                                <Book className="w-8 h-8 mx-auto mb-2" />
                                                <p className="text-sm font-semibold">Chứng chỉ</p>
                                                <p className="text-xs opacity-90">ICDL, MOS</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="hover-lift bg-white/80 backdrop-blur-sm border-blue-200">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-blue-700">
                                            <Star className="w-5 h-5" />
                                            Lịch sử đánh giá
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                                <div>
                                                    <p className="font-semibold text-green-800">Đánh giá xuất sắc</p>
                                                    <p className="text-sm text-green-600">Môn Tin học - Học kỳ 1/2024</p>
                                                </div>
                                                <span className="text-sm text-gray-500">4.8/5.0</span>
                                            </div>
                                            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                                <div>
                                                    <p className="font-semibold text-blue-800">Phản hồi tích cực</p>
                                                    <p className="text-sm text-blue-600">Hoạt động Tin học vui</p>
                                                </div>
                                                <span className="text-sm text-gray-500">95% hài lòng</span>
                                            </div>
                                            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                                                <div>
                                                    <p className="font-semibold text-purple-800">Học sinh đạt thành tích cao</p>
                                                    <p className="text-sm text-purple-600">15 học sinh giỏi môn Tin học</p>
                                                </div>
                                                <span className="text-sm text-gray-500">2024</span>
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
                                <Card className="p-4 bg-white border-blue-200 relative z-40">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-5 h-5 text-blue-600" />
                                            <h3 className="text-lg font-semibold text-gray-800">Bài đăng</h3>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-600 hidden sm:block">Sắp xếp:</span>
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
                                                        {sortBy === "most_liked" && "Nhiều lượt thích"}
                                                        {sortBy === "most_commented" && "Nhiều bình luận"}
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
                                                        className={`cursor-pointer ${sortBy === "newest" ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"}`}
                                                    >
                                                        Mới nhất
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem 
                                                        onClick={() => {
                                                            setSortBy("oldest");
                                                            closeSortDropdown();
                                                        }}
                                                        className={`cursor-pointer ${sortBy === "oldest" ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"}`}
                                                    >
                                                        Cũ nhất
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem 
                                                        onClick={() => {
                                                            setSortBy("most_liked");
                                                            closeSortDropdown();
                                                        }}
                                                        className={`cursor-pointer ${sortBy === "most_liked" ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"}`}
                                                    >
                                                        Nhiều lượt thích
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem 
                                                        onClick={() => {
                                                            setSortBy("most_commented");
                                                            closeSortDropdown();
                                                        }}
                                                        className={`cursor-pointer ${sortBy === "most_commented" ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"}`}
                                                    >
                                                        Nhiều bình luận
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </Card>

                                {/* My Posts */}
                                <PostCard
                                    author={profile?.firstName && profile?.lastName 
                                        ? `${profile.firstName} ${profile.lastName}` 
                                        : profile?.username || "Tôi"}
                                    class={profile?.teacherCode || "Giáo viên"}
                                    time="30 phút trước"
                                    content="Chia sẻ kinh nghiệm dạy Tin học cho học sinh THPT. Các phương pháp giảng dạy hiệu quả và cách khuyến khích học sinh tìm hiểu công nghệ 🎓 #GiáoDục #TinHọc"
                                    likes={8}
                                    comments={3}
                                    shares={1}
                                    isVerified={true}
                                    createdBy={currentUserId}
                                    currentUserId={currentUserId}
                                    onEdit={() => handleEditPost({
                                        id: 1,
                                        content: "Chia sẻ kinh nghiệm dạy Tin học cho học sinh THPT. Các phương pháp giảng dạy hiệu quả và cách khuyến khích học sinh tìm hiểu công nghệ 🎓 #GiáoDục #TinHọc",
                                        author: profile?.firstName && profile?.lastName 
                                            ? `${profile.firstName} ${profile.lastName}` 
                                            : profile?.username || "Tôi"
                                    })}
                                    onDelete={() => handleDeletePost({
                                        id: 1,
                                        content: "Chia sẻ kinh nghiệm dạy Tin học cho học sinh THPT. Các phương pháp giảng dạy hiệu quả và cách khuyến khích học sinh tìm hiểu công nghệ 🎓 #GiáoDục #TinHọc"
                                    })}
                                />

                                <PostCard
                                    author={profile?.firstName && profile?.lastName 
                                        ? `${profile.firstName} ${profile.lastName}` 
                                        : profile?.username || "Tôi"}
                                    class={profile?.teacherCode || "Giáo viên"}
                                    time="2 giờ trước"
                                    content="Tổ chức thành công workshop 'Lập trình Scratch cho học sinh' với 45 em tham gia. Cảm ơn các em đã nhiệt tình tham gia! 🚀 #Scratch #LậpTrình"
                                    images={["/Picturemockdata/DSC04766.jpg", "/Picturemockdata/DSC03778.jpg"]}
                                    likes={15}
                                    comments={7}
                                    shares={2}
                                    isVerified={true}
                                    createdBy={currentUserId}
                                    currentUserId={currentUserId}
                                    onEdit={() => handleEditPost({
                                        id: 2,
                                        content: "Tổ chức thành công workshop 'Lập trình Scratch cho học sinh' với 45 em tham gia. Cảm ơn các em đã nhiệt tình tham gia! 🚀 #Scratch #LậpTrình",
                                        images: ["/Picturemockdata/DSC04766.jpg", "/Picturemockdata/DSC03778.jpg"]
                                    })}
                                    onDelete={() => handleDeletePost({
                                        id: 2,
                                        content: "Tổ chức thành công workshop 'Lập trình Scratch cho học sinh' với 45 em tham gia. Cảm ơn các em đã nhiệt tình tham gia! 🚀 #Scratch #LậpTrình"
                                    })}
                                />

                                <PostCard
                                    author={profile?.firstName && profile?.lastName 
                                        ? `${profile.firstName} ${profile.lastName}` 
                                        : profile?.username || "Tôi"}
                                    class={profile?.teacherCode || "Giáo viên"}
                                    time="1 ngày trước"
                                    content="Thông báo về cuộc thi 'Sáng tạo ứng dụng di động' dành cho học sinh khối 11-12. Hạn nộp bài: 15/12/2024. Giải thưởng hấp dẫn đang chờ đón! 🏆"
                                    likes={23}
                                    comments={12}
                                    shares={5}
                                    isVerified={true}
                                    createdBy={currentUserId}
                                    currentUserId={currentUserId}
                                    onEdit={() => handleEditPost({
                                        id: 3,
                                        content: "Thông báo về cuộc thi 'Sáng tạo ứng dụng di động' dành cho học sinh khối 11-12. Hạn nộp bài: 15/12/2024. Giải thưởng hấp dẫn đang chờ đón! 🏆"
                                    })}
                                    onDelete={() => handleDeletePost({
                                        id: 3,
                                        content: "Thông báo về cuộc thi 'Sáng tạo ứng dụng di động' dành cho học sinh khối 11-12. Hạn nộp bài: 15/12/2024. Giải thưởng hấp dẫn đang chờ đón! 🏆"
                                    })}
                                />

                                <PostCard
                                    author={profile?.firstName && profile?.lastName 
                                        ? `${profile.firstName} ${profile.lastName}` 
                                        : profile?.username || "Tôi"}
                                    class={profile?.teacherCode || "Giáo viên"}
                                    time="3 ngày trước"
                                    content="Chia sẻ tài liệu học tập về 'An toàn thông tin trên Internet' cho học sinh. Các em hãy tải về và học tập nhé! 📚 #AnToànThôngTin #HọcTập"
                                    images={["/Picturemockdata/IMG_1492.jpg", "/Picturemockdata/DSC03778.jpg", "/Picturemockdata/DSC04766.jpg"]}
                                    likes={19}
                                    comments={6}
                                    shares={3}
                                    isVerified={true}
                                    createdBy={currentUserId}
                                    currentUserId={currentUserId}
                                    onEdit={() => handleEditPost({
                                        id: 4,
                                        content: "Chia sẻ tài liệu học tập về 'An toàn thông tin trên Internet' cho học sinh. Các em hãy tải về và học tập nhé! 📚 #AnToànThôngTin #HọcTập",
                                        images: ["/Picturemockdata/IMG_1492.jpg", "/Picturemockdata/DSC03778.jpg", "/Picturemockdata/DSC04766.jpg"]
                                    })}
                                    onDelete={() => handleDeletePost({
                                        id: 4,
                                        content: "Chia sẻ tài liệu học tập về 'An toàn thông tin trên Internet' cho học sinh. Các em hãy tải về và học tập nhé! 📚 #AnToànThôngTin #HọcTập"
                                    })}
                                />

                                <PostCard
                                    author={profile?.firstName && profile?.lastName 
                                        ? `${profile.firstName} ${profile.lastName}` 
                                        : profile?.username || "Tôi"}
                                    class={profile?.teacherCode || "Giáo viên"}
                                    time="1 tuần trước"
                                    content="Kết quả bài kiểm tra giữa kỳ môn Tin học 12. Chúc mừng các em đạt điểm cao! Những em chưa đạt yêu cầu hãy cố gắng hơn nữa 💪 #KếtQuảThi #TinHọc12"
                                    images={["/Picturemockdata/DSC03778.jpg", "/Picturemockdata/IMG_1492.jpg"]}
                                    gif="https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif"
                                    video="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                                    hashtags={["KếtQuảThi", "TinHọc12", "GiáoDục", "FPT"]}
                                    album="Kết quả thi"
                                    privacy="public"
                                    likes={31}
                                    comments={18}
                                    shares={4}
                                    isVerified={true}
                                    createdBy={currentUserId}
                                    currentUserId={currentUserId}
                                    onEdit={() => handleEditPost({
                                        id: 5,
                                        content: "Kết quả bài kiểm tra giữa kỳ môn Tin học 12. Chúc mừng các em đạt điểm cao! Những em chưa đạt yêu cầu hãy cố gắng hơn nữa 💪 #KếtQuảThi #TinHọc12",
                                        images: ["/Picturemockdata/DSC03778.jpg", "/Picturemockdata/IMG_1492.jpg"],
                                        gif: "https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif",
                                        video: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                                    })}
                                    onDelete={() => handleDeletePost({
                                        id: 5,
                                        content: "Kết quả bài kiểm tra giữa kỳ môn Tin học 12. Chúc mừng các em đạt điểm cao! Những em chưa đạt yêu cầu hãy cố gắng hơn nữa 💪 #KếtQuảThi #TinHọc12"
                                    })}
                                />

                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            )}

            {/* Create Post Modal */}
            <CreatePostModal 
                isOpen={isCreatePostModalOpen}
                onClose={handleCloseCreatePostModal}
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
    )
}
