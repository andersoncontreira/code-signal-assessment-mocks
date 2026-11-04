# Mock 3: Task Queue (3 levels, warm-up, ~60 min)

Implement a `TaskQueue` class. Do not use external libraries. Each level extends the previous one, so do not rewrite code from earlier levels.

> Every operation below is a **method of `TaskQueue`**, called on an instance (`queue.add_task(...)`). The examples are written without the `queue.` prefix only to keep them short. Each scenario starts with a **fresh instance**.
>
> Every method receives a `timestamp` as its first argument. Timestamps are integers and calls are guaranteed to have **non-decreasing** timestamps. Priorities are integers (higher = more urgent).

## Starter skeleton

```js
class TaskQueue {
  constructor() { /* ... */ }
  add_task(timestamp, taskId, priority) { /* ... */ }
  get_status(timestamp, taskId) { /* ... */ }
  cancel_task(timestamp, taskId) { /* ... */ }
}
```

## Level 1: Adding and cancelling tasks

Every task has a unique `task_id`, a `priority`, and a status. A new task starts as `"pending"`.

- `add_task(timestamp, task_id, priority) -> bool`: Adds a pending task. Returns `True` if added, `False` if a task with that id already exists.
- `get_status(timestamp, task_id) -> str | None`: Returns the task's status, or `None` if it does not exist.
- `cancel_task(timestamp, task_id) -> bool`: Removes a **pending** task. Returns `True` if the task existed and was pending, `False` otherwise (missing, running, done or failed). A cancelled task no longer exists, so its id can be added again.

```
add_task(1, "t1", 5)         -> True
add_task(2, "t2", 9)         -> True
add_task(3, "t1", 1)         -> False
get_status(4, "t2")          -> "pending"
get_status(5, "zz")          -> None
cancel_task(6, "t2")         -> True
cancel_task(7, "t2")         -> False
get_status(8, "t2")          -> None
add_task(9, "t2", 2)         -> True
```

## Level 2: Ordering and execution

Pending tasks are ordered by **priority descending**; ties are broken by `task_id` **ascending** (lexicographic).

- `next_tasks(timestamp, n) -> list[str]`: Returns up to `n` pending tasks in that order, formatted as `"<task_id>(<priority>)"`. If there are fewer than `n` pending tasks, return all of them.
- `start_next(timestamp) -> str | None`: Takes the first pending task in that order, changes its status to `"running"` and returns its id. Returns `None` if there are no pending tasks.
- `complete_task(timestamp, task_id) -> bool`: If the task is `"running"`, changes it to `"done"` and returns `True`. Returns `False` otherwise (missing, pending, already done, failed).

```
add_task(1, "b", 5)          -> True
add_task(2, "a", 5)          -> True
add_task(3, "c", 9)          -> True
add_task(4, "d", 1)          -> True
next_tasks(5, 3)             -> ["c(9)", "a(5)", "b(5)"]
next_tasks(6, 10)            -> ["c(9)", "a(5)", "b(5)", "d(1)"]
start_next(7)                -> "c"
get_status(8, "c")           -> "running"
next_tasks(9, 2)             -> ["a(5)", "b(5)"]
complete_task(10, "a")       -> False
complete_task(11, "c")       -> True
get_status(12, "c")          -> "done"
complete_task(13, "c")       -> False
start_next(14)               -> "a"
start_next(15)               -> "b"
start_next(16)               -> "d"
start_next(17)               -> None
```

## Level 3: Leases and retries

- `start_next_with_lease(timestamp, lease) -> str | None`: Same selection as `start_next`, but the task is `"running"` only during the interval `[timestamp, timestamp + lease)`. If it is not completed by `timestamp + lease`, its lease **expires** and the task goes back to `"pending"` (keeping its priority).
- A task whose lease has expired **3 times** becomes `"failed"` at the moment of the third expiry, and never returns to the queue.
- A task started with plain `start_next` has no lease and never expires.

Processing rules:

- Before executing **any** method (including the ones from earlier levels), the system first applies all lease expirations whose expiry time is `<=` the current `timestamp`.
- An expiry at exactly the call's timestamp is applied **before** that call. So `complete_task` called at the expiry time returns `False`, and `get_status` at that time already shows the new status.

```
add_task(1, "x", 5)                      -> True
add_task(2, "y", 3)                      -> True
start_next_with_lease(3, 10)             -> "x"        # running during [3, 13)
get_status(12, "x")                      -> "running"
get_status(13, "x")                      -> "pending"  # 1st expiry
start_next_with_lease(14, 5)             -> "x"        # x(5) before y(3); running [14, 19)
complete_task(19, "x")                   -> False      # 2nd expiry applied first
start_next_with_lease(20, 5)             -> "x"        # running [20, 25)
get_status(25, "x")                      -> "failed"   # 3rd expiry
start_next_with_lease(26, 5)             -> "y"
complete_task(27, "y")                   -> True
get_status(28, "x")                      -> "failed"
```

## Concepts to apply (from the previous reviews)

- One place that advances time, called at the **top of every public method** when time matters.
- Sorting with a comparator and a tie-breaker (`||`), and `slice(0, n)` after sorting.
- `Map` for storage, early returns (`null` / `false`), no `try`/`catch` for control flow.
- Intervals `[a, b)`: alive when `ts < start + lease`, with no `-1` adjustment.
- Design the stored shape of a task **before** Level 1 (it needs to carry status, priority, attempts, lease expiry by Level 3).

## Time budget (warm-up)

L1 ~8 min, L2 ~15 min, L3 ~25 min. Stop at 60 minutes, whatever the state, and rest before the real test.

## Submission notes (fill in after the attempt)

- Levels reached:
- Time spent per level:
- Where I got stuck:
- Edge cases I missed:
