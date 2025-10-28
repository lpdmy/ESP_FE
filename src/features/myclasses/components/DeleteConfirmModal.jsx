import { Trash2, X } from 'lucide-react'
import { Button } from '@/common/components/ui/button'
import { useScrollLock } from '@/common/hooks/useScrollLock'

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, postTitle }) {
  useScrollLock(isOpen)
  
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Xóa bài viết</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5 text-gray-500" />
          </Button>
        </div>
        
        <div className="p-6">
          <p className="text-gray-700 mb-2">
            Bạn có chắc chắn muốn xóa bài viết này không?
          </p>
          {postTitle && (
            <p className="text-sm text-gray-500 italic">
              "{postTitle}"
            </p>
          )}
        </div>
        
        <div className="flex items-center justify-end gap-3 p-6 bg-gray-50">
          <Button variant="ghost" onClick={onClose}>
            Hủy
          </Button>
          <Button 
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Xóa bài viết
          </Button>
        </div>
      </div>
    </div>
  )
}
