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
- [x] Disallow auto rotate
- [ ] Left rotation
- [x] Wall kicks
- [x] Soft drop
- [x] Soft drop - score
- [x] Line deletion
- [x] Line deletion - animation
- [x] Allow movement in -1 and -2 rows
- [ ] Board gridlines
- [ ] Gridlines between tetrominoes
- [x] Ghost tetromino
- [x] Hard drop
- [x] Hard drop - animation
- [ ] Fix spawn randomisation
- [x] Hard drop - score
- [ ] Sound effects
- [ ] Music
- [ ] Game over screen
- [ ] Game over screen - retry
- [x] Score - simple (line clears)
- [ ] Score - advanced (t-spins and others)
- [x] Lines tracking
- [x] Lines tracking - level incrementing
- [x] Text change animations
- [ ] High score tracking
- [ ] Next 5 tetrominoes
- [ ] Hold tetromino
- [ ] Switch held tetromino
- [ ] Don't assume 60fps
- [ ] Mobile controls
- [ ] Unit tests
- [ ] Web hosting
