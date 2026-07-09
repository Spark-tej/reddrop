import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Send } from "lucide-react";
import toast from "react-hot-toast";
import { createBloodRequest, clearRequestError } from "../features/bloodRequest/bloodRequestSlice";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const initialForm = {
  patientName: "",
  bloodType: "",
  unitsRequired: 1,
  hospitalName: "",
  city: "",
  urgency: "Normal",
  requiredByDate: "",
  contactPerson: "",
};

export default function RequestBloodForm() {
  const [form, setForm] = useState(initialForm);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.bloodRequest);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearRequestError());
    }
  }, [error, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === "unitsRequired" ? Number(value) : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(createBloodRequest(form));
    if (createBloodRequest.fulfilled.match(result)) {
      toast.success("Blood request created!");
      navigate("/my-requests");
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Request Blood</h1>
        <p className="mt-1 text-slate-500">Fill in the details so nearby donors can respond quickly.</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="patientName">Patient name</label>
            <input id="patientName" name="patientName" required className="input-field" value={form.patientName} onChange={handleChange} />
          </div>
          <div>
            <label className="label" htmlFor="bloodType">Blood type needed</label>
            <select id="bloodType" name="bloodType" required className="input-field" value={form.bloodType} onChange={handleChange}>
              <option value="">Select</option>
              {BLOOD_TYPES.map((bt) => (
                <option key={bt} value={bt}>{bt}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="unitsRequired">Units required</label>
            <input
              id="unitsRequired"
              name="unitsRequired"
              type="number"
              min={1}
              required
              className="input-field"
              value={form.unitsRequired}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="label" htmlFor="urgency">Urgency level</label>
            <select id="urgency" name="urgency" className="input-field" value={form.urgency} onChange={handleChange}>
              <option value="Normal">Normal</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
        </div>

        <div>
          <label className="label" htmlFor="hospitalName">Hospital name</label>
          <input id="hospitalName" name="hospitalName" required className="input-field" value={form.hospitalName} onChange={handleChange} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="city">City</label>
            <input id="city" name="city" required className="input-field" value={form.city} onChange={handleChange} />
          </div>
          <div>
            <label className="label" htmlFor="requiredByDate">Required by</label>
            <input
              id="requiredByDate"
              name="requiredByDate"
              type="date"
              required
              className="input-field"
              value={form.requiredByDate}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="contactPerson">Contact person &amp; number</label>
          <input
            id="contactPerson"
            name="contactPerson"
            required
            placeholder="e.g. Jane Doe, +1 555-0100"
            className="input-field"
            value={form.contactPerson}
            onChange={handleChange}
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          <Send className="h-4 w-4" />
          {loading ? "Submitting…" : "Submit Request"}
        </button>
      </form>
    </div>
  );
}
