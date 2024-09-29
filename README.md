# Portfolio Blog Starter

New portfolio site with better file architecture, smaller bundle and faster compile times!

---

This is a portfolio site template complete with a blog. Includes:

- MDX and Markdown support
- Optimized for SEO (sitemap, robots, JSON-LD schema)
- RSS Feed
- Dynamic OG images
- Syntax highlighting
- Tailwind v4
- Vercel Speed Insights / Web Analytics
- Geist font

```bash
pnpm create next-app --example https://github.com/vercel/examples/tree/main/solutions/blog articles
```

Then, run Next.js in development mode:

```bash
pnpm dev
```

Deploy it to the cloud with [Vercel](https://vercel.com/templates) ([Documentation](https://nextjs.org/docs/app/building-your-application/deploying)).


#### Sentry Error Reporting

To report errors to Sentry, you need to initialize Sentry in your project and then use the `captureException` method to log errors. Below is an example of how to do this:

```typescript
import * as Sentry from "@sentry/nextjs";


// Capture an exception
Sentry.captureException(new Error("This is a reported error."));
```