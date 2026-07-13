import axios from "axios";

// Production uses VITE_API_URL on Render; local development falls back to localhost.
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  (window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "/api");

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // allows httpOnly cookie auth if backend uses cookies
});

// Attach the JWT (if present in localStorage) to every outgoing request.
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("reddrop_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Globally handle expired/invalid sessions.
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("reddrop_token");
      localStorage.removeItem("reddrop_user");
      // Avoid a hard redirect loop if already on the login page.
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
