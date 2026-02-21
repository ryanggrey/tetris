import Phaser from 'phaser';
import config from './config';
import GameScene from './scenes/Game';

new Phaser.Game(Object.assign(config, {
  scene: [GameScene],
}));

document.getElementById("commit-badge").textContent = COMMIT_SHA.slice(0, 7);
