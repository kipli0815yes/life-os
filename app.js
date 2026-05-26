// ============================================================
// CONFIG & CONSTANTS
// ============================================================
const LS_KEY = 'lifeOS-v2';
const ICS_PROXY = 'https://api.allorigins.win/raw?url=';
const DEFAULT_ICS = 'https://calendar.google.com/calendar/ical/liumoyu0815%40gmail.com/public/basic.ics';
const MOODS = [
  {em:'🌱', l:'随时',     hint:'有空的时候',    days:180},
  {em:'🌿', l:'本月内',   hint:'这个月内完成',  days:30},
  {em:'🌸', l:'本周内',   hint:'这周找时间做',  days:7},
  {em:'⚡', l:'近期',     hint:'快了，要动起来',days:3},
  {em:'🔥', l:'今明两天', hint:'今天或明天搞定',days:1}
];

// ============================================================
// DATABASE
// ============================================================
let DB = {
  settings: { urgentDays:7, gasUrl:'', icsUrl:DEFAULT_ICS, apiKey:'', geminiKey:'', reportTime:'20:00' },
  rewards:  { streak:0, flowers:0, todayDone:false },
  confs: [
    { id:1, name:'社会情報学会 SSI', type:'submit',
      deadline:'2026/7/24', earlyDeadline:'2026/5/15',
      dates:'2026年秋', loc:'日本国内', visa:'不需要',
      url:'https://www.ssi.or.jp/',
      tasks:[
        {id:1,label:'确定选题',imp:1,fuzzy:2,done:false,doneDate:null,subs:[
          {id:11,label:'阅读过去3篇论文',done:false},
          {id:12,label:'用1-2句话写出选题',done:false}
        ]},
        {id:2,label:'文献调研',imp:1,doon:'2026/6/15',done:false,doneDate:null,subs:[]},
        {id:3,label:'最终提交',imp:1,deadline:'2026/7/24',done:false,doneDate:null,subs:[]}
      ]
    },
    { id:2, name:'日本社会心理学会', type:'attend',
      deadline:'2026/5/29', dates:'2026/9/12–13',
      loc:'立命馆大学', visa:'不需要',
      url:'https://www.socialpsychology.jp/conf2026/',
      tasks:[
        {id:1,label:'参加登记',imp:1,deadline:'2026/5/29',done:false,doneDate:null,subs:[]},
        {id:2,label:'预订住宿',imp:0,fuzzy:1,done:false,doneDate:null,subs:[]}
      ]
    }
  ],
  papers: [
    { id:1, title:'Adaptive Reasoning in Sparse LLMs',
      venue:'NeurIPS 2026', deadline:'2026/6/10', collab:'張三',
      tasks:[
        {id:1,label:'整理图表',imp:1,doon:'2026/5/26',done:false,doneDate:null,subs:[
          {id:11,label:'实验结果图',done:false},
          {id:12,label:'表格格式确认',done:false}
        ]},
        {id:2,label:'撰写Method章节',imp:1,fuzzy:3,done:false,doneDate:null,subs:[
          {id:21,label:'确定小标题',done:false},
          {id:22,label:'正文写作',done:false}
        ]},
        {id:3,label:'最终检查提交',imp:1,deadline:'2026/6/9',done:false,doneDate:null,subs:[]}
      ]
    }
  ],
  tasks: {
    study:  [{id:1,label:'贝叶斯统计第3章',imp:0,fuzzy:1,done:false,doneDate:null,subs:[]}],
    invest: [{id:1,label:'月度投资检查',   imp:0,doon:'2026/5/31',done:false,doneDate:null,subs:[]}],
    misc:   [{id:1,label:'社会调查士申请材料',imp:1,deadline:'2026/6/11',done:false,doneDate:null,subs:[]}]
  },
  customCats:  [],
  customTasks: {},
  qov:         {},
  routines: [
    {id:1,label:'读30分钟论文',done:false},
    {id:2,label:'查看邮件',   done:false},
    {id:3,label:'写日记',     done:false}
  ],
  notes: [
    {id:1,title:'研究想法：SNS与认知偏见',body:'关于社交媒体信息选择与回音壁效应。\n→ 可以作为SSI的论文主题？',tag:'研究',date:'2026/5/20'}
  ],
  inbox:   [],
  archive: {projects:[], tasks:[]},
  noteTags: ['想法','研究','投资','其他'],
  catNames: {study:'学习', invest:'投资・副业', misc:'杂事'},
  customNavTabs: [],
  navTabTasks: {},
  dreams: { life:'', review:'', yearCats:[], monthGoals:[] },
  lastReportDate: '',
  nextId:  700,
  lastRoutineDate: '',
  calEvents: []
};
let nid = () => ++DB.nextId;

// ============================================================
// STORAGE
// ============================================================
function saveDB() { try { localStorage.setItem(LS_KEY, JSON.stringify(DB)); } catch(e) {} }
function loadDB() {
  try {
    const r = localStorage.getItem(LS_KEY);
    if (!r) return;
    const s = JSON.parse(r);
    if (!s || typeof s !== 'object') return;
    if (!s.settings)            s.settings    = {};
    if (!s.archive)             s.archive     = {projects:[],tasks:[]};
    if (s.archive && !s.archive.projects) s.archive = {projects:[],tasks:s.archive||[]};
    if (!s.customCats)          s.customCats  = [];
    if (!s.customTasks)         s.customTasks = {};
    if (!s.qov)                 s.qov         = {};
    if (!s.tasks)               s.tasks       = {study:[],invest:[],misc:[]};
    if (!s.tasks.study)         s.tasks.study  = [];
    if (!s.tasks.invest)        s.tasks.invest = [];
    if (!s.tasks.misc)          s.tasks.misc   = [];
    if (!s.routines)            s.routines    = [];
    if (!s.notes)               s.notes       = [];
    if (!s.inbox)               s.inbox       = [];
    if (!s.confs)               s.confs       = [];
    if (!s.papers)              s.papers      = [];
    if (!s.settings.icsUrl)     s.settings.icsUrl     = DEFAULT_ICS;
    if (!s.settings.geminiKey)  s.settings.geminiKey  = '';
    if (!s.settings.reportTime) s.settings.reportTime = '20:00';
    if (!s.settings.urgentDays) s.settings.urgentDays = 7;
    if (!s.catNames)    s.catNames    = {study:'学习',invest:'投资・副业',misc:'杂事'};
    if (!s.noteTags)    s.noteTags    = ['想法','研究','投资','其他'];
    if (!s.customNavTabs) s.customNavTabs = [];
    if (!s.navTabTasks)   s.navTabTasks   = {};
    if (!s.dreams)      s.dreams = {life:'',review:'',yearCats:[],monthGoals:[]};
    if (!s.rewards)     s.rewards = {streak:0,flowers:0,todayDone:false};
    const migrate = arr => (arr||[]).forEach(t => { if(t.doneDate===undefined) t.doneDate=null; });
    (s.confs||[]).forEach(c  => migrate(c.tasks));
    (s.papers||[]).forEach(p => migrate(p.tasks));
    ['study','invest','misc'].forEach(k => migrate(s.tasks[k]));
    Object.values(s.customTasks||{}).forEach(arr => migrate(arr));
    Object.assign(DB, s);
  } catch(e) {
    console.warn('loadDB error, using defaults:', e.message);
  }
}

// ============================================================
// DATE HELPERS
// ============================================================
const TODAY = new Date(); TODAY.setHours(0,0,0,0);
const TODAY_STR = TODAY.toDateString();

function pd(s) {
  if (!s) return null;
  const m = s.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  return m ? new Date(+m[1],+m[2]-1,+m[3]) : null;
}
function dt(s) { const d=pd(s); return d?Math.ceil((d-TODAY)/86400000):999; }
function mmdd(s) { const d=pd(s); return d?`${d.getMonth()+1}/${d.getDate()}`:s; }
function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function urgScore(t) {
  if (t.deadline)  return dt(t.deadline);
  if (t.doon)      return dt(t.doon);
  if (t.doonWeek)  { const w=getWeeks().find(x=>x.key===t.doonWeek); return w?dt(w.key):999; }
  if (t.fuzzy!=null) return MOODS[t.fuzzy]?.days||999;
  return 999;
}
function getWeeks() {
  const ws=[], d=TODAY.getDay(), mon=new Date(TODAY);
  mon.setDate(TODAY.getDate()-(d===0?6:d-1));
  const sl=['本周','下周','下下周'];
  for(let i=0;i<6;i++){
    const s=new Date(mon); s.setDate(mon.getDate()+i*7);
    const e=new Date(s);   e.setDate(s.getDate()+6);
    const f=x=>`${x.getMonth()+1}/${x.getDate()}`;
    ws.push({key:s.toISOString().slice(0,10),label:sl[i]||`${s.getMonth()+1}月`,s:sl[i]||`${s.getMonth()+1}月`,range:`${f(s)}〜${f(e)}`});
  }
  return ws;
}

// ============================================================
// TASK VISIBILITY: completed tasks disappear next day
// ============================================================
function isTaskVisible(t) {
  if (!t.done) return true;
  if (!t.doneDate) return true; // legacy: show it
  return t.doneDate === TODAY_STR; // show only if done today
}

// ============================================================
// QUADRANT LOGIC
// ============================================================
function autoQuad(t, ctxU) {
  if (DB.qov[t.id]) return DB.qov[t.id];
  const u   = Math.min(urgScore(t), ctxU||999);
  const urg = u <= DB.settings.urgentDays;
  const imp = t.imp === 1;
  if (imp&&urg)  return 'uu';
  if (imp&&!urg) return 'ui';
  if (!imp&&urg) return 'iu';
  return 'ii';
}

function dtagHTML(t, ctx, cid) {
  let cl='', tx='';
  if (t.deadline) { const n=dt(t.deadline); cl=n<=3?'dt-u':n<=14?'dt-w':'dt-o'; tx=`🚩${mmdd(t.deadline)}·${n<=0?'今天':n+'天后'}`; }
  else if (t.doonWeek) { const w=getWeeks().find(x=>x.key===t.doonWeek); cl='dt-d'; tx=`📅${w?w.s:'?'}做`; }
  else if (t.doon)   { cl='dt-d'; tx=`📅${mmdd(t.doon)}做`; }
  else if (t.fuzzy!=null) { cl=`fz-${t.fuzzy}`; tx=`${MOODS[t.fuzzy].em}${MOODS[t.fuzzy].l}`; }
  if (!cl) return '';
  return `<span class="dtag ${cl}" data-action="dtag" data-tid="${t.id}" data-ctx="${ctx}" data-cid="${cid}">${tx}</span>`;
}

// ============================================================
// LIST HELPERS
// ============================================================
function fl(ctx, cid) {
  const id=+cid;
  if (ctx==='conf')   { const c=DB.confs.find(x=>x.id===id);  return c?c.tasks:[]; }
  if (ctx==='paper')  { const p=DB.papers.find(x=>x.id===id); return p?p.tasks:[]; }
  if (ctx==='custom') return DB.customTasks[cid]||[];
  if (ctx==='navtab') return DB.navTabTasks[cid]||[];
  return DB.tasks[ctx]||[];
}
function lel(ctx, cid) {
  if (ctx==='conf')   return 'cl-'+cid;
  if (ctx==='paper')  return 'pl-'+cid;
  if (ctx==='custom') return 'cust-'+cid;
  if (ctx==='navtab') return 'navtab-list-'+cid;
  return ctx+'-list';
}

// ============================================================
// RENDER TASK LIST
// ============================================================
function renderTasks(elId, tasks, ctx, cid) {
  const el=document.getElementById(elId);
  if (!el) return;
  el.innerHTML=''; cid=String(cid);
  tasks.filter(t=>isTaskVisible(t)).forEach(t => {
    const hasSubs=t.subs&&t.subs.length>0;
    const wrap=document.createElement('div');
    const row=document.createElement('div'); row.className='tr'; row.draggable=true;
    row.addEventListener('dragstart',e=>{
      e.dataTransfer.setData('text/plain',JSON.stringify({tid:t.id,ctx,cid}));
      const g=document.getElementById('dg'); g.textContent='⠿ '+t.label.slice(0,28); g.style.display='block';
    });
    row.addEventListener('dragend',()=>document.getElementById('dg').style.display='none');
    row.innerHTML=`
      <span class="dh">⠿</span>
      <div class="chk${t.done?' done':''}" data-action="chk" data-ctx="${ctx}" data-cid="${cid}" data-tid="${t.id}"></div>
      ${hasSubs?`<span style="width:14px;font-size:12px;color:var(--tx3);cursor:pointer;flex-shrink:0" data-action="exp" data-ctx="${ctx}" data-cid="${cid}" data-tid="${t.id}" id="ep-${ctx}-${cid}-${t.id}">▸</span>`:'<span style="width:14px;flex-shrink:0"></span>'}
      <div class="tl${t.done?' done':''}" data-action="editlbl" data-ctx="${ctx}" data-cid="${cid}" data-tid="${t.id}">${esc(t.label)}</div>
      ${dtagHTML(t,ctx,cid)}
      <span class="btn-g" data-action="arch-task" data-ctx="${ctx}" data-cid="${cid}" data-tid="${t.id}" title="归档">📦</span>`;
    wrap.appendChild(row);
    if (hasSubs) {
      const sw=document.createElement('div'); sw.className='sub-wrap'; sw.id=`sw-${ctx}-${cid}-${t.id}`; sw.style.display='none';
      t.subs.forEach(s=>{
        const sr=document.createElement('div'); sr.className='tr'; sr.style.padding='3px 0';
        sr.innerHTML=`
          <div class="chk${s.done?' done':''}" style="width:13px;height:13px" data-action="schk" data-ctx="${ctx}" data-cid="${cid}" data-tid="${t.id}" data-sid="${s.id}"></div>
          <div class="stl${s.done?' done':''}" data-action="editslbl" data-ctx="${ctx}" data-cid="${cid}" data-tid="${t.id}" data-sid="${s.id}">${esc(s.label)}</div>
          <span class="btn-g" data-action="delsub" data-ctx="${ctx}" data-cid="${cid}" data-tid="${t.id}" data-sid="${s.id}">✕</span>`;
        sw.appendChild(sr);
      });
      const asr=document.createElement('div'); asr.className='add-tr'; asr.style.cssText='font-size:12px;padding:3px 0';
      asr.dataset.action='addsub'; asr.dataset.ctx=ctx; asr.dataset.cid=cid; asr.dataset.tid=t.id;
      asr.innerHTML='<i class="ti ti-plus" style="font-size:12px"></i>添加子任务';
      sw.appendChild(asr); wrap.appendChild(sw);
    }
    el.appendChild(wrap);
  });
  const add=document.createElement('div'); add.className='add-tr'; add.style.marginTop='6px';
  add.dataset.action='addtask-list'; add.dataset.ctx=ctx; add.dataset.cid=String(cid);
  add.innerHTML='<i class="ti ti-plus" style="font-size:13px"></i>添加任务';
  el.appendChild(add);
}

