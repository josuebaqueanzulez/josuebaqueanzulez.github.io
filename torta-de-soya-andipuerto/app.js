'use strict';
const stages=[
 ['PAÍS DE ORIGEN','Proveedor / exportador','La torta de soya se produce después de extraer el aceite del grano. Los exportadores la preparan para su venta y transporte. Argentina es una procedencia relevante, pero también existen otros países proveedores.','Industria procesadora, exportador y comprador.','Factura, condiciones de venta y análisis de calidad.','Asegurar que el producto, la cantidad y la calidad correspondan con lo comprado.','[2], [4], [7], [17]'],
 ['PUERTO EXPORTADOR','Puerto de origen','La mercancía se transporta al puerto de salida, donde se reúne y prepara para cargarse en un buque granelero. El Gran Rosario es un ejemplo documentado de esta ruta.','Terminal de origen, embarcador, inspector y agente marítimo.','Peso, datos de la carga, instrucciones de embarque y documentos requeridos.','Cargar sin contaminar el producto y comprobar las condiciones de transporte.','[5], [7], [21]'],
 ['ORIGEN → GUAYAQUIL','Transporte marítimo','La torta de soya viaja en buques graneleros de diferentes tamaños. Algunos llevan grúas propias y otros necesitan equipos portuarios. El tipo elegido depende de la carga y de los puertos.','Armador o naviera, comprador, vendedor y agente marítimo.','Conocimiento de embarque (B/L), manifiesto y documentos de la mercancía.','Cumplir la clasificación IMSBC y coordinar el arribo. El FU XING HAI es solo un ejemplo comercial, no la única nave de este tráfico.','[7], [8], [9], [21]'],
 ['GUAYAQUIL','Ingreso y atraque','Al llegar a Guayaquil, se coordinan las maniobras y la asignación del muelle. Antes de descargar hay que comprobar que la nave puede operar con seguridad en la terminal.','Prácticos, remolcadores, agente, autoridad y terminal.','Aviso de llegada y coordinación de maniobras y descarga.','Comprobar acceso, eslora, calado, muelle y equipos disponibles.','[8]'],
 ['ANDIPUERTO','Descarga y almacenamiento','El producto se baja de las bodegas del buque, se controla su cantidad y se traslada a las áreas de almacenamiento. Las operaciones pueden utilizar cucharas, tolvas y equipos de movilización.','Concesionaria, operadores de carga y personal de control de calidad.','Pesajes, muestreo, registros de ingreso y saldo de inventario.','Evitar humedad, pérdida de producto y contaminación durante la descarga y el almacenamiento.','[8], [13], [14], [19]'],
 ['GUAYAQUIL → PLANTA','Nacionalización y despacho','Una vez cumplidos los trámites y controles que correspondan, se organiza la salida en camiones. Es importante que el retiro terrestre siga el ritmo de la operación del terminal.','SENAE, agente de aduana, transportista y Agrocalidad cuando corresponda.','DAI, levante, orden de retiro y pesaje de salida.','Evitar retrasos documentales, diferencias de inventario y congestión de camiones.','[2], [6], [8]'],
 ['DESTINO FINAL','Planta de balanceados','La fábrica recibe la torta de soya, verifica la cantidad y calidad y la incorpora a sus procesos de producción de alimentos balanceados.','Comprador, transportista y fabricante de balanceados.','Recepción, registro de lote, control de calidad e inventario.','Mantener disponible el insumo para atender la demanda de producción.','[2], [7], [17]']
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
