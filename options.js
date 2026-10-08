document.querySelectorAll(".nav-item").forEach((item) => {
  item.onclick = () => {
    document.querySelectorAll(".nav-item").forEach((entry) => entry.classList.remove("active"));
    item.classList.add("active");
    const tab = item.getAttribute("data-tab");
    document.getElementById("generalTab").style.display = tab === "general" ? "block" : "none";
    document.getElementById("analyticsTab").style.display = tab === "analytics" ? "block" : "none";
    document.getElementById("privacyTab").style.display = tab === "privacy" ? "block" : "none";
    if (tab === "analytics") loadAnalytics();
  };
});

function showSaveNotice() {
  const notice = document.getElementById("saveAlert");
  notice.style.display = "block";
  setTimeout(() => { notice.style.display = "none"; }, 1800);
}

async function initSettings() {
  const settings = await chrome.storage.local.get({ autoSkip: true, playSound: false, showToast: true, showBadgeCount: true });
  for (const [key, value] of Object.entries(settings)) document.getElementById(key).checked = value;

  ["autoSkip", "playSound", "showToast", "showBadgeCount"].forEach((key) => {
    document.getElementById(key).onchange = async (event) => {
      await chrome.storage.local.set({ [key]: event.target.checked });
      showSaveNotice();
    };
  });
}

function leaderboardRow(rank, name, count) {
  const row = document.createElement("tr");
  const rankCell = document.createElement("td");
  rankCell.style.cssText = `font-weight:700;color:${rank === 0 ? "#ef4444" : "#888"};`;
  rankCell.textContent = rank === 0 ? "👑 #1" : `#${rank + 1}`;
  const nameCell = document.createElement("td");
  nameCell.style.fontWeight = "600";
  nameCell.textContent = name;
  const countCell = document.createElement("td");
  countCell.style.cssText = "font-weight:700;color:#ef4444;";
  countCell.textContent = `${count} sponsor read${count === 1 ? "" : "s"}`;
  row.append(rankCell, nameCell, countCell);
  return row;
}

async function loadAnalytics() {
  const data = await chrome.storage.local.get({ totalAdsSkipped: 0, totalSecondsSaved: 0, channelStats: {} });
  document.getElementById("statTotalAds").textContent = String(data.totalAdsSkipped);
  const minutes = Math.round(data.totalSecondsSaved / 60);
  document.getElementById("statTimeSaved").textContent = minutes >= 60 ? `${(minutes / 60).toFixed(1)}h` : `${minutes}m`;

  const channels = Object.entries(data.channelStats).sort((left, right) => right[1] - left[1]);
  document.getElementById("statCreatorsCount").textContent = String(channels.length);
  const body = document.getElementById("leaderboardBody");
  if (channels.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 3;
    cell.style.cssText = "text-align:center;color:#666;";
    cell.textContent = "No channel statistics recorded yet.";
    row.append(cell);
    body.replaceChildren(row);
    return;
  }
  body.replaceChildren(...channels.map(([name, count], index) => leaderboardRow(index, name, count)));
}

document.getElementById("clearDataBtn").onclick = async () => {
  if (!confirm("Are you sure you want to reset your lifetime stats?")) return;
  const settings = await chrome.storage.local.get({ autoSkip: true, playSound: false, showToast: true, showBadgeCount: true });
  await chrome.storage.local.clear();
  await chrome.storage.local.set(settings);
  await loadAnalytics();
  showSaveNotice();
};

initSettings();
