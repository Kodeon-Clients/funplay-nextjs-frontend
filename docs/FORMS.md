# Website forms

All forms on the site post to Next.js route handlers under `app/api/`. They replace the PHP
scripts in the old `email-templates/` folder. Every handler is POST only, runs on the Node.js
runtime, never caches (`dynamic = "force-dynamic"`), and always answers with JSON:

```json
{ "ok": true, "message": "...", "redirect": "/thank-you.html", "step": "verify", "download": "/files/..." }
```

`message`, `redirect`, `step` and `download` are only present when relevant. Errors come back as
`{ "ok": false, "message": "<friendly text>" }` with a 4xx/5xx status; the message is shown to
the visitor under the form.

## How the client side works

`lib/behaviors.ts` (`forms()`) handles every `<form data-fp-form="<kind>">`. Forms stored in
`content/` that used to point at a PHP script are rewritten to `/api/<kind>` by
`lib/render.tsx`. On submit it:

1. validates fields (required, email, 10-digit phone, min length, CV type and size);
2. builds `FormData` from the form (file inputs included, so the career form is sent as
   `multipart/form-data`), adds `page_url` and, when reCAPTCHA is on, `g-recaptcha-response`;
3. posts to `/api/<kind>` and follows `redirect`, or shows `message`.

Every form carries a hidden honeypot input named `website`. If it is filled in, the server
pretends to succeed and sends nothing.

## The forms

| Form | Where | Route | Fields | Result |
| --- | --- | --- | --- | --- |
| Enquiry / quote | Contact popup, contact page, landing pages | `POST /api/contact` | name, email, phone (10 digits), location, state, customerType, comment (max 300), source; landing pages may add typeOfProject, companyname, institutionname | Email to LEAD_RECIPIENT, then redirect to `/thank-you.html` |
| Job application | `/careers/*` pages | `POST /api/career` | name, email, phone, title (hidden, the position), career-cv-resume-file | Email with the CV attached, then redirect to `/thank-you.html` |
| Newsletter | Footer | `POST /api/newsletter` | email | Added to Mailchimp (if configured) and emailed to LEAD_RECIPIENT; success message in place |
| Catalogue download | Homepage popup (`components/DownloadPopup.tsx`) | `POST /api/download` | see below | Verified lead emailed to LEAD_RECIPIENT, visitor gets the PDF link |

### Career form and CVs

- Accepted: PDF, DOC, DOCX, up to 5 MB. The server checks the file's first bytes (not the
  file name or the browser's MIME type) and rejects anything else.
- The CV is attached to the lead email and never written to disk or stored anywhere.
- **Vercel limit:** serverless functions accept request bodies up to about 4.5 MB. A CV between
  roughly 4.4 and 5 MB is rejected by Vercel before our code runs; the visitor sees "Your
  submission is too large. Please attach a smaller file." If this becomes a problem, switch the
  upload to direct-to-storage (for example Vercel Blob) and email a link instead.

### Catalogue download (homepage popup)

The popup appears about one second after the homepage has loaded, once per browser session
(remembered in `sessionStorage`; if storage is blocked it may show again on the next visit).
Escape, the close button or a click on the dark background closes it.

1. **Request** (`step=request`): name, email, phone, location, state, customerType, comment.
   The server emails a 6-digit code to the visitor and sets an httpOnly, signed cookie
   `fp_dl` (path `/api/download`, 10 minutes). Response: `{ ok: true, step: "verify" }`.
2. **Verify** (`step=verify`, `code`): the code is checked against the cookie (max 5 wrong
   tries, then a new code is needed). On success the lead is emailed to LEAD_RECIPIENT, the
   cookie is cleared and the response is `{ ok: true, download: "/files/Funplay-Originals.pdf" }`.
   The popup then shows a **Download Now** link and pushes a `catalogue_download_verified`
   event to the GTM `dataLayer`.

The old PHP version had every lead recipient commented out, so catalogue leads were lost.
They now arrive at LEAD_RECIPIENT with the email marked "(verified)".

## Protection built in

- **Size caps:** contact and download 32 KB, newsletter 16 KB, career 5 MB + 64 KB.
- **Rate limits (per IP, per server instance):** contact and newsletter 5 per 10 minutes,
  career 3 per 10 minutes, download codes 3 per IP and 3 per email address per 10 minutes,
  code checks 10 per 10 minutes. These are in-memory and best effort on Vercel; use the Vercel
  Firewall if stronger limits are needed.
