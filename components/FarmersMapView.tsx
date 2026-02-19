import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { FarmerProfile } from '../types';
import { Icon } from 'leaflet';
import { Loader2, Sparkles } from 'lucide-react';
import { SmartImage } from './SmartImage';

interface FarmersMapViewProps {
  farmers: FarmerProfile[];
  onContactFarmer: (farmer: FarmerProfile) => void;
  onGetDeliveryInsight: (farmerId: string) => void;
  insightLoadingFarmerId: string | null;
}

// Define a default icon for Leaflet markers to prevent broken image issues.
const defaultIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export const FarmersMapView: React.FC<FarmersMapViewProps> = ({
  farmers,
  onContactFarmer,
  onGetDeliveryInsight,
  insightLoadingFarmerId
}) => {
  return (
    <div className="relative w-full h-96 md:h-[500px] rounded-lg overflow-hidden border-2 border-gray-200">
      <MapContainer
        center={[-1.286389, 36.817223]}
        zoom={7}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {farmers.map((farmer) => (
          <Marker
            key={farmer.id}
            position={[farmer.coordinates.lat, farmer.coordinates.lng]}
            icon={defaultIcon}
          >
            <Popup>
              <div className="text-center p-1 w-52">
                <SmartImage
                  src={farmer.avatar}
                  alt={farmer.name}
                  className="w-14 h-14 rounded-full object-cover mx-auto mb-2 border-2 border-green-500"
                />
                <h4 className="font-bold text-sm text-gray-800">{farmer.name}</h4>
                <p className="text-xs text-gray-500">
                  Selling: <strong>{farmer.crop}</strong>
                </p>
                <p className="text-xs text-gray-500">
                  Price:{' '}
                  <strong className="text-gray-800">
                    KES {farmer.pricePerUnit}/{farmer.unit}
                  </strong>
                </p>
                <p className="text-xs text-gray-500 mb-2">{farmer.location}</p>
                {farmer.distance !== undefined && (
                  <p className="text-xs text-blue-600 font-bold mb-2 bg-blue-50 py-1 rounded">
                    Approx. {farmer.distance} km away
                  </p>
                )}

                <div className="mt-2 pt-2 border-t border-gray-100 text-left">
                  {farmer.deliveryInsight ? (
                    <div>
                      <p className="text-xs font-bold text-gray-700 mb-1">AI Delivery Insight:</p>
                      <p className="text-[11px] text-gray-600 italic bg-gray-50 p-1.5 rounded">
                        "{farmer.deliveryInsight}"
                      </p>
                    </div>
                  ) : insightLoadingFarmerId === farmer.id ? (
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500 py-1.5">
                      <Loader2 size={14} className="animate-spin" />
                      <span>Generating...</span>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onGetDeliveryInsight(farmer.id);
                      }}
                      className="bg-blue-100 text-blue-700 text-xs px-3 py-1.5 rounded-md font-semibold hover:bg-blue-200 w-full flex items-center justify-center gap-1.5"
                    >
                      <Sparkles size={12} /> Get Delivery Insight
                    </button>
                  )}
                </div>

                <button
                  onClick={() => onContactFarmer(farmer)}
                  className="bg-green-600 text-white text-xs px-3 py-1.5 rounded-md font-semibold hover:bg-green-700 w-full mt-2"
                >
                  Contact Farmer
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
