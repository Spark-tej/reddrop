import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Droplet, HeartPulse, Users, Search } from "lucide-react";
import { fetchAllRequests } from "../features/bloodRequest/bloodRequestSlice";
import RequestCard from "../components/RequestCard";

const stats = [
  { label: "Lives Impacted", value: 12480, icon: HeartPulse },
  { label: "Registered Donors", value: 5230, icon: Users },
  { label: "Pints Collected", value: 9860, icon: Droplet },
];

function useCountUp(target, durationMs = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start;
    let frame;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / durationMs, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs]);
  return value;
}

function StatCard({ stat }) {
  const count = useCountUp(stat.value);
  const Icon = stat.icon;
  return (
    <div className="card flex items-center gap-4">
      <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-crimson-50 text-crimson-600">
        <Icon className="h-6 w-6" />
      </span>
      <div>
        <p className="text-2xl font-extrabold text-slate-900">{count.toLocaleString()}+</p>
        <p className="text-sm text-slate-500">{stat.label}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const dispatch = useDispatch();
  const { requests, loading } = useSelector((state) => state.bloodRequest);

  useEffect(() => {
    dispatch(fetchAllRequests({ urgency: "Urgent", status: "Open" }));
  }, [dispatch]);

  const urgentRequests = requests.filter((r) => r.urgency === "Urgent" && r.status === "Open").slice(0, 3);

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(220,38,38,0.16),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(248,113,113,0.14),_transparent_30%)]" />
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-28">
          <div className="relative z-10 text-center lg:text-left">
            <span className="badge-urgent mb-4 inline-flex">Premium blood access for urgent needs</span>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Donate blood.
              <span className="block text-crimson-600">Save lives faster.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600 lg:mx-0">
              RedDrop brings donors, hospitals, and urgent requests together in one calm, secure experience for modern care.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <Link to="/register" className="btn-primary px-8 py-3 text-base">
                <Droplet className="h-5 w-5" fill="white" />
                Become a donor
              </Link>
              <Link to="/requests" className="btn-secondary px-8 py-3 text-base">
                Request blood
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <div className="rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur">24/7 donor matching</div>
              <div className="rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur">Secure healthcare coordination</div>
            </div>
          </div>

          <div className="relative z-10">
            <div className="glass-panel overflow-hidden p-6 sm:p-8">
              <div className="rounded-[2rem] border border-crimson-100 bg-gradient-to-br from-crimson-50 via-white to-rose-50 p-6 shadow-inner">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-crimson-600">This week</p>
                    <h2 className="mt-2 text-3xl font-bold text-slate-900">1,284 lives supported</h2>
                  </div>
                  <div className="rounded-2xl bg-crimson-600 p-3 text-white shadow-lg shadow-crimson-200">
                    <HeartPulse className="h-7 w-7" />
                  </div>
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {stats.map((s) => (
                    <div key={s.label} className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm">
                      <p className="text-sm text-slate-500">{s.label}</p>
                      <p className="mt-1 text-xl font-bold text-slate-900">{s.value.toLocaleString()}+</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {stats.map((s) => (
            <StatCard key={s.label} stat={s} />
          ))}
        </div>
      </section>

      {/* Urgent Requests */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Urgent Requests Near You</h2>
            <Link to="/requests" className="text-sm font-semibold text-crimson-600 hover:underline">
              View all
            </Link>
          </div>

          {loading ? (
            <p className="text-slate-500">Loading urgent requests…</p>
          ) : urgentRequests.length === 0 ? (
            <div className="card text-center text-slate-500">
              No urgent requests at the moment. Check back soon.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {urgentRequests.map((r) => (
                <RequestCard key={r._id} request={r} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="card flex flex-col items-center gap-4 bg-crimson-600 text-center text-white sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h3 className="text-xl font-bold">Looking for a donor nearby?</h3>
            <p className="mt-1 text-crimson-100">Search by blood type and city to find available donors instantly.</p>
          </div>
          <Link
            to="/search-donors"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-crimson-700 transition hover:bg-crimson-50"
          >
            <Search className="h-4 w-4" />
            Search Donors
          </Link>
        </div>
      </section>
    </div>
  );
}
