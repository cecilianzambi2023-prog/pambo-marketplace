/**
 * App.tsx - Example Integration
 * =============================
 * 
 * Shows how to integrate the complete Hub system into your main Pambo app.
 * Copy this structure into your actual App.tsx
 */

import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// ===================================
// HUB SYSTEM IMPORTS
// ===================================
import { HubProvider } from './contexts/HubContext';
import { HubRouter } from './components/HubRouter';
import { 
  HubSwitcherNav,
  HubSearchSwitcher,
  HubSidebarSwitcher,
} from './components/HubSwitcherNav';
import { HubDashboard } from './components/HubDashboard';
import { HubListingForm } from './components/HubListingForm';

// ===================================
// EXISTING APP IMPORTS
// ===================================
import { AuthProvider } from './contexts/AuthContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';

// ===================================
// LOADING STATE
// ===================================
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

// ===================================
// HEADER COMPONENT
// ===================================
function AppHeader() {
  return (
    <header className="sticky top-0 z-40 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Branding */}
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Pambo</h1>
            <div className="h-6 w-px bg-gray-300" />
          </div>

          {/* Hub Navigation */}
          <div className="flex-1 px-8">
            <HubSwitcherNav />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <HubSearchSwitcher />
            {/* Your existing header items (profile, notifications, etc.) */}
          </div>
        </div>
      </div>
    </header>
  );
}

// ===================================
// SIDEBAR COMPONENT
// ===================================
interface SidebarProps {
  isCollapsed?: boolean;
}

