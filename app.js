var ТГ = window.Telegram && window.Telegram.WebApp;
if (ТГ && ТГ.initData !== undefined) {
  ТГ.ready(); ТГ.expand();
  if (ТГ.colorScheme) document.documentElement.setAttribute('data-theme', ТГ.colorScheme);
  ТГ.onEvent('themeChanged', function(){ document.documentElement.setAttribute('data-theme', ТГ.colorScheme); });
}
function вибро(){ try{ ТГ.HapticFeedback.selectionChanged(); }catch(e){} }
function открыть(url){ if(!url) return; try{ ТГ.openLink(url); }catch(e){ window.open(url,'_blank','noopener'); } }
function написать(ник){ var u='https://t.me/'+String(ник).replace('@',''); try{ ТГ.openTelegramLink(u); }catch(e){ window.open(u,'_blank','noopener'); } }

var эк=document.getElementById('экран'), Д=null;
function эл(т,кл,вн){var e=document.createElement(т); if(кл)e.className=кл; if(вн!=null)e.innerHTML=вн; return e;}
function экр(s){return String(s==null?'':s).replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];});}

/* ---------- даты: в таблице семь разных форматов, приводим к одному ---------- */
var МЕС=['январ','феврал','март','апрел','ма','июн','июл','август','сентябр','октябр','ноябр','декабр'];
var МЕС_РОД=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
var ДНИ=['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'];
var ДНИ_КОР=['вс','пн','вт','ср','чт','пт','сб'];
var сегодня=new Date(); сегодня.setHours(0,0,0,0);
/* Сессии по графику института (rivsh-schedule): «в сессию» человеку ничего не говорит —
   он и сейчас на сессии. Называем номер: «2-я сессия». */
var СЕССИИ=[
  {н:1, с:new Date(2026,7,24),  по:new Date(2026,8,19)},
  {н:2, с:new Date(2027,0,25),  по:new Date(2027,1,20)},
  {н:3, с:new Date(2027,7,23),  по:new Date(2027,8,18)},
  {н:4, с:new Date(2028,0,24),  по:new Date(2028,2,17)}
];
function сессияОбъект(д){
  if(!д) return null;
  for(var i=0;i<СЕССИИ.length;i++) if(д>=СЕССИИ[i].с && д<=СЕССИИ[i].по) return СЕССИИ[i];
  // срок стоит до начала сессии — относим к ближайшей следующей
  for(var j=0;j<СЕССИИ.length;j++) if(д<СЕССИИ[j].с) return СЕССИИ[j];
  return null;
}
function сессияДля(д){ var с=сессияОбъект(д); return с? с.н : null; }
/** Сессия, которой живём: идущая сейчас, а между сессиями — ближайшая будущая.
    Ею задаётся окно первого экрана. */
function рабочаяСессия(){ return сессияОбъект(сегодня); }

/** «04.09.2026» · «03.09» · «⏰ 17 сентября» · «январь–февраль 2027» → {дата, точная} */
function разобратьСрок(текст){
  var t=String(текст||'').replace(/[⏰\s]+/g,' ').trim();
  var m=t.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if(m) return {дата:new Date(+m[3],+m[2]-1,+m[1]), точная:true, текст:t};
  m=t.match(/(\d{1,2})\.(\d{1,2})(?!\d)/);                     // «03.09» — год берём ближайший
  if(m){var г=(+m[2]-1<сегодня.getMonth()-1)?сегодня.getFullYear()+1:сегодня.getFullYear();
        return {дата:new Date(г,+m[2]-1,+m[1]), точная:true, текст:t};}
  m=t.match(/(\d{1,2})\s+([а-яё]+)/i);                          // «17 сентября»
  if(m){var i=найтиМесяц(m[2]); if(i>=0){var г2=i<сегодня.getMonth()?сегодня.getFullYear()+1:сегодня.getFullYear();
        return {дата:new Date(г2,i,+m[1]), точная:true, текст:t};}}
  m=t.match(/([а-яё]+)[^а-яё]*(\d{4})/i);                       // «январь 2027», «январь–февраль 2027»
  if(m){var j=найтиМесяц(m[1]); if(j>=0) return {дата:new Date(+m[2],j,1), точная:false, текст:t};}
  return {дата:null, точная:false, текст:t};
}
function найтиМесяц(слово){
  var с=слово.toLowerCase();
  for(var k=0;k<МЕС.length;k++) if(с.indexOf(МЕС[k])===0) return k;
  return -1;
}
function черезДней(д){ return d0(д); }
function d0(д){ return д? Math.round((д-сегодня)/864e5) : 99999; }
/** «сегодня» · «завтра» · «через 5 дней» · «в сессию» */
function подписьСрока(с){
  if(!с.дата) return с.текст || 'без срока';
  var n=d0(с.дата);
  if(!с.точная){
    if(n<0) return 'прошло';
    var ном=сессияДля(с.дата);
    return ном ? ном+'-я сессия' : 'в этом месяце';
  }
  if(n<0) return 'просрочено';
  if(n===0) return 'сегодня';
  if(n===1) return 'завтра';
  if(n<=6) return 'через '+n+' дн.';
  return с.дата.getDate()+' '+МЕС_РОД[с.дата.getMonth()];
}
function классСрока(с){
  if(!с.дата||!с.точная) return '';
  var n=d0(с.дата);
  if(n<0) return '';
  if(n<=1) return ' завтра';
  if(n<=14) return ' горит';
  return '';
}
function дденьМесяца(строкаДня){
  var m=String(строкаДня).match(/(\d{2})\.(\d{2})/);
  return m? new Date(сегодня.getFullYear(),+m[2]-1,+m[1]) : null;
}
function ддмм(д){ return ('0'+д.getDate()).slice(-2)+'.'+('0'+(д.getMonth()+1)).slice(-2); }

