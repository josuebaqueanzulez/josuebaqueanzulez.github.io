'use strict';
const DATA_URL = 'data/catalog-d968083d59c7.json.gz';
const DATA_SHA = 'd968083d59c708cd7c8f80111905fec012814518efaa2264bff42862a01bad16';
const EXPECTED_COUNT = 6350;
const $ = id => document.getElementById(id);
const fmt = (n,d=1) => Number(n).toLocaleString('es-EC',{minimumFractionDigits:d,maximumFractionDigits:d});
const money = n => '$'+fmt(n,2);
let catalog, routes=[], routeById, map, originalLine, liveLine, markers, activeRequest, requestVersion=0;
const liveCache = new Map();
function decodeLine(encoded, precision=6) {
  let i=0,lat=0,lng=0; const points=[],factor=10**precision;
  function delta() {
    let result=0,shift=0,b;
    do {
      if(i>=encoded.length||shift>30) throw new Error('Geometría incompleta');
      b=encoded.charCodeAt(i++)-63;
      if(b<0||b>63) throw new Error('Geometría inválida');
      result|=(b&31)<<shift; shift+=5;
    } while(b>=32);
    return (result&1)?~(result>>>1):(result>>>1);
  }
  while(i<encoded.length){lat+=delta();lng+=delta();points.push([lat/factor,lng/factor]);}
  return points;
}
function isPoint(p){return Array.isArray(p)&&p.length===2&&p.every(Number.isFinite)&&Math.abs(p[0])<=90&&Math.abs(p[1])<=180;}
function validateCatalog(data){
  if(data?.version!==1||data.count!==EXPECTED_COUNT||data.routes?.length!==EXPECTED_COUNT||!Array.isArray(data.lines)||data.precision!==6||!isPoint(data.dc))throw new Error('El catálogo está incompleto o tiene un formato incorrecto.');
  const ids=new Set();
  for(const r of data.routes){
    if(typeof r.i!=='string'||ids.has(r.i)||!Number.isInteger(r.d)||!Number.isInteger(r.z)||typeof r.v!=='string'||typeof r.a!=='string'||![r.k,r.c,r.g,r.m].every(n=>Number.isFinite(n)&&n>=0)||!Array.isArray(r.p)||!r.p.length||!r.p.every(isPoint)||!Number.isInteger(r.l)||typeof data.lines[r.l]!=='string')throw new Error('Hay un registro de ruta inválido.');
    ids.add(r.i);
  }
  return data;
}
function filterRoutes(list,day,zone,vehicle){return list.filter(r=>r.d===day&&(!zone||r.z===zone)&&(!vehicle||r.v===vehicle));}
function current(){return routeById?.get($('route').value);}
function options(id,entries,value){
  const select=$(id);select.replaceChildren(...entries.map(([v,t])=>new Option(t,String(v))));
  if(entries.some(([v])=>String(v)===String(value)))select.value=String(value);
}
function cancelRequest(){requestVersion++;if(activeRequest)activeRequest.abort();activeRequest=null;}
function fit(points){map.fitBounds(L.latLngBounds(points),{padding:[35,35],maxZoom:15});}
function icon(text,color='#111827'){
  const el=document.createElement('div');el.className='marker';el.style.backgroundColor=color;el.textContent=text;
  return L.divIcon({className:'',html:el,iconSize:[30,30],iconAnchor:[15,15]});
}
function renderOriginal(r){
  const line=decodeLine(catalog.lines[r.l],catalog.precision);
  originalLine.clearLayers();L.polyline(line,{color:'#2563eb',weight:5,opacity:.85}).addTo(originalLine);fit(line);
}
function show(){
  cancelRequest();const r=current();originalLine.clearLayers();liveLine.clearLayers();markers.clearLayers();
  $('go').disabled=!r;$('original').disabled=!r;$('kpis').replaceChildren();$('detail').textContent='';
  if(!r){$('status').textContent='No hay rutas para esta combinación. Cambia el día, la zona o el vehículo.';return;}
  L.marker(catalog.dc,{icon:icon('DC')}).addTo(markers).bindPopup('Centro de distribución');
  r.p.forEach((p,i)=>L.marker(p,{icon:icon(String(i+1),'#2563eb')}).addTo(markers).bindPopup('Parada '+(i+1)));
  for(const [value,label] of [[fmt(r.k),'km modelo'],[money(r.c),'costo modelo'],[fmt(r.g,0),'kg'],[fmt(r.m),'m³']]){
    const k=document.createElement('div');k.className='k';const b=document.createElement('b'),small=document.createElement('small');b.textContent=value;small.textContent=label;k.append(b,small);$('kpis').append(k);
  }
  $('detail').textContent=`${r.i} · ${r.v} · Zona ${r.z} · ${r.p.length} parada(s). ${r.a}`;
  renderOriginal(r);$('status').textContent='Recorrido vial original cargado. Puedes compararlo con una consulta actual.';
}
function fill(preferred){
  const list=filterRoutes(routes,+$('day').value,+$('zone').value,$('veh').value),old=preferred||$('route').value;
  options('route',list.map(r=>[r.i,r.i]),old);$('route').disabled=!list.length;
  $('count').textContent=`${fmt(routes.length,0)} rutas disponibles · ${list.length} para esta selección`;show();
}
async function fetchWithTimeout(url,milliseconds,controller=new AbortController()){
  const timer=setTimeout(()=>controller.abort(),milliseconds);
  try{const response=await fetch(url,{signal:controller.signal});if(!response.ok)throw new Error('HTTP '+response.status);return new Uint8Array(await response.arrayBuffer());}
  finally{clearTimeout(timer);}
}
function drawCurrent(r,result){
  liveLine.clearLayers();const points=result.geometry.coordinates.map(c=>[c[1],c[0]]);
  L.polyline(points,{color:'#dc2626',weight:4,opacity:.9}).addTo(liveLine);fit(points);
  $('status').textContent=`Consulta vial actual: ${fmt(result.distance/1000)} km · ${fmt(result.duration/60,0)} min de conducción estimados. Modelo original: ${fmt(r.k)} km. Los indicadores del modelo se conservan.`;
}
async function calc(){
  const r=current();if(!r)return;cancelRequest();const version=requestVersion;
  if(liveCache.has(r.i)){drawCurrent(r,liveCache.get(r.i));return;}
  const controller=new AbortController();activeRequest=controller;$('go').disabled=true;
  $('status').textContent='Consultando la red vial actual… El recorrido original sigue disponible.';
  const coords=[catalog.dc,...r.p,catalog.dc].map(p=>`${p[1]},${p[0]}`).join(';');
  try{
    const bytes=await fetchWithTimeout(`https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson&steps=false`,20000,controller);
    const data=JSON.parse(new TextDecoder().decode(bytes)),result=data.routes?.[0];
    if(data.code!=='Ok'||result?.geometry?.type!=='LineString'||!result.geometry.coordinates?.length||!result.geometry.coordinates.every(c=>isPoint([c[1],c[0]]))||!Number.isFinite(result.distance)||!Number.isFinite(result.duration))throw new Error(data.code||'Sin recorrido disponible');
    if(version!==requestVersion||current()?.i!==r.i)return;
    liveCache.set(r.i,result);drawCurrent(r,result);
  }catch(e){
    if(version!==requestVersion)return;
    $('status').textContent='No se pudo consultar el servicio vial ahora. El recorrido original permanece visible. '+(e?.name==='AbortError'?'Se agotó el tiempo de espera; puedes reintentar.':String(e?.message||e||'Error de conexión'));
  }finally{if(version===requestVersion){activeRequest=null;$('go').disabled=!current();}}
}
async function readCatalog(){
  const bytes=await fetchWithTimeout(DATA_URL,45000);
  if(bytes.length!==3186834)throw new Error('El archivo de rutas no se descargó completo. Pulsa Reintentar carga.');
  if(typeof crypto!=='undefined'&&crypto.subtle){const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');if(hash!==DATA_SHA)throw new Error('La descarga no coincide con el catálogo validado. Pulsa Reintentar carga.');}
  let text;
  if(typeof DecompressionStream!=='undefined')text=await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
  else if(typeof pako!=='undefined')text=pako.ungzip(bytes,{to:'string'});
  else throw new Error('Este navegador no permite abrir el catálogo. Prueba con Chrome, Edge o Firefox actualizado.');
  return validateCatalog(JSON.parse(text));
}
async function init(){
  $('retry').hidden=true;$('loadtext').textContent='Cargando catálogo completo de 6.350 rutas…';
  try{
    if(typeof L==='undefined')throw new Error('No se pudo cargar el mapa. Comprueba la conexión y vuelve a abrir la página.');
    catalog=await readCatalog();routes=catalog.routes;routeById=new Map(routes.map(r=>[r.i,r]));
    if(!map){
      map=L.map('map').setView(catalog.dc,11);
      const carto=L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{maxZoom:20,attribution:'© OpenStreetMap contributors © CARTO'}).addTo(map);
      const esri=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',{maxZoom:19,attribution:'Tiles © Esri'});
      L.control.layers({'CARTO Positron':carto,'Esri Streets':esri}).addTo(map);L.control.scale().addTo(map);
      originalLine=L.featureGroup().addTo(map);liveLine=L.featureGroup().addTo(map);markers=L.featureGroup().addTo(map);
    }
    options('day',[...new Set(routes.map(r=>r.d))].sort((a,b)=>a-b).map(d=>[d,'Día '+d]),114);
    options('zone',[[0,'Todas'],...[...new Set(routes.map(r=>r.z))].sort((a,b)=>a-b).map(z=>[z,'Zona '+z])],0);
    options('veh',[['','Todos'],...[...new Set(routes.map(r=>r.v))].sort().map(v=>[v,v])],'');
    ['day','zone','veh'].forEach(id=>{$(id).disabled=false;$(id).onchange=()=>fill();});
    $('route').onchange=show;$('go').onclick=calc;$('original').onclick=show;
    fill('D114_Z02_R011');$('load').hidden=true;map.invalidateSize();renderOriginal(current());
  }catch(e){console.error(e);$('loadtext').textContent='No se pudo abrir el visor: '+String(e?.message||e||'Error de carga');$('retry').hidden=false;}
}
window.addEventListener('DOMContentLoaded',()=>{$('retry').onclick=()=>location.reload();init();});
