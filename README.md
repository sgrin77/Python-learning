# Lucas's Python Game Lab 🎮🐍

A browser-based Python learning app for Lucas, focused on the path to making
video games. Runs 100% in the browser using [Pyodide](https://pyodide.org)
(Python compiled to WebAssembly) — no install, no backend.

## What it does

- **15 lessons** progressing from `print()` to animated bouncing-ball games:
  Hello World → variables → math → strings → input → if/else → loops → lists →
  functions → number-guessing game → text adventure → drawing → animation →
  bouncing ball → "what's next" project.
- **Live Python editor** with run button. Output and errors appear inline.
- **Game canvas** that lessons can draw to (rectangles, circles, text, animation).
- **Progress tracker**: counts sessions per week, current streak, lessons completed,
  total coding time.
- **Parent dashboard** (`parent.html`) that shows the weekly stats, calendar,
  session log, and one-click email summary.

## Run it

It's a static site. Three options:

### 1. Open it directly
Just open `index.html` in a modern browser (Chrome, Edge, Safari, Firefox).
Pyodide loads from a CDN, so the first run needs internet.

### 2. Local dev server (recommended)
```bash
cd Python-learning
python3 -m http.server 8000
# then visit http://localhost:8000
```

### 3. Host free on GitHub Pages
1. Push this repo to GitHub.
2. In the repo settings → Pages, set source = `main` branch (root).
3. Wait a minute, then visit the URL GitHub gives you (e.g.
   `https://yourname.github.io/Python-learning/`).
4. Bookmark it on Lucas's browser.

## How tracking works

Progress is stored in **localStorage on the browser Lucas uses**. There's no
account and no backend.

- A "session" is logged the first time he runs code on a given lesson on a
  given day. (So clicking Run a hundred times in one sitting = one session.)
- Streak = consecutive days with at least one session.
- Weekly goal defaults to 3 sessions/week, configurable in the parent view.

> ⚠️ Because data lives in the browser, use the same browser/profile each time
> for the streak to stay accurate. If Lucas codes on multiple devices, each
> tracks independently.

## How parent updates work

Open `parent.html` (or click "Parent View" from the main app). You'll see:

- This week's progress
- Streak, lessons completed, total minutes
- 12-week activity calendar
- Full session log
- A pre-filled summary you can:
  - **Email** to yourself (one click — uses your default mail app via `mailto:`)
  - **Copy** to paste anywhere
  - **Download** as a .txt file

### Setting up automatic weekly emails (optional)

Since this is a static app, there's no built-in scheduler. Easiest options:

- **Calendar reminder**: add a recurring Sunday calendar event to "open the
  parent dashboard and click Email summary." 30 seconds, zero setup.
- **Browser bookmark + reminder**: bookmark `parent.html#summary` and set a
  weekly phone reminder.
- **Automate with a cloud service**: if you want fully-automatic, you'd need
  to host the data. The current app is intentionally backend-free for privacy
  and simplicity. If you'd like that built, ask Claude to add a backend.

## File map

```
index.html         Main learning app
parent.html        Parent dashboard
css/styles.css     All styles
js/lessons.js      Lesson content (edit to add lessons!)
js/runner.js       Pyodide integration + canvas helper + animate()
js/tracker.js      Progress tracking (localStorage)
js/app.js          Main app glue
js/parent.js       Parent dashboard glue
```

## Adding more lessons

Open `js/lessons.js` and append a new object to the `LESSONS` array:

```js
{
  id: "unique-string",
  title: "Lesson Title",
  emoji: "🚀",
  body: `<h2>Lesson body in HTML</h2><p>...</p>`,
  starter: `# starter code\nprint("hi")`,
  challenge: "Optional bonus challenge text.",
  showCanvas: false  // true if the lesson uses the game canvas
}
```

## Privacy

No analytics, no servers, no accounts. Everything stays in the browser.
Pyodide is loaded from `cdn.jsdelivr.net` — that's the only third-party request.

---

Made for Lucas. Keep coding 3 times a week and you'll be making real games
before you know it!