/* ---------- предмет как сущность ----------
   В таблице дисциплина названа по-разному в каждом листе: «Информационные технологии»,
   «ИНФОРМАЦИОННЫЕ ТЕХНОЛОГИИ · Галецкий А.В.», «03 · Информационные технологии в работе
   психолога». Сводим по первым двум словам — проверено, на всех листах даёт один ключ.
   Правильное решение — единый справочник дисциплин в таблице; тогда это уйдёт. */
function ключДис(с){
  с=String(с||'').replace(/^\d+\s*·\s*/,'').split('·')[0].trim().toLowerCase().replace(/ё/g,'е');
  return с.split(/\s+/).slice(0,2).join(' ');
}
var СЛУЖЕБНЫЕ={'общее для':1,'дисциплины, которые':1,'':1};

function собратьПредметы(){
  var карта={};
  function узел(имя){
    var к=ключДис(имя);
    if(СЛУЖЕБНЫЕ[к]) return null;
    if(!карта[к]) карта[к]={ключ:к, имя:String(имя).replace(/^\d+\s*·\s*/,'').split('·')[0].trim(),
      преп:'', пары:[], дела:[], мат:[], книги:0};
    return карта[к];
  }
  Д.расписание.forEach(function(п){ var у=узел(п.дис); if(!у) return;
    у.пары.push(п); if(!у.преп&&п.преп) у.преп=п.преп;
    if(п.дис.length>у.имя.length) у.имя=п.дис; });
  Д.задания.forEach(function(з){ var у=узел(з.дис); if(у) у.дела.push(з); });
  Д.материалы.forEach(function(м){ var у=узел(м.с); if(у){ у.мат.push(м);
    if(!у.преп){ var ч=String(м.с).split('·')[1]; if(ч) у.преп=ч.trim(); } } });
  // книги привязаны к преподавателю — сопоставляем через него
  var попреп={};
  Object.keys(карта).forEach(function(к){ var ф=(карта[к].преп||'').split(' ')[0]; if(ф) попреп[ф]=к; });
  Д.книги.forEach(function(кн){ var ф=String(кн.кто||'').split(' ')[0];
    if(попреп[ф]) карта[попреп[ф]].книги++; });
  return Object.keys(карта).map(function(к){return карта[к];});
}
function ближайшаяПара(у){
  var буд=у.пары.map(function(п){return {п:п,д:дденьМесяца(п.д)};})
    .filter(function(x){return x.д&&x.д>=сегодня;}).sort(function(a,b){return a.д-b.д;});
  return буд.length? буд[0] : null;
}

/* ---------- вкладки ---------- */
var ВКЛАДКИ=[
 {id:'сегодня',имя:'Сегодня',икона:'M3 9h18M7 3v3m10-3v3M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z',рисуй:экранСегодня},
 {id:'пары',имя:'Пары',икона:'M12 7v5l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z',рисуй:экранПары},
 {id:'дела',имя:'Задания',икона:'M9 11l3 3 6-6M4 6h4M4 12h3M4 18h5M20 12v6a2 2 0 01-2 2H6',рисуй:экранДел},
 {id:'книги',имя:'Книги',икона:'M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2V5zm2 14h13',рисуй:экранКниг},
 {id:'предметы',имя:'Предметы',икона:'M4 6h16M4 12h16M4 18h10',рисуй:экранПредметов},
 {id:'люди',имя:'Люди',икона:'M16 20v-1a4 4 0 00-4-4H7a4 4 0 00-4 4v1M10 11a4 4 0 100-8 4 4 0 000 8zm11 9v-1a4 4 0 00-3-3.9',рисуй:экранЛюдей}
];
var активная='сегодня', раскрытые={}, открытыйПредмет=null;
// откуда вошли в предмет: «назад» должно возвращать именно туда
var откудаПредмет='предметы';
var табы=document.getElementById('табы');
ВКЛАДКИ.forEach(function(в){
  var b=эл('button','таб','<svg viewBox="0 0 24 24"><path d="'+в.икона+'"/></svg><span>'+в.имя+'</span>');
  b.setAttribute('role','tab');
  b.onclick=function(){
    if(активная===в.id&&в.id==='предметы') открытыйПредмет=null;   // повторный тап — назад к списку
    активная=в.id; вибро(); отрисовать();
  };
  табы.appendChild(b);
});
function перейти(куда){ активная=куда; отрисовать(); }
function отрисовать(){
  for(var i=0;i<табы.children.length;i++) табы.children[i].setAttribute('aria-selected',ВКЛАДКИ[i].id===активная);
  if(!Д) return;
  эк.innerHTML=''; эк.scrollTop=0;
  ВКЛАДКИ.filter(function(в){return в.id===активная;})[0].рисуй();

}

