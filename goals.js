'use strict';
const GOAL_CATS=['Образование','Карьера','Финансы','Здоровье','Спорт','Саморазвитие','Путешествия','Дом','Семья','Творчество','Мечты'];
const _open=openItemForm;
openItemForm=function(key,item,after){
  if(key==='goals'){
    var v=Object.assign({status:'plan',priority:'med',progress:0,stages:[],category:'Мечты'},item||{});
    return UI.form({title:(item?'Цель':'Новая цель'),width:660,fields:[
      {k:'title',label:'Название',required:true},
      {k:'category',label:'Категория',type:'select',options:GOAL_CATS.map(function(c){return {v:c,label:c}})},
      {k:'desc',label:'Описание',type:'textarea',rows:3},
      {k:'deadline',label:'Дедлайн',type:'date'},
      {k:'priority',label:'Приоритет',type:'select',options:[{v:'high',label:'Высокий'},{v:'med',label:'Средний'},{v:'low',label:'Низкий'}]},
      {k:'status',label:'Статус',type:'select',options:Object.keys(GOAL_STATUS).map(function(k){return {v:k,label:GOAL_STATUS[k]}})},
      {k:'progress',label:'Прогресс, %',type:'number'},
      {k:'budget',label:'Бюджет, ₽',type:'number'},
      {k:'cover',label:'Обложка (картинка мечты)',type:'image'},
      {k:'color',label:'Цвет',type:'swatches',options:['#5aa9ff','#7b6cf6','#3ddc97','#ffbe55','#f0a6b8','#22b8cf','#a855f7']}
    ],values:v,submit:function(val,close){
      if(item)Store.update('goals',item.id,val);else Store.add('goals',Object.assign({stages:[]},val));
      close();UI.toast('Сохранено');App.refresh();if(after)after();
      if(val.status==='done')achieve('Цель достигнута: '+val.title,'target');
    }});
  }
  return _open(key,item,after);
};

function goalCard(g){
  var t=D.today(),dl=g.deadline?D.diff(t,g.deadline):null;
  var st=g.stages||[];
  var coverHtml=g.cover?'<div class="img-cover" style="background-image:url(\''+g.cover+'\')"></div>':'';
  var dlText='';
  if(dl!=null){
    dlText=dl>=0?(dl+' дн. до дедлайна'):('просрочено на '+(-dl)+' дн.');
  }
  var budgetText=g.budget?(' · бюджет '+money(g.budget)):'';
  var stagesText=st.length?('<div class="mt8 tiny muted">Этапы: '+st.filter(function(s){return s.done}).length+'/'+st.length+'</div>'):'';
  var descHtml=g.desc?('<div class="small muted mt8" style="max-height:44px;overflow:hidden">'+esc(g.desc)+'</div>'):'';
  return '<div class="card hover" style="border-left:4px solid '+(g.color||'var(--primary)')+'">'+coverHtml+
    '<div class="row spread"><div class="grow"><b>'+esc(g.title)+'</b><div class="tiny muted">'+esc(g.category)+' · '+(GOAL_STATUS[g.status]||'')+'</div></div>'+
    '<div class="row gap6"><button class="btn icon ghost" data-act="stages">'+icon('list')+'</button>'+
    '<button class="btn icon ghost" data-act="edit">'+icon('pen')+'</button>'+
    '<button class="btn icon ghost" data-act="del">'+icon('trash')+'</button></div></div>'+
    descHtml+
    '<div class="mt12">'+UI.bar(g.progress||0)+'<div class="tiny muted mt8">Прогресс '+(g.progress||0)+'%'+
    (dlText?(' · '+dlText):'')+budgetText+'</div></div>'+stagesText+'</div>';
}

