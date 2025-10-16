// API Keys and Configuration
export const API_KEYS = {
  GIPHY_API_KEY: import.meta.env.VITE_GIPHY_API_KEY || 'your_giphy_api_key_here',
  GIPHY_BASE_URL: import.meta.env.VITE_GIPHY_BASE_URL || 'https://api.giphy.com/v1'
};

// Fallback API key for development (replace with your actual key)
export const FALLBACK_GIPHY_API_KEY = 'your_actual_giphy_api_key_here';
