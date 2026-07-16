import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

export default function OTPModal({ email, visible, demoCode, onClose, onVerify, onResend }) {
  const [code, setCode] = useState("");
  const [seconds, setSeconds] = useState(60); // 1 minute
  const [resendAvailable, setResendAvailable] = useState(false);
  const [resendTimer, setResendTimer] = useState(15);

  useEffect(() => {
    if (!visible) return;
    setCode("");
    setSeconds(60);
    setResendAvailable(false);
    setResendTimer(15);
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
    setResendTimer(15);
    setResendAvailable(false);
    await onResend();
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-slate-900">Verify your email</h3>
        <p className="mt-2 text-sm text-slate-500">We emailed a verification code to <span className="font-semibold text-slate-700">{email}</span>. Please check your inbox.</p>

        {demoCode && (
          <div className="mt-4 flex items-center gap-3 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
            <p><span className="font-bold">[DEMO MODE]</span> For test purposes, your verification code is: <span className="font-bold">{demoCode}</span></p>
          </div>
        )}

        <div className="mt-4">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
            className="input-field w-full text-center text-xl tracking-wider"
            placeholder="6-Digit Verification Code *"
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
