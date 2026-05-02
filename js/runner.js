// Pyodide-powered Python runner.
// Provides:
//   PyRunner.ready  -> Promise that resolves when Python is ready
//   PyRunner.run(code, {output, canvas}) -> runs code, streams stdout to `output`,
//                                           gives the user code a `canvas` helper if a canvas el is passed.

const PyRunner = (() => {
  let pyodide = null;
  let readyPromise = null;
  let currentOutput = null;
  let currentCanvasCtx = null;
  let animateAborted = false;

  function appendOutput(text) {
    if (!currentOutput) return;
    currentOutput.textContent += text;
    currentOutput.scrollTop = currentOutput.scrollHeight;
  }

  function ensureReady() {
    if (readyPromise) return readyPromise;
    readyPromise = (async () => {
      // loadPyodide is provided by pyodide.js loaded in index.html
      pyodide = await loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.2/full/",
        stdout: (s) => appendOutput(s + "\n"),
        stderr: (s) => appendOutput(s + "\n"),
      });
      // Make a JS bridge object available inside Python.
      pyodide.registerJsModule("game_bridge", {
        canvas_call: (method, args) => {
          if (!currentCanvasCtx) return;
          return CanvasAPI[method](currentCanvasCtx, ...args.toJs());
        },
        prompt: (msg) => {
          // window.prompt is OK for kid-friendly games.
          const v = window.prompt(msg ?? "");
          return v === null ? "" : v;
        },
        sleep_ms: (ms) =>
          new Promise((res) => setTimeout(res, ms)),
        animation_aborted: () => animateAborted,
      });

      // Define a helpful Python-side canvas helper + input override + animate.
      await pyodide.runPythonAsync(`
import builtins, asyncio
from game_bridge import canvas_call, prompt as _js_prompt, sleep_ms, animation_aborted

class _Canvas:
    def clear(self, color="white"):
        canvas_call("clear", [color])
    def rect(self, x, y, w, h, color="black"):
        canvas_call("rect", [x, y, w, h, color])
    def circle(self, x, y, r, color="black"):
        canvas_call("circle", [x, y, r, color])
    def line(self, x1, y1, x2, y2, color="black", width=2):
        canvas_call("line", [x1, y1, x2, y2, color, width])
    def triangle(self, x1, y1, x2, y2, x3, y3, color="black"):
        canvas_call("triangle", [x1, y1, x2, y2, x3, y3, color])
    def text(self, txt, x, y, color="black", size=14):
        canvas_call("text", [str(txt), x, y, color, size])

canvas = _Canvas()

# Override input() to use a JS prompt (Python's input() doesn't work in browser).
def input(msg=""):
    val = _js_prompt(str(msg))
    print(str(msg) + str(val))
    return val
builtins.input = input

async def animate(draw_frame, frames=60, fps=30):
    delay = int(1000 / max(1, fps))
    for t in range(frames):
        if animation_aborted():
            break
        draw_frame(t)
        await sleep_ms(delay)

builtins.animate = animate
builtins.canvas = canvas
`);
    })();
    return readyPromise;
  }

  // Drawing helpers — each takes a 2d ctx and the args.
  const CanvasAPI = {
    clear(ctx, color) {
      ctx.fillStyle = color || "white";
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    },
    rect(ctx, x, y, w, h, color) {
      ctx.fillStyle = color || "black";
      ctx.fillRect(x, y, w, h);
    },
    circle(ctx, x, y, r, color) {
      ctx.fillStyle = color || "black";
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    },
    line(ctx, x1, y1, x2, y2, color, width) {
      ctx.strokeStyle = color || "black";
      ctx.lineWidth = width || 2;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    },
    triangle(ctx, x1, y1, x2, y2, x3, y3, color) {
      ctx.fillStyle = color || "black";
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x3, y3);
      ctx.closePath();
      ctx.fill();
    },
    text(ctx, text, x, y, color, size) {
      ctx.fillStyle = color || "black";
      ctx.font = `${size || 14}px sans-serif`;
      ctx.textBaseline = "top";
      ctx.fillText(text, x, y);
    },
  };

  async function run(code, { outputEl, canvasEl } = {}) {
    currentOutput = outputEl || null;
    currentCanvasCtx = canvasEl ? canvasEl.getContext("2d") : null;
    animateAborted = false;
    if (currentCanvasCtx) {
      CanvasAPI.clear(currentCanvasCtx, "white");
    }
    if (outputEl) outputEl.textContent = "";
    appendOutput("⏳ Loading Python (first time can take a few seconds)…\n");
    await ensureReady();
    if (outputEl) outputEl.textContent = "";
    try {
      await pyodide.runPythonAsync(code);
    } catch (err) {
      appendOutput("\n❌ " + (err.message || String(err)));
    }
  }

  function abortAnimation() {
    animateAborted = true;
  }

  return { run, ensureReady, abortAnimation };
})();
