/* Progressive enhancement for the bilingual professional home. */
(() => {
  "use strict";
  const english = document.documentElement.lang === "en";
  const words = english
    ? {
        open: "Open menu",
        close: "Close menu",
        sending: "Sending…",
        send: "Send message",
        success: "Message received. I will reply during business hours.",
        error:
          "Your message could not be sent. Your text has been kept. You can try again or ",
        alternative: "contact me by email",
        loading: "Opening NOVA…",
        chat: "Ask NOVA about my profile",
        unavailable:
          "NOVA could not be opened. Please try again or visit the professional profile.",
      }
    : {
        open: "Abrir menú",
        close: "Cerrar menú",
        sending: "Enviando…",
        send: "Enviar mensaje",
        success: "Mensaje recibido. Te responderé en horario hábil.",
        error:
          "No se pudo enviar el mensaje. Hemos conservado tu texto. Puedes intentarlo de nuevo o ",
        alternative: "escribirme por correo",
        loading: "Abriendo NOVA…",
        chat: "Consultar mi perfil con NOVA",
        unavailable:
          "No se pudo abrir NOVA. Inténtalo de nuevo o consulta el perfil profesional.",
      };
  document.documentElement.classList.add("js");

  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  const mobile = matchMedia("(max-width: 900px)");
  const setMenu = (open, returnFocus = false) => {
    links.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? words.close : words.open);
    if (returnFocus) toggle.focus();
    else if (open && mobile.matches) links.querySelector("a")?.focus();
  };
  toggle.hidden = false;
  toggle.addEventListener("click", () =>
    setMenu(toggle.getAttribute("aria-expanded") !== "true"),
  );
  links.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (!link) return;
    setMenu(false);
    if (mobile.matches && link.hash) {
      const target = document.getElementById(link.hash.slice(1));
      if (target) {
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }
    }
  });
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      toggle.getAttribute("aria-expanded") === "true"
    )
      setMenu(false, true);
  });
  document.addEventListener("click", (event) => {
    if (!links.contains(event.target) && !toggle.contains(event.target))
      setMenu(false);
  });
  mobile.addEventListener("change", () => setMenu(false));

  if ("IntersectionObserver" in window) {
    const sections = document.querySelectorAll("main > section[id]");
    const navLinks = [...links.querySelectorAll('a[href^="#"]')];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          for (const link of navLinks) {
            if (link.hash === "#" + entry.target.id)
              link.setAttribute("aria-current", "location");
            else link.removeAttribute("aria-current");
          }
        }
      },
      { rootMargin: "-15% 0px -65% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
  }

  document.querySelectorAll("a[data-lang]").forEach((link) => {
    link.addEventListener("click", () => {
      try {
        localStorage.setItem("website-language", link.dataset.lang);
      } catch {
        /* Links also work without storage. */
      }
    });
  });

  const form = document.getElementById("contactForm");
  const reason = document.getElementById("cf-tipo");
  document.querySelectorAll("[data-contact-reason]").forEach((link) => {
    link.addEventListener("click", () => {
      if (
        [...reason.options].some(
          (option) => option.value === link.dataset.contactReason,
        )
      )
        reason.value = link.dataset.contactReason;
    });
  });
  const send = document.getElementById("formSend");
  const status = document.getElementById("formStatus");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (send.disabled || !form.reportValidity()) return;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    send.disabled = true;
    send.textContent = words.sending;
    form.setAttribute("aria-busy", "true");
    status.textContent = "";
    status.className = "form-status";
    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("Submission failed");
      form.reset();
      status.textContent = words.success;
      status.classList.add("is-success");
    } catch {
      status.textContent = words.error;
      const alternative = document.createElement("a");
      alternative.href = "mailto:henriquezbh5@gmail.com";
      alternative.textContent = words.alternative;
      status.append(alternative, ".");
      status.classList.add("is-error");
    } finally {
      clearTimeout(timeout);
      form.removeAttribute("aria-busy");
      send.disabled = false;
      send.textContent = words.send;
    }
  });

  // Load the existing assistant only after a visitor asks to open it.
  const trigger = document.getElementById("novaTrigger");
  const chatStatus = document.getElementById("novaStatus");
  trigger.hidden = false;
  trigger.addEventListener("click", () => {
    if (trigger.disabled) return;
    trigger.disabled = true;
    trigger.textContent = words.loading;
    chatStatus.textContent = "";
    const script = document.createElement("script");
    script.src = trigger.dataset.src;
    script.onload = () => {
      const launcher = document.querySelector(".nova-launch");
      if (!launcher) {
        script.onerror();
        return;
      }
      launcher.textContent = words.chat;
      launcher.setAttribute("aria-label", words.chat);
      launcher.className = "nova-launch text-link";
      trigger.replaceWith(launcher);
      launcher.click();
    };
    script.onerror = () => {
      script.remove();
      trigger.disabled = false;
      trigger.textContent = words.chat;
      chatStatus.textContent = words.unavailable;
    };
    document.body.append(script);
  });
})();
