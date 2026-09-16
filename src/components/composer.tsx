"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Field, fieldControl } from "@/components/field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { todayISO } from "@/lib/dates";
import { useStudio } from "@/lib/store";
import {
  CAMPAIGN_STATUSES,
  CHANNELS,
  CLIENT_STATUSES,
  DELIVERABLE_STATUSES,
  DELIVERABLE_TYPES,
  RECAP_TYPES,
  TASK_PRIORITIES,
  TASK_STATUSES,
  VIDEO_STATUSES,
  type CampaignStatus,
  type Channel,
  type ClientStatus,
  type ComposerKind,
  type DeliverableStatus,
  type DeliverableType,
  type RecapType,
  type TaskPriority,
  type TaskStatus,
  type VideoStatus,
} from "@/lib/types";
import {
  campaignStatusLabel,
  clientStatusLabel,
  deliverableStatusLabel,
  priorityLabel,
  recapTypeLabel,
  taskStatusLabel,
  videoStatusLabel,
} from "@/lib/labels";
import { toast } from "sonner";

const kinds: { id: ComposerKind; label: string }[] = [
  { id: "video", label: "Video job" },
  { id: "task", label: "Task" },
  { id: "deliverable", label: "Publish / asset" },
  { id: "campaign", label: "Campaign" },
  { id: "milestone", label: "Milestone" },
  { id: "recap", label: "Recap" },
  { id: "client", label: "Client" },
  { id: "person", label: "Teammate" },
];

