import React from 'react';
import { ShieldCheck, Wallet, Star, AlertTriangle } from 'lucide-react';

const TrustFeature: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="flex items-start gap-4">
        <div className="bg-blue-100 text-blue-600 p-3 rounded-full shrink-0">
            {icon}
        </div>
        <div>
            <h3 className="font-bold text-gray-800 text-md">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
        </div>
    </div>
);

export const TrustAndVerification: React.FC = () => {
    const features = [
        {
            icon: <ShieldCheck size={24} />,
            title: "Seller & Business Verification",
            description: "We verify every seller's identity and business registration to ensure a safe marketplace."
        },
        {
            icon: <Wallet size={24} />,
            title: "Secure M-Pesa Payments",
            description: "Pay with confidence using Kenya's most trusted mobile payment platform."
        },
        {
            icon: <Star size={24} />,
            title: "Reviews & Ratings",
            description: "Read genuine feedback from other buyers before making a purchase."
        },
        {
            icon: <AlertTriangle size={24} />,
            title: "Report Fake Listings",
            description: "Help us maintain quality. Easily report any suspicious listings for admin review."
        }
    ];

    return (
        <section className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map(feature => (
                    <TrustFeature key={feature.title} {...feature} />
                ))}
            </div>
        </section>
    );
};