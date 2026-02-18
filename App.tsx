import React, { useState, useEffect, lazy, Suspense } from 'react';
import { 
  Menu, Search, User as UserIcon, 
  LayoutDashboard, Package, Briefcase, 
  ShieldCheck, ArrowRight, Wallet, Users,
  MessageSquare, ChevronDown, Globe, Heart, Bell, Mail, X, Send, Plus, ShoppingBag, Lock, LogOut,
  Shirt, Sparkles, Building2, Palette, PartyPopper, Hammer, Wrench, Zap, PaintBucket, Armchair, Truck, Box, Settings, Smartphone, Home,
  MapPin, Star, TrendingUp, Grid, Laptop, UserCog, Download, BookOpen, AppWindow, ChevronRight, Edit, Leaf, Wifi, Loader2
} from 'lucide-react';
import { SUBSCRIPTION_FEE, SERVICE_CATEGORIES, DETAILED_PRODUCT_CATEGORIES, SECTION_BANNERS, KENYA_COUNTIES, FUEL_RATE_PER_KM, BASE_DELIVERY_FEE } from './constants';
import { Product, ViewState, User, CartItem, Review, Order, BuyingRequest, FarmerProfile, LiveStream, ListingComment } from './types';
import { ProductCard } from './components/ProductCard';
import { ServiceCard } from './components/ServiceCard';
import { ServiceCategoryGrid } from './components/ServiceCategoryGrid';
import { getAllFeaturedListings } from './services/featuredListingsService';
import { createListing, updateListing } from './services/supabaseService';
import { createReview, getAllReviews, updateReviewStatus } from './services/reviewsService';
import { createListingComment, getAllListingComments, updateListingCommentStatus } from './services/listingCommentsService';
import { Footer } from './components/Footer';

import { TrustAndVerification } from './components/TrustAndVerification';
import { HeroBanner } from './components/HeroBanner';
import { BuyingRequestCard } from './components/BuyingRequestCard';
import { SectionHero } from './components/SectionHero';
import { FeaturedProductsCarousel } from './components/FeaturedProductsCarousel';
import { calculateDistance } from './services/distanceUtils';
import { supabaseClient } from './src/lib/supabaseClient';

const VerificationModal = lazy(() => import('./components/VerificationModal').then(module => ({ default: module.VerificationModal })));
const AddListingModal = lazy(() => import('./components/AddListingModal').then(module => ({ default: module.AddListingModal })));
const SellerOnboardingModal = lazy(() => import('./components/SellerOnboardingModal').then(module => ({ default: module.SellerOnboardingModal })));
const SubscriptionModal = lazy(() => import('./components/SubscriptionModal').then(module => ({ default: module.SubscriptionModal })));
const ProductDetailsModal = lazy(() => import('./components/ProductDetailsModal').then(module => ({ default: module.ProductDetailsModal })));
const AccountDeletionRequestModal = lazy(() => import('./components/AccountDeletionRequestModal').then(module => ({ default: module.AccountDeletionRequestModal })));
const Dashboard = lazy(() => import('./components/Dashboard').then(module => ({ default: module.Dashboard })));
const AdminPanel = lazy(() => import('./components/AdminPanel').then(module => ({ default: module.AdminPanel })));
const BannedView = lazy(() => import('./components/BannedView').then(module => ({ default: module.BannedView })));
const MkulimaSignup = lazy(() => import('./components/MkulimaOnboarding').then(module => ({ default: module.MkulimaSignup })));
const MkulimaDashboard = lazy(() => import('./components/MkulimaOnboarding').then(module => ({ default: module.MkulimaDashboard })));
const FarmersMapView = lazy(() => import('./components/FarmersMapView').then(module => ({ default: module.FarmersMapView })));
const WholesaleHub = lazy(() => import('./pages/WholesaleHub').then(module => ({ default: module.WholesaleHub })));
const TermsOfService = lazy(() => import('./components/TermsOfService').then(module => ({ default: module.TermsOfService })));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy').then(module => ({ default: module.PrivacyPolicy })));
const CookiePolicy = lazy(() => import('./components/CookiePolicy').then(module => ({ default: module.CookiePolicy })));
const ContactPage = lazy(() => import('./components/ContactPage').then(module => ({ default: module.ContactPage })));
const AiAssistantWidget = lazy(() => import('./components/AiAssistantWidget').then(module => ({ default: module.AiAssistantWidget })));

const prefetchDashboard = () => { void import('./components/Dashboard'); };
const prefetchAdminPanel = () => { void import('./components/AdminPanel'); };
const prefetchWholesaleHub = () => { void import('./pages/WholesaleHub'); };
const prefetchFarmersMap = () => { void import('./components/FarmersMapView'); };

const ADMIN_USER: User = {
  id: 'admin',
  name: 'Admin User',
  email: 'admin@pambo.com',
  phone: '',
  role: 'admin',
  verified: true,
  avatar: '',
  subscriptionExpiry: null,
  accountStatus: 'active',
  joinDate: new Date().toISOString(),
  following: [],
  followers: [],
  reviews: [],
  acceptedTermsTimestamp: null,
};

// Helper to convert snake_case keys from Supabase to camelCase for the app
const snakeToCamel = (str: string) => str.replace(/([-_]\w)/g, g => g[1].toUpperCase());
const mapKeysToCamelCase = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(v => mapKeysToCamelCase(v));
  } else if (obj !== null && typeof obj === 'object' && obj.constructor === Object) {
    return Object.keys(obj).reduce((acc: {[key: string]: any}, key) => {
      acc[snakeToCamel(key)] = mapKeysToCamelCase(obj[key]);
      return acc;
    }, {});
  }
  return obj;
};

// Helper function to simulate sending a push notification
const sendPushNotification = (userId: string, title: string, body: string) => {
  console.log(`-- PUSH NOTIFICATION (SIMULATED) --
  TO: User ${userId}
  TITLE: ${title}
  BODY: ${body}
  ------------------------------------`);
};

// --- NEW/REVISED UI COMPONENTS ---

const TopBar: React.FC<{ onStartSelling: () => void }> = ({ onStartSelling }) => (
  <div className="bg-gray-100 border-b border-gray-200 text-xs text-gray-600 hidden md:block">
    <div className="container mx-auto px-4 lg:px-8 h-9 flex items-center justify-between">
      <div className="flex gap-6">
        <a href="#" className="hover:text-orange-500 transition">Sourcing Solutions</a>
        <a href="#" className="hover:text-orange-500 transition">Services & Membership</a>
        <a href="#" className="hover:text-orange-500 transition">Help Center</a>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1.5">
          <Globe size={14} />
          <span>English - KES</span>
        </div>
        <a href="#" className="hover:text-orange-500 transition">Get App</a>
        <button onClick={() => onStartSelling()} className="font-bold text-orange-500 hover:underline">Supplier? Click Here</button>
      </div>
    </div>
  </div>
);