// ============================================================
// RENDER QUADRANT
// ============================================================
function renderQuad() {
  const quads={uu:[],ui:[],iu:[],ii:[]};
  function addQ(t,ctx,cid,ctxU) {
    if (!isTaskVisible(t)) return;
    const q=autoQuad(t,ctxU); quads[q].push({t,ctx,cid:String(cid)});
  }
  DB.papers.forEach(p=>{const u=dt(p.deadline); p.tasks.forEach(t=>addQ(t,'paper',p.id,u));});
  DB.confs.forEach(c=>{const u=c.deadline?dt(c.deadline):999; c.tasks.forEach(t=>addQ(t,'conf',c.id,u));});
  ['study','invest','misc'].forEach(cat=>(DB.tasks[cat]||[]).forEach(t=>addQ(t,cat,0,999)));
  DB.customCats.forEach(cat=>(DB.customTasks[cat.id]||[]).forEach(t=>addQ(t,'custom',cat.id,999)));
  ['uu','ui','iu','ii'].forEach(q=>{
    const el=document.getElementById('t-'+q); if(!el)return;
    el.innerHTML=''; quads[q].sort((a,b)=>urgScore(a.t)-urgScore(b.t));
    quads[q].forEach(({t,ctx,cid})=>{
      const row=document.createElement('div'); row.className='tr'; row.draggable=true;
      row.addEventListener('dragstart',e=>{
        e.dataTransfer.setData('text/plain',JSON.stringify({tid:t.id,ctx,cid,fromQ:q}));
        const g=document.getElementById('dg'); g.textContent='⠿ '+t.label.slice(0,28); g.style.display='block';
      });
      row.addEventListener('dragend',()=>document.getElementById('dg').style.display='none');
      const srcMap={study:'学习',invest:'投资',misc:'杂事'};
      const src=ctx==='paper'?DB.papers.find(p=>p.id==cid)?.title?.slice(0,14)+'…'
               :ctx==='conf' ?DB.confs.find(c=>c.id==cid)?.name?.slice(0,14)+'…'
               :ctx==='custom'?DB.customCats.find(c=>c.id==cid)?.name
               :srcMap[ctx];
      row.innerHTML=`
        <span class="dh">⠿</span>
        <div class="chk${t.done?' done':''}" data-action="chk" data-ctx="${ctx}" data-cid="${cid}" data-tid="${t.id}"></div>
        <div style="flex:1;min-width:0">
          <div class="tl${t.done?' done':''}" data-action="editlbl" data-ctx="${ctx}" data-cid="${cid}" data-tid="${t.id}">${esc(t.label)}</div>
          ${src?`<div style="font-size:10px;color:var(--tx3)">${esc(src)}</div>`:''}
        </div>
        ${dtagHTML(t,ctx,cid)}`;
      el.appendChild(row);
    });
  });
  updateStats();
}

function setupQuadDrop() {
  ['uu','ui','iu','ii'].forEach(q=>{
    const el=document.getElementById('q-'+q); if(!el)return;
    el.addEventListener('dragover',e=>{e.preventDefault();el.classList.add('drag-over');});
    el.addEventListener('dragleave',()=>el.classList.remove('drag-over'));
    el.addEventListener('drop',e=>{
      e.preventDefault();
      try { const data=JSON.parse(e.dataTransfer.getData('text/plain')); if(data.fromQ!==q){DB.qov[data.tid]=q;renderQuad();saveDB();} } catch(e) {}
      el.classList.remove('drag-over');
    });
  });
}

// ============================================================
// STATS
// ============================================================
function updateStats() {
  let urg=0,imp=0,done=0;
  const count=tasks=>tasks.filter(t=>isTaskVisible(t)).forEach(t=>{
    if(t.done){done++;return;}
    const q=autoQuad(t);
    if(q==='uu'){urg++;imp++;}else if(q==='ui')imp++;else if(q==='iu')urg++;
  });
  DB.papers.forEach(p=>count(p.tasks)); DB.confs.forEach(c=>count(c.tasks));
  ['study','invest','misc'].forEach(cat=>count(DB.tasks[cat]||[]));
  const sg=document.getElementById('stats-grid');
  if(sg)sg.innerHTML=`
    <div class="stat"><div class="sv" style="color:var(--red)">${urg}</div><div class="sl">紧急任务</div></div>
    <div class="stat"><div class="sv" style="color:var(--ora)">${imp}</div><div class="sl">重要任务</div></div>
    <div class="stat"><div class="sv" style="color:var(--grn)">${done}</div><div class="sl">已完成</div></div>
    <div class="stat"><div class="sv" style="color:var(--pur)">🌸${DB.rewards.streak}</div><div class="sl">累计达成</div></div>`;
  const bu=document.getElementById('bd-urg'); if(bu){bu.textContent=urg;bu.style.display=urg?'inline':'none';}
  if(urg===0&&imp===0&&!DB.rewards.todayDone){
    DB.rewards.todayDone=true; DB.rewards.streak++; DB.rewards.flowers++; confetti();
    const ra=document.getElementById('reward-area');
    if(ra)ra.innerHTML=`<div class="reward-banner"><span style="font-size:24px">🌸</span><div><div style="font-size:14px;font-weight:600">今日重要任务全部完成！</div><div style="font-size:12px;color:var(--tx2)">连续${DB.rewards.streak}天 · 累计${DB.rewards.flowers}🌸</div></div></div>`;
    saveDB();
  }
  const ss=document.getElementById('set-streak');   if(ss)ss.textContent=DB.rewards.streak;
  const sp=document.getElementById('set-projects'); if(sp)sp.textContent=DB.archive.projects.length;
}

// ============================================================
// CONF RENDER (with delete button)
// ============================================================
function renderConfs() {
  ['submit','attend'].forEach(type=>{
    const el=document.getElementById('cl-'+type); if(!el)return; el.innerHTML='';
    DB.confs.filter(c=>c.type===type).forEach(c=>{
      const done=c.tasks.filter(t=>t.done).length, total=c.tasks.length;
      const prog=total?Math.round(done/total*100):0, allDone=total>0&&done===total;
      const urg=isConfUrgent(c);
      const div=document.createElement('div'); div.className='conf-card'+(urg?' urgent':'');
      div.innerHTML=`
        <div class="conf-h" data-cid="${c.id}">
          <span id="cce-${c.id}" style="font-size:12px;color:var(--tx3)">▸</span>
          <div class="tl" style="font-weight:500;font-size:14px" data-action="editcname" data-id="${c.id}">${esc(c.name)}</div>
          ${allDone?'<span>✅</span>':''}
          <span class="badge ${type==='submit'?'b-sub':'b-att'}">${type==='submit'?'投稿':'参加'}</span>
          <button class="btn-g" data-action="del-conf" data-cid="${c.id}" style="margin-left:4px;color:var(--red)" title="删除">🗑</button>
        </div>
        <div class="conf-body hidden" id="cb-${c.id}">
          <div class="dl-chips">${buildDlChips(c)}</div>
          <div class="ef"><i class="ti ti-map-pin" aria-hidden="true" style="font-size:13px;color:var(--tx3);flex-shrink:0"></i>
            <span data-action="editfield" data-cid="${c.id}" data-field="loc">${esc(c.loc||'点击编辑地点')}</span></div>
          <div class="ef"><i class="ti ti-calendar" aria-hidden="true" style="font-size:13px;color:var(--tx3);flex-shrink:0"></i>
            <span data-action="editfield" data-cid="${c.id}" data-field="dates">${esc(c.dates||'点击编辑会议日期')}</span></div>
          <div class="ef"><i class="ti ti-passport" aria-hidden="true" style="font-size:13px;color:var(--tx3);flex-shrink:0"></i>
            <span data-action="editfield" data-cid="${c.id}" data-field="visa">${esc(c.visa||'签证信息')}</span></div>
          ${total?`<div style="display:flex;align-items:center;gap:8px">
            <div class="pw"><div class="pf" id="cpf-${c.id}" style="width:${prog}%;background:var(--grn)"></div></div>
            <span style="font-size:12px;color:var(--tx2)" id="cps-${c.id}">${done}/${total}${allDone?' 🎉':''}</span>
          </div>`:''}
          ${allDone?`<div style="background:var(--grn-bg);border-radius:6px;padding:8px 12px;font-size:13px;color:var(--grn);display:flex;align-items:center;gap:8px">
            🎉 全部完成！<button class="btn" style="font-size:12px;padding:3px 10px;background:var(--grn);color:#fff;border-color:var(--grn);margin-left:auto"
            data-action="arch-proj" data-ctx="conf" data-cid="${c.id}">归档</button></div>`:''}
          <div id="cl-${c.id}"></div>
          <div style="display:flex;gap:6px;margin-top:6px">
            ${c.url?`<button class="btn" style="font-size:12px;padding:4px 10px" onclick="window.open('${esc(c.url)}','_blank')">官网 ↗</button>`:''}
          </div>
        </div>`;
      el.appendChild(div);
      setTimeout(()=>renderTasks('cl-'+c.id,c.tasks,'conf',c.id),0);
    });
  });
  const urg=DB.confs.filter(c=>isConfUrgent(c)).length;
  const bc=document.getElementById('bd-conf'); if(bc){bc.textContent=urg;bc.style.display=urg?'inline':'none';}
}

function buildDlChips(c) {
  let html='';
  const chip=(label,dateStr)=>{
    if(!dateStr)return;
    const n=dt(dateStr);
    const col=n<=7?'background:#fcebeb;color:#791f1f':n<=30?'background:#faebdd;color:#633806':'background:#e6f1fb;color:#0c447c';
    html+=`<span class="dl-chip" style="${col}">${label} 〆 ${mmdd(dateStr)} · ${n<=0?'已过':n+'天后'}</span>`;
  };
  chip('Early',c.earlyDeadline); chip('Final',c.deadline);
  return html||'<span style="font-size:12px;color:var(--tx3)">截止日期未设置</span>';
}
function isConfUrgent(c) { const dl=c.deadline||c.earlyDeadline; if(!dl)return false; const n=dt(dl); return n<=DB.settings.urgentDays&&n>=0; }
function updConfStats(id) {
  const c=DB.confs.find(x=>x.id===id); if(!c)return;
  const done=c.tasks.filter(t=>t.done).length, total=c.tasks.length, prog=total?Math.round(done/total*100):0;
  const pf=document.getElementById('cpf-'+id), ps=document.getElementById('cps-'+id);
  if(pf)pf.style.width=prog+'%'; if(ps)ps.textContent=`${done}/${total}${done===total&&total>0?' 🎉':''}`;
}

// ============================================================
// PAPER RENDER (fixed)
// ============================================================
function renderPapers() {
  const el=document.getElementById('paper-list'); if(!el)return; el.innerHTML='';
  if(!DB.papers.length){ el.innerHTML='<div class="empty">还没有论文。点击右上角「添加论文」。</div>'; return; }
  DB.papers.forEach(p=>{
    const n=dt(p.deadline), done=p.tasks.filter(t=>t.done).length, total=p.tasks.length;
    const prog=total?Math.round(done/total*100):0, allDone=total>0&&done===total;
    const col=n<=3?'var(--red)':n<=7?'var(--ora)':'var(--grn)';
    const card=document.createElement('div');
    card.className='paper-card'+(allDone?' complete':n<=3?' urgent':'');
    card.innerHTML=`
      <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:8px">
        <div style="flex:1;font-size:15px;font-weight:600">${esc(p.title)}</div>
        ${allDone?'<span>✅</span>':''}
        <span class="dtag ${n<=3?'dt-u':n<=14?'dt-w':'dt-o'}">🚩${p.deadline}·${n<=0?'今天':n+'天后'}</span>
        <button class="btn-g" data-action="del-paper" data-pid="${p.id}" style="color:var(--red)" title="删除">🗑</button>
      </div>
      <div style="font-size:13px;color:var(--tx2);margin-bottom:8px">${esc(p.venue)} · ${esc(p.collab)}</div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <div class="pw"><div class="pf" id="ppf-${p.id}" style="width:${prog}%;background:${col}"></div></div>
        <span style="font-size:12px;color:var(--tx2)" id="pps-${p.id}">${prog}% · ${done}/${total}${allDone?' 🎉':''}</span>
      </div>
      ${allDone?`<div style="background:var(--grn-bg);border-radius:6px;padding:8px 12px;font-size:13px;color:var(--grn);display:flex;align-items:center;gap:8px;margin-bottom:8px">
        🎉 全部完成！<button class="btn" style="font-size:12px;padding:3px 10px;background:var(--grn);color:#fff;border-color:var(--grn);margin-left:auto"
        data-action="arch-proj" data-ctx="paper" data-cid="${p.id}">归档</button></div>`:''}
      <div id="pl-${p.id}"></div>`;
    el.appendChild(card);
    renderTasks('pl-'+p.id, p.tasks, 'paper', p.id);
  });
}
function updPaperStats(id) {
  const p=DB.papers.find(x=>x.id===id); if(!p)return;
  const done=p.tasks.filter(t=>t.done).length, total=p.tasks.length, prog=total?Math.round(done/total*100):0;
  const pf=document.getElementById('ppf-'+id), ps=document.getElementById('pps-'+id);
  if(pf)pf.style.width=prog+'%'; if(ps)ps.textContent=`${prog}% · ${done}/${total}${done===total&&total>0?' 🎉':''}`;
}
function renderSimple(cat) { renderTasks(cat+'-list', DB.tasks[cat]||[], cat, 0); }

