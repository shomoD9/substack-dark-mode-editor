'use strict';
const toggle = document.getElementById('enabled');
const status = document.getElementById('status');
const describe = () => {
  status.textContent = toggle.checked
    ? 'On · Automatically applies to Substack draft editors.'
    : 'Off · Substack’s original appearance is restored.';
};
chrome.storage.local.get({ enabled: true }, (settings) => {
  if (chrome.runtime.lastError) {
    status.textContent = 'Could not load preference. Please reopen this popup.';
    return;
  }
  toggle.checked = settings.enabled !== false;
  toggle.disabled = false;
  describe();
});
toggle.addEventListener('change', () => {
  toggle.disabled = true;
  chrome.storage.local.set({ enabled: toggle.checked }, () => {
    toggle.disabled = false;
    if (chrome.runtime.lastError) {
      toggle.checked = !toggle.checked;
      status.textContent = 'Could not save preference. Please try again.';
      return;
    }
    describe();
  });
});
