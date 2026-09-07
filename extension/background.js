'use strict';
// Independent keys for replies prevent two devices overwriting a whole thread.
// Local copies + explicit pending keys retain writes rejected by Chrome Sync.
const PREFIX = 'comment:';
let queue = Promise.resolve();
function serial(job) {
  const task = queue.then(job);
  queue = task.catch(() => {});
  return task;
}
async function reconcile() {
  const [remote, local] = await Promise.all([chrome.storage.sync.get(null), chrome.storage.local.get(null)]);
  const updates = {};
  for (const [key, value] of Object.entries(remote)) {
    if (!key.startsWith(PREFIX) || !value || typeof value !== 'object') continue;
    if ((!local[key] || (!local['pending:' + key] && (local[key].updated || 0) <= (value.updated || 0))) && JSON.stringify(local[key]) !== JSON.stringify(value)) updates[key] = value;
  }
  if (Object.keys(updates).length) await chrome.storage.local.set(updates);
}
async function retry() {
  const local = await chrome.storage.local.get(null);
  const records = {};
  for (const key of Object.keys(local)) {
    if (key.startsWith('pending:') && local[key] && local[key.slice(8)]) records[key.slice(8)] = local[key.slice(8)];
  }
  if (!Object.keys(records).length) return;
  await chrome.storage.sync.set(records);
  await chrome.storage.local.remove(Object.keys(records).map(key => 'pending:' + key));
}
async function handle(message) {
  if (message.type === 'comments:get') {
    let syncError = false;
    try { await reconcile(); await retry(); } catch { syncError = true; }
    const local = await chrome.storage.local.get(null);
    const records = Object.fromEntries(Object.entries(local).filter(([key, value]) => key.startsWith(PREFIX) && value?.doc === message.doc));
    const pending = Object.keys(local).filter(key => key.startsWith('pending:') && local[key] && local[key.slice(8)]?.doc === message.doc).length;
    return { records, pending, syncError };
  }
  if (message.type === 'comments:put') {
    const { key, value } = message;
    if (typeof key !== 'string' || !/^comment:[a-z]+:[\w-]+$/.test(key) || !value || typeof value.doc !== 'string' || typeof value.updated !== 'number') throw Error('Invalid comment record.');
    if (new TextEncoder().encode(key + JSON.stringify(value)).length > 7800) throw Error('This comment is too long. Please shorten it.');
    await chrome.storage.local.set({ [key]: value, ['pending:' + key]: true });
    try {
      await retry();
      return { saved: true, pending: false };
    } catch {
      return { saved: true, pending: true };
    }
  }
  throw Error('Unknown request.');
}
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message?.type?.startsWith('comments:')) return;
  // Extension messages only; no externally_connectable endpoint is declared.
  serial(() => handle(message)).then(sendResponse, error => sendResponse({ error: error.message }));
  return true;
});
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && Object.keys(changes).some(key => key.startsWith(PREFIX))) serial(reconcile).catch(() => {});
});
