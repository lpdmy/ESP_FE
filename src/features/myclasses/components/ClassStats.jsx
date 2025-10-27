import { useState } from 'react'
import { FileText } from 'lucide-react'
import { Button } from '@/common/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card'
import { Badge } from '@/common/components/ui/badge'
import { useScrollLock } from '@/common/hooks/useScrollLock'

export default function ClassStats({ posts = [] }) {
  const [showFilesModal, setShowFilesModal] = useState(false)
  
  useScrollLock(showFilesModal)

  const totalPosts = posts.length
  const totalFiles = posts.reduce((count, post) => {
    const attachments = post.attachments || post.attachmentUrls || []
    return count + attachments.length
  }, 0)

  const allFiles = posts.reduce((files, post) => {
    const attachments = post.attachments || post.attachmentUrls || []
    const postFiles = attachments.map((attachment, index) => ({
      id: `${post.id}-${index}`,
      name: attachment.fileName || attachment || `Tệp đính kèm ${index + 1}`,
      url: attachment.url || attachment,
      postTitle: post.title || 'Không có tiêu đề',
      postId: post.id,
      createdAt: post.createdAt
    }))
    return [...files, ...postFiles]
  }, [])

  return (
    <>
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Thống kê nhanh
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Bài đăng</span>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              {totalPosts}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span 
              className={`text-gray-700 ${totalFiles > 0 ? 'cursor-pointer hover:text-orange-600' : ''}`}
              onClick={() => totalFiles > 0 && setShowFilesModal(true)}
            >
              Tệp đính kèm
            </span>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              {totalFiles}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {showFilesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-orange-500" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Tất cả tệp đính kèm ({totalFiles})
                </h2>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowFilesModal(false)}>
                <span className="text-gray-500">✕</span>
              </Button>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto">
              {allFiles.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Chưa có tệp đính kèm nào</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allFiles.map((file) => (
                    <div key={file.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <div className="h-10 w-10 bg-orange-100 rounded flex items-center justify-center">
                        <FileText className="h-5 w-5 text-orange-600" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          Từ: {file.postTitle}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(file.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const link = document.createElement('a')
                          link.href = file.url
                          link.download = file.name
                          link.target = '_blank'
                          document.body.appendChild(link)
                          link.click()
                          document.body.removeChild(link)
                        }}
                        className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
              <Button variant="ghost" onClick={() => setShowFilesModal(false)}>
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
