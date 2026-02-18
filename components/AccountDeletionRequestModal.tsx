import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface AccountDeletionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const AccountDeletionRequestModal: React.FC<AccountDeletionRequestModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative">
        <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-red-100">
                <AlertTriangle size={32} className="text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Request Account Deletion</h2>
            <p className="text-gray-600 text-sm">
                Are you sure you want to request the deletion of your account? This action is permanent and cannot be undone. 
                Your request will be sent to an administrator for review and approval.
            </p>
        </div>

        <div className="p-6 bg-gray-50 flex gap-4">
            <button
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 rounded-lg hover:bg-gray-300 transition"
            >
                Cancel
            </button>
            <button
                onClick={onConfirm}
                className="flex-1 bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition"
            >
                Yes, Request Deletion
            </button>
        </div>
      </div>
    </div>
  );
};