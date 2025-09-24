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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/common/components/ui/avatar";
import EmojiPicker from "@/common/components/emoji-picker";
import GifSearchModal from "@/common/components/gif-search-modal";
import { POST_MESSAGES } from "@/common/constants/messages/post";
import { useSelector } from "react-redux";
import { usePostApi } from "./hooks/usePostApi";
import { uploadImage } from "@/common/utils/upload";
import { useToast } from "@/common/hooks/useToast";

const POPULAR_HASHTAGS = [
  "học_tập",
  "giáo_dục",
  "sinh_viên",
  "kỹ_năng",
  "công_nghệ",
  "khoa_học",
  "toán_học",
  "văn_học",
  "lịch_sử",
  "ngoại_ngữ",
  "thể_thao",
  "nghệ_thuật",
  "âm_nhạc",
  "du_lịch",
  "ẩm_thực",
  "FPT_School",
  "blockchain",
  "AI_machine_learning",
  "web_development",
  "mobile_app",
  "data_science",
  "cybersecurity",
  "digital_marketing",
  "startup",
  "innovation",
  "teamwork",
  "leadership",
  "presentation_skills",
  "time_management",
];

const PRIVACY_OPTIONS = [
  {
    value: 0,
    label: "Công khai",
    icon: <Globe className="h-4 w-4" />,
    description: "Mọi người có thể xem",
  },
  {
    value: 2,
    label: "Bạn bè",
    icon: <Users className="h-4 w-4" />,
    description: "Chỉ bạn bè có thể xem",
  },
  {
    value: 1,
    label: "Chỉ mình tôi",
    icon: <Lock className="h-4 w-4" />,
    description: "Chỉ bạn có thể xem",
  },
];

