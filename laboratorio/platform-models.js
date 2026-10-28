/* Deterministic models for browser-only technology demonstrations. */
(function (root) {
  "use strict";
  const equipment = Object.freeze({ laptop: 950, monitor: 240, headset: 75 });
  const validQuantity = (value, max = 8) =>
    Number.isInteger(Number(value)) &&
    Number(value) >= 1 &&
    Number(value) <= max;
  const emptyRequests = () => ({ nextId: 1, records: [] });
  function createRequest(state, product, quantity) {
    if (!Object.hasOwn(equipment, product))
      return { ok: false, error: "product", state };
    if (!validQuantity(quantity))
      return { ok: false, error: "quantity", state };
    const record = {
      id: `REQ-${String(state.nextId).padStart(3, "0")}`,
      product,
      quantity: Number(quantity),
      total: equipment[product] * Number(quantity),
      status: "pending",
    };
    return {
      ok: true,
      record,
      state: { nextId: state.nextId + 1, records: [...state.records, record] },
    };
  }
  function decideRequest(state, id, decision) {
    if (!["approved", "rejected"].includes(decision))
      return { ok: false, state };
    const record = state.records.find((item) => item.id === id);
    if (!record || record.status !== "pending") return { ok: false, state };
    return {
      ok: true,
      state: {
        ...state,
        records: state.records.map((item) =>
          item.id === id ? { ...item, status: decision } : item,
        ),
      },
    };
  }
  function startFlow(amount, threshold, failNotification = false) {
    amount = Number(amount);
    threshold = Number(threshold);
    if (
      !Number.isFinite(amount) ||
      amount <= 0 ||
      amount > 100000 ||
      !Number.isFinite(threshold) ||
      threshold < 0 ||
      threshold > 100000
    )
      return { status: "invalid" };
    const manual = amount > threshold;
    return {
      amount,
      threshold,
      manual,
      failNotification: Boolean(failNotification),
      status: manual
        ? "pending"
        : failNotification
          ? "notification-error"
          : "complete",
      decision: manual ? null : "automatic",
      retries: 0,
    };
  }
  function decideFlow(state, decision) {
    if (state.status !== "pending" || !["approve", "reject"].includes(decision))
      return state;
    return {
      ...state,
      decision,
      status:
        decision === "reject"
          ? "rejected"
          : state.failNotification
            ? "notification-error"
            : "complete",
    };
  }
  function retryFlow(state) {
    if (state.status !== "notification-error") return state;
    return {
      ...state,
      status: "complete",
      failNotification: false,
      retries: state.retries + 1,
    };
  }
  const sales = Object.freeze(
    [
      ["2026-01", "north", "devices", 4200],
      ["2026-01", "north", "services", 1800],
      ["2026-01", "central", "devices", 5600],
      ["2026-01", "central", "services", 2400],
      ["2026-01", "south", "devices", 3100],
      ["2026-01", "south", "services", 1700],
      ["2026-02", "north", "devices", 4600],
      ["2026-02", "north", "services", 2100],
      ["2026-02", "central", "devices", 5900],
      ["2026-02", "central", "services", 2800],
      ["2026-02", "south", "devices", 3400],
      ["2026-02", "south", "services", 1900],
      ["2026-03", "north", "devices", 5100],
      ["2026-03", "north", "services", 2300],
      ["2026-03", "central", "devices", 6200],
      ["2026-03", "central", "services", 3100],
      ["2026-03", "south", "devices", 3700],
      ["2026-03", "south", "services", 2200],
    ].map(([month, region, category, amount], index) =>
      Object.freeze({ id: index + 1, month, region, category, amount }),
    ),
  );
  function summarizeSales(region = "all", month = "all") {
    const rows = sales.filter(
      (row) =>
        (region === "all" || row.region === region) &&
        (month === "all" || row.month === month),
    );
    const total = rows.reduce((sum, row) => sum + row.amount, 0);
    const grouped = ["north", "central", "south"].map((key) => ({
      region: key,
      amount: rows
        .filter((row) => row.region === key)
        .reduce((sum, row) => sum + row.amount, 0),
    }));
    return {
      rows,
      total,
      count: rows.length,
      average: rows.length ? total / rows.length : 0,
      grouped,
    };
  }
  const emptyIntegration = () => ({ orders: [], events: [], attempts: 0 });
  function processOrder(state, event, fail = false) {
    if (
      !event ||
      !/^EVT-\d{3,6}$/.test(event.id) ||
      !validQuantity(event.quantity, 20) ||
      !Object.hasOwn(equipment, event.product)
    )
      return { state, status: "invalid" };
    const next = { ...state, attempts: state.attempts + 1 };
    const prior = state.events.find((item) => item.id === event.id);
    if (prior) {
      const same =
        prior.product === event.product &&
        prior.quantity === Number(event.quantity);
      return {
        state: next,
        status: same ? "duplicate" : "conflict",
        order: state.orders.find((item) => item.eventId === event.id),
      };
    }
    if (fail) return { state: next, status: "error" };
    const order = {
      id: `ORD-${String(state.orders.length + 1).padStart(3, "0")}`,
      eventId: event.id,
      product: event.product,
      quantity: Number(event.quantity),
      total: equipment[event.product] * Number(event.quantity),
    };
    return {
      status: "complete",
      order,
      state: {
        ...next,
        orders: [...state.orders, order],
        events: [
          ...state.events,
          {
            id: event.id,
            product: event.product,
            quantity: Number(event.quantity),
          },
        ],
      },
    };
  }
  const emptyDeployment = () => ({
    version: 1,
    previous: null,
    attempts: 0,
    releases: 0,
    status: "idle",
  });
  function deploy(state, testsFail) {
    if (testsFail)
      return { ...state, attempts: state.attempts + 1, status: "blocked" };
    const version = state.releases + 2;
    return {
      version,
      previous: state.version,
      attempts: state.attempts + 1,
      releases: state.releases + 1,
      status: "deployed",
    };
  }
  function rollback(state) {
    if (state.previous === null) return state;
    return {
      ...state,
      version: state.previous,
      previous: null,
      status: "rolled-back",
    };
  }
  const api = {
    equipment,
    validQuantity,
    emptyRequests,
    createRequest,
    decideRequest,
    startFlow,
    decideFlow,
    retryFlow,
    sales,
    summarizeSales,
    emptyIntegration,
    processOrder,
    emptyDeployment,
    deploy,
    rollback,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.PlatformLabModels = Object.freeze(api);
})(typeof globalThis !== "undefined" ? globalThis : this);
