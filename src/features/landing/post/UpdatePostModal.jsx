import React, { useState, useEffect, useRef } from "react";
import {
  X,
  ImageIcon,
  Smile,
  Gift,
  Globe,
  Users,
  Lock,
  ChevronDown,
  Hash,
  Sparkles,
  Heart,
  ArrowLeft,
  Upload,
  FolderPlus,
  Folder,
  Plus,
} from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Card } from "@/common/components/ui/card";
import { Textarea } from "@/common/components/ui/textarea";
import { Input } from "@/common/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/common/components/ui/avatar";
import EmojiPicker from "@/common/components/emoji-picker";
import GifSearchModal from "@/common/components/gif-search-modal";
import { POST_MESSAGES } from "@/common/constants/messages/post";

const POPULAR_HASHTAGS = [
  "học_tập", "giáo_dục", "sinh_viên", "kỹ_năng", "công_nghệ", "khoa_học",
  "toán_học", "văn_học", "lịch_sử", "ngoại_ngữ", "thể_thao", "nghệ_thuật",
  "âm_nhạc", "du_lịch", "ẩm_thực", "FPT_School", "blockchain", "AI_machine_learning",
  "web_development", "mobile_app", "data_science", "cybersecurity", "digital_marketing",
  "startup", "innovation", "teamwork", "leadership", "presentation_skills", "time_management"
];

const MOCK_ALBUMS = [
  { id: "1", name: "Học tập", thumbnail: "/Picturemockdata/DSC03778.jpg", postCount: 12 },
  { id: "2", name: "Hoạt động sinh viên", thumbnail: "/Picturemockdata/DSC04766.jpg", postCount: 8 },
  { id: "3", name: "Dự án nhóm", thumbnail: "/Picturemockdata/IMG_1492.jpg", postCount: 5 },
  { id: "4", name: "Kỷ niệm trường", thumbnail: "/Picturemockdata/DSC03778.jpg", postCount: 15 },
];

const PRIVACY_OPTIONS = [
  { value: "public", label: "Công khai", icon: <Globe className="h-4 w-4" />, description: "Mọi người có thể xem" },
  { value: "friends", label: "Bạn bè", icon: <Users className="h-4 w-4" />, description: "Chỉ bạn bè có thể xem" },
  { value: "private", label: "Chỉ mình tôi", icon: <Lock className="h-4 w-4" />, description: "Chỉ bạn có thể xem" },
];

