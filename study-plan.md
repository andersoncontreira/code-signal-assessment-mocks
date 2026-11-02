# Study Plan

Compressed schedule (60–90 min/day) up to the deadline of **2026-11-05, 23:29 (Brasília)**.

| Date | Focus |
|---|---|
| Mon 02/11 | **Mock 1** (In-Memory Database), timed 90 min. Send code + time per level for review. |
| Tue 03/11 | Review of Mock 1 and refactor weak spots. Shorter **Mock 2** (banking system: transfers, top-spenders ranking, scheduled payments, account merge), timed, up to Level 3 or 4. |
| Wed 04/11 | Nothing new. Re-read your mistakes, check webcam, microphone, ID document, browser and internet. Rest. |
| Thu 05/11 | **Take the test in the morning or afternoon**, not at the last hour. Deadline is 23:29. |

## If more time is available

- Mock 3: in-memory file system or task scheduler, focused on snapshot/restore and history.
- Final full 90-minute simulation with webcam on and no references.

## Patterns worth drilling

- Nested dicts / maps keyed by entity, then by field.
- Sorting with custom keys and tie-breakers.
- Prefix matching and filtering.
- Timestamp logic: intervals `[start, start + ttl)`, expiry, history per key.
- Snapshot and restore with recalculated expiry.
- Storing values as small objects with metadata (value, created, expires) instead of raw strings, so new levels are easy to add.
