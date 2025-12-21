import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Shield,
  ChevronLeft,
  ChevronRight,
  Lock,
  Users,
  Globe,
  Image as ImageIcon,
  Edit,
  Trash2,
  Bookmark,
  Plus,
  Folder,
} from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Card } from "@/common/components/ui/card";
import { Badge } from "@/common/components/ui/badge";
import albumCover from "@/img/albumCover.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/common/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/common/components/ui/dialog";
import { useState, useEffect } from "react";
import { usePostApi } from "../post/hooks/usePostApi";
import { useCollectionApi } from "../collection/hooks/useCollectionApi";
import { useToast } from "@/common/hooks/useToast";
import { CommentSection } from "./Comment/components/page";
export default function PostCard({
  author,
  avatarUrl,
  class: className,
  time,
  postId,
  content,
  image, // Có thể là string hoặc array
  images, // Array of images
  gif, // Single GIF
  video, // Single video
  videos, // Array of videos
  hashtags = [], // Array of hashtags
  album, // Album name
  privacy, // 'public', 'friends', 'private'
  likes,
  comments,
  shares,
  isLiked,
  isVerified = false,
  contestEntry = false,
  createdBy, // ID của người tạo bài đăng
  currentUserId, // ID của người dùng hiện tại
  onEdit, // Function to handle edit
  onDelete,
  title, // Function to handle delete
}) {
  // Xử lý images - ưu tiên images array, fallback về image string
  const imageList = images || (image ? [image] : []);
  // Xử lý gifs - chỉ lấy 1 gif
  const gifItem = gif || null;
  // Xử lý videos - ưu tiên videos array, fallback về video string
  const videoList = videos || (video ? [video] : []);
  // Kết hợp tất cả media (images + gif + videos)
  const mediaList = [...imageList, ...(gifItem ? [gifItem] : []), ...videoList];
  const [likeCount, setLikeCount] = useState(likes);
  const [liked, setLiked] = useState(isLiked || false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isAlbumPopupOpen, setIsAlbumPopupOpen] = useState(false);
  const [userAlbum, setUserAlbum] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const { likePost } = usePostApi();
  const { getCollectionsByUser, addCollectionIteam } = useCollectionApi();
  // Hàm chuyển media (ảnh/gif)
  const nextMedia = () => {
    setCurrentMediaIndex((prev) => (prev + 1) % mediaList.length);
  };
  const toast = useToast();
  const handleLike = async (id) => {
    try {
      const res = await likePost({ postId: id });

      if (liked) {
        setLikeCount((prev) => Math.max(prev - 1, 0));
        setLiked(false);
      } else {
        setLikeCount((prev) => prev + 1);
        setLiked(true);
      }
    } catch (err) {
      console.error("Lỗi khi like:", err);
    }
  };
  const hanldeUserAlbum = async () => {
    try {
      const response = await getCollectionsByUser();
      setUserAlbum(response?.data.data || []);
    } catch (err) {
      toast.loadAlbumFail();
      console.error("Lỗi khi like:", err);
    }
  };
  const hanldeOpenCollection = async () => {
    setIsAlbumPopupOpen(true);
  };
  const hanldeSaveCollection = async (id) => {
    try {
      const payload = { postId: postId, collectionId: id };
      const response = await addCollectionIteam(payload);
      toast.addCollectionIteamSuccess();
    } catch (err) {
      toast.addCollectionIteamSuccess();
    }
  };

  const formatTime = (time) => {
    if (!time) return "Chưa cập nhật";

    // Normalize time input to avoid invalid date / wrong timezone
    let parsed = new Date(time);
    if (typeof time === "string" && isNaN(parsed.getTime())) {
      // If backend sends ISO without timezone, assume UTC
      parsed = new Date(`${time}Z`);
    }
    if (isNaN(parsed.getTime())) return "Chưa cập nhật";
    if (parsed.getFullYear() < 2000) return "Chưa cập nhật";

    const postTimeInVN = new Date(
      parsed.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
    );
    if (isNaN(postTimeInVN.getTime())) return "Chưa cập nhật";
    if (postTimeInVN.getFullYear() < 2000) return "Chưa cập nhật";

    const formatDateTime = (date) => {
      const pad = (val) => String(val).padStart(2, "0");
      return `${pad(date.getHours())}:${pad(date.getMinutes())} ${pad(
        date.getDate()
      )}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
    };

    const nowInVN = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
    );

    const diffMs = nowInVN - postTimeInVN;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 5) return "Mới xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays === 1) return "1 ngày trước";
    if (diffDays === 2) return "2 ngày trước";
    if (diffDays === 3) return "3 ngày trước";

    return formatDateTime(postTimeInVN);
  };

  const prevMedia = () => {
    setCurrentMediaIndex(
      (prev) => (prev - 1 + mediaList.length) % mediaList.length
    );
  };

  // Kiểm tra xem media hiện tại có phải là GIF không
  const isCurrentMediaGif = (index) => {
    const currentMedia = mediaList[index];
    if (!currentMedia) return false;
    return (
      currentMedia.toLowerCase().includes(".gif") ||
      currentMedia.includes("giphy") ||
      currentMedia.includes("tenor")
    );
  };

  // Kiểm tra xem media hiện tại có phải là Video không
  const isCurrentMediaVideo = (index) => {
    const currentMedia = mediaList[index];
    if (!currentMedia) return false;
    return (
      currentMedia.toLowerCase().includes(".mp4") ||
      currentMedia.toLowerCase().includes(".webm") ||
      currentMedia.toLowerCase().includes(".mov") ||
      currentMedia.includes("youtube") ||
      currentMedia.includes("vimeo")
    );
  };

  // Hàm render privacy icon
  const getPrivacyIcon = () => {
    switch (privacy) {
      case 1:
        return <Lock className="h-3 w-3" />;
      case "friends":
        return <Users className="h-3 w-3" />;
      case 0:
      default:
        return <Globe className="h-3 w-3" />;
    }
  };

  // Hàm render privacy text
  const getPrivacyText = () => {
    switch (privacy) {
      case 1:
        return "Nội bộ";
      case "friends":
        return "Bạn bè";
      case "public":
      default:
        return "Công khai";
    }
  };
  useEffect(() => {
    if (isAlbumPopupOpen) {
      hanldeUserAlbum();
    }
  }, [isAlbumPopupOpen]);

  const isOwner = createdBy && currentUserId && createdBy === currentUserId;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <>
      <Card className="p-4 hover:shadow-md transition-shadow bg-white/90 backdrop-blur-sm border border-orange-100">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full flex items-center justify-center">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={author}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {author.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-semibold text-gray-900">
                  {author || "Ẩn danh"}
                </h4>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>{className}</span>
                <span>•</span>
                <span>{formatTime(time)}</span>
                {album && (
                  <>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <ImageIcon className="h-3 w-3" />
                      <span className="text-blue-600 font-medium">{album}</span>
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <div className="flex items-center space-x-1 text-xs text-gray-400">
                  {getPrivacyIcon()}
                  <span>{getPrivacyText()}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  data-dropdown-trigger
                >
                  <MoreHorizontal className="h-4 w-4 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48"
                isOpen={isDropdownOpen}
                onClose={() => setIsDropdownOpen(false)}
              >
                {isOwner && (
                  <>
                    <DropdownMenuItem
                      onClick={() => {
                        onDelete();
                        setIsDropdownOpen(false);
                      }}
                      className="flex items-center space-x-2 text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Xóa bài đăng</span>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center space-x-2 text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Chia sẻ</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    hanldeOpenCollection();
                    setIsDropdownOpen(false);
                  }}
                  className="flex items-center space-x-2 text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  <Bookmark className="h-4 w-4" />
                  <span>Lưu vào bộ sưu tập</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Content */}
        <div className="mb-3">
          <p className="text-gray-900 font-bold text-xl mb-2">{title}</p>
          <p className="text-gray-800 leading-relaxed">{content}</p>

          {/* Hashtags */}
          {hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
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

        {/* Media (Images, GIFs & Videos) */}
        {mediaList.length > 0 && (
          <div className="mb-4 rounded-lg overflow-hidden border border-gray-200 relative group">
            {isCurrentMediaVideo(currentMediaIndex) ? (
              <video
                src={mediaList[currentMediaIndex]}
                controls
                className="w-full h-auto object-cover"
                style={{ maxHeight: "400px" }}
              >
                Your browser does not support the video tag.
              </video>
            ) : isCurrentMediaGif(currentMediaIndex) ? (
              <img
                src={mediaList[currentMediaIndex] || "/placeholder.svg"}
                alt="Post GIF"
                className="w-full h-auto object-cover"
                style={{ maxHeight: "400px" }}
              />
            ) : (
              <img
                src={mediaList[currentMediaIndex] || "/placeholder.svg"}
                alt="Post content"
                className="w-full h-auto object-cover"
              />
            )}

            {/* Media Type Badges */}
            {isCurrentMediaGif(currentMediaIndex) && (
              <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>GIF</span>
              </div>
            )}

            {isCurrentMediaVideo(currentMediaIndex) && (
              <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span>VIDEO</span>
              </div>
            )}

            {/* Navigation buttons - chỉ hiện khi có nhiều hơn 1 media */}
            {mediaList.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={prevMedia}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={nextMedia}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Media indicators */}
            {mediaList.length > 1 && (
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                {mediaList.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentMediaIndex ? "bg-white" : "bg-white/50"
                    }`}
                    onClick={() => setCurrentMediaIndex(index)}
                  />
                ))}
              </div>
            )}

            {/* Media counter */}
            {mediaList.length > 1 && (
              <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                {currentMediaIndex + 1}/{mediaList.length}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
       {/* Actions */}
<div className="pt-3 border-t border-gray-100">
  {/* Hàng nút Like / Comment */}
  <div className="flex items-center space-x-6">
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleLike(postId)}
      className={`transition-colors ${
        liked
          ? "text-red-500 hover:text-red-600 hover:bg-red-100"
          : "text-gray-600 hover:text-red-500 hover:bg-red-50"
      }`}
    >
      <Heart className={`h-4 w-4 mr-2 ${liked ? "fill-red-500" : ""}`} />
      <span className="text-sm font-medium">{likeCount}</span>
    </Button>

    <Button
      variant="ghost"
      size="sm"
      className="text-gray-600 hover:text-blue-500 hover:bg-blue-50 transition-colors"
      onClick={() => setShowComments((prev) => !prev)}
    >
      <MessageCircle className="h-4 w-4 mr-2" />
      <span className="text-sm font-medium">{comments}</span>
    </Button>
  </div>

  {/* Bình luận hiển thị ở đây */}
  {showComments && (
    <div className="mt-4">
      <CommentSection postId={postId} />
    </div>
  )}
</div>

      </Card>
      <Dialog open={isAlbumPopupOpen} onOpenChange={setIsAlbumPopupOpen}>
        <DialogContent className="max-w-md !bg-white">
          <DialogHeader>
            <DialogTitle>Chọn album</DialogTitle>
          </DialogHeader>

          <div className="space-y-4  max-h-[60vh] overflow-y-auto bg-white-500">
            {/* Nút tạo album */}
            <Button
              onClick={() => {
                // slideToView("album-create") nếu có
              }}
              className="w-full flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-orange-300 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg"
            >
              <Plus className="h-5 w-5" />
              <span className="font-medium">Tạo album mới</span>
            </Button>

            {/* Album hiện có */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">
                Album hiện có
              </h3>
              {userAlbum.map((album) => (
                <button
                  key={album.id}
                  onClick={() => {
                    hanldeSaveCollection(album.id);
                    setIsAlbumPopupOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 p-3 border border-gray-200 
                 rounded-lg bg-white hover:bg-orange-50 hover:border-orange-300 
                 transition-all duration-200 text-left"
                >
                  <div className="w-28 h-28 flex-shrink-0 rounded-md overflow-hidden">
                    {album.collectionItems &&
                    album.collectionItems.length > 0 ? (
                      <>
                        {/* 1 ảnh */}
                        {album.collectionItems.length === 1 && (
                          <img
                            src={album.collectionItems[0].image || albumCover}
                            alt="Ảnh 1"
                            className="w-full h-full object-cover"
                          />
                        )}

                        {/* 2 ảnh → chia đôi dọc */}
                        {album.collectionItems.length === 2 && (
                          <div className="grid grid-rows-2 gap-0 w-full h-full">
                            {album.collectionItems
                              .slice(0, 2)
                              .map((item, idx) => (
                                <img
                                  key={idx}
                                  src={item.image || albumCover}
                                  alt={`Ảnh ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              ))}
                          </div>
                        )}

                        {/* 3 ảnh → bên trái 1 ảnh, bên phải 2 ảnh */}
                        {album.collectionItems.length === 3 && (
                          <div className="grid grid-cols-2 gap-0 w-full h-full">
                            {/* Bên trái chiếm full chiều cao */}
                            <img
                              src={album.collectionItems[0].image || albumCover}
                              alt="Ảnh 1"
                              className="w-full h-full object-cover"
                            />
                            {/* Bên phải chia 2 ảnh nhỏ */}
                            <div className="grid grid-rows-2 gap-0 h-full">
                              {album.collectionItems
                                .slice(1, 3)
                                .map((item, idx) => (
                                  <img
                                    key={idx}
                                    src={item.image || albumCover}
                                    alt={`Ảnh ${idx + 2}`}
                                    className="w-full h-full object-cover"
                                  />
                                ))}
                            </div>
                          </div>
                        )}

                        {/* 4 ảnh → lưới 2x2 */}
                        {album.collectionItems.length >= 4 && (
                          <div className="grid grid-cols-2 grid-rows-2 gap-0 w-full h-full">
                            {album.collectionItems
                              .slice(0, 4)
                              .map((item, idx) => (
                                <img
                                  key={idx}
                                  src={item.image || albumCover}
                                  alt={`Ảnh ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <img
                        src={albumCover}
                        alt="Default Album Cover"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  <div className="flex-1 space-y-4 !ml-4 ">
                    <h4 className="font-medium text-gray-900 text-xl">
                      {album.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {album.collectionItems?.length} bài đăng
                    </p>
                  </div>
                  <Folder className="h-5 w-5 text-orange-500" />
                </button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAlbumPopupOpen(false)}
              className="w-full border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              Không thêm vào album
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
