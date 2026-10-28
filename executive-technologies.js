/* ---------- índice de stagger para el grid de herramientas ---------- */
document.querySelectorAll(".tool-grid .tool").forEach((el, i) => {
  el.style.setProperty("--i", i);
});

/* ---------- las animaciones infinitas solo corren con su sección visible ---------- */
(function animGate() {
  const secs = ["trayectoria", "arsenal"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const visible = new Set();
  const sync = () =>
    secs.forEach((s) =>
      s.classList.toggle(
        "anim-live",
        visible.has(s) && !document.hidden && !window.hhMotion?.paused,
      ),
    );
  document.addEventListener("visibilitychange", sync);
  window.addEventListener("hh:motion", sync);
  if (!("IntersectionObserver" in window)) {
    secs.forEach((s) => visible.add(s));
    sync();
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) visible.add(en.target);
        else visible.delete(en.target);
      });
      sync();
    },
    { rootMargin: "80px 0px" },
  );
  secs.forEach((s) => io.observe(s));
})();

/* ---------- showcase rotatorio: cada herramienta pasa en grande,
   Power Automate manda (abre más tiempo y regresa cada 4) ---------- */
(function showcase() {
  const featured = document.querySelector(".tool-featured");
  if (!featured) return;

  const iconWrap = featured.querySelector(".tf-icon");
  const tagEl = featured.querySelector(".tf-tag");
  const nameEl = featured.querySelector(".tf-body h3");
  const descEl = featured.querySelector(".tf-body p");
  const certEl = featured.querySelector(".tf-cert");
  if (!iconWrap || !tagEl || !nameEl || !descEl || !certEl) return;

  const PA = {
    iconNode: iconWrap.querySelector("svg"),
    tag: tagEl.textContent,
    name: nameEl.textContent,
    desc: descEl.textContent,
    cert: certEl.innerHTML,
  };

  const english = document.documentElement.lang === "en";
  const descriptions = {
    "Power Apps": [
      "Aplicaciones de captura y aprobación.",
      "Data capture and approval applications.",
    ],
    "Power BI": [
      "Preparación, modelado y visualización de datos.",
      "Data preparation, modeling and visualization.",
    ],
    SharePoint: [
      "Colaboración y gestión documental.",
      "Collaboration and document management.",
    ],
    TradingView: [
      "Indicadores y análisis con Pine Script.",
      "Indicators and analysis with Pine Script.",
    ],
    "Copilot Studio": [
      "Diseño de agentes conversacionales.",
      "Conversational agent design.",
    ],
    Python: [
      "Análisis de datos y automatización.",
      "Data analysis and automation.",
    ],
    TypeScript: [
      "Desarrollo web con tipos estáticos.",
      "Web development with static types.",
    ],
    "React · Next.js": [
      "Interfaces y aplicaciones web.",
      "Web interfaces and applications.",
    ],
    "SQL Server": [
      "Consultas y modelos de datos relacionales.",
      "Queries and relational data models.",
    ],
    PostgreSQL: [
      "Modelado y consulta de datos.",
      "Data modeling and querying.",
    ],
    Docker: [
      "Entornos y servicios en contenedores.",
      "Containerized environments and services.",
    ],
    n8n: [
      "Flujos e integraciones entre sistemas.",
      "Workflows and system integrations.",
    ],
    "Claude · IA": [
      "Modelos de lenguaje y automatización.",
      "Language models and automation.",
    ],
    "Claude · AI": [
      "Modelos de lenguaje y automatización.",
      "Language models and automation.",
    ],
    Azure: [
      "Servicios y aplicaciones en la nube.",
      "Cloud services and applications.",
    ],
    "GitHub Actions": [
      "Automatización de integración y entrega.",
      "Integration and delivery automation.",
    ],
    FastAPI: [
      "APIs y servicios de datos con Python.",
      "Python APIs and data services.",
    ],
    "Bitcoin · Cripto": [
      "Educación y análisis de activos digitales.",
      "Digital asset education and analysis.",
    ],
    "Bitcoin · Crypto": [
      "Educación y análisis de activos digitales.",
      "Digital asset education and analysis.",
    ],
    "Gemini · OpenAI": [
      "Integración de modelos de lenguaje.",
      "Language model integration.",
    ],
    "LangChain · RAG": [
      "Recuperación de información para agentes.",
      "Information retrieval for agents.",
    ],
    "NestJS · Node": [
      "APIs y aplicaciones con TypeScript.",
      "APIs and TypeScript applications.",
    ],
    Cloudflare: [
      "Servicios web con Workers y Pages.",
      "Web services with Workers and Pages.",
    ],
    Dataverse: [
      "Datos y lógica para aplicaciones empresariales.",
      "Data and logic for business applications.",
    ],
    "WhatsApp API": ["Integraciones de mensajería.", "Messaging integrations."],
  };

  const tiles = [...document.querySelectorAll(".tool-grid .tool")];
  const tools = tiles
    .map((tile) => {
      const svg = tile.querySelector(".tool-ic svg");
      const name = tile.querySelector(".tool-n");
      const tag = tile.querySelector(".tool-t");
      return svg && name && tag
        ? {
            tile,
            iconNode: svg.cloneNode(true),
            name: name.textContent,
            tag: tag.textContent,
          }
        : null;
    })
    .filter(Boolean);
  if (!tools.length) return;

  // secuencia: PA largo al inicio, luego bloques de 4 herramientas con PA entre bloques
  const seq = [{ pa: true, dwell: 9000 }];
  tools.forEach((tool, i) => {
    seq.push({ tool, dwell: 3600 });
    if ((i + 1) % 4 === 0 && i < tools.length - 1)
      seq.push({ pa: true, dwell: 6500 });
  });

  let idx = 0,
    timer = 0,
    swapTimer = 0,
    hovered = false,
    inView = true;
  let tabVisible = document.visibilityState !== "hidden";

  function apply(step) {
    clearTimeout(swapTimer);
    featured.classList.add("tf-swapping");
    // 260ms ≈ la transición .25s de .tf-swapping en cv.css — mantener sincronizados
    swapTimer = setTimeout(() => {
      tiles.forEach((t) => t.classList.remove("is-featured"));
      if (step.pa) {
        iconWrap.replaceChildren(PA.iconNode);
        tagEl.textContent = PA.tag;
        nameEl.textContent = PA.name;
        descEl.textContent = PA.desc;
        certEl.innerHTML = PA.cert;
        featured.classList.add("is-pa");
      } else {
        featured.classList.remove("is-pa");
        iconWrap.replaceChildren(step.tool.iconNode);
        tagEl.textContent =
          (english ? "TECHNOLOGY · " : "TECNOLOGÍA · ") + step.tool.tag;
        nameEl.textContent = step.tool.name;
        descEl.textContent =
          descriptions[step.tool.name]?.[english ? 1 : 0] || step.tool.tag;
        certEl.textContent = english
          ? "APPLICATIONS · DATA · AUTOMATION"
          : "APLICACIONES · DATOS · AUTOMATIZACIÓN";
        step.tool.tile.classList.add("is-featured");
      }
      featured.classList.remove("tf-swapping");
    }, 260);
  }

  function schedule() {
    clearTimeout(timer);
    if (hovered || !inView || !tabVisible || window.hhMotion?.paused) return;
    timer = setTimeout(() => {
      idx = (idx + 1) % seq.length;
      apply(seq[idx]);
      schedule();
    }, seq[idx].dwell);
  }

  // al ocultarse (scroll o pestaña) se detiene; al volver, re-ancla en Power Automate
  function gate() {
    if (inView && tabVisible && !window.hhMotion?.paused) {
      if (idx !== 0) {
        idx = 0;
        apply(seq[0]);
      }
      schedule();
    } else {
      clearTimeout(timer);
      clearTimeout(swapTimer);
      featured.classList.remove("tf-swapping");
    }
  }

  // pausa por hover solo con puntero real (en táctil, pointerenter sin
  // pointerleave dejaría la rotación congelada); el foco de teclado también pausa
  if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
    featured.addEventListener("pointerenter", () => {
      hovered = true;
      clearTimeout(timer);
    });
    featured.addEventListener("pointerleave", () => {
      hovered = false;
      schedule();
    });
  }
  featured.addEventListener("focusin", () => {
    hovered = true;
    clearTimeout(timer);
  });
  featured.addEventListener("focusout", () => {
    hovered = false;
    schedule();
  });
  window.addEventListener("hh:motion", gate);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      (entries) => {
        inView = entries[0].isIntersecting;
        gate();
      },
      { threshold: 0.2 },
    ).observe(featured);
  }
  document.addEventListener("visibilitychange", () => {
    tabVisible = document.visibilityState === "visible";
    gate();
  });

  featured.classList.add("is-pa");
  schedule();
})();
