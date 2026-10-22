# Westminster Heritage Academy website

Next.js 16 · React 19 · PostgreSQL · Tailwind CSS 4

The public website and the administrator area are **separate**. Visitors never see an admin button, link or sign-in form. Staff go directly to `/admin`.

## Run it

```bash
cp .env.example .env.local      # then edit the values
npm install
npm run dev                     # http://localhost:3001
```

Tables and first-run content are created automatically on first start. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env.local` first so your own administrator is created. In development, if they are blank, a random password is printed in the terminal.

Production: `npm run build && npm start`. `SESSION_SECRET` (32+ characters) and `SITE_URL` are required.

## Administrator area (`/admin`)

| Section | What it does |
|---|---|
| Dashboard | Counts, storage used, latest uploads and inquiries |
| Photos & videos | Drag-and-drop upload of many files, edit captions and alt text, feature, hide, delete |
| News & events | Write, schedule by date, draft or publish, choose a cover photo |
| Activities | Clubs, teams and programmes |
| Inquiries | Private inbox for contact and admissions forms, with status tracking |
| Site settings | Headline, announcement bar, headmaster message, fees, contact details |
| My account | Profile and password change |

## Where photos and videos live

In PostgreSQL. `media_assets` holds the details (title, event, date, alt text, size, duration). `media_blobs` holds the file bytes, so listing queries stay fast. Files are served from `/media/<id>` with year-long caching and HTTP range support, so videos start quickly and can be scrubbed.

- Photos are resized in the browser to 2400 px (WebP) with a 640 px preview before upload.
- Videos: MP4, WebM or MOV, up to 90 seconds and 40 MB (`MAX_VIDEO_MB`). A preview frame is captured automatically.
- The server checks the real file type from its first bytes, not the file name.
- Back up the database to back up the media.

## Security

- Passwords hashed with scrypt; 12-character minimum; signed HttpOnly session cookie (8 hours); changing the password signs out other devices.
- Sign-in is rate-limited; upload endpoint checks session and request origin.
- Security headers including a Content-Security-Policy; admin pages are `noindex` and not cacheable.
- Contact form: server validation, hidden honeypot field, rate limit, explicit consent.
- The rate limiter is in memory (one server). Use a shared store or CDN rule if you run several servers.

## Before you launch

All wording, figures, names and photos are **sample content**. Replace them in the admin area, then delete the items marked "Sample" in Photos & videos. In particular:
- Replace stock photos with real school photography.
- Enter only figures you can verify (placement rates, records, fees).
- Have `/privacy` reviewed by your legal adviser.
- The Academics, About and Admissions text is in `src/app/(site)/...` and can be edited there.

## Upgrading from the earlier version

The new version uses new tables (`admin_users`, `school_settings`, `media_assets`, `media_blobs`, `news_posts`, `activities`, `inquiries`). Old tables are left untouched and can be dropped once you are satisfied.
