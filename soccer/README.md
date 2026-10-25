# Keeper & Striker Log

A phone app for tracking a young player who plays both **goalkeeper** and
**striker**. After each game you log the score, saves, shots, where goals went
in, and the mistakes you noticed. The app then picks drills that target those
mistakes, and you log his drill scores to see him improve.

It is an installable web app: you add it to your iPhone home screen from
Safari, and it opens full screen with its own icon, like any other app. It
works offline at the field. There is no App Store, no account, and no cost.

## What's in it

- **More than one player**: add each child with their birth year. Each has
  their own games, training, goals and progress; switch with the name chips at
  the top. Drills, game logging and Board moves adjust to each child's age:
  - **Ages 5 to 8**: fun practice games (Red Light Green Light, Shark Attack,
    Tail Tag and more), a simpler game log with "things to practice" instead of
    mistakes, and fun and effort ratings.
  - **Ages 9 and up**: the full keeper and striker drills and game stats.
- **6-week speed program** (ages 9 to 14): two 20-minute sessions a week, with
  a 20 m sprint test in weeks 1, 4 and 6. "Start this session" on Home loads
  that session's drills and reps into a training log.

- **Home**: this week's training count, last result, and a "Work on this week"
  list built from his top 3 mistakes in the last 3 games, each linked to drills.
- **Games**: a 2-minute game log. Saves, catches, drops, high balls and
  distribution in goal; a tap-the-goal diagram for where goals went in; a
  tap-the-field shot map up front; mistake and "went well" tags; ratings and
  notes.
- **Train**: 24 drills a parent can run with him (steps, coaching cues, and a
  score such as "clean catches out of 20"), plus a training log.
- **Board**: a soccer field to teach moves. Drag players and the ball, draw
  runs (dashed), passes (solid), dribbles (zigzag) and shots (gold), and
  build a move in steps that animate when you press Play. It comes with 9
  ready-made moves (4 for keeper, 5 for striker), each with a coaching note
  per step and links to drills that practice it. Copy one to change it, or
  start from an empty field or a 9v9 lineup.
- **Progress**: save rate and shots on target per game, where goals go in,
  every shot on one map, mistakes trending up or down, and drill score trends.

## One-time setup: put it online (free, GitHub Pages)

1. Merge this branch into `main`.
2. On GitHub, open the repo, then **Settings > Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**,
   pick **main** and **/ (root)**, then **Save**.
4. After a minute or two the app is live at
   `https://sgrin77.github.io/Python-learning/soccer/`

## Install it on an iPhone

1. Open that link in **Safari** (not Chrome; iPhone installs web apps from Safari).
2. Tap the **Share** button, then **Add to Home Screen**, then **Add**.
3. Open **Soccer Log** from the home screen.

Install before you start logging: the home screen app keeps its own data,
separate from the Safari tab.

## Where the data lives

Everything is saved **on the phone only**. Nothing is sent anywhere, and the
public website contains no information about your player.

Because of that, make a backup now and then: **Home > Edit > Back up now**
creates one small file you can save to Files or email to yourself. **Restore a
backup** loads it back, for example on a new phone. The app reminds you once a
month after you have a few entries.

## Updating

Push changes to `main`. The installed app picks up the new version the next
time it is opened with a connection (it checks in the background and switches
over on the following launch).

## Files

```
soccer/
  index.html            App shell and iPhone install settings
  app.css               Styles (light and dark mode)
  app.js                Screens, drills, mistake tags, board, storage, backup
  plays.js              Ready-made moves for the Board tab
  manifest.webmanifest  App name and icons for the home screen
  sw.js                 Offline support
  icons/                Home screen icons
```

To add a drill, append an entry to `DRILLS` in `app.js`. List the mistake ids
it helps with in `fixes` so it shows up in the weekly focus list, and set
`ages` (for example `[9,18]`) so it only shows for players of the right age.
The speed program lives in `PROGRAMS` in `app.js`.

To add a ready-made move, append an entry to `plays.js`. The comment at the
top explains the field coordinates. The easiest way is to build the move on the
Board tab, make a backup, and copy the board out of the backup file.

## A true App Store app later?

This app can be wrapped as a native iOS app with
[Capacitor](https://capacitorjs.com/) without rewriting it. That needs a Mac
with Xcode, and an Apple Developer account ($99 a year) to keep it installed
long term or to publish it.