const Header: React.FC<{
  user: User;
  isLoggedIn: boolean;
  onViewChange: (v: ViewState) => void;
  onStartSelling: () => void;
  onLoginClick: () => void;
  onLogout: () => void;
}> = ({ user, isLoggedIn, onViewChange, onStartSelling, onLoginClick, onLogout }) => (
  <header className="navbar-alibaba">
    <TopBar onStartSelling={() => onStartSelling()} />
    <div className="container mx-auto px-4 lg:px-8 h-20 flex items-center justify-between gap-8">
        <div 
            className="flex items-center gap-2 cursor-pointer group shrink-0"
            onClick={() => onViewChange('home')}
        >
            <div className="w-10 h-10 bg-[#FF6700] rounded-lg flex items-center justify-center text-white font-bold text-2xl">P</div>
            <span className="text-2xl font-bold tracking-tight text-[#212121]">
                pambo<span className="text-[#FF6700]">.biz</span>
            </span>
        </div>

        <div className="flex-1 max-w-2xl hidden md:block">
            <div className="search-bar-alibaba border-2 border-[#FF6700]">
                <div className="relative">
                     <select className="h-12 pl-4 pr-10 appearance-none bg-[#FAFAFA] text-sm font-semibold text-[#424242] outline-none cursor-pointer border-r-2 border-[#EEEEEE]">
                         <option>Products</option>
                         <option>Services</option>
                     </select>
                     <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#757575] pointer-events-none"/>
                </div>
                <input 
                    type="text" 
                    placeholder="What are you looking for..."
                    className="w-full h-12 text-[#212121] text-sm block px-4 outline-none bg-white"
                />
                <button className="bg-[#FF6700] h-12 px-6 text-white font-semibold flex items-center gap-2 hover:bg-[#E55100] transition shrink-0">
                    <Search size={18} />
                    Search
                </button>
            </div>
        </div>

        <div className="flex items-center gap-4">
             {isLoggedIn ? (
                <div className="flex items-center gap-3">
                    {user.role === 'admin' && (
                       <button onClick={() => onViewChange('admin')} onMouseEnter={prefetchAdminPanel} onFocus={prefetchAdminPanel} className="flex items-center gap-2 text-sm font-semibold text-[#FF6700] hover:text-[#E55100] bg-[#FFF5F0] px-3 py-1.5 rounded-md transition">
                            <UserCog size={16} />
                            <span className="hidden md:inline">Admin Panel</span>
                        </button>
                    )}
                    <button onClick={() => onViewChange('dashboard')} onMouseEnter={prefetchDashboard} onFocus={prefetchDashboard} className="flex items-center gap-2 text-sm font-semibold text-[#424242] hover:text-[#FF6700] transition">
                        <UserIcon size={20} />
                        <span className="hidden md:inline">{user.name.split(' ')[0]}</span>
                    </button>
                    <button onClick={onLogout} className="text-[#757575] hover:text-[#FF4D4F] transition" title="Logout">
                        <LogOut size={20} />
                    </button>
                </div>
             ) : (
                <button 
                    onClick={onLoginClick}
                    className="btn-primary text-sm"
                >
                    Login / Register
                </button>
             )}
        </div>
    </div>
  </header>
);

