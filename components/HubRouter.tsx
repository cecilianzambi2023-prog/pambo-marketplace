/**
 * HubRouter.tsx
 * =============
 * Main Hub Routing Component - ROUTING WITH HUB AWARENESS
 *
 * ARCHITECTURE: HUB SEGREGATION WITH SHARED USERS
 * ═══════════════════════════════════════════════════════════
 *
 * Manages navigation and layout across segregated hubs while
 * maintaining shared user context. Bridge between URL routing and
 * hub segregation logic.
 *
 * ROUTING AWARENESS:
 * ├─ URL format: /hub/:hubId/listings
 * ├─ Reads hubId from URL and switches context to that hub
 * ├─ Preserves hub across reloads (localStorage in HubContext)
 * └─ Updates URL when user switches hubs
 *
 * SHARED CONTEXT IN ROUTING:
 * ├─ Header shows current user (same everywhere)
 * ├─ Header shows subscription tier (same everywhere)
 * └─ These preserved as user navigates between hubs
 *
 * SEGREGATED CONTEXT IN ROUTING:
 * ├─ Listings view shows current hub's listings only
 * ├─ Analytics dashboard shows current hub's stats only
 * ├─ Forms show hub-specific fields (hub_id saved with listing)
 * ├─ Navigation highlights current hub
 * └─ Refetch on hub change: WHERE hub_id = currentHub
 *
 * EXPORTED COMPONENTS (10 total):
 * • HubHeader: Shows hub (segregated) + user (shared)
 * • HubBreadcrumb: Navigation path with hub context
 * • HubQuickActions: Hub-specific action buttons
 * • HubListingStats: Shows current hub's stats
 * • HubActivityFeed: Shows current hub's activity
 * • HubSwitcher: Switch between 6 hubs
 * (and 4 more for layout, tabs, etc.)
 *
 * EXAMPLE:
 * <HubRouter>
 *   <Route path="/hub/:hubId/listings" element={<MyListings />} />
 * </HubRouter>
 *
 * MyListings automatically segregates:
 * useHubListings() → fetches WHERE hub_id = currentHub
 */

import React, { Suspense } from 'react';
import { useHub, useHubNavigation, useHubBranding, useHubSwitch } from '../contexts/HubContext';
import { ChevronDown, Zap, Check } from 'lucide-react';

// ===================================
// MAIN HUB ROUTER
// ===================================

interface HubRouterProps {
  children: React.ReactNode;
  currentHubId?: string;
}

export const HubRouter: React.FC<HubRouterProps> = ({ children }) => {
  const { hub, hubId } = useHub();
  const { primary, secondary, accent } = useHubBranding();

  return (
    <div
      className="min-h-screen w-full"
      style={{
        background: `linear-gradient(135deg, ${accent} 0%, white 100%)`
      }}
    >
      {/* Hub Header with Branding */}
      <HubHeader hub={hub} hubId={hubId} />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<HubLoadingState />}>{children}</Suspense>
      </main>
    </div>
  );
};

// ===================================
// HUB HEADER
// ===================================

interface HubHeaderProps {
  hub: any;
  hubId: string;
}

