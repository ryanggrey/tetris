class SoundPlayer {
  constructor(game) {
    this.game = game;
  }

  preload() {
    this.game.load.audio("gameOver", "assets/gameOver.mp3");
    this.game.load.audio("hardDrop", "assets/hardDrop.mp3");
    this.game.load.audio("levelUp", "assets/levelUp.mp3");
    this.game.load.audio("lineClear", "assets/lineClear.mp3");
    this.game.load.audio("lock", "assets/lock.mp3");
    this.game.load.audio("rotate", "assets/rotate.mp3");
    this.game.load.audio("shift", "assets/shift.mp3");
    this.game.load.audio("softDrop", "assets/softDrop.mp3");
    this.game.load.audio("tetris", "assets/tetris.mp3");
  }

  _play(soundName) {
    const sound = this.game.sound.add(soundName);
    sound.play();
  }

  gameOver() {
    this._play("gameOver");
  }

  hardDrop() {
    this._play("hardDrop");
  }

  levelUp() {
    this._play("levelUp");
  }

  lineClear() {
    this._play("lineClear");
  }

  lock() {
    this._play("lock");
  }

  rotate() {
    this._play("rotate");
  }

  shift() {
    this._play("shift");
  }

  softDrop() {
    this._play("softDrop");
  }

  tetris() {
    this._play("tetris");
  }
}

export default SoundPlayer;
