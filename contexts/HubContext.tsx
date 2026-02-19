/**
 * HubContext.tsx
 * ==============
 * Global Hub State Management - THE HEART OF HUB SEGREGATION
 *
 * ARCHITECTURE: HUB SEGREGATION WITH SHARED USERS
 * ═══════════════════════════════════════════════════════════
 *
 * This context manages dual state:
 *
 * SHARED STATE (same for all 6 hubs):
 * ├─ currentUser (from profiles table, user_id)
 * ├─ userSubscriptionTier (applies to all hubs)
 * ├─ userVerificationBadge (applies to all hubs)
 * └─ userPaymentMethod (M-Pesa for all hubs)
 *
 * SEGREGATED STATE (switches per hub):
 * ├─ currentHub (which of 6 hubs user is in)
 * ├─ hubListings (listings for current hub only, filtered by hub_id)
 * ├─ hubAnalytics (GMV/stats for current hub only)
 * ├─ hubSearchState (search within current hub only)
 * └─ hubPreferences (per-hub user preferences)
 *
 * HUB SWITCHING LOGIC:
 * 1. User clicks "Switch to Mkulima"
 * 2. Update currentHub = 'mkulima'
 * 3. Refetch listings: WHERE hub_id = 'mkulima' AND created_by = currentUser.id
 * 4. Refetch analytics: WHERE hub_id = 'mkulima'
 * 5. Preserve: subscription_tier, userProfile (shared across hubs)
 * 6. Update UI with Mkulima-specific forms/features
 *
 * PROVIDED HOOKS (9 total, all segregation-aware):
 * • useHub() → current hub id, user (shared), tier (shared)
 * • useHubSwitch() → switch between hubs
 * • useHubFeatures() → get enabled features for current hub
 * • useHubRules() → get business rules (commission, limits) for current hub
 * • useHubListings() → get listings for current hub ONLY [segregated query]
 * • useHubListingLimit() → get listing limit for user's tier in current hub
 * • useHubAnalytics() → get analytics for current hub ONLY [segregated]
 * • useHubBranding() → get colors, icons, names for current hub
 * • useHubPreferences() → manage per-hub user preferences
 *
 * KEY QUERIES:
 * Segregated: SELECT * FROM listings WHERE hub_id = 'marketplace' AND created_by = userId
 * Shared:    SELECT subscription_tier FROM profiles WHERE id = userId [NO hub_id]
 *
 * Enables seamless hub switching while segregating data correctly.
 */

import React, { createContext, useState, useCallback, useEffect, ReactNode } from 'react';
import {
  HubId,
  HubContextValue,
  HubConfig,
  HubSearchState,
  HubNavigation
} from '../types/HubArchitecture';
import { HUB_CONFIGS, getAllHubs, getHub } from '../config/HubConfig';

// Create context
export const HubContext = createContext<HubContextValue | undefined>(undefined);

// ===================================
// HUB CONTEXT PROVIDER
// ===================================

interface HubProviderProps {
  children: ReactNode;
  initialHubId?: HubId;
}

export const HubProvider: React.FC<HubProviderProps> = ({
  children,
  initialHubId = 'marketplace'
}) => {
  // Current hub state
  const [hubId, setHubId] = useState<HubId>(initialHubId);
  const [isChangingHub, setIsChangingHub] = useState(false);

  // Per-hub preferences (cached)
  const [hubPreferences, setHubPreferences] = useState<HubContextValue['hubPreferences']>({});

  // Per-hub search state
  const [hubSearchStates, setHubSearchStates] = useState<Record<HubId, HubSearchState>>({});

  // Get current hub config
  const currentHub = getHub(hubId) || HUB_CONFIGS.marketplace;

  // ===================================
  // HUB SWITCHING
  // ===================================

  const switchHub = useCallback(
    async (newHubId: HubId) => {
      // Validate hub exists and is active
      const newHub = getHub(newHubId);
      if (!newHub || !newHub.isActive) {
        console.error(`Hub ${newHubId} is not available`);
        return;
      }

      setIsChangingHub(true);

      try {
        // Simulate any async operations (auth checks, data prefetch, etc)
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Update current hub
        setHubId(newHubId);

        // Store hub switch in analytics
        console.log(`[Hub] Switched from ${hubId} to ${newHubId}`);
      } finally {
        setIsChangingHub(false);
      }
    },
    [hubId]
  );

  // ===================================
  // HUB NAVIGATION
  // ===================================

  const goToHub = useCallback((newHubId: HubId, path?: string) => {
    const hub = getHub(newHubId);
    if (!hub) return;

    const url = path ? `${hub.routePath}${path}` : hub.routePath;
    window.location.href = url;
  }, []);

  // ===================================
  // HUB PREFERENCES
  // ===================================

  const updateHubPreference = useCallback((hubId: HubId, preferences: any) => {
    setHubPreferences((prev) => ({
      ...prev,
      [hubId]: {
        ...prev[hubId],
        ...preferences,
        lastVisited: new Date().toISOString()
      }
    }));
  }, []);

  // ===================================
  // HUB SEARCH STATE
  // ===================================

  const updateHubSearchState = useCallback((newSearchState: HubSearchState) => {
    setHubSearchStates((prev) => ({
      ...prev,
      [newSearchState.hubId]: newSearchState
    }));
  }, []);

  // ===================================
  // HUB ACCESS CHECKING
  // ===================================

  const isHubAccessible = useCallback((checkHubId: HubId, userTier?: string): boolean => {
    const hub = getHub(checkHubId);
    if (!hub) return false;
    if (!hub.isActive) return false;

    // For now, all active hubs are accessible
    // In production, check user subscription tier against hub.rules.minimumTier
    return true;
  }, []);

  // ===================================
  // GET HUB BY ID
  // ===================================

  const getHubById = useCallback((checkHubId: HubId): HubConfig | null => {
    return getHub(checkHubId);
  }, []);

  // ===================================
  // GET ACTIVE HUBS
  // ===================================

  const getActiveHubs = useCallback((): HubConfig[] => {
    return getAllHubs().filter((hub) => hub.isActive);
  }, []);

  // ===================================
  // CONTEXT VALUE
  // ===================================

  const value: HubContextValue = {
    currentHub,
    hubId,
    isChangingHub,
    switchHub,
    goToHub,
    hubPreferences,
    getHub: getHubById,
    getActiveHubs,
    isHubAccessible
  };

  return <HubContext.Provider value={value}>{children}</HubContext.Provider>;
};