/* ---------- Сегодня ---------- */
/* Окно первого экрана — текущая сессия: пока она идёт, показываем её задания; кончилась —
   окном становится следующая. ОКНО_ЗАПАС в днях используется, только если сессии в графике
   кончились (после 4-й) — иначе экран не показывал бы ничего. */
var ОКНО_ЗАПАС=28, ПОТОЛОК_ДЕЛ=3;
function экранСегодня(){
  var п=ДНИ[сегодня.getDay()]; п=п.charAt(0).toUpperCase()+п.slice(1);
  эк.appendChild(эл('div','шапка','<h2>'+экр(п)+', '+сегодня.getDate()+' '+МЕС_РОД[сегодня.getMonth()]+'</h2>'));

  var сег=Д.расписание.filter(function(x){var d=дденьМесяца(x.д); return d&&ддмм(d)===ддмм(сегодня);});
  if(сег.length){
    эк.appendChild(эл('div','секц','Пары сегодня'));
    сег.forEach(function(x){эк.appendChild(картаПары(x,true,true));});
  }else{
    var буд=Д.расписание.filter(function(x){var d=дденьМесяца(x.д); return d&&d>сегодня;});
    эк.appendChild(эл('div','секц','Сегодня пар нет'));
    if(буд.length){
      var д=дденьМесяца(буд[0].д);
      эк.appendChild(эл('div','мелко','Ближайшая — '+ДНИ_КОР[д.getDay()]+' '+д.getDate()+' '+МЕС_РОД[д.getMonth()]));
      Д.расписание.filter(function(x){return x.д===буд[0].д;}).forEach(function(x){эк.appendChild(картаПары(x,false,true));});
    }
  }
  if(Д.расписание.length){
    // тот же ход, что у заданий: из блока можно уйти в полный список, не целясь в таб внизу
    var кр=эл('button','ещё','Всё расписание');
    кр.onclick=function(){вибро(); перейти('пары');};
    эк.appendChild(кр);
  }

  // Что попадает на первый экран: срок в ближайшие ОКНО дней, не больше ПОТОЛОК карточек.
  // Окно решает «что близко», потолок держит высоту экрана постоянной — десять горящих
  // заданий или пятьдесят, видно всё равно три ближайших, остальное за кнопкой.
  var дела=Д.задания.map(подготовитьДело).filter(function(з){return з.n>=0;})
    .sort(function(a,b){return a.n-b.n;});
  if(дела.length){
    var сес=рабочаяСессия(), край=сес? d0(сес.по) : ОКНО_ЗАПАС;
    var близкие=дела.filter(function(з){return з.n<=край;});
    if(близкие.length){
      эк.appendChild(эл('div','секц','Ближайшие задания'));
      близкие.slice(0,ПОТОЛОК_ДЕЛ).forEach(function(з){эк.appendChild(картаДела(з));});
    }else{
      // окно пустое: заголовок без карточек выглядел бы поломкой — одна строка вместо секции
      эк.appendChild(эл('div','секц','Ближайших заданий нет'));
      эк.appendChild(эл('div','мелко','Ближайшее — '+экр(дела[0].подпись)));
    }
    if(дела.length>близкие.slice(0,ПОТОЛОК_ДЕЛ).length){
      var к=эл('button','ещё','Все задания');
      к.onclick=function(){вибро(); перейти('дела');};
      эк.appendChild(к);
    }
  }
}
function картаПары(п,акцент,вести){
  var c=эл('div','карта'+(акцент?' акцент':''));
  // вид занятия — своей строкой под названием: постоянное место, туда же
  // потом встанут «зачёт» и «экзамен»
  var вид=видЗанятия(п.вид);
  c.appendChild(эл('div','пара','<div class="время">'+экр(п.вр).replace('–','<br>')+'</div>'+
    '<div><div class="дис">'+экр(п.дис)+'</div>'+
    (вид?'<div class="вид"><span class="бейдж">'+экр(вид)+'</span></div>':'')+
    '<div class="мелко">'+экр(п.преп||'—')+'</div></div>'+
    (вести?'<div class="ведёт">›</div>':'')));
  if(вести){
    // не <button>: связка кнопки с эффектом нажатия давала вспышку в WebView Telegram
    c.classList.add('кликабельна');
    c.onclick=function(){ вибро(); открытыйПредмет=ключДис(п.дис); откудаПредмет=активная; перейти('предметы'); };
  }
  return c;
}
/** «практическое» → «практика»: короче и в один ряд с будущими «зачёт», «экзамен».
    Лекцию не помечаем — это обычный случай, метка была бы шумом. */
