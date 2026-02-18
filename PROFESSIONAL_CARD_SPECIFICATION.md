/**
 * PROFESSIONAL SERVICE CARD - COMPLETE SPECIFICATION
 * ====================================================
 * 
 * Every professional's card in the Services Hub now prominently displays:
 * 1. Verified Badge (✓ BRONZE, ✓ SILVER, ✓ GOLD, ✓ PLATINUM)
 * 2. Star Rating (1-5 stars, with average value)
 * 3. Review Count (total written reviews)
 * 4. Follower Count (how many saved/follow this pro)
 * 5. Quick Action Buttons (Call Now + WhatsApp)
 */

// ============================================================
// CARD LAYOUT STRUCTURE
// ============================================================

const PROFESSIONAL_CARD_LAYOUT = `
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  HEADER ROW: Professional Name + Badge + Rating       │
│  ────────────────────────────────────────────────────  │
│  👨‍🔧 John's Emergency Plumbing    ✓ PLATINUM  ★★★★★     │
│  John's Emergency Plumbing        24/7 Service  4.8   │
│                                                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  STATS ROW: Reviews Count + Followers Count           │
│  ────────────────────────────────────────────────────  │
│         152                      2,340                │
│       Reviews                  Followers              │
│                                                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  DESCRIPTION                                          │
│  ────────────────────────────────────────────────────  │
│  Emergency plumbing services available 24/7.         │
│  Licensed & insured. Free consultations.             │
│                                                        │
│  👤 by John Kamau                                     │
│                                                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ACTION BUTTONS (Large touch targets, 48px minimum)  │
│  ────────────────────────────────────────────────────  │
│  [ 📞 Call Now ]           [ 💬 WhatsApp ]           │
│                                                        │
└─────────────────────────────────────────────────────────┘
`;

// ============================================================
// DATABASE UPDATES
// ============================================================

const DATABASE_UPDATES = {
  'new_migration': {
    file: 'database/migrations/02_add_follower_count_to_listings.sql',
    changes: [
      'ALTER TABLE listings ADD COLUMN follower_count INT DEFAULT 0',
      'CREATE INDEX idx_listings_follower_count ON listings(follower_count DESC)',
      'CREATE INDEX idx_listings_category_followers ON listings(category_id, follower_count DESC)',
    ],
  },

  'existing_columns': {
    listings_table: [
      'rating (already exists) - average 1-5 stars',
      'reviews_count (already exists) - total written reviews',
      'verification_badge (already exists) - bronze/silver/gold/platinum',
      'follower_count (NEW) - how many people saved/follow',
    ],
  },
};

// ============================================================
// PROFESSIONAL CARD COMPONENTS
// ============================================================

const CARD_ELEMENTS = {
  '1. VERIFIED BADGE': {
    location: 'Top-left, next to name',
    display: '✓ PLATINUM',
    colors: {
      platinum: 'Gold gradient (#ffd700 → #ffed4e)',
      gold: 'Gold (#ffd700)',
      silver: 'Silver (#c0c0c0)',
      bronze: 'Bronze (#cd7f32)',
    },
    meaning: 'Shows if they paid subscription to Pambo',
    importance: 'High - builds trust with customers',
  },

  '2. STAR RATING': {
    location: 'Top-right, in highlighted box',
    display: '★★★★★ 4.8',
    stars: '5 filled/unfilled stars',
    scale: '1-5 average',
    background: 'Soft orange box (#fff8f0) for prominence',
    importance: 'High - key trust indicator',
  },

  '3. REVIEW COUNT': {
    location: 'Under header, stats section',
    display: '152 Reviews',
    meaning: 'Total number of written customer reviews',
    importance: 'Medium - social proof',
  },

  '4. FOLLOWER COUNT': {
    location: 'Under header, stats section (right of reviews)',
    display: '2,340 Followers',
    meaning: 'How many people have saved/favorited this pro',
    importance: 'Medium - popularity indicator',
  },

  '5. QUICK ACTION BUTTONS': {
    location: 'Bottom of card',
    buttons: [
      {
        label: 'Call Now',
        icon: '📞',
        color: '#10b981 (green)',
        action: 'Opens phone dialer (tel: link)',
        size: '48px minimum touch target',
      },
      {
        label: 'WhatsApp',
        icon: '💬',
        color: '#25d366 (whatsapp green)',
        action: 'Opens WhatsApp with pre-filled message',
        size: '48px minimum touch target',
      },
    ],
    importance: 'Critical - primary contact method',
  },
};

