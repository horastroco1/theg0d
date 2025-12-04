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
  planet_houses?: any; // New: Calculated houses for each planet
  isMoonChart: boolean;
  raw_response?: any;
  nakshatras?: any;
  transits?: any;
}

const RASHI_NAMES = [
  "Unknown", "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", 
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

// Helper to extract date components from API string with high robustness
const parseApiDate = (dateStr: string): Date => {
  if (!dateStr || typeof dateStr !== 'string') return new Date(0);

  const cleanStr = dateStr.trim();
  
  // 1. Try standard Date parse (ISO, etc.)
  const stdDate = new Date(cleanStr.replace(' ', 'T'));
  if (!isNaN(stdDate.getTime())) return stdDate;

  // 2. Manual Parsing for various formats
  try {
    const [dPart, tPart] = cleanStr.split(' ');
    if (!dPart) return new Date(0);
    
    let year, month, day;
    
    const separator = dPart.includes('-') ? '-' : dPart.includes('/') ? '/' : null;
    
    if (separator) {
        const parts = dPart.split(separator).map(Number);
        
        if (parts[0] > 31) {
            [year, month, day] = parts; // YYYY-MM-DD
        } else if (parts[2] > 31) {
            [day, month, year] = parts; // DD-MM-YYYY
        } else {
            [day, month, year] = parts; // Default
        }
    } else {
        if (dPart.length === 8) {
             year = Number(dPart.substring(0, 4));
             month = Number(dPart.substring(4, 6));
             day = Number(dPart.substring(6, 8));
        } else {
            return new Date(0);
        }
    }
    
    let hour = 0, min = 0, sec = 0;
    if (tPart) {
        const tParts = tPart.split(':').map(Number);
        hour = tParts[0] || 0;
        min = tParts[1] || 0;
        sec = tParts[2] || 0;
    }

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

  const entries = Object.entries(periods).map(([key, val]: [string, any]) => ({
      key,
      ...val,
      startDate: parseApiDate(val.start),
      endDate: parseApiDate(val.end)
  })).sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  // Debug logs for top level
  if (level === 0) {
      console.log(`🔮 DASHA DEBUG: Target Date: ${targetDate.toISOString()}`);
  }

  for (const period of entries) {
    // Strict check: Target must be >= Start AND < End
    if (targetDate.getTime() >= period.startDate.getTime() && 
        targetDate.getTime() < period.endDate.getTime()) {
        
        let result = period.key;
        // Recursively find sub-periods
        if (period.periods && level < 3) { 
            const subResult = getCurrentDasha(period.periods, targetDate, level + 1);
            if (subResult) result += `/${subResult}`;
        }
        return result;
    }
  }
  
  // Fallback: Find the period that encompasses the target date broadly if strict match fails
  // Or if we are in a weird future/past offset
  if (level === 0) {
     console.warn("🔮 DASHA WARNING: No strict match found. Scanning for closest start...");
     // Find the last period that started before now
     const active = entries.filter(p => p.startDate <= targetDate).pop();
     if (active) {
          let result = `${active.key}`;
           if (active.periods) {
              const subResult = getCurrentDasha(active.periods, targetDate, level + 1);
              if (subResult) result += `/${subResult}`;
           }
          return result + " (Est)";
     }
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
        nesting: '3', // Increased nesting for deeper Dasha
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
        time_zone: params.timezone,
        varga: 'D1',
        nesting: '0',
        infolevel: 'basic'
      });

      const transitUrl = `${API_BASE}/api/calculate?${transitParams.toString()}`;
      let transitData = null;
      try {
          const transitRes = await axios.get(transitUrl);
          transitData = transitRes.data?.chart?.graha;
      } catch (e) {
          console.warn("⚠️ Transit API Failed (Non-critical):", e);
      }

      // --- DATA EXTRACTION ---
      const planets = data.chart?.graha || {};
      const houses = data.chart?.bhava || {};
      
      // 1. GET ASCENDANT SIGN (From Bhava 1)
      // IMPORTANT: The API defines Bhava 1's Rashi as the Ascendant Sign.
      const ascendantNum = houses["1"]?.rashi;
      const ascendantName = RASHI_NAMES[ascendantNum] || `Sign #${ascendantNum}`;
      const moonNum = planets.Mo?.rashi;
      const moonName = RASHI_NAMES[moonNum] || `Sign #${moonNum}`;

      // 2. CALCULATE HOUSES FOR PLANETS (Bhava-First Logic)
      // Algorithm: House = (PlanetSign - AscendantSign + 1 + 12) % 12
      // Adjustment: 1-based indexing means we simply subtract (Asc - 1) from Planet
      const planetHouses: Record<string, number> = {};
      
      Object.entries(planets).forEach(([key, val]: [string, any]) => {
         const planetSign = val.rashi;
         // Calculate distance from Ascendant
         let houseNum = (planetSign - ascendantNum + 1);
         if (houseNum <= 0) houseNum += 12;
         planetHouses[key] = houseNum;
      });

      // 3. Nakshatra Info
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

      // 4. Dasha Calculation
      const currentDasha = getCurrentDasha(data.dasha?.periods, now) || 'Unsynchronized';
      console.log("🔮 FINAL ACTIVE DASHA:", currentDasha);

      return {
          ascendant: ascendantName,
          moon_sign: moonName,
          current_dasha: currentDasha, 
          all_planets: planets,
          houses: houses,
          planet_houses: planetHouses, // Pass Calculated Houses
          nakshatras: nakshatras,
          isMoonChart: !!params.timeUnknown,
          raw_response: data,
          transits: transitData
      };
    } catch (error: any) {
      console.error("API ERROR:", error);
      throw new Error(`CONNECTION SEVERED. CODE: ${error.response?.status || 'NETWORK ERROR'}`);
    }
  }
};