function видЗанятия(в){
  var т=String(в||'').toLowerCase().trim();
  if(!т || т==='лекция') return '';
  if(т.indexOf('практич')===0) return 'практика';
  return т;
}

/* ---------- Пары: по дням, как календарь ---------- */
var показыватьПрошлые=false;
function экранПары(){
  эк.appendChild(эл('div','шапка','<h2>Расписание</h2>'));
  var ч=эл('button','чип',показыватьПрошлые?'скрыть прошедшие':'показать прошедшие');
  ч.setAttribute('aria-pressed',показыватьПрошлые);
  ч.onclick=function(){показыватьПрошлые=!показыватьПрошлые; вибро(); отрисовать();};
  var обёртка=эл('div','чипы'); обёртка.appendChild(ч); эк.appendChild(обёртка);

  var поДням={}, порядок=[];
  Д.расписание.forEach(function(п){
    if(!поДням[п.д]){поДням[п.д]=[]; порядок.push(п.д);} поДням[п.д].push(п);
  });
  var неделя='', показано=0;
  порядок.forEach(function(ключ){
    var д=дденьМесяца(ключ), прошло=д&&д<сегодня, сег=д&&ддмм(д)===ддмм(сегодня);
    if(прошло&&!показыватьПрошлые) return;
    показано++;
    var н=поДням[ключ][0].н;
    if(н!==неделя){неделя=н; эк.appendChild(эл('div','секц',экр(н)));}
    var шапкаДня=эл('div','день'+(сег?' сегодня':''));
    var число=д?д.getDate()+' '+МЕС_РОД[д.getMonth()].slice(0,3):ключ;
    шапкаДня.innerHTML='<span class="число">'+экр(число)+'</span>'+
      '<span class="подпись">'+экр(ключ.split(' ')[0])+'</span>'+(сег?'<span class="метка">сегодня</span>':'');
    эк.appendChild(шапкаДня);
    поДням[ключ].forEach(function(п){
      var c=картаПары(п,сег,true); if(прошло) c.className+=' тихо'; эк.appendChild(c);
    });
  });
  if(!показано) эк.appendChild(эл('div','пусто','Впереди пар нет'));
}

/* ---------- Задания ---------- */
function подготовитьДело(з){
  var с=разобратьСрок(з.срок);
  // 🔴 Неточный срок («январь–февраль 2027») разбирается в 1-е число месяца. Считать дни
  // по нему нельзя: 2 января задание стало бы просроченным — ровно тогда, когда сессия
  // началась и оно наконец актуально. Такие сроки меряем КОНЦОМ своей сессии.
  var база=с.дата;
  if(с.дата && !с.точная){ var сес=сессияОбъект(с.дата); if(сес) база=сес.по; }
  return {что:з.что, дис:(з.дис||'').split('·')[0].trim(), кто:з.кто, ком:з.ком, мат:з.мат,
          срок:с, n:база? d0(база) : 99999, подпись:подписьСрока(с), кл:классСрока(с)};
}
function картаДела(з){
  // Обычный блок, не кнопка: кликается только кнопка материала и ссылка «Подробнее».
  // Длинные описания сворачиваем БЕЗ анимации высоты — в WebView Telegram она
  // вместе с эффектом нажатия давала вспышку на кадр.
  var c=эл('div','карта');
  c.appendChild(эл('div','дело',
    '<div class="верх"><div class="предмет">'+экр(з.дис||'без дисциплины')+'</div>'+
    '<span class="срок'+з.кл+'">'+экр(з.подпись)+'</span></div>'+
    '<div class="что">'+экр(з.что)+'</div>'+
    (function(){ var т=чистыйКоммент(з.ком); if(!т) return '';
       var длинно=т.length>150||т.indexOf('\n')>=0;
       return '<div class="мелко текст'+(длинно?' свёрнут':'')+'">'+экр(т)+'</div>'+
              (длинно?'<span class="ещё">Подробнее</span>':''); })()+
    (з.мат?'<div class="низ"><a class="кнопка главная" data-сс="'+экр(з.мат)+'">'+
      (своя(з.мат)?'Материалы предмета':'Открыть материал')+'</a></div>':'')));
  var ещё=c.querySelector('.ещё');
  if(ещё) ещё.onclick=function(e){ e.stopPropagation(); вибро();
    var т=c.querySelector('.мелко.текст'); var скрыт=т.classList.contains('свёрнут');
    т.classList.toggle('свёрнут'); ещё.textContent=скрыт?'Свернуть':'Подробнее'; };
  var кн=c.querySelector('[data-сс]');
  if(кн) кн.onclick=function(e){ e.stopPropagation(); вибро();
    var сс=кн.getAttribute('data-сс');
    // Ссылка на нашу же таблицу = «материалов много, они перечислены у предмета».
    // Наружу не выходим: на телефоне это выкидывает из приложения в Google Sheets.
    if(своя(сс)){ открытыйПредмет=ключДис(з.дис); откудаПредмет=активная; перейти('предметы'); return; }
    открыть(сс); };
  return c;
}
/** Ссылка ведёт в нашу же таблицу (а не наружу): признак — адрес Google Sheets с якорем range. */
function своя(сс){ return /docs\.google\.com\/spreadsheets/.test(String(сс||'')) && /range=/.test(String(сс||'')); }
/** «задано 27.08 · нужны двое…» → «Нужны двое…»: дата постановки в списке не нужна,
    а хвост начинается со строчной, потому что был продолжением фразы. */
