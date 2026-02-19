import React, { useState, useEffect, useRef } from 'react';
import { X, Video, Package, Wifi, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { Product } from '../types';
// FIX: The `LiveSession` type is not exported from the library. `LiveServerMessage` is added for the onmessage callback. `GenerateContentResponse` is removed as it's unused.
import {
  GoogleGenAI,
  Modality,
  Type,
  FunctionDeclaration,
  Blob,
  LiveServerMessage
} from '@google/genai';

interface GoLiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellerProducts: Product[];
  onStartStream: (title: string, featuredProductId: string, stream: MediaStream) => void;
  onViolation: (reason: string) => void;
}

// FIX: The `LiveSession` type is not exported from `@google/genai`. A local interface is defined for type safety based on its usage.
interface LiveSession {
  close(): void;
  sendRealtimeInput(input: { media: Blob }): void;
}

const moderationTools: FunctionDeclaration[] = [
  {
    name: 'reportViolation',
    parameters: {
      type: Type.OBJECT,
      description: 'Reports a policy violation detected in the live stream.',
      properties: {
        reason: {
          type: Type.STRING,
          description: 'A brief, clear description of the policy violation detected.'
        }
      },
      required: ['reason']
    }
  }
];

const MODERATOR_INSTRUCTION = `You are a strict but fair live stream moderator for an e-commerce platform called Pambo. Your primary responsibility is to ensure the safety and integrity of the platform by monitoring streams for policy violations. Policies include:
- No hate speech, harassment, or violence.
- No nudity or sexually explicit content.
- No illegal items, including weapons or drugs.
- No counterfeit or fake products.
- No displaying of personal contact information (phone numbers, email addresses, physical addresses).
- No directing users to pay outside the Pambo platform.
Analyze the video frames provided. If you detect a clear and unambiguous violation of these policies, you MUST call the 'reportViolation' function with a concise reason. Do not call the function for borderline cases; only for definite violations.`;

// Helper to convert a Blob to a base64 string
const blobToBase64 = (blob: globalThis.Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = (reader.result as string).split(',')[1];
      resolve(base64data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

export const GoLiveModal: React.FC<GoLiveModalProps> = ({
  isOpen,
  onClose,
  sellerProducts,
  onStartStream,
  onViolation
}) => {
  const [title, setTitle] = useState('');
  const [featuredProductId, setFeaturedProductId] = useState('');
  const [status, setStatus] = useState<'setup' | 'streaming' | 'error'>('setup');
  const [error, setError] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionPromise = useRef<Promise<LiveSession> | null>(null);
  const frameIntervalRef = useRef<number | null>(null);

  const cleanup = () => {
    if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    sessionPromise.current?.then((session) => session.close());
    sessionPromise.current = null;
  };

  useEffect(() => {
    if (isOpen) {
      setStatus('setup');
      if (sellerProducts.length > 0) {
        setFeaturedProductId(sellerProducts[0].id);
      }
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.error('Camera access denied:', err);
          setError('Camera access is required to go live.');
          setStatus('error');
        });
    } else {
      cleanup();
    }
    return cleanup;
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStart = async () => {
    if (!title || !featuredProductId) {
      alert('Please enter a title and select a product.');
      return;
    }
    if (!streamRef.current) {
      alert('Camera is not available.');
      return;
    }

    setStatus('streaming');
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    sessionPromise.current = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      config: {
        systemInstruction: MODERATOR_INSTRUCTION,
        tools: [{ functionDeclarations: moderationTools }],
        responseModalities: [Modality.AUDIO] // Required by API, even if we only need tool calls
      },
      callbacks: {
        onopen: () => {
          console.log('Moderation session opened.');
        },
        // FIX: Add LiveServerMessage type to the message parameter.
        onmessage: (message: LiveServerMessage) => {
          if (message.toolCall) {
            for (const fc of message.toolCall.functionCalls) {
              if (fc.name === 'reportViolation') {
                onViolation(fc.args.reason as string);
                cleanup();
                onClose();
              }
            }
          }
        },
        onerror: (e) => {
          console.error('Moderation session error:', e);
          setError('Moderation service disconnected.');
          setStatus('error');
          cleanup();
        },
        onclose: () => console.log('Moderation session closed.')
      }
    });

    const canvasEl = canvasRef.current;
    const videoEl = videoRef.current;
    const ctx = canvasEl?.getContext('2d');
    if (!canvasEl || !videoEl || !ctx) {
      setError('Failed to initialize video processing.');
      setStatus('error');
      return;
    }

    frameIntervalRef.current = window.setInterval(() => {
      canvasEl.width = videoEl.videoWidth;
      canvasEl.height = videoEl.videoHeight;
      ctx.drawImage(videoEl, 0, 0, videoEl.videoWidth, videoEl.videoHeight);
      canvasEl.toBlob(
        async (blob) => {
          if (blob) {
            const base64Data = await blobToBase64(blob);
            sessionPromise.current?.then((session) => {
              session.sendRealtimeInput({ media: { data: base64Data, mimeType: 'image/jpeg' } });
            });
          }
        },
        'image/jpeg',
        0.8
      );
    }, 1000); // Send one frame per second

    onStartStream(title, featuredProductId, streamRef.current);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
        <div className="bg-red-600 p-4 flex justify-between items-center text-white">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Wifi /> Go Live
          </h2>
          <button onClick={onClose} disabled={status === 'streaming'}>
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-4">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            ></video>
            <canvas ref={canvasRef} className="hidden"></canvas>
            {status === 'streaming' && (
              <div className="absolute top-3 left-3 bg-red-600 text-white font-bold text-xs px-2 py-1 rounded animate-pulse">
                LIVE
              </div>
            )}
          </div>
          {status === 'setup' && (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Enter a catchy title for your stream..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-orange-500 outline-none"
              />
              <select
                value={featuredProductId}
                onChange={(e) => setFeaturedProductId(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-orange-500 outline-none bg-white"
              >
                <option value="" disabled>
                  -- Select a product to feature --
                </option>
                {sellerProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
              <button
                onClick={handleStart}
                disabled={sellerProducts.length === 0}
                className="w-full bg-red-600 text-white font-bold py-3 rounded hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:bg-gray-400"
              >
                <Wifi /> Start Streaming
              </button>
            </div>
          )}

          {status === 'streaming' && (
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="mx-auto text-green-600 mb-2" size={32} />
              <h3 className="font-bold text-green-800">You are LIVE!</h3>
              <p className="text-sm text-green-700">
                AI moderation is active to keep the stream safe.
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <AlertTriangle className="mx-auto text-red-600 mb-2" size={32} />
              <h3 className="font-bold text-red-800">An Error Occurred</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
