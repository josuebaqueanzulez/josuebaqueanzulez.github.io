"use strict";
(()=>{
 const $=(sel,root=document)=>root.querySelector(sel);
 const $$=(sel,root=document)=>Array.from(root.querySelectorAll(sel));
 const root=$("#comparePanel");if(!root)return;
 const criteria=[
 {name:"01 · Infraestructura reefer",intro:"Se consideran tomas documentadas, conexión y monitoreo. Una cifra nominal no mide disponibilidad real.",weight:"25 %",
  note:"Comparabilidad incompleta: Contecon indica N/D de tomas en la ficha 2025, no cero. Bananapuerto utiliza una ficha 2021. La nota 4 de Contecon es provisoria y puede cambiar.",
  data:[
   {terminal:"Contecon",grade:4,quality:"PROVISIONAL · DATO FALTANTE",detail:"La ficha describe servicios reefer y patios de contenedores, pero deja N/D la cantidad de tomas (SPTMF 2025, pp. 50–52). Se asigna 4 solo como hipótesis de capacidad funcional, no como ventaja verificada.",source:"Ficha Actividad 1 Contecon, pp. 2–3."},
   {terminal:"DP World Posorja",grade:5,quality:"CUANTIFICADO",detail:"2.180 tomas activas y servicio de conexión/monitoreo; mayor cantidad declarada entre las fichas que sí ofrecen cifra. Capacidad no equivale a ocupación disponible.",source:"Ficha Actividad 1 DP World, pp. 3–4."},
   {terminal:"TPG",grade:4,quality:"CUANTIFICADO",detail:"2.000 conexiones, 1.140 fijas y 860 power packs; seguimiento y alarmas reefer. Queda por debajo de las 2.180 declaradas por Posorja.",source:"Boletín SPTMF 2025, ficha TPG, p. 81."},
   {terminal:"Bananapuerto",grade:3,quality:"DATO HISTÓRICO 2021",detail:"1.400 tomas reefer y servicios de cámara de frío según la ficha 2021, sin confirmación homogénea para 2025. Atiende reefer, pero la capacidad presentada es menor.",source:"Ficha Actividad 1 Bananapuerto, pp. 1–2; SPTMF 2021 p. 99."}
  ]},
 {name:"02 · Conectividad con mercados",intro:"La mejor nota combina líneas o servicios identificables y actividad exportadora. Los TEU y toneladas no prueban por sí solos ruta directa ni frecuencia.",weight:"20 %",
  note:"No tenemos un censo homogéneo de frecuencias semanales por destino durante 2025. La lista de navieras de DP World y la cifra de siete líneas de TPG pertenecen a 2026: por eso la clasificación es provisoria.",
  data:[
   {terminal:"Contecon",grade:4,quality:"SERVICIO 2025 DOCUMENTADO",detail:"La ficha identifica COSCO WSA5 con primera escala el 21-02-2025 y el acuerdo ASA anunciado en 2024. En 2025 registró 19,20 % de las toneladas exportadas entre las cuatro terminales.",source:"Ficha Contecon, p. 3; boletín SPTMF 2025 / anexo docente."},
   {terminal:"DP World Posorja",grade:5,quality:"FUERTE · PERÍODOS MIXTOS",detail:"La ficha relaciona ONE, Maersk, CMA CGM, Hapag-Lloyd y HMM en consulta del itinerario 2026. Participó con 31,57 % de las toneladas exportadas contenerizadas de las cuatro en 2025.",source:"Ficha DP World, p. 4, consulta 02-11-2026; anexo ECOTEC 2025."},
   {terminal:"TPG",grade:4,quality:"EVIDENCIA 2025 + 2026",detail:"Se documenta la escala ONE Sparkle/servicio AX3 en 2025; su gerencia declaró atención de siete líneas en septiembre de 2026. Movió 25,51 % de las toneladas de exportación del conjunto en 2025.",source:"PortalPortuario, 06-05-2025; Primicias, 03-09-2026; anexo docente."},
   {terminal:"Bananapuerto",grade:4,quality:"LÍNEA RELEVANTE, RUTAS PENDIENTES",detail:"La ficha documenta atención de MSC desde 2024. Orientación exportadora de 86,37 % y 23,72 % de toneladas exportadas del conjunto en 2025; falta la relación completa de servicios.",source:"Ficha Bananapuerto p. 2; anexo ECOTEC 2025."}
  ]},
 {name:"03 · Servicios a la carga y protección",intro:"Se comparan gestión de gate, controles de exportación, infraestructura de inspección, servicios digitales y protección de mercancía.",weight:"20 %",
  note:"Ninguna ficha aporta tiempos homogéneos de inspección, despacho ni tasas de incidencias para cuatro terminales. El empate en 5 para DP World y TPG representa fortalezas distintas de servicio documentadas.",
  data:[
   {terminal:"Contecon",grade:4,quality:"SERVICIOS EXISTENTES · VACÍOS",detail:"CFS en bodegas 7 y 8, patios cubiertos para aforos e inspecciones, OCR y pesaje en grúas. Su ficha registra N/D en plataforma de citas, escáneres y tiempos de atención.",source:"Ficha Contecon, pp. 2–3; SPTMF 2025, pp. 51–52."},
   {terminal:"DP World Posorja",grade:5,quality:"GESTIÓN DIGITAL Y CONTROL",detail:"DPOnline para trámites y citas, monitoreo reefer, CFS de 1.160 m² y área de inspección aduanera de 2.400 m², con inspecciones no intrusivas documentadas.",source:"Ficha DP World, pp. 2–4; información técnica y DPOnline."},
   {terminal:"TPG",grade:5,quality:"CONTROL + FRÍO VERIFICADOS",detail:"Tres escáneres Rapiscan, 16 básculas de gate y dos internas; zonas de SENAE, Agrocalidad y Antinarcóticos. 2.000 m² techados de inspección de fruta y 384 m² de cámaras de frío.",source:"Boletín SPTMF 2025, ficha TPG, p. 81."},
   {terminal:"Bananapuerto",grade:4,quality:"SERVICIOS DOCUMENTADOS 2021",detail:"AISV y EIR electrónicos, nueve balanzas automatizadas, cuatro escáneres Mini Z, oficinas antinarcóticos, conexión reefer y centro logístico.",source:"Ficha Bananapuerto, pp. 1–2; SPTMF 2021 p. 99."}
  ]},
 {name:"04 · Fluidez de la escala",intro:"Se evalúan dos indicadores simultáneos: horas en muelle por escala y ocupación estimada de atraques. Menor permanencia no prueba, aislada, mayor productividad.",weight:"15 %",
  note:"DP World presenta la menor permanencia media, pero mayor ocupación estimada (81,04 %). Contecon presenta menor presión de ocupación, pero su tiempo incluye buques mixtos. Ambos reciben 5 por ventajas diferentes; es una simplificación de juicio experto.",
  data:[
   {terminal:"Contecon",grade:5,quality:"MENOR OCUPACIÓN · MIXTO",detail:"31,00 h/escala y 39,87 % de ocupación estimada: el menor porcentaje de las cuatro. Sus horas/escalas incluyen operación multipropósito, no solo portacontenedores.",source:"Anexo ECOTEC 2025; 20.955,25 h / 676 escalas y 6 puestos convencionales."},
   {terminal:"DP World Posorja",grade:5,quality:"MENOR TIEMPO · MAYOR OCUPACIÓN",detail:"18,88 h/escala, el menor promedio; ocupación estimada de 81,04 %, la mayor. Tiene una señal favorable de tiempo de escala, pero concentración de atraque potencialmente sensible.",source:"Anexo ECOTEC 2025; 7.098,83 h / 376 escalas y 1 puesto."},
   {terminal:"TPG",grade:3,quality:"PEOR MEDIA · OCUPACIÓN INTERMEDIA",detail:"39,07 h/escala, la media más alta del grupo; 67,12 % de ocupación estimada. La ficha no permite aislar causas, tamaños de buques ni movimientos por hora.",source:"Anexo ECOTEC 2025; 11.760 h / 301 escalas y 2 puestos."},
   {terminal:"Bananapuerto",grade:4,quality:"INTERMEDIO",detail:"26,56 h/escala y 76,10 % de ocupación estimada. Mejor media de horas que Contecon y TPG, pero con ocupación más alta que ambas.",source:"Anexo ECOTEC 2025; 6.666 h / 251 escalas y 1 puesto."}
  ]},
 {name:"05 · Accesibilidad terrestre",intro:"Se requiere comparar rutas desde fincas y empacadoras de Los Ríos, Guayas y El Oro. Las fichas ofrecen ubicación y corredores, no tiempos equivalentes.",weight:"15 %",
  note:"Todas las notas terrestres son PROVISIONALES. La ubicación de DP World a unos 120 km de Guayaquil no demuestra que sea peor para toda finca de El Oro o Guayas. Sin rutas puerta a terminal y tiempos comparables no hay ganador comprobado.",
  data:[
   {terminal:"Contecon",grade:5,quality:"PROVISIONAL · ENTORNO URBANO",detail:"Puerto Marítimo de Guayaquil, aproximadamente a 10 km del centro según su ficha. La cercanía urbana no cuantifica los tiempos de los camiones desde fincas o empacadoras.",source:"Ficha Contecon, p. 1; SPTMF 2025, p. 50."},
   {terminal:"DP World Posorja",grade:3,quality:"PROVISIONAL · RUTA DEPENDE DEL ORIGEN",detail:"La ficha ubica la terminal a unos 120 km de Guayaquil e identifica 20 km de vía Playas–El Morro–Posorja. Puede ser favorable desde ciertos orígenes; requiere comparar recorridos.",source:"Ficha DP World, pp. 1–2."},
   {terminal:"TPG",grade:4,quality:"PROVISIONAL · VÍA PERIMETRAL",detail:"Isla Trinitaria, con conexión al corredor de Vía Perimetral. No se han medido tiempos ni distancias comparables desde las tres provincias bananeras.",source:"Ficha TPG y fuentes institucionales de ubicación."},
   {terminal:"Bananapuerto",grade:5,quality:"PROVISIONAL · CORREDOR PERIMETRAL",detail:"Ficha: Vía Perimetral km 1½, cinco garitas y acceso con CCTV. Son ventajas descriptivas, no garantía de mejor tiempo de traslado frente a las otras terminales.",source:"Ficha Bananapuerto, p. 1, dirección CAMAE."}
  ]},
 {name:"06 · Acceso náutico",intro:"Se contrasta calado admisible de buque, eslora y condiciones declaradas. Profundidad de diseño y calado operativo no son intercambiables.",weight:"5 %",
  note:"La calificación 3 de Contecon se deja expresamente provisional: su ficha 2025 no reporta el calado ni la eslora máxima, lo cual no significa que esos valores sean menores. Bananapuerto usa límites publicados en 2021.",
  data:[
   {terminal:"Contecon",grade:3,quality:"PROVISIONAL · LÍMITES N/D",detail:"La ficha consigna canal de acceso de 51 millas náuticas, pero no ofrece calado máximo ni eslora autorizada. Se asigna 3 provisional por información incompleta, NO por demostrar menor capacidad.",source:"Ficha Contecon, pp. 1–2; SPTMF 2025 pp. 50–51."},
   {terminal:"DP World Posorja",grade:5,quality:"DATOS NÁUTICOS DECLARADOS",detail:"15,5 m de calado máximo de buque, 397 m de eslora y 16 m de profundidad de diseño. Mayor capacidad náutica declarada entre las fichas.",source:"Ficha DP World, p. 2; documentación de fase 1."},
   {terminal:"TPG",grade:4,quality:"CONDICIONADO POR MAREA",detail:"Calado máximo actual de 13 m con beneficio de marea, 370 m de eslora permitida, 13,7 m de profundidad al pie de muelle en bajamar.",source:"Boletín SPTMF 2025, ficha TPG p. 81."},
   {terminal:"Bananapuerto",grade:3,quality:"REFERENCIA DE 2021",detail:"306 m de eslora, 12 m al pie de muelle en bajamar y rango 12,5–13 m de acceso según ficha 2021. El dato es antiguo y requiere actualización para comparar condiciones vigentes.",source:"Ficha Bananapuerto, p. 1; SPTMF 2021 p. 99."}
  ]}
 ];
 function render(index){
   const c=criteria[index];if(!c)return;
   $("#compEvidenceTitle").textContent=c.name;
   $("#compEvidenceIntro").textContent=c.intro;
   $("#compEvidenceWeight").textContent=c.weight;
   $("#compEvidenceCaveat").textContent=c.note;
   const cards=$("#compEvidenceCards");cards.replaceChildren();
   c.data.forEach((item,i)=>{
      const article=document.createElement("article");article.className="comp-evidence-card"+(i===2?" tpg":"");
      const head=document.createElement("div");head.className="comp-evidence-card-head";
      const heading=document.createElement("h5");heading.textContent=item.terminal;
      const grade=document.createElement("span");grade.className="comp-small-grade";grade.textContent=item.grade+"/5";
      head.append(heading,grade);
      const quality=document.createElement("div");quality.className="comp-quality";quality.textContent=item.quality;
      const desc=document.createElement("p");desc.textContent=item.detail;
      const source=document.createElement("small");source.textContent="Fuente: "+item.source;
      article.append(head,quality,desc,source);
      cards.appendChild(article);
   });
   $$("[data-comp-row]",root).forEach(b=>{const active=Number(b.dataset.compRow)===index;b.classList.toggle("active",active);b.setAttribute("aria-pressed",String(active));b.closest("tr")?.classList.toggle("comp-row-active",active)});
 }
 $$("[data-comp-row]",root).forEach(button=>button.addEventListener("click",()=>{
   render(Number(button.dataset.compRow));
   if(window.innerWidth<=820)$("#compEvidence").scrollIntoView({behavior:"smooth",block:"nearest"});
 }));
 render(0);
})();
