import Phaser from "phaser";
import { colors } from "../colors";

class Game extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
  }

  init(data) {}

  preload() {
    this.load.json("tetrominoes", "assets/tetrominoes.json");
  }

  create(data) {
    // draw tetrominos

    const tetrominoes = this.cache.json.get("tetrominoes");
    console.log(tetrominoes);
    this.drawTetromino(
      tetrominoes.j,
      { x: 0, y: 0 },
      colors.hexBlue,
      colors.hexBlack
    );
    this.drawTetromino(
      tetrominoes.l,
      { x: 60, y: 0 },
      colors.hexOrange,
      colors.hexBlack
    );
    this.drawTetromino(
      tetrominoes.o,
      { x: 120, y: 0 },
      colors.hexYellow,
      colors.hexBlack
    );
    this.drawTetromino(
      tetrominoes.s,
      { x: 160, y: 0 },
      colors.hexGreen,
      colors.hexBlack
    );
    this.drawTetromino(
      tetrominoes.t,
      { x: 220, y: 0 },
      colors.hexPink,
      colors.hexBlack
    );
    this.drawTetromino(
      tetrominoes.z,
      { x: 280, y: 0 },
      colors.hexRed,
      colors.hexBlack
    );
    this.drawTetromino(
      tetrominoes.i,
      { x: 340, y: 0 },
      colors.hexLightBlue,
      colors.hexBlack
    );
  }

  drawTetromino(tetromino, coord, fillColor, strokeColor) {
    tetromino.forEach((row, yIndex) => {
      row.forEach((bit, xIndex) => {
        const width = 20;
        const height = 20;
        const x = coord.x + width / 2 + xIndex * width;
        const y = coord.y + height / 2 + yIndex * height;
        if (bit) {
          this.drawMino(x, y, width, height, fillColor, strokeColor);
        }
      });
    });
  }

  drawMino(x, y, width, height, fillColor, strokeColor) {
    const mino = this.add.rectangle(x, y, width, height, fillColor);
    mino.setStrokeStyle(1, strokeColor);
  }

  update(time, delta) {}
}

export default Game;
