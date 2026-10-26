(function(){
'use strict';

/* ---------- Content: mistakes, highlights, drills ---------- */
const ERRORS=[
  {id:'gk_handling',pos:'gk',area:'Handling',label:'Dropped or spilled a catch'},
  {id:'gk_set',pos:'gk',area:'Set position',label:'Not set when the shot came'},
  {id:'gk_angle',pos:'gk',area:'Angles',label:'Beaten at the near post'},
  {id:'gk_line',pos:'gk',area:'Positioning',label:'Too deep or too far off his line'},
  {id:'gk_dive',pos:'gk',area:'Diving',label:'Dived late or stayed on his feet'},
  {id:'gk_cross',pos:'gk',area:'High balls',label:'Misjudged a cross or high ball'},
  {id:'gk_1v1',pos:'gk',area:'1v1s',label:'Went down too early in a 1v1'},
  {id:'gk_rebound',pos:'gk',area:'Recovery',label:'Slow to get up for the rebound'},
  {id:'gk_dist',pos:'gk',area:'Distribution',label:'Poor throw or kick out'},
  {id:'gk_feet',pos:'gk',area:'Footwork',label:'Bad touch on a back pass'},
  {id:'gk_talk',pos:'gk',area:'Communication',label:'Did not call or organize'},
  {id:'gk_focus',pos:'gk',area:'Focus',label:'Switched off for a moment'},
  {id:'st_touch',pos:'st',area:'First touch',label:'Heavy first touch'},
  {id:'st_body',pos:'st',area:'First touch',label:'Closed body when receiving'},
  {id:'st_offtarget',pos:'st',area:'Finishing',label:'Shot off target'},
  {id:'st_atkeeper',pos:'st',area:'Finishing',label:'Shot straight at the keeper'},
  {id:'st_rushed',pos:'st',area:'Composure',label:'Rushed the finish'},
  {id:'st_weakfoot',pos:'st',area:'Weak foot',label:'Avoided his weak foot'},
  {id:'st_offside',pos:'st',area:'Movement',label:'Caught offside'},
  {id:'st_static',pos:'st',area:'Movement',label:'Stood still, no runs'},
  {id:'st_holdup',pos:'st',area:'Hold-up play',label:'Lost it with his back to goal'},
  {id:'st_decision',pos:'st',area:'Decisions',label:'Shot when he should pass, or the reverse'},
  {id:'st_press',pos:'st',area:'Work rate',label:'Did not press defenders'},
  {id:'st_pace',pos:'st',area:'Speed',label:'Beaten to the ball for speed'},
  {id:'gk_across',pos:'gk',area:'Speed',label:'Too slow getting across the goal'},
  {id:'y_kickaway',pos:'young',area:'Dribbling',label:'Kicked it away instead of dribbling'},
  {id:'y_farball',pos:'young',area:'Ball control',label:'Ball got too far from his feet'},
  {id:'y_bunch',pos:'young',area:'Spacing',label:'Joined the bunch around the ball'},
  {id:'y_stopped',pos:'young',area:'Effort',label:'Stopped running after losing the ball'},
  {id:'y_onefoot',pos:'young',area:'Both feet',label:'Only used one foot'},
  {id:'y_watching',pos:'young',area:'Getting involved',label:'Watched instead of joining in'},
  {id:'y_upset',pos:'young',area:'Mindset',label:'Got upset after a mistake'}
];
const WELLS=[
  {id:'w_bigsave',pos:'gk',label:'Big save'},
  {id:'w_catches',pos:'gk',label:'Safe hands'},
  {id:'w_command',pos:'gk',label:'Owned his box'},
  {id:'w_dist',pos:'gk',label:'Smart throws and kicks'},
  {id:'w_brave',pos:'gk',label:'Brave in a 1v1'},
  {id:'w_talk',pos:'gk',label:'Organized the defense'},
  {id:'w_goal',pos:'st',label:'Finished a chance'},
  {id:'w_move',pos:'st',label:'Clever runs'},
  {id:'w_hold',pos:'st',label:'Held the ball up'},
  {id:'w_press',pos:'st',label:'Pressed hard'},
  {id:'w_weak',pos:'st',label:'Used his weak foot'},
  {id:'w_assist',pos:'st',label:'Set up a teammate'},
  {id:'w_effort',pos:'both',label:'Never stopped working'},
  {id:'w_bounce',pos:'both',label:'Bounced back after a mistake'},
  {id:'yw_dribble',pos:'young',label:'Dribbled past someone'},
  {id:'yw_headup',pos:'young',label:'Looked up while dribbling'},
  {id:'yw_bothfeet',pos:'young',label:'Used both feet'},
  {id:'yw_stop',pos:'young',label:'Stopped the ball under control'},
  {id:'yw_shot',pos:'young',label:'Took a shot'},
  {id:'yw_pass',pos:'young',label:'Passed to a teammate'},
  {id:'yw_chase',pos:'young',label:'Chased to win the ball back'},
  {id:'yw_fun',pos:'young',label:'Had a big smile'}
];
const SPEED_NOTE='Speed rules: warm up first, keep every rep short and all-out, rest fully between reps (walk back, then 30 to 60 seconds), and stop as soon as he starts slowing down.';
const YOUNG_NOTE='At this age, keep it a game: a few minutes per activity, lots of praise, and stop while he still wants more.';
const DRILLS=[
  {id:'gk_wcatch',pos:'gk',name:'W-Catch Wall Ball',mins:10,need:'A ball and a wall, or a parent to throw',fixes:['gk_handling','gk_focus'],
   steps:['Stand 3 to 4 big steps from a wall in your ready position: feet shoulder-width apart, knees bent, hands up.','Throw the ball hard at the wall at chest height. Catch the rebound with your hands in a W shape, thumbs almost touching behind the ball.','Pull the ball into your chest every time. Do 10 at chest height, then 10 at head height.'],
   cues:['Watch the ball all the way into your hands','Soft hands: no slapping sound','Elbows behind the ball, not out to the side'],score:{type:'of',n:20,unit:'clean catches'}},
  {id:'gk_scoop',pos:'gk',name:'Scoop and Basket',mins:10,need:'A ball and a parent',fixes:['gk_handling'],
   steps:['Parent rolls or side-foots the ball along the ground at you from 8 to 10 meters.','Move your feet so your whole body is behind the ball. Scoop it up with fingers pointing down.','Mix in waist-high balls: catch them in a basket with forearms and chest, then stand up tall.'],
   cues:['Your body behind the ball is the backup if your hands miss','Feet close together on rollers so nothing goes through your legs','Ball to chest, then look up to play it out'],score:{type:'of',n:20,unit:'clean pickups'}},
  {id:'gk_setstep',pos:'gk',name:'Shuffle and Set',mins:8,need:'2 cones or shoes, a ball, a parent',fixes:['gk_set','gk_dive'],
   steps:['Put two cones 2 meters apart in front of goal. Shuffle sideways between them without crossing your feet.','When the parent lifts a foot to shoot, hop into your set position: feet planted, weight on your toes, hands ready.','The parent shoots at a random moment. Score a point each time you were set before the kick.'],
   cues:['Small quick steps, not big jumps','Be still when the shooter’s foot swings','Head steady, eyes on the ball'],score:{type:'of',n:15,unit:'times set before the shot'}},
  {id:'gk_collapse',pos:'gk',name:'Collapse Dive Ladder',mins:12,need:'A ball, soft grass, a parent',fixes:['gk_dive','gk_handling'],
   steps:['Start on your knees. The parent rolls the ball a little to your side. Fall sideways onto your hip and shoulder, top hand behind the ball, bottom hand on top.','Next, start from a low crouch and do the same. Then from standing in your set position.','Do 10 to each side. Land on your side, never on your belly or elbows.'],
   cues:['Step toward the ball with the near foot, then fall','Pin the ball to the ground with both hands','Get up fast after every save'],score:{type:'of',n:20,unit:'clean saves'}},
  {id:'gk_angle',pos:'gk',name:'Narrow the Angle',mins:12,need:'5 cones, a ball, a parent',fixes:['gk_angle','gk_line'],
   steps:['Set 5 cones in an arc about 12 meters from goal: far left, left, middle, right, far right.','The parent dribbles to a cone. Picture a line from the ball to the middle of the goal and step onto it, 1 to 2 steps off your line.','The parent checks your spot, then shoots. Move to the next cone.'],
   cues:['Near post first: never get beaten between you and the near post','The wider the ball, the closer you stay to the near post','Get set before every shot'],score:{type:'of',n:15,unit:'shots saved'}},
  {id:'gk_rebound',pos:'gk',name:'Save and Recover',mins:10,need:'2 balls and a parent',fixes:['gk_rebound','gk_focus'],
   steps:['The parent shoots or rolls a ball to one side. Make the save.','Get back on your feet as fast as you can. The parent sends a second ball to the other side right away.','One rep is both saves. Rest 20 seconds between reps.'],
   cues:['Push up with hands and feet together, no rolling around','Find the ball with your eyes before you are fully up','Set again before the second shot'],score:{type:'of',n:10,unit:'double saves'}},
  {id:'gk_highball',pos:'gk',name:'Highest Point',mins:10,need:'A ball and a parent',fixes:['gk_cross','gk_talk'],
   steps:['The parent throws high balls from the side, like a cross, landing 4 to 6 meters out from goal.','Shout “Keeper!” early. Take off from one foot and lift the other knee for protection.','Catch the ball at the highest point, in front of your head, then bring it down to your chest.'],
   cues:['Call it early and loud, then commit','Take off from one foot, knee up','Catch it in front of your eyes, not behind your head'],score:{type:'of',n:15,unit:'clean catches'}},
  {id:'gk_1v1',pos:'gk',name:'Stay Big 1v1',mins:12,need:'A ball and a parent',fixes:['gk_1v1','gk_line'],
   steps:['The parent dribbles toward goal from about 18 meters.','Move forward while the ball is away from their foot. Stop and get set when they are about to touch it.','Stay on your feet as long as you can. When the shot comes, make yourself big with a spread or block instead of diving early.'],
   cues:['Close the space, then stop and set','Make the attacker decide first','Hands low and wide, body tall'],score:{type:'of',n:10,unit:'1v1s won'}},
  {id:'gk_dist',pos:'gk',name:'Target Distribution',mins:12,need:'A ball, 2 cones, a parent',fixes:['gk_dist'],
   steps:['Rolling: bowl the ball along the ground to the parent at 10 meters. 10 reps.','Overarm: throw to a cone 15 to 20 meters away. 10 reps.','Goal kicks or punts into a zone marked by 2 cones. 10 reps. Score a point for each one that lands or rolls in the target.'],
   cues:['Step toward the target as you release','Follow through and point at the target','Pick the target before you get the ball'],score:{type:'of',n:30,unit:'on target'}},
  {id:'gk_backpass',pos:'gk',name:'Back-Pass Two Touch',mins:10,need:'A ball, a parent, 2 cones as a small gate',fixes:['gk_feet'],
   steps:['The parent passes the ball back to you like a defender would.','First touch out of your feet, away from the parent, who runs to press you.','Second touch: pass through a cone gate to the side. Use both feet.'],
   cues:['Look before the ball arrives','First touch away from pressure','Calm and simple: nothing fancy in front of goal'],score:{type:'of',n:20,unit:'clean touches'}},
  {id:'gk_reaction',pos:'gk',name:'Tennis Ball Reactions',mins:8,need:'A tennis ball, a wall, a parent',fixes:['gk_focus','gk_handling','gk_set'],
   steps:['Stand 2 meters from a wall in your set position, facing it.','The parent stands behind you and throws a tennis ball off the wall.','Catch it as it comes back. Start with two hands, then one hand.'],
   cues:['Stay on your toes','Hands up and ready, not resting on your knees','Breathe and reset after every catch'],score:{type:'of',n:30,unit:'catches'}},
  {id:'gk_voice',pos:'gk',name:'Keeper Calls',mins:5,need:'A parent',fixes:['gk_talk','gk_focus'],
   steps:['Learn 5 calls: “Keeper!” (it’s mine), “Away!” (clear it), “Man on!” (pressure coming), “Time!” (no pressure), “Step up!” (move the line out).','The parent describes a game moment, for example “their striker is running behind our defender.”','Answer with the right call, loud and fast. Then use the calls during every shooting drill.'],
   cues:['Loud, short, and early','Use names: “Sam, man on!”','A quiet keeper makes a nervous team'],score:{type:'of',n:10,unit:'right calls'}},
  {id:'st_wall2',pos:'st',name:'Wall Two-Touch',mins:10,need:'A ball and a wall',fixes:['st_touch','st_body'],
   steps:['Stand 5 meters from a wall. Pass the ball against it.','Receive with the foot farther from the wall, touching the ball across your body and out of your feet.','Pass again with your second touch. Switch feet each rep. Count clean touches in 60 seconds.'],
   cues:['Open your hips so you can see the field','Touch the ball into space, not under you','On your toes before the ball arrives'],score:{type:'count',unit:'clean touches in 60 seconds'}},
  {id:'st_corners',pos:'st',name:'Corner Pockets',mins:12,need:'Balls, a goal, 2 shirts or cones for the corners',fixes:['st_offtarget','st_atkeeper'],
   steps:['Hang a shirt or put a cone just inside each bottom corner of the goal.','Shoot from the edge of the penalty area. Aim low and into a corner, never the middle.','10 shots to the left corner, 10 to the right. Hitting the corner zone scores a point.'],
   cues:['Plant foot next to the ball, pointing at the target','Laces through the middle of the ball, toe down','Look at the corner, then at the ball as you strike'],score:{type:'of',n:20,unit:'corners hit'}},
  {id:'st_weak',pos:'st',name:'Weak Foot Only',mins:10,need:'Balls and a goal or wall target',fixes:['st_weakfoot','st_offtarget'],
   steps:['Only your weaker foot is allowed today.','Start with 10 side-foot passes into a corner from 10 meters.','Then 10 laces shots. Count the ones on target.'],
   cues:['Accuracy first, power later','Same technique as your strong foot: plant, lock the ankle, follow through','Misses at first are how it gets better'],score:{type:'of',n:20,unit:'on target'}},
  {id:'st_cool1v1',pos:'st',name:'Cool Finish 1v1',mins:12,need:'Balls, a goal, a parent in goal',fixes:['st_rushed','st_atkeeper','st_decision'],
   steps:['Start about 25 meters out. Dribble at the parent in goal.','Look up once before you finish. Choose: pass it into a corner, or go around the keeper.','Do 10 tries. If the keeper rushes out, go around. If they stay home, pass it in.'],
   cues:['Look up, pick a side, then strike','Placement beats power in a 1v1','Shoot before the keeper is set, or take them on'],score:{type:'of',n:10,unit:'goals'}},
  {id:'st_turn',pos:'st',name:'Receive, Turn, Shoot',mins:12,need:'Balls, a goal, a parent passing, 1 cone as a defender',fixes:['st_holdup','st_body','st_touch'],
   steps:['Stand with your back to goal next to a cone that plays the defender. The parent passes into your feet.','Check over your shoulder before the ball arrives. Turn with the inside or outside of your foot, away from the cone.','Shoot within 2 touches of turning.'],
   cues:['Check your shoulder twice','Your first touch is the turn','Head over the ball when you shoot'],score:{type:'of',n:15,unit:'on target'}},
  {id:'st_runs',pos:'st',name:'Curve Runs and Timing',mins:10,need:'4 cones as the defensive line, a ball, a parent',fixes:['st_offside','st_static'],
   steps:['Put a row of cones across the field as the last defender line. The parent stands 20 meters back with the ball.','Start level with the cones. Curve your run along the line so you stay onside.','Burst forward the moment the parent’s head goes down to pass. Finish with a touch and a shot.'],
   cues:['Bend the run, do not run straight too early','Go when the passer’s head goes down','Watch the defender line and the ball at the same time'],score:{type:'of',n:15,unit:'onside and on time'}},
  {id:'st_onetouch',pos:'st',name:'One-Touch Finishes',mins:10,need:'Balls, a goal, a parent feeding from the side',fixes:['st_rushed','st_offtarget'],
   steps:['The parent rolls balls across the front of goal from the side.','Arrive on the ball and side-foot it first time toward the far corner.','Switch sides after 10 so both feet get reps.'],
   cues:['Arrive late and fast, not early and waiting','Side-foot, ankle locked','Aim for the far post'],score:{type:'of',n:20,unit:'on target'}},
  {id:'st_shield',pos:'st',name:'Shield and Hold',mins:8,need:'A ball and a parent playing defender',fixes:['st_holdup'],
   steps:['The parent stands behind you and passes the ball in from the side.','Receive with your back to the parent. Keep the ball on your far foot with your body in between.','Hold it for 5 seconds while the parent leans and pokes, then lay it off.'],
   cues:['Knees bent, low and wide','Arm out to feel where the defender is','Ball on the foot farthest from them'],score:{type:'of',n:10,unit:'5-second holds'}},
  {id:'st_press',pos:'st',name:'Cone Press Sprints',mins:8,need:'3 cones and a parent',fixes:['st_press','st_static'],
   steps:['Put 3 cones in a line, 10 meters apart. They are defenders.','The parent points at one. Sprint at it on a curved run that blocks the pass to the next cone.','Slow down and get your feet set as you arrive. Walk back. Do 10.'],
   cues:['Curve the run to cut off one side','Sprint, then small steps to stop','Pressing wins the ball back near their goal'],score:{type:'of',n:10,unit:'full-effort presses'}},
  {id:'st_decide',pos:'st',name:'Shoot or Pass?',mins:10,need:'2 different colored cones, balls, a goal, a parent',fixes:['st_decision'],
   steps:['Put one red and one blue cone near the penalty spot.','Dribble toward goal. As you go, the parent shouts a color: red means shoot, blue means pass back to the parent.','Make the right choice fast, then do it well.'],
   cues:['Head up while dribbling','Decide early, then commit','A good pass is as good as a goal'],score:{type:'of',n:15,unit:'right choices'}},
  {id:'both_juggle',pos:'both',name:'Juggling Record',mins:8,need:'A ball',fixes:['st_touch','gk_feet'],
   steps:['Juggle using feet and thighs only.','Take 5 attempts and log your best streak.','Bonus round: weaker foot only.'],
   cues:['Soft ankle, toe slightly up','Keep the ball below your waist','Little touches, little hops'],score:{type:'count',unit:'best streak'}},
  {id:'both_feet',pos:'both',name:'Quick Feet Ladder',mins:8,need:'An agility ladder, or 8 cones or shoes half a meter apart',fixes:['gk_set','gk_rebound','st_static'],
   steps:['Lay out the ladder or markers in a line.','Do 2 runs of each pattern: two feet in each box, sideways shuffle, in-in-out-out, hopscotch.','Finish each run with a 5-meter sprint or by landing in your set position.'],
   cues:['Up on your toes','Pump your arms to make your feet faster','Clean steps first, then speed'],score:{type:'done'}},
  {id:'sp_warmup',pos:'speed',name:'Speed Warm-up',mins:5,ages:[6,18],need:'Open space about 20 meters long',fixes:[],
   steps:['Jog easily for 2 minutes.','Then 15 meters each: high knees, butt kicks, side shuffles both ways, skipping, and jogging backward.','Finish with 3 build-up runs: start slow and get faster, reaching about 80 percent of top speed at the end.'],
   cues:['Warm muscles are fast muscles','Stay light on your toes','A little faster on every build-up run'],score:{type:'done'}},
  {id:'sp_form',pos:'speed',name:'Fast Feet Form',mins:8,ages:[8,18],need:'Open space about 20 meters long',fixes:['st_pace'],note:SPEED_NOTE,
   steps:['March with high knees for 15 meters, swinging your arms from hip to chin.','A-skips for 15 meters, twice: a skip where the knee drives up and the foot lands under your hips.','Finish with 2 relaxed fast runs of 20 meters, using the same arm swing.'],
   cues:['Tall body, eyes forward','Drive the knee up, land under your hips','Arms swing forward and back, not across your body'],score:{type:'done'}},
  {id:'sp_falling',pos:'speed',name:'Falling Starts',mins:8,ages:[9,18],need:'Open space and 2 cones 10 meters apart',fixes:['st_pace','gk_across'],note:SPEED_NOTE,
   steps:['Stand tall at the first cone with your feet together.','Lean forward like a falling tree until you have to step, then sprint hard to the cone 10 meters away.','Walk back slowly to rest before the next one.'],
   cues:['Lean from the ankles with a straight body','Short, powerful first steps','Push the ground back behind you'],score:{type:'done'}},
  {id:'sp_reaction',pos:'speed',name:'Ball Drop Race',mins:8,ages:[7,18],need:'A tennis ball and a parent',fixes:['st_pace','gk_focus','gk_across'],note:SPEED_NOTE,
   steps:['Stand 3 big steps from the parent in a ready stance.','The parent holds a tennis ball out at shoulder height and drops it without warning.','Sprint and catch it before it bounces twice. Take one step farther back after each catch.'],
   cues:['React to the drop, do not guess','The first three steps are the fastest ones','Stay low and reach at the end'],score:{type:'of',n:8,unit:'catches before the second bounce'}},
  {id:'sp_flying',pos:'speed',name:'Flying 20s',mins:12,ages:[10,18],need:'Open space 40 meters long, 3 cones, a phone stopwatch',fixes:['st_pace'],note:SPEED_NOTE,
   steps:['Put cones at 0, 15 and 35 meters. Build up speed from the first cone so you hit top speed at the second.','Sprint flat out through the 20 meters between the second and third cones. The parent times only that part.','Walk back and rest 2 to 3 minutes before the next one. Log the fastest time.'],
   cues:['Relax your face and shoulders at top speed','Run tall','Keep pumping your arms through the last cone'],score:{type:'time',unit:'seconds'}},
  {id:'sp_test',pos:'speed',name:'20 m Sprint Test',mins:6,ages:[8,18],need:'Open space, 2 cones 20 meters apart, a phone stopwatch',fixes:[],note:SPEED_NOTE,
   steps:['Warm up first.','Start standing at the first cone. The parent says “Go!” and starts the stopwatch at the same moment.','Sprint through the second cone. Rest 2 minutes between tries. Do 3 and log the fastest.'],
   cues:['Same start every time, so the test is fair','Run through the cone, not to it','Rest fully between tries'],score:{type:'time',unit:'seconds'}},
  {id:'sp_dribble',pos:'speed',name:'Speed Dribble 20',mins:10,ages:[9,18],need:'A ball, 2 cones 20 meters apart, a phone stopwatch',fixes:['st_pace','st_touch'],note:SPEED_NOTE,
   steps:['Dribble from one cone to the other as fast as you can while keeping control.','Push the ball a few steps ahead with your laces, then catch up to it.','The ball has to stop within a step of the last cone. Rest 1 to 2 minutes between tries and log the fastest.'],
   cues:['Laces, toe down, push it ahead','At top speed, touch it every 3 or 4 steps','Eyes up between touches'],score:{type:'time',unit:'seconds'}},
  {id:'sp_shuttle',pos:'speed',name:'5-10-5 Shuttle',mins:10,ages:[9,18],need:'3 cones 5 meters apart in a line, a phone stopwatch',fixes:['st_pace','gk_across','st_press'],note:SPEED_NOTE,
   steps:['Start at the middle cone in a low stance.','Sprint 5 meters to one side and touch the line, sprint 10 meters to the far cone and touch it, then sprint back through the middle.','Rest 1 to 2 minutes. Switch which way you go first each time. Log the fastest.'],
   cues:['Stay low when you turn','Plant the outside foot and push off','Touch the line with your hand'],score:{type:'time',unit:'seconds'}},
  {id:'sp_bounds',pos:'speed',name:'Pogo Hops and Bounds',mins:6,ages:[9,18],need:'Grass or another soft, flat surface',fixes:['st_pace','gk_dive'],note:SPEED_NOTE,
   steps:['Pogo hops: 2 sets of 10 small, quick hops on the balls of your feet, knees almost straight.','Bounds: 2 sets of 5 big running leaps, pushing off one foot and landing on the other.','Rest 1 minute between sets. Stop when the landings get loud or wobbly.'],
   cues:['Quiet, springy landings','Short ground contact, like the ground is hot','Drive the knee forward on each bound'],score:{type:'done'}},
  {id:'gk_firststep',pos:'gk',name:'Explosive First Step',mins:10,ages:[10,18],need:'2 cones 3 meters either side of the goal center, a parent',fixes:['gk_across','gk_dive','gk_set'],note:SPEED_NOTE,
   steps:['Start in your set position in the middle of the goal.','The parent points left or right. Take one powerful side step, then push off and dive to that cone.','Get up and set again as fast as you can. Rest 20 seconds between reps.'],
   cues:['Push off the foot nearest the ball','Dive low and long, not up and short','Back up and set in under 2 seconds'],score:{type:'of',n:10,unit:'reached the cone'}},
  {id:'y_redlight',pos:'young',name:'Red Light, Green Light',mins:8,ages:[4,8],need:'A ball and a parent',fixes:['y_kickaway','y_farball'],note:YOUNG_NOTE,
   steps:['He dribbles around the yard while you call out the lights.','Green light: dribble fast. Yellow light: tiny, slow touches. Red light: stop the ball with the bottom of your foot.','Add silly lights: purple means weaker foot only, blue means turn around.'],
   cues:['Little touches keep the ball close','Foot on top of the ball to stop it','Eyes up so you can see where you are going'],score:{type:'of',n:10,unit:'stops under control'}},
  {id:'y_sharks',pos:'young',name:'Shark Attack',mins:8,ages:[4,8],need:'A ball, 4 cones or shoes for a box, a parent as the shark',fixes:['y_kickaway','y_farball','y_watching'],note:YOUNG_NOTE,
   steps:['Make a box about 10 big steps across. He starts on one side with the ball.','You are the shark in the middle. He dribbles to the other side without losing the ball.','Start as a slow shark and speed up as he gets better. Swap roles sometimes.'],
   cues:['Keep the ball close when the shark is near','Look for the open space and go there','Change direction to escape'],score:{type:'of',n:10,unit:'safe crossings'}},
  {id:'y_bodyparts',pos:'young',name:'Body Part Stop',mins:6,ages:[4,8],need:'A ball and a parent',fixes:['y_farball'],note:YOUNG_NOTE,
   steps:['He dribbles around. You call out a body part: foot, knee, bottom, elbow, nose!','He stops the ball and touches it with that body part as fast as he can.','Count out loud to make it a race.'],
   cues:['Stop the ball first, then touch it','Keep it close so you can stop it fast','Laugh at the silly ones'],score:{type:'of',n:10,unit:'quick stops'}},
  {id:'y_toetaps',pos:'young',name:'Toe Taps',mins:5,ages:[4,10],need:'A ball',fixes:['y_onefoot'],note:YOUNG_NOTE,
   steps:['Stand with the ball in front of you.','Tap the top of the ball with the bottom of one foot, then the other, like a little dance.','Count the taps in 30 seconds and try to beat your record.'],
   cues:['Light taps on top of the ball','Stay on your toes','Arms out for balance'],score:{type:'count',unit:'taps in 30 seconds'}},
  {id:'y_slalom',pos:'young',name:'Cone Slalom',mins:8,ages:[4,10],need:'5 cones or shoes in a line, a ball',fixes:['y_onefoot','y_farball'],note:YOUNG_NOTE,
   steps:['Put 5 cones in a line, about two big steps apart.','Dribble in and out of the cones to the end, then back.','Use the inside and outside of both feet. A clean run means no cones touched.'],
   cues:['Small touches around each cone','Use both feet','Look up between touches'],score:{type:'of',n:5,unit:'clean runs'}},
  {id:'y_monster',pos:'young',name:'Shoot the Monster',mins:8,ages:[4,8],need:'Balls, a goal or 2 cones, a parent as the monster',fixes:[],note:YOUNG_NOTE,
   steps:['You stand in goal as a silly monster.','He dribbles up and shoots. When he scores, the monster falls over. Ham it up.','Bonus points for the weaker foot or for hitting a corner.'],
   cues:['Look at the goal, then the ball','Kick with your laces for power','Score, then get the ball back fast'],score:{type:'of',n:10,unit:'goals'}},
  {id:'y_tail',pos:'young',name:'Tail Tag',mins:6,ages:[4,10],need:'2 scarves or shirts to tuck in as tails, a parent',fixes:['y_stopped','y_watching'],note:YOUNG_NOTE,
   steps:['Tuck a tail into the back of his waistband, and one into yours.','Chase each other in a small area and try to grab the other tail.','Play 3 rounds of about 30 seconds, with a short rest in between.'],
   cues:['Quick feet to dodge','Change direction fast','Never stop chasing'],score:{type:'count',unit:'tails grabbed'}},
  {id:'y_animals',pos:'young',name:'Animal Moves',mins:6,ages:[4,8],need:'Open space',fixes:['y_stopped'],note:YOUNG_NOTE,
   steps:['Race from one line to another, moving like animals.','Bear crawl, frog jumps, bunny hops, crab walk, and a cheetah sprint.','You call the animal and he moves like it. Always finish with a cheetah sprint.'],
   cues:['Strong arms for the bear crawl','Soft landings for frog jumps','Cheetahs run on their toes'],score:{type:'done'}},
  {id:'y_softcatch',pos:'young',name:'Soft Catch',mins:6,ages:[4,8],need:'A soft ball or beach ball, a parent',fixes:[],note:YOUNG_NOTE,
   steps:['Toss a soft ball to him from a few steps away.','He catches it with two hands and hugs it into his tummy.','Mix in rolling balls to scoop up and gentle throws to the side.'],
   cues:['Watch the ball into your hands','Hands ready, thumbs close together','Hug the ball after you catch it'],score:{type:'of',n:10,unit:'catches'}},
  {id:'y_spread',pos:'young',name:'Find the Open Spot',mins:6,ages:[5,9],need:'4 cones or shoes, a ball, a parent',fixes:['y_bunch'],note:YOUNG_NOTE,
   steps:['Put 4 cones in a big square. These are the open spots.','Stand near one cone with the ball. He runs to the spot farthest from you and calls your name.','Pass him the ball when he gets there. Move to a new cone and play again.'],
   cues:['Run away from the crowd','Call for the ball','Face the ball when you get there'],score:{type:'of',n:10,unit:'right spots'}},
  {id:'y_nextplay',pos:'young',name:'Next Play!',mins:5,ages:[4,12],need:'Any game you play together',fixes:['y_upset'],note:YOUNG_NOTE,
   steps:['Pick any game you are already playing together.','Whenever someone makes a mistake, you included, they shout “Next play!” and jump straight back in.','Make a few silly mistakes on purpose so he sees you bounce back too.'],
   cues:['Mistakes mean you are trying','Shout it and smile','The next play is the important one'],score:{type:'done'}}
];
const ERR=Object.fromEntries(ERRORS.map(e=>[e.id,e]));
const WELL=Object.fromEntries(WELLS.map(w=>[w.id,w]));
const DRILL=Object.fromEntries(DRILLS.map(d=>[d.id,d]));
/* Ages each original drill suits, so a 6-year-old and an 11-year-old see different lists. */
const DRILL_AGES={gk_wcatch:[8,18],gk_scoop:[7,18],gk_setstep:[9,18],gk_collapse:[9,18],gk_angle:[10,18],gk_rebound:[9,18],gk_highball:[10,18],gk_1v1:[10,18],gk_dist:[9,18],gk_backpass:[10,18],gk_reaction:[8,18],gk_voice:[9,18],
  st_wall2:[8,18],st_corners:[7,18],st_weak:[8,18],st_cool1v1:[8,18],st_turn:[9,18],st_runs:[10,18],st_onetouch:[9,18],st_shield:[8,18],st_press:[9,18],st_decide:[8,18],both_juggle:[8,18],both_feet:[6,18]};
DRILLS.forEach(d=>{if(!d.ages)d.ages=DRILL_AGES[d.id]||[9,18];});
/* One plain sentence per drill, shown on cards so a parent knows what it is at a glance. */
const DRILL_WHAT={
  gk_wcatch:'Throw the ball at a wall and catch the rebound with your hands in a W shape.',
  gk_scoop:'You roll or kick the ball along the ground; he gets behind it and scoops it up.',
  gk_setstep:'He shuffles side to side between two cones and gets set before you shoot.',
  gk_collapse:'Low diving practice that starts on his knees and builds up to standing.',
  gk_angle:'You dribble to different spots; he steps across to cover the goal, then saves your shot.',
  gk_rebound:'He makes a save, gets up fast, and saves a second ball on the other side.',
  gk_highball:'You throw high balls like a cross; he calls “Keeper!” and catches them at the top.',
  gk_1v1:'You dribble at him; he closes you down and stays big instead of diving early.',
  gk_dist:'Rolling, throwing and kicking the ball to targets 10 to 20 meters away.',
  gk_backpass:'You pass back to him; he touches it away from you and passes with either foot.',
  gk_reaction:'Standing behind him, you bounce a tennis ball off a wall; he reacts and catches it.',
  gk_voice:'He learns the 5 calls a keeper shouts and practices using them fast.',
  gk_firststep:'You point left or right; he side-steps and dives to a cone as fast as he can.',
  st_wall2:'Pass against a wall, control it with one touch, pass again. Count clean touches in 60 seconds.',
  st_corners:'Shooting from the edge of the box at targets in the two bottom corners.',
  st_weak:'Passing and shooting at a target using only his weaker foot.',
  st_cool1v1:'He dribbles at you in goal and finishes calmly: pass it in or go around you.',
  st_turn:'You pass to him with his back to goal; he turns and shoots within 2 touches.',
  st_runs:'He times a curved run along a line of cones so he stays onside and gets in behind.',
  st_onetouch:'You roll balls across the goal; he shoots first time into the far corner.',
  st_shield:'With you leaning on his back, he keeps the ball for 5 seconds, then passes.',
  st_press:'You point at one of 3 cones; he sprints at it on a curved run to block a pass.',
  st_decide:'He dribbles at goal while you shout a color: one means shoot, the other means pass.',
  both_juggle:'Keepie-uppies with feet and thighs. Log his best streak.',
  both_feet:'Quick-step patterns through a ladder or a line of markers.',
  sp_warmup:'Easy jogging, skips, shuffles and 3 build-up runs before any sprinting.',
  sp_form:'High-knee marches and skips that teach a tall, fast running style.',
  sp_falling:'He leans forward until he has to step, then sprints 10 meters. Builds fast starts.',
  sp_reaction:'You drop a tennis ball without warning; he sprints to catch it before it bounces twice.',
  sp_flying:'He builds up speed, then you time him over 20 meters at top speed.',
  sp_test:'A timed 20-meter sprint from a standing start. His speed benchmark.',
  sp_dribble:'A timed 20-meter dribble at full speed, keeping the ball under control.',
  sp_shuttle:'A timed sprint: 5 meters one way, 10 meters back, then 5 meters to the middle.',
  sp_bounds:'Small quick hops, then big running leaps. Builds springy, fast legs.',
  y_redlight:'He dribbles while you call lights: green is fast, yellow is slow, red is stop.',
  y_sharks:'He dribbles across a box while you, the shark, try to take the ball.',
  y_bodyparts:'You call a body part; he stops the ball and touches it with that part.',
  y_toetaps:'He taps the top of the ball with alternating feet. Count the taps in 30 seconds.',
  y_slalom:'He dribbles in and out of a line of cones without touching them.',
  y_monster:'You are a silly monster in goal; he dribbles up and scores on you.',
  y_tail:'A tag game: you each tuck in a scarf tail and try to grab the other one.',
  y_animals:'Races moving like a bear, frog, bunny, crab and cheetah.',
  y_softcatch:'Easy catching with a soft ball: two hands, then hug it in.',
  y_spread:'He runs to the open cone farthest from you and calls for the pass.',
  y_nextplay:'When anyone makes a mistake, they shout “Next play!” and keep going.'
};
DRILLS.forEach(d=>{d.what=DRILL_WHAT[d.id]||'';});

/* Things a player can choose to work on. Each lists drills in order of preference; age filtering picks the right ones. */
const GOALS=[
  {id:'speed',label:'Speed',why:'Short, all-out efforts with full rest, at the start of a session while he is fresh.',drills:['sp_falling','sp_reaction','sp_flying','sp_dribble','sp_shuttle','sp_form','sp_bounds','gk_firststep','y_tail','y_animals']},
  {id:'shooting',label:'Shooting',why:'Lots of shots at a target, with both feet.',drills:['st_corners','st_onetouch','st_weak','st_cool1v1','y_monster']},
  {id:'dribbling',label:'Dribbling',why:'Close control first, then speed with the ball.',drills:['sp_dribble','st_cool1v1','st_shield','y_redlight','y_sharks','y_slalom']},
  {id:'weakfoot',label:'Weak foot',why:'A few minutes every session using only the weaker foot.',drills:['st_weak','y_toetaps','y_slalom','st_wall2']},
  {id:'touch',label:'First touch',why:'Lots of touches on the ball, every day.',drills:['st_wall2','both_juggle','y_bodyparts','gk_backpass']},
  {id:'hands',label:'Keeper hands',why:'Clean catches every time, starting easy and getting harder.',drills:['gk_wcatch','gk_scoop','gk_reaction','gk_highball','y_softcatch']},
  {id:'diving',label:'Diving',why:'Technique first on soft grass, then add speed.',drills:['gk_collapse','gk_setstep','gk_firststep']},
  {id:'confidence',label:'Confidence',why:'Bounce back from mistakes and enjoy the game.',drills:['y_nextplay','st_cool1v1']}
];
const GOAL=Object.fromEntries(GOALS.map(g=>[g.id,g]));
const SPEED_RULES=[
  'Twice a week, with at least one day off in between. Avoid the day before a game if you can.',
  'About 20 minutes. Always start with the warm-up, and do the program before any other drills, while he is fresh.',
  'Every rep is short and all-out. Walk back and rest fully before the next one.',
  'Stop a drill early if he is getting slower or sloppy. Tired sprinting does not make kids faster.',
  'He takes the 20 m sprint test in weeks 1, 4 and 6, so you can both see the progress.',
  'At this age most speed comes from better technique, coordination and quick reactions. No weights needed.',
  'If his knees or heels hurt, skip the sprints and jumps and check with his doctor. Growing kids often get sore there.'
];
/* Each session lists [drill id, how much]. */
const PROGRAMS=[{id:'speed6',goal:'speed',ages:[9,14],title:'6-week speed program',
  summary:'Two 20-minute sessions a week for faster starts, quicker reactions and a higher top speed, with a sprint test to track progress.',
  weeks:[
    [{name:'Session A',focus:'Baseline test and running form',items:[['sp_warmup','5 min'],['sp_test','3 tries, log the fastest'],['sp_form','2 rounds'],['sp_reaction','8 reps']]},
     {name:'Session B',focus:'Quick feet and fast starts',items:[['sp_warmup','5 min'],['both_feet','2 runs of each pattern'],['sp_falling','6 reps'],['sp_reaction','6 reps']]}],
    [{name:'Session A',focus:'Acceleration',items:[['sp_warmup','5 min'],['sp_form','2 rounds'],['sp_falling','6 reps'],['sp_dribble','4 reps']]},
     {name:'Session B',focus:'Change of direction',items:[['sp_warmup','5 min'],['sp_bounds','1 round'],['sp_shuttle','4 reps'],['gk_firststep','4 each side']]}],
    [{name:'Session A',focus:'Top speed',items:[['sp_warmup','5 min'],['sp_falling','4 reps'],['sp_flying','3 reps'],['sp_reaction','6 reps']]},
     {name:'Session B',focus:'Speed with the ball',items:[['sp_warmup','5 min'],['sp_bounds','1 round'],['sp_dribble','5 reps'],['sp_shuttle','4 reps']]}],
    [{name:'Session A',focus:'Check-in test and reactions',items:[['sp_warmup','5 min'],['sp_test','3 tries, log the fastest'],['sp_reaction','8 reps'],['both_feet','2 runs of each pattern']]},
     {name:'Session B',focus:'Explosive starts',items:[['sp_warmup','5 min'],['sp_form','1 round'],['sp_falling','6 reps'],['gk_firststep','5 each side']]}],
    [{name:'Session A',focus:'Top speed',items:[['sp_warmup','5 min'],['sp_bounds','2 rounds'],['sp_flying','4 reps'],['sp_shuttle','3 reps']]},
     {name:'Session B',focus:'Game speed',items:[['sp_warmup','5 min'],['sp_reaction','6 reps'],['sp_dribble','5 reps'],['sp_shuttle','4 reps']]}],
    [{name:'Session A',focus:'Put it all together',items:[['sp_warmup','5 min'],['sp_falling','4 reps'],['sp_flying','4 reps'],['gk_firststep','5 each side']]},
     {name:'Session B',focus:'Final test',items:[['sp_warmup','5 min'],['sp_form','1 round'],['sp_test','3 tries, log the fastest'],['sp_reaction','6 reps, just for fun']]}]
  ]}];
const PROGRAM=Object.fromEntries(PROGRAMS.map(p=>[p.id,p]));
const ZONES=['TL','TC','TR','BL','BC','BR'];
const ZONE_LABEL={TL:'Top left',TC:'Top middle',TR:'Top right',BL:'Bottom left',BC:'Bottom middle',BR:'Bottom right',U:'Not sure where'};
const POS_NAME={gk:'Goalkeeper',st:'Striker',both:'Keeper + Striker',speed:'Speed and agility',young:'Game for ages 5 to 8',all:'Plays everywhere'};
const POS_SHORT={gk:'GK',st:'ST',both:'GK + ST',speed:'Speed',young:'Ages 5-8',aim:'His goal'};
const RES_NAME={W:'Win',L:'Loss',D:'Draw'};
const RATE_NAME={fun:'Fun',effort:'Effort',confidence:'Confidence',overall:'Overall'};
const COMPS=['League','Cup','Tournament','Friendly','Scrimmage'];
const SHOT_RES=[{id:'goal',label:'Goal'},{id:'on',label:'Saved'},{id:'off',label:'Missed'},{id:'blocked',label:'Blocked'}];
const K_GAME='ksl:gameDraft', K_SESS='ksl:sessionDraft', K_PLAYER='ksl:player';
const K_BOARD='ksl:boardDraft';
const K_DATA='ksl:data:v1', K_BACKUP='ksl:lastBackup', K_SNOOZE='ksl:backupSnooze', K_NOINSTALL='ksl:hideInstall';
const NO_DB='This browser is blocking storage, so nothing can be saved. Turn off Private Browsing, or open the app from your home screen.';
const FORM_VIEWS=new Set(['gameform','sessionform','player','boardedit']);
const IS_IOS=/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const IS_INSTALLED=window.navigator.standalone===true||(window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches);

/* ---------- State ---------- */
const S={db:null,checked:false,canWrite:false,
  profile:defaultProfile(),players:[],pid:lsGet(K_PLAYER),pfNew:false,
  allGames:[],allSessions:[],games:[],sessions:[],gotGames:false,gotSessions:false,
  view:'home',arg:null,gd:null,gEdit:null,gResumed:false,sd:null,sEdit:null,sResumed:false,pf:null,
  drillPos:'all',allSess:false,pendingImport:null,
  boards:[],gotBoards:false,bd:null,bEdit:null,bStep:0,bTool:'move',bSel:null,bHist:[],drag:null,dragSnap:null,playing:false,playPos:'all'};

/* ---------- Helpers ---------- */
const $=s=>document.querySelector(s);
const view=$('#view');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const clone=o=>JSON.parse(JSON.stringify(o));
const plural=(n,one,many)=>n===1?one:many;
function isoOf(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function todayISO(){return isoOf(new Date());}
function parseISO(s){const p=String(s||'').split('-').map(Number);return new Date(p[0]||1970,(p[1]||1)-1,p[2]||1);}
function fmtDate(s,opt){return parseISO(s).toLocaleDateString(undefined,opt||{weekday:'short',month:'short',day:'numeric'});}
function shortDate(s){const d=parseISO(s);return (d.getMonth()+1)+'/'+d.getDate();}
function weekStart(d){const x=new Date(d.getFullYear(),d.getMonth(),d.getDate());x.setDate(x.getDate()-((x.getDay()+6)%7));return x;}
function lsGet(k){try{return JSON.parse(localStorage.getItem(k)||'null');}catch(e){return null;}}
function lsSet(k,v){try{if(v==null)localStorage.removeItem(k);else localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
function getPath(o,p){return p.split('.').reduce((a,k)=>a==null?a:a[k],o);}
function setPath(o,p,v){const ks=p.split('.');let a=o;for(let i=0;i<ks.length-1;i++){if(a[ks[i]]==null||typeof a[ks[i]]!=='object')a[ks[i]]={};a=a[ks[i]];}a[ks[ks.length-1]]=v;}

function defaultProfile(){return {name:'',team:'',preferred:'gk',weeklyGoal:3,birthYear:null,goals:[],program:null};}
function newGame(){
  const young=isYoung(),pref=S.profile.preferred;
  return {date:todayISO(),opponent:'',venue:'home',comp:'League',us:0,them:0,
    played:young?{young:true}:{gk:pref==='gk',st:pref==='st'},gkMins:'',stMins:'',
    gk:{saves:0,catches:0,drops:0,high:0,distGood:0,distBad:0},zones:[],st:{assists:0,chances:0},young:{goals:0,beat:0,won:0},shots:[],pending:null,
    errors:{},wells:[],ratings:young?{fun:0,effort:0}:{effort:0,confidence:0,overall:0},great:'',work:'',notes:''};
}
function normGame(g){
  const base=newGame(),o=Object.assign(newGame(),g);
  o.played=Object.assign({gk:false,st:false},g.played||{});
  o.gk=Object.assign(base.gk,g.gk||{});
  o.st=Object.assign(base.st,g.st||{});
  o.young=Object.assign(base.young,g.young||{});
  o.zones=Array.isArray(g.zones)?g.zones:[];
  o.shots=Array.isArray(g.shots)?g.shots:[];
  o.errors=Object.assign({},g.errors||{});
  o.wells=Array.isArray(g.wells)?g.wells.slice():[];
  o.ratings=Object.assign(o.played.young?{fun:0,effort:0}:{effort:0,confidence:0,overall:0},g.ratings||{});
  if(o.gkMins==null)o.gkMins='';
  if(o.stMins==null)o.stMins='';
  return o;
}
function mkItem(id,dose){return {drillId:id,score:'',outOf:DRILL[id].score.n||'',dose:dose||''};}
function newSession(id){return {date:todayISO(),minutes:'',items:id?[mkItem(id)]:[],feel:0,notes:''};}
function normSession(s){
  const o=Object.assign(newSession(),s);
  o.items=(Array.isArray(s.items)?s.items:[]).filter(i=>DRILL[i.drillId]).map(i=>({drillId:i.drillId,score:i.score==null?'':i.score,outOf:i.outOf==null?(DRILL[i.drillId].score.n||''):i.outOf,dose:i.dose||''}));
  if(o.minutes==null)o.minutes='';
  return o;
}

/* ---------- Players and ages ---------- */
const THIS_YEAR=new Date().getFullYear();
function ageOf(p){const y=+((p||S.profile||{}).birthYear);return y>1900?THIS_YEAR-y:null;}
function isYoung(p){const a=ageOf(p);return a!=null&&a<=8;}
function fitsAge(d,p){const a=ageOf(p),r=d.ages||[9,18];return a==null?r[1]>8:a>=r[0]&&a<=r[1];}
function applyPlayer(){
  if(!S.players.some(p=>p.id===S.pid))S.pid=S.players.length?S.players[0].id:null;
  const p=S.players.find(x=>x.id===S.pid);
  S.profile=Object.assign(defaultProfile(),p?clone(p):{});
  S.games=S.allGames.filter(g=>g.playerId===S.pid);
  S.sessions=S.allSessions.filter(x=>x.playerId===S.pid);
}
function playerDoc(){const p=S.players.find(x=>x.id===S.pid);return p?clone(p):null;}
async function writePlayer(p){const d=clone(p);delete d.id;await S.db.doc('players/'+p.id).set(d);}
function whoBar(always){
  if(!S.players.length||(!always&&S.players.length<2))return '';
  return `<div class="who" role="group" aria-label="Choose a player">${S.players.map(p=>{const on=p.id===S.pid,a=ageOf(p);return `<button type="button" class="whochip ${on?'on':''}" data-a="pickPlayer" data-id="${esc(p.id)}" aria-pressed="${on}">${esc(p.name||'Player')}${a!=null?`<small>${a}</small>`:''}</button>`;}).join('')}${S.canWrite&&always?'<button type="button" class="whochip add" data-a="addPlayer">+ Add player</button>':''}</div>`;
}
/* The first version kept one player and no playerId; give that data a player record. */
function migrate(db){
  const all=db.exportAll(),players=all.players||{},now=new Date().toISOString();
  let ids=Object.keys(players);
  if(!ids.length){
    const prof=(all.meta&&all.meta.profile)||{};
    db.collection('players').doc('p1').set(Object.assign(defaultProfile(),prof,{createdAt:now})).catch(()=>{});
    ids=['p1'];
  }
  const first=ids.slice().sort((a,b)=>(((players[a]||{}).createdAt)||'').localeCompare(((players[b]||{}).createdAt)||''))[0];
  ['games','sessions'].forEach(c=>Object.keys(all[c]||{}).forEach(id=>{const d=all[c][id];if(d&&!d.playerId)db.collection(c).doc(id).set(Object.assign({},d,{playerId:first})).catch(()=>{});}));
}

/* ---------- Derived numbers ---------- */
const byDate=(a,b)=>(b.date||'').localeCompare(a.date||'')||(b.createdAt||'').localeCompare(a.createdAt||'');
const games=()=>S.games.slice().sort(byDate);
const sessions=()=>S.sessions.slice().sort(byDate);
const played=g=>['gk','st'].filter(p=>g.played&&g.played[p]);
const conceded=g=>(g.zones||[]).length;
const saves=g=>(g.gk&&+g.gk.saves)||0;
function savePct(g){const t=saves(g)+conceded(g);return t?Math.round(saves(g)/t*100):null;}
function shotStats(g){const s=g.shots||[];const goals=s.filter(x=>x.r==='goal').length;const on=s.filter(x=>x.r==='goal'||x.r==='on').length;return {shots:s.length,goals,on,pct:s.length?Math.round(on/s.length*100):null};}
const errTotal=g=>Object.values(g.errors||{}).reduce((a,b)=>a+(+b||0),0);
function result(g){const u=+g.us||0,t=+g.them||0;return u>t?'W':u<t?'L':'D';}
function weekCount(back){
  const ws=weekStart(new Date());ws.setDate(ws.getDate()-7*back);
  const we=new Date(ws);we.setDate(we.getDate()+7);
  const a=isoOf(ws),b=isoOf(we);
  return S.sessions.filter(s=>s.date>=a&&s.date<b).length;
}
function weekStreak(){
  const goal=+S.profile.weeklyGoal||3;let i=weekCount(0)>=goal?0:1,n=0;
  while(i<104&&weekCount(i)>=goal){n++;i++;}
  return n;
}
function drillLog(id){
  const out=[];
  S.sessions.forEach(s=>(s.items||[]).forEach(it=>{if(it.drillId===id)out.push({date:s.date,score:it.score,outOf:it.outOf});}));
  return out.sort((a,b)=>(a.date||'').localeCompare(b.date||''));
}
function scoreText(d,it){
  if(d.score.type==='done'||it.score==null||it.score==='')return 'Done';
  if(d.score.type==='of')return it.score+' of '+(it.outOf||d.score.n);
  if(d.score.type==='time')return (+it.score).toFixed(2)+' s';
  return it.score+' '+d.score.unit;
}
function scoreVal(d,it){
  if(d.score.type==='done'||it.score==null||it.score==='')return null;
  if(d.score.type==='of'){const n=+it.outOf||d.score.n;return n?Math.round(+it.score/n*100):null;}
  return +it.score;
}
function lastLabel(d){const l=drillLog(d.id);if(!l.length)return 'Not tried yet';const it=l[l.length-1];return 'Last: '+scoreText(d,it)+', '+fmtDate(it.date,{month:'short',day:'numeric'});}
function byLeastRecent(list){return list.map(d=>({d,last:(drillLog(d.id).slice(-1)[0]||{}).date||''})).sort((a,b)=>a.last.localeCompare(b.last)).map(x=>x.d);}
function pickDrills(tag,n){return byLeastRecent(DRILLS.filter(d=>d.fixes.includes(tag)&&fitsAge(d))).slice(0,n);}
function goalDrills(gid,n){const G=GOAL[gid];return G?byLeastRecent(G.drills.map(id=>DRILL[id]).filter(d=>d&&fitsAge(d))).slice(0,n):[];}
function tallyErr(list){const t={};list.forEach(g=>{for(const [k,v] of Object.entries(g.errors||{})){if(ERR[k]&&+v>0)t[k]=(t[k]||0)+(+v);}});return t;}
function focusList(){
  const items=[],gs=games().slice(0,3),tally={},raw={};
  (S.profile.goals||[]).forEach(gid=>{
    const G=GOAL[gid],ds=goalDrills(gid,2);
    if(G&&ds.length&&!(gid==='speed'&&progOf()))items.push({pos:'aim',area:'',title:G.label,why:G.why,drills:ds});
  });
  gs.forEach((g,i)=>{for(const [k,v] of Object.entries(g.errors||{})){if(!ERR[k]||!(+v>0))continue;raw[k]=(raw[k]||0)+(+v);tally[k]=(tally[k]||0)+(+v)*(i===0?1.5:1);}});
  Object.keys(tally).sort((a,b)=>tally[b]-tally[a]).forEach(k=>{
    if(items.length>=4)return;const ds=pickDrills(k,2);if(!ds.length)return;
    items.push({pos:ERR[k].pos,area:ERR[k].area,title:ERR[k].label,why:'Happened '+raw[k]+' '+plural(raw[k],'time','times')+' in the last '+(gs.length===1?'game':gs.length+' games')+'.',drills:ds});
  });
  const fromGames=items.some(i=>i.pos!=='aim');
  if(!fromGames){
    let starter;
    if(isYoung())starter=[{pos:'young',area:'Dribbling',title:'Keep the ball close',why:'Little touches are the base of everything at this age.',drills:[DRILL.y_redlight,DRILL.y_sharks]},
                           {pos:'young',area:'Shooting',title:'Shoot and score',why:'Scoring is the most fun part of soccer. Let him score a lot.',drills:[DRILL.y_monster]}];
    else{
      const gk=[{pos:'gk',area:'Handling',title:'Safe hands',why:'Clean catches stop rebounds and second chances.',drills:[DRILL.gk_wcatch,DRILL.gk_scoop]},
                {pos:'gk',area:'Set position',title:'Set before every shot',why:'Being still when the ball is struck makes every save easier.',drills:[DRILL.gk_setstep]}];
      const st=[{pos:'st',area:'Finishing',title:'Hit the corners',why:'Low shots into the corners are the hardest for keepers to reach.',drills:[DRILL.st_corners,DRILL.st_weak]}];
      starter=S.profile.preferred==='st'?st.concat(gk.slice(0,1)):gk.concat(st);
    }
    starter.forEach(x=>{x.drills=x.drills.filter(d=>fitsAge(d));if(x.drills.length&&items.length<4)items.push(x);});
  }
  return {fromGames,n:gs.length,items};
}
function focusDrillIds(){return [...new Set(focusList().items.flatMap(i=>i.drills.map(d=>d.id)))];}
function progOf(p){const pr=(p||S.profile).program;return pr&&PROGRAM[pr.id]?pr:null;}
function progSessions(P){const out=[];P.weeks.forEach((w,wi)=>w.forEach((x,si)=>out.push(Object.assign({key:'w'+(wi+1)+'s'+(si+1),week:wi+1},x))));return out;}
function progNext(){const pr=progOf();if(!pr)return null;return progSessions(PROGRAM[pr.id]).find(x=>!(pr.done||{})[x.key])||null;}
function sprintTests(){return drillLog('sp_test').filter(x=>x.score!=null&&x.score!=='').map(x=>+x.score);}

/* ---------- Small renderers ---------- */
function tile(l,v,c){return `<div class="tile ${c||''}"><span class="num">${esc(v)}</span><span class="lbl">${esc(l)}</span></div>`;}
function stepper(label,path,val,sub,min,max){
  return `<div class="stepper"><span class="st-label">${esc(label)}${sub?`<small>${esc(sub)}</small>`:''}</span><div class="st-ctl">
  <button type="button" data-a="step" data-p="${path}" data-d="-1" data-min="${min||0}" data-max="${max||99}" aria-label="${esc(label)}: minus one">−</button>
  <output aria-live="polite">${+val||0}</output>
  <button type="button" data-a="step" data-p="${path}" data-d="1" data-min="${min||0}" data-max="${max||99}" aria-label="${esc(label)}: plus one">+</button></div></div>`;
}
function rating(label,path,val,ends){
  return `<div class="rate"><span class="lbl2">${esc(label)}</span><div class="seg5" role="group" aria-label="${esc(label)}">${[1,2,3,4,5].map(n=>`<button type="button" data-a="set" data-p="${path}" data-v="${n}" class="${val===n?'on':''}" aria-pressed="${val===n}">${n}</button>`).join('')}</div><div class="rate-ends"><span>${esc(ends[0])}</span><span>${esc(ends[1])}</span></div></div>`;
}
function dlink(d){if(!d)return '';return `<button class="dlink" data-a="drill" data-id="${d.id}" title="${esc(d.what)}"><span>${esc(d.name)}${d.what?`<small class="dl-what">${esc(d.what)}</small>`:''}<small>${d.mins} min · ${esc(lastLabel(d))}</small></span><span class="go" aria-hidden="true">›</span></button>`;}
function dots(n,goal){let s='';for(let i=0;i<Math.max(n,goal);i++)s+=`<span class="dot ${i<n?'on':''}"></span>`;return s;}
function gameRow(g){
  const r=result(g);
  return `<button class="row" data-a="game" data-id="${esc(g.id)}"><span class="res res-${r}" title="${RES_NAME[r]}">${r}</span><span class="row-main"><span class="row-title">vs ${esc(g.opponent||'Opponent')}</span><span class="row-sub">${esc(fmtDate(g.date))} ${played(g).map(p=>`<span class="tag ${p}">${POS_SHORT[p]}</span>`).join('')}${g.example?'<span class="tag ex">Example</span>':''}</span></span><span class="row-score">${+g.us||0}-${+g.them||0}</span></button>`;
}
function sessRow(s){
  const names=(s.items||[]).map(it=>DRILL[it.drillId]&&DRILL[it.drillId].name).filter(Boolean);
  return `<button class="row" data-a="editSession" data-id="${esc(s.id)}"><span class="row-main"><span class="row-title">${esc(fmtDate(s.date))}</span><span class="row-sub">${esc(names.join(', ')||'Training')}${s.example?'<span class="tag ex">Example</span>':''}</span></span><span class="row-score sm">${s.minutes?esc(s.minutes)+'<small> min</small>':''}</span></button>`;
}
function emptyGames(){return `<div class="empty"><p><b>No games logged yet.</b></p><p>Right after a game, tap Log a game. It takes about two minutes: the score, how he played, and what you noticed.</p></div>`;}
function tallyChip(e,n){return `<span class="tally ${n?'on':''}"><button type="button" data-a="errAdd" data-id="${e.id}" aria-label="${esc(e.label)}${n?', '+n+' so far':''}">${esc(e.label)}${n?`<b>\u00d7${n}</b>`:''}</button>${n?`<button type="button" class="minus" data-a="errSub" data-id="${e.id}" aria-label="Remove one: ${esc(e.label)}">\u2212</button>`:''}</span>`;}
function errTag(k){return ERR[k].pos==='young'?'':`<span class="tag ${ERR[k].pos}">${POS_SHORT[ERR[k].pos]}</span>`;}
function dbNotice(){return (S.db||!S.checked)?'':`<div class="note warn"><span>${esc(NO_DB)}</span></div>`;}
function goalCells(zs,picker){
  const c={};zs.forEach(z=>{c[z.z]=(c[z.z]||0)+1;});
  const mx=Math.max(1,...ZONES.map(z=>c[z]||0));
  const cells=ZONES.map(z=>{const n=c[z]||0;
    return picker?`<button type="button" class="gz" data-a="zone" data-z="${z}" aria-label="Add a goal: ${ZONE_LABEL[z]}${n?', '+n+' so far':''}">${n?`<b>${n}</b>`:''}</button>`
      :`<div class="gz" style="--h:${Math.round(n/mx*70)}%" role="img" aria-label="${ZONE_LABEL[z]}: ${n}">${n?`<b>${n}</b>`:''}</div>`;}).join('');
  return `<div class="goalwrap"><div class="goal ${picker?'':'heat'}">${cells}</div></div>${!picker&&c.U?`<p class="sub">${c.U} more, not sure where</p>`:''}`;
}
function pitchSVG(shots,o){
  o=o||{};
  let s=`<svg class="pitch${o.interactive?' tap':''}" ${o.interactive?'data-pitch="1"':''} viewBox="0 -4 100 74" role="img" aria-label="${o.interactive?'Half field. Tap where he shot from.':'Shot map'}">`;
  s+=`<rect x="0" y="-4" width="100" height="4" class="t2"/>`;
  for(let i=0;i<7;i++)s+=`<rect x="0" y="${i*10}" width="100" height="10" class="${i%2?'t2':'t1'}"/>`;
  s+=`<g class="chalk"><path d="M1 0H99V69H1Z"/><path d="M20 0V22H80V0"/><path d="M37 0V8H63V0"/><path d="M40.25 22A12 12 0 0 0 59.75 22"/><path d="M41 69A9 9 0 0 1 59 69"/></g><circle cx="50" cy="15" r=".7" class="spot"/><rect x="44" y="-3" width="12" height="3" class="goalbox"/>`;
  (shots||[]).forEach(p=>{if(p.x==null)return;s+=`<circle cx="${+p.x}" cy="${+p.y}" r="2" class="shot s-${esc(p.r)}"/>`;});
  if(o.pending&&o.pending.x!=null)s+=`<circle cx="${o.pending.x}" cy="${o.pending.y}" r="3.2" class="shot pending"/>`;
  return s+'</svg>';
}
function legend(){return `<div class="legend">${SHOT_RES.map(r=>`<span><i class="lg s-${r.id}"></i>${r.label}</span>`).join('')}</div>`;}
function bars(items,o){
  const W=320,H=140,L=32,R=6,T=16,B=20,n=Math.max(items.length,1),bw=(W-L-R)/n,ph=H-T-B;
  let s=`<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.label)}">`;
  [0,o.max/2,o.max].forEach(v=>{const y=T+ph*(1-v/o.max);s+=`<line class="grid" x1="${L}" x2="${W-R}" y1="${y}" y2="${y}"/><text x="${L-5}" y="${y+3.5}" text-anchor="end">${Number.isInteger(v)?v:v.toFixed(1)}${o.unit}</text>`;});
  items.forEach((it,i)=>{
    const cx=L+bw*i+bw/2,w=Math.min(28,bw*.62);
    if(it.value==null)s+=`<text x="${cx}" y="${T+ph-4}" text-anchor="middle">-</text>`;
    else{const h=Math.max(2,ph*Math.min(it.value,o.max)/o.max);s+=`<rect class="${o.cls}" x="${(cx-w/2).toFixed(1)}" y="${(T+ph-h).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="3"/><text class="val" x="${cx}" y="${(T+ph-h-4).toFixed(1)}" text-anchor="middle">${it.value}</text>`;}
    s+=`<text x="${cx}" y="${H-5}" text-anchor="middle">${esc(it.label)}</text>`;
  });
  return s+'</svg>';
}
function spark(vals,max,label,fit){
  const W=120,H=32,p=4,mx=max||(fit?Math.max(...vals):Math.max(...vals,1)),mn=max?0:(fit?Math.min(...vals):Math.min(...vals,0));
  const xs=i=>p+(W-2*p)*(vals.length===1?.5:i/(vals.length-1));
  const ys=v=>H-p-(H-2*p)*((v-mn)/((mx-mn)||1));
  const pts=vals.map((v,i)=>xs(i).toFixed(1)+','+ys(v).toFixed(1)),last=vals.length-1;
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" role="img" aria-label="Scores over time, latest ${label||vals[last]+(max?' percent':'')}"><path class="area" d="M${xs(0).toFixed(1)},${H-p} L${pts.join(' L')} L${xs(last).toFixed(1)},${H-p} Z"/><path class="ln" d="M${pts.join(' L')}"/><circle cx="${xs(last).toFixed(1)}" cy="${ys(vals[last]).toFixed(1)}" r="3"/></svg>`;
}

/* ---------- Views ---------- */
function heroHTML(){
  const p=S.profile,a=ageOf(),pref=p.preferred,meta=[a!=null?'Age '+a:'',p.team||''].filter(Boolean).join(' · ');
  const badges=isYoung()||pref==='all'?'<span class="badge all">Plays everywhere</span>'
    :`<span class="badge gk">Goalkeeper${pref==='gk'?' · favorite':''}</span><span class="badge st">Striker${pref==='st'?' · favorite':''}</span>`;
  return `<section class="hero"><svg class="hero-lines" viewBox="0 0 120 120" aria-hidden="true"><circle cx="120" cy="60" r="36"/><circle cx="120" cy="60" r="2"/><path d="M120 0V120"/></svg>
  <p class="eyebrow">Player</p>
  <h1 class="hero-name">${p.name?esc(p.name):'Your player'}</h1>
  ${meta?`<p class="hero-team">${esc(meta)}</p>`:''}
  ${(!p.name||a==null)&&S.canWrite?`<button class="hero-add" data-a="openPlayer">${p.name?'Add his birth year':'Add his name and age'}</button>`:''}
  <div class="hero-pos">${badges}</div>
  ${S.canWrite?`<button class="hero-edit" data-a="openPlayer">Edit</button>`:''}</section>`;
}
function focusHTML(){
  const f=focusList();if(!f.items.length)return '';
  let h=`<section class="block"><div class="block-head"><h2>Work on this week</h2><span class="sub">${f.fromGames?'From his last '+(f.n===1?'game':f.n+' games'):'Starter plan'}</span></div>`;
  if(!f.fromGames)h+=`<p class="sub">Log a game and this list updates from what you notice.</p>`;
  f.items.forEach(it=>{h+=`<article class="focus"><p class="eyebrow">${it.pos==='young'?'':`<span class="tag ${it.pos}">${POS_SHORT[it.pos]}</span>`}${esc(it.area)}</p><h3>${esc(it.title)}</h3><p class="muted">${esc(it.why)}</p><div class="dlinks">${it.drills.map(dlink).join('')}</div></article>`;});
  return h+'</section>';
}
function programCard(){
  if(isYoung()||!S.canWrite)return '';
  const pr=progOf();
  if(!pr){
    const P=PROGRAMS.find(x=>fitsAge(x)&&(S.profile.goals||[]).indexOf(x.goal)>=0);
    return P?`<div class="note"><span>${esc(S.profile.name||'He')} wants to get faster. Try the <b>${esc(P.title)}</b>: two 20-minute sessions a week.</span><button class="btn small" data-a="openProgram" data-id="${P.id}">See the plan</button></div>`:'';
  }
  const P=PROGRAM[pr.id],all=progSessions(P),done=all.filter(x=>(pr.done||{})[x.key]).length,nx=progNext(),tests=sprintTests();
  let h=`<section class="block"><div class="block-head"><h2>${esc(P.title)}</h2><button class="link" data-a="openProgram" data-id="${P.id}">See the plan</button></div><div class="prog">`;
  h+=`<div class="progbar" role="img" aria-label="${done} of ${all.length} sessions done"><span style="width:${Math.round(done/all.length*100)}%"></span></div>`;
  h+=`<p class="sub">${done} of ${all.length} sessions done${tests.length?` · 20 m sprint: first ${tests[0].toFixed(2)} s, best ${Math.min(...tests).toFixed(2)} s`:''}</p>`;
  if(nx)h+=`<p class="eyebrow"><span class="tag speed">Week ${nx.week}</span>${esc(nx.name)}</p><h3>${esc(nx.focus)}</h3><ol class="prog-items">${nx.items.map(([id,dose])=>`<li><button class="dlink" data-a="drill" data-id="${id}" title="${esc(DRILL[id].what)}"><span>${esc(DRILL[id].name)}<small class="dl-what">${esc(DRILL[id].what)}</small><small><b>${esc(dose)}</b></small></span><span class="go" aria-hidden="true">›</span></button></li>`).join('')}</ol><button class="btn primary wide" data-a="progStart">Start this session</button>`;
  else h+=`<h3>Program complete</h3><p>All ${all.length} sessions done. Compare his sprint tests on the Progress tab.</p>`;
  return h+'</div></section>';
}
function renderHome(){
  const p=S.profile,gs=games(),goal=+p.weeklyGoal||3,wc=weekCount(0),streak=weekStreak(),last=gs[0];
  const hasEx=S.games.some(g=>g.example)||S.sessions.some(x=>x.example);
  const real=S.allGames.filter(g=>!g.example).length+S.allSessions.filter(x=>!x.example).length;
  let h=whoBar(true)+heroHTML()+dbNotice()+installNote();
  if(S.canWrite&&!S.games.length&&!S.sessions.length)h+=`<div class="welcome"><h3>${p.name?'Ready for '+esc(p.name):'Welcome'}</h3><p>${p.name&&ageOf()!=null?'Log his next game and the app suggests drills that fit his age and what you see.':'Add his name and birth year, then log his next game. The app suggests drills that fit his age and what you see.'}</p><div class="note-btns"><button class="btn primary small" data-a="openPlayer">${p.name&&ageOf()!=null?'Edit player':'Set up player'}</button><button class="btn small" data-a="loadExamples">Show me with example data</button></div></div>`;
  if(hasEx)h+=`<div class="note"><span>Entries marked <span class="tag ex">Example</span> are samples so you can see how everything fits together.</span>${S.canWrite?`<button class="btn small" data-a="clearExamples" data-confirm="Tap again to delete">Delete examples</button>`:''}</div>`;
  if(S.canWrite&&real>=3&&backupDue())h+=`<div class="note"><span>Your logs are saved only on this phone. Save a backup copy to Files or email it to yourself.</span><div class="note-btns"><button class="btn small" data-a="exportBackup">Back up now</button><button class="btn small" data-a="snoozeBackup">Later</button></div></div>`;
  h+=`<div class="strip">
    <div class="cell"><span class="num">${wc}<small>/${goal}</small></span><span class="dots" aria-hidden="true">${dots(wc,goal)}</span><span class="lbl">Training sessions this week</span></div>
    <div class="cell"><span class="num">${streak}</span><span class="lbl">${plural(streak,'Week','Weeks')} in a row hitting the goal</span></div>
    <div class="cell">${last?`<span class="num res-txt-${result(last)}">${result(last)} ${+last.us||0}-${+last.them||0}</span><span class="lbl">Last game, vs ${esc(last.opponent||'opponent')}</span>`:`<span class="num">-</span><span class="lbl">No games logged yet</span>`}</div></div>`;
  if(S.canWrite)h+=`<div class="actions"><button class="btn primary big" data-a="newGame">Log a game<small>Right after the final whistle</small></button><button class="btn big" data-a="newSession">Log training<small>Drills and scores</small></button></div>`;
  h+=programCard()+focusHTML();
  h+=`<section class="block"><div class="block-head"><h2>Recent games</h2>${gs.length>3?`<button class="link" data-a="go" data-v="games">All ${gs.length} games</button>`:''}</div>${S.db&&!S.gotGames?'<p class="muted">Loading games...</p>':gs.length?`<div class="list">${gs.slice(0,3).map(gameRow).join('')}</div>`:emptyGames()}</section>`;
  return `<div class="view">${h}</div>`;
}
function renderGames(){
  const gs=games();
  let h=whoBar(false)+`<div class="bar"><h1>Games</h1>${S.canWrite?`<button class="btn primary small" data-a="newGame">Log a game</button>`:''}</div>`+dbNotice();
  if(S.db&&!S.gotGames)h+='<p class="muted">Loading games...</p>';
  else if(!gs.length)h+=emptyGames();
  else{
    const w=gs.filter(g=>result(g)==='W').length,d=gs.filter(g=>result(g)==='D').length,l=gs.length-w-d;
    h+=`<p class="muted">${gs.length} ${plural(gs.length,'game','games')}: ${w} won, ${d} drawn, ${l} lost</p><div class="list">${gs.map(gameRow).join('')}</div>`;
  }
  return `<div class="view">${h}</div>`;
}
function renderGame(){
  const g=S.games.find(x=>x.id===S.arg);
  let h=`<div class="bar"><button class="back" data-a="go" data-v="games">‹ Games</button>${g&&S.canWrite?`<button class="btn small" data-a="editGame" data-id="${esc(g.id)}">Edit</button>`:''}</div>`;
  if(!g)return `<div class="view">${h}<p class="muted">${S.gotGames?'This game is no longer here.':'Loading...'}</p></div>`;
  h+=`<section class="board"><div class="board-row"><span class="team">${esc(S.profile.team||'Us')}</span><span class="n">${+g.us||0}</span><span class="n">${+g.them||0}</span><span class="team them">${esc(g.opponent||'Opponent')}</span></div><p class="meta">${esc(fmtDate(g.date,{weekday:'long',month:'long',day:'numeric'}))} · ${g.venue==='away'?'Away':'Home'} · ${esc(g.comp||'')}${g.example?' · Example':''}</p></section>`;
  if(played(g).length)h+=`<p class="posline">${played(g).map(p=>{const m=p==='gk'?g.gkMins:g.stMins;return `<span><span class="tag ${p}">${POS_NAME[p]}</span>${m?' '+esc(m)+' min':''}</span>`;}).join('')}</p>`;
  if(g.played&&g.played.young){const y=g.young||{};h+=`<section class="block"><h2>How he played</h2><div class="tiles">${tile('Goals',+y.goals||0,'st')}${tile('Dribbled past someone',+y.beat||0,'st')}${tile('Won the ball back',+y.won||0,'st')}</div></section>`;}
  if(g.played&&g.played.gk){
    const gk=g.gk||{},sp=savePct(g),zs=g.zones||[],sv=zs.filter(z=>z.saveable).length,dist=(+gk.distGood||0)+(+gk.distBad||0);
    h+=`<section class="block"><h2>In goal</h2><div class="tiles">${tile('Saves',saves(g),'gk')}${tile('Goals against',zs.length,'gk')}${tile('Save rate',sp==null?'-':sp+'%','gk')}${tile('Clean catches',+gk.catches||0,'gk')}${tile('Drops',+gk.drops||0,'gk')}${tile('High balls won',+gk.high||0,'gk')}${tile('Good throws and kicks',dist?(+gk.distGood||0)+' of '+dist:'-','gk')}</div>`;
    if(zs.length)h+=`<div class="card"><p class="lbl2">Where the goals went in</p>${goalCells(zs,false)}<p class="sub">${sv} of ${zs.length} marked saveable</p></div>`;
    h+='</section>';
  }
  if(g.played&&g.played.st){
    const s=shotStats(g),st=g.st||{};
    h+=`<section class="block"><h2>Up front</h2><div class="tiles">${tile('Goals',s.goals,'st')}${tile('Shots',s.shots,'st')}${tile('On target',s.shots?s.on+' of '+s.shots:'-','st')}${tile('Assists',+st.assists||0,'st')}${tile('Chances made',+st.chances||0,'st')}</div>${(g.shots||[]).some(x=>x.x!=null)?`<div class="card">${pitchSVG(g.shots)}${legend()}</div>`:''}</section>`;
  }
  const errs=Object.entries(g.errors||{}).filter(([k,v])=>ERR[k]&&+v>0).sort((a,b)=>b[1]-a[1]);
  if(errs.length){
    const ds=[...new Set(errs.flatMap(([k])=>pickDrills(k,1).map(d=>d.id)))].slice(0,3).map(id=>DRILL[id]);
    h+=`<section class="block"><h2>${g.played&&g.played.young?'Things to practice':'Mistakes to learn from'}</h2><div class="list">${errs.map(([k,v])=>`<div class="row">${errTag(k)}<span class="row-main"><span class="row-title wrap">${esc(ERR[k].label)}</span><span class="row-sub">${esc(ERR[k].area)}</span></span><span class="row-score sm">×${+v}</span></div>`).join('')}</div><p class="lbl2">Drills that help</p><div class="list pad">${ds.map(dlink).join('')}</div></section>`;
  }
  const wl=(g.wells||[]).filter(k=>WELL[k]);
  if(wl.length)h+=`<section class="block"><h2>Went well</h2><div class="chips">${wl.map(k=>`<span class="chip on static">${esc(WELL[k].label)}</span>`).join('')}</div></section>`;
  const rt=g.ratings||{},rk=['fun','effort','confidence','overall'].filter(k=>rt[k]);
  if(rk.length)h+=`<section class="block"><h2>Ratings</h2><div class="tiles">${rk.map(k=>tile(RATE_NAME[k],rt[k]+'/5','')).join('')}</div></section>`;
  const notes=[['Best moment',g.great],['One thing to work on',g.work],['Other notes',g.notes]].filter(x=>x[1]);
  if(notes.length)h+=`<section class="block"><h2>Feedback</h2>${notes.map(([l,v])=>`<div class="notecard"><p class="lbl2">${l}</p><p class="prose">${esc(v)}</p></div>`).join('')}</section>`;
  if(S.canWrite)h+=`<button class="btn danger wide" data-a="delGame" data-id="${esc(g.id)}" data-confirm="Tap again to delete this game">Delete game</button>`;
  return `<div class="view">${h}</div>`;
}
function renderGameForm(){
  const d=S.gd;if(!d){S.view='games';return renderGames();}
  const edit=!!S.gEdit;
  let h=`<div class="bar"><button class="back" data-a="formBack">‹ Back</button><span class="sub">${edit?'Editing a saved game':'Your draft is kept as you go'}</span></div><h1>${edit?'Edit game':'Log a game'}</h1>`;
  if(S.gResumed&&!edit)h+=`<div class="note"><span>Picked up your unsaved game.</span><button class="btn small" data-a="freshGame">Start over</button></div>`;
  h+=`<section class="group"><h2>Match</h2>
    <div class="two"><div class="field"><label for="g-date">Date</label><input id="g-date" type="date" data-f="date" value="${esc(d.date)}"></div>
    <div class="field"><label for="g-comp">Type</label><select id="g-comp" data-f="comp">${COMPS.map(c=>`<option ${d.comp===c?'selected':''}>${c}</option>`).join('')}</select></div></div>
    <div class="field"><label for="g-opp">Opponent</label><input id="g-opp" type="text" data-f="opponent" value="${esc(d.opponent)}" placeholder="Team name" autocomplete="off"></div>
    <div class="seg" role="group" aria-label="Home or away">${['home','away'].map(v=>`<button type="button" data-a="set" data-p="venue" data-v="${v}" class="${d.venue===v?'on':''}" aria-pressed="${d.venue===v}">${v==='home'?'Home':'Away'}</button>`).join('')}</div>
    <div class="steppers">${stepper((S.profile.team||'Our team')+' goals','us',d.us,'',0,40)}${stepper('Their goals','them',d.them,'',0,40)}</div>${d.played.young?'<p class="sub">Many leagues at this age do not keep score. Leave it at 0-0 if yours does not.</p>':''}</section>`;
  if(d.played.young){
    h+=`<section class="group"><h2>How he played</h2><div class="steppers">${stepper('Goals he scored','young.goals',d.young.goals)}${stepper('Dribbled past someone','young.beat',d.young.beat)}${stepper('Won the ball back','young.won',d.young.won)}</div></section>`;
    h+=`<section class="group"><h2>Things to practice</h2><p class="sub">Tap any you noticed. They pick his practice games. At this age, mistakes just mean he is trying.</p><div class="chips">${ERRORS.filter(e=>e.pos==='young').map(e=>tallyChip(e,d.errors[e.id]||0)).join('')}</div></section>`;
  }else{
  h+=`<section class="group"><h2>Positions he played</h2><div class="posbtns">${['gk','st'].map(p=>`<button type="button" class="posbtn ${p} ${d.played[p]?'on':''}" data-a="played" data-v="${p}" aria-pressed="${!!d.played[p]}"><strong>${POS_NAME[p]}</strong><span class="sub">${d.played[p]?'Played':'Tap if he played here'}</span></button>`).join('')}</div>
    ${(d.played.gk||d.played.st)?`<div class="two">${d.played.gk?`<div class="field"><label for="g-gkm">Minutes in goal</label><input id="g-gkm" type="number" inputmode="numeric" min="0" max="120" data-f="gkMins" value="${esc(d.gkMins)}"></div>`:''}${d.played.st?`<div class="field"><label for="g-stm">Minutes at striker</label><input id="g-stm" type="number" inputmode="numeric" min="0" max="120" data-f="stMins" value="${esc(d.stMins)}"></div>`:''}</div>`:''}</section>`;
  if(d.played.gk){
    const z=d.zones;
    h+=`<section class="group"><h2><span class="tag gk">GK</span>In goal</h2>
    <div class="steppers">${stepper('Saves','gk.saves',d.gk.saves)}${stepper('Clean catches','gk.catches',d.gk.catches,'Held first time')}${stepper('Drops or spills','gk.drops',d.gk.drops)}${stepper('High balls won','gk.high',d.gk.high,'Crosses and lobs')}${stepper('Good throws and kicks','gk.distGood',d.gk.distGood)}${stepper('Poor throws and kicks','gk.distBad',d.gk.distBad)}</div>
    <div class="field"><span class="lbl2">Goals against: ${z.length}</span><p class="sub">Tap where each goal went in, looking at the goal from the field.</p></div>${goalCells(z,true)}
    ${z.length?`<ol class="goals">${z.map((x,i)=>`<li><span>Goal ${i+1}: ${ZONE_LABEL[x.z]||'Not sure where'}</span><span class="goal-btns"><button type="button" class="mini ${x.saveable?'on':''}" data-a="zoneSave" data-i="${i}" aria-pressed="${!!x.saveable}">Saveable</button><button type="button" class="mini" data-a="zoneDel" data-i="${i}" aria-label="Remove goal ${i+1}">Remove</button></span></li>`).join('')}</ol>`:''}
    <button type="button" class="link" data-a="zone" data-z="U">+ Add a goal, not sure where it went in</button></section>`;
  }
  if(d.played.st){
    const s=shotStats(d);
    h+=`<section class="group"><h2><span class="tag st">ST</span>Up front</h2>
    <div class="field"><span class="lbl2">Shots: ${s.shots} · on target: ${s.on} · goals: ${s.goals}</span><p class="sub">Tap the field where he shot from, then pick what happened. His team attacks the goal at the top.</p></div>
    ${pitchSVG(d.shots,{interactive:true,pending:d.pending})}
    ${d.pending?`<p class="lbl2">What happened?</p><div class="outcomes" role="group" aria-label="What happened">${SHOT_RES.map(r=>`<button type="button" class="btn small" data-a="shot" data-v="${r.id}"><i class="lg s-${r.id}"></i>${r.label}</button>`).join('')}<button type="button" class="btn small" data-a="shotCancel">Cancel</button></div>`
      :`<div class="row-btns"><button type="button" class="link" data-a="shotNoLoc">+ Add a shot without a spot</button>${d.shots.length?`<button type="button" class="link" data-a="shotUndo">Undo last shot</button>`:''}</div>`}
    ${legend()}
    <div class="steppers">${stepper('Assists','st.assists',d.st.assists)}${stepper('Chances made','st.chances',d.st.chances,'Passes that led to a shot')}</div></section>`;
  }
  const groups=['gk','st'].filter(p=>d.played[p]);
  h+=`<section class="group"><h2>Mistakes</h2><p class="sub">Tap once for each time it happened. These decide what he practices next.</p>`;
  if(!groups.length)h+=`<p class="muted">Pick the positions he played first.</p>`;
  groups.forEach(p=>{h+=`<p class="lbl2"><span class="tag ${p}">${POS_SHORT[p]}</span>${p==='gk'?'In goal':'Up front'}</p><div class="chips">${ERRORS.filter(e=>e.pos===p).map(e=>tallyChip(e,d.errors[e.id]||0)).join('')}</div>`;});
  h+='</section>';
  }
  h+=`<section class="group"><h2>Went well</h2><div class="chips">${WELLS.filter(w=>w.pos==='both'||d.played[w.pos]).map(w=>{const on=d.wells.includes(w.id);return `<button type="button" class="chip ${on?'on':''}" data-a="well" data-id="${w.id}" aria-pressed="${on}">${esc(w.label)}</button>`;}).join('')}</div></section>`;
  h+=d.played.young?`<section class="group"><h2>Ratings</h2>${rating('Fun','ratings.fun',d.ratings.fun,['Not much','Loved it'])}${rating('Effort','ratings.effort',d.ratings.effort,['Low','Huge'])}</section>`
    :`<section class="group"><h2>Ratings</h2>${rating('Effort','ratings.effort',d.ratings.effort,['Low','Huge'])}${rating('Confidence','ratings.confidence',d.ratings.confidence,['Nervous','Fearless'])}${rating('Overall game','ratings.overall',d.ratings.overall,['Tough day','Best yet'])}</section>`;
  h+=`<section class="group"><h2>Feedback</h2>
    <div class="field"><label for="g-great">Best moment</label><textarea id="g-great" data-f="great" placeholder="${d.played.young?'Example: he scored his first goal':'Example: the diving save at the near post'}">${esc(d.great)}</textarea></div>
    <div class="field"><label for="g-work">One thing to work on</label><textarea id="g-work" data-f="work" placeholder="${d.played.young?'Example: keep the ball close when dribbling':'Example: get set before the shooter strikes'}">${esc(d.work)}</textarea></div>
    <div class="field"><label for="g-notes">Other notes</label><textarea id="g-notes" data-f="notes">${esc(d.notes)}</textarea></div></section>`;
  h+=`<div class="savebar"><button class="btn primary wide" data-a="saveGame">${edit?'Save changes':'Save game'}</button></div>`;
  return `<div class="view">${h}</div>`;
}
function drillOptions(sel){
  const groups=[['speed','Speed and agility'],['gk','Keeper drills'],['st','Striker drills'],['both','For keeper and striker'],['young','Games for ages 5 to 8']];
  return groups.map(([p,l])=>{const ds=DRILLS.filter(d=>d.pos===p&&(fitsAge(d)||d.id===sel));return ds.length?`<optgroup label="${l}">${ds.map(d=>`<option value="${d.id}" ${d.id===sel?'selected':''}>${esc(d.name)}</option>`).join('')}</optgroup>`:'';}).join('');
}
function scoreInputs(dr,it,i){
  if(dr.score.type==='of')return `<div class="field sm"><label for="s-s${i}">Score</label><input id="s-s${i}" type="number" inputmode="numeric" min="0" data-f="items.${i}.score" value="${esc(it.score)}"></div><span class="of">of</span><div class="field sm"><label for="s-o${i}">Out of</label><input id="s-o${i}" type="number" inputmode="numeric" min="1" data-f="items.${i}.outOf" value="${esc(it.outOf)}"></div>`;
  if(dr.score.type==='count')return `<div class="field sm"><label for="s-s${i}">Score</label><input id="s-s${i}" type="number" inputmode="numeric" min="0" data-f="items.${i}.score" value="${esc(it.score)}"></div>`;
  if(dr.score.type==='time')return `<div class="field sm"><label for="s-s${i}">Seconds</label><input id="s-s${i}" type="number" inputmode="decimal" step="0.01" min="0" data-f="items.${i}.score" value="${esc(it.score)}"></div>`;
  return '';
}
function scoreHint(dr){return dr.score.type==='done'?'Just log the minutes for this one.':dr.score.type==='time'?'Log the fastest time in seconds. Lower is better.':'Count: '+dr.score.unit;}
function renderSessionForm(){
  const d=S.sd;if(!d){S.view='train';return renderTrain();}
  const edit=!!S.sEdit;
  let h=`<div class="bar"><button class="back" data-a="go" data-v="train">‹ Train</button><span class="sub">${edit?'Editing a saved session':'Your draft is kept as you go'}</span></div><h1>${edit?'Edit training':'Log training'}</h1>`;
  if(S.sResumed&&!edit)h+=`<div class="note"><span>Picked up your unsaved training log.</span><button class="btn small" data-a="freshSession">Start over</button></div>`;
  if(d.programKey)h+=`<div class="note"><span><b>Speed program:</b> ${esc(d.programLabel||'')}. Do the drills in order and rest fully between sprints.</span></div>`;
  h+=`<section class="group"><div class="two"><div class="field"><label for="s-date">Date</label><input id="s-date" type="date" data-f="date" value="${esc(d.date)}"></div><div class="field"><label for="s-min">Total minutes</label><input id="s-min" type="number" inputmode="numeric" min="0" max="300" data-f="minutes" value="${esc(d.minutes)}"></div></div></section>`;
  h+=`<section class="group"><h2>Drills</h2>`;
  if(!d.items.length)h+=`<p class="muted">Add each drill he did and how he scored.</p>`;
  d.items.forEach((it,i)=>{const dr=DRILL[it.drillId];if(!dr)return;
    h+=`<div class="item"><div class="field"><label for="s-d${i}">Drill ${i+1}</label><select id="s-d${i}" data-f="items.${i}.drillId">${drillOptions(it.drillId)}</select></div>
    ${dr.what?`<p class="what">${esc(dr.what)}</p>`:''}<p class="sub">${it.dose?'<b>'+esc(it.dose)+'</b> \u00b7 ':''}${esc(scoreHint(dr))}</p>
    <div class="item-score">${scoreInputs(dr,it,i)}<button type="button" class="mini" data-a="delItem" data-i="${i}">Remove</button></div></div>`;});
  h+=`<button type="button" class="btn wide" data-a="addItem">+ Add a drill</button></section>`;
  h+=`<section class="group"><h2>How did it feel?</h2>${rating('Feel','feel',d.feel,['Tough','Great'])}<div class="field"><label for="s-notes">Notes</label><textarea id="s-notes" data-f="notes" placeholder="What clicked, what was hard">${esc(d.notes)}</textarea></div></section>`;
  h+=`<div class="savebar"><button class="btn primary wide" data-a="saveSession">${edit?'Save changes':'Save training'}</button></div>`;
  if(edit&&S.canWrite)h+=`<button class="btn danger wide" data-a="delSession" data-id="${esc(S.sEdit)}" data-confirm="Tap again to delete">Delete this session</button>`;
  return `<div class="view">${h}</div>`;
}
function helpsWith(d){
  const out=[...new Set(d.fixes.map(x=>ERR[x].area.toLowerCase()))];
  GOALS.forEach(G=>{const l=G.label.toLowerCase();if(G.drills.indexOf(d.id)>=0&&out.indexOf(l)<0)out.push(l);});
  return out.join(', ');
}
function drillCard(d,f){
  const hw=helpsWith(d);
  return `<button class="dcard" data-a="drill" data-id="${d.id}" title="${esc(d.what)}"><span class="dc-top"><span class="tag ${d.pos}">${POS_SHORT[d.pos]}</span>${f?'<span class="tag pick">Focus</span>':''}<span class="sub">${d.mins} min</span></span><span class="dc-name">${esc(d.name)}</span>${d.what?`<span class="dc-what">${esc(d.what)}</span>`:''}${hw?`<span class="sub">Helps with ${esc(hw)}</span>`:''}<span class="dc-last">${esc(lastLabel(d))}</span></button>`;
}
function renderTrain(){
  const goal=+S.profile.weeklyGoal||3,wc=weekCount(0),fids=new Set(focusDrillIds()),ss=sessions(),young=isYoung(),a=ageOf();
  let h=whoBar(false)+`<div class="bar"><h1>Train</h1>${S.canWrite?`<button class="btn primary small" data-a="newSession">Log training</button>`:''}</div>`+dbNotice();
  h+=`<p class="muted">${wc} of ${goal} sessions this week. ${wc>=goal?'Goal reached, nice work.':(goal-wc)+' to go.'}</p>`;
  const progs=young?[]:PROGRAMS.filter(P=>fitsAge(P));
  if(progs.length)h+=`<section class="block"><h2>Programs</h2>${progs.map(P=>{const pr=progOf(),act=pr&&pr.id===P.id,all=progSessions(P),dn=act?all.filter(x=>(pr.done||{})[x.key]).length:0;
    return `<button class="dcard" data-a="openProgram" data-id="${P.id}"><span class="dc-top"><span class="tag speed">Speed</span>${act?'<span class="tag pick">In progress</span>':''}<span class="sub">${P.weeks.length} weeks</span></span><span class="dc-name">${esc(P.title)}</span><span class="sub">${esc(P.summary)}</span>${act?`<span class="dc-last">${dn} of ${all.length} sessions done</span>`:''}</button>`;}).join('')}</section>`;
  h+=`<section class="block"><div class="block-head"><h2>Training log</h2>${ss.length>3?`<button class="link" data-a="toggleSess">${S.allSess?'Show fewer':'Show all '+ss.length}</button>`:''}</div>${S.db&&!S.gotSessions?'<p class="muted">Loading...</p>':ss.length?`<div class="list">${(S.allSess?ss:ss.slice(0,3)).map(sessRow).join('')}</div>`:`<div class="empty"><p><b>No training logged yet.</b></p><p>Pick a ${young?'game':'drill'} below, try it together, and tap Log this drill to record how it went.</p></div>`}</section>`;
  const pos=young?'all':S.drillPos;
  const inCat=d=>pos==='all'||(pos==='speed'?(d.pos==='speed'||GOAL.speed.drills.indexOf(d.id)>=0):(d.pos===pos||d.pos==='both'));
  const list=DRILLS.filter(d=>fitsAge(d)&&inCat(d)).map((d,i)=>({d,i,f:fids.has(d.id)})).sort((x,y)=>(y.f-x.f)||(x.i-y.i));
  h+=`<section class="block"><div class="block-head"><h2>${young?'Practice games':'Drill library'}</h2><span class="sub">${a!=null?'Picked for age '+a:'Add his birth year to match drills to his age'}</span></div>
  ${young?'':`<div class="seg" role="group" aria-label="Filter drills">${[['all','All'],['gk','Keeper'],['st','Striker'],['speed','Speed']].map(([v,l])=>`<button type="button" data-a="drillPos" data-v="${v}" class="${S.drillPos===v?'on':''}" aria-pressed="${S.drillPos===v}">${l}</button>`).join('')}</div>`}
  <div class="drills">${list.map(({d,f})=>drillCard(d,f)).join('')}</div></section>`;
  return `<div class="view">${h}</div>`;
}
function renderDrill(){
  const d=DRILL[S.arg];if(!d){S.view='train';return renderTrain();}
  const log=drillLog(d.id),lb=d.score.type==='time';
  let h=`<div class="bar"><button class="back" data-a="go" data-v="train">‹ Train</button></div>`;
  h+=`<header class="dhead"><p class="eyebrow"><span class="tag ${d.pos}">${POS_NAME[d.pos]}</span>${d.mins} minutes · ages ${d.ages[0]} to ${d.ages[1]}</p><h1>${esc(d.name)}</h1>${d.what?`<p class="lead">${esc(d.what)}</p>`:''}<p><b>You need:</b> ${esc(d.need)}</p></header>`;
  if(d.note)h+=`<p class="drill-note">${esc(d.note)}</p>`;
  h+=`<section class="block"><h2>How to do it</h2><ol class="steps prose">${d.steps.map(x=>`<li>${esc(x)}</li>`).join('')}</ol></section>`;
  h+=`<section class="block"><h2>Coaching cues</h2><ul class="cues prose">${d.cues.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></section>`;
  if(d.fixes.length)h+=`<section class="block"><h2>Fixes these mistakes</h2><div class="chips">${d.fixes.map(f=>`<span class="chip static">${esc(ERR[f].label)}</span>`).join('')}</div></section>`;
  let sc=`<p class="prose">${d.score.type==='of'?'Count '+esc(d.score.unit)+' out of '+d.score.n+'.':d.score.type==='count'?'Record his '+esc(d.score.unit)+'.':lb?'Time it with a phone stopwatch and log the time in seconds. Lower is better.':'No score needed. Log the minutes.'}</p>`;
  if(log.length){
    const vals=log.map(it=>scoreVal(d,it)).filter(v=>v!=null&&!isNaN(v));
    const best=!vals.length?'':lb?Math.min(...vals).toFixed(2)+' s':Math.max(...vals)+(d.score.type==='of'?'%':'');
    const sp=vals.length<2?'':lb?spark(vals.map(v=>-v),null,vals[vals.length-1].toFixed(2)+' seconds',true):spark(vals,d.score.type==='of'?100:null);
    sc+=`<div class="hist">${sp}<div class="hist-stats"><span><b>${log.length}</b> ${plural(log.length,'time','times')}</span>${best?`<span>Best <b>${best}</b></span>`:''}</div></div>`;
    sc+=`<div class="list">${log.slice(-6).reverse().map(it=>`<div class="row"><span class="row-main"><span class="row-title">${esc(fmtDate(it.date))}</span></span><span class="row-score sm">${esc(scoreText(d,it))}</span></div>`).join('')}</div>`;
  }else sc+=`<p class="muted">No scores yet. His first try sets the bar to beat.</p>`;
  h+=`<section class="block"><h2>Score it</h2>${sc}</section>`;
  if(S.canWrite)h+=`<div class="savebar"><button class="btn primary wide" data-a="newSession" data-id="${d.id}">Log this drill</button></div>`;
  return `<div class="view">${h}</div>`;
}
function renderProgress(){
  const gs=games(),ss=sessions();
  let h=whoBar(false)+'<h1>Progress</h1>'+dbNotice();
  if(!gs.length&&!ss.length)return `<div class="view">${h}<div class="empty"><p><b>Nothing to chart yet.</b></p><p>Game stats, mistakes trending up or down, and drill scores show up here after the first game or training log.</p></div></div>`;
  const w=gs.filter(g=>result(g)==='W').length,dr=gs.filter(g=>result(g)==='D').length,mins=ss.reduce((a,x)=>a+(+x.minutes||0),0);
  h+=`<div class="tiles">${tile('Games logged',gs.length)}${tile('Won, drawn, lost',w+'-'+dr+'-'+(gs.length-w-dr))}${tile('Training sessions',ss.length)}${tile('Minutes trained',mins)}</div>`;
  const yg=gs.filter(g=>g.played&&g.played.young);
  if(yg.length){
    const t=yg.reduce((a,g)=>{const y=g.young||{},f=+(g.ratings||{}).fun||0;return {g:a.g+(+y.goals||0),b:a.b+(+y.beat||0),w:a.w+(+y.won||0),f:a.f+f,fn:a.fn+(f?1:0)};},{g:0,b:0,w:0,f:0,fn:0});
    const rec=yg.slice(0,10).reverse(),mx=Math.max(4,...rec.map(g=>+(g.young||{}).goals||0));
    h+=`<section class="block"><div class="block-head"><h2>His games</h2><span class="sub">${yg.length} ${plural(yg.length,'game','games')}</span></div>
    <div class="card"><p class="lbl2">Goals by game</p>${bars(rec.map(g=>({label:shortDate(g.date),value:+(g.young||{}).goals||0})),{max:mx%2?mx+1:mx,cls:'b-st',unit:'',label:'Goals by game'})}</div>
    <div class="tiles">${tile('Goals',t.g,'st')}${tile('Dribbled past someone',t.b,'st')}${tile('Won the ball back',t.w,'st')}${tile('Average fun',t.fn?(t.f/t.fn).toFixed(1)+'/5':'-','st')}</div></section>`;
  }
  const tests=drillLog('sp_test').filter(x=>x.score!=null&&x.score!=='');
  if(tests.length){
    const first=+tests[0].score,best=Math.min(...tests.map(x=>+x.score));
    h+=`<section class="block"><div class="block-head"><h2><span class="tag speed">Speed</span>20 m sprint</h2><span class="sub">${tests.length} ${plural(tests.length,'test','tests')}</span></div>
    <div class="tiles">${tile('First test',first.toFixed(2)+' s','')}${tile('Best',best.toFixed(2)+' s','')}${tile('Faster by',first>best?(first-best).toFixed(2)+' s':'-','')}</div></section>`;
  }
  const gk=gs.filter(g=>g.played&&g.played.gk);
  if(gk.length){
    const t=gk.reduce((a,g)=>({s:a.s+saves(g),c:a.c+conceded(g),ca:a.ca+(+(g.gk||{}).catches||0),dr:a.dr+(+(g.gk||{}).drops||0)}),{s:0,c:0,ca:0,dr:0});
    const allZ=gk.flatMap(g=>g.zones||[]),zc={};allZ.forEach(z=>{if(z.z!=='U')zc[z.z]=(zc[z.z]||0)+1;});
    const topZ=Object.keys(zc).sort((a,b)=>zc[b]-zc[a])[0];
    h+=`<section class="block"><div class="block-head"><h2><span class="tag gk">GK</span>Keeper</h2><span class="sub">${gk.length} ${plural(gk.length,'game','games')} in goal</span></div>
    <div class="card"><p class="lbl2">Save rate by game</p>${bars(gk.slice(0,10).reverse().map(g=>({label:shortDate(g.date),value:savePct(g)})),{max:100,cls:'b-gk',unit:'%',label:'Save rate by game'})}</div>
    <div class="tiles">${tile('Save rate overall',(t.s+t.c)?Math.round(t.s/(t.s+t.c)*100)+'%':'-','gk')}${tile('Catches held',(t.ca+t.dr)?Math.round(t.ca/(t.ca+t.dr)*100)+'%':'-','gk')}${tile('Goals against per game',(t.c/gk.length).toFixed(1),'gk')}</div>
    ${allZ.length?`<div class="card"><p class="lbl2">Where goals go in</p>${goalCells(allZ,false)}<p class="sub">${allZ.filter(z=>z.saveable).length} of ${allZ.length} marked saveable.${topZ?' Most go in '+ZONE_LABEL[topZ].toLowerCase()+'.':''}</p></div>`:''}</section>`;
  }
  const st=gs.filter(g=>g.played&&g.played.st);
  if(st.length){
    const all=st.flatMap(g=>g.shots||[]),goals=all.filter(x=>x.r==='goal').length,on=all.filter(x=>x.r==='goal'||x.r==='on').length;
    h+=`<section class="block"><div class="block-head"><h2><span class="tag st">ST</span>Striker</h2><span class="sub">${st.length} ${plural(st.length,'game','games')} up front</span></div>
    <div class="card"><p class="lbl2">Shots on target by game</p>${bars(st.slice(0,10).reverse().map(g=>({label:shortDate(g.date),value:shotStats(g).pct})),{max:100,cls:'b-st',unit:'%',label:'Shots on target by game'})}</div>
    <div class="tiles">${tile('Goals',goals,'st')}${tile('Shots',all.length,'st')}${tile('On target',all.length?Math.round(on/all.length*100)+'%':'-','st')}${tile('Assists',st.reduce((a,g)=>a+(+(g.st||{}).assists||0),0),'st')}</div>
    ${all.some(x=>x.x!=null)?`<div class="card"><p class="lbl2">Every shot</p>${pitchSVG(all)}${legend()}</div>`:''}</section>`;
  }
  if(gs.length){
    const a=gs.slice(0,3),b=gs.slice(3,6),ta=tallyErr(a),tb=tallyErr(b);
    const keys=[...new Set([...Object.keys(ta),...Object.keys(tb)])].sort((x,y)=>((ta[y]||0)-(ta[x]||0))||((tb[y]||0)-(tb[x]||0))).slice(0,8);
    h+=`<section class="block"><div class="block-head"><h2>${isYoung()?'Things to practice':'Mistakes'}</h2><span class="sub">${b.length?'Last 3 games compared with the ones before':'Last '+(a.length===1?'game':a.length+' games')}</span></div>`;
    if(!keys.length)h+='<p class="muted">Nothing logged yet.</p>';
    else h+=`<div class="list">${keys.map(k=>{const na=ta[k]||0,nb=tb[k]||0;let tr='';
      if(b.length){const ra=na/a.length,rb=nb/b.length;tr=ra<rb?'<span class="trend down">Fewer</span>':ra>rb?'<span class="trend up">More</span>':'<span class="trend same">Same</span>';}
      return `<div class="row">${errTag(k)}<span class="row-main"><span class="row-title wrap">${esc(ERR[k].label)}</span><span class="row-sub">Last ${a.length===1?'game':a.length}: ${na}${b.length?' · before: '+nb:''}</span></span>${tr}</div>`;}).join('')}</div>`;
    h+='</section>';
  }
  const rows=DRILLS.map(d=>({d,log:drillLog(d.id)})).filter(x=>x.log.length&&x.d.score.type!=='done');
  if(rows.length){
    h+=`<section class="block"><h2>Drill scores</h2><div class="list">${rows.map(({d,log})=>{
      const vals=log.map(it=>scoreVal(d,it)).filter(v=>v!=null&&!isNaN(v)),lb=d.score.type==='time';let tr='';
      if(vals.length>1){
        const diff=vals[vals.length-1]-vals[0];
        if(lb){const x=Math.abs(diff).toFixed(2);tr=diff<0?' · '+x+' s faster than the first try':diff>0?' · '+x+' s slower than the first try':' · same as the first try';}
        else{const u=d.score.type==='of'?' points':'';tr=diff>0?' · up '+diff+u+' since the first try':diff<0?' · down '+(-diff)+u+' since the first try':' · same as the first try';}
      }
      const sp=vals.length<2?'':lb?spark(vals.map(v=>-v),null,vals[vals.length-1].toFixed(2)+' seconds',true):spark(vals,d.score.type==='of'?100:null);
      return `<button class="row" data-a="drill" data-id="${d.id}"><span class="row-main"><span class="row-title wrap">${esc(d.name)}</span><span class="row-sub">Latest ${esc(scoreText(d,log[log.length-1]))}${tr}</span></span>${sp}</button>`;}).join('')}</div></section>`;
  }
  return `<div class="view">${h}</div>`;
}
function renderPlayer(){
  const p=S.pf||(S.pf=clone(S.profile)),a=ageOf(p),young=isYoung(p),nm=p.name||'him';
  let h=`<div class="bar"><button class="back" data-a="go" data-v="home">‹ Home</button></div><h1>${S.pfNew?'New player':'Player'}</h1>`;
  h+=`<section class="group">
  <div class="field"><label for="p-name">His name</label><input id="p-name" type="text" data-f="name" value="${esc(p.name)}" autocomplete="off"></div>
  <div class="two"><div class="field"><label for="p-year">Birth year</label><input id="p-year" type="number" inputmode="numeric" min="${THIS_YEAR-25}" max="${THIS_YEAR-3}" placeholder="${THIS_YEAR-11}" data-f="birthYear" value="${esc(p.birthYear)}"></div>
  <div class="field"><span class="lbl2">Age this year</span><p class="agechip">${a!=null?a:'-'}</p></div></div>
  <p class="sub">Used to pick drills and games that fit his age.</p>
  <div class="field"><label for="p-team">Team</label><input id="p-team" type="text" data-f="team" value="${esc(p.team)}" autocomplete="off"></div>
  <div class="field"><span class="lbl2">Position</span><div class="seg" role="group" aria-label="Position">${[['gk','Goalkeeper'],['st','Striker'],['all','Everywhere']].map(([v,l])=>`<button type="button" data-a="set" data-p="preferred" data-v="${v}" class="${p.preferred===v?'on':''}" aria-pressed="${p.preferred===v}">${l}</button>`).join('')}</div>${young?'<p class="sub">At his age most teams play small-sided games without fixed positions.</p>':''}</div>
  <div class="field"><span class="lbl2">What he wants to work on</span><div class="chips">${GOALS.filter(G=>G.drills.some(id=>DRILL[id]&&fitsAge(DRILL[id],p))).map(G=>{const on=(p.goals||[]).indexOf(G.id)>=0;return `<button type="button" class="chip ${on?'on':''}" data-a="pgoal" data-id="${G.id}" aria-pressed="${on}">${esc(G.label)}</button>`;}).join('')}</div></div>
  <div class="steppers">${stepper('Training sessions per week','weeklyGoal',p.weeklyGoal||3,'Weekly goal',1,7)}</div></section>`;
  h+=`<div class="savebar"><button class="btn primary wide" data-a="saveProfile">${S.pfNew?'Add player':'Save player'}</button></div>`;
  if(!S.pfNew&&S.players.length>1)h+=`<button class="btn danger wide" data-a="delPlayer" data-confirm="Tap again to remove ${esc(nm)} and his games and training">Remove ${esc(nm)}</button>`;
  if(S.pfNew)return `<div class="view">${h}</div>`;
  const lb=lsGet(K_BACKUP);
  h+=`<section class="group"><h2>Backup</h2><p>Games and training for every player are saved on this phone only, not online. A backup is one small file you can keep in Files, email to yourself, or use to move everything to a new phone.</p>
  <p class="sub">${lb?'Last backup: '+esc(new Date(lb).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})):'No backup yet.'}</p>
  <div class="backup-row"><button class="btn" data-a="exportBackup">Back up now</button><button class="btn" data-a="importPick">Restore a backup</button></div>`;
  if(S.pendingImport){const pi=S.pendingImport,gn=Object.keys(pi.data.games||{}).length,sn=Object.keys(pi.data.sessions||{}).length;
    h+=`<div class="note warn"><span>Replace everything on this phone with the backup from <b>${esc(pi.when)}</b>? It has ${gn} ${plural(gn,'game','games')} and ${sn} training ${plural(sn,'session','sessions')}.</span><div class="note-btns"><button class="btn small" data-a="importConfirm" data-confirm="Tap again to replace">Replace</button><button class="btn small" data-a="importCancel">Cancel</button></div></div>`;}
  h+=`</section>`;
  return `<div class="view">${h}</div>`;
}
function renderProgram(){
  const P=PROGRAM[S.arg]||PROGRAMS[0],pr=progOf(),active=!!(pr&&pr.id===P.id),done=(active&&pr.done)||{},fits=fitsAge(P);
  let h=`<div class="bar"><button class="back" data-a="go" data-v="train">‹ Train</button></div>`;
  h+=`<header class="dhead"><p class="eyebrow"><span class="tag speed">Speed</span>For ages ${P.ages[0]} to ${P.ages[1]}</p><h1>${esc(P.title)}</h1><p class="muted prose">${esc(P.summary)}</p></header>`;
  if(!fits)h+=`<div class="note"><span>This program is for ages ${P.ages[0]} to ${P.ages[1]}.${isYoung()?' For younger kids, chase games like Tail Tag build speed the right way.':''}</span></div>`;
  h+=`<section class="block"><h2>How it works</h2><ul class="cues prose">${SPEED_RULES.map(r=>`<li>${esc(r)}</li>`).join('')}</ul></section>`;
  P.weeks.forEach((w,wi)=>{
    h+=`<section class="block"><h2>Week ${wi+1}</h2>${w.map((x,si)=>{const key='w'+(wi+1)+'s'+(si+1),d=done[key];
      return `<div class="card prog-sess${d?' done':''}"><p class="eyebrow">${esc(x.name)}${d?`<span class="tag pick">Done ${esc(fmtDate(d,{month:'short',day:'numeric'}))}</span>`:''}</p><h3>${esc(x.focus)}</h3><ul class="prog-list">${x.items.map(([id,dose])=>`<li><button class="link" data-a="drill" data-id="${id}">${esc(DRILL[id].name)}</button> <span class="sub">${esc(dose)}</span></li>`).join('')}</ul></div>`;}).join('')}</section>`;
  });
  if(S.canWrite&&fits){
    if(!active)h+=`<div class="savebar"><button class="btn primary wide" data-a="progBegin" data-id="${P.id}">Start the program for ${esc(S.profile.name||'him')}</button></div>`;
    else{const nx=progNext();h+=`<div class="savebar"><button class="btn primary wide" data-a="progStart" ${nx?'':'disabled'}>${nx?'Start the next session':'Program complete'}</button></div><button class="btn danger wide" data-a="progStop" data-confirm="Tap again to stop the program">Stop the program</button>`;}
  }
  return `<div class="view">${h}</div>`;
}
function installNote(){
  if(IS_INSTALLED||lsGet(K_NOINSTALL))return '';
  const how=IS_IOS?'In Safari, tap the Share button, then <b>Add to Home Screen</b>.':'Open your browser menu and choose <b>Install app</b> or <b>Add to Home screen</b>.';
  return `<div class="note install"><span>Install this as an app: ${how} The installed app keeps its own data, so install it before you start logging.</span><button class="btn small" data-a="hideInstall">Got it</button></div>`;
}
function backupDue(){
  const now=Date.now(),lb=Date.parse(lsGet(K_BACKUP)||'')||0,sz=Date.parse(lsGet(K_SNOOZE)||'')||0;
  return now-lb>30*864e5&&now-sz>14*864e5;
}

/* ---------- Tactics board ----------
   Field coordinates are meters: x 0-68 left to right, y 0-105 top to bottom.
   Our team attacks up, toward y = 0. A board has tokens (players, ball,
   cones) and steps; each step stores where every token stands plus the
   arrows that show what happens next. */
const PLAYS=window.KSL_PLAYS||[];
const PLAY=Object.fromEntries(PLAYS.map(p=>[p.id,p]));
const VIEWBOX={full:'-3 -4 74 113',attack:'-3 -4 74 60',defend:'-3 49 74 60'};
const VIEW_NAME={full:'Full field',attack:'Attack half',defend:'Defend half'};
const VIEW_CENTER={full:[34,52.5],attack:[34,30],defend:[34,78]};
const TOOLS=[['move','Move'],['run','Run'],['pass','Pass'],['dribble','Dribble'],['shot','Shot']];
const KIND_NAME={run:'Run',pass:'Pass',dribble:'Dribble',shot:'Shot'};
const ADDABLE=[['us','Teammate'],['gk','Keeper'],['them','Opponent'],['ball','Ball'],['cone','Cone']];
const REDUCED=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const f1=v=>Math.round(v*100)/100;
const r1=v=>Math.round(v*10)/10;
const dist=(p,q)=>Math.hypot(p[0]-q[0],p[1]-q[1]);
const clampPt=p=>[r1(clamp(p[0],-2,70)),r1(clamp(p[1],-3,108))];
const wait=ms=>new Promise(r=>setTimeout(r,ms));
function ctrlOf(ar){return ar.c||[(ar.a[0]+ar.b[0])/2,(ar.a[1]+ar.b[1])/2];}
function qpt(a,c,b,t){const u=1-t;return [u*u*a[0]+2*u*t*c[0]+t*t*b[0],u*u*a[1]+2*u*t*c[1]+t*t*b[1]];}
function boardFor(arg){if(arg&&String(arg).indexOf('lib:')===0)return PLAY[String(arg).slice(4)]||null;return S.boards.find(b=>b.id===arg)||null;}
const FIELD_LINES=(()=>{
  let s='<rect x="-3" y="-4" width="74" height="113" class="t2"/>';
  for(let i=0;i<14;i++)s+=`<rect x="0" y="${i*7.5}" width="68" height="7.5" class="${i%2?'t2':'t1'}"/>`;
  s+='<g class="chalk"><rect x="0" y="0" width="68" height="105"/><path d="M0 52.5H68"/><circle cx="34" cy="52.5" r="9.15"/>'+
    '<path d="M13.84 0V16.5H54.16V0M24.84 0V5.5H43.16V0M26.69 16.5A9.15 9.15 0 0 0 41.31 16.5"/>'+
    '<path d="M13.84 105V88.5H54.16V105M24.84 105V99.5H43.16V105M26.69 88.5A9.15 9.15 0 0 1 41.31 88.5"/>'+
    '<path d="M1 0A1 1 0 0 1 0 1M67 0A1 1 0 0 0 68 1M0 104A1 1 0 0 1 1 105M68 104A1 1 0 0 0 67 105"/></g>'+
    '<g class="spot"><circle cx="34" cy="52.5" r=".4"/><circle cx="34" cy="11" r=".4"/><circle cx="34" cy="94" r=".4"/></g>'+
    '<rect class="goalbox" x="30.34" y="-2" width="7.32" height="2"/><rect class="goalbox" x="30.34" y="105" width="7.32" height="2"/>';
  return s;
})();
function wavyPath(a,c,b){
  const len=dist(a,c)+dist(c,b),n=Math.max(6,Math.round(len/0.55));let d='';
  for(let i=0;i<=n;i++){
    const t=i/n,p=qpt(a,c,b,t),u=1-t;
    let tx=2*u*(c[0]-a[0])+2*t*(b[0]-c[0]),ty=2*u*(c[1]-a[1])+2*t*(b[1]-c[1]);const L=Math.hypot(tx,ty)||1;
    const w=(i<2||i>n-3)?0:0.55*Math.sin(i*Math.PI/2);
    d+=(i?'L':'M')+f1(p[0]-ty/L*w)+' '+f1(p[1]+tx/L*w);
  }
  return d;
}
function arrowShape(ar){
  const a=ar.a,b=ar.b,c=ctrlOf(ar);
  const line=ar.kind==='dribble'?wavyPath(a,c,b):`M${f1(a[0])} ${f1(a[1])}Q${f1(c[0])} ${f1(c[1])} ${f1(b[0])} ${f1(b[1])}`;
  let dx=b[0]-c[0],dy=b[1]-c[1];if(Math.hypot(dx,dy)<.01){dx=b[0]-a[0];dy=b[1]-a[1];}
  const L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L,hl=ar.kind==='shot'?2:1.6,hw=ar.kind==='shot'?1:.8,bx=b[0]-ux*hl,by=b[1]-uy*hl;
  return {line,hit:`M${f1(a[0])} ${f1(a[1])}Q${f1(c[0])} ${f1(c[1])} ${f1(b[0])} ${f1(b[1])}`,head:`M${f1(b[0])} ${f1(b[1])}L${f1(bx-uy*hw)} ${f1(by+ux*hw)}L${f1(bx+uy*hw)} ${f1(by-ux*hw)}Z`};
}
function arrowsSVG(arrows,o){
  return arrows.map((ar,i)=>{const s=arrowShape(ar),sel=o.edit&&o.sel&&o.sel.kind==='arr'&&o.sel.i===i;
    return `<g class="arrow${sel?' sel':''}" data-arrow="${i}">${o.edit?`<path class="hitp" d="${s.hit}"/>`:''}<path class="arr ${ar.kind}" d="${s.line}"/><path class="ah ${ar.kind}" d="${s.head}"/></g>`;}).join('');
}
function handlesSVG(arrows,o){
  if(!o.edit||!o.sel||o.sel.kind!=='arr'||!arrows[o.sel.i])return '';
  const ar=arrows[o.sel.i],m=qpt(ar.a,ctrlOf(ar),ar.b,.5),i=o.sel.i;
  return [['a',ar.a],['b',ar.b],['c',m]].map(([h,p])=>`<g class="handle${h==='c'?' mid':''}" data-handle="${h}" data-i="${i}" transform="translate(${f1(p[0])} ${f1(p[1])})"><circle class="hit" r="3.2"/><circle class="hd" r="${h==='c'?1.3:1}"/></g>`).join('');
}
function tokenSVG(t,p,o){
  if(!p)return '';
  const sel=o.edit&&o.sel&&o.sel.kind==='tok'&&o.sel.id===t.id,lab=String(t.label||'');
  let g;
  if(t.type==='ball')g='<circle class="hit" r="2.8"/><circle class="ballc" r="1.1"/><path class="ballp" d="M0 -.45L.43 -.14L.27 .36H-.27L-.43 -.14Z"/>';
  else if(t.type==='cone')g='<circle class="hit" r="2.8"/><path class="cone" d="M0 -1.5L1.3 1H-1.3Z"/>';
  else g=`<circle class="hit" r="3.4"/>${t.hi?'<circle class="hi" r="2.9"/>':''}<circle class="body ${t.type}" r="${TOKEN_R}"/><text class="lab" text-anchor="middle" dominant-baseline="central" font-size="${lab.length>2?1.5:lab.length>1?1.9:2.3}">${esc(lab)}</text>`;
  if(sel)g+=`<circle class="selring" r="${t.type==='ball'||t.type==='cone'?2.2:3.5}"/>`;
  return `<g class="tok" data-tok="${esc(t.id)}" transform="translate(${f1(p[0])} ${f1(p[1])})">${g}</g>`;
}
const TOKEN_R=2.1,BALL_GAP=3.25;
/* Where to draw each token: a ball that overlaps a player is shown just
   touching his edge, so it never hides his number. */
function displayPos(b,st){
  const pos=Object.assign({},st.pos);
  const players=b.tokens.filter(t=>(t.type==='us'||t.type==='gk'||t.type==='them')&&st.pos[t.id]);
  b.tokens.forEach(t=>{
    if(t.type!=='ball'||!pos[t.id])return;
    const p=pos[t.id];let near=null,nd=1e9;
    players.forEach(pl=>{const d=dist(p,st.pos[pl.id]);if(d<nd){nd=d;near=st.pos[pl.id];}});
    if(near&&nd<BALL_GAP){let dx=p[0]-near[0],dy=p[1]-near[1],L=Math.hypot(dx,dy);if(L<.01){dx=0;dy=1;L=1;}pos[t.id]=[r1(near[0]+dx/L*BALL_GAP),r1(near[1]+dy/L*BALL_GAP)];}
  });
  return pos;
}
function fieldSVG(b,step,o){
  o=o||{};const st=b.steps[step]||b.steps[0],dp=displayPos(b,st);
  return `<svg class="field${o.edit?' edit':''}${o.thumb?' thumb':''}" ${o.edit?'data-board="1"':''} viewBox="${VIEWBOX[b.view]||VIEWBOX.full}" ${o.thumb?'aria-hidden="true"':`role="img" aria-label="${esc(b.title||'Soccer field')}, step ${step+1}"`}>${FIELD_LINES}<g class="arrows">${arrowsSVG(st.arrows||[],o)}</g><g class="toks">${b.tokens.map(t=>tokenSVG(t,dp[t.id],o)).join('')}</g><g class="handles">${handlesSVG(st.arrows||[],o)}</g>${o.edit?'<path class="arr draft" id="drawPath" d=""/>':''}</svg>`;
}
function arrowLegend(){
  return `<div class="legend arrow-legend">${[['pass','Pass'],['run','Run'],['dribble','Dribble'],['shot','Shot']].map(([k,l])=>{const s=arrowShape({kind:k,a:[1,2],b:[11,2]});return `<span><svg class="lgarr" viewBox="0 0 12 4" aria-hidden="true"><rect width="12" height="4" rx="1" class="t1"/><path class="arr ${k}" d="${s.line}"/><path class="ah ${k}" d="${s.head}"/></svg>${l}</span>`;}).join('')}</div>`;
}
function boardTemplate(kind){
  if(kind==='lineup'){
    let L,title;
    if(isYoung()){const me=(S.profile.name||'Me').charAt(0).toUpperCase();L=[['us',me,34,64],['us','2',18,57],['us','3',50,57],['us','4',34,47],['ball','',34,52.5]];title='Our 4v4 team';}
    else{L=[['gk','GK',34,100.5],['us','2',54,87],['us','4',34,89],['us','3',14,87],['us','6',24,73],['us','8',44,73],['us','7',56,60],['us','9',34,58],['us','11',12,60],['ball','',34,52.5]];title='Our 9v9 lineup';}
    const hiLabel=isYoung()?L[0][1]:S.profile.preferred==='st'?'9':'GK';
    return {title,view:'full',tokens:L.map((x,i)=>({id:'t'+(i+1),type:x[0],label:x[1],hi:x[1]===hiLabel&&x[0]!=='ball'})),steps:[{caption:'',pos:Object.fromEntries(L.map((x,i)=>['t'+(i+1),[x[2],x[3]]])),arrows:[]}]};
  }
  return {title:'',view:'full',tokens:[{id:'t1',type:'ball',label:''}],steps:[{caption:'',pos:{t1:[34,52.5]},arrows:[]}]};
}
function libToDraft(p){const d=clone({title:p.title,view:p.view,tokens:p.tokens,steps:p.steps});d.steps.forEach(s=>{s.arrows=s.arrows||[];s.caption=s.caption||'';});return d;}
function curStep(){return S.bd.steps[S.bStep];}
function pushHist(){S.bHist.push(JSON.stringify(S.bd));if(S.bHist.length>60)S.bHist.shift();}
function nextLabel(type){
  if(type==='ball'||type==='cone')return '';if(type==='gk')return 'GK';
  const used=new Set(S.bd.tokens.filter(t=>t.type===type).map(t=>String(t.label)));
  for(const n of [2,3,4,5,6,7,8,9,10,11,1,12,13,14,15])if(!used.has(String(n)))return String(n);
  return '';
}
/* When a step is added, move each token along the arrow that starts at it. */
function advancePositions(st){
  const pos=clone(st.pos),moved=new Set();
  const near=(p,types,max)=>S.bd.tokens.filter(t=>types.indexOf(t.type)>=0&&st.pos[t.id]&&!moved.has(t.id)).map(t=>({t,d:dist(st.pos[t.id],p)})).filter(x=>x.d<=max).sort((x,y)=>x.d-y.d)[0];
  (st.arrows||[]).forEach(ar=>{
    if(ar.kind==='pass'||ar.kind==='shot'){const hit=near(ar.a,['ball'],3);if(hit){pos[hit.t.id]=ar.b.slice();moved.add(hit.t.id);}return;}
    const pl=near(ar.a,['us','gk','them'],3.5);
    if(pl){pos[pl.t.id]=ar.b.slice();moved.add(pl.t.id);}
    if(ar.kind==='dribble'){const ball=near(ar.a,['ball'],3.5);if(ball){const p0=st.pos[ball.t.id];pos[ball.t.id]=clampPt([ar.b[0]+(p0[0]-ar.a[0]),ar.b[1]+(p0[1]-ar.a[1])]);moved.add(ball.t.id);}}
  });
  return pos;
}

function renderBoardList(){
  let h=whoBar(false)+'<div class="bar"><h1>Board</h1></div><p class="muted">Put players on the field, draw runs and passes, and step through a move together.</p>';
  const dr=lsGet(K_BOARD);
  if(dr&&dr.d&&!dr.edit)h+=`<div class="note"><span>You have an unsaved board${dr.d.title?': <b>'+esc(dr.d.title)+'</b>':''}.</span><button class="btn small" data-a="bResume">Keep editing</button></div>`;
  const young=isYoung();
  if(S.canWrite)h+=`<div class="actions"><button class="btn primary big" data-a="bNew" data-v="blank">New board<small>Empty field</small></button><button class="btn big" data-a="bNew" data-v="lineup">Team lineup<small>${young?'4v4, no keeper':'9v9 in a 3-2-3'}</small></button></div>`;
  const list=PLAYS.filter(p=>fitsAge({ages:p.ages||[9,18]})&&(young||S.playPos==='all'||p.pos===S.playPos));
  h+=`<section class="block"><div class="block-head"><h2>Moves to learn</h2><span class="sub">Tap one, then press Play</span></div>
  ${young?'':`<div class="seg" role="group" aria-label="Filter moves">${[['all','All'],['gk','Keeper'],['st','Striker']].map(([v,l])=>`<button type="button" data-a="playPos" data-v="${v}" class="${S.playPos===v?'on':''}" aria-pressed="${S.playPos===v}">${l}</button>`).join('')}</div>`}
  <div class="drills">${list.map(p=>`<button class="dcard playcard" data-a="bOpen" data-id="lib:${p.id}">${fieldSVG(p,0,{thumb:true})}<span class="pc-text"><span class="dc-top"><span class="tag ${p.pos}">${POS_SHORT[p.pos]}</span><span class="sub">${p.steps.length} steps</span></span><span class="dc-name">${esc(p.title)}</span><span class="sub">${esc(p.summary)}</span></span></button>`).join('')}</div></section>`;
  const mine=S.boards.slice().sort((a,b)=>(b.updatedAt||'').localeCompare(a.updatedAt||''));
  h+=`<section class="block"><h2>My boards</h2>${mine.length?`<div class="list">${mine.map(b=>`<button class="row" data-a="bOpen" data-id="${esc(b.id)}"><span class="row-main"><span class="row-title">${esc(b.title||'Untitled board')}</span><span class="row-sub">${b.steps.length} ${plural(b.steps.length,'step','steps')} · ${esc(VIEW_NAME[b.view]||'')}</span></span><span class="go" aria-hidden="true">›</span></button>`).join('')}</div>`:'<div class="empty"><p><b>No boards yet.</b></p><p>Start a new board to show him a move, or open a ready-made one and tap Copy to edit to change it.</p></div>'}</section>`;
  return `<div class="view">${h}</div>`;
}
function renderBoardView(){
  const b=boardFor(S.arg);
  let h='<div class="bar"><button class="back" data-a="go" data-v="board">‹ Board</button>';
  if(!b)return `<div class="view">${h}</div><p class="muted">${S.gotBoards?'This board is no longer here.':'Loading...'}</p></div>`;
  const lib=String(S.arg).indexOf('lib:')===0;
  if(S.bStep>=b.steps.length)S.bStep=0;
  if(S.canWrite)h+=lib?'<button class="btn small" data-a="bCopy">Copy to edit</button>':`<button class="btn small" data-a="bEdit">Edit</button>`;
  h+='</div>';
  h+=`<header class="dhead">${lib?`<p class="eyebrow"><span class="tag ${b.pos}">${POS_SHORT[b.pos]}</span>Move to learn</p>`:''}<h1>${esc(b.title||'Untitled board')}</h1>${b.summary?`<p class="muted">${esc(b.summary)}</p>`:''}</header>`;
  h+=fieldSVG(b,S.bStep,{});
  h+=`<div class="player"><button class="btn small" data-a="bPrev" ${S.bStep===0||S.playing?'disabled':''}>‹ Back</button><span class="stepcount">Step ${S.bStep+1} of ${b.steps.length}</span><button class="btn small" data-a="bNext" ${S.bStep>=b.steps.length-1||S.playing?'disabled':''}>Next ›</button><button class="btn small primary" data-a="${S.playing?'bStop':'bPlay'}" ${b.steps.length<2?'disabled':''}>${S.playing?'Stop':'Play'}</button></div>`;
  const cap=b.steps[S.bStep].caption;
  if(cap||b.steps.length>1)h+=`<p class="caption">${cap?esc(cap):'<span class="muted">No note for this step.</span>'}</p>`;
  h+=arrowLegend();
  if(lib&&b.drills&&b.drills.length)h+=`<section class="block"><h2>Practice it</h2><div class="list pad">${b.drills.map(id=>dlink(DRILL[id])).join('')}</div></section>`;
  return `<div class="view">${h}</div>`;
}
function toolHint(){
  if(S.bTool==='move')return 'Drag players and the ball. Tap an arrow to bend or remove it.';
  return 'Drag from a player or the ball to draw a '+KIND_NAME[S.bTool].toLowerCase()+' arrow. Then drag its middle dot to bend it.';
}
function renderBoardEdit(){
  const b=S.bd;if(!b){S.view='board';return renderBoardList();}
  if(S.bStep>=b.steps.length)S.bStep=b.steps.length-1;
  const st=b.steps[S.bStep],sel=S.bSel;
  let h=`<div class="bar"><button class="back" data-a="boardBack">‹ Back</button><span class="sub">${S.bEdit?'Editing a saved board':'Your draft is kept as you go'}</span></div>`;
  h+=`<input id="b-title" type="text" class="title-input" data-f="title" value="${esc(b.title)}" placeholder="Name this board" aria-label="Board name" autocomplete="off">`;
  h+=`<div class="seg tools" role="group" aria-label="Tool">${TOOLS.map(([v,l])=>`<button type="button" data-a="bTool" data-v="${v}" class="${S.bTool===v?'on':''}" aria-pressed="${S.bTool===v}">${l}</button>`).join('')}</div>`;
  h+=`<p class="sub">${toolHint()}</p>`;
  h+=fieldSVG(b,S.bStep,{edit:true,sel});
  if(sel&&sel.kind==='tok'){
    const i=b.tokens.findIndex(t=>t.id===sel.id),t=b.tokens[i];
    if(t)h+=`<div class="selpanel"><span class="lbl2">${esc(TOKEN_NAME[t.type]||'Token')}</span>${t.type==='ball'||t.type==='cone'?'':`<div class="field sm"><label for="b-lab">Label</label><input id="b-lab" type="text" maxlength="3" data-f="tokens.${i}.label" value="${esc(t.label)}" autocomplete="off"></div><button type="button" class="mini ${t.hi?'on-gold':''}" data-a="bHi" aria-pressed="${!!t.hi}">Gold ring</button>`}<button type="button" class="mini" data-a="bDelTok">Remove</button></div>`;
  }
  if(sel&&sel.kind==='arr'&&st.arrows[sel.i]){
    const ar=st.arrows[sel.i];
    h+=`<div class="selpanel"><span class="lbl2">${KIND_NAME[ar.kind]} arrow</span>${ar.c?'<button type="button" class="mini" data-a="bStraight">Straighten</button>':''}<button type="button" class="mini" data-a="bDelArr">Remove</button></div>`;
  }
  h+=`<div class="addrow"><span class="lbl2">Add</span>${ADDABLE.map(([t,l])=>`<button type="button" class="btn small" data-a="bAdd" data-v="${t}">+ ${l}</button>`).join('')}</div>`;
  h+=`<div class="row-btns"><button type="button" class="btn small" data-a="bUndo" ${S.bHist.length?'':'disabled'}>Undo</button><button type="button" class="btn small" data-a="bClearArrows" ${st.arrows.length?'':'disabled'}>Clear arrows</button></div>`;
  h+=`<div class="field"><span class="lbl2">Show</span><div class="seg" role="group" aria-label="Part of the field">${Object.keys(VIEWBOX).map(v=>`<button type="button" data-a="set" data-p="view" data-v="${v}" class="${b.view===v?'on':''}" aria-pressed="${b.view===v}">${VIEW_NAME[v]}</button>`).join('')}</div></div>`;
  h+=`<section class="group"><h2>Steps</h2><p class="sub">Each step is one moment of the move. Draw arrows for what happens next, then tap Add step: players and the ball move along your arrows.</p>
  <div class="steps-bar">${b.steps.map((s,i)=>`<button type="button" class="stepchip ${i===S.bStep?'on':''}" data-a="bStep" data-i="${i}" aria-label="Step ${i+1}" aria-pressed="${i===S.bStep}">${i+1}</button>`).join('')}<button type="button" class="btn small" data-a="bAddStep">+ Add step</button>${b.steps.length>1?`<button type="button" class="btn small danger" data-a="bDelStep" data-confirm="Tap again to delete">Delete step ${S.bStep+1}</button>`:''}</div>
  <div class="field"><label for="b-cap">What to say at step ${S.bStep+1}</label><textarea id="b-cap" data-f="steps.${S.bStep}.caption" placeholder="Example: Curve your run so you stay onside">${esc(st.caption)}</textarea></div></section>`;
  h+=`<div class="savebar"><button class="btn primary wide" data-a="saveBoard">${S.bEdit?'Save changes':'Save board'}</button></div>`;
  if(S.bEdit)h+=`<button class="btn danger wide" data-a="delBoard" data-confirm="Tap again to delete this board">Delete board</button>`;
  return `<div class="view">${h}</div>`;
}
const TOKEN_NAME={us:'Teammate',gk:'Our keeper',them:'Opponent',ball:'Ball',cone:'Cone'};
function redrawField(){
  const svg=view.querySelector('svg[data-board]');if(!svg||!S.bd)return;
  svg.outerHTML=fieldSVG(S.bd,S.bStep,{edit:true,sel:S.bSel});
}
async function saveBoard(btn){
  if(!S.db)return toast(NO_DB);
  const b=clone(S.bd);delete b.id;
  b.title=String(b.title||'').trim().slice(0,60)||'Untitled board';
  const now=new Date().toISOString();b.updatedAt=now;if(!b.createdAt)b.createdAt=now;
  const ref=S.bEdit?S.db.doc('boards/'+S.bEdit):S.db.collection('boards').doc();
  btn.disabled=true;btn.textContent='Saving...';
  try{await ref.set(b);}catch(e){btn.disabled=false;btn.textContent='Save board';return toast(dbMsg(e));}
  lsSet(K_BOARD,null);S.bd=null;S.bEdit=null;S.bHist=[];S.bSel=null;toast('Board saved');S.bStep=0;go('boardview',ref.id);
}

/* Playback: tokens glide from one step to the next, following the arrow
   that carried them when there is one. */
let animTok=0,playTok=0;
function animateStep(b,from,to){
  return new Promise(res=>{
    const svg=view.querySelector('svg.field');const A=b.steps[from],B=b.steps[to];
    if(!svg||!A||!B||REDUCED){res();return;}
    const paths={},dA=displayPos(b,A),dB=displayPos(b,B);
    b.tokens.forEach(t=>{
      const p0=A.pos[t.id],p1=B.pos[t.id];if(!p0||!p1)return;
      const fits=ar=>dist(ar.a,p0)<3.5&&dist(ar.b,p1)<3.5;
      const arrs=A.arrows||[];
      const ar=t.type==='ball'?(arrs.find(r=>(r.kind==='pass'||r.kind==='shot')&&fits(r))||arrs.find(fits)):arrs.find(r=>r.kind!=='pass'&&r.kind!=='shot'&&fits(r));
      const q0=dA[t.id],q1=dB[t.id];
      paths[t.id]={p0:q0,p1:q1,c:ar&&ar.c?[ar.c[0]+(q0[0]-ar.a[0]+q1[0]-ar.b[0])/2,ar.c[1]+(q0[1]-ar.a[1]+q1[1]-ar.b[1])/2]:null};
    });
    const els={};svg.querySelectorAll('[data-tok]').forEach(el=>{els[el.getAttribute('data-tok')]=el;});
    const dur=1300,t0=performance.now(),my=++animTok;
    const frame=now=>{
      if(my!==animTok){res();return;}
      const k=Math.min(1,(now-t0)/dur),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
      for(const id in paths){const P=paths[id],el=els[id];if(!el)continue;
        const q=P.c?qpt(P.p0,P.c,P.p1,e):[P.p0[0]+(P.p1[0]-P.p0[0])*e,P.p0[1]+(P.p1[1]-P.p0[1])*e];
        el.setAttribute('transform','translate('+f1(q[0])+' '+f1(q[1])+')');}
      if(k<1)requestAnimationFrame(frame);else res();
    };
    requestAnimationFrame(frame);
  });
}
async function stepTo(n){
  const b=boardFor(S.arg);if(!b||n<0||n>=b.steps.length)return;
  if(n===S.bStep+1)await animateStep(b,S.bStep,n);
  S.bStep=n;render();
}
async function playAll(){
  const b=boardFor(S.arg);if(!b||b.steps.length<2)return;
  const my=++playTok;S.playing=true;S.bStep=0;render();
  await wait(1400);
  for(let i=0;i<b.steps.length-1;i++){
    if(my!==playTok)return;
    await animateStep(b,i,i+1);
    if(my!==playTok)return;
    S.bStep=i+1;render();
    await wait(i+1<b.steps.length-1?2600:400);
  }
  if(my===playTok){S.playing=false;render();}
}
function stopPlay(){playTok++;animTok++;S.playing=false;}

document.addEventListener('pointerdown',e=>{
  if(S.view!=='boardedit'||!S.bd)return;
  const svg=e.target.closest&&e.target.closest('svg[data-board]');if(!svg)return;
  e.preventDefault();
  const st=curStep(),p=svgPoint(svg,e);
  const hEl=e.target.closest('[data-handle]'),arEl=e.target.closest('[data-arrow]');
  // The closest piece wins, so a player can be grabbed even with the ball at his feet.
  let tokId=null,best=1e9;const dp=displayPos(S.bd,st);
  S.bd.tokens.forEach(t=>{const q=dp[t.id];if(!q)return;const d=dist(q,p),r=t.type==='ball'||t.type==='cone'?2.8:3.6;if(d<=r&&d<best){best=d;tokId=t.id;}});
  S.dragSnap=JSON.stringify(S.bd);
  if(hEl)S.drag={kind:'handle',h:hEl.getAttribute('data-handle'),i:+hEl.getAttribute('data-i')};
  else if(S.bTool==='move'){
    if(tokId){st.pos[tokId]=dp[tokId].slice();const tp=st.pos[tokId];S.bSel={kind:'tok',id:tokId};S.drag={kind:'tok',id:tokId,off:[tp[0]-p[0],tp[1]-p[1]],el:svg.querySelector('[data-tok="'+tokId+'"]')};}
    else if(arEl){S.bSel={kind:'arr',i:+arEl.getAttribute('data-arrow')};S.drag={kind:'none'};}
    else{S.bSel=null;S.drag={kind:'none'};}
  }else{
    const a=tokId?dp[tokId].slice():clampPt(p);
    S.drag={kind:'draw',a,b:clampPt(p)};
  }
  S.drag.svg=svg;
  try{svg.setPointerCapture(e.pointerId);}catch(err){}
});
document.addEventListener('pointermove',e=>{
  const d=S.drag;if(!d||!d.svg||!S.bd)return;
  const p=svgPoint(d.svg,e),st=curStep();
  if(d.kind==='tok'){const np=clampPt([p[0]+d.off[0],p[1]+d.off[1]]);st.pos[d.id]=np;if(d.el)d.el.setAttribute('transform','translate('+np[0]+' '+np[1]+')');}
  else if(d.kind==='handle'){
    const ar=st.arrows[d.i];if(!ar)return;const q=clampPt(p);
    if(d.h==='c')ar.c=[r1(2*q[0]-(ar.a[0]+ar.b[0])/2),r1(2*q[1]-(ar.a[1]+ar.b[1])/2)];else ar[d.h]=q;
    d.svg.querySelector('g.arrows').innerHTML=arrowsSVG(st.arrows,{edit:true,sel:S.bSel});
    d.svg.querySelector('g.handles').innerHTML=handlesSVG(st.arrows,{edit:true,sel:S.bSel});
  }else if(d.kind==='draw'){
    d.b=clampPt(p);const pe=d.svg.querySelector('#drawPath');
    if(pe){pe.setAttribute('d','M'+d.a[0]+' '+d.a[1]+'L'+d.b[0]+' '+d.b[1]);pe.setAttribute('class','arr draft '+S.bTool);}
  }
});
function endDrag(){
  const d=S.drag;if(!d)return;S.drag=null;if(!S.bd)return;
  if(d.kind==='draw'&&dist(d.a,d.b)>=1.5){const st=curStep();st.arrows.push({kind:S.bTool,a:d.a,b:d.b,c:null});S.bSel={kind:'arr',i:st.arrows.length-1};}
  if(JSON.stringify(S.bd)!==S.dragSnap){S.bHist.push(S.dragSnap);if(S.bHist.length>60)S.bHist.shift();persist();}
  render();
}
document.addEventListener('pointerup',endDrag);
document.addEventListener('pointercancel',endDrag);
function svgPoint(svg,e){
  const m=svg.getScreenCTM();if(!m)return [0,0];
  const pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const q=pt.matrixTransform(m.inverse());
  return [q.x,q.y];
}

/* ---------- Render loop ---------- */
const VIEWS={home:renderHome,games:renderGames,game:renderGame,gameform:renderGameForm,train:renderTrain,drill:renderDrill,sessionform:renderSessionForm,progress:renderProgress,player:renderPlayer,program:renderProgram,board:renderBoardList,boardview:renderBoardView,boardedit:renderBoardEdit};
const TAB_OF={home:'home',player:'home',games:'games',game:'games',gameform:'games',train:'train',drill:'train',sessionform:'train',progress:'progress',program:'train',board:'board',boardview:'board',boardedit:'board'};
function keyOf(el){if(!el||!el.dataset||!el.dataset.a)return null;const d=el.dataset;return [d.a,d.p,d.d,d.id,d.z,d.i,d.v].join('|');}
function render(){
  const k=view.contains(document.activeElement)?keyOf(document.activeElement):null;
  view.innerHTML=(VIEWS[S.view]||renderHome)();
  document.querySelectorAll('.tab').forEach(t=>{const on=t.dataset.v===TAB_OF[S.view];t.classList.toggle('on',on);if(on)t.setAttribute('aria-current','page');else t.removeAttribute('aria-current');});
  if(k){for(const el of view.querySelectorAll('[data-a]')){if(keyOf(el)===k){el.focus({preventScroll:true});break;}}}
}
function go(v,arg){if(S.playing||animTok)stopPlay();S.view=v;S.arg=arg==null?null:arg;render();window.scrollTo(0,0);}
function refresh(){if(!FORM_VIEWS.has(S.view))render();}
function draft(){return S.view==='gameform'?S.gd:S.view==='sessionform'?S.sd:S.view==='player'?S.pf:S.view==='boardedit'?S.bd:null;}
function persist(){if(S.view==='gameform'&&S.gd)lsSet(K_GAME,{edit:S.gEdit,d:S.gd,pid:S.pid});else if(S.view==='sessionform'&&S.sd)lsSet(K_SESS,{edit:S.sEdit,d:S.sd,pid:S.pid});else if(S.view==='boardedit'&&S.bd)lsSet(K_BOARD,{edit:S.bEdit,d:S.bd});}
function edited(){persist();render();}
let toastT;
function toast(m){const el=$('#toast');el.textContent=m;el.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>{el.hidden=true;},2800);}
function confirmTap(t,fn){
  if(t.dataset.armed==='1'){fn();return;}
  const old=t.textContent;t.dataset.armed='1';t.textContent=t.dataset.confirm||'Tap again to confirm';t.classList.add('armed');
  setTimeout(()=>{if(t.isConnected){t.dataset.armed='';t.textContent=old;t.classList.remove('armed');}},4000);
}
function dbMsg(e){
  const c=e&&e.code;
  if(c==='quota_exceeded')return 'This phone has no room left for the app’s data. Back up, delete old entries, then try again.';
  return 'Could not save. Close and reopen the app, then try again.';
}

/* ---------- Saving ---------- */
async function saveGame(btn){
  if(!S.db)return toast(NO_DB);
  const g=normGame(clone(S.gd));delete g.pending;delete g.id;
  if(!g.date)return toast('Add the date of the game.');
  if(!g.played.young&&!g.played.gk&&!g.played.st)return toast('Pick at least one position he played.');
  if(!g.played.young)delete g.young;
  if(!g.played.gk){g.zones=[];g.gk=newGame().gk;g.gkMins='';}
  if(!g.played.st){g.shots=[];g.st={assists:0,chances:0};g.stMins='';}
  for(const k of Object.keys(g.errors)){if(!ERR[k]||!(+g.errors[k]>0)||!g.played[ERR[k].pos])delete g.errors[k];}
  g.wells=g.wells.filter(k=>WELL[k]&&(WELL[k].pos==='both'||g.played[WELL[k].pos]));
  g.opponent=String(g.opponent||'').trim().slice(0,60);
  g.gkMins=g.gkMins===''?null:+g.gkMins;g.stMins=g.stMins===''?null:+g.stMins;
  if(!g.playerId)g.playerId=S.pid;
  const now=new Date().toISOString();g.updatedAt=now;if(!g.createdAt)g.createdAt=now;
  const ref=S.gEdit?S.db.doc('games/'+S.gEdit):S.db.collection('games').doc();
  btn.disabled=true;btn.textContent='Saving...';
  try{await ref.set(g);}catch(e){btn.disabled=false;btn.textContent='Save game';return toast(dbMsg(e));}
  lsSet(K_GAME,null);S.gd=null;S.gEdit=null;S.gResumed=false;toast('Game saved');go('game',ref.id);
}
async function saveSession(btn){
  if(!S.db)return toast(NO_DB);
  const x=clone(S.sd);delete x.id;
  if(!x.date)return toast('Add the date.');
  x.items=x.items.filter(i=>DRILL[i.drillId]).map(i=>{const t=DRILL[i.drillId].score.type,o={drillId:i.drillId,score:(t==='done'||i.score===''||i.score==null)?null:Number(i.score),outOf:t==='of'?(Number(i.outOf)||DRILL[i.drillId].score.n):null};if(i.dose)o.dose=i.dose;return o;});
  if(!x.items.length&&!x.minutes)return toast('Add a drill or the minutes trained.');
  x.minutes=x.minutes===''||x.minutes==null?null:Number(x.minutes);
  if(!x.playerId)x.playerId=S.pid;
  const now=new Date().toISOString();x.updatedAt=now;if(!x.createdAt)x.createdAt=now;
  const ref=S.sEdit?S.db.doc('sessions/'+S.sEdit):S.db.collection('sessions').doc();
  btn.disabled=true;btn.textContent='Saving...';
  try{await ref.set(x);}catch(e){btn.disabled=false;btn.textContent='Save training';return toast(dbMsg(e));}
  const pd=playerDoc();
  if(x.programKey&&pd&&pd.program&&PROGRAM[pd.program.id]){pd.program.done=Object.assign({},pd.program.done,{[x.programKey]:x.date});try{await writePlayer(pd);}catch(e){}}
  lsSet(K_SESS,null);S.sd=null;S.sEdit=null;S.sResumed=false;toast(x.programKey?'Session saved. Nice work!':'Training saved');go(x.programKey?'home':'train');
}
async function saveProfile(btn){
  if(!S.db)return toast(NO_DB);
  const f=S.pf,by=+f.birthYear;
  if(f.birthYear!==''&&f.birthYear!=null&&!(by>=THIS_YEAR-25&&by<=THIS_YEAR-3))return toast('Check the birth year. It should look like '+(THIS_YEAR-11)+'.');
  const base=S.pfNew?{}:(playerDoc()||{});
  const p=Object.assign(base,{name:String(f.name||'').trim().slice(0,40),team:String(f.team||'').trim().slice(0,60),birthYear:by||null,
    preferred:['gk','st','all'].indexOf(f.preferred)>=0?f.preferred:'gk',weeklyGoal:clamp(+f.weeklyGoal||3,1,7),goals:(f.goals||[]).filter(g=>GOAL[g])});
  delete p.id;if(!p.createdAt)p.createdAt=new Date().toISOString();
  const ref=S.pfNew?S.db.collection('players').doc():S.db.doc('players/'+S.pid);
  btn.disabled=true;
  try{await ref.set(p);}catch(e){btn.disabled=false;return toast(dbMsg(e));}
  if(S.pfNew){S.pid=ref.id;lsSet(K_PLAYER,ref.id);applyPlayer();}
  S.pf=null;S.pfNew=false;toast('Player saved');go('home');
}
async function delDoc(path,msg,back){
  if(!S.db)return toast(NO_DB);
  try{await S.db.doc(path).delete();}catch(e){return toast(dbMsg(e));}
  if(path.indexOf('sessions/')===0){S.sEdit=null;S.sd=null;lsSet(K_SESS,null);}
  toast(msg);go(back);
}
async function clearExamples(){
  if(!S.db)return;
  const paths=S.games.filter(g=>g.example).map(g=>'games/'+g.id).concat(S.sessions.filter(s=>s.example).map(s=>'sessions/'+s.id));
  for(const p of paths){try{await S.db.doc(p).delete();}catch(e){return toast(dbMsg(e));}}
  toast('Examples deleted');refresh();
}

/* ---------- Actions ---------- */
const A={
  go:t=>{if(t.dataset.v==='player'){A.openPlayer();return;}go(t.dataset.v);},
  game:t=>go('game',t.dataset.id),
  drill:t=>go('drill',t.dataset.id),
  openPlayer:()=>{S.pf=clone(S.profile);S.pfNew=false;go('player');},
  addPlayer:()=>{S.pf=Object.assign(defaultProfile(),{preferred:'all'});S.pfNew=true;go('player');},
  pickPlayer:t=>{S.pid=t.dataset.id;lsSet(K_PLAYER,S.pid);applyPlayer();S.drillPos='all';S.allSess=false;go(['home','games','train','progress','board'].indexOf(S.view)>=0?S.view:'home');},
  pgoal:t=>{const g=S.pf.goals||(S.pf.goals=[]),i=g.indexOf(t.dataset.id);if(i<0)g.push(t.dataset.id);else g.splice(i,1);render();},
  delPlayer:t=>confirmTap(t,async()=>{
    if(!S.db||S.players.length<2)return;const id=S.pid;
    try{
      for(const g of S.allGames.filter(x=>x.playerId===id))await S.db.doc('games/'+g.id).delete();
      for(const x of S.allSessions.filter(y=>y.playerId===id))await S.db.doc('sessions/'+x.id).delete();
      await S.db.doc('players/'+id).delete();
    }catch(e){return toast(dbMsg(e));}
    S.pf=null;applyPlayer();lsSet(K_PLAYER,S.pid);toast('Player removed');go('home');
  }),
  openProgram:t=>go('program',t.dataset.id),
  progBegin:async t=>{
    const P=PROGRAM[t.dataset.id],pd=playerDoc();if(!P||!pd||!S.db)return;
    pd.program={id:P.id,start:todayISO(),done:{}};if((pd.goals||[]).indexOf(P.goal)<0)pd.goals=(pd.goals||[]).concat(P.goal);
    try{await writePlayer(pd);}catch(e){return toast(dbMsg(e));}
    toast('Program started');render();
  },
  progStop:t=>confirmTap(t,async()=>{const pd=playerDoc();if(!pd)return;pd.program=null;try{await writePlayer(pd);}catch(e){return toast(dbMsg(e));}toast('Program stopped');go('train');}),
  progStart:()=>{const nx=progNext();if(!nx)return;const d=newSession();d.items=nx.items.map(([id,dose])=>mkItem(id,dose));d.programKey=nx.key;d.programLabel='Week '+nx.week+', '+nx.name;S.sd=d;S.sEdit=null;S.sResumed=false;go('sessionform');persist();},
  newGame:()=>{const s=lsGet(K_GAME);if(s&&s.d&&!s.edit&&s.pid===S.pid){S.gd=normGame(s.d);S.gResumed=true;}else{S.gd=newGame();S.gResumed=false;}S.gEdit=null;go('gameform');persist();},
  freshGame:()=>{S.gd=newGame();S.gResumed=false;edited();},
  editGame:t=>{const g=S.games.find(x=>x.id===t.dataset.id);if(!g)return;S.gd=normGame(clone(g));delete S.gd.id;S.gEdit=g.id;S.gResumed=false;go('gameform');persist();},
  formBack:()=>{if(S.gEdit)go('game',S.gEdit);else go('home');},
  step:t=>{const d=draft();if(!d)return;const p=t.dataset.p;setPath(d,p,clamp((+getPath(d,p)||0)+(+t.dataset.d),+t.dataset.min||0,+t.dataset.max||99));edited();},
  set:t=>{const d=draft();if(!d)return;let v=t.dataset.v;if(/^\d+$/.test(v))v=+v;setPath(d,t.dataset.p,v);edited();},
  played:t=>{const p=t.dataset.v;S.gd.played[p]=!S.gd.played[p];edited();},
  zone:t=>{S.gd.zones.push({z:t.dataset.z,saveable:false});edited();},
  zoneSave:t=>{const z=S.gd.zones[+t.dataset.i];if(z){z.saveable=!z.saveable;edited();}},
  zoneDel:t=>{S.gd.zones.splice(+t.dataset.i,1);edited();},
  shotNoLoc:()=>{S.gd.pending={x:null,y:null};edited();},
  shot:t=>{const p=S.gd.pending;if(!p)return;S.gd.shots.push({x:p.x,y:p.y,r:t.dataset.v});S.gd.pending=null;edited();},
  shotCancel:()=>{S.gd.pending=null;edited();},
  shotUndo:()=>{S.gd.shots.pop();edited();},
  errAdd:t=>{const e=S.gd.errors,k=t.dataset.id;e[k]=(e[k]||0)+1;edited();},
  errSub:t=>{const e=S.gd.errors,k=t.dataset.id,n=(e[k]||0)-1;if(n>0)e[k]=n;else delete e[k];edited();},
  well:t=>{const w=S.gd.wells,i=w.indexOf(t.dataset.id);if(i<0)w.push(t.dataset.id);else w.splice(i,1);edited();},
  saveGame:t=>saveGame(t),
  delGame:t=>confirmTap(t,()=>delDoc('games/'+t.dataset.id,'Game deleted','games')),
  newSession:t=>{
    const id=t.dataset.id,s=lsGet(K_SESS),had=!!(s&&s.d&&!s.edit&&s.pid===S.pid);let d=had?normSession(s.d):null;
    if(id){if(!d||d.date!==todayISO())d=newSession();if(!d.items.some(i=>i.drillId===id))d.items.push(mkItem(id));}
    else if(!d)d=newSession();
    S.sd=d;S.sEdit=null;S.sResumed=had&&!id;go('sessionform');persist();
  },
  freshSession:()=>{S.sd=newSession();S.sResumed=false;edited();},
  editSession:t=>{const s=S.sessions.find(x=>x.id===t.dataset.id);if(!s)return;S.sd=normSession(clone(s));delete S.sd.id;S.sEdit=s.id;S.sResumed=false;go('sessionform');persist();},
  addItem:()=>{const used=new Set(S.sd.items.map(i=>i.drillId));const pick=focusDrillIds().find(id=>!used.has(id))||(DRILLS.find(d=>fitsAge(d)&&!used.has(d.id))||DRILLS[0]).id;S.sd.items.push(mkItem(pick));edited();},
  delItem:t=>{S.sd.items.splice(+t.dataset.i,1);edited();},
  saveSession:t=>saveSession(t),
  delSession:t=>confirmTap(t,()=>delDoc('sessions/'+t.dataset.id,'Training deleted','train')),
  toggleSess:()=>{S.allSess=!S.allSess;render();},
  drillPos:t=>{S.drillPos=t.dataset.v;render();},
  saveProfile:t=>saveProfile(t),
  clearExamples:t=>confirmTap(t,clearExamples),
  loadExamples:()=>loadExamples(),
  hideInstall:()=>{lsSet(K_NOINSTALL,true);render();},
  exportBackup:()=>exportBackup(),
  snoozeBackup:()=>{lsSet(K_SNOOZE,new Date().toISOString());render();},
  importPick:()=>{const f=$('#importFile');f.value='';f.click();},
  importConfirm:t=>confirmTap(t,()=>{
    try{S.db.replaceAll(S.pendingImport.data);migrate(S.db);}catch(e){return toast(dbMsg(e));}
    S.pendingImport=null;S.pf=null;
    lsSet(K_GAME,null);lsSet(K_SESS,null);lsSet(K_BOARD,null);toast('Backup restored');go('home');
  }),
  importCancel:()=>{S.pendingImport=null;render();},
  playPos:t=>{S.playPos=t.dataset.v;render();},
  bOpen:t=>{S.bStep=0;go('boardview',t.dataset.id);},
  bNew:t=>{S.bd=boardTemplate(t.dataset.v);S.bEdit=null;S.bStep=0;S.bTool='move';S.bSel=null;S.bHist=[];go('boardedit');persist();},
  bResume:()=>{const dr=lsGet(K_BOARD);if(!dr||!dr.d)return;S.bd=dr.d;S.bEdit=dr.edit||null;S.bStep=0;S.bTool='move';S.bSel=null;S.bHist=[];go('boardedit');},
  bCopy:()=>{const p=boardFor(S.arg);if(!p)return;S.bd=libToDraft(p);S.bd.title='My '+p.title.charAt(0).toLowerCase()+p.title.slice(1);S.bEdit=null;S.bStep=0;S.bTool='move';S.bSel=null;S.bHist=[];go('boardedit');persist();},
  bEdit:()=>{const b=boardFor(S.arg);if(!b)return;S.bd=clone(b);delete S.bd.id;S.bEdit=b.id;S.bStep=0;S.bTool='move';S.bSel=null;S.bHist=[];go('boardedit');persist();},
  boardBack:()=>{if(S.bEdit){S.bStep=0;go('boardview',S.bEdit);}else go('board');},
  bTool:t=>{S.bTool=t.dataset.v;render();},
  bAdd:t=>{
    pushHist();const type=t.dataset.v,id='t'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
    const c=VIEW_CENTER[S.bd.view]||VIEW_CENTER.full,n=S.bd.tokens.length%5;
    S.bd.tokens.push({id,type,label:nextLabel(type)});
    S.bd.steps.forEach(st=>{st.pos[id]=[r1(c[0]-6+n*3),r1(c[1]+(n%2?3:-3))];});
    S.bSel={kind:'tok',id};S.bTool='move';edited();
  },
  bDelTok:()=>{if(!S.bSel||S.bSel.kind!=='tok')return;pushHist();const id=S.bSel.id;S.bd.tokens=S.bd.tokens.filter(t=>t.id!==id);S.bd.steps.forEach(st=>{delete st.pos[id];});S.bSel=null;edited();},
  bHi:()=>{const t=S.bSel&&S.bd.tokens.find(x=>x.id===S.bSel.id);if(!t)return;pushHist();t.hi=!t.hi;edited();},
  bDelArr:()=>{if(!S.bSel||S.bSel.kind!=='arr')return;pushHist();curStep().arrows.splice(S.bSel.i,1);S.bSel=null;edited();},
  bStraight:()=>{const ar=S.bSel&&curStep().arrows[S.bSel.i];if(!ar)return;pushHist();ar.c=null;edited();},
  bUndo:()=>{if(!S.bHist.length)return;S.bd=JSON.parse(S.bHist.pop());S.bSel=null;if(S.bStep>=S.bd.steps.length)S.bStep=S.bd.steps.length-1;edited();},
  bClearArrows:()=>{pushHist();curStep().arrows=[];S.bSel=null;edited();},
  bStep:t=>{S.bStep=+t.dataset.i;S.bSel=null;render();},
  bAddStep:()=>{pushHist();const cur=curStep();S.bd.steps.splice(S.bStep+1,0,{caption:'',pos:advancePositions(cur),arrows:[]});S.bStep++;S.bSel=null;S.bTool='move';edited();toast(cur.arrows.length?'Step added. Players moved along your arrows.':'Step added. Drag players to their new spots.');},
  bDelStep:t=>confirmTap(t,()=>{pushHist();S.bd.steps.splice(S.bStep,1);S.bStep=Math.max(0,S.bStep-1);S.bSel=null;edited();}),
  saveBoard:t=>saveBoard(t),
  delBoard:t=>confirmTap(t,async()=>{const id=S.bEdit;if(!S.db||!id)return;try{await S.db.doc('boards/'+id).delete();}catch(e){return toast(dbMsg(e));}lsSet(K_BOARD,null);S.bd=null;S.bEdit=null;toast('Board deleted');go('board');}),
  bPrev:()=>stepTo(S.bStep-1),
  bNext:()=>stepTo(S.bStep+1),
  bPlay:()=>playAll(),
  bStop:()=>{stopPlay();render();}
};
document.addEventListener('click',e=>{
  const pitch=e.target.closest&&e.target.closest('svg[data-pitch]');
  if(pitch&&S.view==='gameform'&&S.gd){
    const r=pitch.getBoundingClientRect();
    const x=Math.round((e.clientX-r.left)/r.width*1000)/10,y=Math.round(((e.clientY-r.top)/r.height*74-4)*10)/10;
    S.gd.pending={x:clamp(x,1,99),y:clamp(y,0.5,69)};edited();return;
  }
  const t=e.target.closest&&e.target.closest('[data-a]');if(!t)return;
  const fn=A[t.dataset.a];if(fn){e.preventDefault();fn(t);}
});
document.addEventListener('input',e=>{
  const t=e.target;if(!t.dataset||!t.dataset.f)return;
  const d=draft();if(!d)return;
  let v=t.value;if(t.type==='number')v=v===''?'':Number(v);
  setPath(d,t.dataset.f,v);
  if(S.view==='boardedit'&&/^tokens\./.test(t.dataset.f)){persist();redrawField();return;}
  if(S.view==='player'&&t.dataset.f==='birthYear'){const el=$('.agechip'),a=ageOf(S.pf);if(el)el.textContent=a!=null?a:'-';return;}
  if(/\.drillId$/.test(t.dataset.f)){const i=+t.dataset.f.split('.')[1];if(DRILL[v]&&d.items[i]){d.items[i].outOf=DRILL[v].score.n||'';d.items[i].score='';}edited();return;}
  persist();
});

document.addEventListener('change',e=>{
  if(e.target.id!=='importFile'||!e.target.files||!e.target.files[0])return;
  const r=new FileReader();
  r.onload=()=>{
    let b=null;try{b=JSON.parse(r.result);}catch(err){}
    if(!b||b.app!=='keeper-striker-log'||!b.data||typeof b.data!=='object')return toast('That file is not a Keeper & Striker backup.');
    S.pendingImport={data:b.data,when:b.exportedAt?new Date(b.exportedAt).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}):'an unknown date'};
    if(S.view!=='player'){S.pf=clone(S.profile);go('player');}else render();
  };
  r.onerror=()=>toast('Could not read that file.');
  r.readAsText(e.target.files[0]);
});

/* ---------- Storage on this phone ----------
   A small document store kept in localStorage. It mirrors the doc/collection
   calls the screens use: collection(c).doc(id).set(), doc('c/id').delete(),
   collection(c).onSnapshot(fn). */
function storageWorks(){try{localStorage.setItem('ksl:probe','1');localStorage.removeItem('ksl:probe');return true;}catch(e){return false;}}
function makeLocalDB(){
  let data=lsGet(K_DATA);if(!data||typeof data!=='object')data={};
  const listeners={};
  const coll=c=>data[c]&&typeof data[c]==='object'?data[c]:(data[c]={});
  const snapshot=c=>{const docs=Object.keys(coll(c)).map(id=>({id,exists:true,data:()=>coll(c)[id]}));return {docs,size:docs.length,empty:!docs.length};};
  const emit=c=>{(listeners[c]||[]).forEach(fn=>fn(snapshot(c)));};
  const emitAll=()=>Object.keys(listeners).forEach(emit);
  const write=()=>{try{localStorage.setItem(K_DATA,JSON.stringify(data));}catch(e){throw {code:'quota_exceeded'};}};
  const newId=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,8);
  let asked=false;
  const ref=(c,id)=>({id,
    set:async obj=>{
      const had=Object.prototype.hasOwnProperty.call(coll(c),id),prev=coll(c)[id];
      coll(c)[id]=clone(obj);
      try{write();}catch(e){if(had)coll(c)[id]=prev;else delete coll(c)[id];throw e;}
      if(!asked&&navigator.storage&&navigator.storage.persist){asked=true;navigator.storage.persist().catch(()=>{});}
      emit(c);
    },
    delete:async()=>{
      const prev=coll(c)[id];delete coll(c)[id];
      try{write();}catch(e){if(prev!==undefined)coll(c)[id]=prev;throw e;}
      emit(c);
    }});
  window.addEventListener('storage',e=>{if(e.key!==K_DATA)return;data=lsGet(K_DATA)||{};emitAll();});
  return {
    doc:path=>{const p=path.split('/');return ref(p[0],p[1]);},
    collection:c=>({doc:id=>ref(c,id||newId()),onSnapshot:fn=>{(listeners[c]||(listeners[c]=[])).push(fn);setTimeout(()=>fn(snapshot(c)),0);return ()=>{listeners[c]=listeners[c].filter(f=>f!==fn);};}}),
    exportAll:()=>clone(data),
    replaceAll:next=>{const prev=data;data={};['games','sessions','meta','boards','players'].forEach(c=>{data[c]=next[c]&&typeof next[c]==='object'?clone(next[c]):{};});try{write();}catch(e){data=prev;throw e;}emitAll();}
  };
}

/* ---------- Backup ---------- */
async function exportBackup(){
  if(!S.db)return toast(NO_DB);
  const name='soccer-log-backup-'+todayISO()+'.json';
  const text=JSON.stringify({app:'keeper-striker-log',version:1,exportedAt:new Date().toISOString(),data:S.db.exportAll()});
  const done=()=>{lsSet(K_BACKUP,new Date().toISOString());toast('Backup ready');render();};
  let file=null;try{file=new File([text],name,{type:'application/json'});}catch(e){}
  if(file&&navigator.canShare&&navigator.canShare({files:[file]})){
    try{await navigator.share({files:[file],title:'Soccer Log backup'});done();return;}
    catch(e){if(e&&e.name==='AbortError')return;}
  }
  const url=URL.createObjectURL(new Blob([text],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),5000);done();
}

/* ---------- Example data ---------- */
async function loadExamples(){
  if(!S.db)return toast(NO_DB);
  const ago=n=>{const d=new Date();d.setDate(d.getDate()-n);return isoOf(d);},now=new Date().toISOString(),pid=S.pid;
  const docs=isYoung()?[
    ['games','example-y1-'+pid,{date:ago(6),opponent:'Example Stars',venue:'home',comp:'League',us:3,them:2,played:{young:true},young:{goals:1,beat:3,won:2},errors:{y_bunch:2,y_farball:1},wells:['yw_shot','yw_dribble','yw_fun'],ratings:{fun:5,effort:4},great:'Scored his first goal of the season.',work:'Keep the ball close when he dribbles.',notes:''}],
    ['sessions','example-ys1-'+pid,{date:ago(3),minutes:20,items:[{drillId:'y_redlight',score:7,outOf:10},{drillId:'y_toetaps',score:24,outOf:null}],feel:5,notes:''}]
  ]:[
    ['games','example-1-'+pid,{date:ago(7),opponent:'Example FC',venue:'home',comp:'League',us:2,them:1,played:{gk:true,st:true},gkMins:30,stMins:25,gk:{saves:5,catches:4,drops:2,high:1,distGood:6,distBad:3},zones:[{z:'BL',saveable:true}],st:{assists:0,chances:1},shots:[{x:44,y:14,r:'goal'},{x:62,y:20,r:'off'},{x:30,y:26,r:'on'}],errors:{gk_handling:2,gk_dist:2,st_offtarget:1,st_offside:1},wells:['w_bigsave','w_goal','w_effort'],ratings:{effort:5,confidence:4,overall:4},great:'Diving save at the near post in the first half.',work:'Hold on to shots that come straight at him.',notes:''}],
    ['games','example-2-'+pid,{date:ago(1),opponent:'Example Rovers',venue:'away',comp:'League',us:1,them:3,played:{gk:true,st:false},gkMins:60,stMins:null,gk:{saves:6,catches:3,drops:2,high:0,distGood:5,distBad:4},zones:[{z:'BR',saveable:false},{z:'BC',saveable:true},{z:'TL',saveable:false}],st:{assists:0,chances:0},shots:[],errors:{gk_handling:1,gk_set:2,gk_dist:1,gk_talk:1},wells:['w_bigsave','w_bounce'],ratings:{effort:4,confidence:3,overall:3},great:'Kept his head up after the second goal.',work:'Get set before the shooter strikes.',notes:''}],
    ['sessions','example-s1-'+pid,{date:ago(5),minutes:30,items:[{drillId:'gk_wcatch',score:14,outOf:20},{drillId:'st_corners',score:8,outOf:20}],feel:4,notes:''}],
    ['sessions','example-s2-'+pid,{date:ago(3),minutes:25,items:[{drillId:'gk_wcatch',score:16,outOf:20},{drillId:'gk_setstep',score:9,outOf:15}],feel:4,notes:''}]
  ];
  try{for(const [c,id,d] of docs)await S.db.collection(c).doc(id).set(Object.assign(d,{playerId:pid,example:true,createdAt:now,updatedAt:now}));}
  catch(e){return toast(dbMsg(e));}
  toast('Example data loaded');
}

/* ---------- Start ---------- */
function connect(){
  S.checked=true;
  if(!storageWorks()){S.db=null;S.canWrite=false;render();return;}
  const db=makeLocalDB();S.db=db;S.canWrite=true;
  migrate(db);
  const rows=x=>x.docs.map(d=>Object.assign(clone(d.data()),{id:d.id}));
  db.collection('players').onSnapshot(x=>{S.players=rows(x).sort((a,b)=>(a.createdAt||'').localeCompare(b.createdAt||'')||(a.name||'').localeCompare(b.name||''));applyPlayer();refresh();});
  db.collection('games').onSnapshot(x=>{S.allGames=rows(x);applyPlayer();S.gotGames=true;refresh();});
  db.collection('sessions').onSnapshot(x=>{S.allSessions=rows(x);applyPlayer();S.gotSessions=true;refresh();});
  db.collection('boards').onSnapshot(x=>{S.boards=rows(x);S.gotBoards=true;refresh();});
}
(function start(){
  const h=location.hash.slice(1);if(['games','train','progress','board'].indexOf(h)>=0)S.view=h;
  connect();render();
  if('serviceWorker' in navigator&&location.protocol!=='file:'){
    window.addEventListener('load',()=>{navigator.serviceWorker.register('sw.js').then(reg=>{
      document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')reg.update().catch(()=>{});});
    }).catch(()=>{});});
    /* The offline helper says a newer version just arrived: reload once to show it, unless he is mid-entry. */
    let upd=null;
    navigator.serviceWorker.addEventListener('message',e=>{
      if(!e.data||e.data.type!=='ksl-updated')return;
      clearTimeout(upd);
      upd=setTimeout(()=>{
        let last=0;try{last=+sessionStorage.getItem('ksl:reloadedAt')||0;}catch(err){}
        if(Date.now()-last<60000)return;
        if(FORM_VIEWS.has(S.view)||S.playing){toast('A new version is ready. It loads next time you open the app.');return;}
        try{sessionStorage.setItem('ksl:reloadedAt',String(Date.now()));}catch(err){}
        location.reload();
      },1500);
    });
  }
})();
})();
