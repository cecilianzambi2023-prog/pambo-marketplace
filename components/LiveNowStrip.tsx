import React from 'react';
import { LiveStream, User } from '../types';
import { Wifi } from 'lucide-react';
import { SmartImage } from './SmartImage';

interface LiveNowStripProps {
  streams: LiveStream[];
  sellers: User[];
  onViewStream: (stream: LiveStream) => void;
}

const LiveSellerAvatar: React.FC<{ stream: LiveStream; seller?: User; onClick: () => void }> = ({
  stream,
  seller,
  onClick
}) => {
  if (!seller) return null;
  return (
    <div
      onClick={onClick}
      className="flex flex-col items-center gap-2 cursor-pointer text-center w-20"
    >
      <div className="relative">
        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 animate-pulse"></div>
        <SmartImage
          src={seller.avatar}
          alt={seller.name}
          className="w-16 h-16 rounded-full object-cover border-2 border-white relative"
        />
        <div className="absolute bottom-0 right-0 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white uppercase flex items-center gap-0.5">
          <Wifi size={10} /> LIVE
        </div>
      </div>
      <p className="text-xs font-medium text-gray-700 truncate w-full">{seller.name}</p>
    </div>
  );
};

export const LiveNowStrip: React.FC<LiveNowStripProps> = ({ streams, sellers, onViewStream }) => {
  const liveStreams = streams.filter((s) => s.status === 'live');
  if (liveStreams.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Happening Now: Live Shopping</h2>
      <div className="flex gap-4 overflow-x-auto pb-2 -mb-2">
        {liveStreams.map((stream) => {
          const seller = sellers.find((s) => s.id === stream.sellerId);
          return (
            <LiveSellerAvatar
              key={stream.id}
              stream={stream}
              seller={seller}
              onClick={() => onViewStream(stream)}
            />
          );
        })}
      </div>
    </div>
  );
};
