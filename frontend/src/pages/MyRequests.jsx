import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { PlusCircle } from "lucide-react";
import { fetchMyRequests, updateRequestStatus } from "../features/bloodRequest/bloodRequestSlice";
import RequestCard from "../components/RequestCard";

export default function MyRequests() {
  const dispatch = useDispatch();
  const { myRequests, loading } = useSelector((state) => state.bloodRequest);

  useEffect(() => {
    dispatch(fetchMyRequests());
  }, [dispatch]);

  const handleUpdateStatus = (id, status) => {
    dispatch(updateRequestStatus({ id, status }));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Blood Requests</h1>
          <p className="mt-1 text-slate-500">Track and manage requests you've created.</p>
        </div>
        <Link to="/request-blood" className="btn-primary">
          <PlusCircle className="h-4 w-4" />
          New Request
        </Link>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading your requests…</p>
      ) : myRequests.length === 0 ? (
        <div className="card text-center text-slate-500">
          You haven't created any blood requests yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {myRequests.map((r) => (
            <RequestCard key={r._id} request={r} showActions onUpdateStatus={handleUpdateStatus} />
          ))}
        </div>
      )}
    </div>
  );
}
