import FirecrawlApp from '@mendable/firecrawl-js';

// Firecrawl client initialized on request

// =============================================
// PRICING CONSTANTS (Based on "New Business Pricing" - SalesHub Pro)
// =============================================
const PRICING = {
          // Platform Fee (Monthly)
          platformFee: {
                      list: 529,   // $529/month
                      floor: 399,  // $399/month
          },
          // Variable Rate (Per Sq Ft)
          variableRate: {
                      list: 0.02,  // $0.02 per sq ft
                      floor: 0.01, // $0.01 per sq ft
          },
          // Setup Fee Tiers (One-Time)
          setupFeeTiers: [
                  { maxSqFt: 50000, list: 2000, floor: 1000 },     // Tier 1: 0 - 50,000 sq ft
                  { maxSqFt: 150000, list: 2500, floor: 1750 },   // Tier 2: 50,001 - 150,000 sq ft
                  { maxSqFt: Infinity, list: 'Custom', floor: 'Custom' }, // Tier 3: >150,000 sq ft
                    ],
          // Minimum MRR
          minimumFloorMRR: 300,
};

const venueSchema = {
          type: 'object',
          properties: {
                      hotel_name: { type: 'string', description: 'Name of the hotel' },
                      meeting_rooms: {
                                    type: 'array',
                                    items: {
                                                    type: 'object',
                                                    properties: {
                                                                      name: { type: 'string', description: 'Name of the meeting room or event space' },
                                                                      square_footage: { type: 'string', description: 'Square footage of the room (e.g., "1,200 sq ft" or "1200")' },
                                                    },
                                    },
                                    description: 'List of meeting rooms, ballrooms, conference rooms, and event spaces',
                      },
                      hotel_room_types: {
                                    type: 'array',
                                    items: {
                                                    type: 'object',
                                                    properties: {
                                                                      name: { type: 'string', description: 'Name of the room type (e.g., "Deluxe King Suite")' },
                                                                      type: { type: 'string', description: 'Category type (e.g., "Suite", "Standard", "Deluxe")' },
                                                                      square_footage: { type: 'string', description: 'Square footage of the room' },
                                                    },
                                    },
                                    description: 'List of guest room types and accommodations',
                      },
                      restaurants_outlets: {
                                    type: 'array',
                                    items: {
                                                    type: 'object',
                                                    properties: {
                                                                      name: { type: 'string', description: 'Name of the restaurant or outlet' },
                                                                      square_footage: { type: 'string', description: 'Square footage if available' },
                                                    },
                                    },
                                    description: 'List of restaurants, bars, cafes, and F&B outlets',
                      },
                      amenities: {
                                    type: 'array',
                                    items: {
                                                    type: 'object',
                                                    properties: {
                                                                      name: { type: 'string', description: 'Name of the amenity (e.g., "Pool", "Spa", "Fitness Center")' },
                                                                      indoor_or_outdoor: { type: 'string', description: '"Indoor", "Outdoor", or "Both"' },
                                                    },
                                    },
                                    description: 'List of hotel amenities and facilities',
                      },
                      connecting_spaces: {
                                    type: 'array',
                                    items: {
                                                    type: 'object',
                                                    properties: {
                                                                      name: { type: 'string', description: 'Name of the connecting space (e.g., "Pre-function Area", "Foyer")' },
                                                                      square_footage: { type: 'string', description: 'Square footage of the space' },
                                                                      indoor_or_outdoor: { type: 'string', description: '"Indoor", "Outdoor", or "Both"' },
                                                    },
                                    },
                                    description: 'List of pre-function areas, foyers, terraces, and connecting spaces',
                      },
          },
};

// Keywords for smart URL filtering
const RELEVANT_KEYWORDS = {
          venues: ['meeting', 'event', 'conference', 'group', 'ballroom', 'banquet', 'wedding', 'function'],
          rooms: ['room', 'suite', 'accommodation', 'stay', 'lodging', 'guest-room'],
          dining: ['dining', 'restaurant', 'bar', 'outlet', 'food', 'cafe', 'lounge', 'eat'],
          amenities: ['amenity', 'amenities', 'activities', 'spa', 'pool', 'fitness', 'golf', 'facility'],
};

// Helper function to check if URL contains relevant keywords
function isRelevantUrl(url) {
          const lowercaseUrl = url.toLowerCase();

          // Skip common non-relevant pages
          const skipPatterns = [
                      'privacy', 'terms', 'cookie', 'careers', 'jobs', 'press', 'news', 'blog',
                      'contact', 'about-us', 'faq', 'help', 'support', 'login', 'signin', 'signup',
                      'cart', 'checkout', 'booking', 'reservation', 'gallery', 'photo', 'video',
                      'media', 'sitemap', 'legal'
                    ];

          if (skipPatterns.some(pattern => lowercaseUrl.includes(pattern))) {
                      return false;
          }

          // Check for relevant keywords
          const allKeywords = Object.values(RELEVANT_KEYWORDS).flat();
          return allKeywords.some(keyword => lowercaseUrl.includes(keyword));
}

