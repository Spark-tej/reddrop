import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import bloodRequestReducer from "../features/bloodRequest/bloodRequestSlice";
import donorReducer from "../features/donor/donorSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    bloodRequest: bloodRequestReducer,
    donor: donorReducer,
  },
  devTools: import.meta.env.VITE_APP_ENV !== "production",
});

export default store;
