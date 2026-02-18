/**
 * OFFSPRING DECOR LIMITED - Global Brand Identity
 * Enterprise-grade branding for Pambo.com - Direct-Connect Marketplace
 * 
 * This is the single source of truth for all UI branding across the platform.
 * Every component that touches the user interface must reference these constants.
 */

// ============================================
// COMPANY IDENTITY
// ============================================
export const OFFSPRING_BRAND = {
  name: 'Offspring Decor Limited',
  companyUrl: 'https://offspringdecor.com',
  supportEmail: 'support@pambo.com',
  supportPhone: '+254 (700) 000 000',
};

export const PAMBO_BRAND = {
  name: 'Pambo',
  tagline: 'The Direct-Connect Super-App',
  description: 'Connect with millions of verified sellers. Direct access. No middlemen. 100% seller control.',
  website: 'https://pambo.com',
  appVersion: '1.0.0',
  launchYear: 2026,
};

// ============================================
// COLOR PALETTE
// ============================================
export const COLORS = {
  // Primary - Offspring Decor Orange (Premium, energetic, trustworthy)
  primary: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316', // Main orange
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },

  // Secondary - Professional Teal (Modern, tech-forward)
  secondary: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6', // Main teal
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
  },

  // Neutrals
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Status colors
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',

  // Marketing colors
  gradient: 'linear-gradient(135deg, #f97316 0%, #14b8a6 100%)',
  luxuryGold: '#d4af37',
};

// ============================================
// TYPOGRAPHY
// ============================================
export const TYPOGRAPHY = {
  fontFamily: {
    primary: "'Inter', 'system-ui', sans-serif",
    heading: "'Inter', 'system-ui', sans-serif",
    mono: "'JetBrains Mono', monospace",
  },

  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
  },

  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
};

// ============================================
// SPACING & LAYOUT
// ============================================
export const SPACING = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '2.5rem', // 40px
  '3xl': '3rem',   // 48px
  '4xl': '4rem',   // 64px
};

export const CONTAINER_WIDTH = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// ============================================
// SHADOWS
// ============================================
export const SHADOWS = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
  none: 'none',
};

// ============================================
// BORDER RADIUS
// ============================================
export const RADIUS = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
};

// ============================================
// TRANSITIONS & ANIMATIONS
// ============================================
export const TRANSITIONS = {
  fast: 'all 150ms ease-in-out',
  base: 'all 300ms ease-in-out',
  slow: 'all 500ms ease-in-out',
};

// ============================================
// BROKEN STATE MESSAGING
// ============================================
export const EMPTY_STATES = {
  listings: {
    title: 'No Listings Yet',
    description: 'Be the first to list on Pambo. Direct access to millions of buyers.',
    emoji: '📦',
  },
  services: {
    title: 'Professional Services Coming Soon',
    description: 'Showcase your expertise on Pambo. Connect directly with clients. Keep 100% of earnings.',
    emoji: '🔧',
  },
  wholesale: {
    title: 'Wholesale Opportunities Awaiting',
    description: 'Source bulk products directly from verified suppliers. No middlemen. Transparent pricing.',
    emoji: '📊',
  },
  digital: {
    title: 'Digital Products Ready to Launch',
    description: 'Publish courses, templates, and software. Instant delivery. Direct-to-customer model.',
    emoji: '💻',
  },
  farmers: {
    title: 'Connect Your Farm to the Market',
    description: 'Mkulima Mdogo: Direct farm-to-buyer access. We find buyers. You focus on farming.',
    emoji: '🌾',
  },
  live: {
    title: 'Live Commerce Coming Soon',
    description: 'Real-time shopping with verified sellers. Interactive, engaging, profitable.',
    emoji: '📡',
  },
  cart: {
    title: 'Your Cart is Empty',
    description: 'Start adding items from verified sellers on Pambo.',
    emoji: '🛒',
  },
  search: {
    title: 'No Results Found',
    description: 'Try different search terms or browse our categories.',
    emoji: '🔍',
  },
  orders: {
    title: 'No Orders Yet',
    description: 'Browse Pambo and make your first purchase today.',
    emoji: '📋',
  },
  error: {
    title: 'Something Went Wrong',
    description: 'We are working to fix this. Please try again in a moment.',
    emoji: '⚠️',
  },
};

// ============================================
// CALL-TO-ACTION COPY
// ============================================
export const CTA_COPY = {
  startSelling: 'Start Selling on Pambo',
  browseNow: 'Browse Now',
  learnMore: 'Learn More',
  getStarted: 'Get Started',
  joinNow: 'Join Now',
  exploreMore: 'Explore More',
  viewDetails: 'View Details',
  contactSeller: 'Contact Seller',
  addToCart: 'Add to Cart',
  checkout: 'Checkout',
  subscribe: 'Subscribe Now',
};

// ============================================
// SUBSCRIPTION MESSAGING
// ============================================
export const SUBSCRIPTION_MESSAGING = {
  headline: 'Sell on Pambo — Keep 100% of Sales',
  subheadline: 'Zero commissions. One flat subscription. Direct buyer access.',
  sellerBenefit: 'Direct access to millions of buyers across Kenya and growing globally.',
  noHiddenFees: 'Transparent pricing. No hidden fees. No order commissions.',
};

// ============================================
// ERROR MESSAGES
// ============================================
export const ERROR_MESSAGES = {
  networkError: 'Unable to connect to Pambo. Please check your internet connection.',
  authRequired: 'Please sign in to continue.',
  permission: 'You do not have permission to perform this action.',
  notFound: 'The item you are looking for does not exist or has been removed.',
  serverError: 'Something went wrong on our end. Our team has been notified.',
  paymentFailed: 'Payment processing failed. Please try again.',
  uploadFailed: 'Upload failed. Please try again.',
};

// ============================================
// SUCCESS MESSAGES
// ============================================
export const SUCCESS_MESSAGES = {
  listingCreated: 'Your listing is live on Pambo!',
  listingUpdated: 'Listing updated successfully.',
  paymentComplete: 'Payment processed successfully.',
  accountCreated: 'Welcome to Pambo!',
  subscriptionActive: 'Your subscription is now active.',
};

// ============================================
// LOADING STATES
// ============================================
export const LOADING_COPY = {
  fetchingListings: 'Fetching verified listings...',
  fetchingServices: 'Finding the best service providers...',
  processingPayment: 'Processing your payment securely...',
  loading: 'Loading...',
};

// ============================================
// LINKS & FOOTER
// ============================================
export const FOOTER_LINKS = {
  company: [
    { label: 'About Pambo', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press', href: '/press' },
  ],
  support: [
    { label: 'Help Center', href: '/help' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Report Issue', href: '/report' },
  ],
  legal: [
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Cookie Policy', href: '/cookies' },
  ],
  social: [
    { label: 'Twitter', href: 'https://twitter.com/pambo_app', icon: 'twitter' },
    { label: 'Instagram', href: 'https://instagram.com/pambo_app', icon: 'instagram' },
    { label: 'LinkedIn', href: 'https://linkedin.com/company/pambo-app', icon: 'linkedin' },
  ],
};
