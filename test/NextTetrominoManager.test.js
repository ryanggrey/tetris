import NextTetrominoManager from "../src/NextTetrominoManager";

test("NextTetrominoManager.pick() returns a random tetromino", () => {
  const nextTetrominoes = new NextTetrominoManager();
  const tetromino = nextTetrominoes.pick();
  expect(tetromino).toBeDefined();
});

test("NextTetrominoManager.getNextTetrominoManager() initially returns 3 tetrominoes", () => {
  const nextTetrominoes = new NextTetrominoManager();
  const tetrominoes = nextTetrominoes.peek();
  expect(tetrominoes.length).toBe(3);
});

test("NextTetrominoManager.getNextTetrominoManager() returns 3 tetrominoes after a pick", () => {
  const nextTetrominoes = new NextTetrominoManager();
  nextTetrominoes.pick();
  const tetrominoes = nextTetrominoes.peek();
  expect(tetrominoes.length).toBe(3);
});

test("NextTetrominoManager.getNextTetrominoManager() returns 3 tetrominoes after several picks", () => {
  const nextTetrominoes = new NextTetrominoManager();
  for (let i = 0; i < 10; i++) {
    nextTetrominoes.pick();
  }
  const tetrominoes = nextTetrominoes.peek();
  expect(tetrominoes.length).toBe(3);
});

test("NextTetrominoManager.pick() returns first tetromino from peek()", () => {
  const nextTetrominoes = new NextTetrominoManager();
  const next = nextTetrominoes.peek();
  const tetromino = nextTetrominoes.pick();
  expect(tetromino).toBe(next[0]);
});

test("NextTetrominoManager.pick() returns all 3 tetrominoes from peek()", () => {
  const nextTetrominoes = new NextTetrominoManager();
  const next = nextTetrominoes.peek();
  for (let i = 0; i < 3; i++) {
    const tetromino = nextTetrominoes.pick();
    expect(tetromino).toBe(next[i]);
  }
});

test("NextTetrominoManager.pick() shifts next tetrominoes", () => {
  const nextTetrominoes = new NextTetrominoManager();
  const next1 = nextTetrominoes.peek();
  nextTetrominoes.pick();
  const next2 = nextTetrominoes.peek();
  expect(next1[1]).toBe(next2[0]);
  expect(next1[2]).toBe(next2[1]);
});
