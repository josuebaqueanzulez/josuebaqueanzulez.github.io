"use strict";
(function(){
  const $=(selector,root=document)=>root.querySelector(selector);
  const $$=(selector,root=document)=>Array.from(root.querySelectorAll(selector));
  const scenes=$$(".scene"), navSteps=$$(".step"), main=$("main");
  const total=scenes.length;
  let active=0, marketMode="teu", demoStage=0, priorFocus=null;
  const fmtInt=new Intl.NumberFormat("es-EC",{maximumFractionDigits:0});
  const fmtDec=new Intl.NumberFormat("es-EC",{minimumFractionDigits:2,maximumFractionDigits:2});
  const terminals=[
    {name:"Contecon",teu:728239,calls:676},
    {name:"DP World Posorja",teu:739984,calls:376},
    {name:"TPG",teu:682275,calls:301},
    {name:"Bananapuerto",teu:431446,calls:251}
  ];
  const matrix=[
    {title:"Infraestructura reefer",weight:.25,grade:4,evidence:"TPG registra 2.000 conexiones reefer (1.140 fijas y 860 power packs), monitoreo y alarmas. El comparativo identificado registra 3.700 en Contecon, 2.180 en DP World y 1.710 en Bananapuerto. Fuente: SPTMF 2025, fichas de terminales e ICTSI 2025."},
    {title:"Conectividad",weight:.20,grade:3,evidence:"Existe evidencia de la escala del servicio ONE/AX3 en 2025 y un itinerario MSC desde TPG hacia Los Ángeles con transbordo en Panamá. No se han confirmado de manera homogénea las frecuencias hacia Europa y EE. UU.; no se equiparan destinos a rutas directas."},
    {title:"Servicios y protección",weight:.20,grade:4,evidence:"Tres escáneres Rapiscan, 16 básculas camioneras de gate y dos internas, instalaciones para SENAE, Agrocalidad y Policía Antinarcóticos, además de procedimientos digitales y monitoreo reefer. Fuente: ficha TPG, SPTMF 2025, p. 81."},
    {title:"Fluidez de escala",weight:.15,grade:3,evidence:"TPG: 39,07 horas por escala y 67,12 % de ocupación estimada, según las convenciones del ejercicio 2025. El valor de horas no acredita por sí solo ineficiencia ni mide permanencia de la carga."},
    {title:"Accesibilidad terrestre",weight:.15,grade:4,evidence:"TPG se ubica en Isla Trinitaria y conecta con el eje de Vía Perimetral. La calificación 4/5 es provisional: faltan distancias y tiempos reales comparables desde las zonas productoras de Guayas, Los Ríos y El Oro."},
    {title:"Acceso náutico",weight:.05,grade:4,evidence:"Ficha TPG 2025: eslora permitida hasta 370 m y calado de 13 m con beneficio de marea. Restricciones de navegación condicionan determinadas escalas, especialmente frente al acceso profundo de Posorja."}
  ];

  function showScene(index,opts={}){
    const target=Math.max(0,Math.min(total-1,Number(index)));
    scenes.forEach((scene,i)=>{const on=i===target;scene.hidden=!on;scene.classList.toggle("is-active",on);});
    navSteps.forEach((step,i)=>{const on=i===target;step.classList.toggle("is-active",on);if(on)step.setAttribute("aria-current","step");else step.removeAttribute("aria-current");});
    active=target;
    $("#progressLabel").textContent=String(target+1).padStart(2,"0")+" / "+String(total).padStart(2,"0");
    $("#progressFill").style.width=((target+1)/total*100)+"%";
    $("#stageLabel").textContent=scenes[target].dataset.title||"";
    $("#prev").disabled=target===0;
    $("#next").innerHTML=target===total-1?'Volver al inicio <svg class="ic"><use href="#icon-arrow"/></svg>':'Siguiente <svg class="ic"><use href="#icon-arrow"/></svg>';
    if(main){main.scrollTo({top:0,behavior:"instant"});}
    history.replaceState(null,"","#"+(target+1));
    if(opts.focus)$("#contenido").focus({preventScroll:true});
  }
  function marketRender(){
    const totalValue=terminals.reduce((sum,item)=>sum+item[marketMode],0);
    const maxShare=Math.max(...terminals.map(item=>item[marketMode]/totalValue));
    $("#marketTotal").textContent=fmtInt.format(totalValue);
    $("#marketUnit").textContent=marketMode==="teu"?"TEU totales":"escalas totales";
    $("#marketBars").innerHTML="";
    terminals.forEach(item=>{
      const ratio=item[marketMode]/totalValue, percent=ratio*100;
      const row=document.createElement("div"); row.className="bar-row";
      row.innerHTML=
        '<div class="bar-label'+(item.name==="TPG"?" is-tpg":"")+'">'+item.name+'</div>'+
        '<div class="bar-track" role="img" aria-label="'+item.name+': '+fmtDec.format(percent)+' por ciento"><div class="bar-fill'+(item.name==="TPG"?" is-tpg":"")+'" style="width:'+Math.max(3,ratio/maxShare*100)+'%"></div></div>'+
        '<div class="bar-value"><strong>'+fmtDec.format(percent)+' %</strong><small>'+fmtInt.format(item[marketMode])+' '+(marketMode==="teu"?"TEU":"escalas")+'</small></div>';
      $("#marketBars").appendChild(row);
    });
    $$("[data-market]").forEach(btn=>{const on=btn.dataset.market===marketMode;btn.classList.toggle("is-selected",on);btn.setAttribute("aria-pressed",String(on));});
  }
  function scoreRender(){
    const parent=$("#matrixRows");parent.innerHTML="";
    matrix.forEach((item,index)=>{
      const btn=document.createElement("button");btn.type="button";btn.className="matrix-row"+(index===0?" is-selected":"");btn.dataset.matrix=String(index);
      btn.setAttribute("aria-label",item.title+": peso "+fmtInt.format(item.weight*100)+" por ciento; calificación "+item.grade+" de 5; aporte "+fmtDec.format(item.weight*item.grade));
      btn.innerHTML="<b>"+item.title+(item.title==="Accesibilidad terrestre"?" *":"")+"</b><span>"+fmtInt.format(item.weight*100)+" %</span><span>"+item.grade+"</span><span>"+fmtDec.format(item.grade*item.weight)+"</span>";
      btn.addEventListener("click",()=>selectCriterion(index));
      parent.appendChild(btn);
    });
    selectCriterion(0);
  }
  function selectCriterion(index){
    const item=matrix[index];
    $$("[data-matrix]").forEach((node,i)=>node.classList.toggle("is-selected",i===index));
    $("#selectedCriterion").textContent=item.title;
    $("#selectedWeight").textContent=fmtInt.format(item.weight*100)+" % del total";
    $("#selectedGrade").textContent=item.grade+"/5";
    $("#selectedContribution").textContent="Aporte: "+fmtDec.format(item.grade*item.weight);
    $("#selectedEvidence").textContent=item.evidence;
  }
  function renderDemo(){
    const states=[
      {text:"Ingreso validado",label:"Ingreso registrado"},
      {text:"Conexión registrada",label:"Conexión reefer"},
      {text:"Inspección simulada",label:"Inspección registrada"},
      {text:"Embarque simulado",label:"Confirmación de embarque"}
    ];
    $("#demoStatus").textContent=states[demoStage].text;
    $("#demoTemp").textContent="Dentro de rango";
    $$("#demoTimeline > div").forEach((el,i)=>{el.classList.toggle("is-done",i<=demoStage);el.classList.toggle("is-current",i===demoStage);});
    $("#advanceDemo").innerHTML=demoStage===states.length-1?'Reiniciar simulación <svg class="ic"><use href="#icon-arrow"/></svg>':'Simular siguiente hito <svg class="ic"><use href="#icon-arrow"/></svg>';
    const wave=$("#temperatureLine");
    if(wave)wave.style.stroke=demoStage===2?"#e8c367":"#70e0bc";
  }
  function openDrawer(tab="sources"){
    priorFocus=document.activeElement;
    $("#evidenceBackdrop").hidden=false;
    $("#evidenceDrawer").hidden=false;
    document.body.classList.add("drawer-open");
    setTab(tab);
    $("#closeEvidence").focus();
  }
  function closeDrawer(){
    $("#evidenceBackdrop").hidden=true;
    $("#evidenceDrawer").hidden=true;
    document.body.classList.remove("drawer-open");
    if(priorFocus && priorFocus.focus)priorFocus.focus();
  }
  function setTab(tab){
    $$("[data-tab]").forEach(button=>{const on=button.dataset.tab===tab;button.classList.toggle("is-selected",on);button.setAttribute("aria-selected",String(on));});
    $$("[data-drawer]").forEach(panel=>panel.hidden=panel.dataset.drawer!==tab);
  }
  navSteps.forEach(step=>step.addEventListener("click",()=>showScene(Number(step.dataset.go))));
  $$("[data-go]").filter(b=>!b.classList.contains("step")).forEach(btn=>btn.addEventListener("click",()=>showScene(Number(btn.dataset.go),{focus:true})));
  $("#next").addEventListener("click",()=>showScene(active===total-1?0:active+1,{focus:true}));
  $("#prev").addEventListener("click",()=>showScene(active-1,{focus:true}));
  $$("[data-market]").forEach(btn=>btn.addEventListener("click",()=>{marketMode=btn.dataset.market;marketRender();}));
  $("#advanceDemo").addEventListener("click",()=>{demoStage=(demoStage+1)%4;renderDemo();});
  $("#resetDemo").addEventListener("click",()=>{demoStage=0;renderDemo();});
  $("#openEvidence").addEventListener("click",()=>openDrawer());
  $("#closeEvidence").addEventListener("click",closeDrawer);
  $("#evidenceBackdrop").addEventListener("click",closeDrawer);
  $$("[data-open]").forEach(b=>b.addEventListener("click",()=>openDrawer(b.dataset.open)));
  $$("[data-tab]").forEach(b=>b.addEventListener("click",()=>setTab(b.dataset.tab)));
  $("#fullToggle").addEventListener("click",()=>{
    if(document.fullscreenElement){document.exitFullscreen().catch(()=>{});return;}
    document.documentElement.requestFullscreen?.().catch(()=>{});
  });
  document.addEventListener("keydown",ev=>{
    const drawerOpen=!$("#evidenceDrawer").hidden;
    if(ev.key==="Escape" && drawerOpen){closeDrawer();return;}
    if(drawerOpen){if(ev.key==="Tab"){const focusables=$$('button:not([disabled]),a[href]', $("#evidenceDrawer"));if(focusables.length){const first=focusables[0],last=focusables[focusables.length-1];if(ev.shiftKey&&document.activeElement===first){ev.preventDefault();last.focus();}else if(!ev.shiftKey&&document.activeElement===last){ev.preventDefault();first.focus();}}}return;}
    if(["INPUT","TEXTAREA","SELECT"].includes(document.activeElement?.tagName))return;
    if(ev.key==="ArrowRight"||ev.key==="PageDown"){ev.preventDefault();showScene(active+1);}
    if(ev.key==="ArrowLeft"||ev.key==="PageUp"){ev.preventDefault();showScene(active-1);}
    if(ev.key==="Home"){ev.preventDefault();showScene(0);}
    if(ev.key==="End"){ev.preventDefault();showScene(total-1);}
    if(ev.key.toLowerCase()==="e"){ev.preventDefault();openDrawer("sources");}
    if(ev.key.toLowerCase()==="f"){ev.preventDefault();$("#fullToggle").click();}
    if(/^[1-5]$/.test(ev.key)){ev.preventDefault();showScene(Number(ev.key)-1);}
  });
  window.addEventListener("hashchange",()=>{const match=location.hash.match(/^#([1-5])$/);if(match)showScene(Number(match[1])-1);});
  marketRender();scoreRender();renderDemo();
  const initHash=location.hash.match(/^#([1-5])$/);
  showScene(initHash?Number(initHash[1])-1:0);
})();