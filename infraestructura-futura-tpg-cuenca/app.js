const D=FUTURE_DATA;
const years=[2026,2030,2035,2045];
const groupState={current:true,quinto:true,barge:true,rail:true,balao:true,nodes:true};
const routeGroup={current:'current',quinto:'quinto',quintoPhase:'quinto',quintoLink:'quinto',barge:'barge',duranRoad:'barge',railHistoric:'rail',railFuture:'rail',balaoWater:'balao',balaoRoad:'balao'};
const routeStyle={
 current:{color:'#6b7780',dash:null,width:4.5,opacity:.72},
 quinto:{color:'#d98216',dash:[2.2,1.4],width:6,opacity:.85},
 quintoPhase:{color:'#ed6a1a',dash:null,width:8,opacity:1},
 quintoLink:{color:'#1f5f99',dash:[1,1.6],width:5,opacity:.72},
 barge:{color:'#7357a6',dash:[1,1.5],width:6,opacity:.78},
 duranRoad:{color:'#2c879b',dash:[4,1.6],width:4.5,opacity:.6},
 railHistoric:{color:'#8a6544',dash:[4,2],width:5.5,opacity:.78},
 railFuture:{color:'#8a6544',dash:[1,1.8],width:5,opacity:.5},
 balaoWater:{color:'#2c879b',dash:[1,2],width:5,opacity:.5},
 balaoRoad:{color:'#2c879b',dash:[1,2],width:4.5,opacity:.45}
};

const map=new maplibregl.Map({container:'map',style:'https://tiles.openfreemap.org/styles/liberty',center:[-79.60,-2.55],zoom:7.65,attributionControl:true});
map.addControl(new maplibregl.NavigationControl(),'top-left');
map.addControl(new maplibregl.ScaleControl({maxWidth:120,unit:'metric'}));

