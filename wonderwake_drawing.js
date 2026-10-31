/* Wonderwake Openpaper. Local painting; no external drawing service. */
(function(root){'use strict';
const PAPER='#fffdf3';
const COLORS=[['#245e73','Ocean blue'],['#e16d52','Coral red'],['#e8ae39','Sunshine gold'],['#49977c','Leaf green'],['#8368ad','Twilight purple'],['#ffffff','Snow white'],['#243444','Midnight'],['#439dcc','Sky blue'],['#e898b5','Blossom pink'],['#a6c76b','Lime green'],['#a67751','Earth brown'],['#f3c8a0','Peach']];
const TOOLS=[['pen','Pen'],['pencil','Pencil'],['marker','Marker'],['eraser','Eraser']];
const PATHS={undo:'M9 5 4 10l5 5 M4 10h10a6 6 0 0 1 0 12',redo:'m15 5 5 5-5 5 M20 10H10a6 6 0 0 0 0 12',more:'M5 12h.01M12 12h.01M19 12h.01',gallery:'M4 4h16v16H4z M4 16l5-5 4 4 3-3 4 4 M15 8h.01',close:'m6 6 12 12 M18 6 6 18',download:'M12 3v12m-5-5 5 5 5-5 M4 17v4h16v-4',check:'m5 12 4 4L20 5'};
function icon(name){return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="'+PATHS[name]+'"/></svg>';}
function tip(tool){return '<span class="pen-tip '+tool+'" aria-hidden="true"><i></i></span>';}
function stroke(g,s,w,h){
 const p=s.points;if(!p.length)return;g.save();g.lineCap=g.lineJoin='round';
 g.strokeStyle=g.fillStyle=s.tool==='eraser'?PAPER:s.color;
 g.globalAlpha=s.tool==='marker'?.38:s.tool==='pencil'?.78:1;
 g.lineWidth=s.size*w/800*(s.tool==='marker'?2:s.tool==='pencil'?.6:1);
 g.beginPath();if(p.length===1){g.arc(p[0][0]*w,p[0][1]*h,g.lineWidth/2,0,Math.PI*2);g.fill();}
 else{g.moveTo(p[0][0]*w,p[0][1]*h);for(let i=1;i<p.length;i++)g.lineTo(p[i][0]*w,p[i][1]*h);g.stroke();}g.restore();
}
function paint(canvas,strokes,paper){
 const w=paper?.width||800,h=paper?.height||480;
 canvas.width=w;canvas.height=h;const g=canvas.getContext('2d');g.fillStyle=PAPER;g.fillRect(0,0,w,h);
 for(const s of strokes)stroke(g,s,w,h);
}
// Iterative Ramer-Douglas-Peucker: keep corners, remove redundant samples.
// Tolerance is one quarter of a logical pixel; original exports are never rewritten.
function simplify(points,ratio){
 if(points.length<3)return points;const h=800/ratio,keep=new Uint8Array(points.length);keep[0]=keep[points.length-1]=1;
 // Bound worst-case work for a long zigzag; each window retains its endpoints.
 const ranges=[];for(let a=0;a<points.length-1;a+=256){const b=Math.min(a+256,points.length-1);keep[a]=keep[b]=1;ranges.push([a,b]);}
 while(ranges.length){const [a,b]=ranges.pop(),x=points[a][0]*800,y=points[a][1]*h,dx=points[b][0]*800-x,dy=points[b][1]*h-y,den=dx*dx+dy*dy;
  let max=.25*.25,at=-1;for(let i=a+1;i<b;i++){const px=points[i][0]*800-x,py=points[i][1]*h-y,t=den?Math.max(0,Math.min(1,(px*dx+py*dy)/den)):0,d=(px-t*dx)**2+(py-t*dy)**2;if(d>max){max=d;at=i;}}
  if(at>=0){keep[at]=1;ranges.push([a,at],[at,b]);}
 }return points.filter((_,i)=>keep[i]);
}
function mount(host,opts={}){
 const compact=!!opts.fit,limits=root.WWCore.DRAWING_LIMITS;
 let strokes=[],redo=[],color=COLORS[0][0],size=compact?4:8,tool='pen',current=null,dirty=false,pending=null,editVersion=0,totalPoints=0,frame=0,disposed=false,paper=null,trayOpener=null;
 const guard=WWCreative.pointerGuard();
 const palette=COLORS.map(([c,n],i)=>'<button type="button" class="paint-color '+(i===0?'selected':'')+'" style="--paint:'+c+'" data-color="'+c+'" aria-label="'+n+'" aria-pressed="'+(i===0)+'"></button>').join('');
 const sizes='<label>Brush <select class="paint-size" aria-label="Brush size"><option value="4">Fine</option><option value="8" selected>Medium</option><option value="14">Bold</option><option value="24">Big</option></select></label>';
 const save='<button type="button" class="primary paint-save" aria-label="Save to my gallery">'+(compact?icon('check')+'<span>Save</span>':'Save to my gallery')+'</button>';
 const download='<button type="button" class="secondary paint-download">'+(compact?icon('download'):'')+'Download picture</button>';
 host.innerHTML='<section class="paint-workshop '+(compact?'openpaper':'')+'">'+
  (compact?'':'<div class="paint-heading"><span class="eyebrow">'+(opts.count?'PICTURE ANSWER · ONE DOT FOR EACH OBJECT':'YOUR IDEAS, IN COLOR')+'</span><h3></h3><p class="paint-instruction"></p></div><div class="paint-palette" role="group" aria-label="Paint colors">'+palette+sizes+'</div>')+
  '<div class="paint-paper"><div class="paper-surface"><canvas id="paint-canvas" class="paint-canvas" aria-label="Drawing paper: use a finger, Pencil or mouse"></canvas><canvas class="paint-live" aria-hidden="true"></canvas></div></div>'+
  (compact?'<div class="paint-dock" role="toolbar" aria-label="Drawing tools"><button type="button" class="dock-button colour-toggle" data-tray="colours" aria-label="Choose colour" aria-expanded="false" aria-controls="paint-colours"><span class="colour-well" style="--paint:'+color+'"></span><small>Colour</small></button><button type="button" class="dock-button pen-toggle" data-tray="pens" aria-label="Choose pen" aria-expanded="false" aria-controls="paint-pens">'+tip(tool)+'<small>Pen</small></button><span class="dock-divider"></span><button type="button" class="dock-button paint-undo" aria-label="Undo stroke">'+icon('undo')+'<small>Undo</small></button><button type="button" class="dock-button paint-redo" aria-label="Redo stroke">'+icon('redo')+'<small>Redo</small></button><span class="dock-divider"></span><button type="button" class="dock-button" data-tray="more" aria-label="More drawing options" aria-expanded="false" aria-controls="paint-more">'+icon('more')+'<small>More</small></button></div>':'<div class="learn-controls"><button type="button" class="secondary paint-undo">Undo stroke</button><button type="button" class="secondary paint-clear">Clear paper</button><button type="button" class="secondary paint-finger">Enable finger drawing</button></div>')+
  '<p class="paint-state" role="status">'+(opts.count?'Tap to place one dot. Undo removes one dot.':compact?'Make something only you can imagine. Save to keep it.':'Draw freely. Your picture is temporary until you save it to your gallery.')+'</p>'+
  (compact?'<div class="paint-tray" id="paint-colours" role="dialog" aria-label="Choose a colour" hidden><div class="tray-heading"><strong>Pick a colour</strong><button class="tray-close" aria-label="Close colour choices">'+icon('close')+'</button></div><div class="paint-palette" role="group" aria-label="Paint colors">'+palette+'</div><p class="colour-name">Ocean blue</p></div><div class="paint-tray" id="paint-pens" role="dialog" aria-label="Choose a pen" hidden><div class="tray-heading"><strong>Your drawing tools</strong><button class="tray-close" aria-label="Close pen choices">'+icon('close')+'</button></div><div class="pen-choices" role="group" aria-label="Pen styles">'+TOOLS.map(([t,n])=>'<button type="button" class="pen-choice '+(t===tool?'selected':'')+'" data-tool="'+t+'" aria-pressed="'+(t===tool)+'">'+tip(t)+'<span>'+n+'</span></button>').join('')+'</div><div class="size-choices" role="group" aria-label="Line thickness">'+[4,8,14,24].map((n,i)=>'<button type="button" data-size="'+n+'" aria-label="'+['Fine','Medium','Bold','Big'][i]+' line" aria-pressed="'+(n===size)+'" class="'+(n===size?'selected':'')+'"><i style="--tip-size:'+Math.max(3,n*.7)+'px"></i><small>'+['Fine','Medium','Bold','Big'][i]+'</small></button>').join('')+'</div></div><div class="paint-tray paint-more" id="paint-more" role="dialog" aria-label="More drawing options" hidden><div class="tray-heading"><strong>A little more</strong><button class="tray-close" aria-label="Close drawing options">'+icon('close')+'</button></div>'+download+'<button type="button" class="secondary paint-finger">Enable finger drawing</button><button type="button" class="secondary paint-clear">New paper</button><button type="button" class="secondary" data-action="studio">Build with shapes</button></div>':'<div class="learn-controls">'+save+download+(opts.onAnswer?'<button type="button" class="primary gold paint-answer">'+(opts.count?'Check my picture answer':'Reveal and compare')+'</button>':'')+'</div><div class="paint-compare" role="status"></div>')+'</section>';
 const workshop=host.querySelector('.paint-workshop'),can=host.querySelector('#paint-canvas'),live=host.querySelector('.paint-live'),surface=host.querySelector('.paper-surface'),paperWrap=host.querySelector('.paint-paper'),state=host.querySelector('.paint-state');
 let headerActions=null;
 if(compact){headerActions=document.createElement('div');headerActions.className='paint-header-actions';headerActions.innerHTML='<button type="button" class="paint-gallery" data-action="gallery" aria-label="My picture gallery">'+icon('gallery')+'<span>Gallery</span></button>'+save;(opts.header||workshop).append(headerActions);}
 else{host.querySelector('h3').textContent=opts.title||'Paint a little wonder.';host.querySelector('.paint-instruction').textContent=opts.instruction||'Make a sky, a creature, or a world nobody has seen before.';}
 const saveButton=(headerActions||host).querySelector('.paint-save');
 if(opts.count){host.querySelector('.paint-palette').hidden=true;size=24;}
 const dimensions=()=>paper||{width:800,height:480};
 const ratio=()=>dimensions().width/dimensions().height;
 function historyButtons(){host.querySelector('.paint-undo').disabled=!strokes.length;const r=host.querySelector('.paint-redo');if(r)r.disabled=!redo.length;}
 function draw(){paint(can,strokes.filter(s=>s!==current),paper);live.width=can.width;live.height=can.height;if(current)stroke(live.getContext('2d'),current,can.width,can.height);historyButtons();}
 function activeFrame(){frame=0;if(disposed)return;const g=live.getContext('2d');g.clearRect(0,0,live.width,live.height);if(current)stroke(g,current,can.width,can.height);}
 function queueFrame(){if(!frame)frame=requestAnimationFrame(activeFrame);}
 function edited(){dirty=true;pending=null;editVersion++;}
 function point(e){const b=can.getBoundingClientRect();return [Math.round(Math.max(0,Math.min(1,(e.clientX-b.left)/b.width))*100000)/100000,Math.round(Math.max(0,Math.min(1,(e.clientY-b.top)/b.height))*100000)/100000];}
 function full(){state.textContent='This is a wonderfully detailed picture. Save it, then start a new paper.';}
 function addPoint(e,force=false){if(!current||opts.count)return;const p=point(e),last=current.points.at(-1),dist=Math.hypot((p[0]-last[0])*800,(p[1]-last[1])*800/ratio());if(dist<(force?.01:.5))return;if(totalPoints>=limits.points){full();return;}current.points.push(p);totalPoints++;edited();}
 function finish(e){
  if(e&&!guard.end(e))return;
  if(!e)guard.cancel();if(!current)return;
  if(e?.type==='pointerup')addPoint(e,true);
  const oldLength=current.points.length;if(!opts.count)current.points=simplify(current.points,ratio());totalPoints+=current.points.length-oldLength;
  stroke(can.getContext('2d'),current,can.width,can.height);current=null;
  cancelAnimationFrame(frame);frame=0;live.getContext('2d').clearRect(0,0,live.width,live.height);historyButtons();
 }
 function closeTray(focus=false){host.querySelectorAll('.paint-tray').forEach(x=>x.hidden=true);host.querySelectorAll('[data-tray]').forEach(x=>x.setAttribute('aria-expanded','false'));if(focus)trayOpener?.focus();trayOpener=null;}
 function toggleTray(button){const tray=host.querySelector('#paint-'+button.dataset.tray),wasOpen=!tray.hidden;closeTray();if(wasOpen)return;trayOpener=button;tray.hidden=false;button.setAttribute('aria-expanded','true');tray.querySelector('button').focus({preventScroll:true});}
 can.onpointerdown=e=>{
  if(!guard.begin(e))return;e.preventDefault();closeTray();
  if(strokes.length>=limits.strokes||totalPoints>=limits.points){guard.end(e);full();return;}
  current={color,size,...(compact?{tool}:{}),points:[point(e)]};strokes.push(current);totalPoints++;redo=[];edited();
  can.setPointerCapture(e.pointerId);queueFrame();historyButtons();state.textContent=opts.count?strokes.length+' dots on your paper.':guard.penSeen()?'Pencil ready · fingers rest safely.':'Your ideas, in colour.';
 };
 can.onpointermove=e=>{if(opts.count||!current||!guard.move(e))return;e.preventDefault();const batch=e.getCoalescedEvents?.();for(const pt of batch?.length?batch:[e])addPoint(pt);queueFrame();};
 can.onpointerup=can.onpointercancel=can.onlostpointercapture=finish;
 function setColour(c){color=c;if(tool==='eraser')setTool('pen');host.querySelectorAll('[data-color]').forEach(b=>{const active=b.dataset.color===c;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));});workshop.style.setProperty('--ink-colour',c);const well=host.querySelector('.colour-well');if(well)well.style.setProperty('--paint',c);const name=COLORS.find(x=>x[0]===c)?.[1]||'Your colour';const caption=host.querySelector('.colour-name');if(caption)caption.textContent=name;}
 function setSize(n){size=n;host.querySelectorAll('[data-size]').forEach(b=>{const active=Number(b.dataset.size)===n;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));});}
 function setTool(t){tool=t;host.querySelectorAll('[data-tool]').forEach(b=>{const active=b.dataset.tool===t;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));});const toggle=host.querySelector('.pen-toggle');if(toggle)toggle.innerHTML=tip(t)+'<small>'+TOOLS.find(x=>x[0]===t)[1]+'</small>';setSize(t==='pencil'?4:t==='marker'?14:t==='eraser'?24:4);}
 host.querySelectorAll('[data-tray]').forEach(b=>b.onclick=()=>toggleTray(b));
 host.querySelectorAll('.tray-close').forEach(b=>b.onclick=()=>closeTray(true));
 host.querySelectorAll('[data-color]').forEach(b=>b.onclick=()=>setColour(b.dataset.color));
 host.querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>setTool(b.dataset.tool));
 host.querySelectorAll('[data-size]').forEach(b=>b.onclick=()=>setSize(Number(b.dataset.size)));
 const sizeSelect=host.querySelector('select');if(sizeSelect)sizeSelect.onchange=e=>setSize(Number(e.target.value));
 const escapeTray=e=>{if(e.key==='Escape'&&host.querySelector('.paint-tray:not([hidden])')){e.preventDefault();e.stopPropagation();closeTray(true);}};
 // Capture before the app-level Escape handler, even if focus is in the header.
 document.addEventListener('keydown',escapeTray,true);
 host.querySelector('.paint-undo').onclick=()=>{finish();const s=strokes.pop();if(!s)return;redo.push(s);totalPoints-=s.points.length;edited();draw();state.textContent=opts.count?strokes.length+' dots on your paper.':'Last stroke undone.';};
 const redoButton=host.querySelector('.paint-redo');if(redoButton)redoButton.onclick=()=>{finish();const s=redo.pop();if(!s)return;strokes.push(s);totalPoints+=s.points.length;edited();draw();state.textContent='Stroke restored.';};
 host.querySelector('.paint-clear').onclick=()=>{if(strokes.length&&!confirm('Start a fresh paper? Save this picture to your gallery first to keep it.'))return;finish();strokes=[];redo=[];totalPoints=0;dirty=false;pending=null;editVersion++;closeTray(true);draw();state.textContent='Fresh paper. What will you make?';};
 host.querySelector('.paint-finger').onclick=()=>{finish();guard.allowFinger();closeTray(true);state.textContent='Finger drawing enabled. Your marks are kept.';};
 saveButton.onclick=async()=>{
  finish();closeTray();if(!strokes.length){state.textContent='Draw something first.';return;}
  if(!dirty){state.textContent='This version is already saved. Add a stroke to make a new version.';return;}
  saveButton.disabled=true;saveButton.classList.remove('saved');const savingVersion=editVersion;
  try{if(!pending)pending={title:(opts.title||'My picture').slice(0,80),createdAt:Date.now(),...(paper?{paper:{...paper}}:{}),strokes:JSON.parse(JSON.stringify(strokes))};
   const ok=await opts.onSave(pending);if(disposed)return;
   if(ok){if(editVersion===savingVersion){dirty=false;saveButton.classList.add('saved');state.textContent='Saved to your gallery on this device.';}else state.textContent='Earlier picture saved. Your newer edits need another save.';}
   else state.textContent='Picture is still here. Saving failed; download a copy from More.';
  }catch(e){if(!disposed)state.textContent=e.message;}finally{if(!disposed)saveButton.disabled=false;}
 };
 host.querySelector('.paint-download').onclick=()=>{finish();if(!strokes.length){state.textContent='Draw something first.';return;}can.toBlob(blob=>{if(blob)opts.onDownload(blob);},'image/png');closeTray(true);};
 if(opts.onAnswer)host.querySelector('.paint-answer').onclick=()=>{finish();if(!strokes.length&&!opts.count){state.textContent='Make your picture first.';return;}opts.onAnswer(strokes.length,host.querySelector('.paint-compare'),host.querySelector('.paint-answer'));};
 let resizeObserver=null;
 if(compact){const fit=()=>{const r=paperWrap.getBoundingClientRect();if(r.width<1||r.height<1)return;
   if(!paper){const aspect=Math.max(.6,Math.min(2.4,r.width/r.height));paper={width:1600,height:Math.round(1600/aspect)};draw();}
   const w=Math.max(1,Math.min(r.width,r.height*ratio()));surface.style.width=w+'px';surface.style.height=w/ratio()+'px';
  };resizeObserver=new ResizeObserver(fit);resizeObserver.observe(paperWrap);fit();}
 draw();setColour(color);
 return()=>{disposed=true;resizeObserver?.disconnect();cancelAnimationFrame(frame);guard.cancel();current=null;document.removeEventListener('keydown',escapeTray,true);headerActions?.remove();can.onpointerdown=can.onpointermove=can.onpointerup=can.onpointercancel=can.onlostpointercapture=null;};
}
root.WWDrawing=Object.freeze({version:'0.5.0',paint,mount});
})(globalThis);