// Helper function to score URL relevance (higher = more relevant)
function scoreUrl(url) {
          const lowercaseUrl = url.toLowerCase();
          let score = 0;

          // Higher scores for venue-related URLs (our primary target)
          RELEVANT_KEYWORDS.venues.forEach(keyword => {
                      if (lowercaseUrl.includes(keyword)) score += 3;
          });

          // Medium scores for other relevant content
          RELEVANT_KEYWORDS.rooms.forEach(keyword => {
                      if (lowercaseUrl.includes(keyword)) score += 2;
          });

          RELEVANT_KEYWORDS.dining.forEach(keyword => {
                      if (lowercaseUrl.includes(keyword)) score += 2;
          });

          RELEVANT_KEYWORDS.amenities.forEach(keyword => {
                      if (lowercaseUrl.includes(keyword)) score += 2;
          });

          return score;
}

// Helper function to deduplicate items by name
function deduplicateByName(items) {
          if (!Array.isArray(items)) return [];
          const seen = new Set();
          return items.filter(item => {
                      if (!item?.name) return false;
                      const normalized = item.name.toLowerCase().trim();
                      if (seen.has(normalized)) return false;
                      seen.add(normalized);
                      return true;
          });
}

// =============================================
// PRICING HELPER FUNCTIONS
// =============================================

// Helper function to parse square footage from string (e.g., "1,200 sq ft" -> 1200)
function parseSquareFootage(sqftString) {
          if (!sqftString) return 0;

          // Handle numeric input
          if (typeof sqftString === 'number') return sqftString;

          // Convert to string and extract numbers
          const str = String(sqftString);

          // Remove commas, "sq ft", "sqft", "sf", etc. and extract the number
          const cleaned = str.replace(/,/g, '').replace(/sq\.?\s*ft\.?|sqft|sf/gi, '').trim();

          // Parse the number
          const parsed = parseFloat(cleaned);

          return isNaN(parsed) ? 0 : parsed;
}

// Helper function to sum square footage from an array of items
function sumSquareFootage(items) {
          if (!Array.isArray(items)) return 0;
          return items.reduce((total, item) => {
                      return total + parseSquareFootage(item?.square_footage);
          }, 0);
}

// Calculate pricing based on total square footage
function calculatePricing(aggregatedData) {
          // Sum up total square footage from all venue types that have square footage
          const totalSqFt = 
                      sumSquareFootage(aggregatedData.meeting_rooms) +
                      sumSquareFootage(aggregatedData.connecting_spaces);

          // Note: hotel_room_types and restaurants_outlets may have square footage,
          // but typically venue pricing is based on meeting/event spaces

          // Calculate Monthly List Price: $529 + (Total SqFt * 0.02)
          const monthlyList = PRICING.platformFee.list + (totalSqFt * PRICING.variableRate.list);

          // Calculate Monthly Floor Price: $399 + (Total SqFt * 0.01)
          let monthlyFloor = PRICING.platformFee.floor + (totalSqFt * PRICING.variableRate.floor);

          // Apply Minimum MRR rule: If floor price < $300, set it to $300
          if (monthlyFloor < PRICING.minimumFloorMRR) {
                      monthlyFloor = PRICING.minimumFloorMRR;
          }

          // Determine Setup Fee Tier based on total square footage
          let setupFee = { list: 0, floor: 0 };
          for (const tier of PRICING.setupFeeTiers) {
                      if (totalSqFt <= tier.maxSqFt) {
                                    setupFee = { list: tier.list, floor: tier.floor };
                                    break;
                      }
          }

          return {
                      total_square_footage: totalSqFt,
                      monthly_list: Math.round(monthlyList * 100) / 100,
                      monthly_floor: Math.round(monthlyFloor * 100) / 100,
                      setup_fee: setupFee,
          };
}

// Aggregate data from multiple scrape results
function aggregateResults(results, hotelUrl) {
          const aggregated = {
                      hotel_name: '',
                      source_url: hotelUrl,
                      pages_scraped: results.length,
                      meeting_rooms: [],
                      hotel_room_types: [],
                      restaurants_outlets: [],
                      amenities: [],
                      connecting_spaces: [],
          };

          for (const result of results) {
                      if (!result) continue;

                      // Take the first non-empty hotel name
                      if (!aggregated.hotel_name && result.hotel_name) {
                                    aggregated.hotel_name = result.hotel_name;
                      }

                      // Merge arrays
                      if (Array.isArray(result.meeting_rooms)) {
                                    aggregated.meeting_rooms.push(...result.meeting_rooms);
                      }
                      if (Array.isArray(result.hotel_room_types)) {
                                    aggregated.hotel_room_types.push(...result.hotel_room_types);
                      }
                      if (Array.isArray(result.restaurants_outlets)) {
                                    aggregated.restaurants_outlets.push(...result.restaurants_outlets);
                      }
                      if (Array.isArray(result.amenities)) {
                                    aggregated.amenities.push(...result.amenities);
                      }
                      if (Array.isArray(result.connecting_spaces)) {
                                    aggregated.connecting_spaces.push(...result.connecting_spaces);
                      }
          }

          // Deduplicate all arrays
          aggregated.meeting_rooms = deduplicateByName(aggregated.meeting_rooms);
          aggregated.hotel_room_types = deduplicateByName(aggregated.hotel_room_types);
          aggregated.restaurants_outlets = deduplicateByName(aggregated.restaurants_outlets);
          aggregated.amenities = deduplicateByName(aggregated.amenities);
          aggregated.connecting_spaces = deduplicateByName(aggregated.connecting_spaces);

          return aggregated;
}

