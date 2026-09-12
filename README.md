# Nightdraft for Substack

**Dark mode and private margin notes for Substack writers.**

[![Tests](https://github.com/shomoD9/substack-dark-mode-editor/actions/workflows/tests.yml/badge.svg)](https://github.com/shomoD9/substack-dark-mode-editor/actions/workflows/tests.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-b98a60.svg)](LICENSE)

Nightdraft turns the Substack draft editor into a quieter writing space. It adds a dark appearance and lets you attach private notes to passages without inserting anything into the article.

There is no Nightdraft account, analytics service, build step, or application server. The extension is open source and runs in Chrome. Nightdraft is an independent project and is not affiliated with or endorsed by Substack.

## What it does

- Darkens the Substack draft editor and its controls.
- Attaches private comments to selected draft text.
- Keeps replies, resolved threads, and reattachment context in Chrome storage.
- Uses Chrome Sync when it is enabled, without sending drafts to a Nightdraft server.
- Leaves the article DOM and published post unchanged.

## Install or update

### Chrome Web Store

The public Chrome Web Store listing is being prepared. Once it is available, its installation link will appear here.

### Manual installation

1. Download this repository and unzip it, or clone it.
2. Open `chrome://extensions` in desktop Chrome and enable **Developer mode**.
3. Choose **Load unpacked** and select the repository's **extension** folder.
4. Refresh your Substack draft. Dark mode starts automatically.
5. Pin **Nightdraft for Substack** from Chrome's extensions menu for the on/off switch.

Keep the folder in place. For updates, replace its files, click the extension's **Reload** button, then refresh Substack. Version 1.1 introduces a stable manifest `key`; when upgrading from 1.0, Chrome may give this version a new extension ID. If the old version remains listed, remove that older entry. Its dark-mode preference may reset. Subsequent 1.1 installations share the same ID.

[Chrome's unpacked installation guide](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked).

## Comments

Select text in the draft body and click **＋ Comment**, or press **Ctrl+Shift+M** (also **⌘⇧M** on Mac). Write a comment and submit it. Use **Ctrl/⌘+Enter** to submit from a comment box.

- Selected text receives a highlight. Click it or open **Comments** near the bottom right to see its thread.
- Add replies, select **Resolve**, and find closed threads under **Resolved** to **Reopen** them.
- Comments work with dark mode on or off. There is no people tagging, sharing, or publishing to Substack.
- The extension tracks text offsets through edits and stores a quote with surrounding context for reattachment after reload. It does not insert comment markup into Substack's editable document.
- If the original text is deleted, absent, or ambiguous, the thread stays in the panel as **Text not found**. Select a new passage and choose **Attach to selected text** on that thread.
- Selections are limited to 800 characters; comments and replies to 1,500 characters. Very large edited anchors can also reach Chrome's per-record limit; the panel reports this instead of claiming success.
- **Export** downloads the current draft's comment records as JSON for backup. An import interface is not included.

Comments activate on saved, numbered `/publish/post/<id>` drafts on Substack domains. New drafts need a numeric URL before comments become available. Draft titles/subtitles implemented as separate inputs are not supported; annotations target the rich-text body.

The interaction follows [Notion's text comments, replies and resolution](https://www.notion.com/help/comments-mentions-and-reminders). This is a personal annotation layer, not a collaborative Notion editor or a Substack comment system. Large rewrites, cut-and-paste moves, concurrent draft edits, and ambiguous repeated passages can require manual reattachment.

## Sync between devices

Install this same extension on each **desktop Chrome** device, with the same Google account and Chrome Sync enabled for extension data. Signing into a website alone is insufficient. Keep the `key` in `manifest.json` unchanged: it gives unpacked installations the same extension ID even when their folders differ.

Chrome carries comment text, the selected quote/context, its publication/draft identifier, replies, and resolution state through `chrome.storage.sync`. There is no separate backend. Chrome queues data offline, and sync timing is controlled by Chrome; the extension cannot confirm receipt on a different device. Mobile Chrome does not run this extension.

[Chrome Sync storage](https://developer.chrome.com/docs/extensions/reference/api/storage) is limited to roughly **100 KB total**, **8 KB per item**, and **512 items** for an extension. This is suitable for modest personal annotation, not an unlimited comment archive. Resolved threads still occupy space.

Every write is first retained locally. If Chrome rejects syncing, the panel says **Saved locally · Sync pending**. **Retry sync** and opening the draft attempt pending writes again. A full quota needs to be addressed before those records can reach other devices; Export preserves a backup but does not free storage. Local storage failure is shown as an error and leaves the typed comment in place.

Replies use separate keys, avoiding whole-thread overwrites between devices. Resolution and anchor updates use separate latest-state keys; simultaneous edits to those same fields are not collaboratively merged. Local copies are removed if the extension is uninstalled. Export important notes first.

## Appearance and privacy

The popup copy is unchanged from version 1.0; spacing, switch alignment and the page-and-moon icon are refined.

Dark mode activates on `https://*.substack.com/publish/post/<number>` and `/publish/post/new`. The script loads on Substack pages to handle navigation into drafts, but the theme and comments stay scoped to editor routes. Custom publication domains are not included.

The display filter darkens the editor and its controls without depending on generated CSS class names. Images, videos, canvases and embedded frames receive the inverse filter. Text accents, highlights, CSS background images and color pickers may look different; switch the effect off to review exact publication colors. Embedded frames keep their own appearance and can remain light.

Printing is unaffected and the comment panel is hidden in print. A preview rendered inside the editor inherits dark mode until toggled off; separate preview URLs do not. CSS filters can affect fixed positioning in some site layouts.

Permissions are restricted to Substack pages and Chrome storage. There are no analytics or direct network requests. The extension reads the draft body's text in memory to anchor comments; only comment records and their selected text/context are stored and synced. Comments are not inserted into, or submitted with, the saved article. Dark-mode preference remains local to each device.

## Development and verification

```sh
node --test tests/*.test.cjs
python3 tests/serve.py
```

Visit `http://127.0.0.1:8765/publish/post/101` for the synthetic editor or `/popup-test` for the popup. The fixtures run production scripts with a local Chrome API substitute; fixture data stays in browser local storage and never reaches Google Sync. The fixture draft body itself resets on reload.

Automated checks cover route scoping, preferences, anchor movement, Unicode, repeated quotes, deleted text, concurrent replies, local failures, sync failure recovery and size limits. Browser checks cover creation, replies, editing an attached quote, resolving, reopening, reload persistence, missing-text retention, and popup layout.

**Still requiring live verification:** the current authenticated Substack editor, an actual installed extension context, and Google Sync between two desktop devices. The fixture is not evidence of those integrations.

To regenerate icons, run `python3 scripts/icons.py` with Pillow installed. The installed extension has no runtime dependencies.

## Contributing and support

Bug reports and focused improvements are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. Please use [GitHub Issues](https://github.com/shomoD9/substack-dark-mode-editor/issues) for reproducible bugs and feature proposals.

Do not include private draft text in a public issue. Report security concerns using the process in [SECURITY.md](SECURITY.md).

## Privacy and license

Nightdraft's data handling is described in [PRIVACY.md](PRIVACY.md). The project is available under the [MIT License](LICENSE).
