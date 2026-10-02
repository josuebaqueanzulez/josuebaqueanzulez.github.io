const D=FUTURE_DATA;
const groupState={current:true,quinto:true,barge:true,rail:true,balao:true,nodes:true};
const routeGroup={current:'current',quinto:'quinto',quintoRoad:'quinto',barge:'barge',duranRoad:'barge',railHistoric:'rail',railRoad:'rail',balaoWater:'balao',balaoRoad:'balao'};
const groupRoutes={
  current:['current'],
  quinto:['quinto','quintoRoad'],
  barge:['barge','duranRoad'],
  rail:['railHistoric','railRoad'],
  balao:['balaoWater','balaoRoad']
};
const routeStyle={
  // line-offset separa visualmente corredores que comparten la misma carretera.
  // Cada escenario conserva su propia geometría/layer: apagar uno no borra ni tapa
  // los tramos que pertenecen a otro escenario todavía activo.
  current:{color:'#596a76',dash:null,width:5.5,opacity:.88,offset:-14},
  quinto:{color:'#d98216',dash:[2.2,1.4],width:6.5,opacity:.9,offset:-8},
  quintoRoad:{color:'#1f5f99',dash:null,width:5.5,opacity:.80,offset:-8},
  barge:{color:'#7357a6',dash:null,width:6.5,opacity:.92,offset:0},
  duranRoad:{color:'#2c879b',dash:null,width:5.5,opacity:.80,offset:0},
  railHistoric:{color:'#8a6544',dash:[4,2],width:5.5,opacity:.82,offset:8},
  railRoad:{color:'#438f88',dash:null,width:5.2,opacity:.78,offset:8},
  balaoWater:{color:'#7357a6',dash:[1,2],width:5,opacity:.62,offset:14},
  balaoRoad:{color:'#2c879b',dash:null,width:5,opacity:.72,offset:14}
};
const roadMetrics={};
const loadState={roads:false,hydro:false,hydroFeatures:0};

const map=new maplibregl.Map({
  container:'map',
  style:'https://tiles.openfreemap.org/styles/liberty',
  center:[-79.58,-2.55],
  zoom:7.55,
  attributionControl:true
});
map.addControl(new maplibregl.NavigationControl(),'top-left');
map.addControl(new maplibregl.ScaleControl({maxWidth:120,unit:'metric'}));

function lineFC(coords,props={}){return {type:'FeatureCollection',features:[{type:'Feature',properties:props,geometry:{type:'LineString',coordinates:coords}}]}}
function emptyFC(){return {type:'FeatureCollection',features:[]}}
function pointFC(){return {type:'FeatureCollection',features:Object.entries(D.nodes).map(([id,n])=>({type:'Feature',properties:{id,name:n.name,kind:n.kind},geometry:{type:'Point',coordinates:n.coord}}))}}
function addRouteSource(id,coords,name){map.addSource(id,{type:'geojson',data:lineFC(coords,{id,name})})}
function addRouteLayers(id){
  const s=routeStyle[id],casing=id+'-casing',label=id+'-label';
  const offset=Number.isFinite(s.offset)?s.offset:0;
  map.addLayer({
    id:casing,type:'line',source:id,
    layout:{'line-cap':'round','line-join':'round'},
    paint:{
      'line-color':'#fff',
      'line-width':s.width+4.2,
      'line-opacity':Math.min(1,s.opacity+.1),
      'line-offset':offset
    }
  });
  map.addLayer({
    id:id,type:'line',source:id,
    layout:{'line-cap':'round','line-join':'round'},
    paint:{
      'line-color':s.color,
      'line-width':s.width,
      'line-opacity':s.opacity,
      'line-dasharray':s.dash||[1,0],
      'line-offset':offset
    }
  });
  map.addLayer({
    id:label,type:'symbol',source:id,
    layout:{
      'symbol-placement':'line',
      'symbol-spacing':520,
      'text-field':['get','name'],
      'text-size':10,
      'text-letter-spacing':.03,
      'text-keep-upright':true,
      'text-optional':true
    },
    paint:{'text-color':'#17374e','text-halo-color':'#fff','text-halo-width':2,'text-opacity':.9}
  });
}
function setRouteVisibility(id,show){[id,id+'-casing',id+'-label'].forEach(x=>{if(map.getLayer(x))map.setLayoutProperty(x,'visibility',show?'visible':'none')})}
function setRouteEmphasis(id,on){
  const s=routeStyle[id];
  if(map.getLayer(id)){map.setPaintProperty(id,'line-width',on?s.width+2.3:s.width);map.setPaintProperty(id,'line-opacity',on?1:s.opacity)}
  if(map.getLayer(id+'-casing'))map.setPaintProperty(id+'-casing','line-width',on?s.width+6.2:s.width+3.8);
}
function applyGroupVisibility(){Object.entries(groupRoutes).forEach(([g,ids])=>ids.forEach(id=>setRouteVisibility(id,groupState[g])))}

