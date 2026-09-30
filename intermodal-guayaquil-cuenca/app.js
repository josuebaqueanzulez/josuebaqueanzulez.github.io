/* DATA loaded from data.js */
const BASE={M:469.5,Z:596.6,PB:1060.3}, BASEHOUR=60, GATECAP=40, TARGET=.85, SHIFT=8;
const E=Object.fromEntries(['terminal','preset','cargo','gate','mol','zhud','feed','terminalok','docsok','molok','zhudok','feedok','transferok','demand'].map(id=>[id,document.getElementById(id)]));
function n(id){return parseFloat(E[id].value)||0} function money(v){return 'USD '+v.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}
function status(elem,cls,title,text){elem.className='status '+cls;elem.innerHTML='<b>'+title+'</b><small>'+text+'</small>'}

const map = new maplibregl.Map({
  container:'map',
  style:'https://tiles.openfreemap.org/styles/liberty',
  center:[-79.65,-2.72],
  zoom:7.6,
  attributionControl:true
});
map.addControl(new maplibregl.NavigationControl(), 'top-left');
map.addControl(new maplibregl.ScaleControl({maxWidth:120,unit:'metric'}));

const colors={M:'#16845b',Z:'#d49a13',SEA:'#7457a6',PB:'#c44747'};
let routeData={M:null,Z:null,PB:null};
function fcLine(coords, props={}){return {type:'FeatureCollection',features:[{type:'Feature',properties:props,geometry:{type:'LineString',coordinates:coords}}]}}
function fcPoints(items){return {type:'FeatureCollection',features:items.map(x=>({type:'Feature',properties:{name:x.name,kind:x.kind||'buoy'},geometry:{type:'Point',coordinates:[x.lon,x.lat]}}))}}
function origin(){return DATA.nodes[E.terminal.value]}

function fallbackM(){
  const a=DATA.fallback.mol_contecon.map(x=>x.slice()); a[0]=[origin().lon,origin().lat]; return a;
}
function fallbackZ(){
  const a=DATA.fallback.zhud_contecon.map(x=>x.slice()); a[0]=[origin().lon,origin().lat]; return a;
}
function seaCoords(){
  return (E.terminal.value==='tpg'?DATA.maritimeTPG:DATA.maritimeContecon).map(x=>[x.lon,x.lat]);
}
function addOrSetSource(id,data){
  if(map.getSource(id)) map.getSource(id).setData(data); else map.addSource(id,{type:'geojson',data});
}
function ensureLayers(){
  const spec=[
    {id:'routeM',source:'routeM',color:colors.M,label:'MOLLETURO'},
    {id:'routeZ',source:'routeZ',color:colors.Z,label:'ZHUD + PUERTO SECO'},
    {id:'routeSea',source:'routeSea',color:'#7457a6',label:'FEEDER GUAYAQUIL → PUERTO BOLÍVAR',dash:[2,1.3]},
    {id:'routePB',source:'routePB',color:colors.PB,label:'PUERTO BOLÍVAR → CUENCA'}
  ];

  spec.forEach(s=>{
    const casing=s.id+'-casing';
    if(!map.getLayer(casing)) map.addLayer({
      id:casing,type:'line',source:s.source,
      layout:{'line-cap':'round','line-join':'round'},
      paint:{'line-color':'#ffffff','line-width':10,'line-opacity':.9,'line-blur':.25}
    });

    if(!map.getLayer(s.id)) map.addLayer({
      id:s.id,type:'line',source:s.source,
      layout:{'line-cap':'round','line-join':'round'},
      paint:{'line-color':s.color,'line-width':6,'line-opacity':.7,'line-dasharray':s.dash||[1,0]}
    });

    const arrows=s.id+'-arrows';
    if(!map.getLayer(arrows)) map.addLayer({
      id:arrows,type:'symbol',source:s.source,
      layout:{
        'symbol-placement':'line',
        'symbol-spacing':100,
        'text-field':'➤',
        'text-size':15,
        'text-rotation-alignment':'map',
        'text-keep-upright':false,
        'text-allow-overlap':true
      },
      paint:{'text-color':s.color,'text-halo-color':'#ffffff','text-halo-width':1.6,'text-opacity':.75}
    });

    const label=s.id+'-label';
    if(!map.getLayer(label)) map.addLayer({
      id:label,type:'symbol',source:s.source,
      layout:{
        'symbol-placement':'line-center',
        'text-field':s.label,
        'text-size':11,
        'text-letter-spacing':.05,
        'text-rotation-alignment':'map',
        'text-keep-upright':true
      },
      paint:{'text-color':'#17374e','text-halo-color':'#ffffff','text-halo-width':2.2,'text-opacity':.95}
    });
  });

  if(!map.getLayer('nodes')) map.addLayer({
    id:'nodes',type:'circle',source:'nodes',
    paint:{
      'circle-radius':['match',['get','kind'],'terminal',6.5,'port',6.5,'dry',6.2,'dest',6.5,'risk',5.6,4],
      'circle-color':['match',['get','kind'],'terminal','#1d628e','port','#7457a6','dry','#7046a5','dest','#102f4a','risk','#c44747','#718694'],
      'circle-stroke-color':'#fff','circle-stroke-width':1.8
    }
  });

  if(!map.getLayer('nodeLabels')) map.addLayer({
    id:'nodeLabels',type:'symbol',source:'nodes',
    layout:{
      'text-field':['get','name'],
      'text-size':['match',['get','kind'],'town',9,'terminal',11,'port',11,'dry',11,'dest',12,'risk',10,9],
      'text-offset':[0.8,-0.7],
      'text-anchor':'left',
      'text-optional':true
    },
    paint:{
      'text-color':['match',['get','kind'],'town','#526777','#17374e'],
      'text-halo-color':'#fff',
      'text-halo-width':['match',['get','kind'],'town',1.1,1.7],
      'text-opacity':['match',['get','kind'],'town',.78,1]
    }
  });

  if(!map.getLayer('buoys')) map.addLayer({
    id:'buoys',type:'circle',source:'buoys',
    paint:{'circle-radius':3.2,'circle-color':'#fff','circle-stroke-color':'#355b75','circle-stroke-width':1.2},
    layout:{'visibility':'none'}
  });
}
function nodesFC(){
  return fcPoints(Object.values(DATA.nodes));
}
function buoyFC(){
  return fcPoints(DATA.maritimeContecon.slice(1,-1));
}

