import TetrominoPicker from "./TetrominoPicker";

class NextTetrominoManager {
  constructor(picker = new TetrominoPicker()) {
    this._picker = picker;
    this._next = [];
    for (let i = 0; i < 3; i++) {
      this._next.push(this._picker.pick());
    }
  }

  pick() {
    const pickedTetromino = this._next.shift();
    const replacementTetromino = this._picker.pick();
    this._next.push(replacementTetromino);
    return pickedTetromino;
  }

  peek() {
    return this._next.slice();
  }
}

export default NextTetrominoManager;
