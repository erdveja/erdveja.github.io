(function(){
'use strict';

/* ---------- Duomenys ---------- */
// Pavadinimus ir aprašus galima keisti čia.
var PROJECTS=[
  {id:'p1',title:'Namas ties horizontu',desc:'Vieno aukšto namas su 57 m² bendra erdve ir didele terasa.',type:'Nauja statyba',year:'2026',n:4},
  {id:'p2',title:'Dvibučiai ir vienbučiai',desc:'Tas pats sklypas, du sprendimai: du butai po vienu stogu arba vienas didelis namas.',type:'Nauja statyba',year:'2026',n:4},
  {id:'p3',title:'Kontrastas',desc:'Juodo ir balto kontrasto namas po plokščiu stogu, su terasa į kiemą.',type:'Nauja statyba',year:'2026',n:4},
  {id:'p4',title:'Rytinė šviesa',desc:'Vieno aukšto namas iš šviesios plytos: trys miegamieji ir erdvi svetainė.',type:'Nauja statyba',year:'2026',n:3},
  {id:'p5',title:'Klasikinė vila',desc:'Vila su kolonomis ir balkonu: klasikinė forma, šiuolaikinis komfortas.',type:'Nauja statyba',year:'2026',n:4},
  {id:'p6',title:'Namas ant šlaito',desc:'Du aukštai, įsiterpę į šlaitą: garažas apačioje, terasos ir balkonai į vaizdą.',type:'Nauja statyba',year:'2026',n:4},
  {id:'p7',title:'Pievos namas',desc:'Baltas vieno aukšto namas su uždengta terasa ir tamsia tvora.',type:'Nauja statyba',year:'2026',n:4},
  {id:'p8',title:'Pavakarys',desc:'Dviejų šlaitų namas iš plytos ir tinko, šilčiausiai atrodantis vakaro šviesoje.',type:'Nauja statyba',year:'2026',n:4}
];
var HERO_FRAMES=['img/p6/hero1.jpg','img/p6/hero2.jpg','img/p6/hero3.jpg','img/p6/hero4.jpg'];

(function(){var t=new URLSearchParams(location.search).get('theme')||'khaki';document.documentElement.setAttribute('data-theme',t)})();
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};

/* ---------- Projektų tinklelis ---------- */
var grid=$('#grid');
PROJECTS.forEach(function(p,i){
  var imgs=[];for(var k=1;k<=p.n;k++)imgs.push('img/'+p.id+'/'+k+'.jpg');
  p.imgs=imgs;
  var a=document.createElement('a');
  a.className='card reveal';
  a.href='#';
  a.setAttribute('data-i',i);
  a.setAttribute('aria-label',p.title);
  var ex=imgs.slice(1,4).map(function(src,k){return '<div class="ex ex'+k+'"><img src="'+src+'" alt="" loading="lazy"></div>'}).join('');
  a.innerHTML='<div class="main"><img src="'+imgs[0]+'" alt="'+p.title+'" loading="lazy"></div>'+ex+
    '<div class="meta"><b>'+p.title+'</b><span>'+p.type+' · '+p.year+'</span><em>'+p.desc+'</em></div>';
  grid.appendChild(a);
});

/* ---------- Kursorius ---------- */
var cursor=$('#cursor'),cursorText=$('#cursorText');
var cx=0,cy=0,tx=0,ty=0,hasMouse=false;
window.addEventListener('mousemove',function(e){
  tx=e.clientX;ty=e.clientY;
  if(!hasMouse){hasMouse=true;cx=tx;cy=ty;cursor.classList.add('active')}
});
document.addEventListener('mouseleave',function(){cursor.classList.remove('active')});
document.addEventListener('mouseenter',function(){if(hasMouse)cursor.classList.add('active')});
(function loop(){
  cx+=(tx-cx)*.2;cy+=(ty-cy)*.2;
  cursor.style.transform='translate('+cx+'px,'+cy+'px)';
  requestAnimationFrame(loop);
})();
$$('.card').forEach(function(c){
  var p=PROJECTS[+c.getAttribute('data-i')];
  c.addEventListener('mouseenter',function(){cursorText.textContent=p.title;cursor.classList.add('label')});
  c.addEventListener('mouseleave',function(){cursor.classList.remove('label')});
  c.addEventListener('click',function(e){e.preventDefault();openLB(+c.getAttribute('data-i'),0)});
});

/* ---------- Lightbox ---------- */
var lb=$('#lightbox'),lbImg=$('#lbImg'),lbTitle=$('#lbTitle'),lbCount=$('#lbCount');
var cur={p:0,i:0};
function showLB(){
  var p=PROJECTS[cur.p];
  lbImg.src=p.imgs[cur.i];lbImg.alt=p.title;
  lbTitle.textContent=p.title+' · '+p.type;
  var ld=document.getElementById('lbDesc');if(ld)ld.textContent=p.desc||'';
  lbCount.textContent=(cur.i+1)+' / '+p.imgs.length;
}
function openLB(pi,ii){cur.p=pi;cur.i=ii;showLB();lb.classList.add('open');lb.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';cursor.classList.remove('label')}
function closeLB(){lb.classList.remove('open');lb.setAttribute('aria-hidden','true');document.body.style.overflow=''}
function step(d){var n=PROJECTS[cur.p].imgs.length;cur.i=(cur.i+d+n)%n;showLB()}
$('#lbClose').addEventListener('click',closeLB);
$('#lbPrev').addEventListener('click',function(){step(-1)});
$('#lbNext').addEventListener('click',function(){step(1)});
lb.addEventListener('click',function(e){if(e.target===lb)closeLB()});
document.addEventListener('keydown',function(e){
  if(!lb.classList.contains('open'))return;
  if(e.key==='Escape')closeLB();
  if(e.key==='ArrowLeft')step(-1);
  if(e.key==='ArrowRight')step(1);
});

/* ---------- Hero: kadrų perėjimas pagal slinkimą ---------- */
var canvas=$('#heroCanvas'),ctx=canvas.getContext('2d');
var cutCanvas=$('#heroCut'),cctx=cutCanvas.getContext('2d');
var heroTitle=$('#heroTitle');
var hero=$('#hero'),heroCopy=$('#heroCopy'),heroHint=$('#heroHint'),heroCap=$('#heroCaption');
var darkEls=[$('#projektai'),$('#juosta'),$('#kontaktai')];
var hasVideo=false,fgPending=false,titleFade=1;
var frames=[],cuts=[],loaded=0,W=0,H=0,dpr=1,progress=0;
var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches;

HERO_FRAMES.forEach(function(src,i){
  var im=new Image();
  im.onload=function(){loaded++;draw()};
  im.src=src;frames[i]=im;
  var cm=new Image();
  cm.onload=function(){draw()};
  cm.src=src.replace(/hero(\d+)\.jpg$/,'hero-cut$1.png');cuts[i]=cm;
});
function fitTitle(){
  // užrašas užpildo plotį
  heroTitle.style.fontSize='20vw';
  var target=window.innerWidth*0.94,w=heroTitle.scrollWidth||1;
  var fs=parseFloat(getComputedStyle(heroTitle).fontSize);
  heroTitle.style.fontSize=(fs*target/w)+'px';
}
function resize(){
  dpr=Math.min(window.devicePixelRatio||1,2);
  W=canvas.clientWidth;H=canvas.clientHeight;
  [canvas,cutCanvas].forEach(function(c){c.width=Math.round(W*dpr);c.height=Math.round(H*dpr)});
  fitTitle();
  draw();
}
function cover(c,im,alpha){
  if(!im||!im.complete||!im.naturalWidth)return;
  var iw=im.naturalWidth,ih=im.naturalHeight,cv=c.canvas;
  var s=Math.max(cv.width/iw,cv.height/ih);
  var w=iw*s,h=ih*s;
  c.globalAlpha=alpha;
  c.drawImage(im,(cv.width-w)/2,cv.height-h,w,h);
}
function draw(){
  if(!W)return;
  var n=frames.length;
  var t=Math.min(Math.max(progress,0),1)*(n-1);
  var i=Math.floor(t),f=t-i;
  if(i>=n-1){i=n-1;f=0}
  ctx.clearRect(0,0,canvas.width,canvas.height);
  cctx.clearRect(0,0,cutCanvas.width,cutCanvas.height);
  cover(ctx,frames[i],1);
  cover(cctx,cuts[i],1);
  // kadras laikosi, o perėjimas vyksta paskutinėje segmento dalyje: nauja nuotrauka "nubraukiama" iš kairės
  var HOLD=.55;
  var g=f<=HOLD?0:(f-HOLD)/(1-HOLD);
  g=g*g*(3-2*g);
  if(g>0&&frames[i+1]){
    var x=Math.round(canvas.width*g);
    [[ctx,frames[i+1]],[cctx,cuts[i+1]]].forEach(function(p){
      var c=p[0];
      c.save();
      c.beginPath();c.rect(0,0,x,canvas.height);c.clip();
      if(c===cctx)c.clearRect(0,0,x,canvas.height);
      cover(c,p[1],1);
      c.restore();
    });
    ctx.globalAlpha=.85;ctx.fillStyle='#fff';
    ctx.fillRect(x-Math.max(1,dpr),0,Math.max(1,dpr),canvas.height);
  }
  ctx.globalAlpha=1;cctx.globalAlpha=1;
}
function onScroll(){
  var y=window.scrollY,vh=window.innerHeight;
  var total=hero.offsetHeight-vh;
  progress=(reduce||hasVideo)?0:Math.min(Math.max(y/total,0),1);
  draw();
  // tekstas blunka pirmoje trečdalyje
  var o=hasVideo?1-Math.min(y/(vh*0.6),1):1-Math.min(progress/0.18,1);
  heroCopy.style.opacity=o;
  // didysis užrašas juda lėčiau nei kadras (gylio jausmas) ir išblunka
  var py=Math.min(y,vh*1.2);
  heroTitle.style.transform='translateY('+(py*0.16)+'px) scale('+(1+progress*0.06)+')';
  heroTitle.style.opacity=hasVideo?Math.max(1-y/(vh*0.9),0)*titleFade:Math.max(1-Math.max(progress-0.7,0)/0.3,0);
  heroCopy.style.transform='translateY('+(-(1-o)*30)+'px)';
  heroHint.style.opacity=o;
  heroCap.style.opacity=progress>0.22&&progress<0.98?1:0;
  // antraštės spalva
  var hdr=$('#header');
  var heroBottom=hero.offsetTop+hero.offsetHeight-70;
  hdr.classList.remove('solid','on-dark');
  var yy=y+60,dark=false;
  darkEls.forEach(function(el){if(yy>el.offsetTop&&yy<el.offsetTop+el.offsetHeight)dark=true});
  if(y>heroBottom){hdr.classList.add(dark?'on-dark':'solid')}
}
window.addEventListener('scroll',onScroll,{passive:true});
window.addEventListener('resize',function(){resize();onScroll()});
resize();onScroll();
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){resize();onScroll()});

