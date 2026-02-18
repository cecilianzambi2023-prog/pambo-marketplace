import React, { useState } from 'react';
import { Camera, Upload, Check, AlertTriangle, ShieldCheck, Loader, X } from 'lucide-react';
import { analyzeImageForVerification } from '../services/geminiService';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: () => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({ isOpen, onClose, onVerify }) => {
  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      // Extract pure base64
      const base64Data = base64String.split(',')[1];
      
      try {
        const result = await analyzeImageForVerification(base64Data, file.type);
        setAnalysisResult(result);
        setStep(2);
      } catch (e) {
        alert("Verification failed. Please try a clearer image.");
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const finalizeVerification = () => {
    onVerify();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="bg-orange-600 p-6 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
             <ShieldCheck size={28} className="text-white" />
             <div>
                 <h2 className="text-xl font-bold">Seller Verification</h2>
                 <p className="text-orange-100 text-sm">Anti-Fake & Trust System</p>
             </div>
          </div>
          <button onClick={onClose}><X/></button>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="text-center">
              <div className="mb-6 p-4 bg-orange-50 rounded-lg text-orange-800 text-sm">
                To maintain a safe marketplace, all sellers must verify their identity and product inventory.
              </div>
              
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 hover:border-orange-500 transition cursor-pointer relative">
                <input 
                    type="file" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileUpload}
                    accept="image/*"
                />
                <div className="flex flex-col items-center">
                  {isAnalyzing ? (
                    <Loader className="w-12 h-12 text-orange-600 animate-spin mb-3" />
                  ) : (
                    <Camera className="w-12 h-12 text-gray-400 mb-3" />
                  )}
                  <p className="font-semibold text-gray-700">
                    {isAnalyzing ? 'AI Analyzing Document...' : 'Upload National ID / Business Permit'}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">Supported: JPG, PNG</p>
                </div>
              </div>
            </div>
          )}

          {step === 2 && analysisResult && (
            <div>
              <h3 className="text-lg font-bold mb-4">AI Analysis Result</h3>
              
              <div className={`p-4 rounded-lg mb-6 ${analysisResult.isSuspicious ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                <div className="flex items-start gap-3">
                    {analysisResult.isSuspicious ? <AlertTriangle className="text-red-600 shrink-0"/> : <Check className="text-green-600 shrink-0"/>}
                    <div>
                        <p className="font-bold text-gray-800">
                            {analysisResult.isSuspicious ? 'Potential Issues Detected' : 'Document Verified'}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">{analysisResult.qualityAnalysis}</p>
                        <p className="text-xs font-mono mt-2 text-gray-500">Confidence: {analysisResult.confidenceScore}%</p>
                    </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded"
                >
                    Try Again
                </button>
                <button 
                    onClick={finalizeVerification}
                    disabled={analysisResult.isSuspicious}
                    className="flex-1 py-3 bg-orange-600 text-white font-bold rounded hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    Complete Setup
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
