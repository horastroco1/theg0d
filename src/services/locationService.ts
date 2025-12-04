import axios from 'axios';
import { format } from 'date-fns-tz';

const GEO_API_URL = 'https://geocoding-api.open-meteo.com/v1/search';

export interface LocationData {
  name: string;
  latitude: number;
  longitude: number;
  timezone: string;
  country?: string;
}

export const locationService = {
  searchCity: async (query: string): Promise<LocationData[]> => {
    if (!query || query.length < 3) return [];

    try {
      const response = await axios.get(GEO_API_URL, {
        params: {
          name: query,
          count: 5,
          language: 'en',
          format: 'json'
        }
      });

      if (response.data && response.data.results) {
        return response.data.results.map((item: any) => ({
          name: item.name,
          latitude: item.latitude,
          longitude: item.longitude,
          timezone: item.timezone,
          country: item.country
        }));
      }
      return [];
    } catch (error) {
      console.error("Location API Error:", error);
      return [];
    }
  },

  getTimezoneOffset: (dateStr: string, timeStr: string, timezoneId: string): string => {
    try {
      if (!dateStr) return "+00:00";
      const dateTimeStr = `${dateStr}T${timeStr || '12:00'}:00`;
      const date = new Date(dateTimeStr);
      if (isNaN(date.getTime())) return "+00:00";
      return format(date, 'xxx', { timeZone: timezoneId });
    } catch (error) {
      console.error("Timezone Offset Error:", error);
      return "+00:00";
    }
  },

  detectUserLanguage: (): string => {
    if (typeof navigator === 'undefined') return 'en';
    
    // Primary: Browser Language (e.g. 'es-ES' -> 'es')
    const browserLang = navigator.language || (navigator as any).userLanguage;
    if (browserLang) {
        return browserLang.split('-')[0].toLowerCase();
    }
    return 'en';
  }
};
