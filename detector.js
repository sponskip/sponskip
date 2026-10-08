// Pure caption-based sponsor detection. This file intentionally has no Chrome APIs
// so it can be tested with Node as well as loaded by the service worker.
const SponsorDetector = (() => {
  const SPONSOR_DECLARATION = new RegExp(
    "(" + [
      "today'?s sponsor",
      "this (video|episode|stream|show|conversation|interview|podcast) is (brought to you|sponsored|made possible|supported|presented)",
      "sponsored by",
      "brought to you by",
      "presenting sponsor",
      "sponsor of this (podcast|video|show|channel|episode)",
      "thanks? (to )?[\\w\\s]+ for sponsoring",
      "partnered with",
      "a (quick )?word from (our|today'?s) sponsor",
      "support for (today'?s episode|this show|our podcast) comes from",
      "our partners? at",
      "seamless segue to (our|today'?s) sponsor",
      "smooth segue to (our|today'?s) sponsor",
      "our sponsor,? [\\w\\s]+"
    ].join("|") + ")",
    "i"
  );

  const COMMERCIAL_CTA = new RegExp(
    "(" + [
      "(promo|discount|coupon|offer) code",
      "\\b(use|enter|apply)\\s+(the\\s+)?(promo\\s+|discount\\s+)?code\\b",
      "link (is )?(in the|down) (description|below|show notes)",
      "link down below",
      "\\b\\d+ ?% (off|discount|cashback|cash back|savings)\\b",
      "\\b(save|get) (\\d+ ?%|\\$\\d+)\\b",
      "\\bfree trial\\b",
      "\\bfree shipping\\b",
      "\\bmoney[- ]back guarantee\\b",
      "\\b(head over|go|visit)\\s+(to|on)?\\s+[a-z0-9-]+\\.(com|io|co|ai|org|net|store|app)\\b",
      "\\b[a-z0-9-]+\\.(com|io|co|ai|org|net|store|app)\\/[a-z0-9_\\.-]+\\b",
      "\\bfirst \\d[\\d,]* (people|users|listeners|viewers)\\b",
      "\\bexclusive deal\\b",
      "\\bspecial offer\\b"
    ].join("|") + ")",
    "i"
  );

  const KNOWN_SPONSORS = new RegExp(
    "\\b(" + [
      "ridge wallet", "dbrand", "squarespace", "nordvpn", "expressvpn", "surfshark",
      "manscaped", "raycon", "betterhelp", "hellofresh", "factor meals", "casetify",
      "grammarly", "audible", "skillshare", "brilliant", "incogni", "aura",
      "displate", "anker", "secretlab", "ifixit", "ugreen", "lttstore",
      "axon", "ramp", "deel", "brex", "honey"
    ].join("|") + ")\\b",
    "i"
  );

  const RETURN = new RegExp(
    "(" + [
      "\\banyway",
      "back to (the|our) (video|topic|build|benchmarks|show|review|conversation|interview)",
      "let'?s get back (to|into)",
      "where were we",
      "with that out of the way",
      "so,? back to",
      "moving on",
      "without further ado",
      "thanks again to"
    ].join("|") + ")",
    "i"
  );

  const MAX_AD = 120;
  const QUIET_GAP = 16;
  const MIN_AD = 12;

  function detectByKeywords(transcript) {
    const lines = transcript.split("\n").map((line) => {
      const match = line.match(/^\[(\d+)\]\s*(.*)$/);
      return match && { t: Number(match[1]), text: match[2] };
    }).filter(Boolean);

    const segments = [];
    const overlapsSegment = (time) => segments.some((segment) => time >= segment.start && time <= segment.end);

    for (let index = 0; index < lines.length; index += 1) {
      if (overlapsSegment(lines[index].t) || !SPONSOR_DECLARATION.test(lines[index].text)) continue;
      const segment = findSegment(lines, index);
      if (segment) segments.push(segment);
    }

    for (let index = 0; index < lines.length; index += 1) {
      if (overlapsSegment(lines[index].t)) continue;
      if (!KNOWN_SPONSORS.test(lines[index].text) && !COMMERCIAL_CTA.test(lines[index].text)) continue;
      const window = lines.filter((line) => line.t >= lines[index].t && line.t <= lines[index].t + 55);
      const hasCommercialSignal = window.some((line) => COMMERCIAL_CTA.test(line.text));
      const hasBrandSignal = window.some((line) => KNOWN_SPONSORS.test(line.text));
      if (!hasCommercialSignal || !hasBrandSignal) continue;
      const segment = findSegment(lines, index);
      if (segment && !overlapsSegment(segment.start)) segments.push(segment);
    }

    return segments.sort((left, right) => left.start - right.start);
  }

  function findSegment(lines, index) {
    let start = lines[index].t;
    for (let cursor = index - 1; cursor >= 0 && lines[index].t - lines[cursor].t <= 14; cursor -= 1) {
      if (/^[-—&gt;]+\s*|before we|take a (quick )?break|want to tell you|quick word/i.test(lines[cursor].text)) {
        start = lines[cursor].t;
        break;
      }
    }

    let lastAd = lines[index].t;
    let end = null;
    for (let cursor = index; cursor < lines.length && lines[cursor].t - start <= MAX_AD; cursor += 1) {
      const { t, text } = lines[cursor];
      if (RETURN.test(text) && t - start >= MIN_AD) {
        end = t;
        break;
      }
      if (COMMERCIAL_CTA.test(text) || KNOWN_SPONSORS.test(text)) {
        lastAd = t;
      } else if (t - lastAd > QUIET_GAP && t - start >= MIN_AD) {
        end = lines[cursor - 1]?.t || lastAd;
        break;
      }
    }

    end = end || Math.min(lastAd + 6, start + MAX_AD);
    return end - start >= MIN_AD ? { start, end, reason: "sponsor" } : null;
  }

  return { detectByKeywords };
})();

if (typeof module !== "undefined") module.exports = SponsorDetector;
