const levelCalculator = (totalRowsCleared) => {
  const levelUpThreshold = 10;
  const maxLevel = 20;
  const divisionResult = totalRowsCleared / levelUpThreshold;
  const fractionRemainder = divisionResult % 1;
  const level = divisionResult - fractionRemainder + 1;
  const cappedLevel = Math.min(level, maxLevel);
  return cappedLevel;
};

export default levelCalculator;
