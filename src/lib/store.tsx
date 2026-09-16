"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { uid } from "./id";
import { seedState, STORAGE_KEY } from "./seed";
import type {
  Campaign,
  Client,
  Deliverable,
  FileAsset,
  Milestone,
  Recap,
  StudioState,
  Task,
  TeamMember,
  VideoJob,
  VideoStatus,
} from "./types";
import { normalizeStudio } from "./normalize";

const USER_KEY = "relay-desk-user";

type StudioContextValue = {
  state: StudioState;
  ready: boolean;
  live: boolean;
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
  upsertVideoJob: (job: Omit<VideoJob, "id" | "sourceFiles" | "finalFiles"> & { id?: string }) => string;
  setVideoJobStatus: (id: string, status: VideoStatus) => void;
  attachFile: (jobId: string, file: FileAsset) => void;
  removeFile: (jobId: string, fileId: string) => void;
  resetDemo: () => void;
};

const StudioContext = createContext<StudioContextValue | null>(null);

function withId<T extends { id?: string }>(item: T, prefix: string) {
  return { ...item, id: item.id ?? uid(prefix) } as T & { id: string };
}

function withUser(state: StudioState, userId: string): StudioState {
  return { ...state, currentUserId: userId };
}

export function StudioProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StudioState>(seedState);
  const [ready, setReady] = useState(false);
  const [live, setLive] = useState(false);
  const skipPush = useRef(true);
  const saving = useRef(false);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const push = useCallback(async (next: StudioState) => {
    saving.current = true;
    try {
      const res = await fetch("/api/studio", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      if (res.ok) setLive(true);
    } catch {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } finally {
      saving.current = false;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const userId =
      localStorage.getItem(USER_KEY) || seedState().currentUserId;

    (async () => {
      try {
        const res = await fetch("/api/studio", { cache: "no-store" });
        if (res.ok) {
          const remote = (await res.json()) as StudioState;
          if (!cancelled) {
            skipPush.current = true;
            setState(withUser(normalizeStudio(remote), userId));
            setLive(true);
          }
        } else {
          throw new Error("offline");
        }
      } catch {
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw && !cancelled) {
            skipPush.current = true;
            setState(
              withUser(normalizeStudio(JSON.parse(raw) as StudioState), userId)
            );
          }
        } catch {
          // seed
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    const tick = window.setInterval(async () => {
      if (saving.current) return;
      try {
        const res = await fetch("/api/studio", { cache: "no-store" });
        if (!res.ok) return;
        const remote = (await res.json()) as StudioState;
        const local = stateRef.current;
        if ((remote.updatedAt ?? 0) > (local.updatedAt ?? 0)) {
          skipPush.current = true;
          setState(withUser(normalizeStudio(remote), local.currentUserId));
          setLive(true);
        }
      } catch {
        // keep local
      }
    }, 4000);

    return () => {
      cancelled = true;
      window.clearInterval(tick);
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(USER_KEY, state.currentUserId);
    if (skipPush.current) {
      skipPush.current = false;
      return;
    }
    const handle = window.setTimeout(() => {
      void push(state);
    }, 350);
    return () => window.clearTimeout(handle);
  }, [state, ready, push]);

  const patch = useCallback((updater: (prev: StudioState) => StudioState) => {
    setState((prev) => updater({ ...prev, updatedAt: Date.now() }));
  }, []);

  const value = useMemo<StudioContextValue>(
    () => ({
      state,
      ready,
      live,
      setStudioName: (studioName) => patch((s) => ({ ...s, studioName })),
      setCurrentUser: (currentUserId) => {
        localStorage.setItem(USER_KEY, currentUserId);
        setState((s) => ({ ...s, currentUserId }));
      },
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
      upsertVideoJob: (job) => {
        const next = withId(
          {
            sourceFiles: [],
            finalFiles: [],
            ...job,
          },
          "vid"
        );
        patch((s) => ({
          ...s,
          videoJobs: (s.videoJobs ?? []).some((j) => j.id === next.id)
            ? s.videoJobs.map((j) => (j.id === next.id ? { ...j, ...next } : j))
            : [next, ...(s.videoJobs ?? [])],
        }));
        return next.id;
      },
      setVideoJobStatus: (id, status) =>
        patch((s) => ({
          ...s,
          videoJobs: (s.videoJobs ?? []).map((j) =>
            j.id === id ? { ...j, status } : j
          ),
        })),
      attachFile: (jobId, file) =>
        patch((s) => ({
          ...s,
          videoJobs: (s.videoJobs ?? []).map((j) => {
            if (j.id !== jobId) return j;
            const key = file.kind === "final" ? "finalFiles" : "sourceFiles";
            return { ...j, [key]: [...j[key], file] };
          }),
        })),
      removeFile: (jobId, fileId) =>
        patch((s) => ({
          ...s,
          videoJobs: (s.videoJobs ?? []).map((j) =>
            j.id === jobId
              ? {
                  ...j,
                  sourceFiles: j.sourceFiles.filter((f) => f.id !== fileId),
                  finalFiles: j.finalFiles.filter((f) => f.id !== fileId),
                }
              : j
          ),
        })),
      resetDemo: () => {
        const userId = state.currentUserId;
        const next = withUser(seedState(), userId);
        skipPush.current = false;
        setState(next);
        void push(next);
      },
    }),
    [state, ready, live, patch, push]
  );

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
}

export function useStudio() {
  const ctx = useContext(StudioContext);
  if (!ctx) throw new Error("useStudio must be used inside StudioProvider");
  return ctx;
}
