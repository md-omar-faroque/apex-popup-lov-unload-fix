// Minimal version: paste into
// Page Designer > Page Properties > JavaScript > "Execute when Page Loads"
// (no <script> tags, no function wrapper needed there).
//
// For the hardened version with guards and error handling, use
// src/popup-lov-cleanup.js instead.

let topApex = apex.util.getTopApex();
let currentPage = apex.env.APP_PAGE_ID;

topApex.jQuery('[id^="PopupLov_' + currentPage + '_"]').each(function () {
  $(this).remove();
});
