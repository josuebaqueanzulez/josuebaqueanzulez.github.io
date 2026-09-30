const FUTURE_DATA={
  nodes:{
    tpg:{name:'TPG / Isla Trinitaria',coord:[-79.92776,-2.24766],kind:'port'},
    tomala:{name:'Av. Cacique Tomalá / acceso sur',coord:[-79.895,-2.295],kind:'project'},
    duran:{name:'Durán · nodo intermodal propuesto',coord:[-79.835,-2.170],kind:'hub'},
    locks:{name:'Las Esclusas / Estero Cobina',coord:[-79.884,-2.269],kind:'water'},
    e25:{name:'Enlace futuro con E25',coord:[-79.626,-2.405],kind:'road'},
    naranjal:{name:'Naranjal',coord:[-79.6183,-2.67364],kind:'road'},
    molleturo:{name:'Molleturo',coord:[-79.39686,-2.76617],kind:'road'},
    cuenca:{name:'Cuenca',coord:[-79.00453,-2.90055],kind:'city'},
    yaguachi:{name:'Yaguachi',coord:[-79.694,-2.097],kind:'rail'},
    milagro:{name:'Milagro',coord:[-79.594,-2.134],kind:'rail'},
    naranjito:{name:'Naranjito',coord:[-79.465,-2.166],kind:'rail'},
    bucay:{name:'Bucay',coord:[-79.139,-2.203],kind:'rail'},
    balao:{name:'Balao · nodo conceptual',coord:[-79.816,-2.911],kind:'concept'}
  },
  routes:{
    current:{name:'Ruta actual TPG → Molleturo → Cuenca',status:'existing',minYear:2026,coords:[[-79.92776,-2.24766],[-79.84,-2.36],[-79.70,-2.49],[-79.58,-2.57],[-79.6183,-2.67364],[-79.50,-2.71],[-79.39686,-2.76617],[-79.223,-2.784],[-79.10,-2.85],[-79.00453,-2.90055]]},
    quinto:{name:'Quinto Puente / Viaducto Sur',status:'construction',minYear:2026,coords:[[-79.92776,-2.24766],[-79.905,-2.278],[-79.895,-2.295],[-79.875,-2.328],[-79.850,-2.350],[-79.815,-2.355],[-79.760,-2.360],[-79.700,-2.372],[-79.655,-2.390],[-79.626,-2.405]]},
    quintoLink:{name:'Conexión futura E25 → Cuenca',status:'planned',minYear:2030,coords:[[-79.626,-2.405],[-79.620,-2.54],[-79.6183,-2.67364],[-79.50,-2.71],[-79.39686,-2.76617],[-79.223,-2.784],[-79.10,-2.85],[-79.00453,-2.90055]]},
    barge:{name:'Barcaza TPG → Durán',status:'concept',minYear:2035,coords:[[-79.92776,-2.24766],[-79.913,-2.260],[-79.900,-2.270],[-79.884,-2.269],[-79.868,-2.260],[-79.858,-2.235],[-79.850,-2.210],[-79.842,-2.190],[-79.835,-2.170]]},
    duranRoad:{name:'Durán → E25 → Molleturo → Cuenca',status:'planned',minYear:2035,coords:[[-79.835,-2.170],[-79.760,-2.270],[-79.690,-2.350],[-79.626,-2.405],[-79.620,-2.54],[-79.6183,-2.67364],[-79.50,-2.71],[-79.39686,-2.76617],[-79.223,-2.784],[-79.10,-2.85],[-79.00453,-2.90055]]},
    railHistoric:{name:'Ferrocarril histórico Durán → Bucay',status:'historic',minYear:2026,coords:[[-79.835,-2.170],[-79.694,-2.097],[-79.594,-2.134],[-79.465,-2.166],[-79.300,-2.19],[-79.139,-2.203]]},
    railFuture:{name:'Extensión logística Bucay → Cuenca',status:'concept',minYear:2045,coords:[[-79.139,-2.203],[-79.10,-2.38],[-79.08,-2.55],[-79.05,-2.72],[-79.00453,-2.90055]]},
    balaoWater:{name:'Barcaza TPG → Balao',status:'concept',minYear:2045,coords:[[-79.92776,-2.24766],[-80.00,-2.45],[-79.96,-2.65],[-79.90,-2.82],[-79.816,-2.911]]},
    balaoRoad:{name:'Balao → E25 → Cuenca',status:'concept',minYear:2045,coords:[[-79.816,-2.911],[-79.70,-2.82],[-79.6183,-2.67364],[-79.50,-2.71],[-79.39686,-2.76617],[-79.223,-2.784],[-79.10,-2.85],[-79.00453,-2.90055]]}
  },
  projects:{
    current:{title:'Ruta actual TPG → Cuenca',tag:'Operativo',tagClass:'existing',state:'Operativa',type:'Carretera',capex:'—',benefit:'Referencia base del sistema',restriction:'Exposición a congestión urbana y al corredor Molleturo',desc:'Escenario de comparación. Mantiene la dependencia del acceso terrestre desde la zona portuaria hacia E25 y luego Molleturo.'},
    quinto:{title:'Quinto Puente / Viaducto Sur',tag:'En construcción',tagClass:'construction',state:'Fase 1A iniciada en 2026',type:'Corredor vial',capex:'Fase 1A: USD 134,8 M reportados',benefit:'Bypass del tráfico pesado del sur de Guayaquil',restriction:'El corredor completo depende de múltiples tramos y enlaces',desc:'Trazado referencial basado en los tramos oficiales: Cacique Tomalá, puente sobre río Guayas, bifurcación y enlaces hacia E25/E40. El visor no representa planos de ingeniería as-built.'},
    barge:{title:'Corredor de barcazas TPG–Durán',tag:'Concepto académico',tagClass:'concept',state:'No operativo como servicio regular identificado',type:'Fluvial + carretera',capex:'Por estimar',benefit:'Eliminar el traslado terrestre del contenedor por Guayaquil',restriction:'Requiere validar Las Esclusas, calado, maniobra, terminal y frecuencia',desc:'Concepto TPG → Estero Cobina → Las Esclusas → río Guayas → Durán. La estructura de Las Esclusas existe históricamente, pero su condición operativa y navegabilidad para este uso debe verificarse.'},
    rail:{title:'Corredor ferroviario Durán–Bucay + Azuay',tag:'Histórico + conceptual',tagClass:'historic',state:'Durán–Bucay suspendido; extensión a Cuenca conceptual',type:'Ferrocarril + carretera / futura extensión',capex:'No disponible',benefit:'Diversificación modal y potencial movimiento masivo',restriction:'Rehabilitación integral, gálibos, pendientes, demanda y terminales',desc:'Durán–Bucay usa el antecedente histórico del Tren de la Dulzura, de unos 88 km. La continuidad logística hacia Cuenca no es un proyecto oficial en este visor: se representa como escenario de largo plazo.'},
    balao:{title:'Alternativa Balao',tag:'Concepto largo plazo',tagClass:'concept',state:'Conceptual',type:'Fluvial/marítimo + carretera',capex:'Por estimar',benefit:'Crear otro punto de transferencia fuera de Guayaquil',restriction:'Navegabilidad, terminal nuevo, demanda y conexión vial',desc:'Escenario exploratorio TPG → Balao → E25 → Naranjal → Molleturo → Cuenca. Se muestra con baja madurez para no confundirlo con un proyecto anunciado.'}
  },
  comparison:{
    current:{name:'Ruta actual TPG → Cuenca',road:'≈200 km*',alt:'—',transfers:'0',time:'4,5–5,5 h*',maturity:'Operativo',effect:'Referencia base'},
    quinto:{name:'Quinto Puente → E25 → Cuenca',road:'Por validar con trazado definitivo',alt:'—',transfers:'0',time:'Menor exposición urbana*',maturity:'En construcción parcial',effect:'Bypass de tráfico pesado y conexión directa a corredores nacionales'},
    barge:{name:'Barcaza TPG → Durán + carretera',road:'≈214 km desde Durán*',alt:'TPG–Durán',transfers:'1',time:'Por modelar',maturity:'Conceptual',effect:'Evita recorrido terrestre dentro de Guayaquil'},
    rail:{name:'Durán → Bucay + conexión a Cuenca',road:'Bucay–Cuenca ≈155 km*',alt:'Ferrocarril histórico ≈88 km',transfers:'1–2',time:'Por modelar',maturity:'Histórico / largo plazo',effect:'Diversificación modal y capacidad masiva'},
    balao:{name:'TPG → Balao + carretera',road:'Por validar',alt:'TPG–Balao',transfers:'1',time:'Por modelar',maturity:'Conceptual largo plazo',effect:'Nodo alternativo fuera del sistema urbano'}
  }
};