function AppSidebar({ isCollapsed = false }: SidebarProps) {
  return (
    <aside
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } bg-gray-50 border-r border-gray-200 transition-all duration-300`}
    >
      <nav className="p-4">
        <div className="mb-8">
          <h2 className="text-xs font-semibold text-gray-500 uppercase mb-4">
            {isCollapsed ? 'Hubs' : 'Your Hubs'}
          </h2>
          <HubSidebarSwitcher isCollapsed={isCollapsed} />
        </div>

        {/* Your existing sidebar navigation */}
        <div className="space-y-2">
          <NavLink to="/dashboard" isCollapsed={isCollapsed}>
            Dashboard
          </NavLink>
          <NavLink to="/analytics" isCollapsed={isCollapsed}>
            Analytics
          </NavLink>
          <NavLink to="/orders" isCollapsed={isCollapsed}>
            Orders
          </NavLink>
          <NavLink to="/settings" isCollapsed={isCollapsed}>
            Settings
          </NavLink>
        </div>
      </nav>
    </aside>
  );
}

interface NavLinkProps {
  to: string;
  isCollapsed: boolean;
  children: React.ReactNode;
}

function NavLink({ to, isCollapsed, children }: NavLinkProps) {
  return (
    <a
      href={to}
      className={`block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-200 transition ${
        isCollapsed ? 'text-center' : ''
      }`}
    >
      {children}
    </a>
  );
}

// ===================================
// HUB-SPECIFIC PAGE COMPONENTS
// ===================================

// Marketplace Hub Page
function HubMarketplacePage() {
  return (
    <HubRouter>
      <HubDashboard />
    </HubRouter>
  );
}

// Wholesale Hub Page
function HubWholesalePage() {
  return (
    <HubRouter>
      <HubDashboard />
    </HubRouter>
  );
}

// Digital Contents Hub Page
function HubDigitalPage() {
  return (
    <HubRouter>
      <HubDashboard />
    </HubRouter>
  );
}

// Mkulima Mdogo Hub Page (PRIORITY)
function HubMkulimaPage() {
  return (
    <HubRouter>
      <HubDashboard />
    </HubRouter>
  );
}

// Services Hub Page
function HubServicesPage() {
  return (
    <HubRouter>
      <HubDashboard />
    </HubRouter>
  );
}

// Live Commerce Hub Page
function HubLiveCommercePage() {
  return (
    <HubRouter>
      <HubDashboard />
    </HubRouter>
  );
}

// ===================================
// CREATE LISTING PAGE (Hub-specific)
// ===================================

function CreateListingPage() {
  const handleSubmit = async (formData: any) => {
    try {
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to create listing');

      // Show success and redirect
      window.location.href = `/hub/marketplace`; // Or current hub
    } catch (error) {
      console.error('Submit error:', error);
      throw error;
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8">
      <HubListingForm
        onSubmit={handleSubmit}
        onCancel={() => window.history.back()}
      />
    </div>
  );
}

// ===================================
// DASHBOARD PAGE
// ===================================

function DashboardPage() {
  return (
    <HubRouter>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Dashboard</h1>
          {/* Your dashboard content */}
        </div>

        <HubDashboard />
      </div>
    </HubRouter>
  );
}

// ===================================
// MAIN APP LAYOUT
// ===================================

interface AppLayoutProps {
  children: React.ReactNode;
}

function AppLayout({ children }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <AppHeader />

      {/* Main Content Area */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <AppSidebar isCollapsed={sidebarCollapsed} />

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <Suspense fallback={<LoadingSpinner />}>
            {children}
          </Suspense>
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        <p className="text-center text-gray-400">
          © 2024 Pambo - Billion-Dollar Super-App. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

// ===================================
// ERROR BOUNDARY
// ===================================

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Oops!</h1>
            <p className="text-gray-600 max-w-md">
              Something went wrong. Please try refreshing the page.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <pre className="mt-4 text-left bg-gray-100 p-4 rounded-lg overflow-auto max-w-md text-sm">
                {this.state.error?.message}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ===================================
// MAIN APP COMPONENT
// ===================================

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SubscriptionProvider>
          <HubProvider>
            <Router>
              <AppLayout>
                <Routes>
                  {/* Hub Pages */}
                  <Route path="/hub/marketplace" element={<HubMarketplacePage />} />
                  <Route path="/hub/wholesale" element={<HubWholesalePage />} />
                  <Route path="/hub/digital" element={<HubDigitalPage />} />
                  <Route path="/hub/mkulima" element={<HubMkulimaPage />} />
                  <Route path="/hub/services" element={<HubServicesPage />} />
                  <Route path="/hub/live_commerce" element={<HubLiveCommercePage />} />

                  {/* Listing Management */}
                  <Route path="/listing/create" element={<CreateListingPage />} />

                  {/* Standard Pages */}
                  <Route path="/dashboard" element={<DashboardPage />} />

                  {/* Default redirect to marketplace hub */}
                  <Route path="/" element={<HubMarketplacePage />} />
                </Routes>
              </AppLayout>
            </Router>
          </HubProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

// ===================================
// USAGE EXAMPLES IN COMPONENTS
// ===================================

/**
 * Example 1: Use hub info in a component
 * 
 * import { useHub } from './contexts/HubContext';
 * 
 * function MyComponent() {
 *   const { hub, hubId } = useHub();
 *   return <h1>{hub.displayName}</h1>;
 * }
 */

/**
 * Example 2: Check if hub has feature
 * 
 * import { useHubFeatures } from './contexts/HubContext';
 * 
 * function FeatureComponent() {
 *   const { hasFeature } = useHubFeatures();
 *   
 *   if (hasFeature('directContact')) {
 *     return <DirectContactFeature />;
 *   }
 * }
 */

/**
 * Example 3: Get hub business rules
 * 
 * import { useHubRules } from './contexts/HubContext';
 * 
 * function ListingForm() {
 *   const { getListingLimit } = useHubRules();
 *   const limit = getListingLimit('starter');
 *   return <p>Limit: {limit}</p>;
 * }
 */

/**
 * Example 4: Switch hubs programmatically
 * 
 * import { useHubSwitch } from './contexts/HubContext';
 * 
 * function HubButton() {
 *   const { switchHub } = useHubSwitch();
 *   
 *   return (
 *     <button onClick={() => switchHub('wholesale')}>
 *       Go to Wholesale
 *     </button>
 *   );
 * }
 */

/**
 * Example 5: Use hub branding
 * 
 * import { useHubBranding } from './contexts/HubContext';
 * 
 * function BrandedHeader() {
 *   const { primary, displayName } = useHubBranding();
 *   
 *   return (
 *     <div style={{ backgroundColor: primary }}>
 *       {displayName}
 *     </div>
 *   );
 * }
 */
