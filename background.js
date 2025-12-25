const OPENAI_API_KEY = "PASTE_YOUR_API_KEY_HERE";

/**
 * Create right-click menu
 */
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "gpt-correct-text",
    title: "Correct with GPT",
    contexts: ["selection"],
  });
});

/**
 * Handle right-click selection
 */
chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "gpt-correct-text" && info.selectionText) {
    chrome.storage.local.set({ selectedText: info.selectionText }, () =>
      chrome.action.openPopup()
    );
  }
});

/**
 * Handle popup requests
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "correct_text") {
    correctTextWithGPT(request.text)
      .then((correctedText) => sendResponse({ correctedText }))
      .catch((error) => sendResponse({ error: error.message }));
    return true;
  }
});

/**
 * OpenAI API call
 */
async function correctTextWithGPT(text) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a professional editor. Correct grammar, spelling, clarity, and tone without changing meaning.",
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0.2,
      max_tokens: 8000,
    }),
  });

  if (!response.ok) {
    throw new Error("OpenAI API request failed");
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}
