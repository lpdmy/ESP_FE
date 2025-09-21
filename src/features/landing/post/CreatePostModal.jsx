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
} from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Card } from "@/common/components/ui/card";
import { Textarea } from "@/common/components/ui/textarea";
import { Input } from "@/common/components/ui/input";
import { Avatar, AvatarFallback } from "@/common/components/ui/avatar";
import EmojiPicker from "@/common/components/emoji-picker";
import GifSearchModal from "@/common/components/gif-search-modal";
import { POST_MESSAGES } from "@/common/constants/messages/post";

// Constants
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
  "study_tips",
  "exam_preparation",
  "career_guidance",
  "internship",
  "job_interview",
  "networking",
  "personal_development",
  "motivation",
  "success_stories",
  "project_management",
  "creative_thinking",
  "problem_solving",
  "research_methods",
  "academic_writing",
  "public_speaking",
  "collaboration",
  "extracurricular",
  "volunteer_work",
  "community_service",
  "environmental_awareness",
  "sustainability",
  "social_responsibility",
];

const PRIVACY_OPTIONS = [
  {
    value: "public",
    label: "Công khai",
    icon: <Globe className="h-4 w-4" />,
    description: "Mọi người có thể xem",
  },
  {
    value: "friends",
    label: "Bạn bè",
    icon: <Users className="h-4 w-4" />,
    description: "Chỉ bạn bè có thể xem",
  },
  {
    value: "private",
    label: "Chỉ mình tôi",
    icon: <Lock className="h-4 w-4" />,
    description: "Chỉ bạn có thể xem",
  },
];

