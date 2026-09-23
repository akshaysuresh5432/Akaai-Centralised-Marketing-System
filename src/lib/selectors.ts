import type { StudioState } from "./types";

export function company(state: StudioState, id?: string) {
  return state.companies.find((c) => c.id === id);
}

export function project(state: StudioState, id?: string) {
  return state.projects.find((p) => p.id === id);
}

export function campaign(state: StudioState, id?: string) {
  return state.campaigns.find((c) => c.id === id);
}

export function person(state: StudioState, id?: string) {
  return state.team.find((p) => p.id === id);
}

export type ReminderKind = "publish" | "invoice";

export type Reminder = {
  id: string;
  kind: ReminderKind;
  date: string;
  title: string;
  companyId: string;
  ownerId: string;
  href: string;
  amount?: string;
};

export function reminders(state: StudioState): Reminder[] {
  const pubs: Reminder[] = state.deliverables
    .filter((d) => !d.done)
    .map((d) => ({
      id: d.id,
      kind: "publish" as const,
      date: d.publishDate,
      title: d.title,
      companyId: d.companyId,
      ownerId: d.ownerId,
      href: `/companies/${d.companyId}`,
    }));
  const inv: Reminder[] = state.invoices
    .filter((i) => !i.paid)
    .map((i) => ({
      id: i.id,
      kind: "invoice" as const,
      date: i.date,
      title: i.title,
      companyId: i.companyId,
      ownerId: i.ownerId,
      href: `/companies/${i.companyId}`,
      amount: i.amount,
    }));
  return [...pubs, ...inv].sort((a, b) => a.date.localeCompare(b.date));
}
