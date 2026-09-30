// Refuerzo específico para Puerto Bolívar → Cuenca.
// Usa Valhalla con perfil TRUCK y puntos comprobados sobre la E59.
// Si el servicio no responde, conserva como respaldo el trazado segmentado OSRM.

function decodePolyline6(str){
  let index=0, lat=0, lon=0, coordinates=[];
  while(index<str.length){
    let b, shift=0, result=0;
    do{ b=str.charCodeAt(index++)-63; result|=(b&0x1f)<<shift; shift+=5; }while(b>=0x20);
    const dlat=(result&1)?~(result>>1):(result>>1); lat+=dlat;
    shift=0; result=0;
    do{ b=str.charCodeAt(index++)-63; result|=(b&0x1f)<<shift; shift+=5; }while(b>=0x20);
    const dlon=(result&1)?~(result>>1):(result>>1); lon+=dlon;
    coordinates.push([lon/1e6,lat/1e6]);
  }
  return coordinates;
}

async function valhallaTruck(points){
  const req={
    locations:points.map((p,i)=>({
      lat:p[0],lon:p[1],
      type:(i===0||i===points.length-1)?'break':'via'
    })),
    costing:'truck',
    costing_options:{
      truck:{height:4.2,width:2.6,length:18.5,weight:40,axle_load:10}
    },
    directions_options:{units:'kilometers'}
  };
  const url='https://valhalla1.openstreetmap.de/route?json='+encodeURIComponent(JSON.stringify(req));
  const r=await fetch(url,{headers:{'X-Client-Id':'josuebaqueanzulez.github.io-intermodal'}});
  if(!r.ok) throw Error('Valhalla '+r.status);
  const j=await r.json();
  if(!j.trip||!j.trip.legs||!j.trip.legs.length) throw Error('Valhalla sin ruta');
  let coordinates=[];
  for(const leg of j.trip.legs){
    const seg=decodePolyline6(leg.shape);
    if(coordinates.length&&seg.length) coordinates.push(...seg.slice(1)); else coordinates.push(...seg);
  }
  const lengthKm=j.trip.summary?.length||j.trip.legs.reduce((s,l)=>s+(l.summary?.length||0),0);
  const timeSec=j.trip.summary?.time||j.trip.legs.reduce((s,l)=>s+(l.summary?.time||0),0);
  return {geometry:{coordinates},distance:lengthKm*1000,duration:timeSec};
}

// Sobrescribe la función original de app.js una vez cargados ambos scripts.
loadRealRoads = async function(){
  document.getElementById('mapStatus').textContent='Calculando corredores de carga: OSRM para Molleturo/Zhud y Valhalla TRUCK para Puerto Bolívar–Cuenca…';
  const o=origin();

  const M=[
    [o.lat,o.lon],
    [-2.55984,-79.55158],
    [-2.58328,-79.50267],
    [DATA.nodes.molleturo.lat,DATA.nodes.molleturo.lon],
    [DATA.nodes.cajas.lat,DATA.nodes.cajas.lon],
    [DATA.nodes.cuenca.lat,DATA.nodes.cuenca.lon]
  ];

  const Z=[
    [o.lat,o.lon],
    [DATA.nodes.eltriunfo.lat,DATA.nodes.eltriunfo.lon],
    [DATA.nodes.latroncal.lat,DATA.nodes.latroncal.lon],
    [DATA.nodes.cochancay.lat,DATA.nodes.cochancay.lon],
    [DATA.nodes.zhud.lat,DATA.nodes.zhud.lon],
    [DATA.nodes.eltambo.lat,DATA.nodes.eltambo.lon],
    [DATA.nodes.canar.lat,DATA.nodes.canar.lon],
    [DATA.nodes.azogues.lat,DATA.nodes.azogues.lon],
    [DATA.nodes.puertoseco.lat,DATA.nodes.puertoseco.lon],
    [DATA.nodes.cuenca.lat,DATA.nodes.cuenca.lon]
  ];

  // Puntos realmente situados sobre la E59 (no centroides de poblados).
  // Se usan pocos puntos, pero exactos, y un perfil de camión pesado para evitar
  // caminos locales y atajos de automóvil entre Casacay/Sarayunga/Girón.
  const PB=[
    [DATA.nodes.puertobolivar.lat,DATA.nodes.puertobolivar.lon],
    [-3.329444,-79.751472], // E59 vía Cuenca, sector Casacay (punto vial documentado)
    [-3.312590,-79.570980], // OSM primary ref=E59, sector Sarayunga/Lacay
    [-3.265930,-79.261060], // OSM primary ref=E59, sector El Rosario/Yunguilla
    [-3.167210,-79.153840], // OSM primary ref=E59, Girón
    [DATA.nodes.cuenca.lat,DATA.nodes.cuenca.lon]
  ];

  let ok=0, truckOK=false;
  try{
    const r=await osrm(M);
    routeData.M=r; map.getSource('routeM').setData(fcLine(r.geometry.coordinates));
    document.getElementById('distM').textContent=(r.distance/1000).toFixed(1)+' km'; ok++;
  }catch(e){document.getElementById('distM').textContent='190 km base';}

  try{
    const r=await osrm(Z);
    routeData.Z=r; map.getSource('routeZ').setData(fcLine(r.geometry.coordinates));
    document.getElementById('distZ').textContent=(r.distance/1000).toFixed(1)+' km'; ok++;
  }catch(e){document.getElementById('distZ').textContent='244 km base';}

  try{
    const r=await valhallaTruck(PB);
    routeData.PB=r; map.getSource('routePB').setData(fcLine(r.geometry.coordinates));
    document.getElementById('distPB').textContent=(r.distance/1000).toFixed(1)+' km';
    ok++; truckOK=true;
  }catch(e){
    console.warn('Valhalla TRUCK no disponible, usando respaldo OSRM segmentado',e);
    try{
      const r=await osrmSegmented(PB);
      routeData.PB=r; map.getSource('routePB').setData(fcLine(r.geometry.coordinates));
      document.getElementById('distPB').textContent=(r.distance/1000).toFixed(1)+' km'; ok++;
    }catch(e2){document.getElementById('distPB').textContent='172 km base';}
  }

  document.getElementById('mapStatus').textContent=truckOK
    ?'Puerto Bolívar → Cuenca calculada con perfil de camión pesado (Valhalla TRUCK), anclada a la E59. Molleturo y Zhud conservan OSRM porque ya fueron validados visualmente.'
    :(ok===3
      ?'Valhalla TRUCK no respondió; Puerto Bolívar → Cuenca usa temporalmente respaldo OSRM segmentado sobre puntos E59.'
      :'Se cargaron '+ok+' de 3 corredores. Revisa conexión y recarga.');
  evaluate();
};
