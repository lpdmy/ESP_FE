import { useState, useEffect } from "react";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { useCommentApi } from "../hooks/useCommentApi";
import { MoreHorizontal,Settings,Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/common/components/ui/dropdown-menu";
import { useToast } from "@/common/hooks/useToast";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal/page";
export function CommentSection({ postId }) {
  const {
    getCommentByPost,
    getCommentByComment,
    createComment,
    updateComment,
    deleteComment,
  } = useCommentApi();
  const toast = useToast();
  const [comments, setComments] = useState([]);
  const [replyMap, setReplyMap] = useState({});
  const [showReplyInput, setShowReplyInput] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [newComment, setNewComment] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [expandedComments, setExpandedComments] = useState({});
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const handleDeleteClick = (id) => {
    setSelectedId(id);
    setOpenConfirm(true);
  };

  const confirmDelete = async () => {
    await handleDeleteComment(selectedId);
  };

  const toggleExpand = (id) => {
    setExpandedComments((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };
  const toggleMenu = (commentId) => {
    setOpenMenuId((prev) => (prev === commentId ? null : commentId));
  };
  const handleEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content);
  };
  const formatTime = (time) => {
    const now = new Date();
    const postTime = new Date(time);

    // Lấy thời gian ở UTC+7 (Asia/Ho_Chi_Minh)
    const postTimeInVN = new Date(
      postTime.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
    );
    const nowInVN = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
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
    return postTimeInVN.toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };
   const fetchComments = async () => {
      if (!postId) return;
      if (loading) return; // tránh gọi chồng
      if (!hasMore && pageNumber > 1) return; // hết rồi thì thôi

      setLoading(true);
      try {
        const res = await getCommentByPost(postId, pageNumber, pageSize);
        const newComments = res?.data?.data ?? [];
        const total = res?.data?.totalCount ?? 0; // <-- backend C# có TotalCount
        setTotalCount(total);

        // Gộp + chống trùng theo id
        setComments((prev) => {
          const merged =
            pageNumber === 1 ? newComments : [...prev, ...newComments];
          const seen = new Set();
          return merged.filter((c) => {
            if (seen.has(c.id)) return false;
            seen.add(c.id);
            return true;
          });
        });

        // Tính hasMore CHUẨN bằng totalCount
        const loadedCount = pageNumber * pageSize;
        const noMoreByTotal = loadedCount >= total; // đã tải đủ/hết
        const noMoreByEmpty = newComments.length === 0; // trang này rỗng
        setHasMore(!(noMoreByTotal || noMoreByEmpty));
      } catch (e) {
        console.error(e);
        toast.loadCommentFail?.();
      } finally {
        setLoading(false);
      }
    };
  useEffect(() => {
    fetchComments();
  }, [postId, pageNumber]); // KHÔNG thêm hasMore/loading vào deps

  // Khi đổi post → reset dữ liệu + bắt đầu từ đầu
  useEffect(() => {
    setComments([]);
    setPageNumber(1);
    setHasMore(true);
    setTotalCount(0);
  }, [postId]);

  // ✅ Load replies cho comment cụ thể
  const handleLoadReplies = async (parentId) => {
    try {
      const res = await getCommentByComment(parentId);
      setReplyMap((prev) => ({
        ...prev,
        [parentId]: res.data.data || [],
      }));
      console.log(res.data.data);
    } catch (error) {
      console.error("Lỗi khi load phản hồi:", error);
      toast.loadCommentFail();
    }
  };
  const handleSaveEdit = async (id) => {
    try {
      const payload = { commentId: id, content: editingContent };
      await updateComment(payload);

      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, content: editingContent } : c))
      );

      setReplyMap((prev) => {
        const newMap = { ...prev };
        for (const key in newMap) {
          newMap[key] = newMap[key].map((r) =>
            r.id === id ? { ...r, content: editingContent } : r
          );
        }
        return newMap;
      });

      toast.editCommentSuccess();
    } catch (error) {
      console.error("Lỗi khi cập nhật bình luận:", error);
      toast.editCommentFail();
    } finally {
      setEditingCommentId(null);
      setEditingContent("");
    }
  };
  const handleDeleteComment = async (id) => {
    try {
      await deleteComment(id);
      setComments((prev) => prev.filter((c) => c.id !== id));
      toast.deleteCommentSuccess()
      handleLoadReplies()
      fetchComments()
    } catch (error) {
      console.error("Lỗi khi xóa bình luận:", error);
      toast.deleteCommentFail()
    }
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) return;
    try {
      const payload = { postId, parentCommentId: null, content: newComment };
      const res = await createComment(payload);
      setComments((prev) => [res.data, ...prev]);
      setNewComment("");
    } catch (error) {
      console.error("Lỗi khi gửi bình luận:", error);
    }
  };

  // ✅ Gửi phản hồi (reply)
  const handleSendReply = async (parentId) => {
    if (!replyText.trim()) return;
    try {
      const payload = { postId, parentCommentId: parentId, content: replyText };
      const res = await createComment(payload);
      setReplyMap((prev) => ({
        ...prev,
        [parentId]: [...(prev[parentId] || []), res.data],
      }));
      setReplyText("");
      setShowReplyInput(null);
    } catch (error) {
      console.error("Lỗi khi gửi phản hồi:", error);
    }
  };

  return (
    <div className="mt-4 border-t border-gray-200 pt-4 bg-white rounded-b-xl shadow-sm">
      {/* Nhập bình luận mới */}
      <div className="flex items-center gap-2 mb-5">
        <Input
          placeholder="Viết bình luận..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="flex-1 text-[15px] px-3 py-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400"
        />
        <Button
          onClick={handleSendComment}
          className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-5 py-2 rounded-lg"
        >
          Gửi
        </Button>
      </div>

      {/* Danh sách bình luận */}
      <div className="space-y-4">
        {comments.length === 0 && (
          <p className="text-gray-500 text-[15px] text-center">
            Chưa có bình luận nào.
          </p>
        )}

        {comments.map((comment) => (
          <div
            key={comment.id}
            className="relative bg-white rounded-xl p-4 border border-gray-100"
          >
            <div className="flex gap-3">
              {/* Avatar */}
              {comment.userAvatar ? (
                <img
                  src={comment.userAvatar}
                  alt={comment.userName || "Người dùng"}
                  className="w-10 h-10 rounded-full object-cover border border-gray-200"
                  onError={(e) => (e.target.src = "/default-avatar.png")}
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-orange-400 flex items-center justify-center text-white font-semibold text-sm uppercase">
                  {comment.userName?.charAt(0) || "?"}
                </div>
              )}

              {/* Nội dung */}
              <div className="flex-1">
                <div className="flex gap-4">
                  <p className="font-semibold text-[16px] text-gray-900">
                    {comment.userName}
                  </p>
                  <div className="flex gap-3">
                    <p className="text-xs pt-1">
                      {formatTime(comment.createdAt)}
                    </p>
                    <p>
                      {comment.updatedAt && (
                        <span className="text-sm italic text-gray-400">
                          (đã chỉnh sửa)
                        </span>
                      )}
                    </p>
                  </div>

                  {comment.isCurrentUser && (
                    <div className="absolute right-3 top-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          asChild
                          onClick={() => toggleMenu(comment.id)}
                          data-dropdown-trigger
                        >
                          <button className="p-1 rounded-full hover:bg-gray-100">
                            <MoreHorizontal className="h-5 w-5 text-gray-600" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-36"
                          isOpen={openMenuId === comment.id}
                          onClose={() => setOpenMenuId(null)}
                        >
                          <DropdownMenuItem
                            onClick={() => {
                              handleEditComment(comment);
                              setOpenMenuId(null);
                            }}
                          >
                            <Settings className="h-4 w-4 mr-1"/>
                             Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(comment.id)}
                            className="text-red-500 focus:text-red-600"
                          >
                            <Trash className="h-4 w-4 mr-1"/>
                             Xóa
                          </DropdownMenuItem>
                          <ConfirmDeleteModal
                            isOpen={openConfirm}
                            onClose={() => setOpenConfirm(false)}
                            onConfirm={confirmDelete}
                          />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
                {editingCommentId === comment.id ? (
                  <div className="flex flex-col gap-2 mt-1">
                    <Input
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      className="flex-1 text-[15px] px-3 py-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400"
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                        onClick={() => handleSaveEdit(comment.id)}
                      >
                        Lưu
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingCommentId(null);
                          setEditingContent("");
                        }}
                      >
                        Hủy
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-[15px] text-gray-800 leading-relaxed mt-0.5">
                    {comment.content.length > 120 ? (
                      <>
                        <span>
                          {expandedComments[comment.id]
                            ? comment.content
                            : comment.content.slice(0, 120) + "..."}
                        </span>
                        <button
                          onClick={() => toggleExpand(comment.id)}
                          className="ml-1 text-blue-600 hover:underline text-[14px] font-medium"
                        >
                          {expandedComments[comment.id] ? "Ẩn bớt" : "Xem thêm"}
                        </button>
                      </>
                    ) : (
                      <span>{comment.content}</span>
                    )}
                  </div>
                )}

                {/* Nút hành động */}
                <div className="flex gap-3 mt-2 text-[14px]">
                  <button
                    onClick={() => handleLoadReplies(comment.id)}
                    className="text-blue-600 font-medium hover:underline"
                  >
                    Xem phản hồi
                  </button>
                  <button
                    onClick={() =>
                      setShowReplyInput(
                        showReplyInput === comment.id ? null : comment.id
                      )
                    }
                    className="text-gray-600 font-medium hover:underline"
                  >
                    Phản hồi
                  </button>
                </div>
                {/* Ô nhập phản hồi */}
                {showReplyInput === comment.id && (
                  <div className="mt-3 flex gap-2">
                    <Input
                      placeholder="Phản hồi bình luận..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="flex-1 text-[15px] px-3 py-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleSendReply(comment.id)}
                      className="bg-orange-500 hover:bg-blue-600 text-white font-medium px-4"
                    >
                      Gửi
                    </Button>
                  </div>
                )}

                {/* Danh sách phản hồi */}
                {replyMap[comment.id] && replyMap[comment.id].length > 0 && (
                  <div className="mt-3 space-y-3 bg-white rounded-lg">
                    {replyMap[comment.id].map((reply) => (
                      <div key={reply.id} className="flex gap-3 items-start">
                        {/* Avatar */}
                        {reply.userAvatar ? (
                          <img
                            src={reply.userAvatar}
                            alt={reply.userName || "Người dùng"}
                            className="w-10 h-10 rounded-full object-cover border border-gray-200"
                            onError={(e) =>
                              (e.target.src = "/default-avatar.png")
                            }
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-orange-400 flex items-center justify-center text-white font-semibold text-sm uppercase">
                            {reply.userName?.charAt(0) || "?"}
                          </div>
                        )}

                        {/* Nội dung */}
                        <div className="flex-1 relative bg-white rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex gap-5">
                              <p className="font-semibold text-[15px] text-gray-900">
                                {reply.userName}
                              </p>
                              <div className="flex gap-3">
                                <p className="text-xs mt-1">
                                  {formatTime(reply.createdAt)}
                                </p>
                                <p>
                                  {reply.updatedAt && (
                                    <span className="text-sm italic text-gray-400">
                                      (đã chỉnh sửa)
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>

                            {/* Nút 3 chấm */}
                            {reply.isCurrentUser && (
                              <DropdownMenu>
                                <DropdownMenuTrigger
                                  asChild
                                  onClick={() => toggleMenu(reply.id)}
                                  data-dropdown-trigger
                                  className="ml-2"
                                >
                                  <button className="p-1 rounded-full hover:bg-gray-100">
                                    <MoreHorizontal className="h-5 w-5 text-gray-600" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="w-36"
                                  isOpen={openMenuId === reply.id}
                                  onClose={() => setOpenMenuId(null)}
                                >
                                  <DropdownMenuItem
                                    onClick={() => {
                                      handleEditComment(reply);
                                      setOpenMenuId(null);
                                    }}
                                  >
                                     Chỉnh sửa
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteClick(reply.id)}
                                    className="text-red-500 focus:text-red-600"
                                  >
                                     Xóa
                                  </DropdownMenuItem>
                                  <ConfirmDeleteModal
                            isOpen={openConfirm}
                            onClose={() => setOpenConfirm(false)}
                            onConfirm={confirmDelete}
                          />
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>

                          {editingCommentId === reply.id ? (
                            <div className="flex flex-col gap-2 mt-1">
                              <Input
                                value={editingContent}
                                onChange={(e) =>
                                  setEditingContent(e.target.value)
                                }
                                className="flex-1 text-[15px] px-3 py-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400"
                              />
                              <div className="flex gap-2 justify-end">
                                <Button
                                  size="sm"
                                  className="bg-orange-500 hover:bg-orange-600 text-white"
                                  onClick={() => handleSaveEdit(reply.id)}
                                >
                                  Lưu
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingCommentId(null);
                                    setEditingContent("");
                                  }}
                                >
                                  Hủy
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-[15px] text-gray-800 leading-relaxed mt-0.5">
                              {reply.content.length > 120 ? (
                                <>
                                  <span>
                                    {expandedComments[reply.id]
                                      ? reply.content
                                      : reply.content.slice(0, 120) + "..."}
                                  </span>
                                  <button
                                    onClick={() => toggleExpand(reply.id)}
                                    className="ml-1 text-blue-600 hover:underline text-[14px] font-medium"
                                  >
                                    {expandedComments[reply.id]
                                      ? "Ẩn bớt"
                                      : "Xem thêm"}
                                  </button>
                                </>
                              ) : (
                                <span>{reply.content}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {comments.length > 0 && hasMore && (
          <div className="text-center mt-4">
            <Button
              variant="ghost"
              onClick={() => {
                if (!loading && hasMore) setPageNumber((p) => p + 1);
              }}
              disabled={loading}
              className="text-blue-600 hover:underline font-medium disabled:opacity-60"
            >
              {loading ? "Đang tải..." : "Xem thêm bình luận"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