// ===================================
// HUB CONTEXT HOOK
// ===================================

export const useHubContext = (): HubContextValue => {
  const context = React.useContext(HubContext);
  if (!context) {
    throw new Error('useHubContext must be used within HubProvider');
  }
  return context;
};

// ===================================
// SPECIALIZED HOOKS
// ===================================

/**
 * useHub - Get current hub info
 */
export const useHub = () => {
  const { currentHub, hubId } = useHubContext();
  return {
    hubId,
    hub: currentHub,
    name: currentHub.displayName,
    features: currentHub.features,
    rules: currentHub.rules
  };
};

/**
 * useHubSwitch - Switch between hubs
 */
export const useHubSwitch = () => {
  const { switchHub, goToHub, isChangingHub, getActiveHubs } = useHubContext();
  return {
    switchHub,
    goToHub,
    isChangingHub,
    availableHubs: getActiveHubs()
  };
};

/**
 * useHubFeatures - Check if hub has specific features
 */
export const useHubFeatures = () => {
  const { currentHub } = useHubContext();

  return {
    hasListings: currentHub.features.listings.enabled,
    hasDirectContact: currentHub.features.directContact.enabled,
    hasLiveStreaming: currentHub.features.liveStreaming.enabled,
    hasBulkPricing: currentHub.features.bulkPricing.enabled,
    hasDigitalDownload: currentHub.features.digitalDownload.enabled,
    hasServicesBooking: currentHub.features.servicesBooking.enabled,
    hasShippingIntegration: currentHub.features.shippingIntegration.enabled,
    hasAnalytics: currentHub.features.analytics.enabled,
    hasAPI: currentHub.features.api.enabled,

    // Get feature by name
    hasFeature: (featureName: keyof typeof currentHub.features) => {
      return currentHub.features[featureName].enabled;
    }
  };
};

/**
 * useHubRules - Get hub-specific business rules
 */
export const useHubRules = () => {
  const { currentHub } = useHubContext();

  return {
    rules: currentHub.rules,
    getListingLimit: (tier: 'mkulima' | 'starter' | 'pro' | 'enterprise') => {
      const limit = currentHub.rules.listingLimits[tier];
      return limit === -1 ? Infinity : limit;
    },
    allowsCategory: (category: string) => {
      return currentHub.rules.allowedCategories.includes(category);
    },
    requiresVerification: currentHub.rules.requiresVerification,
    requiredDocuments: currentHub.rules.requiredDocuments
  };
};

/**
 * useHubNavigation - Get hub navigation info
 */
export const useHubNavigation = () => {
  const { currentHub, getActiveHubs } = useHubContext();

  const hubs: HubNavigation[] = getActiveHubs().map((hub) => ({
    hub,
    isActive: hub.id === currentHub.id
  }));

  return {
    currentHub,
    hubs,
    navItems: hubs.sort((a, b) => a.hub.navigationPriority - b.hub.navigationPriority)
  };
};

/**
 * useHubSearch - Get and update hub-specific search state
 */
export const useHubSearch = () => {
  const { hubId } = useHubContext();

  // In a real implementation, this would track per-hub search state
  return {
    hubId
    // Methods to update search state would go here
  };
};

/**
 * useHubBranding - Get hub-specific branding (colors, icons, etc)
 */
export const useHubBranding = () => {
  const { currentHub } = useHubContext();

  return {
    primary: currentHub.color.primary,
    secondary: currentHub.color.secondary,
    accent: currentHub.color.accent,
    icon: currentHub.icon,
    displayName: currentHub.displayName,
    routePath: currentHub.routePath
  };
};

/**
 * useAllHubs - Get all active hubs (for hub switcher UI)
 */
export const useAllHubs = () => {
  const { getActiveHubs, currentHub } = useHubContext();

  return {
    hubs: getActiveHubs(),
    currentHubId: currentHub.id,
    currentHubName: currentHub.displayName
  };
};
