# Contact form Cloud Function (`sendContactFormEmail`)

The backend that turns a contact/lead form submission into an email. It is the only lead-delivery backend for coffey.codes: both the nav contact form ([`components/ContactForm.tsx`](../../../components/ContactForm.tsx)) and the landing-page lead form ([`components/LeadForm.tsx`](../../../components/LeadForm.tsx)) POST to it through the shared hook [`hooks/useLeadFormSubmit.ts`](../../../hooks/useLeadFormSubmit.ts).

The function source lives only in the Google Cloud console, not in this repo. This document is the version-controlled record of what it is and how to change it safely.

## Deployment facts

| Property | Value |
| --- | --- |
| Project | `coffeywebdev-d0487` |
| Function name / entry point | `sendContactFormEmail` |
| Generation | 1st Gen (Cloud Functions) |
| Region | `us-central1` |
| Runtime | Node.js 22 |
| Memory | 256 MB |
| Trigger | HTTP, unauthenticated |
| Email provider | Mailgun (`mailgun.js`) |
| Recipient | `anthony@coffeywebdev.com` |
| Console | https://console.cloud.google.com/functions/details/us-central1/sendContactFormEmail?env=gen1&project=coffeywebdev-d0487&tab=source |

**Dependencies:** `firebase-functions`, `form-data`, `mailgun.js`, `cors`.

**Environment variables** (managed in the console, never committed):

- `MAIL_GUN_API_KEY` — Mailgun API key.
- `MAILGUN_DOMAIN` — the verified Mailgun sending domain.

## How the site reaches it

The site never calls the Cloud Functions URL directly. A rewrite in [`next.config.js`](../../../next.config.js) proxies `/functions/*` to the function host:

```
/functions/sendContactFormEmail  ->  https://us-central1-coffeywebdev-d0487.cloudfunctions.net/sendContactFormEmail
```

So the client posts to the same origin (`/functions/sendContactFormEmail`), which keeps it first-party and avoids CORS in the browser. The hook sends `Content-Type: application/json` and a JSON body, then fires the GA4 `form_submit` event on a 2xx response.

## Request contract

- **Method:** `POST` (a `PUT` is explicitly rejected with `403`; `cors` handles the preflight).
- **Body (JSON):** the function reads `name`, `email`, and `message`. Other keys sent by the forms (`company`, `phone`, `projectBrief`, `projectStage`, `timeline`, `budget`, `formName`, `consent`) are currently ignored by the backend.
- **Responses:** `200` "Email sent successfully" on success; `500` "Error sending email" on a Mailgun failure; `403` "Forbidden!" for `PUT`.

### Why the site composes a `message`

Because the function only reads `name`/`email`/`message`, the lead form packs every structured field into the `message` string before posting (see `composeLeadMessage` in [`components/LeadForm.tsx`](../../../components/LeadForm.tsx)). This guarantees the full inquiry (brief, company, phone, stage, timeline, budget) is delivered even though the backend does not read those keys individually. If the backend is later changed to read the structured fields directly, the composed message can stay as a redundant fallback or be removed.

## Current source

```js
'use strict';
const functions = require('firebase-functions');
const formData = require('form-data');
const Mailgun = require('mailgun.js');
const cors = require('cors')({
  origin: true,
});

// Initialize Mailgun
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAIL_GUN_API_KEY, // Your new env variable
});

exports.sendContactFormEmail = functions.https.onRequest(async (req, res) => {
  // Method Check
  if (req.method === 'PUT') {
    return res.status(403).send('Forbidden!');
  }

  cors(req, res, async () => {
    const { name, email, message } = req.body;

    const mailOptions = {
      from: `Contact Form <postmaster@${process.env.MAILGUN_DOMAIN}>`,
      to: ['anthony@coffeywebdev.com'],
      subject: `Message from ${name}`,
      html: `<p><strong>${name}</strong> (${email})</p><p>${message}</p>`,
    };

    try {
      // You must provide your verified domain from Mailgun here
      await mg.messages.create(process.env.MAILGUN_DOMAIN, mailOptions);

      res.status(200).send('Email sent successfully');
    } catch (error) {
      console.error('Mailgun Error:', error);
      res.status(500).send('Error sending email');
    }
  });
});
```

