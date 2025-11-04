import { API_CONFIG } from "@/config/api.config";

export async function uploadImage(file) {
    if (!file) return null;

    try {
        const formData = new FormData();
        formData.append("file", file);

        const token = localStorage.getItem('token');
        
        const res = await fetch(API_CONFIG.BASE_URL + API_CONFIG.UPLOAD.UPLOAD_IMAGE, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        if (!res.ok) {
            throw new Error(`Upload failed: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        
        // Check if response has data field (success case)
        if (data.data) {
            return data.data;
        } else {
            throw new Error(data.message || 'Upload failed');
        }
    } catch (error) {
        console.error('Upload error:', error);
        throw error;
    }
}

export async function uploadFile(file) {
    if (!file) return null;

    try {
        const formData = new FormData();
        formData.append("file", file);

        const token = localStorage.getItem('token');
        
        const res = await fetch(API_CONFIG.BASE_URL + API_CONFIG.UPLOAD.UPLOAD_FILE, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        if (!res.ok) {
            throw new Error(`Upload failed: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        
        // Check if response has data field (success case)
        if (data.data) {
            return data.data;
        } else {
            throw new Error(data.message || 'Upload failed');
        }
    } catch (error) {
        console.error('Upload error:', error);
        throw error;
    }
}

// Upload multiple files
export async function uploadMultipleFiles(files) {
    if (!files || files.length === 0) return [];

    try {
        const uploadPromises = files.map(file => {
            const fileType = getFileType(file);
            if (fileType === 'image' || fileType === 'video') {
                return uploadImage(file);
            } else {
                return uploadFile(file);
            }
        });

        const results = await Promise.all(uploadPromises);
        return results.map((url, index) => ({
            url: url,
            fileType: getFileType(files[index]),
            fileName: files[index].name
        }));
    } catch (error) {
        console.error('Error uploading multiple files:', error);
        throw error;
    }
}

// Xác định loại file
export function getFileType(file) {
    const type = file.type.toLowerCase();
    
    if (type.startsWith('image/')) {
        return 'image';
    } else if (type.startsWith('video/')) {
        return 'video';
    } else if (type.includes('pdf')) {
        return 'document';
    } else if (type.includes('word') || type.includes('document')) {
        return 'document';
    } else if (type.includes('powerpoint') || type.includes('presentation')) {
        return 'document';
    } else {
        return 'other';
    }
}

// Validate file size (max 10MB)
export function validateFileSize(file, maxSizeMB = 10) {
    const maxSize = maxSizeMB * 1024 * 1024; // Convert to bytes
    return file.size <= maxSize;
}

// Validate file type
export function validateFileType(file, allowedTypes = ['image', 'video', 'document']) {
    const fileType = getFileType(file);
    return allowedTypes.includes(fileType);
}

// Format file size
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}