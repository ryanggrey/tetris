import Phaser from "phaser";
import NextTetrominoManager from "../NextTetrominoManager";
import SoundPlayer from "../SoundPlayer";
import AssetLoader from "../AssetLoader";
import isMobile from "is-mobile";
import pulse from "../tweener";
import LevelManager from "../LevelManager";
import createGameDimensions from "../createGameDimensions";

const boardColumns = 10;
const boardRows = 20;
const lineClearAnimationDuration = 200;
const groupPadding = 10;
const buttonNames = {
  playPause: "play/pause",
};
const menuNames = {
  resume: "Resume - Esc",
};

class Game extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
    this.nextTetrominoManager = new NextTetrominoManager();
    this.soundPlayer = new SoundPlayer(this);
    this.assetLoader = new AssetLoader(this);

    const onLevelUp = (newLevel) => {
      this.soundPlayer.levelUp();
      if (!this.levelValue) {
        return;
      }
      this.levelValue.setText(newLevel);
      pulse(this.levelValue, this);
    };
    this.levelManager = new LevelManager(onLevelUp);
  }

  init(data) {}

  preload() {
    this.assetLoader.preload();
    this.soundPlayer.preload();
  }

  setupLockedRows() {
    this.lockedRows = [];
    for (let i = 0; i < boardRows; i++) {
      const lockedRow = [];
      this.lockedRows.push(lockedRow);
    }
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
      pulse(this.scoreValue, this);
    }
  }

  setTotalRowsCleared(totalRowsCleared) {
    const oldTotalRowsCleared = this.totalRowsCleared;
    const newTotalRowsCleared = totalRowsCleared;
    if (oldTotalRowsCleared === newTotalRowsCleared) {
      return;
    }
    this.totalRowsCleared = newTotalRowsCleared;

    if (!this.linesValue) {
      return;
    }
    this.linesValue.setText(this.totalRowsCleared);
    pulse(this.linesValue, this);

    const rowsCleared = newTotalRowsCleared - oldTotalRowsCleared;
    if (rowsCleared < 4) {
      this.soundPlayer.lineClear();
    } else {
      this.soundPlayer.tetris();
    }
  }

  reset() {
    this.levelManager.reset();
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

    // reset mobile controls
    this.isTouchDown = false;
    this.touchDownCounter = 0;
  }

  create(data) {
    this.reset();

    this.dimensions = createGameDimensions(
      boardColumns,
      boardRows,
      this.scale.baseSize.width,
      this.scale.baseSize.height
    );
    this.createControls();
    this.createBoard();
    this.createScoreSection();
    this.createPausePlayButton();
    this.updateNextSection();
    this.spawnTetromino();
    this.gameOver = false;
  }

  createScoreSection() {
    const interPadding = 5;
    const fieldHeight = this.dimensions.mino.height;
    const fieldWidth = this.dimensions.mino.width * 3;
    const boardBottom = this.board.getBounds().bottom;
    const linesValueY = boardBottom - groupPadding - fieldHeight;
    const linesKeyY = linesValueY - interPadding - fieldHeight;
    const levelValueY = linesKeyY - groupPadding - fieldHeight;
    const levelKeyY = levelValueY - interPadding - fieldHeight;
    const scoreValueY = levelKeyY - groupPadding - fieldHeight;
    const scoreKeyY = scoreValueY - interPadding - fieldHeight;

    const color = this.assetLoader.getColors().text;
    const textStyle = {
      color,
      width: fieldWidth,
      align: "center",
      fixedWidth: fieldWidth,
      fontSize: this.dimensions.font,
    };
    const x = this.dimensions.board.x - groupPadding - fieldWidth;
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
      `${this.levelManager.getLevel()}`,
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

  updateNextSection() {
    if (this.nextKey) {
      this.nextKey.destroy();
      this.nextTetromino1.shape.destroy();
      this.nextTetromino2.shape.destroy();
      this.nextTetromino3.shape.destroy();
    }

    const interPadding = this.dimensions.mino.height / 2;
    const fieldHeight = this.dimensions.mino.height * 2;
    const fieldWidth = this.dimensions.mino.width * 4;
    const boardTop = this.board.getBounds().top;
    const nextKeyY = boardTop + groupPadding;

    const nextKeyX = this.dimensions.next.x + groupPadding;
    const nextTetrominoX = nextKeyX;

    const color = this.assetLoader.getColors().text;
    const textStyle = {
      color,
      width: fieldWidth,
      align: "center",
      fixedWidth: fieldWidth,
      fontSize: this.dimensions.font,
    };
    this.nextKey = this.add.text(nextKeyX, nextKeyY, "Next", textStyle);

    const nextTetrominoY1 = nextKeyY + interPadding + this.nextKey.height;
    const nextTetrominoY2 = nextTetrominoY1 + interPadding + fieldHeight;
    const nextTetrominoY3 = nextTetrominoY2 + interPadding + fieldHeight;

    const nextTetrominoes = this.nextTetrominoManager.peek();
    const t1Name = nextTetrominoes[0];
    const t2Name = nextTetrominoes[1];
    const t3Name = nextTetrominoes[2];

    const getCenteredCoords = (tetrominoJSON, anchorCoord) => {
      const getCollidableDimensions = () => {
        const columns = new Set();
        const rows = new Set();
        let minX = Number.MAX_SAFE_INTEGER;
        let minY = Number.MAX_SAFE_INTEGER;

        tetrominoJSON.forEach((row, rowIndex) => {
          row.forEach((bit, columnIndex) => {
            if (!bit) {
              return;
            }

            columns.add(columnIndex);
            rows.add(rowIndex);

            const columnWidth = columnIndex * this.dimensions.mino.width;
            const rowHeight = rowIndex * this.dimensions.mino.height;
            const x = 0 + columnWidth;
            const y = 0 + rowHeight;

            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
          });
        });

        return {
          collidableX: minX,
          collidableY: minY,
          collidableWidth: columns.size * this.dimensions.mino.width,
          collidableHeight: rows.size * this.dimensions.mino.height,
        };
      };

      const { collidableX, collidableY, collidableWidth, collidableHeight } =
        getCollidableDimensions(tetrominoJSON);

      const x =
        anchorCoord.x + fieldWidth / 2 - (collidableX + collidableWidth / 2);

      const y =
        anchorCoord.y + fieldHeight / 2 - (collidableY + collidableHeight / 2);

      return { x, y };
    };

    const createNextTetromino = (tetrominoName, anchorCoord) => {
      const tetrominoJSON = this.assetLoader.getTetrominoJSON(tetrominoName);
      const tetrominoCoords = getCenteredCoords(tetrominoJSON, anchorCoord);
      const tetromino = this.spawnTetrominoNamed(tetrominoName, {
        x: tetrominoCoords.x,
        y: tetrominoCoords.y,
      });
      return tetromino;
    };

    this.nextTetromino1 = createNextTetromino(t1Name, {
      x: nextTetrominoX,
      y: nextTetrominoY1,
    });
    this.nextTetromino2 = createNextTetromino(t2Name, {
      x: nextTetrominoX,
      y: nextTetrominoY2,
    });
    this.nextTetromino3 = createNextTetromino(t3Name, {
      x: nextTetrominoX,
      y: nextTetrominoY3,
    });
  }

  setupGlobalClickHandler() {
    const game = this;
    const handleButtonClick = (_, gameObject) => {
      if (gameObject.name === buttonNames.playPause) {
        game.pauseOrPlay();
      }
    };
    this.input.on("gameobjectdown", handleButtonClick);
  }

  createPausePlayButton() {
    this.setupGlobalClickHandler();
    this.play();
  }

  setupPausePlayButton(assetName) {
    if (!isMobile()) {
      // then we don't need a pause button
      return;
    }

    const buttonWidth = this.dimensions.mino.width;
    const buttonHeight = this.dimensions.mino.height;
    const buttonX =
      this.dimensions.next.x + this.dimensions.next.width / 2 - buttonWidth / 2;
    const boardBottom = this.board.getBounds().bottom;
    const buttonY = boardBottom - groupPadding - buttonHeight;

    const button = this.add.image(buttonX, buttonY, assetName);
    button.name = buttonNames.playPause;
    button.displayWidth = buttonWidth;
    button.displayHeight = buttonHeight;

    button.visible = true;
    button.setInteractive();
    button.setActive(true);

    return button;
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
    this.keyEsc = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC
    );
  }

  createBoard() {
    const boardWidth = this.dimensions.board.width;
    const boardHeight = boardRows * this.dimensions.mino.height;
    const baseSize = this.scale.baseSize;
    const x = this.dimensions.board.x;
    const y = Math.floor(baseSize.height / 2 - boardHeight / 2);

    this.board = this.add.rectangle(x, y, boardWidth, boardHeight);
    this.board.setOrigin(0);
    const gridLineColor = this.assetLoader.getColors().gridLine;
    const color = this.assetLoader.getRectangleColor(gridLineColor);
    this.board.setStrokeStyle(1, color);
  }

  spawnTetromino() {
    const tetrominoName = this.nextTetrominoManager.pick();
    // spawn in top -2 rows, at column index 3 (4th column)
    const x = this.board.x + 3 * this.dimensions.mino.width;
    const y = this.board.y + -2 * this.dimensions.mino.height;

    this.tetromino = this.spawnTetrominoNamed(tetrominoName, { x, y });
    this.updateGhostTetromino();
    this.updateNextSection();
  }

  spawnTetrominoNamed(tetrominoName, coord) {
    const tetrominoJSON = this.assetLoader.getTetrominoJSON(tetrominoName);
    const tetrominoColor = this.assetLoader.getTetrominoColor(tetrominoName);
    const tetrominoBorderColor =
      this.assetLoader.getTetrominoBorderColor(tetrominoName);
    const rotationIndex = 0;

    const randomTetromino = this.createTetromino(
      tetrominoJSON,
      coord,
      tetrominoColor,
      tetrominoBorderColor
    );
    const tetromino = {
      name: tetrominoName,
      rotation: rotationIndex,
      shape: randomTetromino,
    };

    return tetromino;
  }

  shiftToBottom(tetromino, isAnimated) {
    const createAfterImage = () => {
      const afterImage = this.cloneTetromino(tetromino).shape;
      afterImage.list.map((mino) => mino.setStrokeStyle(null));
      afterImage.setAlpha(0);
      return afterImage;
    };
    // shift tetromino down until it is colliding with something

    const originalY = tetromino.shape.y;
    var lastAfterImage = createAfterImage();
    var numberOfRows = 0;
    while (this.canMove(tetromino.shape)) {
      tetromino.shape.y += this.dimensions.mino.height;
      this.tweens.add({
        targets: lastAfterImage,
        delay: numberOfRows * 5,
        alpha: isAnimated ? 0.5 : 0,
        duration: 50,
        repeat: 0,
        yoyo: true,
        onComplete: () => {
          lastAfterImage.destroy();
        },
      });

      lastAfterImage = createAfterImage();
      numberOfRows++;
    }
    tetromino.shape.y -= this.dimensions.mino.height;
    tetromino.shape.y = Math.max(tetromino.shape.y, originalY);
    numberOfRows--;

    return Math.max(numberOfRows, 0);
  }

  updateGhostTetromino() {
    if (this.ghostTetromino) {
      this.ghostTetromino.shape.destroy();
      this.ghostTetromino = null;
    }
    this.ghostTetromino = this.cloneTetromino(this.tetromino);

    this.ghostTetromino.shape.list.forEach((mino) => {
      mino.fillAlpha = 0.3;
    });

    this.shiftToBottom(this.ghostTetromino, false);
  }

  createTetromino(tetrominoJSON, coord, fillColor, strokeColor, alpha = 1) {
    const container = this.add.container();
    tetrominoJSON.forEach((row, yIndex) => {
      row.forEach((bit, xIndex) => {
        const x = coord.x + xIndex * this.dimensions.mino.width;
        const y = coord.y + yIndex * this.dimensions.mino.height;

        const mino = this.createMino(
          x,
          y,
          this.dimensions.mino.width,
          this.dimensions.mino.height,
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
    const mino = this.add.rectangle(
      x,
      y,
      width,
      height,
      this.assetLoader.getRectangleColor(fillColor),
      alpha
    );
    mino.setStrokeStyle(1, this.assetLoader.getRectangleColor(strokeColor));
    mino.setOrigin(0);
    return mino;
  }

  endGame() {
    this.gameOver = true;
    this.soundPlayer.gameOver();
  }

  incrementScoreFor(numberOfLinesCleared) {
    const scorePerLevel = this.assetLoader.getScoreNamed(
      `${numberOfLinesCleared}`
    );
    if (!scorePerLevel) {
      return;
    }
    const earned = scorePerLevel * this.levelManager.getLevel();
    const newScore = this.score + earned;
    this.setScore(newScore);
  }

  handleClearingRows() {
    const ease = Phaser.Math.Easing.Sine.InOut;
    const animationDelay = (mino) => {
      const minoColIndex = (mino) =>
        (mino.getBounds().left - this.board.getBounds().left) /
        this.dimensions.mino.width;

      return (lineClearAnimationDuration / boardColumns) * minoColIndex(mino);
    };

    var yDelta = 0;
    var indexDelta = 0;
    var rowsCleared = 0;
    for (var rowIndex = this.lockedRows.length - 1; rowIndex >= 0; rowIndex--) {
      const lockedRow = this.lockedRows[rowIndex];
      if (indexDelta > 0) {
        this.animateLineAndGhostDrop(lockedRow, yDelta, animationDelay, ease);

        this.lockedRows[rowIndex + indexDelta] = this.lockedRows[rowIndex];
        this.lockedRows[rowIndex] = [];
      }

      const isCompleteRow = lockedRow.length === boardColumns;
      if (isCompleteRow) {
        rowsCleared++;
        yDelta += this.dimensions.mino.height;
        indexDelta++;
        this.animateRowClear(lockedRow, animationDelay, ease);
      }
    }

    if (rowsCleared > 0) {
      this.incrementScoreFor(rowsCleared);
      this.incrementTotalRowsClearedBy(rowsCleared);
    }
  }

  animateRowClear(lockedRow, animationDelay, ease) {
    for (const lockedMino of lockedRow) {
      // tween scales from origin, which is top-left
      // so set origin to centre and shift position to match
      lockedMino.setOrigin(0.5);
      lockedMino.x = lockedMino.x + lockedMino.width / 2;
      lockedMino.y = lockedMino.y + lockedMino.height / 2;

      this.animateMinoClear(lockedMino, animationDelay, ease);
    }
  }

  animateMinoClear(lockedMino, animationDelay, ease) {
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

  animateLineAndGhostDrop(lockedRow, yDelta, animationDelay, ease) {
    this.animateMinosDrop(lockedRow, yDelta, animationDelay, ease);
    this.animateMinosDrop(
      this.ghostTetromino.shape.list,
      yDelta,
      animationDelay,
      ease
    );
  }

  animateMinosDrop(minos, yDelta, animationDelay, ease) {
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
    this.levelManager.incrementLevelFor(newTotalRowsCleared);
    this.onLevelUp(this.levelManager.getLevel());
  }

  rowIndexFrom(mino) {
    const rowIndex =
      (mino.getBounds().top - this.board.getBounds().top) /
      this.dimensions.mino.height;
    return rowIndex;
  }

  columnIndexFrom(mino) {
    const columnIndex =
      (mino.getBounds().left - this.board.getBounds().left) /
      this.dimensions.mino.width;
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

    if (!this.isHardDropping) {
      this.soundPlayer.lock();
    }
  }

  handleShiftRight() {
    const { das, arr } = this.assetLoader.getSpeed();

    if (this.isRightHeld()) {
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

    if (this.isRightReleased()) {
      this.rightDasCounter = 0;
      this.rightArrCounter = 0;
    }
  }

  handleShiftLeft() {
    const { das, arr } = this.assetLoader.getSpeed();
    if (this.isLeftHeld()) {
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

    if (this.isLeftReleased()) {
      this.leftDasCounter = 0;
      this.leftArrCounter = 0;
    }
  }

  handleLocking() {
    const { lockDelay, lockMoveLimit } = this.assetLoader.getSpeed();

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

  openMenu() {
    const menuWidth = this.game.config.width * 0.5;
    const menuHeight = this.game.config.height * 0.5;
    const menuAnimation = {
      duration: 150,
      orientation: undefined,
      ease: "Cubic",
    };

    const scene = this;
    this.menu = this.rexUI.add.menu({
      anchor: {
        centerX: "center",
        centerY: "center",
      },

      popup: true,
      orientation: "y",
      items: [{ name: "Paused" }, { name: menuNames.resume }],

      createBackgroundCallback: (items) => {
        const scene = items.scene;
        return scene.rexUI.add.roundRectangle(
          0,
          0,
          2,
          2,
          0,
          scene.assetLoader.getMenuColor("menuBackground")
        );
      },
      createBackgroundCallbackScope: undefined,

      createButtonCallback: (item, i) => {
        return scene.rexUI.add.label({
          background: scene.rexUI.add.roundRectangle(
            0,
            0,
            2,
            2,
            0,
            scene.assetLoader.getMenuColor("menuBackground")
          ),
          text: scene.add.text(0, 0, item.name, {
            fontSize: i === 0 ? scene.fontSize + 15 : scene.fontSize,
            color: scene.assetLoader.getColors()["menuText"],
            align: "center",
            width: menuWidth,
            fixedWidth: menuWidth,
          }),
          space: 20,
        });
      },
      createButtonCallbackScope: undefined,

      easeIn: menuAnimation,
      easeOut: menuAnimation,
      name: "Menu",
      enableLayer: true,
      pointerDownOutsideCollapsing: false,
    });

    const handlButtonEvent = (button, eventName) => {
      if (button.text === "Paused") {
        return;
      }
      const text = button.getElement("text");
      const colorKey = eventName === "over" ? "menuTextHover" : "menuText";
      const color = this.assetLoader.getColors()[colorKey];
      const textStyle = {
        ...text.style,
        color,
      };
      text.setStyle(textStyle);
    };

    const handleButtonClick = (button) => {
      if (button.text === menuNames.resume) {
        button.scene.pauseOrPlay();
      }
    };

    this.menu
      .on("button.click", handleButtonClick)
      .on("button.over", (button) => handlButtonEvent(button, "over"))
      .on("button.out", (button) => handlButtonEvent(button, "out"));
  }

  closeMenu() {
    if (this.menu) {
      this.menu.collapse();
      this.menu = null;
    }
  }

  pauseOrPlay() {
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    this.closeMenu();
    this.showPauseButton();
  }

  pause() {
    this.openMenu();
    this.showPlayButton();
  }

  removePausePlayButton() {
    if (this.pausePlayButton) {
      this.pausePlayButton.removeInteractive();
      this.pausePlayButton.removeAllListeners();
      this.pausePlayButton.destroy();
    }
  }

  showPlayButton() {
    this.removePausePlayButton();
    this.pausePlayButton = this.setupPausePlayButton("play");
  }

  showPauseButton() {
    this.removePausePlayButton();
    this.pausePlayButton = this.setupPausePlayButton("pause");
  }

  handleEscKey() {
    if (this.keyEsc.isDown && !this.isHandlingPause) {
      this.isHandlingPause = true;
      this.pauseOrPlay();
    }

    if (this.keyEsc.isUp) {
      this.isHandlingPause = false;
    }
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    this.handleEscKey();
    if (this.isPaused) {
      return;
    }

    // assuming 60fps
    this.handleClearingRows();
    this.handleMobileControls();
    this.handleShiftRight();
    this.handleShiftLeft();
    this.handleRotateRight();
    this.handleLocking();
    this.handleGravity();
  }

  isLeftHeld() {
    return this.keyLeft.isDown || this.isDraggingLeft;
  }

  isLeftReleased() {
    return this.keyLeft.isUp && !this.isDraggingLeft;
  }

  isRightHeld() {
    return this.keyRight.isDown || this.isDraggingRight;
  }

  isRightReleased() {
    return this.keyRight.isUp && !this.isDraggingRight;
  }

  isUpHeld() {
    return this.keyUp.isDown || this.isDraggingUp;
  }

  isUpReleased() {
    return this.keyUp.isUp && !this.isDraggingUp;
  }

  isDownHeld() {
    return this.keyDown.isDown || this.isDraggingDown;
  }

  isDownReleased() {
    return this.keyDown.isUp && !this.isDraggingDown;
  }

  resetDraggingFlags() {
    this.isDraggingLeft = false;
    this.isDraggingRight = false;
    this.isDraggingDown = false;
    this.isDraggingUp = false;
  }

  handleDrag() {
    if (this.lastPointerX === null) {
      this.lastPointerX = this.input.activePointer.x;
      this.lastPointerY = this.input.activePointer.y;
      return;
    }

    const deltaX = this.lastPointerX - this.input.activePointer.x;
    const deltaY = this.lastPointerY - this.input.activePointer.y;
    const xSensitivity = this.dimensions.mino.width;
    const ySensitivity = this.dimensions.mino.height;
    const isXTriggered = Math.abs(deltaX) > xSensitivity;
    const isYTriggered = Math.abs(deltaY) > ySensitivity;

    if (this.isTouchDown) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (isXTriggered) {
          if (deltaX > 0) {
            this.isDraggingLeft = true;
          } else {
            this.isDraggingRight = true;
          }
          this.lastPointerX = this.input.activePointer.x;
        }
      } else {
        if (isYTriggered) {
          if (deltaY > 0) {
            this.isDraggingDown = true;
          } else {
            this.isDraggingUp = true;
          }
          this.lastPointerY = this.input.activePointer.y;
        }
      }
    }
  }

  handleMobileControls() {
    this.resetDraggingFlags();

    if (!this.input.activePointer.isDown) {
      this.isTouchDown = false;
      this.touchDownCounter = 0;
      this.lastPointerX = null;
      this.lastPointerY = null;
      return;
    } else if (this.input.activePointer.isDown) {
      this.isTouchDown = true;
      this.touchDownCounter++;
    }

    this.handleDrag();
  }

  handleGravity() {
    const isHardDrop = this.keySpace.isDown;
    if (isHardDrop && !this.isHardDropping) {
      this.isHardDropping = true;
      this.yDelta = 0;
      const numberOfRowsDropped = this.shiftToBottom(this.tetromino, true);
      const { hardDropPerRow } = this.assetLoader.getScore();
      const newScore = this.score + hardDropPerRow * numberOfRowsDropped;
      this.setScore(newScore, false);
      this.soundPlayer.hardDrop();

      this.lockTetromino();
      this.spawnTetromino();
      return;
    }

    if (this.keySpace.isUp) {
      this.isHardDropping = false;
    }

    const level = this.levelManager.getLevel();
    const gravityJson = this.assetLoader.getGravity();
    const maxGravityLevel = 15;
    const gravityKey = level > maxGravityLevel ? maxGravityLevel : level;
    var gravity = gravityJson[gravityKey];
    const isSoftDrop = this.keyDown.isDown;
    if (isSoftDrop) {
      gravity = gravityJson["softdrop"];
      if (!this.isSoftDropping) {
        this.soundPlayer.softDrop();
        this.isSoftDropping = true;
      }
    }

    const isSoftDropFinished = this.keyDown.isUp;
    if (isSoftDropFinished) {
      this.isSoftDropping = false;
    }

    this.yDelta += gravity * this.dimensions.mino.height;
    const shouldDropRow = this.yDelta >= this.dimensions.mino.height;
    if (shouldDropRow) {
      const quotient = Math.floor(this.yDelta / this.dimensions.mino.height);
      const yDelta = quotient * this.dimensions.mino.height;
      const remainder = this.yDelta % this.dimensions.mino.height;

      this.tetromino.shape.y += yDelta;
      this.yDelta = remainder;

      if (isSoftDrop) {
        const { softDropPerRow } = this.assetLoader.getScore();
        const newScore = this.score + softDropPerRow;
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
      const boardBottom =
        this.board.y + boardRows * this.dimensions.mino.height;
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
    const tetrominoes = this.assetLoader.getTetrominoes();
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

    const fillColor = sourceTetromino.shape.list[0].fillColor;
    const strokeColor = sourceTetromino.shape.list[0].strokeColor;
    const clone = this.createTetromino(
      nextRotation,
      { x, y },
      fillColor,
      strokeColor
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
    possibleTetromino.shape.x -= this.dimensions.mino.width;

    if (this.canMove(possibleTetromino.shape)) {
      this.tetromino.shape.x -= this.dimensions.mino.width;
      this.updateGhostTetromino();
      this.updateLockCountersForMove();
      this.soundPlayer.shift();
    }
    possibleTetromino.shape.destroy();
  }

  shiftRight() {
    const possibleTetromino = this.cloneTetromino(this.tetromino);
    possibleTetromino.shape.x += this.dimensions.mino.width;

    if (this.canMove(possibleTetromino.shape)) {
      this.tetromino.shape.x += this.dimensions.mino.width;
      this.updateGhostTetromino();
      this.updateLockCountersForMove();
      this.soundPlayer.shift();
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

    const tetrominoWallkickData = this.assetLoader.getWallkick(
      this.tetromino.name
    );
    const wallkickKey =
      this.tetromino.rotation + ":" + rotatedTetromino.rotation;
    const wallkickOffsets = tetrominoWallkickData[wallkickKey];
    for (const offset of wallkickOffsets) {
      const shiftedTetromino = this.cloneTetromino(rotatedTetromino, 0);
      shiftedTetromino.shape.x += offset.x * this.dimensions.mino.width;
      shiftedTetromino.shape.y += offset.y * this.dimensions.mino.height;
      const canMove = this.canMove(shiftedTetromino.shape);
      if (canMove) {
        this.tetromino.shape.destroy();
        this.tetromino = shiftedTetromino;
        this.tetromino.shape.x = shiftedTetromino.shape.x;
        this.tetromino.shape.y = shiftedTetromino.shape.y;
        this.updateGhostTetromino();
        this.soundPlayer.rotate();
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
