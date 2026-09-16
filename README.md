# Relay Desk

The operating desk for a marketing studio. Campaigns, the content calendar, internal deadlines, approvals, and recaps live in one place so the whole team can see what is running and what happens on any given day.

This repo ships with a worked example studio (Harbor & Pine, Solstice Athletics, Brightwell Dental) so you can click around immediately. Rename the studio on the Team page. Everything is saved in the browser — no login, no database.

## What it covers

- **Today** — run of show: publishes, deadlines, campaign marks, your work, overdue items, close-of-day recap
- **Calendar** — month and week views of every go-live and due date
- **Campaigns** — planning through in-market, with a timeline of milestones, assets, work, and recaps
- **Work** — kanban for the floor (to do, doing, blocked, done)
- **Approvals** — internal and client review queue
- **Recaps** — daily close, weekly, campaign, and client meeting notes
- **Clients** — the companies you market, with brand notes
- **Team** — roster and workload; switch “Working as” to see another person’s desk

Use **Add** to create a campaign, asset, task, milestone, recap, client, or teammate.

## Run locally

```bash
npm install
npm run dev -- --port 43211
```

Open [http://localhost:43211](http://localhost:43211).

## Stack

Next.js, TypeScript, Tailwind, shadcn/ui. Data is local to the browser (`localStorage`). Restore the demo from the Team page if you want the sample studio back.
