chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type) {
    // fetch
    return true;
  }
});