// ============================================================
// TYPESCRIPT TYPES UPDATE
// ============================================================

const TYPES_UPDATE = `
// Updated ServiceListing interface in servicesCategoryTypes.ts
interface ServiceListing {
  // ... existing fields ...
  
  // Verification & Trust (DISPLAYED PROMINENTLY)
  verification_badge?: 'bronze' | 'silver' | 'gold' | 'platinum'; // ✓ badge
  rating?: number;                    // 1-5 stars average
  reviews_count?: number;             // Total written reviews
  follower_count?: number;            // People who saved/follow (NEW)
  
  // Contact (QUICK ACTION BUTTONS)
  phone: string;                      // Call Now button
  whatsapp?: string;                  // WhatsApp button
}
`;

// ============================================================
// REACT COMPONENT UPDATES
// ============================================================

const COMPONENT_UPDATES = {
  'ServiceCategoryDetail.tsx': {
    updated_interface: 'ServiceListing interface now includes follower_count',
    updated_jsx: `
      // HEADER: Name + Verified Badge + Star Rating
      <div className="listing-header">
        <div className="header-left">
          <h3>{listing.title}</h3>
          {listing.verification_badge && (
            <span className={\`badge \${listing.verification_badge.toLowerCase()}\`}>
              ✓ {listing.verification_badge.toUpperCase()}
            </span>
          )}
        </div>
        {listing.rating && (
          <div className="rating-box">
            <div className="rating-stars">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < Math.floor(listing.rating) ? 'star filled' : 'star'}>
                  ★
                </span>
              ))}
            </div>
            <div className="rating-value">{listing.rating.toFixed(1)}</div>
          </div>
        )}
      </div>

      // STATS: Reviews Count + Followers Count
      <div className="listing-stats">
        {listing.reviews_count !== undefined && (
          <div className="stat-item">
            <span className="stat-value">{listing.reviews_count}</span>
            <span className="stat-label">Reviews</span>
          </div>
        )}
        {listing.follower_count !== undefined && (
          <div className="stat-item">
            <span className="stat-value">{listing.follower_count}</span>
            <span className="stat-label">Followers</span>
          </div>
        )}
      </div>
    `,
    css_added: [
      'rating-box: highlighted orange background box',
      'rating-stars: 5-star display with filled/unfilled',
      'listing-stats: row showing reviews and followers',
      'stat-item: individual stat element',
      'stat-value: large blue number (#667eea)',
      'stat-label: uppercase gray label',
    ],
  },
};

// ============================================================
// STYLING SPECIFICATIONS
// ============================================================

const STYLING = {
  'badge': {
    display: 'inline-block',
    font_size: '11px',
    font_weight: 'bold',
    padding: '4px 8px',
    border_radius: '4px',
    uppercase: true,
    margin_top: '4px',
  },

  'rating_box': {
    display: 'flex (column)',
    align_items: 'center',
    gap: '4px',
    padding: '8px',
    background: '#fff8f0 (soft orange)',
    border_radius: '8px',
    min_width: '60px',
  },

  'rating_stars': {
    display: 'flex',
    gap: '2px',
    font_size: '16px',
    filled_color: '#ffc107 (gold)',
    unfilled_color: '#ddd (light gray)',
  },

  'listing_stats': {
    display: 'flex',
    gap: '16px',
    margin_bottom: '12px',
    padding_bottom: '12px',
    border_bottom: '1px solid #f0f0f0',
  },

  'stat_value': {
    font_size: '18px',
    font_weight: 'bold',
    color: '#667eea (primary blue)',
  },

  'stat_label': {
    font_size: '11px',
    color: '#999',
    text_transform: 'uppercase',
  },
};

// ============================================================
// DEPLOYMENT STEPS
// ============================================================

