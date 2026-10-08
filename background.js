importScripts("detector.js");

const CACHE_PREFIX = "v2_seg_";

chrome.runtime.onMessage.addListener((message, sender, reply) => {
  if (message.type !== "analyze") return;

  findSegments(message.videoId, message.transcript, Boolean(message.force)).then(
    async (result) => {
      const segments = result?.segments || [];
      await updateBadge(sender.tab?.id, segments.length, message.showBadgeCount !== false);
      if (segments.length > 0) await recordStats(message.channelName, segments);
      reply(result);
    },
    async (error) => {
      await updateBadge(sender.tab?.id, 0, message.showBadgeCount !== false);
      reply({ segments: [], source: `error: ${error.message}` });
    }
  );

  return true;
});

chrome.runtime.onInstalled.addListener(async () => {
  const storage = await chrome.storage.local.get(null);
  const legacyKeys = Object.keys(storage).filter((key) => key.startsWith("seg_"));
  if (legacyKeys.length > 0) await chrome.storage.local.remove(legacyKeys);
});

async function findSegments(videoId, transcript, force = false) {
  const key = `${CACHE_PREFIX}${videoId}`;
  if (!force) {
    const cached = await chrome.storage.local.get([key, `${key}_source`]);
    if (cached[key]) return { segments: cached[key], source: cached[`${key}_source`] || "cache" };
  }

  const sponsorBlockSegments = await sponsorBlock(videoId);
  const segments = sponsorBlockSegments.length > 0
    ? sponsorBlockSegments
    : transcript
      ? SponsorDetector.detectByKeywords(transcript)
      : [];
  const source = sponsorBlockSegments.length > 0 ? "sponsorblock" : transcript ? "keywords" : "no captions available";
  await chrome.storage.local.set({ [key]: segments, [`${key}_source`]: source });
  return { segments, source };
}

async function sponsorBlock(videoId) {
  try {
    const response = await fetch(
      `https://sponsor.ajay.app/api/skipSegments?videoID=${encodeURIComponent(videoId)}&categories=["sponsor","selfpromo"]`
    );
    if (!response.ok) return [];
    return (await response.json()).map((segment) => ({
      start: segment.segment[0],
      end: segment.segment[1],
      reason: segment.category
    }));
  } catch {
    return [];
  }
}

async function recordStats(channelName, segments) {
  const channel = channelName && channelName !== "Unknown Creator" ? channelName : "Other Channels";
  const state = await chrome.storage.local.get({ totalAdsSkipped: 0, totalSecondsSaved: 0, channelStats: {} });
  const secondsSaved = segments.reduce((total, segment) => total + Math.round(segment.end - segment.start), 0);
  const channelStats = { ...state.channelStats, [channel]: (state.channelStats[channel] || 0) + segments.length };

  await chrome.storage.local.set({
    totalAdsSkipped: state.totalAdsSkipped + segments.length,
    totalSecondsSaved: state.totalSecondsSaved + secondsSaved,
    channelStats
  });
}

async function updateBadge(tabId, count, enabled) {
  if (!tabId) return;
  if (!enabled || count === 0) {
    await chrome.action.setBadgeText({ tabId, text: "" });
    return;
  }
  await chrome.action.setBadgeText({ tabId, text: String(count) });
  await chrome.action.setBadgeBackgroundColor({ tabId, color: "#e53e3e" });
}
