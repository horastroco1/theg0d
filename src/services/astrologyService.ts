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

// Helper to extract date components from API string with high robustness
const parseApiDate = (dateStr: string): Date => {
  if (!dateStr || typeof dateStr !== 'string') return new Date(0); // Invalid input fallback

  const cleanStr = dateStr.trim();
  
  // 1. Try standard Date parse (ISO, etc.)
  const stdDate = new Date(cleanStr.replace(' ', 'T'));
  if (!isNaN(stdDate.getTime())) return stdDate;

  // 2. Manual Parsing for various formats
  try {
    // Split date and time
    const [dPart, tPart] = cleanStr.split(' ');
    if (!dPart) return new Date(0);
    
    let year, month, day;
    
    // Handle Separators (- or /)
    const separator = dPart.includes('-') ? '-' : dPart.includes('/') ? '/' : null;
    
    if (separator) {
        const parts = dPart.split(separator).map(Number);
        
        // Heuristic: Year is usually > 31
        if (parts[0] > 31) {
            // Format: YYYY-MM-DD
            [year, month, day] = parts;
        } else if (parts[2] > 31) {
            // Format: DD-MM-YYYY or MM-DD-YYYY
            // Ambiguity check: If parts[1] > 12, it's definitely MM (so DD-MM-YYYY)
            // But standard is usually DD-MM-YYYY in this API.
            [day, month, year] = parts;
        } else {
            // Ambiguous (e.g. 01-02-2024). Default to DD-MM-YYYY
            [day, month, year] = parts;
        }
    } else {
        // No separator? Maybe 19990101?
        if (dPart.length === 8) {
             year = Number(dPart.substring(0, 4));
             month = Number(dPart.substring(4, 6));
             day = Number(dPart.substring(6, 8));
        } else {
            return new Date(0);
        }
    }
    
    // Parse Time
    let hour = 0, min = 0, sec = 0;
    if (tPart) {
        const tParts = tPart.split(':').map(Number);
        hour = tParts[0] || 0;
        min = tParts[1] || 0;
        sec = tParts[2] || 0;
    }

    // Validation
    if (month < 1 || month > 12 || day < 1 || day > 31) return new Date(0);

    return new Date(Date.UTC(year, month - 1, day, hour, min, sec));

  } catch (e) {
    console.warn("Date Parse Error:", e);
    return new Date(0);
  }
};

// Recursive function to find the active Dasha period for the current date
const getCurrentDasha = (periods: any, targetDate: Date, level = 0): string | null => {
  if (!periods || typeof periods !== 'object') return null;

  // Sort periods by start date to ensure we check them in order
  const entries = Object.entries(periods).map(([key, val]: [string, any]) => ({
      key,
      ...val,
      startDate: parseApiDate(val.start),
      endDate: parseApiDate(val.end)
  })).sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  // Debug logs for top level
  if (level === 0) {
      console.log(`🔮 DASHA DEBUG: Target Date: ${targetDate.toISOString()}`);
      if (entries.length > 0) {
          console.log(`🔮 DASHA DEBUG: Sample Period [0]: ${entries[0].key} (${entries[0].startDate.toISOString()} - ${entries[0].endDate.toISOString()})`);
          console.log(`🔮 DASHA DEBUG: Raw Start String: ${entries[0].start}`);
      } else {
          console.log("🔮 DASHA DEBUG: No periods found to check.");
      }
  }

  for (const period of entries) {
    // Buffer of 1 minute to handle boundary conditions
    const buffer = 60000; 
    if (targetDate.getTime() >= period.startDate.getTime() - buffer && 
        targetDate.getTime() < period.endDate.getTime() + buffer) {
        
        let result = period.key;
        // Recursively find sub-periods
        if (period.periods && level < 2) { 
            const subResult = getCurrentDasha(period.periods, targetDate, level + 1);
            if (subResult) result += `/${subResult}`;
        }
        return result;
    }
  }
  
  // Fallback: If no exact match found at top level, try to find the closest one in the past
  if (level === 0) {
      // Find the period that started most recently before targetDate
      const lastStarted = entries.filter(p => p.startDate <= targetDate).pop();
      if (lastStarted) {
          console.log(`🔮 DASHA FALLBACK: No exact match. Using last started period: ${lastStarted.key}`);
          let result = `${lastStarted.key} (Approx)`;
           // Try to go deeper even on approx match
           if (lastStarted.periods) {
              const subResult = getCurrentDasha(lastStarted.periods, targetDate, level + 1);
              if (subResult) result = `${lastStarted.key}/${subResult}*`;
           }
          return result;
      }
      console.warn("🔮 DASHA WARNING: Date is out of range of all periods.");
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
