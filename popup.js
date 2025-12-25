const inputText = document.getElementById("inputText");
const outputText = document.getElementById("outputText");
const polishBtn = document.getElementById("polishBtn");
const copyBtn = document.getElementById("copyBtn");
const status = document.getElementById("status");
const wordCount = document.getElementById("wordCount");

/**
 * Word counter
 */
function updateWordCount() {
  const words = inputText.value.trim()
    ? inputText.value.trim().split(/\s+/).length
    : 0;
  wordCount.textContent = `${words} words`;
}

inputText.addEventListener("input", updateWordCount);

/**
 * Load selected text from right-click
 */
chrome.storage.local.get("selectedText", (data) => {
  if (data.selectedText) {
    inputText.value = data.selectedText;
    updateWordCount();
    chrome.storage.local.remove("selectedText");
  }
});

/**
 * Polish text
 */
polishBtn.addEventListener("click", () => {
  const text = inputText.value.trim();

  if (!text) {
    status.textContent = "Please enter or select text.";
    return;
  }

  polishBtn.disabled = true;
  copyBtn.disabled = true;
  status.textContent = "Processing (first request may take ~30s)...";
  outputText.value = "";

  chrome.runtime.sendMessage(
    { action: "polish_text", text },
    (response) => {
      polishBtn.disabled = false;

      if (!response || response.error) {
        status.textContent = response?.error || "Unexpected error";
        return;
      }

      outputText.value = response.correctedText;
      copyBtn.disabled = false;
      status.textContent = "Done.";
    }
  );
});

/**
 * Copy output
 */
copyBtn.addEventListener("click", async () => {
  await navigator.clipboard.writeText(outputText.value);
  status.textContent = "Copied to clipboard.";
});
