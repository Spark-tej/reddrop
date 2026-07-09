import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search } from "lucide-react";
import { searchDonors } from "../features/donor/donorSlice";
import DonorCard from "../components/DonorCard";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function DonorSearch() {
  const [bloodType, setBloodType] = useState("");
  const [city, setCity] = useState("");
  const dispatch = useDispatch();
  const { donors, loading, error } = useSelector((state) => state.donor);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(searchDonors({ bloodType, city }));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-crimson-600 to-crimson-400 shadow-lg shadow-crimson-200">
          <Search className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Find a Donor</h1>
        <p className="mx-auto mt-2 max-w-2xl text-slate-500">Search by blood type and location to connect with nearby donors in seconds.</p>
      </div>

      <form onSubmit={handleSearch} className="glass-panel mx-auto mb-10 flex max-w-2xl flex-col gap-3 p-4 sm:flex-row">
        <select
          className="input-field sm:w-40"
          value={bloodType}
          onChange={(e) => setBloodType(e.target.value)}
        >
          <option value="">Any blood type</option>
          {BLOOD_TYPES.map((bt) => (
            <option key={bt} value={bt}>{bt}</option>
          ))}
        </select>
        <input
          className="input-field flex-1"
          placeholder="City or ZIP code"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button type="submit" className="btn-primary">
          <Search className="h-4 w-4" />
          Search
        </button>
      </form>

      {loading ? (
        <p className="text-center text-slate-500">Searching donors…</p>
      ) : error ? (
        <p className="text-center text-crimson-600">{error}</p>
      ) : donors.length === 0 ? (
        <div className="card mx-auto max-w-md text-center text-slate-500">
          No donors found yet. Try a different blood type or city.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {donors.map((donor) => (
            <DonorCard key={donor._id} donor={donor} />
          ))}
        </div>
      )}
    </div>
  );
}
