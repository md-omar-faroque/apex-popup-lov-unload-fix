/*!
 * apex-popup-lov-unload-fix
 * Removes stale PopupLov_<pageId>_* elements left in the top window's DOM
 * when APEX's unload-based cleanup is blocked by Chrome's Permissions Policy.
 *
 * Usage (APEX):
 *   - Single page : Page Properties > JavaScript > Execute when Page Loads
 *                   (paste the body of cleanupStalePopupLov / see README)
 *   - Whole app   : upload as a Static Application File and reference it in
 *                   User Interface Attributes > JavaScript > File URLs
 *
 * License: MIT
 */
(function (global) {
  "use strict";

  var ID_PREFIX = "PopupLov_";

  /**
   * Resolve the top-level apex object. Falls back to the current one when
   * the top window is not accessible (e.g. cross-origin embedding).
   */
  function resolveTopApex(apex) {
    try {
      if (apex.util && typeof apex.util.getTopApex === "function") {
        return apex.util.getTopApex() || apex;
      }
    } catch (e) {
      /* cross-origin or other access error: fall through */
    }
    return apex;
  }

  /**
   * Remove stale Popup LOV containers belonging to the given page.
   *
   * @param {Object}  [opts]
   * @param {Object}  [opts.apex]   apex object (defaults to global apex)
   * @param {number|string} [opts.pageId] page id (defaults to apex.env.APP_PAGE_ID)
   * @returns {number} how many elements were removed
   */
  function cleanupStalePopupLov(opts) {
    opts = opts || {};
    var apex = opts.apex || global.apex;
    if (!apex || !apex.env) {
      return 0;
    }

    var pageId = opts.pageId != null ? opts.pageId : apex.env.APP_PAGE_ID;
    if (pageId == null || pageId === "") {
      return 0;
    }

    var topApex = resolveTopApex(apex);
    var $ = (topApex && topApex.jQuery) || apex.jQuery || global.jQuery;
    if (!$) {
      return 0;
    }

    try {
      var $stale = $('[id^="' + ID_PREFIX + pageId + '_"]');
      var count = $stale.length;
      $stale.remove();
      return count;
    } catch (e) {
      if (global.console && global.console.warn) {
        global.console.warn("[popup-lov-cleanup] cleanup failed:", e);
      }
      return 0;
    }
  }

  var api = { cleanupStalePopupLov: cleanupStalePopupLov };

  // CommonJS export (used by the unit tests)
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  // Browser: run once the DOM is ready.
  if (global.apex && global.apex.jQuery) {
    global.apex.jQuery(function () {
      cleanupStalePopupLov();
    });
  } else if (global.document && !(typeof module !== "undefined" && module.exports)) {
    global.document.addEventListener("DOMContentLoaded", function () {
      cleanupStalePopupLov();
    });
  }

  global.popupLovCleanup = api;
})(typeof window !== "undefined" ? window : this);
