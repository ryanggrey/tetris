# Tetris

## Colors

Color of blocks taken from https://en.wikipedia.org/wiki/Tetromino#One-sided_tetrominoes

## Gravity

Gravity per level taken from https://harddrop.com/wiki/Tetris_Worlds#Gravity

## Spawning

### Location

Spawning attempts to follow rules here - https://tetris.wiki/Super_Rotation_System#Spawn_Orientation_and_Location.

However the implementation is simplified:

- Spawn in column 4. All tetrominoes are the correct width to end up adhering to the rules in the above link.

### Randomness

Spawn randomness follows Tetris guideline (7-bag system) - https://tetris.wiki/Random_Generator.

## Wall Kicks

Wall kick data and implementation taken from https://tetris.wiki/Super_Rotation_System

## Sound Effects

All sound effects taken from https://mixkit.co/free-sound-effects/game/

## Icons

Icons taken from:

- [Play icon](https://www.svgrepo.com/svg/92733/play-button) - CC0 License
- [Pause icon](https://www.svgrepo.com/svg/149631/pause-button) - CC0 License

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
- [x] Fix spawn randomisation
- [x] Hard drop - score
- [ ] Sharp rendering
- [x] Sound effects
  - [x] Rotate
  - [x] Shift left/right
  - [x] start soft drop
  - [x] Lock
  - [x] Hard drop
  - [x] Line clear
  - [x] Tetris
  - [x] Game over
  - [x] Level up
- [ ] Music
- [ ] Game over screen
- [ ] Game over screen - retry
- [x] Score - simple (line clears)
- [ ] Score - advanced (t-spins and others)
- [x] Lines tracking
- [x] Lines tracking - level incrementing
- [x] Text change animations
- [ ] High score tracking
- [x] Next 3 tetrominoes
- [ ] Hold tetromino
- [ ] Switch held tetromino
- [ ] Don't assume 60fps
- [in-progress] Mobile controls
- [x] Mobile layout/rendering
- [x] Unit tests
- [x] Web hosting
- [x] Pause - Desktop
- [ ] Pause - Mobile