- **Origin check:** posts from other websites are refused (add extra domains in ALLOWED_ORIGINS).
- **Honeypot** (`website`) and optional **reCAPTCHA v3** (score 0.5 or higher, action must
  match the form kind). If Google cannot be reached the check is skipped so leads are not lost.
- Input is normalised and length-capped; email bodies are HTML-escaped; no IP addresses are
  emailed or stored.

## Vercel environment variables

Set these in Vercel > Project > Settings > Environment Variables (Production, and Preview if you
want working forms on preview deployments). `.env.example` lists the same names.

| Variable | Required | Purpose |
| --- | --- | --- |
| `MAILGUN_API_KEY` | Yes | Mailgun private API key |
| `MAILGUN_DOMAIN` | Yes | Verified Mailgun sending domain |
| `MAILGUN_REGION` | No | `us` (default) or `eu` |
| `MAIL_FROM` | Recommended | Sender, on the Mailgun domain. Default `FunPlay Website <webmaster@funplaysystems.com>` |
| `LEAD_RECIPIENT` | No | Lead inbox. Default `marketing@funplaysystems.com` |
| `LEAD_BCC` | No | Comma-separated BCC for lead emails |
| `VERIFY_SECRET` | Yes, for the catalogue popup | 32+ random characters (`openssl rand -base64 48`) |
| `CATALOGUE_URL` | No | Catalogue link after verification. Default `/files/Funplay-Originals.pdf` |
| `MAILCHIMP_API_KEY` | No | Mailchimp key with datacenter suffix (`...-us21`) |
| `MAILCHIMP_LIST_ID` | No | Mailchimp audience ID |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | No | reCAPTCHA v3 site key (public; change needs a redeploy) |
| `RECAPTCHA_SECRET_KEY` | No | reCAPTCHA v3 secret. Set together with the site key |
| `ALLOWED_ORIGINS` | No | Extra origins allowed to post to the API |

Without Mailgun settings the forms answer "temporarily unavailable" (HTTP 503) in production.
Without `VERIFY_SECRET` the catalogue popup answers the same. If only one of the two reCAPTCHA
keys is set: site key alone does nothing on the server; secret alone makes every form fail, so
always set both or neither.

## Testing

### Locally

1. `cp .env.example .env.local` and leave the Mailgun values empty, but set
   `VERIFY_SECRET` to any 32+ character string.
2. `npm run dev` and open http://localhost:3000.
3. In `next dev` without Mailgun, emails are printed to the terminal instead of sent, including
   the 6-digit catalogue code, so every flow can be tested end to end.
4. To send real email locally, fill in the Mailgun values (use a sandbox domain or set
   `LEAD_RECIPIENT` to your own address).

### Manually with curl (against `npm run dev`)

```bash
# contact
curl -s -X POST http://localhost:3000/api/contact \
  -F name="Test User" -F email=test@example.com -F phone=9876543210 \
  -F location=Mumbai -F state=Maharashtra -F customerType=School -F comment="Test enquiry"

# newsletter
curl -s -X POST http://localhost:3000/api/newsletter -F email=test@example.com

# career (with a real PDF)
curl -s -X POST http://localhost:3000/api/career \
  -F name="Test User" -F email=test@example.com -F phone=9876543210 \
  -F title="Design Engineer (SolidWorks)" -F career-cv-resume-file=@/path/to/cv.pdf

# catalogue download: request a code (cookie saved), then verify it
curl -s -c /tmp/fp.jar -X POST http://localhost:3000/api/download -F step=request \
  -F name="Test User" -F email=test@example.com -F phone=9876543210 -F location=Mumbai \
  -F state=Maharashtra -F customerType=School -F comment="Catalogue please"
curl -s -b /tmp/fp.jar -X POST http://localhost:3000/api/download -F step=verify -F code=123456
```

Things worth checking: a wrong phone number or a `.txt` renamed to `.pdf` is rejected with a
friendly message; filling the `website` field returns `ok` but sends nothing; a GET to any
`/api/*` form route returns 405; five wrong codes in a row require a new code.

### After deploying to Vercel

1. Submit each form once on the live site with a real address and confirm the email arrives at
   LEAD_RECIPIENT (check spam the first time, and Mailgun > Logs if nothing arrives).
2. Open the homepage in a private window to see the catalogue popup, complete both steps and
   confirm the PDF downloads and the "Catalogue download" lead email arrives.
3. Apply for a job with a small PDF and confirm the CV is attached.
4. Check Vercel > Logs for lines starting with `[forms]` if anything fails.
