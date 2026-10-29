import { describe, expect, it } from "vitest";
import { scoreQuiz } from "@/lib/quiz";

describe("Which cat are you? quiz", () => {
  it("picks the Panther when creative / heavy answers dominate", () => {
    expect(scoreQuiz([0, 0, 0, 0, 0]).cat).toBe("panther");
  });

  it("picks the Wildcat when everyday / value answers dominate", () => {
    expect(scoreQuiz([1, 1, 1, 1, 1]).cat).toBe("wildcat");
  });

  it("breaks a tie using the first question's answer", () => {
    // panther: 2 (q1) + 1 (q3) + 1 (q5) = 4 ; wildcat: 2 (q2) + 2 (q4) = 4
    const r = scoreQuiz([0, 1, 0, 1, 0]);
    expect(r.panther).toBe(4);
    expect(r.wildcat).toBe(4);
    expect(r.cat).toBe("panther");
  });
});