// ============================================================
// PROJECT COMPLETION
// ============================================================
function checkProjComplete(ctx, cid) {
  const tasks=fl(ctx,cid); if(!tasks.length||!tasks.every(t=>t.done))return;
  const cd=new Date().toLocaleDateString('zh-CN');
  if(ctx==='conf'){const c=DB.confs.find(x=>x.id===+cid);if(!c)return;DB.archive.projects.unshift({id:nid(),type:'conf',name:c.name,subtype:c.type==='submit'?'投稿完成 🎉':'参加完成 🎉',deadline:c.deadline,dates:c.dates,loc:c.loc,url:c.url,tasks:c.tasks.map(t=>({label:t.label})),completedDate:cd});DB.confs=DB.confs.filter(x=>x.id!==+cid);renderConfs();}
  else if(ctx==='paper'){const p=DB.papers.find(x=>x.id===+cid);if(!p)return;DB.archive.projects.unshift({id:nid(),type:'paper',name:p.title,subtype:'投稿完成 🎉',venue:p.venue,deadline:p.deadline,collab:p.collab,tasks:p.tasks.map(t=>({label:t.label})),completedDate:cd});DB.papers=DB.papers.filter(x=>x.id!==+cid);renderPapers();}
  renderArchive(); renderQuad(); showToast(DB.archive.projects[0].name); confetti(); saveDB();
  const ab=document.getElementById('bd-arc'); if(ab){ab.textContent=DB.archive.projects.length;ab.style.display='inline';}
}
function showToast(name){const t=document.createElement('div');t.className='proj-toast';t.innerHTML=`<div style="font-size:28px;margin-bottom:8px">🎉</div><div style="font-size:15px;font-weight:600;color:var(--grn)">项目完成！</div><div style="font-size:13px;margin-top:4px;max-width:200px;word-break:break-word">${esc(name)}</div>`;document.body.appendChild(t);setTimeout(()=>t.remove(),4200);}

// ============================================================
// ROUTINE
// ============================================================
let routOpen=false;
function toggleRout(){routOpen=!routOpen;const b=document.getElementById('rout-bd'),ic=document.getElementById('rout-ic');if(b)b.classList.toggle('hidden',!routOpen);if(ic)ic.style.transform=routOpen?'rotate(180deg)':'';}
function renderRoutines(){
  const el=document.getElementById('rout-bd'); if(!el)return; el.innerHTML='';
  const ts=new Date().toDateString();
  if(DB.lastRoutineDate!==ts){DB.routines.forEach(r=>r.done=false);DB.lastRoutineDate=ts;DB.rewards.todayDone=false;}
  const jsDay=TODAY.getDay();
  const myDay=jsDay===0?6:jsDay-1; // 0=周一 ... 6=周日
  let shown=0;
  DB.routines.forEach((r,i)=>{
    // weekly routine: only show on assigned weekdays
    if(r.weekDays && r.weekDays.length && !r.weekDays.includes(myDay)) return;
    shown++;
    const row=document.createElement('div'); row.className='tr';
    row.innerHTML=`<div class="chk${r.done?' done':''}" data-action="rchk" data-i="${i}"></div><div class="tl${r.done?' done':''}">${esc(r.label)}</div><span class="btn-g" data-action="del-rout" data-i="${i}">✕</span>`;
    el.appendChild(row);
  });
  if(!shown)el.innerHTML='<div style="font-size:12px;color:var(--tx3);padding:8px 0">今天没有例行任务</div>';
}

// ============================================================
// CUSTOM CATEGORIES
// ============================================================
function renderCustSecs(){
  const el=document.getElementById('cust-secs'); if(!el)return; el.innerHTML='';
  DB.customCats.forEach(cat=>{
    if(!DB.customTasks[cat.id])DB.customTasks[cat.id]=[];
    const sec=document.createElement('div'); sec.className='cust-sec';
    sec.innerHTML=`<div class="cust-hd" data-catid="${cat.id}"><span>${esc(cat.icon)}</span><span style="font-size:13px;font-weight:500;flex:1">${esc(cat.name)}</span><i class="ti ti-chevron-down" aria-hidden="true" style="font-size:13px;color:var(--tx3);transition:transform .2s" id="catic-${cat.id}"></i></div><div class="cust-bd hidden" id="catbd-${cat.id}"><div id="cust-${cat.id}"></div></div>`;
    el.appendChild(sec);
    renderTasks('cust-'+cat.id,DB.customTasks[cat.id],'custom',cat.id);
  });
  renderCustCatsList();
}
function renderCustCatsList(){
  const el=document.getElementById('cust-cats-list'); if(!el)return; el.innerHTML='';
  DB.customCats.forEach((cat,i)=>{const d=document.createElement('div');d.style.cssText='display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:0.5px solid var(--bd);font-size:13px';d.innerHTML=`<span>${esc(cat.icon)}</span><span style="flex:1">${esc(cat.name)}</span><button class="btn-g" data-action="del-cat" data-i="${i}">✕</button>`;el.appendChild(d);});
}

