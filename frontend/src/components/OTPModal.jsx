import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function OTPModal({ email, visible, onClose, onVerify, onResend }) {
  const [code, setCode] = useState("");
  const [seconds, setSeconds] = useState(300); // 5 minutes
  const [resendAvailable, setResendAvailable] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  useEffect(() => {
    if (!visible) return;
    setCode("");
    setSeconds(300);
    setResendAvailable(false);
    setResendTimer(60);
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const t = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const r = setInterval(() => setResendTimer((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(r);
  }, [visible]);

  useEffect(() => setResendAvailable(resendTimer === 0), [resendTimer]);

  const handleVerify = async () => {
    if (code.length !== 6) return toast.error("Enter the 6-digit code.");
    await onVerify(code);
  };

  const handleResend = async () => {
    if (!resendAvailable) return;
    setResendTimer(60);
    setResendAvailable(false);
    await onResend();
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <h3 className="text-lg font-semibold">Enter verification code</h3>
        <p className="mt-2 text-sm text-slate-500">We sent a 6-digit code to {email}.</p>

        <div className="mt-4">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
            className="input-field w-full text-center text-xl tracking-wider"
            placeholder="______"
          />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <button onClick={handleResend} disabled={!resendAvailable} className="btn-ghost">
            {resendAvailable ? "Resend code" : `Resend in ${resendTimer}s`}
          </button>
          <div className="text-sm text-slate-500">Expires in {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}</div>
        </div>

        <div className="mt-6 flex gap-2">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={handleVerify} className="btn-primary flex-1">Verify</button>
        </div>
      </div>
    </div>
  );
}
