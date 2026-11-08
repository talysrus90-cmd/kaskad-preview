(function () {
  'use strict';
  const originalFetch = window.fetch.bind(window);
  const base = new URL('./', document.currentScript.src);
  const demoResponse = (payload, status=200) => Promise.resolve(new Response(JSON.stringify(payload), {
    status,headers:{'Content-Type':'application/json;charset=utf-8'}
  }));
  window.fetch = function(input, options) {
    let url;
    try { url = new URL(input instanceof Request ? input.url : String(input), document.baseURI); }
    catch { return originalFetch(input,options); }
    if (url.origin===location.origin && url.pathname.startsWith('/api/')) {
      const p = url.pathname;
      const method=(options?.method || (input instanceof Request && input.method) || 'GET').toUpperCase();
      if (method==='GET' && p==='/api/bootstrap')
        return demoResponse({csrf:'demo-only',user:null,telegram:false,turnstile_site:'',mode:'local',crm:false,llm:false});
      if (method==='GET' && p==='/api/legal') return originalFetch(new URL('demo-legal.json',base),options);
      if (method==='GET' && p==='/api/catalog') return originalFetch(new URL('smart/catalog.json',base),options);
      return demoResponse({error:'Это демонстрационный сайт. Отправка заявок и вход в кабинет отключены.'},403);
    }
    return originalFetch(input, options);
  };
  document.addEventListener('submit',function(e){
    if(e.target?.matches('#leadForm,#smartLeadForm,#estimateForm,#constructionForm,#loginForm,#settingsForm')){
      e.preventDefault();e.stopImmediatePropagation();
      const status=e.target.querySelector('.request-status,.status,[role=status]');
      if(status) status.textContent='Демонстрационный просмотр: ничего не отправлено.';
      else alert('Это демонстрационный сайт. Заявка не отправлена.');
    }
  },true);
  document.addEventListener('DOMContentLoaded',()=>{
    const message='ДЕМОНСТРАЦИЯ: заявки и авторизация не работают — персональные данные не отправляются';
    const notice=document.createElement('div');
    notice.textContent=message;
    notice.setAttribute('role','status');
    notice.style.cssText='position:relative;z-index:100;text-align:center;background:#fff1df;color:#653e22;font:700 11px/1.5 system-ui,sans-serif;padding:8px 12px;border-bottom:1px solid #dfbc98';
    document.body.prepend(notice);
    document.querySelectorAll('form').forEach(f=>f.setAttribute('data-demo-only','true'));
  });
})();
