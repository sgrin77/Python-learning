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
  {id:'st_press',pos:'st',area:'Work rate',label:'Did not press defenders'}
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
  {id:'w_bounce',pos:'both',label:'Bounced back after a mistake'}
];
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
   cues:['Up on your toes','Pump your arms to make your feet faster','Clean steps first, then speed'],score:{type:'done'}}
];
const ERR=Object.fromEntries(ERRORS.map(e=>[e.id,e]));
const WELL=Object.fromEntries(WELLS.map(w=>[w.id,w]));
const DRILL=Object.fromEntries(DRILLS.map(d=>[d.id,d]));
const ZONES=['TL','TC','TR','BL','BC','BR'];
const ZONE_LABEL={TL:'Top left',TC:'Top middle',TR:'Top right',BL:'Bottom left',BC:'Bottom middle',BR:'Bottom right',U:'Not sure where'};
const POS_NAME={gk:'Goalkeeper',st:'Striker',both:'Keeper + Striker'};
const POS_SHORT={gk:'GK',st:'ST',both:'GK + ST'};
const RES_NAME={W:'Win',L:'Loss',D:'Draw'};
const RATE_NAME={effort:'Effort',confidence:'Confidence',overall:'Overall'};
const COMPS=['League','Cup','Tournament','Friendly','Scrimmage'];
const SHOT_RES=[{id:'goal',label:'Goal'},{id:'on',label:'Saved'},{id:'off',label:'Missed'},{id:'blocked',label:'Blocked'}];
const K_GAME='ksl:gameDraft', K_SESS='ksl:sessionDraft';
const K_DATA='ksl:data:v1', K_BACKUP='ksl:lastBackup', K_SNOOZE='ksl:backupSnooze', K_NOINSTALL='ksl:hideInstall';
const NO_DB='This browser is blocking storage, so nothing can be saved. Turn off Private Browsing, or open the app from your home screen.';
const FORM_VIEWS=new Set(['gameform','sessionform','player']);
const IS_IOS=/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const IS_INSTALLED=window.navigator.standalone===true||(window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches);

/* ---------- State ---------- */
const S={db:null,checked:false,canWrite:false,
  profile:defaultProfile(),
  games:[],sessions:[],gotGames:false,gotSessions:false,
  view:'home',arg:null,gd:null,gEdit:null,gResumed:false,sd:null,sEdit:null,sResumed:false,pf:null,
  drillPos:'all',allSess:false,pendingImport:null};

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

