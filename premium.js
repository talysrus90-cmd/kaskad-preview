'use strict';
/* Экспериментальная версия «КАСКАД». Функции просмотра — без API и без передачи данных. */
(() => {
  const $ = (selector, root=document) => root.querySelector(selector);
  const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
  function setupCompare(){
    const input=$('#premiumCompareRange');
    const frame=$('#premiumCompareFrame');
    if(!input||!frame)return;
    function update(){
      const position=Number(input.value);
      frame.style.setProperty('--split',position+'%');
      input.setAttribute('aria-valuetext',position+' процентов от изображения «До»');
    }
    input.addEventListener('input',update,{passive:true});update();
  }
  function setupMaterials(){
    const stage=$('#premiumMaterialStage'),buttons=$$('[data-premium-material]'),label=$('#premiumMaterialLabel'),detail=$('#premiumMaterialDetail'),sample=$('#premiumMaterialSample');
    if(!stage||!sample||!label||!detail)return;
    const materials={
      wood:{name:'Натуральный дуб',detail:'Паркетная фактура · тёплый оттенок'},
      microcement:{name:'Микроцемент',detail:'Монолитная поверхность · светлый графит'},
      stone:{name:'Светлый камень',detail:'Природная фактура · мягкий кремовый'}
    };
    function choose(id){
      if(!materials[id])return;
      stage.dataset.material=id;
      sample.dataset.material=id;
      label.textContent=materials[id].name;
      detail.textContent=materials[id].detail;
      buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.premiumMaterial===id)));
    }
    buttons.forEach(b=>b.addEventListener('click',()=>choose(b.dataset.premiumMaterial)));
    choose('wood');
  }
  function setupProgress(){
    const indicator=document.createElement('div');
    indicator.className='premium-reading-progress';
    indicator.setAttribute('aria-hidden','true');
    document.body.prepend(indicator);
    let queued=false;
    function draw(){
      const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
      const ratio=Math.max(0,Math.min(1,scrollY/max));
      indicator.style.setProperty('--read-progress',ratio.toFixed(4));
      queued=false;
    }
    function request(){
      if(queued)return;
      queued=true;requestAnimationFrame(draw);
    }
    addEventListener('scroll',request,{passive:true});
    addEventListener('resize',request,{passive:true});
    addEventListener('load',request,{once:true});
    draw();
  }
  function setupChat(){
    const old=$('.floating');
    if(old)old.remove();
    const wrapper=document.createElement('div');
    wrapper.innerHTML=`
      <button type="button" class="premium-chat-launcher" id="premiumChatLauncher" aria-label="Помощь с выбором услуги" aria-controls="premiumChatPanel" aria-expanded="false">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 5.5h16v11H9l-5 4v-15Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M8 10h8M8 13h5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
      </button>
      <div class="premium-chat-tip" id="premiumChatTip" hidden role="status">
        <button type="button" class="premium-tip-close" aria-label="Скрыть подсказку">×</button>
        Привет! Помочь с расчётом ремонта или показать идеи интерьеров?
      </div>
      <aside class="premium-chat-panel" id="premiumChatPanel" hidden aria-label="Помощь по сайту">
        <button type="button" class="premium-chat-close" aria-label="Закрыть помощника">×</button>
        <p class="premium-kicker" style="margin-bottom:13px">Помощник «КАСКАД»</p>
        <h3>С чего начнём?</h3>
        <p>Выберите интересующий раздел — поможем быстро перейти к нужной информации.</p>
        <button class="premium-chat-link" type="button" data-guide-to="calculator">Рассчитать стоимость <span aria-hidden="true">↗</span></button>
        <button class="premium-chat-link" type="button" data-guide-to="inspiration">Посмотреть архитектуру и интерьеры <span aria-hidden="true">↗</span></button>
        <button class="premium-chat-link" type="button" data-guide-to="transformation">Открыть «До / После» <span aria-hidden="true">↗</span></button>
        <p class="premium-chat-footnote">Демонстрационный навигатор, не живой чат с менеджером.</p>
      </aside>`;
    const launcher=wrapper.children[0],tip=wrapper.children[1],panel=wrapper.children[2];
    document.body.append(launcher,tip,panel);
    const closePanel=()=>{panel.hidden=true;launcher.setAttribute('aria-expanded','false')};
    const openPanel=()=>{panel.hidden=false;tip.hidden=true;launcher.setAttribute('aria-expanded','true')};
    launcher.addEventListener('click',()=>{
      if(panel.hidden)openPanel();else closePanel();
    });
    $('.premium-chat-close',panel).addEventListener('click',closePanel);
    $('.premium-tip-close',tip).addEventListener('click',()=>{
      tip.hidden=true;
      try{sessionStorage.setItem('kaskad-premium-tip-dismissed','1')}catch{}
    });
    $$('[data-guide-to]',panel).forEach(button=>button.addEventListener('click',()=>{
      const target=document.getElementById(button.dataset.guideTo);
      closePanel();
      target?.scrollIntoView({behavior:reducedMotion.matches?'auto':'smooth',block:'start'});
    }));
    launcher.addEventListener('mouseenter',()=>{if(panel.hidden)tip.hidden=false});
    launcher.addEventListener('mouseleave',()=>{if(panel.hidden)tip.hidden=true});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){closePanel();launcher.focus()}});
    document.addEventListener('click',e=>{if(!panel.hidden&&!panel.contains(e.target)&&e.target!==launcher)closePanel()});
    setTimeout(()=>{
      let dismissed=false;
      try{dismissed=sessionStorage.getItem('kaskad-premium-tip-dismissed')==='1'}catch{}
      if(!dismissed&&panel.hidden&&!document.hidden&&scrollY<200)tip.hidden=false;
    },15000);
  }
  function setupReveals(){
    const elements=$$('.premium-reveal');
    if(reducedMotion.matches||!('IntersectionObserver' in window))return;
    document.documentElement.classList.add('premium-motion-ready');
    const obs=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add('is-visible');obs.unobserve(entry.target);
        }
      });
    },{threshold:.075,rootMargin:'0px 0px 20px 0px'});
    elements.forEach(el=>obs.observe(el));
    reducedMotion.addEventListener('change',()=>{
      if(reducedMotion.matches){
        obs.disconnect();document.documentElement.classList.remove('premium-motion-ready');
      }
    });
  }
  function init(){
    setupCompare();setupMaterials();setupProgress();setupChat();setupReveals();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