function чистыйКоммент(текст){
  var т=String(текст||'').replace(/^\s*задано\s+\d{1,2}\.\d{2}(\.\d{4})?\s*(на паре)?\s*·?\s*/i,'').trim();
  return т ? т.charAt(0).toUpperCase()+т.slice(1) : '';
}

function экранДел(){
  эк.appendChild(эл('div','шапка','<h2>Задания</h2>'));
  var все=Д.задания.map(подготовитьДело).sort(function(a,b){return a.n-b.n;});
  var группы=[
    ['Ближайшие', все.filter(function(з){return з.n>=0&&з.n<=14;})],
    ['Дальше',    все.filter(function(з){return з.n>14&&з.n<9999;})],
    ['Ко 2-й сессии', все.filter(function(з){return з.n>=9999;})],
    ['Прошло',    все.filter(function(з){return з.n<0;})]
  ];
  группы.forEach(function(г){
    if(!г[1].length) return;
    эк.appendChild(эл('div','секц',г[0]+' · '+г[1].length));
    г[1].forEach(function(з){
      var c=картаДела(з);
      if(г[0]==='Прошло') c.className+=' тихо';
      эк.appendChild(c);
    });
  });
}

/* ---------- Книги ---------- */
var запрос='', фВажные=false, фПредмет='', фКто='';
function экранКниг(){
  эк.appendChild(эл('div','шапка','<h2>Книги</h2>'));
  var п=эл('input','поиск'); п.type='search'; п.placeholder='Автор или название'; п.value=запрос;
  п.oninput=function(e){запрос=e.target.value; списокКниг();};
  эк.appendChild(п);

  var ряд1=эл('div','чипы');
  ряд1.appendChild(чип('★ к экзамену', фВажные, function(){фВажные=!фВажные; отрисовать();}));
  собрать(Д.книги,'кто').forEach(function(к){
    ряд1.appendChild(чип(к.split(' ')[0], фКто===к, function(){фКто=(фКто===к?'':к); отрисовать();}));
  });
  эк.appendChild(ряд1);

  var ряд2=эл('div','чипы');
  собрать(Д.книги,'б').forEach(function(б){
    ряд2.appendChild(чип(б.length>26?б.slice(0,24)+'…':б, фПредмет===б, function(){фПредмет=(фПредмет===б?'':б); отрисовать();}));
  });
  эк.appendChild(ряд2);

  эк.appendChild(эл('div','счёт','','')); эк.lastChild.id='счёткниг';
  var h=эл('div'); h.id='спискниг'; эк.appendChild(h);
  списокКниг();
}
function чип(текст,активен,действие){
  var b=эл('button','чип',экр(текст));
  b.setAttribute('aria-pressed',активен?'true':'false');
  b.onclick=function(){вибро(); действие();};
  return b;
}
function собрать(массив,поле){
  var о={}; массив.forEach(function(x){ if(x[поле]) о[x[поле]]=(о[x[поле]]||0)+1; });
  return Object.keys(о).sort(function(a,b){return о[b]-о[a];});
}
/* «Белановская О.В. · Журавкина И.С.» в расписании и «Белановская О.В.» в книгах —
   один человек, поэтому преподавателя сравниваем по фамилии */
