import { describe, expect, it } from "vitest";
import { generateStudyPlan, planProgress } from "../shared/studyPlan";

describe("study plan generator", () => {
  it("creates balanced sessions across the requested date range", () => {
    const plan = generateStudyPlan({
      subjects: [{ name: "Mathematics", priority: "high" }, { name: "Physics", priority: "medium" }],
      examDate: "2026-09-08",
      availableHours: 3,
      today: new Date("2026-09-01T12:00:00Z"),
    });
    expect(plan.sessions.length).toBeGreaterThan(6);
    expect(new Set(plan.sessions.map((session) => session.date))).toContain("2026-09-01");
    expect(new Set(plan.sessions.map((session) => session.subject))).toEqual(new Set(["Mathematics", "Physics", "All subjects"]));
    expect(plan.sessions.every((session) => session.minutes >= 20)).toBe(true);
  });

  it("reports completion progress from session state", () => {
    const plan = generateStudyPlan({ subjects: [{ name: "Biology", priority: "high" }], examDate: "2026-09-03", availableHours: 2, today: new Date("2026-09-01T12:00:00Z") });
    const half = { ...plan, sessions: plan.sessions.map((session, index) => ({ ...session, completed: index % 2 === 0 })) };
    expect(planProgress(half)).toBeGreaterThan(0);
    expect(planProgress(half)).toBeLessThan(100);
  });
});
