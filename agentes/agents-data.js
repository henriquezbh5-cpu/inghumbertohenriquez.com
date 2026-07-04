// agents-data.js — merged agent catalog (20 agents, 8 categories)
// Classic script: exposes window.AGENTS and window.AGENT_CATEGORIES. Auto-generated; do not edit by hand.

const AGENTS = [
  {
    "id": "a01",
    "slug": "nova",
    "nombre": "Nova",
    "rol": {
      "es": "Agente de calificación de leads",
      "en": "Lead qualification agent"
    },
    "tagline": {
      "es": "Cada lead que espera horas es una venta que se enfría. Nova responde en minutos, a cualquier hora.",
      "en": "Every lead that waits hours is a sale going cold. Nova responds in minutes, at any hour."
    },
    "categoria": "ventas",
    "disparador": {
      "es": "Correo entrante a ventas@ o formulario web de contacto",
      "en": "Incoming email to sales@ or website contact form"
    },
    "metricaDestacada": {
      "es": "Respuesta en <5 min, 24/7",
      "en": "Response in <5 min, 24/7"
    },
    "integraciones": [
      "Outlook",
      "Azure OpenAI",
      "Dataverse",
      "Teams",
      "WhatsApp Business"
    ],
    "resultado": {
      "es": "Lead calificado, registrado en el CRM y con reunión agendada, con resumen para el vendedor",
      "en": "Qualified lead, logged in the CRM with a meeting booked and a summary for the sales rep"
    },
    "metricas": [
      {
        "es": "Atención típica de 100% de leads entrantes sin intervención manual",
        "en": "Typically handles 100% of inbound leads with no manual intervention"
      },
      {
        "es": "Reducción esperada de horas a minutos en el primer contacto",
        "en": "Expected first-contact time drops from hours to minutes"
      },
      {
        "es": "Cero leads perdidos por bandejas sin revisar",
        "en": "Zero leads lost to unchecked inboxes"
      }
    ],
    "industrias": [
      {
        "es": "Distribución y mayoreo",
        "en": "Distribution and wholesale"
      },
      {
        "es": "Servicios B2B",
        "en": "B2B services"
      },
      {
        "es": "Software y tecnología",
        "en": "Software and technology"
      }
    ],
    "pasos": [
      {
        "n": 1,
        "actor": "trigger",
        "titulo": {
          "es": "Llega un lead nuevo",
          "en": "New lead arrives"
        },
        "detalle": {
          "es": "Un correo o formulario web dispara el flujo al instante, sin importar la hora.",
          "en": "An email or web form triggers the flow instantly, regardless of the hour."
        },
        "log": {
          "es": "[22:47] Correo entrante → ventas@ | Asunto: \"Cotización 40 licencias\" | Remitente: maria.fuentes@distribuidoraelroble.com",
          "en": "[22:47] Inbound email → sales@ | Subject: \"Quote for 40 licenses\" | From: maria.fuentes@distribuidoraelroble.com"
        },
        "duracionMs": 2000
      },
      {
        "n": 2,
        "actor": "agente",
        "titulo": {
          "es": "Extrae los datos",
          "en": "Extracts the data"
        },
        "detalle": {
          "es": "Identifica nombre, empresa, producto de interés y datos de contacto del mensaje.",
          "en": "Identifies name, company, product of interest and contact details from the message."
        },
        "log": {
          "es": "Lead: María Fuentes — Distribuidora El Roble — interés: cotización 40 licencias — tel: +503 7xxx-xxxx",
          "en": "Lead: Maria Fuentes — Distribuidora El Roble — interest: quote for 40 licenses — phone: +503 7xxx-xxxx"
        },
        "duracionMs": 2200
      },
      {
        "n": 3,
        "actor": "llm",
        "titulo": {
          "es": "Clasifica la intención",
          "en": "Classifies the intent"
        },
        "detalle": {
          "es": "El modelo evalúa intención de compra, tamaño de la oportunidad y ajuste con el perfil de cliente ideal.",
          "en": "The model scores purchase intent, deal size and fit against the ideal customer profile."
        },
        "log": {
          "es": "Azure OpenAI → intención: COMPRA | fit ICP: alto | tamaño estimado: 40 asientos | score: 87/100",
          "en": "Azure OpenAI → intent: PURCHASE | ICP fit: high | estimated size: 40 seats | score: 87/100"
        },
        "duracionMs": 3600
      },
      {
        "n": 4,
        "actor": "decision",
        "titulo": {
          "es": "¿Lead calificado?",
          "en": "Qualified lead?"
        },
        "detalle": {
          "es": "Si el score supera el umbral pasa a agendamiento; si no, entra a la secuencia de nutrición.",
          "en": "If the score clears the threshold it moves to scheduling; otherwise it enters the nurture sequence."
        },
        "log": {
          "es": "Decisión: score 87 ≥ umbral 70 → CALIFICADO → ruta: agendar reunión",
          "en": "Decision: score 87 ≥ threshold 70 → QUALIFIED → route: book meeting"
        },
        "duracionMs": 2600
      },
      {
        "n": 5,
        "actor": "herramienta",
        "herramienta": "Dataverse",
        "titulo": {
          "es": "Registra en el CRM",
          "en": "Logs into the CRM"
        },
        "detalle": {
          "es": "Crea el registro del lead en Dataverse con fuente, score y transcripción del mensaje.",
          "en": "Creates the lead record in Dataverse with source, score and message transcript."
        },
        "log": {
          "es": "Dataverse → lead LD-04512 creado | fuente: web | score: 87 | propietario sugerido: C. Ramírez",
          "en": "Dataverse → lead LD-04512 created | source: web | score: 87 | suggested owner: C. Ramirez"
        },
        "duracionMs": 2400
      },
      {
        "n": 6,
        "actor": "herramienta",
        "herramienta": "Outlook",
        "titulo": {
          "es": "Propone horarios",
          "en": "Proposes time slots"
        },
        "detalle": {
          "es": "Consulta el calendario del vendedor y envía al lead tres horarios disponibles.",
          "en": "Checks the sales rep calendar and sends the lead three available time slots."
        },
        "log": {
          "es": "Outlook → disponibilidad C. Ramírez: mar 10:00, mar 15:30, mié 09:00 | correo de propuesta enviado",
          "en": "Outlook → C. Ramirez availability: Tue 10:00, Tue 15:30, Wed 09:00 | proposal email sent"
        },
        "duracionMs": 2400
      },
      {
        "n": 7,
        "actor": "herramienta",
        "herramienta": "WhatsApp Business",
        "titulo": {
          "es": "Confirma por WhatsApp",
          "en": "Confirms via WhatsApp"
        },
        "detalle": {
          "es": "Envía la confirmación de la reunión por WhatsApp para asegurar la asistencia.",
          "en": "Sends the meeting confirmation via WhatsApp to secure attendance."
        },
        "log": {
          "es": "WhatsApp Business → +503 7xxx-xxxx: \"Hola María, confirmamos su reunión el martes 10:00 con Carlos Ramírez\" ✓✓",
          "en": "WhatsApp Business → +503 7xxx-xxxx: \"Hi Maria, your Tuesday 10:00 meeting with Carlos Ramirez is confirmed\" ✓✓"
        },
        "duracionMs": 2200
      },
      {
        "n": 8,
        "actor": "sistema",
        "titulo": {
          "es": "Notifica al vendedor",
          "en": "Notifies the sales rep"
        },
        "detalle": {
          "es": "Publica en Teams un resumen con contexto, score y próxima acción para el vendedor asignado.",
          "en": "Posts a Teams summary with context, score and next action for the assigned rep."
        },
        "log": {
          "es": "Teams → @C.Ramírez: \"Lead calificado LD-04512 · Distribuidora El Roble · 40 licencias · reunión mar 10:00\"",
          "en": "Teams → @C.Ramirez: \"Qualified lead LD-04512 · Distribuidora El Roble · 40 licenses · meeting Tue 10:00\""
        },
        "duracionMs": 2000
      },
      {
        "n": 9,
        "actor": "resultado",
        "titulo": {
          "es": "Lead listo para vender",
          "en": "Lead ready to sell"
        },
        "detalle": {
          "es": "El vendedor llega a la reunión con lead calificado, contexto completo y cero trabajo manual previo.",
          "en": "The rep walks into the meeting with a qualified lead, full context and zero manual prep work."
        },
        "log": {
          "es": "✔ Flujo completado en 4 min 12 s | lead calificado, agendado y documentado en CRM",
          "en": "✔ Flow completed in 4 min 12 s | lead qualified, scheduled and documented in CRM"
        },
        "duracionMs": 2200
      }
    ]
  },
  {
    "id": "a02",
    "slug": "cobra",
    "nombre": "Cobra",
    "rol": {
      "es": "Agente de seguimiento de cotizaciones",
      "en": "Quote follow-up agent"
    },
    "tagline": {
      "es": "La mayoría de cotizaciones no se pierden por precio: se pierden por falta de seguimiento.",
      "en": "Most quotes are not lost on price: they are lost to missing follow-up."
    },
    "categoria": "ventas",
    "disparador": {
      "es": "Cotización enviada sin respuesta después de 72 horas",
      "en": "Quote sent with no reply after 72 hours"
    },
    "metricaDestacada": {
      "es": "Seguimiento al 100% de cotizaciones abiertas, sin excepción",
      "en": "100% of open quotes followed up, no exceptions"
    },
    "integraciones": [
      "Outlook",
      "SharePoint",
      "Azure OpenAI",
      "Teams",
      "CRM"
    ],
    "resultado": {
      "es": "Secuencia de seguimiento ejecutada y vendedor alertado con contexto cuando el cliente no responde",
      "en": "Follow-up sequence executed and rep alerted with context when the customer goes silent"
    },
    "metricas": [
      {
        "es": "Hasta 3 seguimientos automáticos con tono y momento distintos",
        "en": "Up to 3 automatic follow-ups with distinct tone and timing"
      },
      {
        "es": "Recuperación típica de oportunidades que estaban en silencio",
        "en": "Typical recovery of opportunities that had gone silent"
      },
      {
        "es": "Historial completo de gestiones visible en el CRM",
        "en": "Complete follow-up history visible in the CRM"
      }
    ],
    "industrias": [
      {
        "es": "Distribución industrial",
        "en": "Industrial distribution"
      },
      {
        "es": "Servicios profesionales",
        "en": "Professional services"
      },
      {
        "es": "Equipamiento y maquinaria",
        "en": "Equipment and machinery"
      }
    ],
    "pasos": [
      {
        "n": 1,
        "actor": "trigger",
        "titulo": {
          "es": "Cotización sin respuesta",
          "en": "Quote without reply"
        },
        "detalle": {
          "es": "El monitoreo diario detecta una cotización enviada hace 72 horas sin respuesta del cliente.",
          "en": "The daily sweep detects a quote sent 72 hours ago with no customer reply."
        },
        "log": {
          "es": "Barrido diario → COT-2214 | Ferretería La Cumbre | $8,450 | enviada hace 72 h | respuesta: NINGUNA",
          "en": "Daily sweep → QT-2214 | Ferreteria La Cumbre | $8,450 | sent 72 h ago | reply: NONE"
        },
        "duracionMs": 2200
      },
      {
        "n": 2,
        "actor": "agente",
        "titulo": {
          "es": "Revisa el historial",
          "en": "Reviews the history"
        },
        "detalle": {
          "es": "Recupera del CRM y de SharePoint la cotización, los correos previos y las gestiones anteriores.",
          "en": "Pulls the quote, prior emails and previous touches from the CRM and SharePoint."
        },
        "log": {
          "es": "Historial COT-2214: 1 llamada, 2 correos, PDF abierto 2 veces | último contacto: hace 5 días",
          "en": "QT-2214 history: 1 call, 2 emails, PDF opened twice | last contact: 5 days ago"
        },
        "duracionMs": 2200
      },
      {
        "n": 3,
        "actor": "decision",
        "titulo": {
          "es": "Define la etapa",
          "en": "Sets the stage"
        },
        "detalle": {
          "es": "Determina si corresponde primer, segundo o tercer seguimiento y ajusta tono y canal.",
          "en": "Determines whether this is the first, second or third follow-up and adjusts tone and channel."
        },
        "log": {
          "es": "Decisión: 0 seguimientos previos → SECUENCIA PASO 1 | tono: cordial, valor agregado",
          "en": "Decision: 0 prior follow-ups → SEQUENCE STEP 1 | tone: cordial, value-add"
        },
        "duracionMs": 2400
      },
      {
        "n": 4,
        "actor": "llm",
        "titulo": {
          "es": "Redacta el seguimiento",
          "en": "Drafts the follow-up"
        },
        "detalle": {
          "es": "El modelo escribe un correo personalizado que retoma la conversación sin sonar a plantilla.",
          "en": "The model writes a personalized email that reopens the conversation without sounding templated."
        },
        "log": {
          "es": "Azure OpenAI → borrador: \"Estimado Sr. Portillo, le comparto disponibilidad actualizada de los taladros industriales cotizados…\"",
          "en": "Azure OpenAI → draft: \"Dear Mr. Portillo, sharing updated availability on the industrial drills we quoted…\""
        },
        "duracionMs": 3800
      },
      {
        "n": 5,
        "actor": "herramienta",
        "herramienta": "Outlook",
        "titulo": {
          "es": "Envía el correo",
          "en": "Sends the email"
        },
        "detalle": {
          "es": "Envía el seguimiento desde el buzón del vendedor, adjuntando la cotización vigente.",
          "en": "Sends the follow-up from the rep mailbox, attaching the current quote."
        },
        "log": {
          "es": "Outlook → enviado a j.portillo@ferreterialacumbre.com | adjunto: COT-2214.pdf | hilo original conservado",
          "en": "Outlook → sent to j.portillo@ferreterialacumbre.com | attachment: QT-2214.pdf | original thread preserved"
        },
        "duracionMs": 2000
      },
      {
        "n": 6,
        "actor": "sistema",
        "titulo": {
          "es": "Registra la gestión",
          "en": "Logs the touch"
        },
        "detalle": {
          "es": "Actualiza el CRM con la actividad, la fecha del próximo intento y el estado de la secuencia.",
          "en": "Updates the CRM with the activity, next-attempt date and sequence status."
        },
        "log": {
          "es": "CRM → COT-2214: seguimiento 1/3 registrado | próximo intento: +72 h | estado: EN SECUENCIA",
          "en": "CRM → QT-2214: follow-up 1/3 logged | next attempt: +72 h | status: IN SEQUENCE"
        },
        "duracionMs": 2000
      },
      {
        "n": 7,
        "actor": "decision",
        "titulo": {
          "es": "¿Agotó la secuencia?",
          "en": "Sequence exhausted?"
        },
        "detalle": {
          "es": "Si tras el tercer intento no hay respuesta, el caso se escala al vendedor con todo el contexto.",
          "en": "If the third attempt gets no reply, the case escalates to the rep with full context."
        },
        "log": {
          "es": "Evaluación: intento 3/3 sin respuesta en COT-2189 (caso paralelo) → ESCALAR a vendedor",
          "en": "Evaluation: attempt 3/3 unanswered on QT-2189 (parallel case) → ESCALATE to rep"
        },
        "duracionMs": 2400
      },
      {
        "n": 8,
        "actor": "humano",
        "titulo": {
          "es": "Alerta al vendedor",
          "en": "Alerts the sales rep"
        },
        "detalle": {
          "es": "El vendedor recibe en Teams el resumen de la secuencia y decide la llamada de cierre o el descarte.",
          "en": "The rep gets the sequence summary in Teams and decides on a closing call or disqualification."
        },
        "log": {
          "es": "Teams → @L.Mejía: \"COT-2189 · Comercial Los Pinos · $12,300 · 3 seguimientos sin respuesta · sugerencia: llamada directa\"",
          "en": "Teams → @L.Mejia: \"QT-2189 · Comercial Los Pinos · $12,300 · 3 follow-ups unanswered · suggestion: direct call\""
        },
        "duracionMs": 2400
      },
      {
        "n": 9,
        "actor": "resultado",
        "titulo": {
          "es": "Pipeline sin fugas",
          "en": "Leak-free pipeline"
        },
        "detalle": {
          "es": "Ninguna cotización queda olvidada: cada una recibe seguimiento o una decisión humana informada.",
          "en": "No quote is ever forgotten: each one gets follow-up or an informed human decision."
        },
        "log": {
          "es": "✔ Ciclo diario: 14 cotizaciones gestionadas | 11 en secuencia, 2 respondidas, 1 escalada",
          "en": "✔ Daily cycle: 14 quotes worked | 11 in sequence, 2 replied, 1 escalated"
        },
        "duracionMs": 2200
      }
    ]
  },
  {
    "id": "a03",
    "slug": "atlas",
    "nombre": "Atlas",
    "rol": {
      "es": "Agente de recepción de órdenes de compra",
      "en": "Purchase order intake agent"
    },
    "tagline": {
      "es": "Digitar órdenes de compra a mano es lento, caro y propenso a errores. Atlas las procesa solas.",
      "en": "Keying purchase orders by hand is slow, costly and error-prone. Atlas processes them on its own."
    },
    "categoria": "operaciones",
    "disparador": {
      "es": "Correo entrante con orden de compra adjunta en PDF",
      "en": "Incoming email with a purchase order attached as PDF"
    },
    "metricaDestacada": {
      "es": "De PDF a ERP en minutos, con validación y aprobación incluidas",
      "en": "From PDF to ERP in minutes, validation and approval included"
    },
    "integraciones": [
      "Outlook",
      "Azure OpenAI",
      "SharePoint",
      "ERP",
      "Teams"
    ],
    "resultado": {
      "es": "Orden validada y creada en el ERP, PDF archivado y proveedor confirmado, con aprobación humana cuando aplica",
      "en": "Order validated and created in the ERP, PDF archived and vendor confirmed, with human approval when required"
    },
    "metricas": [
      {
        "es": "Reducción típica de 20-30 min de digitación a minutos por orden",
        "en": "Typical reduction from 20-30 min of manual keying to minutes per order"
      },
      {
        "es": "Validación automática contra catálogo y precios acordados",
        "en": "Automatic validation against catalog and agreed pricing"
      },
      {
        "es": "Trazabilidad completa: PDF original ligado a la orden en el ERP",
        "en": "Full traceability: original PDF linked to the order in the ERP"
      }
    ],
    "industrias": [
      {
        "es": "Manufactura",
        "en": "Manufacturing"
      },
      {
        "es": "Distribución y logística",
        "en": "Distribution and logistics"
      },
      {
        "es": "Retail",
        "en": "Retail"
      }
    ],
    "pasos": [
      {
        "n": 1,
        "actor": "trigger",
        "titulo": {
          "es": "Llega la orden",
          "en": "Order arrives"
        },
        "detalle": {
          "es": "Un correo con la orden de compra en PDF llega al buzón de pedidos y activa el flujo.",
          "en": "An email with the PO attached as PDF hits the orders mailbox and starts the flow."
        },
        "log": {
          "es": "[08:12] Correo → pedidos@ | adjunto: OC-7731.pdf (2 págs) | remitente: compras@textilessanmartin.com",
          "en": "[08:12] Email → orders@ | attachment: PO-7731.pdf (2 pages) | from: compras@textilessanmartin.com"
        },
        "duracionMs": 2200
      },
      {
        "n": 2,
        "actor": "herramienta",
        "herramienta": "Azure OpenAI",
        "titulo": {
          "es": "Lee el PDF",
          "en": "Reads the PDF"
        },
        "detalle": {
          "es": "Extrae con IA los campos clave: proveedor, líneas, cantidades, precios y condiciones de entrega.",
          "en": "AI-extracts the key fields: vendor, line items, quantities, prices and delivery terms."
        },
        "log": {
          "es": "Azure OpenAI → OC-7731: 12 líneas | total $18,940 | entrega: bodega central, 15 días | confianza: 98%",
          "en": "Azure OpenAI → PO-7731: 12 lines | total $18,940 | delivery: central warehouse, 15 days | confidence: 98%"
        },
        "duracionMs": 3800
      },
      {
        "n": 3,
        "actor": "agente",
        "titulo": {
          "es": "Valida contra catálogo",
          "en": "Validates against catalog"
        },
        "detalle": {
          "es": "Cruza cada línea contra el catálogo de productos, precios acordados y existencias.",
          "en": "Cross-checks each line against the product catalog, agreed pricing and stock."
        },
        "log": {
          "es": "Validación: 12/12 SKUs reconocidos | precios OK | stock disponible en 11 líneas, 1 con backorder",
          "en": "Validation: 12/12 SKUs recognized | prices OK | stock available on 11 lines, 1 on backorder"
        },
        "duracionMs": 2600
      },
      {
        "n": 4,
        "actor": "decision",
        "titulo": {
          "es": "¿Datos consistentes?",
          "en": "Data consistent?"
        },
        "detalle": {
          "es": "Si hay discrepancias de precio o SKU desconocido, se detiene y pide aclaración; si no, continúa.",
          "en": "If there is a price mismatch or unknown SKU it stops and requests clarification; otherwise it continues."
        },
        "log": {
          "es": "Decisión: 0 discrepancias críticas | monto $18,940 > umbral $10,000 → requiere aprobación humana",
          "en": "Decision: 0 critical discrepancies | amount $18,940 > $10,000 threshold → human approval required"
        },
        "duracionMs": 2600
      },
      {
        "n": 5,
        "actor": "herramienta",
        "herramienta": "SharePoint",
        "titulo": {
          "es": "Archiva el documento",
          "en": "Archives the document"
        },
        "detalle": {
          "es": "Guarda el PDF original en la biblioteca de órdenes con metadatos para auditoría.",
          "en": "Stores the original PDF in the orders library with metadata for audit."
        },
        "log": {
          "es": "SharePoint → /Ordenes/2026/07/OC-7731.pdf | metadatos: proveedor, monto, estado=PENDIENTE_APROBACIÓN",
          "en": "SharePoint → /Orders/2026/07/PO-7731.pdf | metadata: vendor, amount, status=PENDING_APPROVAL"
        },
        "duracionMs": 2000
      },
      {
        "n": 6,
        "actor": "humano",
        "titulo": {
          "es": "Aprueba el gerente",
          "en": "Manager approves"
        },
        "detalle": {
          "es": "El gerente de operaciones recibe una tarjeta de aprobación en Teams con el resumen de la orden.",
          "en": "The operations manager gets an approval card in Teams with the order summary."
        },
        "log": {
          "es": "Teams → aprobación enviada a @R.Guzmán: \"OC-7731 · Textiles San Martín · $18,940\" | APROBADA en 6 min",
          "en": "Teams → approval sent to @R.Guzman: \"PO-7731 · Textiles San Martin · $18,940\" | APPROVED in 6 min"
        },
        "duracionMs": 3000
      },
      {
        "n": 7,
        "actor": "herramienta",
        "herramienta": "ERP",
        "titulo": {
          "es": "Crea la orden en el ERP",
          "en": "Creates the ERP order"
        },
        "detalle": {
          "es": "Inserta la orden con sus 12 líneas en el ERP y liga el documento archivado.",
          "en": "Posts the 12-line order into the ERP and links the archived document."
        },
        "log": {
          "es": "ERP → orden de venta SV-30988 creada | 12 líneas | ref. externa: OC-7731 | doc vinculado",
          "en": "ERP → sales order SV-30988 created | 12 lines | external ref: PO-7731 | doc linked"
        },
        "duracionMs": 2400
      },
      {
        "n": 8,
        "actor": "herramienta",
        "herramienta": "Outlook",
        "titulo": {
          "es": "Confirma al cliente",
          "en": "Confirms to the sender"
        },
        "detalle": {
          "es": "Responde al cliente con la confirmación del pedido, número interno y fecha estimada de entrega.",
          "en": "Replies to the customer confirming the order, internal number and estimated delivery date."
        },
        "log": {
          "es": "Outlook → respuesta a compras@textilessanmartin.com: \"Pedido SV-30988 confirmado, entrega estimada 18-jul\"",
          "en": "Outlook → reply to compras@textilessanmartin.com: \"Order SV-30988 confirmed, estimated delivery Jul 18\""
        },
        "duracionMs": 2000
      },
      {
        "n": 9,
        "actor": "resultado",
        "titulo": {
          "es": "Orden lista sin digitación",
          "en": "Order done, zero keying"
        },
        "detalle": {
          "es": "La orden quedó en el ERP, auditada y confirmada, sin que nadie digitara una sola línea.",
          "en": "The order is in the ERP, audited and confirmed, without anyone keying a single line."
        },
        "log": {
          "es": "✔ OC-7731 procesada en 9 min | extracción → validación → aprobación → ERP → confirmación",
          "en": "✔ PO-7731 processed in 9 min | extraction → validation → approval → ERP → confirmation"
        },
        "duracionMs": 2000
      }
    ]
  },
  {
    "id": "a04",
    "slug": "chrono",
    "nombre": "Chrono",
    "rol": {
      "es": "Agente de despacho de servicio en campo",
      "en": "Field service dispatch agent"
    },
    "tagline": {
      "es": "Asignar técnicos por chat y llamadas cuesta horas al día. Chrono despacha en segundos.",
      "en": "Dispatching technicians over chat and calls burns hours a day. Chrono dispatches in seconds."
    },
    "categoria": "operaciones",
    "disparador": {
      "es": "Ticket nuevo de servicio técnico creado en la app de campo",
      "en": "New service ticket created in the field app"
    },
    "metricaDestacada": {
      "es": "Técnico asignado y notificado en <2 min desde el ticket",
      "en": "Technician assigned and notified in <2 min from ticket creation"
    },
    "integraciones": [
      "Power Apps",
      "Dataverse",
      "Azure OpenAI",
      "WhatsApp Business",
      "Outlook"
    ],
    "resultado": {
      "es": "Visita agendada con el técnico óptimo, cliente y técnico notificados y ticket actualizado",
      "en": "Visit scheduled with the best-fit technician, customer and tech notified, ticket updated"
    },
    "metricas": [
      {
        "es": "Asignación por zona, habilidad y carga de trabajo, no por memoria del coordinador",
        "en": "Assignment by zone, skill and workload, not the coordinator memory"
      },
      {
        "es": "Reducción típica de reprogramaciones por asignaciones erradas",
        "en": "Typical reduction in reschedules caused by wrong assignments"
      },
      {
        "es": "Cliente informado del horario y técnico sin llamadas de ida y vuelta",
        "en": "Customer informed of time and technician without back-and-forth calls"
      }
    ],
    "industrias": [
      {
        "es": "Servicios técnicos y mantenimiento",
        "en": "Technical services and maintenance"
      },
      {
        "es": "Telecomunicaciones",
        "en": "Telecommunications"
      },
      {
        "es": "Climatización y equipos",
        "en": "HVAC and equipment"
      }
    ],
    "pasos": [
      {
        "n": 1,
        "actor": "trigger",
        "titulo": {
          "es": "Entra un ticket",
          "en": "Ticket comes in"
        },
        "detalle": {
          "es": "Un ticket de servicio se crea en la app de campo y dispara el flujo de despacho.",
          "en": "A service ticket is created in the field app and triggers the dispatch flow."
        },
        "log": {
          "es": "[10:03] Ticket TK-5120 | Clínica Santa Elena | falla: aire acondicionado quirófano 2 | prioridad reportada: ALTA",
          "en": "[10:03] Ticket TK-5120 | Clinica Santa Elena | issue: OR-2 air conditioning failure | reported priority: HIGH"
        },
        "duracionMs": 2000
      },
      {
        "n": 2,
        "actor": "llm",
        "titulo": {
          "es": "Clasifica la urgencia",
          "en": "Classifies the urgency"
        },
        "detalle": {
          "es": "El modelo interpreta la descripción, confirma el tipo de falla y valida la prioridad real.",
          "en": "The model reads the description, confirms the failure type and validates the true priority."
        },
        "log": {
          "es": "Azure OpenAI → tipo: HVAC crítico en área clínica | SLA aplicable: 4 h | habilidad requerida: refrigeración industrial",
          "en": "Azure OpenAI → type: critical HVAC in clinical area | applicable SLA: 4 h | required skill: industrial refrigeration"
        },
        "duracionMs": 3200
      },
      {
        "n": 3,
        "actor": "herramienta",
        "herramienta": "Dataverse",
        "titulo": {
          "es": "Consulta a los técnicos",
          "en": "Queries the technicians"
        },
        "detalle": {
          "es": "Obtiene de Dataverse los técnicos activos, sus habilidades, zona actual y agenda del día.",
          "en": "Pulls active technicians, skills, current zone and daily schedule from Dataverse."
        },
        "log": {
          "es": "Dataverse → 8 técnicos activos | 3 con certificación HVAC | zona San Salvador centro: 2 disponibles",
          "en": "Dataverse → 8 active technicians | 3 HVAC-certified | downtown San Salvador zone: 2 available"
        },
        "duracionMs": 2400
      },
      {
        "n": 4,
        "actor": "agente",
        "titulo": {
          "es": "Calcula el mejor match",
          "en": "Computes the best match"
        },
        "detalle": {
          "es": "Pondera distancia, habilidad, carga del día y cumplimiento de SLA para elegir al técnico óptimo.",
          "en": "Weighs distance, skill, daily load and SLA compliance to pick the optimal technician."
        },
        "log": {
          "es": "Match: J. Alvarado (HVAC, a 3.2 km, 1 visita restante) score 94 vs M. Cruz score 71 → asignar J. Alvarado",
          "en": "Match: J. Alvarado (HVAC, 3.2 km away, 1 visit left) score 94 vs M. Cruz score 71 → assign J. Alvarado"
        },
        "duracionMs": 2800
      },
      {
        "n": 5,
        "actor": "decision",
        "titulo": {
          "es": "¿Cumple el SLA?",
          "en": "Meets the SLA?"
        },
        "detalle": {
          "es": "Verifica que el técnico llegue dentro del SLA; si no, evalúa reordenar visitas o escalar.",
          "en": "Verifies the tech can arrive within SLA; if not, evaluates reshuffling visits or escalating."
        },
        "log": {
          "es": "Decisión: llegada estimada 11:20, SLA vence 14:03 → DENTRO DE SLA → confirmar asignación",
          "en": "Decision: ETA 11:20, SLA expires 14:03 → WITHIN SLA → confirm assignment"
        },
        "duracionMs": 2600
      },
      {
        "n": 6,
        "actor": "herramienta",
        "herramienta": "Outlook",
        "titulo": {
          "es": "Agenda la visita",
          "en": "Books the visit"
        },
        "detalle": {
          "es": "Crea la cita en el calendario del técnico con dirección, contacto y detalle de la falla.",
          "en": "Creates the calendar appointment for the tech with address, contact and failure details."
        },
        "log": {
          "es": "Outlook → cita 11:20-13:00 · J. Alvarado · Clínica Santa Elena · adjunto: historial del equipo",
          "en": "Outlook → appointment 11:20-13:00 · J. Alvarado · Clinica Santa Elena · attached: equipment history"
        },
        "duracionMs": 2200
      },
      {
        "n": 7,
        "actor": "herramienta",
        "herramienta": "WhatsApp Business",
        "titulo": {
          "es": "Notifica a ambos",
          "en": "Notifies both parties"
        },
        "detalle": {
          "es": "Envía por WhatsApp la asignación al técnico y la confirmación de horario al cliente.",
          "en": "Sends the assignment to the tech and the time confirmation to the customer via WhatsApp."
        },
        "log": {
          "es": "WhatsApp → J. Alvarado: \"TK-5120 asignado, 11:20\" ✓✓ | Cliente: \"Su técnico Jorge llega entre 11:00-11:30\" ✓✓",
          "en": "WhatsApp → J. Alvarado: \"TK-5120 assigned, 11:20\" ✓✓ | Customer: \"Your technician Jorge arrives 11:00-11:30\" ✓✓"
        },
        "duracionMs": 2200
      },
      {
        "n": 8,
        "actor": "herramienta",
        "herramienta": "Power Apps",
        "titulo": {
          "es": "Actualiza el ticket",
          "en": "Updates the ticket"
        },
        "detalle": {
          "es": "Refleja en la app de campo el técnico asignado, la hora estimada y el estado EN RUTA.",
          "en": "Reflects the assigned tech, ETA and EN ROUTE status in the field app."
        },
        "log": {
          "es": "Power Apps → TK-5120: estado=ASIGNADO | técnico=J. Alvarado | ETA=11:20 | visible para supervisor",
          "en": "Power Apps → TK-5120: status=ASSIGNED | tech=J. Alvarado | ETA=11:20 | visible to supervisor"
        },
        "duracionMs": 2000
      },
      {
        "n": 9,
        "actor": "resultado",
        "titulo": {
          "es": "Despacho sin fricción",
          "en": "Frictionless dispatch"
        },
        "detalle": {
          "es": "El técnico correcto va en camino dentro del SLA y todos los involucrados están informados.",
          "en": "The right technician is on the way within SLA and every stakeholder is informed."
        },
        "log": {
          "es": "✔ TK-5120 despachado en 1 min 48 s | 0 llamadas del coordinador | SLA protegido",
          "en": "✔ TK-5120 dispatched in 1 min 48 s | 0 coordinator calls | SLA protected"
        },
        "duracionMs": 2200
      }
    ]
  },
  {
    "id": "a05",
    "slug": "fenix",
    "nombre": "Fénix",
    "rol": {
      "es": "Agente de conciliación bancaria",
      "en": "Bank reconciliation agent"
    },
    "tagline": {
      "es": "Conciliar el banco contra el ERP consume días de cada cierre. Fénix lo deja en excepciones.",
      "en": "Reconciling the bank against the ERP eats days of every close. Fénix reduces it to exceptions."
    },
    "categoria": "finanzas",
    "disparador": {
      "es": "Estado de cuenta bancario diario recibido o cierre programado",
      "en": "Daily bank statement received or scheduled close"
    },
    "metricaDestacada": {
      "es": "Conciliación automática típica del 85-95% de movimientos",
      "en": "Typical automatic match rate of 85-95% of transactions"
    },
    "integraciones": [
      "SQL Server",
      "ERP",
      "Azure OpenAI",
      "Excel",
      "Teams"
    ],
    "resultado": {
      "es": "Movimientos conciliados en el ERP y reporte de excepciones listo para revisión del contador",
      "en": "Transactions reconciled in the ERP and an exceptions report ready for the accountant"
    },
    "metricas": [
      {
        "es": "El equipo contable revisa solo excepciones, no el universo completo",
        "en": "The accounting team reviews only exceptions, not the full universe"
      },
      {
        "es": "Match difuso con IA para referencias incompletas o abreviadas",
        "en": "AI fuzzy matching for incomplete or abbreviated references"
      },
      {
        "es": "Cierre mensual típicamente días más rápido",
        "en": "Month-end close typically days faster"
      }
    ],
    "industrias": [
      {
        "es": "Servicios financieros y corporativos",
        "en": "Financial and corporate services"
      },
      {
        "es": "Retail multi-sucursal",
        "en": "Multi-branch retail"
      },
      {
        "es": "Importadoras y comercio",
        "en": "Importers and trading companies"
      }
    ],
    "pasos": [
      {
        "n": 1,
        "actor": "trigger",
        "titulo": {
          "es": "Llega el estado de cuenta",
          "en": "Statement arrives"
        },
        "detalle": {
          "es": "El archivo bancario diario llega y dispara la conciliación automática.",
          "en": "The daily bank file arrives and kicks off the automatic reconciliation."
        },
        "log": {
          "es": "[06:00] Archivo banco: mov_20260703.csv | 147 movimientos | abonos $211,480 | cargos $96,215",
          "en": "[06:00] Bank file: txn_20260703.csv | 147 transactions | credits $211,480 | debits $96,215"
        },
        "duracionMs": 2200
      },
      {
        "n": 2,
        "actor": "herramienta",
        "herramienta": "SQL Server",
        "titulo": {
          "es": "Carga los movimientos",
          "en": "Loads the transactions"
        },
        "detalle": {
          "es": "Inserta los movimientos bancarios en la base de staging con validación de formato y duplicados.",
          "en": "Inserts the bank transactions into the staging database with format and duplicate validation."
        },
        "log": {
          "es": "SQL Server → staging.mov_banco: 147 filas insertadas | 0 duplicados | esquema validado",
          "en": "SQL Server → staging.bank_txn: 147 rows inserted | 0 duplicates | schema validated"
        },
        "duracionMs": 2200
      },
      {
        "n": 3,
        "actor": "herramienta",
        "herramienta": "ERP",
        "titulo": {
          "es": "Trae lo pendiente",
          "en": "Pulls open items"
        },
        "detalle": {
          "es": "Obtiene del ERP las facturas por cobrar y pagos pendientes de aplicar.",
          "en": "Fetches open receivables and unapplied payments from the ERP."
        },
        "log": {
          "es": "ERP → 214 documentos abiertos: 168 CxC, 46 pagos sin aplicar | rango: $45 - $32,600",
          "en": "ERP → 214 open documents: 168 AR, 46 unapplied payments | range: $45 - $32,600"
        },
        "duracionMs": 2200
      },
      {
        "n": 4,
        "actor": "agente",
        "titulo": {
          "es": "Match exacto",
          "en": "Exact matching"
        },
        "detalle": {
          "es": "Concilia primero por monto, referencia y fecha con reglas deterministas.",
          "en": "Reconciles first on amount, reference and date using deterministic rules."
        },
        "log": {
          "es": "Match exacto: 119/147 conciliados (81%) | ej: abono $4,520 ↔ FAC-8812 Importadora El Faro",
          "en": "Exact match: 119/147 reconciled (81%) | e.g.: credit $4,520 ↔ INV-8812 Importadora El Faro"
        },
        "duracionMs": 2600
      },
      {
        "n": 5,
        "actor": "llm",
        "titulo": {
          "es": "Match difuso con IA",
          "en": "AI fuzzy matching"
        },
        "detalle": {
          "es": "El modelo resuelve casos ambiguos: referencias truncadas, pagos agrupados y montos con retenciones.",
          "en": "The model resolves ambiguous cases: truncated references, grouped payments and amounts net of withholdings."
        },
        "log": {
          "es": "Azure OpenAI → \"TRANSF GRUPO AND 15,2K\" ↔ FAC-8720+FAC-8733 Grupo Andino ($15,204, ret. 1%) | +19 resueltos",
          "en": "Azure OpenAI → \"WIRE GRUPO AND 15.2K\" ↔ INV-8720+INV-8733 Grupo Andino ($15,204, 1% withholding) | +19 resolved"
        },
        "duracionMs": 3600
      },
      {
        "n": 6,
        "actor": "decision",
        "titulo": {
          "es": "¿Quedan excepciones?",
          "en": "Exceptions remaining?"
        },
        "detalle": {
          "es": "Separa lo conciliado con confianza alta de lo que requiere criterio contable humano.",
          "en": "Splits high-confidence matches from items that need human accounting judgment."
        },
        "log": {
          "es": "Decisión: 138 conciliados (94%) → aplicar en ERP | 9 excepciones → revisión humana",
          "en": "Decision: 138 reconciled (94%) → post to ERP | 9 exceptions → human review"
        },
        "duracionMs": 2400
      },
      {
        "n": 7,
        "actor": "herramienta",
        "herramienta": "Excel",
        "titulo": {
          "es": "Genera el reporte",
          "en": "Builds the report"
        },
        "detalle": {
          "es": "Produce el libro de excepciones con cada caso, el motivo y la sugerencia de resolución.",
          "en": "Produces the exceptions workbook with each case, the reason and a suggested resolution."
        },
        "log": {
          "es": "Excel → excepciones_20260703.xlsx: 9 casos | 4 sin referencia, 3 diferencia de monto, 2 posible doble pago",
          "en": "Excel → exceptions_20260703.xlsx: 9 cases | 4 missing reference, 3 amount mismatch, 2 possible double payment"
        },
        "duracionMs": 2000
      },
      {
        "n": 8,
        "actor": "humano",
        "titulo": {
          "es": "Revisa el contador",
          "en": "Accountant reviews"
        },
        "detalle": {
          "es": "El contador recibe el reporte en Teams y resuelve solo los 9 casos que exigen criterio.",
          "en": "The accountant gets the report in Teams and resolves only the 9 cases that require judgment."
        },
        "log": {
          "es": "Teams → @A.Escobar: \"Conciliación 03-jul: 94% automática, 9 excepciones adjuntas\" | revisión estimada: 20 min",
          "en": "Teams → @A.Escobar: \"Jul-03 reconciliation: 94% automatic, 9 exceptions attached\" | estimated review: 20 min"
        },
        "duracionMs": 2600
      },
      {
        "n": 9,
        "actor": "resultado",
        "titulo": {
          "es": "Cierre bajo control",
          "en": "Close under control"
        },
        "detalle": {
          "es": "El día queda conciliado con evidencia completa y el equipo contable enfocado en lo que importa.",
          "en": "The day is reconciled with full evidence and the accounting team focused on what matters."
        },
        "log": {
          "es": "✔ 147 movimientos procesados | 138 conciliados y aplicados | 9 en bandeja de excepciones",
          "en": "✔ 147 transactions processed | 138 reconciled and posted | 9 in the exceptions queue"
        },
        "duracionMs": 2200
      }
    ]
  },
  {
    "id": "a06",
    "slug": "ledger",
    "nombre": "Ledger",
    "rol": {
      "es": "Agente de cobranza de cuentas por cobrar",
      "en": "Accounts receivable collection agent"
    },
    "tagline": {
      "es": "La cartera vencida no se cobra sola, y a nadie le gusta cobrar. Ledger lo hace con tacto y sin descanso.",
      "en": "Overdue receivables do not collect themselves, and nobody enjoys chasing them. Ledger does it tactfully and tirelessly."
    },
    "categoria": "finanzas",
    "disparador": {
      "es": "Reporte diario de antigüedad de saldos generado por el ERP",
      "en": "Daily aging report generated by the ERP"
    },
    "metricaDestacada": {
      "es": "Gestión de cobro al 100% de la cartera vencida, todos los días",
      "en": "100% of overdue accounts worked, every single day"
    },
    "integraciones": [
      "ERP",
      "Azure OpenAI",
      "Outlook",
      "WhatsApp Business",
      "Teams"
    ],
    "resultado": {
      "es": "Recordatorios enviados con enlace de pago, gestiones registradas y casos críticos escalados a cobranza",
      "en": "Reminders sent with payment links, touches logged and critical cases escalated to collections"
    },
    "metricas": [
      {
        "es": "Tono escalonado: cordial a 7 días, firme a 30, escalado a 60",
        "en": "Graduated tone: cordial at 7 days, firm at 30, escalated at 60"
      },
      {
        "es": "Reducción típica de días de cartera (DSO) al sistematizar el recordatorio",
        "en": "Typical DSO reduction from systematic reminders"
      },
      {
        "es": "Relación con el cliente cuidada: mensajes corteses y personalizados",
        "en": "Customer relationship protected: polite, personalized messages"
      }
    ],
    "industrias": [
      {
        "es": "Distribución y mayoreo",
        "en": "Distribution and wholesale"
      },
      {
        "es": "Servicios recurrentes",
        "en": "Recurring services"
      },
      {
        "es": "Salud privada",
        "en": "Private healthcare"
      }
    ],
    "pasos": [
      {
        "n": 1,
        "actor": "trigger",
        "titulo": {
          "es": "Sale el reporte de antigüedad",
          "en": "Aging report drops"
        },
        "detalle": {
          "es": "El ERP genera el reporte diario de saldos vencidos y activa la gestión de cobro.",
          "en": "The ERP generates the daily overdue balances report and triggers the collection run."
        },
        "log": {
          "es": "[07:00] Antigüedad de saldos: 63 facturas vencidas | $148,320 total | buckets: 7d=$52K, 30d=$61K, 60d+=$35K",
          "en": "[07:00] Aging report: 63 overdue invoices | $148,320 total | buckets: 7d=$52K, 30d=$61K, 60d+=$35K"
        },
        "duracionMs": 2200
      },
      {
        "n": 2,
        "actor": "agente",
        "titulo": {
          "es": "Segmenta la cartera",
          "en": "Segments the portfolio"
        },
        "detalle": {
          "es": "Agrupa clientes por días de mora, monto e historial de pago, y excluye disputas abiertas.",
          "en": "Groups customers by days overdue, amount and payment history, excluding open disputes."
        },
        "log": {
          "es": "Segmentación: 28 clientes en 7d, 19 en 30d, 9 en 60d+ | 2 excluidos por disputa abierta",
          "en": "Segmentation: 28 customers at 7d, 19 at 30d, 9 at 60d+ | 2 excluded due to open dispute"
        },
        "duracionMs": 2400
      },
      {
        "n": 3,
        "actor": "decision",
        "titulo": {
          "es": "Define la gestión",
          "en": "Sets the treatment"
        },
        "detalle": {
          "es": "Asigna a cada cliente el canal, el tono y la acción según su tramo de mora y su historial.",
          "en": "Assigns each customer a channel, tone and action based on aging bucket and history."
        },
        "log": {
          "es": "Decisión: 7d → correo cordial | 30d → correo firme + WhatsApp | 60d+ → escalar a crédito y cobranza",
          "en": "Decision: 7d → cordial email | 30d → firm email + WhatsApp | 60d+ → escalate to collections"
        },
        "duracionMs": 2600
      },
      {
        "n": 4,
        "actor": "llm",
        "titulo": {
          "es": "Redacta los recordatorios",
          "en": "Drafts the reminders"
        },
        "detalle": {
          "es": "El modelo genera mensajes corteses y personalizados por cliente, con detalle de facturas y montos.",
          "en": "The model generates polite, per-customer messages with invoice details and amounts."
        },
        "log": {
          "es": "Azure OpenAI → 47 mensajes generados | ej: \"Estimada Lic. Rivas, le recordamos la factura FAC-8801 por $3,250 vencida el 26-jun…\"",
          "en": "Azure OpenAI → 47 messages generated | e.g.: \"Dear Ms. Rivas, a kind reminder of invoice INV-8801 for $3,250 due Jun 26…\""
        },
        "duracionMs": 3600
      },
      {
        "n": 5,
        "actor": "herramienta",
        "herramienta": "Outlook",
        "titulo": {
          "es": "Envía con enlace de pago",
          "en": "Sends with payment link"
        },
        "detalle": {
          "es": "Envía cada recordatorio por correo con el estado de cuenta y el enlace de pago en línea.",
          "en": "Emails each reminder with the account statement and the online payment link."
        },
        "log": {
          "es": "Outlook → 47 correos enviados | adjunto: estado de cuenta | enlace de pago incluido | 0 rebotes",
          "en": "Outlook → 47 emails sent | attached: account statement | payment link included | 0 bounces"
        },
        "duracionMs": 2000
      },
      {
        "n": 6,
        "actor": "herramienta",
        "herramienta": "WhatsApp Business",
        "titulo": {
          "es": "Refuerza por WhatsApp",
          "en": "Reinforces via WhatsApp"
        },
        "detalle": {
          "es": "A los clientes con más de 30 días de mora les envía además un recordatorio breve por WhatsApp.",
          "en": "Customers past 30 days also get a brief WhatsApp reminder."
        },
        "log": {
          "es": "WhatsApp Business → 19 recordatorios enviados | ej: Farmacia Buenavista: \"Saldo pendiente $5,180, enlace de pago: pay.link/fb-8790\" ✓✓",
          "en": "WhatsApp Business → 19 reminders sent | e.g. Farmacia Buenavista: \"Outstanding balance $5,180, payment link: pay.link/fb-8790\" ✓✓"
        },
        "duracionMs": 2200
      },
      {
        "n": 7,
        "actor": "sistema",
        "titulo": {
          "es": "Registra cada gestión",
          "en": "Logs every touch"
        },
        "detalle": {
          "es": "Anota en el ERP la fecha, el canal y el contenido de cada gestión para el historial de cobro.",
          "en": "Records date, channel and content of each touch in the ERP collection history."
        },
        "log": {
          "es": "ERP → 66 gestiones registradas | próxima revisión automática: facturas sin pago en 72 h",
          "en": "ERP → 66 touches logged | next automatic check: invoices unpaid after 72 h"
        },
        "duracionMs": 2000
      },
      {
        "n": 8,
        "actor": "humano",
        "titulo": {
          "es": "Escala los críticos",
          "en": "Escalates critical cases"
        },
        "detalle": {
          "es": "Los saldos de 60+ días llegan al jefe de crédito con historial completo y sugerencia de acción.",
          "en": "Balances past 60 days reach the credit manager with full history and a suggested action."
        },
        "log": {
          "es": "Teams → @V.Campos: \"9 cuentas 60d+ por $35,410 | 3 sugeridas para plan de pago, 1 para suspensión de crédito\"",
          "en": "Teams → @V.Campos: \"9 accounts 60d+ totaling $35,410 | 3 suggested for payment plan, 1 for credit hold\""
        },
        "duracionMs": 2600
      },
      {
        "n": 9,
        "actor": "resultado",
        "titulo": {
          "es": "Cartera gestionada a diario",
          "en": "Portfolio worked daily"
        },
        "detalle": {
          "es": "Toda la cartera vencida recibió gestión hoy: recordada, documentada o escalada con criterio.",
          "en": "Every overdue account was worked today: reminded, documented or escalated with judgment."
        },
        "log": {
          "es": "✔ 63 facturas gestionadas | 47 correos + 19 WhatsApp + 9 escaladas | DSO bajo vigilancia continua",
          "en": "✔ 63 invoices worked | 47 emails + 19 WhatsApp + 9 escalated | DSO under continuous watch"
        },
        "duracionMs": 2200
      }
    ]
  },
  {
    "id": "a07",
    "slug": "aura",
    "nombre": "Aura",
    "rol": {
      "es": "Agente de resolución de soporte nivel 1",
      "en": "Tier-1 support resolution agent"
    },
    "tagline": {
      "es": "La mitad de los tickets repiten las mismas cinco preguntas. Aura las resuelve al instante y escala el resto con contexto.",
      "en": "Half of all tickets repeat the same five questions. Aura answers them instantly and escalates the rest with context."
    },
    "categoria": "soporte",
    "disparador": {
      "es": "Ticket nuevo por correo o mensaje en el canal de soporte de Teams",
      "en": "New ticket via email or message in the Teams support channel"
    },
    "metricaDestacada": {
      "es": "Resolución típica de 40-60% de tickets nivel 1 sin intervención humana",
      "en": "Typically resolves 40-60% of tier-1 tickets without human intervention"
    },
    "integraciones": [
      "Teams",
      "SharePoint",
      "Azure OpenAI",
      "Dataverse",
      "Outlook"
    ],
    "resultado": {
      "es": "Ticket resuelto con solución verificada de la base de conocimiento, o escalado con diagnóstico completo",
      "en": "Ticket resolved with a verified knowledge-base solution, or escalated with a complete diagnosis"
    },
    "metricas": [
      {
        "es": "Primera respuesta en minutos en horario y fuera de horario",
        "en": "First response in minutes, during and after business hours"
      },
      {
        "es": "Escalamientos llegan con diagnóstico, no con \"no funciona\"",
        "en": "Escalations arrive with a diagnosis, not just \"it is broken\""
      },
      {
        "es": "La base de conocimiento se aprovecha en cada ticket, no solo cuando alguien la recuerda",
        "en": "The knowledge base is used on every ticket, not only when someone remembers it"
      }
    ],
    "industrias": [
      {
        "es": "Tecnología y SaaS",
        "en": "Technology and SaaS"
      },
      {
        "es": "Corporativos con mesa de ayuda interna",
        "en": "Corporates with internal help desks"
      },
      {
        "es": "Servicios financieros",
        "en": "Financial services"
      }
    ],
    "pasos": [
      {
        "n": 1,
        "actor": "trigger",
        "titulo": {
          "es": "Entra el ticket",
          "en": "Ticket arrives"
        },
        "detalle": {
          "es": "Un usuario reporta un problema por correo o Teams y el ticket se crea automáticamente.",
          "en": "A user reports an issue via email or Teams and the ticket is created automatically."
        },
        "log": {
          "es": "[14:22] Ticket SP-3307 | usuario: r.molina@transporteslaruta.com | \"No puedo generar el reporte de facturación del mes\"",
          "en": "[14:22] Ticket SP-3307 | user: r.molina@transporteslaruta.com | \"I cannot generate the monthly billing report\""
        },
        "duracionMs": 2000
      },
      {
        "n": 2,
        "actor": "llm",
        "titulo": {
          "es": "Entiende el problema",
          "en": "Understands the issue"
        },
        "detalle": {
          "es": "El modelo interpreta el reporte, identifica el módulo afectado y clasifica el tipo de incidencia.",
          "en": "The model parses the report, identifies the affected module and classifies the incident type."
        },
        "log": {
          "es": "Azure OpenAI → módulo: facturación | tipo: error de permisos probable | severidad: media | idioma: es",
          "en": "Azure OpenAI → module: billing | type: likely permissions error | severity: medium | language: es"
        },
        "duracionMs": 3200
      },
      {
        "n": 3,
        "actor": "herramienta",
        "herramienta": "SharePoint",
        "titulo": {
          "es": "Busca en la base",
          "en": "Searches the KB"
        },
        "detalle": {
          "es": "Consulta la base de conocimiento en SharePoint y recupera los artículos más relevantes al caso.",
          "en": "Queries the SharePoint knowledge base and retrieves the most relevant articles for the case."
        },
        "log": {
          "es": "SharePoint KB → 3 artículos: KB-114 \"Permisos de reportes\" (rel. 0.92), KB-087, KB-102",
          "en": "SharePoint KB → 3 articles: KB-114 \"Report permissions\" (rel. 0.92), KB-087, KB-102"
        },
        "duracionMs": 2400
      },
      {
        "n": 4,
        "actor": "llm",
        "titulo": {
          "es": "Redacta la solución",
          "en": "Drafts the solution"
        },
        "detalle": {
          "es": "Genera una respuesta paso a paso adaptada al usuario, citando el artículo de la base.",
          "en": "Generates a step-by-step reply tailored to the user, citing the KB article."
        },
        "log": {
          "es": "Azure OpenAI → solución: 4 pasos para reactivar el rol \"Reportes-Facturación\" | fuente: KB-114 | confianza: 0.91",
          "en": "Azure OpenAI → solution: 4 steps to re-enable the \"Billing-Reports\" role | source: KB-114 | confidence: 0.91"
        },
        "duracionMs": 3400
      },
      {
        "n": 5,
        "actor": "decision",
        "titulo": {
          "es": "¿Responde o escala?",
          "en": "Answer or escalate?"
        },
        "detalle": {
          "es": "Si la confianza supera el umbral responde directo; si no, escala a nivel 2 con el diagnóstico.",
          "en": "If confidence clears the threshold it replies directly; otherwise it escalates to tier 2 with the diagnosis."
        },
        "log": {
          "es": "Decisión: confianza 0.91 ≥ umbral 0.80 → RESPONDER | escalamiento en espera como respaldo",
          "en": "Decision: confidence 0.91 ≥ threshold 0.80 → ANSWER | escalation held as fallback"
        },
        "duracionMs": 2600
      },
      {
        "n": 6,
        "actor": "herramienta",
        "herramienta": "Outlook",
        "titulo": {
          "es": "Responde al usuario",
          "en": "Replies to the user"
        },
        "detalle": {
          "es": "Envía la solución con pasos numerados y pregunta de confirmación de cierre.",
          "en": "Sends the solution with numbered steps and a closure confirmation question."
        },
        "log": {
          "es": "Outlook → r.molina@…: solución enviada (4 pasos + captura) | \"¿Quedó resuelto? Responda SÍ para cerrar\"",
          "en": "Outlook → r.molina@…: solution sent (4 steps + screenshot) | \"Did this fix it? Reply YES to close\""
        },
        "duracionMs": 2000
      },
      {
        "n": 7,
        "actor": "sistema",
        "titulo": {
          "es": "Actualiza el ticket",
          "en": "Updates the ticket"
        },
        "detalle": {
          "es": "Registra en Dataverse la solución aplicada, el artículo usado y el tiempo de atención.",
          "en": "Logs the applied solution, KB article used and handling time in Dataverse."
        },
        "log": {
          "es": "Dataverse → SP-3307: estado=RESUELTO_PENDIENTE_CONFIRMACIÓN | KB-114 | primera respuesta: 3 min",
          "en": "Dataverse → SP-3307: status=RESOLVED_PENDING_CONFIRMATION | KB-114 | first response: 3 min"
        },
        "duracionMs": 2000
      },
      {
        "n": 8,
        "actor": "humano",
        "titulo": {
          "es": "Escala con contexto",
          "en": "Escalates with context"
        },
        "detalle": {
          "es": "Los casos de baja confianza llegan al técnico de nivel 2 con diagnóstico, pasos probados y artículos consultados.",
          "en": "Low-confidence cases reach the tier-2 technician with diagnosis, attempted steps and consulted articles."
        },
        "log": {
          "es": "Teams → @N2-Soporte: \"SP-3311 escalado · error no documentado en módulo inventario · diagnóstico y logs adjuntos\"",
          "en": "Teams → @T2-Support: \"SP-3311 escalated · undocumented error in inventory module · diagnosis and logs attached\""
        },
        "duracionMs": 2400
      },
      {
        "n": 9,
        "actor": "resultado",
        "titulo": {
          "es": "Soporte que no se detiene",
          "en": "Support that never stops"
        },
        "detalle": {
          "es": "Los tickets repetitivos se resuelven solos y el equipo humano recibe solo los casos que lo ameritan.",
          "en": "Repetitive tickets resolve themselves and the human team receives only the cases that warrant it."
        },
        "log": {
          "es": "✔ SP-3307 resuelto en 3 min sin humano | día: 22 tickets, 13 auto-resueltos, 9 escalados con contexto",
          "en": "✔ SP-3307 resolved in 3 min with no human | day: 22 tickets, 13 auto-resolved, 9 escalated with context"
        },
        "duracionMs": 2000
      }
    ]
  },
  {
    "id": "a08",
    "slug": "radar",
    "nombre": "Radar",
    "rol": {
      "es": "Agente centinela de SLA",
      "en": "SLA breach sentinel agent"
    },
    "tagline": {
      "es": "Los SLA no se incumplen de golpe: se incumplen en silencio. Radar los ve venir antes de que ocurra.",
      "en": "SLAs are not breached suddenly: they are breached in silence. Radar sees it coming before it happens."
    },
    "categoria": "soporte",
    "disparador": {
      "es": "Monitoreo programado de colas de tickets cada 10 minutos",
      "en": "Scheduled monitoring of ticket queues every 10 minutes"
    },
    "metricaDestacada": {
      "es": "Alerta preventiva típica 1-2 horas antes del vencimiento del SLA",
      "en": "Typical preventive alert 1-2 hours before SLA expiry"
    },
    "integraciones": [
      "Dataverse",
      "Power BI",
      "Teams",
      "Outlook",
      "Azure OpenAI"
    ],
    "resultado": {
      "es": "Tickets en riesgo reasignados o priorizados y supervisor alertado antes del incumplimiento",
      "en": "At-risk tickets reassigned or reprioritized and supervisor alerted before the breach"
    },
    "metricas": [
      {
        "es": "Vigilancia continua de todas las colas, sin depender de que alguien mire el tablero",
        "en": "Continuous watch over every queue, without relying on someone checking the board"
      },
      {
        "es": "Reducción típica de incumplimientos por tickets olvidados o mal asignados",
        "en": "Typical reduction in breaches from forgotten or misassigned tickets"
      },
      {
        "es": "Evidencia de cumplimiento lista para reportes con clientes",
        "en": "Compliance evidence ready for client reporting"
      }
    ],
    "industrias": [
      {
        "es": "Mesas de servicio y outsourcing TI",
        "en": "Service desks and IT outsourcing"
      },
      {
        "es": "Telecomunicaciones",
        "en": "Telecommunications"
      },
      {
        "es": "Servicios administrados",
        "en": "Managed services"
      }
    ],
    "pasos": [
      {
        "n": 1,
        "actor": "trigger",
        "titulo": {
          "es": "Barrido programado",
          "en": "Scheduled sweep"
        },
        "detalle": {
          "es": "Cada 10 minutos el agente revisa todas las colas de soporte activas.",
          "en": "Every 10 minutes the agent sweeps all active support queues."
        },
        "log": {
          "es": "[15:40] Barrido #94 del día | colas: soporte-general, facturación, campo | tickets abiertos: 71",
          "en": "[15:40] Sweep #94 of the day | queues: general-support, billing, field | open tickets: 71"
        },
        "duracionMs": 2000
      },
      {
        "n": 2,
        "actor": "herramienta",
        "herramienta": "Dataverse",
        "titulo": {
          "es": "Lee tickets y SLA",
          "en": "Reads tickets and SLAs"
        },
        "detalle": {
          "es": "Obtiene de Dataverse cada ticket abierto con su SLA contractual, prioridad y asignación actual.",
          "en": "Pulls every open ticket from Dataverse with its contractual SLA, priority and current assignment."
        },
        "log": {
          "es": "Dataverse → 71 tickets | 12 prioridad alta | SLA más próximo: SP-3298 vence 17:00 (1 h 20 min)",
          "en": "Dataverse → 71 tickets | 12 high priority | nearest SLA: SP-3298 expires 17:00 (1 h 20 min)"
        },
        "duracionMs": 2200
      },
      {
        "n": 3,
        "actor": "agente",
        "titulo": {
          "es": "Calcula el tiempo restante",
          "en": "Computes remaining time"
        },
        "detalle": {
          "es": "Calcula para cada ticket las horas restantes de SLA contra el avance real y la carga del asignado.",
          "en": "Computes remaining SLA hours per ticket against actual progress and assignee workload."
        },
        "log": {
          "es": "Cálculo: 3 tickets <2 h de margen | SP-3298 sin actividad hace 4 h, asignado con 9 tickets en cola",
          "en": "Computed: 3 tickets under 2 h of margin | SP-3298 idle for 4 h, assignee has 9 tickets queued"
        },
        "duracionMs": 2400
      },
      {
        "n": 4,
        "actor": "llm",
        "titulo": {
          "es": "Predice el riesgo",
          "en": "Predicts the risk"
        },
        "detalle": {
          "es": "El modelo pondera historial del agente, complejidad del caso y hora del día para estimar la probabilidad de incumplimiento.",
          "en": "The model weighs agent history, case complexity and time of day to estimate breach probability."
        },
        "log": {
          "es": "Azure OpenAI → SP-3298: prob. incumplimiento 78% | causa probable: sobrecarga del asignado | acción sugerida: reasignar",
          "en": "Azure OpenAI → SP-3298: breach probability 78% | likely cause: assignee overload | suggested action: reassign"
        },
        "duracionMs": 3400
      },
      {
        "n": 5,
        "actor": "decision",
        "titulo": {
          "es": "¿Riesgo alto?",
          "en": "High risk?"
        },
        "detalle": {
          "es": "Sobre el umbral de riesgo actúa de inmediato; bajo el umbral solo registra la tendencia.",
          "en": "Above the risk threshold it acts immediately; below, it just records the trend."
        },
        "log": {
          "es": "Decisión: SP-3298 (78%) y SP-3301 (64%) sobre umbral 60% → INTERVENIR | 69 tickets sin acción",
          "en": "Decision: SP-3298 (78%) and SP-3301 (64%) above 60% threshold → INTERVENE | 69 tickets no action"
        },
        "duracionMs": 2400
      },
      {
        "n": 6,
        "actor": "sistema",
        "titulo": {
          "es": "Reasigna el ticket",
          "en": "Reassigns the ticket"
        },
        "detalle": {
          "es": "Mueve el ticket en riesgo al agente disponible con mejor historial en ese tipo de caso.",
          "en": "Moves the at-risk ticket to the available agent with the best track record on that case type."
        },
        "log": {
          "es": "Reasignación → SP-3298: de K. Flores (9 en cola) a D. Ortiz (2 en cola, especialista facturación) | prioridad ↑",
          "en": "Reassignment → SP-3298: from K. Flores (9 queued) to D. Ortiz (2 queued, billing specialist) | priority ↑"
        },
        "duracionMs": 2200
      },
      {
        "n": 7,
        "actor": "humano",
        "titulo": {
          "es": "Alerta al supervisor",
          "en": "Alerts the supervisor"
        },
        "detalle": {
          "es": "El supervisor recibe en Teams el detalle de la intervención y el panorama de riesgo de la próxima hora.",
          "en": "The supervisor gets the intervention details in Teams plus the risk outlook for the next hour."
        },
        "log": {
          "es": "Teams → @Sup.Soporte: \"SP-3298 reasignado (riesgo 78%) · 1 ticket más en observación · dashboard Power BI actualizado\"",
          "en": "Teams → @Support.Sup: \"SP-3298 reassigned (78% risk) · 1 more ticket under watch · Power BI dashboard updated\""
        },
        "duracionMs": 2400
      },
      {
        "n": 8,
        "actor": "resultado",
        "titulo": {
          "es": "SLA protegido a tiempo",
          "en": "SLA protected in time"
        },
        "detalle": {
          "es": "El incumplimiento se evitó antes de ocurrir y quedó evidencia de la gestión preventiva.",
          "en": "The breach was prevented before it happened, with evidence of the preventive action on record."
        },
        "log": {
          "es": "✔ Barrido #94: 2 intervenciones, 0 SLA vencidos hoy | cumplimiento del mes: en verde en Power BI",
          "en": "✔ Sweep #94: 2 interventions, 0 SLAs breached today | monthly compliance: green in Power BI"
        },
        "duracionMs": 2200
      }
    ]
  },
  {
    "id": "a09",
    "slug": "insight",
    "nombre": "Insight",
    "rol": {
      "es": "Agente de resumen ejecutivo diario",
      "en": "Daily executive brief agent"
    },
    "tagline": {
      "es": "Los directores no necesitan más dashboards: necesitan saber qué cambió y qué hacer. Insight se los dice cada mañana.",
      "en": "Executives do not need more dashboards: they need to know what changed and what to do. Insight tells them every morning."
    },
    "categoria": "datos",
    "disparador": {
      "es": "Programado todos los días a las 6:30 AM, antes de iniciar operaciones",
      "en": "Scheduled every day at 6:30 AM, before operations start"
    },
    "metricaDestacada": {
      "es": "Brief ejecutivo en la bandeja a las 6:45 AM, todos los días hábiles",
      "en": "Executive brief in the inbox at 6:45 AM, every business day"
    },
    "integraciones": [
      "SQL Server",
      "Power BI",
      "Azure OpenAI",
      "Teams",
      "Outlook"
    ],
    "resultado": {
      "es": "Resumen narrado con los KPIs del día anterior, desviaciones relevantes y alertas, entregado en Teams y correo",
      "en": "Narrated summary of yesterday's KPIs, relevant deviations and alerts, delivered to Teams and email"
    },
    "metricas": [
      {
        "es": "Lectura de 2 minutos en lugar de 30 minutos navegando dashboards",
        "en": "A 2-minute read instead of 30 minutes navigating dashboards"
      },
      {
        "es": "Desviaciones contra meta destacadas automáticamente, no descubiertas tarde",
        "en": "Deviations vs target surfaced automatically, not discovered late"
      },
      {
        "es": "Mismo formato y hora cada día: hábito directivo garantizado",
        "en": "Same format and time daily: an executive habit, guaranteed"
      }
    ],
    "industrias": [
      {
        "es": "Retail y consumo",
        "en": "Retail and consumer goods"
      },
      {
        "es": "Manufactura",
        "en": "Manufacturing"
      },
      {
        "es": "Grupos corporativos multi-unidad",
        "en": "Multi-unit corporate groups"
      }
    ],
    "pasos": [
      {
        "n": 1,
        "actor": "trigger",
        "titulo": {
          "es": "Despierta a las 6:30",
          "en": "Wakes at 6:30"
        },
        "detalle": {
          "es": "El programador dispara el brief diario antes de que llegue el equipo directivo.",
          "en": "The scheduler fires the daily brief before the leadership team arrives."
        },
        "log": {
          "es": "[06:30] Ejecución programada · brief_ejecutivo_diario · alcance: ventas, operaciones, finanzas · fecha: 02-jul",
          "en": "[06:30] Scheduled run · daily_executive_brief · scope: sales, operations, finance · date: Jul 02"
        },
        "duracionMs": 2000
      },
      {
        "n": 2,
        "actor": "herramienta",
        "herramienta": "SQL Server",
        "titulo": {
          "es": "Consulta los KPIs",
          "en": "Queries the KPIs"
        },
        "detalle": {
          "es": "Ejecuta las consultas de ventas, cobros, inventario y producción del día anterior.",
          "en": "Runs yesterday's sales, collections, inventory and production queries."
        },
        "log": {
          "es": "SQL Server → ventas 02-jul: $84,210 (18 pedidos) | cobros: $61,930 | quiebres de stock: 3 SKUs",
          "en": "SQL Server → Jul-02 sales: $84,210 (18 orders) | collections: $61,930 | stockouts: 3 SKUs"
        },
        "duracionMs": 2400
      },
      {
        "n": 3,
        "actor": "herramienta",
        "herramienta": "Power BI",
        "titulo": {
          "es": "Trae metas y tendencias",
          "en": "Pulls targets and trends"
        },
        "detalle": {
          "es": "Consulta el modelo de Power BI para comparar contra meta mensual, mismo día del mes anterior y tendencia.",
          "en": "Queries the Power BI model to compare against monthly target, same day last month and trend."
        },
        "log": {
          "es": "Power BI → avance de meta mensual: 96.2% al día 2 | ventas vs mes anterior: +7.4% | margen: 31.8% (meta 33%)",
          "en": "Power BI → monthly target pace: 96.2% at day 2 | sales vs last month: +7.4% | margin: 31.8% (target 33%)"
        },
        "duracionMs": 2400
      },
      {
        "n": 4,
        "actor": "agente",
        "titulo": {
          "es": "Detecta lo relevante",
          "en": "Flags what matters"
        },
        "detalle": {
          "es": "Filtra el ruido: identifica solo las desviaciones que superan umbrales definidos con la dirección.",
          "en": "Filters the noise: surfaces only deviations beyond thresholds agreed with leadership."
        },
        "log": {
          "es": "Relevancia: margen -1.2 pts vs meta (umbral 1.0) ⚠ | quiebre en SKU top-10 ⚠ | ventas dentro de rango ✓",
          "en": "Relevance: margin -1.2 pts vs target (threshold 1.0) ⚠ | stockout on a top-10 SKU ⚠ | sales within range ✓"
        },
        "duracionMs": 2600
      },
      {
        "n": 5,
        "actor": "llm",
        "titulo": {
          "es": "Narra el resumen",
          "en": "Writes the narrative"
        },
        "detalle": {
          "es": "El modelo convierte cifras en un relato ejecutivo: qué pasó, por qué importa y qué conviene revisar hoy.",
          "en": "The model turns figures into an executive narrative: what happened, why it matters, what to review today."
        },
        "log": {
          "es": "Azure OpenAI → brief: \"Ventas sólidas (+7.4%), pero el margen cede por mezcla de descuentos; atención al quiebre del SKU AC-204…\"",
          "en": "Azure OpenAI → brief: \"Solid sales (+7.4%), but margin slipping on discount mix; watch the AC-204 SKU stockout…\""
        },
        "duracionMs": 4000
      },
      {
        "n": 6,
        "actor": "decision",
        "titulo": {
          "es": "¿Hay alertas críticas?",
          "en": "Critical alerts?"
        },
        "detalle": {
          "es": "Si alguna desviación cruza el umbral crítico, el brief se marca urgente y se copia al responsable directo.",
          "en": "If any deviation crosses the critical threshold, the brief is flagged urgent and copied to the direct owner."
        },
        "log": {
          "es": "Decisión: 2 alertas moderadas, 0 críticas → envío estándar | responsable de compras copiado por el quiebre",
          "en": "Decision: 2 moderate alerts, 0 critical → standard delivery | purchasing owner copied on the stockout"
        },
        "duracionMs": 2200
      },
      {
        "n": 7,
        "actor": "herramienta",
        "herramienta": "Teams",
        "titulo": {
          "es": "Publica el brief",
          "en": "Publishes the brief"
        },
        "detalle": {
          "es": "Publica el resumen en el canal directivo de Teams y lo envía por correo con enlace al dashboard.",
          "en": "Posts the summary to the leadership Teams channel and emails it with a dashboard link."
        },
        "log": {
          "es": "Teams → canal #dirección: brief 02-jul publicado | Outlook → 5 directores | enlace: dashboard Power BI",
          "en": "Teams → #leadership channel: Jul-02 brief posted | Outlook → 5 executives | link: Power BI dashboard"
        },
        "duracionMs": 2000
      },
      {
        "n": 8,
        "actor": "resultado",
        "titulo": {
          "es": "Dirección informada a las 6:45",
          "en": "Leadership informed by 6:45"
        },
        "detalle": {
          "es": "La dirección empieza el día sabiendo qué cambió, qué vigilar y a quién preguntar, sin abrir un solo reporte.",
          "en": "Leadership starts the day knowing what changed, what to watch and who to ask, without opening a single report."
        },
        "log": {
          "es": "✔ Brief entregado 06:44 | 2 min de lectura | 2 alertas accionables | racha: 214 días hábiles consecutivos",
          "en": "✔ Brief delivered 06:44 | 2-minute read | 2 actionable alerts | streak: 214 consecutive business days"
        },
        "duracionMs": 2200
      }
    ]
  },
  {
    "id": "a10",
    "slug": "pulse",
    "nombre": "Pulse",
    "rol": {
      "es": "Agente guardián de calidad de datos",
      "en": "Data quality watchdog agent"
    },
    "tagline": {
      "es": "Cada decisión vale lo que valen sus datos. Pulse encuentra los duplicados y errores antes de que lleguen a un reporte.",
      "en": "Every decision is only as good as its data. Pulse catches duplicates and errors before they reach a report."
    },
    "categoria": "datos",
    "disparador": {
      "es": "Escaneo nocturno programado sobre las tablas críticas del negocio",
      "en": "Scheduled nightly scan over business-critical tables"
    },
    "metricaDestacada": {
      "es": "Tablas críticas auditadas cada noche, hallazgos antes de las 7 AM",
      "en": "Critical tables audited nightly, findings before 7 AM"
    },
    "integraciones": [
      "SQL Server",
      "Dataverse",
      "Azure OpenAI",
      "Teams",
      "Excel"
    ],
    "resultado": {
      "es": "Errores de bajo riesgo corregidos automáticamente y casos ambiguos documentados para el responsable de datos",
      "en": "Low-risk errors auto-fixed and ambiguous cases documented for the data steward"
    },
    "metricas": [
      {
        "es": "Detección de duplicados, nulos y valores fuera de rango en clientes, productos y precios",
        "en": "Detects duplicates, nulls and out-of-range values across customers, products and pricing"
      },
      {
        "es": "Correcciones automáticas solo en reglas seguras y reversibles, con bitácora completa",
        "en": "Auto-fixes only on safe, reversible rules, with a full audit log"
      },
      {
        "es": "Reportes y dashboards alimentados con datos verificados cada mañana",
        "en": "Reports and dashboards fed with verified data every morning"
      }
    ],
    "industrias": [
      {
        "es": "Retail y distribución",
        "en": "Retail and distribution"
      },
      {
        "es": "Banca y seguros",
        "en": "Banking and insurance"
      },
      {
        "es": "Corporativos con ERP y CRM conviviendo",
        "en": "Corporates running ERP and CRM side by side"
      }
    ],
    "pasos": [
      {
        "n": 1,
        "actor": "trigger",
        "titulo": {
          "es": "Escaneo nocturno",
          "en": "Nightly scan"
        },
        "detalle": {
          "es": "A las 2:00 AM inicia la auditoría de las tablas críticas definidas con el negocio.",
          "en": "At 2:00 AM the audit of the business-defined critical tables begins."
        },
        "log": {
          "es": "[02:00] Escaneo nocturno · alcance: clientes, productos, precios, pedidos · 1.2M filas en total",
          "en": "[02:00] Nightly scan · scope: customers, products, pricing, orders · 1.2M rows total"
        },
        "duracionMs": 2000
      },
      {
        "n": 2,
        "actor": "herramienta",
        "herramienta": "SQL Server",
        "titulo": {
          "es": "Perfila las tablas",
          "en": "Profiles the tables"
        },
        "detalle": {
          "es": "Ejecuta las reglas de calidad: unicidad, nulos, formatos, rangos y consistencia entre tablas.",
          "en": "Runs the quality rules: uniqueness, nulls, formats, ranges and cross-table consistency."
        },
        "log": {
          "es": "SQL Server → clientes: 24,861 filas | NIT nulo: 37 | correo inválido: 112 | precios ≤ 0: 4",
          "en": "SQL Server → customers: 24,861 rows | null tax ID: 37 | invalid email: 112 | prices ≤ 0: 4"
        },
        "duracionMs": 2600
      },
      {
        "n": 3,
        "actor": "herramienta",
        "herramienta": "Dataverse",
        "titulo": {
          "es": "Cruza los catálogos",
          "en": "Cross-checks the catalogs"
        },
        "detalle": {
          "es": "Compara los maestros de Dataverse contra SQL para detectar registros huérfanos o desincronizados.",
          "en": "Compares Dataverse masters against SQL to find orphaned or out-of-sync records."
        },
        "log": {
          "es": "Dataverse ↔ SQL → 23 clientes en CRM sin código de ERP | 6 productos con descripción distinta entre sistemas",
          "en": "Dataverse ↔ SQL → 23 CRM customers missing ERP code | 6 products with mismatched descriptions across systems"
        },
        "duracionMs": 2200
      },
      {
        "n": 4,
        "actor": "agente",
        "titulo": {
          "es": "Detecta duplicados",
          "en": "Detects duplicates"
        },
        "detalle": {
          "es": "Aplica coincidencia por nombre, NIT y teléfono para encontrar clientes registrados más de una vez.",
          "en": "Applies matching on name, tax ID and phone to find customers registered more than once."
        },
        "log": {
          "es": "Duplicados: 14 pares probables | ej: \"Constructora Del Valle S.A.\" ↔ \"CONSTRUCTORA DEL VALLE, SA DE CV\" (similitud 0.96)",
          "en": "Duplicates: 14 probable pairs | e.g.: \"Constructora Del Valle S.A.\" ↔ \"CONSTRUCTORA DEL VALLE, SA DE CV\" (similarity 0.96)"
        },
        "duracionMs": 2600
      },
      {
        "n": 5,
        "actor": "llm",
        "titulo": {
          "es": "Clasifica la severidad",
          "en": "Classifies the severity"
        },
        "detalle": {
          "es": "El modelo evalúa cada hallazgo, estima la causa probable y decide si la corrección es segura o requiere criterio.",
          "en": "The model reviews each finding, estimates the likely cause and decides whether a fix is safe or needs judgment."
        },
        "log": {
          "es": "Azure OpenAI → 190 hallazgos: 141 corrección segura (formatos, mayúsculas, espacios) | 49 requieren criterio humano",
          "en": "Azure OpenAI → 190 findings: 141 safe to fix (formats, casing, whitespace) | 49 need human judgment"
        },
        "duracionMs": 3400
      },
      {
        "n": 6,
        "actor": "decision",
        "titulo": {
          "es": "¿Corregir o marcar?",
          "en": "Fix or flag?"
        },
        "detalle": {
          "es": "Solo las reglas reversibles y de bajo riesgo se corrigen solas; fusiones y borrados jamás sin humano.",
          "en": "Only reversible, low-risk rules are auto-fixed; merges and deletions never happen without a human."
        },
        "log": {
          "es": "Decisión: 141 → AUTOCORREGIR con bitácora | 49 → MARCAR para data steward (14 fusiones, 35 revisiones)",
          "en": "Decision: 141 → AUTO-FIX with audit log | 49 → FLAG for data steward (14 merges, 35 reviews)"
        },
        "duracionMs": 2600
      },
      {
        "n": 7,
        "actor": "sistema",
        "titulo": {
          "es": "Aplica correcciones seguras",
          "en": "Applies safe fixes"
        },
        "detalle": {
          "es": "Ejecuta las correcciones de bajo riesgo y registra cada cambio con valor anterior y posterior.",
          "en": "Executes the low-risk fixes and logs every change with before and after values."
        },
        "log": {
          "es": "Autocorrección: 141 cambios aplicados | ej: tel \"7712 3344\" → \"+503 7712-3344\" | bitácora: dq_log_20260703",
          "en": "Auto-fix: 141 changes applied | e.g.: phone \"7712 3344\" → \"+503 7712-3344\" | audit log: dq_log_20260703"
        },
        "duracionMs": 2200
      },
      {
        "n": 8,
        "actor": "humano",
        "titulo": {
          "es": "Reporta al data steward",
          "en": "Reports to the data steward"
        },
        "detalle": {
          "es": "El responsable de datos recibe en Teams el Excel con los 49 casos ambiguos priorizados y sugerencia por caso.",
          "en": "The data steward gets a Teams message with the Excel of 49 ambiguous cases, prioritized and with per-case suggestions."
        },
        "log": {
          "es": "Teams → @P.Linares: \"Calidad de datos 03-jul: 141 autocorregidos, 49 por revisar (Excel adjunto, 14 fusiones sugeridas)\"",
          "en": "Teams → @P.Linares: \"Data quality Jul-03: 141 auto-fixed, 49 to review (Excel attached, 14 suggested merges)\""
        },
        "duracionMs": 2400
      },
      {
        "n": 9,
        "actor": "resultado",
        "titulo": {
          "es": "Datos confiables al amanecer",
          "en": "Trustworthy data by sunrise"
        },
        "detalle": {
          "es": "Los reportes de la mañana corren sobre datos auditados, y la deuda de calidad queda visible y priorizada.",
          "en": "Morning reports run on audited data, and the remaining quality debt is visible and prioritized."
        },
        "log": {
          "es": "✔ 1.2M filas auditadas | 141 corregidas, 49 en revisión | índice de calidad: 99.2% (+0.3 vs ayer)",
          "en": "✔ 1.2M rows audited | 141 fixed, 49 under review | quality score: 99.2% (+0.3 vs yesterday)"
        },
        "duracionMs": 2000
      }
    ]
  },
  {
    "id": "a11",
    "slug": "viral",
    "nombre": "Viral",
    "rol": {
      "es": "Agente de reutilización de contenido",
      "en": "Content repurposing agent"
    },
    "tagline": {
      "es": "Un blog o video se convierte en una semana de publicaciones, sin contratar a nadie más.",
      "en": "One blog post or video becomes a week of social content, without hiring anyone else."
    },
    "categoria": "marketing",
    "disparador": {
      "es": "Nuevo artículo publicado en el blog o video subido a la biblioteca de SharePoint de marketing",
      "en": "New article published on the blog or video uploaded to the marketing SharePoint library"
    },
    "metricaDestacada": {
      "es": "De 1 pieza a 6+ publicaciones por canal en menos de 10 minutos",
      "en": "From 1 asset to 6+ channel-ready posts in under 10 minutes"
    },
    "integraciones": [
      "SharePoint",
      "Azure OpenAI",
      "Teams",
      "Power Automate"
    ],
    "resultado": {
      "es": "Publicaciones adaptadas por canal, aprobadas y programadas en el calendario de contenido",
      "en": "Channel-adapted posts, approved and scheduled on the content calendar"
    },
    "metricas": [
      {
        "es": "Reducción típica de 3-4 horas de redacción por pieza original",
        "en": "Typical saving of 3-4 writing hours per source asset"
      },
      {
        "es": "Calendario de contenido cubierto de forma consistente semana a semana",
        "en": "Content calendar consistently covered week over week"
      },
      {
        "es": "Tono de marca validado antes de cada aprobación humana",
        "en": "Brand voice validated before every human approval"
      }
    ],
    "industrias": [
      {
        "es": "Agencias y servicios profesionales",
        "en": "Agencies and professional services"
      },
      {
        "es": "Retail y e-commerce",
        "en": "Retail and e-commerce"
      },
      {
        "es": "Educación y academias",
        "en": "Education and academies"
      }
    ],
    "pasos": [
      {
        "n": 1,
        "actor": "trigger",
        "titulo": {
          "es": "Detecta contenido nuevo",
          "en": "Detects new content"
        },
        "detalle": {
          "es": "Un artículo nuevo del blog o un video subido a SharePoint activa el flujo.",
          "en": "A new blog article or a video uploaded to SharePoint starts the flow."
        },
        "log": {
          "es": "Nuevo asset: \"Guía 2026 de facturación electrónica\" — blog/guia-facturacion-2026 — 1,840 palabras",
          "en": "New asset: \"2026 e-invoicing guide\" — blog/e-invoicing-guide-2026 — 1,840 words"
        },
        "duracionMs": 2000
      },
      {
        "n": 2,
        "actor": "agente",
        "titulo": {
          "es": "Extrae el contenido",
          "en": "Extracts the content"
        },
        "detalle": {
          "es": "Obtiene el texto completo del artículo o la transcripción del video y limpia el formato.",
          "en": "Pulls the full article text or the video transcript and cleans the formatting."
        },
        "log": {
          "es": "Texto extraído: 1,840 palabras, 5 secciones, 2 tablas — transcripción no requerida",
          "en": "Text extracted: 1,840 words, 5 sections, 2 tables — no transcript needed"
        },
        "duracionMs": 2200
      },
      {
        "n": 3,
        "actor": "llm",
        "titulo": {
          "es": "Identifica ángulos clave",
          "en": "Identifies key angles"
        },
        "detalle": {
          "es": "El modelo detecta las 3-4 ideas con mayor potencial de conversación por audiencia.",
          "en": "The model finds the 3-4 ideas with the highest conversation potential per audience."
        },
        "log": {
          "es": "Ángulos: (1) multas por facturar mal (2) checklist de cumplimiento (3) caso pyme ferretera — score 0.91",
          "en": "Angles: (1) fines for bad invoicing (2) compliance checklist (3) hardware-store SMB case — score 0.91"
        },
        "duracionMs": 3400
      },
      {
        "n": 4,
        "actor": "llm",
        "titulo": {
          "es": "Redacta por canal",
          "en": "Drafts per channel"
        },
        "detalle": {
          "es": "Genera versiones nativas: hilo para la red profesional, carrusel visual para redes sociales, mensaje corto para WhatsApp.",
          "en": "Generates native versions: professional-network thread, visual carousel for social media, short WhatsApp broadcast."
        },
        "log": {
          "es": "6 borradores listos: red profesional x2, carrusel x1, WhatsApp x1, posts cortos x2 — hashtags incluidos",
          "en": "6 drafts ready: professional network x2, carousel x1, WhatsApp x1, short posts x2 — hashtags included"
        },
        "duracionMs": 3800
      },
      {
        "n": 5,
        "actor": "herramienta",
        "herramienta": "SharePoint",
        "titulo": {
          "es": "Guarda los borradores",
          "en": "Saves the drafts"
        },
        "detalle": {
          "es": "Cada versión se archiva en la biblioteca de contenido con metadatos de canal y campaña.",
          "en": "Every version is filed in the content library with channel and campaign metadata."
        },
        "log": {
          "es": "SharePoint → 6 archivos creados en /Contenido/2026-S27/ — etiquetas: canal, campaña, fuente",
          "en": "SharePoint → 6 files created in /Content/2026-W27/ — tags: channel, campaign, source"
        },
        "duracionMs": 2200
      },
      {
        "n": 6,
        "actor": "decision",
        "titulo": {
          "es": "Valida tono de marca",
          "en": "Validates brand voice"
        },
        "detalle": {
          "es": "Contrasta cada borrador contra la guía de estilo; lo que no pasa se regenera automáticamente.",
          "en": "Checks every draft against the style guide; anything that fails is regenerated automatically."
        },
        "log": {
          "es": "5/6 aprobados por guía de estilo — 1 regenerado (tono demasiado promocional)",
          "en": "5/6 pass the style guide — 1 regenerated (tone too promotional)"
        },
        "duracionMs": 2600
      },
      {
        "n": 7,
        "actor": "humano",
        "herramienta": "Teams",
        "titulo": {
          "es": "Aprobación en Teams",
          "en": "Approval in Teams"
        },
        "detalle": {
          "es": "La responsable de marketing recibe una tarjeta con los 6 posts y aprueba, edita o descarta cada uno.",
          "en": "The marketing lead receives a card with all 6 posts and approves, edits or discards each one."
        },
        "log": {
          "es": "Aprobación de L. Campos: 5 aprobados, 1 editado (CTA de WhatsApp) — 4 min de revisión",
          "en": "Approval by L. Campos: 5 approved, 1 edited (WhatsApp CTA) — 4 min review"
        },
        "duracionMs": 3000
      },
      {
        "n": 8,
        "actor": "herramienta",
        "herramienta": "Power Automate",
        "titulo": {
          "es": "Programa la publicación",
          "en": "Schedules publishing"
        },
        "detalle": {
          "es": "Distribuye los posts aprobados en el calendario de la semana según la mejor hora por canal.",
          "en": "Spreads approved posts across the weekly calendar at the best time per channel."
        },
        "log": {
          "es": "Power Automate → 6 publicaciones programadas: lun 9:00 red profesional, mar 12:30 carrusel, jue 8:15 WhatsApp...",
          "en": "Power Automate → 6 posts scheduled: Mon 9:00 professional network, Tue 12:30 carousel, Thu 8:15 WhatsApp..."
        },
        "duracionMs": 2400
      },
      {
        "n": 9,
        "actor": "resultado",
        "titulo": {
          "es": "Semana de contenido lista",
          "en": "Week of content ready"
        },
        "detalle": {
          "es": "Una sola pieza original quedó convertida en una semana completa de presencia multicanal.",
          "en": "A single source asset became a full week of multichannel presence."
        },
        "log": {
          "es": "✔ Ciclo completo: 1 blog → 6 posts aprobados y programados — tiempo total 9 min 40 s",
          "en": "✔ Full cycle: 1 blog → 6 posts approved and scheduled — total time 9 min 40 s"
        },
        "duracionMs": 1800
      }
    ]
  },
  {
    "id": "a12",
    "slug": "echo",
    "nombre": "Echo",
    "rol": {
      "es": "Agente de gestión de reseñas y reputación",
      "en": "Review and reputation management agent"
    },
    "tagline": {
      "es": "Ninguna reseña de 1 estrella se queda sin respuesta más de una hora.",
      "en": "No 1-star review sits unanswered for more than an hour."
    },
    "categoria": "marketing",
    "disparador": {
      "es": "Nueva reseña detectada en portales públicos de reseñas mediante alertas que llegan al buzón de Gmail",
      "en": "New review detected on public review portals via alerts arriving to the Gmail inbox"
    },
    "metricaDestacada": {
      "es": "Respuesta propuesta en menos de 15 minutos, 24/7",
      "en": "Draft reply ready in under 15 minutes, 24/7"
    },
    "integraciones": [
      "Gmail",
      "Azure OpenAI",
      "Teams",
      "Dataverse"
    ],
    "resultado": {
      "es": "Reseña respondida con tono de marca y caso registrado con sentimiento, tema y sucursal",
      "en": "Review answered in brand voice and case logged with sentiment, topic and branch"
    },
    "metricas": [
      {
        "es": "Cobertura esperada del 100% de reseñas, positivas y negativas",
        "en": "Expected coverage of 100% of reviews, positive and negative"
      },
      {
        "es": "Escalamiento inmediato de reseñas de 1-2 estrellas al responsable",
        "en": "Immediate escalation of 1-2 star reviews to the owner"
      },
      {
        "es": "Historial de reputación por sucursal listo para análisis mensual",
        "en": "Per-branch reputation history ready for monthly analysis"
      }
    ],
    "industrias": [
      {
        "es": "Restaurantes y hotelería",
        "en": "Restaurants and hospitality"
      },
      {
        "es": "Clínicas y salud",
        "en": "Clinics and healthcare"
      },
      {
        "es": "Retail multisucursal",
        "en": "Multi-branch retail"
      }
    ],
    "pasos": [
      {
        "n": 1,
        "actor": "trigger",
        "titulo": {
          "es": "Detecta reseña nueva",
          "en": "Detects a new review"
        },
        "detalle": {
          "es": "Una alerta de reseña nueva llega al buzón monitoreado y dispara el flujo al instante.",
          "en": "A new-review alert lands in the monitored inbox and fires the flow instantly."
        },
        "log": {
          "es": "Reseña nueva: portal de reseñas — ★★ (2/5) — \"Hotel Miraflores, sucursal Centro\" — hace 6 min",
          "en": "New review: review portal — ★★ (2/5) — \"Hotel Miraflores, Centro branch\" — 6 min ago"
        },
        "duracionMs": 2000
      },
      {
        "n": 2,
        "actor": "agente",
        "titulo": {
          "es": "Extrae los datos",
          "en": "Extracts the data"
        },
        "detalle": {
          "es": "Separa calificación, texto, autor, sucursal y fecha, y descarta duplicados ya procesados.",
          "en": "Splits rating, text, author, branch and date, and discards already-processed duplicates."
        },
        "log": {
          "es": "Autor: R. Mejía — 2★ — texto: \"esperamos 40 minutos el check-in y nadie avisó...\" — sucursal: Centro",
          "en": "Author: R. Mejía — 2★ — text: \"we waited 40 minutes for check-in and nobody told us...\" — branch: Centro"
        },
        "duracionMs": 2200
      },
      {
        "n": 3,
        "actor": "llm",
        "titulo": {
          "es": "Analiza sentimiento y tema",
          "en": "Analyzes sentiment and topic"
        },
        "detalle": {
          "es": "Clasifica el sentimiento, identifica el tema raíz y detecta si hay riesgo reputacional.",
          "en": "Classifies sentiment, identifies the root topic and flags any reputational risk."
        },
        "log": {
          "es": "Sentimiento: negativo (0.87) — tema: tiempos de espera en recepción — riesgo: medio",
          "en": "Sentiment: negative (0.87) — topic: front-desk wait times — risk: medium"
        },
        "duracionMs": 3200
      },
      {
        "n": 4,
        "actor": "decision",
        "titulo": {
          "es": "Enruta por severidad",
          "en": "Routes by severity"
        },
        "detalle": {
          "es": "Las reseñas de 1-2 estrellas van a cola prioritaria con alerta; las positivas siguen flujo estándar.",
          "en": "1-2 star reviews go to a priority queue with an alert; positive ones follow the standard path."
        },
        "log": {
          "es": "2★ → cola prioritaria — SLA de respuesta: 60 min — gerente de sucursal notificado",
          "en": "2★ → priority queue — reply SLA: 60 min — branch manager notified"
        },
        "duracionMs": 2600
      },
      {
        "n": 5,
        "actor": "llm",
        "titulo": {
          "es": "Redacta la respuesta",
          "en": "Drafts the reply"
        },
        "detalle": {
          "es": "Genera una respuesta empática con tono de marca, sin promesas que la política no permita.",
          "en": "Writes an empathetic on-brand reply, without promises the policy does not allow."
        },
        "log": {
          "es": "Borrador listo (62 palabras): disculpa + causa + invitación a contacto directo — sin compensación ofrecida",
          "en": "Draft ready (62 words): apology + cause + direct-contact invitation — no compensation offered"
        },
        "duracionMs": 3600
      },
      {
        "n": 6,
        "actor": "humano",
        "herramienta": "Teams",
        "titulo": {
          "es": "Aprueba o edita",
          "en": "Approves or edits"
        },
        "detalle": {
          "es": "El gerente recibe la reseña y el borrador en Teams; puede aprobar, editar o responder él mismo.",
          "en": "The manager gets the review and the draft in Teams; he can approve, edit or reply himself."
        },
        "log": {
          "es": "G. Portillo aprobó con 1 edición: agrega nombre del huésped — 3 min de revisión",
          "en": "G. Portillo approved with 1 edit: adds guest name — 3 min review"
        },
        "duracionMs": 3000
      },
      {
        "n": 7,
        "actor": "herramienta",
        "herramienta": "Dataverse",
        "titulo": {
          "es": "Publica y registra",
          "en": "Posts and logs"
        },
        "detalle": {
          "es": "La respuesta aprobada se publica y el caso queda registrado con sentimiento, tema y sucursal.",
          "en": "The approved reply is posted and the case is logged with sentiment, topic and branch."
        },
        "log": {
          "es": "Dataverse → respuesta publicada — caso REV-0231 creado: tema \"espera en recepción\", sucursal Centro",
          "en": "Dataverse → reply posted — case REV-0231 created: topic \"front-desk wait\", Centro branch"
        },
        "duracionMs": 2400
      },
      {
        "n": 8,
        "actor": "resultado",
        "titulo": {
          "es": "Reputación bajo control",
          "en": "Reputation under control"
        },
        "detalle": {
          "es": "Reseña respondida dentro del SLA y patrón de quejas alimentando el reporte mensual.",
          "en": "Review answered within SLA and complaint patterns feeding the monthly report."
        },
        "log": {
          "es": "✔ Respondida en 38 min — tema recurrente #2 del mes: tiempos de espera (4 menciones)",
          "en": "✔ Answered in 38 min — recurring topic #2 this month: wait times (4 mentions)"
        },
        "duracionMs": 1800
      }
    ]
  },
  {
    "id": "a13",
    "slug": "talent",
    "nombre": "Talent",
    "rol": {
      "es": "Agente de filtrado de CV y preselección",
      "en": "CV screening and shortlisting agent"
    },
    "tagline": {
      "es": "De 200 CV a una shortlist justificada, antes de que RRHH termine el café.",
      "en": "From 200 CVs to a justified shortlist before HR finishes their coffee."
    },
    "categoria": "rrhh",
    "disparador": {
      "es": "Postulación recibida con CV adjunto en el buzón de reclutamiento de Outlook",
      "en": "Application received with CV attached in the Outlook recruiting inbox"
    },
    "metricaDestacada": {
      "es": "Cada CV evaluado contra rúbrica en menos de 2 minutos",
      "en": "Every CV scored against the rubric in under 2 minutes"
    },
    "integraciones": [
      "Outlook",
      "SharePoint",
      "Azure OpenAI",
      "Teams"
    ],
    "resultado": {
      "es": "Shortlist puntuada con justificación por candidato e invitaciones a entrevista enviadas",
      "en": "Scored shortlist with per-candidate rationale and interview invitations sent"
    },
    "metricas": [
      {
        "es": "Reducción típica del 70-80% del tiempo de filtrado manual",
        "en": "Typical 70-80% reduction in manual screening time"
      },
      {
        "es": "Criterios idénticos aplicados a todos los candidatos, sin sesgo de cansancio",
        "en": "Identical criteria applied to every candidate, no fatigue bias"
      },
      {
        "es": "Cada descarte queda documentado y auditable",
        "en": "Every rejection is documented and auditable"
      }
    ],
    "industrias": [
      {
        "es": "Corporativos con alta rotación",
        "en": "Corporates with high turnover"
      },
      {
        "es": "Call centers y BPO",
        "en": "Call centers and BPO"
      },
      {
        "es": "Retail y logística",
        "en": "Retail and logistics"
      }
    ],
    "pasos": [
      {
        "n": 1,
        "actor": "trigger",
        "titulo": {
          "es": "Recibe la postulación",
          "en": "Receives the application"
        },
        "detalle": {
          "es": "Un correo con CV adjunto llega al buzón de reclutamiento y activa el flujo de la vacante.",
          "en": "An email with a CV attached hits the recruiting inbox and starts the vacancy flow."
        },
        "log": {
          "es": "Postulación: \"Analista de Créditos\" — candidata: K. Ramírez — adjunto: CV_KRamirez.pdf (2 págs)",
          "en": "Application: \"Credit Analyst\" — candidate: K. Ramírez — attachment: CV_KRamirez.pdf (2 pages)"
        },
        "duracionMs": 1800
      },
      {
        "n": 2,
        "actor": "herramienta",
        "herramienta": "SharePoint",
        "titulo": {
          "es": "Archiva el expediente",
          "en": "Files the record"
        },
        "detalle": {
          "es": "Guarda el CV en la carpeta de la vacante con nomenclatura estándar y control de duplicados.",
          "en": "Stores the CV in the vacancy folder with standard naming and duplicate control."
        },
        "log": {
          "es": "SharePoint → guardado: /Vacantes/AC-2026-014/CV_KRamirez.pdf — candidato #147 de la vacante",
          "en": "SharePoint → saved: /Vacancies/AC-2026-014/CV_KRamirez.pdf — candidate #147 for this vacancy"
        },
        "duracionMs": 2000
      },
      {
        "n": 3,
        "actor": "agente",
        "titulo": {
          "es": "Extrae datos del CV",
          "en": "Extracts CV data"
        },
        "detalle": {
          "es": "Convierte el CV a datos estructurados: experiencia, estudios, herramientas, pretensión si aparece.",
          "en": "Turns the CV into structured data: experience, education, tools, salary expectation if present."
        },
        "log": {
          "es": "Extraído: 4 años en banca — Lic. Administración — Excel avanzado, SAP — inglés intermedio",
          "en": "Extracted: 4 years in banking — BBA — advanced Excel, SAP — intermediate English"
        },
        "duracionMs": 2600
      },
      {
        "n": 4,
        "actor": "llm",
        "titulo": {
          "es": "Puntúa contra rúbrica",
          "en": "Scores against rubric"
        },
        "detalle": {
          "es": "Evalúa al candidato contra la rúbrica de la vacante y redacta la justificación de cada criterio.",
          "en": "Scores the candidate against the vacancy rubric and writes the rationale per criterion."
        },
        "log": {
          "es": "Score: 82/100 — experiencia 28/30, técnico 22/25, formación 18/20 — brecha: sin experiencia en cobros",
          "en": "Score: 82/100 — experience 28/30, technical 22/25, education 18/20 — gap: no collections experience"
        },
        "duracionMs": 3800
      },
      {
        "n": 5,
        "actor": "decision",
        "titulo": {
          "es": "Aplica el umbral",
          "en": "Applies the threshold"
        },
        "detalle": {
          "es": "Los candidatos con score sobre el umbral pasan a shortlist; el resto recibe respuesta cordial.",
          "en": "Candidates above the threshold enter the shortlist; the rest get a courteous reply."
        },
        "log": {
          "es": "82 ≥ 70 → shortlist — posición actual: #3 de 8 preseleccionados",
          "en": "82 >= 70 → shortlist — current rank: #3 of 8 shortlisted"
        },
        "duracionMs": 2800
      },
      {
        "n": 6,
        "actor": "agente",
        "titulo": {
          "es": "Arma la shortlist",
          "en": "Builds the shortlist"
        },
        "detalle": {
          "es": "Genera la tabla comparativa de preseleccionados con scores, fortalezas y banderas por candidato.",
          "en": "Builds the comparison table of shortlisted candidates with scores, strengths and flags."
        },
        "log": {
          "es": "Shortlist AC-2026-014: 8 candidatos, score promedio 79 — 2 con bandera de pretensión salarial alta",
          "en": "Shortlist AC-2026-014: 8 candidates, average score 79 — 2 flagged for high salary expectation"
        },
        "duracionMs": 2400
      },
      {
        "n": 7,
        "actor": "humano",
        "herramienta": "Teams",
        "titulo": {
          "es": "RRHH valida",
          "en": "HR validates"
        },
        "detalle": {
          "es": "La reclutadora revisa la shortlist en Teams, ajusta el orden y confirma a quiénes entrevistar.",
          "en": "The recruiter reviews the shortlist in Teams, adjusts the order and confirms who to interview."
        },
        "log": {
          "es": "V. Escobar confirmó 5 de 8 para entrevista — 1 movido arriba por experiencia en SAP",
          "en": "V. Escobar confirmed 5 of 8 for interview — 1 moved up for SAP experience"
        },
        "duracionMs": 3200
      },
      {
        "n": 8,
        "actor": "herramienta",
        "herramienta": "Outlook",
        "titulo": {
          "es": "Envía invitaciones",
          "en": "Sends invitations"
        },
        "detalle": {
          "es": "Cada confirmado recibe correo con propuesta de horarios de entrevista según agenda del panel.",
          "en": "Each confirmed candidate gets an email with interview slots based on the panel calendar."
        },
        "log": {
          "es": "Outlook → 5 invitaciones enviadas con 3 horarios cada una — recordatorio automático en 48 h",
          "en": "Outlook → 5 invitations sent with 3 slots each — automatic reminder in 48 h"
        },
        "duracionMs": 2400
      },
      {
        "n": 9,
        "actor": "resultado",
        "titulo": {
          "es": "Shortlist entregada",
          "en": "Shortlist delivered"
        },
        "detalle": {
          "es": "Vacante con preselección justificada, expedientes ordenados y entrevistas en agenda.",
          "en": "Vacancy with a justified shortlist, tidy records and interviews on the calendar."
        },
        "log": {
          "es": "✔ 147 CV procesados → 8 preseleccionados → 5 entrevistas agendadas — 0 CV sin evaluar",
          "en": "✔ 147 CVs processed → 8 shortlisted → 5 interviews booked — 0 CVs unscored"
        },
        "duracionMs": 1800
      }
    ]
  },
  {
    "id": "a14",
    "slug": "onboard",
    "nombre": "Onboard",
    "rol": {
      "es": "Agente orquestador de onboarding de empleados",
      "en": "Employee onboarding orchestrator agent"
    },
    "tagline": {
      "es": "El nuevo colaborador llega el lunes con cuentas, accesos, equipo y agenda listos.",
      "en": "The new hire shows up Monday with accounts, access, kit and agenda ready."
    },
    "categoria": "rrhh",
    "disparador": {
      "es": "Nueva contratación registrada en Dataverse por Recursos Humanos con fecha de ingreso confirmada",
      "en": "New hire registered in Dataverse by HR with a confirmed start date"
    },
    "metricaDestacada": {
      "es": "Checklist de ingreso completado antes del día 1, sin correos sueltos",
      "en": "Onboarding checklist completed before day 1, no loose emails"
    },
    "integraciones": [
      "Dataverse",
      "Power Automate",
      "SharePoint",
      "Outlook",
      "Teams"
    ],
    "resultado": {
      "es": "Colaborador con cuentas, accesos, kit documental y agenda de primer día, y manager notificado",
      "en": "Employee with accounts, access, document kit and day-one agenda, and manager notified"
    },
    "metricas": [
      {
        "es": "Eliminación típica de 15-20 correos de coordinación por ingreso",
        "en": "Typically removes 15-20 coordination emails per hire"
      },
      {
        "es": "Cero accesos olvidados: cada pendiente queda visible y con responsable",
        "en": "Zero forgotten access: every open item is visible and owned"
      },
      {
        "es": "Experiencia de día 1 consistente para todos los ingresos",
        "en": "Consistent day-one experience for every hire"
      }
    ],
    "industrias": [
      {
        "es": "Corporativos y financieras",
        "en": "Corporates and financial services"
      },
      {
        "es": "Tecnología y BPO",
        "en": "Technology and BPO"
      },
      {
        "es": "Manufactura",
        "en": "Manufacturing"
      }
    ],
    "pasos": [
      {
        "n": 1,
        "actor": "trigger",
        "titulo": {
          "es": "Detecta el nuevo ingreso",
          "en": "Detects the new hire"
        },
        "detalle": {
          "es": "RRHH registra la contratación en Dataverse y el flujo arranca con los datos del puesto.",
          "en": "HR registers the hire in Dataverse and the flow starts with the role data."
        },
        "log": {
          "es": "Ingreso: D. Argueta — Analista de Operaciones — inicia lun 13/07 — reporta a M. Quintanilla",
          "en": "Hire: D. Argueta — Operations Analyst — starts Mon 07/13 — reports to M. Quintanilla"
        },
        "duracionMs": 1800
      },
      {
        "n": 2,
        "actor": "agente",
        "titulo": {
          "es": "Arma el checklist",
          "en": "Builds the checklist"
        },
        "detalle": {
          "es": "Genera la lista de tareas según rol, departamento y sede: cuentas, licencias, equipo, gafete.",
          "en": "Generates the task list by role, department and site: accounts, licenses, hardware, badge."
        },
        "log": {
          "es": "Checklist de 14 tareas: cuenta M365, acceso ERP (solo lectura), laptop, gafete, curso de inducción",
          "en": "14-task checklist: M365 account, ERP access (read-only), laptop, badge, induction course"
        },
        "duracionMs": 2400
      },
      {
        "n": 3,
        "actor": "herramienta",
        "herramienta": "Power Automate",
        "titulo": {
          "es": "Solicita cuentas y accesos",
          "en": "Requests accounts and access"
        },
        "detalle": {
          "es": "Abre los tickets a TI para la cuenta, las licencias y los accesos por sistema, con fecha límite.",
          "en": "Opens the IT tickets for the account, licenses and per-system access, each with a due date."
        },
        "log": {
          "es": "Power Automate → 4 tickets creados a TI — vencimiento: jue 10/07 — prioridad alta por fecha de ingreso",
          "en": "Power Automate → 4 IT tickets created — due: Thu 07/10 — high priority due to start date"
        },
        "duracionMs": 2800
      },
      {
        "n": 4,
        "actor": "herramienta",
        "herramienta": "SharePoint",
        "titulo": {
          "es": "Prepara el kit documental",
          "en": "Prepares the document kit"
        },
        "detalle": {
          "es": "Asigna permisos al sitio del equipo y comparte políticas, reglamento y formularios de ingreso.",
          "en": "Grants team-site permissions and shares policies, handbook and onboarding forms."
        },
        "log": {
          "es": "SharePoint → permisos asignados a sitio /Operaciones — kit compartido: 6 documentos, 2 formularios por firmar",
          "en": "SharePoint → permissions granted on /Operations site — kit shared: 6 documents, 2 forms to sign"
        },
        "duracionMs": 2600
      },
      {
        "n": 5,
        "actor": "llm",
        "titulo": {
          "es": "Genera la agenda de día 1",
          "en": "Generates the day-one agenda"
        },
        "detalle": {
          "es": "Redacta una agenda personalizada: inducción, reuniones con el equipo y objetivos de la semana 1.",
          "en": "Writes a personalized agenda: induction, meet-the-team sessions and week-one goals."
        },
        "log": {
          "es": "Agenda: 8:30 bienvenida RRHH — 10:00 inducción — 14:00 1:1 con manager — objetivos semana 1: 3",
          "en": "Agenda: 8:30 HR welcome — 10:00 induction — 14:00 manager 1:1 — week-one goals: 3"
        },
        "duracionMs": 3000
      },
      {
        "n": 6,
        "actor": "herramienta",
        "herramienta": "Outlook",
        "titulo": {
          "es": "Envía bienvenida y citas",
          "en": "Sends welcome and invites"
        },
        "detalle": {
          "es": "Correo de bienvenida al colaborador y citas de calendario para todas las sesiones del día 1.",
          "en": "Welcome email to the hire plus calendar invites for every day-one session."
        },
        "log": {
          "es": "Outlook → bienvenida enviada a d.argueta — 4 citas creadas — manager y RRHH en copia",
          "en": "Outlook → welcome sent to d.argueta — 4 invites created — manager and HR copied"
        },
        "duracionMs": 2600
      },
      {
        "n": 7,
        "actor": "decision",
        "titulo": {
          "es": "Verifica pendientes",
          "en": "Verifies open items"
        },
        "detalle": {
          "es": "48 horas antes del ingreso revisa el checklist; lo incompleto se reclama al responsable.",
          "en": "48 hours before start it audits the checklist; anything incomplete is chased with its owner."
        },
        "log": {
          "es": "12/14 completadas — pendientes: laptop (bodega TI), gafete (seguridad) — recordatorios enviados",
          "en": "12/14 done — pending: laptop (IT stock), badge (security) — reminders sent"
        },
        "duracionMs": 2600
      },
      {
        "n": 8,
        "actor": "herramienta",
        "herramienta": "Teams",
        "titulo": {
          "es": "Notifica al manager",
          "en": "Notifies the manager"
        },
        "detalle": {
          "es": "El jefe directo recibe el estado del checklist, la agenda del día 1 y los pendientes con dueño.",
          "en": "The direct manager gets the checklist status, the day-one agenda and open items with owners."
        },
        "log": {
          "es": "Teams → tarjeta enviada a M. Quintanilla: 86% listo — 2 pendientes con responsable y fecha",
          "en": "Teams → card sent to M. Quintanilla: 86% ready — 2 open items with owner and date"
        },
        "duracionMs": 2200
      },
      {
        "n": 9,
        "actor": "resultado",
        "titulo": {
          "es": "Ingreso sin fricción",
          "en": "Frictionless start"
        },
        "detalle": {
          "es": "El colaborador inicia con todo listo y RRHH tiene trazabilidad completa del proceso.",
          "en": "The hire starts with everything ready and HR has full traceability of the process."
        },
        "log": {
          "es": "✔ Onboarding D. Argueta: 14/14 tareas al día 1 — 0 correos de coordinación manual",
          "en": "✔ D. Argueta onboarding: 14/14 tasks by day 1 — 0 manual coordination emails"
        },
        "duracionMs": 1800
      }
    ]
  },
  {
    "id": "a15",
    "slug": "clause",
    "nombre": "Clause",
    "rol": {
      "es": "Agente de revisión inicial de contratos",
      "en": "Contract intake and review agent"
    },
    "tagline": {
      "es": "El abogado abre un resumen de una página con banderas, no un PDF de 40.",
      "en": "The lawyer opens a one-page summary with flags, not a 40-page PDF."
    },
    "categoria": "legal",
    "disparador": {
      "es": "Contrato recibido como adjunto en el buzón de legal o cargado a la biblioteca de contratos",
      "en": "Contract received as an attachment in the legal inbox or uploaded to the contracts library"
    },
    "metricaDestacada": {
      "es": "Primera revisión con banderas de riesgo en menos de 10 minutos",
      "en": "First-pass review with risk flags in under 10 minutes"
    },
    "integraciones": [
      "Outlook",
      "Claude API",
      "SharePoint",
      "Teams"
    ],
    "resultado": {
      "es": "Resumen ejecutivo con cláusulas clave, checklist de riesgos y contrato archivado con metadatos",
      "en": "Executive summary with key clauses, risk checklist and contract filed with metadata"
    },
    "metricas": [
      {
        "es": "Ahorro típico de 1-2 horas de lectura por contrato",
        "en": "Typical saving of 1-2 reading hours per contract"
      },
      {
        "es": "Checklist de riesgos aplicado de forma idéntica a cada documento",
        "en": "Risk checklist applied identically to every document"
      },
      {
        "es": "Repositorio de contratos consultable por cláusula y contraparte",
        "en": "Contract repository searchable by clause and counterparty"
      }
    ],
    "industrias": [
      {
        "es": "Servicios profesionales y consultoría",
        "en": "Professional services and consulting"
      },
      {
        "es": "Construcción e inmobiliario",
        "en": "Construction and real estate"
      },
      {
        "es": "Distribución y comercio",
        "en": "Distribution and commerce"
      }
    ],
    "pasos": [
      {
        "n": 1,
        "actor": "trigger",
        "titulo": {
          "es": "Recibe el contrato",
          "en": "Receives the contract"
        },
        "detalle": {
          "es": "Un contrato llega adjunto al buzón de legal y se identifica tipo y contraparte.",
          "en": "A contract arrives attached to the legal inbox and its type and counterparty are identified."
        },
        "log": {
          "es": "Adjunto: Contrato_Servicios_TransportesDelValle.pdf — 38 págs — remitente: proveedor",
          "en": "Attachment: Services_Agreement_TransportesDelValle.pdf — 38 pages — sender: vendor"
        },
        "duracionMs": 2000
      },
      {
        "n": 2,
        "actor": "agente",
        "titulo": {
          "es": "Convierte y segmenta",
          "en": "Converts and segments"
        },
        "detalle": {
          "es": "Extrae el texto del PDF, reconoce la numeración y separa el documento en cláusulas.",
          "en": "Extracts the PDF text, recognizes the numbering and splits the document into clauses."
        },
        "log": {
          "es": "Texto OK: 38 págs → 47 cláusulas + 3 anexos — idioma: español — escaneo no requerido",
          "en": "Text OK: 38 pages → 47 clauses + 3 annexes — language: Spanish — no OCR needed"
        },
        "duracionMs": 2200
      },
      {
        "n": 3,
        "actor": "llm",
        "titulo": {
          "es": "Extrae cláusulas clave",
          "en": "Extracts key clauses"
        },
        "detalle": {
          "es": "Identifica vigencia, montos, penalidades, terminación, confidencialidad, jurisdicción y renovación.",
          "en": "Identifies term, amounts, penalties, termination, confidentiality, jurisdiction and renewal."
        },
        "log": {
          "es": "Clave: vigencia 24 meses — renovación automática — penalidad 2% mensual — jurisdicción: arbitraje CDMX",
          "en": "Key: 24-month term — auto-renewal — 2% monthly penalty — jurisdiction: CDMX arbitration"
        },
        "duracionMs": 4000
      },
      {
        "n": 4,
        "actor": "llm",
        "titulo": {
          "es": "Aplica checklist de riesgos",
          "en": "Applies the risk checklist"
        },
        "detalle": {
          "es": "Contrasta cada cláusula contra la política interna y marca desviaciones con su severidad.",
          "en": "Checks every clause against internal policy and marks deviations with severity."
        },
        "log": {
          "es": "3 banderas: renovación automática sin aviso (alta), penalidad sobre tope interno (alta), sin límite de responsabilidad (media)",
          "en": "3 flags: auto-renewal without notice (high), penalty above internal cap (high), no liability cap (medium)"
        },
        "duracionMs": 3800
      },
      {
        "n": 5,
        "actor": "decision",
        "titulo": {
          "es": "Clasifica el riesgo",
          "en": "Classifies the risk"
        },
        "detalle": {
          "es": "Con las banderas acumuladas asigna nivel de riesgo global y la ruta de revisión que corresponde.",
          "en": "From the accumulated flags it assigns an overall risk level and the matching review path."
        },
        "log": {
          "es": "Riesgo global: ALTO (2 banderas altas) → revisión de abogado senior obligatoria",
          "en": "Overall risk: HIGH (2 high flags) → senior lawyer review required"
        },
        "duracionMs": 2800
      },
      {
        "n": 6,
        "actor": "agente",
        "titulo": {
          "es": "Genera el resumen ejecutivo",
          "en": "Generates the executive summary"
        },
        "detalle": {
          "es": "Produce una página con datos del contrato, cláusulas clave, banderas y sugerencias de negociación.",
          "en": "Produces one page with contract data, key clauses, flags and negotiation suggestions."
        },
        "log": {
          "es": "Resumen de 1 pág listo — incluye redacción alternativa sugerida para cláusulas 12 y 31",
          "en": "1-page summary ready — includes suggested alternative wording for clauses 12 and 31"
        },
        "duracionMs": 2600
      },
      {
        "n": 7,
        "actor": "herramienta",
        "herramienta": "SharePoint",
        "titulo": {
          "es": "Archiva con metadatos",
          "en": "Files with metadata"
        },
        "detalle": {
          "es": "Guarda contrato y resumen en la biblioteca con contraparte, vigencia, monto y nivel de riesgo.",
          "en": "Stores contract and summary in the library with counterparty, term, amount and risk level."
        },
        "log": {
          "es": "SharePoint → archivado: CT-2026-088 — contraparte: Transportes Del Valle — vence: 15/07/2028 — riesgo: alto",
          "en": "SharePoint → filed: CT-2026-088 — counterparty: Transportes Del Valle — expires: 07/15/2028 — risk: high"
        },
        "duracionMs": 2200
      },
      {
        "n": 8,
        "actor": "humano",
        "herramienta": "Teams",
        "titulo": {
          "es": "Entrega al abogado",
          "en": "Hands off to the lawyer"
        },
        "detalle": {
          "es": "El abogado recibe en Teams el resumen con banderas y decide negociar, aprobar o rechazar.",
          "en": "The lawyer receives the flagged summary in Teams and decides to negotiate, approve or reject."
        },
        "log": {
          "es": "Asignado a Lic. R. Menéndez — decisión: negociar cláusulas 12 y 31 antes de firma",
          "en": "Assigned to R. Menéndez, Esq. — decision: negotiate clauses 12 and 31 before signing"
        },
        "duracionMs": 2800
      },
      {
        "n": 9,
        "actor": "resultado",
        "titulo": {
          "es": "Revisión inicial completa",
          "en": "Intake review complete"
        },
        "detalle": {
          "es": "Contrato analizado, archivado y en manos del abogado con el trabajo pesado ya hecho.",
          "en": "Contract analyzed, filed and in the lawyer hands with the heavy lifting already done."
        },
        "log": {
          "es": "✔ 38 págs → resumen de 1 pág con 3 banderas en 8 min — lectura completa evitada",
          "en": "✔ 38 pages → 1-page summary with 3 flags in 8 min — full read avoided"
        },
        "duracionMs": 1800
      }
    ]
  },
  {
    "id": "a16",
    "slug": "expira",
    "nombre": "Expira",
    "rol": {
      "es": "Agente guardián de vencimientos y renovaciones",
      "en": "Deadline and renewal warden agent"
    },
    "tagline": {
      "es": "Ningún contrato se renueva solo ni una licencia vence sin que alguien responda por ella.",
      "en": "No contract auto-renews and no license lapses without someone answering for it."
    },
    "categoria": "legal",
    "disparador": {
      "es": "Barrido diario programado a las 7:00 sobre el registro de contratos, licencias y pólizas",
      "en": "Scheduled daily sweep at 7:00 over the contracts, licenses and policies registry"
    },
    "metricaDestacada": {
      "es": "Avisos a 90/60/30/7 días con escalamiento automático, sin excepciones",
      "en": "90/60/30/7-day alerts with automatic escalation, no exceptions"
    },
    "integraciones": [
      "Dataverse",
      "Outlook",
      "Teams",
      "Power BI"
    ],
    "resultado": {
      "es": "Responsables notificados, casos sin respuesta escalados y tablero de vencimientos al día",
      "en": "Owners notified, unanswered cases escalated and the expirations dashboard up to date"
    },
    "metricas": [
      {
        "es": "Cero renovaciones automáticas no deseadas por falta de aviso",
        "en": "Zero unwanted auto-renewals caused by missed notice"
      },
      {
        "es": "Cada vencimiento tiene responsable, fecha y estado visibles",
        "en": "Every expiration has a visible owner, date and status"
      },
      {
        "es": "Escalamiento a jefatura cuando el responsable no responde",
        "en": "Escalation to management when the owner does not respond"
      }
    ],
    "industrias": [
      {
        "es": "Corporativos multipaís",
        "en": "Multi-country corporates"
      },
      {
        "es": "Salud y farmacéutica (licencias)",
        "en": "Healthcare and pharma (licenses)"
      },
      {
        "es": "Construcción (fianzas y pólizas)",
        "en": "Construction (bonds and policies)"
      }
    ],
    "pasos": [
      {
        "n": 1,
        "actor": "trigger",
        "titulo": {
          "es": "Barrido diario",
          "en": "Daily sweep"
        },
        "detalle": {
          "es": "A las 7:00 el agente inicia la revisión completa del registro de instrumentos vigentes.",
          "en": "At 7:00 the agent starts a full review of the active-instruments registry."
        },
        "log": {
          "es": "Barrido 03/07 7:00 — registro: 214 contratos, 37 licencias, 12 pólizas activas",
          "en": "Sweep 07/03 7:00 — registry: 214 contracts, 37 licenses, 12 active policies"
        },
        "duracionMs": 1800
      },
      {
        "n": 2,
        "actor": "herramienta",
        "herramienta": "Dataverse",
        "titulo": {
          "es": "Consulta vencimientos",
          "en": "Queries expirations"
        },
        "detalle": {
          "es": "Filtra todo lo que vence en las ventanas de 90, 60, 30 y 7 días, incluyendo plazos de preaviso.",
          "en": "Filters everything expiring in the 90, 60, 30 and 7-day windows, including notice periods."
        },
        "log": {
          "es": "Dataverse → ventanas: 90d → 11 ítems, 60d → 6, 30d → 4, 7d → 2 — 3 con preaviso contractual próximo",
          "en": "Dataverse → windows: 90d → 11 items, 60d → 6, 30d → 4, 7d → 2 — 3 with contractual notice due soon"
        },
        "duracionMs": 2600
      },
      {
        "n": 3,
        "actor": "agente",
        "titulo": {
          "es": "Prioriza los casos",
          "en": "Prioritizes the cases"
        },
        "detalle": {
          "es": "Ordena por monto, criticidad operativa y cercanía del preaviso; asigna acción requerida a cada uno.",
          "en": "Ranks by amount, operational criticality and notice proximity; assigns a required action to each."
        },
        "log": {
          "es": "Top: póliza de flota vence en 9 días ($48k/año) — licencia sanitaria planta Sur en 22 días",
          "en": "Top: fleet policy expires in 9 days ($48k/yr) — South plant health license in 22 days"
        },
        "duracionMs": 2600
      },
      {
        "n": 4,
        "actor": "decision",
        "titulo": {
          "es": "Evalúa respuestas previas",
          "en": "Evaluates prior responses"
        },
        "detalle": {
          "es": "Revisa si el responsable ya respondió al aviso anterior; los ignorados suben de severidad.",
          "en": "Checks if the owner already answered the previous alert; ignored ones move up in severity."
        },
        "log": {
          "es": "2 casos sin respuesta tras 2 avisos: póliza de flota y contrato de vigilancia → escalar",
          "en": "2 cases unanswered after 2 alerts: fleet policy and security contract → escalate"
        },
        "duracionMs": 2800
      },
      {
        "n": 5,
        "actor": "herramienta",
        "herramienta": "Outlook",
        "titulo": {
          "es": "Envía recordatorios",
          "en": "Sends reminders"
        },
        "detalle": {
          "es": "Cada responsable recibe correo con el ítem, la fecha límite y la acción concreta que se espera.",
          "en": "Every owner gets an email with the item, the deadline and the exact action expected."
        },
        "log": {
          "es": "Outlook → 8 recordatorios enviados — acción: \"confirmar renovación o iniciar preaviso antes del 10/07\"",
          "en": "Outlook → 8 reminders sent — action: \"confirm renewal or start notice before 07/10\""
        },
        "duracionMs": 2400
      },
      {
        "n": 6,
        "actor": "herramienta",
        "herramienta": "Teams",
        "titulo": {
          "es": "Escala los ignorados",
          "en": "Escalates the ignored"
        },
        "detalle": {
          "es": "Los casos sin respuesta con menos de 15 días se notifican a la jefatura con historial de avisos.",
          "en": "Unanswered cases under 15 days are raised to management with the full alert history."
        },
        "log": {
          "es": "Teams → escalado a Gerencia Legal: póliza de flota (9 días, 2 avisos sin respuesta, dueño: J. Rivas)",
          "en": "Teams → escalated to Legal Management: fleet policy (9 days, 2 unanswered alerts, owner: J. Rivas)"
        },
        "duracionMs": 2400
      },
      {
        "n": 7,
        "actor": "herramienta",
        "herramienta": "Power BI",
        "titulo": {
          "es": "Actualiza el tablero",
          "en": "Updates the dashboard"
        },
        "detalle": {
          "es": "El tablero de vencimientos refleja estados, respuestas y casos escalados del día.",
          "en": "The expirations dashboard reflects the day statuses, responses and escalations."
        },
        "log": {
          "es": "Power BI → tablero al día: 23 ítems en ventana, 15 confirmados, 6 en gestión, 2 escalados",
          "en": "Power BI → dashboard current: 23 items in window, 15 confirmed, 6 in progress, 2 escalated"
        },
        "duracionMs": 2200
      },
      {
        "n": 8,
        "actor": "resultado",
        "titulo": {
          "es": "Vencimientos bajo control",
          "en": "Expirations under control"
        },
        "detalle": {
          "es": "Nada vence en silencio: cada instrumento tiene dueño activo y evidencia de gestión.",
          "en": "Nothing lapses silently: every instrument has an active owner and managed evidence."
        },
        "log": {
          "es": "✔ Barrido completo en 4 min — 8 avisos, 2 escalamientos, 0 vencimientos sin gestión",
          "en": "✔ Sweep done in 4 min — 8 alerts, 2 escalations, 0 unmanaged expirations"
        },
        "duracionMs": 1800
      }
    ]
  },
  {
    "id": "a17",
    "slug": "stock",
    "nombre": "Stock",
    "rol": {
      "es": "Agente de reabastecimiento de inventario",
      "en": "Inventory replenishment agent"
    },
    "tagline": {
      "es": "Ni bodega llena de capital muerto ni venta perdida por quiebre de stock.",
      "en": "No warehouse full of dead capital and no sale lost to a stockout."
    },
    "categoria": "operaciones",
    "disparador": {
      "es": "Corte nocturno programado que detecta SKUs bajo el punto de reorden en el ERP",
      "en": "Scheduled nightly cutoff detecting SKUs below reorder point in the ERP"
    },
    "metricaDestacada": {
      "es": "Orden de compra borrador lista cada mañana, con proveedor y cantidades sugeridas",
      "en": "Draft purchase order ready every morning, with suggested vendor and quantities"
    },
    "integraciones": [
      "ERP",
      "Excel",
      "Teams",
      "Power Automate"
    ],
    "resultado": {
      "es": "Órdenes de compra aprobadas y creadas en el ERP antes de que el quiebre ocurra",
      "en": "Purchase orders approved and created in the ERP before the stockout happens"
    },
    "metricas": [
      {
        "es": "Reducción típica de quiebres de stock en SKUs de alta rotación",
        "en": "Typical reduction of stockouts on high-turnover SKUs"
      },
      {
        "es": "Cantidades sugeridas con base en consumo real de 90 días y lead time por proveedor",
        "en": "Quantities suggested from real 90-day consumption and per-vendor lead time"
      },
      {
        "es": "Compras deja de perseguir datos y solo decide sobre propuestas listas",
        "en": "Purchasing stops chasing data and only decides on ready proposals"
      }
    ],
    "industrias": [
      {
        "es": "Distribución y mayoreo",
        "en": "Distribution and wholesale"
      },
      {
        "es": "Retail y ferretería",
        "en": "Retail and hardware"
      },
      {
        "es": "Manufactura (materia prima)",
        "en": "Manufacturing (raw materials)"
      }
    ],
    "pasos": [
      {
        "n": 1,
        "actor": "trigger",
        "titulo": {
          "es": "Corte nocturno",
          "en": "Nightly cutoff"
        },
        "detalle": {
          "es": "A las 23:30 el agente revisa existencias y detecta los SKUs bajo su punto de reorden.",
          "en": "At 23:30 the agent reviews stock and detects SKUs below their reorder point."
        },
        "log": {
          "es": "Corte 23:30 — 1,240 SKUs revisados — 17 bajo punto de reorden — 4 críticos",
          "en": "Cutoff 23:30 — 1,240 SKUs reviewed — 17 below reorder point — 4 critical"
        },
        "duracionMs": 1800
      },
      {
        "n": 2,
        "actor": "herramienta",
        "herramienta": "ERP",
        "titulo": {
          "es": "Extrae datos de consumo",
          "en": "Pulls consumption data"
        },
        "detalle": {
          "es": "Obtiene existencias, consumo de 90 días, pedidos en tránsito y lead time por proveedor.",
          "en": "Pulls stock on hand, 90-day consumption, in-transit orders and per-vendor lead times."
        },
        "log": {
          "es": "ERP → SKU CEM-4250: stock 380 u — consumo 42 u/día — tránsito 0 — lead time Cementos Unidos: 12 días",
          "en": "ERP → SKU CEM-4250: stock 380 u — usage 42 u/day — in transit 0 — Cementos Unidos lead time: 12 days"
        },
        "duracionMs": 2600
      },
      {
        "n": 3,
        "actor": "agente",
        "titulo": {
          "es": "Proyecta la demanda",
          "en": "Forecasts demand"
        },
        "detalle": {
          "es": "Calcula cobertura en días por SKU considerando tendencia y estacionalidad del consumo.",
          "en": "Computes days of coverage per SKU factoring consumption trend and seasonality."
        },
        "log": {
          "es": "CEM-4250: cobertura 9.0 días vs lead time 12 — tendencia +8% (temporada de construcción)",
          "en": "CEM-4250: coverage 9.0 days vs 12-day lead time — trend +8% (construction season)"
        },
        "duracionMs": 3400
      },
      {
        "n": 4,
        "actor": "decision",
        "titulo": {
          "es": "Decide qué reordenar",
          "en": "Decides what to reorder"
        },
        "detalle": {
          "es": "Marca para compra todo SKU cuya cobertura sea menor que lead time más colchón de seguridad.",
          "en": "Flags for purchase any SKU whose coverage is below lead time plus safety buffer."
        },
        "log": {
          "es": "11 de 17 SKUs a reordenar — 6 descartados (pedido en tránsito cubre la ventana)",
          "en": "11 of 17 SKUs to reorder — 6 dismissed (in-transit order covers the window)"
        },
        "duracionMs": 2600
      },
      {
        "n": 5,
        "actor": "agente",
        "titulo": {
          "es": "Arma el borrador de OC",
          "en": "Drafts the PO"
        },
        "detalle": {
          "es": "Agrupa por proveedor, sugiere cantidades por lote mínimo y precio vigente de contrato.",
          "en": "Groups by vendor, suggests quantities by minimum lot and current contract price."
        },
        "log": {
          "es": "3 OC borrador: Cementos Unidos ($8,940), Aceros del Istmo ($5,120), Plásticos Rivera ($1,860)",
          "en": "3 draft POs: Cementos Unidos ($8,940), Aceros del Istmo ($5,120), Plásticos Rivera ($1,860)"
        },
        "duracionMs": 2800
      },
      {
        "n": 6,
        "actor": "herramienta",
        "herramienta": "Excel",
        "titulo": {
          "es": "Genera el detalle",
          "en": "Generates the detail"
        },
        "detalle": {
          "es": "Produce el archivo de revisión con SKUs, consumos, coberturas y justificación por línea.",
          "en": "Produces the review file with SKUs, consumption, coverage and per-line justification."
        },
        "log": {
          "es": "Excel → OC_Propuestas_2026-07-03.xlsx — 11 líneas, 3 proveedores, total $15,920 — semáforo por criticidad",
          "en": "Excel → PO_Proposals_2026-07-03.xlsx — 11 lines, 3 vendors, total $15,920 — criticality traffic light"
        },
        "duracionMs": 2400
      },
      {
        "n": 7,
        "actor": "humano",
        "herramienta": "Teams",
        "titulo": {
          "es": "Compras aprueba",
          "en": "Purchasing approves"
        },
        "detalle": {
          "es": "El jefe de compras revisa la propuesta en Teams, ajusta cantidades y aprueba por proveedor.",
          "en": "The purchasing lead reviews the proposal in Teams, tweaks quantities and approves per vendor."
        },
        "log": {
          "es": "E. Molina aprobó 3/3 OC — 1 ajuste: CEM-4250 de 600 a 500 u por espacio en bodega",
          "en": "E. Molina approved 3/3 POs — 1 tweak: CEM-4250 from 600 to 500 u due to warehouse space"
        },
        "duracionMs": 3000
      },
      {
        "n": 8,
        "actor": "herramienta",
        "herramienta": "ERP",
        "titulo": {
          "es": "Crea las OC en el ERP",
          "en": "Creates the POs in the ERP"
        },
        "detalle": {
          "es": "Las órdenes aprobadas se registran en el ERP y quedan enlazadas al flujo de recepción.",
          "en": "Approved orders are registered in the ERP and linked to the receiving workflow."
        },
        "log": {
          "es": "ERP → OC-10441, OC-10442, OC-10443 creadas — proveedores notificados — entrega estimada: 15/07",
          "en": "ERP → PO-10441, PO-10442, PO-10443 created — vendors notified — ETA: 07/15"
        },
        "duracionMs": 2400
      },
      {
        "n": 9,
        "actor": "resultado",
        "titulo": {
          "es": "Reabastecimiento asegurado",
          "en": "Replenishment secured"
        },
        "detalle": {
          "es": "El inventario crítico queda cubierto antes del quiebre y con evidencia de cada decisión.",
          "en": "Critical inventory is covered before the stockout, with evidence for every decision."
        },
        "log": {
          "es": "✔ 11 SKUs asegurados — quiebre proyectado evitado en 4 críticos — decisión humana: 1 clic",
          "en": "✔ 11 SKUs secured — projected stockout avoided on 4 critical items — human decision: 1 click"
        },
        "duracionMs": 1800
      }
    ]
  },
  {
    "id": "a18",
    "slug": "gasto",
    "nombre": "Gasto",
    "rol": {
      "es": "Agente auditor de reportes de gastos",
      "en": "Expense report auditor agent"
    },
    "tagline": {
      "es": "Cada recibo contra la política, cada excepción con nombre, sin cuellos de botella en finanzas.",
      "en": "Every receipt against policy, every exception named, no bottleneck in finance."
    },
    "categoria": "finanzas",
    "disparador": {
      "es": "Reporte de gastos con recibos adjuntos recibido en el buzón de finanzas",
      "en": "Expense report with receipts attached received in the finance inbox"
    },
    "metricaDestacada": {
      "es": "Auditoría del 100% de los recibos, no solo una muestra",
      "en": "100% of receipts audited, not just a sample"
    },
    "integraciones": [
      "Outlook",
      "Azure OpenAI",
      "ERP",
      "Teams"
    ],
    "resultado": {
      "es": "Gastos conformes contabilizados en el ERP y excepciones documentadas para revisión humana",
      "en": "Compliant expenses posted to the ERP and exceptions documented for human review"
    },
    "metricas": [
      {
        "es": "Reembolsos conformes procesados típicamente el mismo día",
        "en": "Compliant reimbursements typically processed same day"
      },
      {
        "es": "Duplicados y montos fuera de política detectados antes de pagar",
        "en": "Duplicates and out-of-policy amounts caught before payment"
      },
      {
        "es": "Finanzas revisa solo las excepciones, no todos los reportes",
        "en": "Finance reviews only the exceptions, not every report"
      }
    ],
    "industrias": [
      {
        "es": "Corporativos con fuerza de ventas en campo",
        "en": "Corporates with field sales teams"
      },
      {
        "es": "Construcción y proyectos",
        "en": "Construction and project firms"
      },
      {
        "es": "ONG y cooperación",
        "en": "NGOs and development agencies"
      }
    ],
    "pasos": [
      {
        "n": 1,
        "actor": "trigger",
        "titulo": {
          "es": "Recibe el reporte",
          "en": "Receives the report"
        },
        "detalle": {
          "es": "Un colaborador envía su reporte de gastos con recibos adjuntos al buzón de finanzas.",
          "en": "An employee sends their expense report with receipts attached to the finance inbox."
        },
        "log": {
          "es": "Reporte de gastos: C. Alvarado (Ventas) — viaje a San Pedro Sula — 9 recibos, $412.50 declarado",
          "en": "Expense report: C. Alvarado (Sales) — San Pedro Sula trip — 9 receipts, $412.50 claimed"
        },
        "duracionMs": 1800
      },
      {
        "n": 2,
        "actor": "agente",
        "titulo": {
          "es": "Lee cada recibo",
          "en": "Reads every receipt"
        },
        "detalle": {
          "es": "Extrae de cada imagen o PDF el monto, fecha, comercio, categoría e impuesto desglosado.",
          "en": "Extracts amount, date, merchant, category and itemized tax from each image or PDF."
        },
        "log": {
          "es": "9/9 recibos leídos — hotel $180, comidas $127.50, taxi $45, combustible $60 — 1 imagen borrosa reprocesada",
          "en": "9/9 receipts read — hotel $180, meals $127.50, taxi $45, fuel $60 — 1 blurry image reprocessed"
        },
        "duracionMs": 2600
      },
      {
        "n": 3,
        "actor": "llm",
        "titulo": {
          "es": "Valida contra la política",
          "en": "Validates against policy"
        },
        "detalle": {
          "es": "Contrasta cada gasto con la política de viáticos: topes por categoría, ciudad y nivel del puesto.",
          "en": "Checks each expense against travel policy: caps by category, city and job level."
        },
        "log": {
          "es": "7/9 conformes — cena del 28/06 $52 excede tope de $35 — recibo de taxi sin datos fiscales",
          "en": "7/9 compliant — 06/28 dinner $52 exceeds $35 cap — taxi receipt missing tax data"
        },
        "duracionMs": 3600
      },
      {
        "n": 4,
        "actor": "agente",
        "titulo": {
          "es": "Cruza duplicados",
          "en": "Cross-checks duplicates"
        },
        "detalle": {
          "es": "Compara contra el histórico del colaborador y del equipo para detectar recibos repetidos.",
          "en": "Compares against the employee and team history to catch resubmitted receipts."
        },
        "log": {
          "es": "Cruce de 90 días: 0 duplicados exactos — 1 alerta suave: mismo comercio y monto que 12/06 (verificado, fechas distintas)",
          "en": "90-day cross-check: 0 exact duplicates — 1 soft alert: same merchant and amount as 06/12 (verified, different dates)"
        },
        "duracionMs": 2600
      },
      {
        "n": 5,
        "actor": "decision",
        "titulo": {
          "es": "Separa conformes y excepciones",
          "en": "Splits compliant and exceptions"
        },
        "detalle": {
          "es": "Los gastos conformes siguen a contabilización directa; las excepciones van a revisión humana.",
          "en": "Compliant expenses go straight to posting; exceptions route to human review."
        },
        "log": {
          "es": "$325.50 aprobado automático — $87.00 en 2 excepciones → cola de revisión de finanzas",
          "en": "$325.50 auto-approved — $87.00 in 2 exceptions → finance review queue"
        },
        "duracionMs": 2800
      },
      {
        "n": 6,
        "actor": "humano",
        "herramienta": "Teams",
        "titulo": {
          "es": "Finanzas revisa excepciones",
          "en": "Finance reviews exceptions"
        },
        "detalle": {
          "es": "La analista ve solo las 2 excepciones con evidencia y contexto, y decide aprobar o devolver.",
          "en": "The analyst sees only the 2 exceptions with evidence and context, and approves or returns them."
        },
        "log": {
          "es": "P. Zelaya: cena aprobada con nota (cliente presente) — taxi devuelto por falta de comprobante fiscal",
          "en": "P. Zelaya: dinner approved with note (client present) — taxi returned for missing tax receipt"
        },
        "duracionMs": 3000
      },
      {
        "n": 7,
        "actor": "herramienta",
        "herramienta": "ERP",
        "titulo": {
          "es": "Contabiliza en el ERP",
          "en": "Posts to the ERP"
        },
        "detalle": {
          "es": "Los gastos aprobados se registran con centro de costo, proyecto y cuenta contable correctos.",
          "en": "Approved expenses are posted with the right cost center, project and GL account."
        },
        "log": {
          "es": "ERP → asiento GT-88213: $377.50 — centro de costo VEN-02 — reembolso programado en la siguiente planilla",
          "en": "ERP → entry GT-88213: $377.50 — cost center VEN-02 — reimbursement scheduled for next payroll run"
        },
        "duracionMs": 2400
      },
      {
        "n": 8,
        "actor": "sistema",
        "titulo": {
          "es": "Notifica al colaborador",
          "en": "Notifies the employee"
        },
        "detalle": {
          "es": "El colaborador recibe el desglose: qué se aprobó, qué se devolvió y qué debe corregir.",
          "en": "The employee receives the breakdown: what was approved, what was returned and what to fix."
        },
        "log": {
          "es": "Correo a C. Alvarado: 8 gastos aprobados ($377.50), 1 devuelto con instrucción de corrección",
          "en": "Email to C. Alvarado: 8 expenses approved ($377.50), 1 returned with a fix instruction"
        },
        "duracionMs": 2200
      },
      {
        "n": 9,
        "actor": "resultado",
        "titulo": {
          "es": "Gasto auditado y contabilizado",
          "en": "Expense audited and posted"
        },
        "detalle": {
          "es": "Reembolso en curso el mismo día, política aplicada al 100% y excepciones con trazabilidad.",
          "en": "Reimbursement moving same day, policy applied to 100% and exceptions fully traceable."
        },
        "log": {
          "es": "✔ Ciclo completo en 11 min — 9 recibos auditados, 1 excepción devuelta, 0 revisión manual de conformes",
          "en": "✔ Full cycle in 11 min — 9 receipts audited, 1 exception returned, 0 manual review of compliant items"
        },
        "duracionMs": 1800
      }
    ]
  },
  {
    "id": "a19",
    "slug": "encuesta",
    "nombre": "Encuesta",
    "rol": {
      "es": "Agente de ciclo NPS post-servicio",
      "en": "Post-service NPS loop agent"
    },
    "tagline": {
      "es": "El cliente molesto se detecta hoy por WhatsApp, no en la encuesta anual.",
      "en": "The unhappy customer surfaces today on WhatsApp, not in the annual survey."
    },
    "categoria": "soporte",
    "disparador": {
      "es": "Ticket de soporte marcado como cerrado en el CRM",
      "en": "Support ticket marked as closed in the CRM"
    },
    "metricaDestacada": {
      "es": "Detractores alertados al supervisor en menos de 5 minutos tras responder",
      "en": "Detractors flagged to the supervisor within 5 minutes of responding"
    },
    "integraciones": [
      "CRM",
      "WhatsApp Business",
      "Teams",
      "Azure OpenAI",
      "Power BI"
    ],
    "resultado": {
      "es": "NPS medido por ticket, detractores rescatados a tiempo y digest semanal de fricciones",
      "en": "NPS measured per ticket, detractors rescued in time and a weekly friction digest"
    },
    "metricas": [
      {
        "es": "Tasas de respuesta por WhatsApp típicamente 3-4x mayores que por correo",
        "en": "WhatsApp response rates typically 3-4x higher than email"
      },
      {
        "es": "Cada detractor genera una acción con responsable, no solo un número",
        "en": "Every detractor triggers an owned action, not just a number"
      },
      {
        "es": "Temas de fricción agrupados automáticamente para el comité semanal",
        "en": "Friction topics auto-clustered for the weekly committee"
      }
    ],
    "industrias": [
      {
        "es": "Telecomunicaciones y servicios",
        "en": "Telecom and services"
      },
      {
        "es": "Banca y seguros",
        "en": "Banking and insurance"
      },
      {
        "es": "Talleres y postventa automotriz",
        "en": "Workshops and automotive after-sales"
      }
    ],
    "pasos": [
      {
        "n": 1,
        "actor": "trigger",
        "titulo": {
          "es": "Ticket cerrado",
          "en": "Ticket closed"
        },
        "detalle": {
          "es": "El cierre de un ticket en el CRM dispara el ciclo de medición para ese cliente.",
          "en": "A ticket closure in the CRM starts the measurement loop for that customer."
        },
        "log": {
          "es": "Ticket #TK-5521 cerrado — cliente: Farmacias VidaPlus — tema: facturación duplicada — agente: N. Paz",
          "en": "Ticket #TK-5521 closed — customer: Farmacias VidaPlus — topic: duplicate billing — agent: N. Paz"
        },
        "duracionMs": 1800
      },
      {
        "n": 2,
        "actor": "herramienta",
        "herramienta": "WhatsApp Business",
        "titulo": {
          "es": "Envía la encuesta",
          "en": "Sends the survey"
        },
        "detalle": {
          "es": "El cliente recibe por WhatsApp la pregunta NPS 0-10 y un campo opcional de comentario.",
          "en": "The customer gets the 0-10 NPS question on WhatsApp plus an optional comment field."
        },
        "log": {
          "es": "WhatsApp → encuesta enviada a +504 9xxx-xx21 — plantilla aprobada \"post_servicio_v3\" — expira en 72 h",
          "en": "WhatsApp → survey sent to +504 9xxx-xx21 — approved template \"post_service_v3\" — expires in 72 h"
        },
        "duracionMs": 2400
      },
      {
        "n": 3,
        "actor": "sistema",
        "titulo": {
          "es": "Registra la respuesta",
          "en": "Records the response"
        },
        "detalle": {
          "es": "La respuesta se asocia al ticket, al agente y a la categoría del caso en el CRM.",
          "en": "The response is linked to the ticket, the agent and the case category in the CRM."
        },
        "log": {
          "es": "Respuesta recibida en 41 min: score 4/10 — comentario: \"me resolvieron pero tardaron dos semanas\"",
          "en": "Response received in 41 min: score 4/10 — comment: \"they solved it but it took two weeks\""
        },
        "duracionMs": 2600
      },
      {
        "n": 4,
        "actor": "decision",
        "titulo": {
          "es": "Clasifica al cliente",
          "en": "Classifies the customer"
        },
        "detalle": {
          "es": "Score 0-6 marca detractor y activa la ruta de rescate; 9-10 activa solicitud de reseña.",
          "en": "Scores 0-6 flag a detractor and trigger the rescue path; 9-10 trigger a review request."
        },
        "log": {
          "es": "Score 4 → DETRACTOR — cliente con 3 tickets en 60 días → riesgo de churn: alto",
          "en": "Score 4 → DETRACTOR — customer with 3 tickets in 60 days → churn risk: high"
        },
        "duracionMs": 2600
      },
      {
        "n": 5,
        "actor": "herramienta",
        "herramienta": "Teams",
        "titulo": {
          "es": "Alerta al supervisor",
          "en": "Alerts the supervisor"
        },
        "detalle": {
          "es": "El supervisor recibe la alerta con el historial del cliente y una acción de contacto sugerida.",
          "en": "The supervisor gets the alert with the customer history and a suggested contact action."
        },
        "log": {
          "es": "Teams → alerta a F. Castellanos: detractor VidaPlus — sugerencia: llamada del supervisor en <24 h",
          "en": "Teams → alert to F. Castellanos: VidaPlus detractor — suggestion: supervisor call within 24 h"
        },
        "duracionMs": 2600
      },
      {
        "n": 6,
        "actor": "llm",
        "titulo": {
          "es": "Agrupa temas de fricción",
          "en": "Clusters friction topics"
        },
        "detalle": {
          "es": "Analiza los comentarios de la semana y agrupa causas raíz con frecuencia y severidad.",
          "en": "Analyzes the week comments and clusters root causes with frequency and severity."
        },
        "log": {
          "es": "Semana 27: tema #1 \"tiempos de resolución\" (14 menciones, NPS prom. 5.1) — #2 \"facturación\" (8 menciones)",
          "en": "Week 27: topic #1 \"resolution times\" (14 mentions, avg NPS 5.1) — #2 \"billing\" (8 mentions)"
        },
        "duracionMs": 3400
      },
      {
        "n": 7,
        "actor": "herramienta",
        "herramienta": "Power BI",
        "titulo": {
          "es": "Publica el digest",
          "en": "Publishes the digest"
        },
        "detalle": {
          "es": "El tablero semanal muestra NPS por agente, categoría y sucursal, con detractores gestionados.",
          "en": "The weekly dashboard shows NPS by agent, category and branch, with managed detractors."
        },
        "log": {
          "es": "Power BI → digest S27: NPS 42 (+3 vs S26) — 118 respuestas — 9 detractores, 9 contactados",
          "en": "Power BI → W27 digest: NPS 42 (+3 vs W26) — 118 responses — 9 detractors, 9 contacted"
        },
        "duracionMs": 2400
      },
      {
        "n": 8,
        "actor": "resultado",
        "titulo": {
          "es": "Ciclo de mejora cerrado",
          "en": "Improvement loop closed"
        },
        "detalle": {
          "es": "Cada cierre de ticket alimenta la mejora: detractores rescatados y causas raíz visibles.",
          "en": "Every ticket closure feeds improvement: detractors rescued and root causes visible."
        },
        "log": {
          "es": "✔ TK-5521: detractor contactado en 3 h — tema sumado al comité semanal — ciclo completo sin intervención manual",
          "en": "✔ TK-5521: detractor contacted in 3 h — topic added to weekly committee — loop closed with no manual steps"
        },
        "duracionMs": 1800
      }
    ]
  },
  {
    "id": "a20",
    "slug": "vigia",
    "nombre": "Vigía",
    "rol": {
      "es": "Agente vigilante de competencia y precios",
      "en": "Competitor and price watcher agent"
    },
    "tagline": {
      "es": "El lunes a las 7:00 la gerencia sabe qué movió la competencia, sin pagar una consultora.",
      "en": "By Monday 7:00 management knows what competitors moved, without paying a consultancy."
    },
    "categoria": "datos",
    "disparador": {
      "es": "Escaneo programado cada lunes a las 6:00 sobre sitios, listas de precios y marketplaces definidos",
      "en": "Scheduled scan every Monday at 6:00 over defined sites, price lists and marketplaces"
    },
    "metricaDestacada": {
      "es": "Brief competitivo semanal en la bandeja antes de la reunión comercial",
      "en": "Weekly competitive brief in the inbox before the sales meeting"
    },
    "integraciones": [
      "Power Automate",
      "Azure OpenAI",
      "Excel",
      "Teams"
    ],
    "resultado": {
      "es": "Brief semanal con cambios de precio, lanzamientos y promociones, más histórico comparable",
      "en": "Weekly brief with price changes, launches and promotions, plus a comparable history"
    },
    "metricas": [
      {
        "es": "Monitoreo consistente de todas las fuentes definidas, cada semana sin falta",
        "en": "Consistent monitoring of every defined source, every single week"
      },
      {
        "es": "Cambios de precio detectados con porcentaje y fecha exacta",
        "en": "Price changes detected with exact percentage and date"
      },
      {
        "es": "Histórico de precios listo para decisiones de pricing propias",
        "en": "Price history ready for your own pricing decisions"
      }
    ],
    "industrias": [
      {
        "es": "Retail y e-commerce",
        "en": "Retail and e-commerce"
      },
      {
        "es": "Distribución y consumo masivo",
        "en": "Distribution and CPG"
      },
      {
        "es": "Telecomunicaciones y servicios",
        "en": "Telecom and services"
      }
    ],
    "pasos": [
      {
        "n": 1,
        "actor": "trigger",
        "titulo": {
          "es": "Escaneo semanal",
          "en": "Weekly scan"
        },
        "detalle": {
          "es": "Cada lunes a las 6:00 el agente inicia el barrido del catálogo de fuentes configurado.",
          "en": "Every Monday at 6:00 the agent starts sweeping the configured source catalog."
        },
        "log": {
          "es": "Escaneo lun 6:00 — 5 competidores, 22 fuentes: sitios, PDFs de precios, 2 marketplaces",
          "en": "Scan Mon 6:00 — 5 competitors, 22 sources: websites, price PDFs, 2 marketplaces"
        },
        "duracionMs": 1800
      },
      {
        "n": 2,
        "actor": "herramienta",
        "herramienta": "Power Automate",
        "titulo": {
          "es": "Recolecta las fuentes",
          "en": "Collects the sources"
        },
        "detalle": {
          "es": "Descarga páginas de producto, listas publicadas y fichas de marketplace de cada competidor.",
          "en": "Downloads product pages, published lists and marketplace listings for each competitor."
        },
        "log": {
          "es": "Power Automate → 22/22 fuentes capturadas — 340 productos rastreados — 1 sitio lento, reintento exitoso",
          "en": "Power Automate → 22/22 sources captured — 340 tracked products — 1 slow site, retry succeeded"
        },
        "duracionMs": 2800
      },
      {
        "n": 3,
        "actor": "agente",
        "titulo": {
          "es": "Compara contra el snapshot",
          "en": "Compares against the snapshot"
        },
        "detalle": {
          "es": "Normaliza precios y presentaciones y calcula diferencias contra la captura de la semana anterior.",
          "en": "Normalizes prices and pack sizes and computes deltas against last week snapshot."
        },
        "log": {
          "es": "Diferencias: 12 cambios de precio, 2 productos nuevos, 1 descontinuado, 3 promociones activas",
          "en": "Deltas: 12 price changes, 2 new products, 1 discontinued, 3 active promotions"
        },
        "duracionMs": 3000
      },
      {
        "n": 4,
        "actor": "decision",
        "titulo": {
          "es": "Filtra lo relevante",
          "en": "Filters what matters"
        },
        "detalle": {
          "es": "Descarta ruido (centavos, errores de captura) y conserva cambios sobre el umbral configurado.",
          "en": "Drops noise (cents, capture glitches) and keeps changes above the configured threshold."
        },
        "log": {
          "es": "8 de 12 cambios relevantes (>3%) — mayor: Eléctrica Continental bajó línea de cables -11%",
          "en": "8 of 12 changes relevant (>3%) — biggest: Eléctrica Continental cut cable line -11%"
        },
        "duracionMs": 2600
      },
      {
        "n": 5,
        "actor": "llm",
        "titulo": {
          "es": "Redacta el brief",
          "en": "Writes the brief"
        },
        "detalle": {
          "es": "Convierte los datos en un brief ejecutivo: qué cambió, qué significa y qué conviene vigilar.",
          "en": "Turns the data into an executive brief: what changed, what it means and what to watch."
        },
        "log": {
          "es": "Brief S27 (1 pág): 3 hallazgos clave + lectura de intención (posible liquidación de inventario) + 2 riesgos",
          "en": "W27 brief (1 page): 3 key findings + intent read (possible inventory clearance) + 2 risks"
        },
        "duracionMs": 3800
      },
      {
        "n": 6,
        "actor": "herramienta",
        "herramienta": "Excel",
        "titulo": {
          "es": "Actualiza el histórico",
          "en": "Updates the history"
        },
        "detalle": {
          "es": "El histórico de precios por producto y competidor suma la semana, listo para graficar tendencias.",
          "en": "The per-product, per-competitor price history gains the week, ready for trend charts."
        },
        "log": {
          "es": "Excel → Historico_Precios.xlsx: +340 filas — 26 semanas acumuladas — tendencia por SKU actualizada",
          "en": "Excel → Price_History.xlsx: +340 rows — 26 weeks accumulated — per-SKU trend refreshed"
        },
        "duracionMs": 2400
      },
      {
        "n": 7,
        "actor": "herramienta",
        "herramienta": "Teams",
        "titulo": {
          "es": "Entrega el brief",
          "en": "Delivers the brief"
        },
        "detalle": {
          "es": "El equipo comercial recibe el brief y el enlace al histórico antes de su reunión de lunes.",
          "en": "The sales team receives the brief and the history link before their Monday meeting."
        },
        "log": {
          "es": "Teams → brief publicado en canal Comercial 6:52 — mención a gerencia por el cambio de -11% en cables",
          "en": "Teams → brief posted to Sales channel 6:52 — management mentioned about the -11% cable move"
        },
        "duracionMs": 2400
      },
      {
        "n": 8,
        "actor": "resultado",
        "titulo": {
          "es": "Inteligencia lista para decidir",
          "en": "Intelligence ready to act on"
        },
        "detalle": {
          "es": "La reunión comercial arranca con datos frescos y comparables, no con impresiones sueltas.",
          "en": "The sales meeting starts with fresh, comparable data instead of loose impressions."
        },
        "log": {
          "es": "✔ Ciclo semanal completo en 52 min — 22 fuentes, 8 hallazgos, 1 brief — costo marginal: ~$0",
          "en": "✔ Weekly cycle done in 52 min — 22 sources, 8 findings, 1 brief — marginal cost: ~$0"
        },
        "duracionMs": 1800
      }
    ]
  }
];

const AGENT_CATEGORIES = [
  {
    "id": "ventas",
    "label": {
      "es": "Ventas",
      "en": "Sales"
    }
  },
  {
    "id": "operaciones",
    "label": {
      "es": "Operaciones",
      "en": "Operations"
    }
  },
  {
    "id": "finanzas",
    "label": {
      "es": "Finanzas",
      "en": "Finance"
    }
  },
  {
    "id": "soporte",
    "label": {
      "es": "Soporte",
      "en": "Support"
    }
  },
  {
    "id": "datos",
    "label": {
      "es": "Datos",
      "en": "Data"
    }
  },
  {
    "id": "marketing",
    "label": {
      "es": "Marketing",
      "en": "Marketing"
    }
  },
  {
    "id": "rrhh",
    "label": {
      "es": "RRHH",
      "en": "HR"
    }
  },
  {
    "id": "legal",
    "label": {
      "es": "Legal",
      "en": "Legal"
    }
  }
];

window.AGENTS = AGENTS;
window.AGENT_CATEGORIES = AGENT_CATEGORIES;
