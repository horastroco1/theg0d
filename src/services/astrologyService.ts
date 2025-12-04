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
      let hour = 12;
      let min = 0;

      if (!params.timeUnknown && params.time) {
        [hour, min] = params.time.split(':').map(Number);
      }

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

      console.log("🔮 CALLING API:", queryParams);

      const response = await axios.get(API_URL, { params: queryParams });
      const data = response.data;

      return {
          ascendant: data.chart?.lagna?.Lg?.rashi || "Unknown",
          moon_sign: data.chart?.graha?.Mo?.rashi || "Unknown",
          current_dasha: data.dasha?.periods?.Sa?.key || data.dasha?.periods?.Ju?.key || 'SYNC...',
          isMoonChart: !!params.timeUnknown,
          raw_response: data
      };
    } catch (error: any) {
      console.error("API FAILURE:", error);
      throw new Error(`CONNECTION SEVERED. CODE: ${error.response?.status || 'NETWORK ERROR'}`);
    }
  }
};
