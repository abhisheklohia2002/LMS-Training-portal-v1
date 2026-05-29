import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-8 px-6 lg:grid-cols-2">
        <div className="hidden lg:block">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
            TripXL Learning Portal
          </p>

          <h1 className="mt-4 text-5xl font-bold leading-tight text-slate-900">
            Empower learning. Track growth. Certify excellence.
          </h1>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            A centralized enterprise LMS to manage role-based trainings,
            assessments, certifications, and employee learning progress.
          </p>
        </div>

        <Outlet />
      </div>
    </div>
  );
}