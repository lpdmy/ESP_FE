# Frontend Development Guide

## Tổng quan

Dự án EduSphere Frontend được xây dựng bằng React 18 với Vite, sử dụng Tailwind CSS cho styling và React Router cho navigation.

## Cấu trúc thư mục

```
src/
├── api/                    # API documentation
├── common/                 # Shared components và utilities
│   ├── components/         # UI components tái sử dụng
│   ├── constants/          # Constants và messages
│   ├── hooks/              # Custom hooks
│   ├── services/           # API services
│   └── utils/              # Utility functions
├── features/               # Feature-based modules
│   ├── auth/               # Authentication module
│   ├── admin/              # Admin module
│   └── user-profile/       # User profile module
├── layouts/                # Layout components
├── pages/                  # Page components
├── routes/                 # Route definitions
├── services/               # Global services
├── store/                  # State management
└── styles/                 # Global styles
```

## Quy tắc coding

### 1. Component Structure

```jsx
import React, { useState, useEffect } from 'react';
import { useToast } from '@/common/hooks/useToast';
import { LoadingOverlay } from '@/common/components/ui/loading';

const MyComponent = () => {
  // 1. State declarations
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // 2. Hooks
  const toast = useToast();
  
  // 3. Effects
  useEffect(() => {
    // Effect logic
  }, []);
  
  // 4. Event handlers
  const handleClick = () => {
    // Handler logic
  };
  
  // 5. Render
  return (
    <div>
      {/* JSX content */}
    </div>
  );
};

export default MyComponent;
```

### 2. State Management

- Sử dụng `useState` cho local state
- Sử dụng `useRef` cho stable references
- Tránh `useCallback` và `useMemo` không cần thiết

```jsx
// ✅ Good
const [loading, setLoading] = useState(false);
const stableRef = useRef(() => {});

// ❌ Avoid
const memoizedCallback = useCallback(() => {}, []);
```

### 3. API Calls

Sử dụng `executeApiCall` utility cho tất cả API calls:

```jsx
import { executeApiCall } from '@/common/utils/executeApiCall';
import { profileService } from '@/features/user-profile/services/profile.service';

const MyComponent = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const fetchData = async () => {
    const token = localStorage.getItem('token');
    return executeApiCall(
      profileService.getMyProfile.bind(profileService),
      [token],
      { setLoading, setError }
    );
  };
  
  return (
    <div>
      {loading && <LoadingOverlay isLoading={true} />}
      {/* Content */}
    </div>
  );
};
```

### 4. Error Handling

Sử dụng toast notifications thay vì `alert()`:

```jsx
import { useToast } from '@/common/hooks/useToast';

const MyComponent = () => {
  const toast = useToast();
  
  const handleError = () => {
    // ✅ Good
    toast.error('Something went wrong');
    
    // ❌ Avoid
    alert('Something went wrong');
  };
};
```

### 5. Loading States

Sử dụng các loading components có sẵn:

```jsx
import { 
  LoadingOverlay, 
  LoadingCard, 
  LoadingButton 
} from '@/common/components/ui/loading';

const MyComponent = () => {
  const [loading, setLoading] = useState(false);
  
  return (
    <div>
      <LoadingOverlay isLoading={loading} text="Loading..." />
      
      {loading ? (
        <LoadingCard text="Loading data..." />
      ) : (
        <div>Content</div>
      )}
      
      <LoadingButton 
        loading={loading}
        onClick={handleClick}
      >
        Save
      </LoadingButton>
    </div>
  );
};
```

### 6. Messages và Constants

Sử dụng centralized messages:

```jsx
import { useToast } from '@/common/hooks/useToast';

const MyComponent = () => {
  const toast = useToast();
  
  // ✅ Good - sử dụng predefined messages
  toast.success(toast.PROFILE_MESSAGES.SUCCESS.PROFILE_UPDATED);
  toast.error(toast.PROFILE_MESSAGES.ERROR.PROFILE_LOAD_FAILED);
  
  // ❌ Avoid - hardcoded strings
  toast.success('Profile updated successfully');
};
```

### 7. File Upload

