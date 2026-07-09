import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Droplet, Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { logout } from "../features/auth/authSlice";

const navLinkClass = ({ isActive }) =>
  `text-sm font-medium transition ${
    isActive ? "text-crimson-600" : "text-slate-600 hover:text-crimson-600"
  }`;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-white/70 backdrop-blur-2xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-crimson-600 to-crimson-400 shadow-lg shadow-crimson-200">
            <Droplet className="h-5 w-5 text-white" fill="white" />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-slate-900">
            Red<span className="text-crimson-600">Drop</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <NavLink to="/" className={navLinkClass} end>
            Home
          </NavLink>
          <NavLink to="/search-donors" className={navLinkClass}>
            Find Donors
          </NavLink>
          <NavLink to="/requests" className={navLinkClass}>
            Blood Requests
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/dashboard" className={navLinkClass}>
              Dashboard
            </NavLink>
          )}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-slate-500">
                Hi, <span className="font-semibold text-slate-800">{user?.name?.split(" ")[0]}</span>
              </span>
              <Link to="/dashboard" className="btn-secondary !px-3 !py-2">
                <LayoutDashboard className="h-4 w-4" />
              </Link>
              <button onClick={handleLogout} className="btn-primary !px-3 !py-2">
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary">
                Log In
              </Link>
              <Link to="/register" className="btn-primary">
                Join RedDrop
              </Link>
            </>
          )}
        </div>

        <button
          className="text-slate-700 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            <NavLink to="/" className={navLinkClass} onClick={() => setOpen(false)} end>
              Home
            </NavLink>
            <NavLink to="/search-donors" className={navLinkClass} onClick={() => setOpen(false)}>
              Find Donors
            </NavLink>
            <NavLink to="/requests" className={navLinkClass} onClick={() => setOpen(false)}>
              Blood Requests
            </NavLink>
            {isAuthenticated ? (
              <>
                <NavLink to="/dashboard" className={navLinkClass} onClick={() => setOpen(false)}>
                  Dashboard
                </NavLink>
                <button onClick={handleLogout} className="btn-primary w-full">
                  Log Out
                </button>
              </>
            ) : (
              <div className="flex gap-3">
                <Link to="/login" className="btn-secondary w-full" onClick={() => setOpen(false)}>
                  Log In
                </Link>
                <Link to="/register" className="btn-primary w-full" onClick={() => setOpen(false)}>
                  Join
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
