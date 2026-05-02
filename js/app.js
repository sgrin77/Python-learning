// Main app logic — wires up lessons, editor, run button, navigation, progress UI.
(() => {
  const els = {
    lessonIndex: document.getElementById("lesson-index"),
    lessonContent: document.getElementById("lesson-content"),
    editor: document.getElementById("editor"),
    output: document.getElementById("output"),
    canvasWrap: document.getElementById("canvas-wrap"),
    canvas: document.getElementById("game-canvas"),
    btnRun: document.getElementById("btn-run"),
    btnReset: document.getElementById("btn-reset"),
    btnClear: document.getElementById("btn-clear"),
    btnPrev: document.getElementById("btn-prev"),
    btnNext: document.getElementById("btn-next"),
    btnComplete: document.getElementById("btn-complete"),
    streakCount: document.getElementById("streak-count"),
    streakCount2: document.getElementById("streak-count-2"),
    sessionsThisWeek: document.getElementById("sessions-this-week"),
    weekBar: document.getElementById("week-bar"),
    weekMessage: document.getElementById("week-message"),
    lessonsDone: document.getElementById("lessons-done"),
    lessonsTotal: document.getElementById("lessons-total"),
    totalTime: document.getElementById("total-time"),
    calendar: document.getElementById("calendar"),
    sessionLog: document.getElementById("session-log"),
    navLearn: document.getElementById("nav-learn"),
    navProgress: document.getElementById("nav-progress"),
    viewLearn: document.getElementById("view-learn"),
    viewProgress: document.getElementById("view-progress"),
  };

  const STATE = { current: 0 };
  const LS_LAST = "lucas-python-last-lesson";
  const codeKey = (id) => `lucas-python-code-${id}`;

  function loadLesson(index) {
    STATE.current = Math.max(0, Math.min(LESSONS.length - 1, index));
    const lesson = LESSONS[STATE.current];
    localStorage.setItem(LS_LAST, String(STATE.current));

    els.lessonContent.innerHTML = lesson.body;
    if (lesson.challenge) {
      const ch = document.createElement("p");
      ch.className = "challenge";
      ch.innerHTML = `<strong>🌟 Bonus challenge:</strong> ${lesson.challenge}`;
      els.lessonContent.appendChild(ch);
    }

    const saved = localStorage.getItem(codeKey(lesson.id));
    els.editor.value = saved ?? lesson.starter;

    if (lesson.showCanvas) {
      els.canvasWrap.hidden = false;
    } else {
      els.canvasWrap.hidden = true;
    }
    els.output.textContent = 'Click "Run" to try your code!';
    Tracker.startSession(lesson.id, lesson.title);
    renderLessonIndex();
    updateNavButtons();
  }

  function renderLessonIndex() {
    const data = Tracker.load();
    els.lessonIndex.innerHTML = "";
    LESSONS.forEach((l, i) => {
      const li = document.createElement("li");
      const done = data.completed[l.id];
      const isCurrent = i === STATE.current;
      li.className =
        (isCurrent ? "current " : "") + (done ? "completed" : "");
      li.innerHTML = `
        <button data-i="${i}">
          <span class="lesson-emoji">${l.emoji}</span>
          <span class="lesson-title">${l.title}</span>
          ${done ? '<span class="lesson-check">✓</span>' : ""}
        </button>`;
      els.lessonIndex.appendChild(li);
    });
    els.lessonIndex.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => loadLesson(parseInt(btn.dataset.i, 10)));
    });
  }

  function updateNavButtons() {
    els.btnPrev.disabled = STATE.current === 0;
    els.btnNext.disabled = STATE.current === LESSONS.length - 1;
  }

  // Persist code as Lucas types so he doesn't lose work.
  let saveTimer = null;
  els.editor.addEventListener("input", () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      const lesson = LESSONS[STATE.current];
      localStorage.setItem(codeKey(lesson.id), els.editor.value);
    }, 300);
  });

  // --- Buttons ---
  els.btnRun.addEventListener("click", async () => {
    const lesson = LESSONS[STATE.current];
    PyRunner.abortAnimation(); // cancel any running animation
    els.btnRun.disabled = true;
    els.btnRun.textContent = "Running…";
    try {
      await PyRunner.run(els.editor.value, {
        outputEl: els.output,
        canvasEl: lesson.showCanvas ? els.canvas : null,
      });
      Tracker.logPractice(lesson.id, lesson.title);
      refreshStreakBadge();
    } finally {
      els.btnRun.disabled = false;
      els.btnRun.textContent = "▶ Run";
    }
  });

  els.btnReset.addEventListener("click", () => {
    const lesson = LESSONS[STATE.current];
    if (confirm("Reset to the original starter code? Your changes will be lost.")) {
      els.editor.value = lesson.starter;
      localStorage.removeItem(codeKey(lesson.id));
    }
  });

  els.btnClear.addEventListener("click", () => {
    els.output.textContent = "";
  });

  els.btnPrev.addEventListener("click", () => loadLesson(STATE.current - 1));
  els.btnNext.addEventListener("click", () => loadLesson(STATE.current + 1));

  els.btnComplete.addEventListener("click", () => {
    const lesson = LESSONS[STATE.current];
    const { minutes } = Tracker.completeLesson(lesson.id, lesson.title);
    refreshStreakBadge();
    renderLessonIndex();
    const week = Tracker.sessionsThisWeek();
    const goal = Tracker.settings().weeklyGoal || 3;
    let msg = `Awesome work! You spent about ${minutes} min on this lesson.`;
    if (week >= goal) msg += ` 🎉 You hit your weekly goal of ${goal} sessions!`;
    else msg += ` Sessions this week: ${week}/${goal}.`;
    alert(msg);
    if (STATE.current < LESSONS.length - 1) loadLesson(STATE.current + 1);
  });

  // --- Navigation ---
  els.navLearn.addEventListener("click", () => switchView("learn"));
  els.navProgress.addEventListener("click", () => switchView("progress"));

  function switchView(name) {
    const learn = name === "learn";
    els.viewLearn.classList.toggle("active", learn);
    els.viewProgress.classList.toggle("active", !learn);
    els.navLearn.classList.toggle("active", learn);
    els.navProgress.classList.toggle("active", !learn);
    if (!learn) renderProgressView();
  }

  // --- Progress view ---
  function renderProgressView() {
    const data = Tracker.load();
    const goal = data.settings.weeklyGoal || 3;
    const week = Tracker.sessionsThisWeek(data);
    const streak = Tracker.streakDays(data);

    els.sessionsThisWeek.textContent = week;
    els.streakCount2.textContent = streak;
    els.lessonsDone.textContent = Tracker.lessonsCompleted(data);
    els.lessonsTotal.textContent = LESSONS.length;
    els.totalTime.textContent = Tracker.totalMinutes(data);
    els.weekBar.style.width = Math.min(100, (week / goal) * 100) + "%";

    if (week >= goal) {
      els.weekMessage.textContent = "🎉 Weekly goal hit! You're a champion.";
    } else if (week === goal - 1) {
      els.weekMessage.textContent = "So close! One more session to hit the goal.";
    } else if (week === 0) {
      els.weekMessage.textContent = "No sessions yet this week. Let's go!";
    } else {
      els.weekMessage.textContent = `${goal - week} more session${goal - week === 1 ? "" : "s"} to hit your goal.`;
    }

    renderCalendar(els.calendar, data, 8);
    renderSessionLog(data);
  }

  function renderCalendar(container, data, weeks) {
    container.innerHTML = "";
    const days = new Set(data.sessions.map((s) => s.date));
    // Group sessions per day to highlight goal-hit days
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Find the start: weeks*7 days back, snapped to Monday.
    const start = Tracker.startOfWeek(new Date(today.getTime() - (weeks - 1) * 7 * 86400000));

    const grid = document.createElement("div");
    grid.className = "cal-grid";

    // Header (M T W T F S S)
    ["M", "T", "W", "T", "F", "S", "S"].forEach((label) => {
      const h = document.createElement("div");
      h.className = "cal-h";
      h.textContent = label;
      grid.appendChild(h);
    });

    for (let w = 0; w < weeks; w++) {
      const weekDays = [];
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
        weekDays.push(iso);
      }
    }
    container.appendChild(grid);
  }

  function renderSessionLog(data) {
    const list = els.sessionLog;
    if (!list) return;
    list.innerHTML = "";
    const recent = [...data.sessions].sort((a, b) => b.ts - a.ts).slice(0, 12);
    if (recent.length === 0) {
      list.innerHTML = "<li class='muted'>No sessions yet — run some code!</li>";
      return;
    }
    recent.forEach((s) => {
      const li = document.createElement("li");
      li.textContent = `${s.date} — ${s.lessonTitle} (${s.minutes} min)`;
      list.appendChild(li);
    });
  }

  function refreshStreakBadge() {
    const streak = Tracker.streakDays();
    if (els.streakCount) els.streakCount.textContent = streak;
  }

  // --- Boot ---
  function boot() {
    renderLessonIndex();
    const last = parseInt(localStorage.getItem(LS_LAST) || "0", 10);
    loadLesson(isNaN(last) ? 0 : last);
    refreshStreakBadge();
    // Pre-warm Pyodide in the background so first run is faster.
    PyRunner.ensureReady().catch(() => {});
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
