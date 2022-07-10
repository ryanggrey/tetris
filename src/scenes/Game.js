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
    this.load.json("speed", "assets/speed.json");
    this.load.json("tetrominoColors", "assets/tetrominoColors.json");
    this.load.json("tetrominoes", "assets/tetrominoes.json");
  }

  resetCounters() {
    // Delayed Auto Shift (DAS) counter
    this.rightDasCounter = 0;
    this.leftDasCounter = 0;
    // Auto Repeat Rate (ARR) counter
    this.rightArrCounter = 0;
    this.leftArrCounter = 0;

    this.lockDelayCounter = 0;
    this.lockMoveCounter = 0;
  }

  reset() {
    this.level = 8;
    this.yDelta = 0;
    this.resetCounters();
    this.staticTetrominoes = this.add.container();
  }

  create(data) {
    this.reset();

    this.createControls();
    this.createBoard();
    this.spawnTetromino();
    this.gameOver = false;
  }

  createControls() {
    this.keyUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.keyRight = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.RIGHT
    );
    this.keyLeft = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.LEFT
    );
    this.keyDown = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.DOWN
    );
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

  spawnTetromino() {
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
    this.tetromino = randomTetromino;
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
    this.reset();
    this.gameOver = true;
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // assuming 60fps

    const { das, arr, lockDelay, lockMoveLimit } = this.cache.json.get("speed");

    if (this.keyRight.isDown) {
      if (this.rightDasCounter === 0) {
        this.shiftRight();
      }
      const shouldAutoRepeat = this.rightDasCounter >= das;
      if (shouldAutoRepeat) {
        this.rightArrCounter++;
        if (this.rightArrCounter >= arr) {
          this.rightArrCounter = 0;
          this.shiftRight();
        }
      }
      this.rightDasCounter++;
    }

    if (this.keyRight.isUp) {
      this.rightDasCounter = 0;
      this.rightArrCounter = 0;
    }

    if (this.keyLeft.isDown) {
      if (this.leftDasCounter === 0) {
        this.shiftLeft();
      }
      const shouldAutoRepeat = this.leftDasCounter >= das;
      if (shouldAutoRepeat) {
        this.leftArrCounter++;
        if (this.leftArrCounter >= arr) {
          this.leftArrCounter = 0;
          this.shiftLeft();
        }
      }
      this.leftDasCounter++;
    }

    if (this.keyLeft.isUp) {
      this.leftDasCounter = 0;
      this.leftArrCounter = 0;
    }

    if (this.isLocking()) {
      this.lockDelayCounter++;
      this.yDelta = 0;

      // if above the board, game over
      if (this.tetromino.getBounds().top < this.board.y) {
        this.endGame();
        return;
      }

      const isLockDelayReached = this.lockDelayCounter >= lockDelay;
      const isLockMoveLimitReached = this.lockMoveCounter >= lockMoveLimit;
      const isLocked = isLockDelayReached || isLockMoveLimitReached;

      if (isLocked) {
        console.log("lockDelayCounter", this.lockDelayCounter);
        console.log("lockMoveCounter", this.lockMoveCounter);
        this.lockDelayCounter = 0;
        this.lockMoveCounter = 0;
        this.staticTetrominoes.add(this.tetromino);
        this.spawnTetromino();
      }
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

  isLocking() {
    // stop tetromino if it hits the bottom or another tetromino
    const bottomOfTetromino = this.tetromino.getBounds().bottom;
    const bottomOfBoard = this.board.y + boardRows * minoHeight;
    const isAtBottom = bottomOfTetromino >= bottomOfBoard;

    return isAtBottom || this.isOnAStaticTetromino();
  }

  updateLockCountersForMove() {
    if (this.isLocking()) {
      this.lockDelayCounter = 0;
      this.lockMoveCounter++;
    }
  }

  shiftLeft() {
    const potentialX = this.tetromino.getBounds().left - minoWidth;
    if (potentialX >= this.board.getBounds().left) {
      this.tetromino.x -= minoWidth;
      this.updateLockCountersForMove();
    }
  }

  shiftRight() {
    const potentialX = this.tetromino.getBounds().right + minoWidth;
    if (potentialX <= this.board.getBounds().right) {
      this.tetromino.x += minoWidth;
      this.updateLockCountersForMove();
    }
  }

  rotate() {
    // rotate
    this.updateLockCountersForMove();
  }

  isOnAStaticTetromino() {
    var isOnAnotherTetromino = false;
    const staticTetrominoes = this.staticTetrominoes;
    staticTetrominoes.list.forEach((staticTetromino) => {
      staticTetromino.list.forEach((staticMino) => {
        this.tetromino.list.forEach((mino) => {
          const staticLeft = staticMino.getBounds().left;
          const activeLeft = mino.getBounds().left;
          const staticTop = staticMino.getBounds().top;
          const activeBottom = mino.getBounds().bottom;

          const isSameColumn = staticLeft === activeLeft;
          const isOnTop = staticTop === activeBottom;
          isOnAnotherTetromino ||= isSameColumn && isOnTop;
        });
      });
    });
    return isOnAnotherTetromino;
  }
}

export default Game;
