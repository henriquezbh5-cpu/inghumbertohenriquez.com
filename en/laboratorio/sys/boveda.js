(function () {
  "use strict";
  var LAB = window.LAB;

  /* Tres documentos sintéticos que entran por el mismo esquema de campos.
       Las confianzas salen de una semilla fija: todo visitante ve los mismos
       números. Campo: [nombre, valor, confianza, crítico, motivo de la duda]. */
  function datos() {
    var r = LAB.kit.rng(15230);
    function c(a, b) {
      return Math.round((a + r() * (b - a)) * 10) / 10;
    }
    return [
      {
        id: "factura",
        n: "Vendor invoice (scanned PDF)",
        corto: "Scanned invoice",
        origen: "Email attachment in the intake inbox",
        paginas: 1,
        reglas: 9,
        seg: 7.8,
        destino: "Accounts payable",
        clave: "FAC-0084172",
        campos: [
          [
            "Vendor",
            "Suministros Aguacayo, S.A. de C.V.",
            c(96, 99),
            false,
            "Clean printed header",
          ],
          [
            "Tax registration number",
            "0614-250719-102-3",
            c(93, 98),
            false,
            "Digits separated by hyphens",
          ],
          [
            "Document number",
            "FAC-0084172",
            c(80, 88),
            true,
            "Dot-matrix printing with merged digits",
          ],
          [
            "Issue date",
            "14/08/2026",
            c(90, 97),
            false,
            "Ambiguous day/month format",
          ],
          [
            "Payment terms",
            "Net 30",
            c(66, 74),
            false,
            "Unlabeled free text at the bottom",
          ],
          [
            "Subtotal",
            "$4,182.50",
            c(95, 99),
            false,
            "Well-aligned totals column",
          ],
          [
            "VAT 13%",
            "$543.73",
            c(88, 95),
            false,
            "Stamp overlapping the number",
          ],
          [
            "Total",
            "$4,726.23",
            c(96, 99),
            true,
            "Amount repeated in digits and words",
          ],
        ],
      },
      {
        id: "contrato",
        n: "Service agreement (12 pages)",
        corto: "12-page agreement",
        origen: "Monitored folder for incoming agreements",
        paginas: 12,
        reglas: 12,
        seg: 19.4,
        destino: "Agreement record",
        clave: "CTR-2026-0117",
        campos: [
          [
            "Counterparty",
            "Terrasol Logística, S.A.",
            c(94, 98),
            false,
            "Name in the opening party identification",
          ],
          [
            "Purpose",
            "Overland dry freight transport",
            c(80, 88),
            false,
            "Clause written as a long paragraph",
          ],
          [
            "Effective from",
            "01/09/2026",
            c(90, 96),
            false,
            "Date written in words and digits",
          ],
          [
            "Effective until",
            "31/08/2027",
            c(85, 93),
            true,
            "Depends on an extension clause",
          ],
          [
            "Monthly amount",
            "$3,150.00",
            c(83, 92),
            true,
            "Amount written in words within the paragraph",
          ],
          [
            "Late-payment penalty",
            "1.5% monthly on the balance",
            c(58, 68),
            false,
            "Percentage hidden in an appendix",
          ],
          [
            "Automatic renewal",
            "Yes, with 60 days' notice",
            c(61, 71),
            false,
            "Condition containing a double negation",
          ],
          [
            "Authorized signatory",
            "R. Escalante, authorized representative",
            c(70, 79),
            false,
            "Signature over the printed name",
          ],
        ],
      },
      {
        id: "acta",
        n: "Goods receipt (phone photo)",
        corto: "Goods receipt in a phone photo",
        origen: "Image sent by the carrier",
        paginas: 1,
        reglas: 7,
        seg: 6.1,
        destino: "Inventory and claims",
        clave: "OC-2026-3391",
        campos: [
          [
            "Branch",
            "West Warehouse 02",
            c(88, 95),
            false,
            "Warehouse stamp clipped at the edge",
          ],
          [
            "Purchase order",
            "OC-2026-3391",
            c(74, 84),
            true,
            "Photo glare over the code",
          ],
          [
            "Receipt date",
            "22/08/2026",
            c(80, 90),
            false,
            "Handwritten on the line",
          ],
          [
            "Declared packages",
            "48",
            c(85, 93),
            false,
            "Readable preprinted box",
          ],
          [
            "Packages received",
            "46",
            c(69, 78),
            true,
            "Corrected number written over the original",
          ],
          ["Damaged packages", "2", c(52, 63), false, "Faint pencil mark"],
          [
            "Received by",
            "M. Portillo, warehouse worker",
            c(63, 73),
            false,
            "Connected handwriting",
          ],
          [
            "Handwritten note",
            "Two boxes wet at the corner",
            c(41, 55),
            false,
            "Line outside the box",
          ],
        ],
      },
    ];
  }

  LAB.register({
    id: "boveda",
    name: "BÓVEDA",
    family: "procesos",
    tagline: "Field extraction",
    title: "Field extraction with a confidence threshold",
    intro:
      "A scanned invoice, a twelve-page agreement and a phone photo use the same field schema. Adjust the threshold and choose what to do with an uncertain critical field: see which values are written automatically and which wait for a person.",
    spec: {
      trigger:
        "The document arrives as an email attachment or is placed in a monitored folder. The workflow is event-driven rather than scheduled, and archives the original before processing it.",
      systems:
        "OCR reads the PDF or photo; a language model maps the text to the field schema; rules check format, ranges and consistency; the accounting system is updated using the document number as an idempotency key.",
      output:
        "Structured fields with individual confidence scores and reasons for uncertainty, plus a review queue containing only uncertain fields and the image crop from which each value was read.",
      failure:
        "Fields below the threshold are not written. For an uncertain critical field, the selected policy determines whether to hold the entire document or load the reliable fields and leave the critical field pending. No values are invented.",
    },
    impact: [
      ["1 schema", "for PDFs, scans and phone photos"],
      ["6 to 20 s", "reading time per document"],
      ["Zero", "fields written below the threshold"],
    ],

    render: function (host, k) {
      var DOCS = datos();
      var campos = [];
      var docId = DOCS[0].id;
      var corrida = 0;
      var animando = false;

      var ctl = k.controls([
        {
          k: "doc",
          t: "select",
          label: "Input document",
          value: DOCS[0].id,
          options: DOCS.map(function (d) {
            return { v: d.id, t: d.n };
          }),
        },
        {
          k: "umbral",
          t: "range",
          label: "Confidence threshold",
          min: 50,
          max: 95,
          step: 5,
          value: 75,
          suffix: "%",
        },
        {
          k: "politica",
          t: "select",
          label: "When a critical field is uncertain",
          value: "retener",
          options: [
            { v: "retener", t: "Hold the entire document" },
            { v: "parcial", t: "Load reliable fields and leave it pending" },
          ],
        },
        { k: "run", t: "button", label: "Process document", primary: true },
      ]);
      host.appendChild(ctl.node);

      var kp = k.kpis([
        ["Fields read", "0 / 8"],
        ["Written automatically", "0", "up"],
        ["Sent for human review", "0", "warn"],
        ["Reading time", "—"],
      ]);
      host.appendChild(kp.node);

      var pRec = k.panel();
      pRec.appendChild(k.txt("div", "mono-head", "Document pipeline"));
      var pipe = k.pipe([
        { n: "Monitored folder", m: "Arrival event" },
        { n: "OCR", m: "Text with positions" },
        { n: "Model", m: "Schema mapping" },
        { n: "Rules", m: "Format and consistency" },
        { n: "Threshold", m: "Confidence per field" },
        { n: "Destination", m: "Idempotent load" },
      ]);
      pRec.appendChild(pipe.node);
      host.appendChild(pRec);

      var fila1 = k.el("div", "grid2 wide-left");
      host.appendChild(fila1);

      /* Panel titulado: devuelve el contenedor donde cuelga el contenido. */
      function seccion(padre, titulo, hijo) {
        var p = k.panel();
        var h = k.txt("div", "mono-head", titulo);
        p.appendChild(h);
        if (hijo) p.appendChild(hijo);
        padre.appendChild(p);
        return { panel: p, head: h };
      }

      /* Izquierda: los campos leídos, uno por fila, con su confianza. */
      var izq = k.panel();
      var cab = k.el("div");
      cab.style.cssText =
        "display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px";
      var titulo = k.txt("div", "mono-head", "Extracted fields");
      titulo.style.margin = "0";
      var estado = k.el("div", null, "");
      cab.appendChild(titulo);
      cab.appendChild(estado);
      izq.appendChild(cab);
      var caja = k.el("div", "fields");
      izq.appendChild(caja);
      var ruta = k.txt("div", "mono", "");
      ruta.style.cssText = "margin-top:11px;font-size:11px;color:" + k.C.label;
      izq.appendChild(ruta);
      fila1.appendChild(izq);

      /* Derecha: reparto del documento y registro de la corrida. */
      var der = k.el("div", "stack");
      var box = k.chartbox(
        "Document processing split",
        "Automatically written fields versus fields reviewed by a person",
        "176px",
      );
      der.appendChild(box.node);
      var log = k.log("186px");
      seccion(der, "Run log", log.node);
      fila1.appendChild(der);

      var fila2 = k.el("div", "grid2 wide-left");
      host.appendChild(fila2);
      var colaHost = k.el("div");
      var tCola = seccion(fila2, "Review queue", colaHost).head;
      var bars = k.bars();
      seccion(fila2, "All three documents under this threshold", bars.node);
      var ins = k.insights();
      seccion(host, "How to read the threshold", ins.node);

      var ch = k.chart(box.canvas, {
        type: "doughnut",
        data: {
          labels: ["Written automatically", "Sent for human review"],
          datasets: [
            {
              data: [0, 0],
              backgroundColor: [k.C.teal, k.C.amber],
              borderColor: k.C.bg2,
              borderWidth: 3,
              hoverOffset: 4,
            },
          ],
        },
        options: { cutout: "62%", plugins: { legend: { position: "bottom" } } },
      });

      function doc() {
        for (var i = 0; i < DOCS.length; i++) {
          if (DOCS[i].id === docId) return DOCS[i];
        }
        return DOCS[0];
      }

      /* Cuántos campos de un documento cualquiera caen bajo el umbral. */
      function bajos(d, u) {
        var n = 0;
        d.campos.forEach(function (cp) {
          if (cp[2] < u) n++;
        });
        return n;
      }

      /* Arma las filas del documento activo, todas todavía en blanco. */
      function construir(d) {
        campos = [];
        caja.innerHTML = "";
        d.campos.forEach(function (cp) {
          var row = k.el("div", "fx");
          row.appendChild(k.txt("div", "fk", cp[0]));

          var fv = k.el("div", "fv");
          fv.style.cssText = "display:flex;align-items:center;gap:10px";
          var val = k.txt("span", null, "—");
          val.style.cssText =
            "overflow:hidden;text-overflow:ellipsis;white-space:nowrap";
          var tag = k.el("span", null, "");
          tag.style.flex = "none";
          fv.appendChild(val);
          fv.appendChild(tag);
          row.appendChild(fv);

          var conf = k.el("div", "conf");
          var pista = k.el("div", "t");
          var relleno = k.el("div", "f");
          relleno.style.width = "0%";
          pista.appendChild(relleno);
          conf.appendChild(pista);
          var pc = k.txt("span", null, "—");
          conf.appendChild(pc);
          row.appendChild(conf);

          caja.appendChild(row);
          campos.push({
            nombre: cp[0],
            valor: cp[1],
            conf: cp[2],
            critico: cp[3],
            motivo: cp[4],
            row: row,
            val: val,
            tag: tag,
            fill: relleno,
            pc: pc,
            leido: false,
          });
        });
      }

      /* Pie del panel de campos: de dónde viene, a dónde va y con qué política. */
      function pintarRuta(d, politica) {
        ruta.textContent =
          "Input: " +
          d.origen +
          "  · Destination: " +
          d.destino +
          "  · Idempotency key: " +
          d.clave +
          "  · Policy for an uncertain critical field: " +
          (politica === "retener"
            ? "hold the entire document"
            : "load reliable fields and leave it pending");
      }

      /* Reevalúa todo contra el umbral y la política vigentes. En vivo. */
      function aplicar() {
        var u = ctl.get("umbral");
        var politica = ctl.get("politica");
        var d = doc();
        var sobre = 0,
          dudosos = 0,
          leidos = 0,
          criticoDudoso = false;

        campos.forEach(function (f) {
          if (f.leido && f.conf < u && f.critico) criticoDudoso = true;
        });
        var retenido = criticoDudoso && politica === "retener";

        campos.forEach(function (f) {
          if (!f.leido) {
            f.val.textContent = "—";
            f.tag.innerHTML = "";
            f.fill.style.width = "0%";
            f.pc.textContent = "—";
            f.row.style.background = "";
            return;
          }
          leidos++;
          var ok = f.conf >= u;
          if (ok) {
            sobre++;
          } else {
            dudosos++;
          }
          f.val.textContent = f.valor;
          if (!ok) {
            f.tag.innerHTML = f.critico
              ? k.pill("bad", "uncertain critical field")
              : k.pill("warn", "for review");
            f.fill.style.background = f.critico ? k.C.rose : k.C.amber;
            f.row.style.background = "rgba(251,191,36,.07)";
          } else if (retenido) {
            f.tag.innerHTML = k.pill("idle", "waiting");
            f.fill.style.background = k.C.label;
            f.row.style.background = "";
          } else {
            f.tag.innerHTML = k.pill("ok", "written");
            f.fill.style.background = k.C.teal;
            f.row.style.background = "";
          }
          f.fill.style.width = f.conf + "%";
          f.pc.textContent = k.fmt(f.conf, 1) + "%";
        });

        /* Retener significa que no se escribe ni una línea: los campos
                   buenos quedan en espera, no entran a medias al destino. Lo que
                   una persona debe resolver sigue siendo solo lo dudoso. */
        var escritos = retenido ? 0 : sobre;
        var enCola = dudosos;

        kp.set(0, leidos + " / " + campos.length);
        kp.set(1, String(escritos), escritos ? "up" : retenido ? "bad" : "");
        kp.set(2, String(enCola), enCola ? "warn" : "");

        if (leidos < campos.length) {
          estado.innerHTML = k.pill("run", "reading document");
        } else if (retenido) {
          estado.innerHTML = k.pill("bad", "held: uncertain critical field");
        } else if (criticoDudoso) {
          estado.innerHTML = k.pill(
            "warn",
            "partial load: critical field pending",
          );
        } else if (dudosos) {
          estado.innerHTML = k.pill(
            "warn",
            "writes " + escritos + " of " + campos.length,
          );
        } else {
          estado.innerHTML = k.pill(
            "ok",
            "writes the " + campos.length + " fields",
          );
        }

        if (ch) {
          ch.data.datasets[0].data = [escritos, enCola];
          ch.update();
        }
        box.cap(
          retenido
            ? "Uncertain critical field: no data from this document is written"
            : escritos +
                " fields enter automatically, " +
                enCola +
                (enCola === 1
                  ? " field is reviewed by a person"
                  : " fields are reviewed by a person"),
        );

        pintarRuta(d, politica);
        pintarPipe(d, escritos, retenido, criticoDudoso);
        pintarCola(u, retenido, leidos);
        pintarReparto(u);
        lectura(u, d, retenido, criticoDudoso, politica);
      }

      /* Mientras corre la lectura el recorrido lo maneja procesar(): aquí
               solo se pinta el estado de reposo, ya terminado. */
      function pintarPipe(d, escritos, retenido, criticoDudoso) {
        if (animando) return;
        pipe.set(0, "done", "arrival event");
        pipe.set(1, "done", d.paginas + (d.paginas === 1 ? " page" : " pages"));
        pipe.set(2, "done", campos.length + " fields mapped");
        pipe.set(3, "done", d.reglas + " rules applied");
        pipe.set(
          4,
          retenido ? "fail" : "done",
          escritos + " above the threshold",
        );
        pipe.set(
          5,
          retenido ? "fail" : "done",
          retenido
            ? "nothing written, document held"
            : escritos +
                " fields to " +
                d.destino +
                (criticoDudoso ? " + critical field pending" : ""),
        );
      }

      /* La cola contiene solo lo dudoso, con el motivo escrito. */
      function pintarCola(u, retenido, leidos) {
        var filas = [];
        campos.forEach(function (f) {
          if (!f.leido || f.conf >= u) return;
          filas.push([
            {
              html:
                (f.critico ? k.pill("bad", "critical") + " " : "") +
                k.escapeHtml(f.nombre),
            },
            f.valor,
            k.fmt(f.conf, 1) + "%",
            f.motivo,
          ]);
        });

        tCola.textContent = retenido
          ? "Review queue — nothing is written until resolved"
          : filas.length
            ? "Review queue — uncertain fields only"
            : "Review queue — empty at this threshold";

        colaHost.innerHTML = "";
        if (!filas.length) {
          var vacio = k.txt(
            "div",
            "mono",
            leidos
              ? "No queue: the " +
                  leidos +
                  " fields read exceed the threshold of " +
                  u +
                  "%."
              : "No queue yet: the document has not been read.",
          );
          vacio.style.color = k.C.label;
          vacio.style.fontSize = "12px";
          vacio.style.padding = "14px 0";
          colaHost.appendChild(vacio);
          return;
        }
        colaHost.appendChild(
          k.table(
            [
              { t: "Field" },
              { t: "Extracted value" },
              { t: "Confidence", r: true },
              { t: "Reason for uncertainty" },
            ],
            filas,
          ).node,
        );
      }

      /* El mismo umbral aplicado a los tres documentos, para que se vea
               que la foto de celular llega mucho más sucia que el PDF. */
      function pintarReparto(u) {
        bars.clear();
        DOCS.forEach(function (d) {
          var total = d.campos.length;
          var solos = total - bajos(d, u);
          var activo = d.id === docId;
          bars.add(
            d.corto + (activo ? " · on screen" : ""),
            solos,
            total,
            activo ? k.C.teal : k.C.blue,
            solos + " of " + total,
          );
        });
      }

      /* La consecuencia de mover el umbral y de la política, en dos líneas. */
      function lectura(u, d, retenido, criticoDudoso, politica) {
        var aqui = bajos(d, u);
        var alto = bajos(d, 90);
        var bajo = bajos(d, 60);
        var criticos = d.campos
          .filter(function (cp) {
            return cp[3];
          })
          .map(function (cp) {
            return cp[0];
          })
          .join(" and ");

        ins.clear();
        ins.add(
          "amber",
          "%",
          "At a threshold of <b>" +
            u +
            "%</b>, a person reviews <b>" +
            aqui +
            "</b> of " +
            d.campos.length +
            " fields in this document. At 90%, that would be " +
            alto +
            "; at 60%, only " +
            bajo +
            " and the rest would be loaded without review. Higher thresholds mean fewer errors and more human work.",
        );
        ins.add(
          criticoDudoso ? "rose" : "teal",
          "!",
          "Critical fields here: <b>" +
            k.escapeHtml(criticos) +
            "</b>. " +
            (criticoDudoso
              ? retenido
                ? "One fell below the threshold and the policy <b>holds</b> the document: nothing is written, and the entire document waits."
                : "One fell below the threshold and the policy is <b>partial loading</b>: reliable fields are loaded, and the critical field is marked pending in the destination."
              : politica === "retener"
                ? "None fell below the threshold. If one did, the current policy would <b>hold the entire document</b>: no partial data would be written. Raise the threshold to 90% to see this."
                : "None fell below the threshold. If one did, the current policy would <b>load reliable fields</b> and leave only the critical field pending. Raise the threshold to 90% to see this."),
        );
        ins.add(
          "cyan",
          "=",
          "The same schema reads all three inputs, with no vendor-specific template. What changes is each field's confidence: the handwritten line in the photo will never be as clear as the printed invoice total.",
        );
      }

      /* Corrida animada: se ve al modelo leer campo por campo. Cambiar de
               documento a media corrida la invalida en vez de mezclar registros. */
      async function procesar() {
        var token = ++corrida;
        var pags = doc().paginas + (doc().paginas === 1 ? " page" : " pages");
        animando = true;
        ctl.busy("run", true);
        /* Devuelve false si otra carga tomó el relevo mientras esperaba. */
        async function pausa(ms) {
          await k.wait(ms);
          return token === corrida;
        }
        try {
          var d = doc();
          campos.forEach(function (f) {
            f.leido = false;
          });
          kp.set(3, "—", "");
          pipe.reset();
          aplicar();
          log.clear();

          pipe.set(0, "done", "arrival event");
          log.push("in", "Input: " + d.origen);
          if (!(await pausa(280))) return;

          pipe.set(1, "run");
          log.push(
            "in",
            "OCR: " + pags + " to text, with each word's position in the image",
          );
          if (!(await pausa(300))) return;

          pipe.set(1, "done", pags);
          pipe.set(2, "run");
          log.push(
            "in",
            "Model: mapping text to a schema with " + campos.length + " fields",
          );

          for (var i = 0; i < campos.length; i++) {
            if (!(await pausa(170))) return;
            campos[i].leido = true;
            aplicar();
          }
          pipe.set(2, "done", campos.length + " fields mapped");

          pipe.set(3, "run");
          if (!(await pausa(240))) return;
          log.push(
            "in",
            "Rules: " +
              d.reglas +
              " format, range and cross-field consistency checks",
          );
          pipe.set(3, "done", d.reglas + " rules applied");
          if (!(await pausa(220))) return;

          var u = ctl.get("umbral");
          var retiene = ctl.get("politica") === "retener";
          var dudosos = bajos(d, u);
          var criticoDudoso = campos.some(function (f) {
            return f.critico && f.conf < u;
          });
          kp.set(3, k.fmt(d.seg, 1) + " s", "");
          animando = false;
          aplicar();

          if (criticoDudoso && retiene) {
            log.push(
              "er",
              "Critical field below " +
                u +
                "%. Document held: nothing is written to " +
                d.destino,
            );
            log.push(
              "wa",
              "Review queue: " +
                dudosos +
                (dudosos === 1 ? " uncertain field" : " uncertain fields") +
                " with their image crops. The rest of the document waits with them.",
            );
          } else {
            log.push(
              "ok",
              "Load to " +
                d.destino +
                ": " +
                (campos.length - dudosos) +
                " fields written with key " +
                d.clave,
            );
            if (criticoDudoso) {
              log.push(
                "wa",
                "Critical field below " +
                  u +
                  "%: marked pending in the destination; the value is not invented",
              );
            }
            if (dudosos) {
              log.push(
                "wa",
                "Review queue: " +
                  dudosos +
                  (dudosos === 1 ? " field" : " fields") +
                  " below " +
                  u +
                  "%, each with its reason and image crop",
              );
            } else {
              log.push("ok", "No queue: every field exceeded the threshold");
            }
          }
          log.push(
            "hl",
            "Original archived unchanged. Reprocessing the same key does not duplicate the record.",
          );
        } finally {
          if (token === corrida) {
            animando = false;
            ctl.busy("run", false);
          }
        }
      }

      /* Cambio de documento: entra ya leído, nunca en blanco. */
      function cargar(id, conRegistro) {
        corrida++;
        animando = false;
        ctl.busy("run", false);
        docId = id;
        var d = doc();
        construir(d);
        campos.forEach(function (f) {
          f.leido = true;
        });
        kp.set(3, k.fmt(d.seg, 1) + " s", "");
        aplicar();
        if (conRegistro) {
          log.clear();
          log.push("in", "Document loaded: " + d.n);
          log.push(
            "ok",
            "Previous run reused: " +
              k.fmt(d.seg, 1) +
              " s. Press Process to watch the reading step by step.",
          );
        }
      }

      ctl.on(function (get) {
        if (get("doc") !== docId) {
          cargar(get("doc"), true);
          return;
        }
        aplicar();
      });
      ctl.onClick("run", function () {
        procesar();
      });

      cargar(DOCS[0].id, false);
      log.push("in", "Document loaded: " + DOCS[0].n);
      log.push(
        "ok",
        "Last run: " +
          k.fmt(DOCS[0].seg, 1) +
          " s. Press Process to watch the reading step by step.",
      );
    },
  });
})();
