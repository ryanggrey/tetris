const pulse = (gameObject, game) => {
  // pulse from centre
  gameObject.setOrigin(0.5);
  gameObject.x = gameObject.x + gameObject.width / 2;
  gameObject.y = gameObject.y + gameObject.height / 2;

  game.tweens.add({
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
};

export default pulse;