// ============================================================
// ARCHIVE
// ============================================================
function renderArchive(){
  const pEl=document.getElementById('arc-projects'),tEl=document.getElementById('arc-tasks');
  if(pEl){
    pEl.innerHTML='';
    if(DB.archive.projects.length){const l=document.createElement('div');l.style.cssText='font-size:11px;font-weight:500;color:var(--tx3);letter-spacing:.05em;text-transform:uppercase;margin-bottom:8px';l.textContent='已完成项目';pEl.appendChild(l);}
    DB.archive.projects.forEach((p,i)=>{const d=document.createElement('div');d.className='arc-proj';d.innerHTML=`<div style="display:flex;align-items:flex-start;gap:10px"><span style="font-size:22px">${p.type==='paper'?'📄':'🎓'}</span><div style="flex:1"><div style="font-size:15px;font-weight:600;margin-bottom:2px">${esc(p.name)}</div><div style="font-size:12px;color:var(--grn);font-weight:500">${esc(p.subtype)}</div><div style="font-size:12px;color:var(--tx2);margin-top:2px">${esc(p.venue||p.loc||'')} · 〆${esc(p.deadline||'')}</div><div style="font-size:11px;color:var(--tx3)">完成日期: ${p.completedDate}</div></div><button class="btn-g" data-action="unarc-proj" data-i="${i}">↩</button></div>${p.tasks&&p.tasks.length?`<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:8px;padding-top:8px;border-top:0.5px solid var(--grn-bg)">${p.tasks.map(t=>`<span style="font-size:11px;background:var(--grn-bg);color:var(--grn);padding:2px 8px;border-radius:20px">✓ ${esc(t.label)}</span>`).join('')}</div>`:''}`;pEl.appendChild(d);});
  }
  if(tEl){
    tEl.innerHTML='';
    if(!DB.archive.projects.length&&!DB.archive.tasks.length){tEl.innerHTML='<div class="empty">还没有归档内容。</div>';return;}
    if(DB.archive.tasks.length){const l=document.createElement('div');l.style.cssText='font-size:11px;font-weight:500;color:var(--tx3);letter-spacing:.05em;text-transform:uppercase;margin-bottom:8px;margin-top:12px';l.textContent='单个任务';tEl.appendChild(l);}
    DB.archive.tasks.forEach((a,i)=>{const d=document.createElement('div');d.className='arc-task';d.innerHTML=`<div class="chk done"></div><div style="flex:1"><div style="font-size:13px;text-decoration:line-through;color:var(--tx3)">${esc(a.label)}</div><div style="font-size:11px;color:var(--tx3)">${esc(a.src)} · ${a.date}</div></div><button class="btn-g" data-action="unarc-task" data-i="${i}">↩</button>`;tEl.appendChild(d);});
  }
  const total=DB.archive.projects.length+DB.archive.tasks.length;
  const ab=document.getElementById('bd-arc'); if(ab){ab.textContent=total;ab.style.display=total?'inline':'none';}
}

// ============================================================
// NOTES
// ============================================================
function renderNotes(){
  const el=document.getElementById('notes-grid'); if(!el)return; el.innerHTML='';
  DB.notes.forEach(n=>{const d=document.createElement('div');d.className='note-card';d.dataset.action='viewnote';d.dataset.nid=n.id;d.innerHTML=`<div style="font-size:13px;font-weight:600;margin-bottom:4px">${esc(n.title||'无标题')}</div><div style="font-size:12px;color:var(--tx2);display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;line-height:1.5">${esc(n.body)}</div><div style="display:flex;justify-content:space-between;margin-top:8px"><span class="badge b-gry" style="font-size:10px">${esc(n.tag)}</span><span style="font-size:11px;color:var(--tx3)">${n.date}</span></div>`;el.appendChild(d);});
}

// ============================================================
// INBOX
// ============================================================
function renderInbox(){
  const el=document.getElementById('inbox-list'); if(!el)return; el.innerHTML='';
  const badge=document.getElementById('bd-inbox');
  if(!DB.inbox.length){el.innerHTML='<div class="empty">点击「自动搜索」或同步Sheet获取推荐学会</div>';if(badge)badge.style.display='none';return;}
  if(badge){badge.textContent=DB.inbox.length;badge.style.display='inline';}
  DB.inbox.forEach((c,i)=>{const src=c.fromSheet?'📊 Sheet':'🤖 AI';const d=document.createElement('div');d.className='inbox-card';d.innerHTML=`<div style="display:flex;align-items:flex-start;gap:8px"><span style="font-size:11px;padding:2px 7px;border-radius:10px;background:var(--bg2);color:var(--tx2);flex-shrink:0">${src}</span><div style="flex:1;font-size:14px;font-weight:600">${esc(c.name)}</div><span class="badge b-gry">${esc(c.deadline||'待确认')}</span></div><div style="font-size:13px;color:var(--tx2)">${esc(c.location||c.loc||'?')} · ${esc(c.dates||'?')}</div>${c.relevance?`<div style="font-size:12px;color:var(--tx2);font-style:italic">${esc(c.relevance.slice(0,120))}</div>`:''}<div style="display:flex;gap:8px;margin-top:4px"><button class="btn btn-p" style="font-size:12px;padding:4px 12px" data-action="inbox-ok" data-i="${i}" data-it="submit">✓ 投稿</button><button class="btn" style="font-size:12px;padding:4px 12px" data-action="inbox-ok" data-i="${i}" data-it="attend">参加</button><button class="btn-g" data-action="inbox-skip" data-i="${i}" style="margin-left:auto">✕ 跳过</button></div>`;el.appendChild(d);});
}

// ============================================================
// GOOGLE CALENDAR (via Apps Script - real-time; ICS fallback)
// ============================================================
let calEvents = [];

async function fetchCal() {
  const sd=document.getElementById('sdot2'),st=document.getElementById('sync-txt2');
  // Don't block UI - render page first, calendar loads in background
  const ok=(n)=>{if(sd)sd.className='sdot ok';if(st)st.textContent=`Google Calendar · ${n}个事件`;};
  const idle=(msg)=>{if(sd){sd.className='sdot idle';}if(st)st.textContent=msg;};

  const ft=(url,ms=5000)=>{
    const c=new AbortController();
    const t=setTimeout(()=>c.abort(),ms);
    return fetch(url,{signal:c.signal}).finally(()=>clearTimeout(t));
  };

  if(DB.settings.gasUrl){
    try{
      const res=await ft(DB.settings.gasUrl+'?action=calendar',6000);
      const data=await res.json();
      if(data.status==='ok'&&Array.isArray(data.events)&&data.events.length>=0){
        calEvents=data.events.map(e=>({
          summary:e.title,
          start:e.start?new Date(e.start):null,
          end:e.end?new Date(e.end):null,
          allDay:e.allDay||false
        }));
        ok(calEvents.length); return;
      }
    }catch(e){/* Apps Script not updated yet or timeout */}
  }

  // Fallback ICS - short timeout, fail silently
  try{
    const res=await ft(ICS_PROXY+encodeURIComponent(DB.settings.icsUrl||DEFAULT_ICS),4000);
    const text=await res.text();
    calEvents=parseICS(text);
    if(calEvents.length>0){ok(calEvents.length);}
    else{idle('日历未连接 · 需更新Apps Script');}
  }catch(e){
    calEvents=[];
    idle('日历未连接 · 需更新Apps Script');
  }
}

function parseICS(text){
  const events=[]; const lines=text.replace(/\r\n/g,'\n').replace(/\r/g,'\n').split('\n'); let cur=null;
  lines.forEach(l=>{
    if(l==='BEGIN:VEVENT'){cur={};}
    else if(l==='END:VEVENT'&&cur){if(cur.start&&cur.summary)events.push(cur);cur=null;}
    else if(cur){
      if(l.startsWith('SUMMARY:'))cur.summary=l.slice(8).trim();
      else if(l.startsWith('DTSTART'))cur.start=parseICSDate(l.split(':').slice(1).join(':').trim());
      else if(l.startsWith('DTEND'))cur.end=parseICSDate(l.split(':').slice(1).join(':').trim());
    }
  });
  return events;
}
function parseICSDate(s){if(!s)return null;const m=s.match(/(\d{4})(\d{2})(\d{2})T?(\d{2})?(\d{2})?/);if(!m)return null;return new Date(+m[1],+m[2]-1,+m[3],+(m[4]||0),+(m[5]||0));}

function matchDay(t,day){
  if(t.deadline&&pd(t.deadline)?.toDateString()===day.toDateString())return true;
  if(t.doon&&pd(t.doon)?.toDateString()===day.toDateString())return true;
  if(t.doonWeek){const w=getWeeks().find(x=>x.key===t.doonWeek);if(w){const ws=new Date(w.key);const we=new Date(ws);we.setDate(ws.getDate()+6);if(day>=ws&&day<=we)return true;}}
  return false;
}

// Get calendar events for a specific day
function getCalEventsForDay(day){
  return calEvents.filter(e=>e.start&&e.start.toDateString()===day.toDateString());
}

// Get system tasks for a specific day
function getSysTasksForDay(day){
  const items=[];
  DB.papers.forEach(p=>p.tasks.filter(t=>!t.done&&matchDay(t,day)).forEach(t=>items.push({label:`[论文] ${t.label}`,type:'task',color:'var(--blu)'})));
  DB.confs.forEach(c=>c.tasks.filter(t=>!t.done&&matchDay(t,day)).forEach(t=>items.push({label:`[学会] ${t.label}`,type:'task',color:'var(--blu)'})));
  ['study','invest','misc'].forEach(cat=>(DB.tasks[cat]||[]).filter(t=>!t.done&&matchDay(t,day)).forEach(t=>items.push({label:t.label,type:'task',color:'var(--blu)'})));
  return items;
}

// Render today's calendar events
function renderTodayCal(){
  const el=document.getElementById('today-cal'); if(!el)return; el.innerHTML='';
  const todayEvents=getCalEventsForDay(TODAY);
  if(!todayEvents.length)return;
  el.innerHTML='<div style="font-size:11px;font-weight:500;color:var(--tx3);letter-spacing:.05em;text-transform:uppercase;margin-bottom:8px">日历事件</div>';
  todayEvents.forEach(e=>{
    const ts=e.start?`${e.start.getHours()}:${String(e.start.getMinutes()).padStart(2,'0')}`:'-';
    el.innerHTML+=`<div class="wi cal" style="margin-bottom:6px"><span class="wt">${ts}</span><div class="wdot" style="background:var(--pur)"></div><span style="font-size:13px">${esc(e.summary)}</span></div>`;
  });
}

function renderWeek(){
  const wr=document.getElementById('week-range'),wc=document.getElementById('week-content'); if(!wr||!wc)return;
  const mon=new Date(TODAY),dow=TODAY.getDay(); mon.setDate(TODAY.getDate()-(dow===0?6:dow-1));
  const sun=new Date(mon); sun.setDate(mon.getDate()+6);
  wr.textContent=`${mon.getMonth()+1}/${mon.getDate()} 〜 ${sun.getMonth()+1}/${sun.getDate()}`;
  wc.innerHTML='';
  for(let i=0;i<7;i++){
    const day=new Date(mon); day.setDate(mon.getDate()+i);
    const isToday=day.toDateString()===TODAY.toDateString();
    const dNames=['日','月','火','水','木','金','土'];
    const dayEl=document.createElement('div'); dayEl.className='week-day';
    const dstr=`${day.getFullYear()}-${String(day.getMonth()+1).padStart(2,'0')}-${String(day.getDate()).padStart(2,'0')}`;
    dayEl.innerHTML=`<div class="wdh${isToday?' today':''}"><span style="font-size:14px;font-weight:600">${day.getMonth()+1}/${day.getDate()}（${dNames[day.getDay()]}）</span>${isToday?'<span style="font-size:11px;padding:2px 8px;border-radius:10px;background:var(--red-bg);color:var(--red)">今天</span>':''}<span class="day-add-btn" data-action="day-add" data-date="${dstr}"><i class="ti ti-plus" style="font-size:11px"></i>加任务</span></div>`;
    const items=[];
    getCalEventsForDay(day).forEach(e=>items.push({time:e.start,label:e.summary,type:'cal'}));
    getSysTasksForDay(day).forEach(t=>items.push({time:null,label:t.label,type:'task'}));
    items.sort((a,b)=>(a.time?.getTime()||0)-(b.time?.getTime()||0));
    if(!items.length){dayEl.innerHTML+='<div style="font-size:12px;color:var(--tx3);padding:6px 0">无安排</div>';}
    else items.forEach(item=>{
      const ts=item.time?`${item.time.getHours()}:${String(item.time.getMinutes()).padStart(2,'0')}`:'-';
      dayEl.innerHTML+=`<div class="wi ${item.type==='cal'?'cal':'task'}"><span class="wt">${ts}</span><div class="wdot" style="background:${item.type==='cal'?'var(--pur)':'var(--blu)'}"></div><span style="font-size:13px">${esc(item.label)}</span></div>`;
    });
    wc.appendChild(dayEl);
  }
}

function renderMonth(){
  const mc=document.getElementById('month-content'),mr=document.getElementById('month-range'); if(!mc||!mr)return;
  const m=TODAY.getMonth(),y=TODAY.getFullYear(); mr.textContent=`${y}年${m+1}月`; mc.innerHTML='';

  // Build calendar grid
  const grid=document.createElement('div');
  grid.style.cssText='display:grid;grid-template-columns:repeat(7,1fr);gap:1px;background:var(--bd);border:1px solid var(--bd);border-radius:8px;overflow:hidden';

  // Day headers 月火水木金土日
  const dayNames=['月','火','水','木','金','土','日'];
  dayNames.forEach((n,i)=>{
    const h=document.createElement('div');
    h.style.cssText=`background:var(--bg2);padding:6px 0;text-align:center;font-size:11px;font-weight:600;color:${i>=5?'var(--red)':'var(--tx2)'}`;
    h.textContent=n; grid.appendChild(h);
  });

  // First day of month weekday (0=Sun...6=Sat → convert to Mon=0)
  const first=new Date(y,m,1);
  const firstDow=first.getDay()===0?6:first.getDay()-1; // 0=Mon
  const last=new Date(y,m+1,0).getDate();

  // Empty cells before first day
  for(let i=0;i<firstDow;i++){
    const e=document.createElement('div'); e.style.cssText='background:var(--bg);min-height:80px;'; grid.appendChild(e);
  }

  // Day cells
  for(let d=1;d<=last;d++){
    const day=new Date(y,m,d);
    const isToday=day.toDateString()===TODAY.toDateString();
    const dow=day.getDay(); // 0=Sun,6=Sat
    const isWeekend=dow===0||dow===6;
    const dstr=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

    const cell=document.createElement('div');
    cell.style.cssText=`background:${isToday?'#fef9f0':'var(--bg)'};min-height:80px;padding:4px;position:relative;`;

    // Day number
    const dn=document.createElement('div');
    dn.style.cssText=`font-size:12px;font-weight:${isToday?'700':'400'};color:${isToday?'var(--red)':isWeekend?'var(--red)':'var(--tx)'};width:22px;height:22px;display:flex;align-items:center;justify-content:center;border-radius:50%;${isToday?'background:var(--red);color:#fff;':''}`;
    dn.textContent=d; cell.appendChild(dn);

    // Calendar events
    getCalEventsForDay(day).forEach(e=>{
      const ev=document.createElement('div');
      const ts=e.start&&!e.allDay?`${e.start.getHours()}:${String(e.start.getMinutes()).padStart(2,'0')} `:'';
      ev.style.cssText='font-size:10px;background:#ede9fa;color:#5b21b6;border-radius:3px;padding:1px 4px;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap';
      ev.textContent=ts+e.summary; ev.title=e.summary; cell.appendChild(ev);
    });

    // Tasks
    getSysTasksForDay(day).forEach(t=>{
      const tv=document.createElement('div');
      tv.style.cssText='font-size:10px;background:var(--blu-bg);color:var(--blu);border-radius:3px;padding:1px 4px;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap';
      tv.textContent=t.label; tv.title=t.label; cell.appendChild(tv);
    });

    // Add task button
    const addBtn=document.createElement('div');
    addBtn.style.cssText='position:absolute;bottom:2px;right:2px;font-size:10px;color:var(--tx3);cursor:pointer;padding:2px 4px;border-radius:3px;display:none';
    addBtn.textContent='＋'; addBtn.dataset.action='day-add'; addBtn.dataset.date=dstr;
    cell.appendChild(addBtn);
    cell.addEventListener('mouseenter',()=>addBtn.style.display='block');
    cell.addEventListener('mouseleave',()=>addBtn.style.display='none');

    grid.appendChild(cell);
  }

  mc.appendChild(grid);
}

// ============================================================
// GOOGLE SHEET SYNC
// ============================================================
async function syncSheet(){
  const url=DB.settings.gasUrl; if(!url){setSyncState('idle','未设置 GAS URL');return;}
  setSyncState('loading','同步中…');
  try{
    const res=await fetch(url); if(!res.ok)throw new Error(`HTTP ${res.status}`);
    const data=await res.json(); if(data.status!=='ok')throw new Error('脚本错误');
    let added=0,moved=0,inboxAdded=0;
    Object.values(data.sheets||{}).forEach(rows=>{
      rows.forEach((cols,idx)=>{
        if(idx===0||!cols||cols.length<5)return;
        const url2=String(cols[0]||'').trim(),tag=String(cols[3]||'').trim(),name=String(cols[4]||'').trim(); if(!name)return;
        const isSubmit=tag.includes('投稿するぞ'),isAttend=tag.includes('行くぞ');
        const isMaybeSubmit=tag.includes('投稿か？'),isMaybeAttend=tag.includes('行く？');
        const confType=isSubmit?'submit':isAttend?'attend':null;
        const deadline=String(cols[2]||cols[1]||'').trim(),dates=String(cols[5]||'').trim(),loc=String(cols[6]||'').trim();
        const existing=DB.confs.find(c=>c.name===name||(url2&&url2.length>5&&c.url===url2));
        if(existing){if(confType&&DB.inbox.some(ic=>ic.name===name||(url2&&ic.url===url2))){DB.inbox=DB.inbox.filter(ic=>ic.name!==name&&ic.url!==url2);existing.type=confType;moved++;}return;}
        const inInbox=DB.inbox.some(ic=>ic.name===name||(url2&&url2.length>5&&ic.url===url2));
        if(inInbox){if(confType){DB.inbox=DB.inbox.filter(ic=>ic.name!==name&&ic.url!==url2);DB.confs.push({id:nid(),name,type:confType,deadline,dates,loc,visa:'待确认',url:url2,fromSheet:true,tasks:[]});moved++;}return;}
        const conf={id:nid(),name,type:confType||'attend',deadline,dates,loc,visa:'待确认',url:url2,fromSheet:true,tasks:[]};
        if(confType){DB.confs.push(conf);added++;}else if(isMaybeSubmit||isMaybeAttend){DB.inbox.push({...conf,relevance:`Sheet标签: ${tag}`});inboxAdded++;}
      });
    });
    if(added>0||moved>0)renderConfs(); if(inboxAdded>0||moved>0)renderInbox();
    setSyncState('ok',`同步完成 · 新增${added}件 · 移动${moved}件 · ${new Date().toLocaleTimeString('zh-CN')}`); saveDB();
  }catch(e){setSyncState('err',`同步失败: ${e.message}`);}
}
function setSyncState(st,txt){const d=document.getElementById('sdot'),t=document.getElementById('sync-txt');if(d)d.className='sdot '+st;if(t)t.textContent=txt;}
async function writeToSheet(row){const url=DB.settings.gasUrl;if(!url)return;try{await fetch(url,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain'},body:JSON.stringify({action:'append',sheet:'Sheet1',row})});}catch(e){}}

// ============================================================
// AI SEARCH
// ============================================================
async function runSearch(){
  const apiKey=DB.settings.apiKey,ic=document.getElementById('search-ic');
  ic.innerHTML='<span style="animation:spin .8s linear infinite;display:inline-block">⟳</span>';
  try{
    const headers={'Content-Type':'application/json'}; if(apiKey)headers['Authorization']=`Bearer ${apiKey}`;
    const res=await fetch('https://api.openai.com/v1/chat/completions',{method:'POST',headers,body:JSON.stringify({model:'gpt-4o-mini',max_tokens:1500,messages:[{role:'system',content:'Find 5 academic conferences for social informatics/HCI/AI ethics researcher 2026-2027. Return ONLY JSON array: [{name,deadline,dates,location,url,relevance}]'},{role:'user',content:'JSON only.'}]})});
    const data=await res.json(); if(data.error){alert('API错误: '+data.error.message);return;}
    const txt=data.choices?.[0]?.message?.content||'[]';
    try{const cs=JSON.parse(txt.replace(/```[\w]*\n?/g,'').trim());DB.inbox.push(...cs.map(c=>({...c,fromSheet:false})).slice(0,5));}
    catch{DB.inbox.push({name:'搜索完成',deadline:'?',dates:'?',location:'?',url:'',relevance:txt.slice(0,120),fromSheet:false});}
    renderInbox(); showPage('inbox');
    const badge=document.getElementById('bd-inbox'); if(badge){badge.textContent=DB.inbox.length;badge.style.display='inline';}
  }catch(e){alert('搜索失败: '+e.message);}
  ic.innerHTML='🔍';
}

// ============================================================
// TASK MODAL
// ============================================================
let tQuad='',tList='',dmMode='fuzzy',doonM='w',selMood=2,selWeek=null,selImp=1;

function openTM(quad, list){
  tQuad=quad||''; tList=list||''; selMood=2; selWeek=null; doonM='w'; dmMode='fuzzy'; selImp=1;
  document.getElementById('t-name').value=''; document.getElementById('t-note').value='';
  document.getElementById('t-dl').value=''; document.getElementById('t-doon').value='';
  document.getElementById('t-quad').value=quad||''; document.getElementById('t-list').value=list||'';
  switchDM('fuzzy'); switchDoon('w'); buildMoods(); buildWeeks();
  setupRoutineToggle();
  document.querySelectorAll('[data-imp]').forEach(el=>el.classList.toggle('sel',+el.dataset.imp===selImp));
  const names={study:'学习',invest:'投资・副业',misc:'杂事'};
  const qnames={uu:'重要×紧急',ui:'重要×不紧急',iu:'紧急×不重要',ii:'不重要×不紧急'};
  let title='添加任务';
  if(quad)title=`添加任务 → ${qnames[quad]||quad}`;
  else if(list)title=`添加${names[list]||list}任务`;
  document.getElementById('m-task-title').textContent=title;
  openM('m-task');
}

function saveTask(){
  const name=document.getElementById('t-name').value.trim(); if(!name)return;
  // ROUTINE MODE: add to routines instead
  if(routineMode){
    let label=name;
    if(routineFreq==='weekly'&&routineDays.length){
      const dn=['一','二','三','四','五','六','日'];
      label=name+'（周'+routineDays.map(d=>dn[d]).join('・周')+'）';
      DB.routines.push({id:nid(),label,done:false,weekDays:routineDays.slice()});
    }else{
      DB.routines.push({id:nid(),label,done:false,daily:true});
    }
    closeM('m-task'); renderRoutines(); saveDB();
    if(!routOpen)toggleRout();
    return;
  }
  const t={id:nid(),label:name,imp:selImp,done:false,doneDate:null,subs:[],note:document.getElementById('t-note').value||''};
  if(dmMode==='dl'){const v=document.getElementById('t-dl').value;if(v)t.deadline=v;}
  else if(dmMode==='doon'){if(doonM==='w'&&selWeek)t.doonWeek=selWeek;else{const v=document.getElementById('t-doon').value;if(v)t.doon=v;}}
  else t.fuzzy=selMood;
  const quad=document.getElementById('t-quad').value, list=document.getElementById('t-list').value;
  if(list && list.startsWith('conf-')){
    const cid=+list.split('-')[1]; const c=DB.confs.find(x=>x.id===cid);
    if(c){c.tasks.push(t); closeM('m-task'); renderTasks('cl-'+cid,c.tasks,'conf',cid); updConfStats(cid); renderQuad(); saveDB();}
    return;
  }
  if(list && list.startsWith('paper-')){
    const pid=+list.split('-')[1]; const p=DB.papers.find(x=>x.id===pid);
    if(p){p.tasks.push(t); closeM('m-task'); renderPapers(); renderQuad(); saveDB();}
    return;
  }
  if(list && list.startsWith('navtab-')){
    const nid2=list.split('navtab-')[1];
    if(!DB.navTabTasks[nid2])DB.navTabTasks[nid2]=[];
    DB.navTabTasks[nid2].push(t); closeM('m-task'); renderTasks('navtab-list-'+nid2,DB.navTabTasks[nid2],'navtab',nid2); renderQuad(); saveDB();
    return;
  }
  if(list && list.startsWith('day-')){
    // from week/month view: list = day-YYYY-MM-DD
    const dstr=list.slice(4); t.doon=dstr.replace(/-/g,'/');
    DB.tasks.misc.push(t); closeM('m-task'); renderQuad(); saveDB();
    if(document.getElementById('page-week').classList.contains('active'))fetchCal().then(renderWeek);
    if(document.getElementById('page-month').classList.contains('active'))fetchCal().then(renderMonth);
    return;
  }
  if(quad)DB.qov[t.id]=quad;
  if(list && DB.tasks[list]){DB.tasks[list].push(t);}
  else DB.tasks.misc.push(t);
  closeM('m-task'); renderQuad(); if(list&&DB.tasks[list])renderSimple(list); saveDB();
}

function switchDM(m){dmMode=m;document.querySelectorAll('[data-dm]').forEach(el=>el.classList.toggle('sel',el.dataset.dm===m));['fuzzy','doon','dl'].forEach(x=>{const p=document.getElementById('dm-'+x);if(p)p.classList.toggle('sel',x===m);});}
function switchDoon(m){doonM=m;document.querySelectorAll('[data-doon]').forEach(el=>el.classList.toggle('sel',el.dataset.doon===m));document.getElementById('doon-w').style.display=m==='w'?'block':'none';document.getElementById('doon-d').style.display=m==='d'?'block':'none';}
function buildMoods(){const g=document.getElementById('mood-grid');if(!g)return;g.innerHTML='';MOODS.forEach((m,i)=>{const c=document.createElement('div');c.className='mood-c'+(i===selMood?` s${i}`:'');c.innerHTML=`<div style="font-size:18px;margin-bottom:3px">${m.em}</div><div style="font-size:10px;color:var(--tx2)">${m.l}</div>`;c.dataset.mi=i;g.appendChild(c);});const mh=document.getElementById('mood-hint');if(mh)mh.textContent=MOODS[selMood].hint;}
function buildWeeks(){const c=document.getElementById('week-pills');if(!c)return;c.innerHTML='';getWeeks().forEach(w=>{const p=document.createElement('div');p.className='wpill'+(selWeek===w.key?' sel':'');p.innerHTML=`<span>${w.label}</span><span class="wpill-r">${w.range}</span>`;p.dataset.wkey=w.key;c.appendChild(p);});}

// ============================================================
// TAG POPUP
// ============================================================
let tpState={};
function openTagEdit(e,tid,ctx,cid){
  e.stopPropagation(); tpState={tid,ctx,cid};
  const t=fl(ctx,cid).find(x=>x.id===+tid); if(!t)return;
  const popup=document.getElementById('tag-popup'); popup.style.display='block';
  popup.style.left=Math.min(e.clientX-100,window.innerWidth-290)+'px'; popup.style.top=(e.clientY+8)+'px';
  const curDM=t.deadline?'dl':(t.doon||t.doonWeek)?'doon':'fuzzy',curMood=t.fuzzy??2;
  popup.innerHTML=`<div style="font-size:12px;font-weight:600;color:var(--tx2);margin-bottom:10px">修改日期</div>
    <div class="mode-tabs" style="margin-bottom:10px"><div class="mode-tab ${curDM==='fuzzy'?'sel':''}" data-tpdm="fuzzy">模糊</div><div class="mode-tab ${curDM==='doon'?'sel':''}" data-tpdm="doon">📅 计划日</div><div class="mode-tab ${curDM==='dl'?'sel':''}" data-tpdm="dl">🚩 截止日</div></div>
    <div id="tp-fuzzy" style="display:${curDM==='fuzzy'?'block':'none'}"><div class="chips" style="flex-wrap:wrap;gap:5px">${MOODS.map((m,i)=>`<div class="chip ${i===curMood?'sel':''}" data-tpmood="${i}">${m.em}${m.l}</div>`).join('')}</div></div>
    <div id="tp-doon" style="display:${curDM==='doon'?'block':'none'}"><input type="date" id="tp-doon-inp" value="${t.doon||''}" style="width:100%;padding:7px;border:0.5px solid var(--bd);border-radius:6px;font-size:13px"></div>
    <div id="tp-dl" style="display:${curDM==='dl'?'block':'none'}"><input type="date" id="tp-dl-inp" value="${t.deadline||''}" style="width:100%;padding:7px;border:0.5px solid var(--bd);border-radius:6px;font-size:13px"></div>
    <div style="display:flex;justify-content:flex-end;gap:6px;margin-top:12px"><button class="btn" id="tp-cancel">取消</button><button class="btn btn-p" id="tp-save">保存</button></div>`;
  document.getElementById('tp-cancel').onclick=()=>popup.style.display='none';
  document.getElementById('tp-save').onclick=()=>{
    const activeDM=popup.querySelector('.mode-tab.sel')?.dataset.tpdm||'fuzzy';
    const t2=fl(tpState.ctx,tpState.cid).find(x=>x.id===+tpState.tid); if(!t2){popup.style.display='none';return;}
    delete t2.deadline;delete t2.doon;delete t2.doonWeek;delete t2.fuzzy;
    if(activeDM==='fuzzy'){const sel=popup.querySelector('[data-tpmood].sel');t2.fuzzy=sel?+sel.dataset.tpmood:2;}
    else if(activeDM==='doon'){const v=document.getElementById('tp-doon-inp')?.value;if(v)t2.doon=v;}
    else{const v=document.getElementById('tp-dl-inp')?.value;if(v)t2.deadline=v;}
    popup.style.display='none';
    renderTasks(lel(tpState.ctx,tpState.cid),fl(tpState.ctx,tpState.cid),tpState.ctx,tpState.cid);
    renderQuad(); saveDB();
  };
}

// ============================================================
// INLINE EDIT
// ============================================================
function makeEditable(el,onSave){
  el.contentEditable='true'; el.focus();
  try{const r=document.createRange();r.selectNodeContents(el);const s=window.getSelection();s.removeAllRanges();s.addRange(r);}catch(e){}
  function save(){el.contentEditable='false';el.removeEventListener('blur',save);el.removeEventListener('keydown',kh);onSave(el.textContent.trim());}
  function kh(e){if(e.key==='Enter'){e.preventDefault();el.blur();}if(e.key==='Escape'){el.contentEditable='false';el.removeEventListener('blur',save);el.removeEventListener('keydown',kh);}}
  el.addEventListener('blur',save,{once:true}); el.addEventListener('keydown',kh);
}

// ============================================================
// CONFETTI
// ============================================================
function confetti(){const root=document.getElementById('croot');const cols=['#e24b4a','#0f7b6c','#378add','#d9730d','#6940a5'];for(let i=0;i<60;i++){const p=document.createElement('div');const sz=Math.random()*10+5;p.style.cssText=`position:absolute;width:${sz}px;height:${sz}px;background:${cols[~~(Math.random()*cols.length)]};left:${Math.random()*100}%;top:-20px;border-radius:${Math.random()>.5?'50%':'3px'};animation:fall ${Math.random()*1.5+1}s ease-in ${Math.random()*.8}s forwards;`;root.appendChild(p);setTimeout(()=>p.remove(),3500);}}

// ============================================================
// EXPORT / IMPORT
// ============================================================
function exportDB(){const blob=new Blob([JSON.stringify(DB,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`lifeOS-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(url);}
document.getElementById('import-file').addEventListener('change',e=>{const file=e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=ev=>{try{const s=JSON.parse(ev.target.result);if(s.archive&&!s.archive.projects)s.archive={projects:[],tasks:s.archive||[]};Object.assign(DB,s);saveDB();location.reload();}catch(err){alert('导入失败: '+err.message);}};reader.readAsText(file);});

// ============================================================
// PAGE NAVIGATION
// ============================================================
function showPage(name){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.ni').forEach(n=>n.classList.remove('active'));
  const pg=document.getElementById('page-'+name); if(pg)pg.classList.add('active');
  const ni=document.querySelector(`.ni[data-page="${name}"]`); if(ni)ni.classList.add('active');
  if(name==='week')  fetchCal().then(renderWeek);
  else if(name==='month') fetchCal().then(renderMonth);
  else if(name==='dream') renderDream();
  else if(name==='today'){
    const now=new Date(),sub=document.getElementById('today-sub');
    if(sub)sub.textContent=`${now.getFullYear()}年${now.getMonth()+1}月${now.getDate()}日`;
    fetchCal().then(()=>{renderTodayCal();});
    renderQuad(); renderRoutines(); renderCustSecs();
  }
}
function openM(id){const el=document.getElementById(id);if(el)el.classList.add('open');}
function closeM(id){const el=document.getElementById(id);if(el)el.classList.remove('open');}

// ============================================================
// GLOBAL EVENTS
// ============================================================
document.addEventListener('click',e=>{
  const t=e.target;
  const ni=t.closest('.ni[data-page]'); if(ni){showPage(ni.dataset.page);return;}
  const mo=t.closest('[data-open]'); if(mo){if(mo.dataset.open==='m-note')renderNoteTagChips();openM(mo.dataset.open);return;}
  const mc=t.closest('[data-close]'); if(mc){closeM(mc.dataset.close);return;}
  if(t.classList.contains('modal-overlay')){closeM(t.id);return;}
  if(t.closest('#btn-sync')){syncSheet();return;}
  if(t.closest('#btn-search')){runSearch();return;}
  if(t.closest('#btn-save-task')){saveTask();return;}
  if(t.closest('#btn-save-report')){const txt=document.getElementById('report-txt')?.value.trim();if(!txt)return;DB.notes.unshift({id:nid(),title:`日报 ${new Date().toLocaleDateString('zh-CN')}`,body:txt,tag:'日记',date:new Date().toLocaleDateString('zh-CN')});document.getElementById('report-txt').value='';renderNotes();saveDB();alert('已保存为笔记');return;}
  if(t.closest('#btn-save-gas')){const url=document.getElementById('gas-url-input').value.trim();if(!url)return;DB.settings.gasUrl=url;saveDB();const r=document.getElementById('gas-test-result');if(r)r.textContent='测试中…';fetch(url).then(res=>res.json()).then(data=>{const sheets=Object.keys(data.sheets||{});const rows=sheets.reduce((a,s)=>a+(data.sheets[s]?.length||0),0);if(r)r.textContent=`✅ 连接成功！工作表: ${sheets.join(', ')} (共${rows}行)`;}).catch(err=>{if(r)r.textContent=`❌ 连接失败: ${err.message}`;});return;}
  if(t.closest('#btn-save-ics')){DB.settings.icsUrl=document.getElementById('ics-url-input').value.trim()||DEFAULT_ICS;saveDB();alert('已保存');return;}
  if(t.closest('#btn-save-gemini')){DB.settings.geminiKey=document.getElementById('gemini-key-input').value.trim();DB.settings.reportTime=document.getElementById('report-time-input').value||'20:00';saveDB();alert('已保存');return;}
  if(t.closest('#btn-save-settings')){DB.settings.urgentDays=+document.getElementById('set-urgent').value||7;saveDB();renderQuad();alert('设置已保存');return;}
  if(t.closest('#btn-export')){exportDB();return;}
  if(t.closest('#btn-reset-data')){
    if(!confirm('确定要重置所有数据吗？这会清除你所有的任务、笔记、设置。建议先导出备份。'))return;
    localStorage.removeItem(LS_KEY);
    location.reload();
    return;
  }
  if(t.closest('#btn-add-cat')){openM('m-cat');return;}

  // Save conf
  if(t.closest('#btn-save-conf')){
    const type=document.querySelector('[data-ct].sel')?.dataset.ct||'submit';
    const c={id:nid(),name:document.getElementById('ac-n').value||'新学会',type,deadline:document.getElementById('ac-d').value||'',earlyDeadline:document.getElementById('ac-ed').value||'',dates:document.getElementById('ac-dt').value||'',loc:document.getElementById('ac-l').value||'',visa:document.getElementById('ac-v').value||'',url:document.getElementById('ac-u').value||'',tasks:[]};
    DB.confs.push(c);writeToSheet([c.url,c.deadline,c.deadline,type==='submit'?'投稿するぞ':'行くぞ',c.name,c.dates,c.loc]);
    closeM('m-conf');['ac-n','ac-d','ac-ed','ac-dt','ac-l','ac-v','ac-u'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
    renderConfs();saveDB();return;
  }

  // Delete conf
  const delConf=t.closest('[data-action="del-conf"]');
  if(delConf){if(!confirm('确定删除这个学会？'))return;DB.confs=DB.confs.filter(c=>c.id!==+delConf.dataset.cid);renderConfs();renderQuad();saveDB();return;}

  // Save paper
  if(t.closest('#btn-save-paper')){
    const p={id:nid(),title:document.getElementById('ap-t').value.trim()||'新论文',venue:document.getElementById('ap-v').value.trim()||'',deadline:document.getElementById('ap-d').value.trim()||'',collab:document.getElementById('ap-c').value.trim()||'独立',tasks:[]};
    DB.papers.push(p);closeM('m-paper');['ap-t','ap-v','ap-d','ap-c'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
    renderPapers();saveDB();return;
  }

  // Delete paper
  const delPaper=t.closest('[data-action="del-paper"]');
  if(delPaper){if(!confirm('确定删除这篇论文？'))return;DB.papers=DB.papers.filter(p=>p.id!==+delPaper.dataset.pid);renderPapers();renderQuad();saveDB();return;}

  // Save note
  if(t.closest('#btn-save-note')){const b=document.getElementById('an-b').value;if(!b)return;const tag=document.querySelector('[data-nt].sel')?.dataset.nt||'其他';DB.notes.unshift({id:nid(),title:document.getElementById('an-t').value||'无标题',body:b,tag,date:new Date().toLocaleDateString('zh-CN')});closeM('m-note');document.getElementById('an-t').value='';document.getElementById('an-b').value='';renderNotes();saveDB();return;}
  if(t.closest('#btn-save-rout')){const l=document.getElementById('rout-name').value.trim();if(!l)return;DB.routines.push({id:nid(),label:l,done:false});closeM('m-rout');document.getElementById('rout-name').value='';renderRoutines();saveDB();return;}
  if(t.closest('#btn-save-cat')){const name=document.getElementById('cat-name').value.trim(),icon=document.getElementById('cat-icon').value.trim()||'📌';if(!name)return;const id=nid();DB.customCats.push({id,name,icon});DB.customTasks[id]=[];closeM('m-cat');document.getElementById('cat-name').value='';document.getElementById('cat-icon').value='';renderCustSecs();saveDB();return;}

  // Checkbox (with doneDate tracking)
  const chk=t.closest('.chk[data-action="chk"]');
  if(chk){
    const {ctx,cid,tid}=chk.dataset,l=fl(ctx,cid),task=l.find(x=>x.id===+tid);if(!task)return;
    task.done=!task.done;
    task.doneDate=task.done?TODAY_STR:null;
    renderTasks(lel(ctx,cid),l,ctx,cid);
    if(ctx==='conf')updConfStats(+cid);if(ctx==='paper')updPaperStats(+cid);
    if(task.done&&(ctx==='conf'||ctx==='paper'))setTimeout(()=>checkProjComplete(ctx,cid),300);
    renderQuad();saveDB();return;
  }

  const schk=t.closest('[data-action="schk"]');if(schk){const {ctx,cid,tid,sid}=schk.dataset,task=fl(ctx,cid).find(x=>x.id===+tid),sub=task?.subs.find(x=>x.id===+sid);if(sub){sub.done=!sub.done;renderTasks(lel(ctx,cid),fl(ctx,cid),ctx,cid);saveDB();}return;}
  const rchk=t.closest('[data-action="rchk"]');if(rchk){const i=+rchk.dataset.i;DB.routines[i].done=!DB.routines[i].done;renderRoutines();saveDB();return;}
  const delRout=t.closest('[data-action="del-rout"]');if(delRout){DB.routines.splice(+delRout.dataset.i,1);renderRoutines();saveDB();return;}
  const delCat=t.closest('[data-action="del-cat"]');if(delCat){const i=+delCat.dataset.i,cat=DB.customCats[i];if(cat)delete DB.customTasks[cat.id];DB.customCats.splice(i,1);renderCustSecs();saveDB();return;}

  // Archive task
  const archT=t.closest('[data-action="arch-task"]');
  if(archT){
    const {ctx,cid,tid}=archT.dataset,l=fl(ctx,cid),i=l.findIndex(x=>x.id===+tid);if(i<0)return;
    const task=l.splice(i,1)[0];
    const srcMap={study:'学习',invest:'投资',misc:'杂事'};
    const src=ctx==='conf'?DB.confs.find(c=>c.id==cid)?.name:ctx==='paper'?DB.papers.find(p=>p.id==cid)?.title:ctx==='custom'?DB.customCats.find(c=>c.id==cid)?.name:srcMap[ctx]||ctx;
    DB.archive.tasks.unshift({label:task.label,src:src||'',date:new Date().toLocaleDateString('zh-CN')});
    renderTasks(lel(ctx,cid),l,ctx,cid);if(ctx==='conf')updConfStats(+cid);if(ctx==='paper')updPaperStats(+cid);
    renderArchive();renderQuad();saveDB();return;
  }

  const archP=t.closest('[data-action="arch-proj"]');if(archP){checkProjComplete(archP.dataset.ctx,archP.dataset.cid);return;}
  const unarcP=t.closest('[data-action="unarc-proj"]');if(unarcP){const i=+unarcP.dataset.i,proj=DB.archive.projects.splice(i,1)[0];if(proj.type==='paper'){DB.papers.push({id:nid(),title:proj.name,venue:proj.venue||'',deadline:proj.deadline||'',collab:proj.collab||'独立',tasks:[]});renderPapers();}else{DB.confs.push({id:nid(),name:proj.name,type:'submit',deadline:proj.deadline||'',dates:proj.dates||'',loc:proj.loc||'',visa:'',url:proj.url||'',tasks:[]});renderConfs();}renderArchive();saveDB();return;}
  const unarcT=t.closest('[data-action="unarc-task"]');if(unarcT){const i=+unarcT.dataset.i,a=DB.archive.tasks.splice(i,1)[0];DB.tasks.misc.push({id:nid(),label:a.label,imp:0,fuzzy:2,done:false,doneDate:null,subs:[]});renderArchive();renderSimple('misc');renderQuad();return;}

  const exp=t.closest('[data-action="exp"]');if(exp){const {ctx,cid,tid}=exp.dataset,sw=document.getElementById(`sw-${ctx}-${cid}-${tid}`);if(sw){const o=sw.style.display==='none';sw.style.display=o?'block':'none';exp.textContent=o?'▾':'▸';}return;}
  const addSub=t.closest('[data-action="addsub"]');if(addSub){const {ctx,cid,tid}=addSub.dataset,l=prompt('子任务名称：');if(!l)return;fl(ctx,cid).find(x=>x.id===+tid)?.subs.push({id:nid(),label:l,done:false});renderTasks(lel(ctx,cid),fl(ctx,cid),ctx,cid);saveDB();return;}
  const delSub=t.closest('[data-action="delsub"]');if(delSub){const {ctx,cid,tid,sid}=delSub.dataset,task=fl(ctx,cid).find(x=>x.id===+tid);if(task){task.subs=task.subs.filter(x=>x.id!==+sid);renderTasks(lel(ctx,cid),fl(ctx,cid),ctx,cid);saveDB();}return;}

  const addTaskList=t.closest('[data-action="addtask-list"]');
  if(addTaskList){
    const {ctx,cid}=addTaskList.dataset;
    if(ctx==='conf'){const c=DB.confs.find(x=>x.id===+cid);if(c){tQuad='';tList='';document.getElementById('t-name').value='';document.getElementById('t-note').value='';document.getElementById('t-dl').value='';document.getElementById('t-doon').value='';document.getElementById('t-quad').value='';document.getElementById('t-list').value='conf-'+cid;switchDM('fuzzy');switchDoon('w');buildMoods();buildWeeks();selImp=1;document.querySelectorAll('[data-imp]').forEach(el=>el.classList.toggle('sel',+el.dataset.imp===1));document.getElementById('m-task-title').textContent=`添加学会任务 · ${c.name}`;openM('m-task');}}
    else if(ctx==='paper'){const p=DB.papers.find(x=>x.id===+cid);if(p){tQuad='';tList='paper-'+cid;document.getElementById('t-name').value='';document.getElementById('t-note').value='';document.getElementById('t-dl').value='';document.getElementById('t-doon').value='';document.getElementById('t-quad').value='';document.getElementById('t-list').value='paper-'+cid;switchDM('fuzzy');switchDoon('w');buildMoods();buildWeeks();selImp=1;document.querySelectorAll('[data-imp]').forEach(el=>el.classList.toggle('sel',+el.dataset.imp===1));document.getElementById('m-task-title').textContent=`添加论文任务 · ${p.title.slice(0,20)}`;openM('m-task');}}
    else openTM(null,ctx==='custom'?null:ctx);
    return;
  }

  const confH=t.closest('.conf-h[data-cid]');if(confH&&!t.closest('[data-action]')&&!t.closest('.chk')){const id=+confH.dataset.cid,cb=document.getElementById('cb-'+id),ic=document.getElementById('cce-'+id);if(cb){const o=cb.classList.toggle('hidden')===false;if(ic)ic.textContent=o?'▾':'▸';if(o)renderTasks('cl-'+id,DB.confs.find(c=>c.id===id)?.tasks||[],'conf',id);}return;}
  const ef=t.closest('[data-action="editfield"]');if(ef){makeEditable(ef,v=>{const c=DB.confs.find(x=>x.id===+ef.dataset.cid);if(c){c[ef.dataset.field]=v;saveDB();}});return;}
  const ecn=t.closest('[data-action="editcname"]');if(ecn&&!ecn.isContentEditable){makeEditable(ecn,v=>{const c=DB.confs.find(x=>x.id===+ecn.dataset.id);if(c){c.name=v||c.name;saveDB();}});return;}

  const dtg=t.closest('.dtag[data-action="dtag"]');if(dtg){openTagEdit(e,+dtg.dataset.tid,dtg.dataset.ctx,dtg.dataset.cid);return;}
  const tpTab=t.closest('[data-tpdm]');if(tpTab){const m=tpTab.dataset.tpdm;document.querySelectorAll('[data-tpdm]').forEach(el=>el.classList.toggle('sel',el.dataset.tpdm===m));['fuzzy','doon','dl'].forEach(x=>{const p=document.getElementById('tp-'+x);if(p)p.style.display=x===m?'block':'none';});return;}
  const tpMood=t.closest('[data-tpmood]');if(tpMood){document.getElementById('tag-popup').querySelectorAll('[data-tpmood]').forEach(el=>el.classList.remove('sel'));tpMood.classList.add('sel');return;}

  const inboxOk=t.closest('[data-action="inbox-ok"]');if(inboxOk){const i=+inboxOk.dataset.i,type=inboxOk.dataset.it,c=DB.inbox[i];const conf={id:nid(),name:c.name,type,deadline:c.deadline||'',dates:c.dates||'',loc:c.location||c.loc||'',visa:'',url:c.url||'',tasks:[]};DB.confs.push(conf);DB.inbox.splice(i,1);renderInbox();renderConfs();if(!c.fromSheet)writeToSheet([conf.url,conf.deadline,conf.deadline,type==='submit'?'投稿するぞ':'行くぞ',conf.name,conf.dates,conf.loc]);saveDB();return;}
  const inboxSkip=t.closest('[data-action="inbox-skip"]');if(inboxSkip){DB.inbox.splice(+inboxSkip.dataset.i,1);renderInbox();saveDB();return;}

  const vnote=t.closest('[data-action="viewnote"]');if(vnote){openNoteView(+vnote.dataset.nid);return;}

  const catH=t.closest('.cust-hd[data-catid]');if(catH){const id=catH.dataset.catid,body=document.getElementById('catbd-'+id),ic=document.getElementById('catic-'+id);if(body){const o=body.classList.toggle('hidden')===false;if(ic)ic.style.transform=o?'rotate(180deg)':'';}return;}

  const mc2=t.closest('.mood-c[data-mi]');if(mc2&&t.closest('#m-task')){selMood=+mc2.dataset.mi;buildMoods();return;}
  const wp=t.closest('.wpill[data-wkey]');if(wp){selWeek=wp.dataset.wkey;buildWeeks();return;}
  const dmTab=t.closest('[data-dm]');if(dmTab&&t.closest('#m-task')){switchDM(dmTab.dataset.dm);return;}
  const doonTab=t.closest('[data-doon]');if(doonTab){switchDoon(doonTab.dataset.doon);return;}
  const impBtn=t.closest('[data-imp]');if(impBtn&&t.closest('#m-task')){selImp=+impBtn.dataset.imp;document.querySelectorAll('[data-imp]').forEach(el=>el.classList.toggle('sel',+el.dataset.imp===selImp));return;}
  const ctChip=t.closest('[data-ct]');if(ctChip){document.querySelectorAll('[data-ct]').forEach(el=>el.classList.toggle('sel',el===ctChip));return;}
  const ntChip=t.closest('[data-nt]');if(ntChip){document.querySelectorAll('[data-nt]').forEach(el=>el.classList.toggle('sel',el===ntChip));return;}

  // ===== 项目分类 重命名/删除 =====
  const niEdit=t.closest('.ni-edit[data-cat]');
  if(niEdit){
    e.stopPropagation();
    const cat=niEdit.dataset.cat;
    const curName=DB.catNames[cat]||cat;
    const action=prompt(`「${curName}」\n\n输入新名称重命名，输入 DELETE 删除（删除后任务不会丢失），或取消`, curName);
    if(action===null)return;
    if(action.trim().toUpperCase()==='DELETE'){
      if(!confirm(`确定删除「${curName}」分类？任务会移到杂事。`))return;
      // Move tasks to misc
      (DB.tasks[cat]||[]).forEach(t=>DB.tasks.misc.push(t));
      DB.tasks[cat]=[];
      // Remove from sidebar
      const ni=document.querySelector(`.ni[data-cat="${cat}"]`);
      if(ni)ni.style.display='none';
      renderSimple('misc'); renderQuad(); saveDB();
    } else if(action.trim()){
      DB.catNames[cat]=action.trim();
      // Update sidebar label
      const lbl=document.querySelector(`.ni[data-cat="${cat}"] .ni-label`);
      if(lbl)lbl.textContent=action.trim();
      // Update page header
      const ph=document.querySelector(`#page-${cat} .pt`);
      if(ph)ph.textContent=action.trim();
      saveDB();
    }
    return;
  }
  // AI plan
  if(t.closest('#btn-ai-plan')){aiPlan();return;}
  // Routine toggle
  if(t.closest('#rout-toggle')){routineMode=!routineMode;document.getElementById('rout-toggle').classList.toggle('on',routineMode);document.getElementById('rout-opts').style.display=routineMode?'block':'none';if(routineMode&&routineFreq==='weekly'&&!routineDays.length)reassignDays();return;}
  const freqBtn=t.closest('[data-freq]');if(freqBtn){routineFreq=freqBtn.dataset.freq;document.querySelectorAll('[data-freq]').forEach(el=>el.classList.toggle('sel',el===freqBtn));const rwEl=document.getElementById('rout-weekly');if(rwEl)rwEl.style.display=routineFreq==='weekly'?'block':'none';if(routineFreq==='weekly'&&!routineDays.length)reassignDays();return;}
  if(t.closest('#btn-reassign-days')){reassignDays();return;}
  const rday=t.closest('.rday[data-day]');if(rday){const d=+rday.dataset.day;if(routineDays.includes(d))routineDays=routineDays.filter(x=>x!==d);else routineDays.push(d);routineDays.sort((a,b)=>a-b);buildRoutDayPills();return;}
  // Add nav tab
  if(t.closest('#btn-add-nav')){openM('m-navtab');return;}
  if(t.closest('#btn-save-navtab')){const name=document.getElementById('navtab-name').value.trim();const icon=document.getElementById('navtab-icon').value.trim()||'⭐';if(!name)return;const id=nid();DB.customNavTabs.push({id,name,icon});DB.navTabTasks[id]=[];closeM('m-navtab');document.getElementById('navtab-name').value='';document.getElementById('navtab-icon').value='';renderCustomNavTabs();saveDB();return;}
  const delNavTab=t.closest('[data-action="del-navtab"]');if(delNavTab){if(!confirm('确定删除这个栏目？里面的任务也会删除'))return;const id=delNavTab.dataset.id;DB.customNavTabs=DB.customNavTabs.filter(tb=>String(tb.id)!==String(id));delete DB.navTabTasks[id];const pg=document.getElementById('page-nav-'+id);if(pg)pg.remove();renderCustomNavTabs();showPage('today');saveDB();return;}
  const addNavTask=t.closest('[data-action="add-navtab-task"]');if(addNavTask){const id=addNavTask.dataset.id;openTM(null,null);document.getElementById('t-list').value='navtab-'+id;document.getElementById('m-task-title').textContent='添加任务';return;}
  // Note edit
  if(t.closest('#btn-edit-note')){startEditNote();return;}
  if(t.closest('#btn-save-edit-note')){saveEditNote();return;}
  if(t.closest('#btn-cancel-edit-note')){openNoteView(editingNoteId);return;}
  if(t.closest('#btn-del-note')){if(!confirm('确定删除这条笔记？'))return;DB.notes=DB.notes.filter(n=>n.id!==editingNoteId);renderNotes();saveDB();closeM('m-vnote');return;}
  const vntChip=t.closest('[data-vnt]');if(vntChip){document.querySelectorAll('#vn-edit-tags .chip').forEach(el=>el.classList.toggle('sel',el===vntChip));return;}
  // Note tag add
  if(t.closest('#note-tag-add')){openM('m-notetag');return;}
  if(t.closest('#btn-save-notetag')){const name=document.getElementById('notetag-name').value.trim();if(!name)return;if(!DB.noteTags.includes(name))DB.noteTags.push(name);closeM('m-notetag');document.getElementById('notetag-name').value='';renderNoteTagChips(name);saveDB();return;}
  // Daily report submit
  if(t.closest('#btn-submit-report')){submitReport();return;}
  // Dream: year cat
  if(t.closest('#btn-add-year-cat')){const name=prompt('类别名称（如：学术、生活、财务）：');if(!name)return;DB.dreams.yearCats.push({name,goals:[]});renderDream();saveDB();return;}
  const delYearCat=t.closest('[data-action="del-year-cat"]');if(delYearCat){DB.dreams.yearCats.splice(+delYearCat.dataset.ci,1);renderDream();saveDB();return;}
  const addYearGoal=t.closest('[data-action="add-year-goal"]');if(addYearGoal){const ci=+addYearGoal.dataset.ci;const txt=prompt('目标内容：');if(!txt)return;DB.dreams.yearCats[ci].goals.push({text:txt,done:false});renderDream();saveDB();return;}
  const delYearGoal=t.closest('[data-action="del-year-goal"]');if(delYearGoal){const ci=+delYearGoal.dataset.ci,gi=+delYearGoal.dataset.gi;DB.dreams.yearCats[ci].goals.splice(gi,1);renderDream();saveDB();return;}
  const yearChk=t.closest('[data-action="dream-year-chk"]');if(yearChk){const ci=+yearChk.dataset.ci,gi=+yearChk.dataset.gi;DB.dreams.yearCats[ci].goals[gi].done=!DB.dreams.yearCats[ci].goals[gi].done;renderDream();saveDB();return;}
  // Dream: month goal
  if(t.closest('#btn-add-month-goal')){const txt=prompt('本月目标：');if(!txt)return;DB.dreams.monthGoals.push({text:txt,done:false});renderDream();saveDB();return;}
  const delMonthGoal=t.closest('[data-action="del-month-goal"]');if(delMonthGoal){DB.dreams.monthGoals.splice(+delMonthGoal.dataset.gi,1);renderDream();saveDB();return;}
  const monthChk=t.closest('[data-action="dream-month-chk"]');if(monthChk){const gi=+monthChk.dataset.gi;DB.dreams.monthGoals[gi].done=!DB.dreams.monthGoals[gi].done;renderDream();saveDB();return;}
  // Week/month day add task
  const dayAdd=t.closest('[data-action="day-add"]');if(dayAdd){openTM(null,null);document.getElementById('t-list').value='day-'+dayAdd.dataset.date;document.getElementById('m-task-title').textContent='添加任务（'+dayAdd.dataset.date+'）';return;}

  if(!t.closest('#tag-popup')&&!t.closest('.dtag[data-action="dtag"]'))document.getElementById('tag-popup').style.display='none';
});

document.addEventListener('dblclick',e=>{
  const lbl=e.target.closest('.tl[data-action="editlbl"]');
  if(lbl){e.stopPropagation();const {ctx,cid,tid}=lbl.dataset;makeEditable(lbl,v=>{const task=fl(ctx,cid).find(x=>x.id===+tid);if(task){task.label=v||task.label;renderTasks(lel(ctx,cid),fl(ctx,cid),ctx,cid);renderQuad();saveDB();}});return;}
  const slbl=e.target.closest('.stl[data-action="editslbl"]');
  if(slbl){e.stopPropagation();const {ctx,cid,tid,sid}=slbl.dataset;makeEditable(slbl,v=>{const task=fl(ctx,cid).find(x=>x.id===+tid),sub=task?.subs.find(x=>x.id===+sid);if(sub){sub.label=v||sub.label;renderTasks(lel(ctx,cid),fl(ctx,cid),ctx,cid);saveDB();}});return;}
  // Dream goal text edit
  const yg=e.target.closest('[data-action="edit-year-goal"]');
  if(yg){e.stopPropagation();const ci=+yg.dataset.ci,gi=+yg.dataset.gi;makeEditable(yg,v=>{if(DB.dreams.yearCats[ci]&&DB.dreams.yearCats[ci].goals[gi]){DB.dreams.yearCats[ci].goals[gi].text=v||DB.dreams.yearCats[ci].goals[gi].text;saveDB();}});return;}
  const mgg=e.target.closest('[data-action="edit-month-goal"]');
  if(mgg){e.stopPropagation();const gi=+mgg.dataset.gi;makeEditable(mgg,v=>{if(DB.dreams.monthGoals[gi]){DB.dreams.monthGoals[gi].text=v||DB.dreams.monthGoals[gi].text;saveDB();}});return;}
});

// Dream textareas auto-save on blur
document.addEventListener('blur',e=>{
  if(e.target.id==='dream-life'){DB.dreams.life=e.target.value;saveDB();}
  if(e.target.id==='dream-review'){DB.dreams.review=e.target.value;saveDB();}
},true);

// ============================================================
// NEW FEATURES (batch 2)
// ============================================================

// ---------- Routine toggle in task modal ----------
let routineMode=false, routineFreq='daily', routineDays=[];
function setupRoutineToggle(){
  routineMode=false; routineFreq='daily'; routineDays=[];
  const tog=document.getElementById('rout-toggle');
  const opts=document.getElementById('rout-opts');
  const wkly=document.getElementById('rout-weekly');
  if(tog)tog.classList.remove('on');
  if(opts)opts.style.display='none';
  if(wkly)wkly.style.display='none';
  document.querySelectorAll('[data-freq]').forEach(el=>el.classList.toggle('sel',el.dataset.freq==='daily'));
  buildRoutDayPills();
}
function buildRoutDayPills(){
  const el=document.getElementById('rout-day-pills'); if(!el)return; el.innerHTML='';
  const names=['一','二','三','四','五','六','日'];
  names.forEach((n,i)=>{
    const d=document.createElement('div');
    d.className='rday'+(routineDays.includes(i)?' sel':'');
    d.textContent=n; d.dataset.day=i;
    el.appendChild(d);
  });
}
function reassignDays(){
  const times=Math.min(7,Math.max(1,+document.getElementById('rout-times').value||2));
  const pool=[0,1,2,3,4,5,6];
  for(let i=pool.length-1;i>0;i--){const j=~~(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
  routineDays=pool.slice(0,times).sort((a,b)=>a-b);
  buildRoutDayPills();
}

// ---------- AI Assistant (Gemini) ----------
async function callGemini(prompt){
  const key=DB.settings.geminiKey;
  if(!key){alert('请先在「设置」里填入 Groq API Key（免费申请：console.groq.com）');return null;}
  try{
    const res=await fetch('https://api.groq.com/openai/v1/chat/completions',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+key},
      body:JSON.stringify({model:'llama-3.3-70b-versatile',max_tokens:600,messages:[{role:'system',content:'你是一个温柔贴心的任务管理助手，用中文回复，简洁有温度。'},{role:'user',content:prompt}]})
    });
    const data=await res.json();
    if(data.error)throw new Error(data.error.message);
    return data.choices?.[0]?.message?.content||'（没有返回内容）';
  }catch(e){alert('AI调用失败: '+e.message);return null;}
}

function collectTodayTasks(){
  const out={uu:[],ui:[],iu:[],ii:[]};
  function add(t,ctx,cid,ctxU){if(!isTaskVisible(t)||t.done)return;const q=autoQuad(t,ctxU);out[q].push({label:t.label,tid:t.id,ctx,cid:String(cid)});}
  DB.papers.forEach(p=>{const u=dt(p.deadline);p.tasks.forEach(t=>add(t,'paper',p.id,u));});
  DB.confs.forEach(c=>{const u=c.deadline?dt(c.deadline):999;c.tasks.forEach(t=>add(t,'conf',c.id,u));});
  ['study','invest','misc'].forEach(cat=>(DB.tasks[cat]||[]).forEach(t=>add(t,cat,0,999)));
  return out;
}

async function aiPlan(){
  const userText=document.getElementById('ai-input').value.trim()||'帮我安排今天';
  const ic=document.getElementById('ai-ic'); ic.innerHTML='<span class="ai-loading">⟳</span>';
  const tasks=collectTodayTasks();
  const taskList=[];
  ['uu','ui','iu','ii'].forEach(q=>{const qn={uu:'重要紧急',ui:'重要不紧急',iu:'紧急不重要',ii:'不重要不紧急'}[q];tasks[q].forEach(t=>taskList.push(`[${qn}] ${t.label}`));});
  const prompt=`你是一个温柔贴心的任务管理助手。用户今天的状态：「${userText}」

今天的任务清单：
${taskList.length?taskList.join('\n'):'（今天没有任务）'}

请根据用户的状态，帮TA安排今天该做什么。要求：
1. 用中文，语气温柔鼓励，像朋友一样
2. 如果用户说累/不想做，就只挑1-2个最重要的，其他建议推迟
3. 如果用户想高效，就给一个清晰的优先级顺序
4. 简洁，控制在150字内
5. 最后用一句话鼓励TA`;
  const reply=await callGemini(prompt);
  ic.innerHTML='✨';
  if(reply){
    const rEl=document.getElementById('ai-reply');
    rEl.textContent=reply; rEl.classList.add('show');
    document.getElementById('ai-actions').style.display='none';
  }
}

// ---------- Daily report ----------
function openReportModal(){
  const tasks=collectTodayTasks();
  const doneCount=(()=>{let n=0;const c=ts=>ts.forEach(t=>{if(t.done&&t.doneDate===TODAY_STR)n++;});DB.papers.forEach(p=>c(p.tasks));DB.confs.forEach(cf=>c(cf.tasks));['study','invest','misc'].forEach(cat=>c(DB.tasks[cat]||[]));return n;})();
  const greeting=document.getElementById('report-greeting');
  if(greeting)greeting.textContent=`今天完成了 ${doneCount} 个任务${doneCount>0?'，辛苦啦！':'。'}跟我说说今天过得怎么样吧～`;
  document.getElementById('report-modal-txt').value='';
  const rEl=document.getElementById('report-ai-reply'); if(rEl){rEl.textContent='';rEl.classList.remove('show');}
  openM('m-report');
}

async function submitReport(){
  const txt=document.getElementById('report-modal-txt').value.trim();
  if(!txt){alert('写点什么吧～');return;}
  // Save as note
  DB.notes.unshift({id:nid(),title:`日报 ${new Date().toLocaleDateString('zh-CN')}`,body:txt,tag:'日记',date:new Date().toLocaleDateString('zh-CN')});
  if(!DB.noteTags.includes('日记'))DB.noteTags.push('日记');
  DB.lastReportDate=TODAY_STR;
  renderNotes(); saveDB();
  // AI feedback
  if(DB.settings.geminiKey){
    const rEl=document.getElementById('report-ai-reply'); rEl.textContent='AI正在回复…'; rEl.classList.add('show');
    const reply=await callGemini(`用户今天的工作汇报：「${txt}」。请用中文温柔地回应，肯定TA今天的努力，给一句鼓励，并简短提一句明天可以怎么做。控制在80字内。`);
    if(reply)rEl.textContent=reply;
  }else{
    const rEl=document.getElementById('report-ai-reply'); rEl.textContent='已保存为日报笔记 ✓（设置Gemini后可获得AI回复）'; rEl.classList.add('show');
  }
}

function checkReportReminder(){
  const now=new Date();
  const [h,m]=(DB.settings.reportTime||'20:00').split(':').map(Number);
  const cur=now.getHours()*60+now.getMinutes();
  const target=h*60+m;
  if(cur>=target && DB.lastReportDate!==TODAY_STR){
    openReportModal();
  }
}

// ---------- Note editing ----------
let editingNoteId=null;
function openNoteView(id){
  const n=DB.notes.find(x=>x.id===id); if(!n)return;
  editingNoteId=id;
  document.getElementById('vn-title-text').textContent=n.title||'无标题';
  document.getElementById('vn-m').textContent=`${n.tag} · ${n.date}`;
  document.getElementById('vn-view').textContent=n.body;
  document.getElementById('vn-view').style.display='block';
  document.getElementById('vn-edit').style.display='none';
  openM('m-vnote');
}
function startEditNote(){
  const n=DB.notes.find(x=>x.id===editingNoteId); if(!n)return;
  document.getElementById('vn-view').style.display='none';
  document.getElementById('vn-edit').style.display='block';
  document.getElementById('vn-edit-title').value=n.title||'';
  document.getElementById('vn-edit-body').value=n.body||'';
  const tagsEl=document.getElementById('vn-edit-tags'); tagsEl.innerHTML='';
  DB.noteTags.forEach(tg=>{const c=document.createElement('div');c.className='chip'+(tg===n.tag?' sel':'');c.dataset.vnt=tg;c.textContent=tg;tagsEl.appendChild(c);});
}
function saveEditNote(){
  const n=DB.notes.find(x=>x.id===editingNoteId); if(!n)return;
  n.title=document.getElementById('vn-edit-title').value||'无标题';
  n.body=document.getElementById('vn-edit-body').value;
  const selTag=document.querySelector('#vn-edit-tags .chip.sel');
  if(selTag)n.tag=selTag.dataset.vnt;
  renderNotes(); saveDB(); closeM('m-vnote');
}

// ---------- Note tags rendering ----------
function renderNoteTagChips(selected){
  const el=document.getElementById('note-tag-chips'); if(!el)return; el.innerHTML='';
  DB.noteTags.forEach((tg,i)=>{const c=document.createElement('div');c.className='chip'+((selected?tg===selected:i===DB.noteTags.length-1)?' sel':'');c.dataset.nt=tg;c.textContent=tg;el.appendChild(c);});
  const add=document.createElement('div'); add.className='chip'; add.style.cssText='border-style:dashed;color:var(--tx3)'; add.id='note-tag-add'; add.textContent='＋ 新分类'; el.appendChild(add);
}

// ---------- Custom Nav Tabs ----------
function renderCustomNavTabs(){
  const el=document.getElementById('custom-nav-tabs'); if(!el)return; el.innerHTML='';
  DB.customNavTabs.forEach(tab=>{
    const d=document.createElement('div'); d.className='ni'; d.dataset.page='nav-'+tab.id;
    d.innerHTML=`<span>${esc(tab.icon)}</span>${esc(tab.name)}`;
    el.appendChild(d);
  });
  // ensure pages exist
  const pagesEl=document.getElementById('custom-pages'); if(!pagesEl)return;
  DB.customNavTabs.forEach(tab=>{
    if(!DB.navTabTasks[tab.id])DB.navTabTasks[tab.id]=[];
    if(!document.getElementById('page-nav-'+tab.id)){
      const pg=document.createElement('div'); pg.className='page'; pg.id='page-nav-'+tab.id;
      pg.innerHTML=`<div class="ph"><div class="pt">${esc(tab.icon)} ${esc(tab.name)}</div><div style="display:flex;gap:8px"><button class="btn" data-action="del-navtab" data-id="${tab.id}" style="color:var(--red)">🗑 删除栏目</button><button class="btn btn-p" data-action="add-navtab-task" data-id="${tab.id}">＋ 添加</button></div></div><div id="navtab-list-${tab.id}"></div>`;
      pagesEl.appendChild(pg);
    }
    renderTasks('navtab-list-'+tab.id, DB.navTabTasks[tab.id], 'navtab', tab.id);
  });
}

// ---------- Dream page ----------
function renderDream(){
  const y=TODAY.getFullYear(), m=TODAY.getMonth()+1;
  const yEl=document.getElementById('dream-year'); if(yEl)yEl.textContent=y;
  const mEl=document.getElementById('dream-month'); if(mEl)mEl.textContent=m;
  const lifeEl=document.getElementById('dream-life'); if(lifeEl)lifeEl.value=DB.dreams.life||'';
  const revEl=document.getElementById('dream-review'); if(revEl)revEl.value=DB.dreams.review||'';
  // year cats
  const yc=document.getElementById('dream-year-cats'); if(yc){yc.innerHTML='';
    DB.dreams.yearCats.forEach((cat,ci)=>{
      const box=document.createElement('div'); box.className='dream-cat';
      box.innerHTML=`<div class="dream-cat-label" style="display:flex;align-items:center;gap:6px"><span>${esc(cat.name)}</span><button class="btn-g" data-action="del-year-cat" data-ci="${ci}" style="font-size:11px">✕</button></div>`;
      cat.goals.forEach((g,gi)=>{
        const row=document.createElement('div'); row.className='dream-goal';
        row.innerHTML=`<div class="chk${g.done?' done':''}" data-action="dream-year-chk" data-ci="${ci}" data-gi="${gi}" style="width:14px;height:14px"></div><div class="dream-goal-text${g.done?' done':''}" data-action="edit-year-goal" data-ci="${ci}" data-gi="${gi}">${esc(g.text)}</div><button class="btn-g" data-action="del-year-goal" data-ci="${ci}" data-gi="${gi}">✕</button>`;
        box.appendChild(row);
      });
      const add=document.createElement('div'); add.className='add-tr'; add.style.fontSize='12px'; add.dataset.action='add-year-goal'; add.dataset.ci=ci; add.innerHTML='<i class="ti ti-plus" style="font-size:12px"></i>添加目标';
      box.appendChild(add);
      yc.appendChild(box);
    });
  }
  // month goals
  const mg=document.getElementById('dream-month-goals'); if(mg){mg.innerHTML='';
    DB.dreams.monthGoals.forEach((g,gi)=>{
      const row=document.createElement('div'); row.className='dream-goal';
      row.innerHTML=`<div class="chk${g.done?' done':''}" data-action="dream-month-chk" data-gi="${gi}" style="width:15px;height:15px"></div><div class="dream-goal-text${g.done?' done':''}" data-action="edit-month-goal" data-gi="${gi}">${esc(g.text)}</div><button class="btn-g" data-action="del-month-goal" data-gi="${gi}">✕</button>`;
      mg.appendChild(row);
    });
  }
}

function renderSimple2(){} // placeholder

// ============================================================
// INIT
// ============================================================
function init(){
  loadDB();
  document.getElementById('set-urgent').value=DB.settings.urgentDays;
  if(DB.settings.gasUrl)document.getElementById('gas-url-input').value=DB.settings.gasUrl;
  if(DB.settings.icsUrl)document.getElementById('ics-url-input').value=DB.settings.icsUrl;
  if(DB.settings.geminiKey)document.getElementById('gemini-key-input').value=DB.settings.geminiKey;
  if(DB.settings.reportTime)document.getElementById('report-time-input').value=DB.settings.reportTime;
  document.getElementById('set-streak').textContent=DB.rewards.streak;
  document.getElementById('set-projects').textContent=DB.archive.projects.length;
  renderConfs(); renderPapers();
  renderSimple('study'); renderSimple('invest'); renderSimple('misc');
  renderNotes(); renderArchive(); renderInbox(); renderRoutines(); renderCustSecs();
  renderCustomNavTabs(); renderNoteTagChips();
  // Apply saved category names
  ['study','invest','misc'].forEach(cat=>{
    if(DB.catNames[cat]){
      const lbl=document.querySelector(`.ni[data-cat="${cat}"] .ni-label`);
      if(lbl)lbl.textContent=DB.catNames[cat];
      const ph=document.querySelector(`#page-${cat} .pt`);
      if(ph)ph.textContent=DB.catNames[cat];
    }
  });
  setupQuadDrop();
  showPage('today');
  if(DB.settings.gasUrl)setTimeout(syncSheet,1000);
  // Daily report reminder check (every 5 min)
  setTimeout(checkReportReminder, 3000);
  setInterval(checkReportReminder, 5*60*1000);
}

try {
  init();
} catch(err) {
  // Show error visibly on page instead of silent blank
  document.body.innerHTML = `
    <div style="font-family:monospace;padding:40px;max-width:800px;margin:0 auto">
      <div style="font-size:20px;font-weight:bold;color:#e24b4a;margin-bottom:16px">⚠️ 启动错误</div>
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;font-size:13px;color:#991b1b;white-space:pre-wrap;word-break:break-all">${err.stack||err.message||String(err)}</div>
      <div style="margin-top:16px;font-size:13px;color:#666">请把上面的错误信息截图发给开发者</div>
      <button onclick="localStorage.clear();location.reload()" style="margin-top:12px;padding:8px 16px;background:#e24b4a;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:13px">清除数据并重试</button>
    </div>`;
}
