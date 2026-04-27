# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: homepage.spec.ts >> Homepage >> final overlay contact link points to /contact and is clickable
- Location: e2e/homepage.spec.ts:136:7

# Error details

```
Test timeout of 120000ms exceeded.
```

```
Error: locator.click: Test timeout of 120000ms exceeded.
Call log:
  - waiting for locator('[class*="introPanel"]').last().locator('a[href="/contact"]')
    - locator resolved to <a href="/contact">→  reach out</a>
  - attempting click action (trial run)
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black transition-transform duration-200 ease-in-out $↵        loading ? 'loading' : '-translate-y-full pointer-events-none'↵      }">…</div> intercepts pointer events
    - retrying click action (trial run)
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black transition-transform duration-200 ease-in-out $↵        loading ? 'loading' : '-translate-y-full pointer-events-none'↵      }">…</div> intercepts pointer events
    - retrying click action (trial run)
      - waiting 100ms
    210 × waiting for element to be visible, enabled and stable
        - element is visible, enabled and stable
        - scrolling into view if needed
        - done scrolling
        - <div class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black transition-transform duration-200 ease-in-out $↵        loading ? 'loading' : '-translate-y-full pointer-events-none'↵      }">…</div> intercepts pointer events
      - retrying click action (trial run)
        - waiting 500ms

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e4]:
    - heading "We use cookies to improve your experience" [level=2] [ref=e5]
    - paragraph [ref=e6]: We use cookies to enhance site navigation, analyze site usage, and assist in marketing efforts.
    - generic [ref=e7]:
      - button "Reject" [ref=e8] [cursor=pointer]:
        - img [ref=e9]
        - text: Reject
      - button "Accept" [ref=e11] [cursor=pointer]:
        - img [ref=e12]
        - text: Accept
  - complementary [ref=e14]:
    - generic [ref=e16]:
      - link "Anthony Coffey logo" [ref=e17] [cursor=pointer]:
        - /url: /
        - img "Anthony Coffey logo" [ref=e18]
      - navigation [ref=e19]:
        - link "home" [ref=e20] [cursor=pointer]:
          - /url: /
          - img [ref=e21]
          - generic [ref=e23]: home
        - link "portfolio" [ref=e24] [cursor=pointer]:
          - /url: /portfolio
          - img [ref=e25]
          - generic [ref=e28]: portfolio
        - link "articles" [ref=e29] [cursor=pointer]:
          - /url: /articles
          - img [ref=e30]
          - generic [ref=e32]: articles
        - link "case studies" [ref=e33] [cursor=pointer]:
          - /url: /case-studies
          - img [ref=e34]
          - generic [ref=e37]: case studies
        - link "contact" [ref=e38] [cursor=pointer]:
          - /url: /contact
          - img [ref=e39]
          - generic [ref=e42]: contact
  - main [ref=e43]:
    - generic [ref=e45]:
      - generic:
        - generic:
          - heading "👨‍🚀 Who Am I?" [level=1]:
            - text: 👨‍🚀
            - text: Who Am I?
          - paragraph: Anthony Coffey - Austin, Texas
          - generic:
            - link "GitHub":
              - /url: https://github.com/anthonycoffey
              - img
            - link "LinkedIn":
              - /url: https://linkedin.com/in/coffeyanthony
              - img
            - link "Linktree Hub":
              - /url: https://linktr.ee/coffeycodes
              - img
        - generic:
          - paragraph:
            - text: Musician.
            - text: Engineer.
            - text: Artist. Maker.
          - paragraph: Creativity is at the core of everything that I love to do.
        - generic:
          - paragraph: I solve big problems.
          - paragraph: The trends and tools change, but my role does not.
        - generic [ref=e49]:
          - paragraph [ref=e50]: Want to know more?
          - paragraph [ref=e51]:
            - link "→ reach out" [ref=e52] [cursor=pointer]:
              - /url: /contact
        - generic [ref=e53]:
          - generic: U7•RΔ9//ZΩ
          - list [ref=e54]:
            - listitem [ref=e55]:
              - generic [ref=e56] [cursor=pointer]: $ whoami
            - listitem [ref=e57]:
              - generic [ref=e58] [cursor=pointer]: system // init
            - listitem [ref=e59]:
              - generic [ref=e60] [cursor=pointer]: Core.exe
            - listitem [ref=e61]:
              - generic [ref=e62] [cursor=pointer]: Connect
        - generic [ref=e63]:
          - button "Scroll to first slide" [ref=e64] [cursor=pointer]:
            - img [ref=e65]
          - generic [ref=e67]: System Ready // Scroll to Explore
      - generic [ref=e70]: LOADING...█
  - button "Open Next.js Dev Tools" [ref=e78] [cursor=pointer]:
    - img [ref=e79]
  - alert [ref=e83]: 👨‍🚀 Who Am I?
```

