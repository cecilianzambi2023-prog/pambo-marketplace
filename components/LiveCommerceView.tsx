import React from 'react';
import { LiveStream, Product } from '../types';
import { Wifi, Users, Eye } from 'lucide-react';
import { SmartImage } from './SmartImage';

interface LiveStreamCardProps {
  stream: LiveStream;
  product?: Product;
  onViewStream: (stream: LiveStream) => void;
}

const LiveStreamCard: React.FC<LiveStreamCardProps> = ({ stream, product, onViewStream }) => {
  return (
    <div
      onClick={() => onViewStream(stream)}
      className="bg-white rounded-lg border border-gray-200 hover:shadow-xl transition-all duration-300 group flex flex-col h-full cursor-pointer overflow-hidden"
    >
      <div className="relative aspect-[9/16] overflow-hidden bg-gray-900">
        {product?.image ? (
          <SmartImage
            src={product.image}
            alt={stream.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500">
            <Wifi size={64} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1 shadow-md animate-pulse">
          <Wifi size={14} />
          LIVE
        </div>
        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1 backdrop-blur-sm">
          <Users size={14} />
          {stream.viewerCount.toLocaleString()}
        </div>
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h3 className="font-bold drop-shadow-lg leading-tight">{stream.title}</h3>
        </div>
      </div>
      <div className="p-3 flex items-center gap-2">
        <SmartImage
          src={stream.sellerAvatar}
          alt={stream.sellerName}
          className="w-8 h-8 rounded-full object-cover"
        />
        <div>
          <p className="text-sm font-semibold text-gray-800 truncate">{stream.sellerName}</p>
          <p className="text-xs text-gray-500">Live now</p>
        </div>
        <button className="ml-auto bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1.5 rounded-md hover:bg-orange-200 transition">
          Join
        </button>
      </div>
    </div>
  );
};

interface LiveCommerceViewProps {
  streams: LiveStream[];
  products: Product[];
  onViewStream: (stream: LiveStream) => void;
}

export const LiveCommerceView: React.FC<LiveCommerceViewProps> = ({
  streams,
  products,
  onViewStream
}) => {
  const liveStreams = streams.filter((s) => s.status === 'live');
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-800">Live Commerce</h1>
        <p className="text-gray-500 mt-1">
          Join live streams from your favorite sellers for exclusive deals and product showcases.
        </p>
      </div>

      {liveStreams.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {liveStreams.map((stream) => {
            const product = products.find((p) => p.id === stream.featuredProductId);
            return (
              <LiveStreamCard
                key={stream.id}
                stream={stream}
                product={product}
                onViewStream={onViewStream}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-lg border border-dashed border-gray-300">
          <Wifi size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">No Live Streams Currently</h3>
          <p className="text-gray-500 mt-1">Check back later to see when sellers go live!</p>
        </div>
      )}
    </div>
  );
};
