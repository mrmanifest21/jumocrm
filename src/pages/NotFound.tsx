import { Link } from "react-router";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0C0C0C] flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-20 h-20 rounded-2xl bg-[#00E676]/10 flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl font-bold text-[#00E676]">404</span>
        </div>
        <h1 className="text-xl font-semibold text-white mb-2">Page Not Found</h1>
        <p className="text-sm text-[#616161] mb-6 max-w-xs mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 h-10 bg-[#00E676] text-black rounded-xl text-sm font-semibold hover:bg-[#69F0AE] transition-colors"
        >
          <Home size={16} />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
