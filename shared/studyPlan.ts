export type Priority = "high" | "medium" | "low";

export type SubjectInput = {
  name: string;
  priority: Priority;
};

export type StudySession = {
  id: string;
  subject: string;
  topic: string;
  date: string;
  minutes: number;
  kind: "learn" | "practice" | "revision";
  completed: boolean;
};

export type StudyPlan = {
  id: string;
  examDate: string;
  availableHours: number;
  subjects: SubjectInput[];
  sessions: StudySession[];
  createdAt: string;
};

const TOPICS: Record<string, string[]> = {
  Physics: ["Core concepts", "Worked examples", "Problem set", "Quick revision"],
  Chemistry: ["Key reactions", "Concept map", "Numerical practice", "Quick revision"],
  Mathematics: ["Formula foundations", "Guided examples", "Timed practice", "Quick revision"],
  Biology: ["Definitions & diagrams", "Active recall", "Past questions", "Quick revision"],
  English: ["Core themes", "Evidence bank", "Timed response", "Quick revision"],
};

function topicFor(subject: string, index: number) {
  const list = TOPICS[subject] ?? ["Core concepts", "Guided practice", "Past questions", "Quick revision"];
  return list[index % list.length];
}

export function generateStudyPlan(input: {
  subjects: SubjectInput[];
  examDate: string;
  availableHours: number;
  today?: Date;
}): StudyPlan {
  const start = input.today ? new Date(input.today) : new Date();
  start.setHours(12, 0, 0, 0);
  const exam = new Date(`${input.examDate}T12:00:00`);
  const days = Math.max(1, Math.min(30, Math.ceil((exam.getTime() - start.getTime()) / 86400000)));
  const dailyMinutes = Math.max(45, Math.round((input.availableHours * 60) / Math.max(1, input.subjects.length)));
  const sessionMinutes = Math.max(25, Math.min(90, Math.round(dailyMinutes * 0.72)));
  const subjects = [...input.subjects].sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority]));
  const sessions: StudySession[] = [];

  for (let day = 0; day < days; day += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + day);
    const dateKey = date.toISOString().slice(0, 10);
    const subject = subjects[day % subjects.length];
    if (subject) {
      sessions.push({ id: `${dateKey}-${subject.name}-learn`, subject: subject.name, topic: topicFor(subject.name, day), date: dateKey, minutes: sessionMinutes, kind: day % 3 === 2 ? "practice" : "learn", completed: false });
    }
    if (subjects.length > 1 && day % 2 === 1) {
      const second = subjects[(day + 1) % subjects.length];
      sessions.push({ id: `${dateKey}-${second.name}-support`, subject: second.name, topic: topicFor(second.name, day + 1), date: dateKey, minutes: Math.max(25, Math.round(sessionMinutes * 0.65)), kind: "practice", completed: false });
    }
    if (day > 0 && (day % 3 === 0 || day === days - 1)) {
      sessions.push({ id: `${dateKey}-revision`, subject: "All subjects", topic: "Spaced revision & recall", date: dateKey, minutes: Math.max(20, Math.round(sessionMinutes * 0.38)), kind: "revision", completed: false });
    }
  }

  return { id: `plan-${Date.now()}`, examDate: input.examDate, availableHours: input.availableHours, subjects: input.subjects, sessions, createdAt: new Date().toISOString() };
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(new Date(`${date}T12:00:00`));
}

export function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function planProgress(plan: StudyPlan | null) {
  if (!plan || plan.sessions.length === 0) return 0;
  return Math.round((plan.sessions.filter((session) => session.completed).length / plan.sessions.length) * 100);
}