function фамилия(с){ return String(с||'').trim().split(/[\s·]+/)[0].toLowerCase(); }
function отобранные(){
  var q=запрос.trim().toLowerCase(), ф=фамилия(фКто);
  return Д.книги.filter(function(к){
    return (!фВажные||к.з) && (!фПредмет||к.б===фПредмет) && (!ф||фамилия(к.кто)===ф) &&
           (!q||(к.а+' '+к.н).toLowerCase().indexOf(q)>=0);
  });
}
function списокКниг(){
  var h=document.getElementById('спискниг'); if(!h) return;
  var наш=отобранные();
  document.getElementById('счёткниг').textContent=наш.length+' из '+Д.книги.length;
  h.innerHTML='';
  if(!наш.length){h.appendChild(эл('div','пусто','Ничего не нашлось')); return;}
  наш.slice(0,50).forEach(function(к){
    var c=эл('div','карта книга');
    var кнопки='';
    if(к.ф) кнопки+='<a class="кнопка главная" data-сс="'+экр(к.ф)+'">Скачать</a>';
    if(к.куп) кнопки+='<a class="кнопка" data-куп="'+экр(к.куп)+'">Найти в продаже</a>';
    c.innerHTML='<div class="назв">'+(к.з?'<span class="звезда">★</span> ':'')+экр(к.н)+'</div>'+
      '<div class="авт">'+экр(к.а)+' · '+экр(к.кто)+'</div>'+(кнопки?'<div class="низ">'+кнопки+'</div>':'');
    [['data-сс',к.ф],['data-куп',к.куп]].forEach(function(п){
      var a=c.querySelector('['+п[0]+']'); if(a) a.onclick=function(){вибро(); открыть(п[1]);};
    });
    h.appendChild(c);
  });
  if(наш.length>50) h.appendChild(эл('div','пусто','показаны первые 50 — уточни поиск'));
}

/* ---------- Предметы ---------- */
function экранПредметов(){
  if(открытыйПредмет){ экранПредмета(открытыйПредмет); return; }
  var все=собратьПредметы();
  var идут=все.filter(function(у){return у.пары.length;});
  var позже=все.filter(function(у){return !у.пары.length;});
  эк.appendChild(эл('div','шапка','<h2>Предметы</h2>'));

  эк.appendChild(эл('div','секц','Идут сейчас'));
  var сетка=эл('div','плитки');
  идут.sort(function(a,b){
    var A=ближайшаяПара(a), B=ближайшаяПара(b);
    return (A?A.д:9e15)-(B?B.д:9e15);
  }).forEach(function(у){ сетка.appendChild(плиткаПредмета(у)); });
  эк.appendChild(сетка);

  if(позже.length){
    эк.appendChild(эл('div','секц','Материалы есть, пар пока нет'));
    var с2=эл('div','плитки');
    позже.forEach(function(у){ var п=плиткаПредмета(у); п.className+=' тихо'; с2.appendChild(п); });
    эк.appendChild(с2);
  }
}
function плиткаПредмета(у){
  var б=ближайшаяПара(у);
  var горит=у.дела.map(подготовитьДело).filter(function(з){return з.n>=0&&з.n<=14;}).length;
  var b=эл('button','плитка'+(б&&б.д&&ддмм(б.д)===ддмм(сегодня)?' идёт':''));
  var низ=[];
  if(б) низ.push(б.д.getDate()+' '+МЕС_РОД[б.д.getMonth()].slice(0,3)+', '+б.п.вр.split('–')[0]);
  if(у.дела.length) низ.push(у.дела.length+' зад.'+(горит?' · '+горит+' горит':''));
  if(у.книги) низ.push(у.книги+' кн.');
  b.innerHTML='<div class="назв">'+экр(у.имя)+'</div>'+
    '<div class="низстрока">'+экр(у.преп||'—')+'</div>'+
    (низ.length?'<div class="низстрока">'+низ.map(экр).join(' <span class="точка"></span> ')+'</div>':'');
  b.onclick=function(){ открытыйПредмет=у.ключ; откудаПредмет='предметы'; вибро(); отрисовать(); };
  return b;
}
function экранПредмета(ключ){
  var у=собратьПредметы().filter(function(x){return x.ключ===ключ;})[0];
  if(!у){ открытыйПредмет=null; экранПредметов(); return; }
  // Назад ведёт туда, откуда вошли, и подпись честно называет место.
  var НАЗАД={сегодня:'← Сегодня', пары:'← Расписание'};
  var откуда=откудаПредмет;
  var н=эл('button','назад', НАЗАД[откуда] || '← Все предметы');
  н.onclick=function(){
    открытыйПредмет=null; вибро();
    if(НАЗАД[откуда]){ откудаПредмет='предметы'; перейти(откуда); return; }
    отрисовать();
  };
  эк.appendChild(н);
  эк.appendChild(эл('div','предмет-шапка','<h2>'+экр(у.имя)+'</h2><div class="преп">'+экр(у.преп||'преподаватель не указан')+'</div>'));

  var б=ближайшаяПара(у);
  эк.appendChild(эл('div','секц','Пары'));
  if(б){
    var сег=ддмм(б.д)===ддмм(сегодня);
    var c=картаПары(б.п,сег);
    c.querySelector('.время').innerHTML=б.д.getDate()+' '+МЕС_РОД[б.д.getMonth()].slice(0,3)+'<br>'+экр(б.п.вр);
    эк.appendChild(c);
  }
  var всего=у.пары.length, прошло=у.пары.length-у.пары.filter(function(п){var d=дденьМесяца(п.д); return d&&d>=сегодня;}).length;
  эк.appendChild(рядСо('Все пары предмета', всего+' · прошло '+прошло, function(){ открытыйПредмет=null; перейти('пары'); }));

  эк.appendChild(эл('div','секц','Задания'));
  var дела=у.дела.map(подготовитьДело).sort(function(a,b){return a.n-b.n;});
  if(!дела.length) эк.appendChild(эл('div','ряд нечего','Заданий нет<span class="право">0</span>'));
  дела.slice(0,3).forEach(function(з){ эк.appendChild(картаДела(з)); });
  if(дела.length>3) эк.appendChild(рядСо('Ещё задания', дела.length-3, function(){ открытыйПредмет=null; перейти('дела'); }));

  if(у.мат.length){
    эк.appendChild(эл('div','секц','Материалы и папки'));
    у.мат.forEach(function(м){
      эк.appendChild(рядСо(м.что, м.тип||'', function(){ открыть(м.сс); }, !м.сс));
    });
  }

  if(у.книги){
    эк.appendChild(эл('div','секц','Книги'));
    эк.appendChild(рядСо('Литература предмета', у.книги, function(){
      фКто=(у.преп||''); фВажные=false; фПредмет=''; запрос='';
      открытыйПредмет=null; перейти('книги');
    }));
  }
}
function рядСо(текст, право, действие, мертвый){
  var b=эл('button','ряд'+(мертвый?' нечего':''),
    '<span>'+экр(текст)+'</span><span class="право">'+(право!==''&&право!=null?'<span class="число">'+экр(право)+'</span>':'')+
    (мертвый?'':'<span>›</span>')+'</span>');
  if(!мертвый&&действие) b.onclick=function(){ вибро(); действие(); };
  return b;
}

