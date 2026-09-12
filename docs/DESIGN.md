# Nightdraft Design

## Product

Nightdraft for Substack is a Chrome extension for writers working in Substack's desktop draft editor. Its promise is: **Dark mode and private margin notes for Substack writers.**

The extension provides one focused editing layer with two related capabilities:

1. A subdued dark appearance for the draft workspace.
2. Private, text-anchored notes that stay outside the article.

Nightdraft is independent and is not affiliated with or endorsed by Substack.

## Product principles

- **Protect the draft:** never insert comment markup into the editable article.
- **Remain local-first:** write records locally before attempting Chrome Sync.
- **Fail honestly:** retain pending work and show errors instead of claiming success.
- **Request little access:** use only Substack page access and Chrome storage.
- **Survive page changes:** depend on editor routes and semantic editing surfaces where possible.
- **Stay small:** use browser-native JavaScript, HTML, and CSS without a runtime dependency or build service.

## Runtime architecture

### Appearance

`extension/content.js` recognizes supported editor routes, reads the local appearance preference, and toggles a document attribute. `extension/editor.css` applies the dark display treatment and restores media through counter-inversion. The script also checks for Substack's client-side navigation.

### Margin notes

`extension/comments.js` discovers the main editable body, renders a closed-shadow-root interface, maps selected DOM text to offsets, paints highlights, and coordinates comment actions. It does not modify the saved article content.

`extension/anchors.js` creates, moves, and relocates text anchors. Quotes include nearby context so the extension can reattach them after edits. Ambiguous or deleted text fails closed and remains available for manual reattachment.

### Storage and sync

`extension/background.js` serializes storage work. Each thread, reply, resolution update, and moved anchor has an independent key to reduce overwrites across devices. Writes enter `chrome.storage.local` first with a pending marker, then move through `chrome.storage.sync`. Failed sync leaves the local copy intact for retry.

### Popup

`extension/popup.html`, `popup.css`, and `popup.js` identify Nightdraft, explain the note workflow, and expose the local dark-appearance switch.

## Data boundaries

Nightdraft reads the open draft body in memory to calculate and update anchors. It stores only note records, selected quotation/context, draft identification, state, and timestamps. There is no Nightdraft server, analytics pipeline, advertisement system, or external API call.

Chrome Sync is an optional browser service controlled by the user's Chrome account and settings. The public disclosure is maintained in `PRIVACY.md`.

## Supported environment

- Desktop Chrome 105 or later.
- Draft editor routes under `https://*.substack.com/publish/post/<id>`.
- Dark appearance also supports `/publish/post/new`; margin notes require a numbered saved draft.

Mobile Chrome and custom publication domains are outside the current scope.

## Interaction model

Selecting draft-body text reveals **＋ Comment**. A writer can create a note, reply, resolve or reopen its thread, navigate to its attached text, and manually reattach a missing anchor. The comments launcher stays near the lower-right edge of the viewport. `Ctrl/Command + Shift + M` starts a note from the current selection.

The visual direction is editorial and restrained: charcoal surfaces, warm paper-like accents, serif identity copy, and compact controls. Nightdraft should feel adjacent to the writing surface rather than like a separate application.

## Verification

The Node test suite covers route scoping, preferences, Unicode anchors, insertions, internal edits, deletions, ambiguous quotations, independent replies, storage failures, sync recovery, and update conflicts.

The local browser fixture executes production scripts against a synthetic editor and Chrome API substitute. It supports manual testing of comments, replies, resolution, reattachment, persistence, failure states, and popup layout.

Authenticated Substack integration, an installed extension context, and real two-device Chrome Sync require manual verification before a public store release.

## Known constraints

- The appearance filter can change accents, background images, embedded content, and fixed-position behaviour.
- Notes attach only to the rich-text body, excluding title and subtitle inputs.
- Large rewrites, moved text, or repeated passages may require manual reattachment.
- Chrome Sync has total, item-size, and item-count quotas.
- JSON export currently has no matching import interface.
- Resolved records continue occupying storage.

## Release direction

The Chrome Web Store is the primary distribution surface. GitHub contains the source, privacy policy, support channel, community files, design record, and tagged releases. Store copy must accurately disclose both appearance and margin-note behaviour.

Substantive follow-up work is tracked in `docs/RELEASE-TODO.md`.
