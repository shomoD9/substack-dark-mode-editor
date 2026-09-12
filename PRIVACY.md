# Nightdraft Privacy Policy

Effective date: September 12, 2026

Nightdraft for Substack is an independent browser extension that provides a dark writing appearance and private margin notes inside the Substack draft editor.

## Data Nightdraft handles

Nightdraft reads the text of the open Substack draft in the browser so it can attach a note to the passage selected by the user. The full draft is processed temporarily in the page and is not saved as a separate copy.

Nightdraft stores the following information when the user creates or updates a margin note:

- The selected quotation and nearby text used to find it again after edits.
- The draft identifier and Substack hostname needed to keep notes separated by draft.
- Comment and reply text, timestamps, resolution state, and updated anchor positions.
- Pending-sync state used to recover from Chrome Sync failures.

The dark-mode preference is stored locally in Chrome.

## Storage and transmission

Comment records are first stored through `chrome.storage.local`. Nightdraft then asks `chrome.storage.sync` to make them available through the user's Chrome Sync account when that feature is enabled.

Nightdraft has no developer-operated server. It does not transmit draft text or comment records to the developer, advertisers, analytics providers, or other third parties. Chrome and Google may process synced extension data under the user's Chrome Sync settings and Google's own terms.

## Use and sharing

Nightdraft uses this data only to display, preserve, sync, and reattach the user's private margin notes. The developer does not sell, rent, share, or use it for advertising, profiling, credit decisions, or any unrelated purpose. No human is given access to the user's draft or note data by Nightdraft.

## Retention and user control

Nightdraft retains comment records in Chrome storage so notes survive reloads and can sync between the user's desktop Chrome devices. Resolved comments remain stored. Users can export a draft's records as JSON from the comment panel. Removing the extension removes its local extension data; handling of previously synced data is governed by Chrome Sync.

Nightdraft does not insert comment records into the Substack article or submit them when the article is published.

## Permissions

- **Substack page access:** loads Nightdraft on Substack pages so it can detect navigation into the draft editor. Its appearance and note features activate only on supported draft-editor routes.
- **Storage:** saves the appearance preference and private margin-note records, and uses Chrome Sync when available.

## Contact

Questions about this policy may be opened as a [GitHub issue](https://github.com/shomoD9/substack-dark-mode-editor/issues). Do not include private draft text in a public issue. Security reports should follow [SECURITY.md](SECURITY.md).

## Changes

Material changes to this policy will be recorded in the repository and included with the corresponding extension release.