function goalStages(g,after){
  var st=g.stages||[];
  var listHtml=st.length?st.map(function(s){
    return '<div class="li"><button class="check '+(s.done?'on':'')+'" data-st="'+s.id+'">'+icon('check')+'</button>'+
      '<span class="grow '+(s.done?'muted':'')+'" style="'+(s.done?'text-decoration:line-through':'')+'">'+esc(s.title)+'</span>'+
      '<button class="btn xs ghost" data-totask="'+s.id+'" title="Создать задачу">'+icon('plus')+' задача</button>'+
      '<button class="btn icon ghost" data-stdel="'+s.id+'">'+icon('trash')+'</button></div>';
  }).join(''):'<div class="small muted">Этапов нет. Разбейте цель на шаги — так её легче довести до результата.</div>';
  UI.modal({title:'Этапы цели: '+g.title,width:600,
    body:'<div class="list" id="stList">'+listHtml+'</div>'+
      '<div class="row gap8 mt16"><input class="inp grow" id="stNew" placeholder="Новый этап…"><button class="btn primary" id="stAdd">'+icon('plus')+'</button></div>',
    footer:'<button class="btn ghost" data-x="c">Закрыть</button>',
    onMount:function(root,close){
      var save=function(patch){Store.update('goals',g.id,patch);if(after)after()};
      root.querySelector('[data-x=c]').onclick=close;
      root.querySelector('#stAdd').onclick=function(){
        var v=root.querySelector('#stNew').value.trim();
        if(!v)return;
        save({stages:st.concat([{id:uid('st'),title:v,done:false}])});
        UI.toast('Этап добавлен');
        close();
        goalStages(Store.find('goals',g.id),after);
      };
      root.querySelector('#stNew').onkeydown=function(e){if(e.key==='Enter')root.querySelector('#stAdd').click()};
      root.onclick=function(e){
        var c=e.target.closest('[data-st]');
        if(c){
          var s=st.find(function(x){return x.id===c.dataset.st});
          s.done=!s.done;
          var p=Math.round(st.filter(function(x){return x.done}).length/st.length*100);
          save({stages:st,progress:p});
          close();
          goalStages(Store.find('goals',g.id),after);
          return;
        }
        var d=e.target.closest('[data-stdel]');
        if(d){
          var i=st.findIndex(function(x){return x.id===d.dataset.stdel});
          st.splice(i,1);
          save({stages:st});
          close();
          goalStages(Store.find('goals',g.id),after);
          return;
        }
        var tt=e.target.closest('[data-totask]');
        if(tt){
          var s=st.find(function(x){return x.id===tt.dataset.totask});
          Store.add('tasks',{title:s.title,desc:'Этап цели: '+g.title,date:D.today(),category:'Саморазвитие',priority:'med',repeat:'none',done:false});
          UI.toast('Задача создана в плане на день');
          App.refresh();
        }
      };
    }
  });
}

