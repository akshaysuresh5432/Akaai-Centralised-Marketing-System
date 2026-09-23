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
import { normalizeStudio } from "./normalize";
import type {
  Campaign,
  Company,
  Deliverable,
  FileAsset,
  Invoice,
  Project,
  StudioState,
  TeamMember,
  VideoJob,
  VideoStatus,
} from "./types";

const USER_KEY = "akaai-desk-user";

type StudioContextValue = {
  state: StudioState;
  ready: boolean;
  live: boolean;
  setCurrentUser: (id: string) => void;
  upsertCompany: (row: Omit<Company, "id"> & { id?: string }) => string;
  upsertProject: (row: Omit<Project, "id"> & { id?: string }) => string;
  upsertCampaign: (row: Omit<Campaign, "id"> & { id?: string }) => string;
  upsertDeliverable: (row: Omit<Deliverable, "id"> & { id?: string }) => string;
  setDeliverableDone: (id: string, done: boolean) => void;
  upsertInvoice: (row: Omit<Invoice, "id"> & { id?: string }) => string;
  setInvoicePaid: (id: string, paid: boolean) => void;
  upsertPerson: (row: Omit<TeamMember, "id"> & { id?: string }) => string;
  upsertVideoJob: (
    job: Omit<VideoJob, "id" | "sourceFiles" | "finalFiles"> & { id?: string }
  ) => string;
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

function upsertList<T extends { id: string }>(list: T[], row: T) {
  return list.some((x) => x.id === row.id)
    ? list.map((x) => (x.id === row.id ? row : x))
    : [row, ...list];
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
    const userId = localStorage.getItem(USER_KEY) || seedState().currentUserId;

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
        } else throw new Error("offline");
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
      setCurrentUser: (currentUserId) => {
        localStorage.setItem(USER_KEY, currentUserId);
        setState((s) => ({ ...s, currentUserId }));
      },
      upsertCompany: (row) => {
        const next = withId(row, "co");
        patch((s) => ({ ...s, companies: upsertList(s.companies, next) }));
        return next.id;
      },
      upsertProject: (row) => {
        const next = withId(row, "pr");
        patch((s) => ({ ...s, projects: upsertList(s.projects, next) }));
        return next.id;
      },
      upsertCampaign: (row) => {
        const next = withId(row, "ca");
        patch((s) => ({ ...s, campaigns: upsertList(s.campaigns, next) }));
        return next.id;
      },
      upsertDeliverable: (row) => {
        const next = withId(row, "dl");
        patch((s) => ({
          ...s,
          deliverables: upsertList(s.deliverables, next),
        }));
        return next.id;
      },
      setDeliverableDone: (id, done) =>
        patch((s) => ({
          ...s,
          deliverables: s.deliverables.map((d) =>
            d.id === id ? { ...d, done } : d
          ),
        })),
      upsertInvoice: (row) => {
        const next = withId(row, "inv");
        patch((s) => ({ ...s, invoices: upsertList(s.invoices, next) }));
        return next.id;
      },
      setInvoicePaid: (id, paid) =>
        patch((s) => ({
          ...s,
          invoices: s.invoices.map((i) => (i.id === id ? { ...i, paid } : i)),
        })),
      upsertPerson: (row) => {
        const next = withId(row, "tm");
        patch((s) => ({ ...s, team: upsertList(s.team, next) }));
        return next.id;
      },
      upsertVideoJob: (job) => {
        const next = withId(
          { sourceFiles: [], finalFiles: [], ...job },
          "vid"
        );
        patch((s) => ({
          ...s,
          videoJobs: upsertList(s.videoJobs ?? [], next),
        }));
        return next.id;
      },
      setVideoJobStatus: (id, status) =>
        patch((s) => ({
          ...s,
          videoJobs: s.videoJobs.map((j) =>
            j.id === id ? { ...j, status } : j
          ),
        })),
      attachFile: (jobId, file) =>
        patch((s) => ({
          ...s,
          videoJobs: s.videoJobs.map((j) => {
            if (j.id !== jobId) return j;
            const key = file.kind === "final" ? "finalFiles" : "sourceFiles";
            return { ...j, [key]: [...j[key], file] };
          }),
        })),
      removeFile: (jobId, fileId) =>
        patch((s) => ({
          ...s,
          videoJobs: s.videoJobs.map((j) =>
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
        const next = withUser(seedState(), state.currentUserId);
        skipPush.current = false;
        setState(next);
        void push(next);
      },
    }),
    [state, ready, live, patch, push]
  );

  return (
    <StudioContext.Provider value={value}>{children}</StudioContext.Provider>
  );
}

export function useStudio() {
  const ctx = useContext(StudioContext);
  if (!ctx) throw new Error("useStudio must be used inside StudioProvider");
  return ctx;
}