export function Composer({
  open,
  onOpenChange,
  defaultKind = "task",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultKind?: ComposerKind;
}) {
  const [kind, setKind] = useState<ComposerKind>(defaultKind);
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (next) setKind(defaultKind);
      }}
    >
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add to the desk</DialogTitle>
          <DialogDescription>
            Tasks, campaigns, video files, recaps — same place for everyone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap gap-1">
          {kinds.map((k) => (
            <Button
              key={k.id}
              type="button"
              size="sm"
              variant={kind === k.id ? "default" : "outline"}
              onClick={() => setKind(k.id)}
            >
              {k.label}
            </Button>
          ))}
        </div>
        {kind === "video" && <VideoForm onDone={() => onOpenChange(false)} />}
        {kind === "task" && <TaskForm onDone={() => onOpenChange(false)} />}
        {kind === "deliverable" && (
          <DeliverableForm onDone={() => onOpenChange(false)} />
        )}
        {kind === "campaign" && (
          <CampaignForm onDone={() => onOpenChange(false)} />
        )}
        {kind === "milestone" && (
          <MilestoneForm onDone={() => onOpenChange(false)} />
        )}
        {kind === "recap" && <RecapForm onDone={() => onOpenChange(false)} />}
        {kind === "client" && <ClientForm onDone={() => onOpenChange(false)} />}
        {kind === "person" && <PersonForm onDone={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function TaskForm({ onDone }: { onDone: () => void }) {
  const { state, upsertTask } = useStudio();
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState(todayISO());
  const [assigneeId, setAssigneeId] = useState(state.currentUserId);
  const [clientId, setClientId] = useState("");
  const [campaignId, setCampaignId] = useState("");

  return (
    <form
      className="grid gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim()) return;
        upsertTask({
          title: title.trim(),
          details,
          status,
          priority,
          dueDate,
          assigneeId,
          clientId: clientId || undefined,
          campaignId: campaignId || undefined,
        });
        toast.success("Task added");
        onDone();
      }}
    >
      <Field label="What needs to happen">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </Field>
      <Field label="Details">
        <Textarea value={details} onChange={(e) => setDetails(e.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Due">
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </Field>
        <Field label="Owner">
          <select
            className={fieldControl}
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
          >
            {state.team.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Priority">
          <select
            className={fieldControl}
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
          >
            {TASK_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {priorityLabel[p]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select
            className={fieldControl}
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
          >
            {TASK_STATUSES.map((p) => (
              <option key={p} value={p}>
                {taskStatusLabel[p]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Client">
          <select
            className={fieldControl}
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
          >
            <option value="">None</option>
            {state.clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Campaign">
          <select
            className={fieldControl}
            value={campaignId}
            onChange={(e) => setCampaignId(e.target.value)}
          >
            <option value="">None</option>
            {state.campaigns
              .filter((c) => !clientId || c.clientId === clientId)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </select>
        </Field>
      </div>
      <DialogFooter>
        <Button type="submit">Save task</Button>
      </DialogFooter>
    </form>
  );
}

function DeliverableForm({ onDone }: { onDone: () => void }) {
  const { state, upsertDeliverable } = useStudio();
  const firstCampaign = state.campaigns[0];
  const [title, setTitle] = useState("");
  const [campaignId, setCampaignId] = useState(firstCampaign?.id ?? "");
  const [type, setType] = useState<DeliverableType>("social post");
  const [channel, setChannel] = useState<Channel>("Instagram");
  const [status, setStatus] = useState<DeliverableStatus>("draft");
  const [assigneeId, setAssigneeId] = useState(state.currentUserId);
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState("10:00");
  const [notes, setNotes] = useState("");
  const campaign = state.campaigns.find((c) => c.id === campaignId);

  return (
    <form
      className="grid gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim() || !campaign) return;
        upsertDeliverable({
          title: title.trim(),
          campaignId,
          clientId: campaign.clientId,
          type,
          channel,
          status,
          assigneeId,
          date,
          time,
          notes,
        });
        toast.success("On the calendar");
        onDone();
      }}
    >
      <Field label="Asset or publish">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Campaign" className="col-span-2">
          <select
            className={fieldControl}
            value={campaignId}
            onChange={(e) => setCampaignId(e.target.value)}
          >
            {state.campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Type">
          <select
            className={fieldControl}
            value={type}
            onChange={(e) => setType(e.target.value as DeliverableType)}
          >
            {DELIVERABLE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Channel">
          <select
            className={fieldControl}
            value={channel}
            onChange={(e) => setChannel(e.target.value as Channel)}
          >
            {CHANNELS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Date">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="Time">
          <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </Field>
        <Field label="Owner">
          <select
            className={fieldControl}
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
          >
            {state.team.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select
            className={fieldControl}
            value={status}
            onChange={(e) => setStatus(e.target.value as DeliverableStatus)}
          >
            {DELIVERABLE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {deliverableStatusLabel[s]}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Notes">
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
      </Field>
      <DialogFooter>
        <Button type="submit">Save to calendar</Button>
      </DialogFooter>
    </form>
  );
}

function CampaignForm({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const { state, upsertCampaign } = useStudio();
  const [name, setName] = useState("");
  const [clientId, setClientId] = useState(state.clients[0]?.id ?? "");
  const [objective, setObjective] = useState("");
  const [status, setStatus] = useState<CampaignStatus>("planning");
  const [startDate, setStartDate] = useState(todayISO());
  const [endDate, setEndDate] = useState(todayISO());
  const [budget, setBudget] = useState("");
  const [kpis, setKpis] = useState("");
  const [ownerId, setOwnerId] = useState(state.currentUserId);
  const [channels, setChannels] = useState<Channel[]>(["Instagram"]);

  return (
    <form
      className="grid gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return;
        const id = upsertCampaign({
          name: name.trim(),
          clientId,
          objective,
          status,
          startDate,
          endDate,
          channels,
          budget,
          kpis,
          ownerId,
        });
        toast.success("Campaign created");
        onDone();
        router.push(`/campaigns/${id}`);
      }}
    >
      <Field label="Campaign name">
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </Field>
      <Field label="Objective">
        <Textarea value={objective} onChange={(e) => setObjective(e.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Client">
          <select
            className={fieldControl}
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
          >
            {state.clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Owner">
          <select
            className={fieldControl}
            value={ownerId}
            onChange={(e) => setOwnerId(e.target.value)}
          >
            {state.team.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Starts">
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </Field>
        <Field label="Ends">
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </Field>
        <Field label="Status">
          <select
            className={fieldControl}
            value={status}
            onChange={(e) => setStatus(e.target.value as CampaignStatus)}
          >
            {CAMPAIGN_STATUSES.map((s) => (
              <option key={s} value={s}>
                {campaignStatusLabel[s]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Budget">
          <Input value={budget} onChange={(e) => setBudget(e.target.value)} />
        </Field>
      </div>
      <Field label="KPIs">
        <Input value={kpis} onChange={(e) => setKpis(e.target.value)} />
      </Field>
      <fieldset className="grid gap-2">
        <legend className="text-sm text-muted-foreground">Channels</legend>
        <div className="flex flex-wrap gap-2">
          {CHANNELS.map((ch) => {
            const on = channels.includes(ch);
            return (
              <button
                key={ch}
                type="button"
                onClick={() =>
                  setChannels((prev) =>
                    on ? prev.filter((c) => c !== ch) : [...prev, ch]
                  )
                }
                className={
                  on
                    ? "rounded-full bg-primary px-2.5 py-1 text-xs text-primary-foreground"
                    : "rounded-full border px-2.5 py-1 text-xs"
                }
              >
                {ch}
              </button>
            );
          })}
        </div>
      </fieldset>
      <DialogFooter>
        <Button type="submit">Create campaign</Button>
      </DialogFooter>
    </form>
  );
}

function MilestoneForm({ onDone }: { onDone: () => void }) {
  const { state, upsertMilestone } = useStudio();
  const [title, setTitle] = useState("");
  const [campaignId, setCampaignId] = useState(state.campaigns[0]?.id ?? "");
  const [date, setDate] = useState(todayISO());

  return (
    <form
      className="grid gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim()) return;
        upsertMilestone({ title: title.trim(), campaignId, date, done: false });
        toast.success("Milestone on the timeline");
        onDone();
      }}
    >
      <Field label="Milestone">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </Field>
      <Field label="Campaign">
        <select
          className={fieldControl}
          value={campaignId}
          onChange={(e) => setCampaignId(e.target.value)}
        >
          {state.campaigns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Date">
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </Field>
      <DialogFooter>
        <Button type="submit">Save milestone</Button>
      </DialogFooter>
    </form>
  );
}

function RecapForm({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const { state, upsertRecap } = useStudio();
  const [title, setTitle] = useState("");
  const [type, setType] = useState<RecapType>("daily-close");
  const [date, setDate] = useState(todayISO());
  const [clientId, setClientId] = useState("");
  const [campaignId, setCampaignId] = useState("");
  const [shipped, setShipped] = useState("");
  const [next, setNext] = useState("");
  const [blockers, setBlockers] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <form
      className="grid gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim()) return;
        const id = upsertRecap({
          title: title.trim(),
          type,
          date,
          authorId: state.currentUserId,
          clientId: clientId || undefined,
          campaignId: campaignId || undefined,
          shipped,
          next,
          blockers,
          notes,
        });
        toast.success("Recap saved");
        onDone();
        router.push(`/recaps/${id}`);
      }}
    >
      <Field label="Title">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Type">
          <select
            className={fieldControl}
            value={type}
            onChange={(e) => setType(e.target.value as RecapType)}
          >
            {RECAP_TYPES.map((t) => (
              <option key={t} value={t}>
                {recapTypeLabel[t]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Date">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="Client">
          <select
            className={fieldControl}
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
          >
            <option value="">Studio-wide</option>
            {state.clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Campaign">
          <select
            className={fieldControl}
            value={campaignId}
            onChange={(e) => setCampaignId(e.target.value)}
          >
            <option value="">None</option>
            {state.campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="What shipped">
        <Textarea value={shipped} onChange={(e) => setShipped(e.target.value)} />
      </Field>
      <Field label="What is next">
        <Textarea value={next} onChange={(e) => setNext(e.target.value)} />
      </Field>
      <Field label="Blockers">
        <Textarea value={blockers} onChange={(e) => setBlockers(e.target.value)} />
      </Field>
      <Field label="Notes">
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
      </Field>
      <DialogFooter>
        <Button type="submit">Save recap</Button>
      </DialogFooter>
    </form>
  );
}

function ClientForm({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const { upsertClient } = useStudio();
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [status, setStatus] = useState<ClientStatus>("active");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [retainer, setRetainer] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <form
      className="grid gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return;
        const id = upsertClient({
          name: name.trim(),
          industry,
          status,
          contactName,
          contactEmail,
          website,
          retainer,
          notes,
        });
        toast.success("Client added");
        onDone();
        router.push(`/clients/${id}`);
      }}
    >
      <Field label="Company">
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Industry">
          <Input value={industry} onChange={(e) => setIndustry(e.target.value)} />
        </Field>
        <Field label="Status">
          <select
            className={fieldControl}
            value={status}
            onChange={(e) => setStatus(e.target.value as ClientStatus)}
          >
            {CLIENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {clientStatusLabel[s]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Contact">
          <Input value={contactName} onChange={(e) => setContactName(e.target.value)} />
        </Field>
        <Field label="Email">
          <Input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
        </Field>
        <Field label="Website">
          <Input value={website} onChange={(e) => setWebsite(e.target.value)} />
        </Field>
        <Field label="Retainer">
          <Input value={retainer} onChange={(e) => setRetainer(e.target.value)} />
        </Field>
      </div>
      <Field label="How we work with them">
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
      </Field>
      <DialogFooter>
        <Button type="submit">Save client</Button>
      </DialogFooter>
    </form>
  );
}

function PersonForm({ onDone }: { onDone: () => void }) {
  const { upsertPerson } = useStudio();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");

  return (
    <form
      className="grid gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return;
        const initials = name
          .split(" ")
          .map((p) => p[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();
        upsertPerson({
          name: name.trim(),
          role,
          email,
          initials,
          color: "#3F4A3A",
        });
        toast.success("Teammate added");
        onDone();
      }}
    >
      <Field label="Name">
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </Field>
      <Field label="Role">
        <Input value={role} onChange={(e) => setRole(e.target.value)} />
      </Field>
      <Field label="Email">
        <Input value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>
      <DialogFooter>
        <Button type="submit">Add to the team</Button>
      </DialogFooter>
    </form>
  );
}

function VideoForm({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const { state, upsertVideoJob } = useStudio();
  const editor =
    state.team.find((p) => p.role.toLowerCase().includes("video"))?.id ??
    state.currentUserId;
  const poster =
    state.team.find((p) => p.role.toLowerCase().includes("posting"))?.id ??
    state.currentUserId;
  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");
  const [clientId, setClientId] = useState(state.clients[0]?.id ?? "");
  const [campaignId, setCampaignId] = useState("");
  const [dueDate, setDueDate] = useState(todayISO());
  const [editorId, setEditorId] = useState(editor);
  const [posterId, setPosterId] = useState(poster);
  const [status, setStatus] = useState<VideoStatus>("need-files");
  const [platforms, setPlatforms] = useState<Channel[]>(["Instagram", "TikTok"]);

  return (
    <form
      className="grid gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim()) return;
        const id = upsertVideoJob({
          title: title.trim(),
          brief,
          clientId: clientId || undefined,
          campaignId: campaignId || undefined,
          status,
          dueDate,
          platforms,
          editorId,
          posterId,
        });
        toast.success("Video job is on the desk");
        onDone();
        router.push(`/video/${id}`);
      }}
    >
      <Field label="What are we cutting">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </Field>
      <Field label="Brief for the editor">
        <Textarea value={brief} onChange={(e) => setBrief(e.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Client">
          <select
            className={fieldControl}
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
          >
            {state.clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Campaign">
          <select
            className={fieldControl}
            value={campaignId}
            onChange={(e) => setCampaignId(e.target.value)}
          >
            <option value="">None</option>
            {state.campaigns
              .filter((c) => !clientId || c.clientId === clientId)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </select>
        </Field>
        <Field label="Due">
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </Field>
        <Field label="Status">
          <select
            className={fieldControl}
            value={status}
            onChange={(e) => setStatus(e.target.value as VideoStatus)}
          >
            {VIDEO_STATUSES.map((s) => (
              <option key={s} value={s}>
                {videoStatusLabel[s]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Editor">
          <select
            className={fieldControl}
            value={editorId}
            onChange={(e) => setEditorId(e.target.value)}
          >
            {state.team.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} · {p.role}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Posts it">
          <select
            className={fieldControl}
            value={posterId}
            onChange={(e) => setPosterId(e.target.value)}
          >
            {state.team.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} · {p.role}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <fieldset className="grid gap-2">
        <legend className="text-sm text-muted-foreground">Goes out on</legend>
        <div className="flex flex-wrap gap-2">
          {CHANNELS.map((ch) => {
            const on = platforms.includes(ch);
            return (
              <button
                key={ch}
                type="button"
                onClick={() =>
                  setPlatforms((prev) =>
                    on ? prev.filter((c) => c !== ch) : [...prev, ch]
                  )
                }
                className={
                  on
                    ? "rounded-full bg-primary px-2.5 py-1 text-xs text-primary-foreground"
                    : "rounded-full border px-2.5 py-1 text-xs"
                }
              >
                {ch}
              </button>
            );
          })}
        </div>
      </fieldset>
      <DialogFooter>
        <Button type="submit">Create video job</Button>
      </DialogFooter>
    </form>
  );
}
