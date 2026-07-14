import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import OTPModal from "../components/OTPModal";
import { sendResetOtp, verifyResetOtp, resetPassword } from "../features/auth/authSlice";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [stage, setStage] = useState(0); // 0: enter email, 1: verify OTP, 2: reset password
  const [otpVisible, setOtpVisible] = useState(false);
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [demoOtp, setDemoOtp] = useState(null);
  const dispatch = useDispatch();

  const handleSend = async () => {
    setLoadingLocal(true);
    try {
      const response = await dispatch(sendResetOtp({ email })).unwrap();
      setDemoOtp(response.demoCode || null);
      toast.success("If this email is registered, an OTP was sent");
      setOtpVisible(true);
      setStage(1);
    } catch (err) {
      toast.error(err || "Failed to send OTP");
    } finally {
      setLoadingLocal(false);
    }
  };

  const handleVerify = async (code) => {
    try {
      await dispatch(verifyResetOtp({ email, code })).unwrap();
      toast.success("OTP verified — set a new password");
      setOtpVisible(false);
      setStage(2);
    } catch (err) {
      toast.error(err || "Invalid OTP");
    }
  };

  const handleResend = async () => {
    try {
      const response = await dispatch(sendResetOtp({ email })).unwrap();
      setDemoOtp(response.demoCode || null);
      toast.success("OTP resent");
    } catch (err) {
      toast.error(err || "Failed to resend OTP");
    }
  };

  const handleReset = async () => {
    if (newPassword.length < 6) return toast.error("Password too short");
    if (newPassword !== confirmPassword) return toast.error("Passwords do not match");
    try {
      await dispatch(resetPassword({ email, password: newPassword })).unwrap();
      toast.success("Password updated — please login");
      window.location.href = "/login";
    } catch (err) {
      toast.error(err || "Failed to reset password");
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <h2 className="text-2xl font-bold">Forgot Password</h2>
        {stage === 0 && (
          <div className="card mt-4">
            <label className="label">Enter your Registered email</label>
            <input className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button onClick={handleSend} disabled={loadingLocal} className="btn-primary mt-4">Send OTP</button>
          </div>
        )}

        {stage === 2 && (
          <div className="card mt-4">
            <label className="label">New password</label>
            <input type="password" className="input-field" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <label className="label mt-2">Confirm password</label>
            <input type="password" className="input-field" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            <button onClick={handleReset} className="btn-primary mt-4">Reset Password</button>
          </div>
        )}

        <OTPModal
          email={email}
          visible={otpVisible}
          demoCode={demoOtp}
          onClose={() => setOtpVisible(false)}
          onVerify={handleVerify}
          onResend={handleResend}
        />
      </div>
    </div>
  );
}
