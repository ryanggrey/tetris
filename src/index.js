import Phaser from 'phaser';
import config from './config';
import GameScene from './scenes/Game';

new Phaser.Game(Object.assign(config, {
  scene: [GameScene],
}));

const badge = document.getElementById("commit-badge");
badge.textContent = COMMIT_SHA.slice(0, 7);
badge.href = "https://github.com/ryanggrey/tetris/commit/" + COMMIT_SHA;
