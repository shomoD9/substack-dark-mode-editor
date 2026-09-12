# Chrome Web Store Listing Draft

This is working copy for the Chrome Web Store Developer Dashboard. Confirm every disclosure against the submitted package before sending it for review.

## Identity

**Name:** Nightdraft for Substack

**Summary:** Dark mode and private margin notes for Substack writers.

**Suggested category:** Workflow & Planning

**Language:** English

## Detailed description

Nightdraft gives the Substack draft editor a quieter dark writing environment and a private margin for editorial notes.

Select a passage to attach a note, add replies, resolve a thread, and return to it later. Nightdraft keeps these notes outside the article: it does not insert comment markup into the draft or publish comments to Substack.

Features:

- Dark appearance for Substack's desktop draft editor
- Private comments attached to selected draft text
- Replies, resolved threads, and manual reattachment
- Local-first saving with Chrome Sync support
- JSON export for per-draft backup
- No Nightdraft account, analytics, advertising, or external application server

Nightdraft reads the open draft body in the browser to locate selected passages. It stores comment records, selected quotation/context, and the draft identifier through Chrome storage. See the privacy policy for full details.

Current limitations:

- Desktop Chrome only
- Margin notes require a saved, numbered Substack draft
- Notes apply to the rich-text body, excluding separate title and subtitle inputs
- Large rewrites or repeated passages can require manual reattachment
- Dark appearance can change how colour accents and embedded content look; turn it off to review exact publication colours

Nightdraft is open source. It is an independent project and is not affiliated with or endorsed by Substack.

## Single-purpose statement

Nightdraft provides a focused personal editing layer for Substack drafts: a dark writing appearance and private margin notes that remain outside the published article.

## Permission justifications

### Storage

The `storage` permission saves the user's local dark-mode preference and private margin-note records. Comment records are retained locally first and use Chrome Sync when it is enabled so the same user's notes can be available on their desktop Chrome devices.

### Host access to Substack pages

Nightdraft loads on `https://*.substack.com/*` so it can recognize Substack's client-side navigation into and out of the draft editor. Its dark appearance and comment interface activate only on supported `/publish/post/...` editor routes. The extension reads the draft body in memory to create and update text anchors; it does not read authentication credentials or publish content.

### Remote code

No. Nightdraft includes all executable code in the extension package and does not load or execute remote code.

## Data-disclosure working answers

Disclose the following categories because Chrome requires disclosure even when data is processed locally:

- **Website content:** the open draft body is processed in memory; selected quotation and nearby context are stored for anchoring.
- **User-generated content:** comment and reply text is stored locally and may use Chrome Sync.
- **Web browsing activity:** a limited Substack hostname and numbered draft identifier are stored to keep records separated by draft.

Purposes: app functionality only. Data is not sold, used for advertising, used for credit decisions, or transferred to a developer-operated server. Certify compliance with Chrome Web Store Limited Use requirements after checking the final package.

**Privacy policy URL after this repository update is public:**

`https://github.com/shomoD9/substack-dark-mode-editor/blob/main/PRIVACY.md`

## Support URLs

- Homepage: `https://github.com/shomoD9/substack-dark-mode-editor`
- Support: `https://github.com/shomoD9/substack-dark-mode-editor/issues`

## Required images

- [ ] 128×128 store icon from the packaged extension
- [ ] 1280×800 dark-editor overview
- [ ] 1280×800 selected text with the **＋ Comment** action
- [ ] 1280×800 open comment thread with a reply
- [ ] 1280×800 resolved-thread view and reattachment state
- [ ] 1280×800 toolbar popup and privacy message
- [ ] 440×280 small promotional tile
- [ ] Optional 1400×560 marquee image

Use current product UI, full-bleed images, square corners, restrained annotations, and little text.

## Submission notes for reviewers

1. Sign in to Substack and open a saved draft at `/publish/post/<number>`.
2. Select text in the rich-text draft body and choose **＋ Comment**.
3. Enter synthetic comment text and submit it.
4. Open **Comments** at the lower right to reply, resolve, reopen, export, or reattach a missing passage.
5. Use the toolbar popup to turn the dark appearance off and on.

No separate Nightdraft account or test credential is required. The reviewer needs a Substack account with access to a draft editor.
