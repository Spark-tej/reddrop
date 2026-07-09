import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Toaster } from "react-hot-toast";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import DonorSearch from "./pages/DonorSearch";
import RequestBloodForm from "./pages/RequestBloodForm";
import MyRequests from "./pages/MyRequests";
import AllRequests from "./pages/AllRequests";
import NotFound from "./pages/NotFound";

import { fetchCurrentUser } from "./features/auth/authSlice";

export default function App() {
  const dispatch = useDispatch();

  // Restore session on app load if a token exists.
  useEffect(() => {
    const token = localStorage.getItem("reddrop_token");
    if (token) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch]);

  return (
    <div className="flex min-h-screen flex-col">
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
      <Navbar />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/search-donors" element={<DonorSearch />} />
          <Route path="/requests" element={<AllRequests />} />

          {/* Authenticated routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/request-blood" element={<RequestBloodForm />} />
            <Route path="/my-requests" element={<MyRequests />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