const SubNav: React.FC<{ view: ViewState, onViewChange: (v: ViewState) => void }> = ({ view, onViewChange }) => {
    const isMarketplace = view === 'marketplace' || view === 'home';
    const isWholesale = view === 'wholesale';
    const isServices = view === 'services';
    const isDigital = view === 'digital';
    const isFarmers = view === 'farmers';

    return (
        <div className="container mx-auto px-4 lg:px-8 py-4 flex items-center gap-3">
            <button
                onClick={() => onViewChange('marketplace')}
                className={`px-5 py-2.5 rounded-full font-semibold text-sm flex items-center gap-2 transition ${
                    isMarketplace ? 'bg-blue-800 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
            >
                <LayoutDashboard size={16}/> Marketplace
            </button>
            <button
                onClick={() => onViewChange('wholesale')}
              onMouseEnter={prefetchWholesaleHub}
              onFocus={prefetchWholesaleHub}
                className={`px-5 py-2.5 rounded-full font-semibold text-sm flex items-center gap-2 transition ${
                    isWholesale ? 'bg-blue-800 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
            >
                <Package size={16}/> Wholesale Hub
            </button>
            <button
                onClick={() => onViewChange('farmers')}
              onMouseEnter={prefetchFarmersMap}
              onFocus={prefetchFarmersMap}
                className={`px-5 py-2.5 rounded-full font-semibold text-sm flex items-center gap-2 transition ${
                    isFarmers ? 'bg-blue-800 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
            >
                <Leaf size={16}/> Farmers Hub
            </button>
             <button
                onClick={() => onViewChange('digital')}
                className={`px-5 py-2.5 rounded-full font-semibold text-sm flex items-center gap-2 transition ${
                    isDigital ? 'bg-blue-800 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
            >
                <Download size={16}/> Digital Products
            </button>
             <button
                onClick={() => onViewChange('services')}
                className={`px-5 py-2.5 rounded-full font-semibold text-sm flex items-center gap-2 transition ${
                    isServices ? 'bg-blue-800 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
            >
                <Briefcase size={16}/> Services
            </button>
        </div>
    );
}

const CategorySidebar: React.FC<{ 
    onViewChange: (v: ViewState) => void;
    onCategorySelect: (category: string | null) => void;
    selectedCategory: string | null;
}> = ({ onViewChange, onCategorySelect, selectedCategory }) => {
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

    const handleMainCategoryClick = (categoryName: string, view?: ViewState) => {
        if (view) {
            onViewChange(view);
            return;
        }
        setExpandedCategory(prev => (prev === categoryName ? null : categoryName));
    };
    
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 h-fit hidden md:block">
            <h2 className="font-bold text-sm tracking-wide uppercase text-gray-800 pb-3 border-b border-gray-200 mb-2 px-2">
                Categories
            </h2>
            <nav className="space-y-1">
                 <a 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); onCategorySelect(null); }}
                    className={`flex items-center gap-3 p-2.5 text-sm rounded font-bold transition-colors ${!selectedCategory ? 'bg-orange-50 text-orange-600' : 'text-gray-800 hover:bg-gray-100'}`}
                >
                    <span>All Categories</span>
                </a>
                {DETAILED_PRODUCT_CATEGORIES.map(cat => (
                    <div key={cat.name}>
                        <button
                            onClick={() => handleMainCategoryClick(cat.name, cat.view)}
                            className={`w-full flex items-center justify-between gap-3 p-2.5 text-sm rounded transition-colors text-left ${expandedCategory === cat.name ? 'bg-gray-100 text-gray-800' : 'text-gray-600 hover:bg-gray-100'} font-medium`}
                        >
                            <div className="flex items-center gap-3">
                                <cat.icon size={20} className="text-gray-400" />
                                <span>{cat.name}</span>
                            </div>
                            {!cat.view && <ChevronRight size={16} className={`transition-transform ${expandedCategory === cat.name ? 'rotate-90' : ''}`} />}
                        </button>
                        {expandedCategory === cat.name && !cat.view && (
                            <div className="pl-6 pt-1 pb-2">
                                {cat.subcategories.map(subCat => (
                                    <a 
                                        key={subCat} 
                                        href="#"
                                        onClick={(e) => { e.preventDefault(); onCategorySelect(subCat); }}
                                        className={`block p-2 text-sm rounded transition-colors ${selectedCategory === subCat ? 'font-semibold text-orange-600' : 'text-gray-500 hover:text-gray-800'}`}
                                    >
                                        {subCat}
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </nav>
        </div>
    );
};

const ShopLayout: React.FC<{ 
    children: React.ReactNode; 
    onViewChange: (v: ViewState) => void;
    onCategorySelect: (category: string | null) => void;
    selectedCategory: string | null;
}> = ({ children, onViewChange, onCategorySelect, selectedCategory }) => (
    <div className="grid md:grid-cols-[250px_1fr] gap-6">
        <CategorySidebar 
            onViewChange={onViewChange} 
            onCategorySelect={onCategorySelect}
            selectedCategory={selectedCategory}
        />
        <div>{children}</div>
    </div>
);

const BottomNav: React.FC<{ 
    view: ViewState, 
    onViewChange: (v: ViewState) => void,
    onStartSelling: () => void 
}> = ({ view, onViewChange, onStartSelling }) => (
  <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#EEEEEE] py-2 px-6 flex justify-around items-center z-50 md:hidden pb-safe">
      <button onClick={() => onViewChange('home')} className={`flex flex-col items-center gap-1 transition ${view === 'home' ? 'text-[#FF6700]' : 'text-[#757575]'}`}>
          <Home size={22} />
          <span className="text-[10px] font-medium">Home</span>
      </button>
      <button onClick={() => onViewChange('marketplace')} className={`flex flex-col items-center gap-1 transition ${view === 'marketplace' ? 'text-[#FF6700]' : 'text-[#757575]'}`}>
          <ShoppingBag size={22} />
          <span className="text-[10px] font-medium">Buy</span>
      </button>
      <div className="relative -top-5">
          <button 
            onClick={() => onStartSelling()} 
            className="bg-orange-500 text-white p-4 rounded-full shadow-lg hover:bg-orange-600 border-4 border-white flex items-center justify-center transform active:scale-95 transition"
          >
              <Plus size={24} />
          </button>
      </div>
      <button onClick={() => onViewChange('services')} className={`flex flex-col items-center gap-1 ${view === 'services' ? 'text-orange-600' : 'text-gray-400'}`}>
          <Briefcase size={22} />
          <span className="text-[10px] font-medium">Services</span>
      </button>
      <button onClick={() => onViewChange('dashboard')} className={`flex flex-col items-center gap-1 ${view === 'dashboard' ? 'text-orange-600' : 'text-gray-400'}`}>
          <LayoutDashboard size={22} />
          <span className="text-[10px] font-medium">Account</span>
      </button>
  </div>
);

// --- MAIN APP COMPONENT ---

export const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('home');
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [sellers, setSellers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [buyingRequests, setBuyingRequests] = useState<BuyingRequest[]>([]);
  const [farmers, setFarmers] = useState<FarmerProfile[]>([]);
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([]);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User>({
    id: 'guest', name: 'Guest User', email: '', phone: '', role: 'buyer',
    verified: false, avatar: '', subscriptionExpiry: null, accountStatus: 'active', joinDate: new Date().toISOString(),
    following: [], followers: []
  });
  
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [isAddListingOpen, setIsAddListingOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCheckoutPending, setIsCheckoutPending] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSellerOnboardingOpen, setIsSellerOnboardingOpen] = useState(false);
  const [onboardingUser, setOnboardingUser] = useState<User | null>(null);
  
  // Policy & Legal Pages
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isCookiesOpen, setIsCookiesOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  
  const [addListingConfig, setAddListingConfig] = useState<{
    type?: 'product' | 'service';
    category?: string;
    forceWholesale?: boolean;
  }>({});
  const [serviceFilter, setServiceFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [farmerCountyFilter, setFarmerCountyFilter] = useState<string>('All');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [featuredListingIds, setFeaturedListingIds] = useState<Set<string>>(new Set());
  const [listingComments, setListingComments] = useState<Record<string, ListingComment[]>>({});

  const [buyerLocation, setBuyerLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [insightLoadingFarmerId, setInsightLoadingFarmerId] = useState<string | null>(null);
  const [showAssistant, setShowAssistant] = useState(false);

  const assignPlaceholderImages = (products: Product[]): Product[] => {
    const imageMap: { [key: string]: string } = {
        'coffee': 'https://images.unsplash.com/photo-1511920183353-30c14b5349e9?q=80&w=800&auto=format&fit=crop',
        'phone': 'https://images.unsplash.com/photo-1580910051074-3eb694886505?q=80&w=800&auto=format&fit=crop',
        'dress': 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=800&auto=format&fit=crop',
        'clothing': 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop',
        'sofa': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop',
        'furniture': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop',
        'maize': 'https://images.unsplash.com/photo-1598239924258-004868156c49?q=80&w=800&auto=format&fit=crop',
        'plumbing': 'https://images.unsplash.com/photo-1601431685280-c6da41aa370e?q=80&w=800&auto=format&fit=crop',
        'laptop': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop',
        'computer': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop',
        'course': 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?q=80&w=800&auto=format&fit=crop',
        'digital': 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?q=80&w=800&auto=format&fit=crop',
        'bag': 'https://images.unsplash.com/photo-1553062407-98eeb68c6a62?q=80&w=800&auto=format&fit=crop',
        'shoe': 'https://images.unsplash.com/photo-1542291026-7eec264c27ab?q=80&w=800&auto=format&fit=crop',
        'watch': 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=800&auto=format&fit=crop',
        'camera': 'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?q=80&w=800&auto=format&fit=crop',
        'car': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800&auto=format&fit=crop',
        'vegetable': 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?q=80&w=800&auto=format&fit=crop',
        'fruit': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=800&auto=format&fit=crop',
        'book': 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop',
    };
    const defaultImage = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop';

    return products.map(product => {
        if (product.image) return product; // Don't override images from DB

        const title = product.title.toLowerCase();
        let imageUrl = defaultImage;

        for (const key in imageMap) {
            if (title.includes(key)) {
                imageUrl = imageMap[key];
                break;
            }
        }
        return { ...product, image: imageUrl };
    });
  };

  const assignPlaceholderAvatars = (sellers: User[]): User[] => {
    const avatars = [
        'https://images.unsplash.com/photo-1597916819323-524b07f23440?q=80&w=200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1550009158-94ae76552485?q=80&w=200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1581822261290-991b38693d1b?q=80&w=200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=200&auto=format&fit=crop'
    ];
    return sellers.map((seller, index) => {
        if (seller.avatar && seller.avatar.length > 0) return seller;
        if (seller.role === 'admin') return { ...seller, avatar: ''};
        return { ...seller, avatar: avatars[index % avatars.length] };
    });
  };


  // Get buyer's location for distance calculation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setBuyerLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.warn("Geolocation permission denied.", error);
          setBuyerLocation({ lat: -1.286389, lng: 36.817223 });
        }
      );
    } else {
      console.warn("Geolocation is not supported by this browser.");
      setBuyerLocation({ lat: -1.286389, lng: 36.817223 });
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Fetch listings (all hub types: marketplace, wholesale, digital, services, farmer, live)
            const { data: listingsData, error: listingsError } = await supabaseClient
                .from('listings')
                .select('*')
                .eq('status', 'active');

            if (listingsError) throw listingsError;

            let combinedProducts = assignPlaceholderImages(mapKeysToCamelCase(listingsData || []) as Product[]);
            setProducts(combinedProducts);

            // Fetch all users (sellers, admins, etc.)
            const { data: usersData, error: usersError } = await supabaseClient
                .from('users')
                .select('*')
                .eq('verified', true);
            
            if (usersError) throw usersError;
            let allSellers = assignPlaceholderAvatars(mapKeysToCamelCase([...(usersData || []), ADMIN_USER]) as User[]);

            const usersMap = new Map<string, User>((usersData || []).map((u: any) => [u.id, mapKeysToCamelCase(u) as User]));

            // Fetch persisted reviews and attach to sellers
            try {
              const reviewsResult = await getAllReviews(2000);
              if (reviewsResult.success && Array.isArray((reviewsResult as any).reviews)) {
                const reviewsBySeller: Record<string, Review[]> = {};

                (reviewsResult as any).reviews.forEach((dbReview: any) => {
                  const buyer = usersMap.get(dbReview.buyerId);
                  const sellerId = dbReview.sellerId;
                  if (!sellerId) return;

                  const mappedReview: Review = {
                    id: dbReview.id,
                    listingId: dbReview.listingId,
                    sellerId: dbReview.sellerId,
                    buyerId: dbReview.buyerId,
                    author: buyer?.name || 'Buyer',
                    rating: dbReview.rating,
                    comment: dbReview.comment || '',
                    date: new Date(dbReview.createdAt || Date.now()).toISOString().split('T')[0],
                    status: dbReview.status || 'approved',
                  };

                  if (!reviewsBySeller[sellerId]) reviewsBySeller[sellerId] = [];
                  reviewsBySeller[sellerId].push(mappedReview);
                });

                allSellers = allSellers.map(seller => ({
                  ...seller,
                  reviews: reviewsBySeller[seller.id] || seller.reviews || [],
                }));
              }
            } catch (reviewsErr) {
              console.warn('Could not fetch persisted reviews:', reviewsErr);
            }

            setSellers(allSellers);

            // Fetch persisted listing comments
            try {
              const commentsResult = await getAllListingComments(3000);
              if (commentsResult.success && Array.isArray((commentsResult as any).comments)) {
                const groupedComments: Record<string, ListingComment[]> = {};

                (commentsResult as any).comments.forEach((dbComment: any) => {
                  const buyer = usersMap.get(dbComment.buyerId);
                  const listingId = dbComment.listingId;
                  if (!listingId) return;

                  const mappedComment: ListingComment = {
                    id: dbComment.id,
                    listingId,
                    sellerId: dbComment.sellerId,
                    buyerId: dbComment.buyerId,
                    author: dbComment.authorName || buyer?.name || 'Buyer',
                    comment: dbComment.comment || '',
                    date: new Date(dbComment.createdAt || Date.now()).toISOString().split('T')[0],
                    status: dbComment.status || 'approved',
                  };

                  if (!groupedComments[listingId]) groupedComments[listingId] = [];
                  groupedComments[listingId].push(mappedComment);
                });

                setListingComments(groupedComments);
              }
            } catch (commentsErr) {
              console.warn('Could not fetch persisted listing comments:', commentsErr);
            }

            // Fetch orders
            const { data: ordersData, error: ordersError } = await supabaseClient
                .from('orders')
                .select('*');
            
            if (ordersError) throw ordersError;
            setOrders(mapKeysToCamelCase(ordersData || []) as Order[]);

            // Fetch buying requests
            const { data: buyingRequestsData, error: buyingRequestsError } = await supabaseClient
                .from('buyingRequests')
                .select('*');
            
            if (buyingRequestsError) throw buyingRequestsError;
            setBuyingRequests(mapKeysToCamelCase(buyingRequestsData || []) as BuyingRequest[]);
            
            // Fetch farmers
            const { data: farmersData, error: farmersError } = await supabaseClient
                .from('farmerProfiles')
                .select('*');
            
            if (farmersError) {
                console.warn('Could not fetch farmers:', farmersError);
                setFarmers([]);
            } else {
                setFarmers(mapKeysToCamelCase(farmersData || []) as FarmerProfile[]);
            }

            // Fetch live streams
            const { data: streamsData, error: streamsError } = await supabaseClient
                .from('liveStreams')
                .select('*')
                .eq('status', 'live');
            
            if (streamsError) {
                console.warn('Could not fetch live streams:', streamsError);
                setLiveStreams([]);
            } else {
                setLiveStreams(mapKeysToCamelCase(streamsData || []) as LiveStream[]);
            }

            // Fetch featured listings for badge display
            try {
                const { data: featuredData } = await getAllFeaturedListings(1000, 0);
                if (featuredData) {
                    setFeaturedListingIds(new Set(featuredData.map((f: any) => f.listing_id)));
                }
            } catch (err) {
                console.warn('Could not fetch featured listings:', err);
            }

        } catch (error) {
            console.error("Error fetching data from Supabase:", error);
            // Don't show alert - just log to console during development
            setProducts([]);
            setSellers([ADMIN_USER]);
            setOrders([]);
            setBuyingRequests([]);
            setFarmers([]);
            setLiveStreams([]);
        } finally {
            setIsLoading(false);
        }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowAssistant(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  const isSubscriptionActive = user.subscriptionExpiry !== null && user.subscriptionExpiry > Date.now();
  
  const handleViewChange = (newView: ViewState) => {
    setView(newView);
    setCategoryFilter(null);
  }

  const handleCategorySelect = (category: string | null) => {
    setView('marketplace');
    setCategoryFilter(category);
  };





  const handleContactSupplier = (product: Product) => {
    const seller = sellers.find(s => s.id === product.sellerId);
    const sellerPhone = product.seller_phone || seller?.phone;
    if (sellerPhone) {
      const phoneNumber = sellerPhone.startsWith('0') ? '254' + sellerPhone.substring(1) : sellerPhone;
      const message = encodeURIComponent(`Hello ${seller?.name || product.sellerName}, I am interested in your Pambo item: "${product.title}".`);
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
        window.open(whatsappUrl, '_blank');
    } else {
        alert('This seller has not provided a contact phone number.');
    }
  };
  
  const handleContactFarmer = (farmer: FarmerProfile) => {
    const phoneNumber = farmer.phone.startsWith('0') ? '254' + farmer.phone.substring(1) : farmer.phone;
    const message = encodeURIComponent(`Habari ${farmer.name}, nimeona shamba lako Pambo.com na ninavutiwa na ${farmer.crop}.`);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  }

  const handleSaveProduct = async (product: Product) => {
    try {
      const isFirstTimeListing = !products.some(p => p.sellerId === user.id) && !productToEdit;

      const productWithSeller: Product = {
        ...product,
        sellerId: user.id,
        sellerName: user.name,
        seller_phone: product.seller_phone || user.phone,
        verified: user.verified,
        listingStatus: isFirstTimeListing ? 'pending' : 'active',
        status: 'Active',
      };

      // Save to Supabase database
      const dbResult = productToEdit 
        ? await updateListing(productWithSeller.id, productWithSeller)
        : await createListing(productWithSeller);

      if (!dbResult) {
        alert('❌ Failed to save listing. Please try again.');
        return;
      }

      // Also update React state for instant UI feedback
      const exists = products.find(p => p.id === productWithSeller.id);
      if (exists) {
        setProducts(products.map(p => p.id === productWithSeller.id ? { ...productWithSeller, listingStatus: p.listingStatus } : p));
      } else {
        setProducts(prev => [productWithSeller, ...prev]);
      }
      
      if (isFirstTimeListing) {
          alert("✅ Your first listing has been submitted for admin approval. Future listings will be approved instantly by our AI.");
      } else {
          alert("✅ Product listing published successfully!");
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('❌ Error saving product. Please try again.');
    }
  };
  
  const handleDeleteProduct = (productId: string) => {
    if (confirm('Are you sure you want to delete this listing?')) {
      setProducts(products.filter(p => p.id !== productId));
    }
  };
  
  const handleOpenEditModal = (product: Product) => {
    setProductToEdit(product);
    setIsAddListingOpen(true);
  };

  const handleVerify = () => {
    setUser(prev => ({ ...prev, verified: true, role: 'seller' }));
    setIsVerificationOpen(false);
    setTimeout(() => handleStartSelling(), 500);
  };

  const handleStartSelling = (config: { type?: 'product' | 'service', forceWholesale?: boolean, category?: string } = {}) => {
    if (user.accountStatus === 'pending') {
        alert("Your account is pending admin approval. You cannot add listings yet.");
        return;
    }
    if (user.accountStatus === 'suspended') {
        alert("Your account has been banned and you cannot create new listings.");
        return;
    }
    setAddListingConfig(config);
    setIsAddListingOpen(true);
  };

  const handleAuthSuccess = (details: { name: string, email: string, phone?: string }) => {
      if (details.email === ADMIN_USER.email) {
          setIsLoggedIn(true);
          setUser(ADMIN_USER);
          setIsAuthOpen(false);
          setView('admin');
          return;
      }

      const existingUser = sellers.find(s => s.email === details.email);
      
      if (existingUser) {
        if(existingUser.accountStatus === 'suspended') {
            alert('Your account has been banned. You are not permitted to log in.');
            setIsAuthOpen(true);
            return;
        }
        setUser(existingUser);
        setIsLoggedIn(true);
        setIsAuthOpen(false);
        
        // If coming from checkout, proceed to payment
        if (isCheckoutPending) {
          setIsCheckoutPending(false);
          setTimeout(() => {
            const total = cart.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
            if (total > 0) {
              setCheckoutAmount(total);
              setIsMPesaOpen(true);
            }
          }, 300);
        }

      } else {
        const name = details.name === 'User' ? details.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : details.name;
        const newUser: User = { 
            id: 'user-' + Date.now(),
            name: name,
            email: details.email,
            phone: details.phone,
            role: 'seller',
            verified: false, 
            avatar: `https://i.pravatar.cc/150?u=${details.email}`, 
            subscriptionExpiry: null,
            accountStatus: 'pending',
            reviews: [],
            joinDate: new Date().toISOString(),
            following: [],
            followers: [],
            acceptedTermsTimestamp: null,
        };
        setOnboardingUser(newUser);
        setIsSellerOnboardingOpen(true);
        setIsAuthOpen(false);
        setIsCheckoutPending(false);
      }
  };
  
  const handleOnboardingComplete = (onboardingData: Partial<User>) => {
    if (!onboardingUser) return;

    const completedUser = {
        ...onboardingUser,
        ...onboardingData,
        name: onboardingData.businessName || onboardingUser.name,
        acceptedTermsTimestamp: Date.now(),
    };
    
    setSellers(prev => [...prev, completedUser]);
    setUser(completedUser);
    setIsLoggedIn(true);
    setIsSellerOnboardingOpen(false);
    setOnboardingUser(null);
    alert('Your application has been submitted for admin approval. Welcome to Pambo!');
    setView('dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser({
        id: 'guest', name: 'Guest User', email: '', phone: '', role: 'buyer',
        verified: false, avatar: '', subscriptionExpiry: null, accountStatus: 'active', joinDate: new Date().toISOString(),
        following: [], followers: [],
    });
    setView('home');
  };

  const handleSubscriptionPaymentConfirm = () => {
      const thirtyDaysInMillis = 30 * 24 * 60 * 60 * 1000;
      setUser(prev => ({ 
          ...prev, 
          subscriptionExpiry: Date.now() + thirtyDaysInMillis,
          role: 'seller',
      }));
      setIsSubscriptionOpen(false);
      
      if (user.verified) {
          setTimeout(() => { setIsAddListingOpen(true); }, 500);
      } else {
          setTimeout(() => { setIsVerificationOpen(true); }, 500);
      }
  };

  const handleCloseAddListing = () => {
    setIsAddListingOpen(false);
    setProductToEdit(null);
    setAddListingConfig({});
  }

  const handleAddReview = async (listingId: string, sellerId: string, review: Omit<Review, 'date' | 'author' | 'status'>) => {
    const reviewerName = isLoggedIn ? user.name : 'Anonymous Guest';
    const reviewDate = new Date().toISOString().split('T')[0];

    const persisted = await createReview({
      listingId,
      buyerId: user.id,
      sellerId,
      rating: review.rating,
      comment: review.comment,
      helpfulCount: 0,
      status: 'pending',
    });

    if (!persisted.success) {
      alert('❌ Could not save your review. Please try again.');
      return;
    }

    const newReview: Review = {
      id: (persisted as any).review?.id,
      listingId,
      sellerId,
      buyerId: user.id,
        ...review,
        author: reviewerName,
        date: reviewDate,
      status: 'pending',
    };

    setSellers(prevSellers => 
        prevSellers.map(seller => {
            if (seller.id === sellerId) {
                return {
                    ...seller,
                    reviews: [newReview, ...(seller.reviews || [])]
                };
            }
            return seller;
        })
    );
    alert('✅ Thank you for your review! It is pending admin approval.');
  };

  const handleAddListingComment = async (productId: string, comment: string) => {
    if (!comment.trim()) return;

    const relatedProduct = products.find(p => p.id === productId);
    if (!relatedProduct) {
      alert('❌ Could not find this listing.');
      return;
    }

    const persisted = await createListingComment({
      listingId: relatedProduct.id,
      sellerId: relatedProduct.sellerId,
      buyerId: user.id,
      authorName: isLoggedIn ? user.name : 'Anonymous Guest',
      comment: comment.trim(),
    });

    if (!persisted.success) {
      alert('❌ Could not save your comment. Please try again.');
      return;
    }

    const newComment: ListingComment = {
      id: (persisted as any).comment?.id,
      listingId: productId,
      sellerId: relatedProduct.sellerId,
      buyerId: user.id,
      author: isLoggedIn ? user.name : 'Anonymous Guest',
      comment: comment.trim(),
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
    };

    setListingComments(prev => ({
      ...prev,
      [productId]: [newComment, ...(prev[productId] || [])],
    }));

    alert('✅ Comment submitted and pending admin approval.');
  };

  const handleAccountDeletionRequest = () => {
    setIsDeleteModalOpen(false);
    alert('Your account deletion request has been submitted for admin approval. You will be logged out.');
    handleLogout();
  };

  const handleProductStatusChange = (productId: string, status: Product['status']) => {
    setProducts(products.map(p => p.id === productId ? { ...p, status } : p));
  };
  
  const handleOrderStatusChange = (orderId: string, status: Order['status']) => {
    setOrders(prevOrders => prevOrders.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const handleUpdateProfile = (details: { phone?: string }) => {
    setUser(prevUser => ({ ...prevUser, ...details }));
    setSellers(prevSellers =>
        prevSellers.map(s => (s.id === user.id ? { ...s, ...details } : s))
    );
    alert('Profile updated successfully!');
  };
  
  const handleAcceptTerms = () => {
    const timestamp = Date.now();
    const updatedUser = { ...user, acceptedTermsTimestamp: timestamp };
    setUser(updatedUser);
    setSellers(prevSellers =>
        prevSellers.map(s => (s.id === user.id ? updatedUser : s))
    );
  };
  
  const handleSellerStatusChange = (sellerId: string, status: User['accountStatus']) => {
    setSellers(sellers.map(s => s.id === sellerId ? { ...s, accountStatus: status } : s));
    if (sellerId === user.id) {
        setUser(prev => ({...prev, accountStatus: status}));
    }
  };
  
  const handleSellerVerificationChange = (sellerId: string, verified: boolean) => {
    setSellers(prevSellers =>
      prevSellers.map(s => (s.id === sellerId ? { ...s, verified } : s))
    );
    setProducts(prevProducts =>
      prevProducts.map(p => (p.sellerId === sellerId ? { ...p, verified } : p))
    );
    if (user.id === sellerId) {
      setUser(prevUser => ({ ...prevUser, verified }));
    }
  };

  const handleListingStatusChange = (productId: string, status: Product['listingStatus']) => {
    setProducts(products.map(p => p.id === productId ? { ...p, listingStatus: status } : p));
  };

  const handleReviewStatusChange = async (reviewId: string, status: Review['status']) => {
    const result = await updateReviewStatus(reviewId, status);
    if (!result.success) {
      alert('❌ Failed to update review status.');
      return;
    }

    setSellers(prevSellers => prevSellers.map(s => ({
      ...s,
      reviews: s.reviews?.map(r => r.id === reviewId ? { ...r, status } : r)
    })));
  };

  const handleCommentStatusChange = async (commentId: string, status: ListingComment['status']) => {
    const result = await updateListingCommentStatus(commentId, status);
    if (!result.success) {
      alert('❌ Failed to update comment status.');
      return;
    }

    setListingComments(prev => {
      const updated: Record<string, ListingComment[]> = {};

      Object.entries(prev).forEach(([listingId, comments]) => {
        updated[listingId] = comments.map(comment =>
          comment.id === commentId ? { ...comment, status } : comment
        );
      });

      return updated;
    });
  };

  const handleContactBuyer = (request: BuyingRequest) => {
      const buyer = sellers.find(s => s.id === request.buyerId);
      if (buyer && buyer.phone) {
        const phoneNumber = buyer.phone.startsWith('0') ? '254' + buyer.phone.substring(1) : buyer.phone;
        const message = encodeURIComponent(`Hello ${buyer.name}, I am a supplier on Pambo and I can fulfill your buying request for: "${request.title}".`);
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
        window.open(whatsappUrl, '_blank');
      } else {
          alert("This buyer has not provided a contact phone number.");
      }
  };

  const handleCtaAction = (actionType: string) => {
    switch (actionType) {
        case 'startSellingProduct': handleStartSelling({ type: 'product' }); break;
        case 'startSellingService': handleStartSelling({ type: 'service' }); break;
        case 'startSellingDigital': handleStartSelling({ category: 'Online Courses' }); break;
        case 'startSellingWholesale': handleStartSelling({ type: 'product', forceWholesale: true }); break;
        case 'shopWholesale': setView('wholesale'); break;
        case 'joinFarmers': setView('farmers'); break;
        default: console.log("Unknown CTA action:", actionType);
    }
  };
  
  const handleJoinFarmer = (farmerDetails: { name: string; phone: string; location: string; crop: string; subscriptionExpiry: number; coordinates: { lat: number; lng: number }; county: string; }) => {
    const getUnitAndPrice = (crop: string) => {
      switch (crop) {
        case 'Viazi': return { unit: 'kg', pricePerUnit: 100 };
        case 'Managu': return { unit: 'bunch', pricePerUnit: 50 };
        case 'Madizi': default: return { unit: 'bunch', pricePerUnit: 500 };
      }
    };
    const newFarmer: FarmerProfile = {
        id: `farmer-${Date.now()}`,
        role: 'seller',
        verified: true,
        avatar: 'https://images.unsplash.com/photo-1597916819323-524b07f23440?q=80&w=200&auto=format&fit=crop',
        accountStatus: 'active',
        joinDate: new Date().toISOString(),
        following: [], followers: [], acceptedTermsTimestamp: Date.now(),
        reviews: [],
        ...farmerDetails,
        ...getUnitAndPrice(farmerDetails.crop),
    };
    setFarmers(prev => [...prev, newFarmer]);
    setSellers(prev => [...prev, newFarmer]);
  };

  const handleGetDeliveryInsight = async (farmerId: string) => {
    if (!buyerLocation) {
      alert("Could not determine your location to calculate delivery insight.");
      return;
    }
    setInsightLoadingFarmerId(farmerId);
    try {
      const farmer = farmers.find(f => f.id === farmerId);
      if (!farmer) throw new Error("Farmer not found");
      const { generateDeliveryInsight } = await import('./services/geminiService');
      const insightText = await generateDeliveryInsight(farmer, buyerLocation, FUEL_RATE_PER_KM, BASE_DELIVERY_FEE);
      setFarmers(prevFarmers => 
        prevFarmers.map(f => f.id === farmerId ? { ...f, deliveryInsight: insightText } : f)
      );
    } catch (error) {
      console.error("Failed to get delivery insight:", error);
      alert("Sorry, we couldn't generate a delivery insight at this time.");
    } finally {
      setInsightLoadingFarmerId(null);
    }
  };

  const handleToggleFollow = (sellerId: string) => {
    setUser(prevUser => {
        const isFollowing = prevUser.following.includes(sellerId);
        const newFollowing = isFollowing
            ? prevUser.following.filter(id => id !== sellerId)
            : [...prevUser.following, sellerId];
        return { ...prevUser, following: newFollowing };
    });
    setSellers(prevSellers =>
        prevSellers.map(s => {
            if (s.id === sellerId) {
                const followers = s.followers || [];
                const isFollowed = followers.includes(user.id);
                const newFollowers = isFollowed ? followers.filter(id => id !== user.id) : [...followers, user.id];
                return { ...s, followers: newFollowers };
            }
            return s;
        })
    );
  };

  const renderContent = () => {
    const activeSellers = sellers.filter(s => s.accountStatus === 'active');
    const activeSellerIds = new Set(activeSellers.map(s => s.id));
    const visibleProducts = products.filter(p => p.listingStatus === 'active' && p.status !== 'Hidden' && activeSellerIds.has(p.sellerId));
    const digitalProducts = visibleProducts.filter(p => p.isDigital);
    const marketplaceProductsBase = visibleProducts.filter(p => !p.isWholesale && !SERVICE_CATEGORIES.includes(p.category) && !p.isDigital);
    let marketplaceProducts = categoryFilter ? marketplaceProductsBase.filter(p => p.category === categoryFilter) : marketplaceProductsBase;
    const serviceProducts = visibleProducts.filter(p => SERVICE_CATEGORIES.includes(p.category));
    const wholesaleProducts = visibleProducts.filter(p => p.isWholesale);

    // Sort products: featured first, then regular
    const sortByFeatured = (items: Product[]) => {
      const featured = items.filter(p => featuredListingIds.has(p.id));
      const notFeatured = items.filter(p => !featuredListingIds.has(p.id));
      return showFeaturedOnly ? featured : [...featured, ...notFeatured];
    };

    // Apply sorting to all product lists
    marketplaceProducts = sortByFeatured(marketplaceProducts);
    const wholesaleProductsSorted = sortByFeatured(wholesaleProducts);
    const digitalProductsSorted = sortByFeatured(digitalProducts);

    switch(view) {
        case 'home':
            return (
                <ShopLayout onViewChange={handleViewChange} onCategorySelect={handleCategorySelect} selectedCategory={categoryFilter}>
                    <div className="space-y-8">
                        <HeroBanner onStartSelling={() => handleStartSelling()} />
                        <FeaturedProductsCarousel 
                            products={sortByFeatured(marketplaceProducts).slice(0, 8)}
                            onViewProduct={setSelectedProduct}
                            onContactSupplier={handleContactSupplier}
                            liveStreams={liveStreams}
                        />
                        <TrustAndVerification />
                    </div>
                </ShopLayout>
            );
        case 'marketplace':
            return (
                <ShopLayout onViewChange={handleViewChange} onCategorySelect={handleCategorySelect} selectedCategory={categoryFilter}>
                    <section>
                         <SectionHero {...SECTION_BANNERS.marketplace} onCtaClick={() => handleCtaAction(SECTION_BANNERS.marketplace.ctaActionType)} />
                        
                        {/* Featured Filter Toggle */}
                        {marketplaceProducts.some(p => featuredListingIds.has(p.id)) && (
                          <div className="flex items-center gap-2 mt-4 mb-6">
                            <button
                              onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
                              className={`px-6 py-2 rounded-full font-semibold text-sm transition flex items-center gap-2 ${
                                showFeaturedOnly 
                                  ? 'bg-yellow-400 text-gray-900 shadow-md' 
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              <Sparkles size={16} className={showFeaturedOnly ? 'fill-gray-900' : ''} />
                              {showFeaturedOnly ? 'Featured Only' : 'Show Featured'}
                            </button>
                            {showFeaturedOnly && (
                              <button
                                onClick={() => setShowFeaturedOnly(false)}
                                className="text-sm text-gray-500 hover:text-gray-700 underline"
                              >
                                Clear Filter
                              </button>
                            )}
                          </div>
                        )}

                        {marketplaceProducts.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-8">
                                {marketplaceProducts.map(product => (
                                    <ProductCard 
                                      key={product.id} 
                                      product={product} 
                                      onContactSupplier={handleContactSupplier} 
                                      onViewProduct={setSelectedProduct} 
                                      currentUserId={isLoggedIn ? user.id : undefined}
                                      onFeaturedSuccess={() => {
                                        // Refresh featured listings
                                        getAllFeaturedListings(1000, 0).then(({ data }) => {
                                          if (data) setFeaturedListingIds(new Set(data.map((f: any) => f.listing_id)));
                                        });
                                      }}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-lg border border-dashed border-gray-300 mt-8">
                                <Package size={48} className="mx-auto text-gray-400 mb-4" />
                                <h3 className="text-lg font-semibold text-gray-700">
                                  {showFeaturedOnly ? 'No Featured Products' : 'No Products Found'}
                                </h3>
                                <p className="text-gray-500 mt-1 mb-4">
                                    {showFeaturedOnly ? 'No featured listings match your search.' : categoryFilter ? `There are no products in the "${categoryFilter}" category yet.` : 'The marketplace is currently empty.'}
                                </p>
                                <button onClick={() => { setCategoryFilter(null); setShowFeaturedOnly(false); }} className="bg-orange-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-orange-700 transition">
                                    View All Products
                                </button>
                            </div>
                        )}
                    </section>
                </ShopLayout>
            );
        case 'wholesale':
            return (
                <WholesaleHub 
                    isLoggedIn={isLoggedIn}
                    user={user}
                    onOpenSubscription={() => setIsSubscriptionOpen(true)}
                />
            );
        case 'farmers':
            const farmersWithDistance = buyerLocation ? farmers.map(f => ({ ...f, distance: calculateDistance(buyerLocation.lat, buyerLocation.lng, f.coordinates.lat, f.coordinates.lng) })) : farmers;
            const filteredFarmers = farmerCountyFilter === 'All' ? farmersWithDistance : farmersWithDistance.filter(f => f.county === farmerCountyFilter);
            return (
                <div className="space-y-8">
                    <SectionHero {...SECTION_BANNERS.farmers} onCtaClick={() => handleCtaAction(SECTION_BANNERS.farmers.ctaActionType)} />
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-4 mb-4">
                            <label htmlFor="county-filter" className="font-bold text-gray-700">Filter by County:</label>
                            <select id="county-filter" value={farmerCountyFilter} onChange={e => setFarmerCountyFilter(e.target.value)} className="bg-white border border-gray-300 rounded-md px-3 py-2 text-md focus:border-green-500 outline-none">
                                <option value="All">All Counties</option>
                                {KENYA_COUNTIES.map(county => <option key={county} value={county}>{county}</option>)}
                            </select>
                        </div>
                        <FarmersMapView farmers={filteredFarmers} onContactFarmer={handleContactFarmer} onGetDeliveryInsight={handleGetDeliveryInsight} insightLoadingFarmerId={insightLoadingFarmerId} />
                    </div>
                    <MkulimaSignup onJoin={handleJoinFarmer} />
                </div>
            );
        case 'digital':
            return (
                <div className="space-y-6">
                    <SectionHero {...SECTION_BANNERS.digital} onCtaClick={() => handleCtaAction(SECTION_BANNERS.digital.ctaActionType)} />
                    {digitalProductsSorted.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-8">
                            {digitalProductsSorted.map(p => (
                                <ProductCard 
                                  key={p.id} 
                                  product={p} 
                                  onContactSupplier={handleContactSupplier} 
                                  onViewProduct={setSelectedProduct} 
                                  currentUserId={isLoggedIn ? user.id : undefined}
                                  onFeaturedSuccess={() => {
                                    getAllFeaturedListings(1000, 0).then(({ data }) => {
                                      if (data) setFeaturedListingIds(new Set(data.map((f: any) => f.listing_id)));
                                    });
                                  }}
                                />
                            ))}
                        </div>
                    ) : (
                         <div className="text-center py-20 bg-white rounded-lg border border-dashed border-gray-300 mt-8">
                            <Download size={48} className="mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700">The Digital Hub is empty.</h3>
                            <p className="text-gray-500 mt-1 mb-4">Be the first to sell a digital product!</p>
                            <button onClick={() => handleStartSelling({ category: 'Online Courses' })} className="bg-orange-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-orange-700 transition">
                                Sell Your Item
                            </button>
                        </div>
                    )}
                </div>
            );
        case 'services':
            const filteredServices = serviceProducts.filter(p => !serviceFilter || p.category === serviceFilter);
            return (
                <div className="space-y-8">
                     <SectionHero {...SECTION_BANNERS.services} onCtaClick={() => handleCtaAction(SECTION_BANNERS.services.ctaActionType)} />
                    <ServiceCategoryGrid onSelectCategory={setServiceFilter} />
                    <div className="flex justify-between items-center mt-6">
                        <h3 className="text-xl font-bold text-gray-800">{serviceFilter ? `Showing results for "${serviceFilter}"` : 'All Services'}</h3>
                        {serviceFilter && (<button onClick={() => setServiceFilter(null)} className="text-sm font-semibold text-orange-600 hover:underline">Clear Filter</button>)}
                    </div>
                    {filteredServices.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredServices.map(p => (<ServiceCard key={p.id} service={p} onViewService={setSelectedProduct} onContactSupplier={handleContactSupplier} />))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white rounded-lg border border-gray-200"><p className="text-gray-500">No services found {serviceFilter ? `in the "${serviceFilter}" category` : ''} yet.</p><p className="mt-2 text-sm text-gray-400">Be the first to offer this service!</p></div>
                    )}
                </div>
            );
        case 'dashboard':
            const currentUserIsFarmer = farmers.find(f => f.id === user.id);
            if (currentUserIsFarmer) {
                return <MkulimaDashboard farmerName={currentUserIsFarmer.name} crop={currentUserIsFarmer.crop} />;
            }
            return <Dashboard 
                user={user} 
                isSubscriptionActive={isSubscriptionActive}
                listings={products.filter(p => p.sellerId === user.id)}
                orders={orders.filter(o => o.userId === user.id)}
                sales={orders.filter(o => o.sellerId === user.id)}
                onAddListing={(type) => handleStartSelling({ type })}
                onEditListing={handleOpenEditModal}
                onDeleteListing={handleDeleteProduct}
                onManageSubscription={() => setIsSubscriptionOpen(true)}
                onLogout={handleLogout}
                onDeleteAccountRequest={() => setIsDeleteModalOpen(true)}
                onProductStatusChange={handleProductStatusChange}
                onOrderStatusChange={handleOrderStatusChange}
                onUpdateProfile={handleUpdateProfile}
             />;
        case 'admin':
          return <AdminPanel sellers={sellers} products={products} listingComments={listingComments} onSellerStatusChange={handleSellerStatusChange} onSellerVerificationChange={handleSellerVerificationChange} onListingStatusChange={handleListingStatusChange} onReviewStatusChange={handleReviewStatusChange} onCommentStatusChange={handleCommentStatusChange} />;
        default: return <p>Page not found</p>;
    }
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="mx-auto text-orange-500 animate-spin" />
          <p className="mt-4 text-lg font-semibold text-gray-700">Loading Pambo Marketplace...</p>
        </div>
      </div>
    );
  }

  if (isLoggedIn && user.accountStatus === 'suspended') {
    return (
      <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 size={36} className="text-orange-500 animate-spin" /></div>}>
        <BannedView onLogout={handleLogout} />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      <div className="flex-grow">
        <Header user={user} isLoggedIn={isLoggedIn} onViewChange={handleViewChange} onStartSelling={() => handleStartSelling()} onLoginClick={() => {}} onLogout={handleLogout} />
        <div className="hidden md:block">{view !== 'dashboard' && view !== 'admin' && <SubNav view={view} onViewChange={handleViewChange} />}</div>
        <main className="container mx-auto px-4 lg:px-8 py-2 flex-1 mb-24 md:mb-8">
          <Suspense fallback={<div className="py-12 flex items-center justify-center"><Loader2 size={28} className="text-orange-500 animate-spin" /></div>}>
            {renderContent()}
          </Suspense>
        </main>
      </div>
      <Footer 
        onNavigate={handleViewChange}
        currentUser={isLoggedIn ? user : null}
        onOpenTerms={() => setIsTermsOpen(true)}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        onOpenCookies={() => setIsCookiesOpen(true)}
        onOpenContact={() => setIsContactOpen(true)}
        onAdminLogin={() => console.log('Admin panel opened')}
      />
      <BottomNav view={view} onViewChange={handleViewChange} onStartSelling={() => handleStartSelling()} />
      {/* AuthModal removed - fully guest-enabled marketplace */}
      <Suspense fallback={null}>
        <VerificationModal isOpen={isVerificationOpen} onClose={() => setIsVerificationOpen(false)} onVerify={handleVerify} />
      </Suspense>
      <Suspense fallback={null}>
        <SellerOnboardingModal isOpen={isSellerOnboardingOpen} user={onboardingUser} onSubmit={handleOnboardingComplete} onClose={() => { setIsSellerOnboardingOpen(false); setOnboardingUser(null); }} />
      </Suspense>
      <Suspense fallback={null}>
        <SubscriptionModal isOpen={isSubscriptionOpen} onClose={() => setIsSubscriptionOpen(false)} onConfirmPayment={handleSubscriptionPaymentConfirm} isExpired={user.subscriptionExpiry !== null && user.subscriptionExpiry < Date.now()} />
      </Suspense>
      <Suspense fallback={null}>
        <AddListingModal isOpen={isAddListingOpen} onClose={handleCloseAddListing} onSave={handleSaveProduct} productToEdit={productToEdit} initialType={addListingConfig.type} forceWholesale={addListingConfig.forceWholesale} initialCategory={addListingConfig.category} sellerPhone={user.phone} />
      </Suspense>
      <Suspense fallback={null}>
        <ProductDetailsModal isOpen={!!selectedProduct} product={selectedProduct} onClose={() => setSelectedProduct(null)} onContact={() => { if (selectedProduct) handleContactSupplier(selectedProduct); }} sellers={sellers} onAddReview={handleAddReview} listingComments={listingComments} onAddComment={handleAddListingComment} isLoggedIn={isLoggedIn} currentUser={user} onToggleFollow={handleToggleFollow} />
      </Suspense>
      <Suspense fallback={null}>
        <AccountDeletionRequestModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleAccountDeletionRequest} />
      </Suspense>
      
      {/* Policy & Legal Pages */}
      {isTermsOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 overflow-auto">
          <div className="min-h-screen">
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 size={28} className="text-white animate-spin" /></div>}>
              <TermsOfService onClose={() => setIsTermsOpen(false)} />
            </Suspense>
          </div>
        </div>
      )}
      
      {isPrivacyOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 overflow-auto">
          <div className="min-h-screen">
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 size={28} className="text-white animate-spin" /></div>}>
              <PrivacyPolicy onClose={() => setIsPrivacyOpen(false)} />
            </Suspense>
          </div>
        </div>
      )}
      
      {isCookiesOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 overflow-auto">
          <div className="min-h-screen">
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 size={28} className="text-white animate-spin" /></div>}>
              <CookiePolicy onClose={() => setIsCookiesOpen(false)} />
            </Suspense>
          </div>
        </div>
      )}
      
      {isContactOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 overflow-auto">
          <div className="min-h-screen">
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 size={28} className="text-white animate-spin" /></div>}>
              <ContactPage />
            </Suspense>
          </div>
        </div>
      )}
      {showAssistant && (
        <Suspense fallback={null}>
          <AiAssistantWidget />
        </Suspense>
      )}
    </div>
  );
};