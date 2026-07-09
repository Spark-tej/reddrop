import { CheckCircle2, Clock } from "lucide-react";

const DONATION_INTERVAL_DAYS = 56;

/**
 * Computes eligibility based on the last donation date.
 * Returns days remaining, percentage progress, and eligibility flag.
 */
function getEligibility(lastDonationDate) {
  if (!lastDonationDate) {
    return { isEligible: true, daysLeft: 0, percent: 100, nextDate: null };
  }

  const last = new Date(lastDonationDate);
  const next = new Date(last);
  next.setDate(next.getDate() + DONATION_INTERVAL_DAYS);

  const today = new Date();
  const msLeft = next.getTime() - today.getTime();
  const daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
  const daysElapsed = DONATION_INTERVAL_DAYS - daysLeft;
  const percent = Math.min(100, Math.max(0, Math.round((daysElapsed / DONATION_INTERVAL_DAYS) * 100)));

  return {
    isEligible: daysLeft <= 0,
    daysLeft,
    percent,
    nextDate: next.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }),
  };
}

export default function EligibilityCard({ lastDonationDate }) {
  const { isEligible, daysLeft, percent, nextDate } = getEligibility(lastDonationDate);

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="card flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-5">
        <div className="relative h-32 w-32 shrink-0">
          <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={radius} strokeWidth="10" className="stroke-slate-100" fill="none" />
            <circle
              cx="60"
              cy="60"
              r={radius}
              strokeWidth="10"
              strokeLinecap="round"
              fill="none"
              className={isEligible ? "stroke-emerald-500" : "stroke-crimson-500"}
              strokeDasharray={circumference}
              strokeDashoffset={isEligible ? 0 : offset}
              style={{ transition: "stroke-dashoffset 0.6s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isEligible ? (
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            ) : (
              <span className="text-2xl font-extrabold text-crimson-600">{daysLeft}</span>
            )}
            <span className="text-[11px] font-medium text-slate-400">
              {isEligible ? "Ready" : "days left"}
            </span>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-900">
            {isEligible ? "You're eligible to donate today!" : "Not yet eligible"}
          </h3>
          <p className="mt-1 max-w-xs text-sm text-slate-500">
            {isEligible
              ? "Thank you for being ready to save a life. Find a nearby request or drive to donate."
              : `Based on the 56-day rule, you can donate again on ${nextDate}.`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-stretch rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-500 sm:self-auto">
        <Clock className="h-4 w-4" />
        {lastDonationDate
          ? `Last donation: ${new Date(lastDonationDate).toLocaleDateString()}`
          : "No donation on record yet"}
      </div>
    </div>
  );
}