```jsx
const handleFileUpload = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const token = localStorage.getItem('token');
  const response = await executeApiCall(
    profileService.uploadAvatar.bind(profileService),
    [formData, token],
    { setLoading, setError }
  );
  
  if (response.success) {
    toast.success('Avatar uploaded successfully');
  }
};
```

### 8. Form Handling

```jsx
const [formData, setFormData] = useState({
  firstName: '',
  lastName: '',
  email: ''
});

const handleInputChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: value
  }));
};

const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    const token = localStorage.getItem('token');
    await executeApiCall(
      profileService.updateMyPersonalInfo.bind(profileService),
      [formData, token],
      { setLoading, setError }
    );
    
    toast.success('Profile updated successfully');
  } catch (error) {
    toast.error('Failed to update profile');
  }
};
```

### 9. Role-Based Access Control

Hệ thống sử dụng 4 roles chính với permissions:

```jsx
import { ROLE } from '@/common/constants/roles';

// Roles
ROLE.ADMIN    // 0 - Quyền cao nhất
ROLE.STAFF    // 1 - Quyền quản lý với permissions cụ thể
ROLE.TEACHER  // 2 - Quyền quản lý hoạt động
ROLE.STUDENT  // 4 - Quyền cơ bản
```

**Sử dụng trong Routes:**

```jsx
import { ROLE } from '@/common/constants/roles';
import ProtectedRoute from '@/routes/ProtectedRoute';

// Chỉ Admin và Staff có permission MANAGE_USER
<Route
  element={
    <ProtectedRoute
      allowedRoles={[ROLE.ADMIN, ROLE.STAFF]}
      requiredPermissions={["MANAGE_USER"]}
    />
  }
>
  <Route path="/admin/users" element={<UserManagementPage />} />
</Route>
```

**Sử dụng trong Components:**

```jsx
import { ROLE } from '@/common/constants/roles';
import { useSelector } from 'react-redux';

const MyComponent = () => {
  const user = useSelector((state) => state.user.user);
  const { role, permissions } = user;
  
  // ✅ Good - sử dụng ROLE constants
  if (role === ROLE.ADMIN) {
    return <AdminOnlyContent />;
  }
  
  if (role === ROLE.STAFF && permissions?.includes("MANAGE_USER")) {
    return <StaffWithPermissionContent />;
  }
  
  // ❌ Avoid - hardcoded numbers
  if (role === 0) {
    return <AdminOnlyContent />;
  }
  
  return <DefaultContent />;
};
```

**Permissions cho Staff:**

- `VIEW_REPORT`: Xem báo cáo và Dashboard
- `MANAGE_USER`: Quản lý người dùng
- `MANAGE_STAFF`: Quản lý nhân viên
- `MANAGE_ACTIVITIES`: Quản lý hoạt động
- `MANAGE_CLUBS`: Quản lý câu lạc bộ
- `MANAGE_CLASSES`: Quản lý lớp học
- `MANAGE_REWARDS`: Quản lý điểm thưởng
- `MANAGE_ANNOUNCEMENTS`: Quản lý thông báo
- `MODERATE_CONTENT`: Kiểm duyệt nội dung

## Best Practices

### 1. Component Naming
- Sử dụng PascalCase cho component names
- Sử dụng descriptive names: `UserProfileCard` thay vì `Card`

### 2. Props
- Sử dụng destructuring cho props
- Validate props với PropTypes nếu cần

### 3. Event Handlers
- Prefix với `handle`: `handleClick`, `handleSubmit`
- Sử dụng arrow functions cho inline handlers

### 4. Dependencies
- Luôn include dependencies trong useEffect
- Sử dụng empty array `[]` cho effects chỉ chạy một lần

### 5. Performance
- Tránh unnecessary re-renders
- Sử dụng `useRef` cho stable references
- Tránh creating objects/functions trong render

## Common Patterns

### 1. Data Fetching Pattern

```jsx
const MyComponent = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiCall();
        setData(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (loading) return <LoadingCard />;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{/* Render data */}</div>;
};
```

### 2. Form Pattern

