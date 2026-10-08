const test = require("node:test");
const assert = require("node:assert/strict");
const { detectByKeywords } = require("../detector.js");

test("finds an explicit sponsor read and return phrase", () => {
  const transcript = [
    "[10] This episode is brought to you by Acme.",
    "[20] Use promo code HELLO for 20% off.",
    "[42] Anyway, back to the interview."
  ].join("\n");

  assert.deepEqual(detectByKeywords(transcript), [
    { start: 10, end: 42, reason: "sponsor" }
  ]);
});

test("does not mark an ordinary product discussion as sponsored", () => {
  const transcript = "[10] This review compares VPN protocols.\n[30] The benchmark is complete.";
  assert.deepEqual(detectByKeywords(transcript), []);
});
