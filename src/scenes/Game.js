import Phaser from "phaser";
import { colors } from "../colors";

const minoHeight = 20;
const minoWidth = 20;

class Game extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
    this.level = 1;
    this.yDelta = 0;
  }

  init(data) {}

  preload() {
    this.load.json("tetrominoes", "assets/tetrominoes.json");
    this.load.json("gravity", "assets/gravity.json");
  }

  create(data) {
    // draw tetrominos

    const tetrominoes = this.cache.json.get("tetrominoes");
    this.tetromino = this.drawTetromino(
      tetrominoes.i[0],
      { x: 0, y: 0 },
      colors.hexLightBlue,
      colors.hexBlack
    );

    this.drawTetromino(
      tetrominoes.j[0],
      { x: 80, y: 0 },
      colors.hexBlue,
      colors.hexBlack
    );
    this.drawTetromino(
      tetrominoes.l[0],
      { x: 140, y: 0 },
      colors.hexOrange,
      colors.hexBlack
    );
    this.drawTetromino(
      tetrominoes.o[0],
      { x: 200, y: 0 },
      colors.hexYellow,
      colors.hexBlack
    );
    this.drawTetromino(
      tetrominoes.s[0],
      { x: 280, y: 0 },
      colors.hexGreen,
      colors.hexBlack
    );
    this.drawTetromino(
      tetrominoes.t[0],
      { x: 340, y: 0 },
      colors.hexPink,
      colors.hexBlack
    );
    this.drawTetromino(
      tetrominoes.z[0],
      { x: 400, y: 0 },
      colors.hexRed,
      colors.hexBlack
    );
  }

  drawTetromino(tetromino, coord, fillColor, strokeColor) {
    const container = this.add.container();
    tetromino.forEach((row, yIndex) => {
      row.forEach((bit, xIndex) => {
        const x = coord.x + minoWidth / 2 + xIndex * minoWidth;
        const y = coord.y + minoHeight / 2 + yIndex * minoHeight;
        if (bit) {
          const mino = this.drawMino(
            x,
            y,
            minoWidth,
            minoHeight,
            fillColor,
            strokeColor
          );
          container.add(mino);
        }
      });
    });
    return container;
  }

  drawMino(x, y, width, height, fillColor, strokeColor) {
    const mino = this.add.rectangle(x, y, width, height, fillColor);
    mino.setStrokeStyle(1, strokeColor);
    return mino;
  }

  update(time, delta) {
    // assuming 60fps

    const gravityJson = this.cache.json.get("gravity");
    const gravity = gravityJson[this.level];

    // 1G = 1 mino per frame
    this.yDelta += gravity * minoHeight;
    if (this.yDelta >= minoHeight) {
      this.tetromino.y += minoHeight;
      this.yDelta = this.yDelta % minoHeight;
    }
  }
}

export default Game;
