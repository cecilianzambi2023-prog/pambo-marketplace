import React, { useState, useEffect } from 'react';
import { User } from '../types';
import {
  X,
  ArrowRight,
  Building,
  User as UserIcon,
  Phone,
  Key,
  Fingerprint,
  Camera,
  FileText,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { DETAILED_PRODUCT_CATEGORIES } from '../constants';
import { analyzeImageForVerification } from '../services/geminiService';

interface SellerOnboardingModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onSubmit: (data: Partial<User>) => void;
}

const StepIndicator: React.FC<{ currentStep: number; totalSteps: number }> = ({
  currentStep,
  totalSteps
}) => (
  <div className="flex items-center justify-center gap-2 mb-4">
    {Array.from({ length: totalSteps }).map((_, index) => (
      <div
        key={index}
        className={`w-10 h-2 rounded-full transition-all duration-300 ${
          index < currentStep ? 'bg-orange-500' : 'bg-gray-200'
        }`}
      />
    ))}
  </div>
);

export const SellerOnboardingModal: React.FC<SellerOnboardingModalProps> = ({
  isOpen,
  user,
  onClose,
  onSubmit
}) => {
  const [step, setStep] = useState(1);

  // Form state
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState<'individual' | 'registered_business'>(
    'individual'
  );
  const [businessCategory, setBusinessCategory] = useState(DETAILED_PRODUCT_CATEGORIES[0].name);
  const [phone, setPhone] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [nationalId, setNationalId] = useState('');
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isIdVerified, setIsIdVerified] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    if (user) {
      setBusinessName(user.name);
      setPhone(user.phone || '');
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSendOtp = () => {
    if (!/^(07|01)\d{8}$/.test(phone)) {
      alert('Please enter a valid Safaricom number (e.g., 0712345678).');
      return;
    }
    setIsOtpSent(true);
    // Simulation: In a real app, this would trigger an SMS service.
  };

  const handleVerifyOtp = () => {
    if (otp === '123456') {
      // Hardcoded OTP for simulation
      setIsPhoneVerified(true);
    } else {
      alert('Invalid OTP. Please try again.');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIdDocument(file);
    setIsAnalyzing(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        const result = await analyzeImageForVerification(base64Data, file.type);
        if (result.confidenceScore > 60 && !result.isSuspicious) {
          setIsIdVerified(true);
        } else {
          alert(
            `ID Verification Failed: ${result.qualityAnalysis}. Please upload a clearer image.`
          );
          setIsIdVerified(false);
          setIdDocument(null);
        }
      } catch (error) {
        alert('Could not analyze the document. Please try again.');
        setIsIdVerified(false);
        setIdDocument(null);
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    const finalData: Partial<User> = {
      businessName,
      businessType,
      businessCategory,
      phone,
      nationalId
    };
    onSubmit(finalData);
  };

  const renderStep = () => {
    switch (step) {
      case 1: // Business Details
        return (
          <>
            <h3 className="text-xl font-bold mb-4">Tell Us About Your Business</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Type
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setBusinessType('individual')}
                    className={`flex-1 p-3 border rounded-md flex items-center gap-2 ${businessType === 'individual' ? 'border-orange-500 bg-orange-50' : 'border-gray-300'}`}
                  >
                    <UserIcon size={16} /> Individual / Sole Proprietor
                  </button>
                  <button
                    type="button"
                    onClick={() => setBusinessType('registered_business')}
                    className={`flex-1 p-3 border rounded-md flex items-center gap-2 ${businessType === 'registered_business' ? 'border-orange-500 bg-orange-50' : 'border-gray-300'}`}
                  >
                    <Building size={16} /> Registered Business
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Business Category
                </label>
                <select
                  value={businessCategory}
                  onChange={(e) => setBusinessCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white"
                >
                  {DETAILED_PRODUCT_CATEGORIES.map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!businessName}
              className="mt-6 w-full bg-orange-600 text-white font-bold py-3 rounded-lg hover:bg-orange-700 transition disabled:bg-gray-400"
            >
              Next <ArrowRight className="inline-block" size={16} />
            </button>
          </>
        );
      case 2: // Phone Verification
        return (
          <>
            <h3 className="text-xl font-bold mb-4">Verify Your M-Pesa Number</h3>
            <p className="text-sm text-gray-500 mb-4">
              This number will be used for payments and buyer communication.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  M-Pesa Phone Number
                </label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                    required
                    disabled={isPhoneVerified}
                  />
                  {!isPhoneVerified && (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={isOtpSent}
                      className="bg-blue-600 text-white font-semibold px-4 rounded-md disabled:bg-gray-400"
                    >
                      {isOtpSent ? 'OTP Sent' : 'Send OTP'}
                    </button>
                  )}
                </div>
              </div>
              {isOtpSent && !isPhoneVerified && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      className="bg-green-600 text-white font-semibold px-4 rounded-md"
                    >
                      Verify
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    For simulation, the OTP is <strong>123456</strong>.
                  </p>
                </div>
              )}
              {isPhoneVerified && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded-md flex items-center gap-2">
                  <CheckCircle size={16} /> Phone Number Verified!
                </div>
              )}
            </div>
            <button
              onClick={() => setStep(3)}
              disabled={!isPhoneVerified}
              className="mt-6 w-full bg-orange-600 text-white font-bold py-3 rounded-lg hover:bg-orange-700 transition disabled:bg-gray-400"
            >
              Next <ArrowRight className="inline-block" size={16} />
            </button>
          </>
        );
      case 3: // Identity Verification
        return (
          <>
            <h3 className="text-xl font-bold mb-4">Identity Verification</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  National ID Number
                </label>
                <input
                  type="text"
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload ID Document / Business Permit
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    {isAnalyzing ? (
                      <Loader2 className="mx-auto h-12 w-12 text-gray-400 animate-spin" />
                    ) : (
                      <Camera className="mx-auto h-12 w-12 text-gray-400" />
                    )}
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          onChange={handleFileChange}
                          accept="image/*"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      {idDocument ? idDocument.name : 'PNG, JPG up to 10MB'}
                    </p>
                  </div>
                </div>
              </div>
              {isIdVerified && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded-md flex items-center gap-2">
                  <CheckCircle size={16} /> Document analysis successful!
                </div>
              )}
            </div>
            <button
              onClick={() => setStep(4)}
              disabled={!nationalId || !isIdVerified}
              className="mt-6 w-full bg-orange-600 text-white font-bold py-3 rounded-lg hover:bg-orange-700 transition disabled:bg-gray-400"
            >
              Next <ArrowRight className="inline-block" size={16} />
            </button>
          </>
        );
      case 4: // Terms & Conditions
        return (
          <>
            <h3 className="text-xl font-bold mb-4">Community Standards</h3>
            <div
              className="prose prose-sm max-w-none h-64 overflow-y-auto border border-gray-200 p-4 rounded-md"
              onScroll={(e) => {
                const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
                if (scrollHeight - scrollTop <= clientHeight + 10) setHasScrolled(true);
              }}
            >
              <p>
                To ensure a safe, trusted, and respectful environment for all users, you must adhere
                to the following standards...
              </p>
              <h4>1. Prohibited Content ("Bad Content")</h4>
              <p>
                You may not post, sell, or promote any content that is illegal, harmful, or
                inappropriate. This is in accordance with the{' '}
                <strong>Kenya Computer Misuse and Cybercrimes Act, 2018</strong>.
              </p>
              <ul>
                <li>Illegal Items: Firearms, narcotics, counterfeit goods.</li>
                <li>Hate Speech & Harassment.</li>
                <li>Explicit Content.</li>
                <li>Misinformation.</li>
              </ul>
              <h4>2. Authentic Representation</h4>
              <ul>
                <li>
                  <strong>Accurate Listings:</strong> All products and services must be described
                  accurately.
                </li>
                <li>
                  <strong>Original Photos:</strong> Use your own photos of the actual product. Our
                  AI system actively scans for non-authentic images.
                </li>
              </ul>
              <h4>3. Professional Conduct</h4>
              <ul>
                <li>
                  <strong>Respectful Communication:</strong> Abusive language, threats, and spam are
                  strictly prohibited.
                </li>
                <li>
                  <strong>Transaction Integrity:</strong> Do not attempt to take transactions or
                  communications off the Pambo platform.
                </li>
              </ul>
              <p className="font-bold mt-6">
                By clicking "Submit Application," you confirm that you have read, understood, and
                agree to abide by these Community Standards.
              </p>
            </div>
            <button
              onClick={handleSubmit}
              disabled={!hasScrolled}
              className="mt-6 w-full bg-orange-600 text-white font-bold py-3 rounded-lg hover:bg-orange-700 transition disabled:bg-gray-400"
            >
              {hasScrolled ? 'Submit Application' : 'Scroll to Accept Terms'}
            </button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        <header className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold">Become a Pambo Seller</h2>
            <p className="text-sm text-gray-500">Complete your profile to start selling.</p>
          </div>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </header>
        <div className="p-6">
          <StepIndicator currentStep={step} totalSteps={4} />
          {renderStep()}
        </div>
      </div>
    </div>
  );
};
