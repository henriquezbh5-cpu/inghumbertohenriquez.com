/* RELEVO — alta, baja y traslado de personal: doce pasos sobre siete
   sistemas, con el orden y los modos de falla que hacen la diferencia. */
(function () {
  "use strict";
  var LAB = window.LAB;

  /* ---------- los siete sistemas que toca el movimiento ---------- */
  var SIS = [
    { n: "Directory", m: "Identity and access" },
    { n: "Licenses", m: "Subscriptions" },
    { n: "Email", m: "Inbox and signature" },
    { n: "Payroll", m: "Payroll" },
    { n: "ERP", m: "Finance and assets" },
    { n: "Folders", m: "Network files" },
    { n: "Record", m: "Documents" },
  ];
  var DIR = 0,
    LIC = 1,
    COR = 2,
    PLA = 3,
    ERP = 4,
    CAR = 5,
    EXP = 6;

  /* g marca los pasos que piden firma extra según el perfil: 'car' es la
       primera que se exige, 'lic' la segunda. Así el conteo de firmas del
       resumen y las que aparecen en la bitácora siempre coinciden. */

  /* Alta: se construye de adentro hacia afuera. */
  var ALTA = [
    {
      n: "Validate record and documents",
      s: EXP,
      d: function () {
        return "12 complete documents, 0 issues";
      },
    },
    {
      n: "Create directory user",
      s: DIR,
      d: function (x) {
        return "user " + x.usuario + " created, MFA required at first sign-in";
      },
    },
    {
      n: "Assign role licenses",
      s: LIC,
      g: "lic",
      d: function (x) {
        return (
          x.lic +
          " licenses assigned according to the role " +
          x.perfil.toLowerCase()
        );
      },
    },
    {
      n: "Create inbox and corporate signature",
      s: COR,
      d: function () {
        return "active inbox and signature with title and department";
      },
    },
    {
      n: "Payroll onboarding",
      s: PLA,
      d: function (x) {
        return "payroll record with effective date " + x.fecha;
      },
    },
    {
      n: "Assign cost center",
      s: ERP,
      d: function (x) {
        return (
          "cost center " +
          x.ccFin +
          " linked to department " +
          x.areaFin.toLowerCase()
        );
      },
    },
    {
      n: "Create ERP profile",
      s: ERP,
      d: function (x) {
        return (
          "role " +
          x.perfil.toLowerCase() +
          " created, without payment permissions"
        );
      },
    },
    {
      n: "Folder permissions by department",
      s: CAR,
      g: "car",
      d: function (x) {
        return x.carFin + " folder groups granted, none inherited";
      },
    },
    {
      n: "Record assigned equipment",
      s: ERP,
      d: function (x) {
        return "equipment " + x.serie + " recorded in a signed acknowledgment";
      },
    },
    {
      n: "Enroll in required training",
      s: DIR,
      d: function (x) {
        return x.cursos + " courses assigned with a 30-day deadline";
      },
    },
    {
      n: "Notify management and security",
      s: COR,
      d: function () {
        return "notification sent to management and security with acknowledgment";
      },
    },
    {
      n: "Generate digital record",
      s: EXP,
      d: function () {
        return "record with 12 timestamps and workflow signature";
      },
    },
  ];

  /* Baja: acciones inversas, no la lista al revés. Primero se cierra el
       acceso, al final se toca dinero y archivo. */
  var BAJA = [
    {
      n: "Record effective date",
      s: EXP,
      d: function (x) {
        return "effective date " + x.fecha + " recorded and notified";
      },
    },
    {
      n: "Block directory user",
      s: DIR,
      d: function (x) {
        return x.usuario + " blocked, active sessions and tokens terminated";
      },
    },
    {
      n: "Revoke licenses",
      s: LIC,
      g: "lic",
      d: function (x) {
        return x.lic + " licenses returned to the available pool";
      },
    },
    {
      n: "Forward inbox to manager",
      s: COR,
      d: function () {
        return "90-day forwarding and automatic reply enabled";
      },
    },
    {
      n: "Remove ERP access",
      s: ERP,
      d: function () {
        return "ERP profile and approvals removed";
      },
    },
    {
      n: "Remove folder permissions",
      s: CAR,
      g: "car",
      d: function (x) {
        return x.carIni + " groups removed, 0 direct permissions remaining";
      },
    },
    {
      n: "Payroll offboarding",
      s: PLA,
      d: function (x) {
        return "payroll removal with effective date " + x.fecha;
      },
    },
    {
      n: "Record equipment return",
      s: ERP,
      d: function (x) {
        return "equipment " + x.serie + " returned, verified and wiped";
      },
    },
    {
      n: "Settle unused leave",
      s: PLA,
      d: function (x) {
        return x.vac + " unused days sent for final settlement";
      },
    },
    {
      n: "Reassign open tickets",
      s: ERP,
      d: function (x) {
        return x.tickets + " tickets reassigned to the department manager";
      },
    },
    {
      n: "Notify security and payroll",
      s: COR,
      d: function () {
        return "notification to security and payroll with acknowledgment";
      },
    },
    {
      n: "Archive record",
      s: EXP,
      d: function () {
        return "record closed with 5-year retention";
      },
    },
  ];

  /* Traslado: la identidad se conserva; lo que cambia es todo lo que
       cuelga de ella. Se retira antes de otorgar, nunca al revés. */
  var CAMBIO = [
    {
      n: "Validate both managers' approvals",
      s: EXP,
      d: function () {
        return "source and destination managers approved, with no issues";
      },
    },
    {
      n: "Mark account as transferring",
      s: DIR,
      d: function (x) {
        return x.usuario + " marked as transferring, session remains active";
      },
    },
    {
      n: "Remove source department folders",
      s: CAR,
      d: function (x) {
        return (
          x.carIni +
          " groups for department " +
          x.areaIni.toLowerCase() +
          " removed"
        );
      },
    },
    {
      n: "Grant destination department folders",
      s: CAR,
      g: "car",
      d: function (x) {
        return (
          x.carFin +
          " groups for department " +
          x.areaFin.toLowerCase() +
          " granted"
        );
      },
    },
    {
      n: "Adjust licenses for the new role",
      s: LIC,
      g: "lic",
      d: function (x) {
        return (
          "licenses adjusted to " +
          x.lic +
          " according to the role " +
          x.perfil.toLowerCase()
        );
      },
    },
    {
      n: "Change cost center",
      s: ERP,
      d: function (x) {
        return "cost center " + x.ccIni + " replaced by " + x.ccFin;
      },
    },
    {
      n: "Reassign approvals and backup duties",
      s: ERP,
      d: function () {
        return "approval chain moved to the destination manager";
      },
    },
    {
      n: "Update title, department and signature",
      s: COR,
      d: function (x) {
        return (
          "email signature regenerated with department " +
          x.areaFin.toLowerCase()
        );
      },
    },
    {
      n: "Recalculate payroll from the effective date",
      s: PLA,
      d: function (x) {
        return "payroll recalculated from " + x.fecha;
      },
    },
    {
      n: "Transfer tickets and pending work",
      s: ERP,
      d: function (x) {
        return x.tickets + " tickets transferred with full history";
      },
    },
    {
      n: "Notify both managers and security",
      s: COR,
      d: function () {
        return "notification to source, destination and security with acknowledgment";
      },
    },
    {
      n: "Close transfer record",
      s: EXP,
      d: function () {
        return "transfer record closed with 12 timestamps";
      },
    },
  ];

  /* Cada movimiento define su propia ventana crítica: el tramo de pasos
       donde una demora se paga cara, y por qué. */
  var MOV = {
    alta: {
      t: "Onboarding",
      corto: "onboarding",
      pill: "ok",
      lista: ALTA,
      orden: "build from the inside out, identity first",
      vent: { a: 0, b: 3, t: "from approval to the first usable session" },
      fecha: "15/09/2026",
    },
    baja: {
      t: "Offboarding",
      corto: "offboarding",
      pill: "warn",
      lista: BAJA,
      orden: "reverse actions, access first",
      vent: { a: 1, b: 5, t: "between blocking the user and removing folders" },
      fecha: "30/09/2026",
    },
    cambio: {
      t: "Department transfer",
      corto: "transfer",
      pill: "idle",
      lista: CAMBIO,
      orden: "remove before granting",
      vent: {
        a: 1,
        b: 3,
        t: "between marking the transfer and completing the folder changes",
      },
      fecha: "01/10/2026",
    },
  };

  /* Tres clases de falla distintas, porque el flujo responde distinto a
       cada una: se reintenta, se abre ticket o se agenda. */
  var REAPERTURA = "03/10/2026";
  var FALLAS = {
    ninguna: {
      t: "None, all systems responding",
      marca: "none",
      sis: -1,
      modo: "ninguno",
      seg: 0,
    },
    espera: {
      t: "Directory unresponsive",
      marca: "retry",
      sis: DIR,
      modo: "reintento",
      seg: 30,
      er: "unresponsive: timed out after 30 s",
    },
    cupo: {
      t: "License pool exhausted",
      marca: "ticket",
      sis: LIC,
      modo: "ticket",
      seg: 95,
      er: "operation rejected: the role's license pool is empty",
    },
    cierre: {
      t: "Payroll in accounting close",
      marca: "deferred",
      sis: PLA,
      modo: "diferido",
      seg: 12,
      er: "writes rejected: accounting close in progress",
    },
  };

  /* ---------- datos sintéticos con semilla fija ---------- */
  function datos() {
    var r = LAB.kit.rng(8802),
      i;
    var d = { alta: [], baja: [], cambio: [] };
    for (i = 0; i < 12; i++)
      d.alta.push({
        seg: Math.round(24 + r() * 60),
        man: Math.round(8 + r() * 22),
      });
    for (i = 0; i < 12; i++)
      d.baja.push({
        seg: Math.round(22 + r() * 58),
        man: Math.round(9 + r() * 24),
      });
    for (i = 0; i < 12; i++)
      d.cambio.push({
        seg: Math.round(26 + r() * 55),
        man: Math.round(10 + r() * 21),
      });
    d.carpetas = {
      Finance: 5 + Math.round(r() * 2),
      Operations: 6 + Math.round(r() * 3),
      Sales: 4 + Math.round(r() * 2),
      Technology: 7 + Math.round(r() * 3),
    };
    d.serie = "PC-" + (2400 + Math.floor(r() * 900));
    d.vac = 6 + Math.round(r() * 12);
    d.tickets = 3 + Math.round(r() * 8);
    d.folio = "MP-2026-0" + (400 + Math.floor(r() * 90));
    d.ticket = "SD-" + (7400 + Math.floor(r() * 500));
    return d;
  }
  var D = datos();

  var AREAS = ["Finance", "Operations", "Sales", "Technology"];
  var CC = {
    Finance: "CC-1100",
    Operations: "CC-2400",
    Sales: "CC-3200",
    Technology: "CC-4100",
  };
  var FA = { Finance: 1.0, Operations: 1.08, Sales: 0.96, Technology: 1.14 };
  var FP = { Analyst: 1.0, "Department head": 1.12, "Executive team": 1.25 };
  var FIRMAS = { Analyst: 0, "Department head": 1, "Executive team": 2 };
  var FIRMA_SEG = 42,
    FIRMA_MAN = 38;

  function dur(s) {
    var m = Math.floor(s / 60),
      q = s % 60;
    return m ? m + " min " + LAB.kit.pad(q) + " s" : q + " s";
  }
  function corto(s) {
    var m = Math.floor(s / 60),
      q = s % 60;
    return m ? m + " m " + LAB.kit.pad(q) + " s" : q + " s";
  }
  function horas(m) {
    var h = Math.floor(m / 60),
      q = Math.round(m % 60);
    return h ? h + " h " + q + " min" : q + " min";
  }
  /* usuario derivado del nombre; tabla de acentos en lugar de normalize
       para no depender de rangos Unicode escritos a mano */
  var ACENTOS = { á: "a", é: "e", í: "i", ó: "o", ú: "u", ü: "u", ñ: "n" };
  function usuario(nombre) {
    var p = String(nombre || "")
      .trim()
      .split(/\s+/)
      .filter(function (t) {
        return t.length;
      });
    if (!p.length) return "sin.usuario";
    var s = (p[0].charAt(0) + "." + p[p.length - 1]).toLowerCase(),
      out = "",
      i,
      c;
    for (i = 0; i < s.length; i++) {
      c = ACENTOS[s.charAt(i)] || s.charAt(i);
      if (/[a-z0-9.]/.test(c)) out += c;
    }
    return out || "sin.usuario";
  }

  LAB.register({
    id: "relevo",
    name: "RELEVO",
    family: "procesos",
    tagline: "Employee onboarding and offboarding",
    title: "Onboarding, offboarding and transfers without orphaned access",
    intro:
      "An approved form triggers twelve steps across seven systems. Choose the employment change, role and failing system: the sequence changes, along with the window during which access remains open without an owner.",
    spec: {
      trigger:
        "Employment-change form approved by management: onboarding, offboarding or department transfer.",
      systems:
        "Corporate directory, licenses, email, payroll, ERP and network folders, orchestrated with Power Automate against a SQL Server control table.",
      output:
        "Digital record with a signed step-by-step log: system affected, time, result and owner.",
      failure:
        "Three different responses. If the system does not answer, retries wait 30 s, 90 s and 5 min. If it rejects the operation, a ticket records the exact step and the change is never marked complete. If it is in a close window, the step is scheduled for reopening and the rest of the sequence continues.",
    },
    impact: [
      ["1 in 3", "onboarding requests previously arrived incomplete"],
      ["under 15 min", "from approval to closed record"],
      ["0", "active permissions after the effective date"],
    ],
    render: function (host, k) {
      var corriendo = false;

      var ctl = k.controls([
        {
          k: "nombre",
          t: "text",
          label: "Employee",
          value: "María Elena Portillo",
          grow: true,
        },
        {
          k: "mov",
          t: "select",
          label: "Employment change",
          options: [
            { v: "alta", t: "Onboarding" },
            { v: "baja", t: "Offboarding" },
            { v: "cambio", t: "Department transfer" },
          ],
          value: "alta",
        },
        {
          k: "area",
          t: "select",
          label: "Department",
          options: AREAS,
          value: "Finance",
        },
        {
          k: "destino",
          t: "select",
          label: "Destination department",
          options: AREAS,
          value: "Technology",
        },
        {
          k: "perfil",
          t: "select",
          label: "Role",
          options: ["Analyst", "Department head", "Executive team"],
          value: "Analyst",
        },
        {
          k: "falla",
          t: "select",
          label: "Simulated failure",
          value: "ninguna",
          options: [
            { v: "ninguna", t: "None" },
            { v: "espera", t: "Directory unresponsive" },
            { v: "cupo", t: "No available licenses" },
            { v: "cierre", t: "Payroll in close" },
          ],
        },
        {
          k: "run",
          t: "button",
          label: "Run employment change",
          primary: true,
        },
      ]);
      host.appendChild(ctl.node);
      /* el campo de destino solo tiene sentido en el traslado */
      var campoDestino = ctl.node.querySelectorAll(".field")[3];

      var kp = k.kpis([
        ["Steps executed", "0 of 12", ""],
        ["Systems updated", "0 of 7", ""],
        ["Workflow time", "—", "up"],
        ["Manual equivalent", "—", "warn"],
      ]);
      host.appendChild(kp.node);

      var pnPipe = k.panel();
      pnPipe.appendChild(
        k.txt("div", "mono-head", "Connected systems — planned steps"),
      );
      var pipe = k.pipe(SIS);
      pnPipe.appendChild(pipe.node);
      host.appendChild(pnPipe);

      var g1 = k.el("div", "grid2 wide-left");
      var pnPasos = k.panel();
      var hPasos = k.txt("div", "mono-head", "Sequence");
      pnPasos.appendChild(hPasos);
      var hostPasos = k.el("div");
      pnPasos.appendChild(hostPasos);
      var pnLog = k.panel();
      pnLog.appendChild(k.txt("div", "mono-head", "Signed log"));
      var log = k.log("432px");
      pnLog.appendChild(log.node);
      g1.appendChild(pnPasos);
      g1.appendChild(pnLog);
      host.appendChild(g1);

      var g2 = k.el("div", "grid2");
      var pnFicha = k.panel();
      pnFicha.appendChild(
        k.txt("div", "mono-head", "Employment-change record"),
      );
      var campos = fichaCampos(k, [
        "Employee",
        "Employment change",
        "Department",
        "Role",
        "User",
        "Licenses",
        "Network folders",
        "Cost center",
        "Effective date",
        "Simulated failure",
        "Close",
      ]);
      pnFicha.appendChild(campos.node);
      g2.appendChild(pnFicha);
      var cb = k.chartbox(
        "Workload by system",
        "workflow minutes versus human work minutes",
        "300px",
      );
      g2.appendChild(cb.node);
      host.appendChild(g2);

      var ins = k.insights();
      var pnIns = k.panel();
      pnIns.appendChild(k.txt("div", "mono-head", "Workflow insights"));
      pnIns.appendChild(ins.node);
      host.appendChild(pnIns);

      var st = null,
        ch = null,
        ctx = null;

      /* ---------- cálculo del escenario ---------- */
      function calcular() {
        var mv = ctl.get("mov"),
          m = MOV[mv] || MOV.alta;
        var area = ctl.get("area"),
          destino = ctl.get("destino"),
          perfil = ctl.get("perfil");
        var f = FALLAS[ctl.get("falla")] || FALLAS.ninguna;
        var esCambio = mv === "cambio";
        var areaFin = esCambio ? destino : area;
        var firmas = FIRMAS[perfil] || 0;
        var fac = (FA[areaFin] || 1) * (FP[perfil] || 1);
        var base = m === MOV.baja ? D.baja : esCambio ? D.cambio : D.alta;
        var pasos = [],
          botSeg = 0,
          manMin = 0,
          cuenta = [0, 0, 0, 0, 0, 0, 0],
          i,
          p,
          gate;

        for (i = 0; i < 12; i++) {
          p = m.lista[i];
          /* la firma extra se cobra en el paso que la exige: así el
                       tiempo, la gráfica y la bitácora cuentan lo mismo */
          gate =
            (p.g === "car" && firmas >= 1) || (p.g === "lic" && firmas >= 2);
          var seg = Math.round(base[i].seg * fac) + (gate ? FIRMA_SEG : 0);
          var man = Math.round(base[i].man * fac) + (gate ? FIRMA_MAN : 0);
          pasos.push({
            n: p.n,
            sis: p.s,
            seg: seg,
            man: man,
            firma: gate,
            d: p.d,
          });
          botSeg += seg;
          manMin += man;
          cuenta[p.s]++;
        }

        /* pasos que golpea la falla: uno solo salvo el cierre contable,
                   que bloquea todas las escrituras de ese sistema */
        var iFalla = -1,
          nFalla = 0;
        if (f.sis >= 0) {
          for (i = 0; i < pasos.length; i++) {
            if (pasos[i].sis !== f.sis) continue;
            if (iFalla < 0) iFalla = i;
            if (f.modo === "diferido") nFalla++;
          }
          if (f.modo !== "diferido") nFalla = iFalla >= 0 ? 1 : 0;
        }

        var nombre = ctl.get("nombre") || "No name";
        var invalido = esCambio && area === destino;
        var lic =
          3 +
          (perfil === "Analyst" ? 0 : perfil === "Department head" ? 1 : 2) +
          (areaFin === "Technology" ? 1 : 0);
        var c = {
          m: m,
          mv: mv,
          esCambio: esCambio,
          perfil: perfil,
          nombre: nombre,
          areaIni: area,
          areaFin: areaFin,
          invalido: invalido,
          pasos: pasos,
          botSeg: botSeg,
          manMin: manMin,
          firmas: firmas,
          cuenta: cuenta,
          falla: f,
          iFalla: iFalla,
          nFalla: nFalla,
          extraSeg: f.seg * nFalla,
          usuario: usuario(nombre),
          lic: lic,
          carIni: D.carpetas[area] || 5,
          carFin: D.carpetas[areaFin] || 5,
          ccIni: CC[area] || "CC-1100",
          ccFin: CC[areaFin] || "CC-1100",
          cursos: 4 + firmas,
          serie: D.serie,
          vac: D.vac,
          tickets: D.tickets,
          fecha: m.fecha,
        };
        c.etiquetaArea = esCambio ? area + " to " + destino : area;
        c.txtLic = esCambio
          ? "adjustment to " + lic + " for the role"
          : c.lic + (mv === "alta" ? " to assign" : " to revoke");
        c.txtCar = esCambio
          ? c.carIni + " to remove, " + c.carFin + " to grant"
          : c.carFin +
            (mv === "alta" ? " groups to grant" : " groups to remove");
        c.txtCC = esCambio ? c.ccIni + " to " + c.ccFin : c.ccFin;
        c.proy = proyeccion(c);
        return c;
      }

      /* Cierre esperado antes de correr: el visitante ve el desenlace
               que produce cada falla sin tener que ejecutar. */
      function proyeccion(c) {
        if (c.invalido)
          return {
            hechos: 0,
            tono: "bad",
            et: "rejected",
            t: "rejected during validation",
          };
        if (c.falla.modo === "ticket")
          return {
            hechos: 11,
            tono: "bad",
            et: "incomplete",
            t: "11 of 12 steps, 1 with an open ticket",
          };
        if (c.falla.modo === "diferido")
          return {
            hechos: 12 - c.nFalla,
            tono: "warn",
            et: "deferred",
            t:
              12 -
              c.nFalla +
              " of 12 steps, " +
              c.nFalla +
              " scheduled for " +
              REAPERTURA,
          };
        if (c.falla.modo === "reintento")
          return {
            hechos: 12,
            tono: "warn",
            et: "with retry",
            t: "12 of 12 steps, 1 recovered on retry",
          };
        return {
          hechos: 12,
          tono: "ok",
          et: "complete",
          t: "12 of 12 steps signed",
        };
      }

      function ventana(c) {
        var v = c.m.vent,
          a = 0,
          b = 0,
          i;
        for (i = v.a; i <= v.b && i < c.pasos.length; i++) {
          a += c.pasos[i].man;
          b += c.pasos[i].seg;
        }
        return { man: a, bot: b, t: v.t };
      }

      /* ---------- pintado ---------- */
      function pintarPasos(c) {
        hostPasos.innerHTML = "";
        st = k.steps(
          c.pasos.map(function (p) {
            return {
              n: p.n + (p.firma ? " (extra approval)" : ""),
              ms: corto(p.seg),
            };
          }),
        );
        hostPasos.appendChild(st.node);
        hPasos.textContent =
          "Sequence — " + c.m.corto + ", sequence " + c.m.orden;
      }

      function pintarPipe(c) {
        var i, t;
        for (i = 0; i < SIS.length; i++) {
          t = c.cuenta[i] + (c.cuenta[i] === 1 ? " step" : " steps");
          if (c.falla.sis === i) t += " · simulated failure";
          pipe.set(i, "", t);
        }
      }

      function pintarFicha(c) {
        campos.set(0, c.nombre, k.pill("idle", D.folio));
        campos.set(1, c.m.t, k.pill(c.m.pill, c.m.corto));
        campos.set(
          2,
          c.etiquetaArea,
          c.invalido ? k.pill("bad", "unchanged") : "",
        );
        campos.set(
          3,
          c.perfil,
          c.firmas
            ? k.pill(
                "warn",
                c.firmas === 1
                  ? "1 extra approval"
                  : c.firmas + " extra approvals",
              )
            : k.pill("idle", "no approvals"),
        );
        campos.set(4, c.usuario, "");
        campos.set(5, c.txtLic, "");
        campos.set(6, c.txtCar, "");
        campos.set(7, c.txtCC, "");
        campos.set(8, c.fecha, "");
        campos.set(
          9,
          c.falla.t,
          k.pill(c.falla.sis < 0 ? "ok" : "warn", c.falla.marca),
        );
        cerrar(c.proy.t, c.proy.tono, c.proy.et);
      }
      function cerrar(texto, tono, etiqueta) {
        campos.set(10, texto, k.pill(tono, etiqueta));
      }

      function pintarChart(c) {
        var bot = [],
          man = [],
          i,
          j;
        for (i = 0; i < SIS.length; i++) {
          bot.push(0);
          man.push(0);
        }
        for (j = 0; j < c.pasos.length; j++) {
          bot[c.pasos[j].sis] += c.pasos[j].seg / 60;
          man[c.pasos[j].sis] += c.pasos[j].man;
        }
        if (c.falla.sis >= 0) bot[c.falla.sis] += c.extraSeg / 60;
        bot = bot.map(function (v) {
          return +v.toFixed(2);
        });
        if (!ch) {
          ch = k.chart(cb.canvas, {
            type: "bar",
            data: {
              labels: SIS.map(function (s) {
                return s.n;
              }),
              datasets: [
                {
                  label: "Automated workflow",
                  data: bot,
                  backgroundColor: k.CAT[0],
                  borderRadius: 3,
                  minBarLength: 4,
                  barPercentage: 0.86,
                  categoryPercentage: 0.72,
                },
                {
                  label: "Manual execution",
                  data: man,
                  backgroundColor: k.CAT[1],
                  borderRadius: 3,
                  barPercentage: 0.86,
                  categoryPercentage: 0.72,
                },
              ],
            },
            options: {
              indexAxis: "y",
              scales: {
                x: Object.assign({}, k.AXIS, {
                  beginAtZero: true,
                  title: { display: true, text: "minutes" },
                }),
                y: Object.assign({}, k.AXIS_BARE),
              },
              plugins: {
                legend: { position: "bottom" },
                tooltip: {
                  callbacks: {
                    label: function (it) {
                      return (
                        it.dataset.label + ": " + k.fmt(it.parsed.x, 1) + " min"
                      );
                    },
                  },
                },
              },
            },
          });
        } else if (ch.data) {
          ch.data.datasets[0].data = bot;
          ch.data.datasets[1].data = man;
          ch.update();
        }
        cb.cap(
          c.m.corto +
            " · " +
            c.areaFin.toLowerCase() +
            " · workflow " +
            dur(c.botSeg + c.extraSeg) +
            " versus " +
            horas(c.manMin) +
            " manual",
        );
      }

      function pintarInsights(c) {
        var v = ventana(c);
        ins.clear();
        if (c.invalido) {
          ins.add(
            "rose",
            "✕",
            "Source and destination are the same department. The workflow <b>rejects the form during validation</b>, before writing to any system: nothing needs to be rolled back afterward.",
          );
        }
        ins.add(
          "teal",
          "↺",
          c.mv === "alta"
            ? "Onboarding is built from the inside out: <b>identity first</b>, folders once the department is confirmed, and the record last, with evidence from the preceding eleven steps."
            : c.mv === "baja"
              ? "Offboarding is not simply onboarding reversed: <b>access is removed first</b> (directory, licenses, ERP, folders), followed by payroll, final settlement and archiving."
              : "A transfer preserves identity and changes its associated access. <b>Remove before granting</b>: doing the reverse leaves the person with both departments' permissions.",
        );
        ins.add(
          "amber",
          "!",
          "Critical window " +
            v.t +
            ": <b>" +
            horas(v.man) +
            "</b> in the manual process versus <b>" +
            dur(v.bot) +
            "</b> when automated. That is where orphaned access remains.",
        );
        ins.add(
          "violet",
          "✓",
          c.firmas === 0
            ? "Analyst role: one manager approval. No step is left to the operator's discretion, and all twelve are timestamped in the log."
            : "Role " +
                c.perfil.toLowerCase() +
                ": " +
                (c.firmas > 1
                  ? "two additional approvals for folders and licenses"
                  : "an additional approval for folder permissions") +
                ". They add <b>" +
                dur(c.firmas * FIRMA_SEG) +
                "</b> to the workflow and <b>" +
                horas(c.firmas * FIRMA_MAN) +
                "</b> to the manual process.",
        );
        if (c.falla.modo === "reintento") {
          ins.add(
            "cyan",
            "≈",
            "Unresponsive system: the workflow <b>retries with increasing delays</b> (30 s, 90 s and 5 min). It recovers automatically and the change completes with the retry recorded.",
          );
        } else if (c.falla.modo === "ticket") {
          ins.add(
            "rose",
            "✕",
            "A system rejects the operation: retries cannot help. Ticket <b>" +
              D.ticket +
              "</b> records the exact step; independent steps continue, and the change is <b>never marked complete</b>.",
          );
        } else if (c.falla.modo === "diferido") {
          ins.add(
            "cyan",
            "≡",
            "System in a closed window: forcing a write would corrupt the close. " +
              (c.nFalla === 1
                ? "The step is scheduled"
                : "The " + c.nFalla + " steps are scheduled") +
              " for <b>" +
              REAPERTURA +
              "</b> and the rest of the sequence continues.",
          );
        }
      }

      function refrescar() {
        if (campoDestino)
          campoDestino.classList.toggle("hide", ctl.get("mov") !== "cambio");
        ctx = calcular();
        pintarPasos(ctx);
        pintarPipe(ctx);
        pintarFicha(ctx);
        pintarChart(ctx);
        pintarInsights(ctx);
        /* un movimiento que la validación rechaza no consume tiempo
                   de nadie: mostrar su estimado sería un número sin sentido */
        kp.set(0, "0 of 12", ctx.invalido ? "bad" : "");
        kp.set(1, "0 of 7", "");
        kp.set(
          2,
          ctx.invalido ? "—" : dur(ctx.botSeg + ctx.extraSeg),
          ctx.invalido ? "" : "up",
        );
        kp.set(
          3,
          ctx.invalido ? "—" : horas(ctx.manMin),
          ctx.invalido ? "" : "warn",
        );
        log.clear();
        log.push(
          "in",
          "Scenario loaded: " +
            ctx.m.corto +
            " · " +
            ctx.etiquetaArea +
            " · " +
            ctx.perfil +
            ". Press Run to execute the twelve steps.",
        );
        log.push(
          "in",
          "Reference " +
            D.folio +
            " · effective date " +
            ctx.fecha +
            " · user " +
            ctx.usuario,
        );
        log.push(
          ctx.proy.tono === "ok" ? "in" : "wa",
          "Projected completion: " + ctx.proy.t + ".",
        );
      }

      /* ---------- ejecución animada ---------- */
      function bloquear(b) {
        var n = ctl.node.querySelectorAll("select, input, textarea");
        Array.prototype.forEach.call(n, function (x) {
          x.disabled = !!b;
        });
      }
      function liberar() {
        bloquear(false);
        ctl.busy("run", false);
        corriendo = false;
      }

      async function ejecutar() {
        if (corriendo) return;
        corriendo = true;
        bloquear(true);
        ctl.busy("run", true);
        var c = ctx,
          f = c.falla,
          hechos = 0,
          tocados = {},
          pend = 0,
          dif = 0,
          extra = 0,
          i,
          p,
          golpe;
        st.reset();
        pintarPipe(c);
        log.clear();
        log.push(
          "hl",
          "Form " +
            D.folio +
            " approved by management — change type: " +
            c.m.corto,
        );
        log.push(
          "in",
          c.nombre +
            " · " +
            c.etiquetaArea +
            " · " +
            c.perfil +
            " · effective " +
            c.fecha,
        );
        cerrar("in progress", "run", "executing");

        if (c.invalido) {
          st.set(0, "fail", "rejected");
          pipe.set(EXP, "fail", "validation");
          log.push(
            "er",
            "Pre-validation: source and destination departments are the same. The form is rejected.",
          );
          await k.wait(360);
          log.push(
            "wa",
            "Returned to management with the reason. Zero writes, zero pending rollbacks.",
          );
          kp.set(0, "0 of 12", "bad");
          cerrar("rejected during validation", "bad", "rejected");
          liberar();
          return;
        }

        for (i = 0; i < c.pasos.length; i++) {
          p = c.pasos[i];
          golpe =
            f.sis >= 0 &&
            (f.modo === "diferido" ? p.sis === f.sis : i === c.iFalla);
          st.set(i, "run", corto(p.seg));
          pipe.set(p.sis, "run", "in progress");
          log.push(
            "in",
            "Step " + k.pad(i + 1) + " · " + SIS[p.sis].n + " — " + p.n,
          );
          await k.wait(190 + Math.random() * 90);

          if (golpe) {
            st.set(i, "fail", f.marca);
            pipe.set(p.sis, "fail", "error");
            log.push(
              "er",
              SIS[p.sis].n +
                " " +
                f.er +
                ". Step " +
                k.pad(i + 1) +
                " marked failed.",
            );
            await k.wait(340);
            extra += f.seg;
            if (f.modo === "reintento") {
              log.push(
                "wa",
                "Increasing delays: retry 1 after 30 s, retry 2 after 90 s, retry 3 after 5 min.",
              );
              await k.wait(320);
              st.set(i, "done", "2 attempts · " + corto(p.seg + f.seg));
              pipe.set(p.sis, "done", c.cuenta[p.sis] + " written");
              tocados[p.sis] = 1;
              hechos++;
              log.push("ok", "Recovered on attempt 2 — " + p.d(c));
            } else if (f.modo === "ticket") {
              log.push(
                "wa",
                "Three retries with increasing delays. All three return the same rejection: retries cannot resolve this.",
              );
              await k.wait(320);
              log.push(
                "er",
                "Ticket " +
                  D.ticket +
                  " opened with the reference, system and step " +
                  k.pad(i + 1) +
                  ". The step remains pending.",
              );
              await k.wait(300);
              log.push(
                "wa",
                "Independent steps continue; the change does not show as successfully closed while the ticket remains open.",
              );
              st.set(i, "fail", "pending · ticket");
              pipe.set(p.sis, "fail", "step pending");
              pend++;
            } else {
              log.push(
                "wa",
                SIS[p.sis].n +
                  " accepts writes again on " +
                  REAPERTURA +
                  ". The step is scheduled, not forced.",
              );
              await k.wait(300);
              st.set(i, "", "scheduled " + REAPERTURA);
              pipe.set(p.sis, "", "deferred until " + REAPERTURA);
              dif++;
              log.push(
                "in",
                "Step " +
                  k.pad(i + 1) +
                  " deferred with a payroll reminder. The sequence continues.",
              );
            }
            kp.set(0, hechos + " of 12", pend ? "bad" : "warn");
            kp.set(1, Object.keys(tocados).length + " of 7", "");
            continue;
          }

          if (p.firma) {
            log.push(
              "wa",
              "Additional approval required for role " +
                c.perfil.toLowerCase() +
                " before writing. Sent to department management.",
            );
            await k.wait(260);
            log.push(
              "ok",
              "Approval recorded with acknowledgment. The step continues with approval attached.",
            );
          }

          st.set(i, "done", corto(p.seg));
          tocados[p.sis] = 1;
          hechos++;
          pipe.set(
            p.sis,
            "done",
            c.cuenta[p.sis] +
              (c.cuenta[p.sis] === 1 ? " step written" : " steps written"),
          );
          /* el expediente se genera siempre, pero no se firma
                       mientras quede un paso abierto: eso es todo el punto */
          if (i === c.pasos.length - 1 && pend + dif > 0) {
            log.push(
              "wa",
              "record generated WITHOUT closing signature: " +
                (pend + dif) +
                (pend + dif === 1
                  ? " step remains open"
                  : " steps remain open"),
            );
          } else {
            log.push("ok", p.d(c));
          }
          kp.set(
            0,
            hechos + " of 12",
            pend ? "bad" : hechos === 12 ? "up" : "",
          );
          kp.set(1, Object.keys(tocados).length + " of 7", "");
        }

        var total = c.botSeg + extra;
        var sist = Object.keys(tocados).length;
        kp.set(2, dur(total), extra ? "warn" : "up");
        log.push(
          "hl",
          "Run completed: " +
            hechos +
            " of 12 steps written across " +
            sist +
            " of 7 systems, " +
            dur(total) +
            ".",
        );
        if (pend) {
          cerrar(
            hechos + " of 12 steps, ticket " + D.ticket,
            "bad",
            "incomplete",
          );
          log.push(
            "er",
            "Change INCOMPLETE: the license-pool step remains open in ticket " +
              D.ticket +
              ". The record is not signed.",
          );
        } else if (dif) {
          cerrar(
            hechos + " of 12 steps, " + dif + " on " + REAPERTURA,
            "warn",
            "deferred",
          );
          log.push(
            "wa",
            "Change with " +
              dif +
              (dif === 1 ? " step scheduled" : " steps scheduled") +
              " on " +
              REAPERTURA +
              ". The record is signed once they run.",
          );
        } else {
          cerrar(
            "12 of 12 steps signed",
            "ok",
            extra ? "with retry" : "complete",
          );
          log.push(
            "ok",
            "Digital record generated with a timestamp per step. Estimated manual equivalent: " +
              horas(c.manMin) +
              ".",
          );
        }
        liberar();
      }

      ctl.on(function () {
        if (!corriendo) refrescar();
      });
      ctl.onClick("run", function () {
        ejecutar();
      });
      refrescar();
    },
  });

  /* Ficha de campos clave/valor con espacio para una etiqueta de estado. */
  function fichaCampos(k, llaves) {
    var w = k.el("div", "fields");
    llaves.forEach(function (t) {
      var f = k.el("div", "fx");
      f.appendChild(k.txt("div", "fk", t));
      f.appendChild(k.txt("div", "fv", "—"));
      f.appendChild(k.el("div", null, ""));
      w.appendChild(f);
    });
    return {
      node: w,
      set: function (i, v, h) {
        var f = w.children[i];
        if (!f) return;
        f.children[1].textContent = v == null ? "—" : v;
        if (h != null) f.children[2].innerHTML = h;
      },
    };
  }
})();
