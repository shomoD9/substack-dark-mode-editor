# Nightdraft Release TODO

This list separates substantive implementation and device-dependent verification from the lightweight release preparation already completed.

## Required before Chrome Web Store submission

- [ ] Set the GitHub repository description to `Dark mode and private margin notes for Substack writers.`
- [ ] Add repository topics: `substack`, `chrome-extension`, `dark-mode`, `writing-tools`, and `annotations`.
- [ ] Add a repository social-preview image after the store artwork is ready.
- [ ] Enable GitHub private vulnerability reporting if it is not already enabled.
- [ ] Test the unpacked extension in the current authenticated Substack editor.
- [ ] Confirm dark mode on new and saved drafts, dashboard-to-editor navigation, media, embeds, colour controls, preview, and printing.
- [ ] Create, reply to, resolve, reopen, move, orphan, and manually reattach notes in a real draft.
- [ ] Publish a disposable test article and confirm that no Nightdraft comment text or markup enters the published article.
- [ ] Verify Chrome Sync between two desktop Chrome devices using the same Google account.
- [ ] Run a small private beta with five to ten Substack writers.
- [ ] Capture current, real-product screenshots after those checks pass.
- [ ] Replace the “listing being prepared” message in `README.md` with the approved Chrome Web Store URL.

## Moderate implementation

- [ ] Add JSON import that validates the schema, draft identity, record sizes, and conflicts before writing.
- [ ] Add deletion for individual threads, resolved threads, one draft's records, and all Nightdraft data.
- [ ] Add a compact first-run explanation of selection, comments, privacy, and the keyboard shortcut.
- [ ] Register the comment shortcut through Chrome Commands so users can change it.
- [ ] Add a storage-usage view and early quota warning.
- [ ] Add `System`, `Dark`, and `Off` appearance choices.

## Accessibility and resilience

- [ ] Implement standard arrow-key behaviour and relationships for the Open/Resolved tab interface.
- [ ] Move focus into the comment panel when it opens and restore it predictably when it closes.
- [ ] Review small buttons, timestamps, focus states, and contrast against WCAG AA.
- [ ] Test narrow windows, browser zoom, long translated strings, and long unbroken content.
- [ ] Add browser-level accessibility and keyboard regression tests.

## Later opportunities

- [ ] Confirm and document Brave, Edge, and Arc compatibility.
- [ ] Evaluate a Firefox port after Chrome demand is established.
- [ ] Consider per-site media brightness controls only if user feedback shows a recurring need.
