import { describe, expect, it } from "vitest";
import { toReadableDate } from "./utils";

describe("toReadableDate", () => {
  it("should return the date in a readable french format", async () => {
    // Arrange
    const date = new Date("2025/06/30");
    
    // Act
    const result = toReadableDate(date);

    // Assert (Vitest)
    expect(result).toEqual("lundi 30 juin 2025");
  });

  it("should not display the 0-before a small number", async () => {
    // Arrange
    const date = new Date("2000/01/01");
    
    // Act
    const result = toReadableDate(date);

    // Assert (Vitest)
    expect(result).toEqual("samedi 1 janvier 2000");
  });
});
