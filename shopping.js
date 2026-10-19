'use strict';
const FOOD_CATS=['Продукты','Быт','Гигиена','Корм','Другое'];
Views.shopping=function(el){
  var st=viewState.shop||(viewState.shop={tab:'list'});
  var tabs=[['list','Список покупок'],['pantry','Запасы дома'],['meals','План питания'],['cost','Расходы на продукты']];
  var tabsHtml=tabs.map(function(t){return '<button data-tab="'+t[0]+'" class="'+(st.tab===t[0]?'on':'')+'">'+t[1]+'</button>'}).join('');
  el.innerHTML='<div class="page-head"><div class="grow"><h2>Продукты и покупки</h2><p>Всё для дома в одном месте</p></div><div class="tabs">'+tabsHtml+'</div></div><div id="sbody"></div>';
  el.querySelectorAll('[data-tab]').forEach(function(b){b.onclick=function(){st.tab=b.dataset.tab;Views.shopping(el)}});
  var body=el.querySelector('#sbody');

  if(st.tab==='list'){
    var items=Store.get('purchases');
    var total=items.filter(function(i){return i.status!=='bought'}).reduce(function(a,b){return a+(+b.price||0)*(+b.qty||1)},0);
    body.innerHTML='<div class="card flat" style="margin-bottom:14px"><div class="row spread"><b>На сумму: '+money(total)+'</b><span class="small muted">'+items.filter(function(i){return i.status!=='bought'}).length+' позиций в плане</span></div></div>'+
      '<div class="row gap8" style="margin-bottom:14px"><button class="btn primary" data-a="add">'+icon('plus')+' Товар</button><button class="btn ghost" data-a="clear">'+icon('check')+' Отметить всё купленным</button></div>'+
      '<div class="list">'+(items.length?items.map(function(p){
        var doneCls=p.status==='bought'?'done':'';
        var checkCls=p.status==='bought'?'on':'';
        var commentHtml=p.comment?('<div class="tiny muted">'+esc(p.comment)+'</div>'):'';
        return '<div class="li '+doneCls+'" data-id="'+p.id+'"><button class="check '+checkCls+'" data-x="buy">'+icon('check')+'</button><div class="grow"><b class="small">'+esc(p.name)+'</b><div class="tiny muted">'+esc(p.qty||1)+' '+esc(p.unit||'шт')+' · '+money((+p.price||0)*(+p.qty||1))+' · '+esc(p.shop||'—')+' · '+esc(p.category||'')+'</div>'+commentHtml+'</div><button class="btn icon ghost" data-x="edit">'+icon('pen')+'</button><button class="btn icon ghost" data-x="del">'+icon('trash')+'</button></div>';
      }).join(''):UI.empty('Список пуст','Добавьте товары или перенесите ингредиенты из плана питания.','Товар'))+'</div>';
    function form(item){
      UI.form({title:item?'Товар':'Новый товар',fields:[
        {k:'name',label:'Название',required:true},{k:'qty',label:'Количество',type:'number'},
        {k:'unit',label:'Единица',type:'select',options:['шт','кг','л','уп','гл'].map(function(u){return {v:u,label:u}})},
        {k:'price',label:'Цена за единицу, ₽',type:'number'},
        {k:'category',label:'Категория',type:'select',options:FOOD_CATS.map(function(c){return {v:c,label:c}})},
        {k:'shop',label:'Магазин'},{k:'status',label:'Статус',type:'select',options:[{v:'plan',label:'Планируется'},{v:'bought',label:'Куплено'}]},
        {k:'comment',label:'Комментарий',type:'textarea',rows:2}],
        values:item||{qty:1,unit:'шт',category:'Продукты',status:'plan'},
        submit:function(v,c){item?Store.update('purchases',item.id,v):Store.add('purchases',v);c();UI.toast('Сохранено');App.refresh()}});
    }
    body.onclick=function(e){
      var a=e.target.closest('[data-a]');
      if(a&&a.dataset.a==='add')return form(null);
      if(a&&a.dataset.a==='clear'){items.forEach(function(i){Store.update('purchases',i.id,{status:'bought'})});UI.toast('Всё куплено');App.refresh();return}
      var host=e.target.closest('[data-id]'),id=host&&host.dataset.id;
      if(!id)return;
      var p=Store.find('purchases',id),x=e.target.closest('[data-x]');
      if(!p||!x)return;
      if(x.dataset.x==='buy'){Store.update('purchases',id,{status:p.status==='bought'?'plan':'bought'});App.refresh()}
      if(x.dataset.x==='edit')form(p);
      if(x.dataset.x==='del')UI.confirm('Удалить «'+p.name+'»?').then(function(ok){if(ok){Store.remove('purchases',id);App.refresh()}});
    };
  }

  if(st.tab==='pantry'){
    var items=Store.get('pantry'),t=D.today();
    body.innerHTML='<div class="row gap8" style="margin-bottom:14px"><button class="btn primary" data-a="add">'+icon('plus')+' Продукт</button><span class="chip warn">Скоро заканчивается: '+items.filter(function(p){return p.expiry&&D.diff(t,p.expiry)<=7&&D.diff(t,p.expiry)>=0}).length+'</span></div>'+
      '<div class="grid">'+(items.length?items.map(function(p){
        var dl=p.expiry?D.diff(t,p.expiry):null;
        var dlCls=dl==null?'':(dl<0?'bad':(dl<=7?'warn':'ok'));
        var dlText=dl==null?'':(dl<0?'просрочено':(dl+' дн.'));
        var expiryHtml=p.expiry?('<div class="tiny muted">Годен до '+D.short(p.expiry)+'</div>'):'';
        return '<div class="card" data-id="'+p.id+'"><div class="row spread"><b class="small">'+esc(p.name)+'</b>'+(dlCls?('<span class="chip '+dlCls+'">'+dlText+'</span>'):'')+'</div><div class="tiny muted mt8">'+esc(p.qty||1)+' '+esc(p.unit||'шт')+' · '+esc(p.category||'')+'</div>'+expiryHtml+'<div class="row gap6 mt12"><button class="btn xs ghost" data-x="edit">'+icon('pen')+'</button><button class="btn xs ghost" data-x="tocart">'+icon('cart')+' В список</button><button class="btn xs ghost" data-x="del">'+icon('trash')+'</button></div></div>';
      }).join(''):UI.empty('Запасов нет','Добавьте то, что есть дома.','Продукт'))+'</div>';
    function form(item){
      UI.form({title:'Запасы дома',fields:[{k:'name',label:'Название',required:true},
        {k:'qty',label:'Количество',type:'number'},{k:'unit',label:'Единица',type:'select',options:['шт','кг','л','уп'].map(function(u){return {v:u,label:u}})},
        {k:'expiry',label:'Срок годности',type:'date'},{k:'category',label:'Категория',type:'select',options:FOOD_CATS.map(function(c){return {v:c,label:c}})}],
        values:item||{qty:1,unit:'шт',category:'Продукты'},
        submit:function(v,c){item?Store.update('pantry',item.id,v):Store.add('pantry',v);c();UI.toast('Сохранено');App.refresh()}});
    }
    body.onclick=function(e){
      var a=e.target.closest('[data-a]');if(a&&a.dataset.a==='add')return form(null);
      var host=e.target.closest('[data-id]'),id=host&&host.dataset.id;if(!id)return;
      var p=Store.find('pantry',id),x=e.target.closest('[data-x]');if(!p||!x)return;
      if(x.dataset.x==='edit')form(p);
      if(x.dataset.x==='tocart'){Store.add('purchases',{name:p.name,qty:p.qty,unit:p.unit,price:0,category:p.category,shop:'',status:'plan'});UI.toast('Добавлено в список покупок');App.refresh()}
      if(x.dataset.x==='del')UI.confirm('Удалить «'+p.name+'»?').then(function(ok){if(ok){Store.remove('pantry',id);App.refresh()}});
    };
  }

  if(st.tab==='meals'){
    if(typeof st.off!=='number') st.off=0;
    var baseDay=D.add(D.today(),st.off);
    var ws=Store.st().weekStart,days=D.week(baseDay,ws);
    var MEALS=[['breakfast','Завтрак'],['lunch','Обед'],['dinner','Ужин'],['snack','Перекус']];
    var meals=Store.get('meals');
    var colsHtml=days.map(function(d){
      var mealsHtml=MEALS.map(function(m){
        var it=meals.find(function(x){return x.date===d&&x.meal===m[0]});
        var ingHtml=it?((it.ingredients||[]).map(function(i){return esc(i.name)}).join(', ')):'';
        var itHtml=it?('<b class="small">'+esc(it.title)+'</b><div class="tiny muted">'+ingHtml+'</div><div class="row gap6 mt8"><button class="btn xs" data-cart="'+it.id+'">'+icon('cart')+' в список</button><button class="btn xs ghost" data-mealedit="'+it.id+'">'+icon('pen')+'</button></div>')
          :('<button class="btn xs ghost" data-mealadd="'+d+'|'+m[0]+'">+ добавить</button>');
        return '<div class="row gap8" style="align-items:flex-start"><span class="tiny muted" style="width:64px;flex:0 0 64px">'+m[1]+'</span><div class="grow">'+itHtml+'</div></div>';
      }).join('');
      return '<div class="card"><b class="small">'+D.dowName(d)+', '+D.parse(d).getDate()+'</b><div class="col gap8 mt8">'+mealsHtml+'</div></div>';
    }).join('');
    body.innerHTML='<div class="row gap8" style="margin-bottom:14px"><button class="btn ghost" data-nav="-1">'+icon('left')+' Неделя</button><b class="small">'+D.short(days[0])+' — '+D.short(days[6])+'</b><button class="btn ghost" data-nav="1">Неделя '+icon('right')+'</button><button class="btn ghost" data-a="dishes">'+icon('heart')+' Любимые блюда</button></div><div class="grid wide">'+colsHtml+'</div>';
    body.querySelector('[data-nav="-1"]').onclick=function(){st.off-=7;Views.shopping(el)};
    body.querySelector('[data-nav="1"]').onclick=function(){st.off+=7;Views.shopping(el)};
    body.querySelector('[data-a=dishes]').onclick=function(){
      var fav=meals.filter(function(m){return m.fav});
      var favHtml=fav.length?('<div class="list">'+fav.map(function(m){return '<div class="li"><span class="grow">'+esc(m.title)+'</span><button class="btn sm" data-fav="'+m.id+'">На сегодня</button></div>'}).join('')+'</div>'):UI.empty('Пока пусто','Отметьте блюдо любимым при добавлении.');
      UI.modal({title:'Любимые блюда',width:520,body:favHtml,
        onMount:function(r){r.onclick=function(e){var b=e.target.closest('[data-fav]');if(!b)return;var m=Store.find('meals',b.dataset.fav);Store.add('meals',{date:D.today(),meal:'dinner',title:m.title,ingredients:(m.ingredients||[]).slice()});UI.toast('Добавлено на сегодня');App.refresh()}}});
    };
    body.onclick=function(e){
      var add=e.target.closest('[data-mealadd]'),ed=e.target.closest('[data-mealedit]'),ct=e.target.closest('[data-cart]');
      if(ct){
        var m=Store.find('meals',ct.dataset.cart);
        (m.ingredients||[]).forEach(function(i){Store.add('purchases',{name:i.name,qty:i.qty||1,unit:'шт',price:0,category:'Продукты',shop:'',status:'plan',comment:'из блюда: '+m.title})});
        UI.toast('Ингредиенты добавлены в список покупок');App.refresh();return;
      }
      function open(item,date,meal){
        var ingRaw=item?((item.ingredients||[]).map(function(i){return [i.name,i.qty].filter(Boolean).join(' — ')}).join('\n')):'';
        UI.form({title:'Приём пищи',fields:[
          {k:'title',label:'Блюдо',required:true},{k:'date',label:'Дата',type:'date',required:true},
          {k:'meal',label:'Приём',type:'select',options:MEALS.map(function(m){return {v:m[0],label:m[1]}})},
          {k:'ingRaw',label:'Ингредиенты',type:'textarea',rows:3,hint:'По одному в строке: Молоко — 1 л',full:true},
          {k:'fav',label:'Добавить в любимые блюда',type:'checkbox'}],
          values:item?Object.assign({},item,{ingRaw:ingRaw}):{date:date,meal:meal,ingRaw:''},
          submit:function(v,c){
            var ing=String(v.ingRaw||'').split('\n').map(function(l){return l.trim()}).filter(Boolean).map(function(l){var p=l.split(/[—–-]/).map(function(s){return s.trim()});return {name:p[0],qty:p[1]||'1'}});
            delete v.ingRaw;v.ingredients=ing;
            item?Store.update('meals',item.id,v):Store.add('meals',v);c();UI.toast('Сохранено');App.refresh();
          }});
      }
      if(add){var parts=add.dataset.mealadd.split('|');return open(null,parts[0],parts[1])}
      if(ed){return open(Store.find('meals',ed.dataset.mealedit))}
    };
  }

  if(st.tab==='cost'){
    var mk=D.mk(D.today()),s=monthStats(mk),plan=Store.st().foodBudget||0;
    var ops=Store.get('finance').filter(function(f){return f.type==='expense'&&f.category==='Продукты'&&D.mk(f.date)===mk});
    body.innerHTML='<div class="grid cols2"><div class="card"><h3>Расходы на продукты · '+D.monthName(mk)+'</h3><div class="row gap16 mt12 wrap"><div class="kpi"><b class="neg">'+money(s.byCat['Продукты']||0)+'</b><span>факт</span></div><div class="kpi"><b>'+money(plan)+'</b><span>план на месяц</span></div></div>'+(plan?('<div class="mt12">'+UI.bar(pct(s.byCat['Продукты']||0,plan))+'<div class="tiny muted mt8">'+pct(s.byCat['Продукты']||0,plan)+'% бюджета</div></div>'):'')+'<div class="row gap8 mt16"><button class="btn sm" data-a="plan">Задать план</button><button class="btn sm primary" data-a="addop">'+icon('plus')+' Записать расход</button></div></div><div class="card"><h3>История покупок</h3><div class="scroll-x mt12"><table class="tbl"><thead><tr><th>Дата</th><th>Название</th><th>Сумма</th><th></th></tr></thead><tbody>'+(ops.length?ops.map(function(o){return '<tr><td>'+D.short(o.date)+'</td><td>'+esc(o.title)+'</td><td class="neg">'+money(o.amount)+'</td><td><button class="btn icon ghost" data-x="edit" data-id="'+o.id+'">'+icon('pen')+'</button></td></tr>'}).join(''):'<tr><td colspan="4" class="muted small">В этом месяце расходов на продукты нет</td></tr>')+'</tbody></table></div></div></div>';
    body.querySelector('[data-a=plan]').onclick=function(){UI.form({title:'План расходов на продукты',width:420,fields:[{k:'foodBudget',label:'Сумма на месяц, ₽',type:'number',required:true}],values:Store.st(),submit:function(v,c){var s2=Store.st();s2.foodBudget=+v.foodBudget;Store.save();c();UI.toast('План сохранён');App.refresh()}})};
    body.querySelector('[data-a=addop]').onclick=function(){openItemForm('finance',{type:'expense',category:'Продукты',date:D.today()})};
    body.onclick=function(e){var b=e.target.closest('[data-x=edit]');if(b)openItemForm('finance',Store.find('finance',b.dataset.id))};
  }
};