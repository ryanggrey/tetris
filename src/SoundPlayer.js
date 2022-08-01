class SoundPlayer {
  constructor(game) {
    this.game = game;
  }

  preload() {
    this.game.load.audio("gameOver", "assets/gameOver.wav");
    this.game.load.audio("hardDrop", "assets/hardDrop.wav");
    this.game.load.audio("levelUp", "assets/levelUp.wav");
    this.game.load.audio("lineClear", "assets/lineClear.wav");
    this.game.load.audio("lock", "assets/lock.wav");
    this.game.load.audio("rotate", "assets/rotate.wav");
    this.game.load.audio("shift", "assets/shift.wav");
    this.game.load.audio("softDrop", "assets/softDrop.wav");
    this.game.load.audio("tetris", "assets/tetris.wav");
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
