import axios from 'axios';

/**
 * Shared Axios instance for the entire frontend.
 *
 * Local dev  → Vite proxy forwards /api/* to http://localhost:5000
 * Netlify    → Set VITE_API_URL=https://your-backend.vercel.app in Netlify env vars
 */
// Use the VITE_API_URL environment variable if set, otherwise fallback to '/api'.
// In development, Vite's proxy targets http://localhost:5000 if using '/api'.
// In production, netlify.toml's proxy routes it to the Vercel backend.
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 30000,
});

// Attach JWT from localStorage on every request
api.interceptors.request.use((config) => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.accessToken) {
      config.headers.Authorization = `Bearer ${user.accessToken}`;
    }
  } catch {
    /* ignore parse errors */
  }
  return config;
});

// Global 401 handler — auto-logout when token expires
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
