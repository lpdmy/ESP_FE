import { useState, useRef } from 'react'
import { X, Send } from 'lucide-react'
import { Button } from '@/common/components/ui/button'
import { Input } from '@/common/components/ui/input'
import { Textarea } from '@/common/components/ui/textarea'
import { PostService } from '@/features/landing/post/services/post.service'
import { useToast } from '@/common/hooks/useToast'
import { useScrollLock } from '@/common/hooks/useScrollLock'
import FileUpload from './FileUpload'

export default function CreatePostModal({ isOpen, onClose, classGroupId, onPostCreated }) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { showSuccess, showError } = useToast()
  const fileUploadRef = useRef(null)
  
  useScrollLock(isOpen)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!body.trim()) {
      showError("Vui lòng nhập nội dung bài viết.")
      return
    }

    setIsSubmitting(true)
    try {
      let attachmentUrls = []
      if (fileUploadRef.current) {
        const files = fileUploadRef.current.getFiles()
        if (files.length > 0) {
          attachmentUrls = await fileUploadRef.current.uploadFiles()
        }
      }

      const postData = {
        title: title.trim() || null,
        body: body.trim(),
        classGroupId: classGroupId,
        privacyLevel: 0,
        status: 1,
        hashtags: [],
        attachmentUrls: attachmentUrls.map(att => ({
          url: att.url,
          fileName: att.fileName || null,
          fileType: att.fileType
        }))
      }

      const postService = new PostService()
      const token = localStorage.getItem('token')
      await postService.createPost(postData, token)
      
      setTitle('')
      setBody('')
      
      showSuccess("Bài viết đã được tạo thành công!")
      
      onPostCreated()
      onClose()
    } catch (error) {
      console.error('Error creating post:', error)
      showError("Không thể tạo bài viết. Vui lòng thử lại.")
    } finally {
      setIsSubmitting(false)
    }
  }


  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Tạo bài viết mới
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề (tùy chọn)
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề bài viết..."
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {title.length}/500 ký tự
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nội dung <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Viết nội dung bài viết..."
              rows={6}
              className="resize-none"
            />
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tệp đính kèm
            </label>
            <FileUpload
              ref={fileUploadRef}
              maxFiles={5}
            />
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting || !body.trim()}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {isSubmitting ? (
              'Đang tạo...'
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Tạo bài viết
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
