"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { uid } from "./id";
import { seedState, STORAGE_KEY } from "./seed";
import type {
  Campaign,
  Client,
  Deliverable,
  Milestone,
  Recap,
  StudioState,
  Task,
  TeamMember,
} from "./types";

type StudioContextValue = {
  state: StudioState;
  ready: boolean;
  setStudioName: (name: string) => void;
  setCurrentUser: (id: string) => void;
  upsertClient: (client: Omit<Client, "id"> & { id?: string }) => string;
  upsertCampaign: (campaign: Omit<Campaign, "id"> & { id?: string }) => string;
  upsertMilestone: (milestone: Omit<Milestone, "id"> & { id?: string }) => string;
  toggleMilestone: (id: string) => void;
  upsertDeliverable: (
    deliverable: Omit<Deliverable, "id"> & { id?: string }
  ) => string;
  setDeliverableStatus: (id: string, status: Deliverable["status"]) => void;
  upsertTask: (task: Omit<Task, "id"> & { id?: string }) => string;
  setTaskStatus: (id: string, status: Task["status"]) => void;
  upsertRecap: (recap: Omit<Recap, "id"> & { id?: string }) => string;
  upsertPerson: (person: Omit<TeamMember, "id"> & { id?: string }) => string;
  resetDemo: () => void;
};

const StudioContext = createContext<StudioContextValue | null>(null);

function withId<T extends { id?: string }>(item: T, prefix: string) {
  return { ...item, id: item.id ?? uid(prefix) } as T & { id: string };
}

export function StudioProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StudioState>(seedState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        // Restore after mount so server HTML and the first client paint match.
        // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage restore
        setState(JSON.parse(raw) as StudioState);
      }
    } catch {
      // keep seed
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, ready]);

  const patch = useCallback((updater: (prev: StudioState) => StudioState) => {
    setState((prev) => updater(prev));
  }, []);

  const value = useMemo<StudioContextValue>(
    () => ({
      state,
      ready,
      setStudioName: (studioName) => patch((s) => ({ ...s, studioName })),
      setCurrentUser: (currentUserId) => patch((s) => ({ ...s, currentUserId })),
      upsertClient: (client) => {
        const next = withId(client, "cl");
        patch((s) => ({
          ...s,
          clients: s.clients.some((c) => c.id === next.id)
            ? s.clients.map((c) => (c.id === next.id ? next : c))
            : [next, ...s.clients],
        }));
        return next.id;
      },
      upsertCampaign: (campaign) => {
        const next = withId(campaign, "camp");
        patch((s) => ({
          ...s,
          campaigns: s.campaigns.some((c) => c.id === next.id)
            ? s.campaigns.map((c) => (c.id === next.id ? next : c))
            : [next, ...s.campaigns],
        }));
        return next.id;
      },
      upsertMilestone: (milestone) => {
        const next = withId(milestone, "ms");
        patch((s) => ({
          ...s,
          milestones: s.milestones.some((m) => m.id === next.id)
            ? s.milestones.map((m) => (m.id === next.id ? next : m))
            : [...s.milestones, next],
        }));
        return next.id;
      },
      toggleMilestone: (id) =>
        patch((s) => ({
          ...s,
          milestones: s.milestones.map((m) =>
            m.id === id ? { ...m, done: !m.done } : m
          ),
        })),
      upsertDeliverable: (deliverable) => {
        const next = withId(deliverable, "dv");
        patch((s) => ({
          ...s,
          deliverables: s.deliverables.some((d) => d.id === next.id)
            ? s.deliverables.map((d) => (d.id === next.id ? next : d))
            : [next, ...s.deliverables],
        }));
        return next.id;
      },
      setDeliverableStatus: (id, status) =>
        patch((s) => ({
          ...s,
          deliverables: s.deliverables.map((d) =>
            d.id === id ? { ...d, status } : d
          ),
        })),
      upsertTask: (task) => {
        const next = withId(task, "tk");
        patch((s) => ({
          ...s,
          tasks: s.tasks.some((t) => t.id === next.id)
            ? s.tasks.map((t) => (t.id === next.id ? next : t))
            : [next, ...s.tasks],
        }));
        return next.id;
      },
      setTaskStatus: (id, status) =>
        patch((s) => ({
          ...s,
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, status } : t)),
        })),
      upsertRecap: (recap) => {
        const next = withId(recap, "rc");
        patch((s) => ({
          ...s,
          recaps: s.recaps.some((r) => r.id === next.id)
            ? s.recaps.map((r) => (r.id === next.id ? next : r))
            : [next, ...s.recaps],
        }));
        return next.id;
      },
      upsertPerson: (person) => {
        const next = withId(person, "tm");
        patch((s) => ({
          ...s,
          team: s.team.some((p) => p.id === next.id)
            ? s.team.map((p) => (p.id === next.id ? next : p))
            : [...s.team, next],
        }));
        return next.id;
      },
      resetDemo: () => {
        const next = seedState();
        setState(next);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      },
    }),
    [state, ready, patch]
  );

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
}

export function useStudio() {
  const ctx = useContext(StudioContext);
  if (!ctx) throw new Error("useStudio must be used inside StudioProvider");
  return ctx;
}
