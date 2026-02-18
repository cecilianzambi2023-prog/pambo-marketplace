/**
 * DYNAMIC PROFESSIONAL ROUTING SPECIFICATION
 * ============================================
 * 
 * Complete implementation guide for dynamic professional profiles.
 * Each professional (Mama Fua, Electrician, Designer, etc.) gets:
 * - Unique URL: /professionals/:id
 * - Verified Pro badge (subscription-based)
 * - Follow button (real-time)
 * - Portfolio gallery (10+ images/videos)
 * - Sub-category display (what they specifically offer)
 */

// ============================================================
// ROUTING ARCHITECTURE
// ============================================================

const ROUTING_STRUCTURE = `
CURRENT ROUTES:
├── /services                          # ServicesCategoryGrid (all categories)
├── /services/:slug                    # ServiceCategoryDetail (category detail)
└── NEW: /professionals/:id            # ProfessionalProfileDetail (unique pro)

EXAMPLE PROFESSIONAL URLS:
├── /professionals/550e8400-e29b-41d4-a716-446655440000  (by ID)
├── /professionals/john-kamau                             (by name slug - future)
└── /professionals/mama-fua-cleaning                      (by service slug - future)

INTEGRATION POINT:
Service Category listing cards → Click professional → Navigate to /professionals/:id
`;

// ============================================================
// DATABASE SCHEMA NEW TABLES
// ============================================================

const DATABASE_SCHEMA = `
NEW MIGRATIONS (Run in order):

1. 03_add_professional_profile_tables.sql
   ├── followers table (user_id → professional_id)
   ├── professional_portfolios table (images + videos, max 10)
   ├── professional_subcategories table (what they offer)
   └── Indexes for performance

2. Existing tables enhanced:
   ├── profiles: already exists
   ├── subscription_tiers: already exists (for verification)
   └── listings: add follower_count (already in migration 02)

FOLLOWERS TABLE:
├── id (UUID, PK)
├── follower_id (UUID, FK → profiles.id)
├── professional_id (UUID, FK → profiles.id)
├── created_at (timestamp)
├── Constraint: UNIQUE (follower_id, professional_id)
└── Constraint: No self-follows

PROFESSIONAL_PORTFOLIOS TABLE:
├── id (UUID, PK)
├── professional_id (UUID, FK → profiles.id)
├── title (text)
├── description (text)
├── media_type ('image' | 'video')
├── media_url (text, S3/storage URL)
├── thumbnail_url (text, for videos)
├── is_featured (boolean)
├── display_order (int, for ordering)
└── created_at (timestamp)

PROFESSIONAL_SUBCATEGORIES TABLE:
├── id (UUID, PK)
├── professional_id (UUID, FK → profiles.id)
├── category_id (UUID, FK → categories.id)
├── subcategory_name (text, e.g. 'Sofa Cleaning')
├── description (text)
├── price_estimate (decimal)
├── is_active (boolean)
└── created_at (timestamp)

VERIFICATION BADGE LOGIC:
✓ Badge = IF subscription_status = 'active'
✓ Badge Level = mapping from subscription_tier:
  - 'starter'/'basic'     → BRONZE
  - 'professional'        → SILVER
  - 'pro'                 → GOLD
  - 'premium'/'enterprise' → PLATINUM
`;

// ============================================================
// COMPONENT STRUCTURE
// ============================================================

