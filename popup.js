function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${minutes}:${remainder < 10 ? "0" : ""}${remainder}`;
}

function emptyState(text) {
  const element = document.createElement("div");
  element.className = "empty-state";
  element.textContent = text;
  return element;
}

function renderSegments(container, segments) {
  if (segments.length === 0) {
    container.replaceChildren(emptyState("No sponsor segments detected"));
    return;
  }

  const items = segments.map((segment) => {
    const item = document.createElement("div");
    item.className = "segment-item";
    const time = document.createElement("span");
    time.className = "segment-time";
    time.textContent = `⏱ ${formatTime(segment.start)} ➔ ${formatTime(segment.end)}`;
    const label = document.createElement("span");
    label.className = "segment-badge";
    label.textContent = `${Math.round(segment.end - segment.start)}s (${segment.reason || "sponsor"})`;
    item.append(time, label);
    return item;
  });
  container.replaceChildren(...items);
}

function renderLeaderboard(container, channels) {
  if (channels.length === 0) {
    container.replaceChildren(emptyState("No creator history yet"));
    return;
  }

  const rows = channels.slice(0, 3).map(([name, count], index) => {
    const row = document.createElement("div");
    row.style.cssText = "display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid #242424;";
    const creator = document.createElement("span");
    creator.style.cssText = "color:#ddd;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:190px;";
    creator.textContent = `${index === 0 ? "👑 " : ""}${name}`;
    const total = document.createElement("span");
    total.style.cssText = "font-weight:700;color:#ff4d4d;";
    total.textContent = `${count} ad${count === 1 ? "" : "s"}`;
    row.append(creator, total);
    return row;
  });
  container.replaceChildren(...rows);
}

async function loadData() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url?.includes("youtube.com/watch")) {
    document.getElementById("source").textContent = "Not a YouTube watch page";
    document.getElementById("statusDot").classList.add("inactive");
    return;
  }

  const videoId = new URL(tab.url).searchParams.get("v");
  if (!videoId) return;
  const key = `v2_seg_${videoId}`;
  const data = await chrome.storage.local.get([key, `${key}_source`]);
  const segments = data[key] || [];
  const source = data[`${key}_source`] || "scanned";

  document.getElementById("count").textContent = String(segments.length);
  document.getElementById("source").textContent = segments.length ? `Detected via ${source}` : "No ads found on this video";
  renderSegments(document.getElementById("segmentsList"), segments);

  const lifetime = await chrome.storage.local.get({ totalAdsSkipped: 0, totalSecondsSaved: 0, channelStats: {} });
  document.getElementById("totalAdsStat").textContent = String(lifetime.totalAdsSkipped);
  const minutes = Math.round(lifetime.totalSecondsSaved / 60);
  document.getElementById("totalTimeStat").textContent = minutes >= 60 ? `${(minutes / 60).toFixed(1)}h` : `${minutes}m`;
  renderLeaderboard(document.getElementById("leaderboardList"), Object.entries(lifetime.channelStats).sort((a, b) => b[1] - a[1]));

  const settings = await chrome.storage.local.get({ autoSkip: true, playSound: false });
  document.getElementById("autoSkipToggle").checked = settings.autoSkip;
  document.getElementById("soundToggle").checked = settings.playSound;
}

document.getElementById("autoSkipToggle").onchange = (event) => chrome.storage.local.set({ autoSkip: event.target.checked });
document.getElementById("soundToggle").onchange = (event) => chrome.storage.local.set({ playSound: event.target.checked });
document.getElementById("settingsBtn").onclick = () => chrome.runtime.openOptionsPage();
document.getElementById("ghBtn").onclick = () => window.open("https://github.com/sponskip/sponskip");
document.getElementById("rescanBtn").onclick = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    chrome.tabs.sendMessage(tab.id, { type: "rescan" });
    window.close();
  }
};

loadData();
