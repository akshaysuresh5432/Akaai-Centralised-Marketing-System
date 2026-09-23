# Akaai Spaces desk

The operating desk for **Akaai Spaces**. Campaigns, video handoff, the calendar, deadlines, and recaps live in one place so the studio — including work-from-home staff — can see what is running.

The desk is **live**: everyone on the same URL sees the same work. Pick yourself with **Working as**.

## Video handoff

1. Anyone uploads raw footage on a video job.
2. The video editor (Aisha in the sample roster) downloads it, cuts, and uploads the final.
3. Posting & scheduling (Sam) downloads the final and puts it on Instagram, TikTok, YouTube, and the rest.

## What else it covers

- **Today** — run of show plus your video jobs
- **Calendar** — publishes and due dates
- **Campaigns** — planning through in-market, with timelines
- **Work** — to do / doing / blocked / done
- **Approvals**, **Recaps**, **Clients**, **Team**

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:43211](http://localhost:43211).

## Deploy on Netlify (staff URL)

The GitHub repo is connected for Netlify:

https://github.com/akshaysuresh5432/Akaai-Centralised-Marketing-System

In Netlify: **Add new site → Import from Git → GitHub → Akaai-Centralised-Marketing-System**.

Build settings (also in `netlify.toml`):

- Build command: `npm run build`
- Publish directory: `.next`
- Node: 22

Every push to `main` rebuilds the site. Send staff the `*.netlify.app` URL. They set **Working as** to their name.

On Netlify, video files must stay under **45 MB** each. Larger cuts: compress or split before upload.

