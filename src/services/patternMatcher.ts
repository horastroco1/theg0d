import { GOD_PROTOCOL_DB } from '@/lib/godProtocol';

export interface KarmicPattern {
    id: string;
    category: 'career' | 'love' | 'wealth';
    diagnosis: string;
    solution: string;
}

export const matchLifePatterns = (planets: any, houses: any, planetHouses: any): KarmicPattern[] => {
    const patterns: KarmicPattern[] = [];
    
    // Helper to find Lord of a House
    const getLordOfHouse = (houseNum: number) => {
        const sign = houses[houseNum.toString()]?.rashi; // 1-12
        // Sign Lords: 1(Ma), 2(Ve), 3(Me), 4(Mo), 5(Su), 6(Me), 7(Ve), 8(Ma), 9(Ju), 10(Sa), 11(Sa), 12(Ju)
        const lords = [
            null, 'Ma', 'Ve', 'Me', 'Mo', 'Su', 'Me', 'Ve', 'Ma', 'Ju', 'Sa', 'Sa', 'Ju'
        ];
        return lords[sign];
    };

    // 1. CAREER PATTERNS
    // A. Volatile Career (10th Lord in 8th or 12th)
    const lord10 = getLordOfHouse(10);
    if (lord10 && planetHouses[lord10]) {
        const house = planetHouses[lord10];
        if (house === 8 || house === 12) {
            const proto = GOD_PROTOCOL_DB.career.find(p => p.id === 'volatile_career');
            if (proto) patterns.push({ ...proto, category: 'career' });
        }
    }

    // B. Authority Conflict (Sun in 10th)
    if (planetHouses['Su'] === 10) {
         const proto = GOD_PROTOCOL_DB.career.find(p => p.id === 'authority_conflict');
         if (proto) patterns.push({ ...proto, category: 'career' });
    }

    // 2. LOVE PATTERNS
    // A. Karmic Blockage (Saturn in 7th)
    if (planetHouses['Sa'] === 7) {
        const proto = GOD_PROTOCOL_DB.love.find(p => p.id === 'karmic_blockage');
        if (proto) patterns.push({ ...proto, category: 'love' });
    }

    // B. Burning Love (Mars in 7th or Venus Combust)
    // We'll check Mars in 7th for simplicity of this hardcoded logic (Venus combust needs degrees)
    if (planetHouses['Ma'] === 7) {
        const proto = GOD_PROTOCOL_DB.love.find(p => p.id === 'burning_love');
        if (proto) patterns.push({ ...proto, category: 'love' });
    }

    // 3. WEALTH PATTERNS
    // A. Rahu Greed (Rahu in 2nd or 11th)
    const rahuHouse = planetHouses['Ra'];
    if (rahuHouse === 2 || rahuHouse === 11) {
        const proto = GOD_PROTOCOL_DB.wealth.find(p => p.id === 'rahu_greed');
        if (proto) patterns.push({ ...proto, category: 'wealth' });
    }

    // B. Hard Earned (Saturn in 2nd or 11th)
    const satHouse = planetHouses['Sa'];
    if (satHouse === 2 || satHouse === 11) {
        const proto = GOD_PROTOCOL_DB.wealth.find(p => p.id === 'hard_earned');
        if (proto) patterns.push({ ...proto, category: 'wealth' });
    }

    return patterns;
};

