import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Droplet, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import { registerUser, sendRegisterOtp, verifyRegisterOtp, clearAuthError } from "../features/auth/authSlice";
import OTPModal from "../components/OTPModal";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const initialForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
  bloodType: "",
  city: "",
  state: "",
  lastDonationDate: "",
};

export default function Register() {
  const [form, setForm] = useState(initialForm);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard");
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAuthError());
    }
  }, [error, dispatch]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      email: form.email,
      password: form.password,
      phone: form.phone,
      bloodType: form.bloodType,
      location: { city: form.city, state: form.state },
      lastDonationDate: form.lastDonationDate || null,
    };
    // start OTP flow
    setPendingPayload(payload);
    setDemoOtp(null);
    setOtpVisible(true);
    try {
      const response = await dispatch(sendRegisterOtp({ email: form.email })).unwrap();
      setDemoOtp(response.demoCode || null);
      toast.success("OTP sent to your email");
    } catch (err) {
      toast.error(err || "Failed to send OTP");
      setOtpVisible(false);
    }
  };

  const [pendingPayload, setPendingPayload] = useState(null);
  const [otpVisible, setOtpVisible] = useState(false);
  const [demoOtp, setDemoOtp] = useState(null);

  const handleVerify = async (code) => {
    try {
      const result = await dispatch(verifyRegisterOtp({ email: form.email, code, payload: pendingPayload })).unwrap();
      toast.success("Account verified and created");
      setOtpVisible(false);
    } catch (err) {
      toast.error(err || "Verification failed");
    }
  };

  const handleResend = async () => {
    try {
      const response = await dispatch(sendRegisterOtp({ email: form.email })).unwrap();
      setDemoOtp(response.demoCode || null);
      toast.success("OTP resent");
    } catch (err) {
      toast.error(err || "Failed to resend OTP");
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-crimson-600 to-crimson-400 shadow-lg shadow-crimson-200">
            <Droplet className="h-7 w-7 text-white" fill="white" />
          </span>
          <h1 className="mt-4 text-3xl font-bold text-slate-900">Create your RedDrop account</h1>
          <p className="mt-2 text-center text-sm text-slate-500">
            Join thousands of donors and recipients in a premium, secure healthcare network.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="name">Full name</label>
              <input id="name" name="name" required className="input-field" value={form.name} onChange={handleChange} />
            </div>
            <div>
              <label className="label" htmlFor="email">Email address</label>
              <input id="email" name="email" type="email" required className="input-field" value={form.email} onChange={handleChange} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="password">Password</label>
              <input id="password" name="password" type="password" required minLength={6} className="input-field" value={form.password} onChange={handleChange} />
            </div>
            <div>
              <label className="label" htmlFor="phone">Phone number</label>
              <input id="phone" name="phone" required className="input-field" value={form.phone} onChange={handleChange} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="label" htmlFor="bloodType">Blood type</label>
              <select id="bloodType" name="bloodType" required className="input-field" value={form.bloodType} onChange={handleChange}>
                <option value="">Select</option>
                {BLOOD_TYPES.map((bt) => (
                  <option key={bt} value={bt}>{bt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="city">City</label>
              <input id="city" name="city" required className="input-field" value={form.city} onChange={handleChange} />
            </div>
            <div>
              <label className="label" htmlFor="state">State</label>
              <input id="state" name="state" required className="input-field" value={form.state} onChange={handleChange} />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="lastDonationDate">Last donation date (optional)</label>
            <input
              id="lastDonationDate"
              name="lastDonationDate"
              type="date"
              className="input-field"
              value={form.lastDonationDate}
              onChange={handleChange}
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            <UserPlus className="h-4 w-4" />
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <OTPModal
          email={form.email}
          visible={otpVisible}
          demoCode={demoOtp}
          onClose={() => setOtpVisible(false)}
          onVerify={handleVerify}
          onResend={handleResend}
        />

        <p className="mt-5 text-center text-sm text-slate-500">
          Already registered?{" "}
          <Link to="/login" className="font-semibold text-crimson-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
