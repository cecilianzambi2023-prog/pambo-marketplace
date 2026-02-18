/**
 * unsplashService.ts
 * ==================
 * 
 * Fetches high-quality professional photos from Unsplash API
 * for service categories.
 * 
 * All images are royalty-free for commercial use.
 * Falls back to Lucide icons if no suitable photo found.
 */

const UNSPLASH_API_URL = 'https://api.unsplash.com';
const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY || '';

// Keyword mapping: Category name → Unsplash search keywords
export const CATEGORY_IMAGE_KEYWORDS: { [key: string]: string } = {
  'plumber': 'professional plumbing pipe repair',
  'electrician': 'professional electrician electrical work',
  'carpenter': 'professional carpentry woodworking',
  'painter': 'professional house painter painting',
  'mason': 'professional masonry brickwork construction',
  'interior designer': 'interior design home decoration',
  'interior painter': 'interior painting home',
  'laundry services': 'professional laundry service',
  'mama fua': 'laundry cleaning service',
  'water delivery': 'water delivery service',
  'photographer': 'professional photographer portrait studio',
  'videographer': 'professional videographer camera',
  'cctv installer': 'cctv security camera installation',
  'home cleaner': 'professional house cleaning service',
  'solar installer': 'solar panel installation professional',
  'welder': 'professional welding metalwork',
  'mechanic': 'professional car mechanic repair',
  'barber': 'professional barber haircut shop',
  'salon': 'professional hair salon beauty',
  'tailor': 'professional tailor sewing alterations',
  'event dj': 'professional dj event music',
  'event planner': 'event planning setup',
  'catering': 'professional catering food service',
  'cooking': 'professional chef cooking kitchen',
  'tutor': 'professional tutor education learning',
  'accountant': 'professional accountant office',
  'consultant': 'professional consultant business',
  'handyman': 'professional handyman repair tools',
  'landscaper': 'professional landscaping garden',
  'plumbing': 'professional plumbing pipe',
  'electrical': 'professional electrician',
  'construction': 'professional construction worker',
  'renovation': 'home renovation construction',
  'tiling': 'professional tile flooring installation',
  'flooring': 'professional flooring installation',
  'roofing': 'professional roofing repair',
  'installation': 'professional installation service',
};

/**
 * Search Unsplash for an image matching the category
 */
export async function fetchCategoryImage(categoryName: string): Promise<string | null> {
  if (!UNSPLASH_ACCESS_KEY) {
    console.warn('⚠️ Unsplash API key not configured. Set VITE_UNSPLASH_ACCESS_KEY in .env.local');
    return null;
  }

  try {
    const keywords = CATEGORY_IMAGE_KEYWORDS[categoryName.toLowerCase()] || `professional ${categoryName}`;
    
    console.log(`🔍 Searching Unsplash for: "${keywords}"`);

    const response = await fetch(
      `${UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(keywords)}&per_page=1&orientation=portrait&client_id=${UNSPLASH_ACCESS_KEY}`
    );

    if (!response.ok) {
      console.error(`❌ Unsplash API error (${response.status}):`, await response.text());
      return null;
    }

    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      console.warn(`⚠️ No image found for "${categoryName}"`);
      return null;
    }

    const imageUrl = data.results[0].urls.regular;
    console.log(`✅ Found image for "${categoryName}": ${imageUrl}`);
    
    return imageUrl;
  } catch (error) {
    console.error(`❌ Error fetching image for "${categoryName}":`, error);
    return null;
  }
}

/**
 * Fetch images for multiple categories
 * Returns mapping of category name to image URL
 */
export async function fetchCategoryImages(categoryNames: string[]): Promise<{ [key: string]: string | null }> {
  const results: { [key: string]: string | null } = {};
  
  // Add delay between requests to respect Unsplash rate limits (50/hour)
  const delayMs = 1000; // 1 second between requests
  
  for (let i = 0; i < categoryNames.length; i++) {
    const categoryName = categoryNames[i];
    
    // Delay to avoid rate limiting
    if (i > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
    
    try {
      const imageUrl = await fetchCategoryImage(categoryName);
      results[categoryName] = imageUrl;
    } catch (error) {
      console.error(`Error fetching image for "${categoryName}":`, error);
      results[categoryName] = null;
    }
  }
  
  return results;
}

/**
 * Get image URL for a category
 * Returns cached image or fetches new one
 */
const imageCache: { [key: string]: string | null } = {};

export async function getCategoryImageUrl(categoryName: string): Promise<string | null> {
  // Check cache first
  if (categoryName in imageCache) {
    return imageCache[categoryName];
  }

  // Fetch and cache
  const imageUrl = await fetchCategoryImage(categoryName);
  imageCache[categoryName] = imageUrl;
  
  return imageUrl;
}
