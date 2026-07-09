import { Droplet, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/70 bg-white/70 backdrop-blur-2xl">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 rounded-3xl border border-white/70 bg-white/70 px-6 py-6 shadow-[0_12px_35px_rgba(220,38,38,0.08)] sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-br from-crimson-600 to-crimson-400">
              <Droplet className="h-4 w-4 text-white" fill="white" />
            </span>
            <span className="font-bold text-slate-900">RedDrop</span>
          </div>
          <p className="flex items-center gap-1.5 text-sm text-slate-500">
            Built to save lives, one donation at a time
            <Heart className="h-4 w-4 fill-crimson-500 text-crimson-500" />
          </p>
          <p className="text-sm text-slate-400">© {new Date().getFullYear()} RedDrop. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
