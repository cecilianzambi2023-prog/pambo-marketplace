import React, { useState, useEffect } from 'react';
import { X, Loader2, Phone, CheckCircle, Terminal } from 'lucide-react';

interface MPesaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  amount: number;
}

type PaymentStep = 'input' | 'waiting' | 'success';

// New component for the simulated logs
const CallbackLog: React.FC<{ logs: string[] }> = ({ logs }) => (
    <div className="mt-4 bg-gray-900 text-white font-mono text-xs rounded-lg p-3 h-28 overflow-y-auto">
        <div className="flex items-center gap-2 text-gray-400 pb-2 border-b border-gray-700 mb-2">
            <Terminal size={14} />
            <span>SAFARICOM-SANDBOX-SIMULATOR.LOG</span>
        </div>
        {logs.map((log, index) => (
            <p key={index} className="whitespace-pre-wrap">
                <span className={log.includes('SUCCESS') ? 'text-green-400' : 'text-gray-300'}>{log}</span>
            </p>
        ))}
    </div>
);


export const MPesaModal: React.FC<MPesaModalProps> = ({ isOpen, onClose, onConfirm, amount }) => {
  const [step, setStep] = useState<PaymentStep>('input');
  const [phone, setPhone] = useState('0712345678');
  const [error, setError] = useState('');
  const [logs, setLogs] = useState<string[]>([]);

  // Reset state when modal is opened
  useEffect(() => {
    if (isOpen) {
        setStep('input');
        setPhone('0712345678'); // Pre-fill with a valid number for demo
        setError('');
        setLogs([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInitiatePayment = () => {
    if (!/^(07|01)\d{8}$/.test(phone)) {
        setError('Please enter a valid Safaricom phone number (e.g., 0712345678).');
        return;
    }
    setError('');
    setStep('waiting');
    setLogs([`[CLIENT] STK Push initiated for KES ${amount.toLocaleString()} to ${phone}.`]);

    // Simulate waiting for user to enter PIN
    setTimeout(() => {
        setLogs(prev => [...prev, `[SERVER] Awaiting Safaricom callback...`]);
    }, 1500);

    // Simulate receiving the successful callback
    setTimeout(() => {
        setLogs(prev => [...prev, `[SERVER] Callback received: ResultCode: 0 (SUCCESS)`]);
        
        setTimeout(() => {
            setLogs(prev => [...prev, `[DATABASE] Payment confirmed. Updating order status to 'Processing'.`]);
            setStep('success');

            // Give user time to see success message, then confirm and close
            setTimeout(() => {
                onConfirm(); // This triggers order creation in App.tsx
                onClose();
            }, 2500);
        }, 1000);

    }, 4000); 
  };

  const renderContent = () => {
    switch (step) {
      case 'input':
        return (
          <>
            <h3 className="font-bold text-center text-gray-800 mb-2">Pay KES {amount.toLocaleString()}</h3>
            <p className="text-center text-sm text-gray-500 mb-4">Enter your M-Pesa phone number to receive a payment request.</p>
            
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 0712345678"
                className={`w-full pl-10 pr-3 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md py-3 text-lg focus:border-green-500 outline-none`}
              />
            </div>
            {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
            
            <button
              onClick={handleInitiatePayment}
              className="w-full mt-4 bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 shadow-lg"
            >
              Pay KES {amount.toLocaleString()}
            </button>
          </>
        );

      case 'waiting':
        return (
          <div className="text-center">
            <Loader2 size={32} className="animate-spin text-gray-400 mx-auto mb-4" />
            <h3 className="font-bold text-gray-800">Awaiting Confirmation</h3>
            <p className="text-sm text-gray-600">
              Please enter your M-Pesa PIN on your phone to complete the payment.
            </p>
            <CallbackLog logs={logs} />
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <CheckCircle size={32} className="text-green-500 mx-auto mb-4" />
            <h3 className="font-bold text-gray-800">Payment Successful!</h3>
            <p className="text-sm text-gray-600">
              Your order is now being processed.
            </p>
            <CallbackLog logs={logs} />
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>

        <div className="p-8 bg-green-700 text-center">
            <h2 className="text-xl font-bold text-white">Complete Your Secure Payment</h2>
        </div>

        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};