map.on('load',()=>{
  addOrSetSource('routeM',fcLine(fallbackM()));
  addOrSetSource('routeZ',fcLine(fallbackZ()));
  addOrSetSource('routeSea',fcLine(seaCoords()));
  addOrSetSource('routePB',fcLine(DATA.fallback.pbroad));
  addOrSetSource('nodes',nodesFC());
  addOrSetSource('buoys',buoyFC());
  ensureLayers();
  loadRealRoads();
  fitAll();
  evaluate();
});

function osrm(points){
  const coords=points.map(p=>p[1]+','+p[0]).join(';');
  return fetch('https://router.project-osrm.org/route/v1/driving/'+coords+'?overview=full&geometries=geojson&steps=false')
    .then(r=>{if(!r.ok)throw Error(r.status);return r.json()})
    .then(j=>{if(j.code!=='Ok'||!j.routes?.length)throw Error('sin ruta');return j.routes[0];});
}
async function loadRealRoads(){
  document.getElementById('mapStatus').textContent='Cargando geometría vial real desde OSRM…';
  const o=origin();
  const M=[[o.lat,o.lon],[DATA.nodes.naranjal.lat,DATA.nodes.naranjal.lon],[DATA.nodes.molleturo.lat,DATA.nodes.molleturo.lon],[DATA.nodes.cajas.lat,DATA.nodes.cajas.lon],[DATA.nodes.cuenca.lat,DATA.nodes.cuenca.lon]];
  const Z=[[o.lat,o.lon],[DATA.nodes.eltriunfo.lat,DATA.nodes.eltriunfo.lon],[DATA.nodes.latroncal.lat,DATA.nodes.latroncal.lon],[DATA.nodes.cochancay.lat,DATA.nodes.cochancay.lon],[DATA.nodes.zhud.lat,DATA.nodes.zhud.lon],[DATA.nodes.eltambo.lat,DATA.nodes.eltambo.lon],[DATA.nodes.canar.lat,DATA.nodes.canar.lon],[DATA.nodes.azogues.lat,DATA.nodes.azogues.lon],[DATA.nodes.puertoseco.lat,DATA.nodes.puertoseco.lon],[DATA.nodes.cuenca.lat,DATA.nodes.cuenca.lon]];
  const PB=[[DATA.nodes.puertobolivar.lat,DATA.nodes.puertobolivar.lon],[DATA.nodes.machala.lat,DATA.nodes.machala.lon],[DATA.nodes.pasaje.lat,DATA.nodes.pasaje.lon],[DATA.nodes.giron.lat,DATA.nodes.giron.lon],[DATA.nodes.cuenca.lat,DATA.nodes.cuenca.lon]];
  let ok=0;
  try{const r=await osrm(M);routeData.M=r;map.getSource('routeM').setData(fcLine(r.geometry.coordinates));document.getElementById('distM').textContent=(r.distance/1000).toFixed(1)+' km';ok++;}catch(e){document.getElementById('distM').textContent='190 km base';}
  try{const r=await osrm(Z);routeData.Z=r;map.getSource('routeZ').setData(fcLine(r.geometry.coordinates));document.getElementById('distZ').textContent=(r.distance/1000).toFixed(1)+' km';ok++;}catch(e){document.getElementById('distZ').textContent='244 km base';}
  try{const r=await osrm(PB);routeData.PB=r;map.getSource('routePB').setData(fcLine(r.geometry.coordinates));document.getElementById('distPB').textContent=(r.distance/1000).toFixed(1)+' km';ok++;}catch(e){document.getElementById('distPB').textContent='172 km base';}
  document.getElementById('mapStatus').textContent=ok===3?'Base vectorial activa. Las 3 rutas viales fueron calculadas sobre la red OpenStreetMap mediante OSRM. La ruta recomendada se resalta con borde blanco, mayor grosor, flechas y etiqueta.':('Base vectorial activa. Se cargaron '+ok+' de 3 rutas viales reales; las restantes conservan el trazado de respaldo.');
  evaluate();
}
function fitAll(){
  map.fitBounds([[-80.48,-3.38],[-78.78,-2.12]],{padding:35,duration:500});
}
map.on('click','nodes',e=>{
  const p=e.features[0].properties; new maplibregl.Popup().setLngLat(e.lngLat).setHTML('<b>'+p.name+'</b><br>'+p.kind).addTo(map);
});
map.on('click','buoys',e=>{
  const p=e.features[0].properties; new maplibregl.Popup().setLngLat(e.lngLat).setHTML('<b>'+p.name+'</b><br>Ayuda/referencia INOCAR').addTo(map);
});

