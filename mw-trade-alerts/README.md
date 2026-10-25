# MarketWatch Trade Alerts

Follow one player in a MarketWatch Virtual Stock Exchange game and get an alert
(terminal, phone push, email, Discord/Slack, or desktop pop-up) every time they
**buy, sell, short, or cover**, or **place a limit/stop order**, with a suggested
mirror trade sized for your own portfolio.

Think of it as a security camera pointed at their portfolio page: every couple of
minutes it takes a photo, compares it with the last one, and rings your phone
only when something actually moved.

## What an alert looks like

```
BUY 120 NVDA @ $131.40
The leader bought 120 shares of NVDA at $131.40 (~$15,768.00, 15.1% of their portfolio).
Filled: 10/05/26 10:02a
Your mirror: BUY 57 NVDA

Order placed: LIMIT SELL 100 AAPL @ $185.00
The leader placed an order that has NOT filled yet: LIMIT SELL 100 AAPL @ $185.00.
Your mirror: SELL 47 AAPL as a LIMIT order @ $185.00
```

(Mirror sizes above assume `my_portfolio_value = 50000` against their ~$104k.)

## How it works

```
             every 2 min (market hours) / 15 min (off hours)
                                 |
                                 v
  +-------------------- 1. FETCH (fetch.py) ---------------------+
  |  portfolio page   -> open orders, net worth, export links    |
  |  holdings CSV     -> symbol, shares, long/short              |
  |  transactions CSV -> symbol, Buy/Sell/Short/Cover, shares,   |
  |                      price, date  (page fallback if no CSV)  |
  +--------------------------------------------------------------+
                                 |
                                 v
  +-------------------- 2. PARSE (parse.py) ---------------------+
  |  -> Snapshot(holdings, transactions, orders)                 |
  |  anything unreadable becomes None, never "empty"             |
  +--------------------------------------------------------------+
                                 |
                                 v
  +-------------------- 3. DIFF (diff.py) -----------------------+
  |  compare with state.json (what we saw last time)             |
  |   * new transaction    -> TRADE alert (exact price)          |
  |   * new open order     -> ORDER PLACED (heads-up pre-fill)   |
  |   * shares changed but -> POSITION alert (safety net),       |
  |     no transaction yet    later "Confirmed" with the price   |
  |   * N failed checks    -> "tracker can't see" alert          |
  +--------------------------------------------------------------+
                                 |
                                 v
  +-------------------- 4. ALERT (alerts.py) --------------------+
  |  console | ntfy phone push | email | Discord/Slack | desktop |
  +--------------------------------------------------------------+
```

Three independent signals, like having a receipt, a shopping list, and a pantry
check. The **transaction history** (the receipt) is the main one: it has the
exact action and fill price. **Open orders** (the shopping list) show limit and
stop orders before they fill, which is the only way to get ahead of a trade.
**Holdings** (the pantry) are a backup: if shares change and no receipt shows
up yet, you still hear about it, then get a "Confirmed" follow-up with the price.

Safety rules, because a false "they sold everything" alert is worse than none:

- The first run records everything as history and only sends a "Tracker
  started" summary. You're alerted on what changes after that.
- A page that fails to load, or comes back as a login/captcha page, is treated
  as *unknown* and never compared.
- If the whole portfolio suddenly reads as empty with no sells in the history,
  it waits for a second look before alerting.
- If the tracker goes blind (blocked, site changed), you get an alert saying
  so, and another when it recovers. Silence never secretly means "broken".

## Setup (about 10 minutes)

Needs Python 3.9+ on a computer that stays on during market hours.

```bash
cd mw-trade-alerts
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp config.example.toml config.toml # already points at the portfolio link you gave
```

On Windows, if `.venv\Scripts\activate` says "running scripts is disabled", you can
skip the two `venv` lines entirely: `pip install -r requirements.txt` then installs
into your main Python, which works fine. Use `copy` instead of `cp`.

