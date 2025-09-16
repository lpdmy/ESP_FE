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
