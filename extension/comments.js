(() => {
  'use strict';
  const A = globalThis.SubstackAnchors;
  const HIGHLIGHT = 'substack-draft-comments';
  let session = null;
  const documentKey = () => {
    const match = location.pathname.match(/^\/publish\/post\/(\d+)\/?$/);
    return match ? location.hostname + '/publish/post/' + match[1] : null;
  };
  function start(doc) {
    const abort = new AbortController();
    const host = document.createElement('div');
    host.setAttribute('data-sdm-comments', '');
    host.style.cssText = 'position:absolute;z-index:2147483646;pointer-events:none;';
    const shadow = host.attachShadow({ mode: 'closed' });
    shadow.innerHTML = `
      <style>
        :host { all: initial; color-scheme: dark; }
        * { box-sizing: border-box; }
        [hidden] { display: none !important; }
        .surface { font: 13px/1.5 system-ui,sans-serif; color:#e7e7e7; }
        button,textarea { font:inherit; }
        button { color:inherit; cursor:pointer; border:1px solid #404040; border-radius:6px; background:#262626; padding:6px 10px; }
        button:hover { background:#343434; }
        button:focus-visible,textarea:focus-visible { outline:2px solid #d7ad80; outline-offset:2px; }
        button:disabled { opacity:.5; cursor:wait; }
        .launch,.selection { position:absolute; pointer-events:auto; box-shadow:0 3px 12px #0003; background:#222; }
        .launch { right:20px; bottom:72px; display:flex; gap:7px; align-items:center; padding:8px 12px; }
        .selection { white-space:nowrap; padding:7px 11px; }
        .panel { position:absolute; pointer-events:auto; right:20px; top:clamp(80px,18vh,180px); bottom:80px; width:clamp(240px,calc((100vw - 760px)/2 - 24px),320px); max-width:calc(100vw - 32px); background:#202020; border:1px solid #414141; border-radius:10px; box-shadow:0 8px 28px #0003; display:flex; flex-direction:column; overflow:hidden; }
        header { display:flex; justify-content:space-between; align-items:center; padding:12px 14px 8px; }
        h2 { font:600 14px/1.4 system-ui,sans-serif; margin:0; }
        .close { border:0; background:transparent; font-size:19px; line-height:1; padding:3px 6px; }
        .tabs { display:flex; gap:5px; padding:0 14px 10px; border-bottom:1px solid #363636; }
        .tabs button { background:transparent; border:0; color:#aaa; padding:4px 8px; }
        .tabs button[aria-selected=true] { background:#343434; color:#eee; }
        .scroll { flex:1; min-height:0; overflow:auto; padding:12px; overscroll-behavior:contain; }
        .empty { color:#aaa; margin:14px 3px; }
        .thread { border:1px solid #3c3c3c; border-radius:7px; margin-bottom:10px; padding:11px; }
        .thread.active { border-color:#9c7e5e; }
        .quote { display:block; width:100%; text-align:left; border:0; border-left:2px solid #c39b70; border-radius:0; padding:1px 0 1px 8px; background:transparent; color:#c3b19e; margin:0 0 9px; overflow-wrap:anywhere; font-size:12px; }
        .quote span { display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; }
        .message { margin:10px 0; white-space:pre-wrap; overflow-wrap:anywhere; }
        .message + .message { border-top:1px solid #333; padding-top:9px; }
        time { display:block; color:#888; font-size:10px; margin-top:3px; }
        textarea { display:block; resize:vertical; width:100%; min-height:66px; max-height:180px; background:#191919; color:#eee; border:1px solid #424242; border-radius:5px; padding:8px; margin:10px 0 7px; }
        .actions { display:flex; justify-content:flex-end; gap:6px; flex-wrap:wrap; }
        .primary { background:#c49c73; color:#191919; border-color:#c49c73; }
        .primary:hover { background:#d4ac83; }
        .muted { font-size:11px; color:#aaa; }
        .status { padding:8px 14px; border-top:1px solid #363636; font-size:11px; color:#aaa; }
        .status p { margin:0 0 5px; }
        .status button { padding:2px 6px; font-size:11px; margin-right:5px; }
      </style>
      <div class="surface">
        <button class="launch" aria-expanded="false" aria-label="Open draft comments">☷ <span>Comments</span><span class="count"></span></button>
        <button class="selection" hidden>＋ Comment</button>
        <section class="panel" aria-label="Draft comments" hidden>
          <header><h2>Comments</h2><button class="close" aria-label="Close comments">×</button></header>
          <div class="tabs" role="tablist" aria-label="Comment status"><button role="tab" aria-selected="true" data-tab="open">Open</button><button role="tab" aria-selected="false" data-tab="resolved">Resolved</button></div>
          <div class="scroll"></div>
          <div class="status"><p role="status">Loading comments…</p><button class="retry">Retry sync</button><button class="export">Export</button></div>
        </section>
      </div>`;
    document.documentElement.append(host);
    const $ = selector => shadow.querySelector(selector);
    const ui = { launch: $('.launch'), selection: $('.selection'), panel: $('.panel'), list: $('.scroll'), status: $('.status p') };
    let disposed = false, editor = null, observer = null, lastText = '', records = {}, positions = new Map(), ranges = new Map();
    let pendingSelection = null, composer = null, active = null, tab = 'open', error = '', syncPending = 0, syncFailed = false;
    let changeTimer, anchorTimer, refreshing = false, refreshAgain = false;
    const drafts = new Map(), changedAnchors = new Map();
    const listen = (target, event, callback, options = {}) => target.addEventListener(event, callback, { ...options, signal: abort.signal });
    const request = async message => {
      const response = await chrome.runtime.sendMessage(message);
      if (response?.error) throw Error(response.error);
      if (!response) throw Error('Please reload this draft to reconnect the extension.');
      return response;
    };
    const threads = () => Object.values(records).filter(v => v.kind === 'thread').sort((a,b) => a.created - b.created || a.thread.localeCompare(b.thread));
    const anchorFor = thread => records['comment:anchor:' + thread.thread]?.anchor || thread.anchor;
    const resolved = thread => records['comment:state:' + thread.thread]?.resolved === true;
    function textMap() {
      const nodes = [];
      let text = '';
      if (editor) {
        const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
        for (let node; (node = walker.nextNode());) {
          nodes.push({ node, start: text.length });
          text += node.data;
        }
      }
      return { text, nodes };
    }
    function toRange(anchor, map = textMap()) {
      if (!anchor || anchor.orphan || !map.nodes.length || anchor.end <= anchor.start) return null;
      const start = map.nodes.find(n => n.start + n.node.length > anchor.start);
      const end = map.nodes.find(n => n.start + n.node.length >= anchor.end);
      if (!start || !end) return null;
      const range = document.createRange();
      range.setStart(start.node, anchor.start - start.start);
      range.setEnd(end.node, anchor.end - end.start);
      return range;
    }
    function locateAll() {
      const map = textMap();
      const next = new Map();
      for (const thread of threads()) {
        const previous = positions.get(thread.thread);
        const anchor = previous && !previous.missing ? previous : anchorFor(thread);
        const found = A.locate(map.text, anchor);
        if (found) next.set(thread.thread, A.make(map.text, found.start, found.end));
        else next.set(thread.thread, anchor.orphan ? anchor : { ...anchor, orphan: true, missing: true });
      }
      positions = next;
      lastText = map.text;
      paint();
    }
    function paint() {
      ranges = new Map();
      const map = textMap();
      for (const thread of threads()) {
        if (!resolved(thread)) {
          const range = toRange(positions.get(thread.thread), map);
          if (range) ranges.set(thread.thread, range);
        }
      }
      if (globalThis.CSS?.highlights && globalThis.Highlight) CSS.highlights.set(HIGHLIGHT, new Highlight(...ranges.values()));
    }
    async function flushAnchors() {
      clearTimeout(anchorTimer);
      const changes = [...changedAnchors];
      changedAnchors.clear();
      for (const [id, anchor] of changes) {
        try { await put('anchor', id, { anchor }, false); }
        catch (e) { if (!disposed) { changedAnchors.set(id, anchor); error = e.message; status(); } }
      }
    }
    function edited() {
      clearTimeout(changeTimer);
      changeTimer = setTimeout(() => {
        const { text } = textMap();
        if (text === lastText) return;
        for (const [id, anchor] of positions) {
          let moved;
          if (anchor.missing) {
            const thread = threads().find(t => t.thread === id);
            const found = thread && A.locate(text, anchorFor(thread));
            moved = found ? A.make(text, found.start, found.end) : anchor;
          } else moved = A.move(lastText, text, anchor);
          positions.set(id, moved);
          if (!moved.missing && JSON.stringify(anchor) !== JSON.stringify(moved)) changedAnchors.set(id, moved);
        }
        if (composer) composer.anchor = A.move(lastText, text, composer.anchor);
        if (pendingSelection) pendingSelection.anchor = A.move(lastText, text, pendingSelection.anchor);
        lastText = text;
        paint();
        clearTimeout(anchorTimer);
        anchorTimer = setTimeout(flushAnchors, 1500);
      }, 120);
    }
    function layout() {
      host.style.left = '0px'; host.style.top = scrollY + 'px';
      host.style.width = document.documentElement.clientWidth + 'px'; host.style.height = innerHeight + 'px';
    }
    function bindEditor() {
      const prose = [...document.querySelectorAll('.ProseMirror[contenteditable="true"]')];
      const candidates = prose.length ? prose : [...document.querySelectorAll('[contenteditable="true"][role="textbox"], [contenteditable="true"]')];
      const found = candidates.filter(el => !el.closest('[data-sdm-comments]')).sort((a,b) => b.textContent.length - a.textContent.length)[0] || null;
      if (found !== editor) {
        observer?.disconnect();
        editor = found;
        positions.clear();
        locateAll();
        if (editor) {
          observer = new MutationObserver(edited);
          observer.observe(editor, { subtree:true, childList:true, characterData:true });
        }
      }
    }
    function status() {
      ui.status.textContent = error || (syncPending ? 'Saved locally · Sync pending. Check Chrome Sync or retry.' : syncFailed ? 'Local comments loaded · Chrome Sync is unavailable.' : 'Saved in Chrome · Sync requires Chrome Sync on each device.');
      $('.count').textContent = threads().filter(t => !resolved(t)).length || '';
    }
    function open() { ui.panel.hidden = false; ui.launch.setAttribute('aria-expanded', 'true'); }
    function close() { ui.panel.hidden = true; ui.launch.setAttribute('aria-expanded', 'false'); ui.launch.focus(); }
    const element = (tag, className, text) => {
      const node = document.createElement(tag);
      if (className) node.className = className;
      if (text !== undefined) node.textContent = text;
      return node;
    };
    function button(text, action, className = '') {
      const node = element('button', className, text);
      node.addEventListener('click', async () => {
        node.disabled = true;
        try { error = ''; await action(); } catch (e) { error = e.message; }
        finally { node.disabled = false; status(); }
      });
      return node;
    }
    function quote(anchor, id) {
      const node = button('', () => {
        const range = toRange(positions.get(id));
        if (range) {
          range.startContainer.parentElement.scrollIntoView({ block:'center', behavior:'smooth' });
          active = id; render();
        }
      }, 'quote');
      node.append(element('span', '', anchor.quote));
      node.title = anchor.quote;
      return node;
    }
    function writeBox(container, key, placeholder, submit, actionLabel) {
      const input = element('textarea'); input.placeholder = placeholder; input.setAttribute('aria-label', placeholder);
      input.maxLength = 1500; input.value = drafts.get(key) || '';
      input.addEventListener('input', () => drafts.set(key, input.value));
      const send = button(actionLabel, async () => {
        const body = input.value.trim(); if (!body) { input.focus(); return; }
        await submit(body); drafts.delete(key); render();
      }, 'primary');
      input.addEventListener('keydown', e => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); send.click(); }
      });
      const actions = element('div','actions'); actions.append(send);
      container.append(input, actions);
      return input;
    }
    function render() {
      if (disposed) return;
      // Retain typed replies even when another tab/device updates the thread.
      const focused = shadow.activeElement;
      const focusKey = focused?.dataset?.draft;
      const selectionStart = focused?.selectionStart, selectionEnd = focused?.selectionEnd;
      const scrollTop = ui.list.scrollTop;
      ui.list.replaceChildren();
      for (const node of shadow.querySelectorAll('[data-tab]')) node.setAttribute('aria-selected', String(node.dataset.tab === tab));
      if (composer && tab === 'open') {
        const card = element('div','thread active');
        card.append(quote(composer.anchor));
        const input = writeBox(card, 'new', 'Write a comment…', async body => {
          const id = crypto.randomUUID();
          await put('thread', id, { anchor:composer.anchor, body, created:Date.now() });
          positions.set(id, composer.anchor); composer = null; active = id; paint();
        }, 'Comment');
        input.dataset.draft = 'new';
        card.append(button('Cancel', () => { composer = null; drafts.delete('new'); render(); }));
        ui.list.append(card);
      }
      const visible = threads().filter(t => resolved(t) === (tab === 'resolved'));
      if (!visible.length && !composer) ui.list.append(element('p','empty', tab === 'resolved' ? 'No resolved comments.' : 'Select text in your draft to leave a comment.'));
      for (const thread of visible) {
        const id = thread.thread, anchor = positions.get(id) || anchorFor(thread);
        const card = element('div','thread' + (active === id ? ' active' : ''));
        card.dataset.thread = id;
        card.append(quote(anchor, id));
        if (anchor.orphan) {
          card.append(element('div','muted','Text not found. The thread is kept here.'));
          if (pendingSelection) card.append(button('Attach to selected text', async () => {
            await put('anchor', id, { anchor:pendingSelection.anchor });
            positions.set(id, pendingSelection.anchor); paint(); render();
          }));
        }
        const messages = [thread, ...Object.values(records).filter(v => v.kind === 'reply' && v.thread === id).sort((a,b) => a.created - b.created || a.id.localeCompare(b.id))];
        for (const message of messages) {
          const block = element('div','message',message.body);
          const time = element('time','',new Date(message.created).toLocaleString([], { month:'short', day:'numeric', hour:'numeric', minute:'2-digit' }));
          time.dateTime = new Date(message.created).toISOString(); block.append(time); card.append(block);
        }
        const actions = element('div','actions');
        actions.append(button(resolved(thread) ? 'Reopen' : '✓ Resolve', async () => {
          await put('state', id, { resolved:!resolved(thread) }); paint(); render();
        }));
        card.append(actions);
        if (!resolved(thread)) {
          const input = writeBox(card, id, 'Reply…', body => put('reply', crypto.randomUUID(), { thread:id, body, created:Date.now() }), 'Reply');
          input.dataset.draft = id;
        }
        ui.list.append(card);
      }
      ui.list.scrollTop = scrollTop;
      if (focusKey) {
        const input = [...ui.list.querySelectorAll('textarea')].find(node => node.dataset.draft === focusKey);
        if (input) { input.focus({preventScroll:true}); input.setSelectionRange(selectionStart, selectionEnd); }
      }
      status();
    }
    async function put(kind, id, data, repaint = true) {
      const key = 'comment:' + kind + ':' + id;
      const value = { doc, kind, thread:id, id, ...data, updated:Date.now() };
      const result = await request({ type:'comments:put', key, value });
      if (disposed) return;
      records[key] = value;
      if (result.pending) syncPending++;
      if (repaint) status();
    }
    async function refresh() {
      if (refreshing) { refreshAgain = true; return; }
      refreshing = true;
      try {
        const response = await request({ type:'comments:get', doc });
        if (disposed) return;
        const old = records;
        records = response.records;
        syncPending = response.pending; syncFailed = response.syncError;
        for (const thread of threads()) {
          const key = 'comment:anchor:' + thread.thread;
          if (!changedAnchors.has(thread.thread) && JSON.stringify(old[key]) !== JSON.stringify(records[key])) positions.delete(thread.thread);
        }
        locateAll(); render();
      } catch (e) { error = e.message; status(); }
      finally {
        refreshing = false;
        if (refreshAgain && !disposed) { refreshAgain = false; refresh(); }
      }
    }
    function selected() {
      if (!editor) return null;
      const selection = getSelection();
      if (!selection?.rangeCount || selection.isCollapsed) return null;
      const range = selection.getRangeAt(0);
      if (!editor.contains(range.startContainer) || !editor.contains(range.endContainer)) return null;
      const prefix = document.createRange(); prefix.selectNodeContents(editor); prefix.setEnd(range.startContainer, range.startOffset);
      const start = prefix.toString().length;
      const quote = range.toString();
      if (!quote.trim() || quote.length > 800) return null;
      return { anchor:A.make(textMap().text, start, start + quote.length), rect:range.getBoundingClientRect() };
    }
    function capture() {
      const value = selected();
      if (value) {
        pendingSelection = value;
        ui.selection.hidden = false;
        ui.selection.style.top = Math.max(8, Math.min(innerHeight - 48, value.rect.bottom + 8)) + 'px';
        ui.selection.style.left = Math.max(8, Math.min(innerWidth - 120, value.rect.left)) + 'px';
        if (!ui.panel.hidden) render();
      } else ui.selection.hidden = true;
    }
    listen(ui.selection, 'pointerdown', event => event.preventDefault());
    listen(ui.selection, 'click', () => {
      if (!pendingSelection) return;
      composer = { anchor:pendingSelection.anchor }; tab = 'open'; open(); render(); ui.selection.hidden = true;
      ui.list.querySelector('textarea')?.focus();
    });
    listen(ui.launch, 'click', () => { if (ui.panel.hidden) { open(); render(); } else close(); });
    listen($('.close'), 'click', close);
    for (const node of shadow.querySelectorAll('[data-tab]')) listen(node,'click', () => { tab = node.dataset.tab; render(); });
    listen($('.retry'),'click', () => { error = ''; refresh(); });
    listen($('.export'),'click', () => {
      const blob = new Blob([JSON.stringify({ version:1, doc, records }, null, 2)], { type:'application/json' });
      const url = URL.createObjectURL(blob), link = document.createElement('a');
      link.href = url; link.download = 'substack-comments-' + doc.split('/').pop() + '.json'; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
    listen(document,'pointerup', event => {
      if (event.composedPath().includes(host)) return;
      capture();
      if (selected()) return;
      for (const [id, range] of ranges) {
        if ([...range.getClientRects()].some(r => event.clientX >= r.left && event.clientX <= r.right && event.clientY >= r.top && event.clientY <= r.bottom)) {
          active = id; tab = 'open'; open(); render();
          const card = [...ui.list.children].find(node => node.dataset.thread === id);
          if (card) ui.list.scrollTop = card.offsetTop - ui.list.offsetTop;
          break;
        }
      }
    });
    listen(document,'keyup', event => { if (!event.composedPath().includes(host)) capture(); });
    listen(document,'keydown', event => {
      if (event.key === 'Escape' && !ui.panel.hidden) { close(); ui.selection.hidden = true; }
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === 'm') {
        capture(); if (selected()) { event.preventDefault(); ui.selection.click(); }
      }
    });
    listen(window,'scroll', () => { layout(); ui.selection.hidden = true; }, {capture:true, passive:true});
    listen(window,'resize', layout);
    listen(window,'pagehide', flushAnchors);
    const storageChanged = (changes, area) => {
      if (area === 'local' && Object.entries(changes).some(([key, change]) => key.startsWith('comment:') && change.newValue?.doc === doc)) refresh();
    };
    chrome.storage.onChanged.addListener(storageChanged);
    const scan = setInterval(bindEditor, 1000);
    layout(); bindEditor(); refresh();
    return { doc, destroy() {
      flushAnchors(); disposed = true; abort.abort(); observer?.disconnect();
      clearInterval(scan); clearTimeout(changeTimer); clearTimeout(anchorTimer);
      chrome.storage.onChanged.removeListener(storageChanged);
      CSS.highlights?.delete(HIGHLIGHT); host.remove();
    } };
  }
  function route() {
    const doc = documentKey();
    if (session?.doc === doc) return;
    session?.destroy(); session = null;
    if (doc && document.body) session = start(doc);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', route, {once:true});
  else route();
  setInterval(route, 500);
})();