const COMPONENT_HIERARCHY = `
APP ROUTING:
├── <Route path="/services" element={<ServicesCategoryGrid />} />
├── <Route path="/services/:slug" element={<ServiceCategoryDetail />} />
└── <Route path="/professionals/:id" element={<ProfessionalProfileDetail />} />
                                        ↓
                            ProfessionalProfileDetail.tsx
                            ├── Professional info card
                            │   ├── Avatar + name
                            │   ├── ✓ Verified Pro badge (if active subscription)
                            │   ├── Rating + reviews
                            │   ├── Follower count + Follow button
                            │   ├── Bio
                            │   └── Call + WhatsApp buttons
                            │
                            ├── Services Offered section
                            │   ├── Sub-categories grid
                            │   └── Each shows name, description, price
                            │
                            ├── Portfolio Gallery
                            │   ├── ProfessionalPortfolioGallery.tsx
                            │   ├── Grid: 2 cols (mobile) → 3 (tablet) → 4 (desktop)
                            │   ├── Click → Lightbox modal
                            │   ├── Video with play icon
                            │   └── Thumbnails for navigation
                            │
                            └── Contact Info card
                                └── County, phone, email, WhatsApp

DATA FLOW:
1. User clicks professional card (in ServiceCategoryDetail)
2. Navigate to /professionals/:id
3. ProfessionalProfileDetail loads:
   a. getProfessionalProfile(id, currentUserId)
   b. Fetches all profile data + portfolio + subcategories
   c. Checks if user is following
4. Displays all sections
5. Follow button triggers: followProfessional(userId, professionalId)
   a. Updates followers table
   b. Real-time follower count update
   c. Updates follower_count in listings table
`;

// ============================================================
// KEY FEATURES IMPLEMENTATION
// ============================================================

const FEATURES = {
  'Dynamic URLs': {
    pattern: '/professionals/:id',
    example: '/professionals/550e8400-e29b-41d4-a716-446655440000',
    implementation: 'getProfessionalProfile(id) from professionalProfileService',
    future_slugs: 'name-based and service-based URLs for SEO',
  },

  'Sub-Categories': {
    display: 'What specifically the professional offers',
    examples: ['Sofa Cleaning', 'Carpet Cleaning', 'Office Deep Clean'],
    fetched_from: 'professional_subcategories table',
    implementation: 'getProfessionalSubcategories(professionalId)',
    price_estimate: 'Optional price shown per sub-category',
  },

  'Verified Pro Badge': {
    trigger: 'Subscription status = "active"',
    badge_levels: {
      'starter/basic': 'BRONZE',
      'professional': 'SILVER',
      'pro': 'GOLD',
      'premium/enterprise': 'PLATINUM',
    },
    display: 'Top of profile card, next to name',
    implementation: 'getVerificationBadge(subscription_tier)',
    color_scheme: {
      bronze: '#cd7f32',
      silver: '#c0c0c0',
      gold: '#ffd700',
      platinum: 'linear-gradient(#ffd700, #ffed4e)',
    },
    meaning: 'Professional paid subscription to Pambo',
  },

  'Follow Button': {
    function: 'Users save/follow professionals',
    button_state: {
      'not_following': 'Follow (bordered)',
      'following': 'Following (filled)',
    },
    real_time: 'Instant follower count update',
    implementation: 'followProfessional() / unfollowProfessional()',
    syncs_to: 'followers table + listings.follower_count',
  },

  'Portfolio Gallery': {
    capacity: 'Max 10 items per professional',
    formats: ['Images (JPEG, PNG, WebP)', 'Videos (MP4, WebM)'],
    display: {
      mobile: '2-column grid',
      tablet: '3-column grid',
      desktop: '4-column grid',
    },
    interactions: {
      click: 'Opens lightbox modal',
      thumbnail: 'Jump to specific item',
      arrow: 'Navigate prev/next',
    },
    video_feature: 'Play icon overlay, thumbnail from video',
    optimization: 'Lazy loading, responsive images',
  },
};

// ============================================================
// SERVICE LAYER FUNCTIONS
// ============================================================

const SERVICE_LAYER = {
  'Professional Profile': {
    getProfessionalProfile(professionalId, currentUserId): 'Full profile with all sections',
    getProfessionalBySlug(slug, currentUserId): 'Get profile by name slug (future)',
  },

  'Follow System': {
    followProfessional(followerId, professionalId): 'Add follower, update count',
    unfollowProfessional(followerId, professionalId): 'Remove follower, update count',
    subscribeToProfessionalUpdates(professionalId, callback): 'Real-time follower updates',
  },

  'Portfolio': {
    getProfessionalPortfolio(professionalId): 'Get all media items (max 10)',
    addPortfolioMedia(professionalId, media): 'Add image or video',
    deletePortfolioMedia(mediaId): 'Remove from portfolio',
    reorderPortfolio(professionalId, mediaIds): 'Reorder gallery items',
  },

  'Sub-Categories': {
    getProfessionalSubcategories(professionalId): 'What they offer',
    addProfessionalSubcategory(professionalId, subcat): 'Add new service offering',
  },

  'Search': {
    searchProfessionals(filters): 'Find by category, county, rating, etc.',
  },
};