```jsx
const MyForm = () => {
  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await executeApiCall(apiMethod, [formData], { setLoading });
      toast.success('Success message');
    } catch (error) {
      toast.error('Error message');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <LoadingButton loading={loading} type="submit">
        Submit
      </LoadingButton>
    </form>
  );
};
```

## Troubleshooting

### 1. Infinite API Calls
- Kiểm tra useEffect dependencies
- Sử dụng `useRef` cho stable function references
- Tránh creating functions trong render

### 2. Loading States Not Working
- Đảm bảo `setLoading` được gọi đúng cách
- Kiểm tra `executeApiCall` parameters
- Verify loading state trong component

### 3. Toast Not Showing
- Kiểm tra `ToastContainer` trong App.jsx
- Verify toast method calls
- Check console for errors

## Tools và Utilities

### 1. executeApiCall
Centralized API call utility với loading và error handling.

### 2. useToast
Custom hook cho toast notifications với predefined messages.

### 3. Loading Components
- `LoadingOverlay`: Full screen loading
- `LoadingCard`: Card with loading state
- `LoadingButton`: Button with loading state

### 4. Message System
Centralized messages organized by module trong `src/common/constants/messages/`.

## Code Review Checklist

- [ ] Component follows naming conventions
- [ ] State management is correct
- [ ] API calls use executeApiCall
- [ ] Error handling with toast notifications
- [ ] Loading states implemented
- [ ] No hardcoded strings (use messages)
- [ ] No hardcoded role numbers (use ROLE constants)
- [ ] Role checks use ROLE constants instead of numbers
- [ ] Staff permissions are checked correctly
- [ ] useEffect dependencies are correct
- [ ] No infinite loops
- [ ] Performance optimizations applied
- [ ] Code is readable and maintainable

## 🤖 AI Tournament Schedule Generation

### Tổng quan

Component `AISchedule.jsx` cho phép admin/teacher tạo lịch thi đấu tự động cho hội thao sử dụng AI, với khả năng tối ưu hóa để tránh conflicts với lịch học và các hoạt động khác.

### Component Structure

```jsx
AISchedule.jsx
├── Form Input (Collapsible)
│   ├── Sport Selection
│   ├── Class Groups Selection (multi-select)
│   ├── Date Range (startDate, endDate)
│   ├── Time Settings (matchDuration, preferredStartTime, preferredEndTime)
│   ├── Locations (availableLocations)
│   ├── Tournament Settings (maxMatchesPerDay, minGapBetweenMatches, tournamentFormat)
│   └── User Notes (userNotes - ghi chú cho AI)
├── AI Output Tab
│   ├── List View / Bracket View
│   ├── Editable Match Fields
│   └── Apply Schedule Button
└── Official Match Management Tab
    ├── Bracket Viewer (zoom/pan)
    ├── Match Results Input
    └── Match Status Management
```

### Flow xử lý

#### 1. Generate Schedule

```jsx
const handleGenerate = async () => {
  // 1. Validate input
  if (!formData.sportId || formData.classGroupIds.length < 2) {
    toast.error("Vui lòng chọn môn thể thao và ít nhất 2 lớp")
    return
  }
  
  // 2. Upload timetable nếu có (trước khi generate)
  if (timetableFile && !timetableUploaded) {
    await timetableService.importTimetable(...)
  }
  
  // 3. Format request data
  const requestData = {
    activityId: parseInt(params.id),
    sportId: formData.sportId,
    classGroupIds: formData.classGroupIds,
    startDate: formData.startDate,
    endDate: formData.endDate,
    matchDuration: parseTime(formData.matchDuration), // "HH:mm:ss"
    preferredStartTime: parseTime(formData.preferredStartTime),
    preferredEndTime: parseTime(formData.preferredEndTime),
    availableLocations: formData.availableLocations,
    maxMatchesPerDay: formData.maxMatchesPerDay,
    minGapBetweenMatches: formData.minGapBetweenMatches,
    tournamentFormat: formData.tournamentFormat,
    userNotes: formData.userNotes || null,
  }
  
  // 4. Call API
  const response = await activityService.generateTournamentSchedule(
    params.id, 
    requestData, 
    token
  )
  
  // 5. Format response for display
  if (response?.data?.success) {
    const formattedSchedule = formatScheduleForDisplay(response.data)
    setGeneratedSchedule(formattedSchedule)
    setEditedMatches(buildEditedMatchMap(response.data.generatedMatches))
    setIsFormCollapsed(true)
    toast.success("AI đã tạo lịch thi đấu tối ưu cho bạn")
  }
}
```

