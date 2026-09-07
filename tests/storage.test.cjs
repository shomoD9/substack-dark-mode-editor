const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function setup() {
  const local = {}, sync = {};
  let listener, failSync = false, failLocal = false;
  const area = (data, remote) => ({
    async get() { return structuredClone(data); },
    async set(values) {
      if (remote ? failSync : failLocal) throw Error('QUOTA_BYTES');
      Object.assign(data, structuredClone(values));
    },
    async remove(keys) { for (const key of keys) delete data[key]; }
  });
  const context = { TextEncoder, chrome: { runtime: { onMessage: { addListener(fn) { listener = fn; } } }, storage: {
    local:area(local, false), sync:area(sync, true), onChanged:{ addListener() {} }
  } } };
  vm.runInNewContext(fs.readFileSync('extension/background.js','utf8'),context);
  return { local, sync, failSync(value) { failSync = value; }, failLocal(value) { failLocal = value; },
    request(message) { return new Promise(resolve => listener(message, {}, resolve)); } };
}
const doc = 'example.substack.com/publish/post/1';
const message = (id, kind = 'reply') => ({ type:'comments:put', key:`comment:${kind}:${id}`, value:{ doc, kind, thread:'one', body:id, updated:1 } });
test('parallel replies remain independent and survive loading', async () => {
  const app = setup();
  await Promise.all([app.request(message('first')),app.request(message('second'))]);
  const loaded = await app.request({type:'comments:get',doc});
  assert.equal(Object.keys(loaded.records).length,2);
  assert.equal(loaded.pending,0);
  assert.equal(Object.keys(app.sync).length,2);
});
test('sync quota errors retain local writes and retry without duplication', async () => {
  const app = setup(); app.failSync(true);
  const result = await app.request(message('one'));
  assert.equal(result.saved,true); assert.equal(result.pending,true);
  assert.ok(app.local['comment:reply:one']);
  assert.equal(Object.keys(app.sync).length,0);
  app.failSync(false);
  const loaded = await app.request({type:'comments:get',doc});
  assert.equal(loaded.pending,0);
  assert.equal(Object.keys(app.sync).length,1);
});
test('older sync data cannot overwrite a pending local edit', async () => {
  const app = setup(); app.failSync(true);
  await app.request(message('one'));
  app.sync['comment:reply:one'] = { doc, body:'old', updated:0 };
  const loaded = await app.request({type:'comments:get',doc});
  assert.equal(loaded.records['comment:reply:one'].body,'one');
});
test('oversized and locally failed writes report errors, do not claim success', async () => {
  const app = setup(); const large = message('large'); large.value.body = '🌙'.repeat(2500);
  assert.match((await app.request(large)).error,/too long/);
  assert.equal(Object.keys(app.local).length,0);
  app.failLocal(true);
  assert.match((await app.request(message('local'))).error,/QUOTA/);
});
test('records arriving from another device are loaded only for their draft', async () => {
  const app = setup();
  app.sync['comment:reply:remote'] = {doc,kind:'reply',thread:'one',body:'remote',updated:4};
  app.sync['comment:reply:other'] = {doc:'other.substack.com/publish/post/2',kind:'reply',thread:'two',updated:4};
  const loaded = await app.request({type:'comments:get',doc});
  assert.equal(Object.keys(loaded.records).length,1);
  assert.equal(loaded.records['comment:reply:remote'].body,'remote');
});
test('resolving and reopening do not replace reply records', async () => {
  const app = setup();
  await app.request(message('reply'));
  const state = message('one','state'); state.value.resolved = true;
  await app.request(state);
  state.value.resolved = false; state.value.updated = 2;
  await app.request(state);
  const loaded = await app.request({type:'comments:get',doc});
  assert.equal(loaded.records['comment:state:one'].resolved,false);
  assert.equal(loaded.records['comment:reply:reply'].body,'reply');
});