// ============================================================
// DEPLOYMENT STEPS
// ============================================================

const DEPLOYMENT = [
  {
    step: 1,
    title: 'Run Database Migrations',
    files: [
      'database/migrations/02_add_follower_count_to_listings.sql',
      'database/migrations/03_add_professional_profile_tables.sql',
    ],
    commands: 'supabase migration run',
    verify: `
      SELECT COUNT(*) FROM followers;           -- Should succeed
      SELECT COUNT(*) FROM professional_portfolios;  -- Should succeed
      SELECT COUNT(*) FROM professional_subcategories;  -- Should succeed
      SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'listings' AND column_name = 'follower_count';  -- Should exist
    `,
  },

  {
    step: 2,
    title: 'Copy Type Definitions',
    files: ['types/professionalProfileTypes.ts'],
    destination: 'src/types/',
    verify: 'TypeScript compilation successful',
  },

  {
    step: 3,
    title: 'Copy Service Layer',
    files: ['services/professionalProfileService.ts'],
    destination: 'src/services/',
    verify: 'No import errors',
  },

  {
    step: 4,
    title: 'Copy Components',
    files: [
      'components/ProfessionalProfileDetail.tsx',
      'components/ProfessionalPortfolioGallery.tsx',
    ],
    destination: 'src/components/',
    verify: 'React components render without errors',
  },

  {
    step: 5,
    title: 'Update Routing',
    file: 'src/App.tsx or src/router.tsx',
    add_route: `
      import ProfessionalProfileDetail from './components/ProfessionalProfileDetail';
      
      <Route path="/professionals/:id" element={<ProfessionalProfileDetail />} />
    `,
    verify: 'Navigation to /professionals/test-id renders component',
  },

  {
    step: 6,
    title: 'Update Service Category Detail Component',
    file: 'src/components/ServiceCategoryDetail.tsx',
    add_link: 'Click professional card → navigate(/professionals/:id)',
    example: 'onClick={() => navigate(`/professionals/${listing.seller_id}`)}',
  },

  {
    step: 7,
    title: 'Test Full Flow',
    tests: [
      '✓ Navigate to /services',
      '✓ Click category (e.g., Plumber)',
      '✓ See professional cards with ratings, reviews, followers',
      '✓ Click on a professional card',
      '✓ View full profile with:',
      '  - Avatar & name',
      '  - ✓ Verified Pro badge (if subscribed)',
      '  - Rating & follower count',
      '  - Follow button (functional)',
      '  - Services offered (sub-categories)',
      '  - Portfolio gallery (click to open lightbox)',
      '  - Video thumbnails with play icon',
      '  - Call & WhatsApp buttons',
      '✓ Test on mobile device (at least 375px wide)',
      '✓ Test Follow button (triggers update)',
      '✓ Test portfolio lightbox navigation',
    ],
  },

  {
    step: 8,
    title: 'Seed Portfolio Data (Optional)',
    description: 'For testing, add sample images/videos to professionals',
    sql: `
      INSERT INTO professional_portfolios (
        professional_id, title, media_type, media_url, thumbnail_url, display_order
      ) VALUES (
        (SELECT id FROM profiles WHERE full_name = 'John Kamau'),
        'Emergency Kitchen Repair',
        'image',
        'https://example.com/image.jpg',
        NULL,
        0
      );
    `,
  },

  {
    step: 9,
    title: 'Deploy to Production',
    instructions: 'Git commit → push → deploy',
  },
];

// ============================================================
// FILE STRUCTURE
// ============================================================

