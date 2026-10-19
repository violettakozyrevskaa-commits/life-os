/* Аналитика: реальные данные, периоды, итоги месяца, колесо баланса, достижения */
'use strict';
const Charts={
  palette:['#5aa9ff','#7b6cf6','#3ddc97','#ffbe55','#f0a6b8','#22b8cf','#a855f7','#8fb996','#ff6b7d','#c8a27a'],
  reg:new WeakMap(),
  ok(el){return !!(window.Chart&&el&&el.getContext)},
  base(){return{responsive:true,maintainAspectRatio:false,
    plugins:{legend:{labels:{color:cssVar('--muted'),font:{size:11}}}},
    scales:{x:{grid:{display:false},ticks:{color:cssVar('--muted')}},y:{grid:{color:cssVar('--border')},ticks:{color:cssVar('--muted')},beginAtZero:true}}}},
  bar(el,labels,data,opt){opt=opt||{};
    if(this.ok(el)){const old=this.reg.get(el);old&&old.destroy();
      const c=new Chart(el.getContext('2d'),{type:'bar',
        data:{labels,datasets:[{label:opt.label||'',data,backgroundColor:opt.color||cssVar('--primary'),borderRadius:7,maxBarThickness:26}]},
        options:Object.assign(this.base(),{plugins:{legend:{display:false}}})});this.reg.set(el,c);return}
    el.outerHTML=this.fallback(labels,[{label:opt.label,data,color:opt.color||cssVar('--primary')}])},
  group(el,labels,sets){
    if(this.ok(el)){const old=this.reg.get(el);old&&old.destroy();
      const c=new Chart(el.getContext('2d'),{type:'bar',data:{labels,
        datasets:sets.map((s,i)=>({label:s.label,data:s.data,backgroundColor:s.color,borderRadius:7,maxBarThickness:22}))},
        options:this.base()});this.reg.set(el,c);return}
    el.outerHTML=this.fallback(labels,sets)},
  doughnut(el,labels,data){
    if(this.ok(el)){const old=this.reg.get(el);old&&old.destroy();
      const c=new Chart(el.getContext('2d'),{type:'doughnut',data:{labels,
        datasets:[{data,backgroundColor:this.palette,borderWidth:0}]},
        options:{responsive:true,maintainAspectRatio:false,cutout:'62%',plugins:{legend:{display:false}}}});
      this.reg.set(el,c);return}
    const tot=data.reduce((a,b)=>a+b,0)||1;
    el.outerHTML=`<div class="col gap6">${labels.map((l,i)=>`<div><div class="tiny muted">${esc(l)} · ${Math.round(data[i]/tot*100)}%</div>
      ${this.fallbackBar(data[i]/tot*100,this.palette[i%this.palette.length])}</div>`).join('')}</div>`},
  fallbackBar(p,color){return `<div class="bar thin"><i style="width:${clamp(p,0,100)}%;background:${color}"></i></div>`},
  fallback(labels,sets){
    const max=Math.max(1,...sets.flatMap(s=>s.data));
    return `<div class="col gap8">${labels.map((l,i)=>`<div><div class="tiny muted">${esc(l)}</div>${
      sets.map(s=>this.fallbackBar(s.data[i]/max*100,s.color)).join('')}</div>`).join('')}</div>`}
};

function renderRadar(box,bal){
  const keys=Object.keys(bal);
  const R=78,cx=100,cy=100;
  const pts=keys.map((k,i)=>{const a=(-90+i*360/keys.length)*Math.PI/180,r=R*(clamp(bal[k],0,10)/10);
    return [cx+Math.cos(a)*r,cy+Math.sin(a)*r]});
  box.innerHTML=`<svg width="200" height="200" viewBox="0 0 200 200">
    ${[2.5,5,7.5,10].map(f=>`<circle cx="${cx}" cy="${cy}" r="${R*f/10}" fill="none" stroke="var(--border)"/>`).join('')}
    ${keys.map((k,i)=>{const a=(-90+i*360/keys.length)*Math.PI/180;
      return `<line x1="${cx}" y1="${cy}" x2="${cx+Math.cos(a)*R}" y2="${cy+Math.sin(a)*R}" stroke="var(--border)"/>`}).join('')}
    <polygon points="${pts.map(p=>p.join(',')).join(' ')}" fill="${cssVar('--primary')}44" stroke="${cssVar('--primary')}" stroke-width="2"/>
    ${keys.map((k,i)=>{const a=(-90+i*360/keys.length)*Math.PI/180;
      return `<text x="${cx+Math.cos(a)*(R+14)}" y="${cy+Math.sin(a)*(R+14)+4}" font-size="9" fill="var(--muted)" text-anchor="middle">${esc(k.slice(0,7))}</text>`}).join('')}
    </svg>`;
}

