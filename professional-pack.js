/* Keep printing local: no booking, form submission or external requests. */
'use strict';
const printSummaryButton = document.querySelector('[data-print-summary]');
if (printSummaryButton) {
  printSummaryButton.addEventListener('click', () => window.print());
}
