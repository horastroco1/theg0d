export const dashaEngine = {
  calculate: (moonLongitude: number, birthDate: Date): string => {
    // Vimshottari Dasha Sequence (Years)
    // Order: Ketu, Venus, Sun, Moon, Mars, Rahu, Jupiter, Saturn, Mercury
    const DASHA_ORDER = ['Ke', 'Ve', 'Su', 'Mo', 'Ma', 'Ra', 'Ju', 'Sa', 'Me'];
    const DASHA_YEARS: Record<string, number> = {
      'Ke': 7, 'Ve': 20, 'Su': 6, 'Mo': 10, 'Ma': 7, 'Ra': 18, 'Ju': 16, 'Sa': 19, 'Me': 17
    };
    const TOTAL_CYCLE = 120;

    // 1. Find Starting Nakshatra and Balance
    // 360 degrees / 27 nakshatras = 13.3333... degrees per nakshatra
    const NAKSHATRA_SPAN = 360 / 27; 
    
    // Nakshatra Index (0-26). 0 = Ashwini (Ketu), 1 = Bharani (Venus)...
    // The sequence of Lords repeats every 9 nakshatras.
    // 0 -> Ketu, 1 -> Venus ... 8 -> Mercury, 9 -> Ketu ...
    const moonLon = moonLongitude % 360;
    const nakshatraIndex = Math.floor(moonLon / NAKSHATRA_SPAN);
    const lordIndex = nakshatraIndex % 9;
    const startLord = DASHA_ORDER[lordIndex];
    
    // How far into the nakshatra is the moon?
    const degreesTraversed = moonLon - (nakshatraIndex * NAKSHATRA_SPAN);
    const fractionTraversed = degreesTraversed / NAKSHATRA_SPAN;
    const fractionRemaining = 1 - fractionTraversed;
    
    // Balance of Dasha at birth (Years remaining in the starting lord's period)
    const balanceYears = fractionRemaining * DASHA_YEARS[startLord];
    
    // 2. Travel through time to find Current Mahadasha
    const now = new Date();
    // Ensure we handle valid dates
    if (isNaN(birthDate.getTime())) return "Unsynchronized";

    let currentDateMarker = new Date(birthDate.getTime());
    // Add Balance Years to get end of first period
    currentDateMarker.setFullYear(currentDateMarker.getFullYear() + Math.floor(balanceYears));
    // Add remaining fraction of year (days)
    const balanceDays = (balanceYears % 1) * 365.25;
    currentDateMarker.setDate(currentDateMarker.getDate() + balanceDays);

    // Check if we are still in the first period
    let currentMahadasha = startLord;
    let currentMDStartDate = new Date(birthDate.getTime()); // For Antardasha calc
    let currentMDEndDate = new Date(currentDateMarker.getTime());

    // Pointer to iterate sequence
    let pointer = (lordIndex + 1) % 9;

    // If birth was already after now (impossible but safe check), or if we are still in first period
    if (now < currentDateMarker) {
        currentMahadasha = startLord;
        currentMDStartDate = new Date(birthDate.getTime());
        currentMDEndDate = new Date(currentDateMarker.getTime());
    } else {
        // Loop until we pass "Now"
        // Safety break: 150 years
        let safety = 0;
        while (currentDateMarker < now && safety < 20) {
            const lord = DASHA_ORDER[pointer];
            const duration = DASHA_YEARS[lord];
            
            currentMDStartDate = new Date(currentDateMarker.getTime());
            
            // Add duration
            currentDateMarker.setFullYear(currentDateMarker.getFullYear() + duration);
            currentMDEndDate = new Date(currentDateMarker.getTime());
            
            if (now < currentDateMarker) {
                currentMahadasha = lord;
                break;
            }
            
            pointer = (pointer + 1) % 9;
            safety++;
        }
    }

    // 3. Calculate Antardasha (Sub-Period)
    // Logic: Antardasha segments are proportional to the Mahadasha years
    // Formula: (Mahadasha Years * Antardasha Planet Years) / 120 = Duration in Years
    
    // Start checking sub-periods from the Start Date of the current Mahadasha
    let subDateMarker = new Date(currentMDStartDate.getTime());
    
    // The first Antardasha is always the Mahadasha lord itself
    // Sequence starts from the Mahadasha lord and follows standard order
    let subPointer = DASHA_ORDER.indexOf(currentMahadasha);
    let currentAntardasha = currentMahadasha; // Default

    for (let i = 0; i < 9; i++) {
        const subLord = DASHA_ORDER[subPointer];
        const subDurationYears = (DASHA_YEARS[currentMahadasha] * DASHA_YEARS[subLord]) / 120;
        
        // Add sub-duration
        const subEndDate = new Date(subDateMarker.getTime());
        subEndDate.setFullYear(subEndDate.getFullYear() + Math.floor(subDurationYears));
        const subDays = (subDurationYears % 1) * 365.25;
        subEndDate.setDate(subEndDate.getDate() + subDays);
        
        if (now < subEndDate) {
            currentAntardasha = subLord;
            break;
        }
        
        subDateMarker = subEndDate;
        subPointer = (subPointer + 1) % 9;
    }

    return `${currentMahadasha}/${currentAntardasha}`;
  }
};

