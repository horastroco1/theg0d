import axios from 'axios';

const API_BASE = 'https://my-astrology-api-production.up.railway.app';

export interface AstrologyParams {
  latitude: number;
  longitude: number;
  date: string;
  time: string;
  timezone: string;
  timeUnknown?: boolean;
}

export interface HoroscopeData {
  ascendant?: string;
  moon_sign?: string;
  current_dasha?: string;
  all_planets?: any; 
  houses?: any; 
  isMoonChart: boolean;
  raw_response?: any;
  nakshatras?: any;
  transits?: any; // Added transits support
}

const RASHI_NAMES = [
  "Unknown", "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", 
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

// Helper to extract date components from API string "YYYY-MM-DD HH:mm:ss"
const parseApiDate = (dateStr: string): Date => {
  // Handle ISO format or Space-separated
  const cleanStr = dateStr.replace(' ', 'T');
  const date = new Date(cleanStr);
  
  // Fallback manual parsing if basic Date fails (Safari/Mobile fix)
  if (isNaN(date.getTime())) {
    const [d, t] = dateStr.split(' ');
    const [year, month, day] = d.split('-').map(Number);
    const [hour, min, sec] = t.split(':').map(Number);
    return new Date(Date.UTC(year, month - 1, day, hour, min, sec));
  }
  return date;
};

// Recursive function to find the active Dasha period for the current date
const getCurrentDasha = (periods: any, targetDate: Date, level = 0): string | null => {
  if (!periods) {
    if (level === 0) console.log(`Level ${level}: No periods data found.`);
    return null;
  }

  let closestPeriod = null;

  for (const [planetKey, periodData] of Object.entries(periods) as [string, any][]) {
    const start = parseApiDate(periodData.start);
    const end = parseApiDate(periodData.end);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      continue;
    }

    // Check if targetDate is within the range [start, end)
    if (targetDate >= start && targetDate < end) {
      let result = planetKey;
      
      if (periodData.periods) {
        const subResult = getCurrentDasha(periodData.periods, targetDate, level + 1);
        if (subResult) {
          result += `/${subResult}`;
        }
      }
      return result;
    }
    
    // Fallback: Track closest period (in case of slight timezone drift)
    if (targetDate > start) {
       closestPeriod = planetKey;
    }
  }
  
  // If no exact match, return closest past period (better than nothing)
  if (level === 0 && closestPeriod) {
      console.log("Level 0: No exact match, using closest past period:", closestPeriod);
      return `${closestPeriod} (Approx)`;
  }

  return null;
};

export const astrologyService = {
  calculateHoroscope: async (params: AstrologyParams): Promise<HoroscopeData> => {
    try {
      const [year, month, day] = params.date.split('-').map(Number);
      let hour = 12, min = 0;
      if (!params.timeUnknown && params.time) {
        [hour, min] = params.time.split(':').map(Number);
      }

      // 1. BIRTH CHART REQUEST
      const queryParams = new URLSearchParams({
        latitude: params.latitude.toString(),
        longitude: params.longitude.toString(),
        year: year.toString(),
        month: month.toString(),
        day: day.toString(),
        hour: hour.toString(),
        min: min.toString(),
        sec: '0',
        time_zone: params.timezone,
        varga: 'D1,D9',
        nesting: '2',
        infolevel: 'basic'
      });

      const url = `${API_BASE}/api/calculate?${queryParams.toString()}`;
      console.log("🔮 API REQUEST (Birth):", url);
      const response = await axios.get(url);
      const data = response.data;

      // 2. TRANSIT CHART REQUEST (Current Date)
      const now = new Date();
      const transitParams = new URLSearchParams({
        latitude: params.latitude.toString(),
        longitude: params.longitude.toString(),
        year: now.getFullYear().toString(),
        month: (now.getMonth() + 1).toString(),
        day: now.getDate().toString(),
        hour: now.getHours().toString(),
        min: now.getMinutes().toString(),
        sec: '0',
        time_zone: params.timezone, // Using same timezone as user for now
        varga: 'D1', // Only D1 needed for transits
        nesting: '0',
        infolevel: 'basic'
      });

      const transitUrl = `${API_BASE}/api/calculate?${transitParams.toString()}`;
      console.log("🔮 API REQUEST (Transit):", transitUrl);
      let transitData = null;
      try {
          const transitRes = await axios.get(transitUrl);
          transitData = transitRes.data?.chart?.graha;
      } catch (e) {
          console.warn("⚠️ Transit API Failed (Non-critical):", e);
      }

      // Extract detailed data
      const planets = data.chart?.graha || {};
      const houses = data.chart?.bhava || {};
      const ascendantNum = data.chart?.lagna?.Lg?.rashi;
      const moonNum = planets.Mo?.rashi;
      
      // Map Rashi Numbers to Names
      const ascendantName = RASHI_NAMES[ascendantNum] || `Sign #${ascendantNum}`;
      const moonName = RASHI_NAMES[moonNum] || `Sign #${moonNum}`;

      // Extract Nakshatra Info
      const nakshatras = Object.entries(planets).reduce((acc: any, [key, val]: [string, any]) => {
        if (val.nakshatra) {
          acc[key] = {
            name: val.nakshatra.name,
            pada: val.nakshatra.pada,
            lord: val.nakshatra.lord 
          };
        }
        return acc;
      }, {});

      // Calculate Current Dasha (Vimshottari)
      const currentDasha = getCurrentDasha(data.dasha?.periods, now) || 'Unsynchronized';
      console.log("🔮 FINAL ACTIVE DASHA:", currentDasha);

      return {
          ascendant: ascendantName,
          moon_sign: moonName,
          current_dasha: currentDasha, 
          all_planets: planets,
          houses: houses,
          nakshatras: nakshatras,
          isMoonChart: !!params.timeUnknown,
          raw_response: data,
          transits: transitData // Pass transits to AI
      };
    } catch (error: any) {
      console.error("API ERROR:", error);
      throw new Error(`CONNECTION SEVERED. CODE: ${error.response?.status || 'NETWORK ERROR'}`);
    }
  }
};
