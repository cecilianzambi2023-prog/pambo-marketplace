import React from 'react';
import { BuyingRequest } from '../types';
import { Tag, Archive, Clock, MessageSquare, User } from 'lucide-react';

const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
};

interface BuyingRequestCardProps {
    request: BuyingRequest;
    onContactBuyer: (request: BuyingRequest) => void;
}

export const BuyingRequestCard: React.FC<BuyingRequestCardProps> = ({ request, onContactBuyer }) => {
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col gap-3 transition hover:shadow-md">
            <h4 className="font-bold text-md text-gray-800 line-clamp-2">{request.title}</h4>
            
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500">
                <div className="flex items-center gap-1.5">
                    <Tag size={14} /> <span className="font-medium">{request.category}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Archive size={14} /> <span className="font-medium">{request.quantity}</span>
                </div>
            </div>

            <p className="text-sm text-gray-600 line-clamp-3 flex-1">{request.description}</p>

            <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <User size={14} />
                    <span className="font-semibold">{request.buyerName}</span>
                </div>
                 <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Clock size={12} /> {timeAgo(request.timestamp)}
                </div>
            </div>

            <button 
                onClick={() => onContactBuyer(request)}
                className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-md hover:bg-blue-700 transition flex items-center justify-center gap-2 mt-2"
            >
                <MessageSquare size={16} /> Contact Buyer & Send Quote
            </button>
        </div>
    );
};