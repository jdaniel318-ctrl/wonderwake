/* A small connected adventure. The rule engine, not the animation, decides success. */
(function(root){'use strict';
const Q=root.WWQuest,A=root.WWArt,W=Q.W,H=Q.H;
const clone=s=>JSON.parse(JSON.stringify(s));
const LABELS=['Bridge Bay','Firefly Trail','Lantern Hollow'];
const INSTRUCTIONS=['Fit the planks to the three gaps. Drag, or choose a plank and tap a gap.','Draw or tap a trail from your explorer through all three sparks. Stay out of the water.','Move the lantern to find hidden shapes. Then enter the pictured code.'];
const GLYPHS=['★','☾','❧','◆'];
function symbolIcon(i){const shapes=['<path d="M0 -25 6 -8 24 -8 10 3 15 22 0 11 -15 22 -10 3 -24 -8 -6 -8Z"/>','<path d="M10 -22A24 24 0 1 0 10 22A21 21 0 0 1 10 -22Z"/>','<ellipse rx="14" ry="25" transform="rotate(-26)"/>','<path d="M0 -25 20 0 0 25 -20 0Z"/>'];return '<svg viewBox="-30 -30 60 60" aria-hidden="true" fill="currentColor">'+shapes[i]+'</svg>';}
const COLORS=['#f0c96d','#c5b4ef','#9acc9e','#83ced3'];
function mount(host,opts){
 let state=Q.validate(opts.state||Q.fresh()),c=Q.chapter(state.chapter),viewStep=state.step;
 let history=[],selected=-1,hint=false,stopped=false,frame=0,animation=null,success=false,saveToken=0,saveOK=true,saveBusy=false,hasSaved=false;
 let stretch=1,dirty=true,lastDraw=0;
 let pointer=null,ignoreClickUntil=0,keyboard=[...c.start],light=[.1,.5],lastTime=performance.now(),time=0;
 const guard=WWCreative.pointerGuard();
 const sprites={};for(const name of ['hero','fox','tree','pine'])sprites[name]=(ctx,x,y,...args)=>{ctx.save();ctx.translate(x,y);ctx.scale(1,1/stretch);A[name](ctx,0,0,...args);ctx.restore();};
 host.innerHTML='<section class="quest-shell"><div class="quest-hud"><div><span class="quest-kicker"></span><h3 id="quest-heading"></h3></div><span class="quest-chapter"></span></div><div class="quest-scene"><div class="quest-surface"><canvas id="quest-canvas" tabindex="0" aria-label="Lantern Trail puzzle board"></canvas><div class="quest-win" hidden></div></div></div><div class="quest-controls"><p class="quest-instruction"></p><div class="quest-puzzle-tools"></div><div class="quest-actions"></div><p class="quest-feedback" role="status" aria-live="polite"></p><div class="quest-meta"><span class="quest-save" role="status"></span><button class="quest-finger" hidden>Use finger</button></div></div></section>';
 const el=s=>host.querySelector(s),can=el('canvas'),g=can.getContext('2d'),surface=el('.quest-surface');
 can.width=W*2;can.height=H*2;g.scale(2,2);
 const fog=document.createElement('canvas');fog.width=W;fog.height=H;const fg=fog.getContext('2d');
 function motion(){return typeof opts.motion==='function'?opts.motion():opts.motion!==false;}
 function message(text){el('.quest-feedback').textContent=text;}
 function saveLabel(){el('.quest-save').textContent=saveBusy?'Saving your trail…':saveOK?(hasSaved?'Trail saved on this device.':'Your moves save on this device.'):'Not saved — use Keep a progress copy on the islands.';el('.quest-save').classList.toggle('save-problem',!saveOK&&!saveBusy);}
 function persist(){const snapshot=clone(state),token=++saveToken;saveBusy=true;saveLabel();Promise.resolve().then(()=>opts.onChange(snapshot)).then(ok=>{if(stopped||token!==saveToken)return;saveBusy=false;saveOK=ok!==false;hasSaved=saveOK;saveLabel();}).catch(()=>{if(stopped||token!==saveToken)return;saveBusy=false;saveOK=false;saveLabel();});}
 function remember(before){history.push(before);if(history.length>30)history.shift();}
 function commit(before){if(JSON.stringify(before)===JSON.stringify(state))return;remember(before);persist();renderTools();}
 function button(attrs,text){return '<button type="button" '+attrs+'>'+text+'</button>';}
 function renderTools(){
  dirty=true;
  const tools=el('.quest-puzzle-tools'),actions=el('.quest-actions');
  el('.quest-kicker').textContent=viewStep<3?'THE LANTERN TRAIL · '+c.place:'A LITTLE LIGHT, A BIG ADVENTURE';
  el('#quest-heading').textContent=viewStep<3?LABELS[viewStep]:'Lantern lit';
  el('.quest-chapter').textContent=viewStep<3?'Puzzle '+(viewStep+1)+' / 3':state.completed.length+' / 3 islands';
  el('.quest-instruction').textContent=viewStep<3?INSTRUCTIONS[viewStep]:c.name+' is complete. Another island is waiting.';
  el('.quest-win').hidden=viewStep!==3;
  if(viewStep===3){
   el('.quest-win').innerHTML='<span class="quest-kicker">'+state.completed.length+' OF 3 ISLANDS SHINING</span><h3>A light for '+c.place+'</h3><p>You built, found a way, and brought the lantern home.</p>';
   tools.innerHTML='<div class="quest-lanterns" aria-label="'+state.completed.length+' lanterns lit">'+[0,1,2].map(i=>'<span class="'+(state.completed.includes(i)?'lit':'')+'">✦</span>').join('')+'</div>';
   actions.innerHTML=button('data-q="next-island" class="quest-primary"','Next island')+button('data-q="paint"','Paint a memory')+button('data-q="home"','The islands');
   message(state.completed.length===3?'All three lanterns are home. You can explore the trails again.':'Your next island has a different path to discover.');
   return;
  }
  if(viewStep===0){
   tools.innerHTML='<div class="quest-planks" role="group" aria-label="Bridge planks">'+c.pieces.map((n,i)=>button('data-piece="'+i+'" class="quest-plank '+(selected===i?'selected':'')+'" aria-label="Plank '+(i+1)+': '+n+' spaces" aria-pressed="'+(selected===i)+'" '+(state.bridge.includes(i)?'disabled':''),'<span class="plank-preview" aria-hidden="true">'+'▰'.repeat(n)+'</span><span>'+n+' '+(n===1?'space':'spaces')+'</span>')).join('')+'</div><div class="quest-gaps" role="group" aria-label="Place your chosen plank">'+c.gaps.map((n,i)=>button('data-gap="'+i+'" data-filled="'+(state.bridge[i]>=0)+'" aria-label="Gap '+(i+1)+', '+n+' spaces'+(state.bridge[i]>=0?', filled':'')+'"',state.bridge[i]>=0?'✓ Gap '+(i+1):'Gap '+(i+1))).join('')+'</div>';
  }else if(viewStep===1){
   tools.innerHTML='<div class="quest-trail-tools"><span><b>✦ '+c.sparks.filter(p=>state.trail.some((v,i)=>i&&Q.segmentDistance(p,state.trail[i-1],v)<=38)).length+' / 3</b> sparks on your trail</span><span class="quest-key-tip">Arrows move · Space adds a point</span></div>';
  }else{
   tools.innerHTML='<div class="quest-code"><span>Find this code</span><span class="quest-code-target" aria-label="Code: '+c.code.map(i=>Q.SYMBOLS[i]).join(', ')+'">'+c.code.map(i=>'<i style="color:'+COLORS[i]+'">'+symbolIcon(i)+'</i>').join('')+'</span><span class="quest-code-answer" aria-label="Your code: '+(state.code.map(i=>Q.SYMBOLS[i]).join(', ')||'empty')+'">'+[0,1,2].map(i=>'<i>'+(state.code[i]===undefined?'·':symbolIcon(state.code[i]))+'</i>').join('')+'</span></div><div class="quest-symbols">'+Q.SYMBOLS.map((name,i)=>button('data-symbol="'+i+'" aria-label="'+name+'" '+(!state.found.includes(i)||state.code.length>=3?'disabled':''),'<b style="color:'+COLORS[i]+'">'+(state.found.includes(i)?symbolIcon(i):'?')+'</b><span>'+ (state.found.includes(i)?name:'Hidden')+'</span>')).join('')+'</div>';
  }
  if(success){actions.innerHTML=button('data-q="continue" class="quest-primary" '+(animation?'disabled':''),viewStep===0?'Follow the fireflies →':'To the lantern →');}
  else actions.innerHTML=button('data-q="undo" '+(!history.length?'disabled':''),'↶ Undo')+button('data-q="reset"','Reset')+button('data-q="hint" aria-pressed="'+hint+'"',hint?'Hide clue':'Clue')+button('data-q="check" class="quest-primary"',viewStep===0?'Cross bridge':viewStep===1?'Follow trail':'Light lantern');
  tools.inert=success;
  el('.quest-finger').hidden=!guard.penSeen();saveLabel();
 }
 function pointFrom(e){const r=can.getBoundingClientRect();const p=[(e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height];return p.every(v=>v>=0&&v<=1)?p:null;}
 function gapAt(p){if(!p||Math.abs(p[1]*H-335)>82)return -1;const x=p[0]*W;let best=-1;[310,510,710].forEach((v,i)=>{if(Math.abs(x-v)<86)best=i;});return best;}
 function place(gap,piece){const before=clone(state),r=Q.fitBridge(state,gap,piece);if(!r.ok){message('That plank does not fit this gap. Count the spaces and try another.');return;}state=r.state;selected=-1;commit(before);message('A good fit! '+state.bridge.filter(n=>n>=0).length+' of 3 gaps bridged.');}
 function append(p){if(!p)return;const a=state.trail;if(a.length>=Q.MAX_POINTS){message('This trail has lots of turns. Follow it, Undo, or Reset to try a shorter route.');return;}if(!a.length&&Q.distance(p,c.start)<48)p=[...c.start];if(!a.length||Q.distance(a[a.length-1],p)>3)a.push(p.map(v=>Math.round(v*10000)/10000));keyboard=[...p];}
 function illuminate(p){if(!p)return;light=p;const before=state.found.length;state=Q.reveal(state,p);if(state.found.length>before){const name=Q.SYMBOLS[state.found[state.found.length-1]];message('You found the '+name+'! Match the shapes in the code.');renderTools();}}
 function down(e){
  dirty=true;
  if(!pointer)ignoreClickUntil=0;
  if(success||viewStep===3||pointer||e.button>0)return;
  const piece=e.target.closest('[data-piece]'),onCanvas=e.target===can;
  if(!onCanvas&&!piece||piece?.disabled)return;
  if(!guard.begin(e))return;e.preventDefault();
  const p=pointFrom(e);pointer={id:e.pointerId,before:clone(state),selectionBefore:selected,piece:piece?Number(piece.dataset.piece):null,x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,moved:false,target:e.target};
  e.target.setPointerCapture?.(e.pointerId);
  if(piece){selected=pointer.piece;message('Drag to a gap, or tap a gap after choosing.');}
  else if(viewStep===1){append(p);}
  else if(viewStep===2){illuminate(p);}
  can.focus({preventScroll:true});
 }
 function move(e){if(!pointer||!guard.move(e))return;dirty=true;e.preventDefault();if(Math.hypot(e.clientX-pointer.startX,e.clientY-pointer.startY)>7)pointer.moved=true;pointer.x=e.clientX;pointer.y=e.clientY;const p=pointFrom(e);pointer.at=p;
  if(pointer.piece!==null)return;
  if(viewStep===1){const batch=e.getCoalescedEvents?.();for(const event of batch?.length?batch:[e])append(pointFrom(event));}
  else if(viewStep===2)illuminate(p);
 }
 function end(e,cancel=false){if(!pointer||!guard.end(e))return;e.preventDefault();const gesture=pointer;pointer=null;ignoreClickUntil=performance.now()+180;
  if(cancel){state=gesture.before;selected=gesture.selectionBefore;renderTools();message('Move canceled. Your previous progress is kept.');return;}
  const p=pointFrom(e);
  if(gesture.piece!==null){if(gesture.moved){const gap=gapAt(p);if(gap>=0)place(gap,gesture.piece);else{renderTools();message('Drop over a bridge gap, or tap a gap to place this plank.');}}else renderTools();}
  else if(viewStep===0){const gap=gapAt(p);if(gap>=0&&selected>=0)place(gap,selected);else message('Choose a plank below, then tap one of the three gaps.');}
  else{if(viewStep===1)append(p);else illuminate(p);commit(gesture.before);renderTools();}
 }
 function cancelGesture(){if(!pointer)return;state=pointer.before;selected=pointer.selectionBefore;pointer=null;guard.cancel();renderTools();}
 function resetStage(){const before=clone(state);if(viewStep===0){state.bridge=[-1,-1,-1];selected=-1;}else if(viewStep===1){state.trail=[];keyboard=[...c.start];}else{state.found=[];state.code=[];}commit(before);message('A fresh try. There is no hurry.');}
 function check(){
  cancelGesture();const result=Q.advance(state);
  if(!result.ok){const words={bridge:'Fill all three gaps with planks that fit.',start:'Begin your trail at your explorer on the START circle.',water:'Your trail crosses water. Undo a turn or Reset, then go around the blue pools.',sparks:'Bring your trail close to all three golden sparks.',end:'Finish at the lantern marked FINISH.',code:'Find the shapes with your lantern, then enter them in the pictured order.'};message(words[result.reason]||'Try one more idea.');return;}
  state=result.state;success=true;history=[];persist();
  message(viewStep===0?'You made a way across!':viewStep===1?'Every spark is following your trail!':'The lantern is waking up!');
  opts.onSpeak?.(el('.quest-feedback').textContent);
  if(motion())animation={step:viewStep,start:performance.now(),duration:viewStep===1?2300:1500,progress:0};
  renderTools();if(!animation&&viewStep===2)showWin();
 }
 function showWin(){viewStep=3;animation=null;success=false;renderTools();}
 function nextStage(){viewStep=state.step;history=[];selected=-1;hint=false;success=false;keyboard=[...c.start];light=[.1,.5];renderTools();message('Try your idea. Undo is always here.');opts.onSpeak?.(INSTRUCTIONS[viewStep]);}
 function click(e){const b=e.target.closest('button');if(!b||b.disabled||stopped)return;
  if(performance.now()<ignoreClickUntil&&e.detail>0)return;
  if(pointer)return;
  if(b.dataset.piece!==undefined){selected=Number(b.dataset.piece);renderTools();message('Now tap the gap where this plank fits.');return;}
  if(b.dataset.gap!==undefined){const gap=Number(b.dataset.gap);if(selected>=0)place(gap,selected);else if(state.bridge[gap]>=0){const before=clone(state);state.bridge[gap]=-1;commit(before);message('Plank returned. Choose another idea.');}else message('Choose a plank first.');return;}
  if(b.dataset.symbol!==undefined){const before=clone(state);state.code.push(Number(b.dataset.symbol));commit(before);message(state.code.length===3?'Ready? Try lighting the lantern.':'Choose the next shape in the pictured code.');return;}
  switch(b.dataset.q){
   case'undo':if(history.length){state=history.pop();selected=-1;persist();renderTools();message('One move back. Try another idea.');}break;
   case'reset':resetStage();break;
   case'hint':hint=!hint;renderTools();message(hint?['Count the little spaces. A plank needs the same number.','The dotted trail shows one safe way. You can choose your own.','The faint rings show places to shine your lantern.'][viewStep]:'Clue tucked away. Your progress stays.');break;
   case'check':check();break;
   case'continue':if(!animation)nextStage();break;
   case'next-island':state=Q.nextChapter(state);c=Q.chapter(state.chapter);viewStep=0;history=[];selected=-1;hint=false;success=false;persist();renderTools();message('A new island, a different way through.');break;
   case'home':opts.onHome();break;
   case'paint':opts.onPaint();break;
  }
 }
 function key(e){
  if(pointer){if(e.key.startsWith('Arrow')||e.code==='Space'||e.key==='Enter')e.preventDefault();return;}
  dirty=true;
  if(success||viewStep===3)return;
  if(e.key.startsWith('Arrow')){e.preventDefault();const p=viewStep===2?light:keyboard;p[0]=Math.max(.02,Math.min(.98,p[0]+({ArrowLeft:-.04,ArrowRight:.04}[e.key]||0)));p[1]=Math.max(.04,Math.min(.96,p[1]+({ArrowUp:-.065,ArrowDown:.065}[e.key]||0)));
   if(viewStep===2){const before=clone(state);illuminate([...p]);commit(before);}else keyboard=[...p];
  }
  if((e.code==='Space'||e.key==='Enter')&&viewStep===1){e.preventDefault();const before=clone(state);append([...keyboard]);commit(before);}
 }
 function fit(){const box=el('.quest-scene').getBoundingClientRect(),portrait=box.width<600&&box.height>box.width*.7;const w=Math.max(1,portrait?box.width:Math.min(box.width,box.height*W/H)),h=Math.max(1,portrait?box.height:w*H/W);stretch=h/(w*H/W);surface.style.width=w+'px';surface.style.height=h+'px';can.width=W*2;can.height=Math.round(H*2*stretch);g.setTransform(2,0,0,2*stretch,0,0);dirty=true;}
 const observer=new ResizeObserver(fit);observer.observe(el('.quest-scene'));
 host.addEventListener('pointerdown',down);host.addEventListener('pointermove',move);host.addEventListener('pointerup',end);const canceled=e=>end(e,true);host.addEventListener('pointercancel',canceled);host.addEventListener('lostpointercapture',canceled);host.addEventListener('click',click);can.addEventListener('keydown',key);
 el('.quest-finger').onclick=()=>{cancelGesture();guard.allowFinger();el('.quest-finger').hidden=true;message('Finger play is ready.');};
 // Original code-drawn scenery shares the explorer and forest artwork with the islands.
 function text(t,x,y,size=16,color='#345b56',align='center'){g.save();g.translate(x,y);g.scale(1,1/stretch);g.fillStyle=color;g.font='700 '+(size*Math.min(1.8,Math.max(1,650/surface.clientWidth)))+'px system-ui';g.textAlign=align;g.fillText(t,0,0);g.restore();}
 function ground(night=false){
  const sky=g.createLinearGradient(0,0,0,H);sky.addColorStop(0,night?'#102e45':'#c7e5dc');sky.addColorStop(1,night?'#285245':'#8cbe98');g.fillStyle=sky;g.fillRect(0,0,W,H);
  for(let i=0;i<7;i++){const x=(i*181+60)%W;A.ellipse(g,x,500,250,170,night?'#1c4847':'#b2d0a3');}
  for(let i=0;i<13;i++){const x=(i*137+20)%W,y=80+(i%3)*40;sprites.pine(g,x,y,1.05+(i%3)*.2);}
  for(let i=0;i<22;i++){const x=(i*97+30)%W,y=110+(i*47)%410;A.ellipse(g,x,y,4,2,night?'#78a993':'#e2e6b4');}
 }
 function plank(x,y,n,alpha=1){g.save();g.globalAlpha=alpha;const w=n*32;A.round(g,x-w/2,y-18,w,36,6,'#d49b5d');A.round(g,x-w/2+3,y-15,w-6,5,2,'#f3ce8a');for(let j=1;j<n;j++)A.line(g,[[x-w/2+j*32,y-13],[x-w/2+j*32,y+13]],'#916541',2);for(const xx of [x-w/2+9,x+w/2-9])A.ellipse(g,xx,y+9,2.5,2.5,'#735c49');g.restore();}
 function drawBridge(){
  ground();g.fillStyle='#62b5bd';g.beginPath();g.moveTo(240,0);g.bezierCurveTo(450,170,510,200,770,560);g.lineTo(210,560);g.bezierCurveTo(400,250,200,220,130,0);g.fill();
  for(let i=0;i<16;i++){const y=(i*43+time*7)%H;A.line(g,[[300+(i%3)*32,y],[330+(i%3)*32,y]],'#c8ece570',3);}
  A.island(g,120,380,170,82,130);A.island(g,910,380,150,85,130);
  A.line(g,[[180,333],[850,333]],'#f0dbac',55);A.line(g,[[180,362],[850,362]],'#8e775b',6);A.line(g,[[180,304],[850,304]],'#8e775b',4);
  [310,510,710].forEach((x,i)=>{const width=c.gaps[i]*32;A.round(g,x-width/2-5,313,width+10,45,5,'#285f6c');g.save();g.strokeStyle='#d3e4d6';g.setLineDash([6,6]);g.strokeRect(x-width/2,317,width,36);g.restore();for(let j=1;j<c.gaps[i];j++)A.line(g,[[x-width/2+j*32,320],[x-width/2+j*32,351]],'#9ec8c0',2);if(state.bridge[i]>=0)plank(x,335,c.gaps[i]);text(String(i+1),x,394,23,'#fff9e2');if(hint)text(c.gaps[i]+(c.gaps[i]===1?' space':' spaces'),x,275,18);});
  sprites.tree(g,83,327,.9,true);sprites.tree(g,918,305,.85);sprites.fox(g,875,350,.85);
  const t=animation?.step===0?animation.progress:success?1:0;sprites.hero(g,170+t*665,324,1.05,opts.avatar,time,opts.artwork);
  text('WILLOW & WATER',120,465,14,'#517e6a');text('A WAY TOGETHER',876,470,14,'#517e6a');
  if(pointer?.piece!==null&&pointer?.at)plank(pointer.at[0]*W,pointer.at[1]*H,c.pieces[pointer.piece],.9);
 }
 function lantern(x,y,scale=1,lit=true){g.save();g.translate(x,y);g.scale(scale,scale/stretch);if(lit){const halo=g.createRadialGradient(0,0,1,0,0,58);halo.addColorStop(0,'#fff1ad9c');halo.addColorStop(1,'#fff1ad00');g.fillStyle=halo;g.fillRect(-58,-58,116,116);}A.round(g,-14,-21,28,40,5,lit?'#f5d977':'#809c91');A.line(g,[[-20,-21],[0,-33],[20,-21]],'#467875',6);A.line(g,[[-20,21],[20,21]],'#467875',6);g.restore();}
 function pointOnPath(progress){const p=state.trail;if(!p.length)return c.start;const lengths=p.slice(1).map((v,i)=>Q.distance(v,p[i])),total=lengths.reduce((a,b)=>a+b,0);let remaining=total*progress;for(let i=0;i<lengths.length;i++){if(remaining<=lengths[i]){const t=remaining/(lengths[i]||1);return[p[i][0]+(p[i+1][0]-p[i][0])*t,p[i][1]+(p[i+1][1]-p[i][1])*t];}remaining-=lengths[i];}return p[p.length-1];}
 function drawTrail(){
  ground();c.water.forEach(p=>{A.ellipse(g,p.x*W,p.y*H,p.r+10,p.r+10,'#8baa8d');A.ellipse(g,p.x*W,p.y*H,p.r,p.r,'#65adb6');A.ellipse(g,p.x*W-8,p.y*H-10,p.r*.7,p.r*.6,'#8cc8c5');A.line(g,[[p.x*W-16,p.y*H],[p.x*W+20,p.y*H]],'#c4ece0',3);});
  if(hint){g.save();g.setLineDash([9,12]);A.line(g,[c.start,...c.sparks,c.end].map(p=>[p[0]*W,p[1]*H]),'#fff9cfbb',10);g.restore();}
  A.ellipse(g,c.start[0]*W,c.start[1]*H,38,28,'#f5ebbb');text('START',c.start[0]*W,c.start[1]*H+52,15);
  if(state.trail.length>1){A.line(g,state.trail.map(p=>[p[0]*W,p[1]*H+4]),'#3d71674d',15);A.line(g,state.trail.map(p=>[p[0]*W,p[1]*H]),'#fff0a6',10);}
  c.sparks.forEach((p,i)=>{const x=p[0]*W,y=p[1]*H;A.ellipse(g,x,y,27,27,'#fff7c65c');A.star(g,x,y+(motion()?Math.sin(time*2+i)*3:0),17,'#ffe077',0);});
  lantern(c.end[0]*W,c.end[1]*H,1,true);text('FINISH',c.end[0]*W,c.end[1]*H+52,15);
  const at=pointOnPath(animation?.step===1?animation.progress:success?1:0);sprites.hero(g,at[0]*W,at[1]*H-5,.8,opts.avatar,time,opts.artwork);
  if(document.activeElement===can&&!pointer){g.strokeStyle='#326b70';g.lineWidth=3;g.strokeRect(keyboard[0]*W-12,keyboard[1]*H-12,24,24);}
 }
 function symbol(i,x,y){g.save();g.translate(x,y);g.scale(1,1/stretch);g.fillStyle=COLORS[i];if(i===0)A.star(g,0,0,24,COLORS[i]);else if(i===1){A.ellipse(g,0,0,22,22,COLORS[i]);A.ellipse(g,10,-7,19,19,'#315c63');}else if(i===2){g.rotate(-.45);A.ellipse(g,0,0,14,25,COLORS[i]);A.line(g,[[0,20],[0,-15]],'#4d8e78',2);}else A.poly(g,[[0,-25],[20,0],[0,25],[-20,0]],COLORS[i]);g.restore();}
 function drawHollow(){
  ground(true);c.symbols.forEach((p,i)=>{A.ellipse(g,p[0]*W,p[1]*H,41,38,'#315c63');symbol(i,p[0]*W,p[1]*H);});
  fg.clearRect(0,0,W,H);fg.fillStyle='#061d31ee';fg.fillRect(0,0,W,H);fg.save();fg.globalCompositeOperation='destination-out';const glow=fg.createRadialGradient(light[0]*W,light[1]*H,28,light[0]*W,light[1]*H,155);glow.addColorStop(0,'#000');glow.addColorStop(.5,'#000e');glow.addColorStop(1,'#0000');fg.fillStyle=glow;fg.fillRect(0,0,W,H);fg.restore();g.drawImage(fog,0,0);
  c.symbols.forEach((p,i)=>{if(state.found.includes(i)){A.ellipse(g,p[0]*W,p[1]*H,42,38,'#315c63');symbol(i,p[0]*W,p[1]*H);g.strokeStyle='#dcc98b';g.lineWidth=2;g.beginPath();g.arc(p[0]*W,p[1]*H,44,0,Math.PI*2);g.stroke();}else if(hint){g.strokeStyle='#c4d4c96b';g.lineWidth=3;g.beginPath();g.arc(p[0]*W,p[1]*H,46,0,Math.PI*2);g.stroke();}});
  for(let i=0;i<20;i++)A.ellipse(g,(i*97+30)%W,20+(i*39)%H,1.5,1.5,'#efdf9670');
  lantern(light[0]*W,light[1]*H,.8);sprites.hero(g,88,490,.85,opts.avatar,0,opts.artwork);
  if(animation?.step===2){g.fillStyle='rgba(255,229,152,'+(animation.progress*.55)+')';g.fillRect(0,0,W,H);}
 }
 function drawWin(){
  ground(true);const beam=g.createRadialGradient(770,190,0,770,190,500);beam.addColorStop(0,'#ffe39caa');beam.addColorStop(1,'#ffe39c00');g.fillStyle=beam;g.fillRect(0,0,W,H);A.island(g,750,450,240,75,120);A.island(g,220,495,260,70,95);
  A.poly(g,[[728,420],[736,205],[792,205],[808,420]],'#f5e5b3');A.round(g,722,174,83,57,6,'#286d7c');A.poly(g,[[708,174],[765,115],[822,174]],'#66bcb7');lantern(765,198,1.1);A.star(g,765,100,17,c.color);
  sprites.hero(g,240,465,1.5,opts.avatar,time,opts.artwork);sprites.fox(g,340,477,1.2);sprites.tree(g,140,470,1,true);sprites.pine(g,910,425,1.1);
  for(let i=0;i<30;i++)A.star(g,(i*89+40)%W,25+(i*67)%H,2+i%3,'#ffdfa1',motion()?time*.1:0);
 }
 function run(now){if(stopped)return;const dt=Math.min(.05,(now-lastTime)/1000);lastTime=now;if(motion()&&!document.hidden)time+=dt;
  if(animation){animation.progress=motion()?Math.min(1,(now-animation.start)/animation.duration):1;if(animation.progress===1){animation=null;if(viewStep===2)showWin();else renderTools();}}
  if(!dirty&&!animation&&(!motion()||now-lastDraw<33)){frame=requestAnimationFrame(run);return;}dirty=false;lastDraw=now;g.clearRect(0,0,W,H);if(viewStep===0)drawBridge();else if(viewStep===1)drawTrail();else if(viewStep===2)drawHollow();else drawWin();frame=requestAnimationFrame(run);
 }
 renderTools();message(viewStep<3?'Try an idea. There is no timer, and you can undo.':'Your lantern is still shining.');fit();opts.onSpeak?.(INSTRUCTIONS[viewStep]||'Your lantern is home.');frame=requestAnimationFrame(run);
 return()=>{stopped=true;cancelAnimationFrame(frame);observer.disconnect();guard.cancel();pointer=null;host.removeEventListener('pointerdown',down);host.removeEventListener('pointermove',move);host.removeEventListener('pointerup',end);host.removeEventListener('pointercancel',canceled);host.removeEventListener('lostpointercapture',canceled);host.removeEventListener('click',click);can.removeEventListener('keydown',key);can.width=can.height=fog.width=fog.height=1;};
}
root.WWQuestUI=Object.freeze({version:'0.7.0',mount});
})(globalThis);