function lineFC(coords,props={}){return {type:'FeatureCollection',features:[{type:'Feature',properties:props,geometry:{type:'LineString',coordinates:coords}}]}}
function pointFC(){return {type:'FeatureCollection',features:Object.entries(D.nodes).map(([id,n])=>({type:'Feature',properties:{id,name:n.name,kind:n.kind},geometry:{type:'Point',coordinates:n.coord}}))}}
function addRouteSource(id,coords,name){map.addSource(id,{type:'geojson',data:lineFC(coords,{id,name})})}
function addRouteLayers(id){
 const s=routeStyle[id],casing=id+'-casing',label=id+'-label';
 map.addLayer({id:casing,type:'line',source:id,layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':'#fff','line-width':s.width+3.5,'line-opacity':Math.min(1,s.opacity+.12)}});
 map.addLayer({id:id,type:'line',source:id,layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':s.color,'line-width':s.width,'line-opacity':s.opacity,'line-dasharray':s.dash||[1,0]}});
 map.addLayer({id:label,type:'symbol',source:id,layout:{'symbol-placement':'line-center','text-field':['get','name'],'text-size':10.5,'text-letter-spacing':.03,'text-keep-upright':true},paint:{'text-color':'#17374e','text-halo-color':'#fff','text-halo-width':2,'text-opacity':.9}});
}
function setRouteVisibility(id,show){[id,id+'-casing',id+'-label'].forEach(x=>{if(map.getLayer(x))map.setLayoutProperty(x,'visibility',show?'visible':'none')})}
function setRouteEmphasis(id,on){const s=routeStyle[id];if(map.getLayer(id)){map.setPaintProperty(id,'line-width',on?s.width+2:s.width);map.setPaintProperty(id,'line-opacity',on?1:s.opacity)}if(map.getLayer(id+'-casing'))map.setPaintProperty(id+'-casing','line-width',on?s.width+6:s.width+3.5)}

function currentYear(){return years[+document.getElementById('year').value]}
function updateTimeline(){
 const y=currentYear(), captions={2026:'Red actual + obras iniciadas',2030:'Escenario de corredor vial consolidado',2035:'Escenarios intermodales de mediano plazo',2045:'Escenarios conceptuales de largo plazo'};
 document.getElementById('yearText').innerHTML='<b>'+y+'</b><span>'+captions[y]+'</span>';
 Object.entries(routeGroup).forEach(([id,g])=>{
   let min=id==='quintoPhase'?2026:D.routes[id]?.minYear||2026;
   let visible=groupState[g] && y>=min;
   if(id==='quintoPhase') visible=groupState.quinto && y===2026;
   if(id==='quinto' && y===2026) visible=groupState.quinto; // full reference shown lightly beneath Phase 1A
   setRouteVisibility(id,visible);
   if(id==='quinto'&&y===2026){map.setPaintProperty(id,'line-opacity',.28);map.setPaintProperty(id+'-casing','line-opacity',.20)}
   else if(map.getLayer(id)){map.setPaintProperty(id,'line-opacity',routeStyle[id].opacity);map.setPaintProperty(id+'-casing','line-opacity',Math.min(1,routeStyle[id].opacity+.12))}
 });
 document.getElementById('mapStatus').textContent='Horizonte '+y+' · los años posteriores a 2026 son escenarios académicos, no fechas oficiales de puesta en servicio.';
}

function showProject(key){
 const p=D.projects[key]||D.projects.current;
 const tagColors={existing:'#eef2f4',construction:'#fff1df',concept:'#f3ecfb',historic:'#f5eee7'};
 document.getElementById('projectCard').innerHTML='<span class="tag" style="background:'+(tagColors[p.tagClass]||'#eef2f4')+'">'+p.tag+'</span><h3>'+p.title+'</h3><p>'+p.desc+'</p><div class="rows"><div><small>Estado</small><b>'+p.state+'</b></div><div><small>Tipo</small><b>'+p.type+'</b></div><div><small>CAPEX</small><b>'+p.capex+'</b></div><div><small>Efecto</small><b>'+p.benefit+'</b></div></div><p><b>Restricción:</b> '+p.restriction+'</p>';
 ['current','quinto','quintoPhase','quintoLink','barge','duranRoad','railHistoric','railFuture','balaoWater','balaoRoad'].forEach(id=>setRouteEmphasis(id,false));
 const ids={current:['current'],quinto:['quinto','quintoPhase','quintoLink'],barge:['barge','duranRoad'],rail:['railHistoric','railFuture'],balao:['balaoWater','balaoRoad']}[key]||['current'];
 ids.forEach(id=>setRouteEmphasis(id,true));
}

function compareScenario(key){
 const c=D.comparison[key]||D.comparison.current;
 document.getElementById('futureName').textContent=c.name;
 document.getElementById('futureState').textContent=c.maturity;
 document.getElementById('futureTag').textContent=key==='current'?'BASE':'FUTURO';
 document.getElementById('fRoad').textContent=c.road;
 document.getElementById('fAlt').textContent=c.alt;
 document.getElementById('fTransfers').textContent=c.transfers;
 document.getElementById('fTime').textContent=c.time;
 document.getElementById('fMaturity').textContent=c.maturity;
 document.getElementById('fEffect').textContent=c.effect;
 showProject(key);
}

map.on('load',()=>{
 Object.entries(D.routes).forEach(([id,r])=>addRouteSource(id,r.coords,r.name));
 const phaseCoords=D.routes.quinto.coords.slice(0,5);
 addRouteSource('quintoPhase',phaseCoords,'QUINTO PUENTE · FASE 1A / TRAMO URBANO');
 ['current','quinto','quintoPhase','quintoLink','barge','duranRoad','railHistoric','railFuture','balaoWater','balaoRoad'].forEach(addRouteLayers);
 map.addSource('nodes',{type:'geojson',data:pointFC()});
 map.addLayer({id:'nodes',type:'circle',source:'nodes',paint:{'circle-radius':['match',['get','kind'],'port',7,'hub',7,'city',7,'project',6,'water',6,'rail',5,4.5],'circle-color':['match',['get','kind'],'port','#174b70','hub','#7357a6','city','#102f4a','project','#d98216','water','#2c879b','rail','#8a6544','#6f7f8a'],'circle-stroke-color':'#fff','circle-stroke-width':1.8}});
 map.addLayer({id:'nodeLabels',type:'symbol',source:'nodes',layout:{'text-field':['get','name'],'text-size':['match',['get','kind'],'city',12,'port',11.5,'hub',11.5,9.5],'text-offset':[.75,-.75],'text-anchor':'left','text-optional':true},paint:{'text-color':'#17374e','text-halo-color':'#fff','text-halo-width':1.6}});
 updateTimeline(); compareScenario('current');
 map.fitBounds([[-80.08,-3.02],[-78.96,-2.02]],{padding:35,duration:500});

 ['current','quinto','quintoPhase','quintoLink','barge','duranRoad','railHistoric','railFuture','balaoWater','balaoRoad'].forEach(id=>{
   map.on('click',id,e=>{
     const key=routeGroup[id]||'current'; showProject(key);
     const name=e.features?.[0]?.properties?.name||id;
     new maplibregl.Popup().setLngLat(e.lngLat).setHTML('<b>'+name+'</b><br><span class="popup-tag">'+D.projects[key].tag+'</span>').addTo(map);
   });
   map.on('mouseenter',id,()=>map.getCanvas().style.cursor='pointer');map.on('mouseleave',id,()=>map.getCanvas().style.cursor='');
 });
 map.on('click','nodes',e=>{const p=e.features[0].properties;new maplibregl.Popup().setLngLat(e.lngLat).setHTML('<b>'+p.name+'</b><br><span class="popup-tag">Nodo de análisis</span>').addTo(map)});
});

document.getElementById('year').addEventListener('input',updateTimeline);
document.querySelectorAll('.layer').forEach(c=>c.addEventListener('change',()=>{const g=c.dataset.layer;groupState[g]=c.checked;if(g==='nodes'){['nodes','nodeLabels'].forEach(id=>{if(map.getLayer(id))map.setLayoutProperty(id,'visibility',c.checked?'visible':'none')})}else updateTimeline()}));
document.getElementById('compareBtn').addEventListener('click',()=>compareScenario(document.getElementById('scenario').value));
document.getElementById('scenario').addEventListener('change',()=>compareScenario(document.getElementById('scenario').value));
document.querySelectorAll('.mini').forEach(x=>x.addEventListener('click',()=>{const k=x.dataset.project;document.getElementById('scenario').value=k;compareScenario(k)}));
