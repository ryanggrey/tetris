const createGameDimensions = (gameColumns, gameRows, gameWidth, gameHeight) => {
  const scoreSectionColumns = 5;
  const boardSectionColumns = gameColumns;
  const nextSectionColumns = 5;
  const rows = 1 + 2 + gameRows + 2 + 1;
  const isWidthGreater = gameWidth > gameHeight;

  let minoWidth, minoHeight;
  if (isWidthGreater) {
    // then use height to calculate minoWidth and minoHeight
    minoWidth = Math.floor(gameHeight / rows);
    minoHeight = minoWidth;
  } else {
    // then use width to calculate minoWidth and minoHeight
    minoWidth = Math.floor(
      gameWidth /
        (scoreSectionColumns + boardSectionColumns + nextSectionColumns)
    );
    minoHeight = minoWidth;
  }

  const scoreSectionWidth = scoreSectionColumns * minoWidth;
  const boardSectionWidth = boardSectionColumns * minoWidth;
  const boardSectionHeight = gameRows * minoHeight;
  const nextSectionWidth = nextSectionColumns * minoWidth;

  const score = {
    x: gameWidth / 2 - boardSectionWidth / 2 - scoreSectionWidth,
    width: scoreSectionWidth,
  };
  const board = {
    x: score.x + score.width,
    y: Math.floor(gameHeight / 2 - boardSectionHeight / 2),
    width: boardSectionWidth,
    height: boardSectionHeight,
  };
  const next = {
    x: board.x + board.width,
    width: nextSectionWidth,
  };

  const font = minoHeight * 0.8;

  return {
    mino: {
      width: minoWidth,
      height: minoHeight,
    },
    score,
    board,
    next,
    font,
  };
};

export default createGameDimensions;
