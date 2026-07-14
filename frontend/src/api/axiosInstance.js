import axios from "axios";

const isLocalDevelopment =
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname === "localhost";

// VITE_API_URL is the deployment-time override. The Render URL is retained as
// a production fallback so a missing Vercel environment variable never sends
// browser requests to Vercel's own /api route.
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  (isLocalDevelopment
    ? "http://localhost:5000/api"
    : "https://reddrop-yr8u.onrender.com/api");

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
