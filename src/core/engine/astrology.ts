export interface HoroscopeData {
  ascendant: string;
  moon_sign: string;
  sun_sign: string;
  planet_houses: Record<string, number>;
  moon_phase?: string;
  karmic_patterns?: Array<{id: string, diagnosis: string, solution: string}>;
  psychology?: { strength?: string, weakness?: string, obsession?: string };
  dasha: {
    current: string;
    end_date: string;
  };
  current_dasha?: string;
}

export const astrologyService = {
  calculate: async (data: any): Promise<HoroscopeData> => {
    return {
      ascendant: "Aries",
      moon_sign: "Taurus",
      sun_sign: "Gemini",
      planet_houses: { "Saturn": 1, "Rahu": 12, "Mars": 5 },
      moon_phase: "Waxing Crescent",
      karmic_patterns: [],
      psychology: { strength: "Willpower", weakness: "Insecurity", obsession: "Control" },
      dasha: { current: "Venus", end_date: "2025-01-01" },
      current_dasha: "Venus/Saturn"
    };
  },
  calculateHoroscope: async (data: any): Promise<HoroscopeData> => {
    return astrologyService.calculate(data);
  }
};
