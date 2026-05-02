// Progress tracking — stored in localStorage on this browser.
// Data shape:
//   {
//     sessions: [{ date: "YYYY-MM-DD", lessonId, lessonTitle, minutes, ts }],
//     completed: { [lessonId]: true },
//     settings:  { parentEmail, weeklyGoal },
//     currentSession: { startTs, lessonId, lessonTitle } | null
//   }
const Tracker = (() => {
  const KEY = "lucas-python-progress-v1";

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaults();
      const data = JSON.parse(raw);
      return { ...defaults(), ...data };
    } catch {
      return defaults();
    }
  }

  function defaults() {
    return {
      sessions: [],
      completed: {},
      settings: { parentEmail: "", weeklyGoal: 3 },
      currentSession: null,
    };
  }

  function save(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  function todayISO(d = new Date()) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  // Start the timer when Lucas begins a lesson. Idempotent — only starts once
  // per page load. We don't record anything until he completes a lesson or runs code.
  function startSession(lessonId, lessonTitle) {
    const data = load();
    if (!data.currentSession) {
      data.currentSession = {
        startTs: Date.now(),
        lessonId,
        lessonTitle,
      };
      save(data);
    } else if (data.currentSession.lessonId !== lessonId) {
      // switched lessons — keep the same start time but update which lesson he's on
      data.currentSession.lessonId = lessonId;
      data.currentSession.lessonTitle = lessonTitle;
      save(data);
    }
    return data.currentSession;
  }

  // Log a completed lesson. Adds a session entry and marks the lesson done.
  function completeLesson(lessonId, lessonTitle) {
    const data = load();
    const now = Date.now();
    const startTs = data.currentSession?.startTs ?? now - 60_000;
    const minutes = Math.max(1, Math.round((now - startTs) / 60000));
    data.sessions.push({
      date: todayISO(),
      lessonId,
      lessonTitle,
      minutes,
      ts: now,
    });
    data.completed[lessonId] = true;
    data.currentSession = null;
    save(data);
    return { minutes };
  }

  // Log a "session" (any practice day) when Lucas runs code, even without
  // finishing a lesson. We only log once per day per lesson with a small min duration,
  // to count practice days toward the weekly goal.
  function logPractice(lessonId, lessonTitle) {
    const data = load();
    const today = todayISO();
    const alreadyToday = data.sessions.some(
      (s) => s.date === today && s.lessonId === lessonId
    );
    if (alreadyToday) return; // already counted today on this lesson
    const now = Date.now();
    const startTs = data.currentSession?.startTs ?? now;
    const minutes = Math.max(1, Math.round((now - startTs) / 60000));
    data.sessions.push({
      date: today,
      lessonId,
      lessonTitle,
      minutes,
      ts: now,
      practice: true,
    });
    save(data);
  }

  // ----- Stats helpers -----

  function uniqueDays(sessions) {
    return new Set(sessions.map((s) => s.date));
  }

  function startOfWeek(d = new Date()) {
    // Week starts Monday.
    const date = new Date(d);
    const day = date.getDay(); // 0 Sun..6 Sat
    const diff = (day === 0 ? -6 : 1) - day;
    date.setDate(date.getDate() + diff);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  function sessionsThisWeek(data = load()) {
    const start = startOfWeek();
    const days = new Set();
    for (const s of data.sessions) {
      const d = new Date(s.date);
      if (d >= start) days.add(s.date);
    }
    return days.size;
  }

  function streakDays(data = load()) {
    const days = uniqueDays(data.sessions);
    let streak = 0;
    const cursor = new Date();
    // If no session today, streak is still valid if yesterday counted.
    if (!days.has(todayISO(cursor))) {
      cursor.setDate(cursor.getDate() - 1);
    }
    while (days.has(todayISO(cursor))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }

  function totalMinutes(data = load()) {
    return data.sessions.reduce((s, x) => s + (x.minutes || 0), 0);
  }

  function lessonsCompleted(data = load()) {
    return Object.keys(data.completed).length;
  }

  function settings() {
    return load().settings;
  }

  function saveSettings(patch) {
    const data = load();
    data.settings = { ...data.settings, ...patch };
    save(data);
  }

  function reset() {
    localStorage.removeItem(KEY);
  }

  function buildSummary(totalLessons) {
    const data = load();
    const goal = data.settings.weeklyGoal || 3;
    const week = sessionsThisWeek(data);
    const streak = streakDays(data);
    const minutes = totalMinutes(data);
    const done = lessonsCompleted(data);
    const last5 = [...data.sessions]
      .sort((a, b) => b.ts - a.ts)
      .slice(0, 5)
      .map((s) => `  • ${s.date} — ${s.lessonTitle} (${s.minutes} min)`)
      .join("\n");

    const weekStatus =
      week >= goal
        ? `✅ Goal hit! (${week}/${goal})`
        : `In progress: ${week}/${goal}`;

    return `Lucas's Python Game Lab — Weekly Update
=========================================
Date: ${todayISO()}

This week: ${weekStatus}
Current streak: ${streak} day${streak === 1 ? "" : "s"}
Lessons completed: ${done}${totalLessons ? " / " + totalLessons : ""}
Total coding time: ${minutes} min

Recent sessions:
${last5 || "  (none yet)"}

Keep it up, Lucas! 🎮
`;
  }

  return {
    load,
    save,
    todayISO,
    startSession,
    completeLesson,
    logPractice,
    sessionsThisWeek,
    streakDays,
    totalMinutes,
    lessonsCompleted,
    settings,
    saveSettings,
    reset,
    buildSummary,
    startOfWeek,
  };
})();
