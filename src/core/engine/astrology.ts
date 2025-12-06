import axios from 'axios';

export interface HoroscopeData {
  ascendant: string;
  moon_sign: string;
  sun_sign: string;
  planet_houses: Record<string, number>;
  planet_signs?: Record<string, string>;
  all_planets?: any;
  nakshatras?: any;
  dasha: {
    current: string;
    end_date: string;
  };
  current_dasha?: string;
  moon_phase?: string;
  karmic_patterns?: Array<{id: string, diagnosis: string, solution: string}>;
  psychology?: { strength?: string, weakness?: string, obsession?: string };
  transits?: any;
  vargas?: any;
}

const API_BASE_URL = "https://my-astrology-api-production.up.railway.app";
const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", 
  "Leo", "Virgo", "Libra", "Scorpio", 
  "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

const MOON_PHASES = [
    "New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous",
    "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent"
];

// Helper: Calculate Moon Phase from Tithi (1-30)
const getMoonPhase = (tithi: number): string => {
    if (tithi === 30) return "New Moon";
    if (tithi === 15) return "Full Moon";
    if (tithi > 0 && tithi < 8) return "Waxing Crescent";
    if (tithi >= 8 && tithi < 15) return "Waxing Gibbous";
    if (tithi > 15 && tithi < 23) return "Waning Gibbous";
    return "Waning Crescent";
};

// Helper: Recursive Dasha Finder
const findCurrentDasha = (dashaData: any, targetDate: Date = new Date()): string => {
    if (!dashaData || !dashaData.periods) return "Unsynchronized";

    let currentLevel = dashaData.periods;
    let path: string[] = [];

    // 1. Find Mahadasha
    for (const [planet, details] of Object.entries(currentLevel) as [string, any][]) {
        const start = new Date(details.start);
        const end = new Date(details.end);
        
        if (targetDate >= start && targetDate < end) {
            path.push(planet); // e.g., "Ve"
            
            // 2. Find Antardasha (Level 2)
            if (details.periods) {
                for (const [subPlanet, subDetails] of Object.entries(details.periods) as [string, any][]) {
                    const subStart = new Date(subDetails.start);
                    const subEnd = new Date(subDetails.end);
                    
                    if (targetDate >= subStart && targetDate < subEnd) {
                        path.push(subPlanet); // e.g., "Sa"
                        
                        // 3. Find Pratyantardasha (Level 3) - Optional/Deep
                        if (subDetails.periods) {
                             for (const [subSubPlanet, subSubDetails] of Object.entries(subDetails.periods) as [string, any][]) {
                                const ssStart = new Date(subSubDetails.start);
                                const ssEnd = new Date(subSubDetails.end);
                                if (targetDate >= ssStart && targetDate < ssEnd) {
                                    path.push(subSubPlanet); // e.g., "Ke"
                                    break;
                                }
                             }
                        }
                        break;
                    }
                }
            }
            break;
        }
    }

    return path.length > 0 ? path.join('/') : "Unsynchronized";
};

// Helper: Identify Karmic Patterns
const analyzeKarmicPatterns = (planets: any, houses: any) => {
    const patterns = [];

    // 1. Saturn in 1st, 7th, or 10th
    const saturnHouse = houses['Saturn'];
    if (saturnHouse === 1) patterns.push({ id: 'SATURN_ASCENDANT', diagnosis: 'Heavy burden of self-expectation. You age in reverse.', solution: 'Embrace discipline. Time is your ally.' });
    if (saturnHouse === 7) patterns.push({ id: 'SATURN_DESCENDANT', diagnosis: 'Relationships feel like karmic contracts. Delays in marriage.', solution: 'Commitment requires sacrifice. Patience brings stability.' });
    if (saturnHouse === 10) patterns.push({ id: 'SATURN_MIDHEAVEN', diagnosis: 'Professional delay followed by massive authority.', solution: 'Build slowly. Your empire will last forever.' });

    // 2. Rahu/Ketu Axis
    const rahuHouse = houses['Rahu'];
    if (rahuHouse === 1) patterns.push({ id: 'RAHU_SELF', diagnosis: 'Obsession with identity and fame. An insatiable hunger.', solution: 'Innovate, but stay grounded. Illusion is your trap.' });
    if (rahuHouse === 5) patterns.push({ id: 'RAHU_CREATION', diagnosis: 'Unconventional intelligence. Gambling with destiny.', solution: 'Channel chaos into art. Avoid speculation.' });
    if (rahuHouse === 12) patterns.push({ id: 'RAHU_VOID', diagnosis: 'Vivid dreams, foreign lands, and hidden enemies.', solution: 'Meditation is your shield. Explore the subconscious.' });

    // 3. Mars (Mangal Dosha Check - Simplified)
    const marsHouse = houses['Mars'];
    if ([1, 4, 7, 8, 12].includes(marsHouse)) patterns.push({ id: 'MARS_FIRE', diagnosis: 'Intensity in relationships. A warrior spirit that burns.', solution: 'Physical exertion is mandatory. Protect your partners.' });

    return patterns;
};

