import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

const storedUser = localStorage.getItem("reddrop_user");
const storedToken = localStorage.getItem("reddrop_token");

const initialState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,
  isAuthenticated: Boolean(storedToken),
  loading: false,
  error: null,
};

// --- Async Thunks ---

export const registerUser = createAsyncThunk(
  "auth/register",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/auth/register", formData);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Registration failed");
    }
  }
);

export const sendRegisterOtp = createAsyncThunk(
  "auth/sendRegisterOtp",
  async ({ email }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/auth/send-register-otp", { email });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to send OTP");
    }
  }
);

export const verifyRegisterOtp = createAsyncThunk(
  "auth/verifyRegisterOtp",
  async ({ email, code, payload }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/auth/verify-register-otp", { email, code, payload });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "OTP verification failed");
    }
  }
);

export const sendResetOtp = createAsyncThunk(
  "auth/sendResetOtp",
  async ({ email }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/auth/send-reset-otp", { email });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to send OTP");
    }
  }
);

export const verifyResetOtp = createAsyncThunk(
  "auth/verifyResetOtp",
  async ({ email, code }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/auth/verify-reset-otp", { email, code });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "OTP verification failed");
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/auth/reset-password", { email, password });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Password reset failed");
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/auth/login", credentials);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  "auth/me",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/auth/me");
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Session expired");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("reddrop_token");
      localStorage.removeItem("reddrop_user");
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        localStorage.setItem("reddrop_token", action.payload.token);
        localStorage.setItem("reddrop_user", JSON.stringify(action.payload.user));
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Send Register OTP
      .addCase(sendRegisterOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendRegisterOtp.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(sendRegisterOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Verify Register OTP -> create account and sign in
      .addCase(verifyRegisterOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyRegisterOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        localStorage.setItem("reddrop_token", action.payload.token);
        localStorage.setItem("reddrop_user", JSON.stringify(action.payload.user));
      })
      .addCase(verifyRegisterOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        localStorage.setItem("reddrop_token", action.payload.token);
        localStorage.setItem("reddrop_user", JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch current user (session restore)
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        localStorage.removeItem("reddrop_token");
        localStorage.removeItem("reddrop_user");
      });

    // Password reset OTP flows
    builder
      .addCase(sendResetOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendResetOtp.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(sendResetOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(verifyResetOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyResetOtp.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(verifyResetOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
