import Phaser from 'phaser';

class Game extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) {}

  preload() {
    this.load.json('tetrominoes', 'assets/tetrominoes.json');
  }

  create(data) {
    // draw tetromino
    const tetrominoes = this.cache.json.get('tetrominoes');
    console.log(tetrominoes);
    const j = tetrominoes.j;
    j.forEach((row, yIndex) => {
      row.forEach((bit, xIndex) => {
        const hexRed = 0xff0000;
        const hexBlack = 0x000000;
        const width = 20;
        const height = 20;
        const x = width/2 + xIndex * width;
        const y = height/2 + yIndex * height;
        if (bit) {
          const mino = this.add.rectangle(x, y, width, height, hexRed);
          mino.setStrokeStyle(1, hexBlack);
        }
      });
    });
  }

  update(time, delta) {}
}

export default Game;