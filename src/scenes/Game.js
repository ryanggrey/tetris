import Phaser from "phaser";
import { colors } from "../colors";

const minoHeight = 25;
const minoWidth = 25;
const boardColumns = 10;
const boardRows = 20;

class Game extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
  }

  init(data) {}

  preload() {
    this.load.json("gravity", "assets/gravity.json");
    this.load.json("tetrominoColors", "assets/tetrominoColors.json");
    this.load.json("tetrominoes", "assets/tetrominoes.json");
  }

  create(data) {
    this.level = 8;
    this.yDelta = 0;
    this.gameOver = false;
    this.createBoard();
    this.tetromino = this.createRandomTetromino();
    this.staticTetrominoes = this.add.container();
  }

  createBoard() {
    const boardWidth = boardColumns * minoWidth;
    const boardHeight = boardRows * minoHeight;
    const baseSize = this.scale.baseSize;
    const x = Math.floor(baseSize.width / 2 - boardWidth / 2);
    const y = Math.floor(baseSize.height / 2 - boardHeight / 2);

    this.board = this.add.rectangle(
      x,
      y,
      boardColumns * minoWidth,
      boardRows * minoHeight
    );
    this.board.setOrigin(0);
    this.board.setStrokeStyle(1, colors.hexBlack);
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

    // spawn in top -2 rows, at column index 3 (4th column)
    const x = this.board.x + 3 * minoWidth;
    const y = this.board.y + -2 * minoHeight;
    const randomTetromino = this.createTetromino(
      tetrominoJSON,
      { x, y },
      tetrominoColor,
      colors.hexBlack
    );
    return randomTetromino;
  }

  createTetromino(tetromino, coord, fillColor, strokeColor) {
    const container = this.add.container();
    tetromino.forEach((row, yIndex) => {
      row.forEach((bit, xIndex) => {
        const x = coord.x + xIndex * minoWidth;
        const y = coord.y + yIndex * minoHeight;
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
    mino.setOrigin(0);
    return mino;
  }

  endGame() {
    this.gameOver = true;
    this.level = 1;
    this.yDelta = 0;
    this.staticTetrominoes = this.add.container();
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // assuming 60fps

    const bottomOfTetromino = this.tetromino.getBounds().bottom;
    const bottomOfBoard = this.board.y + boardRows * minoHeight;
    const isAtBottom = bottomOfTetromino >= bottomOfBoard;

    // stop tetromino if it hits the bottom or another tetromino
    if (isAtBottom || this.isOnAStaticTetromino()) {
      this.yDelta = 0;
      this.staticTetrominoes.add(this.tetromino);

      // if above the board, game over
      if (this.tetromino.getBounds().top < this.board.y) {
        this.endGame();
        return;
      }

      this.tetromino = this.createRandomTetromino();
    }

    // apply gravity, where 1G = 1 mino per frame
    const gravityJson = this.cache.json.get("gravity");
    const gravity = gravityJson[this.level];
    this.yDelta += gravity * minoHeight;
    if (this.yDelta >= minoHeight) {
      const quotient = Math.floor(this.yDelta / minoHeight);
      const yDelta = quotient * minoHeight;
      const remainder = this.yDelta % minoHeight;

      this.tetromino.y += yDelta;
      this.yDelta = remainder;
    }
  }

  isOnAStaticTetromino(tetromino) {
    var isOnAnotherTetromino = false;
    const staticTetrominoes = this.staticTetrominoes;
    staticTetrominoes.list.forEach((staticTetromino) => {
      staticTetromino.list.forEach((staticMino) => {
        this.tetromino.list.forEach((mino) => {
          const staticLeft = staticMino.x;
          const activeLeft = mino.x;
          const staticTop = staticMino.getBounds().top;
          const activeBottom = mino.getBounds().bottom;

          isOnAnotherTetromino =
            isOnAnotherTetromino ||
            (staticLeft === activeLeft && staticTop === activeBottom);
        });
      });
    });
    return isOnAnotherTetromino;
  }
}

export default Game;