function osrm(points){
  const coords=points.map(p=>p[1]+','+p[0]).join(';');
  return fetch('https://router.project-osrm.org/route/v1/driving/'+coords+'?overview=full&geometries=geojson&steps=false&alternatives=false&continue_straight=true')
    .then(r=>{if(!r.ok)throw Error(r.status);return r.json()})
    .then(j=>{if(j.code!=='Ok'||!j.routes?.length)throw Error('sin ruta');return j.routes[0]});
}
function durationText(sec){
  if(!Number.isFinite(sec))return '—';
  const h=Math.floor(sec/3600),m=Math.round((sec-h*3600)/60);
  return h+' h '+String(m).padStart(2,'0')+' min';
}
function roadText(id){const m=roadMetrics[id];return m?((m.distance/1000).toFixed(1)+' km'):'Por calcular'}
function roadTime(id){const m=roadMetrics[id];return m?durationText(m.duration):'Por calcular'}

function updateMapStatus(){
  const parts=[];
  parts.push(loadState.roads?'red vial real cargada':'cargando red vial');
  parts.push(loadState.hydro?('hidrografía OSM verificada ('+loadState.hydroFeatures+' segmentos de referencia)'):'verificando hidrografía OSM');
  document.getElementById('mapStatus').textContent=parts.join(' · ')+'. Los corredores compartidos se muestran en paralelo para que cada escenario permanezca visible e independiente.';
}

async function loadRoad(id,points){
  try{
    const r=await osrm(points);
    roadMetrics[id]={distance:r.distance,duration:r.duration};
    map.getSource(id).setData(lineFC(r.geometry.coordinates,{id,name:D.routes[id].name}));
    return true;
  }catch(e){console.warn('No se pudo cargar '+id,e);return false}
}
async function loadRealRoads(){
  updateMapStatus();
  const specs={
    current:D.controls.current,
    quintoRoad:D.controls.quintoRoad,
    duranRoad:D.controls.duranRoad,
    railRoad:D.controls.railRoad,
    balaoRoad:D.controls.balaoRoad
  };
  let ok=0;
  for(const [id,pts] of Object.entries(specs)) if(await loadRoad(id,pts)) ok++;
  loadState.roads=ok===5;
  updateBaseMetrics();
  compareScenario(document.getElementById('scenario').value);
  if(ok!==5) document.getElementById('mapStatus').textContent='Se cargaron '+ok+' de 5 tramos viales reales. La hidrografía se carga por separado desde OpenStreetMap.';
  else updateMapStatus();
}

function overpassFeatureCollection(elements){
  const features=[];
  for(const e of elements||[]){
    if(e.type!=='way'||!Array.isArray(e.geometry)||e.geometry.length<2)continue;
    const name=(e.tags&&e.tags.name)||'Cuerpo de agua';
    const coords=e.geometry.map(p=>[p.lon,p.lat]);
    // El Río Guayas puede devolver segmentos muy largos. Conservamos solo la franja
    // entre Las Esclusas y Durán para que la capa represente el corredor del proyecto.
    if(/guayas/i.test(name)){
      const clipped=coords.filter(c=>c[1]>=-2.30&&c[1]<=-2.13&&c[0]>=-79.89&&c[0]<=-79.81);
      if(clipped.length<2)continue;
      features.push({type:'Feature',properties:{id:'barge',name:'RÍO GUAYAS · CORREDOR FLUVIAL'},geometry:{type:'LineString',coordinates:clipped}});
    }else{
      features.push({type:'Feature',properties:{id:'barge',name:name.toUpperCase()},geometry:{type:'LineString',coordinates:coords}});
    }
  }
  return {type:'FeatureCollection',features};
}

