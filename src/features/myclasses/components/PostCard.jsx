import { useState, useEffect, useRef } from "react";
import {
  Heart,
  Download,
  FileText,
  Image,
  Video,
  Calendar,
  User,
  Edit,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent, CardHeader } from "@/common/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/common/components/ui/avatar";
import { PostService } from "@/features/landing/post/services/post.service";
import { useToast } from "@/common/hooks/useToast";

export default function PostCard({
  post,
  onPostUpdated,
  canEdit = false,
  onEdit,
  onDelete,
}) {
  const [isLiked, setIsLiked] = useState(post.isLikedByCurrentUser);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [isLiking, setIsLiking] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const { showError } = useToast();
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const handleLike = async () => {
    if (isLiking) return;

    setIsLiking(true);
    try {
      const postService = new PostService();
      const token = localStorage.getItem("token");
      await postService.LikePost({ postId: post.id }, token);
      setIsLiked(!isLiked);
      setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
    } catch (error) {
      console.error("Error liking post:", error);
      showError("Không thể thích bài viết. Vui lòng thử lại.");
    } finally {
      setIsLiking(false);
    }
  };

  const handleDownload = (url, fileName) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName || "download";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteClick = () => {
    setShowMenu(false);
    onDelete && onDelete(post);
  };

  const getFileIcon = (url) => {
    const extension = url.split(".").pop()?.toLowerCase();

    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) {
      return <Image className="h-4 w-4" />;
    } else if (["mp4", "avi", "mov", "wmv"].includes(extension)) {
      return <Video className="h-4 w-4" />;
    } else {
      return <FileText className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Không xác định'

    // Parse date từ backend (assume UTC nếu không có timezone indicator)
    let date = new Date(dateString)
    
    // Nếu parse fail, thử thêm 'Z' để force UTC
    if (isNaN(date.getTime()) && typeof dateString === 'string' && !dateString.includes('Z') && !dateString.includes('+')) {
      date = new Date(dateString + 'Z')
    }
    
    if (isNaN(date.getTime())) return 'Không xác định'

    // Lấy UTC time từ date (backend trả về UTC)
    const postTimeUTC = date.getTime()
    const nowUTC = Date.now()

    // Tính diff trực tiếp (cả 2 đều UTC)
    const diffInMs = nowUTC - postTimeUTC
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInMinutes < 1) {
      return 'Vừa xong'
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} phút trước`
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ trước`
    } else if (diffInDays < 7) {
      return `${diffInDays} ngày trước`
    } else {
      // Format date hiển thị (convert sang VN time để hiển thị)
      const vnDate = new Date(postTimeUTC + 7 * 60 * 60 * 1000)
      return vnDate.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }
  }



  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.userAvatarUrl} />
            <AvatarFallback>
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-gray-900">
                {post.userFullName}
              </h4>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Calendar className="h-3 w-3" />
              {formatDate(post.createdAt)}
            </div>
          </div>

          {canEdit && (
            <div className="relative" ref={menuRef}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMenu(!showMenu)}
                className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>

              {showMenu && (
                <div className="absolute right-0 top-8 z-10 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onEdit && onEdit(post);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Edit className="h-4 w-4" />
                    Chỉnh sửa
                  </button>

                  <button
                    onClick={handleDeleteClick}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Xóa
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {post.title && (
          <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
        )}

        <p className="text-gray-700 whitespace-pre-wrap">{post.body}</p>

        {post.hashtags && post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {post.hashtags.map((hashtag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                #{hashtag}
              </Badge>
            ))}
          </div>
        )}

        {((post.attachments && post.attachments.length > 0) ||
          (post.attachmentUrls && post.attachmentUrls.length > 0)) && (
          <div className="space-y-3">
            <h5 className="text-sm font-medium text-gray-700">Tệp đính kèm:</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {post.attachments && post.attachments.length > 0
                ? post.attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="h-8 w-8 bg-gray-200 rounded flex items-center justify-center">
                        {getFileIcon(attachment.url)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 truncate">
                          {attachment.fileName || `Tệp đính kèm ${index + 1}`}
                        </p>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleDownload(
                            attachment.url,
                            attachment.fileName || `attachment_${index + 1}`
                          )
                        }
                        className="h-8 w-8 p-0"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                : post.attachmentUrls.map((url, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="h-8 w-8 bg-gray-200 rounded flex items-center justify-center">
                        {getFileIcon(url)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 truncate">
                          Tệp đính kèm {index + 1}
                        </p>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleDownload(url, `attachment_${index + 1}`)
                        }
                        className="h-8 w-8 p-0"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 pt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={isLiking}
            className={`flex items-center gap-2 ${
              isLiked
                ? "text-red-500 hover:text-red-600"
                : "text-gray-500 hover:text-gray-600"
            }`}
          >
            <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
            {likeCount}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
