'use strict';

/* Interfaz por ventanas. Conserva las secciones, fuentes y funciones originales. */
(() => {
  const main = document.getElementById('contenido');
  if (!main) return;

  const windows = [
    {id:'inicio',name:'Panorama',desc:'Resumen del caso',icon:'◈'},
    {id:'contexto',name:'Mercado y origen',desc:'Producto e importación',icon:'◎'},
    {id:'cadena',name:'Ruta logística',desc:'Siete etapas interactivas',icon:'↗'},
    {id:'ficha',name:'Ficha técnica',desc:'Buque, carga y contrato',icon:'▤'},
    {id:'servicios',name:'Servicios portuarios',desc:'Nave, carga y actores',icon:'▦'},
    {id:'rendimiento',name:'Productividad',desc:'Indicadores y simulador',icon:'◫'},
    {id:'seguridad',name:'Seguridad y riesgos',desc:'Safety & security',icon:'◇'},
    {id:'conclusion',name:'Conclusiones',desc:'Implicaciones logísticas',icon:'✳'},
    {id:'fuentes',name:'Fuentes y créditos',desc:'Trazabilidad documental',icon:'☷'}
  ];
  const nodes = [...main.children];

  const rail = document.createElement('aside');
  rail.className = 'workspace-rail';
  rail.setAttribute('aria-label','Menú de navegación del estudio');
  rail.innerHTML =
    '<div class="rail-heading"><span class="rail-mark">A<span>·</span></span><div><strong>ANDIPUERTO</strong><small>ACTIVIDAD 02 · GRUPO 2</small></div></div>'+
    '<div class="rail-section-label">VENTANAS DE EXPLORACIÓN</div>'+
    '<nav class="workspace-nav" aria-label="Secciones de la actividad">'+
    windows.map((w,i) => '<a data-window="'+w.id+'" href="#'+w.id+'"><span class="rail-index">'+String(i+1).padStart(2,'0')+'</span><span class="rail-text"><strong>'+w.name+'</strong><small>'+w.desc+'</small></span><span class="rail-icon" aria-hidden="true">'+w.icon+'</span></a>').join('')+
    '</nav><div class="rail-bottom"><span class="rail-signal"></span><div>BASE ESTADÍSTICA <b>2025</b><small>ECOTEC · GUAYAQUIL</small></div></div>';

  const work = document.createElement('div');
  work.className = 'workspace-content';

  const workTop = document.createElement('div');
  workTop.className = 'workspace-heading';
  workTop.innerHTML = '<div><span class="workspace-kicker">ECOTEC / LOGÍSTICA MARÍTIMO-PORTUARIA</span><h2>Explorador logístico <em>02</em></h2><p>Torta de soya · Cadena de importación por Andipuerto</p></div><div class="workspace-status"><i aria-hidden="true"></i> ESTUDIO DOCUMENTAL <strong>2025</strong></div>';
  work.append(workTop);

  const panes = new Map();
  windows.forEach((w,i) => {
    const pane = document.createElement('article');
    pane.className = 'workspace-pane';
    pane.dataset.pane = w.id;
    pane.setAttribute('aria-label',w.name);
    pane.hidden = true;
    const bar = document.createElement('div');
    bar.className='window-topbar';
    bar.innerHTML='<span class="window-dots" aria-hidden="true"><i></i><i></i><i></i></span>'+
      '<div class="window-name"><span>VENTANA '+String(i+1).padStart(2,'0')+' / '+String(windows.length).padStart(2,'0')+'</span><strong>'+w.name+'</strong></div>'+
      '<span class="window-category">'+w.desc+'</span>';
    pane.append(bar);
    const bottom=document.createElement('nav');
    bottom.className='window-footnav';
    bottom.setAttribute('aria-label','Continuar exploración');
    const prev=windows[(i-1+windows.length)%windows.length];
    const next=windows[(i+1)%windows.length];
    bottom.innerHTML='<a href="#'+prev.id+'"><span>← ANTERIOR</span><strong>'+prev.name+'</strong></a>'+
      '<span class="window-progress">'+String(i+1).padStart(2,'0')+' <i>/</i> '+String(windows.length).padStart(2,'0')+'</span>'+
      '<a href="#'+next.id+'"><span>SIGUIENTE →</span><strong>'+next.name+'</strong></a>';
    pane.append(bottom);
    panes.set(w.id,pane);
    work.append(pane);
  });

  for (const node of nodes) {
    let key = node.id;
    if (node.classList.contains('stats') || node.classList.contains('scope')) key = 'inicio';
    if (node.classList.contains('conclusion')) key = 'conclusion';
    const pane = panes.get(key);
    if (pane) pane.insertBefore(node,pane.querySelector('.window-footnav'));
    else work.append(node);
  }

  const credits=document.querySelector('body > footer');
  if (credits) panes.get('fuentes').insertBefore(credits,panes.get('fuentes').querySelector('.window-footnav'));

  main.append(rail,work);
  const originalNav=document.querySelector('header nav[aria-label="Navegación principal"]');
  if (originalNav) originalNav.setAttribute('aria-hidden','true');

  let active='inicio';
  const setWindow = (key, anchor) => {
    if (!panes.has(key)) key='inicio';
    active=key;
    panes.forEach((pane,id)=>{
      pane.hidden=(id!==key);
      pane.classList.toggle('is-current',id===key);
    });
    rail.querySelectorAll('[data-window]').forEach(a => {
      if(a.dataset.window===key) a.setAttribute('aria-current','page');
      else a.removeAttribute('aria-current');
    });
    const title=windows.find(w=>w.id===key).name;
    document.title=title+' · Torta de soya / Andipuerto';
    requestAnimationFrame(()=>{
      if(anchor && anchor!==key){
        const target=document.getElementById(anchor);
        if(target) target.scrollIntoView({block:'start',behavior:'smooth'});
      } else {
        window.scrollTo({top:0,behavior:'instant'});
      }
    });
  };

  const onRoute = () => {
    const anchor=decodeURIComponent(location.hash.slice(1));
    const direct=panes.has(anchor) ? anchor : null;
    const target=anchor ? document.getElementById(anchor) : null;
    const container=target ? target.closest('.workspace-pane') : null;
    const key=direct || (container ? container.dataset.pane : 'inicio');
    setWindow(key,anchor);
  };

  document.body.classList.add('workspace-enhanced');
  window.addEventListener('hashchange',onRoute);
  onRoute();

  // La impresión muestra todas las ventanas; el contenido original permanece en el DOM.
  // Todos los enlaces de referencias conservan sus identificadores de origen.
})();