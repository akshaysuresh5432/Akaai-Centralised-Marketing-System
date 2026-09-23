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
import { campaignStatusLabel } from "@/lib/labels";
import { useStudio } from "@/lib/store";
import {
  CAMPAIGN_STATUSES,
  type CampaignStatus,
  type ComposerKind,
} from "@/lib/types";
import { toast } from "sonner";

const kinds: { id: ComposerKind; label: string }[] = [
  { id: "publish", label: "Publish date" },
  { id: "invoice", label: "Invoice date" },
  { id: "campaign", label: "Campaign" },
  { id: "project", label: "Project" },
  { id: "company", label: "Company" },
  { id: "video", label: "Video job" },
];

export function Composer({
  open,
  onOpenChange,
  defaultKind = "publish",
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add</DialogTitle>
          <DialogDescription>
            Keep it light — a company, a campaign, a publish date, or an invoice.
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
        {kind === "company" && <CompanyForm onDone={() => onOpenChange(false)} />}
        {kind === "project" && <ProjectForm onDone={() => onOpenChange(false)} />}
        {kind === "campaign" && (
          <CampaignForm onDone={() => onOpenChange(false)} />
        )}
        {kind === "publish" && <PublishForm onDone={() => onOpenChange(false)} />}
        {kind === "invoice" && <InvoiceForm onDone={() => onOpenChange(false)} />}
        {kind === "video" && <VideoForm onDone={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function CompanyForm({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const { upsertCompany } = useStudio();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [onboarded, setOnboarded] = useState(todayISO());
  return (
    <form
      className="grid gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return;
        const id = upsertCompany({
          name: name.trim(),
          contact,
          onboarded,
        });
        toast.success("Company onboarded");
        onDone();
        router.push(`/companies/${id}`);
      }}
    >
      <Field label="Company">
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </Field>
      <Field label="Contact">
        <Input value={contact} onChange={(e) => setContact(e.target.value)} />
      </Field>
      <Field label="Onboarded">
        <Input type="date" value={onboarded} onChange={(e) => setOnboarded(e.target.value)} />
      </Field>
      <DialogFooter>
        <Button type="submit">Save company</Button>
      </DialogFooter>
    </form>
  );
}

function ProjectForm({ onDone }: { onDone: () => void }) {
  const { state, upsertProject } = useStudio();
  const [name, setName] = useState("");
  const [companyId, setCompanyId] = useState(state.companies[0]?.id ?? "");
  return (
    <form
      className="grid gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return;
        upsertProject({ name: name.trim(), companyId, current: true });
        toast.success("Project added");
        onDone();
      }}
    >
      <Field label="Project">
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </Field>
      <Field label="Company">
        <select
          className={fieldControl}
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
        >
          {state.companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>
      <DialogFooter>
        <Button type="submit">Save project</Button>
      </DialogFooter>
    </form>
  );
}

function CampaignForm({ onDone }: { onDone: () => void }) {
  const { state, upsertCampaign } = useStudio();
  const current = state.projects.filter((p) => p.current);
  const [name, setName] = useState("");
  const [projectId, setProjectId] = useState(current[0]?.id ?? "");
  const [status, setStatus] = useState<CampaignStatus>("running");
  return (
    <form
      className="grid gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return;
        upsertCampaign({ name: name.trim(), projectId, status });
        toast.success("Campaign running");
        onDone();
      }}
    >
      <Field label="Campaign">
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </Field>
      <Field label="Project">
        <select
          className={fieldControl}
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
        >
          {state.projects.map((p) => (
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
          onChange={(e) => setStatus(e.target.value as CampaignStatus)}
        >
          {CAMPAIGN_STATUSES.map((s) => (
            <option key={s} value={s}>
              {campaignStatusLabel[s]}
            </option>
          ))}
        </select>
      </Field>
      <DialogFooter>
        <Button type="submit">Save campaign</Button>
      </DialogFooter>
    </form>
  );
}

function PublishForm({ onDone }: { onDone: () => void }) {
  const { state, upsertDeliverable } = useStudio();
  const [title, setTitle] = useState("");
  const [companyId, setCompanyId] = useState(state.companies[0]?.id ?? "");
  const [campaignId, setCampaignId] = useState("");
  const [publishDate, setPublishDate] = useState(todayISO());
  const [ownerId, setOwnerId] = useState(state.currentUserId);
  return (
    <form
      className="grid gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim()) return;
        upsertDeliverable({
          title: title.trim(),
          companyId,
          campaignId: campaignId || undefined,
          publishDate,
          ownerId,
          done: false,
        });
        toast.success("Publish date on the calendar");
        onDone();
      }}
    >
      <Field label="What goes out">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Company">
          <select
            className={fieldControl}
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
          >
            {state.companies.map((c) => (
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
        <Field label="Publish date">
          <Input
            type="date"
            value={publishDate}
            onChange={(e) => setPublishDate(e.target.value)}
          />
        </Field>
        <Field label="Who is reminded">
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
      </div>
      <DialogFooter>
        <Button type="submit">Save publish date</Button>
      </DialogFooter>
    </form>
  );
}

function InvoiceForm({ onDone }: { onDone: () => void }) {
  const { state, upsertInvoice } = useStudio();
  const [title, setTitle] = useState("");
  const [companyId, setCompanyId] = useState(state.companies[0]?.id ?? "");
  const [date, setDate] = useState(todayISO());
  const [amount, setAmount] = useState("");
  const [ownerId, setOwnerId] = useState(
    state.team.find((p) => p.role === "Accounts")?.id ?? state.currentUserId
  );
  return (
    <form
      className="grid gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim()) return;
        upsertInvoice({
          title: title.trim(),
          companyId,
          date,
          amount,
          ownerId,
          paid: false,
        });
        toast.success("Invoice reminder on the calendar");
        onDone();
      }}
    >
      <Field label="Invoice">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Company">
          <select
            className={fieldControl}
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
          >
            {state.companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Date to invoice">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="Amount">
          <Input value={amount} onChange={(e) => setAmount(e.target.value)} />
        </Field>
        <Field label="Who is reminded">
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
      </div>
      <DialogFooter>
        <Button type="submit">Save invoice date</Button>
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
    state.team.find((p) => p.role.toLowerCase().includes("post"))?.id ??
    state.currentUserId;
  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");
  const [dueDate, setDueDate] = useState(todayISO());
  return (
    <form
      className="grid gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim()) return;
        const id = upsertVideoJob({
          title: title.trim(),
          brief,
          status: "need-files",
          dueDate,
          platforms: ["Instagram"],
          editorId: editor,
          posterId: poster,
        });
        toast.success("Video job added");
        onDone();
        router.push(`/video/${id}`);
      }}
    >
      <Field label="Video">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </Field>
      <Field label="Note">
        <Textarea value={brief} onChange={(e) => setBrief(e.target.value)} />
      </Field>
      <Field label="Due">
        <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      </Field>
      <DialogFooter>
        <Button type="submit">Save video job</Button>
      </DialogFooter>
    </form>
  );
}
