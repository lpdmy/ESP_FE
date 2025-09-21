import { Avatar, AvatarFallback, AvatarImage } from "@/common/components/ui/avatar"
import { Button } from "@/common/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card"
import { Badge } from "@/common/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/common/components/ui/tabs"
import { Loading, LoadingOverlay, LoadingCard } from "@/common/components/ui/loading"
import { useToast } from "@/common/hooks/useToast"
import { useProfileApi } from "@/features/user-profile/hooks/useProfileApi"
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
} from "lucide-react"
import { Link } from "react-router-dom"
import { ROUTES } from "@/common/constants/routes"
import { useState, useEffect } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, useDropdownMenu } from "@/common/components/ui/dropdown-menu"
import PostCard from "@/features/landing/components/PostCard"
import { Textarea } from "@/common/components/ui/textarea"

export default function StudentProfile() {
    const [profile, setProfile] = useState(null);
    const [extraData, setExtraData] = useState({});
    const [sortBy, setSortBy] = useState("newest");
    const [postContent, setPostContent] = useState("");
    const { isOpen: isSortDropdownOpen, openMenu: openSortDropdown, closeMenu: closeSortDropdown, toggleMenu: toggleSortDropdown } = useDropdownMenu(false);
    const toast = useToast();

    // Profile API hook
    const { profileLoading, getMyProfile } = useProfileApi();


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
                        console.warn('Failed to parse ExtraJson:', e);
                        setExtraData({});
                    }
                }
            } catch (error) {
                console.error('Error loading profile:', error);
                toast.profileLoadFailed();
            }
        };

        loadProfile();
    }, []); // Empty dependency array to run only once


    return (
        <>
            <LoadingOverlay
                isLoading={profileLoading}
                text={toast.PROFILE_MESSAGES.LOADING.PROFILE}
                variant="primary"
            />
            {!profile ? (
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <LoadingCard text={toast.PROFILE_MESSAGES.LOADING.PROFILE} className="h-64" variant="primary" />
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
                                                : profile.username ? profile.username[0].toUpperCase() : 'U'}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="space-y-2">
                                        <h1 className="text-2xl font-bold text-gray-800">
                                            {profile.firstName && profile.lastName
                                                ? `${profile.firstName} ${profile.lastName}`
                                                : profile.username || 'Chưa có tên'}
                                        </h1>
                                        <div className="flex flex-wrap gap-2">
                                            {profile.classGroupName && (
                                                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                                                    {profile.classGroupName}
                                                </Badge>
                                            )}
                                            {profile.studentNumber && (
                                                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                                    {profile.studentNumber}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Star className="w-5 h-5 text-yellow-500 fill-current" />
                                            <span className="font-semibold text-orange-600">Hồ sơ học sinh</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats + Edit */}
                                <div className="flex-1 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-center">
                                                <Calendar className="w-4 h-4 text-orange-500 mr-1" />
                                                <span className="text-2xl font-bold text-gray-800">15</span>
                                            </div>
                                            <p className="text-sm text-gray-600">{toast.PROFILE_MESSAGES.LABELS.EVENTS}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-center">
                                                <Trophy className="w-4 h-4 text-yellow-500 mr-1" />
                                                <span className="text-2xl font-bold text-gray-800">8</span>
                                            </div>
                                            <p className="text-sm text-gray-600">{toast.PROFILE_MESSAGES.LABELS.AWARDS}</p>
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
                            <TabsTrigger value="introduction" className="flex items-center justify-center gap-2">
                                <User className="w-4 h-4" />
                                {toast.PROFILE_MESSAGES.LABELS.INTRODUCTION}
                            </TabsTrigger>
                            <TabsTrigger value="posts" className="flex items-center justify-center gap-2">
                                <FileText className="w-4 h-4" />
                                Bài đăng
                            </TabsTrigger>
                            <TabsTrigger value="activities" className="flex items-center justify-center gap-2">
                                <Activity className="w-4 h-4" />
                                {toast.PROFILE_MESSAGES.LABELS.ACTIVITIES}
                            </TabsTrigger>
                            <TabsTrigger value="achievements" className="flex items-center justify-center gap-2">
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
                                                {profile.bio || 'Chưa có thông tin giới thiệu bản thân.'}
                                            </p>

                                            {/* Thông tin chi tiết */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                                                <div>
                                                    <h4 className="font-semibold text-gray-800 mb-2">Thông tin liên hệ</h4>
                                                    <div className="space-y-1 text-sm text-gray-600">
                                                        <p><span className="font-medium">Email:</span> {profile.email || 'Chưa cập nhật'}</p>
                                                        <p><span className="font-medium">Số điện thoại:</span> {profile.phoneNumber || 'Chưa cập nhật'}</p>
                                                        <p><span className="font-medium">Ngày sinh:</span> {profile.birthDate ? new Date(profile.birthDate).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-800 mb-2">Thông tin học tập</h4>
                                                    <div className="space-y-1 text-sm text-gray-600">
                                                        <p><span className="font-medium">Mã số học sinh:</span> {profile.studentNumber || 'Chưa cập nhật'}</p>
                                                        <p><span className="font-medium">Năm nhập học:</span> {profile.enrollmentYear || 'Chưa cập nhật'}</p>
                                                        <p><span className="font-medium">Lớp:</span> {profile.classGroupName || 'Chưa cập nhật'}</p>
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
                                                    <Badge key={index} className="bg-gradient-orange text-white flex items-center gap-1">
                                                        <Code className="w-3 h-3" />
                                                        {interest}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <p className="text-gray-500 italic">Chưa có sở thích nào được cập nhật.</p>
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
                                                    <span className="text-sm text-gray-500">15/03/2024</span>
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
                                                    Chia sẻ bài viết: "Hướng dẫn React cho người mới bắt đầu"
                                                </h3>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Bài viết nhận được 45 lượt thích và 12 bình luận
                                                </p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-500">10/03/2024</span>
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
                                                <p className="text-sm text-gray-600 mt-1">Học về các ứng dụng AI trong giáo dục</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-500">05/03/2024</span>
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
                                                    <p className="font-semibold text-green-800">+200 Star Points</p>
                                                    <p className="text-sm text-green-600">Giải Nhì cuộc thi lập trình</p>
                                                </div>
                                                <span className="text-sm text-gray-500">15/03/2024</span>
                                            </div>
                                            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                                <div>
                                                    <p className="font-semibold text-blue-800">+50 Star Points</p>
                                                    <p className="text-sm text-blue-600">Bài viết được nhiều lượt thích</p>
                                                </div>
                                                <span className="text-sm text-gray-500">10/03/2024</span>
                                            </div>
                                            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                                                <div>
                                                    <p className="font-semibold text-orange-800">+30 Star Points</p>
                                                    <p className="text-sm text-orange-600">Tham gia Workshop AI</p>
                                                </div>
                                                <span className="text-sm text-gray-500">05/03/2024</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Bài đăng của tôi */}
                        <TabsContent value="posts">
                            <div className="space-y-6">
                                {/* Create Post - Editable */}
                                <Card className="p-4 bg-white/80 backdrop-blur-sm border border-orange-100">
                                    <div className="flex items-start space-x-3">
                                        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
                                            <span className="text-white font-bold text-sm">
                                                {profile?.firstName && profile?.lastName 
                                                    ? `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase()
                                                    : profile?.username ? profile.username[0].toUpperCase() : 'S'}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <Textarea
                                                placeholder="Chia sẻ hoạt động học tập, sở thích và thành tích của bạn..."
                                                value={postContent}
                                                onChange={(e) => setPostContent(e.target.value)}
                                                className="w-full p-3 mt-3 border border-gray-200 rounded-md text-base resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                rows={3}
                                            />
                                            <div className="flex items-center justify-between mt-3">
                                                <div className="flex items-center space-x-4">
                                                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-orange-600 hover:bg-orange-50">
                                                        <Image className="h-4 w-4 mr-2" />
                                                        Ảnh
                                                    </Button>
                                                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-orange-600 hover:bg-orange-50">
                                                        <Video className="h-4 w-4 mr-2" />
                                                        Video
                                                    </Button>
                                                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-orange-600 hover:bg-orange-50">
                                                        <Smile className="h-4 w-4 mr-2" />
                                                        Cảm xúc
                                                    </Button>
                                                </div>
                                                <Button 
                                                    className="bg-gradient-to-r from-orange-500 to-yellow-500 border-0 text-white"
                                                    disabled={!postContent.trim()}
                                                >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Đăng bài
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                {/* Sort Controls */}
                                <Card className="p-4 bg-white border-orange-200 relative z-40">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-5 h-5 text-orange-600" />
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
                                                        className={`cursor-pointer ${sortBy === "newest" ? "bg-orange-50 text-orange-600" : "hover:bg-gray-50"}`}
                                                    >
                                                        Mới nhất
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem 
                                                        onClick={() => {
                                                            setSortBy("oldest");
                                                            closeSortDropdown();
                                                        }}
                                                        className={`cursor-pointer ${sortBy === "oldest" ? "bg-orange-50 text-orange-600" : "hover:bg-gray-50"}`}
                                                    >
                                                        Cũ nhất
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem 
                                                        onClick={() => {
                                                            setSortBy("most_liked");
                                                            closeSortDropdown();
                                                        }}
                                                        className={`cursor-pointer ${sortBy === "most_liked" ? "bg-orange-50 text-orange-600" : "hover:bg-gray-50"}`}
                                                    >
                                                        Nhiều lượt thích
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem 
                                                        onClick={() => {
                                                            setSortBy("most_commented");
                                                            closeSortDropdown();
                                                        }}
                                                        className={`cursor-pointer ${sortBy === "most_commented" ? "bg-orange-50 text-orange-600" : "hover:bg-gray-50"}`}
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
                                    class={profile?.studentId || "Học sinh"}
                                    time="1 giờ trước"
                                    content="Vừa hoàn thành bài tập lập trình Python! Cảm giác khi code chạy được thật tuyệt vời 🐍 #Python #LậpTrình #HọcTập"
                                    likes={12}
                                    comments={5}
                                    shares={2}
                                    isVerified={true}
                                    isMyPost={true}
                                />

                                <PostCard
                                    author={profile?.firstName && profile?.lastName 
                                        ? `${profile.firstName} ${profile.lastName}` 
                                        : profile?.username || "Tôi"}
                                    class={profile?.studentId || "Học sinh"}
                                    time="3 giờ trước"
                                    content="Tham gia cuộc thi 'Sáng tạo ứng dụng di động' với nhóm bạn. Ý tưởng app học tiếng Anh đang được phát triển! 📱 #AppDevelopment #TiếngAnh"
                                    image="/Picturemockdata/DSC04766.jpg"
                                    likes={18}
                                    comments={8}
                                    shares={3}
                                    isVerified={true}
                                    isMyPost={true}
                                />

                                <PostCard
                                    author={profile?.firstName && profile?.lastName 
                                        ? `${profile.firstName} ${profile.lastName}` 
                                        : profile?.username || "Tôi"}
                                    class={profile?.studentId || "Học sinh"}
                                    time="1 ngày trước"
                                    content="Chia sẻ kinh nghiệm học môn Toán. Phương pháp giải bài tập hiệu quả và cách ghi nhớ công thức! 📚 #Toán #HọcTập #ChiaSẻ"
                                    likes={25}
                                    comments={12}
                                    shares={4}
                                    isVerified={true}
                                    isMyPost={true}
                                />

                                <PostCard
                                    author={profile?.firstName && profile?.lastName 
                                        ? `${profile.firstName} ${profile.lastName}` 
                                        : profile?.username || "Tôi"}
                                    class={profile?.studentId || "Học sinh"}
                                    time="2 ngày trước"
                                    content="Workshop 'Tìm hiểu AI và Machine Learning' hôm nay thật bổ ích! Hiểu thêm về tương lai của công nghệ 🤖 #AI #MachineLearning #Workshop"
                                    likes={31}
                                    comments={15}
                                    shares={6}
                                    isVerified={true}
                                    isMyPost={true}
                                />

                                <PostCard
                                    author={profile?.firstName && profile?.lastName 
                                        ? `${profile.firstName} ${profile.lastName}` 
                                        : profile?.username || "Tôi"}
                                    class={profile?.studentId || "Học sinh"}
                                    time="3 ngày trước"
                                    content="Kết quả thi giữa kỳ môn Tin học: 9.5 điểm! Cảm ơn thầy cô và bạn bè đã hỗ trợ em trong quá trình học tập 🎉 #ThànhTích #TinHọc #CảmƠn"
                                    likes={42}
                                    comments={20}
                                    shares={8}
                                    isVerified={true}
                                    isMyPost={true}
                                />
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            )}
        </>)
    }
