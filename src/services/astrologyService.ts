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
      // Parse Date (CRITICAL FIX: Split the string into individual params)
      const [year, month, day] = params.date.split('-').map(Number);
      
      let hour = 12;
      let min = 0;
      
      if (!params.timeUnknown && params.time) {
        [hour, min] = params.time.split(':').map(Number);
      }

      // Use axios 'params' object for clean GET query construction
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

      console.log("🔮 CALLING API WITH PARAMS:", queryParams.toString());
      
      // AXIOS will correctly serialize this object into the URL query string
      const response = await axios.get(`${API_URL}?${queryParams.toString()}`);
      return response.data;

    } catch (error) {
      console.error("API ERROR:", error);
      throw new Error("CONNECTION SEVERED. FATE CALCULATION FAILED.");
    }
  }
};