function defaultProfile(){return {name:'',team:'',preferred:'gk',weeklyGoal:3};}
function newGame(){
  const st=S&&S.profile&&S.profile.preferred==='st';
  return {date:todayISO(),opponent:'',venue:'home',comp:'League',us:0,them:0,played:{gk:!st,st:!!st},gkMins:'',stMins:'',
    gk:{saves:0,catches:0,drops:0,high:0,distGood:0,distBad:0},zones:[],st:{assists:0,chances:0},shots:[],pending:null,
    errors:{},wells:[],ratings:{effort:0,confidence:0,overall:0},great:'',work:'',notes:''};
}
function normGame(g){
  const b=newGame(), o=Object.assign(b,g);
  o.played=Object.assign({gk:false,st:false},g.played||{});
  o.gk=Object.assign(newGame().gk,g.gk||{});
  o.st=Object.assign({assists:0,chances:0},g.st||{});
  o.zones=Array.isArray(g.zones)?g.zones:[];
  o.shots=Array.isArray(g.shots)?g.shots:[];
  o.errors=Object.assign({},g.errors||{});
  o.wells=Array.isArray(g.wells)?g.wells.slice():[];
  o.ratings=Object.assign({effort:0,confidence:0,overall:0},g.ratings||{});
  if(o.gkMins==null)o.gkMins='';
  if(o.stMins==null)o.stMins='';
  return o;
}
function mkItem(id){return {drillId:id,score:'',outOf:DRILL[id].score.n||''};}
function newSession(id){return {date:todayISO(),minutes:'',items:id?[mkItem(id)]:[],feel:0,notes:''};}
function normSession(s){
  const o=Object.assign(newSession(),s);
  o.items=(Array.isArray(s.items)?s.items:[]).filter(i=>DRILL[i.drillId]).map(i=>({drillId:i.drillId,score:i.score==null?'':i.score,outOf:i.outOf==null?(DRILL[i.drillId].score.n||''):i.outOf}));
  if(o.minutes==null)o.minutes='';
  return o;
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
  return it.score+' '+d.score.unit;
}
function scoreVal(d,it){
  if(d.score.type==='done'||it.score==null||it.score==='')return null;
  if(d.score.type==='of'){const n=+it.outOf||d.score.n;return n?Math.round(+it.score/n*100):null;}
  return +it.score;
}
function lastLabel(d){const l=drillLog(d.id);if(!l.length)return 'Not tried yet';const it=l[l.length-1];return 'Last: '+scoreText(d,it)+', '+fmtDate(it.date,{month:'short',day:'numeric'});}
function pickDrills(tag,n){
  return DRILLS.filter(d=>d.fixes.includes(tag)).map(d=>({d,last:(drillLog(d.id).slice(-1)[0]||{}).date||''}))
    .sort((a,b)=>a.last.localeCompare(b.last)).slice(0,n).map(x=>x.d);
}
function tallyErr(list){const t={};list.forEach(g=>{for(const [k,v] of Object.entries(g.errors||{})){if(ERR[k]&&+v>0)t[k]=(t[k]||0)+(+v);}});return t;}
function focusList(){
  const gs=games().slice(0,3),tally={},raw={};
  gs.forEach((g,i)=>{for(const [k,v] of Object.entries(g.errors||{})){if(!ERR[k]||!(+v>0))continue;raw[k]=(raw[k]||0)+(+v);tally[k]=(tally[k]||0)+(+v)*(i===0?1.5:1);}});
  const top=Object.keys(tally).sort((a,b)=>tally[b]-tally[a]).slice(0,3);
  if(top.length)return {fromGames:true,n:gs.length,items:top.map(k=>({pos:ERR[k].pos,area:ERR[k].area,title:ERR[k].label,
    why:'Happened '+raw[k]+' '+plural(raw[k],'time','times')+' in the last '+(gs.length===1?'game':gs.length+' games')+'.',drills:pickDrills(k,2)}))};
  const gk=[{pos:'gk',area:'Handling',title:'Safe hands',why:'Clean catches stop rebounds and second chances.',drills:[DRILL.gk_wcatch,DRILL.gk_scoop]},
            {pos:'gk',area:'Set position',title:'Set before every shot',why:'Being still when the ball is struck makes every save easier.',drills:[DRILL.gk_setstep]}];
  const st=[{pos:'st',area:'Finishing',title:'Hit the corners',why:'Low shots into the corners are the hardest for keepers to reach.',drills:[DRILL.st_corners,DRILL.st_weak]}];
  return {fromGames:false,n:0,items:S.profile.preferred==='st'?st.concat(gk.slice(0,1)):gk.concat(st)};
}
function focusDrillIds(){return [...new Set(focusList().items.flatMap(i=>i.drills.map(d=>d.id)))];}

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
function dlink(d){if(!d)return '';return `<button class="dlink" data-a="drill" data-id="${d.id}"><span>${esc(d.name)}<small>${d.mins} min · ${esc(lastLabel(d))}</small></span><span class="go" aria-hidden="true">›</span></button>`;}
function dots(n,goal){let s='';for(let i=0;i<Math.max(n,goal);i++)s+=`<span class="dot ${i<n?'on':''}"></span>`;return s;}
function gameRow(g){
  const r=result(g);
  return `<button class="row" data-a="game" data-id="${esc(g.id)}"><span class="res res-${r}" title="${RES_NAME[r]}">${r}</span><span class="row-main"><span class="row-title">vs ${esc(g.opponent||'Opponent')}</span><span class="row-sub">${esc(fmtDate(g.date))} ${played(g).map(p=>`<span class="tag ${p}">${POS_SHORT[p]}</span>`).join('')}${g.example?'<span class="tag ex">Example</span>':''}</span></span><span class="row-score">${+g.us||0}-${+g.them||0}</span></button>`;
}
function sessRow(s){
  const names=(s.items||[]).map(it=>DRILL[it.drillId]&&DRILL[it.drillId].name).filter(Boolean);
  return `<button class="row" data-a="editSession" data-id="${esc(s.id)}"><span class="row-main"><span class="row-title">${esc(fmtDate(s.date))}</span><span class="row-sub">${esc(names.join(', ')||'Training')}${s.example?'<span class="tag ex">Example</span>':''}</span></span><span class="row-score sm">${s.minutes?esc(s.minutes)+'<small> min</small>':''}</span></button>`;
}
function emptyGames(){return `<div class="empty"><p><b>No games logged yet.</b></p><p>Right after a game, tap Log a game. It takes about two minutes: score, positions, saves, shots, and the mistakes you noticed.</p></div>`;}
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
  [0,50,100].forEach(v=>{const y=T+ph*(1-v/o.max);s+=`<line class="grid" x1="${L}" x2="${W-R}" y1="${y}" y2="${y}"/><text x="${L-5}" y="${y+3.5}" text-anchor="end">${v}${o.unit}</text>`;});
  items.forEach((it,i)=>{
    const cx=L+bw*i+bw/2,w=Math.min(28,bw*.62);
    if(it.value==null)s+=`<text x="${cx}" y="${T+ph-4}" text-anchor="middle">-</text>`;
    else{const h=Math.max(2,ph*Math.min(it.value,o.max)/o.max);s+=`<rect class="${o.cls}" x="${(cx-w/2).toFixed(1)}" y="${(T+ph-h).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="3"/><text class="val" x="${cx}" y="${(T+ph-h-4).toFixed(1)}" text-anchor="middle">${it.value}</text>`;}
    s+=`<text x="${cx}" y="${H-5}" text-anchor="middle">${esc(it.label)}</text>`;
  });
  return s+'</svg>';
}
function spark(vals,max){
  const W=120,H=32,p=4,mx=max||Math.max(...vals,1),mn=max?0:Math.min(...vals,0);
  const xs=i=>p+(W-2*p)*(vals.length===1?.5:i/(vals.length-1));
  const ys=v=>H-p-(H-2*p)*((v-mn)/((mx-mn)||1));
  const pts=vals.map((v,i)=>xs(i).toFixed(1)+','+ys(v).toFixed(1)),last=vals.length-1;
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" role="img" aria-label="Scores over time, latest ${vals[last]}${max?' percent':''}"><path class="area" d="M${xs(0).toFixed(1)},${H-p} L${pts.join(' L')} L${xs(last).toFixed(1)},${H-p} Z"/><path class="ln" d="M${pts.join(' L')}"/><circle cx="${xs(last).toFixed(1)}" cy="${ys(vals[last]).toFixed(1)}" r="3"/></svg>`;
}

