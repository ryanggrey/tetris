class TetrominoPicker {
  constructor() {
    this.bag = [];
  }

  pick() {
    const shuffle = (unshuffled) =>
      unshuffled
        .map((value) => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);

    if (this.bag.length === 0) {
      this.bag = shuffle(["i", "j", "l", "o", "s", "t", "z"]);
    }
    return this.bag.pop();
  }
}

export default TetrominoPicker;
