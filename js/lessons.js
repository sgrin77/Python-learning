// Lessons for Lucas — game-focused, ordered from easy to harder.
// Each lesson:
//   id: stable string id (used for progress tracking)
//   title: shown in sidebar and header
//   emoji: small icon
//   body: HTML shown above the editor
//   starter: starter code in the editor
//   hint: optional hint shown in lesson body
//   challenge: extra "try it" idea
//   showCanvas: true if the lesson uses the game canvas
const LESSONS = [
  {
    id: "hello",
    title: "Hello, Game World",
    emoji: "👋",
    body: `
      <h2>👋 Lesson 1 — Hello, Game World</h2>
      <p>Every game starts with a message. Welcome the player!</p>
      <p>The <code>print(...)</code> command makes Python show text. Anything inside the quotes will appear in the Output box.</p>
      <p><strong>Try this:</strong> click <em>▶ Run</em> below. Then change the message to your name and run it again.</p>
      <p class="hint">💡 Tip: text inside Python needs <code>"quotes"</code> around it.</p>
    `,
    starter: `print("Welcome to Lucas's game!")
print("Get ready to play...")`,
    challenge: "Print a 3-line story intro for a game you'd love to make."
  },
  {
    id: "variables",
    title: "Player Stats (Variables)",
    emoji: "🎒",
    body: `
      <h2>🎒 Lesson 2 — Player Stats</h2>
      <p>Games need to remember things — the player's name, score, health.</p>
      <p>A <strong>variable</strong> is a label for a value. We use <code>=</code> to set it.</p>
      <pre><code>player_name = "Lucas"
score = 0
health = 100</code></pre>
      <p>Then we can use those names anywhere.</p>
      <p class="hint">💡 Variable names use lowercase and underscores. No spaces!</p>
    `,
    starter: `player_name = "Hero"
score = 0
health = 100

print("Player:", player_name)
print("Score:", score)
print("Health:", health)`,
    challenge: "Add a `level` variable starting at 1, and print it too."
  },
  {
    id: "math",
    title: "Damage & Score (Math)",
    emoji: "➕",
    body: `
      <h2>➕ Lesson 3 — Damage & Score</h2>
      <p>Python is a great calculator. Games use math constantly: scoring, damage, distance, speed.</p>
      <ul>
        <li><code>+</code> add  &nbsp; <code>-</code> subtract</li>
        <li><code>*</code> multiply &nbsp; <code>/</code> divide</li>
      </ul>
      <p>You can <em>change</em> a variable by adding to it:</p>
      <pre><code>score = score + 10
# shorter:
score += 10</code></pre>
    `,
    starter: `health = 100
damage = 25

# enemy hits player twice
health -= damage
health -= damage

print("After 2 hits, health =", health)

# how many hits until 0?
hits_left = health / damage
print("Hits left:", hits_left)`,
    challenge: "Start with score 0. Add 50 for a coin, then 200 for a boss kill, then print the total."
  },
  {
    id: "strings",
    title: "Game Messages (Strings)",
    emoji: "💬",
    body: `
      <h2>💬 Lesson 4 — Game Messages</h2>
      <p>Text in Python is called a <strong>string</strong>. We can join strings with <code>+</code> or use an <strong>f-string</strong> to drop variables right in:</p>
      <pre><code>name = "Lucas"
score = 90
print(f"Nice job, {name}! You scored {score}.")</code></pre>
      <p>The <code>f</code> before the quote means "format". Anything in <code>{ }</code> is replaced with the value.</p>
    `,
    starter: `player = "Lucas"
gold = 42
print(f"{player} the Brave found {gold} gold coins!")
print(f"That's enough to buy {gold // 10} potions.")`,
    challenge: "Print a 'You win!' message that includes the player's name and final score using an f-string."
  },
  {
    id: "input",
    title: "Talking to the Player",
    emoji: "🎤",
    body: `
      <h2>🎤 Lesson 5 — Talking to the Player</h2>
      <p>Real games ask the player for input. We use <code>input("question: ")</code>.</p>
      <p>Whatever the player types comes back as a string.</p>
      <p>If you want a number, wrap it with <code>int(...)</code>:</p>
      <pre><code>age = int(input("How old are you? "))</code></pre>
      <p class="hint">💡 A pop-up will appear when <code>input()</code> runs — type your answer and press Enter.</p>
    `,
    starter: `name = input("What's your character's name? ")
print(f"Welcome, {name}!")

power = int(input("Pick a power level (1-100): "))
print(f"{name} attacks with power {power}!")`,
    challenge: "Ask the player for two numbers and print the sum."
  },
  {
    id: "if",
    title: "If / Else Choices",
    emoji: "🔀",
    body: `
      <h2>🔀 Lesson 6 — Make Decisions</h2>
      <p>Games are full of choices. <code>if</code> runs code only when something is true.</p>
      <pre><code>if health <= 0:
    print("Game over!")
else:
    print("Keep going!")</code></pre>
      <p>Comparisons: <code>==</code> equal, <code>!=</code> not equal, <code>&lt;</code> less, <code>&gt;</code> greater.</p>
      <p class="hint">💡 The 4 spaces before <code>print</code> matter! Python uses indentation to know what's inside the <code>if</code>.</p>
    `,
    starter: `score = 75

if score >= 90:
    rank = "S"
elif score >= 70:
    rank = "A"
elif score >= 50:
    rank = "B"
else:
    rank = "C"

print(f"You earned rank {rank}!")`,
    challenge: "Ask the player for their score and print the rank using if/elif/else."
  },
  {
    id: "loops",
    title: "Loops — Repeat Stuff",
    emoji: "🔁",
    body: `
      <h2>🔁 Lesson 7 — Loops</h2>
      <p>Games repeat things constantly: the game loop, enemy spawns, animations.</p>
      <p>A <code>for</code> loop counts:</p>
      <pre><code>for i in range(5):
    print("wave", i)</code></pre>
      <p>A <code>while</code> loop runs as long as something is true:</p>
      <pre><code>health = 3
while health > 0:
    print("alive!")
    health -= 1</code></pre>
    `,
    starter: `# Spawn 5 enemies
for i in range(5):
    print(f"Enemy {i+1} appears!")

print("---")

# Countdown to start
seconds = 3
while seconds > 0:
    print(seconds)
    seconds -= 1
print("GO!")`,
    challenge: "Use a loop to print the 7 times table from 7×1 to 7×10."
  },
  {
    id: "lists",
    title: "Inventory (Lists)",
    emoji: "🎒",
    body: `
      <h2>🎒 Lesson 8 — Inventory</h2>
      <p>A <strong>list</strong> holds many things. Perfect for an inventory!</p>
      <pre><code>inventory = ["sword", "shield", "potion"]
inventory.append("key")     # add to end
print(inventory[0])         # first item
print(len(inventory))       # how many?
for item in inventory:
    print("- " + item)</code></pre>
    `,
    starter: `inventory = ["sword", "shield"]
inventory.append("magic potion")
inventory.append("dragon scale")

print(f"You have {len(inventory)} items:")
for item in inventory:
    print("  -", item)

print("Your weapon is your", inventory[0])`,
    challenge: "Make a list of 5 enemy names. Use a loop to print 'Defeat the {enemy}!' for each."
  },
  {
    id: "functions",
    title: "Player Actions (Functions)",
    emoji: "⚡",
    body: `
      <h2>⚡ Lesson 9 — Player Actions</h2>
      <p>A <strong>function</strong> is a reusable action. Define it once with <code>def</code>, call it as many times as you want.</p>
      <pre><code>def attack(name, power):
    print(f"{name} attacks for {power} damage!")
    return power

dmg = attack("Lucas", 25)
attack("Goblin", 8)</code></pre>
      <p>Functions can <code>return</code> a value back.</p>
    `,
    starter: `def heal(current_hp, amount):
    new_hp = current_hp + amount
    if new_hp > 100:
        new_hp = 100
    print(f"Healed for {amount}! HP: {new_hp}")
    return new_hp

hp = 40
hp = heal(hp, 30)
hp = heal(hp, 50)
print("Final HP:", hp)`,
    challenge: "Write a function `roll_dice(sides)` that returns a random number from 1 to sides. (Hint: `import random` then `random.randint(1, sides)`.)"
  },
  {
    id: "guess",
    title: "Mini-Game: Number Guessing",
    emoji: "🎯",
    body: `
      <h2>🎯 Lesson 10 — Mini-Game: Number Guessing</h2>
      <p>Time to put it all together. The computer picks a secret number; the player guesses until they get it.</p>
      <p>Concepts used: variables, while loop, if/elif/else, input, random.</p>
      <p class="hint">💡 Try playing a few rounds. Then change the range to 1-100!</p>
    `,
    starter: `import random

secret = random.randint(1, 20)
guesses = 0
print("I'm thinking of a number from 1 to 20...")

while True:
    guess = int(input("Your guess: "))
    guesses += 1
    if guess < secret:
        print("Too low!")
    elif guess > secret:
        print("Too high!")
    else:
        print(f"YES! Got it in {guesses} guesses.")
        break`,
    challenge: "Limit the player to 5 guesses. If they run out, print the secret and 'Game over!'."
  },
  {
    id: "adventure",
    title: "Mini-Game: Text Adventure",
    emoji: "🗺️",
    body: `
      <h2>🗺️ Lesson 11 — Text Adventure</h2>
      <p>Build your own choose-your-own-adventure story! This uses <code>input()</code> and <code>if/elif/else</code> to branch the story.</p>
      <p>Edit the story — make it about anything you want.</p>
    `,
    starter: `print("You stand at a fork in the cave.")
print("A torch flickers. Goblins growl somewhere.")
choice = input("Go (l)eft or (r)ight? ")

if choice == "l":
    print("You find a treasure chest! 💎")
    open_it = input("Open it? (y/n) ")
    if open_it == "y":
        print("It's full of gold! You win! 🏆")
    else:
        print("You leave it. Safe but boring.")
elif choice == "r":
    print("A dragon! 🐉")
    print("Roll for courage...")
    import random
    roll = random.randint(1, 20)
    print("You rolled", roll)
    if roll >= 15:
        print("You scare it off! Hero! 🦸")
    else:
        print("It eats you. Game over.")
else:
    print("You stand still and the cave collapses. Oops.")`,
    challenge: "Add a third path. Add at least 2 more decision points. Keep score with a variable."
  },
  {
    id: "turtle",
    title: "Drawing on Screen (Turtle)",
    emoji: "🐢",
    body: `
      <h2>🐢 Lesson 12 — Draw With Code</h2>
      <p>Now we draw real graphics! We'll use the <em>Game Window</em> to the right.</p>
      <p>This uses simple drawing commands. We move a "pen" around the canvas.</p>
      <p class="hint">💡 The canvas is 400×300. Position 0,0 is the top-left corner.</p>
    `,
    showCanvas: true,
    starter: `# 'canvas' is a built-in helper for drawing.
# Try changing the colors and shapes!
canvas.clear("skyblue")
canvas.rect(50, 200, 300, 80, "green")     # ground
canvas.circle(320, 60, 30, "yellow")       # sun
canvas.rect(150, 130, 100, 100, "saddlebrown")  # house
canvas.triangle(140, 130, 260, 130, 200, 70, "red")  # roof
canvas.rect(185, 180, 30, 50, "black")     # door
canvas.text("Lucas's House", 130, 260, "white", 18)`,
    challenge: "Add a tree. Add clouds. Make it nighttime (dark sky, a moon, stars)."
  },
  {
    id: "animation",
    title: "Animation Loop",
    emoji: "🎞️",
    body: `
      <h2>🎞️ Lesson 13 — Animation</h2>
      <p>Games animate by drawing the screen many times per second. Each frame, things move a tiny bit.</p>
      <p>The helper <code>animate(draw_frame, frames=60)</code> calls your <code>draw_frame(t)</code> function over and over. <code>t</code> is the frame number.</p>
    `,
    showCanvas: true,
    starter: `def draw_frame(t):
    canvas.clear("black")
    # ball moves across the screen
    x = (t * 5) % 400
    canvas.circle(x, 150, 20, "red")
    canvas.text(f"frame {t}", 10, 20, "white", 14)

animate(draw_frame, frames=120)`,
    challenge: "Make the ball bounce up and down too. Hint: use `math.sin(t * 0.1) * 50` for the y position."
  },
  {
    id: "pong",
    title: "Mini-Game: Bouncing Ball",
    emoji: "🏓",
    body: `
      <h2>🏓 Lesson 14 — Bouncing Ball</h2>
      <p>Welcome to your first real game logic! A ball bounces around the screen.</p>
      <p>This combines variables, functions, conditions, and animation. Read the code carefully — every line is doing something.</p>
    `,
    showCanvas: true,
    starter: `# Ball state
ball = {"x": 100, "y": 80, "vx": 4, "vy": 3}

def draw_frame(t):
    # move
    ball["x"] += ball["vx"]
    ball["y"] += ball["vy"]
    # bounce off walls
    if ball["x"] < 10 or ball["x"] > 390:
        ball["vx"] = -ball["vx"]
    if ball["y"] < 10 or ball["y"] > 290:
        ball["vy"] = -ball["vy"]
    # draw
    canvas.clear("midnightblue")
    canvas.circle(ball["x"], ball["y"], 10, "lime")
    canvas.text("Bounce!", 10, 20, "white", 14)

animate(draw_frame, frames=300)`,
    challenge: "Add a second ball with different colors and speeds. Make one bigger."
  },
  {
    id: "next",
    title: "What's Next?",
    emoji: "🚀",
    body: `
      <h2>🚀 Lesson 15 — What's Next?</h2>
      <p>You're now coding real Python! Here's what to learn next on your way to making full video games:</p>
      <ul>
        <li><strong>Pygame</strong> — the most popular Python game library. Install Python on your computer and try <a href="https://www.pygame.org/news" target="_blank" rel="noopener">pygame.org</a>.</li>
        <li><strong>Pygame Zero</strong> — a beginner-friendly version of pygame.</li>
        <li><strong>Replit</strong> — code Python in your browser with more features.</li>
        <li><strong>Project ideas:</strong> Pong, Snake, Flappy Bird clone, a platformer.</li>
      </ul>
      <p>Keep coding 3 times a week and you'll be making real games before you know it. Proud of you!</p>
      <p>For this lesson, write the code for a game <em>you</em> want to make. It doesn't have to work — just describe it in code with comments and <code>print()</code> statements.</p>
    `,
    starter: `# My dream game by Lucas
print("=== MY GAME ===")
print()
# Describe your game idea here, line by line.
# Use print() statements or comments. Have fun!

print("Title: ???")
print("You play as: ???")
print("The goal is: ???")
print("Cool features: ???")
`,
    challenge: "Show this to your parent and tell them the game idea out loud."
  }
];
