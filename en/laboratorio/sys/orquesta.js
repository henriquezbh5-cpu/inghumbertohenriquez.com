/* ORQUESTA — enrutamiento de aprobaciones de compra: la cadena de
   firmantes se reconstruye con cada cambio y después se ejecuta. */
(function () {
  "use strict";
  var LAB = window.LAB;

  var CENTROS = ["Operations", "Projects", "Administration", "Technology"];

  /* Umbrales de la política: una sola fuente para las reglas y los textos. */
  var U = { menor: 1000, gerencia: 10000, direccion: 50000, meta: 60 };

  /* Segundos de proceso por tipo de paso: fijos, dos corridas iguales dan lo mismo. */
  var BOT = {
    politica: 4.2,
    cumplimiento: 11.4,
    presupuesto: 8.6,
    automatica: 2.4,
    jefatura: 12.1,
    gerencia: 13.8,
    direccion: 14.6,
    proyectos: 9.2,
    emision: 10.9,
  };
  var ESCALA_SEG = 6.4; /* costo del reintento y del aviso al suplente */
  var FOLIO = 2088; /* último folio del histórico; las corridas siguen desde aquí */

  /* Condiciones que el motor evalúa en cada solicitud. */
  var REGLAS = [
    "amount above the small-purchase threshold",
    "amount above the management threshold",
    "amount above the executive threshold",
    "vendor not in the master list",
    "budget line exceeded",
    "cost center subject to project budget control",
    "urgent flag applied to SLAs",
    "approver did not respond within the SLA",
  ];

  function rutaDe(m) {
    if (m <= U.menor) return "Small purchase";
    if (m > U.direccion) return "Finance director";
    if (m > U.gerencia) return "Management";
    return "Department head";
  }

  function hh(h) {
    var k = LAB.kit;
    return (h % 1 === 0 ? k.fmt(h, 0) : k.fmt(h, 1)) + " h";
  }
  function nombrePaso(s) {
    return s.quien ? s.rol + " · " + s.quien : s.rol;
  }
  function slaPaso(s, escalado) {
    if (!s.firma) return "handled by the workflow";
    return "SLA " + hh(s.h) + (escalado ? " + escalation" : "");
  }

  /* Reglas de enrutamiento. Solo los pasos con firma consumen SLA humano;
       los demás los resuelve el flujo en segundos. */
  function cadena(c, D) {
    var p = [];
    p.push({
      id: "politica",
      rol: "Purchasing policy validation",
      h: 0,
      firma: false,
    });
    if (c.nuevo)
      p.push({
        id: "cumplimiento",
        rol: "Compliance — vendor onboarding",
        quien: D.roster.cumplimiento,
        h: 8,
        firma: true,
      });
    if (c.excedido)
      p.push({
        id: "presupuesto",
        rol: "Budget review",
        quien: D.roster.presupuesto,
        h: 12,
        firma: true,
      });
    if (c.monto <= U.menor) {
      p.push({
        id: "automatica",
        rol: "Automatic approval for a small amount",
        h: 0,
        firma: false,
      });
    } else {
      p.push({
        id: "jefatura",
        rol: "Department head",
        quien: D.roster.jefe[c.centro],
        h: c.urgente ? 4 : 8,
        firma: true,
      });
      if (c.monto > U.gerencia)
        p.push({
          id: "gerencia",
          rol: "Management — " + c.centro,
          quien: D.roster.gerente[c.centro],
          h: c.urgente ? 8 : 24,
          firma: true,
        });
      if (c.monto > U.direccion)
        p.push({
          id: "direccion",
          rol: "Finance director",
          quien: D.roster.direccion,
          h: c.urgente ? 12 : 48,
          firma: true,
        });
    }
    if (c.centro === "Projects")
      p.push({
        id: "proyectos",
        rol: "Project controls",
        quien: D.roster.proyectos,
        h: 6,
        firma: true,
      });
    p.push({
      id: "emision",
      rol: "Order issuance and notification",
      h: 0,
      firma: false,
    });

    /* El escalamiento cae siempre sobre la primera firma de la cadena. */
    var escala = -1,
      i;
    if (c.demora) {
      for (i = 0; i < p.length; i++) {
        if (p[i].firma) {
          escala = i;
          break;
        }
      }
    }
    var horas = 0,
      firmas = 0,
      seg = 0;
    p.forEach(function (s, n) {
      horas += s.h;
      seg += BOT[s.id];
      if (s.firma) firmas++;
      if (n === escala) {
        horas += s.h;
        seg += ESCALA_SEG;
      } /* ventana vencida + suplente */
    });
    return {
      pasos: p,
      horas: horas,
      firmas: firmas,
      seg: seg,
      ruta: rutaDe(c.monto),
      escala: escala,
    };
  }

  /* Padrón de firmantes y bandeja histórica, todo sintético y con semilla fija.
       El histórico se calcula con el mismo motor: los segundos de cada folio
       corresponden a su ruta, no a un número suelto. */
  function datos() {
    var k = LAB.kit,
      r = k.rng(40711),
      i;
    var nombres = [
      "R. Alvarenga",
      "M. Cañas",
      "S. Portillo",
      "D. Meléndez",
      "K. Barahona",
      "J. Escobar",
      "L. Zaldívar",
      "A. Mejía",
      "P. Cruz",
      "N. Rivas",
      "G. Solórzano",
      "T. Mendoza",
      "C. Hurtado",
      "V. Ayala",
      "F. Quintanilla",
      "B. Interiano",
    ];
    for (i = nombres.length - 1; i > 0; i--) {
      /* barajado determinista */
      var j = Math.floor(r() * (i + 1)),
        t = nombres[i];
      nombres[i] = nombres[j];
      nombres[j] = t;
    }
    var D = {
      roster: {
        cumplimiento: nombres[0],
        presupuesto: nombres[1],
        direccion: nombres[2],
        proyectos: nombres[3],
        suplente: nombres[4],
        jefe: {},
        gerente: {},
      },
      hist: [],
    };
    CENTROS.forEach(function (c, n) {
      D.roster.jefe[c] = nombres[5 + n];
      D.roster.gerente[c] = nombres[9 + n];
    });

    for (i = 0; i < 5; i++) {
      var c = {
        monto: Math.round((900 + r() * 116000) / 500) * 500,
        centro: k.pick(r, CENTROS),
        nuevo: r() < 0.3,
        urgente: r() < 0.35,
        excedido: r() < 0.25,
        demora: r() < 0.34,
      };
      var res = cadena(c, D);
      D.hist.push({
        folio: "SC-" + (FOLIO - i),
        centro: c.centro,
        monto: c.monto,
        ruta: res.ruta,
        firmas: res.firmas,
        seg: res.seg,
        escalada: res.escala >= 0,
      });
    }
    return D;
  }

  LAB.register({
    id: "orquesta",
    name: "ORQUESTA",
    family: "procesos",
    tagline: "Multilevel approvals",
    title: "Purchase approval routing",
    intro:
      "Change the amount and request conditions: the approval chain builds itself from the purchasing policy rules. Then run it and compare human waiting time with the workflow's processing time.",
    spec: {
      trigger:
        "Submission of a request form through the internal procurement portal.",
      systems:
        "Power Automate cloud workflows over SharePoint lists; approvals and email notifications, with the signed record stored in the department's document library.",
      output:
        "An approved purchase order, with a record of who approved it, when and which rule triggered each step.",
      failure:
        "If an approver does not respond within the SLA, the workflow retries, escalates to the configured backup and notifies the requester without losing the request.",
    },
    impact: [
      ["32 h", "approval waiting time eliminated by the workflow"],
      ["41 s", "workflow cycle from request to issued order"],
      ["100%", "approvals recorded with who, when and which rule"],
    ],

    render: function (host, k) {
      var D = datos(),
        C = k.C;
      var corriendo = false,
        sucio = false,
        ejecuciones = 0;
      var firmaPrev = "",
        sigPrev = "",
        actual = null,
        cfgActual = null,
        pasos = null;

      var ctl = k.controls([
        {
          k: "monto",
          t: "range",
          label: "Requested amount",
          min: 500,
          max: 150000,
          step: 500,
          value: 26000,
          suffix: "USD",
        },
        {
          k: "centro",
          t: "select",
          label: "Cost center",
          options: CENTROS,
          value: "Operations",
        },
        { k: "nuevo", t: "check", label: "New vendor", value: false },
        { k: "urgente", t: "check", label: "Urgent", value: false },
        { k: "excedido", t: "check", label: "Budget exceeded", value: false },
        {
          k: "demora",
          t: "check",
          label: "Unresponsive approver",
          value: false,
        },
        { k: "run", t: "button", label: "Run workflow", primary: true },
      ]);
      host.appendChild(ctl.node);

      var kp = k.kpis([
        ["Human approvers", "—"],
        ["Approval waiting time", "—"],
        ["Workflow cycle", "—", "up"],
        ["Routing by amount", "—"],
      ]);
      host.appendChild(kp.node);

      /* Nota bajo el número: el tono de color nunca viaja solo. Se arma con
               nodos y estilo por propiedad; la política de seguridad del sitio
               bloquea los atributos style que llegan dentro de marcado. */
      function kpi(i, valor, nota, tono) {
        kp.set(i, valor, tono || "");
        var v = kp.node.children[i].children[0];
        var sp = k.txt("span", "mono", nota);
        sp.style.display = "block";
        sp.style.fontSize = "10px";
        sp.style.fontWeight = "600";
        sp.style.marginTop = "5px";
        sp.style.letterSpacing = ".02em";
        sp.style.color = "var(--label)";
        v.appendChild(sp);
      }

      var g = k.el("div", "grid2 wide-left");
      host.appendChild(g);

      var izq = k.panel();
      izq.appendChild(
        k.txt("div", "mono-head", "Approval chain — rebuilt after each change"),
      );
      var cajaPasos = k.el("div");
      izq.appendChild(cajaPasos);
      var h2 = k.txt("div", "mono-head", "Which rule triggered each step");
      h2.style.marginTop = "18px";
      izq.appendChild(h2);
      var ins = k.insights();
      izq.appendChild(ins.node);
      g.appendChild(izq);

      var der = k.el("div", "stack");
      var cb = k.chartbox(
        "Escalation by amount",
        "Approval waiting time by amount, under the current conditions.",
      );
      der.appendChild(cb.node);
      var pLog = k.panel();
      pLog.appendChild(k.txt("div", "mono-head", "Execution log"));
      var log = k.log("178px");
      pLog.appendChild(log.node);
      der.appendChild(pLog);
      g.appendChild(der);

      var pCmp = k.panel();
      pCmp.appendChild(
        k.txt("div", "mono-head", "Cycle comparison — the same request"),
      );
      var bars = k.bars();
      pCmp.appendChild(bars.node);
      var nota = k.txt("div", "mono", "");
      nota.style.marginTop = "12px";
      nota.style.fontSize = "11.5px";
      nota.style.lineHeight = "1.6";
      nota.style.color = "var(--label)";
      pCmp.appendChild(nota);
      host.appendChild(pCmp);

      var cols = [
        { t: "Reference" },
        { t: "Cost center" },
        { t: "Amount", r: true },
        { t: "Route" },
        { t: "Approvals", r: true },
        { t: "Workflow cycle", r: true },
        { t: "Status" },
      ];
      function celdas(h) {
        return [
          h.folio,
          h.centro,
          k.money(h.monto),
          h.ruta,
          String(h.firmas),
          k.fmt(h.seg, 1) + " s",
          {
            html: h.escalada
              ? k.pill("warn", "Issued after escalation")
              : k.pill("ok", "Issued"),
          },
        ];
      }
      var tb = k.table(cols, D.hist.map(celdas));
      var pTab = k.panel();
      pTab.appendChild(k.txt("div", "mono-head", "Latest processed requests"));
      pTab.appendChild(tb.node);
      host.appendChild(pTab);

      function fila(cs) {
        var tr = document.createElement("tr");
        cs.forEach(function (c, i) {
          tr.appendChild(
            c && typeof c === "object" && c.html != null
              ? k.el("td", cols[i].r ? "r" : null, c.html)
              : k.txt("td", cols[i].r ? "r" : null, String(c)),
          );
        });
        return tr;
      }

      /* ---------- gráfica: curva de escalamiento ---------- */
      function curva(c) {
        var pts = [],
          m;
        for (m = 500; m <= 150000; m += 500) {
          pts.push({
            x: m,
            y: cadena(
              {
                monto: m,
                centro: c.centro,
                nuevo: c.nuevo,
                urgente: c.urgente,
                excedido: c.excedido,
                demora: c.demora,
              },
              D,
            ).horas,
          });
        }
        return pts;
      }
      var base = curva({
        centro: "Operations",
        nuevo: false,
        urgente: false,
        excedido: false,
        demora: false,
      });
      var ch = k.chart(cb.canvas, {
        type: "line",
        data: {
          datasets: [
            {
              label: "Under the current conditions",
              data: [],
              stepped: "after",
              fill: true,
              borderColor: C.teal,
              backgroundColor: "rgba(45,212,191,.10)",
              borderWidth: 2,
              pointRadius: 0,
            },
            {
              label: "Minimum chain, based on amount alone",
              data: base,
              stepped: "after",
              fill: false,
              borderColor: C.violet,
              borderDash: [5, 4],
              borderWidth: 1.5,
              pointRadius: 0,
            },
            {
              label: "Selected amount",
              type: "scatter",
              data: [],
              borderColor: C.amber,
              backgroundColor: C.amber,
              pointRadius: 5,
              pointHoverRadius: 7,
            },
          ],
        },
        options: {
          scales: {
            x: Object.assign({}, k.AXIS_BARE, {
              type: "linear",
              min: 500,
              max: 150000,
              ticks: {
                padding: 8,
                maxTicksLimit: 5,
                callback: function (v) {
                  return k.money(v);
                },
              },
            }),
            y: Object.assign({}, k.AXIS, {
              beginAtZero: true,
              ticks: {
                padding: 8,
                callback: function (v) {
                  return v + " h";
                },
              },
            }),
          },
          plugins: {
            legend: { display: true, position: "bottom" },
            tooltip: {
              callbacks: {
                label: function (x) {
                  return (
                    x.dataset.label +
                    ": " +
                    k.money(x.parsed.x) +
                    " · " +
                    hh(x.parsed.y) +
                    " of waiting time"
                  );
                },
              },
            },
          },
        },
      });

      /* ---------- reconstrucción en vivo ---------- */
      function cfg() {
        return {
          monto: ctl.get("monto"),
          centro: ctl.get("centro"),
          nuevo: ctl.get("nuevo"),
          urgente: ctl.get("urgente"),
          excedido: ctl.get("excedido"),
          demora: ctl.get("demora"),
        };
      }

      function explicar(c, r) {
        ins.clear();
        var e = k.escapeHtml;
        if (c.nuevo)
          ins.add(
            "violet",
            "+",
            "<b>Compliance</b> is required because the vendor is not in the master list: onboarding and document validation must happen before any approval.",
          );
        if (c.excedido)
          ins.add(
            "amber",
            "!",
            "<b>Budget review</b> is required because the budget line was exceeded. The workflow requires written justification before continuing.",
          );
        if (c.monto <= U.menor) {
          ins.add(
            "green",
            "=",
            "The amount is approved automatically: <b>" +
              e(k.money(c.monto)) +
              " does not exceed " +
              e(k.money(U.menor)) +
              "</b>, the small-purchase threshold. No approval is required based on the amount.",
          );
        } else {
          ins.add(
            "teal",
            "$",
            "The <b>department head</b> is required because the amount exceeds " +
              e(k.money(U.menor)) +
              ".",
          );
          if (c.monto > U.gerencia)
            ins.add(
              "teal",
              "$",
              "<b>Management — " +
                e(c.centro) +
                "</b> is required because the amount exceeds " +
                e(k.money(U.gerencia)) +
                ".",
            );
          if (c.monto > U.direccion)
            ins.add(
              "teal",
              "$",
              "The <b>finance director</b> is required because the amount exceeds " +
                e(k.money(U.direccion)) +
                ".",
            );
        }
        if (c.centro === "Projects")
          ins.add(
            "cyan",
            ">",
            "<b>Project controls</b> is required because the cost center is Projects: the request is checked against the project budget before issuance.",
          );
        if (c.urgente && c.monto > U.menor)
          ins.add(
            "cyan",
            "<",
            "The <b>urgent</b> flag reduces the SLAs for the department head, management and executive team by half or more. The approvers remain the same.",
          );
        if (c.urgente && c.monto <= U.menor)
          ins.add(
            "amber",
            "<",
            "The <b>urgent</b> flag only reduces SLAs that depend on the amount. None apply at this amount, so waiting time does not change.",
          );
        if (r.escala >= 0) {
          var s = r.pasos[r.escala];
          ins.add(
            "rose",
            "!",
            "<b>" +
              e(s.rol) +
              "</b> lets the response window expire. The workflow retries, escalates to the backup approver <b>" +
              e(D.roster.suplente) +
              "</b> and notifies the requester: another response window is added, lasting " +
              e(hh(s.h)) +
              " to the waiting time.",
          );
        } else if (c.demora) {
          ins.add(
            "amber",
            "!",
            "There is no human approver in this chain, so there is nobody to escalate to: the workflow handles the entire request.",
          );
        }
        if (
          !c.nuevo &&
          !c.excedido &&
          !c.urgente &&
          !c.demora &&
          c.centro !== "Projects" &&
          c.monto > U.menor
        ) {
          ins.add(
            "teal",
            "·",
            "With no additional conditions, the chain results in " +
              r.firmas +
              " approvals and " +
              e(hh(r.horas)) +
              " of waiting time.",
          );
        }
      }

      function pintar() {
        var c = cfg(),
          r = cadena(c, D);
        cfgActual = c;
        actual = r;

        cajaPasos.innerHTML = "";
        pasos = k.steps(
          r.pasos.map(function (s, i) {
            return { n: nombrePaso(s), ms: slaPaso(s, i === r.escala) };
          }),
        );
        cajaPasos.appendChild(pasos.node);

        var notaFirmas = "standard chain";
        if (!r.firmas) notaFirmas = "no human approval";
        else if (r.firmas >= 4) notaFirmas = "long chain";
        kpi(0, String(r.firmas), notaFirmas, r.firmas >= 4 ? "warn" : "");

        var notaSla = r.horas
            ? "within the target of " + hh(U.meta)
            : "no human waiting time",
          tonoSla = "";
        if (r.escala >= 0) {
          notaSla = "includes escalation";
          tonoSla = "warn";
        }
        if (r.horas > U.meta) {
          notaSla = "above the target of " + hh(U.meta);
          tonoSla = "bad";
        }
        kpi(1, hh(r.horas), notaSla, tonoSla);
        kpi(2, k.fmt(r.seg, 1) + " s", "engine estimate", "up");
        kpi(
          3,
          r.ruta,
          c.excedido
            ? "flagged for budget review"
            : "based on the amount threshold",
          c.excedido ? "warn" : "",
        );

        explicar(c, r);

        var mx = Math.max(r.horas, 0.5);
        bars.clear();
        bars.add(
          "Manual route — approval waiting time",
          r.horas,
          mx,
          C.violet,
          r.horas ? hh(r.horas) : "no approvals",
        );
        bars.add(
          "Automated workflow — assembly and handoff",
          r.seg / 3600,
          mx,
          C.teal,
          k.fmt(r.seg, 1) + " s",
        );
        nota.textContent =
          (r.horas
            ? "Manual route: " +
              k.fmt(r.horas / 8, 1) +
              " business days of handoffs between inboxes" +
              (r.escala >= 0
                ? ", including the expired window and handoff to the backup approver"
                : "")
            : "At this amount, nobody needs to approve: the manual route and workflow do the same work, one in minutes of processing and the other in seconds") +
          ". This compares assembling and handing off the request, not the time each person takes to decide: that decision remains theirs.";

        cb.cap(
          "Cost center " +
            c.centro +
            (c.nuevo ? ", new vendor" : "") +
            (c.excedido ? ", budget exceeded" : "") +
            (c.urgente ? ", urgent" : "") +
            (c.demora ? ", with escalation" : "") +
            ". The marked point is the selected amount.",
        );

        if (ch) {
          /* La curva solo depende de las condiciones, no del monto: se
                       recalcula al cambiarlas, no en cada paso del deslizador. */
          var sig = [c.centro, c.nuevo, c.urgente, c.excedido, c.demora].join(
            "|",
          );
          if (sig !== sigPrev) {
            sigPrev = sig;
            ch.data.datasets[0].data = curva(c);
          }
          ch.data.datasets[2].data = [{ x: c.monto, y: r.horas }];
          ch.update("none");
        }

        var firma =
          r.pasos
            .map(function (s) {
              return s.id;
            })
            .join(">") + (r.escala >= 0 ? "!" : "");
        if (firma !== firmaPrev) {
          firmaPrev = firma;
          log.push(
            "hl",
            "Approval chain recalculated: " +
              r.pasos.length +
              " steps, " +
              r.firmas +
              " signatures, " +
              hh(r.horas) +
              " of waiting time",
          );
        }
      }

      /* Devuelve los pasos a su estado inicial sin perder el SLA de cada uno. */
      function reiniciarPasos(r) {
        r.pasos.forEach(function (s, i) {
          pasos.set(i, "", slaPaso(s, i === r.escala));
        });
      }

      /* ---------- ejecución animada ---------- */
      async function ejecutar() {
        if (corriendo) return;
        corriendo = true;
        ctl.busy("run", true);

        var r = actual,
          c = cfgActual,
          seg = 0;
        reiniciarPasos(r);
        ejecuciones++;
        var folio = "SC-" + (FOLIO + ejecuciones);
        log.push(
          "in",
          "Request " +
            folio +
            " received from the portal · " +
            k.money(c.monto) +
            " · " +
            c.centro,
        );

        for (var i = 0; i < r.pasos.length; i++) {
          var s = r.pasos[i],
            d = BOT[s.id];
          pasos.set(i, "run", "in progress");
          await k.wait(
            360 + Math.round(Math.random() * 110),
          ); /* jitter solo cosmético */

          if (i === r.escala) {
            pasos.set(i, "fail", "no response within " + hh(s.h));
            log.push(
              "er",
              s.rol +
                ": " +
                s.quien +
                " did not respond within the SLA of " +
                hh(s.h),
            );
            await k.wait(420);
            log.push(
              "wa",
              "Retry with escalation to the backup approver " +
                D.roster.suplente +
                "; notification sent to the requester",
            );
            await k.wait(420);
            d += ESCALA_SEG;
            seg += d;
            pasos.set(i, "done", k.fmt(d, 1) + " s · approved by the backup");
            log.push(
              "ok",
              "Approved by the backup " +
                D.roster.suplente +
                ", request record preserved",
            );
            continue;
          }

          seg += d;
          pasos.set(i, "done", k.fmt(d, 1) + " s");
          if (s.firma)
            log.push(
              "ok",
              "Signed: " + s.rol + " — " + s.quien + " (SLA " + hh(s.h) + ")",
            );
          else log.push("in", s.rol + " handled by the workflow");
        }

        kpi(2, k.fmt(seg, 1) + " s", "measured in " + folio, "up");
        log.push(
          "hl",
          "Order issued — " +
            r.firmas +
            " approvals recorded, workflow cycle " +
            k.fmt(seg, 1) +
            " s versus " +
            hh(r.horas) +
            " of human waiting time",
        );

        tb.body.insertBefore(
          fila(
            celdas({
              folio: folio,
              centro: c.centro,
              monto: c.monto,
              ruta: r.ruta,
              firmas: r.firmas,
              seg: seg,
              escalada: r.escala >= 0,
            }),
          ),
          tb.body.firstChild,
        );
        while (tb.body.children.length > 6)
          tb.body.removeChild(tb.body.lastChild);

        ctl.busy("run", false);
        corriendo = false;
        if (sucio) {
          sucio = false;
          pintar();
        } /* movió controles durante la corrida */
      }

      ctl.on(function () {
        if (corriendo) {
          sucio = true;
          return;
        }
        pintar();
      });
      ctl.onClick("run", ejecutar);

      log.push(
        "in",
        "Rules engine loaded: " +
          REGLAS.length +
          " purchasing policy conditions",
      );
      pintar();
    },
  });
})();