export async function POST(request) {
          try {
                      const { url } = await request.json();

                      if (!url) {
                                    return Response.json({ error: 'URL is required' }, { status: 400 });
                      }

                      if (!process.env.FIRECRAWL_API_KEY) {
                                    return Response.json({ error: 'Firecrawl API key not configured' }, { status: 500 });
                      }

                      // Initialize Firecrawl client
                      const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });

                      console.log(`[Map & Scrape] Starting for: ${url}`);

                      // Step 1: Map the site to discover all URLs
                      let mappedUrls = [];
                      try {
                                    const mapResult = await firecrawl.mapUrl(url);
                                    if (mapResult.success && Array.isArray(mapResult.links)) {
                                                    mappedUrls = mapResult.links;
                                                    console.log(`[Map & Scrape] Found ${mappedUrls.length} total URLs on site`);
                                    }
                      } catch (mapError) {
                                    console.warn('[Map & Scrape] Map failed, falling back to single URL scrape:', mapError.message);
                                    // Fall back to single page scrape if mapping fails
                                    mappedUrls = [url];
                      }

                      // Step 2: Smart filtering - find relevant URLs
                      const relevantUrls = mappedUrls
                        .filter(isRelevantUrl)
                        .map(u => ({ url: u, score: scoreUrl(u) }))
                        .sort((a, b) => b.score - a.score)
                        .slice(0, 7) // Take top 7 relevant URLs
                        .map(item => item.url);

                      // Always include the homepage
                      const urlsToScrape = [url, ...relevantUrls.filter(u => u !== url)];

                      // Limit to max 8 URLs total (homepage + 7 relevant)
                      const finalUrls = [...new Set(urlsToScrape)].slice(0, 8);

                      console.log(`[Map & Scrape] Selected ${finalUrls.length} URLs to scrape:`, finalUrls);

                      // Step 3: Parallel scraping with Promise.all
                      const scrapePromises = finalUrls.map(async (pageUrl) => {
                                    try {
                                                    console.log(`[Map & Scrape] Scraping: ${pageUrl}`);
                                                    const result = await firecrawl.scrapeUrl(pageUrl, {
                                                                      formats: ['extract'],
                                                                      extract: {
                                                                                          schema: venueSchema,
                                                                                          prompt: 'Extract all hotel venue information including meeting rooms, event spaces, ballrooms, guest room types, restaurants, amenities, and connecting spaces. Include square footage wherever mentioned.',
                                                                      },
                                                    });

                                                    if (result.success && result.extract) {
                                                                      console.log(`[Map & Scrape] Successfully scraped: ${pageUrl}`);
                                                                      return result.extract;
                                                    }

                                                    console.warn(`[Map & Scrape] No data extracted from: ${pageUrl}`);
                                                    return null;
                                    } catch (scrapeError) {
                                                    console.error(`[Map & Scrape] Error scraping ${pageUrl}:`, scrapeError.message);
                                                    return null;
                                    }
                      });

                      const scrapeResults = await Promise.all(scrapePromises);

                      // Filter out null results
                      const validResults = scrapeResults.filter(r => r !== null);

                      console.log(`[Map & Scrape] Successfully scraped ${validResults.length} of ${finalUrls.length} pages`);

                      if (validResults.length === 0) {
                                    return Response.json({ error: 'Failed to extract data from any pages' }, { status: 500 });
                      }

                      // Step 4: Aggregate results from all pages
                      const aggregatedData = aggregateResults(validResults, url);

                      // Step 5: Calculate pricing based on total square footage
                      const pricing = calculatePricing(aggregatedData);

                      console.log(`[Map & Scrape] Aggregation complete:`, {
                                    hotel_name: aggregatedData.hotel_name,
                                    meeting_rooms: aggregatedData.meeting_rooms.length,
                                    hotel_room_types: aggregatedData.hotel_room_types.length,
                                    restaurants_outlets: aggregatedData.restaurants_outlets.length,
                                    amenities: aggregatedData.amenities.length,
                                    connecting_spaces: aggregatedData.connecting_spaces.length,
                                    pricing: pricing,
                      });

                      // Return response with venue data and pricing
                      return Response.json({
                                    ...aggregatedData,
                                    pricing: pricing,
                      });

          } catch (error) {
                      console.error('Scrape error:', error);
                      return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
          }
}
