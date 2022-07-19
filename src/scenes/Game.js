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
    this.load.json("wallkick", "assets/wallkick.json");
  }

  setupLockedRows() {
    this.lockedRows = [];
    for (let i = 0; i < boardRows; i++) {
      const lockedRow = [];
      this.lockedRows.push(lockedRow);
    }
  }

  reset() {
    this.level = 5;
    this.yDelta = 0;

    this.isRotating = false;

    // Delayed Auto Shift (DAS) counter
    this.rightDasCounter = 0;
    this.leftDasCounter = 0;
    // Auto Repeat Rate (ARR) counter
    this.rightArrCounter = 0;
    this.leftArrCounter = 0;

    this.lockDelayCounter = 0;
    this.lockMoveCounter = 0;
    this.setupLockedRows();
  }

  create(data) {
    this.reset();

    this.createControls();
    this.createBoard();
    this.spawnTetromino();
    this.gameOver = false;
  }

  createControls() {
    this.keyRight = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.RIGHT
    );
    this.keyLeft = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.LEFT
    );
    this.keyUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
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
    const rotationIndex = 0;
    const tetrominoJSON = tetrominoRotations[rotationIndex];
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
    this.tetromino = {
      name: tetrominoName,
      rotation: rotationIndex,
      shape: randomTetromino,
    };
  }

  createTetromino(tetromino, coord, fillColor, strokeColor) {
    const container = this.add.container();
    tetromino.forEach((row, yIndex) => {
      row.forEach((bit, xIndex) => {
        const x = coord.x + xIndex * minoWidth;
        const y = coord.y + yIndex * minoHeight;

        const mino = this.createMino(
          x,
          y,
          minoWidth,
          minoHeight,
          fillColor,
          strokeColor
        );
        container.add(mino);

        mino.canCollide = bit;
        mino.setAlpha(bit ? 1 : 0);
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

  deleteCompletedRows() {
    var yDelta = 0;
    var indexDelta = 0;
    for (var rowIndex = this.lockedRows.length - 1; rowIndex >= 0; rowIndex--) {
      const lockedRow = this.lockedRows[rowIndex];
      lockedRow.forEach((lockedMino) => {
        lockedMino.y += yDelta;
      });
      if (indexDelta > 0) {
        this.lockedRows[rowIndex + indexDelta] = this.lockedRows[rowIndex];
        this.lockedRows[rowIndex] = [];
      }

      const isCompleteRow = lockedRow.length === boardColumns;
      if (isCompleteRow) {
        yDelta += minoHeight;
        indexDelta++;
        lockedRow.forEach((lockedMino) => {
          lockedMino.destroy();
        });
      }
    }
  }

  lockTetromino() {
    for (const mino of this.tetromino.shape.list) {
      if (!mino.canCollide) {
        continue;
      }
      const lockedMinoRowIndex =
        (mino.getBounds().top - this.board.getBounds().top) / minoHeight;
      const lockedMinoColIndex =
        (mino.getBounds().left - this.board.getBounds().left) / minoWidth;

      const lockedRow = this.lockedRows[lockedMinoRowIndex];
      lockedRow.push(mino);
    }
    this.tetromino = null;
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // assuming 60fps

    this.deleteCompletedRows();

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

    if (this.keyUp.isDown) {
      this.rotateRight();
    }

    if (this.keyUp.isUp) {
      // rotating requires key lifts
      this.isRotating = false;
    }

    if (this.isLocking()) {
      this.lockDelayCounter++;
      this.yDelta = 0;

      // if above the board, game over
      if (this.tetromino.shape.getBounds().top < this.board.y) {
        this.endGame();
        return;
      }

      const isLockDelayReached = this.lockDelayCounter >= lockDelay;
      const isLockMoveLimitReached = this.lockMoveCounter >= lockMoveLimit;
      const isLocked = isLockDelayReached || isLockMoveLimitReached;

      if (isLocked) {
        this.lockDelayCounter = 0;
        this.lockMoveCounter = 0;
        this.lockTetromino();
        this.spawnTetromino();
      }
    }

    // apply gravity, where 1G = 1 mino per frame
    const gravityJson = this.cache.json.get("gravity");
    var gravity = gravityJson[this.level];
    if (this.keyDown.isDown) {
      gravity = gravityJson["softdrop"];
    }
    this.yDelta += gravity * minoHeight;
    if (this.yDelta >= minoHeight) {
      const quotient = Math.floor(this.yDelta / minoHeight);
      const yDelta = quotient * minoHeight;
      const remainder = this.yDelta % minoHeight;

      this.tetromino.shape.y += yDelta;
      this.yDelta = remainder;
    }
  }

  isLocking() {
    // stop tetromino if it hits the bottom or another tetromino

    var isAtBottom = false;
    this.tetromino.shape.list.forEach((mino) => {
      const minoBottom = mino.getBounds().bottom;
      const boardBottom = this.board.y + boardRows * minoHeight;
      isAtBottom ||= mino.canCollide && minoBottom >= boardBottom;
    });

    return isAtBottom || this.isOnALockedTetromino();
  }

  updateLockCountersForMove() {
    if (this.isLocking()) {
      this.lockDelayCounter = 0;
      this.lockMoveCounter++;
    }
  }

  isOverlappingLockedTetromino(tetromino) {
    var isOverlapping = false;
    for (const mino of tetromino.list) {
      if (!mino.canCollide) {
        continue;
      }
      for (const lockedRow of this.lockedRows) {
        for (const lockedMino of lockedRow) {
          if (!lockedMino.canCollide) {
            continue;
          }

          isOverlapping = Phaser.Geom.Rectangle.Overlaps(
            mino.getBounds(),
            lockedMino.getBounds()
          );
          if (isOverlapping) {
            return true;
          }
        }
      }
    }
    return isOverlapping;
  }

  isOutsideBoard(tetromino) {
    var isOutsideBoard = false;
    for (const mino of tetromino.list) {
      if (!mino.canCollide) {
        continue;
      }
      const isOverlap = Phaser.Geom.Rectangle.Overlaps(
        this.board.getBounds(),
        mino.getBounds()
      );
      isOutsideBoard = !isOverlap;
      if (isOutsideBoard) {
        return true;
      }
    }
    return isOutsideBoard;
  }

  canMove(tetromino) {
    return (
      !this.isOverlappingLockedTetromino(tetromino) &&
      !this.isOutsideBoard(tetromino)
    );
  }

  cloneTetromino(sourceTetromino, rotationOffset = 0) {
    const tetrominoes = this.cache.json.get("tetrominoes");
    const tetrominoColors = this.cache.json.get("tetrominoColors");

    const tetrominoName = sourceTetromino.name;
    const rotations = tetrominoes[tetrominoName];

    var nextRotationIndex = sourceTetromino.rotation + rotationOffset;
    if (sourceTetromino.rotation + rotationOffset >= rotations.length) {
      nextRotationIndex = 0;
    }
    if (sourceTetromino.rotation + rotationOffset < 0) {
      nextRotationIndex = rotations.length - 1;
    }
    const nextRotation = rotations[nextRotationIndex];

    // spawn in the same position as the current tetromino
    const x = sourceTetromino.shape.getBounds().left;
    const y = sourceTetromino.shape.getBounds().top;

    const tetrominoColor = tetrominoColors[tetrominoName];

    const clone = this.createTetromino(
      nextRotation,
      { x, y },
      tetrominoColor,
      colors.hexBlack
    );

    const tetromino = {
      name: tetrominoName,
      rotation: nextRotationIndex,
      shape: clone,
    };

    return tetromino;
  }

  shiftLeft() {
    const possibleTetromino = this.cloneTetromino(this.tetromino);
    possibleTetromino.shape.x -= minoWidth;

    if (this.canMove(possibleTetromino.shape)) {
      this.tetromino.shape.x -= minoWidth;
      this.updateLockCountersForMove();
    }
    possibleTetromino.shape.destroy();
  }

  shiftRight() {
    const possibleTetromino = this.cloneTetromino(this.tetromino);
    possibleTetromino.shape.x += minoWidth;

    if (this.canMove(possibleTetromino.shape)) {
      this.tetromino.shape.x += minoWidth;
      this.updateLockCountersForMove();
    }
    possibleTetromino.shape.destroy();
  }

  rotateRight() {
    if (this.isRotating) {
      return;
    }

    const rotationOffset = 1;
    const rotatedTetromino = this.cloneTetromino(
      this.tetromino,
      rotationOffset
    );

    const wallkickData = this.cache.json.get("wallkick");
    const tetrominoWallkickData = wallkickData[this.tetromino.name];
    const wallkickKey =
      this.tetromino.rotation + ":" + rotatedTetromino.rotation;
    const wallkickOffsets = tetrominoWallkickData[wallkickKey];
    for (const offset of wallkickOffsets) {
      const shiftedTetromino = this.cloneTetromino(rotatedTetromino, 0);
      shiftedTetromino.shape.x += offset.x * minoWidth;
      shiftedTetromino.shape.y += offset.y * minoHeight;
      const canMove = this.canMove(shiftedTetromino.shape);
      if (canMove) {
        this.tetromino.shape.destroy();
        this.tetromino = shiftedTetromino;
        this.tetromino.shape.x = shiftedTetromino.shape.x;
        this.tetromino.shape.y = shiftedTetromino.shape.y;
        break;
      } else {
        shiftedTetromino.shape.destroy();
      }
    }

    rotatedTetromino.shape.destroy();
    this.updateLockCountersForMove();
    this.isRotating = true;
  }

  isOnALockedTetromino() {
    var isOnAnotherTetromino = false;
    for (const lockedRow of this.lockedRows) {
      for (const lockedMino of lockedRow) {
        for (const mino of this.tetromino.shape.list) {
          const lockedLeft = lockedMino.getBounds().left;
          const activeLeft = mino.getBounds().left;
          const lockedTop = lockedMino.getBounds().top;
          const activeBottom = mino.getBounds().bottom;

          const isSameColumn = lockedLeft === activeLeft;
          const isOnTop = lockedTop === activeBottom;
          const canCollide = lockedMino.canCollide && mino.canCollide;
          isOnAnotherTetromino ||= isSameColumn && isOnTop && canCollide;
        }
      }
    }
    return isOnAnotherTetromino;
  }
}

export default Game;
