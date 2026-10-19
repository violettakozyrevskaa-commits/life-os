/* Финансы: операции, бюджеты, накопления, графики, CSV */
'use strict';
const INC_CATS=['Зарплата','Подработка','Стипендия','Подарки','Другие доходы'];
const EXP_CATS=['Продукты','Транспорт','Учёба','Здоровье','Одежда','Красота','Развлечения','Подписки','Подарки','Дом','Путешествия','Другое'];
const _of3=openItemForm;
openItemForm=function(key,item,after){
  if(key==='finance'){
    const v=Object.assign({type:'expense',date:D.today(),account:'Основной'},item||{});
    return UI.form({title:item?'Операция':'Новая операция',width:620,fields:[
      {k:'type',label:'Тип',type:'select',options:[{v:'income',label:'Доход'},{v:'expense',label:'Расход'},{v:'transfer',label:'Перевод между счетами'}]},
      {k:'title',label:'Название',required:true},{k:'amount',label:'Сумма, ₽',type:'number',required:true},
      {k:'date',label:'Дата',type:'date',required:true},
      {k:'category',label:'Категория',type:'select',options:INC_CATS.concat(EXP_CATS).map(c=>({v:c,label:c}))},
      {k:'account',label:'Счёт'},{k:'toAccount',label:'Счёт назначения (для перевода)'},
      {k:'comment',label:'Комментарий',type:'textarea',rows:2}],values:v,
      submit:(val,c)=>{item?Store.update('finance',item.id,val):Store.add('finance',val);
        c();UI.toast('Сохранено');App.refresh();if(after)after()}});
  }
  return _of3(key,item,after);
};
function accountBalances(){
  const acc={};
  const add=(a,v)=>{if(!a)return;acc[a]=(acc[a]||0)+v};
  Store.get('finance').forEach(f=>{
    if(f.type==='income')add(f.account,+f.amount||0);
    else if(f.type==='expense')add(f.account,-(+f.amount||0));
    else{add(f.account,-(+f.amount||0));add(f.toAccount,+f.amount||0)}});
  return acc;
}
Views.finance=el=>{
  const st=viewState.fin||(viewState.fin={m:D.mk(D.today()),type:'',cat:''});
  const s=monthStats(st.m),set=Store.st(),bal=accountBalances();
  const totalBal=Object.values(bal).reduce((a,b)=>a+b,0);
  const ops=Store.get('finance').filter(f=>D.mk(f.date)===st.m
    &&(!st.type||f.type===st.type)&&(!st.cat||f.category===st.cat))
    .sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  const months=[];for(let i=5;i>=0;i--){const d=new Date();d.setMonth(d.getMonth()-i);
    months.push(d.getFullYear()+'-'+pad2(d.getMonth()+1))}
  el.innerHTML=`<div class="page-head"><div class="grow"><h2>Финансы</h2><p>Доходы, расходы, бюджет и накопления</p></div>
    <div class="row gap8"><button class="btn ghost" data-a="csv">${icon('download')} CSV</button>
    <button class="btn primary" data-a="add">${icon('plus')} Операция</button></div></div>
   <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(170px,1fr));margin-bottom:16px">
     <div class="card"><div class="kpi"><b class="pos">+${num(s.in)}</b><span>доходы, ${D.monthName(st.m)}</span></div></div>
     <div class="card"><div class="kpi"><b class="neg">−${num(s.out)}</b><span>расходы</span></div></div>
     <div class="card"><div class="kpi"><b>${num(s.in-s.out)}</b><span>разница</span></div></div>
     <div class="card"><div class="kpi"><b>${num(totalBal)}</b><span>баланс счетов, ₽</span></div></div></div>
   <div class="grid cols2" style="margin-bottom:16px">
     <div class="card"><h3>Доходы и расходы, 6 месяцев</h3><div class="chart-box mt12"><canvas id="fChart"></canvas></div></div>
     <div class="card"><h3>Структура расходов</h3><div class="donut-wrap mt12"><div class="chart-box"><canvas id="fPie"></canvas></div>
       <div class="legend" id="fLeg"></div></div></div></div>
   <div class="card flat" style="margin-bottom:16px"><div class="row spread"><h3>Бюджет и лимиты</h3>
     <button class="btn sm" data-a="budget">Настроить</button></div>
     <div class="mt12">${s.budget?`<div class="small muted">Общий бюджет: ${money(s.budget)} · потрачено ${money(s.out)} (${pct(s.out,s.budget)}%)</div>${UI.bar(pct(s.out,s.budget))}`
       :'<div class="small muted">Бюджет не задан.</div>'}</div>
     <div class="grid mt12" style="grid-template-columns:repeat(auto-fit,minmax(190px,1fr))">
     ${Object.keys(set.budget.limits||{}).map(c=>{const sp=monthSpend(c,st.m),lim=+set.budget.limits[c]||0;
       const p=pct(sp,lim);return `<div><div class="tiny muted">${esc(c)} · ${money(sp)} / ${money(lim)} ${p>=80?'⚠️':''}</div>${UI.bar(p,'thin')}</div>`}).join('')
       ||'<div class="tiny muted">Лимиты по категориям не заданы.</div>'}</div></div>
   <div class="card flat" style="margin-bottom:16px"><div class="row spread"><h3>Финансовые цели и накопления</h3>
     <button class="btn sm" data-a="save">${icon('plus')} Цель</button></div>
     <div class="list mt12">${Store.get('savings').length?Store.get('savings').map(sv=>`<div class="li">
       <span style="color:var(--ok);display:flex">${icon('wallet')}</span>
       <div class="grow"><b class="small">${esc(sv.title)}</b><div class="tiny muted">${money(sv.saved)} из ${money(sv.target)}${sv.deadline?' · до '+D.short(sv.deadline):''}</div>
       ${UI.bar(pct(sv.saved,sv.target),'thin mt8')}</div>
       <button class="btn xs soft" data-top="${sv.id}">Пополнить</button>
       <button class="btn icon ghost" data-sdel="${sv.id}">${icon('trash')}</button></div>`).join('')
       :'<div class="small muted">Целей накопления нет.</div>'}</div></div>
   <div class="toolbar"><select class="inp sm" id="fMonth">${[...new Set(Store.get('finance').map(f=>D.mk(f.date)))].sort().reverse().map(m=>
       `<option value="${m}" ${m===st.m?'selected':''}>${D.monthName(m)}</option>`).join('')}</select>
     <select class="inp sm" id="fType"><option value="">Все типы</option><option value="income" ${st.type==='income'?'selected':''}>Доходы</option>
       <option value="expense" ${st.type==='expense'?'selected':''}>Расходы</option><option value="transfer" ${st.type==='transfer'?'selected':''}>Переводы</option></select>
     <select class="inp sm" id="fCat"><option value="">Все категории</option>${INC_CATS.concat(EXP_CATS).map(c=>
       `<option ${st.cat===c?'selected':''}>${c}</option>`).join('')}</select></div>
   <div class="card"><div class="scroll-x"><table class="tbl"><thead><tr><th>Дата</th><th>Название</th><th>Категория</th><th>Счёт</th><th style="text-align:right">Сумма</th><th></th></tr></thead>
     <tbody>${ops.length?ops.map(f=>`<tr><td>${D.short(f.date)}</td><td>${esc(f.title)}${f.comment?`<div class="tiny muted">${esc(f.comment)}</div>`:''}</td>
       <td><span class="chip">${esc(f.category||'—')}</span></td><td class="small muted">${esc(f.account||'')}${f.toAccount?' → '+esc(f.toAccount):''}</td>
       <td style="text-align:right" class="${f.type==='income'?'pos':f.type==='expense'?'neg':'muted'}">${f.type==='income'?'+':f.type==='expense'?'−':'⇄'} ${money(f.amount)}</td>
       <td style="white-space:nowrap"><button class="btn icon ghost" data-e="${f.id}">${icon('pen')}</button>
       <button class="btn icon ghost" data-d="${f.id}">${icon('trash')}</button></td></tr>`).join('')
       :`<tr><td colspan="6"><div class="empty" style="border:none">${icon('wallet')}<b>Операций нет</b><span class="small">Добавьте первую — графики построятся автоматически</span></div></td></tr>`}
     </tbody></table></div></div>`;
  /* графики */
  const lab=months.map(m=>D.monthName(m).split(' ')[0].slice(0,3)),inc=[],exp=[];
  months.forEach(m=>{const x=monthStats(m);inc.push(x.in);exp.push(x.out)});
  Charts.group(el.querySelector('#fChart'),lab,[{label:'Доходы',data:inc,color:'#3ddc97'},{label:'Расходы',data:exp,color:'#ff6b7d'}]);
  const cats=Object.entries(s.byCat).sort((a,b)=>b[1]-a[1]);
  Charts.doughnut(el.querySelector('#fPie'),cats.map(c=>c[0]),cats.map(c=>c[1]));
  el.querySelector('#fLeg').innerHTML=cats.length?cats.slice(0,8).map((c,i)=>
    `<span><i style="background:${Charts.palette[i%Charts.palette.length]}"></i>${esc(c[0])} — ${money(c[1])}</span>`).join('')
    :'<span class="muted">Расходов в этом месяце нет</span>';
  /* события */
  el.querySelector('#fMonth').onchange=e=>{st.m=e.target.value;Views.finance(el)};
  el.querySelector('#fType').onchange=e=>{st.type=e.target.value;Views.finance(el)};
  el.querySelector('#fCat').onchange=e=>{st.cat=e.target.value;Views.finance(el)};
  el.onclick=e=>{
    const a=e.target.closest('[data-a]');
    if(a){const k=a.dataset.a;
      if(k==='add')openItemForm('finance',null);
      if(k==='csv'){const c=Store.toCSV('finance');if(!c)return UI.toast('Нет данных для экспорта','warn');
        Store.download('life-os-finance-'+st.m+'.csv',c,'text/csv');UI.toast('CSV выгружен')}
      if(k==='budget')UI.form({title:'Бюджет месяца и лимиты',width:560,fields:[
        {k:'month',label:'Общий бюджет на месяц, ₽',type:'number'}].concat(EXP_CATS.map(c=>({k:'lim_'+c,label:'Лимит: '+c,type:'number'}))),
        values:Object.assign({month:set.budget.month||0},Object.fromEntries(EXP_CATS.map(c=>['lim_'+c,(set.budget.limits||{})[c]||0]))),
        submit:(v,c)=>{const lim={};EXP_CATS.forEach(cc=>{if(+v['lim_'+cc]>0)lim[cc]=+v['lim_'+cc]});
          const s2=Store.st();s2.budget={month:+v.month||0,limits:lim};Store.save();c();UI.toast('Бюджет сохранён');App.refresh()}});
      if(k==='save')UI.form({title:'Цель накопления',fields:[{k:'title',label:'Название',required:true},
        {k:'target',label:'Целевая сумма, ₽',type:'number',required:true},{k:'saved',label:'Уже накоплено, ₽',type:'number'},
        {k:'deadline',label:'К какому числу',type:'date'}],values:{saved:0},
        submit:(v,c)=>{Store.add('savings',v);c();UI.toast('Цель создана');App.refresh()}});
      return}
    const t=e.target.closest('[data-top]');
    if(t){const sv=Store.find('savings',t.dataset.top);
      return UI.form({title:'Пополнить: '+sv.title,width:380,fields:[{k:'sum',label:'Сумма, ₽',type:'number',required:true}],
        values:{sum:0},submit:(v,c)=>{Store.update('savings',sv.id,{saved:(+sv.saved||0)+(+v.sum||0)});
          c();UI.toast('Пополнено');App.refresh()}})}
    const sd=e.target.closest('[data-sdel]');
    if(sd)return UI.confirm('Удалить цель накопления?').then(ok=>{if(ok){Store.remove('savings',sd.dataset.sdel);App.refresh()}});
    const ed=e.target.closest('[data-e]');if(ed)return openItemForm('finance',Store.find('finance',ed.dataset.e));
    const dl=e.target.closest('[data-d]');
    if(dl)return UI.confirm('Удалить операцию?').then(ok=>{if(ok){Store.remove('finance',dl.dataset.d);UI.toast('Удалено');App.refresh()}});
  };
};