const UpdatePostModal = ({ isOpen, onClose, post, onUpdate }) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    hashtags: [],
    hashtagInput: "",
    privacy: "public",
  });
  
  const [uiState, setUiState] = useState({
    showHashtagSuggestions: false,
    showPrivacyDropdown: false,
    isAnimating: false,
    currentView: "compose",
    isSliding: false,
    showImageViewer: false,
    selectedImageUrl: null,
  });
  
  const [attachments, setAttachments] = useState({
    selectedMedia: [],
    selectedGif: null,
    hasAttachment: false,
  });

  const [albumState, setAlbumState] = useState({
    selectedAlbum: null,
    newAlbumName: "",
  });

  const textareaRef = useRef(null);
  const hashtagInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const modalRef = useRef(null);

  // Initialize form data when post changes
  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || "",
        content: post.content || "",
        hashtags: post.hashtags || [],
        hashtagInput: "",
        privacy: post.privacy || "public",
      });
      
      setAttachments({
        selectedMedia: post.images ? post.images.map((img, index) => ({
          id: `existing-${index}`,
          url: img,
          type: "image",
          uploadProgress: 100,
        })) : [],
        selectedGif: post.gif || null,
        hasAttachment: Boolean(post.images?.length || post.gif),
      });

      setAlbumState({
        selectedAlbum: post.album ? { id: "1", name: post.album, thumbnail: "", postCount: 0 } : null,
        newAlbumName: "",
      });
    }
  }, [post]);

  const canPost = formData.title.trim() || formData.content.trim() || formData.hashtags.length > 0 || attachments.hasAttachment;

  const currentPrivacy = PRIVACY_OPTIONS.find((option) => option.value === formData.privacy) || PRIVACY_OPTIONS[0];

  const addHashtag = (tag) => {
    const cleanTag = tag.replace(/^#/, "").trim();
    if (cleanTag && !formData.hashtags.includes(cleanTag)) {
      setFormData((prev) => ({
        ...prev,
        hashtags: [...prev.hashtags, cleanTag],
        hashtagInput: "",
      }));
      setUiState((prev) => ({ ...prev, showHashtagSuggestions: false }));
    }
  };

  const removeHashtag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      hashtags: prev.hashtags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleHashtagInputKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (formData.hashtagInput.trim()) {
        addHashtag(formData.hashtagInput);
      }
    }
  };

  const slideToView = (view) => {
    if (view === uiState.currentView) return;
    setUiState((prev) => ({ ...prev, currentView: view }));
  };

  const slideToEmoji = () => slideToView("emoji");
  const slideToGif = () => slideToView("gif");
  const slideToMedia = () => fileInputRef.current?.click();

  const handleEmojiSelect = (emoji) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = formData.content.slice(0, start) + emoji + formData.content.slice(end);
      setFormData((prev) => ({ ...prev, content: newContent }));
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + emoji.length, start + emoji.length);
      }, 0);
    } else {
      setFormData((prev) => ({ ...prev, content: prev.content + emoji }));
    }
    slideToView("compose");
  };

  const handleGifSelect = (gifUrl) => {
    if (attachments.selectedMedia.length > 0) {
      if (confirm("Bạn đã có ảnh/video. Chọn GIF sẽ xóa ảnh/video hiện tại. Bạn có muốn tiếp tục?")) {
        setAttachments((prev) => ({
          ...prev,
          selectedMedia: [],
          selectedGif: gifUrl,
          hasAttachment: true,
        }));
        slideToView("compose");
      }
    } else {
      setAttachments((prev) => ({
        ...prev,
        selectedGif: gifUrl,
        hasAttachment: true,
      }));
      slideToView("compose");
    }
  };

  const handleFileSelect = (files) => {
    const newFiles = [];
    const existingFileNames = attachments.selectedMedia.map((f) => f.file?.name || f.name);

    if (attachments.selectedGif) {
      if (!confirm("Bạn đã có GIF. Chọn ảnh/video sẽ xóa GIF hiện tại. Bạn có muốn tiếp tục?")) {
        return;
      }
      setAttachments((prev) => ({ ...prev, selectedGif: null }));
    }

    Array.from(files).forEach((file) => {
      if (file.size > 50 * 1024 * 1024) {
        alert(`File ${file.name} quá lớn. Kích thước tối đa là 50MB.`);
        return;
      }

      let fileName = file.name;
      let counter = 1;
      while (existingFileNames.includes(fileName)) {
        const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf("."));
        const extension = file.name.substring(file.name.lastIndexOf("."));
        fileName = `${nameWithoutExt}_${counter}${extension}`;
        counter++;
      }

      const renamedFile = new File([file], fileName, { type: file.type });
      const mediaFile = {
        id: Math.random().toString(36).substr(2, 9),
        file: renamedFile,
        url: URL.createObjectURL(renamedFile),
        type: file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "other",
        uploadProgress: 100,
      };

      newFiles.push(mediaFile);
    });

    if (newFiles.length > 0) {
      setAttachments((prev) => ({
        ...prev,
        selectedMedia: [...prev.selectedMedia, ...newFiles],
        hasAttachment: true,
      }));
      slideToView("compose");
    }
  };

  const removeMediaFile = (id) => {
    setAttachments((prev) => {
      const updated = prev.selectedMedia.filter((file) => file.id !== id);
      const removed = prev.selectedMedia.find((file) => file.id === id);
      if (removed && removed.url) URL.revokeObjectURL(removed.url);
      return {
        ...prev,
        selectedMedia: updated,
        hasAttachment: updated.length > 0 || prev.selectedGif,
      };
    });
  };

  const removeGif = () => {
    setAttachments((prev) => ({
      ...prev,
      selectedGif: null,
      hasAttachment: prev.selectedMedia.length > 0,
    }));
  };

  const openImageViewer = (imageUrl) => {
    setUiState((prev) => ({
      ...prev,
      showImageViewer: true,
      selectedImageUrl: imageUrl,
    }));
  };

  const closeImageViewer = () => {
    setUiState((prev) => ({
      ...prev,
      showImageViewer: false,
      selectedImageUrl: null,
    }));
  };

  const handleUpdate = () => {
    if (canPost) {
      setUiState((prev) => ({ ...prev, isAnimating: true }));
      setTimeout(() => {
        const updatedPost = {
          ...post,
          title: formData.title,
          content: formData.content,
          hashtags: formData.hashtags,
          privacy: formData.privacy,
          images: attachments.selectedMedia.map(media => media.url),
          gif: attachments.selectedGif,
          album: albumState.selectedAlbum?.name,
        };
        
        onUpdate(updatedPost);
        onClose();
        setUiState((prev) => ({ ...prev, isAnimating: false }));
      }, 500);
    }
  };

  const handleClose = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    onClose();
  };

  const filteredSuggestions = POPULAR_HASHTAGS.filter(
    (tag) =>
      tag.toLowerCase().includes(formData.hashtagInput.toLowerCase()) &&
      !formData.hashtags.includes(tag)
  );

  if (!isOpen || !post) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" onClick={handleClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      <Card
        className="relative w-full h-full md:h-auto md:max-w-3xl md:mx-4 bg-white shadow-2xl md:rounded-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-yellow-50">
          <h2 className="text-lg font-semibold text-gray-900">Chỉnh sửa bài đăng</h2>
          <Button variant="ghost" size="sm" onClick={handleClose} className="h-8 w-8 p-0 hover:bg-orange-100 rounded-full">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[calc(90vh-200px)] overflow-y-auto">
          <Input
            placeholder="Tiêu đề bài đăng"
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            className="border-gray-200 focus:border-orange-300 focus:ring-orange-200"
          />

          <Textarea
            ref={textareaRef}
            placeholder="Bạn đang nghĩ gì?"
            value={formData.content}
            onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
            className="border-gray-200 focus:border-orange-300 focus:ring-orange-200 resize-none min-h-[150px]"
            rows={1}
          />

          {/* Album Selection */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => slideToView("album-select")}
            className="flex items-center space-x-2 text-sm border-orange-200 hover:bg-orange-50 w-full justify-start"
          >
            <FolderPlus className="h-4 w-4 text-orange-500" />
            <span>{albumState.selectedAlbum ? `Album: ${albumState.selectedAlbum.name}` : "Thêm vào album"}</span>
          </Button>

          {/* Media Attachments */}
          {(attachments.selectedMedia.length > 0 || attachments.selectedGif) && (
            <div className="space-y-3">
              {attachments.selectedMedia.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700">Ảnh/Video đã chọn</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        attachments.selectedMedia.forEach((file) => {
                          if (file.url) URL.revokeObjectURL(file.url);
                        });
                        setAttachments((prev) => ({
                          ...prev,
                          selectedMedia: [],
                          hasAttachment: prev.selectedGif ? true : false,
                        }));
                      }}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 text-xs"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Xóa tất cả
                    </Button>
                  </div>
                  <div className="flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 pb-2">
                    {attachments.selectedMedia.map((file) => (
                      <div key={file.id} className="relative group flex-shrink-0">
                        {file.type === "image" ? (
                          <img
                            src={file.url || "/placeholder.svg"}
                            alt={file.file?.name || file.name || "Media"}
                            className="w-32 h-28 object-contain rounded-lg border border-gray-200 bg-gray-50 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => openImageViewer(file.url)}
                          />
                        ) : (
                          <video
                            src={file.url}
                            className="w-32 h-28 object-contain rounded-lg border border-gray-200 bg-gray-50 cursor-pointer hover:opacity-80 transition-opacity"
                            muted
                            onClick={() => openImageViewer(file.url)}
                          />
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0 opacity-80 hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeMediaFile(file.id);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {attachments.selectedGif && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700">GIF đã chọn</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeGif}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 text-xs"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Xóa GIF
                    </Button>
                  </div>
                  <div className="relative group inline-block max-h-32 overflow-hidden">
                    <img
                      src={attachments.selectedGif || "/placeholder.svg"}
                      alt="Selected GIF"
                      className="max-w-full h-32 object-contain rounded-lg border border-gray-200 bg-gray-50 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => openImageViewer(attachments.selectedGif)}
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0 opacity-80 hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeGif();
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Media Tools */}
          <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide">
            <Button
              variant="ghost"
              size="sm"
              disabled={attachments.selectedGif ? true : false}
              className={`whitespace-nowrap flex-shrink-0 transition-all duration-200 ${
                attachments.selectedGif
                  ? "text-gray-400 cursor-not-allowed opacity-50"
                  : "text-gray-600 hover:text-orange-600 hover:bg-orange-50 hover:scale-105"
              }`}
              onClick={slideToMedia}
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Tải lên Ảnh/Video
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-orange-600 hover:bg-orange-50 whitespace-nowrap flex-shrink-0 transition-all duration-200 hover:scale-105"
              onClick={slideToEmoji}
            >
              <Smile className="h-4 w-4 mr-2" />
              Biểu cảm
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={attachments.selectedMedia.length > 0 ? true : false}
              className={`whitespace-nowrap flex-shrink-0 transition-all duration-200 ${
                attachments.selectedMedia.length > 0
                  ? "text-gray-400 cursor-not-allowed opacity-50"
                  : "text-gray-600 hover:text-orange-600 hover:bg-orange-50 hover:scale-105"
              }`}
              onClick={slideToGif}
            >
              <Gift className="h-4 w-4 mr-2" />
              GIF
            </Button>
          </div>

          {/* Hashtags */}
          <div className="space-y-3">
            <div className="relative">
              <div className="flex items-center space-x-2">
                <Hash className="h-4 w-4 text-orange-400" />
                <Input
                  ref={hashtagInputRef}
                  placeholder="Thêm #hashtag"
                  value={formData.hashtagInput}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, hashtagInput: e.target.value }));
                    setUiState((prev) => ({ ...prev, showHashtagSuggestions: e.target.value.length > 0 }));
                  }}
                  onKeyDown={handleHashtagInputKeyDown}
                  className="border-gray-200 focus:border-orange-300 focus:ring-orange-200 text-sm"
                />
              </div>

              {uiState.showHashtagSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-40 overflow-y-auto">
                  {filteredSuggestions.slice(0, 8).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => addHashtag(tag)}
                      className="w-full text-left px-3 py-2 hover:bg-orange-50 text-sm flex items-center space-x-2"
                    >
                      <Hash className="h-3 w-3 text-orange-400" />
                      <span>{tag}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {formData.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-700 border border-orange-200"
                  >
                    #{tag}
                    <button
                      onClick={() => removeHashtag(tag)}
                      className="ml-2 hover:text-orange-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Privacy Selection */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUiState((prev) => ({ ...prev, showPrivacyDropdown: !prev.showPrivacyDropdown }))}
              className="flex items-center space-x-2 text-sm border-orange-200 hover:bg-orange-50"
            >
              {currentPrivacy.icon}
              <span>{currentPrivacy.label}</span>
              <ChevronDown className="h-3 w-3" />
            </Button>

            {uiState.showPrivacyDropdown && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                {PRIVACY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, privacy: option.value }));
                      setUiState((prev) => ({ ...prev, showPrivacyDropdown: false }));
                    }}
                    className="w-full flex items-start space-x-3 p-3 hover:bg-orange-50 text-left"
                  >
                    <div className="mt-0.5">{option.icon}</div>
                    <div>
                      <div className="font-medium text-gray-900">{option.label}</div>
                      <div className="text-sm text-gray-500">{option.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 pt-5 border-t border-gray-100">
          <Button
            onClick={handleUpdate}
            disabled={!canPost || uiState.isAnimating}
            className={`transition-all duration-300 ${
              canPost
                ? "bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {uiState.isAnimating ? (
              <div className="flex items-center space-x-2">
                <Heart className="h-4 w-4 animate-bounce" />
                <span>Đang cập nhật...</span>
              </div>
            ) : (
              "Cập nhật"
            )}
          </Button>
        </div>
      </Card>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Emoji Picker Modal */}
      {uiState.currentView === "emoji" && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => slideToView("compose")} />
          <div className="relative bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Chọn biểu cảm</h3>
                <Button variant="ghost" size="sm" onClick={() => slideToView("compose")}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              <EmojiPicker
                isOpen={true}
                onClose={() => slideToView("compose")}
                onEmojiSelect={handleEmojiSelect}
                inline={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* GIF Search Modal */}
      {uiState.currentView === "gif" && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => slideToView("compose")} />
          <div className="relative bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Tìm GIF</h3>
                <Button variant="ghost" size="sm" onClick={() => slideToView("compose")}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              <GifSearchModal
                isOpen={true}
                onClose={() => slideToView("compose")}
                onGifSelect={handleGifSelect}
                inline={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Album Selection Modal */}
      {uiState.currentView === "album-select" && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => slideToView("compose")} />
          <div className="relative bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Chọn Album</h3>
                <Button variant="ghost" size="sm" onClick={() => slideToView("compose")}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto space-y-3">
              <Button
                onClick={() => slideToView("album-create")}
                className="w-full flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-orange-300 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg"
              >
                <Plus className="h-5 w-5" />
                <span className="font-medium">Tạo album mới</span>
              </Button>
              {MOCK_ALBUMS.map((album) => (
                <button
                  key={album.id}
                  onClick={() => {
                    setAlbumState((prev) => ({ ...prev, selectedAlbum: album }));
                    slideToView("compose");
                  }}
                  className="w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-300 text-left"
                >
                  <img
                    src={album.thumbnail || "/placeholder.svg"}
                    alt={album.name}
                    className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{album.name}</h4>
                    <p className="text-sm text-gray-500">{album.postCount} bài đăng</p>
                  </div>
                  <Folder className="h-5 w-5 text-orange-500" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {uiState.showImageViewer && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center" onClick={closeImageViewer}>
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
          <div className="relative max-w-4xl max-h-[90vh] mx-4" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeImageViewer}
              className="absolute top-4 right-4 z-10 h-10 w-10 p-0 bg-black/50 hover:bg-black/70 text-white rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
            <img
              src={uiState.selectedImageUrl}
              alt="Preview"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdatePostModal;
