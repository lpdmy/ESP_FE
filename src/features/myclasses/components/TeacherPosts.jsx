import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/common/components/ui/button'
import { Card, CardContent } from '@/common/components/ui/card'
import { PostService } from '@/features/landing/post/services/post.service'
import { useToast } from '@/common/hooks/useToast'
import PostCard from './PostCard'
import CreatePostModal from './CreatePostModal'
import EditPostModal from './EditPostModal'
import DeleteConfirmModal from './DeleteConfirmModal'

export default function TeacherPosts({ classGroupId, userRole, onPostsUpdate }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingPost, setEditingPost] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingPost, setDeletingPost] = useState(null)
  const { showError } = useToast()
  const postService = new PostService()

  const loadPosts = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await postService.getPostsByClassGroup(classGroupId, token)
      const postsData = response.data || []
      setPosts(postsData)
      onPostsUpdate && onPostsUpdate(postsData)
      console.log('classGroupId', response.data)
    } catch (error) {
      console.error('Error loading posts:', error)
      showError("Không thể tải danh sách bài viết. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (classGroupId) {
      loadPosts()
    }
  }, [classGroupId])

  const handlePostCreated = () => {
    loadPosts()
  }

  const handlePostUpdated = () => {
    loadPosts()
  }

  const handleEditPost = (post) => {
    setEditingPost(post)
    setShowEditModal(true)
  }

  const handleCloseEditModal = () => {
    setShowEditModal(false)
    setEditingPost(null)
  }

  const handleDeletePost = (post) => {
    setDeletingPost(post)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingPost) return

    try {
      const postService = new PostService()
      const token = localStorage.getItem('token')
      await postService.DeletePost(deletingPost.id, token)
      
      setShowDeleteModal(false)
      setDeletingPost(null)
      loadPosts()
    } catch (error) {
      console.error('Error deleting post:', error)
      showError("Không thể xóa bài viết. Vui lòng thử lại.")
    }
  }

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false)
    setDeletingPost(null)
  }


  const canCreatePost = userRole === 'Teacher' || userRole === 'Admin'

  if (loading) {
    return (
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải bài viết...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {canCreatePost && (
        <div className="flex justify-end">
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-orange-500 hover:bg-orange-600 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Tạo bài viết
          </Button>
        </div>
      )}

      {posts.length === 0 ? (
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Chưa có bài viết nào
            </h3>
            <p className="text-gray-600">
              {canCreatePost 
                ? 'Hãy tạo bài viết để chia sẻ với lớp học của bạn.'
                : 'Giáo viên chưa đăng bài viết nào cho lớp học này.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onPostUpdated={handlePostUpdated}
              canEdit={canCreatePost}
              onEdit={handleEditPost}
              onDelete={handleDeletePost}
            />
          ))}
        </div>
      )}

      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        classGroupId={classGroupId}
        onPostCreated={handlePostCreated}
      />

      <EditPostModal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        post={editingPost}
        onPostUpdated={handlePostUpdated}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteConfirm}
        postTitle={deletingPost?.title}
      />
    </div>
  )
}
