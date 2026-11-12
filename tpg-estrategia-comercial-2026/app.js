"use strict";
(()=>{
 const $=(q,el=document)=>el.querySelector(q);
 const $$=(q,el=document)=>[...el.querySelectorAll(q)];
 const scenes=$$(".scene"), $main=$("#main");
 let active=0,marketMode="teu",selectedCriterion=0,selectedProof="reefer",returnFocus=null;
 const int=new Intl.NumberFormat("es-EC",{maximumFractionDigits:0});
 const two=new Intl.NumberFormat("es-EC",{minimumFractionDigits:2,maximumFractionDigits:2});
 const terminals=[
  {name:"Contecon",teu:728239,calls:676},
  {name:"DP World Posorja",teu:739984,calls:376},
  {name:"TPG",teu:682275,calls:301},
  {name:"Bananapuerto",teu:431446,calls:251}
 ];
 const proofData={
  reefer:{overline:"SPTMF · AÑO BASE 2025",number:"2.000",suffix:"conexiones reefer",title:"Continuidad de la cadena de frío dentro del terminal.",body:"El Boletín SPTMF 2025 describe 1.140 conexiones fijas y 860 power packs, monitoreo de temperaturas y seguimiento de alarmas; son capacidades físicas y de servicio verificables.",implication:"Podemos explicar cómo TPG mantiene conectados los reefers, gestiona alertas y permite coordinar una respuesta durante la permanencia portuaria.",caveat:"Capacidad nominal: no mide ocupación, disponibilidad instantánea ni incidencias efectivas.",url:"https://www.mit.gob.ec/boletines-estadisticos-portuarios/"},
  security:{overline:"SPTMF · AÑO BASE 2025",number:"3",suffix:"escáneres Rapiscan Eagle P60",title:"Infraestructura de inspección y control próxima a la carga.",body:"La ficha TPG registra tres escáneres, 16 básculas camioneras de gate y dos internas, además de espacios para SENAE, Agrocalidad y Policía Antinarcóticos; incorpora áreas cubiertas de inspección de fruta y cámaras de frío.",implication:"Reunir capacidades de pesaje, inspección y control en el terminal facilita diseñar una coordinación más visible para el exportador.",caveat:"La existencia de equipos no demuestra por sí sola tiempos de despacho ni ausencia de demoras.",url:"https://www.mit.gob.ec/boletines-estadisticos-portuarios/"},
  one:{overline:"PORTALPORTUARIO · 6 MAYO 2025",number:"≈1.000",suffix:"reefer de exportación previstos",title:"Una escala real ayuda a contar la historia comercial.",body:"En la recalada inaugural del ONE Sparkle, de 13.700 TEU de capacidad, se anticiparon unos 5.000 movimientos y casi mil contenedores refrigerados de exportación. El buque opera en el servicio ONE AX3.",implication:"Podemos señalar una operación reefer de gran tamaño planificada en TPG y un servicio naviero identificado, sin limitar la narrativa a instalaciones estáticas.",caveat:"Las cifras eran previstas; no se afirma ejecución definitiva ni que todos los contenedores fueran de banano.",url:"https://portalportuario.cl/ecuador-one-sparkle-arriba-a-terminal-portuario-de-guayaquil-en-viaje-inaugural/"},
  lines:{overline:"PRIMICIAS · SEPTIEMBRE 2026",number:"7",suffix:"líneas navieras informadas",title:"Más alternativas marítimas, siempre sujetas al itinerario.",body:"La gerencia de TPG señaló que atendía itinerarios de siete líneas navieras, con vínculos comerciales hacia Asia, Europa, Estados Unidos y el Cono Sur. La declaración corresponde a 2026.",implication:"El argumento comercial es la posibilidad de coordinar con una red diversificada cuando el exportador contrata un servicio que recala en TPG.",caveat:"No equivale a siete servicios semanales directos; rutas y frecuencias específicas necesitan verificación con cada naviera.",url:"https://www.primicias.ec/economia/puertos-ecuador-terminal-portuario-guayaquil-inversion-portuaria-gruas-portico-seguridad-131589/"},
  environment:{overline:"HGT · ANUNCIO EN ABRIL 2025",number:"2022",suffix:"período ambiental verificado",title:"Una credencial ambiental con alcance definido.",body:"Hanseatic Global Terminals informó en abril de 2025 una verificación de organización carbono neutro correspondiente a las emisiones de 2022: alcances 1 y 2, más categorías cuantificadas y verificadas del alcance 3; incluyó compensaciones de emisiones remanentes.",implication:"TPG puede mostrar experiencia en cuantificación de huella y gestión ambiental al conversar con clientes que incorporan criterios ESG en su logística.",caveat:"No significa que las emisiones de 2025 o 2026 hayan recibido la misma verificación.",url:"https://latinamerica.hanseaticglobalterminals.com/es/blog/2025/04/23/a-greener-terminal-tpg-achieves-carbon-neutrality-and-earns-recognition-from-maate/"}
 };
 const matrix=[
  {title:"Infraestructura reefer",weight:.25,grade:4,evidence:"TPG declara 2.000 conexiones en 2025 con monitoreo y alarmas. En las fichas entregadas: DP World 2.180, Bananapuerto 1.400 (2021) y Contecon N/D (2025). No se infiere que N/D equivalga a ausencia de tomas."},
  {title:"Conectividad con mercados",weight:.20,grade:3,evidence:"Escala documentada ONE Sparkle / AX3 en 2025. En septiembre de 2026 la gerencia comunicó siete líneas con vínculos hacia varias regiones. Faltan listas homogéneas de frecuencias y servicios directos."},
  {title:"Servicios y protección",weight:.20,grade:4,evidence:"Boletín 2025: 3 escáneres Rapiscan, 16 básculas de gate, dos internas, áreas de SENAE, Agrocalidad y Antinarcóticos, monitoreo reefer y herramientas de gestión."},
  {title:"Fluidez de la escala",weight:.15,grade:3,evidence:"2025: 11.760 horas en muelle / 301 escalas = 39,07 h por escala; 11.760/(2 × 8.760) = 67,12 % de ocupación estimada. Los promedios no bastan para medir productividad ni tiempos de gate."},
  {title:"Accesibilidad terrestre",weight:.15,grade:4,evidence:"TPG se encuentra en Isla Trinitaria y enlaza con el corredor de Vía Perimetral. La nota es provisional porque no hay distancias y tiempos comparables por carretera desde las zonas bananeras."},
  {title:"Acceso náutico",weight:.05,grade:4,evidence:"TPG: eslora máxima hasta 370 m y calado actual de 13 m con beneficio de marea según la ficha SPTMF 2025. Existe una restricción relativa frente al mayor calado de acceso de Posorja."}
 ];
 function go(index,focus=false){
   active=Math.min(4,Math.max(0,Number(index)));
   scenes.forEach((v,i)=>{v.hidden=(i!==active);v.classList.toggle("is-active",i===active)});
   $("#counter").textContent=String(active+1).padStart(2,"0")+" / 05";
   $("#currentTitle").textContent=scenes[active].dataset.short||"";
   $("#progressFill").style.width=20*(active+1)+"%";
   $("#prev").disabled=active===0;
   $("#next").textContent=active===4?"Volver al inicio ↻":"Siguiente →";
   $main.scrollTo({top:0,behavior:"instant"});
   history.replaceState(null,"","#"+(active+1));
   if(focus)$main.focus({preventScroll:true});
 }
 function market(){
   const total=terminals.reduce((a,t)=>a+t[marketMode],0);
   const max=Math.max(...terminals.map(t=>t[marketMode]));
   $("#marketTotal").textContent=int.format(total);
   $("#marketLabel").textContent=(marketMode==="teu"?"TEU totales":"Escalas totales")+" · cuatro terminales";
   const root=$("#marketRows");
   root.innerHTML="";
   terminals.forEach(t=>{
     const pct=t[marketMode]/total*100;
     const r=document.createElement("div");r.className="market-row";
     r.innerHTML='<div class="market-name'+(t.name==="TPG"?" tpg":"")+'">'+t.name+'</div>'+
        '<div class="market-track" role="img" aria-label="'+t.name+" "+two.format(pct)+' por ciento"><div class="market-bar'+(t.name==="TPG"?" tpg":"")+'" style="width:'+(t[marketMode]/max*100).toFixed(3)+'%"></div></div>'+
        '<div class="market-value">'+two.format(pct)+' %<small>'+int.format(t[marketMode])+'</small></div>';
     root.appendChild(r);
   });
   $$("[data-mode]").forEach(b=>{let on=b.dataset.mode===marketMode;b.classList.toggle("active",on);b.setAttribute("aria-pressed",String(on))});
 }
 function selectProof(key){
   if(!proofData[key])return;
   selectedProof=key;
   const d=proofData[key];
   $("#proofOverline").textContent=d.overline;
   $("#proofNumber").textContent=d.number;
   $("#proofSuffix").textContent=d.suffix;
   $("#proofTitle").textContent=d.title;
   $("#proofBody").textContent=d.body;
   $("#proofImplication").textContent=d.implication;
   $("#proofCaveat").textContent=d.caveat;
   $("#proofLink").href=d.url;
   $$("[data-proof]").forEach(b=>{let on=b.dataset.proof===key;b.classList.toggle("active",on);b.setAttribute("aria-selected",String(on))});
 }
 function buildMatrix(){
   const root=$("#matrixRows");
   root.innerHTML="";
   matrix.forEach((m,i)=>{
     const btn=document.createElement("button");btn.type="button";btn.dataset.criterion=String(i);
     btn.className="matrix-row";
     btn.innerHTML='<b>'+m.title+'</b><span>'+int.format(m.weight*100)+' %</span><span>'+m.grade+'</span><span>'+two.format(m.weight*m.grade)+'</span>';
     btn.addEventListener("click",()=>selectMatrix(i));
     root.appendChild(btn);
   });
   selectMatrix(0);
 }
 function selectMatrix(i){
   const m=matrix[i];selectedCriterion=i;
   $("#matrixTitle").textContent=m.title;
   $("#matrixGrade").textContent=m.grade+" / 5";
   $("#matrixWeight").textContent="Peso "+int.format(m.weight*100)+" % · aporte "+two.format(m.weight*m.grade);
   $("#matrixEvidence").textContent=m.evidence;
   $$("[data-criterion]").forEach((b,index)=>b.classList.toggle("active",index===i));
 }
 function openDrawer(tab="fuentes"){
   returnFocus=document.activeElement;
   $("#overlay").hidden=false;$("#drawer").hidden=false;
   switchTab(tab);
   $("#closeDrawer").focus();
 }
 function switchTab(tab){
   $$("[data-tab]").forEach(b=>{const on=b.dataset.tab===tab;b.classList.toggle("active",on);b.setAttribute("aria-selected",String(on))});
   $$("[data-panel]").forEach(p=>p.hidden=p.dataset.panel!==tab);
 }
 function closeDrawer(){
   $("#overlay").hidden=true;$("#drawer").hidden=true;
   if(returnFocus?.focus)returnFocus.focus();
 }
 function peerClose(){
   $("#peerPanel").hidden=true;
   $("#openPeer").setAttribute("aria-expanded","false");
 }
 $$("[data-go]").forEach(b=>b.addEventListener("click",()=>go(b.dataset.go,true)));
 $$("[data-mode]").forEach(b=>b.addEventListener("click",()=>{marketMode=b.dataset.mode;market()}));
 $$("[data-proof]").forEach(b=>b.addEventListener("click",()=>selectProof(b.dataset.proof)));
 $$("[data-open-proof]").forEach(b=>b.addEventListener("click",()=>openDrawer(b.dataset.openProof)));
 $("#openProof").addEventListener("click",()=>openDrawer());
 $("#closeDrawer").addEventListener("click",closeDrawer);
 $("#overlay").addEventListener("click",closeDrawer);
 $$("[data-tab]").forEach(b=>b.addEventListener("click",()=>switchTab(b.dataset.tab)));
 $("#openPeer").addEventListener("click",()=>{const el=$("#peerPanel");el.hidden=!el.hidden;$("#openPeer").setAttribute("aria-expanded",String(!el.hidden));if(!el.hidden)el.scrollIntoView({behavior:"smooth",block:"nearest"})});
 $("#closePeer").addEventListener("click",peerClose);
 $("#fullscreen").addEventListener("click",()=>{if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});else document.documentElement.requestFullscreen?.().catch(()=>{})});
 $("#prev").addEventListener("click",()=>go(active-1,true));
 $("#next").addEventListener("click",()=>go(active===4?0:active+1,true));
 document.addEventListener("keydown",ev=>{
   const drawerOpen=!$("#drawer").hidden;
   if(drawerOpen){
     if(ev.key==="Escape")closeDrawer();
     if(ev.key==="Tab"){
       const buttons=$$('button:not([disabled]),a[href]',$("#drawer"));
       if(buttons.length){
         const first=buttons[0],last=buttons[buttons.length-1];
         if(ev.shiftKey&&document.activeElement===first){ev.preventDefault();last.focus()}
         if(!ev.shiftKey&&document.activeElement===last){ev.preventDefault();first.focus()}
       }
     }
     return;
   }
   if(["INPUT","TEXTAREA","SELECT"].includes(document.activeElement?.tagName))return;
   if(ev.key==="ArrowRight"||ev.key==="PageDown"){ev.preventDefault();go(active+1)}
   if(ev.key==="ArrowLeft"||ev.key==="PageUp"){ev.preventDefault();go(active-1)}
   if(ev.key==="Home")go(0);
   if(ev.key==="End")go(4);
   if(ev.key.toLowerCase()==="f"){$("#fullscreen").click()}
   if(ev.key.toLowerCase()==="e")openDrawer();
   if(/^[1-5]$/.test(ev.key))go(Number(ev.key)-1);
 });
 window.addEventListener("hashchange",()=>{
   const v=location.hash.match(/^#([1-5])$/);
   if(v&&Number(v[1])!==active+1)go(Number(v[1])-1);
 });
 market();buildMatrix();selectProof("reefer");
 const hash=location.hash.match(/^#([1-5])$/);
 go(hash?Number(hash[1])-1:0);
})();
