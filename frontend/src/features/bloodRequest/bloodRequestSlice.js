import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

const initialState = {
  requests: [],
  myRequests: [],
  singleRequest: null,
  loading: false,
  error: null,
};

export const fetchAllRequests = createAsyncThunk(
  "bloodRequest/fetchAll",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/requests/all", { params: filters });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load requests");
    }
  }
);

export const fetchMyRequests = createAsyncThunk(
  "bloodRequest/fetchMine",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/requests/my-requests");
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load your requests");
    }
  }
);

export const createBloodRequest = createAsyncThunk(
  "bloodRequest/create",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/requests/create", payload);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create request");
    }
  }
);

export const updateRequestStatus = createAsyncThunk(
  "bloodRequest/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put(`/requests/status/${id}`, { status });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update request");
    }
  }
);

const bloodRequestSlice = createSlice({
  name: "bloodRequest",
  initialState,
  reducers: {
    clearRequestError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload.requests;
      })
      .addCase(fetchAllRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMyRequests.fulfilled, (state, action) => {
        state.myRequests = action.payload.requests;
      })
      .addCase(createBloodRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBloodRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.myRequests.unshift(action.payload.request);
        state.requests.unshift(action.payload.request);
      })
      .addCase(createBloodRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateRequestStatus.fulfilled, (state, action) => {
        const updated = action.payload.request;
        state.requests = state.requests.map((r) => (r._id === updated._id ? updated : r));
        state.myRequests = state.myRequests.map((r) => (r._id === updated._id ? updated : r));
      });
  },
});

export const { clearRequestError } = bloodRequestSlice.actions;
export default bloodRequestSlice.reducer;