const CreatePostModal = ({
  isOpen,
  onClose,
  userName = "Người dùng",
  userAvatar = "A",
}) => {
  // State
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
    showDraftRestored: false,
    showExitConfirm: false,
    isAnimating: false,
    showSparkles: false,
    currentView: "compose",
    isSliding: false,
    slideDirection: "right",
    isDragging: false,
    showImageViewer: false,
    selectedImageUrl: null,
    showImageTooltip: false,
    showGifTooltip: false,
  });

  const [attachments, setAttachments] = useState({
    selectedMedia: [],
    selectedGif: null,
    hasAttachment: false,
  });

  const [modalHeight, setModalHeight] = useState("auto");
  const [fixedHeight, setFixedHeight] = useState(null);

  // Refs
  const slideContainerRef = useRef(null);
  const modalRef = useRef(null);
  const toolbarRef = useRef(null);
  const textareaRef = useRef(null);
  const hashtagInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const autoSaveTimeoutRef = useRef();
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const isDraggingSlideRef = useRef(false);

  // Computed values
  const canPost =
    formData.title.trim() ||
    formData.content.trim() ||
    formData.hashtags.length > 0 ||
    attachments.hasAttachment;
  const hasDraftContent = Boolean(
    formData.title.trim() ||
    formData.content.trim() ||
    formData.hashtags.length > 0 ||
    attachments.selectedMedia.length > 0 ||
    attachments.selectedGif
  );

  const currentPrivacy =
    PRIVACY_OPTIONS.find((option) => option.value === formData.privacy) ||
    PRIVACY_OPTIONS[0];

  // Event handlers
  const slideToView = (view) => {
    if (view === uiState.currentView) return;

    // Lưu height hiện tại để giữ cố định trong quá trình transition
    if (modalRef.current) {
      const currentHeight = modalRef.current.offsetHeight;
      setFixedHeight(currentHeight);
      setModalHeight(`${currentHeight}px`);
    }

    // Bắt đầu transition
    setUiState((prev) => ({
      ...prev,
      isSliding: true,
    }));

    // Thay đổi view sau một chút để tạo hiệu ứng fade
    setTimeout(() => {
      setUiState((prev) => ({
        ...prev,
        currentView: view,
      }));

      // Tính toán height mới sau khi view đã render
      setTimeout(() => {
        if (modalRef.current) {
          const newHeight = modalRef.current.offsetHeight;
          setModalHeight(`${newHeight}px`);
        }
      }, 50);
    }, 150);

    // Kết thúc animation sau 300ms
    setTimeout(() => {
      setUiState((prev) => ({
        ...prev,
        isSliding: false,
      }));
      // Xóa fixedHeight và cập nhật height sau khi transition kết thúc
      setFixedHeight(null);
      setModalHeight("auto");
    }, 300);
  };

  const slideToEmoji = () => {
    slideToView("emoji");
  };

  const slideToGif = () => {
    slideToView("gif");
  };

  const slideToMedia = () => {
    // Mở file picker trực tiếp thay vì chuyển qua field media
    fileInputRef.current?.click();
  };

  const handleTouchStart = (e) => {
    if (uiState.currentView === "compose") return;
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = e.touches[0].clientX;
    isDraggingSlideRef.current = true;
  };

  const handleTouchMove = (e) => {
    if (!isDraggingSlideRef.current || uiState.currentView === "compose")
      return;
    currentXRef.current = e.touches[0].clientX;
    const deltaX = currentXRef.current - startXRef.current;

    if (deltaX > 0 && slideContainerRef.current) {
      const progress = Math.min(deltaX / 200, 1);
      slideContainerRef.current.style.transform = `translateX(${deltaX}px)`;
      slideContainerRef.current.style.opacity = `${1 - progress * 0.3}`;
    }
  };

  const handleTouchEnd = () => {
    if (!isDraggingSlideRef.current || uiState.currentView === "compose")
      return;
    const deltaX = currentXRef.current - startXRef.current;

    if (slideContainerRef.current) {
      slideContainerRef.current.style.transform = "";
      slideContainerRef.current.style.opacity = "";
    }

    if (deltaX > 100) slideToView("compose");
    isDraggingSlideRef.current = false;
  };

  const saveDraft = () => {
    if (hasDraftContent) {
      const draft = {
        ...formData,
        selectedMedia: attachments.selectedMedia.map((file) => ({
          id: file.id,
          type: file.type,
          name: file.file.name,
          size: file.file.size,
        })),
        selectedGif: attachments.selectedGif,
        timestamp: Date.now(),
      };
      localStorage.setItem("post_draft", JSON.stringify(draft));
    }
  };

  const loadDraft = () => {
    const savedDraft = localStorage.getItem("post_draft");
    if (savedDraft) {
      const draft = JSON.parse(savedDraft);
      setFormData((prev) => ({
        ...prev,
        title: draft.title || "",
        content: draft.content || "",
        hashtags: draft.hashtags || [],
        privacy: draft.privacy || "public",
      }));
      setAttachments((prev) => ({
        ...prev,
        selectedGif: draft.selectedGif || null,
      }));
      setUiState((prev) => ({ ...prev, showDraftRestored: true }));
      setTimeout(
        () =>
          setUiState((prev) => ({
            ...prev,
            showDraftRestored: false,
          })),
        3000
      );
    }
  };

  const clearDraft = () => {
    localStorage.removeItem("post_draft");
    setAttachments({
      selectedMedia: [],
      selectedGif: null,
      hasAttachment: false,
    });
  };

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

  const handlePost = () => {
    if (canPost) {
      setUiState((prev) => ({ ...prev, isAnimating: true }));
      setTimeout(() => {
        // TODO: Implement actual post creation API call
        clearDraft();
        setFormData({
          title: "",
          content: "",
          hashtags: [],
          hashtagInput: "",
          privacy: "public",
        });
        setUiState((prev) => ({ ...prev, isAnimating: false }));
        onClose();
      }, 500);
    }
  };

  const handleClose = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Thêm delay nhỏ để tránh trigger không mong muốn
    setTimeout(() => {
      // Kiểm tra lại hasDraftContent để đảm bảo chính xác
      const hasContent = Boolean(
        formData.title.trim() ||
        formData.content.trim() ||
        formData.hashtags.length > 0 ||
        attachments.selectedMedia.length > 0 ||
        attachments.selectedGif
      );

      if (hasContent) {
        setUiState((prev) => ({ ...prev, showExitConfirm: true }));
      } else {
        onClose();
      }
    }, 100);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) handleClose(e);
  };

  const handleSaveDraftAndClose = () => {
    saveDraft();
    setUiState((prev) => ({ ...prev, showExitConfirm: false }));
    onClose();
  };

  const handleDiscardAndClose = () => {
    clearDraft();
    setFormData({
      title: "",
      content: "",
      hashtags: [],
      hashtagInput: "",
      privacy: "public",
    });
    setUiState((prev) => ({ ...prev, showExitConfirm: false }));
    onClose();
  };

  const scrollToolbar = (direction) => {
    if (toolbarRef.current) {
      const scrollAmount = 120;
      toolbarRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleEmojiSelect = (emoji) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent =
        formData.content.slice(0, start) +
        emoji +
        formData.content.slice(end);
      setFormData((prev) => ({ ...prev, content: newContent }));

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + emoji.length,
          start + emoji.length
        );
      }, 0);
    } else {
      setFormData((prev) => ({ ...prev, content: prev.content + emoji }));
    }
    slideToView("compose");
  };

  const handleGifSelect = (gifUrl) => {
    // Thông báo nếu đã có ảnh/video
    if (attachments.selectedMedia.length > 0) {
      if (
        confirm(
          "Bạn đã có ảnh/video. Chọn GIF sẽ xóa ảnh/video hiện tại. Bạn có muốn tiếp tục?"
        )
      ) {
        // Xóa tất cả ảnh/video khi chọn GIF
        attachments.selectedMedia.forEach((file) => {
          if (file.url) URL.revokeObjectURL(file.url);
        });

        setAttachments((prev) => ({
          ...prev,
          selectedMedia: [], // Xóa tất cả ảnh/video
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
    const existingFileNames = attachments.selectedMedia.map(
      (f) => f.file.name
    );

    // Thông báo nếu đã có GIF
    if (attachments.selectedGif) {
      if (
        !confirm(
          "Bạn đã có GIF. Chọn ảnh/video sẽ xóa GIF hiện tại. Bạn có muốn tiếp tục?"
        )
      ) {
        return;
      }
      // Xóa GIF khi chọn ảnh/video
      setAttachments((prev) => ({
        ...prev,
        selectedGif: null,
      }));
    }

    Array.from(files).forEach((file) => {
      if (file.size > 50 * 1024 * 1024) {
        alert(`File ${file.name} quá lớn. Kích thước tối đa là 50MB.`);
        return;
      }

      // Tự động đổi tên file trùng
      let fileName = file.name;
      let counter = 1;

      while (existingFileNames.includes(fileName)) {
        const nameWithoutExt = file.name.substring(
          0,
          file.name.lastIndexOf(".")
        );
        const extension = file.name.substring(
          file.name.lastIndexOf(".")
        );
        fileName = `${nameWithoutExt}_${counter}${extension}`;
        counter++;
      }

      // Tạo file mới với tên đã đổi
      const renamedFile = new File([file], fileName, { type: file.type });

      const mediaFile = {
        id: Math.random().toString(36).substr(2, 9),
        file: renamedFile,
        url: URL.createObjectURL(renamedFile),
        type: file.type.startsWith("image/")
          ? "image"
          : file.type.startsWith("video/")
            ? "video"
            : "other",
        uploadProgress: 0,
      };

      newFiles.push(mediaFile);
      simulateIndividualUpload(mediaFile);
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

  const handleDrop = (e) => {
    e.preventDefault();
    setUiState((prev) => ({ ...prev, isDragging: false }));
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFileSelect(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setUiState((prev) => ({ ...prev, isDragging: true }));
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setUiState((prev) => ({ ...prev, isDragging: false }));
  };

  const removeMediaFile = (id) => {
    setAttachments((prev) => {
      const updated = prev.selectedMedia.filter((file) => file.id !== id);
      const removed = prev.selectedMedia.find((file) => file.id === id);
      if (removed) URL.revokeObjectURL(removed.url);

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

  // Effects
  useEffect(() => {
    if (autoSaveTimeoutRef.current)
      clearTimeout(autoSaveTimeoutRef.current);
    autoSaveTimeoutRef.current = setTimeout(() => {
      if (hasDraftContent) saveDraft();
    }, 1000);
    return () => {
      if (autoSaveTimeoutRef.current)
        clearTimeout(autoSaveTimeoutRef.current);
    };
  }, [formData.title, formData.content, formData.hashtags, formData.privacy]);

  useEffect(() => {
    if (isOpen && !formData.title && !formData.content) loadDraft();
  }, [isOpen]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [formData.content]);

  useEffect(() => {
    if (formData.content.length > 0 || formData.title.length > 0) {
      setUiState((prev) => ({ ...prev, showSparkles: true }));
      const timer = setTimeout(
        () => setUiState((prev) => ({ ...prev, showSparkles: false })),
        2000
      );
      return () => clearTimeout(timer);
    }
  }, [formData.content, formData.title]);

  useEffect(() => {
    if (!isOpen)
      setUiState((prev) => ({ ...prev, currentView: "compose" }));
  }, [isOpen]);

  // Keyboard support for image viewer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && uiState.showImageViewer) {
        closeImageViewer();
      }
    };

    if (uiState.showImageViewer) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [uiState.showImageViewer]);

  useEffect(() => {
    // Chỉ thay đổi height khi không đang slide để tránh hiện tượng trang trống
    if (!uiState.isSliding) {
      // Delay nhỏ để đảm bảo DOM đã render xong
      setTimeout(() => {
        setModalHeight("auto");
      }, 50);
    }
  }, [uiState.currentView, uiState.isSliding]);

  // Effect để tính toán height khi modal mở
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const height = modalRef.current.offsetHeight;
      setModalHeight(`${height}px`);
    }
  }, [isOpen]);

  const filteredSuggestions = POPULAR_HASHTAGS.filter(
    (tag) =>
      tag.toLowerCase().includes(formData.hashtagInput.toLowerCase()) &&
      !formData.hashtags.includes(tag)
  );

  if (!isOpen) return null;

  // 6. Render
  return (
    <>
      <div
        className="fixed inset-0 z-[9999] md:flex md:items-center md:justify-center"
        onClick={handleBackdropClick}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        <Card
          ref={modalRef}
          className={`!py-0 relative w-full h-full md:h-auto md:max-w-3xl md:mx-4 bg-white shadow-2xl md:rounded-lg overflow-hidden modal-container modal-optimized ${uiState.isAnimating
              ? "scale-95 opacity-90"
              : "scale-100 opacity-100"
            }`}
          style={{
            height:
              uiState.isSliding && fixedHeight
                ? `${fixedHeight}px`
                : modalHeight,
            maxHeight: "90vh",
            transition: uiState.isSliding
              ? "height 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              : "height 0.3s ease-out",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Toàn bộ modal có slide animation */}
          <div
            ref={slideContainerRef}
            className={`h-full ${uiState.isSliding ? "opacity-70" : "opacity-100"
              }`}
            style={{
              transition:
                "opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-yellow-50 sticky top-0 z-10">
              <div className="flex items-center space-x-3">
                {uiState.currentView !== "compose" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => slideToView("compose")}
                    className="h-8 w-8 p-0 hover:bg-orange-100 rounded-full"
                  >
                    <ArrowLeft className="h-4 w-4 text-gray-700" />
                  </Button>
                )}
                 <h2 className="text-lg font-semibold text-gray-900">
                   {uiState.currentView === "compose" &&
                     POST_MESSAGES.LABELS.CREATE_POST}
                   {uiState.currentView === "emoji" &&
                     POST_MESSAGES.LABELS.SELECT_EMOJI}
                   {uiState.currentView === "gif" && POST_MESSAGES.LABELS.FIND_GIF}
                   {uiState.currentView === "media" &&
                     POST_MESSAGES.LABELS.SELECT_MEDIA}
                 </h2>
                {uiState.showSparkles &&
                  uiState.currentView === "compose" && (
                    <Sparkles className="h-4 w-4 text-orange-500" />
                  )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleClose(e);
                }}
                className="h-8 w-8 p-0 hover:bg-orange-100 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content area */}

            {uiState.showDraftRestored &&
              uiState.currentView === "compose" && (
                 <div className="bg-green-50 border-l-4 border-green-400 p-3 mx-6 mt-3 rounded">
                   <p className="text-sm text-green-700">
                     {POST_MESSAGES.NOTIFICATIONS.DRAFT_RESTORED}
                   </p>
                 </div>
              )}

            {uiState.currentView === "compose" && (
              <div className="h-full">
                <div className="flex items-center justify-between px-6 py-4 pb-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10 ring-2 ring-orange-200">
                      <AvatarFallback className="bg-gradient-to-r from-orange-400 to-yellow-400 text-white font-semibold">
                        {userAvatar}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-gray-900">
                      {userName}
                    </span>
                  </div>

                  <div className="relative">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setUiState((prev) => ({
                          ...prev,
                          showPrivacyDropdown:
                            !prev.showPrivacyDropdown,
                        }))
                      }
                      className="flex items-center space-x-2 text-sm border-orange-200 hover:bg-orange-50 hover:border-orange-300"
                    >
                      {currentPrivacy.icon}
                      <span>{currentPrivacy.label}</span>
                      <ChevronDown className="h-3 w-3" />
                    </Button>

                    {uiState.showPrivacyDropdown && (
                      <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20 animate-fade-in">
                        {PRIVACY_OPTIONS.map(
                          (option) => (
                            <button
                              key={option.value}
                              onClick={() => {
                                setFormData(
                                  (prev) => ({
                                    ...prev,
                                    privacy:
                                      option.value,
                                  })
                                );
                                setUiState(
                                  (prev) => ({
                                    ...prev,
                                    showPrivacyDropdown: false,
                                  })
                                );
                              }}
                              className="w-full flex items-start space-x-3 p-3 hover:bg-orange-50 text-left transition-colors"
                            >
                              <div className="mt-0.5">
                                {option.icon}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {
                                    option.label
                                  }
                                </div>
                                <div className="text-sm text-gray-500">
                                  {
                                    option.description
                                  }
                                </div>
                              </div>
                            </button>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-6 py-4 pt-2 space-y-5 flex-1 overflow-y-auto max-h-[calc(90vh-200px)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                     <Input
                       placeholder={POST_MESSAGES.PLACEHOLDERS.ADD_TITLE}
                       value={formData.title}
                       onChange={(e) =>
                         setFormData((prev) => ({
                           ...prev,
                           title: e.target.value,
                         }))
                       }
                       className="border-gray-200 focus:border-orange-300 focus:ring-orange-200 transition-all duration-200"
                     />

                  <Textarea
                    ref={textareaRef}
                    placeholder={POST_MESSAGES.PLACEHOLDERS.WHAT_ARE_YOU_THINKING}
                    value={formData.content}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        content: e.target.value,
                      }))
                    }
                    className="border-gray-200 focus:border-orange-300 focus:ring-orange-200 resize-none !min-h-[150px] overflow-hidden transition-all duration-200"
                    rows={1}
                  />

                  {(attachments.selectedMedia.length > 0 ||
                    attachments.selectedGif) && (
                      <div className="space-y-3">
                        {attachments.selectedMedia.length >
                          0 && (
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <h4 className="text-sm font-medium text-gray-700">
                                    Ảnh/Video đã
                                    chọn
                                  </h4>
                                  {attachments
                                    .selectedMedia
                                    .length > 8 && (
                                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                        {
                                          attachments
                                            .selectedMedia
                                            .length
                                        }{" "}
                                        ảnh
                                      </span>
                                    )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    attachments.selectedMedia.forEach(
                                      (file) => {
                                        if (
                                          file.url
                                        )
                                          URL.revokeObjectURL(
                                            file.url
                                          );
                                      }
                                    );
                                    setAttachments(
                                      (prev) => ({
                                        ...prev,
                                        selectedMedia:
                                          [],
                                        hasAttachment:
                                          prev.selectedGif
                                            ? true
                                            : false,
                                      })
                                    );
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
                                  scrollbarWidth:
                                    "thin",
                                  scrollbarColor:
                                    "#9ca3af #f3f4f6",
                                }}
                              >
                                {attachments.selectedMedia.map(
                                  (file) => (
                                    <div
                                      key={
                                        file.id
                                      }
                                      className="relative group flex-shrink-0"
                                    >
                                      {file.type ===
                                        "image" ? (
                                        <img
                                          src={
                                            file.url ||
                                            "/placeholder.svg"
                                          }
                                          alt={
                                            file
                                              .file
                                              .name
                                          }
                                          className="w-32 h-28 object-contain rounded-lg border border-gray-200 bg-gray-50 cursor-pointer hover:opacity-80 transition-opacity"
                                          onClick={() =>
                                            openImageViewer(
                                              file.url
                                            )
                                          }
                                        />
                                      ) : (
                                        <video
                                          src={
                                            file.url
                                          }
                                          className="w-32 h-28 object-contain rounded-lg border border-gray-200 bg-gray-50 cursor-pointer hover:opacity-80 transition-opacity"
                                          muted
                                          onClick={() =>
                                            openImageViewer(
                                              file.url
                                            )
                                          }
                                        />
                                      )}

                                      {file.uploadProgress <
                                        100 && (
                                          <div className="absolute inset-0 bg-black/50 rounded-lg flex flex-col items-center justify-center">
                                            <div className="w-3/4 bg-gray-200 rounded-full h-2 mb-2">
                                              <div
                                                className="bg-gradient-to-r from-orange-400 to-yellow-400 h-2 rounded-full transition-all duration-300 relative overflow-hidden"
                                                style={{
                                                  width: `${file.uploadProgress}%`,
                                                }}
                                              >
                                                <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                              </div>
                                            </div>
                                            <span className="text-white text-xs font-medium bg-black/30 px-2 py-1 rounded">
                                              {Math.round(
                                                file.uploadProgress
                                              )}
                                              %
                                            </span>
                                          </div>
                                        )}

                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        className="absolute top-1 right-1 h-6 w-6 p-0 opacity-80 hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600"
                                        onClick={(
                                          e
                                        ) => {
                                          e.stopPropagation();
                                          removeMediaFile(
                                            file.id
                                          );
                                        }}
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  )
                                )}
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
                                src={
                                  attachments.selectedGif ||
                                  "/placeholder.svg"
                                }
                                alt="Selected GIF"
                                className="max-w-full h-32 object-contain rounded-lg border border-gray-200 bg-gray-50 cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() =>
                                  openImageViewer(
                                    attachments.selectedGif
                                  )
                                }
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

                  <div className="space-y-3">
                    <div className="relative">
                      <div className="flex items-center space-x-2">
                        <Hash className="h-4 w-4 text-orange-400" />
                        <Input
                          ref={hashtagInputRef}
                          placeholder="Thêm #hashtag"
                          value={
                            formData.hashtagInput
                          }
                          onChange={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              hashtagInput:
                                e.target.value,
                            }));
                            setUiState((prev) => ({
                              ...prev,
                              showHashtagSuggestions:
                                e.target.value
                                  .length > 0,
                            }));
                          }}
                          onKeyDown={
                            handleHashtagInputKeyDown
                          }
                          onFocus={() =>
                            setUiState((prev) => ({
                              ...prev,
                              showHashtagSuggestions:
                                formData
                                  .hashtagInput
                                  .length > 0,
                            }))
                          }
                          className="border-gray-200 focus:border-orange-300 focus:ring-orange-200 text-sm transition-all duration-200"
                        />
                      </div>

                      {uiState.showHashtagSuggestions &&
                        filteredSuggestions.length >
                        0 && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-40 overflow-y-auto animate-fade-in">
                            {filteredSuggestions
                              .slice(0, 8)
                              .map((tag) => (
                                <button
                                  key={tag}
                                  onClick={() =>
                                    addHashtag(
                                      tag
                                    )
                                  }
                                  className="w-full text-left px-3 py-2 hover:bg-orange-50 text-sm flex items-center space-x-2 transition-colors"
                                >
                                  <Hash className="h-3 w-3 text-orange-400" />
                                  <span>
                                    {tag}
                                  </span>
                                </button>
                              ))}
                          </div>
                        )}
                    </div>

                    {formData.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.hashtags.map(
                          (tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-700 border border-orange-200 animate-fade-in"
                            >
                              #{tag}
                              <button
                                onClick={() =>
                                  removeHashtag(
                                    tag
                                  )
                                }
                                className="ml-2 hover:text-orange-900 transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          )
                        )}
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <div className="flex items-center">
                      <div
                        ref={toolbarRef}
                        className="flex items-center space-x-2 overflow-x-auto scrollbar-hide px-8 py-2"
                        style={{
                          scrollbarWidth: "none",
                          msOverflowStyle: "none",
                        }}
                      >
                        <div
                          className="relative group"
                          onMouseEnter={() => {
                            if (
                              attachments.selectedGif
                            ) {
                              setUiState(
                                (prev) => ({
                                  ...prev,
                                  showImageTooltip: true,
                                })
                              );
                            }
                          }}
                          onMouseLeave={() => {
                            setUiState((prev) => ({
                              ...prev,
                              showImageTooltip: false,
                            }));
                          }}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={
                              attachments.selectedGif
                                ? true
                                : false
                            }
                            className={`whitespace-nowrap flex-shrink-0 transition-all duration-200 ${attachments.selectedGif
                                ? "text-gray-400 cursor-not-allowed opacity-50"
                                : "text-gray-600 hover:text-orange-600 hover:bg-orange-50 hover:scale-105"
                              }`}
                            onClick={slideToMedia}
                          >
                            <ImageIcon className="h-4 w-4 mr-2" />
                            Tải lên Ảnh/Video
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-600 hover:text-orange-600 hover:bg-orange-50 whitespace-nowrap flex-shrink-0 transition-all duration-200 hover:scale-105"
                          onClick={slideToEmoji}
                        >
                          <Smile className="h-4 w-4 mr-2" />
                          Biểu cảm
                        </Button>
                        <div
                          className="relative group"
                          onMouseEnter={() => {
                            if (
                              attachments
                                .selectedMedia
                                .length > 0
                            ) {
                              setUiState(
                                (prev) => ({
                                  ...prev,
                                  showGifTooltip: true,
                                })
                              );
                            }
                          }}
                          onMouseLeave={() => {
                            setUiState((prev) => ({
                              ...prev,
                              showGifTooltip: false,
                            }));
                          }}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={
                              attachments
                                .selectedMedia
                                .length > 0
                                ? true
                                : false
                            }
                            className={`whitespace-nowrap flex-shrink-0 transition-all duration-200 ${attachments
                                .selectedMedia
                                .length > 0
                                ? "text-gray-400 cursor-not-allowed opacity-50"
                                : "text-gray-600 hover:text-orange-600 hover:bg-orange-50 hover:scale-105"
                              }`}
                            onClick={slideToGif}
                          >
                            <Gift className="h-4 w-4 mr-2" />
                            GIF
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-5 border-t border-gray-100 sticky bottom-0 bg-white">
                    <Button
                      onClick={handlePost}
                      disabled={
                        !canPost || uiState.isAnimating
                      }
                      className={`transition-all duration-300 ${canPost
                          ? "bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white shadow-md hover:shadow-lg transform hover:scale-105"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        } ${uiState.isAnimating
                          ? "animate-pulse"
                          : ""
                        }`}
                    >
                      {uiState.isAnimating ? (
                        <div className="flex items-center space-x-2">
                          <Heart className="h-4 w-4 animate-bounce" />
                          <span>Đang đăng...</span>
                        </div>
                      ) : (
                        "Đăng"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {uiState.currentView === "emoji" && (
              <div className="h-full">
                <div className="p-6 h-full overflow-y-auto max-h-[calc(90vh-200px)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  <div className="h-full">
                    <EmojiPicker
                      isOpen={true}
                      onClose={() =>
                        slideToView("compose")
                      }
                      onEmojiSelect={handleEmojiSelect}
                      inline={true}
                    />
                  </div>
                </div>
              </div>
            )}

            {uiState.currentView === "gif" && (
              <div className="h-full">
                <div className="p-6 h-full overflow-y-auto max-h-[calc(90vh-200px)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  <div className="h-full">
                    <GifSearchModal
                      isOpen={true}
                      onClose={() =>
                        slideToView("compose")
                      }
                      onGifSelect={handleGifSelect}
                      inline={true}
                    />
                  </div>
                </div>
              </div>
            )}

            {uiState.currentView === "media" && (
              <div className="h-full">
                <div className="p-6 h-full overflow-y-auto max-h-[calc(90vh-200px)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  <div className="h-full">
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 h-full flex flex-col justify-center ${uiState.isDragging
                          ? "border-orange-400 bg-orange-100"
                          : "border-orange-300 hover:border-orange-400 hover:bg-orange-100/50"
                        }`}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                    >
                      <Upload className="h-16 w-16 text-orange-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Chọn ảnh hoặc video
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Kéo thả file vào đây hoặc{" "}
                        <button
                          onClick={() =>
                            fileInputRef.current?.click()
                          }
                          className="text-orange-600 hover:text-orange-700 font-medium underline"
                        >
                          chọn từ thiết bị
                        </button>
                      </p>
                      <p className="text-sm text-gray-500">
                        JPG, PNG, GIF, MP4, MOV (tối đa
                        50MB)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Hidden file input for direct upload */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={(e) =>
          e.target.files && handleFileSelect(e.target.files)
        }
        className="hidden"
      />

      {uiState.showPrivacyDropdown && (
        <div
          className="fixed inset-0 z-10"
          onClick={() =>
            setUiState((prev) => ({
              ...prev,
              showPrivacyDropdown: false,
            }))
          }
        />
      )}
      {uiState.showHashtagSuggestions && (
        <div
          className="fixed inset-0 z-10"
          onClick={() =>
            setUiState((prev) => ({
              ...prev,
              showHashtagSuggestions: false,
            }))
          }
        />
      )}

      {uiState.showExitConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <Card className="relative w-full max-w-sm mx-4 bg-white shadow-2xl">
            <div className="p-6 pt-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Lưu bản nháp?
              </h3>
              <p className="text-gray-600 mb-6">
                Bạn có muốn lưu bản nháp không?
              </p>
              <div className="flex space-x-3">
                <Button
                  onClick={handleSaveDraftAndClose}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white"
                >
                  Lưu bản nháp
                </Button>
                <Button
                  onClick={handleDiscardAndClose}
                  variant="outline"
                  className="flex-1 bg-transparent"
                >
                  Không lưu
                </Button>
                <Button
                  onClick={() =>
                    setUiState((prev) => ({
                      ...prev,
                      showExitConfirm: false,
                    }))
                  }
                  variant="ghost"
                  className="flex-1"
                >
                  Hủy
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Image Viewer Modal */}
      {uiState.showImageViewer && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          onClick={closeImageViewer}
        >
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
          <div
            className="relative max-w-4xl max-h-[90vh] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
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

      {(uiState.showImageTooltip || uiState.showGifTooltip) && (
        <div className="fixed pointer-events-none z-[10000] top-2/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg shadow-lg border border-gray-700 animate-fade-in">
            <div className="flex items-center space-x-2">
              <svg
                className="w-4 h-4 text-orange-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
               <span>
                 {POST_MESSAGES.TOOLTIPS.MUTUAL_EXCLUSIVE_ATTACHMENT}
               </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreatePostModal;
