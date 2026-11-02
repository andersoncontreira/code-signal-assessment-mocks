# Time Management and Reading Tips

## Time budget (90 min)

| Level | Target |
|---|---|
| Level 1 | ~10 min |
| Level 2 | ~15 min |
| Level 3 | ~30 min |
| Level 4 | ~30 min |
| Buffer | ~5 min |

If Level 1 takes more than 15 minutes, the rest of the test gets tight.

## Reading the statement

- Read the whole level before coding.
- Highlight keywords: *return*, *sorted*, *if it does not exist*, *inclusive/exclusive*, *non-empty*, *latest*, *at or before*.
- Most edge-case bugs come from these words.
- Check what each method returns in every branch (missing key, missing field, expired, empty).

## While coding

- Write the simplest version that passes, then refactor. Do not optimize in Levels 1–2.
- Run the statement examples by hand before every submit. Each bad submission costs time.
- Do not rewrite previous levels. If you must, the initial data structure was a poor choice.
- Store values as objects with metadata so timestamps, TTL and history can be added later.
- Partial credit counts: passing the visible tests is progress.
- Stuck on a bug for 10+ minutes: print the state and compare with the statement example.

## Last 5 minutes

- Check edge cases: empty input, single element, duplicates, overwrite, delete then set again, boundaries of time intervals.
- Make sure nothing is left with debug prints that break output.

## Test day checklist

- Webcam, microphone, ID document ready.
- Latest Chrome, Firefox or Edge on a laptop or desktop.
- Quiet room, clean desk, notifications off.
- Take it early in the day, not at the deadline.
