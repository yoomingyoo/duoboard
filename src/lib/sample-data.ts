export type TaskStatus = "todo" | "doing" | "done";

export type Task = {
  id: string;
  title: string;
  assignee: "hyejin" | "mingyoo";
  status: TaskStatus;
};

export type Retro = {
  id: string;
  author: "hyejin" | "mingyoo";
  weekOf: string;
  good: string;
  bad: string;
  nextAction: string;
};

export const sampleTasks: Task[] = [
  { id: "t1", title: "Next.js 앱 초기 세팅", assignee: "mingyoo", status: "doing" },
  { id: "t2", title: "화면 문구/UX 검토", assignee: "hyejin", status: "todo" },
  { id: "t3", title: "MVP 범위 문서 확정", assignee: "hyejin", status: "done" },
  { id: "t4", title: "Supabase 스키마 연결", assignee: "mingyoo", status: "todo" }
];

export const sampleRetros: Retro[] = [
  {
    id: "r1",
    author: "mingyoo",
    weekOf: "2026-07-14",
    good: "아이템과 기술 방향을 빠르게 좁혔다.",
    bad: "실제 코드 구조 결정이 늦어졌다.",
    nextAction: "로그인/보드/회고 3개 화면 scaffold를 먼저 완성한다."
  },
  {
    id: "r2",
    author: "hyejin",
    weekOf: "2026-07-14",
    good: "문서 기준이 정리되어 협업 맥락이 명확해졌다.",
    bad: "칸반 범위를 어디까지 넣을지 초반에 조금 넓게 봤다.",
    nextAction: "2주차 목표를 상태 변경 중심으로 유지한다."
  }
];
