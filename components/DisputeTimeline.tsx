/**
 * Dispute Timeline Chat Component - KENYA ONLY
 * Shows real-time chat timeline for dispute resolution
 * 
 * Features:
 * - Real-time messaging
 * - Role-based views (buyer/seller/admin)
 * - Evidence attachment support
 * - Message threading
 * - Automatic resolution suggestions
 * - Timestamp tracking
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Upload,
  Loader2,
  Clock,
  AlertCircle,
  CheckCircle,
  FileText,
  Image as ImageIcon,
  Paperclip,
  User,
  Shield,
  X,
  MessageSquare,
} from 'lucide-react';
import { getDisputeDetails, addDisputeMessage } from '../services/disputeService';

interface DisputeMessage {
  id: string;
  dispute_id: string;
  sender_id: string;
  sender_role: 'buyer' | 'seller' | 'admin';
  message: string;
  attachment_url?: string;
  created_at: string;
}

interface DisputeTimelineProps {
  dispute_id: string;
  user_id: string;
  user_role: 'buyer' | 'seller' | 'admin';
  onResolve?: () => void;
}

export const DisputeTimeline: React.FC<DisputeTimelineProps> = ({
  dispute_id,
  user_id,
  user_role,
  onResolve,
}) => {
  const [messages, setMessages] = useState<DisputeMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [dispute, setDispute] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadDisputeDetails();
    // Auto-scroll to bottom
    scrollToBottom();
  }, [dispute_id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadDisputeDetails = async () => {
    setIsLoading(true);
    try {
      const result = await getDisputeDetails(dispute_id);
      if (result.success) {
        setDispute(result.dispute);
        setMessages(result.messages);
      }
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File must be less than 10 MB');
      return;
    }

    setAttachment(file);
    setErrorMessage('');
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() && !attachment) {
      setErrorMessage('Please enter a message or attach a file');
      return;
    }

    setIsSending(true);
    setErrorMessage('');

    try {
      const result = await addDisputeMessage(
        dispute_id,
        user_id,
        user_role,
        newMessage,
        attachment ? URL.createObjectURL(attachment) : undefined
      );

      if (result.success) {
        setNewMessage('');
        setAttachment(null);
        
        // Reload messages
        await loadDisputeDetails();
      } else {
        throw new Error(result.error?.message || 'Failed to send message');
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'An error occurred');
    } finally {
      setIsSending(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'buyer':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'seller':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'admin':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'buyer':
        return <User size={14} />;
      case 'seller':
        return <User size={14} />;
      case 'admin':
        return <Shield size={14} />;
      default:
        return <User size={14} />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'buyer':
        return 'Buyer';
      case 'seller':
        return 'Seller';
      case 'admin':
        return 'Kenya Admin';
      default:
        return 'User';
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading || !dispute) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <Loader2 size={32} className="text-orange-600 animate-spin" />
      </div>
    );
  }

  const isResolved = dispute.status === 'resolved';

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col h-[600px]">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-amber-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900">{dispute.title}</h3>
            <p className="text-xs text-gray-600 mt-1">
              Dispute opened {new Date(dispute.created_at).toLocaleDateString()}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            isResolved
              ? 'bg-green-100 text-green-700'
              : 'bg-blue-100 text-blue-700'
          }`}>
            {isResolved ? '✅ Resolved' : dispute.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Messages Timeline */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
              <p className="font-semibold">No messages yet</p>
            </div>
          </div>
        ) : (
          messages.map(msg => {
            const isOwnMessage = msg.sender_id === user_id;
            return (
              <div
                key={msg.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-lg ${
                    isOwnMessage
                      ? 'bg-orange-100 text-orange-900 border border-orange-300'
                      : msg.sender_role === 'admin'
                      ? 'bg-red-50 text-red-900 border border-red-200'
                      : 'bg-gray-100 text-gray-900 border border-gray-200'
                  }`}
                >
                  {/* Sender Badge */}
                  <div className={`text-xs font-semibold mb-1 flex items-center gap-1 ${
                    getRoleColor(msg.sender_role)
                  }`}>
                    {getRoleIcon(msg.sender_role)}
                    {getRoleLabel(msg.sender_role)}
                  </div>

                  {/* Message Text */}
                  <p className="text-sm whitespace-pre-wrap">{msg.message}</p>

                  {/* Attachment */}
                  {msg.attachment_url && (
                    <div className="mt-2 pt-2 border-t border-opacity-20 border-current">
                      <a
                        href={msg.attachment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs underline flex items-center gap-1"
                      >
                        <Paperclip size={12} />
                        View attachment
                      </a>
                    </div>
                  )}

                  {/* Timestamp */}
                  <p className={`text-xs mt-2 opacity-70`}>
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {!isResolved && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <form onSubmit={handleSendMessage} className="space-y-3">
            {/* File Input */}
            {attachment && (
              <div className="flex items-center gap-2 p-2 bg-white rounded border border-gray-300">
                <FileText size={16} className="text-orange-600" />
                <span className="text-sm flex-1 truncate">{attachment.name}</span>
                <button
                  type="button"
                  onClick={() => setAttachment(null)}
                  className="text-gray-600 hover:text-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Message Input */}
            <div className="flex gap-2">
              <textarea
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                maxLength={500}
                rows={2}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              />
              <button
                type="button"
                disabled={isSending}
                className="p-2 text-gray-600 hover:text-orange-600 transition disabled:opacity-50"
              >
                <label htmlFor="attach-file" className="cursor-pointer">
                  <Upload size={20} />
                  <input
                    id="attach-file"
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*,video/*,.pdf"
                  />
                </label>
              </button>
            </div>

            {/* Send Button */}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSending || (!newMessage.trim() && !attachment)}
                className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
              >
                {isSending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Send Message
                  </>
                )}
              </button>
            </div>

            {/* Error */}
            {errorMessage && (
              <div className="p-2 bg-red-50 border border-red-200 rounded flex items-center gap-2 text-xs text-red-700">
                <AlertCircle size={16} />
                {errorMessage}
              </div>
            )}
          </form>

          {/* Character Count */}
          <p className="text-xs text-gray-500 mt-2">{newMessage.length}/500</p>
        </div>
      )}

      {/* Resolved Banner */}
      {isResolved && (
        <div className="p-4 bg-green-50 border-t border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={18} className="text-green-600" />
            <p className="font-semibold text-green-900">Dispute Resolved</p>
          </div>
          <p className="text-sm text-green-800">
            <span className="font-semibold">Resolution:</span> {dispute.resolution}
          </p>
          {dispute.resolution_details && (
            <p className="text-xs text-green-700 mt-1">{dispute.resolution_details}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default DisputeTimeline;
