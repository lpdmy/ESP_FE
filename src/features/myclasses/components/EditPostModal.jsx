import { useState, useRef, useEffect } from 'react'
import { X, Send } from 'lucide-react'
import { Button } from '@/common/components/ui/button'
import { Input } from '@/common/components/ui/input'
import { Textarea } from '@/common/components/ui/textarea'
import { PostService } from '@/features/landing/post/services/post.service'
import { useToast } from '@/common/hooks/useToast'
import { useScrollLock } from '@/common/hooks/useScrollLock'
import FileUpload from './FileUpload'

export default function EditPostModal({ isOpen, onClose, post, onPostUpdated }) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { showSuccess, showError } = useToast()
  const fileUploadRef = useRef(null)
  
  useScrollLock(isOpen)

  useEffect(() => {
    if (post && isOpen) {
      setTitle(post.title || '')
      setBody(post.body || '')
    }
  }, [post, isOpen])

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

      const existingAttachments = post.attachments || []
      const allAttachments = [
        ...existingAttachments.map(att => ({
          url: att.url,
          fileName: att.fileName,
          fileType: att.fileType
        })),
        ...attachmentUrls.map(att => ({
          url: att.url,
          fileName: att.fileName || null,
          fileType: att.fileType
        }))
      ]

      const postData = {
        id: post.id,
        title: title.trim() || null,
        body: body.trim(),
        privacyLevel: post.privacyLevel || 0,
        status: post.status || 1,
        hashtags: post.hashtags || [],
        attachmentUrls: allAttachments
      }

      const postService = new PostService()
      const token = localStorage.getItem('token')
      await postService.UpdatePost(postData, token)
      
      setTitle('')
      setBody('')
      
      showSuccess("Bài viết đã được cập nhật thành công!")
      
      onPostUpdated()
      onClose()
    } catch (error) {
      console.error('Error updating post:', error)
      showError("Không thể cập nhật bài viết. Vui lòng thử lại.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Chỉnh sửa bài viết</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5 text-gray-500" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-4 overflow-y-auto">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề (Tùy chọn)
            </label>
            <Input 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Nhập tiêu đề bài viết" 
            />
          </div>
          
          <div>
            <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-2">
              Nội dung bài viết <span className="text-red-500">*</span>
            </label>
            <Textarea 
              id="body" 
              value={body} 
              onChange={(e) => setBody(e.target.value)} 
              placeholder="Nhập nội dung bài viết của bạn..." 
              rows={6} 
              className="resize-none" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thêm tệp đính kèm mới
            </label>
            <FileUpload ref={fileUploadRef} maxFiles={5} />
            <p className="text-xs text-gray-500 mt-1">
              Các tệp đính kèm hiện tại sẽ được giữ nguyên
            </p>
          </div>
        </form>
        
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button 
            type="submit" 
            onClick={handleSubmit} 
            disabled={isSubmitting || !body.trim()} 
            className="bg-orange-500 hover:bg-orange-600"
          >
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật bài viết'}
          </Button>
        </div>
      </div>
    </div>
  )
}
