/* ==========================================================================
   inghumbertohenriquez.com — theme-init.js
   Se carga SÍNCRONO en <head>, antes de la hoja de estilos (CSP: script-src
   'self' — sin inline). Light es el default (data-theme="light" viene fijo
   en <html>); aquí solo se cambia a dark si el usuario lo eligió antes,
   evitando el flash de tema incorrecto en el primer paint.
   ========================================================================== */
(function () {
    'use strict';
    try {
        if (localStorage.getItem('hh-theme') === 'dark') {
            document.documentElement.dataset.theme = 'dark';
            var meta = document.querySelector('meta[name="theme-color"]:not([media])');
            if (meta) meta.setAttribute('content', '#0A0F1A');
        }
    } catch (e) { /* private mode / storage bloqueado */ }
})();
