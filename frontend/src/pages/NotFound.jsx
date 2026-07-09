import { Link } from "react-router-dom";
import { Droplet } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <Droplet className="h-12 w-12 text-crimson-300" />
      <h1 className="mt-4 text-3xl font-extrabold text-slate-900">404 — Page not found</h1>
      <p className="mt-2 text-slate-500">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary mt-6">
        Back to Home
      </Link>
    </div>
  );
}