// hero video ciklu pirmyn ir atgal.
// Horizontaliame ekrane: video su ERDVĖJA užrašu, įkeptu už namo (be sinchronizacijos problemų).
// Vertikaliame (telefonas): video be užrašo, užrašas virš jo kaip tekstas.
(function(){
  var v=$('#heroVideo');
  var cur='';
  function pick(){
    var portrait=window.innerHeight>window.innerWidth;
    var key=portrait?'plain':'baked';
    if(key===cur)return;
    var t=cur?v.currentTime:0;cur=key;
    hero.classList.toggle('portrait',portrait);
    v.poster=portrait?'video/hero-plain.jpg':'video/hero.jpg';
    v.src=portrait?'video/hero-plain.mp4':'video/hero.mp4';
    v.addEventListener('loadedmetadata',function f(){v.removeEventListener('loadedmetadata',f);try{v.currentTime=t}catch(e){}v.play().catch(function(){})});
    v.load();
  }
  hasVideo=true;
  v.addEventListener('error',function(){hasVideo=false;hero.classList.remove('has-video','portrait');resize();onScroll()});
  pick();
  window.addEventListener('resize',pick);
  onScroll();
  function loop(){
    // portrete tekstinis užrašas išblunka, kai namas priartėja
    var t=v.currentTime,D=v.duration||30,u=Math.min(t,D-t);
    var tf=u<5?1:Math.max(.16,1-(u-5)/7*.84);
    if(hero.classList.contains('portrait')&&Math.abs(tf-titleFade)>.01){titleFade=tf;onScroll()}
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();

// detalių juosta slenka horizontaliai pagal vertikalų slinkimą
var track=$('#detailTrack'),detSec=$('#detales');
function moveDetails(){
  if(!track||reduce)return;
  var r=detSec.getBoundingClientRect(),vh=window.innerHeight;
  var p=Math.min(Math.max((vh-r.top)/(vh+r.height),0),1);
  var max=Math.max(track.scrollWidth-window.innerWidth,0);
  track.style.transform='translateX('+(-p*max)+'px)';
}
window.addEventListener('scroll',moveDetails,{passive:true});
window.addEventListener('resize',moveDetails);
moveDetails();

/* ---------- Atsiradimo animacijos ---------- */
var io=new IntersectionObserver(function(es){
  es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})
},{threshold:.12});
$$('.reveal').forEach(function(el,i){el.style.transitionDelay=((i%3)*80)+'ms';io.observe(el)});
$$('.service-list li,.steps li,.section-head,.people>div').forEach(function(el){el.classList.add('reveal');io.observe(el)});

$('#year').textContent=new Date().getFullYear();
})();

/* mobilus greitų veiksmų juosta */
(function(){var bar=document.getElementById('mbar'),k=document.getElementById('kontaktai');if(!bar)return;
function upd(){var y=window.scrollY,h=window.innerHeight,show=y>h*.7;
  if(k){var r=k.getBoundingClientRect();if(r.top<h*.55)show=false}
  bar.classList.toggle('show',show)}
window.addEventListener('scroll',upd,{passive:true});upd()})();
