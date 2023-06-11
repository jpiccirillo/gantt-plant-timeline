import { toPlural } from "./index";

describe("toPlural", () => {
  it('should pluralize words ending in "s" by adding "es"', () => {
    expect(toPlural("bus")).toBe("buses");
    expect(toPlural("class")).toBe("classes");
    expect(toPlural("pass")).toBe("passes");
  });

  it('should pluralize words ending in a consonant followed by "y" by replacing "y" with "ies"', () => {
    expect(toPlural("baby")).toBe("babies");
    expect(toPlural("city")).toBe("cities");
    expect(toPlural("fly")).toBe("flies");
  });

  it('should pluralize words ending in a vowel followed by "y" by adding "s"', () => {
    expect(toPlural("toy")).toBe("toys");
    expect(toPlural("boy")).toBe("boys");
    expect(toPlural("key")).toBe("keys");
  });

  it('should pluralize regular words ending in a consonant by adding "s"', () => {
    expect(toPlural("cat")).toBe("cats");
    expect(toPlural("dog")).toBe("dogs");
    expect(toPlural("book")).toBe("books");
    expect(toPlural("serrano pepper")).toBe("serrano peppers");
  });

  it("should return the input as is if it is already plural", () => {
    expect(toPlural("apples")).toBe("apples");
    expect(toPlural("horses")).toBe("horses");
    expect(toPlural("phones")).toBe("phones");
  });
});
