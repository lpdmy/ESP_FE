import { useState, useRef, forwardRef, useImperativeHandle } from 'react'
import { Upload, X, FileText, Image, Video, File } from 'lucide-react'
import { Button } from '@/common/components/ui/button'
import { uploadMultipleFiles, validateFileSize, validateFileType, getFileType, formatFileSize } from '@/common/utils/upload'

const FileUpload = forwardRef(({ onFilesUploaded, maxFiles = 5, className = '' }, ref) => {
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files)
    const validFiles = selectedFiles.filter(file => {
      if (!validateFileSize(file)) {
        alert(`File ${file.name} quá lớn. Kích thước tối đa là 10MB.`)
        return false
      }
      if (!validateFileType(file)) {
        alert(`File ${file.name} không được hỗ trợ. Chỉ chấp nhận ảnh, video, PDF, DOC, PPT.`)
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    // Store files locally, don't upload yet
    const newFiles = validFiles.slice(0, maxFiles - files.length).map(file => ({
      file,
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: getFileType(file),
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }))

    setFiles(prev => [...prev, ...newFiles])
  }

  const removeFile = (fileId) => {
    setFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId)
      // Clean up object URLs
      const fileToRemove = prev.find(f => f.id === fileId)
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview)
      }
      return updated
    })
  }

  // Upload files when needed (called from parent component)
  const uploadFiles = async () => {
    if (files.length === 0) return []

    setUploading(true)
    try {
      const fileObjects = files.map(f => f.file)
      const uploadResults = await uploadMultipleFiles(fileObjects)
      
      // Map upload results with original file names
      const resultsWithFileNames = uploadResults.map((result, index) => ({
        url: result.url,
        fileName: files[index].name || null, // Chỉ trả về khi có tên file
        fileType: result.fileType
      }))
      
      // Clean up object URLs
      files.forEach(f => {
        if (f.preview) {
          URL.revokeObjectURL(f.preview)
        }
      })

      return resultsWithFileNames
    } catch (error) {
      console.error('Upload failed:', error)
      throw error
    } finally {
      setUploading(false)
    }
  }

  // Expose uploadFiles function to parent
  useImperativeHandle(ref, () => ({
    uploadFiles,
    getFiles: () => files
  }))

  const getFileIcon = (type) => {
    switch (type) {
      case 'image':
        return <Image className="h-4 w-4" />
      case 'video':
        return <Video className="h-4 w-4" />
      case 'document':
        return <FileText className="h-4 w-4" />
      default:
        return <File className="h-4 w-4" />
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Button */}
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={files.length >= maxFiles || uploading}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          {uploading ? 'Đang upload...' : 'Chọn file'}
        </Button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            {files.length}/{maxFiles} files được chọn
          </p>
          <div className="space-y-2">
            {files.map((file) => (
              <div key={file.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
                  {getFileIcon(file.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.id)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
})

export default FileUpload