Views.goals=function(el){
  var stt=viewState.goals||(viewState.goals={tab:'list',cat:''});
  var all=Store.get('goals');
  var list=all.filter(function(g){return !stt.cat||g.category===stt.cat});
  var tabsHtml=['list','board','year'].map(function(m){
    var labels={list:'Список',board:'Доска мечты',year:'Год и месяц'};
    return '<button data-tab="'+m+'" class="'+(stt.tab===m?'on':'')+'">'+labels[m]+'</button>';
  }).join('');
  var catsHtml=GOAL_CATS.map(function(c){return '<option '+(stt.cat===c?'selected':'')+'>'+c+'</option>'}).join('');
  el.innerHTML='<div class="page-head"><div class="grow"><h2>Глобальные планы</h2><p>Долгосрочные цели, этапы и визуальная доска мечты</p></div>'+
    '<div class="row gap8"><div class="tabs">'+tabsHtml+'</div><button class="btn primary" data-act="add">'+icon('plus')+' Цель</button></div></div>'+
    '<div class="toolbar"><select class="inp sm" id="gcat"><option value="">Все категории</option>'+catsHtml+'</select>'+
    '<span class="chip">В процессе: '+all.filter(function(g){return g.status==='process'}).length+'</span>'+
    '<span class="chip ok">Выполнено: '+all.filter(function(g){return g.status==='done'}).length+'</span></div><div id="gbody"></div>';
  el.querySelectorAll('[data-tab]').forEach(function(b){b.onclick=function(){stt.tab=b.dataset.tab;Views.goals(el)}});
  el.querySelector('#gcat').onchange=function(e){stt.cat=e.target.value;Views.goals(el)};
  el.addEventListener('click',function(e){if(e.target.closest('[data-act=add]'))openItemForm('goals',null)});
  var body=el.querySelector('#gbody');
  function cardsHtml(items){
    if(!items.length)return UI.empty('Целей нет','Сформулируйте мечту и разбейте её на этапы.','Цель');
    return '<div class="grid wide">'+items.map(function(g){return '<div data-id="'+g.id+'">'+goalCard(g)+'</div>'}).join('')+'</div>';
  }
  if(stt.tab==='list')body.innerHTML=cardsHtml(list);
  if(stt.tab==='board'){
    if(list.length){
      body.innerHTML='<div class="grid wide" style="grid-template-columns:repeat(auto-fill,minmax(240px,1fr))">'+list.map(function(g){
        var bg=g.cover?('background-image:url(\''+g.cover+'\')'):'';
        return '<div data-id="'+g.id+'" class="card hover" style="padding:0;overflow:hidden"><div class="img-cover" style="height:170px;margin:0;border-radius:0;'+bg+'">'+(g.cover?'':'✨')+'</div><div style="padding:14px"><b class="small">'+esc(g.title)+'</b><div class="tiny muted">'+esc(g.category)+'</div><div class="mt8">'+UI.bar(g.progress||0)+'</div></div></div>';
      }).join('')+'</div>';
    }else{
      body.innerHTML=UI.empty('Доска пуста','Добавьте цель с картинкой — она станет вашей доской мечты.','Цель');
    }
  }
  if(stt.tab==='year'){
    var y=String(new Date().getFullYear()),mk=D.mk(D.today());
    var inYear=all.filter(function(g){return g.deadline&&g.deadline.startsWith(y)});
    var inMonth=all.filter(function(g){return g.deadline&&D.mk(g.deadline)===mk});
    function listHtml(items){
      if(!items.length)return UI.empty('Нет целей');
      return '<div class="list">'+items.map(function(g){
        return '<div class="li" data-id="'+g.id+'" style="cursor:pointer"><span style="color:'+g.color+';display:flex">'+icon('target')+'</span><span class="grow ell">'+esc(g.title)+'</span><span class="chip">'+D.short(g.deadline)+'</span></div>';
      }).join('')+'</div>';
    }
    body.innerHTML='<div class="grid cols2"><div class="card"><h3>Цели на '+y+' год</h3><div class="list mt12">'+(inYear.length?listHtml(inYear):UI.empty('Нет целей с дедлайном в этом году'))+'</div></div>'+
      '<div class="card"><h3>Цели на '+D.monthName(mk)+'</h3><div class="list mt12">'+(inMonth.length?listHtml(inMonth):UI.empty('На этот месяц целей нет'))+'</div></div></div>';
  }
  body.addEventListener('click',function(e){
    var host=e.target.closest('[data-id]'),id=host&&host.dataset.id;
    if(!id)return;
    var g=Store.find('goals',id),a=e.target.closest('[data-act]');
    if(!g)return;
    if(stt.tab!=='list'&&!a)return goalStages(g,function(){App.refresh()});
    if(!a)return;
    if(a.dataset.act==='edit')openItemForm('goals',g);
    if(a.dataset.act==='stages')goalStages(g,function(){App.refresh()});
    if(a.dataset.act==='del')UI.confirm('Удалить цель «'+g.title+'»?').then(function(ok){if(ok){Store.remove('goals',id);UI.toast('Удалено');App.refresh()}});
  });
};

