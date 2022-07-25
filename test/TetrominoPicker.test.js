import TetrominoPicker from "../src/TetrominoPicker.js";

test("TetrominoPicker.pick() returns a random tetromino", () => {
  const tetrominoPicker = new TetrominoPicker();
  const tetromino = tetrominoPicker.pick();
  expect(tetromino).toBeDefined();
});

test("TetrominoPicker picks each tetromino once and only once from 7 picks", () => {
  const observedTetrominoes = [];
  const tetrominoPicker = new TetrominoPicker();
  for (let i = 0; i < 7; i++) {
    const tetromino = tetrominoPicker.pick();
    observedTetrominoes.push(tetromino);
  }
  const bag = ["i", "j", "l", "o", "s", "t", "z"];
  const expectedTetrominoes = [...bag];
  expect(observedTetrominoes.sort()).toEqual(expectedTetrominoes.sort());
});

test("TetrominoPicker picks each tetromino twice and only twice from 14 picks", () => {
  const observedTetrominoes = [];
  const tetrominoPicker = new TetrominoPicker();
  for (let i = 0; i < 14; i++) {
    const tetromino = tetrominoPicker.pick();
    observedTetrominoes.push(tetromino);
  }

  const bag = ["i", "j", "l", "o", "s", "t", "z"];
  const expectedTetrominoes = [...bag, ...bag];
  expect(observedTetrominoes.sort()).toEqual(expectedTetrominoes.sort());
});

test("TetrominoPicker.pick() order is random from 7 picks", () => {
  const picks = () => {
    const observedTetrominoes = [];
    const tetrominoPicker = new TetrominoPicker();
    for (let i = 0; i < 7; i++) {
      const tetromino = tetrominoPicker.pick();
      observedTetrominoes.push(tetromino);
    }
    return observedTetrominoes;
  };

  const picks1 = picks();
  let picks2 = picks();
  let limit = 100;

  /*
  There's a chance that the order of the 7 tetrominoes will be the same
  from two consecutive picks. Therefore we need to try to pick again 
  until we get a different order.

  There is a chance that even after 100 tries, the order will still be the same.
  But the chance is extremely low.

  This seems like a bad test, but not sure how to robustly test for randomness.
  */
  while (arraysEqual(picks1, picks2) && limit > 0) {
    picks2 = picks();
    limit--;
  }

  expect(picks1).not.toEqual(picks2);
});

const arraysEqual = (a, b) => {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};
