interface ListingRecord {
  id: string;
  title?: string;
  description?: string;
  category?: string;
  county?: string;
  town?: string;
  price?: number;
  views?: number;
  createdAt?: string;
  updatedAt?: string;
  sellerId?: string;
  [key: string]: unknown;
}

interface SellerRecord {
  id: string;
  verified?: boolean;
  accountStatus?: 'pending' | 'active' | 'suspended';
  joinDate?: string;
}

interface MatchContext {
  query?: string;
  county?: string;
}

const HOURS_IN_DAY = 24;

const normalize = (value: unknown) => String(value || '').toLowerCase().trim();

const ageInHours = (dateValue?: string) => {
  if (!dateValue) return 999;
  const timestamp = new Date(dateValue).getTime();
  if (Number.isNaN(timestamp)) return 999;
  return (Date.now() - timestamp) / 1000 / 60 / 60;
};

const recencyScore = (createdAt?: string) => {
  const hours = ageInHours(createdAt);
  if (hours <= HOURS_IN_DAY) return 30;
  if (hours <= HOURS_IN_DAY * 3) return 20;
  if (hours <= HOURS_IN_DAY * 7) return 12;
  return 4;
};

const textRelevanceScore = (listing: ListingRecord, query?: string) => {
  if (!query) return 0;
  const q = normalize(query);
  if (!q) return 0;

  const title = normalize(listing.title);
  const description = normalize(listing.description);
  const category = normalize(listing.category);

  let score = 0;
  if (title.includes(q)) score += 25;
  if (description.includes(q)) score += 12;
  if (category.includes(q)) score += 10;
  if (title.startsWith(q)) score += 8;

  return score;
};

const countyScore = (listingCounty?: string, queryCounty?: string) => {
  if (!queryCounty) return 0;
  return normalize(listingCounty) === normalize(queryCounty) ? 20 : 0;
};

const sellerTrustScore = (seller?: SellerRecord) => {
  if (!seller) return 0;

  let score = 0;
  if (seller.verified) score += 20;
  if (seller.accountStatus === 'active') score += 10;

  const joinedHours = ageInHours(seller.joinDate);
  if (joinedHours < HOURS_IN_DAY * 30) {
    score += 2;
  } else if (joinedHours < HOURS_IN_DAY * 180) {
    score += 6;
  } else {
    score += 10;
  }

  return score;
};

const engagementScore = (views: unknown) => {
  const value = typeof views === 'number' ? views : Number(views || 0);
  if (!Number.isFinite(value) || value <= 0) return 0;
  if (value < 20) return 3;
  if (value < 100) return 8;
  if (value < 500) return 14;
  return 18;
};

export const rankListingsForKenya = (
  listings: ListingRecord[],
  sellers: SellerRecord[],
  context: MatchContext
) => {
  const sellerMap = new Map<string, SellerRecord>();
  sellers.forEach((seller) => sellerMap.set(seller.id, seller));

  return listings
    .map((listing) => {
      const seller = listing.sellerId ? sellerMap.get(String(listing.sellerId)) : undefined;

      const score =
        textRelevanceScore(listing, context.query) +
        countyScore(String(listing.county || ''), context.county) +
        sellerTrustScore(seller) +
        recencyScore(String(listing.createdAt || listing.updatedAt || '')) +
        engagementScore(listing.views);

      return {
        ...listing,
        matchScore: score,
      };
    })
    .sort((a, b) => (b.matchScore as number) - (a.matchScore as number));
};
