import { Phone, MapPin, Droplet } from "lucide-react";
import toast from "react-hot-toast";

export default function DonorCard({ donor }) {
  const handleContact = () => {
    if (donor.phone) {
      window.location.href = `tel:${donor.phone}`;
    } else {
      toast.error("This donor has no contact number on file.");
    }
  };

  return (
    <div className="card flex flex-col gap-4 transition duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-slate-900">{donor.name}</h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
            <MapPin className="h-3.5 w-3.5" />
            {donor.location?.city}, {donor.location?.state}
          </p>
        </div>
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-crimson-600 to-crimson-400 font-bold text-white shadow-md">
          {donor.bloodType}
        </span>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
        <span
          className={`flex items-center gap-1 text-xs font-medium ${
            donor.isAvailable ? "text-emerald-600" : "text-slate-400"
          }`}
        >
          <Droplet className="h-3.5 w-3.5" fill="currentColor" />
          {donor.isAvailable ? "Available now" : "Currently unavailable"}
        </span>
        <button onClick={handleContact} className="btn-primary !px-3 !py-1.5 text-xs">
          <Phone className="h-3.5 w-3.5" />
          Contact
        </button>
      </div>
    </div>
  );
}
