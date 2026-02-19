import React from 'react';
import { UserX, LogOut, Mail } from 'lucide-react';

interface BannedViewProps {
  onLogout: () => void;
}

export const BannedView: React.FC<BannedViewProps> = ({ onLogout }) => {
  return (
    <div className="bg-gray-900 min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <div className="bg-gray-800 border border-red-500/30 p-8 rounded-2xl shadow-2xl max-w-lg">
        <div className="w-20 h-20 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <UserX size={40} />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">Account Suspended</h1>
        <p className="text-gray-400 mb-8">
          This account has been suspended due to a violation of our Community Standards. You no
          longer have access to the Pambo marketplace, and any pending payouts may be held for
          review.
        </p>
        <div className="space-y-4">
          <a
            href="mailto:support@pambo.com"
            className="w-full bg-gray-700 text-white font-bold py-3 rounded-lg hover:bg-gray-600 transition flex items-center justify-center gap-2"
          >
            <Mail size={18} /> Contact Support
          </a>
          <button
            onClick={onLogout}
            className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>
    </div>
  );
};
