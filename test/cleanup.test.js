"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { JSDOM } = require("jsdom");
const createJQuery = require("jquery");

const { cleanupStalePopupLov } = require("../src/popup-lov-cleanup.js");

function setup(html, pageId) {
  const dom = new JSDOM("<!doctype html><html><body>" + html + "</body></html>");
  const jQuery = createJQuery(dom.window);
  const apex = {
    env: { APP_PAGE_ID: pageId },
    jQuery,
    util: { getTopApex: () => ({ jQuery }) },
  };
  return { dom, apex, jQuery };
}

test("removes stale PopupLov elements for the current page", () => {
  const { apex, jQuery } = setup(
    '<div id="PopupLov_102_P102_CUSTOMER_lov"></div>' +
      '<div id="PopupLov_102_P102_PRODUCT_lov"></div>',
    102
  );
  const removed = cleanupStalePopupLov({ apex });
  assert.equal(removed, 2);
  assert.equal(jQuery('[id^="PopupLov_102_"]').length, 0);
});

test("leaves Popup LOV elements of other pages untouched", () => {
  const { apex, jQuery } = setup(
    '<div id="PopupLov_102_P102_A_lov"></div>' +
      '<div id="PopupLov_5_P5_B_lov"></div>',
    102
  );
  cleanupStalePopupLov({ apex });
  assert.equal(jQuery('[id^="PopupLov_5_"]').length, 1);
});

test("does not match page ids that merely start with the same digits", () => {
  const { apex, jQuery } = setup('<div id="PopupLov_1020_P1020_A_lov"></div>', 102);
  const removed = cleanupStalePopupLov({ apex });
  assert.equal(removed, 0);
  assert.equal(jQuery('[id^="PopupLov_1020_"]').length, 1);
});

test("returns 0 when nothing is stale", () => {
  const { apex } = setup("<p>clean</p>", 7);
  assert.equal(cleanupStalePopupLov({ apex }), 0);
});

test("falls back to apex.jQuery when getTopApex throws (cross-origin)", () => {
  const { apex, jQuery } = setup('<div id="PopupLov_9_P9_X_lov"></div>', 9);
  apex.util.getTopApex = () => {
    throw new Error("Blocked a frame with origin");
  };
  assert.equal(cleanupStalePopupLov({ apex }), 1);
  assert.equal(jQuery('[id^="PopupLov_9_"]').length, 0);
});

test("is safe without apex or page id", () => {
  assert.equal(cleanupStalePopupLov({ apex: null }), 0);
  assert.equal(cleanupStalePopupLov({ apex: { env: {} } }), 0);
});

test("accepts an explicit pageId override", () => {
  const { apex, jQuery } = setup('<div id="PopupLov_33_P33_A_lov"></div>', 1);
  assert.equal(cleanupStalePopupLov({ apex, pageId: 33 }), 1);
  assert.equal(jQuery('[id^="PopupLov_33_"]').length, 0);
});
