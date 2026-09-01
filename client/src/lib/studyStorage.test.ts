import { afterEach, describe, expect, it } from "vitest";
import { clearStudyPlan, loadStudyPlan, saveStudyPlan } from "./studyStorage";
import type { StudyPlan } from "@shared/studyPlan";

const plan: StudyPlan = { id: "plan-test", examDate: "2026-09-10", availableHours: 2, subjects: [{ name: "Physics", priority: "high" }], sessions: [], createdAt: "2026-09-01T00:00:00.000Z" };

function installStorage() {
  const values = new Map<string, string>();
  Object.defineProperty(globalThis, "window", { configurable: true, value: { localStorage: { setItem: (key: string, value: string) => values.set(key, value), getItem: (key: string) => values.get(key) ?? null, removeItem: (key: string) => values.delete(key) } } });
  return values;
}

afterEach(() => { Reflect.deleteProperty(globalThis, "window"); });

describe("studyStorage", () => {
  it("round trips a plan and clears it", () => {
    installStorage();
    saveStudyPlan(plan);
    expect(loadStudyPlan()).toEqual(plan);
    clearStudyPlan();
    expect(loadStudyPlan()).toBeNull();
  });

  it("returns null instead of throwing on invalid saved data", () => {
    const values = installStorage();
    values.set("padhaipath.active-plan.v1", "not-json");
    expect(loadStudyPlan()).toBeNull();
  });
});
