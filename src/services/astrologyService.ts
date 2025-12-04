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

export const astrologyService = {
  calculateHoroscope: async (params: AstrologyParams) => {
    try {
      // --- CRITICAL FIX: Parse strings into Integers for the API ---
      const [year, month, day] = params.date.split('-').map(str => parseInt(str, 10));
      let hour = 12;
      let min = 0;
      
      if (!params.timeUnknown && params.time) {
        [hour, min] = params.time.split(':').map(str => parseInt(str, 10));
      }

      // AXIOS will serialize this object into the URL query string perfectly
      const queryParams = {
        latitude: params.latitude,
        longitude: params.longitude,
        year: year,
        month: month,
        day: day,
        hour: hour,
        min: min,
        sec: 0, 
        time_zone: params.timezone,
        varga: 'D1,D9',
        nesting: 2,
        infolevel: 'basic'
      };

      console.log("🔮 CALLING API WITH PARAMS (Check Console for URL):", queryParams);
      
      const response = await axios.get(API_URL, { params: queryParams });
      
      const data = response.data;
      
      // Map API response to standard structure
      // Note: Depending on exact API response shape, these paths might need adjustment.
      // Assuming typical vedic structure for demonstration based on previous context.
      return {
          ascendant: data.ascendant || data.chart?.lagna?.Lg?.rashi || "Unknown",
          moon_sign: data.moon_sign || data.chart?.graha?.Mo?.rashi || "Unknown",
          current_dasha: data.current_dasha || "Syncing...",
          isMoonChart: !!params.timeUnknown,
          raw_response: data
      };
      
    } catch (error: any) {
      console.error("API FAILURE LOG:", error.message);
      throw new Error(`CONNECTION SEVERED. CODE: ${error.response?.status || 'NETWORK ERROR'}`);
    }
  }
};
