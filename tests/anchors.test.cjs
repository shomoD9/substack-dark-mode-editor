const { test } = require('node:test');
const assert = require('node:assert/strict');
const A = require('../extension/anchors.js');
test('quotes reattach after insertion before them and after reload', () => {
  const original = 'The quiet room is a good place to write.';
  const a = A.make(original, 4, 14);
  const changed = 'Today: ' + original;
  assert.deepEqual(A.locate(changed, a), { start:11, end:21, score:a.prefix.length + a.suffix.length });
  const moved = A.move(original, changed, a);
  assert.equal(moved.quote, 'quiet room');
  assert.equal(moved.start, 11);
});
test('editing within a quote tracks its updated words', () => {
  const original = 'The quiet room is here.';
  const a = A.make(original, 4, 14);
  assert.equal(A.move(original, 'The very quiet room is here.', a).quote, 'quiet room');
  assert.equal(A.move(original, 'The quiet writing room is here.', a).quote, 'quiet writing room');
  assert.equal(A.move(original, 'The calm room is here.', a).quote, 'calm room');
});
test('deleting quoted text makes an orphan, not an unrelated attachment', () => {
  const a = A.make('left SELECT right', 5, 11);
  const moved = A.move('left SELECT right', 'left  right', a);
  assert.equal(moved.orphan, true);
  assert.equal(A.locate('SELECT elsewhere', moved), null);
});
test('duplicate quote contexts are used, ties fail closed', () => {
  const a = A.make('first word second word last', 18, 22);
  assert.equal(A.locate('prefix first word second word last', a).start, 25);
  assert.equal(A.locate('word word', { quote:'word', prefix:'', suffix:'', start:0, end:4 }), null);
});
test('Unicode and line-spanning selections use DOM-compatible offsets', () => {
  const text = 'One 🌙 sentence.\nA second paragraph.';
  const a = A.make(text, 4, 20);
  const moved = A.move(text, 'New ' + text, a);
  assert.equal(moved.quote, a.quote);
  assert.equal(moved.start, 8);
});
