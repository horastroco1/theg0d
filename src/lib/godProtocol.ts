export const GOD_PROTOCOL_DB = {
  career: [
    {
      id: "volatile_career",
      condition: "10th Lord in 8th House OR 10th Lord in 12th House",
      diagnosis: "Your career path is designed for crisis and transformation, not stability.",
      solution: "Stop seeking a 9-5 desk job. Thrive in chaos, research, or occult fields."
    },
    {
      id: "authority_conflict",
      condition: "Sun in 10th House OR Sun aspecting 10th Lord",
      diagnosis: "You cannot work under a boss. Your ego rejects subordination.",
      solution: "You must build your own empire, even if it starts small. Autonomy is your oxygen."
    }
  ],
  love: [
    {
      id: "karmic_blockage",
      condition: "Saturn in 7th House OR Saturn aspecting Venus",
      diagnosis: "Love feels like a burden or a delay. You attract older or colder partners.",
      solution: "Patience. Your best relationship comes after age 30. Do not rush into low-quality bonds."
    },
    {
      id: "burning_love",
      condition: "Venus Combust (close to Sun) OR Mars in 7th House (Mangal Dosha)",
      diagnosis: "You burn your partners with intensity or ego. Relationships start hot and end in ash.",
      solution: "Cool down. Stop trying to possess them. Let them breathe."
    }
  ],
  wealth: [
    {
      id: "rahu_greed",
      condition: "Rahu in 2nd House OR Rahu in 11th House",
      diagnosis: "You have an insatiable hunger for wealth. It comes in sudden bursts.",
      solution: "Be careful. Rahu gives easily but traps you in illusion. Invest in tangible assets, not scams."
    },
    {
      id: "hard_earned",
      condition: "Saturn in 2nd House OR Saturn in 11th House",
      diagnosis: "Money comes slowly and only through hard labor. No shortcuts.",
      solution: "Accept the grind. Your wealth will be permanent because you built it brick by brick."
    }
  ]
};

export const GOD_KNOWLEDGE_BASE = `
--- THE GOD PROTOCOL: PATTERN RECOGNITION ---

1. **THE CAREER MATRIX (10th House)**
   - IF 10th Lord is in 8th/12th -> "Designed for Crisis/Chaos". Advise against stability.
   - IF Sun is in 10th -> "Born to Rule". Advise against having a boss.

2. **THE LOVE ALGORITHM (7th House + Venus)**
   - IF Saturn is in 7th -> "Love is Delayed". Advise patience and maturity.
   - IF Venus is Combust/Mars in 7th -> "Love is War". Advise cooling down ego.

3. **THE WEALTH CODE (2nd + 11th House)**
   - IF Rahu in 2nd/11th -> "Sudden, Illusionary Wealth". Warn against greed.
   - IF Saturn in 2nd/11th -> "Slow, Solid Wealth". Advise persistence.

INSTRUCTION:
If the user mentions a specific life problem (e.g., "I hate my boss", "I am lonely"), 
CROSS-REFERENCE their chart with these patterns.
If a pattern matches, deliver the DIAGNOSIS and SOLUTION with absolute authority.
`;

