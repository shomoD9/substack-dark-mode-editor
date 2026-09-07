(() => {
  'use strict';
  const attribute = 'data-substack-editor-dark';
  let enabled = true;
  let lastPath;

  function update() {
    lastPath = location.pathname;
    // Match draft editors, but not the dashboard, public posts, or preview routes.
    const editor = /^\/publish\/post\/(?:\d+|new)\/?$/.test(lastPath);
    document.documentElement.toggleAttribute(attribute, enabled && editor);
  }

  update();
  chrome.storage.local.get({ enabled: true }, (settings) => {
    if (chrome.runtime.lastError) return;
    enabled = settings.enabled !== false;
    update();
  });
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.enabled) {
      enabled = changes.enabled.newValue !== false;
      update();
    }
  });
  // Substack navigates without reloading. A URL-only check avoids observing
  // draft keystrokes or changing anything inside the editable document.
  setInterval(() => {
    if (location.pathname !== lastPath) update();
  }, 500);
  addEventListener('popstate', update);
  addEventListener('pageshow', update);
})();