async function fetchOverpassHydro(){
  const q=`[out:json][timeout:25];(
    way["waterway"]["name"~"Estero Santa Ana|Estero del Muerto|Estero Cobina|Canal Guayas-Salado|Río Guayas|Rio Guayas",i](-2.31,-79.96,-2.13,-79.81);
    way(35416928);
  );out geom;`;
  const endpoints=['https://overpass-api.de/api/interpreter','https://overpass.kumi.systems/api/interpreter'];
  let lastErr;
  for(const ep of endpoints){
    try{
      const r=await fetch(ep+'?data='+encodeURIComponent(q));
      if(!r.ok)throw Error('HTTP '+r.status);
      const j=await r.json();
      const fc=overpassFeatureCollection(j.elements);
      if(!fc.features.length)throw Error('sin geometría hidrográfica');
      return fc;
    }catch(e){lastErr=e}
  }
  throw lastErr||Error('Overpass no disponible');
}

async function loadHydroCorridor(){
  // La ruta visible es UN solo LineString curado. Overpass se usa únicamente
  // para comprobar que existen ejes hídricos de referencia en el área.
  // Antes se dibujaban todos los ways devueltos por Overpass como si fueran
  // una sola ruta: eso generaba ramales hacia Tres Bocas, segmentos aislados
  // en el Guayas y una falsa apariencia de discontinuidad.
  map.getSource('barge').setData(lineFC(D.routes.barge.coords,{id:'barge',name:D.routes.barge.name}));
  try{
    const fc=await fetchOverpassHydro();
    loadState.hydro=true;
    loadState.hydroFeatures=fc.features.length;
    updateMapStatus();
  }catch(e){
    console.warn('No se pudo verificar la hidrografía OSM',e);
    loadState.hydro=false;
    document.getElementById('mapStatus').textContent='Red vial cargada. El corredor TPG–Durán permanece visible como trazado conceptual continuo; la comprobación hidrográfica OSM no respondió.';
  }
}

function updateBaseMetrics(){
  if(roadMetrics.current){
    document.getElementById('cRoad').textContent=roadText('current');
    document.getElementById('cTime').textContent=roadTime('current');
  }
}
function showProject(key){
  const p=D.projects[key]||D.projects.current;
  const tagColors={existing:'#eef2f4',construction:'#fff1df',concept:'#f3ecfb',historic:'#f5eee7'};
  document.getElementById('projectCard').innerHTML='<span class="tag" style="background:'+(tagColors[p.tagClass]||'#eef2f4')+'">'+p.tag+'</span><h3>'+p.title+'</h3><p>'+p.desc+'</p><div class="rows"><div><small>Estado</small><b>'+p.state+'</b></div><div><small>Tipo</small><b>'+p.type+'</b></div><div><small>CAPEX</small><b>'+p.capex+'</b></div><div><small>Efecto</small><b>'+p.benefit+'</b></div></div><p><b>Restricción:</b> '+p.restriction+'</p>';
  Object.keys(routeGroup).forEach(id=>setRouteEmphasis(id,false));
  (groupRoutes[key]||['current']).forEach(id=>setRouteEmphasis(id,true));
}
function compareScenario(key){
  let c;
  if(key==='current') c={name:'Ruta actual TPG → Cuenca',road:roadText('current'),alt:'—',transfers:'0',time:roadTime('current'),maturity:'Operativo',effect:'Referencia base'};
  if(key==='quinto') c={name:'Quinto Puente + E25/E582 → Cuenca',road:roadText('quintoRoad')+' después del enlace E25',alt:'Quinto Puente / Viaducto Sur · corredor de proyecto',transfers:'0',time:'Tramo futuro por modelar + '+roadTime('quintoRoad'),maturity:'Parcialmente en obra / corredor completo no operativo',effect:'Evitar parte del recorrido urbano de carga'};
  if(key==='barge') c={name:'Barcaza TPG → Durán + carretera',road:roadText('duranRoad'),alt:'Corredor continuo TPG → Las Esclusas/Cobina → Durán · OSM como referencia hidrográfica',transfers:'1',time:'Tramo fluvial por modelar + '+roadTime('duranRoad'),maturity:'Conceptual; corredor visual continuo, navegabilidad por validar',effect:'Eliminar traslado terrestre del contenedor por Guayaquil'};
  if(key==='rail') c={name:'Durán → Bucay + carretera a Cuenca',road:roadText('railRoad'),alt:'Ferrocarril histórico Durán–Bucay ≈88 km',transfers:'1',time:'Tramo ferroviario por modelar + '+roadTime('railRoad'),maturity:'Ferrocarril histórico/suspendido',effect:'Diversificación modal hasta Bucay'};
  if(key==='balao') c={name:'TPG → Balao + carretera',road:roadText('balaoRoad'),alt:'TPG–Balao · tramo acuático conceptual',transfers:'1',time:'Tramo acuático por modelar + '+roadTime('balaoRoad'),maturity:'Conceptual',effect:'Nodo de transferencia alternativo fuera de Guayaquil'};
  document.getElementById('futureName').textContent=c.name;
  document.getElementById('futureState').textContent=c.maturity;
  document.getElementById('futureTag').textContent=key==='current'?'BASE':'ESCENARIO';
  document.getElementById('fRoad').textContent=c.road;
  document.getElementById('fAlt').textContent=c.alt;
  document.getElementById('fTransfers').textContent=c.transfers;
  document.getElementById('fTime').textContent=c.time;
  document.getElementById('fMaturity').textContent=c.maturity;
  document.getElementById('fEffect').textContent=c.effect;
  showProject(key);
}

