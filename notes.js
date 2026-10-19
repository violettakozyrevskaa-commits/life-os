'use strict';
const DIARY_Q=[['good','Что хорошего произошло сегодня?'],['learned','Чему я научился?'],['joy','Что принесло радость?'],['improve','Что хочу улучшить?'],['grateful','За что я благодарен?'],['tomorrow','Что важно сделать завтра?']];
function cleanHtml(h){return String(h||'').replace(/<script[\s\S]*?<\/script>/gi,'').replace(/\son\w+="[^"]*"/gi,'')}

Schemas.notes={
  name:'Заметки',desc:'Мысли, идеи, теги.',add:'Заметка',
  fields:[
    {k:'title',label:'Заголовок',required:true},
    {k:'body',label:'Текст',type:'textarea',rows:5},
    {k:'tags',label:'Теги (через запятую)',ph:'идея, работа'},
    {k:'cat',label:'Категория',ph:'Разное'},
    {k:'favorite',label:'В избранное',type:'checkbox'},
    {k:'pinned',label:'Закрепить сверху',type:'checkbox'}
  ],
  defaults:{tags:[],cat:'Разное',favorite:false,pinned:false},
  filters:[
    {k:'cat',label:'Категория',options:[...new Set(Store.get('notes').map(n=>n.cat).filter(Boolean))].map(c=>({v:c,label:c}))}
  ],
  sorts:[{v:'new',l:'Сначала новые'},{v:'az',l:'По заголовку'}],
  card:n=>`<div class="card hover"><b class="small">${esc(n.title||'Без названия')}</b>
    <div class="tiny muted mt8">${esc((n.tags||[]).join(', '))||'—'}</div></div>`
};

FORM_OVERRIDES.notes=function(item,after){
  const v=Object.assign({tags:''},item||{});
  if(Array.isArray(v.tags))v.tags=v.tags.join(', ');
  return UI.form({
    title:(item?'Редактировать заметку':'Новая заметка'),
    width:640,
    fields:[
      {k:'title',label:'Заголовок',required:true},
      {k:'body',label:'Текст',type:'textarea',rows:6},
      {k:'tags',label:'Теги (через запятую)',hint:'Например: идея, работа, план'},
      {k:'cat',label:'Категория',ph:'Разное'},
      {k:'favorite',label:'В избранное',type:'checkbox'},
      {k:'pinned',label:'Закрепить сверху',type:'checkbox'}
    ],
    values:v,
    submit:function(val,close){
      var tags=typeof val.tags==='string'
        ? val.tags.split(',').map(s=>s.trim()).filter(Boolean)
        : (val.tags||[]);
      var data=Object.assign({},val,{tags:tags,updated:D.today()});
      if(item)Store.update('notes',item.id,data);
      else Store.add('notes',data);
      close();
      UI.toast(item?'Сохранено':'Заметка добавлена');
      App.refresh();
      if(after)after();
    }
  });
};

Views.notes=function(el){
  var st=viewState.notes||(viewState.notes={tab:'notes',q:'',tag:''});
  var notes=Store.get('notes'),t=D.today();
  var todayEntry=Store.get('diary').find(function(d){return d.date===t});
  var tabsHtml='<button data-tab="notes" class="'+(st.tab==='notes'?'on':'')+'">Заметки ('+notes.length+')</button><button data-tab="diary" class="'+(st.tab==='diary'?'on':'')+'">Дневник</button>';
  el.innerHTML='<div class="page-head"><div class="grow"><h2>Заметки и дневник</h2><p>Мысли, идеи, теги и ежедневная рефлексия</p></div><div class="row gap8"><div class="tabs">'+tabsHtml+'</div><button class="btn primary" data-a="add">'+icon('plus')+' Заметка</button></div></div><div id="nbody"></div>';
  el.querySelectorAll('[data-tab]').forEach(function(b){b.onclick=function(){st.tab=b.dataset.tab;Views.notes(el)}});
  el.querySelector('[data-a=add]').onclick=function(){openItemForm('notes',null)};
  var body=el.querySelector('#nbody');

  if(st.tab==='notes'){
    var tags=[...new Set(notes.flatMap(function(n){return n.tags||[]}))];
    var list=notes.slice();
    if(st.q){var q=st.q.toLowerCase();list=list.filter(function(n){return (n.title+' '+(n.body||'')).toLowerCase().indexOf(q)!==-1})}
    if(st.tag)list=list.filter(function(n){return (n.tags||[]).indexOf(st.tag)!==-1});
    list.sort(function(a,b){return (b.pinned?1:0)-(a.pinned?1:0)||((b.updated||b.created)||'').localeCompare((a.updated||a.created)||'')});
    var itemsHtml=list.map(function(n){
      var pinnedHtml=n.pinned?'<span class="chip p">закреп</span>':'';
      var favHtml=n.favorite?'<span class="chip warn">★</span>':'';
      var tagsHtml=(n.tags||[]).map(function(tg){return '<span class="chip">'+esc(tg)+'</span>'}).join('');
      var bodyHtml=n.body||('<span class=muted>Пусто</span>');
      return '<div class="card hover" data-id="'+n.id+'"><div class="row spread"><b class="small">'+esc(n.title||'Без названия')+'</b><div class="row gap4">'+pinnedHtml+favHtml+'</div></div><div class="note-body mt8">'+bodyHtml+'</div><div class="row gap6 wrap mt12">'+tagsHtml+'<span class="tiny muted" style="margin-left:auto">'+D.short(n.updated||n.created||t)+'</span></div><div class="row gap6 mt12"><button class="btn xs ghost" data-x="edit">'+icon('pen')+'</button><button class="btn xs ghost" data-x="pin">'+icon('heart')+'</button><button class="btn xs ghost" data-x="del">'+icon('trash')+'</button></div></div>';
    }).join('');
    var tagsOpts=tags.map(function(tg){return '<option '+(st.tag===tg?'selected':'')+'>'+esc(tg)+'</option>'}).join('');
    body.innerHTML='<div class="toolbar"><input class="inp sm grow" id="nq" placeholder="Поиск по заметкам…" value="'+esc(st.q)+'" style="min-width:180px"><select class="inp sm" id="ntag"><option value="">Все теги</option>'+tagsOpts+'</select></div><div class="grid wide">'+(list.length?itemsHtml:UI.empty('Заметок нет','Запишите мысль — она сохранится навсегда.','Заметка'))+'</div>';
    body.querySelector('#nq').oninput=function(e){st.q=e.target.value;Views.notes(el)};
    body.querySelector('#ntag').onchange=function(e){st.tag=e.target.value;Views.notes(el)};
    body.onclick=function(e){
      var host=e.target.closest('[data-id]'),id=host&&host.dataset.id;
      if(!id)return;
      var n=Store.find('notes',id),x=e.target.closest('[data-x]');
      if(!n||!x)return;
      if(x.dataset.x==='edit')openItemForm('notes',n);
      if(x.dataset.x==='pin'){Store.update('notes',id,{pinned:!n.pinned,favorite:!n.favorite});App.refresh()}
      if(x.dataset.x==='del')UI.confirm('Удалить заметку?').then(function(ok){
        if(ok){
          var backup=JSON.parse(JSON.stringify(n));
          Store.remove('notes',id);
          UI.toast('Удалено','ok',5000,{label:'Отменить',onClick:function(){Store.add('notes',backup);App.refresh()}});
        }
      });
    };
  }else{
    var e2=todayEntry||{};
    var qHtml=DIARY_Q.map(function(q){
      var val=e2[q[0]]||'';
      return '<div class="field"><label>'+q[1]+'</label><textarea class="inp" data-dq="'+q[0]+'" rows="2" placeholder="…">'+esc(val)+'</textarea></div>';
    }).join('');
    var moodHtml=Array.from({length:10},function(_,i){return '<button data-v="'+(i+1)+'" class="'+(+e2.rating===i+1?'on':'')+'">'+(i+1)+'</button>'}).join('');
    var days=D.monthDays(D.mk(t));
    var heatHtml=days.map(function(d){
      var rec=Store.get('diary').find(function(x){return x.date===d});
      var cls=rec?'on':(D.future(d)?'f':'');
      var title=D.short(d)+(rec?(' · '+rec.rating+'/10'):'');
      return '<i class="'+cls+'" data-dd="'+d+'" title="'+title+'" style="cursor:pointer"></i>';
    }).join('');
    var diaryList=Store.get('diary').slice().sort(function(a,b){return b.date.localeCompare(a.date)}).slice(0,5);
    var diaryListHtml=diaryList.map(function(d){return '<div class="li" data-dd="'+d.date+'" style="cursor:pointer"><span style="color:var(--primary);display:flex">'+icon('pen')+'</span><span class="grow small">'+D.long(d.date)+' · '+(d.rating||'—')+'/10</span>'+icon('arrow')+'</div>'}).join('');
    var rs=Store.get('diary').map(function(d){return +d.rating}).filter(Boolean);
    var avg=rs.length?(rs.reduce(function(a,b){return a+b},0)/rs.length).toFixed(1):'—';
    body.innerHTML='<div class="grid cols2"><div class="card"><h3>Дневник · '+D.long(t)+'</h3><div class="col gap12 mt12">'+qHtml+'</div><div class="field mt12"><label>Оценка дня</label><div class="mood" id="mood">'+moodHtml+'</div></div><button class="btn primary mt16" id="dSave">'+icon('check')+' Сохранить день</button></div><div class="card"><h3>История по календарю</h3><div class="heat mt12" id="dHeat">'+heatHtml+'</div><div class="divider"></div><div class="small muted">Средняя оценка: <b id="dAvg">'+avg+'</b> · записей: '+Store.get('diary').length+'</div><div class="list mt12">'+diaryListHtml+'</div></div></div>';
    var rating=+e2.rating||0;
    body.querySelector('#mood').onclick=function(e){
      var b=e.target.closest('button');if(!b)return;
      var v=+b.dataset.v;
      if(rating===v){rating=0}else{rating=v}
      body.querySelectorAll('#mood button').forEach(function(x,i){x.classList.toggle('on',i<rating)});
    };
    body.querySelector('#dSave').onclick=function(){
      var v={date:t,rating:rating};
      DIARY_Q.forEach(function(q){v[q[0]]=body.querySelector('[data-dq="'+q[0]+'"]').value.trim()});
      if(todayEntry)Store.update('diary',todayEntry.id,v);else Store.add('diary',v);
      UI.toast('День сохранён');
      if(rating>=8)achieve('Отличный день: '+rating+'/10','heart');
      App.refresh();
    };
    body.onclick=function(e){
      var i=e.target.closest('[data-dd]');
      if(i)openDiary(i.dataset.dd);
    };
  }
};

function openDiary(date){
  var rec=Store.get('diary').find(function(d){return d.date===date});
  var bodyHtml=rec?('<div class="col gap12">'+DIARY_Q.map(function(q){
    return rec[q[0]]?('<div><div class="tiny muted">'+q[1]+'</div><div class="small">'+esc(rec[q[0]])+'</div></div>'):'';
  }).join('')+'<div class="chip p">Оценка дня: '+(rec.rating||'—')+'/10</div></div>'):UI.empty('Записи нет','В этот день дневник не заполнялся.');
  UI.modal({title:'Дневник · '+D.long(date),width:560,body:bodyHtml,
    footer:'<button class="btn ghost" data-x="c">Закрыть</button>',
    onMount:function(r,c){r.querySelector('[data-x=c]').onclick=c}});
}