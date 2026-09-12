/** Mount the approved spatial UI inside its isolated React host. */
function mountPortfolio(root) {

 const q=s=>root.querySelector(s),qa=s=>root.querySelectorAll(s);const main=q('.sp-main'),home=q('[data-home-view]'),reader=q('[data-reader-view]'),stage=q('.sp-stage');const plates=Array.from(qa('[data-plate]'));const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');const design={accent:'#708cab',motion:!reduced.matches,depth:74};let project=0,order=[0,1,2],busy=false,view='home',lastTrigger=null,offsetX=0,offsetY=0,pointerFrame=0,pointerTarget=[0,0];
 const data=[{"title": "多人协同工作区", "type": "01 / 工作区", "role": "主导搭建 · 2026.06—08"}, {"title": "C端表述一致性审查skill", "type": "02 / Skill", "role": "Skill 产品负责人 · 2026.03—05"}, {"title": "多 Agent 审片工作台", "type": "03 / 多 Agent", "role": "产品负责人 & 独立实现 · 2026.07—08 · 个人项目"}];

 const canMove=()=>design.motion&&!reduced.matches;
 function animate(el,frames,options={}){if(!canMove())return Promise.resolve();return el.animate(frames,{duration:480,easing:'cubic-bezier(.18,.8,.2,1)',...options}).finished.catch(()=>{});}
 function pose(rank,x=offsetX,y=offsetY){return `translate(-50%,-50%) perspective(1100px) translate3d(${rank*11+x*(1-rank*.2)}px,${-48+rank*design.depth+y*(1-rank*.2)}px,${64-rank*42}px) rotateX(${44-y*.14}deg) rotateY(${-5+x*.1}deg) rotateZ(${-25+x*.11}deg) scale(${1-rank*.035})`;}
 function resetPose(){plates.forEach((el,i)=>{const rank=order.indexOf(i);el.style.transform=pose(rank);el.style.zIndex=String(8-rank*2);el.dataset.rank=String(rank);el.style.setProperty('--sp-shine',(46+offsetX*1.6)+'%');el.setAttribute('aria-label',(i===project?'打开':'选择')+data[i].title);});}
 function syncSelection(){qa('[data-select]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.select)===project)));q('[data-selected-count]').textContent=String(project+1).padStart(2,'0');root.dataset.selected=String(project);}
 function renderDesign(){root.style.setProperty('--sp-accent',design.accent);root.style.setProperty('--sg-accent',design.accent);root.dataset.motion=design.motion?'on':'off';q('.sp-motion').setAttribute('aria-pressed',String(design.motion));q('[data-motion-label]').textContent=design.motion?'动态开启':'动态关闭';if(!canMove()){offsetX=offsetY=0;pointerTarget=[0,0];}if(!busy&&view==='home')resetPose();}
 resetPose();syncSelection();renderDesign();
 q('.sp-motion').addEventListener('click',()=>{design.motion=!design.motion;renderDesign();});const onReducedChange=e=>{design.motion=!e.matches;renderDesign();};reduced.addEventListener('change',onReducedChange);
 async function selectProject(index,trigger){if(busy||view!=='home'||project===index)return;busy=true;lastTrigger=trigger||lastTrigger;const oldTransforms=plates.map(el=>getComputedStyle(el).transform);project=index;order=[index,...order.filter(i=>i!==index)];syncSelection();offsetX=offsetY=0;pointerTarget=[0,0];resetPose();const movements=plates.map((el,i)=>{const rank=order.indexOf(i),target=pose(rank);if(i===index){const intermediate=`translate(-50%,-50%) perspective(1100px) translate3d(52px,-10px,105px) rotateX(35deg) rotateY(-6deg) rotateZ(-17deg) scale(1.025)`;return animate(el,[{transform:oldTransforms[i],offset:0},{transform:intermediate,offset:.47},{transform:target,offset:1}],{duration:760});}return animate(el,[{transform:oldTransforms[i]},{transform:target}],{duration:680});});await Promise.all(movements);busy=false;resetPose();q('[data-live]').textContent='已选择 '+data[project].title+'，点击面板或打开当前项目进入。';}
 qa('[data-select]').forEach(b=>b.addEventListener('click',async()=>{if(busy||view!=='home')return;const i=Number(b.dataset.select);lastTrigger=b;if(i===project){openProject();return;}await selectProject(i,b);if(!busy&&view==='home')openProject();}));plates.forEach((el,i)=>el.addEventListener('click',()=>{if(busy)return;lastTrigger=el;if(i===project)openProject();else selectProject(i,el);}));q('[data-open-current]').addEventListener('click',()=>{lastTrigger=q('[data-open-current]');openProject();});
 function settlePointer(){pointerFrame=0;if(busy||view!=='home'||!canMove())return;offsetX+=(pointerTarget[0]-offsetX)*.12;offsetY+=(pointerTarget[1]-offsetY)*.12;resetPose();if(Math.abs(pointerTarget[0]-offsetX)+Math.abs(pointerTarget[1]-offsetY)>.05)pointerFrame=requestAnimationFrame(settlePointer);}
 stage.addEventListener('pointermove',e=>{if(!canMove()||busy||view!=='home'||e.pointerType==='touch')return;const r=stage.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;pointerTarget=[x*15,y*13];stage.style.setProperty('--sp-glow-x',(53+x*20)+'%');stage.style.setProperty('--sp-glow-y',(53+y*15)+'%');if(!pointerFrame)pointerFrame=requestAnimationFrame(settlePointer);});stage.addEventListener('pointerleave',()=>{pointerTarget=[0,0];if(!pointerFrame)pointerFrame=requestAnimationFrame(settlePointer);});
 function populate(){
 q('[data-reader-copy-status]').textContent='';const d=data[project],template=q(`[data-project-document="${project}"]`);
 root.dataset.project=String(project);
 q('[data-project-count]').textContent=String(project+1).padStart(2,'0')+' / 03';
 q('[data-reader-type]').textContent=d.type;q('[data-reader-role]').textContent=d.role;
 q('[data-reader-title]').textContent=d.title;q('[data-reader-summary]').textContent=template.dataset.summary;
 q('[data-experience-panel]').replaceChildren(template.content.cloneNode(true));
 q('[data-chapter-nav]').replaceChildren(q(`[data-project-nav="${project}"]`).content.cloneNode(true));
 q('[data-next-project]').textContent=data[(project+1)%3].title+' ↗';initGraphs();
 }
 function localRect(el){const r=el.getBoundingClientRect(),m=main.getBoundingClientRect();return{left:r.left-m.left,top:r.top-m.top,width:r.width,height:r.height};}
 function platePlacement(el){const st=getComputedStyle(el),r=localRect(stage);return{left:r.left+parseFloat(st.left),top:r.top+parseFloat(st.top),width:el.offsetWidth,height:el.offsetHeight,transform:st.transform};}
 const flatTransform='translate(0px,0px) perspective(1100px) translate3d(0px,0px,0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1)';
 function makeFlight(el,placement){const copy=el.cloneNode(true);copy.removeAttribute('data-plate');copy.removeAttribute('aria-label');copy.setAttribute('aria-hidden','true');copy.setAttribute('disabled','');copy.classList.add('sp-flight');copy.style.left=placement.left+'px';copy.style.top=placement.top+'px';copy.style.width=placement.width+'px';copy.style.height=placement.height+'px';copy.style.transform=placement.transform;main.append(copy);return copy;}
 function flatFrame(r){return{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px',transform:flatTransform,borderRadius:'9px'};}
 function placementFrame(p){return{left:p.left+'px',top:p.top+'px',width:p.width+'px',height:p.height+'px',transform:p.transform,borderRadius:'9px'};}
 async function openProject(){if(busy||view!=='home')return;busy=true;view='opening';root.dataset.view=view;const plate=plates[project],initial=platePlacement(plate),oldHeight=main.offsetHeight;const flight=canMove()?makeFlight(plate,initial):null;home.hidden=true;reader.hidden=false;populate();const header=q('.sp-reader-header'),target=localRect(header);main.style.minHeight=Math.max(oldHeight,reader.offsetHeight)+'px';q('.sg-reader-content').style.opacity='0';if(flight){const h2=q('[data-reader-title]'),h2Rect=localRect(h2);const copy=flight.querySelector('.sp-plate-copy');const startTop=copy.offsetTop;copy.style.bottom='auto';copy.style.top=startTop+'px';flight.querySelector('.sp-plate-number').style.opacity='0';flight.querySelector('.sp-plate-foot').style.opacity='0';flight.querySelector('.sp-plate-desc').style.opacity='0';animate(flight.querySelector('.sp-plate-number'),[{opacity:1},{opacity:0}],{duration:240});animate(flight.querySelector('.sp-plate-foot'),[{opacity:1},{opacity:0}],{duration:240});animate(flight.querySelector('.sp-plate-desc'),[{opacity:1},{opacity:0}],{duration:250});animate(copy,[{top:startTop+'px',left:'24px'},{top:(h2Rect.top-target.top)+'px',left:(h2Rect.left-target.left)+'px'}],{duration:780});animate(flight.querySelector('.sp-plate-title'),[{fontSize:getComputedStyle(plate.querySelector('.sp-plate-title')).fontSize},{fontSize:getComputedStyle(h2).fontSize}],{duration:780});await animate(flight,[placementFrame(initial),flatFrame(target)],{duration:820,easing:'cubic-bezier(.22,.72,.16,1)'});flight.remove();}q('.sg-reader-content').style.opacity='';main.style.minHeight='';view='reader';root.dataset.view=view;busy=false;animate(q('.sg-reader-tabs'),[{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:330});animate(q('[data-experience-panel]'),[{opacity:0,transform:'translateY(17px)'},{opacity:1,transform:'translateY(0)'}],{duration:470});q('[data-back]').focus({preventScroll:true});if(root.getBoundingClientRect().top< -100)root.scrollIntoView({block:'start',behavior:canMove()?'smooth':'instant'});q('[data-live]').textContent='已打开 '+data[project].title;}
 async function goHome(){if(busy)return;if(view==='home'){root.scrollIntoView({block:'start',behavior:canMove()?'smooth':'instant'});return;}busy=true;root.scrollIntoView({block:'start',behavior:'instant'});view='closing';root.dataset.view=view;const header=q('.sp-reader-header'),start=localRect(header),oldHeight=main.offsetHeight;reader.hidden=true;home.hidden=false;offsetX=offsetY=0;pointerTarget=[0,0];resetPose();const plate=plates[project],target=platePlacement(plate);main.style.minHeight=Math.max(oldHeight,home.offsetHeight)+'px';plate.style.visibility='hidden';const flight=canMove()?makeFlight(plate,{...start,transform:flatTransform}):null;if(flight){flight.style.visibility='visible';flight.querySelector('.sp-plate-number').style.opacity='0';flight.querySelector('.sp-plate-foot').style.opacity='0';animate(home,[{opacity:.15},{opacity:1}],{duration:650});animate(flight.querySelector('.sp-plate-number'),[{opacity:0},{opacity:1}],{duration:750});animate(flight.querySelector('.sp-plate-foot'),[{opacity:0},{opacity:1}],{duration:750});await animate(flight,[flatFrame(start),placementFrame(target)],{duration:800,easing:'cubic-bezier(.22,.72,.16,1)'});flight.remove();}plate.style.visibility='';main.style.minHeight='';busy=false;view='home';root.dataset.view=view;syncSelection();(lastTrigger?.isConnected?lastTrigger:q(`[data-select="${project}"]`)).focus({preventScroll:true});if(root.getBoundingClientRect().top< -100)root.scrollIntoView({block:'start',behavior:canMove()?'smooth':'instant'});q('[data-live]').textContent='已返回首页，保留选择 '+data[project].title;}
 async function nextProject(direction){if(busy||view!=='reader')return;busy=true;project=(project+direction+3)%3;order=[project,...order.filter(i=>i!==project)];syncSelection();populate();resetPose();await animate(q('.sg-reader-content'),[{opacity:.2,transform:`translateX(${direction*22}px)`},{opacity:1,transform:'translateX(0)'}],{duration:400});busy=false;q('[data-back]').focus({preventScroll:true});root.scrollIntoView({block:'start',behavior:'instant'});}
 q('[data-home]').addEventListener('click',goHome);q('[data-back]').addEventListener('click',goHome);q('[data-prev]').addEventListener('click',()=>nextProject(-1));q('[data-next]').addEventListener('click',()=>nextProject(1));q('[data-next-project]').addEventListener('click',()=>nextProject(1));q('[data-works]').addEventListener('click',async()=>{if(view==='reader')await goHome();if(!busy)q('#sp-projects').scrollIntoView({block:'center',behavior:canMove()?'smooth':'instant'});});root.addEventListener('keydown',e=>{if(busy||e.altKey||e.ctrlKey||e.metaKey||e.target.closest('[data-graph]'))return;if(view==='reader'){if(e.key==='Escape'){e.preventDefault();goHome();}if(e.key==='ArrowLeft'){e.preventDefault();nextProject(-1);}if(e.key==='ArrowRight'){e.preventDefault();nextProject(1);}}});
 q('[data-copy]').addEventListener('click',async()=>{const value='yz25196289';let copied=false;try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(value);copied=true;}}catch{}if(!copied){const area=document.createElement('textarea');area.value=value;area.style.cssText='position:absolute;left:0;top:0;opacity:0;pointer-events:none';root.append(area);area.select();try{copied=document.execCommand('copy');}catch{}area.remove();}if(copied){q('[data-copy]').textContent='已复制';q('[data-copy-status]').textContent='微信号已复制。';}else{const range=document.createRange();range.selectNodeContents(q('[data-wechat-text]'));const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);q('[data-copy-status]').textContent='已选中微信号，请按 ⌘C / Ctrl+C 复制。';}});
 q('[data-back-bottom]').addEventListener('click',goHome);
 qa('[data-home-anchor]').forEach(b=>b.addEventListener('click',async()=>{if(busy)return;if(view==='reader')await goHome();q('#'+b.dataset.homeAnchor).scrollIntoView({block:'start',behavior:canMove()?'smooth':'instant'});}));
 q('[data-chapter-nav]').addEventListener('click',e=>{const a=e.target.closest('[data-chapter-link]');if(!a)return;e.preventDefault();q(a.getAttribute('href')).scrollIntoView({block:'start',behavior:canMove()?'smooth':'instant'});qa('[data-chapter-link]').forEach(x=>x.removeAttribute('aria-current'));a.setAttribute('aria-current','location');qa('.mm-branch').forEach(b=>b.classList.toggle('is-reading',b.contains(a)));});
 q('[data-copy-footer]').addEventListener('click',async()=>{let done=false;try{await navigator.clipboard.writeText('yz25196289');done=true;}catch{}if(!done){const range=document.createRange();range.selectNodeContents(q('[data-footer-wechat]'));const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);try{done=document.execCommand('copy');}catch{}}q('[data-footer-status]').textContent=done?'微信号已复制。':'已选中微信号，请按 ⌘C / Ctrl+C 复制。';});


 q('[data-chapter-nav]').addEventListener('click',e=>{if(e.target.closest('[data-map-top]'))q('.sp-reader-header').scrollIntoView({block:'start',behavior:canMove()?'smooth':'instant'});});
 root.addEventListener('click',e=>{const a=e.target.closest('[data-brief-link]');if(!a)return;e.preventDefault();const target=q(a.getAttribute('href'));target.scrollIntoView({block:'start',behavior:canMove()?'smooth':'instant'});target.setAttribute('tabindex','-1');target.focus({preventScroll:true});qa('[data-chapter-link]').forEach(link=>{const active=link.getAttribute('href')===a.getAttribute('href');if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});qa('.mm-branch').forEach(branch=>branch.classList.toggle('is-reading',!!branch.querySelector('[aria-current]')));});
 q('[data-reader-copy]').addEventListener('click',async()=>{let copied=false;try{await navigator.clipboard.writeText('yz25196289');copied=true;}catch{}if(!copied){const range=document.createRange();range.selectNodeContents(q('[data-reader-wechat]'));const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);try{copied=document.execCommand('copy');}catch{}}q('[data-reader-copy-status]').textContent=copied?'微信号已复制。':'已选中微信号，请按 ⌘C / Ctrl+C 复制。';});
 function selectNode(graph,index,focus=false){
   const node=graph.querySelector(`[data-node="${index}"]`);if(!node)return;
   graph.dataset.selected=String(index);
   graph.querySelectorAll('[data-node]').forEach(b=>{b.setAttribute('aria-pressed',String(b===node));b.classList.toggle('is-active',b===node);});
   graph.querySelectorAll('[data-node-detail]').forEach(panel=>panel.classList.toggle('is-active',Number(panel.dataset.nodeDetail)===index));
   graph.querySelectorAll('[data-edge-from]').forEach(edge=>edge.classList.toggle('is-connected',Number(edge.dataset.edgeFrom)===index||Number(edge.dataset.edgeTo)===index));
   if(focus)node.focus({preventScroll:true});
 }
 function initGraphs(){
   qa('[data-experience-panel] [data-graph]').forEach(graph=>{selectNode(graph,0);graph.classList.add('v2-ready');});
 }
 root.addEventListener('click',e=>{
   const chapterLink=e.target.closest('[data-mechanism-chapter]');if(chapterLink){q('#'+chapterLink.dataset.mechanismChapter).scrollIntoView({block:'start',behavior:canMove()?'smooth':'instant'});return;}
   const mechanism=e.target.closest('[data-mechanism]');
   if(mechanism){const graph=q(`[data-experience-panel] [data-graph="${mechanism.dataset.mechanism}"]`);if(graph){graph.scrollIntoView({block:'center',behavior:canMove()?'smooth':'instant'});selectNode(graph,0,true);}return;}
   const graph=e.target.closest('[data-graph]');if(!graph)return;
   if(e.target.closest('[data-rule-case]')){selectNode(graph,3);graph.querySelector('[data-case-status]').textContent='筛选标签括号注释 → L3 合理差异 → 白名单，不报。';return;}
   const node=e.target.closest('[data-node]');
   if(node){selectNode(graph,Number(node.dataset.node));return;}
   if(e.target.closest('[data-trace-reset]')){graph.dataset.trace='0';graph.dataset.awaitHuman='false';selectNode(graph,0);graph.querySelector('[data-trace-next]').disabled=false;graph.querySelector('[data-trace-next]').textContent='逐步查看路径';graph.querySelector('[data-trace-status]').textContent='已重置，可重新查看。';return;}
   if(e.target.closest('[data-trace-next]')){
     const count=graph.querySelectorAll('[data-node]').length;
     let step=Number(graph.dataset.trace||0);
     const gate=graph.dataset.graph==='journey'?[2,3]:[5];
     if(graph.dataset.awaitHuman==='true'){
       graph.dataset.awaitHuman='false';
       if(step===count-1){graph.querySelector('[data-trace-status]').textContent='人工签发是系统边界；此处仅展示机制，不执行签发。';graph.querySelector('[data-trace-next]').disabled=true;return;}
     }
     step=Math.min(step+1,count-1);graph.dataset.trace=String(step);selectNode(graph,step);
     const next=graph.querySelector('[data-trace-next]'),status=graph.querySelector('[data-trace-status]');
     if(gate.includes(step)){graph.dataset.awaitHuman='true';next.textContent=step===count-1?'查看签发边界':'查看人工确认后的下一步';status.textContent='停在人工环节；系统不能自行确认。';}
     else if(step===count-1){next.disabled=true;status.textContent='路径查看完成。';}
     else{next.textContent='下一步';status.textContent=`当前第 ${step+1} 步 / 共 ${count} 步。`;}
   }
 });
 root.addEventListener('keydown',e=>{
   const node=e.target.closest('[data-node]');if(!node||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
   e.preventDefault();e.stopPropagation();
   const graph=node.closest('[data-graph]'),count=graph.querySelectorAll('[data-node]').length,current=Number(node.dataset.node);
   const next=e.key==='Home'?0:e.key==='End'?count-1:(current+(e.key==='ArrowRight'?1:-1)+count)%count;
   selectNode(graph,next,true);
 });
 root.addEventListener('pointerover',e=>{const node=e.target.closest('[data-node]');if(node)node.closest('[data-graph]').querySelectorAll('[data-edge-from]').forEach(edge=>edge.classList.toggle('is-hovered',edge.dataset.edgeFrom===node.dataset.node||edge.dataset.edgeTo===node.dataset.node));});
 root.addEventListener('pointerout',e=>{const node=e.target.closest('[data-node]');if(node&&!node.contains(e.relatedTarget))node.closest('[data-graph]').querySelectorAll('.is-hovered').forEach(edge=>edge.classList.remove('is-hovered'));});
 const resize=new ResizeObserver(()=>{if(!busy&&view==='home')resetPose();});resize.observe(stage);
 if(canMove()){busy=true;Promise.all(plates.map((el,i)=>animate(el,[{transform:pose(0,0,0),opacity:0},{transform:pose(order.indexOf(i),0,0),opacity:1}],{duration:1000,delay:i*50,easing:'cubic-bezier(.18,.78,.18,1)'}))).then(()=>{busy=false;resetPose();});}

 return () => { resize.disconnect(); reduced.removeEventListener("change",onReducedChange); cancelAnimationFrame(pointerFrame); root.getAnimations({subtree:true}).forEach(a=>a.cancel()); };
}

mountPortfolio(document.getElementById("spatial-portfolio"));
