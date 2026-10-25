// Ready-made moves for the Board tab.
//
// The field is 68 wide (x, left to right) and 105 long (y, top to bottom),
// in meters. Our team attacks UP, toward y = 0; our own goal is at y = 105.
// view: 'attack' shows the top half, 'defend' the bottom half, 'full' all of it.
//
// Each step lists where every token stands and the arrows that show what
// happens next. Token types: gk (our keeper), us, them, ball, cone.
// hi: true draws a gold ring around the player this move is about.
// Arrow kinds: pass, run, dribble, shot. c is an optional bend point.
// drills lists drill ids from app.js that practice the same skill.
// ages limits who sees the move (default 9 to 18); pos 'young' marks moves for ages 5 to 8.
window.KSL_PLAYS = [
  {
    id: 'narrow-angle', pos: 'gk', view: 'defend',
    title: 'Narrow the angle',
    summary: 'Where to stand as the ball moves wide.',
    drills: ['gk_angle', 'gk_setstep'],
    tokens: [
      { id: 'gk', type: 'gk', label: 'GK', hi: true },
      { id: 'a9', type: 'them', label: '9' },
      { id: 'b', type: 'ball' }
    ],
    steps: [
      {
        caption: 'The ball is in the middle. Stand on the line between the ball and the middle of your goal, about two steps off your line.',
        pos: { gk: [34, 102], a9: [34, 81], b: [34, 82.5] },
        arrows: [
          { kind: 'dribble', a: [34, 81], b: [49.5, 89], c: [43, 80.5] },
          { kind: 'run', a: [34, 102], b: [37.2, 102.2] }
        ]
      },
      {
        caption: 'The ball went wide, so shuffle toward the near post. The wider the ball, the closer you stay to that post. Get set before he shoots.',
        pos: { gk: [37.2, 102.2], a9: [49.5, 89], b: [48.7, 90.3] },
        arrows: [{ kind: 'shot', a: [48.7, 90.3], b: [31.5, 104.3] }]
      },
      {
        caption: 'The near post is covered, so the only gap is across the goal. Push off your near foot and dive to save it.',
        pos: { gk: [34.4, 102.9], a9: [49.5, 89], b: [33.2, 103.4] },
        arrows: []
      }
    ]
  },
  {
    id: 'claim-cross', pos: 'gk', view: 'defend',
    title: 'Claim the cross',
    summary: 'Read a cross from the wing and catch it high.',
    drills: ['gk_highball', 'gk_voice'],
    tokens: [
      { id: 'gk', type: 'gk', label: 'GK', hi: true },
      { id: 'd4', type: 'us', label: '4' },
      { id: 'a7', type: 'them', label: '7' },
      { id: 'a9', type: 'them', label: '9' },
      { id: 'b', type: 'ball' }
    ],
    steps: [
      {
        caption: 'Their winger is near the end line. Stand a little toward the near post and turn side-on, so you can see the ball and the players in the box.',
        pos: { gk: [36, 102.6], d4: [38.5, 94.5], a7: [62, 97], a9: [34, 91.5], b: [62.6, 98.3] },
        arrows: [
          { kind: 'pass', a: [62.6, 98.3], b: [36.2, 97.4], c: [52, 86] },
          { kind: 'run', a: [34, 91.5], b: [32.5, 95] },
          { kind: 'run', a: [38.5, 94.5], b: [40, 96.5] },
          { kind: 'run', a: [36, 102.6], b: [36, 99.6] }
        ]
      },
      {
        caption: 'Shout “Keeper!” early, step toward the ball, lift your knee, and catch it at the highest point in front of your head.',
        pos: { gk: [36, 99.6], d4: [40, 96.5], a7: [62, 97], a9: [32.5, 95], b: [36.2, 97.4] },
        arrows: []
      }
    ]
  },
  {
    id: 'win-1v1', pos: 'gk', view: 'defend',
    title: 'Win the 1v1',
    summary: 'Close down a striker who is through on goal.',
    drills: ['gk_1v1'],
    tokens: [
      { id: 'gk', type: 'gk', label: 'GK', hi: true },
      { id: 'a9', type: 'them', label: '9' },
      { id: 'd5', type: 'us', label: '5' },
      { id: 'b', type: 'ball' }
    ],
    steps: [
      {
        caption: 'Their striker is through on goal. Come off your line while the ball is away from his foot.',
        pos: { gk: [34, 101.5], a9: [33, 70], d5: [40, 64], b: [33.2, 71.5] },
        arrows: [
          { kind: 'dribble', a: [33, 70], b: [33.5, 84.5] },
          { kind: 'run', a: [34, 101.5], b: [34, 95] },
          { kind: 'run', a: [40, 64], b: [38, 79] }
        ]
      },
      {
        caption: 'When he is about to touch it again, stop and get set. Stay on your feet and make him decide first.',
        pos: { gk: [34, 95], a9: [33.5, 84.5], d5: [38, 79], b: [33.6, 86.2] },
        arrows: [{ kind: 'shot', a: [33.6, 86.2], b: [33.2, 93.4] }]
      },
      {
        caption: 'When the shot comes, make yourself big. A block from close up beats an early dive.',
        pos: { gk: [33.6, 94.4], a9: [33.5, 86], d5: [38.5, 83], b: [33.2, 92.6] },
        arrows: []
      }
    ]
  },
  {
    id: 'start-attack', pos: 'gk', view: 'defend',
    title: 'Start the attack',
    summary: 'Turn a catch into an attack with a quick roll or throw.',
    drills: ['gk_dist'],
    tokens: [
      { id: 'gk', type: 'gk', label: 'GK', hi: true },
      { id: 'd3', type: 'us', label: '3' },
      { id: 'd4', type: 'us', label: '4' },
      { id: 'd2', type: 'us', label: '2' },
      { id: 'm6', type: 'us', label: '6' },
      { id: 'a9', type: 'them', label: '9' },
      { id: 'a7', type: 'them', label: '7' },
      { id: 'b', type: 'ball' }
    ],
    steps: [
      {
        caption: 'You caught it. Before anything else, look up: which side is free? Their players are on the right.',
        pos: { gk: [34, 100.5], d3: [13, 88], d4: [34, 90], d2: [55, 88], m6: [36, 74], a9: [40, 90.5], a7: [55, 82], b: [34, 99.2] },
        arrows: [{ kind: 'run', a: [13, 88], b: [7, 79], c: [8, 86] }]
      },
      {
        caption: 'The left back is open. Roll it or throw it to him quickly, before their team gets organized.',
        pos: { gk: [34, 100.5], d3: [7, 79], d4: [34, 90], d2: [55, 88], m6: [36, 74], a9: [40, 90.5], a7: [55, 82], b: [34, 99.2] },
        arrows: [{ kind: 'pass', a: [34, 99.2], b: [8, 80.3], c: [20, 93] }]
      },
      {
        caption: 'Quick and accurate beats long and hopeful. Your team keeps the ball and starts the attack.',
        pos: { gk: [34, 100.5], d3: [7, 79], d4: [34, 90], d2: [55, 88], m6: [36, 74], a9: [39, 87.5], a7: [52, 84], b: [7.6, 77.6] },
        arrows: [
          { kind: 'dribble', a: [7, 79], b: [9, 63] },
          { kind: 'run', a: [36, 74], b: [22, 66] }
        ]
      }
    ]
  },
  {
    id: 'curve-run', pos: 'st', view: 'attack',
    title: 'Curve run to stay onside',
    summary: 'Time a run in behind without getting caught offside.',
    drills: ['st_runs'],
    tokens: [
      { id: 'st', type: 'us', label: '9', hi: true },
      { id: 'm8', type: 'us', label: '8' },
      { id: 'c4', type: 'them', label: '4' },
      { id: 'c5', type: 'them', label: '5' },
      { id: 'c3', type: 'them', label: '3' },
      { id: 'k', type: 'them', label: 'GK' },
      { id: 'b', type: 'ball' }
    ],
    steps: [
      {
        caption: 'Stay level with their last defender, never in front of him. Watch the defenders and the ball at the same time.',
        pos: { st: [40, 32], m8: [29, 46], c4: [20, 30], c5: [34, 30.5], c3: [50, 30], k: [34, 3], b: [29.6, 44.6] },
        arrows: [{ kind: 'run', a: [40, 32], b: [44.5, 31.8], c: [42.3, 34.5] }]
      },
      {
        caption: 'Bend your run along their line. The moment the passer’s head goes down, sprint in behind.',
        pos: { st: [44.5, 31.8], m8: [29, 46], c4: [20, 30], c5: [34, 30.5], c3: [50, 30], k: [34, 3], b: [29.6, 44.6] },
        arrows: [
          { kind: 'pass', a: [29.6, 44.6], b: [49.4, 14.6], c: [38, 26] },
          { kind: 'run', a: [44.5, 31.8], b: [49.6, 15.8], c: [49.2, 24] },
          { kind: 'run', a: [50, 30], b: [50.5, 22] }
        ]
      },
      {
        caption: 'Your timing kept you onside, so you are through. Look up, pick a corner, and finish low across the keeper.',
        pos: { st: [49.6, 15.8], m8: [31, 40], c4: [22, 26], c5: [38, 26], c3: [50.5, 22], k: [37, 3.5], b: [49, 14.3] },
        arrows: [{ kind: 'shot', a: [49, 14.3], b: [31.4, 0.3] }]
      }
    ]
  },
  {
    id: 'check-away', pos: 'st', view: 'attack',
    title: 'Check away, check back',
    summary: 'Lose a tight marker to get the ball with space to turn.',
    drills: ['st_turn', 'st_runs'],
    tokens: [
      { id: 'st', type: 'us', label: '9', hi: true },
      { id: 'c5', type: 'them', label: '5' },
      { id: 'm6', type: 'us', label: '6' },
      { id: 'k', type: 'them', label: 'GK' },
      { id: 'b', type: 'ball' }
    ],
    steps: [
      {
        caption: 'Their defender is tight behind you. If you stand still, you are easy to mark.',
        pos: { st: [35, 25], c5: [34, 20.5], m6: [34, 48], k: [34, 3], b: [34, 46.6] },
        arrows: [{ kind: 'run', a: [35, 25], b: [41, 18], c: [39, 23.5] }]
      },
      {
        caption: 'Take him toward goal first. Then sprint back toward the ball. He cannot follow both moves.',
        pos: { st: [41, 18], c5: [38, 14.5], m6: [34, 48], k: [34, 3], b: [34, 46.6] },
        arrows: [
          { kind: 'run', a: [41, 18], b: [43, 32.5], c: [44, 24] },
          { kind: 'pass', a: [34, 46.6], b: [43.2, 34] }
        ]
      },
      {
        caption: 'Now you have space. Check your shoulder, turn, and run at their defense.',
        pos: { st: [43, 32.5], c5: [40.5, 22], m6: [34, 48], k: [34, 3], b: [43.2, 34] },
        arrows: [{ kind: 'dribble', a: [43, 32.5], b: [41, 21], c: [47, 27] }]
      }
    ]
  },
  {
    id: 'near-post', pos: 'st', view: 'attack',
    title: 'Near-post run',
    summary: 'Attack the near post when a winger crosses.',
    drills: ['st_onetouch', 'st_runs'],
    tokens: [
      { id: 'st', type: 'us', label: '9', hi: true },
      { id: 'w7', type: 'us', label: '7' },
      { id: 'm10', type: 'us', label: '10' },
      { id: 'c4', type: 'them', label: '4' },
      { id: 'c5', type: 'them', label: '5' },
      { id: 'k', type: 'them', label: 'GK' },
      { id: 'b', type: 'ball' }
    ],
    steps: [
      {
        caption: 'Our winger is near the end line. Do not wait in the middle. Attack a space before the ball arrives.',
        pos: { st: [37, 20], w7: [59, 7], m10: [28, 25], c4: [29, 11], c5: [40, 12.5], k: [34.5, 2.5], b: [58.2, 5.8] },
        arrows: [
          { kind: 'run', a: [37, 20], b: [39.5, 6.8], c: [45, 14] },
          { kind: 'run', a: [28, 25], b: [31, 11.5] }
        ]
      },
      {
        caption: 'Get in front of the defender at the near post. A low, hard cross there only needs a touch.',
        pos: { st: [39.5, 6.8], w7: [59, 7], m10: [31, 11.5], c4: [26.8, 9.5], c5: [43, 10], k: [36, 2.5], b: [58.2, 5.8] },
        arrows: [{ kind: 'pass', a: [58.2, 5.8], b: [40, 6.2], c: [50, 7.5] }]
      },
      {
        caption: 'Redirect it toward goal with one touch. If it gets past you, your teammate is arriving at the far post.',
        pos: { st: [39.5, 6.8], w7: [59, 7], m10: [31, 9], c4: [26.5, 10], c5: [43.5, 9.5], k: [36, 2.5], b: [40, 6.2] },
        arrows: [{ kind: 'shot', a: [40, 6.2], b: [33, 0.3] }]
      }
    ]
  },
  {
    id: 'press', pos: 'st', view: 'attack',
    title: 'Press with a curved run',
    summary: 'Force their defender toward the sideline.',
    drills: ['st_press'],
    tokens: [
      { id: 'st', type: 'us', label: '9', hi: true },
      { id: 'm10', type: 'us', label: '10' },
      { id: 'cb4', type: 'them', label: '4' },
      { id: 'cb5', type: 'them', label: '5' },
      { id: 'dm6', type: 'them', label: '6' },
      { id: 'k', type: 'them', label: 'GK' },
      { id: 'b', type: 'ball' }
    ],
    steps: [
      {
        caption: 'Their defender has the ball. If you run straight at him, he just passes to his partner. Curve your run so your body blocks that pass.',
        pos: { st: [34, 34], m10: [36, 44], cb4: [22, 22], cb5: [46, 22], dm6: [31, 38], k: [34, 4], b: [22.8, 23.2] },
        arrows: [{ kind: 'run', a: [34, 34], b: [26.5, 24], c: [33.5, 25.5] }]
      },
      {
        caption: 'Now he can only go one way: toward the sideline. That is exactly where you want him.',
        pos: { st: [26.5, 24], m10: [36, 44], cb4: [22, 22], cb5: [46, 22], dm6: [31, 38], k: [34, 4], b: [22.8, 23.2] },
        arrows: [
          { kind: 'dribble', a: [22, 22], b: [10, 27], c: [15, 22] },
          { kind: 'run', a: [26.5, 24], b: [14.5, 24], c: [20, 22] },
          { kind: 'run', a: [36, 44], b: [15, 33] }
        ]
      },
      {
        caption: 'Keep pressing with a teammate. Trapped at the sideline, he either loses the ball or kicks it out.',
        pos: { st: [14.5, 24], m10: [15, 33], cb4: [10, 27], cb5: [44, 24], dm6: [28, 36], k: [34, 4], b: [9.4, 28.3] },
        arrows: []
      }
    ]
  },
  {
    id: 'hold-up', pos: 'st', view: 'attack',
    title: 'Hold up and lay off',
    summary: 'Keep the ball with your back to goal, then spin in behind.',
    drills: ['st_shield', 'st_turn'],
    tokens: [
      { id: 'st', type: 'us', label: '9', hi: true },
      { id: 'c5', type: 'them', label: '5' },
      { id: 'm6', type: 'us', label: '6' },
      { id: 'm8', type: 'us', label: '8' },
      { id: 'k', type: 'them', label: 'GK' },
      { id: 'b', type: 'ball' }
    ],
    steps: [
      {
        caption: 'A long ball is coming up to you, and a defender is right on your back.',
        pos: { st: [34, 27], c5: [34, 22.6], m6: [34, 52], m8: [26, 40], k: [34, 3], b: [34, 50.6] },
        arrows: [
          { kind: 'pass', a: [34, 50.6], b: [34, 28.6], c: [30, 40] },
          { kind: 'run', a: [26, 40], b: [29.5, 33.5] }
        ]
      },
      {
        caption: 'Get low, arm out, and keep the ball on your far foot with your body in between. Hold it until help arrives.',
        pos: { st: [34, 27], c5: [34, 22.6], m6: [34, 52], m8: [29.5, 33.5], k: [34, 3], b: [34, 28.5] },
        arrows: [{ kind: 'pass', a: [34, 28.5], b: [30, 32.2] }]
      },
      {
        caption: 'Lay it off to a teammate, then spin and run. A quick one-two gets you in behind the defender.',
        pos: { st: [34, 27], c5: [34, 22.6], m6: [34, 52], m8: [29.5, 33.5], k: [34, 3], b: [30, 32.2] },
        arrows: [
          { kind: 'run', a: [34, 27], b: [41, 13], c: [40, 24] },
          { kind: 'pass', a: [30, 32.2], b: [41.4, 11.8], c: [37, 20] }
        ]
      },
      {
        caption: 'You are through on goal. Pick your corner and finish.',
        pos: { st: [41, 13], c5: [37, 20], m6: [34, 48], m8: [29.5, 33.5], k: [36, 4], b: [41.4, 11.8] },
        arrows: [{ kind: 'shot', a: [41.4, 11.8], b: [32, 0.3] }]
      }
    ]
  },
  {
    id: 'open-space', pos: 'young', view: 'attack', ages: [5, 8],
    title: 'Dribble into open space',
    summary: 'Look up, find the empty space, and go score.',
    drills: ['y_sharks', 'y_slalom'],
    tokens: [
      { id: 'me', type: 'us', label: 'You', hi: true },
      { id: 'd1', type: 'them', label: '' },
      { id: 'd2', type: 'them', label: '' },
      { id: 'd3', type: 'them', label: '' },
      { id: 'b', type: 'ball' }
    ],
    steps: [
      {
        caption: 'Lots of players are right in front of you. Look up: where is the empty space?',
        pos: { me: [30, 42], d1: [24, 32], d2: [29.5, 30.5], d3: [35, 32], b: [30, 40.6] },
        arrows: [{ kind: 'dribble', a: [30, 42], b: [47, 31], c: [44, 42] }]
      },
      {
        caption: 'Dribble into the empty space. Little touches keep the ball close to your feet.',
        pos: { me: [47, 31], d1: [27, 33], d2: [33, 33], d3: [39, 33.5], b: [46.5, 29.5] },
        arrows: [{ kind: 'dribble', a: [47, 31], b: [41, 15], c: [48, 21] }]
      },
      {
        caption: 'Now you are close to the goal. Look at the goal, then kick it in!',
        pos: { me: [41, 15], d1: [31, 27], d2: [36, 25], d3: [42, 24], b: [40.5, 13.6] },
        arrows: [{ kind: 'shot', a: [40.5, 13.6], b: [35, 0.3] }]
      }
    ]
  },
  {
    id: 'spread-out', pos: 'young', view: 'attack', ages: [5, 8],
    title: 'Spread out, do not bunch',
    summary: 'Find space away from the crowd so a teammate can pass to you.',
    drills: ['y_spread', 'y_sharks'],
    tokens: [
      { id: 'me', type: 'us', label: 'You', hi: true },
      { id: 't2', type: 'us', label: '' },
      { id: 't3', type: 'us', label: '' },
      { id: 'o1', type: 'them', label: '' },
      { id: 'o2', type: 'them', label: '' },
      { id: 'b', type: 'ball' }
    ],
    steps: [
      {
        caption: 'Everyone is chasing the ball in one big bunch. It is hard to play when everyone is in the same spot.',
        pos: { me: [37.5, 36.5], t2: [32, 34], t3: [27, 37.5], o1: [33, 27], o2: [38.5, 31], b: [32.6, 32.5] },
        arrows: [{ kind: 'run', a: [37.5, 36.5], b: [52, 30], c: [48, 38] }]
      },
      {
        caption: 'Run away from the bunch to an empty space and call your teammate’s name.',
        pos: { me: [52, 30], t2: [32, 34], t3: [27, 37.5], o1: [33, 27], o2: [38.5, 31], b: [32.6, 32.5] },
        arrows: [{ kind: 'pass', a: [33.2, 31], b: [51, 31.6] }]
      },
      {
        caption: 'Now you have the ball and space to dribble. Spreading out helps the whole team.',
        pos: { me: [52, 30], t2: [33, 30], t3: [30, 36], o1: [40, 27], o2: [45, 30], b: [51, 31.6] },
        arrows: [{ kind: 'dribble', a: [52, 30], b: [44, 14], c: [53, 20] }]
      }
    ]
  }
];