const UpdatePostModal = ({ isOpen, onClose, post, onUpdate }) => {
  const user = useSelector((state) => state.user.user);
  const { updatePost, saveLoading } = usePostApi();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    body: "",
    hashtags: [],
    hashtagInput: "",
    privacyLevel: 0,
  });

  const [attachments, setAttachments] = useState({
    selectedMedia: [],
    selectedGif: null,
    hasAttachment: false,
  });

  const [uiState, setUiState] = useState({
    showPrivacyDropdown: false,
    showHashtagSuggestions: false,
    currentView: "compose",
    showImageViewer: false,
    selectedImageUrl: null,
    isAnimating: false,
  });

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const privacyButtonRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const contentMaxHeight = isMobile ? "calc(90vh - 180px)" : "calc(95vh - 220px)";
  const [privacyMenuPos, setPrivacyMenuPos] = useState({ top: 0, left: 0, width: 0 });

  // Load dữ liệu từ post khi mở modal
  useEffect(() => {
  if (post) {
    console.log("📥 Loaded post:", post);

    setFormData({
      title: post.title || "",
      body: post.body || "",
      hashtags: post.hashtags || [],
      hashtagInput: "",
      privacyLevel: post.privacyLevel ?? 0,
    });

    const detectType = (url) =>
      /\.(mp4|mov|avi|webm)$/i.test(url) ? "video" : "image";

    setAttachments({
      selectedMedia: (post.attachmentUrls || []).map((url, idx) => ({
        id: `existing-${idx}`,
        file: null,
        url,
        type: detectType(url),
        uploadProgress: 100,
      })),
      selectedGif: post.gif || null,
      hasAttachment: Boolean(post.attachmentUrls?.length || post.gif),
    });
  }
}, [post]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const canUpdate =
    formData.title.trim() ||
    formData.body.trim() ||
    formData.hashtags.length > 0 ||
    attachments.hasAttachment;

  const currentPrivacy =
    PRIVACY_OPTIONS.find((opt) => opt.value === formData.privacyLevel) ||
    PRIVACY_OPTIONS[0];

  const addHashtag = (tag) => {
    const clean = tag.replace(/^#/, "").trim();
    if (clean && !formData.hashtags.includes(clean)) {
      setFormData((prev) => ({
        ...prev,
        hashtags: [...prev.hashtags, clean],
        hashtagInput: "",
      }));
      setUiState((prev) => ({ ...prev, showHashtagSuggestions: false }));
    }
  };

  const removeHashtag = (tag) => {
    setFormData((prev) => ({
      ...prev,
      hashtags: prev.hashtags.filter((t) => t !== tag),
    }));
  };

  const handleFileSelect = (files) => {
  const newFiles = [];
  Array.from(files).forEach((file) => {
    const mediaObj = {
      id: Math.random().toString(36).substr(2, 9),
      file,
      url: URL.createObjectURL(file),
      type: file.type.startsWith("image/")
        ? "image"
        : file.type.startsWith("video/")
        ? "video"
        : "other",
      uploadProgress: 0, // bắt đầu từ 0 để simulate
    };
console.log("📂 File đã chọn:", {
        name: file.name,
        type: file.type,
        size: file.size / 1024 + " KB",
      });
    simulateIndividualUpload(mediaObj);
    newFiles.push(mediaObj);
  });
  if (newFiles.length > 0) {
    setAttachments((prev) => ({
      ...prev,
      selectedMedia: [...prev.selectedMedia, ...newFiles],
      hasAttachment: true,
    }));
  }
};

const simulateIndividualUpload = async (file) => {
    for (
      let progress = 0;
      progress <= 100;
      progress += Math.random() * 15 + 5
    ) {
      await new Promise((resolve) =>
        setTimeout(resolve, 200 + Math.random() * 300)
      );
      setAttachments((prev) => ({
        ...prev,
        selectedMedia: prev.selectedMedia.map((f) =>
          f.id === file.id
            ? { ...f, uploadProgress: Math.min(progress, 100) }
            : f
        ),
      }));
    }
    setAttachments((prev) => ({
      ...prev,
      selectedMedia: prev.selectedMedia.map((f) =>
        f.id === file.id ? { ...f, uploadProgress: 100 } : f
      ),
    }));
  };
  const removeMediaFile = (id) => {
    setAttachments((prev) => {
      const filtered = prev.selectedMedia.filter((f) => f.id !== id);
      return {
        ...prev,
        selectedMedia: filtered,
        hasAttachment: filtered.length > 0 || Boolean(prev.selectedGif),
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

  const handleUpdate = async () => {
  if (!canUpdate) return;
  setUiState((prev) => ({ ...prev, isAnimating: true }));

  try {
    const uploadedAttachments = [];

    // upload hoặc giữ link cũ
    for (const f of attachments.selectedMedia) {
      if (f.file) {
        const url = await uploadImage(f.file);
        uploadedAttachments.push({ url, fileType: f.type });
      } else if (f.url) {
        uploadedAttachments.push({ url: f.url, fileType: f.type || "image" });
      }
    }

    if (attachments.selectedGif) {
      uploadedAttachments.push({ url: attachments.selectedGif, fileType: "image" });
    }

    const payload = {
      id: post.id, 
      title: formData.title,
      body: formData.body,
      classGroupId: formData.classGroupId ?? null,
      clubId: formData.clubId ?? null,
      privacyLevel: Number(formData.privacyLevel),
      status: formData.status ?? 0,
      callToAction: formData.callToAction || "",
      hashtags: formData.hashtags || [],
      mentionUsernames: formData.mentionUsernames || [],
      attachmentUrls: uploadedAttachments,
      hashtagInput: "",
    };

    console.log("📤 Update payload:", payload);

    await updatePost(payload);
    showSuccess("Cập nhật bài đăng thành công");
    onUpdate(payload);
    onClose();
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err.message ||
      "Lỗi khi cập nhật bài đăng";
    showError(msg);
  } finally {
    setUiState((prev) => ({ ...prev, isAnimating: false }));
  }
};

  const filteredSuggestions = POPULAR_HASHTAGS.filter(
    (tag) =>
      tag.toLowerCase().includes((formData.hashtagInput || "").toLowerCase()) &&
      !formData.hashtags.includes(tag)
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center !p-0"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <Card
  className="relative w-full md:max-w-3xl md:mx-4 bg-white shadow-2xl md:rounded-lg overflow-hidden !p-0"
>

  {/* Header */}
  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-yellow-50">
    <h2 className="text-lg font-semibold text-gray-900">Chỉnh sửa bài đăng</h2>
    <Button
      variant="ghost"
      size="sm"
      onClick={onClose}
      className="h-8 w-8 p-0 hover:bg-orange-100 rounded-full"
    >
      <X className="h-4 w-4" />
    </Button>
  </div>

  {/* Body (scrollable) */}
  <div
    className="px-4 py-3 space-y-4 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
    style={{ maxHeight: contentMaxHeight }}
  >
    {/* Title */}
    <Input
      placeholder="Tiêu đề"
      value={formData.title}
      onChange={(e) =>
        setFormData((prev) => ({ ...prev, title: e.target.value }))
      }
      className="border-gray-200 focus:border-orange-300 focus:ring-orange-200"
    />

    {/* Body */}
    <Textarea
      ref={textareaRef}
      placeholder="Bạn đang nghĩ gì?"
      value={formData.body}
      onChange={(e) =>
        setFormData((prev) => ({ ...prev, body: e.target.value }))
      }
      className="border-gray-200 focus:border-orange-300 focus:ring-orange-200 resize-none min-h-[150px]"
    />

    {/* Hashtag input */}
    <div className="space-y-3">
      <div className="relative">
        <div className="flex items-center space-x-2">
          <Hash className="h-4 w-4 text-orange-400" />
          <Input
            placeholder="Thêm #hashtag"
            value={formData.hashtagInput}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                hashtagInput: e.target.value,
              }));
              setUiState((prev) => ({
                ...prev,
                showHashtagSuggestions: e.target.value.length > 0,
              }));
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (formData.hashtagInput.trim()) {
                  addHashtag(formData.hashtagInput);
                }
              }
            }}
            className="text-sm"
          />
        </div>
        {uiState.showHashtagSuggestions &&
          filteredSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[10000] max-h-40 overflow-y-auto">
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

    {/* Privacy */}
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const menuWidth = 224;
          const padding = 8;
          const left = Math.min(
            Math.max(padding, rect.left),
            window.innerWidth - menuWidth - padding
          );
          const top = rect.bottom + 6;
          setPrivacyMenuPos({ top, left, width: menuWidth });
          setUiState((prev) => ({
            ...prev,
            showPrivacyDropdown: !prev.showPrivacyDropdown,
          }));
        }}
        className="flex items-center space-x-2 text-sm border-orange-200 hover:bg-orange-50"
      >
        {currentPrivacy.icon}
        <span>{currentPrivacy.label}</span>
        <ChevronDown className="h-3 w-3" />
      </Button>
      {uiState.showPrivacyDropdown && (
        <>
          <div
            className="fixed inset-0 z-[9999]"
            onClick={() =>
              setUiState((prev) => ({
                ...prev,
                showPrivacyDropdown: false,
              }))
            }
          />
          <div
            className="fixed bg-white border rounded-lg shadow-lg z-[10000] w-56"
            style={{
              top: `${privacyMenuPos.top}px`,
              left: `${privacyMenuPos.left}px`,
            }}
          >
            {PRIVACY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    privacyLevel: opt.value,
                  }));
                  setUiState((prev) => ({
                    ...prev,
                    showPrivacyDropdown: false,
                  }));
                }}
                className="w-full flex items-start space-x-3 p-3 hover:bg-orange-50 text-left"
              >
                <div className="mt-0.5">{opt.icon}</div>
                <div>
                  <div className="font-medium">{opt.label}</div>
                  <div className="text-sm text-gray-500">
                    {opt.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>

    {/* Attachments */}
    {(attachments.selectedMedia.length > 0 || attachments.selectedGif) && (
      <div className="space-y-3">
        {attachments.selectedMedia.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-700">
                Ảnh/Video đã chọn
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  attachments.selectedMedia.forEach(
                    (f) => f.url && URL.revokeObjectURL(f.url)
                  );
                  setAttachments((prev) => ({
                    ...prev,
                    selectedMedia: [],
                    hasAttachment: !!prev.selectedGif,
                  }));
                }}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Xóa tất cả
              </Button>
            </div>
            <div
              className="flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 pb-2 border-l-2 border-r-2 border-gray-100 rounded-lg px-2 bg-gray-50/30"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#9ca3af #f3f4f6",
                maxHeight: 180,
                flexWrap: "nowrap",
              }}
            >
              {attachments.selectedMedia.map((file) => (
                <div
                  key={file.id}
                  className="relative group flex-shrink-0 w-32 h-28"
                >
                  {file.type === "image" ? (
                    <img
                      src={file.url}
                      alt="media"
                      className="w-full h-full object-contain rounded-lg border border-gray-200 bg-gray-50 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() =>
                        setUiState((prev) => ({
                          ...prev,
                          showImageViewer: true,
                          selectedImageUrl: file.url,
                        }))
                      }
                    />
                  ) : (
                    <video
                      src={file.url}
                      className="w-full h-full object-contain rounded-lg border border-gray-200 bg-gray-50 cursor-pointer hover:opacity-80 transition-opacity"
                      muted
                    />
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0 opacity-80 hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600"
                    onClick={() => removeMediaFile(file.id)}
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
              <h4 className="text-sm font-medium text-gray-700">
                GIF đã chọn
              </h4>
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
                src={attachments.selectedGif}
                alt="GIF"
                className="max-w-full h-32 object-contain rounded-lg border border-gray-200 bg-gray-50"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-1 right-1 h-6 w-6 p-0 opacity-80 hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600"
                onClick={removeGif}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </div>
    )}

    {/* Toolbar */}
    <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide">
      <Button
        variant="ghost"
        size="sm"
        disabled={Boolean(attachments.selectedGif)}
        onClick={() => fileInputRef.current?.click()}
      >
        <ImageIcon className="h-4 w-4 mr-2" />
        Ảnh/Video
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() =>
          setUiState((prev) => ({ ...prev, currentView: "emoji" }))
        }
      >
        <Smile className="h-4 w-4 mr-2" />
        Biểu cảm
      </Button>
      <Button
        variant="ghost"
        size="sm"
        disabled={attachments.selectedMedia.length > 0}
        onClick={() =>
          setUiState((prev) => ({ ...prev, currentView: "gif" }))
        }
      >
        <Gift className="h-4 w-4 mr-2" />
        GIF
      </Button>
    </div>
  </div>

  {/* Footer */}
  <div className="flex justify-end px-4 py-3 border-t border-gray-100 sticky bottom-0 bg-white z-10">
    <Button
      onClick={handleUpdate}
      disabled={!canUpdate || saveLoading || uiState.isAnimating}
      className={`${
        canUpdate
          ? "bg-gradient-to-r from-orange-500 to-yellow-500 text-white"
          : "bg-gray-200 text-gray-400 cursor-not-allowed"
      }`}
    >
      {uiState.isAnimating ? "Đang cập nhật..." : "Cập nhật"}
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
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setUiState((prev) => ({ ...prev, currentView: "compose" }))} />
          <div className="relative bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Chọn biểu cảm</h3>
                <Button variant="ghost" size="sm" onClick={() => setUiState((prev) => ({ ...prev, currentView: "compose" }))}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              <EmojiPicker
                isOpen={true}
                onClose={() => setUiState((prev) => ({ ...prev, currentView: "compose" }))}
                onEmojiSelect={(emoji) => {
                  const textarea = textareaRef.current;
                  if (textarea) {
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    const newContent = formData.body.slice(0, start) + emoji + formData.body.slice(end);
                    setFormData((prev) => ({ ...prev, body: newContent }));
                  } else {
                    setFormData((prev) => ({ ...prev, body: prev.body + emoji }));
                  }
                  setUiState((prev) => ({ ...prev, currentView: "compose" }));
                }}
                inline={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* GIF Search Modal */}
      {uiState.currentView === "gif" && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setUiState((prev) => ({ ...prev, currentView: "compose" }))} />
          <div className="relative bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Tìm GIF</h3>
                <Button variant="ghost" size="sm" onClick={() => setUiState((prev) => ({ ...prev, currentView: "compose" }))}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              <GifSearchModal
                isOpen={true}
                onClose={() => setUiState((prev) => ({ ...prev, currentView: "compose" }))}
                onGifSelect={(gifUrl) => {
                  if (attachments.selectedMedia.length > 0) {
                    setAttachments((prev) => ({ ...prev, selectedMedia: [], selectedGif: gifUrl, hasAttachment: true }));
                  } else {
                    setAttachments((prev) => ({ ...prev, selectedGif: gifUrl, hasAttachment: true }));
                  }
                  setUiState((prev) => ({ ...prev, currentView: "compose" }));
                }}
                inline={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Image viewer */}
      {uiState.showImageViewer && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center"
          onClick={() => setUiState((prev) => ({ ...prev, showImageViewer: false }))}
        >
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
          <div className="relative max-w-4xl max-h-[90vh] mx-4" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setUiState((prev) => ({ ...prev, showImageViewer: false }))}
              className="absolute top-4 right-4 z-10 h-10 w-10 p-0 bg-black/50 hover:bg-black/70 text-white rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
            <img src={uiState.selectedImageUrl} alt="Preview" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdatePostModal;
