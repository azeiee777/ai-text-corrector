const inputText = document.getElementById("inputText");
const outputText = document.getElementById("outputText");
const correctBtn = document.getElementById("correctBtn");
const wordCount = document.getElementById("wordCount");
const status = document.getElementById("status");
const copyBtn = document.getElementById("copyBtn");

/**
 * Word counter
 */
function updateWordCount() {
  const text = inputText.value.trim();
  const words = text ? text.split(/\s+/).length : 0;
  wordCount.textContent = `${words} words`;
}

/**
 * Load selected text from right-click
 */
chrome.storage.local.get("selectedText", (data) => {
  if (data && data.selectedText) {
    inputText.value = data.selectedText;
    updateWordCount();
    status.textContent = "Selected text loaded.";
    chrome.storage.local.remove("selectedText");
  }
});

/**
 * Input listener
 */
inputText.addEventListener("input", () => {
  updateWordCount();
  status.textContent = "";
});

/**
 * Correct text
 */
correctBtn.addEventListener("click", () => {
  const text = inputText.value.trim();

  if (!text) {
    status.textContent = "Please enter or select some text.";
    return;
  }

  const words = text.split(/\s+/).length;
  if (words > 10000) {
    status.textContent = "Text exceeds 10,000 word limit.";
    return;
  }

  status.textContent = "Processing...";
  outputText.value = "";
  correctBtn.disabled = true;
  copyBtn.disabled = true;

  chrome.runtime.sendMessage({ action: "correct_text", text }, (response) => {
    correctBtn.disabled = false;

    if (chrome.runtime.lastError || !response) {
      status.textContent = "Extension error occurred.";
      return;
    }

    if (response.error) {
      status.textContent = "Failed to correct text.";
      outputText.value = response.error;
      return;
    }

    outputText.value = response.correctedText;
    copyBtn.disabled = false;
    status.textContent = "Correction completed.";
  });
});

/**
 * Copy to clipboard
 */
copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(outputText.value);
    status.textContent = "Copied to clipboard.";
  } catch {
    status.textContent = "Failed to copy text.";
  }
});
