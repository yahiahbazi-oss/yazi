// IP-based Geolocation Detection

/**
 * Detect user's country from IP address using ipapi.co
 * Free tier: 1000 requests/day
 * @param {string} ip - IP address (optional, auto-detected if not provided)
 * @returns {Promise<{country: string, currency: string, ip: string}>}
 */
export async function detectCountryFromIP(ip = null) {
  try {
    // Use ipapi.co free API
    const url = ip ? `https://ipapi.co/${ip}/json/` : 'https://ipapi.co/json/';
    
    const response = await fetch(url, {
      headers: { 'User-Agent': 'yazi.tn' },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    
    if (!response.ok) throw new Error('Geolocation API failed');
    
    const data = await response.json();
    
    return {
      country: data.country_code || 'TN', // Default to Tunisia
      countryName: data.country_name || 'Tunisia',
      currency: data.currency || 'TND',
      ip: data.ip,
      city: data.city,
      region: data.region,
    };
  } catch (error) {
    console.error('Geolocation detection failed:', error);
    // Fallback to Tunisia
    return {
      country: 'TN',
      countryName: 'Tunisia',
      currency: 'TND',
      ip: null,
    };
  }
}

/**
 * Get user's country from request headers
 * Works with Vercel's geo headers
 */
export function getCountryFromHeaders(headers) {
  // Vercel automatically adds these headers
  const country = headers.get('x-vercel-ip-country') || 
                 headers.get('cf-ipcountry') || // Cloudflare
                 null;
  
  return country || 'TN'; // Default to Tunisia
}

/**
 * Server-side: Get user location from Next.js request
 */
export async function getUserLocation(request) {
  // Try Vercel geo headers first (instant, no API call)
  const country = getCountryFromHeaders(request.headers);
  
  if (country && country !== 'TN') {
    return {
      country,
      source: 'headers',
    };
  }
  
  // Fallback to IP detection
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
             request.headers.get('x-real-ip') ||
             null;
  
  const location = await detectCountryFromIP(ip);
  return {
    ...location,
    source: 'ip-api',
  };
}
