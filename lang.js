/* Country-aware language selection for both static websites. */
(() => {
  "use strict";

  const script = document.currentScript;
  const storageKey = "website-language";
  const valid = (value) => value === "es" || value === "en";
  const current = document.documentElement.lang.startsWith("en") ? "en" : "es";
  const alternate = (language) => {
    const link = document.querySelector(
      `link[rel="alternate"][hreflang="${language}"]`,
    );
    if (!link) return null;
    const target = new URL(link.href, location.href);
    // Resolve production alternates on this origin too, allowing safe local previews.
    if (
      target.hostname.replace(/^www\./, "") !==
        location.hostname.replace(/^www\./, "") &&
      !/^(localhost|127\.0\.0\.1)$/.test(location.hostname)
    )
      return null;
    target.protocol = location.protocol;
    target.host = location.host;
    target.search = location.search;
    target.hash = location.hash;
    return target;
  };
  const readPreference = () => {
    try {
      const value =
        localStorage.getItem(storageKey) || localStorage.getItem("optz-lang");
      if (valid(value)) return value;
    } catch {
      /* Cookies remain available when local storage is restricted. */
    }
    try {
      const match = document.cookie.match(
        /(?:^|;\s*)website-language=(es|en)(?:;|$)/,
      );
      return match ? match[1] : null;
    } catch {
      return null;
    }
  };
  const remember = (language) => {
    if (!valid(language)) return false;
    let persisted = false;
    try {
      localStorage.setItem(storageKey, language);
      persisted = localStorage.getItem(storageKey) === language;
    } catch {
      /* Private browsing. */
    }
    try {
      document.cookie = `${storageKey}=${language}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
      persisted ||= document.cookie.includes(`${storageKey}=${language}`);
    } catch {
      /* Explicit language links also work when cookies are disabled. */
    }
    return persisted;
  };
  const requestedLanguage = new URL(location.href).searchParams.get("lang");
  let volatilePreference = valid(requestedLanguage) ? requestedLanguage : null;
  let manuallySelected = false;
  let callbackSequence = 0;
  const updateCallbackLanguage = async (language) => {
    const sequence = ++callbackSequence;
    const target = alternate(language);
    if (!target) return;
    target.search = "";
    target.hash = "";
    const response = await fetch(target.href, { credentials: "same-origin" });
    if (!response.ok) return;
    const translated = new DOMParser().parseFromString(
      await response.text(),
      "text/html",
    );
    if (sequence !== callbackSequence) return;
    const textNodes = (body) => {
      const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
      const nodes = [];
      let node;
      while ((node = walker.nextNode())) {
        if (
          !node.textContent.trim() ||
          node.parentElement?.closest(
            "script, style, #code-value, #code, #error-box, #msg",
          )
        )
          continue;
        nodes.push(node);
      }
      return nodes;
    };
    const originalNodes = textNodes(document.body);
    const translatedNodes = textNodes(translated.body);
    if (originalNodes.length !== translatedNodes.length) return;
    originalNodes.forEach((node, index) => {
      node.textContent = translatedNodes[index].textContent;
    });
    const originalElements = document.body.querySelectorAll("*");
    const translatedElements = translated.body.querySelectorAll("*");
    if (originalElements.length === translatedElements.length) {
      originalElements.forEach((element, index) => {
        for (const name of ["aria-label", "title", "aria-current", "href"]) {
          const value = translatedElements[index].getAttribute(name);
          if (value !== null) element.setAttribute(name, value);
          else if (name === "aria-current") element.removeAttribute(name);
        }
      });
    }
    document.documentElement.lang = language;
    document.title = translated.title;
    // The authorization code and error details stay in their original DOM nodes.
    const message = document.getElementById("msg");
    const code = document.getElementById("code")?.textContent;
    if (message)
      message.textContent =
        code && code !== "—"
          ? language === "en"
            ? "Authorization successful. Copy the code:"
            : "Autorización correcta. Copie el código:"
          : language === "en"
            ? "No authorization code was found in the URL."
            : "No se encontró ningún código en la URL.";
    document.dispatchEvent(
      new CustomEvent("website:language", { detail: { language } }),
    );
  };
  const navigate = (language) => {
    if (language === current) return;
    const target = alternate(language);
    if (target && target.href !== location.href) location.replace(target.href);
  };
  document.addEventListener(
    "click",
    (event) => {
      const link =
        event.target instanceof Element
          ? event.target.closest("a[data-lang]")
          : null;
      if (!link || !valid(link.dataset.lang)) {
        // Carry only the public language choice when all browser storage is blocked.
        const navigation =
          event.target instanceof Element
            ? event.target.closest("a[href]")
            : null;
        if (
          !volatilePreference ||
          !navigation ||
          navigation.hasAttribute("download")
        )
          return;
        const destination = new URL(navigation.href, location.href);
        if (
          destination.origin !== location.origin ||
          !/\/$|\.html$/.test(destination.pathname) ||
          /\/(callback|gracias-pago)\//.test(destination.pathname)
        )
          return;
        destination.searchParams.set("lang", volatilePreference);
        navigation.href = destination.href;
        return;
      }
      manuallySelected = true;
      const persisted = remember(link.dataset.lang);
      volatilePreference = persisted ? null : link.dataset.lang;
      if (/\/callback\//.test(location.pathname)) {
        event.preventDefault();
        updateCallbackLanguage(link.dataset.lang).catch(() => {
          /* Keep the authorization code available if the translation cannot load. */
        });
        return;
      }
      const target = alternate(link.dataset.lang);
      if (target) {
        if (!persisted) target.searchParams.set("lang", link.dataset.lang);
        else target.searchParams.delete("lang");
        link.href = target.href;
      }
      if (
        link.dataset.lang === current &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.shiftKey &&
        event.button === 0
      ) {
        event.preventDefault();
        if (!persisted && target) {
          try {
            history.replaceState(null, "", target.href);
          } catch {
            /* The current page still honors the manual choice. */
          }
        }
      }
    },
    true,
  );

  // Keep OAuth authorization codes on the registered callback route.
  if (/\/callback\//.test(location.pathname)) return;
  // Payment gateways may append transaction identifiers; discard them before any
  // language navigation, matching the site's existing payment-return cleanup.
  if (
    /\/gracias-pago\//.test(location.pathname) &&
    (location.search || location.hash)
  ) {
    try {
      history.replaceState(null, "", location.pathname);
    } catch {
      return;
    }
  }
  if (valid(requestedLanguage)) {
    if (remember(requestedLanguage)) volatilePreference = null;
    navigate(requestedLanguage);
    return;
  }
  const preference = readPreference();
  if (preference) {
    navigate(preference);
    return;
  }
  // A shared English URL explicitly requests English; geo does not override it.
  if (location.pathname.startsWith("/en/")) return;
  const browserLanguage = () => {
    const primary =
      (navigator.languages && navigator.languages[0]) ||
      navigator.language ||
      "es";
    return primary.toLowerCase().startsWith("en") ? "en" : "es";
  };
  const languageForCountry = (country) => {
    if (country === "US") return "en";
    if (
      [
        "ES",
        "SV",
        "MX",
        "GT",
        "HN",
        "NI",
        "CR",
        "PA",
        "CU",
        "DO",
        "PR",
        "CO",
        "VE",
        "EC",
        "PE",
        "BO",
        "PY",
        "CL",
        "AR",
        "UY",
        "GQ",
      ].includes(country)
    )
      return "es";
    return browserLanguage();
  };
  let cachedCountry = null;
  try {
    cachedCountry = sessionStorage.getItem("website-country");
  } catch {
    /* No cache. */
  }
  if (cachedCountry && /^[A-Z]{2}$/.test(cachedCountry)) {
    navigate(languageForCountry(cachedCountry));
    return;
  }
  const endpoint = script?.dataset.countryEndpoint || "/cdn-cgi/trace";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1500);
  fetch(endpoint, {
    credentials: "omit",
    cache: "no-store",
    signal: controller.signal,
  })
    .then((response) => {
      if (
        !response.ok ||
        !response.headers.get("content-type")?.includes("text/plain")
      )
        throw new Error("Country unavailable");
      return response.text();
    })
    .then((trace) => {
      // Extract only ISO country. IP and other trace fields are never retained.
      const match = trace.match(/^loc=([A-Z]{2})\s*$/m);
      if (!match) throw new Error("Country unavailable");
      try {
        sessionStorage.setItem("website-country", match[1]);
      } catch {
        /* No cache. */
      }
      if (!manuallySelected && !readPreference())
        navigate(languageForCountry(match[1]));
    })
    .catch(() => {
      if (!manuallySelected && !readPreference()) navigate(browserLanguage());
    })
    .finally(() => clearTimeout(timeout));
})();
