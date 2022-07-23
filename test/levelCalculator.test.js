import levelCalculator from "../src/levelCalculator.js";

test("0 rows cleared is level 1", () => {
  expect(levelCalculator(0)).toBe(1);
});

test("1 rows cleared is level 1", () => {
  expect(levelCalculator(1)).toBe(1);
});

test("2 rows cleared is level 1", () => {
  expect(levelCalculator(2)).toBe(1);
});

test("3 rows cleared is level 1", () => {
  expect(levelCalculator(3)).toBe(1);
});

test("4 rows cleared is level 1", () => {
  expect(levelCalculator(4)).toBe(1);
});

test("5 rows cleared is level 1", () => {
  expect(levelCalculator(5)).toBe(1);
});

test("6 rows cleared is level 1", () => {
  expect(levelCalculator(6)).toBe(1);
});

test("7 rows cleared is level 1", () => {
  expect(levelCalculator(7)).toBe(1);
});

test("8 rows cleared is level 1", () => {
  expect(levelCalculator(8)).toBe(1);
});

test("9 rows cleared is level 1", () => {
  expect(levelCalculator(9)).toBe(1);
});

test("10 rows cleared is level 2", () => {
  expect(levelCalculator(10)).toBe(2);
});

test("11 rows cleared is level 2", () => {
  expect(levelCalculator(11)).toBe(2);
});

test("12 rows cleared is level 2", () => {
  expect(levelCalculator(12)).toBe(2);
});

test("13 rows cleared is level 2", () => {
  expect(levelCalculator(13)).toBe(2);
});

test("14 rows cleared is level 2", () => {
  expect(levelCalculator(14)).toBe(2);
});

test("15 rows cleared is level 2", () => {
  expect(levelCalculator(15)).toBe(2);
});

test("16 rows cleared is level 2", () => {
  expect(levelCalculator(16)).toBe(2);
});

test("17 rows cleared is level 2", () => {
  expect(levelCalculator(17)).toBe(2);
});

test("18 rows cleared is level 2", () => {
  expect(levelCalculator(18)).toBe(2);
});

test("19 rows cleared is level 2", () => {
  expect(levelCalculator(19)).toBe(2);
});

test("20 rows cleared is level 3", () => {
  expect(levelCalculator(20)).toBe(3);
});

test("21 rows cleared is level 3", () => {
  expect(levelCalculator(21)).toBe(3);
});

test("22 rows cleared is level 3", () => {
  expect(levelCalculator(22)).toBe(3);
});

test("23 rows cleared is level 3", () => {
  expect(levelCalculator(23)).toBe(3);
});

test("24 rows cleared is level 3", () => {
  expect(levelCalculator(24)).toBe(3);
});

test("25 rows cleared is level 3", () => {
  expect(levelCalculator(25)).toBe(3);
});

test("26 rows cleared is level 3", () => {
  expect(levelCalculator(26)).toBe(3);
});

test("27 rows cleared is level 3", () => {
  expect(levelCalculator(27)).toBe(3);
});

test("28 rows cleared is level 3", () => {
  expect(levelCalculator(28)).toBe(3);
});

test("29 rows cleared is level 3", () => {
  expect(levelCalculator(29)).toBe(3);
});

test("30 rows cleared is level 4", () => {
  expect(levelCalculator(30)).toBe(4);
});

test("31 rows cleared is level 4", () => {
  expect(levelCalculator(31)).toBe(4);
});

test("39 rows cleared is level 4", () => {
  expect(levelCalculator(39)).toBe(4);
});

test("40 rows cleared is level 5", () => {
  expect(levelCalculator(40)).toBe(5);
});

test("41 rows cleared is level 5", () => {
  expect(levelCalculator(41)).toBe(5);
});

test("49 rows cleared is level 5", () => {
  expect(levelCalculator(49)).toBe(5);
});

test("50 rows cleared is level 6", () => {
  expect(levelCalculator(50)).toBe(6);
});

test("51 rows cleared is level 6", () => {
  expect(levelCalculator(51)).toBe(6);
});

test("199 rows cleared is level 20", () => {
  expect(levelCalculator(199)).toBe(20);
});

test("200 rows cleared is level 20", () => {
  expect(levelCalculator(200)).toBe(20);
});

test("201 rows cleared is level 20", () => {
  expect(levelCalculator(201)).toBe(20);
});

test("210 rows cleared is level 20", () => {
  expect(levelCalculator(210)).toBe(20);
});

test("220 rows cleared is level 20", () => {
  expect(levelCalculator(220)).toBe(20);
});

test("10000 rows cleared is level 20", () => {
  expect(levelCalculator(10000)).toBe(20);
});
