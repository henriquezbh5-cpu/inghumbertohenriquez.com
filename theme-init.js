/* ==========================================================================
   inghumbertohenriquez.com — theme-init.js
   Se carga SINCRONO en <head>, antes de la hoja de estilos (CSP: script-src
   'self' — sin inline). DARK es el default de la sala de control; aqui solo
   se cambia a light si el usuario lo eligio antes, evitando el flash de tema
   incorrecto en el primer paint. El toggle vive en cv.js.
   ========================================================================== */
(function () {
    'use strict';
    try {
        if (localStorage.getItem('hh-theme') === 'light') {
            document.documentElement.dataset.theme = 'light';
            var meta = document.querySelector('meta[name="theme-color"]');
            if (meta) meta.setAttribute('content', '#F2F6FB');
        }
    } catch (e) { /* private mode / storage bloqueado */ }
})();