**Lưu ý quan trọng:**
- ✅ Phải upload timetable trước khi generate (nếu có file)
- ✅ Time format: "HH:mm:ss" (ví dụ: "08:00:00")
- ✅ ClassGroupIds phải là array of numbers
- ✅ availableLocations phải là array of strings (không rỗng)

#### 2. Format Schedule for Display

```jsx
const formatScheduleForDisplay = (apiResponse) => {
  // 1. Group matches by date
  const matchesByDate = {}
  matches.forEach(match => {
    const date = match.matchDate.split("T")[0]
    if (!matchesByDate[date]) {
      matchesByDate[date] = []
    }
    matchesByDate[date].push(match)
  })
  
  // 2. Build match info (previous matches, next match)
  // 3. Format teams text:
  //    - "Class1 vs Class2" nếu có đủ 2 lớp
  //    - "Thắng trận #X vs Thắng trận #Y" nếu là vòng sau
  //    - "Class1 vs Chờ kết quả vòng trước" nếu thiếu 1 lớp
  
  // 4. Return formatted schedule
  return {
    days: [...], // Array of { date, events: [...] }
    stats: { totalEvents, totalDays, ... },
    rawData: apiResponse // Keep raw data for applying
  }
}
```

**Vấn đề hiện tại:**
- ⚠️ Format teams text phức tạp, có thể miss edge cases
- ⚠️ NextMatchId mapping có thể sai nếu MatchNumber bị đánh lại ở backend

#### 3. Apply Schedule

```jsx
const handleApplySchedule = async () => {
  // 1. Build matches payload từ editedMatches
  const matchesPayload = buildMatchesPayload()
  
  // 2. Validate: tất cả matches phải có location
  const invalidLocation = matchesPayload.find(
    (m) => !m.location || m.location.trim().length === 0
  )
  if (invalidLocation) {
    toast.error(`Vui lòng nhập sân thi đấu cho tất cả trận`)
    return
  }
  
  // 3. Show confirmation dialog
  setPendingPayload({ matches: matchesPayload, isPublished: publishSchedule })
  setConfirmDialogOpen(true)
}

const doApplySchedule = async () => {
  // 4. Call API
  await activityService.applyTournamentSchedule(
    params.id, 
    pendingPayload, 
    token
  )
  
  // 5. Handle conflicts (HTTP 409)
  if (error?.statusCode === 409) {
    const conflicts = error?.data?.data?.conflicts || []
    toast.error("Phát hiện xung đột lịch thi đấu, vui lòng xem chi tiết và điều chỉnh.")
    // TODO: Hiển thị conflicts chi tiết cho user
  }
  
  // 6. Reload data
  await loadActivity()
  await fetchOfficialBracket(formData.sportId)
  setActiveTab("match")
}
```

**Lưu ý quan trọng:**
- ✅ Phải validate location cho tất cả matches
- ✅ Handle HTTP 409 (conflicts) properly
- ✅ Reload official bracket sau khi apply thành công

### Các vấn đề và Logic chưa hợp lý

#### 🔴 Vấn đề nghiêm trọng

1. **Conflict handling chưa đầy đủ**
   - Khi có conflicts (HTTP 409), chỉ hiển thị toast error
   - Không hiển thị chi tiết conflicts để user điều chỉnh
   - **Giải pháp:** Cần tạo UI để hiển thị conflicts chi tiết (match nào, conflict với gì, etc.)

2. **Time format inconsistency**
   - Frontend dùng "HH:mm" (ví dụ: "08:00")
   - Backend expect "HH:mm:ss" (ví dụ: "08:00:00")
   - Có thể gây lỗi nếu parse sai
   - **Giải pháp:** Tạo utility function để normalize time format

