// 🔥 Ambil tab aktif
function getCurrentTab(callback) {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    callback(tabs[0]);
  });
}

// 🔥 LISTENER PROGRESS DARI CONTENT
let lastProgress = 0;

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "PROGRESS") {
    lastProgress = msg.value;

    const el = document.getElementById("progress");
    if (el) {
      el.innerText = "Progress: " + lastProgress;
    }
  }

  if (msg.type === "WAITING") {
    const el = document.getElementById("progress");
    if (el) {
      el.innerText = `Progress: ${lastProgress} (waiting ${msg.value} seconds...)`;
    }
  }
});

// 🔥 CEK BUTTON
document.getElementById("check").addEventListener("click", () => {
  const mutual = document.getElementById("mutual")?.checked || false;

  getCurrentTab((tab) => {
    chrome.tabs.sendMessage(tab.id, {type: "CHECK", mutual}, (res) => {
      if (chrome.runtime.lastError) {
        console.warn("Content belum siap:", chrome.runtime.lastError.message);
        return;
      }

      const el = document.getElementById("result");
      if (el && res) {
        el.innerText = "Number of buttons: " + res.count;
      }
    });
  });
});

// 🔥 START (SUDAH AUTO INJECT CONTENT.JS)
document.getElementById("start").addEventListener("click", () => {
  console.log("START DIKLIK");

  const min = parseInt(document.getElementById("min")?.value) || 60;
  const max = parseInt(document.getElementById("max")?.value) || 240;
  const limit = parseInt(document.getElementById("limit")?.value) || 50;
  const mutual = document.getElementById("mutual")?.checked || false;

  getCurrentTab((tab) => {
    // 🔥 PAKSA INJECT content.js (INI KUNCI FIX LOOP)
    chrome.scripting.executeScript(
      {
        target: {tabId: tab.id},
        files: ["content.js"],
      },
      () => {
        // 🔥 KIRIM START SETELAH INJECT
        chrome.tabs.sendMessage(tab.id, {
          type: "START",
          min,
          max,
          limit,
          mutual,
        });
      }
    );
  });
});

// 🔥 STOP
document.getElementById("stop").addEventListener("click", () => {
  getCurrentTab((tab) => {
    chrome.tabs.sendMessage(tab.id, {type: "STOP"});
  });
});
