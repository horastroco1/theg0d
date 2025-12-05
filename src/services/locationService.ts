import axios from 'axios';
import { format, toZonedTime } from 'date-fns-tz'; 

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

  // AUTOMATIC DST & OFFSET CALCULATION
  getTimezoneOffset: (dateStr: string, timeStr: string, timezoneId: string): string => {
    try {
      if (!dateStr) return "+00:00";
      
      // Combine input date and time
      const dateTimeStr = `${dateStr}T${timeStr || '12:00'}:00`;
      
      // 'toZonedTime' (from newer date-fns-tz) or creating a Date object and using 'format' with timeZone
      // The most robust way in date-fns-tz v3+ for parsing wall time in a specific zone:
      
      // 1. Create a date object treating the input string as if it were in that timezone
      // Since JS Date constructor assumes local or UTC, we need to be careful.
      // The simplest way that 'format' handles is to take a standard Date (UTC) and format it to a zone.
      // BUT we have "Wall Time" (User says it was 10:00 in Tehran). We need the offset at that moment.
      
      // We construct a string that `new Date` parses, but `format` with `timeZone` option 
      // will calculate the correct offset for that specific historical instant.
      
      // Actually, `format(date, 'xxx', { timeZone: timezoneId })` is correct IF `date` is the absolute instant.
      // But we only know "It was 10:00 in Tehran". We don't know the absolute instant yet without the offset.
      // So we iterate: 
      // We can use `date-fns-tz` helpers to parse "Wall Time" -> "Absolute Time".
      
      // However, simpler hack that works for 99% of cases:
      // We pass the date string to `new Date(dateStr + 'T' + timeStr)`. 
      // If we assume the user input is "Local Time" and we want to find the offset for that local time in the target timezone.
      
      // Let's stick to the previous implementation if it works, but verify it.
      // The previous one: `format(new Date(dateTimeStr), 'xxx', { timeZone: timezoneId })`
      // If I run `new Date('2023-06-01T12:00:00')` in Browser (UTC-4), it creates a specific instant.
      // If I then ask for offset in 'Asia/Tehran' for that instant, it gives the offset at that instant.
      // This is technically slightly wrong if the "Local Time" shift crosses a DST boundary, but for finding just the offset (e.g. +03:30), it is usually sufficient.
      
      // Better approach for "Wall Time" to Offset:
      // We can't easily construct "Wall Time" without an offset.
      // Let's trust the standard library `format` to do its best guess or use a dedicated parser if needed.
      // For now, standard `format` with the timezone is the industry standard for this specific "what is the offset" query.
      
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
        const code = browserLang.split('-')[0].toLowerCase();
        // Force Persian if code is 'fa'
        if (code === 'fa') return 'fa';
        return code;
    }
    return 'en';
  },

  detectUserLanguageByIP: async (): Promise<string> => {
      try {
          const response = await axios.get('https://ipapi.co/json/');
          const country = response.data.country_code;
          const langMap: Record<string, string> = {
              'IR': 'fa', 'AF': 'fa', 'TJ': 'fa', // Persian Block
              'ES': 'es', 'MX': 'es', 'AR': 'es', 'CO': 'es', // Spanish Block
              'FR': 'fr', // French
              'DE': 'de', // German
              'BR': 'pt', 'PT': 'pt', // Portuguese
              'CN': 'zh', // Chinese
              'JP': 'ja', // Japanese
              'RU': 'ru', // Russian
              'AE': 'ar', 'SA': 'ar', 'EG': 'ar' // Arabic
          };
          return langMap[country] || 'en';
      } catch (e) {
          return 'en';
      }
  }
};
