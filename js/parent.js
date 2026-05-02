// Parent dashboard logic.
(() => {
  const $ = (id) => document.getElementById(id);

  function startOfWeek(d = new Date()) {
    return Tracker.startOfWeek(d);
  }

  function render() {
    const data = Tracker.load();
    const goal = data.settings.weeklyGoal || 3;
    const week = Tracker.sessionsThisWeek(data);
    const streak = Tracker.streakDays(data);

    $("parent-email").value = data.settings.parentEmail || "";
    $("weekly-goal").value = goal;
    $("goal-display").textContent = goal;
    $("sessions-this-week").textContent = week;
    $("streak-count").textContent = streak;
    $("lessons-done").textContent = Tracker.lessonsCompleted(data);
    $("lessons-total").textContent = LESSONS.length;
    $("total-time").textContent = Tracker.totalMinutes(data);

    const sorted = [...data.sessions].sort((a, b) => a.ts - b.ts);
    $("first-session").textContent = sorted.length ? sorted[0].date : "—";
    $("last-session").textContent = sorted.length ? sorted[sorted.length - 1].date : "—";

    $("week-bar").style.width = Math.min(100, (week / goal) * 100) + "%";
    $("week-status").textContent =
      week >= goal
        ? `🎉 Lucas hit his weekly goal of ${goal} sessions!`
        : `${goal - week} more session${goal - week === 1 ? "" : "s"} to hit the weekly goal.`;

    renderCalendar(data);
    renderLog(data);
    refreshSummary();
  }

  function renderCalendar(data) {
    const c = $("calendar");
    c.innerHTML = "";
    const days = new Set(data.sessions.map((s) => s.date));
    const today = new Date(); today.setHours(0,0,0,0);
    const weeks = 12;
    const start = startOfWeek(new Date(today.getTime() - (weeks - 1) * 7 * 86400000));

    const grid = document.createElement("div");
    grid.className = "cal-grid";
    ["M","T","W","T","F","S","S"].forEach(l => {
      const h = document.createElement("div"); h.className = "cal-h"; h.textContent = l; grid.appendChild(h);
    });
    for (let w = 0; w < weeks; w++) {
      for (let d = 0; d < 7; d++) {
        const date = new Date(start.getTime() + (w * 7 + d) * 86400000);
        const iso = Tracker.todayISO(date);
        const cell = document.createElement("div");
        cell.className = "cal-cell";
        if (date > today) cell.classList.add("future");
        if (days.has(iso)) cell.classList.add("done");
        cell.title = iso;
        cell.textContent = date.getDate();
        grid.appendChild(cell);
      }
    }
    c.appendChild(grid);
  }

  function renderLog(data) {
    const tb = $("session-log");
    tb.innerHTML = "";
    const sorted = [...data.sessions].sort((a, b) => b.ts - a.ts);
    if (!sorted.length) {
      tb.innerHTML = '<tr><td colspan="3" class="muted">No sessions yet.</td></tr>';
      return;
    }
    sorted.forEach((s) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${s.date}</td><td>${s.lessonTitle}</td><td>${s.minutes} min</td>`;
      tb.appendChild(tr);
    });
  }

  function refreshSummary() {
    $("summary-preview").value = Tracker.buildSummary(LESSONS.length);
  }

  // --- Buttons ---
  $("btn-save-settings").addEventListener("click", () => {
    Tracker.saveSettings({
      parentEmail: $("parent-email").value.trim(),
      weeklyGoal: Math.max(1, Math.min(7, parseInt($("weekly-goal").value, 10) || 3)),
    });
    render();
    alert("Saved!");
  });

  $("btn-refresh-summary").addEventListener("click", refreshSummary);

  $("btn-email-summary").addEventListener("click", () => {
    const email = (Tracker.settings().parentEmail || "").trim();
    if (!email) {
      alert("Add your parent email above first.");
      return;
    }
    const subject = encodeURIComponent("Lucas's Python progress — weekly update");
    const body = encodeURIComponent($("summary-preview").value);
    window.location.href = `mailto:${encodeURIComponent(email)}?subject=${subject}&body=${body}`;
  });

  $("btn-copy-summary").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText($("summary-preview").value);
      alert("Copied!");
    } catch {
      alert("Couldn't copy. Select the text manually.");
    }
  });

  $("btn-download-summary").addEventListener("click", () => {
    const blob = new Blob([$("summary-preview").value], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lucas-progress-${Tracker.todayISO()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  });

  $("btn-reset-progress").addEventListener("click", () => {
    if (!confirm("Erase all of Lucas's session history? This cannot be undone.")) return;
    if (!confirm("Are you really sure?")) return;
    Tracker.reset();
    render();
  });

  document.addEventListener("DOMContentLoaded", render);
})();
