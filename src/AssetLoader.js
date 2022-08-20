class AssetLoader {
  constructor(game) {
    this.game = game;
  }

  preload() {
    this.game.load.json("gravity", "assets/gravity.json");
    this.game.load.json("speed", "assets/speed.json");
    this.game.load.json("colors", "assets/colors.json");
    this.game.load.json("tetrominoes", "assets/tetrominoes.json");
    this.game.load.json("wallkick", "assets/wallkick.json");
    this.game.load.json("score", "assets/score.json");
  }

  _getCacheKey(key) {
    return this.game.cache.json.get(key);
  }

  getGravity() {
    return this._getCacheKey("gravity");
  }

  getSpeed() {
    return this._getCacheKey("speed");
  }

  getColors() {
    return this._getCacheKey("colors");
  }

  getTetrominoColor(tetrominoName) {
    return this.getColors()[tetrominoName];
  }

  getTetrominoBorderColor(tetrominoName) {
    const borderName = `${tetrominoName}Border`;
    return this.getColors()[borderName];
  }

  getMenuColor(name) {
    const stringColor = this.getColors()[name];
    const numberColor = parseInt(stringColor.replace(/^#/, ""), 16);
    return numberColor;
  }

  getTetrominoes() {
    return this._getCacheKey("tetrominoes");
  }

  getTetromino(tetrominoName) {
    return this.getTetrominoes()[tetrominoName];
  }

  getTetrominoJSON(tetrominoName) {
    const tetrominoRotations = this.getTetromino(tetrominoName);
    const tetrominoJSON = tetrominoRotations[0];
    return tetrominoJSON;
  }

  getWallkick(tetrominoName) {
    return this._getCacheKey("wallkick")[tetrominoName];
  }

  getScore() {
    return this._getCacheKey("score");
  }

  getScoreNamed(scoreName) {
    return this.getScore()[scoreName];
  }
}

export default AssetLoader;