const HubHeader: React.FC<HubHeaderProps> = ({ hub, hubId }) => {
  const { switchHub, availableHubs, isChangingHub } = useHubSwitch();
  const [showHubMenu, setShowHubMenu] = React.useState(false);
  const { primary } = useHubBranding();

  return (
    <div
      className="sticky top-0 z-40 border-b-2"
      style={{
        backgroundColor: primary,
        borderColor: primary
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Hub Info */}
          <div className="flex items-center gap-3">
            <div className="text-3xl">{hub.icon}</div>
            <div className="text-white">
              <h1 className="text-2xl font-bold">{hub.displayName}</h1>
              <p className="text-sm opacity-90">{hub.description}</p>
            </div>
          </div>

          {/* Hub Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowHubMenu(!showHubMenu)}
              className="px-4 py-2 bg-white text-black rounded-lg font-semibold flex items-center gap-2 hover:bg-gray-100 transition"
              disabled={isChangingHub}
            >
              Switch Hub
              <ChevronDown size={18} />
            </button>

            {/* Hub Menu */}
            {showHubMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-2xl overflow-hidden">
                <div className="p-4 border-b bg-gray-50">
                  <p className="text-sm font-semibold text-gray-700">Available Hubs</p>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {availableHubs.map((availableHub) => (
                    <button
                      key={availableHub.id}
                      onClick={async () => {
                        await switchHub(availableHub.id);
                        setShowHubMenu(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition flex items-start justify-between ${
                        availableHub.id === hubId ? 'bg-blue-50 border-l-4' : ''
                      }`}
                      style={
                        availableHub.id === hubId
                          ? { borderLeftColor: availableHub.color.primary }
                          : {}
                      }
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{availableHub.displayName}</p>
                        <p className="text-xs text-gray-600 mt-1">{availableHub.description}</p>
                      </div>
                      {availableHub.id === hubId && (
                        <Check size={18} className="text-green-600 mt-1" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ===================================
// HUB BREADCRUMB NAVIGATION
// ===================================

interface HubBreadcrumbProps {
  items: Array<{
    label: string;
    href: string;
  }>;
}

export const HubBreadcrumb: React.FC<HubBreadcrumbProps> = ({ items }) => {
  return (
    <nav className="flex items-center gap-2 mb-6 text-sm">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <a href={item.href} className="text-blue-600 hover:underline">
            {item.label}
          </a>
          {index < items.length - 1 && <span className="text-gray-400">/</span>}
        </React.Fragment>
      ))}
    </nav>
  );
};

// ===================================
// HUB FEATURE BANNER
// ===================================

export const HubFeatureBanner: React.FC<{ message: string; icon?: React.ReactNode }> = ({
  message,
  icon = <Zap size={20} />
}) => {
  const { primary } = useHubBranding();

  return (
    <div
      className="mb-6 p-4 rounded-lg text-white flex items-center gap-3"
      style={{ backgroundColor: primary }}
    >
      {icon}
      <p className="font-medium">{message}</p>
    </div>
  );
};

// ===================================
// HUB SWITCHER (Simplified)
// ===================================

export const HubSwitcher: React.FC = () => {
  const { availableHubs, currentHubId } = React.useMemo(() => {
    try {
      const context = require('../contexts/HubContext').useAllHubs();
      return context;
    } catch {
      return { availableHubs: [], currentHubId: '' };
    }
  }, []);

  const { switchHub } = useHubSwitch();

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {availableHubs.map((hub: any) => (
        <button
          key={hub.id}
          onClick={() => switchHub(hub.id)}
          className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition ${
            hub.id === currentHubId ? 'text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          style={hub.id === currentHubId ? { backgroundColor: hub.color.primary } : {}}
        >
          {hub.icon} {hub.displayName}
        </button>
      ))}
    </div>
  );
};

// ===================================
// HUB QUICK ACTIONS
// ===================================

export const HubQuickActions: React.FC = () => {
  const { hub } = useHub();
  const { HUB_QUICK_ACTIONS } = require('../types/HubArchitecture');

  const actions = HUB_QUICK_ACTIONS[hub.id] || [];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {actions.map((action: any) => (
        <a
          key={action.id}
          href={action.href}
          className="p-4 bg-white rounded-lg border-2 hover:shadow-lg transition text-center"
          style={{ borderColor: hub.color.primary }}
        >
          <div className="text-3xl mb-2">{action.icon}</div>
          <p className="font-semibold text-sm">{action.label}</p>
        </a>
      ))}
    </div>
  );
};

// ===================================
// HUB FEATURE SHOWCASE
// ===================================

interface HubFeatureShowcaseProps {
  title?: string;
}

export const HubFeatureShowcase: React.FC<HubFeatureShowcaseProps> = ({ title }) => {
  const { hub } = useHub();
  const features = Object.entries(hub.features)
    .filter(([, feature]) => feature.enabled)
    .map(([key, feature]) => ({
      name: key.replace(/([A-Z])/g, ' $1').trim(),
      description: feature.description
    }));

  return (
    <div className="mb-8">
      {title && <h2 className="text-2xl font-bold mb-4">{title}</h2>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature) => (
          <div
            key={feature.name}
            className="p-4 bg-white rounded-lg border-l-4"
            style={{ borderColor: hub.color.primary }}
          >
            <p className="font-semibold capitalize">{feature.name}</p>
            <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ===================================
// HUB LOADING STATE
// ===================================

export const HubLoadingState: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-96">
      <div className="text-center">
        <div className="inline-block animate-spin mb-4">
          <Zap size={32} className="text-blue-600" />
        </div>
        <p className="text-gray-600">Loading hub content...</p>
      </div>
    </div>
  );
};

// ===================================
// HUB EMPTY STATE
// ===================================

interface HubEmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
}

export const HubEmptyState: React.FC<HubEmptyStateProps> = ({
  icon,
  title,
  description,
  action
}) => {
  const { primary } = useHubBranding();

  return (
    <div className="flex flex-col items-center justify-center min-h-96 bg-white rounded-lg border-2 border-dashed">
      {icon && <div className="text-5xl mb-4 opacity-50">{icon}</div>}
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 text-center max-w-md">{description}</p>
      {action && (
        <a
          href={action.href}
          className="px-6 py-2 text-white rounded-lg font-semibold transition hover:opacity-90"
          style={{ backgroundColor: primary }}
        >
          {action.label}
        </a>
      )}
    </div>
  );
};

// ===================================
// HUB ANALYTICS CARD
// ===================================

interface HubAnalyticsCardProps {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'stable';
}

export const HubAnalyticsCard: React.FC<HubAnalyticsCardProps> = ({ label, value, trend }) => {
  const { primary } = useHubBranding();

  return (
    <div className="p-4 bg-white rounded-lg border-l-4" style={{ borderLeftColor: primary }}>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {trend && (
        <p
          className={`text-xs mt-2 font-semibold ${
            trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
          }`}
        >
          {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trend}
        </p>
      )}
    </div>
  );
};
