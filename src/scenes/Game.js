import Phaser from "phaser";
import { colors } from "../colors";

const minoHeight = 20;
const minoWidth = 20;
const boardY = 0;
const boardColumns = 10;
const boardRows = 20;

class Game extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
    this.level = 8;
    this.yDelta = 0;
  }

  init(data) {}

  preload() {
    this.load.json("gravity", "assets/gravity.json");
    this.load.json("tetrominoColors", "assets/tetrominoColors.json");
    this.load.json("tetrominoes", "assets/tetrominoes.json");
  }

  create(data) {
    // draw tetrominos

    const tetrominoes = this.cache.json.get("tetrominoes");
    const tetrominoColors = this.cache.json.get("tetrominoColors");
    this.createTetromino(
      tetrominoes.i[0],
      { x: 0, y: 0 },
      tetrominoColors["i"],
      colors.hexBlack
    );

    this.createTetromino(
      tetrominoes.j[0],
      { x: 80, y: 0 },
      tetrominoColors["j"],
      colors.hexBlack
    );
    this.createTetromino(
      tetrominoes.l[0],
      { x: 140, y: 0 },
      colors.hexOrange,
      colors.hexBlack
    );
    this.createTetromino(
      tetrominoes.o[0],
      { x: 200, y: 0 },
      colors.hexYellow,
      colors.hexBlack
    );
    this.createTetromino(
      tetrominoes.s[0],
      { x: 280, y: 0 },
      colors.hexGreen,
      colors.hexBlack
    );
    this.createTetromino(
      tetrominoes.t[0],
      { x: 340, y: 0 },
      colors.hexPink,
      colors.hexBlack
    );
    this.createTetromino(
      tetrominoes.z[0],
      { x: 400, y: 0 },
      colors.hexRed,
      colors.hexBlack
    );

    this.tetromino = this.createRandomTetromino();
  }

  createRandomTetromino() {
    const tetrominoEntries = Object.entries(this.cache.json.get("tetrominoes"));
    const tetrominoColors = this.cache.json.get("tetrominoColors");

    const randomIndex = Phaser.Math.Between(0, tetrominoEntries.length - 1);
    const randomTetrominoEntry = tetrominoEntries[randomIndex];
    const tetrominoName = randomTetrominoEntry[0];
    const tetrominoRotations = randomTetrominoEntry[1];
    const tetrominoJSON = tetrominoRotations[0];
    const tetrominoColor = tetrominoColors[tetrominoName];
    const randomTetromino = this.createTetromino(
      tetrominoJSON,
      { x: 0, y: 0 },
      tetrominoColor,
      colors.hexBlack
    );
    return randomTetromino;
  }

  createTetromino(tetromino, coord, fillColor, strokeColor) {
    const container = this.add.container();
    tetromino.forEach((row, yIndex) => {
      row.forEach((bit, xIndex) => {
        const x = coord.x + minoWidth / 2 + xIndex * minoWidth;
        const y = coord.y + minoHeight / 2 + yIndex * minoHeight;
        if (bit) {
          const mino = this.createMino(
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

  createMino(x, y, width, height, fillColor, strokeColor) {
    const mino = this.add.rectangle(x, y, width, height, fillColor);
    mino.setStrokeStyle(1, strokeColor);
    return mino;
  }

  update(time, delta) {
    // assuming 60fps

    const bottomOfTetromino = this.tetromino.getBounds().bottom;
    const bottomOfBoard = boardY + boardRows * minoHeight;
    if (bottomOfTetromino >= bottomOfBoard) {
      this.yDelta = 0;
      this.tetromino = this.createRandomTetromino();
    }
    const gravityJson = this.cache.json.get("gravity");
    const gravity = gravityJson[this.level];

    // 1G = 1 mino per frame
    this.yDelta += gravity * minoHeight;
    if (this.yDelta >= minoHeight) {
      const quotient = Math.floor(this.yDelta / minoHeight);
      const yDelta = quotient * minoHeight;
      const remainder = this.yDelta % minoHeight;

      this.tetromino.y += yDelta;
      this.yDelta = remainder;
    }
  }
}

export default Game;
