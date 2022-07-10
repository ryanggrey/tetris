# Tetris

## Colors

Color of blocks taken from https://en.wikipedia.org/wiki/Tetromino#One-sided_tetrominoes

## Gravity

Gravity per level taken from https://gamedev.stackexchange.com/questions/159835/understanding-tetris-speed-curve. Where 1G = 1 cell per frame.

## Spawning

Spawning attempts to follow rules here - https://tetris.fandom.com/wiki/SRS#Spawn_Orientation_and_Location.

However the implementation is simplified:

- Spawn in rows 20 and 19. Not sure what the ramifications of this is yet, but it simplifies things as we don't need to handle spawining above the game board (22/21) and only rendering once entering the board (20/10). This might need to change later.
- Spawn in column 4. All tetrominoes are the correct width to end up adhering to the rules in the above link.