const FILE_STRUCTURE = `
src/
├── types/
│   ├── servicesCategoryTypes.ts     (existing)
│   └── professionalProfileTypes.ts  (NEW)
│
├── services/
│   ├── servicesCategoryService.ts   (existing)
│   └── professionalProfileService.ts (NEW)
│
├── components/
│   ├── ServicesCategoryGrid.tsx     (existing)
│   ├── ServiceCategoryDetail.tsx    (existing, updated to link to professionals)
│   ├── ProfessionalProfileDetail.tsx (NEW)
│   └── ProfessionalPortfolioGallery.tsx (NEW)
│
├── App.tsx or router.tsx
│   └── Updated routes to include /professionals/:id
│
└── database/migrations/
    ├── 01_create_categories_table.sql (existing)
    ├── 02_add_follower_count_to_listings.sql (existing)
    └── 03_add_professional_profile_tables.sql (NEW)
`;

// ============================================================
// PERFORMANCE CONSIDERATIONS
// ============================================================

const PERFORMANCE = {
  'Database Queries': {
    'getProfessionalProfile': {
      queries: 6,
      indexes_used: ['followers(professional_id)', 'portfolios(professional_id)'],
      estimated_time: '50-100ms',
    },
    'searchProfessionals': {
      pagination: '20 items default',
      indexes_used: ['profiles(full_name)', 'listings(category_id)'],
    },
  },

  'Frontend Optimization': {
    'Portfolio Images': 'Lazy loading with <img loading="lazy">',
    'Portfolio Videos': 'Thumbnail preview, only play on demand',
    'Lightbox': 'Modal only loads selected image/video',
    'Follow Button': 'Optimistic UI update (no loading state)',
  },

  'Bandwidth': {
    'Initial Load': '< 500KB (profile + metadata)',
    'Portfolio Images': 'Only download on click',
    'Videos': 'Stream only when playing',
  },
};

// ============================================================
// REQUIREMENTS CHECKLIST
// ============================================================

const REQUIREMENTS_CHECKLIST = [
  '✅ Dynamic routing: /professionals/:id',
  '✅ Fetch sub_category from database dynamically',
  '✅ Verified Pro badge based on subscription status',
  '✅ Follow button with real-time follower count update',
  '✅ Portfolio gallery supports up to 10 high-res images/videos',
  '✅ Mobile-optimized (2-col grid becomes 3-4 on bigger screens)',
  '✅ Professional card shows: rating, reviews, followers, badge, contact buttons',
  '✅ Lightbox modal for portfolio with navigation',
  '✅ Video support with thumbnail and play icon',
  '✅ Real-time follower synchronization across tabs/devices',
];

// ============================================================
// QUICK INTEGRATION EXAMPLE
// ============================================================

const INTEGRATION_EXAMPLE = `
// 1. In your router/App.tsx
import ProfessionalProfileDetail from './components/ProfessionalProfileDetail';

<Route path="/professionals/:id" element={<ProfessionalProfileDetail />} />

// 2. In ServiceCategoryDetail.tsx, when clicking a professional
<div
  key={listing.id}
  className="service-listing-card"
  onClick={() => navigate(\`/professionals/\${listing.seller_id}\`)}
>
  {/* Card content */}
</div>

// 3. ProfessionalProfileDetail automatically:
//    - Loads profile
//    - Fetches portfolio
//    - Gets subcategories
//    - Checks verification status
//    - Manages follows
`;

export const PROFESSIONAL_ROUTING_SPEC = {
  name: 'Dynamic Professional Profiles',
  version: '1.0.0',
  date: '2026-02-13',
  description: 'Complete implementation for unique professional URLs, verified badges, follows, and portfolio galleries',
  
  routing: ROUTING_STRUCTURE,
  database: DATABASE_SCHEMA,
  components: COMPONENT_HIERARCHY,
  features: FEATURES,
  services: SERVICE_LAYER,
  deployment: DEPLOYMENT,
  files: FILE_STRUCTURE,
  performance: PERFORMANCE,
  requirements: REQUIREMENTS_CHECKLIST,
  example: INTEGRATION_EXAMPLE,
};
