import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { PlusCircle, CalendarPlus, MapPin } from "lucide-react";
import { fetchMyRequests, fetchAllRequests } from "../features/bloodRequest/bloodRequestSlice";
import EligibilityCard from "../components/EligibilityCard";
import RequestCard from "../components/RequestCard";

export default function Dashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { myRequests, requests, loading } = useSelector((state) => state.bloodRequest);

  useEffect(() => {
    dispatch(fetchMyRequests());
    dispatch(fetchAllRequests({ city: user?.location?.city, status: "Open" }));
  }, [dispatch, user]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name?.split(" ")[0]} 👋</h1>
        <p className="mt-1 text-slate-500">Here's your donation status and activity.</p>
      </div>

      <div className="mb-8">
        <EligibilityCard lastDonationDate={user?.lastDonationDate} />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link to="/request-blood" className="card flex items-center gap-4 transition hover:shadow-md">
          <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-crimson-50 text-crimson-600">
            <PlusCircle className="h-6 w-6" />
          </span>
          <div>
            <h3 className="font-semibold text-slate-900">Create a Blood Request</h3>
            <p className="text-sm text-slate-500">Need blood for yourself or someone else?</p>
          </div>
        </Link>
        <Link to="/search-donors" className="card flex items-center gap-4 transition hover:shadow-md">
          <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-crimson-50 text-crimson-600">
            <CalendarPlus className="h-6 w-6" />
          </span>
          <div>
            <h3 className="font-semibold text-slate-900">Schedule a Donation</h3>
            <p className="text-sm text-slate-500">Find a nearby drive or donor request.</p>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* My Requests */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">My Requests</h2>
            <Link to="/my-requests" className="text-sm font-semibold text-crimson-600 hover:underline">
              View all
            </Link>
          </div>
          {myRequests.length === 0 ? (
            <div className="card text-center text-sm text-slate-500">You haven't created any requests yet.</div>
          ) : (
            <div className="space-y-4">
              {myRequests.slice(0, 3).map((r) => (
                <RequestCard key={r._id} request={r} />
              ))}
            </div>
          )}
        </section>

        {/* Nearby Urgent Requests */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-crimson-600" />
            <h2 className="text-lg font-bold text-slate-900">Active Requests Near You</h2>
          </div>
          {loading ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : requests.length === 0 ? (
            <div className="card text-center text-sm text-slate-500">No active requests nearby right now.</div>
          ) : (
            <div className="space-y-4">
              {requests.slice(0, 3).map((r) => (
                <RequestCard key={r._id} request={r} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
