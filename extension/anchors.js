/* Pure text anchoring; shared by the content script and regression tests. */
(() => {
  const make = (text, start, end) => ({
    quote: text.slice(start, end), prefix: text.slice(Math.max(0, start - 48), start),
    suffix: text.slice(end, end + 48), start, end
  });
  function locate(text, anchor) {
    if (!anchor || anchor.orphan || !anchor.quote) return null;
    const candidates = [];
    for (let i = text.indexOf(anchor.quote); i !== -1; i = text.indexOf(anchor.quote, i + 1)) {
      const end = i + anchor.quote.length;
      let score = 0;
      for (let n = 1; n <= anchor.prefix.length; n++) {
        if (text[i - n] !== anchor.prefix[anchor.prefix.length - n]) break;
        score++;
      }
      for (let n = 0; n < anchor.suffix.length; n++) {
        if (text[end + n] !== anchor.suffix[n]) break;
        score++;
      }
      candidates.push({ start: i, end, score });
    }
    candidates.sort((a, b) => b.score - a.score);
    if (!candidates.length || (candidates.length > 1 && candidates[0].score === candidates[1].score)) return null;
    return candidates[0];
  }
  // Map an anchor through a contiguous edit. More complicated replacements are
  // re-found by quote/context, or marked missing instead of attaching elsewhere.
  function move(before, after, anchor) {
    if (before === after || anchor.orphan) return anchor;
    let left = 0;
    while (left < before.length && left < after.length && before[left] === after[left]) left++;
    let oldRight = before.length, newRight = after.length;
    while (oldRight > left && newRight > left && before[oldRight - 1] === after[newRight - 1]) { oldRight--; newRight--; }
    const delta = newRight - oldRight;
    const { start, end } = anchor;
    if (oldRight <= start) return make(after, start + delta, end + delta);
    if (left >= end) return make(after, start, end);
    if (left >= start && oldRight <= end && !(left === start && oldRight === end && newRight === left)) {
      return make(after, start, end + delta);
    }
    const found = locate(after, anchor);
    return found ? make(after, found.start, found.end) : { ...anchor, orphan: true };
  }
  const api = { make, locate, move };
  if (typeof module !== 'undefined') module.exports = api;
  else globalThis.SubstackAnchors = api;
})();
