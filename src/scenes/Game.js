import Phaser from "phaser";
import { colors } from "../colors";
import levelCalculator from "../levelCalculator";

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

  pulse(gameObject) {
    // pulse from centre
    gameObject.setOrigin(0.5);
    gameObject.x = gameObject.x + gameObject.width / 2;
    gameObject.y = gameObject.y + gameObject.height / 2;

    this.tweens.add({
      targets: gameObject,
      scale: 2,
      duration: 100,
      yoyo: true,
      ease: Phaser.Math.Easing.Sine.InOut,
      onComplete: () => {
        // reset origin
        gameObject.setOrigin(0);
        gameObject.x = gameObject.x - gameObject.width / 2;
        gameObject.y = gameObject.y - gameObject.height / 2;
      },
    });
  }

  setLevel(level) {
    if (this.level === level) {
      return;
    }
    this.level = level;

    if (!this.levelValue) {
      return;
    }
    this.levelValue.setText(this.level);
    this.pulse(this.levelValue);
  }

  setScore(score, isAnimated = true) {
    if (this.score === score) {
      return;
    }
    this.score = score;

    if (!this.scoreValue) {
      return;
    }
    this.scoreValue.setText(this.score);
    if (isAnimated) {
      this.pulse(this.scoreValue);
    }
  }

  setTotalRowsCleared(totalRowsCleared) {
    if (this.totalRowsCleared === totalRowsCleared) {
      return;
    }
    this.totalRowsCleared = totalRowsCleared;

    if (!this.linesValue) {
      return;
    }
    this.linesValue.setText(this.totalRowsCleared);
    this.pulse(this.linesValue);
  }

  reset() {
    this.setLevel(1);
    this.setScore(0);
    this.setTotalRowsCleared(0);
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
    this.createScoreSection();
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

  createScoreSection() {
    const groupPadding = 10;
    const interPadding = 5;
    const fieldHeight = this.minoHeight;
    const fieldWidth = this.minoWidth * 3;
    const boardBottom = this.board.getBounds().bottom;
    const linesValueY = boardBottom - groupPadding - fieldHeight;
    const linesKeyY = linesValueY - interPadding - fieldHeight;
    const levelValueY = linesKeyY - groupPadding - fieldHeight;
    const levelKeyY = levelValueY - interPadding - fieldHeight;
    const scoreValueY = levelKeyY - groupPadding - fieldHeight;
    const scoreKeyY = scoreValueY - interPadding - fieldHeight;

    const color = colors.hexBlack;
    const textStyle = {
      color,
      width: fieldWidth,
      align: "center",
      fixedWidth: fieldWidth,
    };
    const x = this.boardSectionDimensions.x - groupPadding - fieldWidth;
    this.scoreKey = this.add.text(x, scoreKeyY, "Score", textStyle);
    this.scoreValue = this.add.text(
      x,
      scoreValueY,
      `${this.score || 0}`,
      textStyle
    );
    this.levelKey = this.add.text(x, levelKeyY, "Level", textStyle);
    this.levelValue = this.add.text(
      x,
      levelValueY,
      `${this.level || 0}`,
      textStyle
    );
    this.linesKey = this.add.text(x, linesKeyY, "Lines", textStyle);
    this.linesValue = this.add.text(
      x,
      linesValueY,
      `${this.totalRowsCleared || 0}`,
      textStyle
    );
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
    this.keySpace = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
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
    const borderColor = colors.hexBlack;

    // spawn in top -2 rows, at column index 3 (4th column)
    const x = this.board.x + 3 * this.minoWidth;
    const y = this.board.y + -2 * this.minoHeight;
    const randomTetromino = this.createTetromino(
      tetrominoJSON,
      { x, y },
      tetrominoColor,
      borderColor
    );
    this.tetromino = {
      name: tetrominoName,
      rotation: rotationIndex,
      shape: randomTetromino,
    };
    this.updateGhostTetromino();
  }

  shiftToBottom(tetromino, isAnimated) {
    const createAfterImage = () => {
      const afterImage = this.cloneTetromino(tetromino).shape;
      afterImage.list.map((mino) => mino.setStrokeStyle(null));
      afterImage.setAlpha(0);
      return afterImage;
    };
    // shift tetromino down until it is colliding with something

    var lastAfterImage = createAfterImage();
    var rowIndex = 0;
    while (this.canMove(tetromino.shape)) {
      tetromino.shape.y += this.minoHeight;
      this.tweens.add({
        targets: lastAfterImage,
        delay: rowIndex * 5,
        alpha: isAnimated ? 0.5 : 0,
        duration: 50,
        repeat: 0,
        yoyo: true,
        onComplete: () => {
          lastAfterImage.destroy();
        },
      });

      lastAfterImage = createAfterImage();
      rowIndex++;
    }
    tetromino.shape.y -= this.minoHeight;
  }

  updateGhostTetromino() {
    // spawn ghost tetromino at bottom of board
    if (this.ghostTetromino) {
      this.ghostTetromino.shape.destroy();
      this.ghostTetromino = null;
    }
    this.ghostTetromino = this.cloneTetromino(this.tetromino);
    this.ghostTetromino.shape.setAlpha(0.4);

    this.shiftToBottom(this.ghostTetromino, false);
  }

  createTetromino(tetromino, coord, fillColor, strokeColor, alpha = 1) {
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
          strokeColor,
          alpha
        );
        container.add(mino);

        mino.canCollide = bit;
        mino.setAlpha(bit ? 1 : 0);
      });
    });
    return container;
  }

  createMino(x, y, width, height, fillColor, strokeColor, alpha = 1) {
    const mino = this.add.rectangle(x, y, width, height, fillColor, alpha);
    mino.setStrokeStyle(1, strokeColor);
    mino.setOrigin(0);
    return mino;
  }

  endGame() {
    this.gameOver = true;
  }

  incrementScoreFor(numberOfLinesCleared) {
    const scores = this.cache.json.get("score");
    const perLevel = scores[`${numberOfLinesCleared}`];
    if (!perLevel) {
      return;
    }
    const earned = perLevel * this.level;
    const newScore = this.score + earned;
    this.setScore(newScore);
  }

  handleClearingRows() {
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
        this.animateLineDrop(lockedRow, yDelta, animationDelay, ease);
        this.animateLineDrop(
          this.ghostTetromino.shape.list,
          yDelta,
          animationDelay,
          ease
        );
        for (const ghostMino of this.ghostTetromino.shape.list) {
          const scopedYDelta = yDelta;
          const newY = ghostMino.y + scopedYDelta;
          this.tweens.add({
            targets: ghostMino,
            y: newY,
            delay: animationDelay(ghostMino),
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
        this.updateGhostTetromino();
      }
    }

    if (rowsCleared > 0) {
      this.incrementScoreFor(rowsCleared);
      this.incrementTotalRowsClearedBy(rowsCleared);
    }
  }

  animateLineDrop(minos, yDelta, animationDelay, ease) {
    for (const mino of minos) {
      const newY = mino.y + yDelta;
      this.tweens.add({
        targets: mino,
        y: newY,
        delay: animationDelay(mino),
        duration: lineClearAnimationDuration,
        ease,
      });
    }
  }

  incrementTotalRowsClearedBy(rowsCleared) {
    const oldTotalRowsCleared = this.totalRowsCleared;
    const newTotalRowsCleared = this.totalRowsCleared + rowsCleared;
    if (newTotalRowsCleared === oldTotalRowsCleared) {
      return;
    }

    this.setTotalRowsCleared(newTotalRowsCleared);
    this.incrementLevelFor(newTotalRowsCleared);
  }

  incrementLevelFor(totalRowsCleared) {
    const newLevel = levelCalculator(totalRowsCleared);
    this.setLevel(newLevel);
  }

  rowIndexFrom(mino) {
    const rowIndex =
      (mino.getBounds().top - this.board.getBounds().top) / this.minoHeight;
    return rowIndex;
  }

  columnIndexFrom(mino) {
    const columnIndex =
      (mino.getBounds().left - this.board.getBounds().left) / this.minoWidth;
    return columnIndex;
  }

  lockTetromino() {
    this.lockDelayCounter = 0;
    this.lockMoveCounter = 0;

    for (const mino of this.tetromino.shape.list) {
      if (!mino.canCollide) {
        continue;
      }
      const lockedMinoRowIndex = this.rowIndexFrom(mino);

      const lockedRow = this.lockedRows[lockedMinoRowIndex];
      if (lockedRow) {
        lockedRow.push(mino);
      }
    }
    this.tetromino = null;
    this.ghostTetromino.shape.destroy();
    this.ghostTetromino = null;
  }

  handleShiftRight() {
    const { das, arr } = this.cache.json.get("speed");

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
  }

  handleShiftLeft() {
    const { das, arr } = this.cache.json.get("speed");
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
  }

  handleLocking() {
    const { lockDelay, lockMoveLimit } = this.cache.json.get("speed");

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
        this.lockTetromino();
        this.spawnTetromino();
      }
    }
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // assuming 60fps

    this.handleClearingRows();
    this.handleShiftRight();
    this.handleShiftLeft();
    this.handleRotateRight();
    this.handleLocking();
    this.handleGravity();
  }

  handleGravity() {
    const isHardDrop = this.keySpace.isDown;
    if (isHardDrop && !this.isHardDropping) {
      this.isHardDropping = true;
      this.yDelta = 0;
      this.shiftToBottom(this.tetromino, true);
      this.lockTetromino();
      this.spawnTetromino();
      return;
    }

    if (this.keySpace.isUp) {
      this.isHardDropping = false;
    }

    const gravityJson = this.cache.json.get("gravity");
    const maxGravityLevel = 15;
    const gravityKey =
      this.level > maxGravityLevel ? maxGravityLevel : this.level;
    var gravity = gravityJson[gravityKey];
    const isSoftDrop = this.keyDown.isDown;
    if (isSoftDrop) {
      gravity = gravityJson["softdrop"];
    }

    this.yDelta += gravity * this.minoHeight;
    const shouldDropRow = this.yDelta >= this.minoHeight;
    if (shouldDropRow) {
      const quotient = Math.floor(this.yDelta / this.minoHeight);
      const yDelta = quotient * this.minoHeight;
      const remainder = this.yDelta % this.minoHeight;

      this.tetromino.shape.y += yDelta;
      this.yDelta = remainder;

      if (isSoftDrop) {
        const { softdropPerRow } = this.cache.json.get("score");
        const newScore = this.score + softdropPerRow;
        this.setScore(newScore, false);
      }
    }
  }

  handleRotateRight() {
    if (this.keyUp.isDown) {
      this.rotateRight();
    }

    if (this.keyUp.isUp) {
      // rotating requires key lifts
      this.isRotating = false;
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
    var isOverlap = false;
    for (const mino of tetromino.list) {
      if (!mino.canCollide) {
        continue;
      }
      const isOverlappingLeft =
        mino.getBounds().left < this.board.getBounds().left;
      const isOverlappingRight =
        mino.getBounds().right > this.board.getBounds().right;
      const isOverlappingBottom =
        mino.getBounds().bottom > this.board.getBounds().bottom;
      // ignore top

      isOverlap ||=
        isOverlappingRight || isOverlappingBottom || isOverlappingLeft;
      if (isOverlap) {
        return true;
      }
    }
    return isOverlap;
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
      this.updateGhostTetromino();
      this.updateLockCountersForMove();
    }
    possibleTetromino.shape.destroy();
  }

  shiftRight() {
    const possibleTetromino = this.cloneTetromino(this.tetromino);
    possibleTetromino.shape.x += this.minoWidth;

    if (this.canMove(possibleTetromino.shape)) {
      this.tetromino.shape.x += this.minoWidth;
      this.updateGhostTetromino();
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
        this.updateGhostTetromino();
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
