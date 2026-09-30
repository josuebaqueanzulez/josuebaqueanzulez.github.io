const FUTURE_DATA={
  nodes:{
    tpg:{name:'TPG / Isla Trinitaria',coord:[-79.92776,-2.24766],kind:'port'},
    tomala:{name:'Av. Cacique Tomalá',coord:[-79.895,-2.295],kind:'project'},
    taura:{name:'Taura · corredor del proyecto',coord:[-79.67018,-2.35202],kind:'project'},
    duran:{name:'Durán · nodo intermodal propuesto',coord:[-79.835,-2.170],kind:'hub'},
    locks:{name:'Las Esclusas / Estero Cobina',coord:[-79.884,-2.269],kind:'water'},
    e25:{name:'E25 · enlace Virgen de Fátima',coord:[-79.637798,-2.308440],kind:'road'},
    molleturo:{name:'Molleturo',coord:[-79.39686,-2.76617],kind:'road'},
    cajas:{name:'Parque Nacional Cajas',coord:[-79.22301,-2.78407],kind:'road'},
    cuenca:{name:'Cuenca',coord:[-79.00453,-2.90055],kind:'city'},
    yaguachi:{name:'Yaguachi',coord:[-79.694,-2.097],kind:'rail'},
    milagro:{name:'Milagro',coord:[-79.594,-2.134],kind:'rail'},
    naranjito:{name:'Naranjito',coord:[-79.465,-2.166],kind:'rail'},
    bucay:{name:'Bucay',coord:[-79.139,-2.203],kind:'rail'},
    eltriunfo:{name:'El Triunfo',coord:[-79.404,-2.333],kind:'road'},
    latroncal:{name:'La Troncal',coord:[-79.339,-2.423],kind:'road'},
    zhud:{name:'Zhud',coord:[-79.004,-2.462],kind:'road'},
    canar:{name:'Cañar',coord:[-78.93808,-2.55941],kind:'road'},
    azogues:{name:'Azogues',coord:[-78.84860,-2.73969],kind:'road'},
    balao:{name:'Balao · nodo conceptual',coord:[-79.816,-2.911],kind:'concept'}
  },

  controls:{
    current:[
      [-2.24766,-79.92776],
      [-2.308440,-79.637798],
      [-2.425964,-79.625350],
      [-2.495614,-79.600925],
      [-2.574518,-79.528801],
      [-2.5835789,-79.501690],
      [-2.76617,-79.39686],
      [-2.78407,-79.22301],
      [-2.90055,-79.00453]
    ],
    quintoRoad:[
      [-2.308440,-79.637798],
      [-2.425964,-79.625350],
      [-2.495614,-79.600925],
      [-2.574518,-79.528801],
      [-2.5835789,-79.501690],
      [-2.76617,-79.39686],
      [-2.78407,-79.22301],
      [-2.90055,-79.00453]
    ],
    duranRoad:[
      [-2.170,-79.835],
      [-2.23515,-79.63930],
      [-2.308440,-79.637798],
      [-2.425964,-79.625350],
      [-2.495614,-79.600925],
      [-2.574518,-79.528801],
      [-2.5835789,-79.501690],
      [-2.76617,-79.39686],
      [-2.78407,-79.22301],
      [-2.90055,-79.00453]
    ],
    railRoad:[
      [-2.203,-79.139],
      [-2.333,-79.404],
      [-2.423,-79.339],
      [-2.457,-79.286],
      [-2.462,-79.004],
      [-2.512,-78.925],
      [-2.55941,-78.93808],
      [-2.73969,-78.84860],
      [-2.90055,-79.00453]
    ],
    balaoRoad:[
      [-2.911,-79.816],
      [-2.733965,-79.677613],
      [-2.574518,-79.528801],
      [-2.5835789,-79.501690],
      [-2.76617,-79.39686],
      [-2.78407,-79.22301],
      [-2.90055,-79.00453]
    ]
  },

  routes:{
    current:{name:'Ruta actual TPG → E25 → E582 → Cuenca',kind:'road',coords:[[-79.92776,-2.24766],[-79.637798,-2.308440],[-79.625350,-2.425964],[-79.600925,-2.495614],[-79.528801,-2.574518],[-79.501690,-2.5835789],[-79.39686,-2.76617],[-79.22301,-2.78407],[-79.00453,-2.90055]]},
    quinto:{name:'QUINTO PUENTE / VIADUCTO SUR · CORREDOR DE PROYECTO',kind:'project',coords:[[-79.92776,-2.24766],[-79.905,-2.278],[-79.895,-2.295],[-79.875,-2.315],[-79.835,-2.330],[-79.790,-2.340],[-79.735,-2.350],[-79.690,-2.355],[-79.67018,-2.35202],[-79.637798,-2.308440]]},
    quintoRoad:{name:'E25 / E582 → CUENCA · VÍAS EXISTENTES',kind:'road',coords:[[-79.637798,-2.308440],[-79.625350,-2.425964],[-79.600925,-2.495614],[-79.528801,-2.574518],[-79.501690,-2.5835789],[-79.39686,-2.76617],[-79.22301,-2.78407],[-79.00453,-2.90055]]},
    barge:{name:'BARCAZA TPG → DURÁN · CONCEPTO',kind:'concept',coords:[[-79.92776,-2.24766],[-79.913,-2.260],[-79.900,-2.270],[-79.884,-2.269],[-79.868,-2.260],[-79.858,-2.235],[-79.850,-2.210],[-79.842,-2.190],[-79.835,-2.170]]},
    duranRoad:{name:'DURÁN → E25 → E582 → CUENCA · VÍAS EXISTENTES',kind:'road',coords:[[-79.835,-2.170],[-79.6393,-2.23515],[-79.637798,-2.308440],[-79.625350,-2.425964],[-79.600925,-2.495614],[-79.528801,-2.574518],[-79.501690,-2.5835789],[-79.39686,-2.76617],[-79.22301,-2.78407],[-79.00453,-2.90055]]},
    railHistoric:{name:'FERROCARRIL HISTÓRICO DURÁN → BUCAY',kind:'historic',coords:[[-79.835,-2.170],[-79.694,-2.097],[-79.594,-2.134],[-79.465,-2.166],[-79.300,-2.190],[-79.139,-2.203]]},
    railRoad:{name:'BUCAY → ZHUD → CUENCA · CARRETERA EXISTENTE',kind:'road',coords:[[-79.139,-2.203],[-79.404,-2.333],[-79.339,-2.423],[-79.286,-2.457],[-79.004,-2.462],[-78.925,-2.512],[-78.93808,-2.55941],[-78.84860,-2.73969],[-79.00453,-2.90055]]},
    balaoWater:{name:'BARCAZA TPG → BALAO · CONCEPTO',kind:'concept',coords:[[-79.92776,-2.24766],[-80.00,-2.45],[-79.96,-2.65],[-79.90,-2.82],[-79.816,-2.911]]},
    balaoRoad:{name:'BALAO → E25 → E582 → CUENCA · VÍAS EXISTENTES',kind:'road',coords:[[-79.816,-2.911],[-79.677613,-2.733965],[-79.528801,-2.574518],[-79.501690,-2.5835789],[-79.39686,-2.76617],[-79.22301,-2.78407],[-79.00453,-2.90055]]}
  },

  projects:{
    current:{title:'Ruta actual TPG → Cuenca',tag:'Operativo',tagClass:'existing',state:'Operativa',type:'Carretera',capex:'—',benefit:'Referencia base del sistema',restriction:'Dependencia de accesos urbanos, E25 y E582/Molleturo',desc:'La geometría vial se calcula sobre carreteras existentes. El corredor se fuerza por puntos oficiales de E25 y E582 para evitar líneas que atraviesen zonas sin vía.'},
    quinto:{title:'Quinto Puente / Viaducto Sur',tag:'Proyecto / obra parcial',tagClass:'construction',state:'Tramo 1A en obra; corredor completo no operativo',type:'Corredor vial futuro',capex:'Disponible por fases; no se usa como costo total cerrado',benefit:'Bypass del tráfico pesado del sur de Guayaquil',restriction:'El trazado completo todavía depende de varios tramos, puente y enlaces',desc:'El segmento naranja representa el corredor futuro de forma referencial. Una vez conectado a E25, el resto hacia Cuenca se calcula exclusivamente sobre la red vial existente E25–E582.'},
    barge:{title:'Corredor de barcazas TPG–Durán',tag:'Concepto académico',tagClass:'concept',state:'No identificado como servicio regular operativo',type:'Fluvial + carretera',capex:'Por estimar',benefit:'Evitar el traslado terrestre del contenedor por Guayaquil',restriction:'Requiere validar Las Esclusas, calado, maniobra, terminal y frecuencia',desc:'Solo el tramo acuático es conceptual. El tramo Durán → Cuenca se calcula sobre carreteras reales de la red existente.'},
    rail:{title:'Durán–Bucay + carretera hacia Cuenca',tag:'Histórico + escenario',tagClass:'historic',state:'Ferrocarril histórico/suspendido; conexión vial sí existente',type:'Ferrocarril histórico + carretera',capex:'No disponible',benefit:'Diversificación modal hasta Bucay sin inventar una extensión ferroviaria a Cuenca',restriction:'Rehabilitación ferroviaria, terminal de transferencia y capacidad',desc:'Se conserva el corredor ferroviario histórico Durán–Bucay. Desde Bucay a Cuenca el visor usa carreteras existentes vía El Triunfo–La Troncal–Zhud, no una línea ferroviaria conceptual.'},
    balao:{title:'Alternativa Balao',tag:'Concepto académico',tagClass:'concept',state:'Conceptual',type:'Fluvial/marítimo + carretera',capex:'Por estimar',benefit:'Nodo alternativo fuera de Guayaquil',restriction:'Navegabilidad, terminal nuevo, demanda y transferencia',desc:'El tramo TPG–Balao es conceptual. Desde Balao a Cuenca se usa la red vial existente hacia E25 y E582.'}
  }
};
