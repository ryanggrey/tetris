import Phaser from "phaser";
import colors from "../assets/colors";
import UIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin.js";

export default {
  type: Phaser.AUTO,
  parent: "game",
  backgroundColor: colors.background,
  scale: {
    width: window.innerWidth * window.devicePixelRatio,
    height: window.innerHeight * window.devicePixelRatio,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  plugins: {
    scene: [
      {
        key: "rexUI",
        plugin: UIPlugin,
        mapping: "rexUI",
      },
    ],
  },
};
