/* Cotizador interactivo — bandas publicadas + simulador con IA (quote-ai worker).
   Bilingüe: lee el mismo localStorage('preferred-lang') que profile.js. */
(function () {
    'use strict';

    var pick = document.getElementById('czPick');
    var rng = document.getElementById('czRange');
    var wa = document.getElementById('czWa');
    if (!pick || !rng || !wa) return;

    var boxes = Array.prototype.slice.call(pick.querySelectorAll('input[type=checkbox]'));
    var WA = 'https://wa.me/50371928070?text=';

    var T = {
        es: {
            empty: 'Selecciona una opción',
            ph: 'Ej.: cada vez que un cliente paga, quiero que el comprobante se registre en Excel, se avise al vendedor por WhatsApp y se emita el recibo…',
            analyzing: 'Analizando…',
            simulate: 'Simular con IA →',
            waEmpty: 'Hola, quiero cotizar una automatización.',
            waMsg: function (names, lo, hi) {
                return 'Hola, armé mi combinación en inghumbertohenriquez.com: ' + names.join(' + ') +
                    ' (rango publicado ' + fmt(lo) + '–' + fmt(hi) + '). Quiero el diagnóstico gratis de 30 minutos.';
            },
            waAi: function (desc, label, lo, hi) {
                return 'Hola, simulé mi caso con la IA del sitio: "' + desc.slice(0, 200) + '" (estimado ' +
                    label + ', ' + fmt(lo) + '–' + fmt(hi) + '). Quiero el diagnóstico gratis.';
            },
            fallback: 'Estimación local aproximada por el alcance descrito (el analizador no respondió).',
            types: {
                automatizacion: 'Flujo automático', automation: 'Flujo automático',
                agente: 'Agente de IA', webapp: 'Agente de IA', celula: 'Célula multi-agente',
                fullstack: 'Célula multi-agente', bi: 'Reportes / BI automático',
                website: 'Desarrollo web', mobile: 'Desarrollo a la medida', bitcoin: 'Automatización'
            },
            weeks: { small: '~1–2 semanas', medium: '~2–4 semanas', large: '~4–8 semanas' }
        },
        en: {
            empty: 'Pick an option',
            ph: 'E.g.: every time a client pays, I want the receipt logged in Excel, the salesperson notified on WhatsApp and the invoice issued…',
            analyzing: 'Analyzing…',
            simulate: 'Simulate with AI →',
            waEmpty: 'Hi, I want a quote for an automation.',
            waMsg: function (names, lo, hi) {
                return 'Hi, I built my combo on inghumbertohenriquez.com: ' + names.join(' + ') +
                    ' (published range ' + fmt(lo) + '–' + fmt(hi) + '). I want the free 30-minute diagnostic.';
            },
            waAi: function (desc, label, lo, hi) {
                return 'Hi, I simulated my case with the site AI: "' + desc.slice(0, 200) + '" (estimated ' +
                    label + ', ' + fmt(lo) + '–' + fmt(hi) + '). I want the free diagnostic.';
            },
            fallback: 'Approximate local estimate based on the described scope (the analyzer did not respond).',
            types: {
                automatizacion: 'Automated flow', automation: 'Automated flow',
                agente: 'AI agent', webapp: 'AI agent', celula: 'Multi-agent cell',
                fullstack: 'Multi-agent cell', bi: 'Automated reports / BI',
                website: 'Web development', mobile: 'Custom build', bitcoin: 'Automation'
            },
            weeks: { small: '~1–2 weeks', medium: '~2–4 weeks', large: '~4–8 weeks' }
        }
    };
    var BANDS = { small: [600, 1200], medium: [1200, 3000], large: [3000, 8000] };

    function lang() {
        try { return localStorage.getItem('preferred-lang') === 'en' ? 'en' : 'es'; } catch (e) { return 'es'; }
    }
    function t() { return T[lang()]; }
    function fmt(n) { return '$' + n.toLocaleString('en-US'); }

    var desc = document.getElementById('czDesc');
    function paint() {
        if (desc) desc.placeholder = t().ph;
        upd();
    }

    function upd() {
        var lo = 0, hi = 0, names = [];
        boxes.forEach(function (b) {
            b.closest('label').classList.toggle('on', b.checked);
            if (b.checked) { lo += +b.dataset.lo; hi += +b.dataset.hi; names.push(b.dataset.n); }
        });
        if (!names.length) {
            rng.textContent = t().empty;
            rng.classList.add('cz-empty');
            wa.href = WA + encodeURIComponent(t().waEmpty);
            return;
        }
        rng.classList.remove('cz-empty');
        rng.textContent = fmt(lo) + ' – ' + fmt(hi);
        wa.href = WA + encodeURIComponent(t().waMsg(names, lo, hi));
    }
    boxes.forEach(function (b) { b.addEventListener('change', upd); });

    /* re-pintar al cambiar idioma (profile.js maneja los botones data-lang) */
    document.querySelectorAll('[data-lang]').forEach(function (btn) {
        btn.addEventListener('click', function () { setTimeout(paint, 50); });
    });

    /* ---- simulador con IA ---- */
    var go = document.getElementById('czGo');
    if (go && desc) {
        go.addEventListener('click', function () {
            var txt = (desc.value || '').trim();
            if (txt.length < 15) { desc.focus(); return; }
            go.disabled = true;
            go.textContent = t().analyzing;
            var ctl = new AbortController();
            var timer = setTimeout(function () { ctl.abort(); }, 12000);
            fetch('https://quote-ai.henriquezbh5.workers.dev', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description: txt, lang: lang() }),
                signal: ctl.signal
            })
                .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
                .then(function (d) { show(d.type, d.complexity, d.reasoning || ''); })
                .catch(function () {
                    var c = txt.length > 420 ? 'large' : (txt.length > 160 ? 'medium' : 'small');
                    show('automatizacion', c, t().fallback);
                })
                .finally(function () {
                    clearTimeout(timer);
                    go.disabled = false;
                    go.textContent = t().simulate;
                });

            function show(type, cx, why) {
                var band = BANDS[cx] || BANDS.medium;
                var label = t().types[type] || t().types.automatizacion;
                document.getElementById('czTipo').textContent = label + ' · ' + (t().weeks[cx] || t().weeks.medium);
                document.getElementById('czAiRng').textContent = fmt(band[0]) + ' – ' + fmt(band[1]);
                document.getElementById('czWhy').textContent = why;
                document.getElementById('czRes').hidden = false;
                wa.href = WA + encodeURIComponent(t().waAi(txt, label, band[0], band[1]));
            }
        });
    }

    paint();
})();