/* ---------- Контакты ---------- */
function экранЛюдей(){
  эк.appendChild(эл('div','шапка','<h2>Контакты</h2>'));
  var секции={};
  Д.контакты.forEach(function(ч){ (секции[ч.с]=секции[ч.с]||[]).push(ч); });
  Object.keys(секции).forEach(function(с){
    эк.appendChild(эл('div','секц',экр(с)));
    секции[с].forEach(function(ч,i){
      var ключ=с+i, открыт=!!раскрытые[ключ];
      var имя=ч.имя.replace(' · староста','');
      var части=имя.split(' ');
      var c=эл('button','карта');
      c.innerHTML='<div class="человек"><div class="аватар">'+
        экр(((части[0]||' ')[0]||'')+((части[1]||' ')[0]||''))+'</div>'+
        '<div><div class="имя">'+экр(части.slice(0,2).join(' '))+
        (ч.имя.indexOf('староста')>=0?'<span class="роль">староста</span>':'')+'</div>'+
        '<div class="мелко">'+экр(ч.тг||ч.тел||'—')+'</div></div></div>';
      if(открыт){
        var д=эл('div','раскрыто');
        if(ч.имя!==части.slice(0,2).join(' ')) д.appendChild(эл('div','строка','<span class="мелко">полное имя</span><span>'+экр(ч.имя.replace(' · староста',''))+'</span>'));
        if(ч.тел) д.appendChild(эл('div','строка','<span class="мелко">телефон</span><b>'+экр(ч.тел)+'</b>'));
        if(ч.поч) д.appendChild(эл('div','строка','<span class="мелко">почта</span><span>'+экр(ч.поч)+'</span>'));
        var низ=эл('div','низ');
        if(ч.тг){var b=эл('a','кнопка главная','Написать в Telegram'); b.onclick=function(e){e.stopPropagation(); вибро(); написать(ч.тг);}; низ.appendChild(b);}
        if(ч.тел&&ч.тел.indexOf('•')<0){var t=эл('a','кнопка','Позвонить'); t.href='tel:'+ч.тел.replace(/\s/g,''); низ.appendChild(t);}
        if(ч.инст){var g=эл('a','кнопка','Instagram');
          g.onclick=function(e){e.stopPropagation(); вибро(); открыть('https://instagram.com/'+String(ч.инст).replace('@','').replace(/^https?:\/\/(www\.)?instagram\.com\//,''));};
          низ.appendChild(g);}
        if(низ.children.length) д.appendChild(низ);
        c.appendChild(д);
      }
      c.onclick=function(){ раскрытые[ключ]=!раскрытые[ключ]; вибро(); отрисовать(); };
      эк.appendChild(c);
    });
  });
}

/* ---------- источник данных ----------
   Три случая:
   1) данные вшиты в страницу — прототип;
   2) страница отдана Apps Script — она живёт в песочнице на другом домене,
      поэтому fetch до своего же /exec упрётся в cross-origin. Мост google.script.run
      сделан ровно для этого;
   3) страница лежит на обычном хостинге — тогда обычный fetch. */
function ошибка(текст, заголовок){
  эк.innerHTML='';
  document.getElementById('табы').style.display='none';
  эк.appendChild(эл('div','шапка','<h2>'+экр(заголовок||'Не удалось загрузить')+'</h2>'));
  эк.appendChild(эл('div','пусто',текст));
}
/** Экран для тех, кто не в группе: куда попал и что делать. */
function отказДоступа(){
  эк.innerHTML='';
  эк.classList.add('по-центру');
  document.getElementById('табы').style.display='none';
  эк.appendChild(эл('div','отказ',
    '<div class="знак"><svg viewBox="0 0 24 24"><rect x="4" y="11" width="16" height="10" rx="2"/>'+
    '<path d="M8 11V7a4 4 0 018 0v4"/></svg></div>'+
    '<h2>Доступ закрыт</h2>'+
    '<p>Приложение учебной группы <b>ПМ 2.67к</b> — веб-психология, РИВШ.</p>'+
    '<p>Внутри расписание, задания и материалы группы, поэтому оно открыто только её участникам.</p>'+
    '<p class="тише">Ты из группы, но не пускает? Напиши <a href="https://t.me/constantinserdiuk">@constantinserdiuk</a></p>'));
}
/* Адрес API. Пустой — значит страницу отдаёт сам Apps Script (запасной путь). */
var АПИ='https://script.google.com/macros/s/AKfycbzDZD5a7kY_FKwNLizfpSIut3iwxCp2VTIxZIKr-8aQxdPdelMkoVoooCOywIYJ3CtRaQ/exec';

/** Прямой запрос: Apps Script отдаёт CORS `*`, поэтому fetch проходит.
    Раньше здесь был JSONP — сторонний <script> внутри мини-аппа Telegram
    не загружался и приложение висело на «Собираю расписание» (09.09). */
function спроситьТаблицу(url, готово, беда){
  var оборвать = new AbortController();
  var т = setTimeout(function(){ оборвать.abort(); }, 45000);
  fetch(url, {signal: оборвать.signal, cache: 'no-store'})
    .then(function(о){ if(!о.ok) throw new Error('сервер ответил ' + о.status); return о.json(); })
    .then(function(д){ clearTimeout(т); готово(д); })
    .catch(function(e){
      clearTimeout(т);
      беда(new Error(e.name === 'AbortError' ? 'Таблица долго не отвечает' : (e.message || 'нет связи')));
    });
}

var вшито=document.getElementById('данные').textContent.trim();

/** Последний удачный ответ храним в телефоне: открытие становится мгновенным,
    свежие данные подтягиваются фоном и молча заменяют показанное. */
var ПАМЯТЬ='пм267к-данные';
function изПамяти(){
  try{ var т=localStorage.getItem(ПАМЯТЬ); return т?JSON.parse(т):null; }catch(e){ return null; }
}
function вПамять(д){
  try{ localStorage.setItem(ПАМЯТЬ, JSON.stringify(д)); }catch(e){}
}

if(вшито && вшито.charAt(0)==='{'){
  Д=JSON.parse(вшито); отрисовать();
}else if(АПИ.indexOf('http')===0){
  var подпись=(ТГ && ТГ.initData) ? ТГ.initData : '';
  var было=изПамяти();
  if(было){ Д=было; отрисовать(); }              // показываем сразу, не ждём сервер
  спроситьТаблицу(АПИ+'?data=1&init='+encodeURIComponent(подпись),
    function(о){
      if(о && о.ok){
        Д=о.данные; вПамять(Д);
        try{ отрисовать(); }
        catch(e){ ошибка(экр('при отрисовке: '+e.message)); }
        return;
      }
      var т=String((о && о.ошибка)||'нет ответа').replace(/^Error:?\s*/,'');
      if(т.indexOf('ПМ 2.67к')>=0){ отказДоступа(); return; }
      if(!было) ошибка(экр(т));                   // есть что показать — молчим о сбое
    },
    function(e){
      if(было) return;                            // офлайн: остаёмся на сохранённых данных
      ошибка(экр(e.message)+'<br><br><button class="кнопка главная" onclick="location.reload()">Попробовать ещё раз</button>');
    });
}else if(window.google && google.script && google.script.run){
  var п2=(ТГ && ТГ.initData) ? ТГ.initData : '';
  google.script.run
    .withSuccessHandler(function(д){ Д=(typeof д==='string'?JSON.parse(д):д); отрисовать(); })
    .withFailureHandler(function(e){
      var т=(e&&e.message?e.message:String(e)).replace(/^Error:?\s*/,'');
      if(т.indexOf('ПМ 2.67к')>=0) отказДоступа(); else ошибка(экр(т));
    })
    .данныеГруппы(п2);
}else{
  отказДоступа();
}
