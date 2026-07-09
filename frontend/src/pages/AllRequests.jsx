import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Filter } from "lucide-react";
import { fetchAllRequests } from "../features/bloodRequest/bloodRequestSlice";
import RequestCard from "../components/RequestCard";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function AllRequests() {
  const [bloodType, setBloodType] = useState("");
  const [city, setCity] = useState("");
  const dispatch = useDispatch();
  const { requests, loading } = useSelector((state) => state.bloodRequest);

  useEffect(() => {
    dispatch(fetchAllRequests({ status: "Open" }));
  }, [dispatch]);

  const handleFilter = (e) => {
    e.preventDefault();
    dispatch(fetchAllRequests({ status: "Open", bloodType, city }));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Active Blood Requests</h1>
        <p className="mt-1 text-slate-500">Browse open requests and reach out if you can help.</p>
      </div>

      <form onSubmit={handleFilter} className="card mx-auto mb-10 flex max-w-2xl flex-col gap-3 sm:flex-row">
        <select className="input-field sm:w-40" value={bloodType} onChange={(e) => setBloodType(e.target.value)}>
          <option value="">Any blood type</option>
          {BLOOD_TYPES.map((bt) => (
            <option key={bt} value={bt}>{bt}</option>
          ))}
        </select>
        <input
          className="input-field flex-1"
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button type="submit" className="btn-primary">
          <Filter className="h-4 w-4" />
          Filter
        </button>
      </form>

      {loading ? (
        <p className="text-center text-slate-500">Loading requests…</p>
      ) : requests.length === 0 ? (
        <div className="card mx-auto max-w-md text-center text-slate-500">No open requests match your filters.</div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {requests.map((r) => (
            <RequestCard key={r._id} request={r} />
          ))}
        </div>
      )}
    </div>
  );
}
