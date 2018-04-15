import { init } from "../";

describe("init type check", () => {
  test("init is a defined function", () => {
    expect(init).toBeDefined();
    expect(init).toBeInstanceOf(Function);
  });
});
