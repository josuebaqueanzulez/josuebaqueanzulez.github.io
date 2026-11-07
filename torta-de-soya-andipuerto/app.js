'use strict';
const stages=[
 ['ARGENTINA','Proveedor / exportador','La cadena comienza en la agroindustria aceitera. Cargill y Bunge son referencias documentadas del comercio de torta de soya.','Exportador, comprador e inspector de calidad.','Factura, contrato y certificados de calidad, aceite y humedad.','Especificaciones del producto y condiciones de compraventa documentadas.','[7], [17]'],
 ['GRAN ROSARIO','Puerto de origen','La carga se concentra en una terminal exportadora para preparar su embarque a granel.','Terminal exportadora, cargador, inspector y agente marítimo.','Reserva, documentación de carga, peso y declaración del cargador para IMSBC.','Identificación de la carga y clasificación aplicable según certificados.','[2], [5], [7]'],
 ['ROSARIO → GUAYAQUIL','Tránsito marítimo','El transporte conecta origen y destino mediante un buque granelero. El registro del 11/07/2025 menciona FU XING HAI, sin confirmar su IMO.','Armador, fletador, agente, capitán y aseguradora.','B/L, manifiesto, certificado de embarque y póliza según compraventa.','Condiciones de estiba. Incoterm, fletamento y duración de ese viaje: no publicados o no verificables.','[7], [9], [10], [11]'],
 ['GUAYAQUIL','Escala portuaria','Ingreso, maniobra, atraque y amarre preceden a la descarga. Andipuerto declara capacidad para buques de hasta 220 m de eslora.','Práctico autorizado, remolcadores, APG, agente y terminal.','Autorización de ingreso, libre plática y plan de descarga.','Compatibilidad de la nave con canal, muelle y operación. Prestadores concretos de la escala citada: N/D.','[8]'],
 ['ANDIPUERTO','Descarga y almacenamiento','Cucharas y tolvas transfieren el granel hacia bodegas o silos; la operación incorpora tarja, muestreo y pesaje.','Terminal y operador portuario; Andigrain consta como operador vinculado históricamente.','Registros de peso, muestreo, control de calidad y saldo de inventario.','Control de polvo, humedad y temperatura; segregación por lote y prevención de contaminación.','[8], [13], [14], [19]'],
 ['GUAYAQUIL → PLANTA','Nacionalización y despacho','La liberación documental y física habilita el despacho de camiones hacia el cliente.','SENAE, agente aduanero, transportista y Agrocalidad cuando corresponda.','DAI, levante, permisos exigibles, autorización y pesaje de salida.','Trazabilidad entre lote recibido, inventario almacenado y cantidad despachada.','[2], [6], [8]'],
 ['DESTINO PRODUCTIVO','Planta de balanceados','El insumo ingresa a la formulación de alimentos para acuicultura, avicultura y porcicultura.','Fabricantes de balanceados; AFABA y Aquacargill son actores documentados de la cadena.','Recepción, control de lote y registros de calidad y formulación.','Continuidad del suministro e inventario disponible para producción.','[2], [7], [17]']
];
document.querySelectorAll('[data-step]').forEach(button=>button.addEventListener('click',()=>{
 const i=Number(button.dataset.step),s=stages[i];
 document.querySelectorAll('[data-step]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 document.getElementById('step-number').textContent=String(i+1).padStart(2,'0');
 ['location','title','desc','actors','docs','check'].forEach((key,j)=>document.getElementById('step-'+key).textContent=s[j]);
 document.getElementById('step-refs').textContent='Fuentes del documento: '+s[6]+'.';
}));
const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function filterServices(){
 const query=normalize(document.getElementById('service-search').value.trim()),type=document.getElementById('service-type').value;
 let count=0;
 document.querySelectorAll('#service-table tbody tr').forEach(row=>{
  const matches=normalize(row.textContent).includes(query)&&(type==='todos'||normalize(row.cells[1].textContent).includes(type));
  row.hidden=!matches;if(matches)count++;
 });
 document.getElementById('service-count').textContent=count+' servicio'+(count===1?'':'s');
 document.getElementById('no-results').hidden=count>0;
}
document.getElementById('service-search').addEventListener('input',filterServices);
document.getElementById('service-type').addEventListener('change',filterServices);
const bases={total:{tons:2952629.88,hours:5201.01,calls:119},solidos:{tons:2587215.34,hours:5636.26,calls:null}};
const format=n=>new Intl.NumberFormat('es-EC',{minimumFractionDigits:2,maximumFractionDigits:2}).format(n);
function scenario(base,percent){return {productivity:base.tons/base.hours*percent/100,hours:base.hours*100/percent,perCall:base.calls?base.hours*100/percent/base.calls:null};}
function updateSimulation(){
 const key=document.getElementById('sim-base').value,base=bases[key],percent=Number(document.getElementById('rate').value),calc=scenario(base,percent);
 document.getElementById('rate-output').textContent=percent+' %';
 document.getElementById('base-info').textContent=key==='total'?'Cuadro 71 · 119 arribos · 2.952.629,88 t · 5.201,01 h':'Cuadro 72 · Escalas por clase: N/D · 2.587.215,34 t · 5.636,26 h';
 document.getElementById('sim-productivity').innerHTML=format(calc.productivity)+' <span>t/h</span>';
 document.getElementById('sim-hours').innerHTML=format(calc.hours)+' <span>h</span>';
 document.getElementById('sim-call').innerHTML=calc.perCall===null?'N/D':format(calc.perCall)+' <span>h/buque</span>';
 document.getElementById('sim-call-note').textContent=key==='total'?'Base integral de 119 arribos; no exclusiva de soya.':'No hay número exclusivo de escalas de granel sólido. No se usan los 119 arribos.';
 const delta=(calc.hours/base.hours-1)*100;
 document.getElementById('sim-delta').textContent=percent===100?'Escenario base: sin variación de horas.':(delta>0?'+':'')+format(delta)+' % de horas operativas frente a la base. Mismo volumen de carga.';
}
document.getElementById('rate').addEventListener('input',updateSimulation);
document.getElementById('sim-base').addEventListener('change',updateSimulation);
document.querySelectorAll('[data-rate]').forEach(button=>button.addEventListener('click',()=>{document.getElementById('rate').value=button.dataset.rate;updateSimulation();}));
document.querySelector('.print').addEventListener('click',()=>window.print());
let printState;
window.addEventListener('beforeprint',()=>{printState={details:[...document.querySelectorAll('details')].map(d=>d.open),rows:[...document.querySelectorAll('#service-table tbody tr')].map(r=>r.hidden)};document.querySelectorAll('details').forEach(d=>d.open=true);document.querySelectorAll('#service-table tbody tr').forEach(r=>r.hidden=false);});
window.addEventListener('afterprint',()=>{if(printState){document.querySelectorAll('details').forEach((d,i)=>d.open=printState.details[i]);document.querySelectorAll('#service-table tbody tr').forEach((r,i)=>r.hidden=printState.rows[i]);}});
updateSimulation();
