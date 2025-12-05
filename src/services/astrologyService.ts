import axios from 'axios';
import { dashaEngine } from '@/lib/dashaEngine'; // IMPORT ENGINE

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
  computed_hits?: string[]; // New: Calculated "Vedic Hits"
  isMoonChart: boolean;
  raw_response?: any;
  nakshatras?: any;
  transits?: any;
}

const RASHI_NAMES = [
  "Unknown", "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", 
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

export const astrologyService = {
  calculateHoroscope: async (params: AstrologyParams): Promise<HoroscopeData> => {
    try {
      const [year, month, day] = params.date.split('-').map(Number);
      let hour = 12, min = 0;
      if (!params.timeUnknown && params.time) {
        [hour, min] = params.time.split(':').map(Number);
      }

      // 1. BIRTH CHART REQUEST - REVERTED TO BASIC INFOLEVEL
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

      // 4. CLIENT-SIDE DASHA CALCULATION (The Ultimate Fix)
      // We ignore the API Dasha and calculate it locally using Moon Longitude
      let currentDasha = 'Unsynchronized';
      try {
          const moonLongitude = planets.Mo?.longitude;
          if (typeof moonLongitude === 'number') {
              // Parse birth date correctly
              const birthDate = new Date(Date.UTC(year, month - 1, day, hour, min));
              currentDasha = dashaEngine.calculate(moonLongitude, birthDate);
              console.log(`🔮 CALCULATED DASHA (Client): ${currentDasha}`);
          } else {
              console.error("❌ DASHA ERROR: Moon Longitude missing from API");
          }
      } catch (e) {
          console.error("❌ DASHA ENGINE ERROR:", e);
      }

      // 5. COMPUTED "VEDIC HITS" LOGIC
      const computedHits: string[] = [];

      // A. Transit-to-House Mapping
      if (transitData && typeof ascendantNum === 'number') {
          Object.entries(transitData).forEach(([key, val]: [string, any]) => {
             // For transits, we want to know which house of the USER they are in.
             const transitSign = val.rashi; // 1=Aries, etc.
             let transitHouse = (transitSign - ascendantNum + 1);
             if (transitHouse <= 0) transitHouse += 12;
             
             // Significant Transits Only
             if (['Sa', 'Ju', 'Ra', 'Ke', 'Ma'].includes(key)) {
                 const houseMeaning: any = {
                     1: "Self/Health", 2: "Wealth/Family", 3: "Courage/Siblings", 4: "Home/Mother",
                     5: "Romance/Creativity", 6: "Enemies/Debt", 7: "Marriage/Partnership", 8: "Transformation/Sudden Events",
                     9: "Luck/Dharma", 10: "Career/Status", 11: "Gains/Network", 12: "Loss/Isolation"
                 };
                 computedHits.push(`Transit ${key} is currently in your House ${transitHouse} (${houseMeaning[transitHouse]}).`);
             }
          });
      }

      // B. Dasha Lord Status
      if (currentDasha !== 'Unsynchronized') {
          const [md, ad] = currentDasha.split('/');
          if (md && planetHouses[md]) {
             const house = planetHouses[md];
             computedHits.push(`Major Period Lord (${md}) is activating your House ${house} in the birth chart.`);
          }
          if (ad && planetHouses[ad]) {
             const house = planetHouses[ad];
             computedHits.push(`Sub-Period Lord (${ad}) is activating your House ${house}.`);
          }
      }

      return {
          ascendant: ascendantName,
          moon_sign: moonName,
          current_dasha: currentDasha, 
          all_planets: planets,
          houses: houses,
          planet_houses: planetHouses, // Pass Calculated Houses
          computed_hits: computedHits, // Pass Calculated Hits
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
