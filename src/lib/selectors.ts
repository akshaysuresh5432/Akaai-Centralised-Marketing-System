import { isPast, sameDay } from "./dates";
import type { StudioState } from "./types";

export function person(state: StudioState, id?: string) {
  return state.team.find((p) => p.id === id);
}

export function client(state: StudioState, id?: string) {
  return state.clients.find((c) => c.id === id);
}

export function campaign(state: StudioState, id?: string) {
  return state.campaigns.find((c) => c.id === id);
}

export function dayDeliverables(state: StudioState, iso: string) {
  return state.deliverables
    .filter((d) => sameDay(d.date, iso))
    .sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""));
}

export function dayTasks(state: StudioState, iso: string) {
  return state.tasks.filter((t) => sameDay(t.dueDate, iso));
}

export function dayMilestones(state: StudioState, iso: string) {
  return state.milestones.filter((m) => sameDay(m.date, iso));
}

export function overdueTasks(state: StudioState, iso: string) {
  return state.tasks.filter(
    (t) => t.status !== "done" && isPast(t.dueDate, iso)
  );
}

export function approvals(state: StudioState) {
  return state.deliverables.filter((d) =>
    ["internal-review", "client-review"].includes(d.status)
  );
}

export function myOpenWork(state: StudioState, userId: string) {
  return {
    tasks: state.tasks.filter(
      (t) => t.assigneeId === userId && t.status !== "done"
    ),
    deliverables: state.deliverables.filter(
      (d) =>
        d.assigneeId === userId &&
        !["live", "reported"].includes(d.status)
    ),
  };
}

export function loadForPerson(state: StudioState, userId: string) {
  const openTasks = state.tasks.filter(
    (t) => t.assigneeId === userId && t.status !== "done"
  ).length;
  const openDeliverables = state.deliverables.filter(
    (d) =>
      d.assigneeId === userId && !["live", "reported"].includes(d.status)
  ).length;
  return openTasks + openDeliverables;
}
