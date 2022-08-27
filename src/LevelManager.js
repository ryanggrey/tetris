import calculateLevel from "./levelCalculator";

class LevelManager {
  constructor(onLevelUp) {
    this.reset();
    this._onLevelUp = onLevelUp;
  }

  _setLevel(level) {
    if (this._level === level) {
      return;
    }
    this._level = level;

    this._onLevelUp(level);
  }

  reset() {
    this._level = 1;
  }

  getLevel() {
    return this._level;
  }

  incrementLevelFor(totalRowsCleared) {
    const newLevel = calculateLevel(totalRowsCleared);
    this._setLevel(newLevel);
  }
}

export default LevelManager;