/* ---------- Views ---------- */
function heroHTML(){
  const p=S.profile,pref=p.preferred==='st'?'st':'gk';
  return `<section class="hero"><svg class="hero-lines" viewBox="0 0 120 120" aria-hidden="true"><circle cx="120" cy="60" r="36"/><circle cx="120" cy="60" r="2"/><path d="M120 0V120"/></svg>
  <p class="eyebrow">Player</p>
  <h1 class="hero-name">${p.name?esc(p.name):'Your player'}</h1>
  ${p.team?`<p class="hero-team">${esc(p.team)}</p>`:''}
  ${!p.name&&S.canWrite?`<button class="hero-add" data-a="openPlayer">Add his name</button>`:''}
  <div class="hero-pos"><span class="badge gk">Goalkeeper${pref==='gk'?' · favorite':''}</span><span class="badge st">Striker${pref==='st'?' · favorite':''}</span></div>
  ${S.canWrite?`<button class="hero-edit" data-a="openPlayer">Edit</button>`:''}</section>`;
}
function focusHTML(){
  const f=focusList();
  let h=`<section class="block"><div class="block-head"><h2>Work on this week</h2><span class="sub">${f.fromGames?'From his last '+(f.n===1?'game':f.n+' games'):'Starter plan'}</span></div>`;
  if(!f.fromGames)h+=`<p class="sub">Log a game and this list updates from the mistakes you record.</p>`;
  f.items.forEach(it=>{h+=`<article class="focus"><p class="eyebrow"><span class="tag ${it.pos}">${POS_SHORT[it.pos]}</span>${esc(it.area)}</p><h3>${esc(it.title)}</h3><p class="muted">${esc(it.why)}</p><div class="dlinks">${it.drills.map(dlink).join('')}</div></article>`;});
  return h+'</section>';
}
function renderHome(){
  const p=S.profile,gs=games(),goal=+p.weeklyGoal||3,wc=weekCount(0),streak=weekStreak(),last=gs[0];
  const hasEx=S.games.some(g=>g.example)||S.sessions.some(s=>s.example);
  const real=S.games.filter(g=>!g.example).length+S.sessions.filter(s=>!s.example).length;
  let h=heroHTML()+dbNotice()+installNote();
  if(S.canWrite&&!S.games.length&&!S.sessions.length)h+=`<div class="welcome"><h3>Welcome</h3><p>Add his name and team, then log his next game. The app suggests drills from the mistakes you record.</p><div class="note-btns"><button class="btn primary small" data-a="openPlayer">Set up player</button><button class="btn small" data-a="loadExamples">Show me with example data</button></div></div>`;
  if(hasEx)h+=`<div class="note"><span>Entries marked <span class="tag ex">Example</span> are samples so you can see how everything fits together.</span>${S.canWrite?`<button class="btn small" data-a="clearExamples" data-confirm="Tap again to delete">Delete examples</button>`:''}</div>`;
  if(S.canWrite&&real>=3&&backupDue())h+=`<div class="note"><span>Your logs are saved only on this phone. Save a backup copy to Files or email it to yourself.</span><div class="note-btns"><button class="btn small" data-a="exportBackup">Back up now</button><button class="btn small" data-a="snoozeBackup">Later</button></div></div>`;
  h+=`<div class="strip">
    <div class="cell"><span class="num">${wc}<small>/${goal}</small></span><span class="dots" aria-hidden="true">${dots(wc,goal)}</span><span class="lbl">Training sessions this week</span></div>
    <div class="cell"><span class="num">${streak}</span><span class="lbl">${plural(streak,'Week','Weeks')} in a row hitting the goal</span></div>
    <div class="cell">${last?`<span class="num res-txt-${result(last)}">${result(last)} ${+last.us||0}-${+last.them||0}</span><span class="lbl">Last game, vs ${esc(last.opponent||'opponent')}</span>`:`<span class="num">-</span><span class="lbl">No games logged yet</span>`}</div></div>`;
  if(S.canWrite)h+=`<div class="actions"><button class="btn primary big" data-a="newGame">Log a game<small>Right after the final whistle</small></button><button class="btn big" data-a="newSession">Log training<small>Drills and scores</small></button></div>`;
  h+=focusHTML();
  h+=`<section class="block"><div class="block-head"><h2>Recent games</h2>${gs.length>3?`<button class="link" data-a="go" data-v="games">All ${gs.length} games</button>`:''}</div>${S.db&&!S.gotGames?'<p class="muted">Loading games...</p>':gs.length?`<div class="list">${gs.slice(0,3).map(gameRow).join('')}</div>`:emptyGames()}</section>`;
  return `<div class="view">${h}</div>`;
}
function renderGames(){
  const gs=games();
  let h=`<div class="bar"><h1>Games</h1>${S.canWrite?`<button class="btn primary small" data-a="newGame">Log a game</button>`:''}</div>`+dbNotice();
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
  h+=`<p class="posline">${played(g).map(p=>{const m=p==='gk'?g.gkMins:g.stMins;return `<span><span class="tag ${p}">${POS_NAME[p]}</span>${m?' '+esc(m)+' min':''}</span>`;}).join('')}</p>`;
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
    h+=`<section class="block"><h2>Mistakes to learn from</h2><div class="list">${errs.map(([k,v])=>`<div class="row"><span class="tag ${ERR[k].pos}">${POS_SHORT[ERR[k].pos]}</span><span class="row-main"><span class="row-title wrap">${esc(ERR[k].label)}</span><span class="row-sub">${esc(ERR[k].area)}</span></span><span class="row-score sm">×${+v}</span></div>`).join('')}</div><p class="lbl2">Drills that help</p><div class="list pad">${ds.map(dlink).join('')}</div></section>`;
  }
  const wl=(g.wells||[]).filter(k=>WELL[k]);
  if(wl.length)h+=`<section class="block"><h2>Went well</h2><div class="chips">${wl.map(k=>`<span class="chip on static">${esc(WELL[k].label)}</span>`).join('')}</div></section>`;
  const rt=g.ratings||{},rk=['effort','confidence','overall'].filter(k=>rt[k]);
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
    <div class="steppers">${stepper((S.profile.team||'Our team')+' goals','us',d.us,'',0,40)}${stepper('Their goals','them',d.them,'',0,40)}</div></section>`;
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
  groups.forEach(p=>{h+=`<p class="lbl2"><span class="tag ${p}">${POS_SHORT[p]}</span>${p==='gk'?'In goal':'Up front'}</p><div class="chips">${ERRORS.filter(e=>e.pos===p).map(e=>{const n=d.errors[e.id]||0;
    return `<span class="tally ${n?'on':''}"><button type="button" data-a="errAdd" data-id="${e.id}" aria-label="${esc(e.label)}${n?', '+n+' so far':''}">${esc(e.label)}${n?`<b>×${n}</b>`:''}</button>${n?`<button type="button" class="minus" data-a="errSub" data-id="${e.id}" aria-label="Remove one: ${esc(e.label)}">−</button>`:''}</span>`;}).join('')}</div>`;});
  h+='</section>';
  h+=`<section class="group"><h2>Went well</h2><div class="chips">${WELLS.filter(w=>w.pos==='both'||d.played[w.pos]).map(w=>{const on=d.wells.includes(w.id);return `<button type="button" class="chip ${on?'on':''}" data-a="well" data-id="${w.id}" aria-pressed="${on}">${esc(w.label)}</button>`;}).join('')}</div></section>`;
  h+=`<section class="group"><h2>Ratings</h2>${rating('Effort','ratings.effort',d.ratings.effort,['Low','Huge'])}${rating('Confidence','ratings.confidence',d.ratings.confidence,['Nervous','Fearless'])}${rating('Overall game','ratings.overall',d.ratings.overall,['Tough day','Best yet'])}</section>`;
  h+=`<section class="group"><h2>Feedback</h2>
    <div class="field"><label for="g-great">Best moment</label><textarea id="g-great" data-f="great" placeholder="Example: the diving save at the near post">${esc(d.great)}</textarea></div>
    <div class="field"><label for="g-work">One thing to work on</label><textarea id="g-work" data-f="work" placeholder="Example: get set before the shooter strikes">${esc(d.work)}</textarea></div>
    <div class="field"><label for="g-notes">Other notes</label><textarea id="g-notes" data-f="notes">${esc(d.notes)}</textarea></div></section>`;
  h+=`<div class="savebar"><button class="btn primary wide" data-a="saveGame">${edit?'Save changes':'Save game'}</button></div>`;
  return `<div class="view">${h}</div>`;
}
function drillOptions(sel){
  return [['gk','Keeper drills'],['st','Striker drills'],['both','For both']].map(([p,l])=>`<optgroup label="${l}">${DRILLS.filter(d=>d.pos===p).map(d=>`<option value="${d.id}" ${d.id===sel?'selected':''}>${esc(d.name)}</option>`).join('')}</optgroup>`).join('');
}
function scoreInputs(dr,it,i){
  if(dr.score.type==='of')return `<div class="field sm"><label for="s-s${i}">Score</label><input id="s-s${i}" type="number" inputmode="numeric" min="0" data-f="items.${i}.score" value="${esc(it.score)}"></div><span class="of">of</span><div class="field sm"><label for="s-o${i}">Out of</label><input id="s-o${i}" type="number" inputmode="numeric" min="1" data-f="items.${i}.outOf" value="${esc(it.outOf)}"></div>`;
  if(dr.score.type==='count')return `<div class="field sm"><label for="s-s${i}">Score</label><input id="s-s${i}" type="number" inputmode="numeric" min="0" data-f="items.${i}.score" value="${esc(it.score)}"></div>`;
  return `<p class="sub">No score for this one.</p>`;
}
function renderSessionForm(){
  const d=S.sd;if(!d){S.view='train';return renderTrain();}
  const edit=!!S.sEdit;
  let h=`<div class="bar"><button class="back" data-a="go" data-v="train">‹ Train</button><span class="sub">${edit?'Editing a saved session':'Your draft is kept as you go'}</span></div><h1>${edit?'Edit training':'Log training'}</h1>`;
  if(S.sResumed&&!edit)h+=`<div class="note"><span>Picked up your unsaved training log.</span><button class="btn small" data-a="freshSession">Start over</button></div>`;
  h+=`<section class="group"><div class="two"><div class="field"><label for="s-date">Date</label><input id="s-date" type="date" data-f="date" value="${esc(d.date)}"></div><div class="field"><label for="s-min">Total minutes</label><input id="s-min" type="number" inputmode="numeric" min="0" max="300" data-f="minutes" value="${esc(d.minutes)}"></div></div></section>`;
  h+=`<section class="group"><h2>Drills</h2>`;
  if(!d.items.length)h+=`<p class="muted">Add each drill he did and how he scored.</p>`;
  d.items.forEach((it,i)=>{const dr=DRILL[it.drillId];if(!dr)return;
    h+=`<div class="item"><div class="field"><label for="s-d${i}">Drill ${i+1}</label><select id="s-d${i}" data-f="items.${i}.drillId">${drillOptions(it.drillId)}</select></div>
    <p class="sub">${dr.score.type==='done'?'Just log the minutes for this one.':'Count: '+esc(dr.score.unit)}</p>
    <div class="item-score">${scoreInputs(dr,it,i)}<button type="button" class="mini" data-a="delItem" data-i="${i}">Remove</button></div></div>`;});
  h+=`<button type="button" class="btn wide" data-a="addItem">+ Add a drill</button></section>`;
  h+=`<section class="group"><h2>How did it feel?</h2>${rating('Feel','feel',d.feel,['Tough','Great'])}<div class="field"><label for="s-notes">Notes</label><textarea id="s-notes" data-f="notes" placeholder="What clicked, what was hard">${esc(d.notes)}</textarea></div></section>`;
  h+=`<div class="savebar"><button class="btn primary wide" data-a="saveSession">${edit?'Save changes':'Save training'}</button></div>`;
  if(edit&&S.canWrite)h+=`<button class="btn danger wide" data-a="delSession" data-id="${esc(S.sEdit)}" data-confirm="Tap again to delete">Delete this session</button>`;
  return `<div class="view">${h}</div>`;
}
function renderTrain(){
  const goal=+S.profile.weeklyGoal||3,wc=weekCount(0),fids=new Set(focusDrillIds()),ss=sessions();
  let h=`<div class="bar"><h1>Train</h1>${S.canWrite?`<button class="btn primary small" data-a="newSession">Log training</button>`:''}</div>`+dbNotice();
  h+=`<p class="muted">${wc} of ${goal} sessions this week. ${wc>=goal?'Goal reached, nice work.':(goal-wc)+' to go.'}</p>`;
  h+=`<section class="block"><div class="block-head"><h2>Training log</h2>${ss.length>3?`<button class="link" data-a="toggleSess">${S.allSess?'Show fewer':'Show all '+ss.length}</button>`:''}</div>${S.db&&!S.gotSessions?'<p class="muted">Loading...</p>':ss.length?`<div class="list">${(S.allSess?ss:ss.slice(0,3)).map(sessRow).join('')}</div>`:`<div class="empty"><p><b>No training logged yet.</b></p><p>Pick a drill below, try it together, and tap Log this drill to record his score.</p></div>`}</section>`;
  const list=DRILLS.filter(d=>S.drillPos==='all'||d.pos===S.drillPos||d.pos==='both').map((d,i)=>({d,i,f:fids.has(d.id)})).sort((a,b)=>(b.f-a.f)||(a.i-b.i));
  h+=`<section class="block"><div class="block-head"><h2>Drill library</h2><span class="sub">${DRILLS.length} drills you can do with a parent</span></div>
  <div class="seg" role="group" aria-label="Filter drills">${[['all','All'],['gk','Keeper'],['st','Striker']].map(([v,l])=>`<button type="button" data-a="drillPos" data-v="${v}" class="${S.drillPos===v?'on':''}" aria-pressed="${S.drillPos===v}">${l}</button>`).join('')}</div>
  <div class="drills">${list.map(({d,f})=>`<button class="dcard" data-a="drill" data-id="${d.id}"><span class="dc-top"><span class="tag ${d.pos}">${POS_SHORT[d.pos]}</span>${f?'<span class="tag focus">Focus</span>':''}<span class="sub">${d.mins} min</span></span><span class="dc-name">${esc(d.name)}</span><span class="sub">Helps with ${esc([...new Set(d.fixes.map(x=>ERR[x].area.toLowerCase()))].join(', '))}</span><span class="dc-last">${esc(lastLabel(d))}</span></button>`).join('')}</div></section>`;
  return `<div class="view">${h}</div>`;
}
function renderDrill(){
  const d=DRILL[S.arg];if(!d){S.view='train';return renderTrain();}
  const log=drillLog(d.id);
  let h=`<div class="bar"><button class="back" data-a="go" data-v="train">‹ Train</button></div>`;
  h+=`<header class="dhead"><p class="eyebrow"><span class="tag ${d.pos}">${POS_NAME[d.pos]}</span>${d.mins} minutes</p><h1>${esc(d.name)}</h1><p><b>You need:</b> ${esc(d.need)}</p></header>`;
  h+=`<section class="block"><h2>How to do it</h2><ol class="steps prose">${d.steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol></section>`;
  h+=`<section class="block"><h2>Coaching cues</h2><ul class="cues prose">${d.cues.map(s=>`<li>${esc(s)}</li>`).join('')}</ul></section>`;
  h+=`<section class="block"><h2>Fixes these mistakes</h2><div class="chips">${d.fixes.map(f=>`<span class="chip static">${esc(ERR[f].label)}</span>`).join('')}</div></section>`;
  let sc=`<p class="prose">${d.score.type==='of'?'Count '+esc(d.score.unit)+' out of '+d.score.n+'.':d.score.type==='count'?'Record his '+esc(d.score.unit)+'.':'No score needed. Log the minutes.'}</p>`;
  if(log.length){
    const vals=log.map(it=>scoreVal(d,it)).filter(v=>v!=null&&!isNaN(v));
    sc+=`<div class="hist">${vals.length>=2?spark(vals,d.score.type==='of'?100:null):''}<div class="hist-stats"><span><b>${log.length}</b> ${plural(log.length,'time','times')}</span>${vals.length?`<span>Best <b>${Math.max(...vals)}${d.score.type==='of'?'%':''}</b></span>`:''}</div></div>`;
    sc+=`<div class="list">${log.slice(-6).reverse().map(it=>`<div class="row"><span class="row-main"><span class="row-title">${esc(fmtDate(it.date))}</span></span><span class="row-score sm">${esc(scoreText(d,it))}</span></div>`).join('')}</div>`;
  }else sc+=`<p class="muted">No scores yet. His first try sets the bar to beat.</p>`;
  h+=`<section class="block"><h2>Score it</h2>${sc}</section>`;
  if(S.canWrite)h+=`<div class="savebar"><button class="btn primary wide" data-a="newSession" data-id="${d.id}">Log this drill</button></div>`;
  return `<div class="view">${h}</div>`;
}
function renderProgress(){
  const gs=games(),ss=sessions();
  let h='<h1>Progress</h1>'+dbNotice();
  if(!gs.length&&!ss.length)return `<div class="view">${h}<div class="empty"><p><b>Nothing to chart yet.</b></p><p>Save rate, shots on target, where goals go in, and drill scores show up here after the first game or training log.</p></div></div>`;
  const w=gs.filter(g=>result(g)==='W').length,dr=gs.filter(g=>result(g)==='D').length,mins=ss.reduce((a,s)=>a+(+s.minutes||0),0);
  h+=`<div class="tiles">${tile('Games logged',gs.length)}${tile('Won, drawn, lost',w+'-'+dr+'-'+(gs.length-w-dr))}${tile('Training sessions',ss.length)}${tile('Minutes trained',mins)}</div>`;
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
    const all=st.flatMap(g=>g.shots||[]),goals=all.filter(s=>s.r==='goal').length,on=all.filter(s=>s.r==='goal'||s.r==='on').length;
    h+=`<section class="block"><div class="block-head"><h2><span class="tag st">ST</span>Striker</h2><span class="sub">${st.length} ${plural(st.length,'game','games')} up front</span></div>
    <div class="card"><p class="lbl2">Shots on target by game</p>${bars(st.slice(0,10).reverse().map(g=>({label:shortDate(g.date),value:shotStats(g).pct})),{max:100,cls:'b-st',unit:'%',label:'Shots on target by game'})}</div>
    <div class="tiles">${tile('Goals',goals,'st')}${tile('Shots',all.length,'st')}${tile('On target',all.length?Math.round(on/all.length*100)+'%':'-','st')}${tile('Assists',st.reduce((a,g)=>a+(+(g.st||{}).assists||0),0),'st')}</div>
    ${all.some(s=>s.x!=null)?`<div class="card"><p class="lbl2">Every shot</p>${pitchSVG(all)}${legend()}</div>`:''}</section>`;
  }
  if(gs.length){
    const a=gs.slice(0,3),b=gs.slice(3,6),ta=tallyErr(a),tb=tallyErr(b);
    const keys=[...new Set([...Object.keys(ta),...Object.keys(tb)])].sort((x,y)=>((ta[y]||0)-(ta[x]||0))||((tb[y]||0)-(tb[x]||0))).slice(0,8);
    h+=`<section class="block"><div class="block-head"><h2>Mistakes</h2><span class="sub">${b.length?'Last 3 games compared with the ones before':'Last '+(a.length===1?'game':a.length+' games')}</span></div>`;
    if(!keys.length)h+='<p class="muted">No mistakes logged yet.</p>';
    else h+=`<div class="list">${keys.map(k=>{const na=ta[k]||0,nb=tb[k]||0;let tr='';
      if(b.length){const ra=na/a.length,rb=nb/b.length;tr=ra<rb?'<span class="trend down">Fewer</span>':ra>rb?'<span class="trend up">More</span>':'<span class="trend same">Same</span>';}
      return `<div class="row"><span class="tag ${ERR[k].pos}">${POS_SHORT[ERR[k].pos]}</span><span class="row-main"><span class="row-title wrap">${esc(ERR[k].label)}</span><span class="row-sub">Last ${a.length===1?'game':a.length}: ${na}${b.length?' · before: '+nb:''}</span></span>${tr}</div>`;}).join('')}</div>`;
    h+='</section>';
  }
  const rows=DRILLS.map(d=>({d,log:drillLog(d.id)})).filter(x=>x.log.length&&x.d.score.type!=='done');
  if(rows.length){
    h+=`<section class="block"><h2>Drill scores</h2><div class="list">${rows.map(({d,log})=>{
      const vals=log.map(it=>scoreVal(d,it)).filter(v=>v!=null&&!isNaN(v));let tr='';
      if(vals.length>1){const diff=vals[vals.length-1]-vals[0],u=d.score.type==='of'?' points':'';tr=diff>0?' · up '+diff+u+' since the first try':diff<0?' · down '+(-diff)+u+' since the first try':' · same as the first try';}
      return `<button class="row" data-a="drill" data-id="${d.id}"><span class="row-main"><span class="row-title wrap">${esc(d.name)}</span><span class="row-sub">Latest ${esc(scoreText(d,log[log.length-1]))}${tr}</span></span>${vals.length>1?spark(vals,d.score.type==='of'?100:null):''}</button>`;}).join('')}</div></section>`;
  }
  return `<div class="view">${h}</div>`;
}
function renderPlayer(){
  const p=S.pf||(S.pf=clone(S.profile));
  let h=`<div class="bar"><button class="back" data-a="go" data-v="home">‹ Home</button></div><h1>Player</h1>`;
  h+=`<section class="group"><div class="field"><label for="p-name">His name</label><input id="p-name" type="text" data-f="name" value="${esc(p.name)}" autocomplete="off"></div>
  <div class="field"><label for="p-team">Team</label><input id="p-team" type="text" data-f="team" value="${esc(p.team)}" autocomplete="off"></div>
  <div class="field"><span class="lbl2">Favorite position</span><div class="seg" role="group" aria-label="Favorite position">${['gk','st'].map(v=>`<button type="button" data-a="set" data-p="preferred" data-v="${v}" class="${p.preferred===v?'on':''}" aria-pressed="${p.preferred===v}">${POS_NAME[v]}</button>`).join('')}</div></div>
  <div class="steppers">${stepper('Training sessions per week','weeklyGoal',p.weeklyGoal||3,'Weekly goal',1,7)}</div></section>`;
  h+=`<div class="savebar"><button class="btn primary wide" data-a="saveProfile">Save player</button></div>`;
  const lb=lsGet(K_BACKUP);
  h+=`<section class="group"><h2>Backup</h2><p>Games and training are saved on this phone only, not online. A backup is one small file you can keep in Files, email to yourself, or use to move everything to a new phone.</p>
  <p class="sub">${lb?'Last backup: '+esc(new Date(lb).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})):'No backup yet.'}</p>
  <div class="backup-row"><button class="btn" data-a="exportBackup">Back up now</button><button class="btn" data-a="importPick">Restore a backup</button></div>`;
  if(S.pendingImport){const pi=S.pendingImport,gn=Object.keys(pi.data.games||{}).length,sn=Object.keys(pi.data.sessions||{}).length;
    h+=`<div class="note warn"><span>Replace everything on this phone with the backup from <b>${esc(pi.when)}</b>? It has ${gn} ${plural(gn,'game','games')} and ${sn} training ${plural(sn,'session','sessions')}.</span><div class="note-btns"><button class="btn small" data-a="importConfirm" data-confirm="Tap again to replace">Replace</button><button class="btn small" data-a="importCancel">Cancel</button></div></div>`;}
  h+=`</section>`;
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

/* ---------- Render loop ---------- */
const VIEWS={home:renderHome,games:renderGames,game:renderGame,gameform:renderGameForm,train:renderTrain,drill:renderDrill,sessionform:renderSessionForm,progress:renderProgress,player:renderPlayer};
const TAB_OF={home:'home',player:'home',games:'games',game:'games',gameform:'games',train:'train',drill:'train',sessionform:'train',progress:'progress'};
function keyOf(el){if(!el||!el.dataset||!el.dataset.a)return null;const d=el.dataset;return [d.a,d.p,d.d,d.id,d.z,d.i,d.v].join('|');}
function render(){
  const k=view.contains(document.activeElement)?keyOf(document.activeElement):null;
  view.innerHTML=(VIEWS[S.view]||renderHome)();
  document.querySelectorAll('.tab').forEach(t=>{const on=t.dataset.v===TAB_OF[S.view];t.classList.toggle('on',on);if(on)t.setAttribute('aria-current','page');else t.removeAttribute('aria-current');});
  if(k){for(const el of view.querySelectorAll('[data-a]')){if(keyOf(el)===k){el.focus({preventScroll:true});break;}}}
}
function go(v,arg){S.view=v;S.arg=arg==null?null:arg;render();window.scrollTo(0,0);}
function refresh(){if(!FORM_VIEWS.has(S.view))render();}
function draft(){return S.view==='gameform'?S.gd:S.view==='sessionform'?S.sd:S.view==='player'?S.pf:null;}
function persist(){if(S.view==='gameform'&&S.gd)lsSet(K_GAME,{edit:S.gEdit,d:S.gd});else if(S.view==='sessionform'&&S.sd)lsSet(K_SESS,{edit:S.sEdit,d:S.sd});}
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
  if(!g.played.gk&&!g.played.st)return toast('Pick at least one position he played.');
  if(!g.played.gk){g.zones=[];g.gk=newGame().gk;g.gkMins='';}
  if(!g.played.st){g.shots=[];g.st={assists:0,chances:0};g.stMins='';}
  for(const k of Object.keys(g.errors)){if(!ERR[k]||!(+g.errors[k]>0)||!g.played[ERR[k].pos])delete g.errors[k];}
  g.wells=g.wells.filter(k=>WELL[k]&&(WELL[k].pos==='both'||g.played[WELL[k].pos]));
  g.opponent=String(g.opponent||'').trim().slice(0,60);
  g.gkMins=g.gkMins===''?null:+g.gkMins;g.stMins=g.stMins===''?null:+g.stMins;
  const now=new Date().toISOString();g.updatedAt=now;if(!g.createdAt)g.createdAt=now;
  const ref=S.gEdit?S.db.doc('games/'+S.gEdit):S.db.collection('games').doc();
  btn.disabled=true;btn.textContent='Saving...';
  try{await ref.set(g);}catch(e){btn.disabled=false;btn.textContent='Save game';return toast(dbMsg(e));}
  lsSet(K_GAME,null);S.gd=null;S.gEdit=null;S.gResumed=false;toast('Game saved');go('game',ref.id);
}
async function saveSession(btn){
  if(!S.db)return toast(NO_DB);
  const s=clone(S.sd);delete s.id;
  if(!s.date)return toast('Add the date.');
  s.items=s.items.filter(i=>DRILL[i.drillId]).map(i=>{const t=DRILL[i.drillId].score.type;return {drillId:i.drillId,score:(t==='done'||i.score===''||i.score==null)?null:Number(i.score),outOf:t==='of'?(Number(i.outOf)||DRILL[i.drillId].score.n):null};});
  if(!s.items.length&&!s.minutes)return toast('Add a drill or the minutes trained.');
  s.minutes=s.minutes===''||s.minutes==null?null:Number(s.minutes);
  const now=new Date().toISOString();s.updatedAt=now;if(!s.createdAt)s.createdAt=now;
  const ref=S.sEdit?S.db.doc('sessions/'+S.sEdit):S.db.collection('sessions').doc();
  btn.disabled=true;btn.textContent='Saving...';
  try{await ref.set(s);}catch(e){btn.disabled=false;btn.textContent='Save training';return toast(dbMsg(e));}
  lsSet(K_SESS,null);S.sd=null;S.sEdit=null;S.sResumed=false;toast('Training saved');go('train');
}
async function saveProfile(btn){
  if(!S.db)return toast(NO_DB);
  const p={name:String(S.pf.name||'').trim().slice(0,40),team:String(S.pf.team||'').trim().slice(0,60),preferred:S.pf.preferred==='st'?'st':'gk',weeklyGoal:clamp(+S.pf.weeklyGoal||3,1,7)};
  btn.disabled=true;
  try{await S.db.doc('meta/profile').set(p);}catch(e){btn.disabled=false;return toast(dbMsg(e));}
  S.profile=p;S.pf=null;toast('Player saved');go('home');
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
  openPlayer:()=>{S.pf=clone(S.profile);go('player');},
  newGame:()=>{const s=lsGet(K_GAME);if(s&&s.d&&!s.edit){S.gd=normGame(s.d);S.gResumed=true;}else{S.gd=newGame();S.gResumed=false;}S.gEdit=null;go('gameform');persist();},
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
    const id=t.dataset.id,s=lsGet(K_SESS),had=!!(s&&s.d&&!s.edit);let d=had?normSession(s.d):null;
    if(id){if(!d||d.date!==todayISO())d=newSession();if(!d.items.some(i=>i.drillId===id))d.items.push(mkItem(id));}
    else if(!d)d=newSession();
    S.sd=d;S.sEdit=null;S.sResumed=had&&!id;go('sessionform');persist();
  },
  freshSession:()=>{S.sd=newSession();S.sResumed=false;edited();},
  editSession:t=>{const s=S.sessions.find(x=>x.id===t.dataset.id);if(!s)return;S.sd=normSession(clone(s));delete S.sd.id;S.sEdit=s.id;S.sResumed=false;go('sessionform');persist();},
  addItem:()=>{const used=new Set(S.sd.items.map(i=>i.drillId));const pick=focusDrillIds().find(id=>!used.has(id))||(DRILLS.find(d=>!used.has(d.id))||DRILLS[0]).id;S.sd.items.push(mkItem(pick));edited();},
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
    try{S.db.replaceAll(S.pendingImport.data);}catch(e){return toast(dbMsg(e));}
    S.pendingImport=null;S.pf=null;
    lsSet(K_GAME,null);lsSet(K_SESS,null);toast('Backup restored');go('home');
  }),
  importCancel:()=>{S.pendingImport=null;render();}
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
    replaceAll:next=>{const prev=data;data={games:clone(next.games||{}),sessions:clone(next.sessions||{}),meta:clone(next.meta||{})};try{write();}catch(e){data=prev;throw e;}emitAll();}
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
  const ago=n=>{const d=new Date();d.setDate(d.getDate()-n);return isoOf(d);},now=new Date().toISOString();
  const docs=[
    ['games','example-1',{date:ago(7),opponent:'Example FC',venue:'home',comp:'League',us:2,them:1,played:{gk:true,st:true},gkMins:30,stMins:25,gk:{saves:5,catches:4,drops:2,high:1,distGood:6,distBad:3},zones:[{z:'BL',saveable:true}],st:{assists:0,chances:1},shots:[{x:44,y:14,r:'goal'},{x:62,y:20,r:'off'},{x:30,y:26,r:'on'}],errors:{gk_handling:2,gk_dist:2,st_offtarget:1,st_offside:1},wells:['w_bigsave','w_goal','w_effort'],ratings:{effort:5,confidence:4,overall:4},great:'Diving save at the near post in the first half.',work:'Hold on to shots that come straight at him.',notes:''}],
    ['games','example-2',{date:ago(1),opponent:'Example Rovers',venue:'away',comp:'League',us:1,them:3,played:{gk:true,st:false},gkMins:60,stMins:null,gk:{saves:6,catches:3,drops:2,high:0,distGood:5,distBad:4},zones:[{z:'BR',saveable:false},{z:'BC',saveable:true},{z:'TL',saveable:false}],st:{assists:0,chances:0},shots:[],errors:{gk_handling:1,gk_set:2,gk_dist:1,gk_talk:1},wells:['w_bigsave','w_bounce'],ratings:{effort:4,confidence:3,overall:3},great:'Kept his head up after the second goal.',work:'Get set before the shooter strikes.',notes:''}],
    ['sessions','example-s1',{date:ago(5),minutes:30,items:[{drillId:'gk_wcatch',score:14,outOf:20},{drillId:'st_corners',score:8,outOf:20}],feel:4,notes:''}],
    ['sessions','example-s2',{date:ago(3),minutes:25,items:[{drillId:'gk_wcatch',score:16,outOf:20},{drillId:'gk_setstep',score:9,outOf:15}],feel:4,notes:''}]
  ];
  try{for(const [c,id,d] of docs)await S.db.collection(c).doc(id).set(Object.assign(d,{example:true,createdAt:now,updatedAt:now}));}
  catch(e){return toast(dbMsg(e));}
  toast('Example data loaded');
}

/* ---------- Start ---------- */
function connect(){
  S.checked=true;
  if(!storageWorks()){S.db=null;S.canWrite=false;render();return;}
  const db=makeLocalDB();S.db=db;S.canWrite=true;
  db.collection('games').onSnapshot(s=>{S.games=s.docs.map(x=>Object.assign(clone(x.data()),{id:x.id}));S.gotGames=true;refresh();});
  db.collection('sessions').onSnapshot(s=>{S.sessions=s.docs.map(x=>Object.assign(clone(x.data()),{id:x.id}));S.gotSessions=true;refresh();});
  db.collection('meta').onSnapshot(s=>{const p=s.docs.find(x=>x.id==='profile');S.profile=Object.assign(defaultProfile(),p?clone(p.data()):{});refresh();});
}
(function start(){
  const h=location.hash.slice(1);if(['games','train','progress'].indexOf(h)>=0)S.view=h;
  connect();render();
  if('serviceWorker' in navigator&&location.protocol!=='file:')window.addEventListener('load',()=>{navigator.serviceWorker.register('sw.js').catch(()=>{});});
})();
})();
