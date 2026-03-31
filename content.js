if (window.__AUTO_ADD_LOADED__) {
  console.log("Script sudah pernah diload, skip...");
} else {
  window.__AUTO_ADD_LOADED__ = true;

  let isRunning = false;
  let totalClicked = 0;

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function randomDelay(min, max) {
    return Math.floor(Math.random() * (max - min) + min) * 1000;
  }

  function isAddFriendButton(el) {
    const text = el.innerText.toLowerCase();
    return text.includes("add friend") || text.includes("tambahkan teman");
  }

  // 🔥 FILTER MUTUAL FRIENDS
  function hasMutual(el) {
    const parent = el.closest("div");
    if (!parent) return false;

    return parent.innerText.toLowerCase().includes("mutual");
  }

  function getButtons(filterMutual = false) {
    const candidates = document.querySelectorAll('[role="button"]');

    return Array.from(candidates).filter((btn) => {
      if (!isAddFriendButton(btn)) return false;

      if (filterMutual) {
        return hasMutual(btn);
      }

      return true;
    });
  }

  // 🔥 AUTO SCROLL
  async function autoScroll() {
    window.scrollBy(0, 800);
    await sleep(1500 + Math.random() * 1500);
  }

  // 🔥 MAIN FUNCTION
  async function autoAddFriendsCustom(min, max, limit, filterMutual) {
    isRunning = true;
    totalClicked = 0;

    while (isRunning && totalClicked < limit) {
      const buttons = getButtons(filterMutual);

      for (let btn of buttons) {
        if (!isRunning || totalClicked >= limit) break;

        btn.scrollIntoView({behavior: "smooth", block: "center"});

        await sleep(1000 + Math.random() * 2000);

        if (!isAddFriendButton(btn)) continue;

        // 🔥 UPDATE PROGRESS KE POPUP
        btn.click();
        totalClicked++;

        chrome.runtime.sendMessage({
          type: "PROGRESS",
          value: totalClicked,
        });

        // ⏳ tampilkan countdown TANPA ubah logic utama
        const delay = randomDelay(min, max);
        let seconds = delay / 1000;

        while (seconds > 0) {
          chrome.runtime.sendMessage({
            type: "WAITING",
            value: seconds,
          });

          await sleep(1000);
          seconds--;
        }
      }

      // 🔥 AUTO SCROLL BIAR LOAD DATA BARU
      await autoScroll();
    }

    isRunning = false;

    console.log("Done!");
  }

  // 🔥 STOP FUNCTION
  function stopAutoAdd() {
    isRunning = false;
    console.log("Stopped!");
  }

  window.autoAddFriendsCustom = autoAddFriendsCustom;
  window.stopAutoAdd = stopAutoAdd;
  window.getButtons = getButtons;

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "START") {
      autoAddFriendsCustom(
        request.min,
        request.max,
        request.limit,
        request.mutual
      );
    }

    if (request.type === "STOP") {
      stopAutoAdd();
    }

    if (request.type === "CHECK") {
      const count = getButtons(request.mutual).length;
      sendResponse({count});
    }
  });
}
