# Relay Desk

The operating desk for a marketing studio. Campaigns, the content calendar, internal deadlines, approvals, and recaps live in one place so the whole team can see what is running and what happens on any given day.

This repo ships with a worked example studio (Harbor & Pine, Solstice Athletics, Brightwell Dental) so you can click around immediately. Rename the studio on the Team page. The desk is **live**: everyone on the same URL sees the same campaigns, calendar, and recaps. Pick yourself with **Working as** — that choice stays on your device.

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

## Share with the team

Work-from-home staff need a public HTTPS URL. From this project, use **Publish** (Vercel) for a permanent link. Until that is connected, you can also run the app on a machine that stays on and expose it:

```bash
npm run build
npm start -- --hostname 0.0.0.0 --port 43211
```

Everyone who opens that URL is on the same live desk (`/api/studio`).

## Stack

Next.js, TypeScript, Tailwind, shadcn/ui. Shared desk data lives on the server (`data/studio.json` via `/api/studio`). Restore the demo from the Team page if you want the sample studio back.
