# Entity establishment for "Anthony Coffey"

**Drafted:** 2026-05-11
**Related spec:** SPEC-016 nice-to-have (Wikidata entry)
**Status:** prep complete; submission is user-side action

## Why this doc exists

The Q2 audit identified that the branded query `"anthony coffey"` ranks at position 14.5 on the homepage with 99 impressions and **0 clicks**. The most likely diagnosis: Google's Knowledge Graph doesn't treat "Anthony Coffey, the software engineer in Austin" as a distinct entity. Multiple people share the name; the SERP is ambiguous.

SPEC-016's nice-to-have was to create a Wikidata entry. This doc drafts that entry and notes two parallel paths because Wikidata may reject the submission on notability grounds.

## Path A: Wikidata entry (try first)

### Notability concern

Wikidata's notability rules require items to either (a) have a sitelink to a Wikipedia article, (b) refer to an instance of a clearly identifiable entity that can be described using serious and publicly available references, or (c) fulfill some structural need.

A solo developer without significant press coverage often does not pass criterion (b). Mitigations:
- Cite the YouTube channel, GitHub profile, conference talks, or open-source projects as references.
- Link to coffey.codes as a primary source (acceptable for verifying identity claims).
- If submission is rejected, fall back to Path B without delay.

### Draft entry content

To submit at https://www.wikidata.org/wiki/Special:NewItem :

**Label (English):** `Anthony Coffey`

**Description (English):** `American software engineer and AI consultant based in Austin, Texas`

**Aliases:** `Coffey`, `Anthony J. Coffey` (only if the user wants to include the middle initial)

**Statements (claims to add via "Add statement"):**

| Property | Value | Reference URL |
| --- | --- | --- |
| instance of (P31) | human (Q5) | n/a |
| sex or gender (P21) | male (Q6581097) | (if comfortable) |
| country of citizenship (P27) | United States of America (Q30) | https://coffey.codes |
| given name (P735) | Anthony (Q1138571) | n/a |
| family name (P734) | Coffey (Q5141115) | n/a |
| occupation (P106) | software engineer (Q82594) | https://coffey.codes |
| occupation (P106) | web developer (Q3589290) | https://coffey.codes |
| occupation (P106) | musician (Q639669) | https://coffey.codes (the layout-level Person schema asserts this) |
| residence (P551) | Austin (Q16559) | https://coffey.codes/contact |
| official website (P856) | https://coffey.codes | n/a (URL is its own reference) |
| GitHub username (P2037) | anthonycoffey | https://github.com/anthonycoffey |
| LinkedIn personal profile ID (P6634) | coffeyanthony | https://linkedin.com/in/coffeyanthony |
| YouTube channel ID (P2397) | (the channel ID for @coffeycodes; user needs to look this up) | https://www.youtube.com/@coffeycodes |
| Linktree username (P11079) | coffeycodes | https://linktr.ee/coffeycodes |
| date of birth (P569) | (user-supplied, if comfortable) | n/a |

**Submission steps:**

1. Visit https://www.wikidata.org/wiki/Special:NewItem (sign in first, create an account if needed)
2. Enter the Label, Description, and Aliases as above
3. Click "Create"
4. On the new item page, click "Add statement" and add each property + value from the table
5. For each statement, click "Add reference" and paste the relevant URL
6. Wait. Wikidata may flag the entry for review. If reviewers ask for clarification, respond with the references and additional context.

### What if Wikidata rejects

Don't argue notability. Move to Path B.

## Path B: Strengthen owned-entity signals (always do this regardless of A)

Wikidata is one signal among many. Google's Knowledge Graph also consumes:

1. **Person schema on the site**: already in place at [app/layout.tsx](app/layout.tsx) and present in every page's JSON-LD via the layout. ✅
2. **Person.sameAs across owned profiles**: already covers GitHub, LinkedIn, Linktr.ee. ✅
3. **Organization.sameAs on the publisher block**: added in the same PR as this doc. ✅
4. **Author bylines on articles**: Article.author with name and url, present on every article. ✅
5. **An About page that markup-asserts the entity**: partial. The homepage has the Person schema but no dedicated `/about` page. A future small spec could add one with rich BlogPosting-style author metadata.
6. **Cross-platform identity coherence**: same name, photo, bio, locale on every owned surface. Mostly done; double-check Linktr.ee, GitHub bio, LinkedIn headline all match the canonical "AI consultant and software engineer in Austin, TX" framing.

Once Path B is solid, Google's entity-disambiguation algorithm has enough signal to bind "Anthony Coffey, the software engineer in Austin" as a coherent entity even without Wikidata.

## Measurement

Re-check the branded query at the next quarterly audit:
- `"anthony coffey"` impressions, position, CTR on the homepage
- Whether the Knowledge Panel appears for the query (manual SERP check)
- Whether the homepage moves from position 14.5 toward position 1-3 over 60-90 days

If the position doesn't move, the SERP is genuinely contested (multiple Anthony Coffeys with similar entity footprints) and the realistic ceiling is "ranking somewhere on page 1 alongside the others, not in a Knowledge Panel."
