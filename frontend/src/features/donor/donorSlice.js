import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

const initialState = {
  donors: [],
  loading: false,
  error: null,
};

export const searchDonors = createAsyncThunk(
  "donor/search",
  async ({ bloodType, city } = {}, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/users/donors", {
        params: { bloodType, city },
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to search donors");
    }
  }
);

const donorSlice = createSlice({
  name: "donor",
  initialState,
  reducers: {
    clearDonors: (state) => {
      state.donors = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchDonors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchDonors.fulfilled, (state, action) => {
        state.loading = false;
        state.donors = action.payload.donors;
      })
      .addCase(searchDonors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearDonors } = donorSlice.actions;
export default donorSlice.reducer;
