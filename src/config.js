import Phaser from "phaser";
import colors from "../assets/colors";

export default {
  type: Phaser.AUTO,
  parent: "game",
  backgroundColor: colors.background,
  scale: {
    width: 800,
    height: 600,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};
