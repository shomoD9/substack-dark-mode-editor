# Contributing to Nightdraft

Nightdraft is deliberately small: plain JavaScript, HTML, and CSS, with no runtime dependencies or build step. Contributions should preserve that simplicity, keep permissions narrow, and protect draft privacy.

## Before proposing a change

- Search existing issues and open a focused issue for substantial changes.
- Explain the writer problem being solved and how the change behaves when Substack's editor structure changes.
- Avoid dependencies, remote code, analytics, and new permissions unless the benefit and privacy cost are justified.
- Never include real private drafts or comment exports in fixtures, screenshots, issues, or commits.

## Local verification

Run the automated tests:

```sh
node --test tests/*.test.cjs
```

Run the local fixture:

```sh
python3 tests/serve.py
```

Then visit `http://127.0.0.1:8765/publish/post/101` and `/popup-test`.

Changes that touch editor integration should also be tested in an authenticated Substack draft with an unpacked extension. State clearly which live checks you performed.

## Pull requests

Keep each pull request narrow. Include:

- The user-visible behaviour and reason for the change.
- Automated tests for new logic or regressions.
- Manual verification steps and results.
- Updated documentation, privacy disclosures, and `docs/DESIGN.md` when behaviour or architecture changes.
- A journal entry in `docs/_J-Agent-Nightdraft.md` for agent-assisted work.

By contributing, you agree that your contribution is licensed under the project's MIT License.
