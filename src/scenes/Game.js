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
    this.drawTetromino(
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
    const tetrominoGroup = this.physics.add.group({
      collideWorldBounds: true,
    });
    tetromino.forEach((row, yIndex) => {
      row.forEach((bit, xIndex) => {
        const width = 20;
        const height = 20;
        const x = coord.x + width / 2 + xIndex * width;
        const y = coord.y + height / 2 + yIndex * height;
        if (bit) {
          const mino = this.drawMino(
            x,
            y,
            width,
            height,
            fillColor,
            strokeColor
          );
          tetrominoGroup.add(mino);
        }
      });
    });
  }

  drawMino(x, y, width, height, fillColor, strokeColor) {
    const mino = this.add.rectangle(x, y, width, height, fillColor);
    mino.setStrokeStyle(1, strokeColor);
    return mino;
  }

  update(time, delta) {}
}

export default Game;
