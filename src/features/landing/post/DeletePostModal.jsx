import React from "react";
import { X, AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Card } from "@/common/components/ui/card";

const DeletePostModal = ({ isOpen, onClose, post, onDelete }) => {
  const handleDelete = () => {
    if (post) {
      onDelete(post.id);
      onClose();
    }
  };

  const handleClose = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    onClose();
  };

  if (!isOpen || !post) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" onClick={handleClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      <Card
        className="relative w-full max-w-md mx-4 bg-white shadow-2xl rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Xóa bài đăng</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            <p className="text-gray-600">
              Bạn có chắc chắn muốn xóa bài đăng này không? Hành động này không thể hoàn tác.
            </p>
            
            {/* Post Preview */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {post.user?.name?.charAt(0) || "?"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900 text-sm">
                      {post.user?.name || "Ẩn danh"}
                    </span>
                    <span className="text-xs text-gray-500">• 2 giờ trước</span>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {post.content}
                  </p>
                  {post.hashtags && post.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {post.hashtags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="text-blue-600 text-xs font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                      {post.hashtags.length > 3 && (
                        <span className="text-gray-500 text-xs">
                          +{post.hashtags.length - 3} khác
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Lưu ý:</p>
                  <p>Bài đăng này sẽ bị xóa vĩnh viễn và không thể khôi phục.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 pt-4 border-t border-gray-100">
          <Button
            onClick={handleClose}
            variant="outline"
            className="border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            Hủy
          </Button>
          <Button
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Xóa bài đăng
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default DeletePostModal;
