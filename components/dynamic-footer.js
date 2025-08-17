// Dynamic footer renderer: fetches footer component and processes translation tokens
(function(){
  function init(){
    const el = document.getElementById('dynamic-footer');
    if(!el) return;
    const basePath = (function(){
      const depth = location.pathname.replace(/\\/g,'/').split('/').filter(Boolean).length;
      if(depth>1) return '../components/';
      return 'components/';
    })();
    function render(){
      const tpl = el.dataset.template; if(!tpl) return;
      const logoProcessed = tpl.replace(/\{\{logoPath\}\}/g, basePath==='components/'? '' : '../');
      el.innerHTML = logoProcessed.replace(/\{\{t:([^}]+)\}\}/g,(m,k)=> (window.t? window.t(k.trim()): k.trim()));
    }
    fetch(basePath + 'footer.html')
      .then(r=>r.text())
      .then(html=>{ el.dataset.template = html; render(); })
      .catch(()=>{});
    window.addEventListener('i18nReady', render);
    window.addEventListener('languageChanged', render);
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
