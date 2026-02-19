import React, { useEffect, useRef } from 'react';
import { LiveStream, Product } from '../types';
import { X, Wifi, Users, MessageCircle, Heart, Send, AlertTriangle, Wallet } from 'lucide-react';
import { SmartImage } from './SmartImage';

interface LiveStreamPlayerProps {
  stream: LiveStream;
  featuredProduct?: Product;
  onClose: () => void;
  onBuyNow: (product: Product) => void;
  // FIX: Add optional mediaStream prop to handle the user's own live feed.
  mediaStream?: MediaStream | null;
}

const ChatMessage: React.FC<{ name: string; message: string; isHighlight?: boolean }> = ({
  name,
  message,
  isHighlight
}) => (
  <div className={`text-sm mb-2 ${isHighlight ? 'bg-orange-100 p-2 rounded-lg' : ''}`}>
    <span className="font-bold text-gray-800">{name}:</span>
    <span className="text-gray-600 ml-1.5">{message}</span>
  </div>
);

export const LiveStreamPlayer: React.FC<LiveStreamPlayerProps> = ({
  stream,
  featuredProduct,
  onClose,
  onBuyNow,
  mediaStream
}) => {
  const isTerminated = stream.status === 'ended' && stream.violationReason;
  const videoRef = useRef<HTMLVideoElement>(null);

  // FIX: Use useEffect to attach the MediaStream to the video element's srcObject.
  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream]);

  const handleBuyNow = () => {
    if (featuredProduct) onBuyNow(featuredProduct);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div className="relative w-full h-full max-w-6xl mx-auto flex flex-col md:flex-row bg-gray-900 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
        >
          <X size={24} />
        </button>

        {/* Video Player Section */}
        <div className="w-full md:w-3/4 h-1/2 md:h-full bg-black flex items-center justify-center relative">
          <video
            // FIX: Add ref and conditionally set src to avoid conflicts with srcObject.
            ref={videoRef}
            src={
              !mediaStream
                ? 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
                : undefined
            }
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-contain"
          />

          {isTerminated && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center p-8 z-10">
              <AlertTriangle size={48} className="text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-white">Live Stream Terminated</h2>
              <p className="text-red-300 mt-2">
                This stream was ended due to a policy violation: <br />
                <span className="font-semibold text-white">"{stream.violationReason}"</span>
              </p>
              <button
                onClick={onClose}
                className="mt-6 bg-white text-black font-bold py-2 px-6 rounded-lg"
              >
                Close
              </button>
            </div>
          )}

          <div className="absolute top-4 left-4 z-10 space-y-2">
            <div className="bg-red-600 text-white text-sm font-bold px-3 py-1.5 rounded-md flex items-center gap-1.5 shadow-lg">
              <Wifi size={16} /> LIVE
            </div>
            <div className="bg-black/50 text-white text-sm font-semibold px-3 py-1.5 rounded-md flex items-center gap-1.5 backdrop-blur-sm">
              <Users size={16} /> {stream.viewerCount.toLocaleString()}
            </div>
          </div>

          {!isTerminated && featuredProduct && (
            <div className="absolute bottom-4 left-4 right-4 z-10 bg-black/50 p-3 rounded-lg backdrop-blur-sm flex items-center gap-4 animate-fade-in-up">
              <SmartImage
                src={featuredProduct.image}
                className="w-16 h-16 rounded-md object-cover"
                alt={featuredProduct.title}
              />
              <div className="flex-1">
                <h4 className="font-bold text-white line-clamp-1">{featuredProduct.title}</h4>
                <p className="text-orange-400 font-bold text-lg">
                  KES {featuredProduct.price?.toLocaleString()}
                </p>
              </div>
              <button
                onClick={handleBuyNow}
                className="bg-orange-600 text-white font-bold py-3 px-5 rounded-lg hover:bg-orange-700 transition flex items-center gap-2 shrink-0"
              >
                <Wallet size={18} /> Buy Now
              </button>
            </div>
          )}
        </div>

        {/* Chat & Info Section */}
        <div className="w-full md:w-1/4 h-1/2 md:h-full bg-white flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <SmartImage
                src={stream.sellerAvatar}
                alt={stream.sellerName}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h3 className="font-bold text-gray-900">{stream.sellerName}</h3>
                <p className="text-sm text-gray-500">{stream.title}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto flex flex-col justify-center items-center text-center text-gray-400">
            <MessageCircle size={40} className="mb-2" />
            <h4 className="font-bold text-gray-600">Live Chat</h4>
            <p className="text-sm">Messages from viewers will appear here.</p>
          </div>

          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <div className="relative">
              <input
                type="text"
                placeholder="Send a message..."
                className="w-full bg-white border-2 border-gray-200 rounded-lg py-2 pl-4 pr-12 text-sm"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-500">
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
