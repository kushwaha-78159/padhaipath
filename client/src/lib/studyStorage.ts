import type { StudyPlan } from "@shared/studyPlan";

const PLAN_KEY = "padhaipath.active-plan.v1";

export function saveStudyPlan(plan: StudyPlan) {
  if (typeof window !== "undefined") window.localStorage.setItem(PLAN_KEY, JSON.stringify(plan));
}

export function loadStudyPlan(): StudyPlan | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PLAN_KEY);
    return raw ? (JSON.parse(raw) as StudyPlan) : null;
  } catch {
    return null;
  }
}

export function clearStudyPlan() {
  if (typeof window !== "undefined") window.localStorage.removeItem(PLAN_KEY);
}
