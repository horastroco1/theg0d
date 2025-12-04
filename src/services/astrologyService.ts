import axios from 'axios';

const API_URL = 'https://my-astrology-api-production.up.railway.app/api/calculate';

export interface AstrologyParams {
  latitude: number;
  longitude: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  timezone: string; // +03:30
  timeUnknown?: boolean;
}

export interface HoroscopeData {
  ascendant: string;
  ascendant_lord: string;
  moon_sign: string;
  moon_nakshatra: string;
  current_dasha: string;
  dasha_end_date: string;
  planets: any[];
  isMoonChart: boolean;
  raw_response?: any;
}

export const astrologyService = {
  calculateHoroscope: async (params: AstrologyParams): Promise<HoroscopeData> => {
    let { date, time, latitude, longitude, timezone, timeUnknown } = params;

    // Handle Unknown Time
    if (timeUnknown) {
      time = "12:00";
    }

    try {
      // Note: The prompt asks to handle `timeUnknown` -> default 12:00 and flag as Moon Chart.
      // We pass the modified time to the API.
      const response = await axios.post(API_URL, {
        latitude,
        longitude,
        date,
        time,
        timezone, // The API likely expects "timezone" or "time_zone". Prompt says "timezone".
      });

      const data = response.data;

      return {
        ascendant: data.ascendant || "Unknown",
        ascendant_lord: data.ascendant_lord || "Unknown",
        moon_sign: data.moon_sign || "Unknown",
        moon_nakshatra: data.moon_nakshatra || "Unknown",
        current_dasha: data.current_dasha || "Unknown",
        dasha_end_date: data.dasha_end_date || "Unknown",
        planets: data.planets || [],
        isMoonChart: !!timeUnknown,
        raw_response: data
      };

    } catch (error) {
      console.error("Astrology API Error:", error);
      // Fallback / Error handling
      throw error;
    }
  }
};
