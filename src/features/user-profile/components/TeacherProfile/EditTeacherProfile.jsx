import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { Button } from "@/common/components/ui/button"
import { Input } from "@/common/components/ui/input"
import { Textarea } from "@/common/components/ui/textarea"
import { Label } from "@/common/components/ui/label"
import { Card, CardContent } from "@/common/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/common/components/ui/avatar"
import { Loading, LoadingOverlay, LoadingButton, LoadingCard } from "@/common/components/ui/loading"
import { useProfileApi } from "@/features/user-profile/hooks/useProfileApi"
import { useAuthApi } from "@/features/auth/hooks/useAuthApi"
import { useToast } from "@/common/hooks/useToast"
import { ROUTES } from "@/common/constants/routes"
import { uploadImage } from "@/common/utils/upload"
import { Star, BookOpen, Music, Film, Camera, Coffee, Globe, Save, X, Trash2, GraduationCap, Code, Database, Shield, Computer } from "lucide-react"
import InteractiveTags from "../StudentProfile/InteractiveTags"
import { setUser } from "@/store/user/userSlice"

export default function EditTeacherProfile() {
  const navigate = useNavigate()
  const toast = useToast()
  const dispatch = useDispatch()
  
  // Profile API hook
  const { profileLoading, saveLoading, getMyTeacherProfile, updateMyTeacherProfile } = useProfileApi()
  const { getMe } = useAuthApi()
  const [uploadLoading, setUploadLoading] = useState(false)

  const [formData, setFormData] = useState({
    teacherId: "",
    name: "",
    department: "",
    position: "",
    email: "",
    bio: "",
    birthDate: "",
    phoneNumber: "",
    avatarUrl: "",
    specializations: [],
    researchAreas: [],
    teachingSubjects: [],
    certifications: []
  })

  const [avatarPreview, setAvatarPreview] = useState("")
  const [avatarFile, setAvatarFile] = useState(null)
  const [phoneError, setPhoneError] = useState("")

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await getMyTeacherProfile();
        const profile = response.data;
        
        
        let extraData = {};
        if (profile.extraJson && profile.extraJson !== null && profile.extraJson !== 'null') {
          try {
            // Handle both string and already parsed JSON
            extraData = typeof profile.extraJson === 'string' 
              ? JSON.parse(profile.extraJson) 
              : profile.extraJson;
          } catch (e) {
            extraData = {};
          }
        } else {
          extraData = {};
        }

        const newFormData = {
          teacherId: profile.teacherCode || "",
          name: profile.firstName && profile.lastName ? `${profile.firstName} ${profile.lastName}` : "",
          department: profile.department || "",
          position: profile.position || "",
          email: profile.email || "",
          bio: profile.bio || "",
          birthDate: profile.birthDate ? profile.birthDate.split('T')[0] : "",
          phoneNumber: profile.phoneNumber || "",
          avatarUrl: profile.avatarUrl || "",
          specializations: extraData.specializations || [],
          researchAreas: extraData.researchAreas || [],
          teachingSubjects: extraData.teachingSubjects || [],
          certifications: extraData.certifications || []
        };

        setFormData(newFormData);

        setAvatarPreview(profile.avatarUrl || "");
      } catch (error) {
        console.error('Error loading teacher profile:', error);
        toast.profileLoadFailed();
      }
    };

    loadProfile();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    
    // Clear phone error when user starts typing
    if (field === "phoneNumber") {
      setPhoneError("")
    }
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

  const validatePhoneNumber = (phoneNumber) => {
    if (!phoneNumber || phoneNumber.trim() === '') {
      return true; // Allow empty phone number
    }
    
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    return /^0\d{9}$/.test(cleanPhone);
  };

  const handleSave = async () => {
    try {
      if (formData.phoneNumber && !validatePhoneNumber(formData.phoneNumber)) {
        setPhoneError("Số điện thoại phải bắt đầu bằng 0 và có đúng 10 chữ số");
        return;
      }

      let avatarUrl = formData.avatarUrl;
      
      if (avatarFile) {
        setUploadLoading(true);
        try {
          avatarUrl = await uploadImage(avatarFile);
        } catch (uploadError) {
          console.error("Lỗi upload avatar:", uploadError);
          toast.avatarUploadFailed();
          return;
        } finally {
          setUploadLoading(false);
        }
      }

      const cleanPhoneNumber = formData.phoneNumber ? formData.phoneNumber.replace(/\D/g, '') : null;

      const payload = {
        bio: formData.bio,
        avatarUrl,
        birthDate: formData.birthDate ? new Date(formData.birthDate).toISOString() : null,
        phoneNumber: cleanPhoneNumber,
        extraJson: JSON.stringify({
          specializations: formData.specializations,
          researchAreas: formData.researchAreas,
          teachingSubjects: formData.teachingSubjects,
          certifications: formData.certifications
        }),
      };


      const result = await updateMyTeacherProfile(payload);
      
      // Reload user profile to update store
      try {
        const updatedUser = await getMe();
        if (updatedUser?.data) {
          dispatch(setUser(updatedUser.data));
        }
      } catch (error) {
        console.error("Error reloading user profile:", error);
      }
      
      toast.profileUpdated();
      navigate(ROUTES.USER_PROFILE.TEACHER_PROFILE);
    } catch (error) {
      console.error("Error saving teacher profile:", error);
      toast.profileSaveFailed();
    }
  };

  const handleCancel = () => {
    navigate(ROUTES.USER_PROFILE.TEACHER_PROFILE)
  }


  return (
    <>
      <LoadingOverlay 
        isLoading={profileLoading || uploadLoading || saveLoading} 
        text={profileLoading ? "Đang tải thông tin giảng viên..." : uploadLoading ? "Đang tải lên ảnh đại diện..." : saveLoading ? "Đang lưu thay đổi..." : "Đang xử lý..."} 
        variant="primary"
      />
      
      {profileLoading ? (
        <div className="max-w-4xl mx-auto px-4 py-6">
          <LoadingCard text="Đang tải thông tin giảng viên..." className="h-64" variant="primary" />
        </div>
      ) : (
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Chỉnh sửa Hồ sơ Giảng viên
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
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-indigo-400 text-white text-2xl font-bold">
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
              <p className="text-sm text-gray-500 mb-1">Tải lên ảnh đại diện</p>
              <p className="text-xs text-gray-400">JPG, PNG tối đa 5MB</p>
            </div>
          </div>

          {/* Form fields */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="teacherId">Mã giảng viên</Label>
                <Input
                  id="teacherId"
                  value={formData.teacherId}
                  disabled
                  className="cursor-not-allowed !bg-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Họ và tên</Label>
                <Input
                  id="name"
                  value={formData.name}
                  disabled
                  className="cursor-not-allowed !bg-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Khoa</Label>
                <Input
                  id="department"
                  value={formData.department}
                  disabled
                  className="cursor-not-allowed !bg-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Chức vụ</Label>
                <Input
                  id="position"
                  value={formData.position}
                  disabled
                  className="cursor-not-allowed !bg-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
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
                <Label htmlFor="birthDate">Ngày sinh</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleInputChange("birthDate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Số điện thoại</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                  placeholder="0123456789"
                  maxLength={10}
                  className={phoneError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                />
                {phoneError ? (
                  <p className="text-xs text-red-500">{phoneError}</p>
                ) : (
                  <p className="text-xs text-gray-500">Nhập số điện thoại bắt đầu bằng 0 và có đúng 10 chữ số</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Giới thiệu bản thân</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                placeholder="Viết vài dòng giới thiệu về bản thân, kinh nghiệm giảng dạy..."
              />
            </div>

            {/* Interactive tags for specializations */}
            <InteractiveTags
              label="Chuyên môn"
              initialTags={formData.specializations}
              popularTags={[
                "Tin học văn phòng",
                "Lập trình Scratch",
                "Thiết kế đồ họa",
                "Tin học cơ bản",
                "Sử dụng Internet",
                "Bảo mật thông tin",
                "Kỹ năng số",
                "Ứng dụng di động",
                "Giáo dục công nghệ",
              ]}
              iconMap={{
                "Tin học văn phòng": BookOpen,
                "Lập trình Scratch": Code,
                "Thiết kế đồ họa": Star,
                "Tin học cơ bản": BookOpen,
                "Sử dụng Internet": Globe,
                "Bảo mật thông tin": Shield,
                "Kỹ năng số": Star,
                "Ứng dụng di động": Star,
                "Giáo dục công nghệ": BookOpen,
              }}
              onChange={(tags) => handleInputChange("specializations", tags)}
            />

            {/* Interactive tags for research areas */}
            <InteractiveTags
              label="Sở thích & Nghiên cứu"
              initialTags={formData.researchAreas}
              popularTags={[
                "Phương pháp dạy học",
                "Ứng dụng CNTT trong giáo dục",
                "Giáo dục STEM",
                "Sáng tạo công nghệ",
                "Nghiên cứu học sinh",
                "Phát triển kỹ năng số",
                "Giáo dục trực tuyến",
                "Đổi mới sư phạm",
                "Tâm lý học đường",
              ]}
              iconMap={{
                "Phương pháp dạy học": BookOpen,
                "Ứng dụng CNTT trong giáo dục": Globe,
                "Giáo dục STEM": Star,
                "Sáng tạo công nghệ": Code,
                "Nghiên cứu học sinh": Star,
                "Phát triển kỹ năng số": Star,
                "Giáo dục trực tuyến": Globe,
                "Đổi mới sư phạm": BookOpen,
                "Tâm lý học đường": Star,
              }}
              onChange={(tags) => handleInputChange("researchAreas", tags)}
            />

            {/* Interactive tags for teaching subjects */}
            <InteractiveTags
              label="Môn học giảng dạy"
              initialTags={formData.teachingSubjects}
              popularTags={[
                "Tin học 10",
                "Tin học 11", 
                "Tin học 12",
                "Lập trình Scratch",
                "Tin học văn phòng",
                "Sử dụng Internet",
                "Thiết kế web cơ bản",
                "Ứng dụng tin học",
                "Tin học ứng dụng",
              ]}
              iconMap={{
                "Tin học 10": BookOpen,
                "Tin học 11": BookOpen,
                "Tin học 12": BookOpen,
                "Lập trình Scratch": Code,
                "Tin học văn phòng": BookOpen,
                "Sử dụng Internet": Globe,
                "Thiết kế web cơ bản": Globe,
                "Ứng dụng tin học": Star,
                "Tin học ứng dụng": Star,
              }}
              onChange={(tags) => handleInputChange("teachingSubjects", tags)}
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-100">
            <LoadingButton
              onClick={handleSave}
              isLoading={saveLoading || uploadLoading}
              loadingText="Đang lưu thay đổi..."
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
            >
              Lưu thay đổi
            </LoadingButton>
            <Button
              onClick={handleCancel}
              variant="outline"
              className="flex-1"
              disabled={saveLoading || uploadLoading}
            >
              <X className="w-4 h-4 mr-2" />
              Hủy
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
      )}
    </>
  )
}
