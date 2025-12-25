const BACKEND_URL = "https://polish-text-ai-backend.onrender.com/api/polish";

/**
 * Create context menu
 */
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "polishtext-ai",
    title: "Polish with PolishText AI",
    contexts: ["selection"],
  });
});

/**
 * Handle right-click selection
 */
chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "polishtext-ai" && info.selectionText) {
    chrome.storage.local.set({ selectedText: info.selectionText }, () =>
      chrome.action.openPopup()
    );
  }
});

/**
 * Handle popup requests
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "polish_text") {
    fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: request.text }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || "Backend error");
        }
        return res.json();
      })
      .then((data) => sendResponse({ correctedText: data.corrected_text }))
      .catch((err) => sendResponse({ error: err.message }));

    return true; // async
  }
});
