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
  isMoonChart: boolean;
  raw_response?: any;
}

export const astrologyService = {
  calculateHoroscope: async (params: AstrologyParams): Promise<HoroscopeData> => {
    try {
      const [year, month, day] = params.date.split('-').map(Number);
      let hour = 12, min = 0;
      if (!params.timeUnknown && params.time) {
        [hour, min] = params.time.split(':').map(Number);
      }

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
      console.log("🔮 API REQUEST:", url);
      
      const response = await axios.get(url);
      const data = response.data;

      return {
          ascendant: data.chart?.lagna?.Lg?.rashi || "Unknown",
          moon_sign: data.chart?.graha?.Mo?.rashi || "Unknown",
          current_dasha: data.dasha?.periods?.Sa?.key || data.dasha?.periods?.Ju?.key || 'SYNC...',
          isMoonChart: !!params.timeUnknown,
          raw_response: data
      };
    } catch (error: any) {
      console.error("API ERROR:", error);
      throw new Error(`CONNECTION SEVERED. CODE: ${error.response?.status || 'NETWORK ERROR'}`);
    }
  }
};
