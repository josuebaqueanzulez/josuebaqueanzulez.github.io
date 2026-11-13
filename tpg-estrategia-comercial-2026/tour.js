"use strict";
(async function(){
 const $=(q,el=document)=>el.querySelector(q);
 const $$=(q,el=document)=>Array.from(el.querySelectorAll(q));
 const scene=$("#scene-2");
 if(!scene)return;
 const proof=$(".proof-layout",scene);
 if(!proof)return;

 try{
  const response=await fetch("./tour-content.html",{cache:"no-store"});
  if(!response.ok)throw new Error("No se pudo cargar el contenido de la visita");
  const fragment=await response.text();
  const region=document.createElement("div");
  region.innerHTML=fragment;
  const tour=region.firstElementChild;
  if(!tour || tour.id!=="experience")throw new Error("Contenido de visita inesperado");
  proof.before(tour);
  // La biblioteca original permanece, pero no compite visualmente con la visita.
  const fold=document.createElement("details");
  fold.className="visit-proof-fold";
  const summary=document.createElement("summary");
  summary.innerHTML="<strong>Ver investigaciones y evidencias adicionales de TPG</strong><small>Cadena de frío · seguridad · ONE Sparkle · conectividad · sostenibilidad ↓</small>";
  proof.before(fold);
  fold.appendChild(summary);
  fold.appendChild(proof);

  const hotspots={
   road:{kicker:"01 / ACCESO TERRESTRE",title:"Del transporte terrestre a la operación portuaria.",body:"TPG está ubicado en Isla Trinitaria, con acceso por la avenida Los Ángeles y conexión a la Vía Perimetral.",value:"La planificación del transporte puede coordinarse con el servicio naviero, la ventana de recepción y el cut-off.",source:"CAMAE · ficha de Terminal Portuario de Guayaquil (TPG–INARPI)."},
   gate:{kicker:"02 / GATE Y PESAJE",title:"Cada ingreso necesita una secuencia controlada.",body:"La ficha TPG 2025 consigna 16 básculas camioneras para el gate y dos internas, con procesos de atención y control de carga.",value:"El exportador puede solicitar trazabilidad de ingreso y procesos, sin convertir un registro aislado en una promesa de tiempo.",source:"SPTMF · ficha técnica TPG 2025; consulta pública de camiones de TPG."},
   yard:{kicker:"03 / PATIOS Y EQUIPOS",title:"Movilizar, almacenar y preparar el contenedor.",body:"TPG declara 11 grúas RTG de patio. La disponibilidad real de posiciones y equipos depende de su programación operativa.",value:"La coordinación de patio es relevante para reducir maniobras evitables y asegurar que la carga esté preparada para el embarque.",source:"SPTMF · ficha TPG 2025; 11 RTG declaradas."},
   cold:{kicker:"04 / CADENA DE FRÍO",title:"La continuidad térmica se gestiona dentro del terminal.",body:"Se informan 2.000 conexiones reefer: 1.140 fijas y 860 power packs, junto con monitoreo y gestión de alarmas.",value:"Solicitar procedimientos claros de conexión, monitoreo, notificación de incidentes y respuesta durante la permanencia.",source:"SPTMF · ficha TPG 2025. Capacidad declarada, no disponibilidad instantánea."},
   berth:{kicker:"05 / MUELLE Y EMBARQUE",title:"El contenedor debe estar listo cuando llega su buque.",body:"TPG registra 660 m de muelle, dos atracaderos y cinco grúas pórtico STS, con eslora permitida hasta 370 m.",value:"Integrar cut-off, inspecciones y planificación de carga al servicio de la naviera para minimizar riesgos de no embarque.",source:"SPTMF · ficha TPG 2025; la longitud de muelle es distinta del frente total con dolphins."}
  };
  function changeHotspot(key){
   const d=hotspots[key];if(!d)return;
   $("#tourKicker",tour).textContent=d.kicker;
   $("#tourTitle",tour).textContent=d.title;
   $("#tourDescription",tour).textContent=d.body;
   $("#tourBenefit",tour).textContent=d.value;
   $("#tourSource",tour).textContent="Evidencia: "+d.source;
   $$("[data-hotspot]",tour).forEach(b=>{const on=b.dataset.hotspot===key;b.classList.toggle("active",on);b.setAttribute("aria-pressed",String(on))});
  }
  $$("[data-hotspot]",tour).forEach(btn=>btn.addEventListener("click",()=>changeHotspot(btn.dataset.hotspot)));
  function changeTab(key){
   $$("[data-visit-tab]",tour).forEach(b=>{const on=b.dataset.visitTab===key;b.classList.toggle("active",on);b.setAttribute("aria-selected",String(on))});
   $$("[data-visit-panel]",tour).forEach(v=>v.hidden=v.dataset.visitPanel!==key);
  }
  $$("[data-visit-tab]",tour).forEach(btn=>btn.addEventListener("click",()=>changeTab(btn.dataset.visitTab)));

  const reefer=[
   {title:"Preparar antes de que llegue el contenedor.",body:"Validar reserva, documentación, horarios y cut-off correspondientes al servicio marítimo.",benefit:"Detectar faltantes documentales y coordinar el traslado antes de acercarse al cierre de recepción."},
   {title:"Ingreso al terminal.",body:"Presentación del transporte, identificación, documentación aplicable y control de acceso.",benefit:"Tener un hito verificable de recepción y una base para seguimiento de la unidad."},
   {title:"Recepción y registro de la carga.",body:"Registro, pesaje cuando corresponda y asignación del contenedor conforme a las reglas operativas.",benefit:"Conocer el estado de admisión antes de la preparación definitiva de su embarque."},
   {title:"Conexión y seguimiento reefer.",body:"Conectar el equipo refrigerado según los procedimientos establecidos, monitorear valores y gestionar alarmas.",benefit:"Disponer de protocolos para identificar y escalar incidencias durante la permanencia portuaria."},
   {title:"Controles y verificaciones aplicables.",body:"Coordinar inspecciones de aduana, sanidad o antinarcóticos cuando sean requeridas.",benefit:"Anticipar pendientes de liberación sin confundir disponibilidad de equipos con trámites ya concluidos."},
   {title:"Preparación para el buque.",body:"Confirmar documentación, liberaciones y ubicación de la unidad, y coordinar la secuencia de embarque.",benefit:"Evitar que una incidencia no identificada comprometa el embarque programado."},
   {title:"Confirmación de embarque.",body:"Registrar el hito de transferencia al buque cuando el operador y naviera lo confirmen.",benefit:"Cerrar la trazabilidad portuaria con evidencia de cumplimiento, sin atribuir horarios no verificados."}
  ];
  function selectReefer(i){
   const d=reefer[i];if(!d)return;
   $("#reefNumber",tour).innerHTML=String(i+1).padStart(2,"0")+' <small>/ 07</small>';
   $("#reefTitle",tour).textContent=d.title;
   $("#reefDescription",tour).textContent=d.body;
   $("#reefBenefit",tour).textContent=d.benefit;
   $$("[data-reef-step]",tour).forEach(b=>{const on=Number(b.dataset.reefStep)===i;b.classList.toggle("active",on);b.setAttribute("aria-pressed",String(on))});
  }
  $$("[data-reef-step]",tour).forEach(b=>b.addEventListener("click",()=>selectReefer(Number(b.dataset.reefStep))));
  changeHotspot("road");selectReefer(0);changeTab("aerial");
  window.__tpgTourReady=true;
 }catch(error){
  const fallback=document.createElement("div");
  fallback.className="visit-proof-fold";
  fallback.innerHTML='<strong>Visita de TPG:</strong> <a href="https://www.google.com/maps/@-2.246111,-79.929167,17z/data=!3m1!1e3" target="_blank" rel="noopener noreferrer">abrir vista satelital de referencia en Google Maps ↗</a>';
  proof.before(fallback);
  window.__tpgTourReady=false;
  console.warn("No se pudo inicializar la visita virtual:",error);
 }
})();
