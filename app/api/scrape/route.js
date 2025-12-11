import FirecrawlApp from '@mendable/firecrawl-js';

// Firecrawl client initialized on request

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

            // Scrape the page with LLM extraction
      const result = await firecrawl.scrapeUrl(url, {
              formats: ['extract'],
              extract: {
                        schema: venueSchema,
                        prompt: 'Extract all hotel venue information including meeting rooms, event spaces, ballrooms, guest room types, restaurants, amenities, and connecting spaces. Include square footage wherever mentioned.',
              },
      });

      if (!result.success) {
              return Response.json({ error: result.error || 'Failed to scrape the page' }, { status: 500 });
      }

      return Response.json(result.extract || {});
    } catch (error) {
          console.error('Scrape error:', error);
          return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