# Test source

```ts
  41  | 
  42  |   // ── Structure ──────────────────────────────────────────────────────────
  43  | 
  44  |   test('renders the scroll container at full viewport height', async ({ page }) => {
  45  |     const vh = page.viewportSize()!.height
  46  |     const container = page.locator('#scroll-container')
  47  |     await expect(container).toBeVisible()
  48  |     const box = await container.boundingBox()
  49  |     expect(box!.height).toBeCloseTo(vh, -1)
  50  |   })
  51  | 
  52  |   test('canvas element is present (WebGL scene mounted)', async ({ page }) => {
  53  |     await expect(page.locator('canvas')).toBeVisible()
  54  |   })
  55  | 
  56  |   test('page body is 600vh tall (full scroll range intact)', async ({ page }) => {
  57  |     const vh = page.viewportSize()!.height
  58  |     const bodyScrollHeight = await page.evaluate(() => document.body.scrollHeight)
  59  |     expect(bodyScrollHeight).toBeCloseTo(SCROLL_MULTIPLIER * vh, -2)
  60  |   })
  61  | 
  62  |   // ── Overlay visibility at rest ─────────────────────────────────────────
  63  | 
  64  |   test('no overlay panels have the visible class before scrolling', async ({ page }) => {
  65  |     await expect(panels.intro(page)).not.toHaveClass(isShowing)
  66  |     await expect(panels.final(page)).not.toHaveClass(isShowing)
  67  |     await expect(panels.about(page)).not.toHaveClass(isShowing)
  68  |     await expect(panels.craft(page)).not.toHaveClass(isShowing)
  69  |   })
  70  | 
  71  |   // ── Intro overlay (progress 0.15–0.35) ────────────────────────────────
  72  | 
  73  |   test('intro overlay panel becomes visible when scrolled into range (~25%)', async ({ page }) => {
  74  |     await scrollTo(page, 0.25)
  75  |     await expect(panels.intro(page)).toHaveClass(isShowing)
  76  |     await expect(panels.intro(page)).toContainText('Who Am I?')
  77  |     await expect(panels.intro(page)).toContainText('Anthony Coffey - Austin, Texas')
  78  |   })
  79  | 
  80  |   test('intro overlay social links are present and correctly labelled', async ({ page }) => {
  81  |     await scrollTo(page, 0.25)
  82  |     await expect(panels.intro(page)).toHaveClass(isShowing)
  83  |     await expect(page.getByRole('link', { name: 'GitHub' })).toBeTruthy()
  84  |     await expect(page.getByRole('link', { name: 'LinkedIn' })).toBeTruthy()
  85  |     await expect(page.getByRole('link', { name: 'Linktree Hub' })).toBeTruthy()
  86  |   })
  87  | 
  88  |   // ── About overlay (progress 0.35–0.52) ────────────────────────────────
  89  | 
  90  |   test('about overlay panel becomes visible when scrolled into range (~44%)', async ({ page }) => {
  91  |     await scrollTo(page, 0.44)
  92  |     await expect(panels.about(page)).toHaveClass(isShowing)
  93  |     await expect(panels.about(page)).toContainText('Musician.')
  94  |     await expect(panels.about(page)).toContainText('Creativity is at the core of everything that I love to do.')
  95  |   })
  96  | 
  97  |   test('intro overlay panel is hidden once scrolled past its range', async ({ page }) => {
  98  |     await scrollTo(page, 0.44)
  99  |     await expect(panels.about(page)).toHaveClass(isShowing)
  100 |     await expect(panels.intro(page)).not.toHaveClass(isShowing)
  101 |   })
  102 | 
  103 |   // ── Craft overlay (progress 0.52–0.68) ────────────────────────────────
  104 | 
  105 |   test('craft overlay panel becomes visible when scrolled into range (~60%)', async ({ page }) => {
  106 |     await scrollTo(page, 0.60)
  107 |     await expect(panels.craft(page)).toHaveClass(isShowing)
  108 |     await expect(panels.craft(page)).toContainText('I solve big problems.')
  109 |     await expect(panels.craft(page)).toContainText('The trends and tools change, but my role does not.')
  110 |   })
  111 | 
  112 |   test('about overlay panel is hidden once scrolled past its range', async ({ page }) => {
  113 |     await scrollTo(page, 0.60)
  114 |     await expect(panels.craft(page)).toHaveClass(isShowing)
  115 |     await expect(panels.about(page)).not.toHaveClass(isShowing)
  116 |   })
  117 | 
  118 |   // ── Silent zone (progress 0.68–0.82) — no overlays ───────────────────
  119 | 
  120 |   test('no overlay panel has the visible class in the silent zone (~75%)', async ({ page }) => {
  121 |     await scrollTo(page, 0.75)
  122 |     await expect(panels.intro(page)).not.toHaveClass(isShowing)
  123 |     await expect(panels.about(page)).not.toHaveClass(isShowing)
  124 |     await expect(panels.craft(page)).not.toHaveClass(isShowing)
  125 |     await expect(panels.final(page)).not.toHaveClass(isShowing)
  126 |   })
  127 | 
  128 |   // ── FinalOverlay (progress 0.82–1.00) ───────────────────────────────────
  129 | 
  130 |   test('final overlay panel becomes visible when scrolled into range (~91%)', async ({ page }) => {
  131 |     await scrollTo(page, 0.91)
  132 |     await expect(panels.final(page)).toHaveClass(isShowing)
  133 |     await expect(panels.final(page)).toContainText('Want to know more?')
  134 |   })
  135 | 
  136 |   test('final overlay contact link points to /contact and is clickable', async ({ page }) => {
  137 |     await scrollTo(page, 0.91)
  138 |     await expect(panels.final(page)).toHaveClass(isShowing)
  139 |     const link = panels.final(page).locator('a[href="/contact"]')
  140 |     await expect(link).toHaveAttribute('href', '/contact')
> 141 |     await link.click({ trial: true })
      |                ^ Error: locator.click: Test timeout of 120000ms exceeded.
  142 |   })
  143 | 
  144 |   // ── ToC Overlay (progress 0–1.0) ────────────────────────────────────────
  145 | 
  146 |   test('Table of Contents container is present and interactive', async ({ page }) => {
  147 |     // The ToC Container should always be visible/present
  148 |     const toc = page.locator('[class*="tocContainer"]')
  149 |     await expect(toc).toBeVisible()
  150 |     await expect(toc).toContainText('U7•RΔ9//ZΩ')
  151 |   })
  152 | 
  153 |   test('Scroll prompts appear at start and end of page', async ({ page }) => {
  154 |     // At top (start)
  155 |     const promptContainer = page.locator('[class*="scrollPromptContainer"]')
  156 |     await expect(promptContainer).toHaveClass(isShowing)
  157 |     await expect(promptContainer).toContainText('System Ready // Scroll to Explore')
  158 |     
  159 |     // Scroll past 0.1, prompt should hide
  160 |     await scrollTo(page, 0.25)
  161 |     await expect(promptContainer).not.toHaveClass(isShowing)
  162 | 
  163 |     // Scroll to very bottom, prompt should reverse
  164 |     await scrollTo(page, 0.98)
  165 |     await expect(promptContainer).toHaveClass(isShowing)
  166 |     await expect(promptContainer).toContainText('SCROLL TO TOP')
  167 |   })
  168 | })
  169 | 
```