function setRouteVisual(id,active){
  const casing=id+'-casing', arrows=id+'-arrows', label=id+'-label';
  if(map.getLayer(id)){
    map.setPaintProperty(id,'line-opacity',active?1:.34);
    map.setPaintProperty(id,'line-width',active?8.5:5.2);
  }
  if(map.getLayer(casing)){
    map.setPaintProperty(casing,'line-opacity',active?.98:.48);
    map.setPaintProperty(casing,'line-width',active?13:8.5);
  }
  if(map.getLayer(arrows)) map.setPaintProperty(arrows,'text-opacity',active?.98:.32);
  if(map.getLayer(label)) map.setPaintProperty(label,'text-opacity',active?1:.55);
}
function highlight(dec){
  ['routeM','routeZ','routeSea','routePB'].forEach(id=>setRouteVisual(id,false));
  if(dec==='M') setRouteVisual('routeM',true);
  if(dec==='Z') setRouteVisual('routeZ',true);
  if(dec==='PB'){setRouteVisual('routeSea',true);setRouteVisual('routePB',true);}
}
function evaluate(){
  ['gate','mol','zhud','feed'].forEach(id=>document.getElementById(id+'v').textContent=n(id).toFixed(1));document.getElementById('demandv').textContent=n('demand').toFixed(0);
  const hour=BASEHOUR+n('cargo');document.getElementById('hourCost').textContent='USD '+hour.toFixed(0);
  let cM=BASE.M+(n('gate')+n('mol'))*hour, cZ=BASE.Z+(n('gate')+n('zhud'))*hour, cPB=BASE.PB+n('feed')*hour;
  if(!E.molok.checked)cM=999999;if(!E.zhudok.checked)cZ=999999;if(!E.feedok.checked||!E.transferok.checked)cPB=999999;
  document.getElementById('costM').textContent=cM>=999999?'No disponible':money(cM);document.getElementById('costZ').textContent=cZ>=999999?'No disponible':money(cZ);document.getElementById('costPB').textContent=cPB>=999999?'No disponible':money(cPB);
  document.getElementById('delayM').textContent='Demora '+(n('gate')+n('mol')).toFixed(1)+' h';document.getElementById('delayZ').textContent='Demora '+(n('gate')+n('zhud')).toFixed(1)+' h';document.getElementById('delayPB').textContent='Feeder '+n('feed').toFixed(1)+' h';
  let dec='M',d=document.getElementById('decision');
  if(!E.terminalok.checked){status(d,'gray','GRIS · recuperar terminal','La disrupción está dentro del nodo de origen; cambiar de corredor no libera el contenedor.');dec='G';}
  else if(!E.docsok.checked){status(d,'gray','GRIS · liberar carga','La restricción es documental/aduanera; primero debe liberarse la mercancía.');dec='G';}
  else{let mn=Math.min(cM,cZ,cPB);if(mn>=999999){status(d,'gray','GRIS · sin corredor','No existe una alternativa disponible.');dec='G';}else if(cM===mn){status(d,'green','VERDE · Molleturo','La ruta directa conserva el menor costo generalizado.');dec='M';}else if(cZ===mn){status(d,'yellow','AMARILLO · Zhud + Puerto Seco','La contingencia terrestre supera a esperar en Molleturo y aún es preferible al feeder.');dec='Z';}else{status(d,'red','ROJO · Puerto Bolívar + Puerto Seco','La combinación marítimo-carretera evita la degradación de los accesos terrestres.');dec='PB';}}
  highlight(dec);
  const dem=n('demand'),ex=Math.max(0,dem-GATECAP*TARGET),sh=dem?ex/dem:0,cnt=ex*SHIFT;document.getElementById('share').textContent=(sh*100).toFixed(1)+' %';document.getElementById('shift').textContent=cnt.toFixed(0);
  const cs=document.getElementById('capacity');if(dem<=GATECAP*TARGET)status(cs,'green','CAPACIDAD · normal','El gate está dentro del objetivo de utilización.');else if(dem<=GATECAP)status(cs,'yellow','CAPACIDAD · preventiva','Desviar aproximadamente '+(sh*100).toFixed(1)+' % puede devolver la operación al 85 %.');else status(cs,'red','CAPACIDAD · saturación','La demanda supera la capacidad base; el feeder puede funcionar como válvula de alivio.');
}
function applyPreset(k){
 const P={normal:[0,0,0,0,34,'0',true,true,true,true,true,true],gate:[8,0,0,1,45,'0',true,true,true,true,true,true],mol:[0,16,0,1,34,'0',true,true,true,true,true,true],both:[0,16,9,1,34,'0',true,true,true,true,true,true],peak:[2,0,0,1,50,'0',true,true,true,true,true,true],jit:[2,4,2,1,34,'500',true,true,true,true,true,true],terminalfail:[0,0,0,0,34,'0',false,true,true,true,true,false],docs:[0,0,0,0,34,'0',true,false,true,true,true,true]}[k];
 ['gate','mol','zhud','feed','demand','cargo','terminalok','docsok','molok','zhudok','feedok','transferok'].forEach((id,i)=>{if(typeof P[i]==='boolean')E[id].checked=P[i];else E[id].value=P[i]});evaluate();
}
E.preset.addEventListener('change',()=>applyPreset(E.preset.value));['cargo','gate','mol','zhud','feed','terminalok','docsok','molok','zhudok','feedok','transferok','demand'].forEach(id=>E[id].addEventListener('input',evaluate));
E.terminal.addEventListener('change',()=>{
  if(map.loaded()){map.getSource('routeM').setData(fcLine(fallbackM()));map.getSource('routeZ').setData(fcLine(fallbackZ()));map.getSource('routeSea').setData(fcLine(seaCoords()));loadRealRoads();}
});
document.querySelectorAll('.layer').forEach(c=>c.addEventListener('change',()=>{
  const id=c.dataset.layer, vis=c.checked?'visible':'none';
  if(id==='nodes'){
    if(map.getLayer('nodes'))map.setLayoutProperty('nodes','visibility',vis);
    if(map.getLayer('nodeLabels'))map.setLayoutProperty('nodeLabels','visibility',vis);
  } else if(id==='buoys'){
    if(map.getLayer('buoys'))map.setLayoutProperty('buoys','visibility',vis);
  } else {
    [id,id+'-casing',id+'-arrows',id+'-label'].forEach(x=>{if(map.getLayer(x))map.setLayoutProperty(x,'visibility',vis);});
  }
}));
