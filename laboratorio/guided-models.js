/* Deterministic state and data for the guided monitoring and query examples. */
((root, factory) => {
  const model = factory();
  if (typeof module === "object" && module.exports) module.exports = model;
  else root.GuidedLabModels = model;
})(typeof globalThis !== "undefined" ? globalThis : this, () => {
  "use strict";
  const jobs = [
    { id: "purchases", es: "Solicitudes de compra", en: "Purchase requests" },
    { id: "invoices", es: "Revisión de facturas", en: "Invoice checks" },
    {
      id: "onboarding",
      es: "Altas de colaboradores",
      en: "Employee onboarding",
    },
    { id: "reports", es: "Informe diario", en: "Daily report" },
  ];
  function createMonitor() {
    return {
      jobs: jobs.map((j) => ({ ...j, state: "ready", attempts: 0 })),
      events: [],
    };
  }
  function updateMonitor(state, id, action, persistent = false) {
    if (action === "reset") return createMonitor();
    const next = {
      jobs: state.jobs.map((j) => ({ ...j })),
      events: [...state.events],
    };
    const job = next.jobs.find((j) => j.id === id);
    if (!job) return next;
    if (action === "run") {
      job.state = persistent ? "failed" : "done";
      job.attempts++;
    } else if (action === "fail") {
      job.state = "failed";
      job.attempts++;
    } else if (action === "retry" && job.state === "failed") {
      job.attempts++;
      job.state = persistent ? "failed" : "done";
    } else if (action === "escalate" && job.state === "failed") {
      job.state = "review";
    } else return next;
    next.events.push({
      id: job.id,
      action,
      state: job.state,
      attempts: job.attempts,
    });
    return next;
  }
  const sales = [
    { id: "V-101", country: "El Salvador", amount: 4800 },
    { id: "V-102", country: "Guatemala", amount: 7200 },
    { id: "V-103", country: "Costa Rica", amount: 5600 },
    { id: "V-104", country: "El Salvador", amount: 3200 },
    { id: "V-105", country: "Guatemala", amount: 4100 },
    { id: "V-106", country: "Costa Rica", amount: 2900 },
  ];
  const requests = [
    { id: "S-201", area: "Operations", status: "pending" },
    { id: "S-202", area: "Finance", status: "approved" },
    { id: "S-203", area: "Operations", status: "pending" },
    { id: "S-204", area: "Finance", status: "pending" },
  ];
  function query(question, role) {
    if (role !== "management" && role !== "operations")
      return { kind: "denied", rows: [], total: null };
    const q = String(question)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    const kind = /venta|sales|revenue/.test(q)
      ? "sales"
      : /solicitud|request|pendiente|pending/.test(q)
        ? "requests"
        : "unknown";
    if (kind === "unknown") return { kind, rows: [], total: null };
    if (kind === "sales" && role !== "management")
      return { kind: "denied", rows: [], total: null };
    if (kind === "sales") {
      const rows = sales.map((row) => ({ ...row }));
      return {
        kind,
        rows,
        total: rows.reduce((sum, row) => sum + row.amount, 0),
        groups: rows.reduce((groups, row) => {
          groups[row.country] = (groups[row.country] || 0) + row.amount;
          return groups;
        }, {}),
      };
    }
    const rows = requests
      .filter(
        (row) =>
          row.status === "pending" &&
          (role === "management" || row.area === "Operations"),
      )
      .map((row) => ({ ...row }));
    return { kind, rows, total: rows.length };
  }
  return { createMonitor, updateMonitor, query };
});