### Known limitations

1. **Newlines collapse.** `message` is dropped into a single `<p>`, so the composed lead message (brief, company, phone, and the three dropdowns separated by `\n`) renders on one line in the email.
2. **No source label.** The email subject does not say which landing page produced the lead, even though the form now sends `formName`.
3. **Unescaped input.** `name`, `email`, and `message` are interpolated into HTML without escaping, so a submission can inject markup into the email body.
4. **No reply target.** Replying to the notification email does not go to the lead; their address is only in the body.

## Recommended improved source

Backward compatible: the nav contact form (which sends no `formName`) still works unchanged. Improvements: render newlines as `<br>`, label the source landing page from `formName`, escape HTML, and set `Reply-To` to the lead's email.

```js
'use strict';
const functions = require('firebase-functions');
const formData = require('form-data');
const Mailgun = require('mailgun.js');
const cors = require('cors')({
  origin: true,
});

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAIL_GUN_API_KEY,
});

// Minimal HTML escaping so form input cannot inject markup into the email.
function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

exports.sendContactFormEmail = functions.https.onRequest(async (req, res) => {
  if (req.method === 'PUT') {
    return res.status(403).send('Forbidden!');
  }

  cors(req, res, async () => {
    const { name, email, message, formName } = req.body || {};

    if (!name || !email || !message) {
      return res
        .status(400)
        .send('Missing required fields: name, email, message.');
    }

    const source = formName ? ` (${escapeHtml(formName)})` : '';
    const body = escapeHtml(message).replace(/\n/g, '<br>');

    const mailOptions = {
      from: `Contact Form <postmaster@${process.env.MAILGUN_DOMAIN}>`,
      to: ['anthony@coffeywebdev.com'],
      'h:Reply-To': email,
      subject: `Message from ${name}${source}`,
      html: `<p><strong>${escapeHtml(name)}</strong> (${escapeHtml(
        email,
      )})</p><p>${body}</p>`,
    };

    try {
      await mg.messages.create(process.env.MAILGUN_DOMAIN, mailOptions);
      res.status(200).send('Email sent successfully');
    } catch (error) {
      console.error('Mailgun Error:', error);
      res.status(500).send('Error sending email');
    }
  });
});
```

## Deploying a change

**Option A — Console (recommended, lowest risk).** Open the console source tab (link above), paste the new `index.js`, and click Deploy. Dependencies and environment variables are untouched, so there is no version drift.

**Option B — gcloud CLI.** Deploy from a local directory containing `index.js` and a `package.json` whose dependency versions match what is currently deployed. Do **not** pass `--set-env-vars` (it replaces the whole set); omit env flags so the existing `MAIL_GUN_API_KEY` and `MAILGUN_DOMAIN` are preserved.

```bash
gcloud functions deploy sendContactFormEmail \
  --project=coffeywebdev-d0487 \
  --region=us-central1 \
  --gen2=false \
  --runtime=nodejs22 \
  --trigger-http \
  --allow-unauthenticated \
  --memory=256MB \
  --entry-point=sendContactFormEmail \
  --source=.
```

After either option, verify env vars are still present in the console and run the verification below.

## Verification

1. Submit a real test through `/lp/practical-ai` (or `/contact`) with consent checked.
2. Confirm a `200` response and that the success state renders.
3. Check `anthony@coffeywebdev.com` for the email. With the improved source, the body should show each field on its own line and the subject should include the landing-page `formName`.
4. If nothing arrives, check the function logs in the console for a `Mailgun Error` and confirm `MAIL_GUN_API_KEY` / `MAILGUN_DOMAIN` are set.

## Related

- [`hooks/useLeadFormSubmit.ts`](../../../hooks/useLeadFormSubmit.ts), the shared client submit path
- [`components/LeadForm.tsx`](../../../components/LeadForm.tsx) and [`components/ContactForm.tsx`](../../../components/ContactForm.tsx), the two forms that call it
- [`docs/strategy/ga4-events.md`](../../strategy/ga4-events.md), the `form_submit` event fired on success
- [`next.config.js`](../../../next.config.js), the `/functions/*` rewrite
