import { describe, expect, it } from "vitest";
import { formatAmount, formatRate, formatUsd } from "./format";

describe("formatUsd", () => {
  it("uses 2 decimals at or above $1 and up to 6 below", () => {
    expect(formatUsd(1645.9337)).toBe("$1,645.93");
    expect(formatUsd(0.004039850455)).toBe("$0.00404");
    expect(formatUsd(0)).toBe("$0.00");
  });
});

describe("formatAmount", () => {
  it.each([
    [0, "0"],
    [NaN, "0"],
    [1234.56789, "1,234.5679"],
    [0.000123456789, "0.000123457"],
  ])("%p -> %p", (n, want) => {
    expect(formatAmount(n)).toBe(want);
  });
});

describe("formatRate", () => {
  it("reads as one unit of the source token", () => {
    expect(formatRate("ETH", "USDC", 1645.93)).toBe("1 ETH = 1,645.93 USDC");
  });
});