Views.analytics=el=>{
  const st=viewState.an||(viewState.an={p:'month'});
  const t=D.today();
  const range={week:6,month:29,quarter:89,year:364}[st.p];
  const from=D.add(t,-range);
  let td=0,tt=0;
  for(let d=from;D.diff(from,d)<=0;d=D.add(d,1)){
    const list=Store.get('tasks').filter(x=>taskActiveOn(x,d));
    tt+=list.length;td+=list.filter(x=>taskDone(x,d)).length}
  const hs=Store.get('habits').filter(h=>!h.archived);
  const hr=hs.map(h=>habitRate(h,from,t));
  const hDone=hr.reduce((a,b)=>a+b.done,0),hDue=hr.reduce((a,b)=>a+b.due,0);
  const sp=Store.get('sports').filter(s=>s.date>=from&&s.date<=t);
  const books=Store.get('books').filter(b=>b.status==='read'&&b.finish&&b.finish>=from);
  const mk=D.mk(t),fs=monthStats(mk);
  const hw=Store.get('homework'),hwDone=hw.filter(h=>h.done).length;
  const goals=Store.get('goals');
  const gAvg=goals.length?Math.round(goals.reduce((a,b)=>a+(+b.progress||0),0)/goals.length):0;
  el.innerHTML=`<div class="page-head"><div class="grow"><h2>Аналитика</h2><p>Только реальные данные приложения · период: ${
    {week:'неделя',month:'месяц',quarter:'квартал',year:'год'}[st.p]}</p></div>
    <div class="tabs">${[['week','Неделя'],['month','Месяц'],['quarter','Квартал'],['year','Год']].map(p=>
      `<button data-p="${p[0]}" class="${st.p===p[0]?'on':''}">${p[1]}</button>`).join('')}</div></div>
   <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(168px,1fr));margin-bottom:16px">
     <div class="card"><div class="kpi"><b>${pct(td,tt)}%</b><span>задач выполнено (${td}/${tt})</span></div>${UI.bar(pct(td,tt))}</div>
     <div class="card"><div class="kpi"><b>${pct(hDone,hDue)}%</b><span>привычек (${hDone}/${hDue})</span></div>${UI.bar(pct(hDone,hDue))}</div>
     <div class="card"><div class="kpi"><b>${sp.length}</b><span>тренировок</span></div></div>
     <div class="card"><div class="kpi"><b>${books.length}</b><span>книг прочитано</span></div></div>
     <div class="card"><div class="kpi"><b>${gAvg}%</b><span>средний прогресс целей</span></div>${UI.bar(gAvg)}</div>
     <div class="card"><div class="kpi"><b>${hwDone}/${hw.length}</b><span>учебных заданий</span></div></div>
     <div class="card"><div class="kpi"><b class="${fs.in-fs.out>=0?'pos':'neg'}">${num(fs.in-fs.out)}</b><span>баланс месяца, ₽</span></div></div></div>
   <div class="grid cols2" style="margin-bottom:16px">
     <div class="card"><h3>Задачи по дням (14 дней)</h3><div class="chart-box mt12"><canvas id="aTasks"></canvas></div></div>
     <div class="card"><h3>Привычки: выполнение по дням</h3><div class="chart-box mt12"><canvas id="aHab"></canvas></div></div>
     <div class="card"><h3>Тренировки по неделям (8)</h3><div class="chart-box mt12"><canvas id="aSport"></canvas></div></div>
     <div class="card"><h3>Расходы по категориям, ${D.monthName(mk)}</h3><div class="donut-wrap mt12"><div class="chart-box"><canvas id="aFin"></canvas></div>
       <div class="legend" id="aFinLeg"></div></div></div></div>
   <div class="grid cols2" style="margin-bottom:16px">
     <div class="card"><div class="row spread"><h3>Итоги месяца</h3><button class="btn sm" id="mkSum">${icon('chart')} Сформировать</button></div>
       <div id="sumBox" class="mt12 small muted">Нажмите — соберём анализ достижений, привычек, финансов, книг и целей.</div></div>
     <div class="card"><h3>Колесо жизненного баланса</h3><div class="radar mt12"><div id="radarBox"></div>
       <div class="col gap6 grow" id="balSliders"></div></div></div></div>
   <div class="card"><div class="row spread"><h3>Архив достижений</h3><span class="chip">${Store.get('achievements').length}</span></div>
     <div class="list mt12">${Store.get('achievements').length?Store.get('achievements').slice().reverse().map(a=>
       `<div class="li"><span style="color:var(--warn);display:flex">${icon(a.icon||'star')}</span>
        <span class="grow small">${esc(a.title)}</span><span class="tiny muted">${D.short(a.date)}</span></div>`).join('')
       :UI.empty('Достижений пока нет','Они появляются автоматически: серии привычек, прочитанные книги, выполненные цели.')}</div></div>`;
  el.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{st.p=b.dataset.p;Views.analytics(el)});
  const dl=[],dv=[];
  for(let i=13;i>=0;i--){const d=D.add(t,-i);const l=Store.get('tasks').filter(x=>taskActiveOn(x,d));
    dl.push(D.parse(d).getDate());dv.push(l.filter(x=>taskDone(x,d)).length)}
  Charts.bar(el.querySelector('#aTasks'),dl,dv,{label:'Выполнено'});
  const hl=[],hv=[];
  for(let i=13;i>=0;i--){const d=D.add(t,-i);const l=hs.filter(x=>habitDueOn(x,d));
    hl.push(D.parse(d).getDate());hv.push(l.filter(x=>(x.log||{})[d]).length)}
  Charts.bar(el.querySelector('#aHab'),hl,hv,{color:cssVar('--accent')});
  const sl=[],sv2=[];const wk0=D.week(t,Store.st().weekStart);
  for(let i=7;i>=0;i--){const s=D.add(wk0[0],-7*i);sl.push(D.short(s).slice(0,5));
    sv2.push(Store.get('sports').filter(x=>x.date>=s&&x.date<=D.add(s,6)).length)}
  Charts.bar(el.querySelector('#aSport'),sl,sv2,{color:'#3ddc97'});
  const cats=Object.entries(fs.byCat).sort((a,b)=>b[1]-a[1]);
  Charts.doughnut(el.querySelector('#aFin'),cats.map(c=>c[0]),cats.map(c=>c[1]));
  el.querySelector('#aFinLeg').innerHTML=cats.length?cats.slice(0,8).map((c,i)=>
    `<span><i style="background:${Charts.palette[i%Charts.palette.length]}"></i>${esc(c[0])} — ${money(c[1])}</span>`).join('')
    :'<span class="muted">Расходов нет</span>';
  el.querySelector('#mkSum').onclick=()=>{
    const habitsOk=hs.length?Math.round(hr.reduce((a,b)=>a+b.p,0)/hr.length):0;
    const goalsDone=goals.filter(g=>g.status==='done').length;
    el.querySelector('#sumBox').innerHTML=`
      <div class="col gap8">
      <div class="stat-line"><span>Задач выполнено за период</span><b>${td} из ${tt} (${pct(td,tt)}%)</b></div>
      <div class="stat-line"><span>Привычки, среднее выполнение</span><b>${habitsOk}%</b></div>
      <div class="stat-line"><span>Тренировок</span><b>${sp.length} · ${sp.reduce((a,b)=>a+(+b.duration||0),0)} мин</b></div>
      <div class="stat-line"><span>Книг прочитано</span><b>${books.length}</b></div>
      <div class="stat-line"><span>Доходы / расходы месяца</span><b>${money(fs.in)} / ${money(fs.out)}</b></div>
      <div class="stat-line"><span>Целей выполнено всего</span><b>${goalsDone}</b></div>
      <div class="stat-line"><span>Дневниковых записей</span><b>${Store.get('diary').length}</b></div>
      <div class="divider"></div>
      <div>${td>=tt*0.7&&tt?'Отличный темп — план закрывается. ':'Есть запас для роста: '}${
        habitsOk>=80?'привычки в отличной форме.':'привычки можно подтянуть.'} ${
        fs.out>fs.in?'Расходы превышают доходы — стоит пересмотреть лимиты.':'Финансовое правило соблюдается.'}</div></div>`;
  };
  const bal=Store.data.balance||{};
  const keys=Object.keys(bal);
  const radarBox=el.querySelector('#radarBox');
  renderRadar(radarBox,bal);
  el.querySelector('#balSliders').innerHTML=keys.map(k=>`<div class="row gap8"><span class="small" style="width:96px">${esc(k)}</span>
    <input type="range" min="1" max="10" value="${bal[k]}" data-bal="${k}"><b class="num small" style="width:22px">${bal[k]}</b></div>`).join('');
  el.querySelectorAll('[data-bal]').forEach(r=>r.oninput=()=>{
    const k=r.dataset.bal,v=+r.value;
    Store.data.balance[k]=v;
    Store.save();
    r.parentElement.querySelector('b').textContent=v;
    renderRadar(radarBox,Store.data.balance);
  });
};