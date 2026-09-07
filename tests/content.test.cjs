const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../extension/content.js'), 'utf8');
function setup(pathname, stored = true) {
  let dark = false, tick, changed;
  const context = {
    location: { pathname },
    document: { documentElement: { toggleAttribute(name, value) {
      assert.equal(name, 'data-substack-editor-dark'); dark = value;
    } } },
    chrome: { runtime: {}, storage: {
      local: { get(defaults, callback) { callback({ enabled: stored }); } },
      onChanged: { addListener(callback) { changed = callback; } }
    } },
    setInterval(callback) { tick = callback; }, addEventListener() {}
  };
  vm.runInNewContext(source, context);
  return { dark: () => dark, navigate(p) { context.location.pathname = p; tick(); },
    change(value) { changed({ enabled: { newValue: value } }, 'local'); } };
}
test('only draft routes activate', () => {
  for (const p of ['/publish/post/214396124', '/publish/post/new', '/publish/post/42/'])
    assert.equal(setup(p).dark(), true, p);
  for (const p of ['/', '/publish', '/p/article', '/publish/posts', '/publish/post/42/preview', '/publish/post/abc'])
    assert.equal(setup(p).dark(), false, p);
});
test('saved preference, live toggles, and SPA navigation', () => {
  const app = setup('/publish/post/42', false);
  assert.equal(app.dark(), false);
  app.change(true); assert.equal(app.dark(), true);
  app.navigate('/'); assert.equal(app.dark(), false);
  app.navigate('/publish/post/43'); assert.equal(app.dark(), true);
  app.change(false); assert.equal(app.dark(), false);
});
test('manifest only requests local settings and Substack access', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '../extension/manifest.json')));
  assert.equal(manifest.manifest_version, 3);
  assert.deepEqual(manifest.permissions, ['storage']);
  assert.deepEqual(manifest.content_scripts[0].matches, ['https://*.substack.com/*']);
  for (const file of [...manifest.content_scripts[0].js, ...manifest.content_scripts[0].css, manifest.action.default_popup])
    assert.ok(fs.existsSync(path.join(__dirname, '../extension', file)));
});