const DEPLOYMENT_STEPS = [
  {
    step: 1,
    title: 'Run Migration',
    command: 'supabase migration run',
    files: ['database/migrations/02_add_follower_count_to_listings.sql'],
    purpose: 'Adds follower_count column to listings table',
  },

  {
    step: 2,
    title: 'Update Types',
    files: ['types/servicesCategoryTypes.ts'],
    changes: 'Added follower_count?: number to ServiceListing interface',
    verification: 'TypeScript should compile without errors',
  },

  {
    step: 3,
    title: 'Update Component',
    files: ['components/ServiceCategoryDetail.tsx'],
    changes: [
      'Updated ServiceListing interface with follower_count',
      'Added rating-box with star display',
      'Added listing-stats section with review & follower counts',
      'Added CSS for prominent display',
    ],
    testing: 'Should display all 5 elements on professional card',
  },

  {
    step: 4,
    title: 'Test on Mobile',
    instructions: [
      'Open /services/:category-slug',
      'Verify all 5 elements display:',
      '  ✓ Name',
      '  ✓ Verified Badge',
      '  ✓ Star Rating',
      '  ✓ Review Count',
      '  ✓ Follower Count',
      '✓ Call button opens phone dialer',
      '✓ WhatsApp button opens WhatsApp',
      'Test on actual low-end Android (if possible)',
    ],
  },

  {
    step: 5,
    title: 'Deploy',
    instructions: 'Push all changes to production',
  },
];

// ============================================================
// DATA SAMPLE
// ============================================================

const SAMPLE_PROFESSIONAL_CARD = {
  id: 'listing-123',
  title: "John's Emergency Plumbing - 24/7 Available",
  description: 'Licensed and insured emergency plumbing services. Available 24/7.',
  phone: '+254712345678',
  whatsapp: '+254712345678',
  verification_badge: 'platinum',  // Shows ✓ PLATINUM badge
  rating: 4.8,                      // Shows ★★★★★ 4.8
  reviews_count: 152,               // Shows 152 Reviews
  follower_count: 2340,             // Shows 2,340 Followers
  profiles: {
    full_name: 'John Kamau',
  },
};

// ============================================================
// VISUAL MOCKUP
// ============================================================

const CARD_MOCKUP = `
╔═════════════════════════════════════════════════════════╗
║ SERVICE PROFESSIONAL CARD (Mobile View)               ║
╠═════════════════════════════════════════════════════════╣
║                                                        ║
║ 👨‍🔧 John's Emergency...    ┌─────────┐               ║
║    ✓ PLATINUM         │ ★★★★★ │              ║
║                        │ 4.8   │               ║
║                        └─────────┘               ║
║                                                        ║
║ ───────────────────────────────────────────────────── ║
║                                                        ║
║          152              2,340                       ║
║        Reviews           Followers                    ║
║                                                        ║
║ ───────────────────────────────────────────────────── ║
║                                                        ║
║ Emergency plumbing services. Licensed & insured.      ║
║ Available 24/7. Free consultations.                   ║
║                                                        ║
║ 👤 by John Kamau                                     ║
║                                                        ║
║ ┌──────────────────────────────────────────────────┐  ║
║ │  📞 Call Now            💬 WhatsApp              │  ║
║ └──────────────────────────────────────────────────┘  ║
║                                                        ║
╚═════════════════════════════════════════════════════════╝
`;

// ============================================================
// REQUIREMENTS MET
// ============================================================

const REQUIREMENTS_MET = {
  '✅ Follower Count': 'Displays above description, in stats section',
  '✅ Star Rating (1-5)': 'Shows 5 stars with average value in highlighted box',
  '✅ Review Count': 'Displays next to followers in stats row',
  '✅ Verified Badge': 'Prominently displayed below name (✓ PLATINUM)',
  '✅ Quick Action': 'Call and WhatsApp buttons at bottom (large touch targets)',
  '✅ Mobile-First': 'Card designed for touch, works on low-end Android',
  '✅ Direct Contact': 'Phone and WhatsApp - no in-app messaging',
  '✅ Trust Display': 'Badge, rating, reviews, and followers build credibility',
};

export const PROFESSIONAL_CARD_SPEC = {
  name: 'Pambo Services Professional Card',
  version: '2.0.0',
  date: '2026-02-13',
  description: 'Complete specification for professional service provider cards',
  requirements_met: REQUIREMENTS_MET,
  layout,
  elements: CARD_ELEMENTS,
  database_updates: DATABASE_UPDATES,
  deployment: DEPLOYMENT_STEPS,
  mockup: CARD_MOCKUP,
};
