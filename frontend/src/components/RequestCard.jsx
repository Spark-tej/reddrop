import { MapPin, User, Droplet, Calendar } from "lucide-react";

export default function RequestCard({ request, showActions = false, onUpdateStatus }) {
  const isUrgent = request.urgency === "Urgent";

  return (
    <div className="card flex flex-col gap-3 transition duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <span className={isUrgent ? "badge-urgent" : "badge-normal"}>{request.urgency}</span>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-crimson-600 to-crimson-400 text-sm font-bold text-white shadow-md">
          {request.bloodType}
        </span>
      </div>

      <div>
        <h3 className="font-bold text-slate-900">{request.patientName}</h3>
        <p className="text-sm text-slate-500">{request.hospitalName}</p>
      </div>

      <div className="space-y-1.5 text-sm text-slate-500">
        <p className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" /> {request.city}
        </p>
        <p className="flex items-center gap-1.5">
          <Droplet className="h-3.5 w-3.5" /> {request.unitsRequired} units required
        </p>
        {request.requiredByDate && (
          <p className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            Needed by {new Date(request.requiredByDate).toLocaleDateString()}
          </p>
        )}
        {request.contactPerson && (
          <p className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" /> {request.contactPerson}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
        <span
          className={`text-xs font-semibold uppercase tracking-wide ${
            request.status === "Open"
              ? "text-emerald-600"
              : request.status === "Fulfilled"
              ? "text-slate-400"
              : "text-amber-600"
          }`}
        >
          {request.status}
        </span>

        {showActions && request.status === "Open" && (
          <div className="flex gap-2">
            <button
              onClick={() => onUpdateStatus(request._id, "Fulfilled")}
              className="text-xs font-semibold text-emerald-600 hover:underline"
            >
              Mark Fulfilled
            </button>
            <button
              onClick={() => onUpdateStatus(request._id, "Expired")}
              className="text-xs font-semibold text-slate-400 hover:underline"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
