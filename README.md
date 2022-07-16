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

## Wall Kicks

Wall kick data and implementation taken from https://tetris.wiki/Super_Rotation_System

## To Do

- [x] Tetromino JSON model
- [x] Tetromino rendering
- [x] Tetromino colour mapping
- [x] Gravity makes tetrominos descend
- [x] Level to gravity level mapping
- [x] Floor collision
- [x] Floor locking/timer
- [x] Top/bottom collision with static tetrominos
- [x] Floor locking - max number of moves
- [x] Left shifting
- [x] DAS and ARR for left shifting
- [x] Left wall collision
- [x] Left/right static tetromino collision
- [x] Right shifting
- [x] DAS and ARR for right shifting
- [x] Right wall collision
- [x] Right/left static tetromino collision
- [x] Right rotation
- [ ] Left rotation
- [x] Wall kicks
- [x] Soft drop
- [ ] Line deletion
- [ ] Line deletion - animation
- [ ] Ghost tetromino
- [ ] Hard drop
- [ ] Hard drop - animation
- [ ] Sound effects
- [ ] Music
- [ ] Game over screen
- [ ] Game over screen - retry
- [ ] Score
- [ ] Score - level incrementing
- [ ] High score tracking
- [ ] Next 5 tetrominoes
- [ ] Hold tetromino
- [ ] Switch held tetromino
- [ ] Web hosting
