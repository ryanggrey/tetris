import Phaser from "phaser";
import { colors } from "../colors";

const boardColumns = 10;
const boardRows = 20;
const lineClearAnimationDuration = 200;

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
    this.load.json("score", "assets/score.json");
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
    this.score = 0;
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

    this.createDimensions();
    this.createControls();
    this.createBoard();
    this.createScoreField();
    this.spawnTetromino();
    this.gameOver = false;
  }

  createDimensions() {
    const sectionWidth = 250;
    this.scoreSectionDimensions = {
      x: 0,
      width: sectionWidth,
    };
    this.boardSectionDimensions = {
      x: 1 * sectionWidth,
      width: sectionWidth,
    };
    this.nextSectionDimensions = {
      x: 2 * sectionWidth,
      width: sectionWidth,
    };
    this.minoWidth = this.boardSectionDimensions.width / boardColumns;
    this.minoHeight = this.minoWidth;
  }

  createScoreField() {
    const fieldPadding = this.minoWidth;
    const color = colors.hexBlack;
    const textStyle = {
      color,
    };
    const baseSize = this.scale.baseSize;
    const xLabel =
      this.scoreSectionDimensions.x + this.scoreSectionDimensions.width / 2;
    const yLabel = Math.floor(baseSize.height / 2 - this.minoHeight * 2);
    this.scoreKey = this.add.text(xLabel, yLabel, "Score", textStyle);

    const xValue = xLabel;
    const yValue = this.scoreKey.getBounds().bottom + 10;
    this.scoreValue = this.add.text(xValue, yValue, "0", textStyle);
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
    const boardWidth = this.boardSectionDimensions.width;
    const boardHeight = boardRows * this.minoHeight;
    const baseSize = this.scale.baseSize;
    const x = this.boardSectionDimensions.x;
    const y = Math.floor(baseSize.height / 2 - boardHeight / 2);

    this.board = this.add.rectangle(x, y, boardWidth, boardHeight);
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
    const x = this.board.x + 3 * this.minoWidth;
    const y = this.board.y + -2 * this.minoHeight;
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
        const x = coord.x + xIndex * this.minoWidth;
        const y = coord.y + yIndex * this.minoHeight;

        const mino = this.createMino(
          x,
          y,
          this.minoWidth,
          this.minoHeight,
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

  incrementScore(numberOfLinesCleared) {
    const scores = this.cache.json.get("score");
    const perLevel = scores[`${numberOfLinesCleared}`];
    if (!perLevel) {
      return;
    }
    const earned = perLevel * this.level;
    this.score += earned;
    this.scoreValue.setText(this.score);
  }

  clearCompletedRows() {
    const ease = Phaser.Math.Easing.Sine.InOut;
    const animationDelay = (mino) => {
      const minoColIndex = (mino) =>
        (mino.getBounds().left - this.board.getBounds().left) / this.minoWidth;

      return (lineClearAnimationDuration / boardColumns) * minoColIndex(mino);
    };

    var yDelta = 0;
    var indexDelta = 0;
    var rowsCleared = 0;
    for (var rowIndex = this.lockedRows.length - 1; rowIndex >= 0; rowIndex--) {
      const lockedRow = this.lockedRows[rowIndex];
      if (indexDelta > 0) {
        for (const lockedMino of lockedRow) {
          const scopedYDelta = yDelta;
          const newY = lockedMino.y + scopedYDelta;
          this.tweens.add({
            targets: lockedMino,
            y: newY,
            delay: animationDelay(lockedMino),
            duration: lineClearAnimationDuration,
            ease,
          });
        }

        this.lockedRows[rowIndex + indexDelta] = this.lockedRows[rowIndex];
        this.lockedRows[rowIndex] = [];
      }

      const isCompleteRow = lockedRow.length === boardColumns;
      if (isCompleteRow) {
        rowsCleared++;
        yDelta += this.minoHeight;
        indexDelta++;
        for (const lockedMino of lockedRow) {
          // tween scales from origin, which is top-left
          // so set origin to centre and shift position to match
          lockedMino.setOrigin(0.5);
          lockedMino.x = lockedMino.x + lockedMino.width / 2;
          lockedMino.y = lockedMino.y + lockedMino.height / 2;

          this.tweens.add({
            targets: lockedMino,
            scale: 0,
            duration: lineClearAnimationDuration,
            delay: animationDelay(lockedMino),
            ease,
            onComplete: () => {
              lockedMino.destroy();
            },
          });
        }
      }
    }
    this.incrementScore(rowsCleared);
  }

  lockTetromino() {
    for (const mino of this.tetromino.shape.list) {
      if (!mino.canCollide) {
        continue;
      }
      const lockedMinoRowIndex =
        (mino.getBounds().top - this.board.getBounds().top) / this.minoHeight;

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

    this.clearCompletedRows();

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
    this.yDelta += gravity * this.minoHeight;
    if (this.yDelta >= this.minoHeight) {
      const quotient = Math.floor(this.yDelta / this.minoHeight);
      const yDelta = quotient * this.minoHeight;
      const remainder = this.yDelta % this.minoHeight;

      this.tetromino.shape.y += yDelta;
      this.yDelta = remainder;
    }
  }

  isLocking() {
    // stop tetromino if it hits the bottom or another tetromino

    var isAtBottom = false;
    this.tetromino.shape.list.forEach((mino) => {
      const minoBottom = mino.getBounds().bottom;
      const boardBottom = this.board.y + boardRows * this.minoHeight;
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
    possibleTetromino.shape.x -= this.minoWidth;

    if (this.canMove(possibleTetromino.shape)) {
      this.tetromino.shape.x -= this.minoWidth;
      this.updateLockCountersForMove();
    }
    possibleTetromino.shape.destroy();
  }

  shiftRight() {
    const possibleTetromino = this.cloneTetromino(this.tetromino);
    possibleTetromino.shape.x += this.minoWidth;

    if (this.canMove(possibleTetromino.shape)) {
      this.tetromino.shape.x += this.minoWidth;
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
      shiftedTetromino.shape.x += offset.x * this.minoWidth;
      shiftedTetromino.shape.y += offset.y * this.minoHeight;
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
