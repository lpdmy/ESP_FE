import React from "react";
import { X, AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Card } from "@/common/components/ui/card";
import { usePostApi } from "./hooks/usePostApi";
import { useToast } from "@/common/hooks/useToast";
const DeletePostModal = ({ isOpen, onClose, post, onDelete }) => {
  const {deletePost} = usePostApi();
  const toast = useToast();
  const handleDelete = async () => {
  try {
    await deletePost(post.id);
    toast.deletePostSucess();
    onDelete(post.id);  
    onClose();         
  } catch (error) {
    console.log(error)
  }
};

  const handleClose =  (e) => {
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
