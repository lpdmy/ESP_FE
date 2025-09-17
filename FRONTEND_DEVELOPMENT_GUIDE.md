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
- [ ] useEffect dependencies are correct
- [ ] No infinite loops
- [ ] Performance optimizations applied
- [ ] Code is readable and maintainable