// Helper: Psychology Engine
const analyzePsychology = (moonSign: string, ascendant: string, planets: any) => {
    const fire = ['Aries', 'Leo', 'Sagittarius'];
    const water = ['Cancer', 'Scorpio', 'Pisces'];
    const air = ['Gemini', 'Libra', 'Aquarius'];
    const earth = ['Taurus', 'Virgo', 'Capricorn'];

    let strength = "Adaptability";
    let weakness = "Indecision";
    let obsession = "Knowledge";

    if (fire.includes(ascendant)) { strength = "Courage"; weakness = "Impatience"; obsession = "Legacy"; }
    if (water.includes(ascendant)) { strength = "Intuition"; weakness = "Hypersensitivity"; obsession = "Connection"; }
    if (earth.includes(ascendant)) { strength = "Endurance"; weakness = "Rigidity"; obsession = "Security"; }
    if (air.includes(ascendant)) { strength = "Intellect"; weakness = "Detachment"; obsession = "Truth"; }

    if (moonSign === 'Scorpio') { obsession = "Power"; weakness = "Paranoia"; }
    if (moonSign === 'Capricorn') { obsession = "Control"; weakness = "Isolation"; }
    
    return { strength, weakness, obsession };
};

export const astrologyService = {
  calculate: async (userData: any): Promise<HoroscopeData> => {
    try {
        // 1. Prepare Payload
        const payload = {
            year: parseInt(userData.birthYear),
            month: parseInt(userData.birthMonth),
            day: parseInt(userData.birthDate),
            hour: parseInt(userData.birthTime.split(':')[0]),
            min: parseInt(userData.birthTime.split(':')[1]),
            lat: parseFloat(userData.birthLat),
            lon: parseFloat(userData.birthLng),
            tzone: 5.5 // Defaulting to India/IST for now as per API reqs, or use dynamic
        };

        console.log("🚀 IGNITING ASTROLOGY ENGINE:", payload);

        // 2. Call External API
        const response = await axios.post(`${API_BASE_URL}/calculate/all`, payload);
        const data = response.data;
        
        // 3. Extract Core Data
        const planets = data.planets; // D1 Chart
        const houses = data.houses;   // Bhava Chalit
        const ascendant = houses[1]?.sign || "Unknown"; // House 1 Sign
        const moonSign = planets['Moon']?.rashi || "Unknown";
        const sunSign = planets['Sun']?.rashi || "Unknown";

        // 4. Map Houses (Planet -> House Number)
        // The API returns houses as { "1": { sign: "Aries", planets: ["Sun"] } }
        // We need { "Sun": 1 }
        const planetHouses: Record<string, number> = {};
        
        // Initialize defaults to avoid crashes
        ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'].forEach(p => {
            planetHouses[p] = 0;
        });

        Object.entries(houses).forEach(([houseNum, details]: [string, any]) => {
            if (details.planets && Array.isArray(details.planets)) {
                details.planets.forEach((planet: string) => {
                    planetHouses[planet] = parseInt(houseNum);
                });
            }
        });

        // 5. Calculate Dasha
        const currentDasha = findCurrentDasha(data.dasha);
        
        // 6. Calculate Moon Phase
        const moonPhase = getMoonPhase(data.panchang?.tithi || 15);

        // 7. Advanced Analysis
        const karmicPatterns = analyzeKarmicPatterns(planets, planetHouses);
        const psychology = analyzePsychology(moonSign, ascendant, planets);

        console.log("✅ CHART DECRYPTED:", { ascendant, moonSign, currentDasha });

        return {
            ascendant,
            moon_sign: moonSign,
            sun_sign: sunSign,
            planet_houses: planetHouses,
            planet_signs: {}, // Populated if needed
            all_planets: planets,
            nakshatras: data.nakshatras,
            vargas: data.vargas, // D9 is here
            transits: data.transits, // Current transits
            dasha: {
                current: currentDasha.split('/')[0], // Just Mahadasha
                end_date: "Unknown" // API might not give easy end date
            },
            current_dasha: currentDasha,
            moon_phase: moonPhase,
            karmic_patterns: karmicPatterns,
            psychology: psychology
        };

    } catch (error) {
        console.error("❌ ASTROLOGY ENGINE FAILURE:", error);
        // FALLBACK TO MOCK IF API FAILS (Safety Net)
        return {
            ascendant: "Aries",
            moon_sign: "Taurus",
            sun_sign: "Gemini",
            planet_houses: { "Saturn": 1, "Rahu": 12, "Mars": 5 },
            dasha: { current: "Venus", end_date: "2025-01-01" },
            current_dasha: "Venus/Saturn (SYSTEM OFFLINE)",
            moon_phase: "Waxing Crescent",
            karmic_patterns: [{ id: 'SYSTEM_OFFLINE', diagnosis: 'Connection to the stars interrupted.', solution: 'Retry later.' }],
            psychology: { strength: "Resilience", weakness: "Unknown", obsession: "Connection" }
        };
    }
  },
  calculateHoroscope: async (data: any): Promise<HoroscopeData> => {
    return astrologyService.calculate(data);
  }
};