/* ---------- Мои желания ---------- */
Schemas.wishes={
  name:'Мои желания',desc:'Визуальная карта желаний, цены, приоритеты и связь с накоплениями.',add:'Желание',
  fields:[{k:'title',label:'Название',required:true},{k:'img',label:'Изображение',type:'image'},
    {k:'desc',label:'Описание',type:'textarea',rows:2},{k:'price',label:'Стоимость, ₽',type:'number'},
    {k:'priority',label:'Приоритет',type:'select',options:[{v:'high',label:'Высокий'},{v:'med',label:'Средний'},{v:'low',label:'Низкий'}]},
    {k:'category',label:'Категория',type:'select',options:['Техника','Одежда','Путешествия','Дом','Хобби','Здоровье','Другое'].map(function(c){return {v:c,label:c}})},
    {k:'link',label:'Ссылка на товар'},{k:'date',label:'Планируемая дата',type:'date'},
    {k:'savingId',label:'Связать с накоплениями',type:'select',options:[{v:'',label:'Не связывать'}].concat(Store.get('savings').map(function(s){return {v:s.id,label:s.title}}))},
    {k:'status',label:'Статус',type:'select',options:[{v:'want',label:'Хочу'},{v:'plan',label:'Планирую'},{v:'saved',label:'Отложено'},{v:'bought',label:'Куплено'}]}],
  defaults:{status:'want',priority:'med',price:0},
  filters:[{k:'status',label:'Статус',options:[{v:'want',label:'Хочу'},{v:'plan',label:'Планирую'},{v:'saved',label:'Отложено'},{v:'bought',label:'Куплено'}]},
    {k:'priority',label:'Приоритет',options:[{v:'high',label:'Высокий'},{v:'med',label:'Средний'},{v:'low',label:'Низкий'}]}],
  sorts:[{v:'new',l:'Сначала новые'},{v:'price',l:'По цене'},{v:'prio',l:'По приоритету'}],
  sortFn:function(a,b){return (b.price||0)-(a.price||0)},
  card:function(w){
    var sv=w.savingId?Store.find('savings',w.savingId):null;
    var bg=w.img?('background-image:url(\''+w.img+'\')'):'';
    var statusLabel={want:'Хочу',plan:'Планирую',saved:'Отложено',bought:'Куплено'}[w.status];
    var statusCls=w.status==='bought'?'ok':'';
    var svHtml='';
    if(sv){svHtml='<div class="mt8"><div class="tiny muted">Накопления: '+money(sv.saved)+' / '+money(sv.target)+'</div>'+UI.bar(pct(sv.saved,sv.target),'thin')+'</div>'}
    var linkHtml=w.link?('<div class="mt8"><a class="tiny" href="'+esc(w.link)+'" target="_blank" rel="noopener">открыть ссылку →</a></div>'):'';
    return '<div class="card hover" style="padding:0;overflow:hidden"><div class="img-cover" style="height:140px;margin:0;border-radius:0;'+bg+'">'+(w.img?'':'⭐')+'</div><div style="padding:14px"><div class="row spread"><b class="small">'+esc(w.title)+'</b><span class="chip '+statusCls+'">'+statusLabel+'</span></div><div class="tiny muted mt8">'+money(w.price)+' · '+esc(w.category||'')+' · '+(PRIO[w.priority]?PRIO[w.priority].l:'')+'</div>'+svHtml+linkHtml+'<div class="row gap6 mt12"><button class="btn xs ghost" data-act="edit">'+icon('pen')+'</button><button class="btn xs ghost" data-x="buy">'+icon('cart')+' Куплено</button><button class="btn xs ghost" data-act="del">'+icon('trash')+'</button></div></div></div>';
  },
  onAction:function(act,w,draw,e){
    if(act==='edit')return openItemForm('wishes',w,draw);
    var x=e.target.closest('[data-x]');
    if(x&&x.dataset.x==='buy'){Store.update('wishes',w.id,{status:'bought'});UI.toast('Поздравляю с покупкой! 🎉');achieve('Желание исполнено: '+w.title,'star');App.refresh()}
  }
};
Views.wishes=function(el){collectionView('wishes',el);var total=Store.get('wishes').reduce(function(a,b){return a+(+b.price||0)},0);el.querySelector('.page-head p').textContent='Всего в списке желаний: '+money(total)};