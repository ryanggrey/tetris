class TetrominoPicker {
  constructor() {
    this._bag = [];
  }

  pick() {
    const shuffle = (unshuffled) =>
      unshuffled
        .map((value) => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);

    if (this._bag.length === 0) {
      this._bag = shuffle(["i", "j", "l", "o", "s", "t", "z"]);
    }
    return this._bag.pop();
  }
}

export default TetrominoPicker;