1. **Check the connection.** This fetches once and prints what it understood,
   without alerting or saving state:

   ```bash
   python -m mwtracker check
   ```

   You should see their portfolio value, cash, holdings and open orders. If
   Transactions says `COULD NOT READ` with "sign-in required", alerts still
   work (from holdings changes, with the price worked out from their cash);
   see [Signing in for exact prices](#signing-in-for-exact-prices) to add the
   exact fills. For anything else, `debug/` holds the raw pages and
   [If MarketWatch blocks you](#if-marketwatch-blocks-you) has fixes.

2. **Turn on phone alerts** (recommended). Install the free **ntfy** app
   (iOS/Android), tap *Subscribe*, and enter a long random topic name. Put the
   same name in `config.toml`:

   ```toml
   [alerts.ntfy]
   enabled = true
   topic = "mw-alerts-something-long-and-random"
   ```

   Email, Discord/Slack webhooks, and desktop pop-ups are in the same file.

3. **Send a test alert** to make sure your phone buzzes:

   ```bash
   python -m mwtracker test-alert
   ```

4. **Start watching:**

   ```bash
   python -m mwtracker run
   ```

## Keeping it running

`run` loops forever. Options for leaving it on:

- **Simplest:** leave the terminal open. On a Mac, `caffeinate -i python -m mwtracker run`
  stops the laptop sleeping.
- **cron / Task Scheduler:** schedule `python -m mwtracker once` every few
  minutes instead. Each call does one check and exits; state lives in `state.json`.
  Example crontab line (weekdays, every 2 minutes, 9am to 4pm in the machine's time zone):
  `*/2 9-16 * * 1-5 cd /path/to/mw-trade-alerts && .venv/bin/python -m mwtracker once`
- **Always-on box:** a Raspberry Pi or small home server works well. Cloud
  servers are more likely to be blocked by MarketWatch's bot protection than a
  home connection.

## Signing in for exact prices

Anyone can see a player's portfolio page, but MarketWatch only serves the
transaction history and CSV exports to signed-in users (HTTP 401). Without them
you still get every buy, sell, short and cover, detected from holdings changes
and priced from the change in their cash. Signing in adds the exact fill price
and time. While signed-out, the tracker only re-tries those pages once an hour.

Sign in through a real browser that the tracker drives:

1. Install Playwright: `pip install playwright`
2. In `config.toml`, under `[fetch]`, set `method = "browser"` and
   `browser = "msedge"` (Windows) or `browser = "chrome"`. This uses the
   browser already on your computer. (Or leave `browser = ""` and run
   `python -m playwright install chromium` to download one.)
3. Run `python -m mwtracker login`, sign in to MarketWatch in the window that
   opens, then press Enter in the terminal. The sign-in is saved in
   `browser-profile/`, separate from your normal browser.
4. Run `python -m mwtracker check` again. Transactions should now be listed.

Your MarketWatch account may need to be a member of the same game to see
another player's history.

## If MarketWatch blocks you

MarketWatch uses bot protection, so plain requests can start getting HTTP 403
or a captcha page. In order of effort:

1. **Slow down:** raise `market_interval_seconds` to 300.
2. **Use a real browser:** follow steps 1 and 2 of
   [Signing in for exact prices](#signing-in-for-exact-prices) (signing in is
   optional for this).
3. **Borrow your browser's cookies:** sign in to MarketWatch in Chrome, open
   DevTools > Network, click the portfolio request, copy the `Cookie` request
   header into `cookie = "..."`. Cookies expire, so this needs redoing now and then.

If the page layout changes, `check` will show `COULD NOT READ`, and `debug/`
holds the raw HTML/CSV so the parsers in `mwtracker/parse.py` can be adjusted.

## Things to know

- **You're always a step behind.** Alerts arrive up to one polling interval
  after the trade, and your fill price will differ from theirs. Open-order alerts
  are the exception: they arrive before the fill.
- **Not every move is a "trade."** Splits or game resets can change share
  counts; those show up as holdings-change alerts without a matching transaction.
- **Market holidays** aren't in the schedule; it just checks at the market-hours
  pace on those days, which is harmless.
- **Play fair.** Check that copying another player is allowed under the game's
  and club's rules, and keep polling gentle (MarketWatch's terms of use restrict
  automated access). The defaults make about 3 small requests every 2 minutes
  during market hours.
- This tool alerts only. It never places trades for you.

## Files

| File | Job |
| --- | --- |
| `mwtracker/fetch.py` | Downloads the portfolio page and CSV exports (`requests` or Playwright) |
| `mwtracker/parse.py` | Turns CSV/HTML into holdings, transactions, and open orders |
| `mwtracker/diff.py` | Compares with last time and decides what's alert-worthy |
| `mwtracker/alerts.py` | Console, ntfy, email, webhook, and desktop notifiers |
| `mwtracker/schedule.py` | Market-hours aware polling and backoff |
| `mwtracker/tracker.py` | The loop that ties it together; saves `state.json` |
| `tests/` | `pytest` suite using sample MarketWatch pages in `tests/fixtures/` |

Run the tests with `pip install pytest && python -m pytest`.