3. **ClassGroupIds validation**
   - Chỉ check length >= 2, không check:
     - ClassGroupIds có thuộc niên khóa hiện tại không
     - ClassGroupIds có đăng ký tham gia activity không
   - **Giải pháp:** Backend sẽ filter, nhưng frontend nên validate sớm để UX tốt hơn

#### ⚠️ Vấn đề cần cải thiện

4. **Edited matches state management**
   - `editedMatches` là object với key = matchNumber
   - Có thể miss updates nếu matchNumber thay đổi
   - **Giải pháp:** Dùng matchId thay vì matchNumber làm key

5. **Loading states chưa đầy đủ**
   - Chỉ có `isGenerating`, không có loading state cho apply
   - Không có loading state cho fetch official bracket
   - **Giải pháp:** Thêm loading states cho tất cả async operations

6. **Error messages chưa user-friendly**
   - Một số error messages quá technical
   - Không có hướng dẫn cụ thể để fix
   - **Giải pháp:** Cải thiện error messages với hướng dẫn rõ ràng

7. **Timetable upload flow**
   - Upload timetable trước khi generate có thể mất thời gian
   - Không có progress indicator
   - **Giải pháp:** Thêm progress indicator và cho phép skip nếu không cần

### Best Practices

#### 1. Validate input đầy đủ

```jsx
const validateFormData = () => {
  const errors = []
  
  if (!formData.sportId) {
    errors.push("Vui lòng chọn môn thể thao")
  }
  
  if (formData.classGroupIds.length < 2) {
    errors.push("Cần ít nhất 2 lớp để tạo lịch thi đấu")
  }
  
  if (!formData.startDate || !formData.endDate) {
    errors.push("Vui lòng chọn ngày bắt đầu và kết thúc")
  }
  
  if (formData.startDate > formData.endDate) {
    errors.push("Ngày bắt đầu phải trước ngày kết thúc")
  }
  
  // Validate locations
  if (formData.availableLocations.length === 0) {
    errors.push("Vui lòng nhập ít nhất 1 sân thi đấu")
  }
  
  return errors
}
```

#### 2. Normalize time format

```jsx
const normalizeTimeForBackend = (timeStr) => {
  if (!timeStr) return null
  const [hours, minutes] = timeStr.split(":").map(Number)
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`
}

const normalizeTimeForDisplay = (timeStr) => {
  if (!timeStr) return "00:00"
  return timeStr.split(":").slice(0, 2).join(":")
}
```

#### 3. Handle conflicts properly

```jsx
const handleApplyError = (error) => {
  const status = error?.statusCode ?? error?.status ?? error?.response?.status
  
  if (status === 409) {
    const conflicts = error?.data?.data?.conflicts || []
    
    // Hiển thị conflicts chi tiết
    setConflicts(conflicts)
    setShowConflictDialog(true)
    
    toast.error(
      `Phát hiện ${conflicts.length} xung đột lịch thi đấu. Vui lòng xem chi tiết và điều chỉnh.`
    )
  } else {
    toast.error(error?.message || "Có lỗi xảy ra khi áp dụng lịch thi đấu")
  }
}
```

#### 4. Loading states

```jsx
const [loadingStates, setLoadingStates] = useState({
  generating: false,
  applying: false,
  loadingBracket: false,
  uploadingTimetable: false,
})

// Update loading state
setLoadingStates(prev => ({ ...prev, generating: true }))
```

### Code Review Checklist

- [ ] Input validation đầy đủ (sportId, classGroupIds, dates, locations)
- [ ] Time format được normalize đúng (HH:mm:ss cho backend, HH:mm cho display)
- [ ] Conflict handling có UI hiển thị chi tiết
- [ ] Loading states cho tất cả async operations
- [ ] Error messages user-friendly với hướng dẫn cụ thể
- [ ] Edited matches state management đúng (dùng matchId làm key)
- [ ] Timetable upload flow có progress indicator
- [ ] Reload official bracket sau khi apply thành công