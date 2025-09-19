import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/common/components/ui/button"
import { Input } from "@/common/components/ui/input"
import { Textarea } from "@/common/components/ui/textarea"
import { Label } from "@/common/components/ui/label"
import { Card, CardContent } from "@/common/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/common/components/ui/avatar"
import { Loading, LoadingOverlay, LoadingButton, LoadingCard } from "@/common/components/ui/loading"
import { useProfileApi } from "@/features/user-profile/hooks/useProfileApi"
import { useToast } from "@/common/hooks/useToast"
import { ROUTES } from "@/common/constants/routes"
import { uploadImage } from "@/common/utils/upload"
import { Star, BookOpen, Music, Film, Camera, Coffee, Globe, Save, X, Trash2 } from "lucide-react"
import InteractiveTags from "./InteractiveTags"

export default function EditStudentProfile() {
  const navigate = useNavigate()
  const toast = useToast()
  
  // Profile API hook
  const { profileLoading, saveLoading, getMyProfile, updateMyPersonalInfo } = useProfileApi()
  const [uploadLoading, setUploadLoading] = useState(false)

  const [formData, setFormData] = useState({
    studentId: "",
    name: "",
    class: "",
    email: "",
    bio: "",
    birthDate: "",
    phoneNumber: "",
    avatarUrl: "",
    interests: [],
    strengths: [],
    favoriteSubjects: [],
    personality: []
  })

  const [avatarPreview, setAvatarPreview] = useState("")
  const [avatarFile, setAvatarFile] = useState(null)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await getMyProfile();
        const profile = response.data;
        
        // Parse ExtraJson if it exists
        let extraData = {};
        if (profile.extraJson) {
          try {
            extraData = JSON.parse(profile.extraJson);
          } catch (e) {
            console.warn('Failed to parse ExtraJson:', e);
          }
        }

        setFormData({
          studentId: profile.studentNumber || "",
          name: profile.firstName && profile.lastName ? `${profile.firstName} ${profile.lastName}` : "",
          class: profile.classGroupName || "",
          email: profile.email || "",
          bio: profile.bio || "",
          birthDate: profile.birthDate ? profile.birthDate.split('T')[0] : "",
          phoneNumber: profile.phoneNumber || "",
          avatarUrl: profile.avatarUrl || "",
          interests: extraData.interests || [],
          strengths: extraData.strengths || [],
          favoriteSubjects: extraData.favoriteSubjects || [],
          personality: extraData.personality || []
        });

        setAvatarPreview(profile.avatarUrl || "");
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.profileLoadFailed();
      }
    };

    loadProfile();
  }, []); // Empty dependency array to run only once

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.invalidFileType()
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.fileTooLarge()
        return
      }

      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target) {
          console.log('Setting avatar preview:', e.target.result)
          setAvatarPreview(e.target.result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const removeAvatar = () => {
    setAvatarFile(null)
    setAvatarPreview(formData.avatarUrl || "")
  }

  const handleSave = async () => {
    try {
      let avatarUrl = formData.avatarUrl;
      
      // Upload avatar if there's a new file
      if (avatarFile) {
        setUploadLoading(true);
        try {
          avatarUrl = await uploadImage(avatarFile);
          console.log("Upload avatar thành công:", avatarUrl);
        } catch (uploadError) {
          console.error("Lỗi upload avatar:", uploadError);
          toast.avatarUploadFailed();
          return;
        } finally {
          setUploadLoading(false);
        }
      }

      const payload = {
        bio: formData.bio,
        extraJson: JSON.stringify({
          interests: formData.interests,
          strengths: formData.strengths,
          favoriteSubjects: formData.favoriteSubjects,
          personality: formData.personality
        }),
        avatarUrl,
        birthDate: formData.birthDate ? new Date(formData.birthDate).toISOString() : null,
        phoneNumber: formData.phoneNumber,
      };

      const result = await updateMyPersonalInfo(payload);
      
      console.log("Đã lưu thành công:", result);
      toast.profileUpdated();
      navigate(ROUTES.USER_PROFILE.PROFILE);
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.profileSaveFailed();
    }
  };

  const handleCancel = () => {
    navigate(ROUTES.USER_PROFILE.PROFILE)
  }

  console.log('Current avatarPreview:', avatarPreview);
  console.log('Current avatarFile:', avatarFile);

  return (
    <>
      <LoadingOverlay 
        isLoading={profileLoading || uploadLoading || saveLoading} 
        text={profileLoading ? toast.PROFILE_MESSAGES.LOADING.PROFILE : uploadLoading ? toast.PROFILE_MESSAGES.LOADING.AVATAR_UPLOAD : saveLoading ? toast.PROFILE_MESSAGES.LOADING.SAVING_CHANGES : toast.COMMON_MESSAGES.LOADING.PROCESSING} 
        variant="primary"
      />
      
      {profileLoading ? (
        <div className="max-w-4xl mx-auto px-4 py-6">
          <LoadingCard text={toast.PROFILE_MESSAGES.LOADING.PROFILE} className="h-64" variant="primary" />
        </div>
      ) : (
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
            Chỉnh sửa Hồ sơ
          </h1>
          <p className="text-gray-600 mt-2">Cập nhật thông tin cá nhân của bạn</p>
        </div>

      <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
        <CardContent className="p-8">
          {/* Avatar */}
          <div className="flex flex-col items-center mb-8 pt-8">
            <div className="relative group">
              <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                <AvatarImage 
                  src={avatarPreview || ""} 
                  alt="Profile" 
                  onLoad={() => console.log('Avatar image loaded')}
                  onError={() => console.log('Avatar image error')}
                />
                <AvatarFallback className="bg-gradient-to-br from-orange-400 to-yellow-400 text-white text-2xl font-bold">
                  {formData.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              
              {/* Upload overlay */}
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="w-6 h-6 text-white" />
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarChange} 
                  className="hidden" 
                />
              </label>

              {/* Remove button */}
              {avatarFile && (
                <button
                  type="button"
                  onClick={removeAvatar}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="text-center mt-3">
              <p className="text-sm text-gray-500 mb-1">{toast.PROFILE_MESSAGES.LABELS.AVATAR_UPLOAD}</p>
              <p className="text-xs text-gray-400">{toast.PROFILE_MESSAGES.LABELS.AVATAR_FORMAT}</p>
            </div>
          </div>


          {/* Form fields */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="studentId">{toast.PROFILE_MESSAGES.LABELS.STUDENT_ID}</Label>
                <Input
                  id="studentId"
                  value={formData.studentId}
                  disabled
                  className="cursor-not-allowed !bg-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">{toast.PROFILE_MESSAGES.LABELS.FULL_NAME}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  disabled
                  className="cursor-not-allowed !bg-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="class">{toast.PROFILE_MESSAGES.LABELS.CLASS}</Label>
                <Input
                  id="class"
                  value={formData.class}
                  disabled
                  className="cursor-not-allowed !bg-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{toast.PROFILE_MESSAGES.LABELS.EMAIL}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="cursor-not-allowed !bg-gray-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="birthDate">{toast.PROFILE_MESSAGES.LABELS.BIRTH_DATE}</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleInputChange("birthDate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">{toast.PROFILE_MESSAGES.LABELS.PHONE_NUMBER}</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                  placeholder={toast.PROFILE_MESSAGES.PLACEHOLDER.PHONE_NUMBER}
                />
              </div>
            </div>



            <div className="space-y-2">
              <Label htmlFor="bio">{toast.PROFILE_MESSAGES.LABELS.BIO}</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                placeholder={toast.PROFILE_MESSAGES.PLACEHOLDER.BIO}
              />
            </div>

            {/* Interactive tags */}
            <InteractiveTags
              label={toast.PROFILE_MESSAGES.LABELS.INTERESTS}
              initialTags={formData.interests}
              popularTags={[
                "Lập trình",
                "AI",
                "Robotics",
                "Thể thao",
                "Âm nhạc",
                "Điện ảnh",
                "Nhiếp ảnh",
                "Du lịch",
                "Cà phê",
              ]}
              iconMap={{
                "AI": Star,
                "Lập trình": BookOpen,
                "Robotics": Star,
                "Thể thao": Music,
                "Âm nhạc": Music,
                "Điện ảnh": Film,
                "Nhiếp ảnh": Camera,
                "Du lịch": Globe,
                "Cà phê": Coffee,
              }}
              onChange={(tags) => handleInputChange("interests", tags)}
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-100">
            <LoadingButton
              onClick={handleSave}
              isLoading={saveLoading || uploadLoading}
              loadingText={toast.PROFILE_MESSAGES.LOADING.SAVING_CHANGES}
              className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-medium py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
            >
              {toast.PROFILE_MESSAGES.BUTTON.SAVE}
            </LoadingButton>
            <Button
              onClick={handleCancel}
              variant="outline"
              className="flex-1"
              disabled={saveLoading || uploadLoading}
            >
              <X className="w-4 h-4 mr-2" />
              {toast.PROFILE_MESSAGES.BUTTON.CANCEL}
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
      )}
    </>
  )
}
