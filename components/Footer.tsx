import React, { useState } from 'react';
import { 
  Facebook, Twitter, Linkedin, Instagram, Mail, MapPin,
  CreditCard, Lock, Settings
} from 'lucide-react';
import { PLATFORM_CONFIG } from '../constants';
import { ViewState } from '../types';

interface FooterProps {
    onNavigate?: (view: ViewState) => void;
  currentUser?: { email?: string } | null;
  onOpenTerms?: () => void;
  onOpenPrivacy?: () => void;
  onOpenCookies?: () => void;
  onOpenContact?: () => void;
  onAdminLogin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ 
  onNavigate, 
  currentUser,
  onOpenTerms,
  onOpenPrivacy,
  onOpenCookies,
  onOpenContact,
  onAdminLogin
}) => {
  const [adminHover, setAdminHover] = useState(false);

  const handleHubClick = (hubName: string) => {
        const hubToView: Record<string, ViewState> = {
            marketplace: 'marketplace',
            wholesale: 'wholesale',
            importlinkGlobal: 'importlinkGlobal',
            services: 'services',
            digital: 'digital',
            live: 'live',
            farmers: 'farmers',
        };

        const targetView = hubToView[hubName];
        if (!targetView) return;

    if (onNavigate) {
            onNavigate(targetView);
    }
  };

  const handleAdminAccess = () => {
    // Check if current user is admin
    const isAdmin = currentUser?.email === PLATFORM_CONFIG.adminEmail;
    if (isAdmin) {
      if (onAdminLogin) {
        onAdminLogin();
      }
      // Navigate to admin panel
      if (onNavigate) {
        onNavigate('admin');
      }
    }
  };

  const isAdmin = currentUser?.email === PLATFORM_CONFIG.adminEmail;
    return (
        <footer className="bg-gray-900 text-gray-300">
            {/* Main Footer Content */}
            <div className="container mx-auto px-4 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-8">
                    {/* Column 1: Company Info & Contact */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-2xl">P</div>
                            <div>
                                <p className="text-xl font-bold text-white">{PLATFORM_CONFIG.name}</p>
                                <p className="text-xs text-gray-400">{PLATFORM_CONFIG.domain}</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-400 mb-6 leading-relaxed">A multi-hub marketplace platform built for trading across Kenya.</p>
                        
                        <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-3 text-sm">
                                <Mail size={18} className="text-orange-500" />
                                <a href={`mailto:${PLATFORM_CONFIG.adminEmail}`} className="text-gray-300 hover:text-orange-500 transition">{PLATFORM_CONFIG.adminEmail}</a>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <MapPin size={18} className="text-orange-500" />
                                <span className="text-gray-300">Nairobi, Kenya</span>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="flex gap-4">
                            <a href="#" className="bg-gray-800 hover:bg-orange-500 transition p-2.5 rounded-lg text-gray-300 hover:text-white"><Facebook size={18} /></a>
                            <a href="#" className="bg-gray-800 hover:bg-orange-500 transition p-2.5 rounded-lg text-gray-300 hover:text-white"><Twitter size={18} /></a>
                            <a href="#" className="bg-gray-800 hover:bg-orange-500 transition p-2.5 rounded-lg text-gray-300 hover:text-white"><Linkedin size={18} /></a>
                            <a href="#" className="bg-gray-800 hover:bg-orange-500 transition p-2.5 rounded-lg text-gray-300 hover:text-white"><Instagram size={18} /></a>
                        </div>
                    </div>

                    {/* Column 2: For Buyers */}
                    <div>
                        <h4 className="font-bold text-white uppercase text-sm mb-5">For Buyers</h4>
                        <nav className="flex flex-col gap-3">
                            <span className="text-gray-400 text-sm">Browse Listings</span>
                            <span className="text-gray-400 text-sm">Search Products</span>
                            <span className="text-gray-400 text-sm">View Sellers</span>
                            <span className="text-gray-400 text-sm">Contact Support</span>
                        </nav>
                    </div>

                    {/* Column 3: For Sellers */}
                    <div>
                        <h4 className="font-bold text-white uppercase text-sm mb-5">For Sellers</h4>
                        <nav className="flex flex-col gap-3">
                            <span className="text-gray-400 text-sm">Seller Center</span>
                            <span className="text-gray-400 text-sm">Start Selling</span>
                            <span className="text-gray-400 text-sm">Seller Tools</span>
                            <span className="text-gray-400 text-sm">Seller Support</span>
                        </nav>
                    </div>

                    {/* Column 4: Our Platforms */}
                    <div>
                        <h4 className="font-bold text-white uppercase text-sm mb-5">Our Platforms</h4>
                        <nav className="flex flex-col gap-3">
                            <button onClick={() => handleHubClick('marketplace')} className="text-gray-400 hover:text-orange-500 transition text-sm text-left cursor-pointer">Marketplace</button>
                            <button onClick={() => handleHubClick('wholesale')} className="text-gray-400 hover:text-orange-500 transition text-sm text-left cursor-pointer">Kenya Wholesale Hub</button>
                            <button onClick={() => handleHubClick('importlinkGlobal')} className="text-gray-400 hover:text-orange-500 transition text-sm text-left cursor-pointer">ImportLink Global</button>
                            <button onClick={() => handleHubClick('services')} className="text-gray-400 hover:text-orange-500 transition text-sm text-left cursor-pointer">Services</button>
                            <button onClick={() => handleHubClick('digital')} className="text-gray-400 hover:text-orange-500 transition text-sm text-left cursor-pointer">Digital Products</button>
                            <button onClick={() => handleHubClick('live')} className="text-gray-400 hover:text-orange-500 transition text-sm text-left cursor-pointer">Live Commerce</button>
                        </nav>
                    </div>

                    {/* Column 5: Resources */}
                    <div>
                        <h4 className="font-bold text-white uppercase text-sm mb-5">Resources</h4>
                        <nav className="flex flex-col gap-3">
                            <a href="#" className="text-gray-400 hover:text-orange-500 transition text-sm">Help Center</a>
                            <a href="#" className="text-gray-400 hover:text-orange-500 transition text-sm">FAQ</a>
                            <a href="#" className="text-gray-400 hover:text-orange-500 transition text-sm">Guidelines</a>
                            <a href="#" className="text-gray-400 hover:text-orange-500 transition text-sm">Report Issue</a>
                        </nav>
                    </div>

                    {/* Column 6: Legal */}
                    <div>
                        <h4 className="font-bold text-white uppercase text-sm mb-5">Legal</h4>
                        <nav className="flex flex-col gap-3">
                            <button onClick={onOpenTerms} className="text-gray-400 hover:text-orange-500 transition text-sm text-left cursor-pointer">Terms of Service</button>
                            <button onClick={onOpenPrivacy} className="text-gray-400 hover:text-orange-500 transition text-sm text-left cursor-pointer">Privacy Policy</button>
                            <button onClick={onOpenCookies} className="text-gray-400 hover:text-orange-500 transition text-sm text-left cursor-pointer">Cookie Policy</button>
                            <button onClick={onOpenContact} className="text-gray-400 hover:text-orange-500 transition text-sm text-left cursor-pointer">Contact</button>
                            {isAdmin && (
                              <button 
                                onClick={handleAdminAccess}
                                onMouseEnter={() => setAdminHover(true)}
                                onMouseLeave={() => setAdminHover(false)}
                                className="text-gray-500 hover:text-yellow-500 transition text-sm text-left cursor-pointer font-medium flex items-center gap-1"
                              >
                                <Lock size={12} />
                                {adminHover ? 'Admin Panel' : ''}
                              </button>
                            )}
                        </nav>
                    </div>
                </div>
            </div>


            {/* Payment Methods Section */}
            <div className="bg-gray-800 border-t border-gray-700 py-8">
                <div className="container mx-auto px-4 lg:px-8">
                    <p className="text-sm font-semibold text-white mb-6">Payment Methods Accepted:</p>
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* M-Pesa */}
                        <div className="flex items-start gap-4 p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition">
                            <div className="bg-gradient-to-br from-green-400 to-green-600 p-3 rounded-lg flex-shrink-0">
                                <CreditCard size={24} className="text-white" />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-gray-100">M-Pesa (Mobile Money)</p>
                                <p className="text-xs text-gray-400 mt-1">📱 Fast, secure mobile-to-mobile transfer</p>
                                <p className="text-xs text-gray-500 mt-2">Pay Bill: <span className="font-mono font-bold text-green-300">714888</span></p>
                            </div>
                        </div>

                        {/* Bank Transfer */}
                        <div className="flex items-start gap-4 p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition">
                            <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-3 rounded-lg flex-shrink-0">
                                <CreditCard size={24} className="text-white" />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-gray-100">Bank Transfer (PayBill)</p>
                                <p className="text-xs text-gray-400 mt-1">🏦 Direct bank account deposit</p>
                                <div className="text-xs text-gray-500 mt-2 space-y-0.5">
                                    <p>PayBill: <span className="font-mono font-bold text-blue-300">714888</span></p>
                                    <p>Account: <span className="font-mono font-bold text-blue-300">396334</span></p>
                                </div>
                                <p className="text-xs text-gray-400 mt-2">{PLATFORM_CONFIG.companyName}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="border-t border-gray-700 bg-gray-800 py-6">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="text-center text-xs text-gray-400">
                        <p>&copy; {new Date().getFullYear()} {PLATFORM_CONFIG.companyName}. All rights reserved. | {PLATFORM_CONFIG.domain}</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};