map.on('load',()=>{
  Object.entries(D.routes).forEach(([id,r])=>{
    addRouteSource(id,r.coords,r.name);
  });
  Object.keys(D.routes).forEach(addRouteLayers);
  map.addSource('nodes',{type:'geojson',data:pointFC()});
  map.addLayer({id:'nodes',type:'circle',source:'nodes',paint:{'circle-radius':['match',['get','kind'],'port',7,'hub',7,'city',7,'project',6,'water',6,'rail',5,'road',4.5,4.5],'circle-color':['match',['get','kind'],'port','#174b70','hub','#7357a6','city','#102f4a','project','#d98216','water','#2c879b','rail','#8a6544','road','#647b89','#6f7f8a'],'circle-stroke-color':'#fff','circle-stroke-width':1.8}});
  map.addLayer({id:'nodeLabels',type:'symbol',source:'nodes',layout:{'text-field':['get','name'],'text-size':['match',['get','kind'],'city',12,'port',11.5,'hub',11.5,'project',10.5,9.5],'text-offset':[.75,-.75],'text-anchor':'left','text-optional':true},paint:{'text-color':'#17374e','text-halo-color':'#fff','text-halo-width':1.6}});
  applyGroupVisibility();
  compareScenario('current');
  map.fitBounds([[-80.08,-3.03],[-78.84,-2.02]],{padding:35,duration:500});
  loadRealRoads();
  loadHydroCorridor();

  Object.keys(D.routes).forEach(id=>{
    map.on('click',id,e=>{
      const key=routeGroup[id]||'current';
      document.getElementById('scenario').value=key;
      compareScenario(key);
      const name=e.features?.[0]?.properties?.name||D.routes[id].name;
      new maplibregl.Popup().setLngLat(e.lngLat).setHTML('<b>'+name+'</b><br><span class="popup-tag">'+D.projects[key].tag+'</span>').addTo(map);
    });
    map.on('mouseenter',id,()=>map.getCanvas().style.cursor='pointer');
    map.on('mouseleave',id,()=>map.getCanvas().style.cursor='');
  });
  map.on('click','nodes',e=>{const p=e.features[0].properties;new maplibregl.Popup().setLngLat(e.lngLat).setHTML('<b>'+p.name+'</b><br><span class="popup-tag">Nodo de análisis</span>').addTo(map)});
});

document.querySelectorAll('.layer').forEach(c=>c.addEventListener('change',()=>{
  const g=c.dataset.layer;groupState[g]=c.checked;
  if(g==='nodes') ['nodes','nodeLabels'].forEach(id=>{if(map.getLayer(id))map.setLayoutProperty(id,'visibility',c.checked?'visible':'none')});
  else (groupRoutes[g]||[]).forEach(id=>setRouteVisibility(id,c.checked));
}));
document.getElementById('compareBtn').addEventListener('click',()=>compareScenario(document.getElementById('scenario').value));
document.getElementById('scenario').addEventListener('change',()=>compareScenario(document.getElementById('scenario').value));
document.querySelectorAll('.mini').forEach(x=>x.addEventListener('click',()=>{const k=x.dataset.project;document.getElementById('scenario').value=k;compareScenario(k)}));
