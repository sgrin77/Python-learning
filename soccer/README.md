# Keeper & Striker Log

A phone app for tracking a young player who plays both **goalkeeper** and
**striker**. After each game you log the score, saves, shots, where goals went
in, and the mistakes you noticed. The app then picks drills that target those
mistakes, and you log his drill scores to see him improve.

It is an installable web app: you add it to your iPhone home screen from
Safari, and it opens full screen with its own icon, like any other app. It
works offline at the field. There is no App Store, no account, and no cost.

## What's in it

- **Home**: this week's training count, last result, and a "Work on this week"
  list built from his top 3 mistakes in the last 3 games, each linked to drills.
- **Games**: a 2-minute game log. Saves, catches, drops, high balls and
  distribution in goal; a tap-the-goal diagram for where goals went in; a
  tap-the-field shot map up front; mistake and "went well" tags; ratings and
  notes.
- **Train**: 24 drills a parent can run with him (steps, coaching cues, and a
  score such as "clean catches out of 20"), plus a training log.
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
  app.js                Screens, drills, mistake tags, storage, backup
  manifest.webmanifest  App name and icons for the home screen
  sw.js                 Offline support
  icons/                Home screen icons
```

To add a drill, append an entry to `DRILLS` in `app.js`. List the mistake ids
it helps with in `fixes` so it shows up in the weekly focus list.

## A true App Store app later?

This app can be wrapped as a native iOS app with
[Capacitor](https://capacitorjs.com/) without rewriting it. That needs a Mac
with Xcode, and an Apple Developer account ($99 a year) to keep it installed
long term or to publish it.
