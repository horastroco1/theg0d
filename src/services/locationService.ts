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
  searchCity: async (city: string): Promise<LocationData[]> => {
    if (!city || city.length < 3) return [];

    try {
      const response = await axios.get(GEO_API_URL, {
        params: {
          name: city,
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

  // Calculate exact timezone offset (e.g., "+05:30") for a specific date/location
  getTimezoneOffset: (dateStr: string, timeStr: string, timeZoneName: string): string => {
    try {
      // Combine date and time. If time is missing, default to noon for offset calculation (though DST usually changes at 2am)
      const dateTimeStr = `${dateStr}T${timeStr || '12:00'}:00`;
      const date = new Date(dateTimeStr);
      
      // 'xxx' gives offset like +05:30 or -04:00
      return format(date, 'xxx', { timeZone: timeZoneName });
    } catch (error) {
      console.error("Timezone Offset Error:", error);
      return "+00:00";
    }
  }
};
